#!/usr/bin/env node
/**
 * Mobile-viewport snapshot pass for beta-launch hardening 1.6.
 *
 * Authenticates as a synth user via supabase-js (signInWithPassword), then
 * injects the resulting session into the puppeteer browser as the
 * `sb-<project-ref>-auth-token` cookie that @supabase/ssr expects. Then
 * navigates to the listed routes at 375x812 and saves PNGs.
 *
 * Usage:
 *   node scripts/synth/mobile-snap.mjs <before|after>
 *
 * Requires .env.local with NEXT_PUBLIC_SUPABASE_URL + ANON_KEY, and a running
 * dev server on http://localhost:3000.
 */
import { config } from 'dotenv';
import { resolve, join } from 'node:path';
import { mkdirSync } from 'node:fs';
import puppeteer from 'puppeteer';
import { createClient } from '@supabase/supabase-js';

config({ path: resolve(process.cwd(), '.env.local') });

const phase = process.argv[2] ?? 'before';
if (!['before', 'after'].includes(phase)) {
  console.error('Usage: node scripts/synth/mobile-snap.mjs <before|after>');
  process.exit(1);
}

const BASE = process.env.SNAP_BASE_URL ?? 'http://localhost:3000';
const OUT_DIR = resolve(
  process.cwd(),
  `scripts/synth/output/mobile-snapshots/${phase}`,
);
mkdirSync(OUT_DIR, { recursive: true });

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL;
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_ANON_KEY) {
  throw new Error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY in .env.local');
}

const projectRef = new URL(SUPABASE_URL).hostname.split('.')[0];
const cookieName = `sb-${projectRef}-auth-token`;

// ---------------------------------------------------------------------------
// 1. Sign in synth-a@findmejob.test via password to obtain a session.
// ---------------------------------------------------------------------------
const client = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: { autoRefreshToken: false, persistSession: false },
});

const { data: signInData, error: signInError } = await client.auth.signInWithPassword({
  email: 'synth-a@findmejob.test',
  password: 'synth-password-2026',
});
if (signInError || !signInData.session) {
  throw new Error(`signInWithPassword failed: ${signInError?.message ?? 'no session'}`);
}
const session = signInData.session;
console.log(`[mobile-snap] auth OK as ${session.user.email}`);

// ---------------------------------------------------------------------------
// 2. Build cookies. @supabase/ssr stores the session as a JSON-encoded array
//    in a base64 form, but a plain JSON string also works on read. To avoid
//    chunking edge cases we serialize as the base64 form prefixed with "base64-",
//    which matches @supabase/ssr's `parseCookieHeader` decoder.
// ---------------------------------------------------------------------------
const cookieValue =
  'base64-' + Buffer.from(JSON.stringify(session)).toString('base64');

// Some recent @supabase/ssr versions chunk the cookie if >3072 chars; for our
// session size it should fit in one. If not, chunk into .0, .1...
const MAX_LEN = 3180;
const cookies = [];
if (cookieValue.length <= MAX_LEN) {
  cookies.push({
    name: cookieName,
    value: cookieValue,
    domain: 'localhost',
    path: '/',
    httpOnly: false,
    secure: false,
    sameSite: 'Lax',
  });
} else {
  for (let i = 0, idx = 0; i < cookieValue.length; i += MAX_LEN, idx += 1) {
    cookies.push({
      name: `${cookieName}.${idx}`,
      value: cookieValue.slice(i, i + MAX_LEN),
      domain: 'localhost',
      path: '/',
      httpOnly: false,
      secure: false,
      sameSite: 'Lax',
    });
  }
}

// ---------------------------------------------------------------------------
// 3. Routes to capture. Authenticated routes assume sign-in worked.
// ---------------------------------------------------------------------------
const ROUTES = [
  { name: 'sign-in', path: '/sign-in', auth: false },
  { name: 'onboarding', path: '/onboarding', auth: true },
  { name: 'dashboard', path: '/dashboard', auth: true },
  { name: 'jobs', path: '/jobs', auth: true },
  { name: 'applications', path: '/applications', auth: true },
  { name: 'chat-empty', path: '/chat', auth: true },
  { name: 'analytics', path: '/analytics', auth: true },
  { name: 'settings-memory', path: '/settings/memory', auth: true },
];

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width: 375, height: 812, deviceScaleFactor: 2 });
await browser.setCookie(...cookies);

// Discover one application id + chat thread id for the parameterized routes.
let appId = null;
let threadId = null;
try {
  const res = await page.goto(`${BASE}/applications`, {
    waitUntil: 'networkidle2',
    timeout: 30_000,
  });
  if (res && res.ok()) {
    appId = await page.evaluate(() => {
      const a = document.querySelector('a[href^="/applications/"]');
      return a ? a.getAttribute('href').split('/').pop() : null;
    });
  }
} catch (err) {
  console.warn(`[mobile-snap] app id discovery failed: ${err.message}`);
}
try {
  await page.goto(`${BASE}/chat`, { waitUntil: 'networkidle2', timeout: 30_000 });
  threadId = await page.evaluate(() => {
    const a = document.querySelector('a[href^="/chat/"]');
    return a ? a.getAttribute('href').split('/').pop() : null;
  });
} catch (err) {
  console.warn(`[mobile-snap] thread id discovery failed: ${err.message}`);
}

if (appId) ROUTES.push({ name: 'application-detail', path: `/applications/${appId}`, auth: true });
if (threadId) ROUTES.push({ name: 'chat-thread', path: `/chat/${threadId}`, auth: true });

console.log(`[mobile-snap] ${ROUTES.length} routes; appId=${appId} threadId=${threadId}`);

for (const r of ROUTES) {
  const url = `${BASE}${r.path}`;
  const out = join(OUT_DIR, `${r.name}.png`);
  try {
    const resp = await page.goto(url, {
      waitUntil: 'networkidle2',
      timeout: 30_000,
    });
    // Mobile pages may have lazy content — small settle delay.
    await new Promise((r) => setTimeout(r, 400));
    await page.screenshot({ path: out, fullPage: true, type: 'png' });
    const status = resp ? resp.status() : '???';
    console.log(`[mobile-snap] ${r.name.padEnd(20)} ${status} ${out}`);
  } catch (err) {
    console.warn(`[mobile-snap] ${r.name} FAILED: ${err.message}`);
  }
}

await browser.close();
console.log(`[mobile-snap] done -> ${OUT_DIR}`);

#!/usr/bin/env node
// Headless screenshot of any URL via Playwright.
// Usage:
//   node scripts/snap.mjs <url> [out.png] [--width 1440] [--height 900] [--full]
//   pnpm snap <url> [...]
//
// Cookie-authenticated routes:
//   STORAGE_STATE=./scripts/auth-state.json node scripts/snap.mjs <protected-url>
//   (capture once with `pnpm exec playwright codegen <url> --save-storage scripts/auth-state.json`)
//
// The agent reads the resulting PNG via its Read tool to inspect the rendered UI.

import { chromium } from 'playwright';
import { existsSync } from 'node:fs';

const args = process.argv.slice(2);
const url = args[0];
const out = args[1] && !args[1].startsWith('--') ? args[1] : '/tmp/snap.png';
const width = Number(args.find((a) => a.startsWith('--width='))?.slice(8) ?? 1440);
const height = Number(args.find((a) => a.startsWith('--height='))?.slice(9) ?? 900);
const fullPage = args.includes('--full');

if (!url) {
  console.error('Usage: node scripts/snap.mjs <url> [out.png] [--width N] [--height N] [--full]');
  process.exit(1);
}

const storageStatePath = process.env.STORAGE_STATE;
const storageState =
  storageStatePath && existsSync(storageStatePath) ? storageStatePath : undefined;

const browser = await chromium.launch();
const context = await browser.newContext({
  viewport: { width, height },
  deviceScaleFactor: 2,
  storageState,
});
const page = await context.newPage();

await page.goto(url, { waitUntil: 'networkidle', timeout: 30_000 });
// Brief settle for animations / late paints.
await page.waitForTimeout(400);
await page.screenshot({ path: out, fullPage });

await browser.close();
console.log(`saved: ${out} (${width}x${height}${fullPage ? ', full page' : ''})`);

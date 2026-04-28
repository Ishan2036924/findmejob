#!/usr/bin/env node
// Headless screenshot of any URL via Puppeteer.
// Usage:
//   node scripts/snap.mjs <url> [out.png] [--width N] [--height N] [--full]
//
// Cookie-authenticated routes (capture cookies once, then reuse):
//   COOKIES=./scripts/cookies.json node scripts/snap.mjs <protected-url>
//   cookies.json format: an array of Cookie objects from page.cookies() or
//   exported via DevTools (Application → Cookies → Export).
//
// The agent runs this and reads the resulting PNG via its Read tool to
// inspect the rendered UI directly.

import puppeteer from 'puppeteer';
import { readFileSync, existsSync } from 'node:fs';

const args = process.argv.slice(2);
const url = args[0];
const out = args[1] && !args[1].startsWith('--') ? args[1] : '/tmp/snap.png';
const width = Number(args.find((a) => a.startsWith('--width='))?.slice(8) ?? 1440);
const height = Number(args.find((a) => a.startsWith('--height='))?.slice(9) ?? 900);
const fullPage = args.includes('--full');

if (!url) {
  console.error('Usage: node scripts/snap.mjs <url> [out.png] [--width=N] [--height=N] [--full]');
  process.exit(1);
}

const browser = await puppeteer.launch({ headless: true });
const page = await browser.newPage();
await page.setViewport({ width, height, deviceScaleFactor: 2 });

if (process.env.COOKIES && existsSync(process.env.COOKIES)) {
  const cookies = JSON.parse(readFileSync(process.env.COOKIES, 'utf8'));
  if (Array.isArray(cookies) && cookies.length > 0) {
    await browser.setCookie(...cookies);
  }
}

await page.goto(url, { waitUntil: 'networkidle2', timeout: 30_000 });

// Scroll top-to-bottom to trigger lazy images + viewport-based animations
// (motion's whileInView, IntersectionObserver-driven content), then return.
await page.evaluate(async () => {
  await new Promise((resolve) => {
    let y = 0;
    const step = 200;
    const max = document.body.scrollHeight;
    const id = setInterval(() => {
      window.scrollBy(0, step);
      y += step;
      if (y >= max) {
        clearInterval(id);
        window.scrollTo(0, 0);
        setTimeout(resolve, 200);
      }
    }, 30);
  });
});
await new Promise((r) => setTimeout(r, 600));

await page.screenshot({ path: out, fullPage, type: 'png' });

await browser.close();
console.log(`saved: ${out} (${width}x${height}${fullPage ? ', full page' : ''})`);

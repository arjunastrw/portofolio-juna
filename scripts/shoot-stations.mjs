#!/usr/bin/env node
/**
 * Manual QA helper: screenshots every station at several viewport sizes.
 * Not part of `npm run build`.
 *
 *   npm run build && npx vite preview --port 4317 &
 *   node scripts/shoot-stations.mjs [baseUrl] [outDir]
 *
 * Needs a Playwright Chromium (`npx playwright install chromium` once), or set
 * PLAYWRIGHT_CHANNEL=chrome to use the locally installed Google Chrome instead.
 */
import { mkdirSync } from 'node:fs';
import { join } from 'node:path';
import { chromium } from 'playwright';

const base = process.argv[2] ?? 'http://localhost:4317/';
const outDir = process.argv[3] ?? 'screenshots';
const sizes = [
  [1440, 900],
  [1280, 800],
  [1280, 600],
];
const stations = ['top', 'experience', 'projects', 'toolkit', 'contact'];

mkdirSync(outDir, { recursive: true });
const browser = await chromium.launch({
  channel: process.env.PLAYWRIGHT_CHANNEL || undefined,
  args: ['--enable-unsafe-swiftshader', '--use-angle=swiftshader'],
});

for (const [width, height] of sizes) {
  const page = await browser.newPage({ viewport: { width, height } });
  const problems = [];
  page.on('console', (m) => ['error', 'warning'].includes(m.type()) && problems.push(`${m.type()}: ${m.text()}`));
  page.on('pageerror', (e) => problems.push(`pageerror: ${e.message}`));

  await page.goto(base, { waitUntil: 'networkidle' });
  await page.waitForSelector('canvas', { timeout: 15000 }).catch(() => problems.push('no canvas (stacked layout?)'));
  await page.evaluate(() => document.fonts.ready);

  for (const [i, id] of stations.entries()) {
    await page.evaluate((domId) => {
      const el = document.getElementById(domId);
      const top = domId === 'top' ? 0 : Math.round(el.getBoundingClientRect().top + window.scrollY - 0.15 * window.innerHeight);
      window.scrollTo({ top, behavior: 'instant' });
    }, id);
    await page.waitForTimeout(1600);
    const file = join(outDir, `${width}x${height}_s${i}_${id}.png`);
    await page.screenshot({ path: file });
    const overflow = await page.evaluate(() => document.documentElement.scrollWidth - window.innerWidth);
    console.log(`${file}${overflow > 0 ? `  horizontal overflow ${overflow}px` : ''}`);
  }
  if (problems.length) console.log(`  console (${width}x${height}):\n    ${problems.join('\n    ')}`);
  await page.close();
}

await browser.close();

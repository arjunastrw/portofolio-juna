#!/usr/bin/env node
/**
 * Budget guard, run after `vite build`:
 * - initial JS (entry script + modulepreloads in dist/index.html), gzip  <= 90 KB
 * - 3D assets (everything under dist/models), raw bytes                  <= 2 MB
 * Lazily loaded chunks (three.js, gsap) are reported but not part of the initial budget.
 */
import { existsSync, readFileSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { gzipSync } from 'node:zlib';

const INITIAL_JS_GZIP_LIMIT = 90 * 1024;
const ASSET_LIMIT = 2 * 1024 * 1024;

const dist = join(process.cwd(), 'dist');
const html = readFileSync(join(dist, 'index.html'), 'utf8');

const refs = new Set();
for (const m of html.matchAll(/<script[^>]+type="module"[^>]+src="([^"]+)"/g)) refs.add(m[1]);
for (const m of html.matchAll(/<link[^>]+rel="modulepreload"[^>]+href="([^"]+)"/g)) refs.add(m[1]);

const kb = (n) => `${(n / 1024).toFixed(1)} KB`;
const gz = (file) => gzipSync(readFileSync(file), { level: 9 }).length;

let initial = 0;
const initialFiles = [];
for (const ref of refs) {
  const file = join(dist, ref.replace(/^\.?\//, ''));
  const size = gz(file);
  initial += size;
  initialFiles.push(`${ref} ${kb(size)}`);
}

const assetsDir = join(dist, 'assets');
const lazy = readdirSync(assetsDir)
  .filter((f) => f.endsWith('.js') && ![...refs].some((r) => r.endsWith(f)))
  .map((f) => `${f} ${kb(gz(join(assetsDir, f)))}`);

function dirSize(path) {
  if (!existsSync(path)) return 0;
  const stat = statSync(path);
  if (!stat.isDirectory()) return stat.size;
  return readdirSync(path).reduce((sum, entry) => sum + dirSize(join(path, entry)), 0);
}
const assets = dirSize(join(dist, 'models'));

console.log(`[check-budget] initial JS (gzip): ${kb(initial)} / ${kb(INITIAL_JS_GZIP_LIMIT)}`);
initialFiles.forEach((f) => console.log(`  ${f}`));
console.log('[check-budget] lazy chunks (gzip, not in initial budget):');
lazy.forEach((f) => console.log(`  ${f}`));
console.log(`[check-budget] 3D assets (dist/models): ${kb(assets)} / ${kb(ASSET_LIMIT)}`);

const failures = [];
if (initial > INITIAL_JS_GZIP_LIMIT) failures.push('initial JS over budget');
if (assets > ASSET_LIMIT) failures.push('3D assets over budget');
if (failures.length > 0) {
  console.error(`[check-budget] FAILED: ${failures.join(', ')}`);
  process.exit(1);
}
console.log('[check-budget] OK');

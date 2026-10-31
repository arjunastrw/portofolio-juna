#!/usr/bin/env node
/**
 * NDA guard: fails when a confidential term appears in site source or build output.
 *
 * The term list lives in `.nda-terms` (git-ignored, one term per line, `#` for comments),
 * because listing client names in this public repository would itself be a leak.
 * All-caps terms (acronyms) match case-sensitively as whole words; everything else
 * matches case-insensitively as whole words.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { extname, join, relative } from 'node:path';

const root = process.cwd();
const termsFile = join(root, '.nda-terms');
const targets = ['src', 'public', 'index.html', 'dist/index.html'];
const textExt = new Set(['.ts', '.tsx', '.js', '.css', '.html', '.json', '.webmanifest', '.md', '.txt', '']);

if (!existsSync(termsFile)) {
  console.warn('[check-nda] .nda-terms not found; skipping. Create it locally to enable the check.');
  process.exit(0);
}

const terms = readFileSync(termsFile, 'utf8')
  .split('\n')
  .map((line) => line.trim())
  .filter((line) => line && !line.startsWith('#'));

const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const patterns = terms.map((term) => ({
  term,
  re: new RegExp(`(?<![\\p{L}\\p{N}])${escape(term)}(?![\\p{L}\\p{N}])`, term === term.toUpperCase() ? 'gu' : 'giu'),
}));

function* files(path) {
  if (!existsSync(path)) return;
  const stat = statSync(path);
  if (stat.isDirectory()) {
    for (const entry of readdirSync(path)) yield* files(join(path, entry));
  } else if (textExt.has(extname(path))) {
    yield path;
  }
}

const hits = [];
for (const target of targets) {
  for (const file of files(join(root, target))) {
    const lines = readFileSync(file, 'utf8').split('\n');
    lines.forEach((line, i) => {
      for (const { term, re } of patterns) {
        re.lastIndex = 0;
        if (re.test(line)) hits.push(`${relative(root, file)}:${i + 1}  matches "${term}"`);
      }
    });
  }
}

if (hits.length > 0) {
  console.error(`[check-nda] ${hits.length} confidential term(s) found:\n  ${hits.join('\n  ')}`);
  process.exit(1);
}
console.log(`[check-nda] OK: ${patterns.length} terms checked, no matches.`);

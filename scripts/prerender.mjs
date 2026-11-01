#!/usr/bin/env node
/**
 * Post-build SEO step (run after `vite build` and `vite build --ssr`):
 * 1. renders the app to static HTML and puts it in dist/index.html (hydrated by src/main.tsx);
 * 2. preloads the two above-the-fold web fonts;
 * 3. writes dist/sitemap.xml, dist/robots.txt and dist/404.html;
 * 4. removes the temporary SSR bundle.
 */
import { existsSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const root = process.cwd();
const dist = join(root, 'dist');
const ssrDir = join(root, 'dist-ssr');
const ssrEntry = join(ssrDir, 'entry-server.js');

if (!existsSync(ssrEntry)) {
  console.error('[prerender] dist-ssr/entry-server.js is missing; run `vite build --ssr src/entry-server.tsx --outDir dist-ssr` first.');
  process.exit(1);
}

const { render, seo } = await import(pathToFileURL(ssrEntry).href);
const fail = (msg) => {
  console.error(`[prerender] ${msg}`);
  process.exit(1);
};

// 1. Body.
const indexPath = join(dist, 'index.html');
let html = readFileSync(indexPath, 'utf8');
if (!html.includes('<!--app-->')) fail('placeholder <!--app--> not found in dist/index.html');
if (html.includes('<!--seo-->') || html.includes('<!--boot-->')) fail('head placeholders were not filled (seo-head plugin)');
const appHtml = render();
if (!appHtml.includes('<h1')) fail('rendered HTML has no <h1>');
html = html.replace('<!--app-->', appHtml);

// 2. Font preloads (hashed file names).
const assets = readdirSync(join(dist, 'assets'));
const preloads = ['dotgothic16-latin-400-normal', 'arimo-latin-400-normal']
  .map((prefix) => assets.find((f) => f.startsWith(prefix) && f.endsWith('.woff2')))
  .filter(Boolean)
  .map((f) => `<link rel="preload" href="./assets/${f}" as="font" type="font/woff2" crossorigin />`);
if (preloads.length !== 2) fail('expected two woff2 fonts to preload');
html = html.replace('</head>', `  ${preloads.join('\n    ')}\n  </head>`);
writeFileSync(indexPath, html);

// 3. Crawl files.
const today = new Date().toISOString().slice(0, 10);
writeFileSync(
  join(dist, 'sitemap.xml'),
  `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url>
    <loc>${seo.url}</loc>
    <lastmod>${today}</lastmod>
  </url>
</urlset>
`,
);
writeFileSync(join(dist, 'robots.txt'), `User-agent: *\nAllow: /\n\nSitemap: ${seo.url}sitemap.xml\n`);
writeFileSync(
  join(dist, '404.html'),
  `<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Page not found</title>
    <meta name="robots" content="noindex" />
    <link rel="icon" href="/favicon.ico" sizes="any" />
    <style>
      body { margin: 0; min-height: 100vh; display: grid; place-items: center; background: #008080; font: 16px/1.5 Arial, sans-serif; }
      .w { width: min(420px, calc(100vw - 24px)); background: #c0c0c0; padding: 3px; box-shadow: inset -1px -1px #000, inset 1px 1px #dfdfdf, inset -2px -2px #808080, inset 2px 2px #fff; }
      .t { background: linear-gradient(90deg, #000080, #1084d0); color: #fff; font-weight: 700; padding: 3px 6px; }
      .b { padding: 16px 14px; }
      h1 { font-size: 18px; margin: 0 0 6px; }
      p { margin: 0 0 14px; }
      a { display: inline-block; padding: 6px 16px; color: #000; text-decoration: none; background: #c0c0c0; box-shadow: inset 0 0 0 1px #000, inset -2px -2px #000, inset 2px 2px #fff, inset -3px -3px #808080; }
    </style>
  </head>
  <body>
    <div class="w" role="alertdialog" aria-labelledby="h">
      <div class="t">Error</div>
      <div class="b">
        <h1 id="h">This page could not be found.</h1>
        <p>The file may have been moved or deleted.</p>
        <a href="${seo.url}">OK</a>
      </div>
    </div>
  </body>
</html>
`,
);

// 4. Clean up.
rmSync(ssrDir, { recursive: true, force: true });

console.log(`[prerender] OK: ${Math.round(appHtml.length / 1024)} KB of HTML prerendered, ${preloads.length} fonts preloaded, sitemap.xml + robots.txt + 404.html written.`);

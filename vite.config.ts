import { defineConfig, type Plugin } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';
import { headTags } from './src/seo';
import { DESKTOP_QUERY } from './src/os/desktop';

/**
 * Fills the placeholders in index.html:
 * - `<!--seo-->`: title, description, canonical, Open Graph, Twitter and JSON-LD (src/seo.ts);
 * - `<!--boot-->`: picks desktop/stack before first paint, mirroring useDesktopMode().
 * The body is prerendered separately by scripts/prerender.mjs.
 */
function seoHead(): Plugin {
  const buildDate = new Date().toISOString().slice(0, 10);
  const boot = `<script>(function(){try{var m=new URLSearchParams(location.search).get('mode');if(m!=='desktop'&&m!=='stack')m=matchMedia(${JSON.stringify(DESKTOP_QUERY)}).matches?'desktop':'stack';document.documentElement.dataset.mode=m}catch(e){}})()</script>`;
  return {
    name: 'seo-head',
    transformIndexHtml(html) {
      return html.replace('<!--seo-->', headTags(buildDate)).replace('<!--boot-->', boot);
    },
  };
}

export default defineConfig({
  plugins: [react(), tailwindcss(), seoHead()],
  base: './',
});

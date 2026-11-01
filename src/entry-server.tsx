/**
 * Build-time entry: renders the page to static HTML (the stacked layout, every window open)
 * so crawlers, link previews and no-JS visitors get the full content without running JS.
 * The browser then hydrates it (src/main.tsx). Used only by scripts/prerender.mjs.
 */
import { StrictMode } from 'react';
import { renderToString } from 'react-dom/server';
import App from './App';

export { headTags, seo } from './seo';

export function render(): string {
  return renderToString(
    <StrictMode>
      <App />
    </StrictMode>,
  );
}

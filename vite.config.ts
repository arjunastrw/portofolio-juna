import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  base: './',
  build: {
    // three.js + R3F + gsap live in a lazily loaded chunk (~820 kB raw); the initial bundle stays small.
    // No manualChunks: forcing a named vendor chunk pulled React into it and made it a
    // modulepreload of the entry (caught by scripts/check-budget.mjs).
    chunkSizeWarningLimit: 900,
  },
});

import { defineConfig } from 'vite';

export default defineConfig({
  base: './',
  build: { assetsInlineLimit: 1500000, cssCodeSplit: false },
});

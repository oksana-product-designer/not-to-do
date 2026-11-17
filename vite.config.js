import { defineConfig } from 'vite';

// GitHub Pages serves this site from a subfolder: https://oksana-product-designer.github.io/not-to-do/
// Every built URL must start with that folder name, so base is set to it.
export default defineConfig({
  base: '/not-to-do/',
  build: { target: 'esnext' },
});

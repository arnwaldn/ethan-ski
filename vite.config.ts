import { defineConfig } from 'vite';

export default defineConfig({
  base: '/ethan-ski/',
  build: {
    outDir: 'dist',
    assetsDir: 'assets',
    sourcemap: false,
    minify: 'esbuild',
  },
  server: {
    host: true,
  },
});

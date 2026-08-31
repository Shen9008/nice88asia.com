import { resolve } from 'node:path';
import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  base: '/js/react/',
  plugins: [react()],
  build: {
    outDir: 'js/react',
    emptyOutDir: true,
    cssCodeSplit: false,
    rollupOptions: {
      input: {
        aurora: resolve(__dirname, 'src/aurora-mount.jsx'),
      },
      output: {
        entryFileNames: '[name].js',
        assetFileNames: 'assets/[name][extname]',
      },
    },
  },
});

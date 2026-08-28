import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import {defineConfig} from 'vite';

export default defineConfig(() => {
  return {
    plugins: [react(), tailwindcss()],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, '.'),
      },
    },
    server: {
      allowedHosts: [
        'cinejoy.to',
        '.cinejoy.to',
        'cinejoy.online',
        '.cinejoy.online',
        'flixhq.to',
        '.flixhq.to',
        'flixhq.ink',
        '.flixhq.ink',
        'popcornmovies.online',
        '.popcornmovies.online',
        'bingebox.work',
        '.bingebox.work',
        'localhost',
        '127.0.0.1',
      ],
      // HMR is disabled in AI Studio via DISABLE_HMR env var.
      hmr: process.env.DISABLE_HMR !== 'true',
      // Disable file watching when DISABLE_HMR is true to save CPU during agent edits.
      watch: process.env.DISABLE_HMR === 'true' ? null : {},
    },
  };
});

import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

export default defineConfig({
  integrations: [svelte()],
  vite: {
    resolve: {
      alias: {
        '$data': '/public/game-data/data',
        '$art':  '/public/game-data/art',
      }
    }
  }
});

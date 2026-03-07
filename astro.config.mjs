import { defineConfig } from 'astro/config';
import svelte from '@astrojs/svelte';

export default defineConfig({
    devToolbar: {
       enabled: false
    },
    integrations: [svelte()],
});

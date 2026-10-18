// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Canonical + absolute Open Graph URLs. Update if a custom domain is added.
  site: 'https://punguin.github.io',
  build: {
    inlineStylesheets: 'always',
  },
});

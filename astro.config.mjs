// @ts-check
import { defineConfig } from 'astro/config';

export default defineConfig({
  // Canonical + absolute Open Graph URLs. The custom domain is also set in public/CNAME for GitHub Pages.
  site: 'https://pungbrooksdesign.com',
  build: {
    inlineStylesheets: 'always',
  },
});

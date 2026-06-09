import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://y-a-s.net',
  trailingSlash: 'always',
  integrations: [mdx()],
  output: 'static',
});

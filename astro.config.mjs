import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';

export default defineConfig({
  site: 'https://y-a-s.net',
  trailingSlash: 'always',
  // English keeps the bare paths it has always had; Slovak is served from a
  // /sk/ prefix, so adding it breaks no existing URL.
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'sk'],
    routing: { prefixDefaultLocale: false },
  },
  integrations: [mdx()],
  output: 'static',
});

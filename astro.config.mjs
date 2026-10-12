import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { renameSync, rmdirSync } from 'node:fs';

// Cloudflare Pages serves the nearest `404.html` up the tree for a missing
// path, but Astro only builds the root 404 under that name — the Slovak one
// lands in `sk/404/index.html`. Moving it gives `/sk/*` misses a Slovak page.
const slovak404 = {
  name: 'slovak-404',
  hooks: {
    'astro:build:done': ({ dir }) => {
      renameSync(new URL('sk/404/index.html', dir), new URL('sk/404.html', dir));
      rmdirSync(new URL('sk/404/', dir));
    },
  },
};

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
  integrations: [mdx(), sitemap({ filter: (page) => !page.endsWith('/404/') }), slovak404],
  output: 'static',
});

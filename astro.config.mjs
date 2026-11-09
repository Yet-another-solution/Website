import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { existsSync, readFileSync, renameSync, rmdirSync } from 'node:fs';
import { gitLastModified } from './src/utils/gitDate.mjs';

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

// Sitemap entries get the same hreflang alternates the page itself declares
// (read back from the built HTML, so pages whose Slovak slug differs pair up
// correctly), and a lastmod: a content entry's `lastmod` frontmatter, else the
// last commit touching its source; static pages use their component's last
// commit. No date at all beats the build time, so on a shallow clone or for a
// page with no known source, lastmod is left out.
const distDir = new URL('./dist/', import.meta.url);
const STATIC_SOURCES = {
  '': 'src/components/pages/Home.astro',
  'blog/': 'src/components/pages/BlogIndex.astro',
  'projects/': 'src/components/pages/ProjectsIndex.astro',
  'contact/': 'src/components/pages/Contact.astro',
  'privacy/': 'src/components/pages/Privacy.astro',
};

function sitemapLastmod(pathname) {
  const path = pathname.replace(/^\/(sk\/)?/, '');
  const locale = pathname.startsWith('/sk/') ? 'sk/' : '';
  const entry = path.match(/^(blog|projects)\/([^/]+)\/$/);
  if (entry) {
    const file = `src/content/${entry[1]}/${locale}${entry[2]}.mdx`;
    if (!existsSync(file)) return undefined;
    const frontmatter = readFileSync(file, 'utf8').match(/^lastmod:\s*["']?([\d-]+)/m);
    return frontmatter ? new Date(frontmatter[1]) : gitLastModified(file);
  }
  return STATIC_SOURCES[path] ? gitLastModified(STATIC_SOURCES[path]) : undefined;
}

function sitemapAlternates(pathname) {
  const file = new URL(`.${pathname}index.html`, distDir);
  if (!existsSync(file)) return [];
  const html = readFileSync(file, 'utf8');
  return [...html.matchAll(/<link rel="alternate" hreflang="([^"]+)" href="([^"]+)"/g)]
    .filter(([, lang]) => lang !== 'x-default')
    .map(([, lang, url]) => ({ lang, url }));
}

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
  integrations: [
    mdx(),
    sitemap({
      filter: (page) => !page.endsWith('/404/'),
      serialize(item) {
        const { pathname } = new URL(item.url);
        const links = sitemapAlternates(pathname);
        const lastmod = sitemapLastmod(pathname);
        return { ...item, ...(links.length > 1 ? { links } : {}), ...(lastmod ? { lastmod } : {}) };
      },
    }),
    slovak404,
  ],
  output: 'static',
});

import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import sitemap from '@astrojs/sitemap';
import { existsSync, readdirSync, readFileSync, renameSync, rmdirSync } from 'node:fs';
import { join, sep } from 'node:path';
import { fileURLToPath } from 'node:url';
import { gitLastModified, latestGitDate } from './src/utils/gitDate.mjs';

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
// last commit touching its file; a static page uses the last commit touching
// its component, the UI strings or the layout. No date at all beats the build
// time, so on a shallow clone or for a page with no known source, lastmod is
// left out.
const root = new URL('./', import.meta.url);
const fromRoot = (path) => fileURLToPath(new URL(path, root));
const SHARED_SOURCES = ['src/i18n/ui.ts', 'src/layouts/BaseLayout.astro'];
const STATIC_SOURCES = {
  '': 'src/components/pages/Home.astro',
  'blog/': 'src/components/pages/BlogIndex.astro',
  'projects/': 'src/components/pages/ProjectsIndex.astro',
  'contact/': 'src/components/pages/Contact.astro',
  'privacy/': 'src/components/pages/Privacy.astro',
};

// URL path ('blog/<slug>/', 'sk/projects/<slug>/') -> the entry's file and its
// frontmatter lastmod, for every .md/.mdx file in the two collections. The slug
// follows Astro's rule: a `slug` frontmatter field, else the file path without
// the extension (the `sk/` folder becomes the URL prefix).
// ponytail: Astro also slugifies odd characters in file names; ours have none.
function contentEntries() {
  const entries = new Map();
  for (const collection of ['blog', 'projects']) {
    const dir = fromRoot(`src/content/${collection}/`);
    for (const file of readdirSync(dir, { recursive: true })) {
      if (!/\.mdx?$/.test(file)) continue;
      const path = join(dir, file);
      const source = readFileSync(path, 'utf8');
      const [, slugField] = source.match(/^slug:\s*["']?([^"'\n]+)/m) ?? [];
      const [, lastmod] = source.match(/^lastmod:\s*["']?([\d-]+)/m) ?? [];
      const id = file.replace(/\.mdx?$/, '').split(sep).join('/').toLowerCase();
      const locale = id.startsWith('sk/') ? 'sk/' : '';
      const slug = slugField ?? id.slice(locale.length);
      entries.set(`${locale}${collection}/${slug}/`, { path, lastmod });
    }
  }
  return entries;
}

let entries;
function sitemapLastmod(pathname) {
  entries ??= contentEntries();
  const key = pathname.slice(1);
  const entry = entries.get(key);
  if (entry) return entry.lastmod ? new Date(entry.lastmod) : gitLastModified(entry.path);
  const component = STATIC_SOURCES[key.replace(/^sk\//, '')];
  return component ? latestGitDate([component, ...SHARED_SOURCES].map(fromRoot)) : undefined;
}

// The build output directory, as Astro resolved it (captured below).
let outDir;
const captureOutDir = {
  name: 'capture-out-dir',
  hooks: { 'astro:config:done': ({ config }) => { outDir = config.outDir; } },
};

function sitemapAlternates(pathname) {
  const file = new URL(`.${pathname}index.html`, outDir);
  if (!existsSync(file)) return [];
  const html = readFileSync(file, 'utf8');
  return [...html.matchAll(/<link\b[^>]*>/g)]
    .map(([tag]) => Object.fromEntries([...tag.matchAll(/([\w-]+)="([^"]*)"/g)].map(([, k, v]) => [k, v])))
    .filter((attrs) => attrs.rel === 'alternate' && attrs.hreflang && attrs.hreflang !== 'x-default' && attrs.href)
    .map((attrs) => ({ lang: attrs.hreflang, url: attrs.href }));
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
    captureOutDir,
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

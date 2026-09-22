# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

The Y-A-S (Yet Another Solution) website — a static marketing and blog site for
a small development team, showcasing projects built with C#, Blazor and
PostgreSQL. It is an **Astro** site with its own hand-written CSS (no theme
package), served in English and Slovak.

## Development Commands

- `npm install` — install dependencies (`npm ci` in CI)
- `npm run dev` — dev server with hot reload, on http://localhost:4321
- `npm run build` — production build into `dist/`
- `npm run preview` — serve the built `dist/` locally

There is no test suite and no linter configured, so `npm run build` is the only
gate. Note what it does and does not catch: it fails on a frontmatter entry that
violates its collection schema, on an unresolved import and on a template that
will not parse — but it strips types rather than checking them, so a genuine
type error builds cleanly. Verify behaviour by building and looking at the
output in `dist/`, not by assuming a green build means correct.

`astro check` is not a dependency. Run it ad hoc when types matter:

```
npm i --no-save @astrojs/check typescript && npx astro check
```

It reports six pre-existing errors, all from `three` shipping no type
declarations — that is the known baseline, not a regression.

## Deployment

Cloudflare Pages builds and deploys from `main` on its own; there is no deploy
step in this repository. `.github/workflows/static.yml` only runs `npm ci &&
npm run build` on pushes to `main` and on every pull request, so a broken build
is caught before Cloudflare sees it.

The site is served at `https://y-a-s.net` (`site` in `astro.config.mjs`), with
`trailingSlash: 'always'`.

## Architecture

### Directory structure
- `src/pages/` — routes. English routes sit at the root; their Slovak twins live
  under `src/pages/sk/`. Both are thin wrappers around `src/components/pages/`.
- `src/components/pages/` — one component per page, holding the actual markup.
- `src/components/` — shared components (`ProjectCard`, `SectionScene`,
  `LanguageSwitcher`).
- `src/layouts/BaseLayout.astro` — the single layout: `<head>`, SEO and social
  tags, navbar, footer.
- `src/content/` — the `blog` and `projects` content collections, with their
  Zod schemas in `src/content/config.ts`.
- `src/i18n/` — the translation catalogue and locale helpers (see below).
- `src/scripts/` — the Three.js code: `sceneKit.ts` (renderer, camera and
  visibility-gated render loop), `shapes.ts` (geometry helpers), and
  `sectionScenes.ts` (the homepage diagrams).
- `src/styles/global.css` — all site CSS, imported once by `BaseLayout`.
- `src/utils/slugify.ts` — tag and series URL segments.
- `public/` — static assets copied verbatim (images live in `public/img/`).
- `dist/` — build output, git-ignored.

### Styling
Bootstrap 5.3.2 (CSS and JS bundle) is loaded from jsDelivr, and the fonts
— JetBrains Mono, Rubik Mono One and Nunito — from Google Fonts. Everything else
is in `src/styles/global.css`, which defines the brand palette as custom
properties on `:root` (`--main-dark-color`, `--primary-color`, …). JetBrains
Mono is the default face site-wide; `.rubik` is the display face used for the
wordmark and panel titles.

Because both Bootstrap and the fonts come from a CDN, a sandboxed or offline
environment renders the site unstyled. That is an environment artefact, not a
bug — vendor them locally if you need an accurate screenshot.

### Homepage WebGL
The homepage hero animates the five squares of the brand mark out of a single
stack (inline script in `src/components/pages/Home.astro`), then pins them to
the viewport and shrinks each one as its colour-matched section scrolls past.
**The five `.reveal-section` bands below the hero are paired with the squares by
document order**, so reordering or adding a band changes which square points
where. Each band's `.intro-label` is also what the hero tooltip reads.

`SectionScene.astro` renders the smaller per-section diagrams; they sit in the
same `.reveal-section` whose scroll position drives their reveal.

Both respect `prefers-reduced-motion` and fall back to static content if WebGL
throws.

### SEO
`BaseLayout` emits description, canonical, Open Graph, Twitter Card and
`hreflang` tags. There is **no** sitemap, `robots.txt` or JSON-LD structured
data — add `@astrojs/sitemap` if a sitemap is wanted.

## Internationalisation (English + Slovak)

The site ships in English and Slovak. English is the default locale and keeps
the unprefixed URLs it has always had (`/blog/`, `/projects/cod3rs/`); Slovak is
served from a `/sk/` prefix. Adding a language therefore breaks no existing link.

### Where things live
- `src/i18n/ui.ts` — the UI string catalogue for both languages, plus
  `useTranslations`, `formatDate` and `pluralPosts` (Slovak has three plural
  forms). A key missing from a locale falls back to English rather than
  rendering the raw key.
- `src/i18n/routing.ts` — `localizePath`, `switchLangPath`, `getLangFromUrl`.
- `src/i18n/content.ts` — locale-aware access to the content collections.
- `src/i18n/taxonomy.ts` — maps tag and series names between languages, so
  `/tags/tutorial/` and `/sk/tags/navod/` can link to each other.
- `src/components/LanguageSwitcher.astro` — the EN/SK switch.
- `src/components/pages/` — one component per page, rendered by both the English
  route and its Slovak twin. The routes under `src/pages/` and `src/pages/sk/`
  are thin wrappers that pass `lang` and (for content pages) the alternate URLs.

### Adding a translated page or post
1. Write the English entry in `src/content/<collection>/` as usual.
2. Write the Slovak entry in `src/content/<collection>/sk/`. The `sk/` folder is
   what marks an entry's language; `entrySlug()` strips it back off so the URL is
   `/sk/blog/<slug>/`, not `/sk/blog/sk/<slug>/`.
3. Give both entries the same `translationKey` in their frontmatter. That is what
   links them for the language switcher and the `hreflang` tags — the slugs
   themselves may differ (and for Slovak posts, usually should).
4. If the Slovak entry introduces a new tag or series name, add the term to
   `TERMS` in `src/i18n/taxonomy.ts` so its taxonomy page cross-links correctly.

### Adding a UI string
Add the key to **both** `en` and `sk` in `src/i18n/ui.ts`. The catalogue is typed
with `satisfies Record<Lang, ...>`, so a key missing from one language is a
compile-time error. Never inline a user-visible English string into a component.

Text drawn into the WebGL diagrams (`src/scripts/sectionScenes.ts`) cannot be
translated by the markup — it is baked into canvas textures. `SectionScene.astro`
passes those labels through a `data-scene-labels` attribute instead.

## Content Management

Both collections are typed in `src/content/config.ts`; adding a frontmatter
field means editing the Zod schema there first, or the build will reject it.

### Adding a project
Create `src/content/projects/<name>.mdx` with `title`, `date`, and optionally
`description`, `image`, `tech` (a comma-separated string), `github`, `webUrl`,
`draft`, `translationKey`. It appears on `/projects/` automatically, and on the
homepage's Selected Work band if it is one of the three most recent.

### Adding a blog post
Create `src/content/blog/<slug>.mdx` with `title`, `date`, and optionally
`author`, `description`, `keywords`, `tags`, `series`, `seriesOrder`,
`categories`, `images`, `lastmod`, `toc`, `draft`, `translationKey`. Tag and
series pages under `/tags/` and `/series/` are generated from the frontmatter —
there are no separate series index files to create.

`draft: true` excludes an entry from every listing and from routing.


# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

This is a Hugo-based static website for Y-A-S (Yet Another Solution), a team of developers. The site showcases projects using C#, Blazor, and PostgreSQL. It uses a custom theme called "yas-theme" and is automatically deployed to GitHub Pages.

## Development Commands

### Build and Serve
- `hugo serve` - Start local development server with live reload
- `hugo serve -D` - Include draft content in development server
- `hugo --minify` - Build production-ready static files (output to `public/`)

### Content Creation
- `hugo new content/projects/project-name.md` - Create new project content
- `hugo new content/blog/post-title.md` - Create new blog post with archetype
- `hugo new content/series/series-name/_index.md` - Create new blog series

### Deployment
The site automatically deploys to GitHub Pages via GitHub Actions on push to `main` branch. The workflow builds with `hugo --minify` and deploys the `public/` directory.

## Architecture

### Directory Structure
- `themes/yas-theme/` - Custom Hugo theme with Bootstrap 5 and responsive design
- `content/projects/` - Markdown files for individual projects
- `content/blog/` - Blog posts with support for tags, series, and categories
- `content/series/` - Blog series collections with automatic post listing
- `archetypes/` - Content templates (blog.md, series.md, projects.md)
- `layouts/` - Hugo template overrides (currently contains project-specific layouts)
- `static/` - Static assets (CSS, JS, images)
- `public/` - Generated static site (git-ignored, created by Hugo build)

### Theme Architecture
The custom "yas-theme" uses:
- Bootstrap 5.3.2 for responsive layout and components
- Nunito font from Google Fonts
- Custom CSS at `static/css/index.css`
- jQuery 3.7.1 and custom JavaScript at `static/js/index.js`
- GitHub card component for project displays

### Content Structure
- Homepage (`layouts/index.html`) - Main landing page with sections for team introduction and projects
- Projects use frontmatter with: `title`, `date`, `description`, `image`, `tech`, `github`, `webUrl`
- Blog posts use frontmatter with: `title`, `date`, `author`, `description`, `keywords`, `tags`, `series`, `categories`, `seriesOrder`
- Series use frontmatter with: `title`, `date`, `description`, `keywords`, `images` and automatic post listing
- Projects are displayed using a custom layout with GitHub integration
- SEO optimization with Open Graph, Twitter Cards, and JSON-LD structured data

### Configuration
- `config.toml` contains site settings, SEO parameters, and theme configuration
- Site deploys to `https://y-a-s.net`
- Sitemap generation enabled with weekly changefreq
- Menu structure: Blog (/blog/), Projects (/projects/), Contact (/contact/)
- Taxonomies configured: tags, series, categories for content organization

## Internationalisation (English + Slovak)

> Note: the rest of this file still describes an earlier Hugo version of the
> site. The repository is an **Astro** project (see `astro.config.mjs`,
> `src/pages/`), and this section describes the code as it actually is.

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

### Adding New Projects
1. Create new markdown file in `content/projects/`
2. Include required frontmatter: `title`, `date`, `description`, `image`, `tech`
3. Optional frontmatter: `github`, `webUrl` for project links
4. Projects automatically appear on the projects page and homepage

### Adding New Blog Posts
1. Use `hugo new content/blog/post-title.md` to create from archetype
2. Include required frontmatter: `title`, `date`, `author`, `description`, `keywords`, `tags`, `categories`
3. Optional frontmatter: `series`, `seriesOrder` for series organization, `images` for social sharing
4. Blog posts automatically appear on /blog/ with pagination and taxonomy pages

### Adding New Series
1. Use `hugo new content/series/series-name/_index.md` to create series index
2. Add blog posts to series using `series: ["Series Name"]` in frontmatter
3. Use `seriesOrder: 1` to control post order within series
4. Series automatically lists all posts in chronological/order sequence

### Template Customization
- Main layout: `themes/yas-theme/layouts/_default/baseof.html`
- Homepage: `themes/yas-theme/layouts/index.html`
- Project templates: `themes/yas-theme/layouts/projects/single.html` and `themes/yas-theme/layouts/_default/projects.html`
- Blog templates: `themes/yas-theme/layouts/blog/single.html` and `themes/yas-theme/layouts/blog/list.html`
- Taxonomy templates: `themes/yas-theme/layouts/taxonomy/` for tags, series, categories
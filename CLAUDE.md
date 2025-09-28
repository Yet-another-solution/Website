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
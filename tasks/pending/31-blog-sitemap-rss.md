# 31 — Blog Sitemap & RSS Feed

**Status:** 🕐 Pending

## Goal
Make every blog URL discoverable by search engines and RSS readers.

## Build
- Confirm `@astrojs/sitemap` is in `astro.config.mjs`; verify `/blog/*`, `/blog/category/*`, `/blog/tag/*` all appear in the generated `sitemap.xml`
- `src/pages/blog/rss.xml.ts` — Astro RSS endpoint using `@astrojs/rss`; includes `title`, `description`, `pubDate`, `link`, `content` (full rendered HTML) for each non-draft post sorted by date descending
- Add `<link rel="alternate" type="application/rss+xml" title="CineCards AI Blog" href="/blog/rss.xml">` to `BaseLayout.astro` `<head>`
- Validate RSS feed in an RSS validator (W3C Feed Validator or similar)

## Inputs
- Task 27 (Content Collections wired)

## Acceptance
- `sitemap.xml` includes all blog, category, and tag page URLs
- `/blog/rss.xml` returns valid RSS 2.0 XML
- RSS `<link>` tag appears in page `<head>` on all pages
- No draft posts appear in RSS feed

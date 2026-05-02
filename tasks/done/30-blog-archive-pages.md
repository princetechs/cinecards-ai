# 30 — Blog Category & Tag Archive Pages

**Status:** ✅ Done

## Goal
Generate filtered post-listing pages for each category and tag so search engines can index topic-specific URLs.

## Build
- `src/pages/blog/category/[category].astro` — filtered post list per category; uses `getStaticPaths` to emit one route per category value (shots, lighting, movement, editing, ai-prompting)
- `src/pages/blog/tag/[tag].astro` — filtered post list per tag; uses `getStaticPaths` to emit one route per unique tag across all posts
- Both pages reuse the same post card grid component from task 28
- Each category page has a unique hero headline and description written for SEO (e.g. "Lighting for AI Video — Articles & Guides")
- Category pages linked from footer nav under a "Blog" column
- Tag pages linked from post cards (tag badges are anchor tags)

## Inputs
- Task 28 (post card grid component exists)

## Acceptance
- `npm run build` generates a page for every category and every tag
- Each page has a unique `<title>` and `<meta description>`
- No 404s when clicking category/tag links from post cards or index

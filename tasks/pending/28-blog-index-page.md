# 28 — Blog Index Page (/blog)

**Status:** 🕐 Pending

## Goal
Build the `/blog` listing page where visitors can browse and filter all posts.

## Build
- `src/pages/blog/index.astro`
- Dark hero section (`#0F0F13` bg, Space Grotesk heading, `#E4572E` accent) — headline: "Cinematography & AI Video — The Blog"
- Category filter tabs: All | Shots | Lighting | Movement | Editing | AI Prompting
- Featured post hero card at top (full-width, large thumbnail, excerpt)
- Post card grid: 3-col desktop → 2-col tablet → 1-col mobile; each card shows thumbnail, category badge, title, excerpt, reading time, published date, author name
- Draft posts excluded (`draft !== true`)
- Pagination (static, numbered pages) if post count exceeds 12
- SEO: unique `<title>` + `<meta description>` + OG tags via `BaseLayout`

## Inputs
- Task 27 (Content Collections wired)

## Acceptance
- Page builds statically at `/blog`
- All non-draft posts appear
- Category tabs filter correctly (client-side JS or separate routes)
- Lighthouse SEO ≥ 95

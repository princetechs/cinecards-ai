# 16 — Term Detail Page + Related-Term Graph

**Status:** ✅ Done

## Goal
Each term gets its own SEO-friendly URL and a "learn next" graph.

## Build
- `src/pages/glossary/[slug].astro` — full card detail, preview block, prerequisites, related terms, common mistakes, prompt copy buttons
- Related-term and prerequisite links navigate within the graph
- Static-rendered (Astro `getStaticPaths`) for SEO

## Acceptance
- 124 detail pages build at `npm run build`
- Sitemap includes them

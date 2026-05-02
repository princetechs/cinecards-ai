# 32 — Blog Nav Link & Homepage Preview Section

**Status:** 🕐 Pending

## Goal
Surface the blog in the global nav and on the homepage to drive traffic from existing visitors.

## Build
- Add "Blog" to `src/site.config.ts` `navLinks` array and `src/i18n/messages/en.json` (+ es/hi equivalents)
- Audit nav width after addition — ensure no label wraps; add `white-space: nowrap` if needed
- New section in `src/pages/index.astro` between the planner section and the footer: "From the Blog"
  - Background: `#0F0F13` (dark, matching hero)
  - 3 latest featured posts as horizontal cards (`#1A1A22` card bg, `#E4572E` category badge, title, 1-line excerpt, "Read →" link)
  - Section heading: "Learn Cinematography — The Blog"
  - Fallback: if fewer than 3 featured posts exist, show 3 most recent posts instead

## Inputs
- Task 28 (blog index page built, post card pattern established)

## Acceptance
- "Blog" appears in desktop and mobile nav without wrapping
- Homepage "From the Blog" section shows 3 cards
- Cards link correctly to `/blog/[slug]`
- Section matches dark design system (no warm paper background)

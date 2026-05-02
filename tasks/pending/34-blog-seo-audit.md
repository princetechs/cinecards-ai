# 34 — Blog SEO & AI-Readiness Audit

**Status:** 🕐 Pending

## Goal
Verify every blog page meets SEO and AI-crawler standards before the blog is publicly promoted.

## Checklist

### Structured Data
- [ ] JSON-LD `Article` schema on every post: `headline`, `author`, `datePublished`, `dateModified`, `image`, `publisher`
- [ ] Validates with no errors in Google Rich Results Test

### Open Graph & Meta
- [ ] `og:type=article` on post pages
- [ ] `og:image` present (1200×630 per post, or site fallback)
- [ ] `article:published_time` and `article:modified_time` set from frontmatter
- [ ] `article:tag` set from `tags[]` frontmatter
- [ ] Meta description 150–160 characters on every post, index, category, and tag page
- [ ] Canonical URLs correct — no trailing-slash mismatches

### Content Quality
- [ ] All images have descriptive `alt` text
- [ ] No heading levels skipped (h1 → h2 → h3 only)
- [ ] Internal links: posts link to glossary terms, planner, and at least one other post
- [ ] No broken internal links (`npm run build` catches missing routes)

### Crawlability
- [ ] `robots.txt` allows `/blog/`, `/blog/category/`, `/blog/tag/`
- [ ] Sitemap includes all blog URLs (verify from task 31)
- [ ] All content readable without JavaScript (static/SSR)

### Performance
- [ ] Lighthouse SEO ≥ 95 on post page
- [ ] Lighthouse Performance ≥ 85 on post page (images optimised via `<Image>` component)

## Inputs
- Tasks 28–33 complete

## Acceptance
- All checklist items pass
- Zero errors in Google Rich Results Test for at least 2 posts

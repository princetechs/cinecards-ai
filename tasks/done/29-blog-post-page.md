# 29 — Dynamic Blog Post Page (/blog/[slug])

**Status:** ✅ Done

## Goal
Build the individual post reading page with full typography, sidebar TOC, and rich SEO metadata.

## Build
- `src/pages/blog/[slug].astro` with `getStaticPaths` from Content Collections
- Layout: reading column max-width 720px centered; sticky TOC sidebar on desktop (generated from h2/h3 headings)
- Full-width hero image at top with dark overlay and title
- Typography: large readable body, heading hierarchy, styled blockquotes, syntax-highlighted code blocks (`shiki` via Astro)
- Author card: avatar, name, short bio, link to author page
- Breadcrumb: Home → Blog → [Category] → [Title]
- "Related Glossary Terms" section — pulls `relatedTerms[]` from frontmatter, links to `/glossary/[slug]`
- "Related Posts" section — same category, max 3 cards
- Social share bar: share on X, copy link button
- Reading progress bar (thin `#E4572E` stripe at top of viewport)
- JSON-LD `Article` structured data (title, author, datePublished, dateModified, image, publisher)
- Full OG tags: `og:type=article`, `og:image`, `article:published_time`, `article:modified_time`, `article:tag`
- Canonical URL matching the post slug

## Inputs
- Task 27 (Content Collections wired)

## Acceptance
- All seed posts render correctly at their slugs
- TOC links scroll to correct headings
- JSON-LD validates in Google Rich Results Test
- Lighthouse SEO ≥ 95; Performance ≥ 85
- No JS required to read content (SSR/static)

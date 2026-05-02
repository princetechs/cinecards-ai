# 27 — Astro Content Collections Setup for Blog

**Status:** ✅ Done

## Goal
Wire up Astro Content Collections so blog posts in `src/content/blog/` are type-safe and queryable.

## Build
- `src/content/config.ts` — define `blog` collection with Zod schema matching task 25 frontmatter spec
- `astro.config.mjs` — add `@astrojs/mdx` integration if not present
- `src/content/authors/` — create at least one author JSON file
- `src/content/blog/` — add one real seed post (e.g. "Close-Up Shot: The Complete Guide for AI Video Prompts") as `.mdx` to make the collection non-empty
- Verify `getCollection('blog')` returns typed results; no TypeScript errors

## Inputs
- Task 25 (schema spec)
- Task 26 (file layout)

## Acceptance
- `npm run build` succeeds with the collection wired
- `getCollection('blog')` returns correct type with all frontmatter fields
- Draft posts are excluded when `draft: true`
- At least one seed post exists and renders

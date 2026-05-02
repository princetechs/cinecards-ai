# 26 — Blog File System Layout Plan

**Status:** ✅ Done

## Goal
Decide and document the repository directory structure for the git-based blog before implementation begins.

## Build
- Proposed layout:
  - `src/content/blog/<slug>.mdx` — one file per post
  - `src/content/authors/<slug>.json` — author profiles (name, bio, avatar)
  - `public/images/blog/<slug>/` — post-specific images (OG image, inline images)
  - `src/content/config.ts` — Astro Content Collections Zod schema
- Document slug convention: kebab-case, must match filename exactly
- Document draft handling: `draft: true` in frontmatter → excluded from prod build via filter in `getCollection`
- Confirm Astro Content Collections as the implementation approach (vs manual `import.meta.glob`)
- Update `tasks/README.md` mind map with blog branch

## Acceptance
- Layout documented in this file under a `## Structure` section
- No ambiguity on where new posts, images, and author bios live
- `tasks/README.md` mind map updated to include Blog system node

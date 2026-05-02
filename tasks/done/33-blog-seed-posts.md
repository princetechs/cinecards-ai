# 33 — Write 5 Seed Blog Posts for Launch

**Status:** ✅ Done

## Goal
Populate the blog with real, high-quality content that matches the site audience (creators using Runway, Pika, Stable Video) and is optimized for search and AI crawlers.

## Build
Five MDX posts in `src/content/blog/`:

1. `close-up-shot-ai-video-prompts.mdx` — "Close-Up Shot Mastery: From Hitchcock to AI Video Prompts" · category: shots · difficulty: beginner
2. `5-shot-sequence-every-creator.mdx` — "The 5-Shot Sequence Every Creator Should Know" · category: shots · difficulty: beginner
3. `lighting-for-ai-video-prompts.mdx` — "Lighting for AI Video: How to Describe Light in Prompts" · category: lighting · difficulty: intermediate
4. `camera-movement-cheatsheet.mdx` — "Camera Movement Cheatsheet: Dolly, Zoom, Handheld Explained" · category: movement · difficulty: beginner
5. `write-cinematic-ai-video-prompts.mdx` — "How to Write Cinematic AI Video Prompts That Actually Work" · category: ai-prompting · difficulty: intermediate

Each post must include:
- 800–1200 words with proper h2/h3 hierarchy for TOC
- At least 3 `relatedTerms[]` linking to existing glossary slugs
- One styled AI prompt example block
- Internal CTA at the end pointing to `/glossary` or `/planner`
- `ogImage` path referencing a placeholder in `public/images/blog/`
- `featured: true` on at least 2 posts for the homepage preview section

## Inputs
- Task 27 (Content Collections schema wired so posts are validated on build)

## Acceptance
- All 5 posts build without frontmatter validation errors
- Each post renders with correct TOC, related terms, and CTA
- `relatedTerms` slugs match real entries in `data/terms.json`

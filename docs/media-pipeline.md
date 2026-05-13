# aiscreens Media Pipeline

aiscreens is a static site, so the media pipeline must work without a backend. The rule is simple: Git stores the source of truth, optimized assets are referenced as normal public URLs, and larger media can move to Cloudflare R2 later without changing the UI.

## Current Strategy

1. Generate or design a term visual from the term's teaching goal.
2. Save a detail image as `public/images/terms/<term-id>-detail.jpg`.
3. Run `npm run media:prepare` to create/check the matching card image, attach hashes, and update `data/terms.json`.
4. For short motion previews, use HyperFrames or Remotion source, render `public/videos/terms/<term-id>-preview.mp4`, and run `npm run media:prepare`.
5. Run `npm run validate:content` and `npm run build`.

Cards load `*-card.jpg` at `640x360`. Detail pages load `*-detail.jpg` at `1200x675`. Videos are 5-8 second teaching previews on hover/focus for glossary cards and normal controls inside prompt preview blocks and detail pages.

## Preview Video UX

Preview videos should teach the term before the user copies the prompt. Each clip needs a visible subject, object, or camera frame so the viewer can understand what is being filmed. Avoid raw abstract motion unless the term itself is abstract.

Use this structure:

1. Title and one-line definition.
2. Visual demonstration with crop guides, focus marks, or action beats.
3. One practical lesson.
4. Three short steps that match the prompt language.

The planner preview section uses `PreviewCard`, so any term with `previewVideoUrl` appears as an inline playable clip. Terms without clips should show a calm planned state, never raw JSON like `previewVideoUrl: null`.

## Cloudflare R2 Plan

Use Git for small images while the library is small. Move videos and heavy future source assets to Cloudflare R2 once the media library grows.

Recommended shape:

- Bucket: `aiscreens-media`
- Public domain: `https://media.aiscreens.in`
- Object keys: `terms/<term-id>/card.jpg`, `terms/<term-id>/detail.jpg`, `terms/<term-id>/preview.mp4`
- Git source of truth: `data/terms.json` and `data/mediaPipeline.json`

When R2 is enabled, replace local URLs with public R2 URLs in `data/terms.json`. The site still has no backend because Astro renders those URLs at build time.

## Generation Tool Choices

- Use image generation for final visual source art when a term needs cinematic realism.
- Use generated diagrams when a concept is easier to understand as framing, crop, or composition.
- Use HyperFrames for polished explainers, social clips, animated title cards, captions, and reusable HTML video templates.
- Use Remotion when the preview needs React, data-driven props, 3D/Three.js, or reusable component logic.
- Use ffmpeg for compression, resizing, poster extraction, and lightweight motion previews.

## Quality Rules

- Card images should stay below `90KB`.
- Detail images should stay below `260KB`.
- Preview videos should stay below `600KB` until moved to R2.
- Every generated asset needs rights metadata and a hash in `data/terms.json`.
- Do not use real human likenesses unless the consent path is documented.
- Keep visuals beginner-friendly: one visual idea per term.

## Repeatable Commands

```bash
npm run media:check
npm run media:prepare
npm run media:render:term-previews
npm run validate:content
npm run build
```

Render a subset while iterating:

```bash
node scripts/render-term-previews-hyperframes.mjs close-up insert-shot
```

The manifest for batches and future Cloudflare mapping lives in `data/mediaPipeline.json`.

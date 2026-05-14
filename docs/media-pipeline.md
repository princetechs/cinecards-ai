# aiscreens Media Pipeline

aiscreens is a static site, so the media pipeline must work without a backend. The rule is simple: Git stores the source of truth, optimized assets are referenced as normal public URLs, and larger media can move to Cloudflare R2 later without changing the UI.

## Current Strategy

1. Generate or design a term visual from the term's teaching goal.
2. Save a detail image as `public/images/terms/<term-id>-detail.jpg`.
3. Run `npm run media:pipeline:apply` to create/check the matching card image, attach hashes, validate content, and build the site.
4. For short motion previews, use HyperFrames or Remotion source, render `public/videos/terms/<term-id>-preview.mp4`, then run `npm run media:pipeline:apply`.
5. Use `npm run media:pipeline:render -- <term-id>` when a preview video is missing and should be rendered through the current HyperFrames template.
6. Use `npm run media:pipeline:render -- --force-render` when the full glossary motion previews need to be regenerated after a visual system change. Still image covers are preserved by default.

## Research-to-Asset Pipeline

Every new commercial content batch should start from a creator pain point, not only a film term. Good source themes include random AI video results, weak continuity, poor prompt adherence, character consistency, hidden credit costs, and model confusion.

Repeatable batch:

1. Research the user pain point and map it to a term, recipe, or planner improvement.
2. Write a beginner explanation, prompt template, common failure, and model-specific note.
3. Generate a clear image or 5-8 second explainer clip. The current automated glossary template renders 6-second HyperFrames clips at 480x270 for fast static delivery.
4. Compress and save the static asset.
5. Update `data/terms.json`, `data/mediaPipeline.json`, recipes, or blog links.
6. Run `npm run media:pipeline:apply`.

Each new term or recipe should include beginner definition, practical use case, AI prompt template, common failure, preview media, related terms, and model notes when useful.

Cards load `*-card.jpg` at `640x360`. Detail pages load `*-detail.jpg` at `1200x675`. Videos are 5-8 second teaching previews on hover/focus for glossary cards and normal controls inside prompt preview blocks and detail pages. The term manifest can use `"*"` in `data/mediaPipeline.json` to cover every glossary term without manually listing IDs.

## Preview Video UX

Preview videos should teach the term before the user copies the prompt. Each clip needs a visible subject, object, or camera frame so the viewer can understand what is being filmed. Avoid raw abstract motion unless the term itself is abstract.

Use this structure:

1. Title and one-line definition.
2. Visual demonstration with crop guides, focus marks, or action beats.
3. One practical lesson.
4. Three short steps that match the prompt language.

The full glossary HyperFrames template is category-aware:

- Composition: frame boundary, thirds, leading lines, foreground/background, and subject placement.
- Shots: visible subject/object with crop guide and framing labels.
- Angles: camera height, axis line, high/low/top/tilted view cues.
- Movement: camera body plus path/reveal animation.
- Lens / Optics: focus plane, exposure bars, depth and lens controls.
- Lighting: visible light source, beam, shadow/separation labels.
- Editing: timeline clips, cut point, continuity/action labels.
- AI Workflow: prompt/reference/retry panel for model-ready generation.

The planner preview section uses `PreviewCard`, so any term with `previewVideoUrl` appears as an inline playable clip. Terms without clips should show a calm planned state, never raw JSON like `previewVideoUrl: null`.

## Visual Quality Gate

Homepage covers, glossary previews, recipe cards, and HyperFrames clips must teach the term or workflow. Reject assets that are only decorative.

Every media asset should answer these questions:

- What real creator scenario is this showing?
- What is the subject or object?
- What shot, camera move, lighting choice, prompt structure, or failure fix is being taught?
- Can a beginner understand the point without reading a long paragraph?

For HyperFrames work, follow `media/hyperframes/DESIGN.md`. Use concrete diagrams, short labels, and meaningful shot sequences. Do not ship abstract rounded blocks, generic film-strip placeholders, or still-image wiggles as final teaching media.

## Homepage Visual Asset Rules

The homepage is a product explanation, not a stock gallery. Every hero, workflow, card, and service visual should show a concrete creator job.

Current homepage image roles:

- `public/images/home/director-console-coffee.webp` — hero console: coffee product reel before generation.
- `public/images/home/director-demo-bakery.webp` — landing demo and onboarding: bakery team planning a real launch reel.
- `public/images/home/workflow-storyboard-desk.webp` — workflow pipeline: idea cards becoming a shot plan and prompt.
- `public/images/home/tools/*.webp` — tool cards: learning, sequence planning, practice progress, and recipe browsing.

When replacing or adding homepage visuals:

1. Generate or design a real scene first: person, product, location, storyboard, prompt board, or interface in context.
2. Avoid fake rounded blobs, generic mesh shapes, decorative film strips, and emoji-style symbols.
3. Use CSS labels only for teaching overlays; do not rely on generated text inside the bitmap.
4. Save optimized `webp` assets under `public/images/home/` and keep each small enough for Lighthouse page-weight budgets.
5. If motion is needed, use HyperFrames or Remotion only when the movement teaches the workflow, such as shot order, camera path, before/after prompt fix, or model export.

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
npm run media:pipeline
npm run media:pipeline:apply
npm run media:pipeline:render
npm run media:render:term-previews
npm run validate:content
npm run build
```

Use the all-in-one pipeline for normal work:

```bash
# Check manifest, assets, hashes, content, and build.
npm run media:pipeline

# Write media references/hashes into data/terms.json, then validate and build.
npm run media:pipeline:apply

# Render missing preview videos for local-ready batches, write references, validate, and build.
npm run media:pipeline:render

# Regenerate the whole glossary motion previews after changing the HyperFrames visual template.
# Existing still images are preserved so real image covers are not replaced by video-frame posters.
npm run media:pipeline:render -- --force-render
```

Only regenerate still images deliberately, one term at a time, after reviewing the visual direction:

```bash
node scripts/render-term-previews-hyperframes.mjs --force-images close-up
```

Render a subset while iterating:

```bash
npm run media:pipeline:render -- close-up insert-shot
```

The manifest for batches and future Cloudflare mapping lives in `data/mediaPipeline.json`.

## Automation Guardrails

- `scripts/media-pipeline.mjs` is the orchestration entry point for future agents.
- `scripts/prepare-term-media.mjs` fails when local-ready assets are missing or above the size budgets in `data/mediaPipeline.json`.
- `scripts/validate-content.ts` fails when local `previewVideoUrl` or `assets[].url` files are missing.
- `scripts/validate-content.ts` also verifies local asset SHA-256 hashes when an asset hash is present.
- Do not manually edit asset hashes. Let `npm run media:pipeline:apply` write them.

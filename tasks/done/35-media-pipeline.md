# 35 — Static Media Pipeline + Glossary Visual Coverage

## Status

DONE

## Goal

Create a repeatable, backend-free pipeline for term card images and short preview videos across the full glossary.

## Inputs

- `data/terms.json`
- `data/mediaPipeline.json`
- `public/images/terms/`
- `public/videos/terms/`
- `scripts/prepare-term-media.mjs`
- `scripts/render-term-previews-hyperframes.mjs`
- `docs/media-pipeline.md`

## Acceptance

- `data/mediaPipeline.json` can target every glossary term with `"*"` batches.
- Every glossary term can be rendered through the dynamic HyperFrames template without manually listing IDs in the script.
- HyperFrames previews are 6-second, optimized teaching clips with a visible subject/object, camera/frame guide, short labels, and beginner lesson copy.
- The pipeline generates both `*-preview.mp4` and `*-detail.jpg`, then `prepare-term-media` creates `*-card.jpg` and writes hashes into `data/terms.json`.
- Term cards use lightweight card media and avoid loading heavy detail assets.
- Detail pages show video controls when a term has `previewVideoUrl`.
- Prompt preview cards show inline video controls when `previewVideoUrl` exists and a clean planned state when it does not.
- Future agents can follow a documented Git-first, Cloudflare R2-ready workflow.

## Notes

The first pass keeps assets in Git because optimized clips are small. When the media set grows, move large clips to Cloudflare R2 and keep the URLs in `data/terms.json` so Astro remains static.

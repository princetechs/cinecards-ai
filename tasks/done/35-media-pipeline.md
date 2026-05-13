# 35 — Static Media Pipeline + First Visual Batches

## Status

DONE

## Goal

Create a repeatable, backend-free pipeline for term card images and short preview videos.

## Inputs

- `data/terms.json`
- `data/mediaPipeline.json`
- `public/images/terms/`
- `public/videos/terms/`
- `scripts/prepare-term-media.mjs`
- `docs/media-pipeline.md`

## Acceptance

- First five foundation terms have short local preview clips.
- Next five shot terms have optimized card/detail images.
- Term cards use lightweight card media and avoid loading heavy detail assets.
- Detail pages show video controls when a term has `previewVideoUrl`.
- Future agents can follow a documented Git-first, Cloudflare R2-ready workflow.

## Notes

The first pass keeps assets in Git because the current library is small. When the media set grows, move large clips to Cloudflare R2 and keep the URLs in `data/terms.json` so Astro remains static.

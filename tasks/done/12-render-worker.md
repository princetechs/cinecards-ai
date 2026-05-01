# 12 — Render Worker + FFmpeg Stitcher

**Status:** ✅ Done (scaffolding) — awaits real provider adapters + ffmpeg

> Scaffolding pass landed: file-backed queue under `apps/worker/`, CLI enqueue, exponential-backoff worker, dead-letter file, provenance hash + sidecar files under `content/provenance/`, term `assets[]` write-back, and an ffmpeg stub `stitcher.ts`. See `apps/worker/README.md`. Real provider integration and the actual ffmpeg pipeline ride on top of this surface in a follow-up pass (and task 13 / task 24 for provenance + review).

## Goal
Background job queue that turns prompts into preview clips and writes URLs back to `previewVideoUrl`.

## Build
- `apps/worker/` — queue consumer (BullMQ or similar)
- Job shape: `{ termId, providerId, mode, prompt, durationSec, referenceImage? }`
- FFmpeg pipeline: normalise → overlay labels/arrows AFTER generation → export mp4 + webm
- Persistence: write resulting URL + provenance into the term record (or a separate `assets/` index)
- Retry + backoff; dead-letter queue with reason

## Acceptance
- One end-to-end job produces a playable mp4 stored in object storage
- Term card UI displays the generated clip when `previewVideoUrl` is populated

## Depends on
11. Blocks: 13, 24.

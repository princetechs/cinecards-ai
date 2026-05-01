# CineCards AI — Render Worker (scaffolding)

This is the local file-backed render worker for task 12. It proves the
architecture without committing to Redis/BullMQ or ffmpeg yet.

## Layout

- `queue.ts` — file-backed queue (`queue.json`) with atomic writes
- `index.ts` — main loop: claim → call provider adapter → write back
- `provenance.ts` — `buildProvenance()` and `hashPrompt()` (sha256 of prompt+seed)
- `stitcher.ts` — STUB; today writes a manifest, ffmpeg lands later
- `enqueue.ts` — CLI to push a job onto the queue
- `queue.json` — created on first enqueue; the live queue
- `dead-letter.json` — jobs that failed after `MAX_ATTEMPTS=3`

## Usage

From the repo root:

```bash
# enqueue a job (via root script)
npm run worker:enqueue -- '{"termId":"frame","providerId":"runway","mode":"text-to-video","prompt":"clean cinematic frame","durationSec":3}'

# run the worker (loops; --drain exits when queue is empty)
npm run worker:start
npm run worker:start -- --drain
```

Or directly inside `apps/worker/`:

```bash
npm run enqueue -- '<json>'
npm start
```

## Current state — adapters are stubs

The provider adapters under `lib/providers/*` all throw
`Not yet implemented` (or `RUNWAY_API_KEY is not configured` for runway).
**This is expected.** Every job currently:

1. Gets claimed (status `running`),
2. Fails with the stub message,
3. Is requeued with exponential backoff (1s → 4s → 16s),
4. After 3 attempts moves to `dead-letter.json` with the error.

That round trip is what the scaffolding proves. Real adapters land in a
follow-up pass on this task.

## Hand-off to task 13 (provenance)

On success the worker writes `content/provenance/<termId>-<jobId>.json`
and appends `{ type: 'clip', url, hash }` to the term's `assets[]`.
Task 13 owns the final provenance schema + C2PA sidecar storage.

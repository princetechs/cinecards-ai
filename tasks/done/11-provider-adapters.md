# 11 — Provider Adapter Layer

**Status:** ✅ Done (interface + stub adapters; real provider implementations deferred to task 12)

## Goal
Pluggable interface so the renderer is not bound to one vendor.

## Build
- `lib/providers/types.ts` — `interface VideoProvider { id; generate(req): Promise<RenderJob>; status(jobId); cancel(jobId) }`
- `lib/providers/runway.ts` — **primary**; supports text-to-video and image-to-video; respects "image defines composition / prompt defines motion" rule
- `lib/providers/pika.ts` — optional, routes through Fal AI
- `lib/providers/stability.ts` — self-hosted SVD path; image-to-video only, short clips, no text control
- `lib/providers/sora.ts` — **legacy gate only**; refuse new jobs after 2026-09 shutdown

## Acceptance
- One canonical request shape compiles to provider-specific prompts
- Each adapter declares `capabilities` (durations, modes, max actions, aspect ratios)
- Env-driven API keys; no keys in repo

## Depends on
10 (for `providerSupport` on each term).

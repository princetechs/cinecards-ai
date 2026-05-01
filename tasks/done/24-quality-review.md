# 24 — Quality-Confidence Scoring + Review Queue

**Status:** ✅ Done

## Goal
Auto-route low-confidence previews to humans before they go public.

## Build
- Heuristic scorer at render time: penalise multi-action prompts, complex motion, untested provider/model combos
- Threshold (e.g. < 0.6) flips `review.status` to `pending`
- Maintainer queue UI to approve / request-changes / deprecate
- Public site only renders `review.status === 'approved'` previews

## Depends on
10, 12, 13.

# 07 — Local Profile (Creator Login + localStorage)

**Status:** ✅ Done

## Goal
Track per-device progress without a backend.

## Delivered
- `components/CreatorLogin.astro` — profile button (NOT server auth)
- `src/types/window.d.ts` — typed window globals
- localStorage layer tracks: copied prompts, built plans, learning path progress

## Notes
README explicitly calls out: "the current profile button is not server auth". Do not upgrade this without an explicit product decision.

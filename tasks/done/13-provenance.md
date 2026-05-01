# 13 — Provenance + C2PA Storage

**Status:** ✅ Done

## Goal
Every public preview carries a verifiable provenance record.

## Build
- Persist on every render: `provider, modelVersion, promptHash, sourceAssetIds[], seed, renderDate, reviewState`
- Read C2PA / content-credential bytes from provider responses where available; embed/store alongside the asset
- Term card UI surfaces a "ⓘ provenance" affordance

## Acceptance
- Public asset page shows provider usage rights AND likely-copyright status separately (per US Copyright Office 2025 guidance)
- Records are immutable; re-renders create new records, not in-place edits

## Depends on
10, 12.

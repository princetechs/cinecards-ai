# 15 — Prompt Packs

**Status:** ✅ Done

## Goal
Curated reusable bundles of terms+prompts for common use cases.

## Build
- `data/promptPacks.json` — seed 10–20 packs (e.g. "Coffee shop reel", "Two-person dialogue", "Product macro hero")
- Schema: `{ id, name, useCase, items: [{ termId, promptOverride?, durationSec }], notes }`
- UI: pack list page; "Save current plan as pack" button on planner output
- localStorage stores user-saved packs (consistent with the no-backend stance in task 07)

## Acceptance
- Packs render on a `/packs` page; clicking a pack loads it into the planner output view

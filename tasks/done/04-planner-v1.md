# 04 — Planner v1 + Sequence Rules

**Status:** ✅ Done

## Goal
Turn a topic string into an ordered shot plan.

## Delivered
- `lib/planner.ts` — `buildShotSequence(topic)`:
  1. classifies topic into one of `product, travel, dialogue, tutorial, cinematic, lifestyle, narrative` via keyword map
  2. reads ordered term list from `data/sequenceRules.json`
  3. emits `{order, term, reason, prompt, duration}` items
- `data/sequenceRules.json` — 7 content types
- `components/PlannerInput.astro`, `components/ShotSequence.astro`, `components/AIPromptOutput.astro`

## Gaps (handled in task 14)
Pure rules engine. No beat parsing, no weighted scoring, no continuity constraints.

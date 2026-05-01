# 14 — Planner v2 (Beat Parser + Weighted Scoring)

**Status:** ✅ Done

## Goal
Replace the pure rules engine with the hybrid model from the deep-research report.

## Build
- Beat parser: `context, subjectIntro, primaryAction, detail, reaction, payoff, transition?`
- Classifier: 7 existing content types (already in v1)
- Coverage skeleton per type
- Scoring:
  `priority = 0.30*storyRole + 0.20*infoGain + 0.15*emotion + 0.10*editUtility + 0.10*aiReliability + 0.10*assetReuse + 0.05*costInverse`
- Hard rules: anchor shot first; one action per shot; continuity + diversity constraints
- Keep `buildShotSequence(topic)` signature stable; add `buildShotSequenceV2(topic, opts)`

## Acceptance
- Same topic produces a more varied, edit-friendly sequence than v1
- Unit tests for the scoring function

## Depends on
None (data already there). Should land before 15.

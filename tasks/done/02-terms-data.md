# 02 — Term Data + Schema v1

**Status:** ✅ Done

## Goal
Seed the curriculum as structured JSON cards.

## Delivered
- `data/terms.json` — **124 terms**
- All 8 categories: Shots, Angles, Movement, Lighting, Composition, Editing, Lens / Optics, AI Workflow
- All 5 priority groups: Foundation, Core Visual Grammar, Coverage and Edit Logic, Advanced Look, AI-Native Workflow
- `types/term.ts` — TypeScript shape

## Schema fields
`id, name, category, priorityGroup, priorityScore, shortDefinition, whyItMatters, whenToUse[], humanShootHint, aiPromptTemplate, previewPrompt3s, previewPrompt5s, previewVideoUrl, relatedTerms[], commonMistakes[], difficulty, tags[]`

## Gaps (handled in task 10)
No aliases, prerequisites, providerSupport, rights, provenance, qualityConfidence, review, localisation, assets[].

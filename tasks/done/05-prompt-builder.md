# 05 — Prompt Builder + 3s/5s Previews

**Status:** ✅ Done

## Goal
Compose AI-ready prompts with duration-aware previews.

## Delivered
- `lib/promptBuilder.ts` — `buildPrompt(term, topic, duration)` fills `[subject]` and `[duration]` placeholders
- `previewPrompt3s` and `previewPrompt5s` on every term
- `previewVideoUrl: null` field reserved on every term for future generation
- `components/PreviewCard.astro`, `components/PreviewConcept.astro` — duration toggle + placeholder block

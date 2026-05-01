# 03 — Glossary UI + Filters

**Status:** ✅ Done

## Goal
Browse, filter, and copy prompts for every term.

## Delivered
- `components/GlossaryGrid.astro` — renders all cards from `data/terms.json`
- `components/TermCard.astro` — name, category badge, priority group, short definition, human shoot hint, AI prompt, related terms, common mistakes
- `components/SearchFilters.astro` — search bar + category / priority / difficulty filters
- "Copy AI Prompt" button (writes to localStorage via `CreatorLogin`)
- `lib/termSearch.ts` — `getTermsByCategory`, `searchTerms`, `getRelatedTerms`

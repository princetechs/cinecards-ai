# 18 — JSON Schema Validation in CI

**Status:** ✅ Done

## Goal
Stop malformed term cards from entering the catalogue.

## Build
- `packages/content-schema/term.schema.json` (JSON Schema draft-2020-12)
- `scripts/validate-content.ts` — runs ajv against `data/terms.json` and `data/sequenceRules.json`
- `npm run check` extended to call the validator
- GitHub Action: lint + validate on PR

## Acceptance
- A bad PR (missing `id`, unknown `category`) fails CI with a readable error

## Depends on
10.

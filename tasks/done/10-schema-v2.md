# 10 — Term Schema v2

**Status:** ✅ Done

## Goal
Extend the term card to support rights, provenance, provider capability, review state, and the related-graph the deep-research report calls for.

## Add fields
- `aliases: string[]`
- `prerequisites: string[]` (term ids)
- `providerSupport: { runway?: 'full'|'partial'|'none', pika?, stability?, soraLegacy? }`
- `rights: { licence, holder, attribution, consentFlags[], derivativeOf? }`
- `provenance: { provider, modelVersion, promptHash, sourceAssetIds[], renderDate, c2pa? }`
- `qualityConfidence: number` (0–1)
- `review: { status: 'draft'|'pending'|'approved'|'deprecated', reviewer?, reviewedAt? }`
- `community: { upvotes, bookmarks, remixCount, completionCount }`
- `localisation: { [locale]: { name, shortDefinition, whyItMatters } }`
- `assets: [{ type:'image'|'clip'|'thumbnail'|'diagram', url, hash, rights }]`

## Acceptance
- `types/term.ts` updated; existing 124 cards still validate (new fields optional with sensible defaults)
- migration script in `scripts/` backfills `review.status='approved'` and empty `assets: []`

## Depends on
None. Blocks: 11, 13, 18, 23, 24.

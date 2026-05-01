# Provenance Sidecars

Each successful render produces an immutable JSON sidecar in this directory.

- File name: `<termId>-<jobId>.json` (e.g. `frame-abc123.json`).
- One file per render. Records are **immutable** — a re-render writes a new file rather than mutating an existing one.
- Schema: `ProvenanceRecord` in `lib/provenance.ts` (provider, modelVersion, promptHash, sourceAssetIds, renderDate, optional c2pa).
- Read at build time by `loadProvenance(termId)` and surfaced under each term's "Provenance" disclosure on the glossary page.

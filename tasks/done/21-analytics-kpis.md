# 21 — Analytics + KPI Dashboards

**Status:** ✅ Done (taxonomy + client emitter; KPI dashboards still TODO)

## Goal
Privacy-safe event taxonomy aligned to the four KPI families in the report.

## Build
- Event taxonomy doc: `docs/analytics-events.md` — tables per KPI family
  (Learning, Product, Generation, Community), each with name / trigger /
  properties / KPI mapping.
- Client emitter: `lib/analytics.ts` — `track`, `getEvents`, `clearEvents`.
  No third-party SDK, no network. Appends to `localStorage["aiscreens.events"]`,
  ring-buffered to last 500 entries. SSR-safe (no-ops without `window`).
- First wired call site: `term_prompt_copied` fires from
  `components/GlossaryGrid.astro` when a user copies a term's AI prompt
  (carries `termId` and `surface: "card"`).
- Dev inspector: `src/pages/_debug-events.astro` (route `/_debug-events`)
  lists the last 50 events with refresh + clear controls.

## Deferred
- KPI dashboards (Learning / Product / Generation / Community) — read-only
  views over the event log. Out of scope for v1; revisit once product
  validates need or once a backend exists.
- Wider call-site coverage for the rest of the taxonomy
  (search, filter, planner, quiz, render, contribution events). Scaffolded
  in the doc; wire incrementally as features ship.

## Notes
Stay on the no-backend default until product validates the need. The same
`track()` API can later be extended to also POST batched events without
touching call sites.

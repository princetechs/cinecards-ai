# aiscreens — Task Mind Map

Single source of truth for "what is built" vs "what is left". Any AI agent or human contributor should read this file first, then drill into `done/` or `pending/`.

## Mind Map

```
aiscreens
├── Foundation (DONE)
│   ├── Stack: Astro + TypeScript + Tailwind + JSON
│   ├── Pages: index, glossary, planner
│   ├── Components: Hero, Header, TermCard, GlossaryGrid, SearchFilters,
│   │               LearningPath, PlannerInput, ShotSequence, AIPromptOutput,
│   │               PreviewCard, PreviewConcept, OpenSource, CreatorLogin
│   ├── Lib: planner.ts, promptBuilder.ts, termSearch.ts
│   ├── Data: terms.json (124 terms), sequenceRules.json (7 content types)
│   ├── Types: types/term.ts
│   └── Open-source: README.md, CONTRIBUTING.md, CODE_OF_CONDUCT.md, LICENSE
│
├── Content (PARTIAL)
│   ├── DONE  — 124 term cards across 8 categories, 5 priority groups
│   ├── DONE  — sequence rules for 7 content types
│   ├── DONE  — prompt packs (15 curated bundles + save-from-planner)
│   ├── PARTIAL — localisation: i18n framework + es/hi UI + 3 sample term translations (121 terms still fall back to en)
│   └── TODO  — prerequisites graph, term aliases, full term-translation coverage
│
├── UX (PARTIAL)
│   ├── DONE  — search, category/priority/difficulty filters, copy-prompt
│   ├── DONE  — 3s/5s preview prompt fields per term
│   ├── DONE  — localStorage progress (copied prompts, plans, learning path)
│   ├── DONE  — term-detail deep page (/glossary/[slug]) + related-term graph
│   └── TODO  — quiz/recall mode, "learn next" graph nav, completion dashboard
│
├── AI Generation (PARTIAL)
│   ├── PARTIAL — provider adapter interface DONE (Runway, Pika, Stability,
│   │           Sora-legacy stubs); real provider implementations TODO
│   ├── PARTIAL — render queue / worker (scaffolded; awaits real adapters + ffmpeg)
│   ├── PARTIAL — FFmpeg stitcher (scaffolded; awaits real adapters + ffmpeg)
│   ├── PARTIAL — write generated URLs back to term assets[] (scaffolded; awaits real adapters + ffmpeg)
│   ├── DONE  — provenance metadata (provider, model, prompt hash, seed, C2PA)
│   └── DONE  — quality-confidence scoring + human review gate
│
├── Planner v2 (PENDING)
│   ├── TODO  — beat parser (context/subject/action/detail/reaction/payoff)
│   ├── TODO  — weighted scoring (storyRole, infoGain, emotion, editUtility,
│   │           aiReliability, assetReuse, costInverse)
│   ├── TODO  — continuity + diversity constraints
│   └── TODO  — export shot list / pack
│
├── Community & Governance (PENDING)
│   ├── TODO  — GitHub Issue forms + PR templates + Discussions config
│   ├── TODO  — contribution lanes (content / media / code / governance)
│   ├── DONE  — schema lint in CI
│   └── DONE  — rights + consent attestation flow
│
├── Data Model v2 (DONE)
│   ├── DONE  — extend term schema: aliases, prerequisites, providerSupport,
│   │           rights, provenance, qualityConfidence, community, review,
│   │           localisation, assets[] (types/term.ts + migration script)
│   └── DONE  — JSON schema file + validator (packages/content-schema, task 18)
│
└── Ops (PARTIAL)
    ├── DONE  — analytics event taxonomy (privacy-safe) + localStorage emitter
    ├── TODO  — KPI dashboards (learning, product, generation, community)
    └── DONE  — licensing split: Apache-2.0 code + CC BY 4.0 content
```

## Index

### Done
- [01 — Project scaffolding](done/01-scaffolding.md)
- [02 — Term data + schema v1](done/02-terms-data.md)
- [03 — Glossary UI + filters](done/03-glossary-ui.md)
- [04 — Planner v1 + sequence rules](done/04-planner-v1.md)
- [05 — Prompt builder + 3s/5s previews](done/05-prompt-builder.md)
- [06 — Hero / LearningPath / OpenSource sections](done/06-marketing-sections.md)
- [07 — Local profile (creator login + localStorage)](done/07-local-profile.md)
- [08 — Open-source baseline docs](done/08-oss-docs.md)
- [19 — GitHub community config (issue forms, discussions)](done/19-github-community.md)
- [16 — Term-detail deep page + related-term graph](done/16-term-detail-page.md)
- [17 — Quiz / recall mode](done/17-quiz-mode.md)
- [14 — Planner v2 (beat parser + weighted scoring)](done/14-planner-v2.md)
- [15 — Prompt packs (data + UI + save flow)](done/15-prompt-packs.md)
- [22 — Licensing split (Apache-2.0 + CC BY 4.0)](done/22-licensing-split.md)
- [10 — Term schema v2 (rights, provenance, providerSupport)](done/10-schema-v2.md)
- [21 — Analytics taxonomy + localStorage emitter](done/21-analytics-kpis.md)
- [11 — Provider adapter layer (Runway / Pika / Stability)](done/11-provider-adapters.md)
- [20 — Rights + consent attestation flow](done/20-rights-consent.md)
- [18 — JSON schema validation in CI](done/18-schema-ci.md)
- [23 — Localisation (i18n framework + es/hi, partial term coverage)](done/23-localisation.md)
- [12 — Render worker + FFmpeg stitcher (scaffolded; awaits real adapters + ffmpeg)](done/12-render-worker.md)
- [24 — Quality-confidence scoring + review queue](done/24-quality-review.md)
- [13 — Provenance + C2PA storage](done/13-provenance.md)
- [25 — Blog content schema & frontmatter spec](done/25-blog-content-schema.md)
- [26 — Blog file system layout plan](done/26-blog-file-layout.md)
- [27 — Astro Content Collections setup for blog](done/27-blog-content-collections.md)
- [28 — Blog index page (/blog)](done/28-blog-index-page.md)
- [29 — Dynamic blog post page (/blog/[slug])](done/29-blog-post-page.md)
- [32 — Blog nav link & homepage preview section](done/32-blog-nav-homepage.md)
- [33 — Write 5 seed blog posts for launch](done/33-blog-seed-posts.md)
- [30 — Blog category & tag archive pages](done/30-blog-archive-pages.md)
- [31 — Blog sitemap & RSS feed](done/31-blog-sitemap-rss.md)
- [34 — Blog SEO & AI-readiness audit](done/34-blog-seo-audit.md)

### Pending
_All tracked tasks are complete._

## How to use this folder

- Each task file has: **Status**, **Goal**, **Inputs**, **Acceptance**, **Notes**.
- When you finish a pending task, move the file from `pending/` to `done/` and update the index above.
- Do not delete done files — they are the audit trail.
- New work? Add a numbered file in `pending/` and link it in the index.

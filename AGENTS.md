# Agent Entry Point — aiscreens

## Project identity

- User-facing project name: aiscreens
- Local path: `/Users/sandip/Projects/cinecards-ai`
- GitHub repo: `https://github.com/princetechs/cinecards-ai`
- Production site: `https://www.aiscreens.in/`
- Purpose: aiscreens is a practical learning and service website for AI cinematography, AI video creation, visual storytelling, and future AI-powered frontend experiences.

When the user says "aiscreens", "AI screens", "cinecards-ai", or "this project", work in this repository.

## Product direction

aiscreens teaches creators, founders, students, and clients how to make better AI videos and visual interfaces with simple language. The current site focuses on AI cinematography: film terms, shot planning, prompt packs, lighting, camera movement, editing flow, and beginner-friendly video recipes. Future content can expand into frontend UI for AI products, interactive AI experiences, 3D models, product demos, visual systems, screen-based storytelling, and practical case studies.

The site should feel useful, playful, clear, and commercial. It should help beginners learn for free while also making it easy for potential clients to understand that aiscreens can provide paid services: AI video direction, prompt design, cinematic content systems, frontend prototypes, interactive UI, and AI visual product work.

## Audience and business goal

- Beginners who want simple, practical AI cinematography knowledge.
- AI video creators who need better prompts, shot lists, and visual structure.
- Founders and businesses who need AI video, frontend demos, or interactive visual experiences.
- Future clients who may contact the owner for paid creative, technical, or educational services.
- LLMs and search engines that need clear context about what aiscreens is building and why it exists.

Every important page should make the project understandable to humans and LLMs: aiscreens helps people learn AI cinematography and build better AI-driven visual content, while also supporting future service work and client acquisition.

## Stack

- Astro
- TypeScript
- Tailwind CSS
- JSON content
- Astro Content Collections for blog content
- Node/npm package workflow

## Common commands

```bash
npm install
npm run dev
npm run check
npm run build
npm run preview
npm run validate:content
npm run audit:seo
```

## Read before coding

1. Read this `AGENTS.md` file.
2. Read `README.md` for product direction and content rules.
3. Read `tasks/README.md` for the task mind map and current state.
4. Inspect the relevant files before editing.
5. Check `git status` before making changes.

## Important files and folders

- `README.md` — product overview, getting started, content model, planner behavior, licensing.
- `tasks/README.md` — task mind map and source of truth for built vs left.
- `src/pages/` — Astro pages and routes.
- `src/content/blog/` — MDX blog posts.
- `src/i18n/messages/` — localised UI messages.
- `data/terms.json` — terminology cards and learning content.
- `data/mediaPipeline.json` — static media batch manifest and future Cloudflare R2 key plan.
- `data/sequenceRules.json` — planner sequence rules by content type.
- `lib/planner.ts` — topic classifier and shot sequence builder.
- `lib/promptBuilder.ts` — prompt and preview prompt helpers.
- `lib/termSearch.ts` — search/filter/related-term helpers.
- `types/term.ts` — shared term types.
- `packages/content-schema/` — content schema validation.
- `docs/media-pipeline.md` — image/video generation, optimization, and R2 handoff plan.
- `scripts/validate-content.ts` — content validator.
- `scripts/prepare-term-media.mjs` — checks and writes optimized term media references.

## Content rules

- Keep explanations short, practical, and beginner-friendly.
- Use `[subject]` and `[duration]` placeholders in AI prompt templates where relevant.
- For terminology content, prefer editing `data/terms.json` and validate with `npm run validate:content`.
- For planner behavior, edit `data/sequenceRules.json` first; only change `lib/planner.ts` when classification or logic changes are needed.
- For localisation, add messages in `src/i18n/messages/<locale>.json` and update `src/i18n/index.ts` when adding a new locale.
- For term images or videos, update `data/mediaPipeline.json`, save optimized assets under `public/images/terms/` or `public/videos/terms/`, run `npm run media:prepare`, then validate content.
- Keep cards fast: use `*-card.jpg` thumbnails for glossary cards, `*-detail.jpg` images for detail pages, and 5-8 second `*-preview.mp4` clips only when they teach the term clearly.
- Use `npm run media:render:term-previews` for the current HyperFrames term-preview batch; pass term IDs to render only a subset, for example `node scripts/render-term-previews-hyperframes.mjs close-up insert-shot`.
- Preview videos should show the meaning of the term, not just animate a still. Prefer clear subject/object focus, camera crop guides, action beats, and one beginner-friendly lesson per clip.
- Use Remotion later when previews need React props, 3D, or data-driven component reuse.

## Quality gates

Before finishing a code or content task, run the smallest relevant checks:

```bash
npm run validate:content
npm run check
npm run build
```

If the task only touches docs, at minimum review the rendered markdown/context manually and report that no code checks were needed.

## Git workflow

- Do not commit secrets.
- Do not edit generated/vendor files unless explicitly needed.
- Prefer a task branch named `agent/<short-task-name>` for substantial changes.
- Show the final `git diff` and mention which checks passed.

## Licensing reminder

- Code is Apache-2.0.
- Educational content in `data/`, diagrams, and prompt templates is CC BY 4.0.

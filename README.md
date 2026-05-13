# aiscreens

aiscreens is a practical learning website for AI cinematography, AI video creation, and visual storytelling. It teaches film language with simple cards, turns a topic or story into a prioritized shot sequence, and gives creators copyable prompts they can use in AI video tools.

The project starts with AI cinematography: shots, lighting, camera movement, editing flow, prompt packs, and beginner-friendly video recipes. Over time it can grow into a broader resource for AI-powered frontend experiences, interactive 3D models, product demos, screen-based storytelling, visual UI systems, and practical client-facing examples.

The business goal is to share useful knowledge for free while making aiscreens understandable to future clients. The site should help people learn, trust the work, and eventually contact the owner for services such as AI video direction, prompt design, cinematic content systems, frontend prototypes, interactive AI UI, and visual product work.

The product direction is intentionally lightweight: Astro, TypeScript, Tailwind CSS, JSON content, static SEO-friendly pages, and local-device progress tracking. The current profile button is not server auth; it is a small localStorage layer for tracking copied prompts, built plans, and learning path progress.

## Who It Is For

- Beginner videographers learning shot sizes, angles, lighting, composition, and editing logic.
- AI video creators who need cleaner shot-direction prompts.
- Filmmakers who want a fast previs and shot-planning vocabulary.
- Founders, creators, and businesses exploring AI video, product demos, and interactive visual frontend ideas.
- Open-source contributors who want to improve content, prompts, UI, or future render adapters.

## Project Structure

```text
components/              Astro UI components
data/terms.json          Structured terminology cards
data/sequenceRules.json  Planner sequence templates by content type
lib/planner.ts           Topic classifier and shot sequence builder
lib/promptBuilder.ts     Prompt and preview prompt helpers
lib/termSearch.ts        Search, filter, and related-term helpers
src/pages/               Astro pages
types/term.ts            Shared TypeScript types
public/images/           Project images and static assets
```

## Getting Started

```bash
npm install
npm run dev
```

Open `http://localhost:4321`.

Useful commands:

```bash
npm run check
npm run build
npm run preview
```

## How Terminology Is Stored

All learning content lives in `data/terms.json`. Each card includes:

- beginner definition
- why it matters
- when to use it
- human shooting hint
- AI prompt template
- 3-second and 5-second preview prompts
- related terms
- common mistakes
- category, priority group, difficulty, and tags
- `previewVideoUrl`, currently `null` for future generated previews

Schema v2 adds optional fields for `aliases`, `prerequisites`, `providerSupport`, `rights`, `provenance`, `qualityConfidence`, `review`, `community`, `localisation`, and `assets`. All v2 fields are optional, so existing cards keep working without modification — every term is backfilled with `review: { status: "approved" }` and `assets: []` by `scripts/migrate-terms-v2.mjs`. See `types/term.ts` for the full shape.

## Add a New Term

Add an object to `data/terms.json` using this format:

```json
{
  "id": "close-up",
  "name": "Close-Up",
  "category": "Shots",
  "priorityGroup": "Foundation",
  "priorityScore": 95,
  "shortDefinition": "Frames the face or important detail to show emotion.",
  "whyItMatters": "Helps the viewer focus on emotion, detail, or story importance.",
  "whenToUse": ["Emotion", "Reaction", "Product detail"],
  "humanShootHint": "Move closer, simplify the background, and focus on the eyes or key detail.",
  "aiPromptTemplate": "cinematic close-up of [subject], shallow depth of field, soft light, [duration]",
  "previewPrompt3s": "cinematic close-up of [subject], soft light, subtle expression change, 3 seconds",
  "previewPrompt5s": "cinematic close-up of [subject], slow dolly in, emotional expression, 5 seconds",
  "previewVideoUrl": null,
  "relatedTerms": ["Extreme Close-Up", "Reaction Shot"],
  "commonMistakes": ["Too much background distraction"],
  "difficulty": "Beginner",
  "tags": ["emotion", "detail", "AI prompt"]
}
```

Keep explanations short, practical, and beginner-friendly. Use `[subject]` and `[duration]` placeholders in prompt templates so `lib/promptBuilder.ts` can fill them automatically.

## Blog Publishing Rules

Blog posts live in `src/content/blog/` as MDX files using the schema in `src/content/config.ts`. Before adding or editing blog content, follow the checklist in `docs/blog-writing-rules.md` so each article is SEO-friendly, LLM-readable, beginner-friendly, internally linked, and valid for the Astro Content Collection.

## Analytics Setup

External analytics and SEO verification are optional and environment-driven. Use `docs/analytics-setup.md` to enable Cloudflare Web Analytics and Google Search Console without hardcoding public site tokens in the repo.

## Media Pipeline

Term media is static and backend-free. Small optimized card/detail images can live in Git under `public/images/terms/`; heavier previews can later move to Cloudflare R2 while `data/terms.json` keeps the public URLs. Follow `docs/media-pipeline.md` and `data/mediaPipeline.json`.

Useful commands:

```bash
npm run media:check
npm run media:prepare
npm run media:render:term-previews
```

## How the Planner Works

`lib/planner.ts` does three things:

1. Classifies the topic into `product`, `travel`, `dialogue`, `tutorial`, `cinematic`, `lifestyle`, or `narrative`.
2. Reads the matching ordered term list from `data/sequenceRules.json`.
3. Builds a shot plan with a reason, duration, and AI prompt for each term.

To change planner behavior, edit `data/sequenceRules.json` first. If a new content type needs smarter matching, update the keyword map in `lib/planner.ts`.

## Future AI Video Generation

The current app only creates prompts and placeholder preview blocks. To add real generation:

- Add a provider adapter layer for Runway, Pika/Fal, Stability, or another provider.
- Store render jobs with prompt, provider, model version, source asset IDs, and rights metadata.
- Write generated preview URLs back to `previewVideoUrl`.
- Preserve provenance metadata such as provider, render date, prompt hash, seed, and C2PA data when available.
- Keep the UI unchanged by continuing to read previews from `data/terms.json`.
- Use HyperFrames for HTML/GSAP explainers and Remotion for React/data-driven video templates when generated previews need reusable motion systems.

## Localisation

aiscreens supports localised UI strings and per-term translations. The default locale is `en`; `es` and `hi` ship with translated nav, CTAs, and term-detail headings, plus a few sample term translations.

- Add a new locale: drop a JSON file in `src/i18n/messages/<locale>.json` (any subset of keys; missing keys fall back to English) and add the locale to `LOCALES` in `src/i18n/index.ts`.
- Translate a term card: add a `localisation: { "<locale>": { name, shortDefinition, whyItMatters } }` block to that term in `data/terms.json`. Untranslated fields automatically fall back to the English source.
- Localised routes are generated under `/[lang]/glossary` and `/[lang]/planner`; English keeps the un-prefixed paths. Use the EN/ES/HI toggle in the header to switch.

## Contributing

See `CONTRIBUTING.md` for contribution lanes and review expectations. Please follow `CODE_OF_CONDUCT.md`.

## License

aiscreens uses a split license so code and educational content can be reused with the right expectations.

- Code is licensed under Apache-2.0. See `LICENSE` at the repo root.
- Content (everything in `data/`, term text, diagrams, and prompt templates) is licensed under Creative Commons Attribution 4.0 International (CC BY 4.0). See `content/LICENSE-CONTENT` and `content/README.md`.

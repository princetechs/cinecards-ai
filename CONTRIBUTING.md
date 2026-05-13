# Contributing to aiscreens

Thanks for helping make film language easier to learn and easier to prompt.

## Contribution Lanes

- Content: definitions, examples, related terms, common mistakes, translations.
- Prompts: better AI templates, 3s previews, 5s previews, provider notes.
- UI: accessibility, responsiveness, visual clarity, search and planner improvements.
- Data: schema improvements, validation, rights/provenance fields.
- Future video: provider adapters, render queues, preview moderation, export tools.

## Term Contribution Checklist

- The term has a stable `id` in kebab case.
- The category is one of: `Shots`, `Angles`, `Movement`, `Lighting`, `Composition`, `Editing`, `Lens / Optics`, `AI Workflow`.
- The priority group is one of: `Foundation`, `Core Visual Grammar`, `Coverage and Edit Logic`, `Advanced Look`, `AI-Native Workflow`.
- The definition is short enough for a card.
- The human hint works for phone creators as well as camera users.
- The AI prompt has `[subject]` and `[duration]` placeholders.
- Preview prompts demonstrate one concept, one subject, and one main action.
- Related terms already exist when possible.
- Rights and provenance are included for any media contribution.

## Submitting media assets

Media contributions (images, clips, thumbnails, diagrams) require explicit rights and consent. Use the in-app form at [`/contribute/asset`](/contribute/asset) to generate a rights-attested JSON snippet. The form will not produce a snippet unless you tick all four required attestations: `iOwnOrLicensed`, `subjectsConsented`, `noPII`, and that you have read this document.

Open a pull request that adds the snippet to the matching term's `assets` array in `data/terms.json`. The content validator (`scripts/validate-content.ts`, run via `npm run check`) rejects any asset entry missing the required attestations or a licence string. PRs missing rights metadata will be closed without review.

## Local Development

```bash
npm install
npm run dev
npm run build
```

Run `npm run build` before opening a pull request.

## Good First Issue

New here? Filter the issue tracker by these labels to find a friendly entry point:

- `good-first-issue` — small, well-scoped, mentor-friendly tasks.
- `content` — term definitions, examples, related terms, translations.
- `code` — UI, lib, schema, tooling.
- `docs` — README, CONTRIBUTING, in-app copy.
- `media` — previews, thumbnails, generated assets.
- `governance` — licensing, community config, review process.

If a `good-first-issue` is unclaimed, comment on it to claim it before opening a PR.

## Review Style

Content should be practical, visual, and beginner-friendly. Avoid long textbook explanations. The app should feel like an interactive learning tool, not a blog.

## Licensing your contributions

aiscreens uses a split license. Code contributions (under `components/`, `lib/`, `src/`, `types/`, build config) are licensed under Apache-2.0; content contributions (under `data/`, term text, diagrams, and prompt templates) are licensed under CC BY 4.0. By opening a pull request you agree your contribution is offered under the matching license for the files you touched. See `LICENSE` and `content/LICENSE-CONTENT` for the full terms.

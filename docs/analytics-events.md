# CineCards AI — Analytics Event Taxonomy

Privacy-safe, no-backend product event taxonomy aligned to the four KPI
families from the deep-research report: **Learning**, **Product**,
**Generation**, **Community**.

## Stance

- **No third-party SDK, no network for product events.** Events are appended to
  `localStorage` under `cinecards.events` via `lib/analytics.ts`.
- Aggregate site analytics and SEO verification are configured separately in
  `docs/analytics-setup.md`.
- Ring-buffered to the last 500 entries (oldest dropped).
- SSR-safe: emitter no-ops when `window` is undefined.
- Naming convention: `snake_case` event names, camelCase property keys.
- No PII. The `creatorId` is a locally-generated identifier from
  `components/CreatorLogin.astro` and never leaves the device.

## Inspector

A dev-only inspector lists the last 50 events at **`/_debug-events`**
(underscore-prefixed so it is easy to spot and excluded from sitemaps later).
Visit it during development to confirm wiring.

## Usage

```ts
import { track } from "../lib/analytics";

track("term_prompt_copied", { termId: "rack-focus" });
```

## Learning KPIs

KPIs: foundation completion, quiz accuracy, time-to-correct-selection,
5-shot sequence success rate.

| Event | Trigger | Properties | KPI |
| --- | --- | --- | --- |
| `term_card_viewed` | Term-detail page loaded or card scrolled into view | `termId`, `category`, `priorityGroup` | Foundation completion |
| `learning_path_progress` | User marks a term complete in LearningPath | `termId`, `pathId`, `completedCount`, `totalCount` | Foundation completion |
| `quiz_started` | User opens a quiz / recall round | `quizId`, `mode` | Quiz engagement |
| `quiz_answered` | User submits an answer | `quizId`, `questionId`, `correct`, `latencyMs` | Quiz accuracy, time-to-correct |
| `quiz_completed` | Quiz reaches the end | `quizId`, `score`, `total`, `durationMs` | Quiz accuracy |
| `shot_sequence_built` | User finalises a 5-shot sequence in planner | `contentType`, `shotCount`, `coverageScore` | 5-shot sequence success rate |
| `related_term_followed` | User clicks a related-term link | `fromTermId`, `toTermId` | Foundation breadth |

## Product KPIs

KPIs: activated users, search success, pack saves, planner completion,
preview watch-through, weekly repeat use.

| Event | Trigger | Properties | KPI |
| --- | --- | --- | --- |
| `creator_activated` | First successful local profile save | `creatorId` | Activated users |
| `search_performed` | Search input committed (debounced) | `query`, `resultCount` | Search success |
| `filter_applied` | Category / priority / difficulty filter changed | `filter`, `value`, `resultCount` | Search success |
| `term_prompt_copied` | User clicks "Copy" on a term's AI prompt | `termId`, `surface` (`card` \| `detail` \| `pack`) | Activation, weekly repeat |
| `preview_toggled` | User switches between 3s and 5s preview | `termId`, `duration` (`3` \| `5`) | Preview watch-through |
| `planner_submitted` | PlannerInput "Build sequence" pressed | `contentType`, `beatCount` | Planner completion |
| `plan_saved_as_pack` | "Save as pack" succeeds | `packId`, `itemCount`, `contentType` | Pack saves |
| `pack_opened` | User opens a saved or curated pack | `packId`, `source` (`curated` \| `saved`) | Weekly repeat |

## Generation KPIs (placeholders)

Wired now so that when provider adapters land (tasks 11–13) the dashboards
already have history. KPIs: render success rate, latency, cost per preview,
quality-confidence distribution, moderation fail rate.

| Event | Trigger | Properties | KPI |
| --- | --- | --- | --- |
| `render_requested` | User submits a generate-preview request | `termId`, `provider`, `model`, `duration`, `promptHash` | Render volume |
| `render_succeeded` | Provider returns a usable asset | `termId`, `provider`, `latencyMs`, `costUsd`, `qualityConfidence` | Success rate, latency, cost |
| `render_failed` | Provider error or moderation block | `termId`, `provider`, `reason`, `latencyMs` | Failure rate, moderation |
| `render_reviewed` | Human review verdict captured | `termId`, `verdict` (`approved` \| `rejected` \| `needs-edit`), `reviewerId` | Quality gate |
| `provenance_attached` | C2PA / metadata written | `termId`, `provider`, `seed`, `promptHash` | Provenance coverage |

## Community KPIs

KPIs: median review time, accepted-contribution rate, non-code contributors,
Discussions to Issues conversion.

| Event | Trigger | Properties | KPI |
| --- | --- | --- | --- |
| `contribution_drafted` | User starts a contribution flow (term / pack / asset) | `kind` (`term` \| `pack` \| `asset` \| `governance`), `surface` | Non-code contributors |
| `contribution_submitted` | Draft sent (PR link copied / opened) | `kind`, `targetTermId?` | Accepted-contribution rate |
| `discussion_opened` | User clicks through to GitHub Discussions | `topic` | Discussions to Issues conversion |
| `issue_opened` | User clicks through to a templated GitHub Issue | `template` | Discussions to Issues conversion |
| `review_started` | Maintainer opens the review queue | `queueSize` | Median review time |
| `review_completed` | Maintainer files a verdict | `targetId`, `verdict`, `durationMs` | Median review time |

## Notes for future work

- A KPI dashboard page (read-only, computed from `cinecards.events` in the
  browser) is intentionally out of scope here — see `tasks/pending/` once the
  product validates the need for one.
- If we ever introduce a backend, the same `track()` API can be extended to
  also POST batched events; call sites do not change.

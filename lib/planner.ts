import sequenceRules from "../data/sequenceRules.json";
import type { SequenceType, ShotPlan, ShotPlanItem, Term, TermCategory } from "../types/term";
import { buildPrompt } from "./promptBuilder";
import { getAllTerms, getTermByName } from "./termSearch";

const keywordMap: Record<SequenceType, string[]> = {
  product: ["product", "demo", "launch", "unbox", "feature", "app", "tool", "device", "menu", "brand"],
  travel: ["travel", "trip", "city", "street", "beach", "mountain", "hotel", "journey", "market"],
  dialogue: ["dialogue", "interview", "podcast", "conversation", "talk", "meeting", "debate", "testimonial"],
  tutorial: ["tutorial", "how to", "lesson", "recipe", "class", "teach", "guide", "walkthrough", "process"],
  cinematic: ["cinematic", "montage", "reel", "trailer", "teaser", "mood", "dream", "visual poem"],
  lifestyle: ["morning", "routine", "coffee", "cafe", "fitness", "fashion", "food", "home", "day in"],
  narrative: ["story", "scene", "character", "conflict", "discover", "chase", "mystery", "short film"]
};

const reasonByTerm: Record<string, string> = {
  "Establishing Shot": "Start by showing where the story happens.",
  "Wide Shot": "Give the viewer space, scale, and context.",
  "Medium Shot": "Show the main subject and the action clearly.",
  "Close-Up": "Focus attention on emotion, texture, or importance.",
  "Extreme Close-Up": "Turn a tiny detail into the visual hook.",
  "Insert Shot": "Capture a detail the edit can cut to cleanly.",
  "B-Roll": "Add supporting texture and edit flexibility.",
  "Tracking Shot": "Follow movement so the sequence feels alive.",
  "Dolly In": "Add intention by moving toward the key subject.",
  "Back Light": "Separate the subject from the background.",
  "Two Shot": "Show relationship and shared space.",
  "Over-the-Shoulder": "Create dialogue coverage with a clear eyeline.",
  "Reaction Shot": "Hold the emotional beat after the action.",
  "Top Light": "Make hands, surfaces, and process steps easy to read.",
  "Low Angle": "Make the subject feel larger or more powerful.",
  "Master Shot": "Record the whole action so the edit has an anchor.",
  "POV Shot": "Let the audience experience the moment from inside the scene.",
  "Cutaway": "Give the editor a useful bridge between actions.",
  "Macro Shot": "Make texture and product detail feel premium.",
  "Rule of Thirds": "Keep the frame balanced and easy to scan.",
  "Reference Image": "Lock composition and style before generating motion.",
  "Storyboard": "Keep multiple generated clips consistent."
};

const fiveSecondTerms = new Set([
  "Establishing Shot",
  "Wide Shot",
  "Tracking Shot",
  "Dolly In",
  "Master Shot",
  "Two Shot",
  "Storyboard",
  "Reference Image"
]);

export function classifyTopic(topic: string): SequenceType {
  const text = topic.toLowerCase();
  let best: { type: SequenceType; score: number } = { type: "cinematic", score: 0 };

  for (const [type, keywords] of Object.entries(keywordMap) as [SequenceType, string[]][]) {
    const score = keywords.reduce((total, keyword) => total + (text.includes(keyword) ? 1 : 0), 0);
    if (score > best.score) best = { type, score };
  }

  return best.type;
}

function durationFor(term: Term): "3s" | "5s" {
  return fiveSecondTerms.has(term.name) ? "5s" : "3s";
}

export function buildShotSequence(topic: string): ShotPlan {
  const type = classifyTopic(topic);
  const rules = (sequenceRules as Record<SequenceType, string[]>)[type];

  const sequence = rules
    .map((termName, index): ShotPlanItem | null => {
      const term = getTermByName(termName);
      if (!term) return null;

      const duration = durationFor(term);

      return {
        order: index + 1,
        term: term.name,
        termId: term.id,
        category: term.category,
        priorityGroup: term.priorityGroup,
        reason: reasonByTerm[term.name] ?? term.whyItMatters,
        prompt: buildPrompt(term, topic, duration),
        duration
      };
    })
    .filter((item): item is ShotPlanItem => Boolean(item));

  return { topic, type, sequence };
}

// ---------------------------------------------------------------------------
// Planner v2 — beat parser + weighted scoring
// ---------------------------------------------------------------------------

export type Beat =
  | "context"
  | "subjectIntro"
  | "primaryAction"
  | "detail"
  | "reaction"
  | "payoff"
  | "transition";

export interface BeatPlan {
  context: boolean;
  subjectIntro: boolean;
  primaryAction: boolean;
  detail: boolean;
  reaction: boolean;
  payoff: boolean;
  transition: boolean;
}

export interface ShotPlanItemV2 extends ShotPlanItem {
  beat: Beat;
  score: number;
}

export interface ShotPlanV2 extends Omit<ShotPlan, "sequence"> {
  beats: BeatPlan;
  sequence: ShotPlanItemV2[];
}

export interface BuildShotSequenceV2Options {
  /** Override classification (default: classifyTopic). */
  type?: SequenceType;
  /** Maximum number of shots to emit (default: 6). */
  maxShots?: number;
}

const REACTION_KEYWORDS = [
  "react", "smile", "laugh", "cry", "shock", "surprise", "gasp", "frown",
  "joy", "anger", "fear", "love", "happy", "sad", "amaze", "wow"
];
const PAYOFF_KEYWORDS = [
  "reveal", "win", "finish", "result", "launch", "drop", "logo", "brand",
  "final", "ending", "climax", "delivery", "unveil", "showcase"
];
const DETAIL_KEYWORDS = [
  "detail", "macro", "texture", "ingredient", "feature", "spec", "logo",
  "screen", "ui", "button", "stitch", "thread", "drop", "pour", "icing"
];
const CONTEXT_KEYWORDS = [
  "city", "town", "street", "beach", "mountain", "forest", "studio", "kitchen",
  "office", "home", "cafe", "shop", "park", "stadium", "factory", "morning",
  "night", "sunset", "sunrise", "season", "weather"
];

/**
 * Heuristic beat parser. Returns which beats the topic implies.
 * Always emits context + subjectIntro + primaryAction + detail; the rest are
 * keyword-driven so simple topics still get a sensible coverage skeleton.
 */
export function parseBeats(topic: string): BeatPlan {
  const text = topic.toLowerCase();
  const has = (words: string[]) => words.some((w) => text.includes(w));

  return {
    context: true, // always anchor with context
    subjectIntro: true, // always introduce the subject
    primaryAction: true, // every plan needs one main action
    detail: true || has(DETAIL_KEYWORDS), // always include a detail beat
    reaction: has(REACTION_KEYWORDS) || /\b(people|person|crowd|child|kid|family|team)\b/.test(text),
    payoff: has(PAYOFF_KEYWORDS) || has(CONTEXT_KEYWORDS) === false,
    transition: /\bmontage|sequence|reel|trailer|story|journey\b/.test(text)
  };
}

// Coverage skeleton: each beat -> ranked list of preferred term names. We
// reuse v1 sequenceRules where possible and extend per beat.
const beatSkeleton: Record<SequenceType, Partial<Record<Beat, string[]>>> = {
  product: {
    context: ["Establishing Shot", "Wide Shot"],
    subjectIntro: ["Medium Shot", "Two Shot"],
    primaryAction: ["Insert Shot", "Tracking Shot", "Dolly In"],
    detail: ["Macro Shot", "Close-Up", "Extreme Close-Up"],
    reaction: ["Reaction Shot", "Close-Up"],
    payoff: ["Close-Up", "Back Light", "Low Angle"],
    transition: ["B-Roll", "Cutaway"]
  },
  travel: {
    context: ["Establishing Shot", "Wide Shot"],
    subjectIntro: ["Tracking Shot", "Medium Shot"],
    primaryAction: ["Tracking Shot", "POV Shot"],
    detail: ["Insert Shot", "Close-Up", "Macro Shot"],
    reaction: ["Reaction Shot", "Close-Up"],
    payoff: ["Wide Shot", "Low Angle"],
    transition: ["B-Roll", "Cutaway"]
  },
  dialogue: {
    context: ["Establishing Shot", "Wide Shot"],
    subjectIntro: ["Two Shot", "Medium Shot"],
    primaryAction: ["Over-the-Shoulder", "Master Shot"],
    detail: ["Insert Shot", "Close-Up"],
    reaction: ["Reaction Shot", "Close-Up"],
    payoff: ["Close-Up", "Two Shot"],
    transition: ["Cutaway", "B-Roll"]
  },
  tutorial: {
    context: ["Establishing Shot", "Wide Shot", "Medium Shot"],
    subjectIntro: ["Medium Shot"],
    primaryAction: ["Insert Shot", "Top Light"],
    detail: ["Close-Up", "Macro Shot", "Extreme Close-Up"],
    reaction: ["Reaction Shot"],
    payoff: ["Close-Up", "Medium Shot"],
    transition: ["B-Roll", "Cutaway"]
  },
  cinematic: {
    context: ["Wide Shot", "Establishing Shot"],
    subjectIntro: ["Low Angle", "Medium Shot"],
    primaryAction: ["Dolly In", "Tracking Shot"],
    detail: ["Close-Up", "Macro Shot"],
    reaction: ["Reaction Shot", "Close-Up"],
    payoff: ["Back Light", "Low Angle", "Close-Up"],
    transition: ["B-Roll", "Cutaway"]
  },
  lifestyle: {
    context: ["Establishing Shot", "Wide Shot"],
    subjectIntro: ["Medium Shot"],
    primaryAction: ["Insert Shot", "Tracking Shot"],
    detail: ["Close-Up", "Macro Shot"],
    reaction: ["Reaction Shot", "Close-Up"],
    payoff: ["Close-Up", "Back Light"],
    transition: ["B-Roll", "Cutaway"]
  },
  narrative: {
    context: ["Establishing Shot", "Wide Shot"],
    subjectIntro: ["Master Shot", "Medium Shot"],
    primaryAction: ["Tracking Shot", "Dolly In", "Master Shot"],
    detail: ["Close-Up", "Insert Shot"],
    reaction: ["Reaction Shot", "Close-Up"],
    payoff: ["Close-Up", "Low Angle"],
    transition: ["Cutaway", "B-Roll"]
  }
};

const ANCHOR_NAMES = new Set(["Establishing Shot", "Wide Shot", "Master Shot"]);
const EDITING_CONCEPT_CATEGORIES = new Set<TermCategory>(["Editing", "AI Workflow"]);

const STORY_ROLE_BY_BEAT: Record<Beat, Partial<Record<TermCategory, number>>> = {
  context:       { Shots: 1.0, Composition: 0.6, Lighting: 0.4, Movement: 0.5 },
  subjectIntro:  { Shots: 0.9, Angles: 0.7, Composition: 0.6, Lighting: 0.5 },
  primaryAction: { Movement: 1.0, Shots: 0.8, Angles: 0.6, "Lens / Optics": 0.5 },
  detail:        { Shots: 0.9, "Lens / Optics": 0.9, Lighting: 0.6, Composition: 0.5 },
  reaction:      { Shots: 1.0, Angles: 0.6, Lighting: 0.6, Composition: 0.5 },
  payoff:        { Lighting: 0.9, Shots: 0.8, Angles: 0.7, Composition: 0.6 },
  transition:    { Editing: 1.0, "AI Workflow": 0.6, Movement: 0.5, Shots: 0.4 }
};

/** 0..1 score of how well a term fills a beat slot. */
function scoreTerm(term: Term, beat: Beat, preferred: string[]): number {
  // storyRole: category fit for the beat, plus a bonus for being on the
  //   coverage skeleton (preferred list).
  const categoryFit = STORY_ROLE_BY_BEAT[beat][term.category] ?? 0.2;
  const skeletonIndex = preferred.indexOf(term.name);
  const skeletonBonus = skeletonIndex === -1 ? 0 : 1 - skeletonIndex / Math.max(preferred.length, 1);
  const storyRole = Math.min(1, 0.5 * categoryFit + 0.5 * skeletonBonus);

  // infoGain: high-priority terms add more new information per shot. Use the
  //   normalized priorityScore (41..100 in the dataset) as the proxy.
  const infoGain = Math.max(0, Math.min(1, (term.priorityScore - 40) / 60));

  // emotion: lighting + close-up shots + reaction-tagged terms drive emotion.
  const emotionTags = ["emotion", "mood", "drama", "intimacy"];
  const hasEmotionTag = term.tags.some((t) => emotionTags.includes(t));
  const emotion = Math.min(
    1,
    (term.category === "Lighting" ? 0.6 : 0) +
      (/Close-Up|Reaction Shot/.test(term.name) ? 0.6 : 0) +
      (hasEmotionTag ? 0.3 : 0)
  );

  // editUtility: editing/coverage terms cut cleanly; coverage priority group
  //   is a strong proxy.
  const editUtility = Math.min(
    1,
    (term.priorityGroup === "Coverage and Edit Logic" ? 0.7 : 0) +
      (term.category === "Editing" ? 0.4 : 0) +
      (/Insert Shot|B-Roll|Cutaway|Master Shot/.test(term.name) ? 0.4 : 0)
  );

  // aiReliability: simple, well-defined shots generate more reliably from
  //   text-to-video models. Foundation/Core groups score highest, advanced
  //   movement and complex lighting score lower.
  const reliabilityBase: Record<string, number> = {
    Foundation: 1.0,
    "Core Visual Grammar": 0.85,
    "Coverage and Edit Logic": 0.75,
    "AI-Native Workflow": 0.7,
    "Advanced Look": 0.5
  };
  const aiReliability = Math.min(
    1,
    (reliabilityBase[term.priorityGroup] ?? 0.5) -
      (term.difficulty === "Advanced" ? 0.15 : 0) +
      (term.difficulty === "Beginner" ? 0.05 : 0)
  );

  // assetReuse: B-Roll, Cutaways, Inserts, Reference Image and Storyboard are
  //   reusable across multiple cuts.
  const assetReuse = /B-Roll|Cutaway|Insert Shot|Reference Image|Storyboard/.test(term.name)
    ? 1
    : term.priorityGroup === "Coverage and Edit Logic"
      ? 0.6
      : 0.3;

  // costInverse: cheaper-to-generate shots score higher. Beginner difficulty
  //   and 3s duration proxy cheaper renders.
  const costInverse =
    term.difficulty === "Beginner" ? 1 : term.difficulty === "Intermediate" ? 0.7 : 0.4;

  return (
    0.30 * storyRole +
    0.20 * infoGain +
    0.15 * emotion +
    0.10 * editUtility +
    0.10 * aiReliability +
    0.10 * assetReuse +
    0.05 * costInverse
  );
}

const beatOrder: Beat[] = [
  "context",
  "subjectIntro",
  "primaryAction",
  "detail",
  "reaction",
  "payoff",
  "transition"
];

const beatReason: Record<Beat, string> = {
  context: "Anchor the viewer in place and time.",
  subjectIntro: "Introduce the subject so the rest of the sequence has weight.",
  primaryAction: "Show the one main action that drives the story.",
  detail: "Reveal a detail that rewards attention.",
  reaction: "Hold on the emotional response so the action lands.",
  payoff: "Close on a payoff frame that earns the watch.",
  transition: "Give the editor a clean bridge to the next beat."
};

export function scoreCandidates(
  beat: Beat,
  type: SequenceType,
  pool: Term[] = getAllTerms()
): Array<{ term: Term; score: number }> {
  const preferred = beatSkeleton[type][beat] ?? [];
  return pool
    .map((term) => ({ term, score: scoreTerm(term, beat, preferred) }))
    .sort((a, b) => b.score - a.score);
}

export function buildShotSequenceV2(topic: string, opts: BuildShotSequenceV2Options = {}): ShotPlanV2 {
  const type = opts.type ?? classifyTopic(topic);
  const maxShots = opts.maxShots ?? 6;
  const beats = parseBeats(topic);
  const pool = getAllTerms();

  const activeBeats = beatOrder.filter((b) => beats[b]);

  const used = new Set<string>();
  const items: ShotPlanItemV2[] = [];
  let lastCategory: TermCategory | null = null;

  for (const beat of activeBeats) {
    if (items.length >= maxShots) break;

    const candidates = scoreCandidates(beat, type, pool).filter((c) => !used.has(c.term.id));

    let pick: Term | undefined;
    let pickScore = 0;
    for (const cand of candidates) {
      const t = cand.term;

      // Hard rule: first item must be an anchor (Establishing/Wide/Master).
      if (items.length === 0 && !ANCHOR_NAMES.has(t.name)) continue;

      // Hard rule: no two adjacent identical category items unless the term
      // itself is an editing concept (Editing or AI Workflow category).
      if (
        lastCategory === t.category &&
        !EDITING_CONCEPT_CATEGORIES.has(t.category)
      ) {
        continue;
      }

      pick = t;
      pickScore = cand.score;
      break;
    }

    // Fallback: if we couldn't satisfy hard rules with a fresh pick, take the
    // best remaining candidate. This still keeps the anchor rule on the first
    // shot — if there is no anchor candidate available, we pull one directly.
    if (!pick) {
      if (items.length === 0) {
        pick = pool.find((t) => ANCHOR_NAMES.has(t.name) && !used.has(t.id));
        pickScore = pick ? scoreTerm(pick, beat, beatSkeleton[type][beat] ?? []) : 0;
      } else if (candidates.length > 0) {
        pick = candidates[0].term;
        pickScore = candidates[0].score;
      }
    }

    if (!pick) continue;

    used.add(pick.id);
    lastCategory = pick.category;

    const duration = durationFor(pick);
    items.push({
      order: items.length + 1,
      term: pick.name,
      termId: pick.id,
      category: pick.category,
      priorityGroup: pick.priorityGroup,
      reason: beatReason[beat],
      prompt: buildPrompt(pick, topic, duration),
      duration,
      beat,
      score: Number(pickScore.toFixed(4))
    });
  }

  return { topic, type, beats, sequence: items };
}

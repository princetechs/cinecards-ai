// Quality-confidence scorer for AI render jobs.
//
// Heuristic-only. Inputs are pre-render (prompt + duration + mode + provider),
// so this can run BEFORE we burn credits on a low-confidence preview as well
// as AFTER a render to decide whether the result auto-publishes or routes to
// a human reviewer (`review.status = 'pending'`).
//
// Each rule subtracts a fixed penalty from a base of 1.0. The final score is
// clamped to [0, 1]. We return all reasons that fired so the maintainer queue
// can show "why" the card was flagged.
//
// Threshold lives in the worker (`REVIEW_THRESHOLD = 0.6`); this module is
// pure and threshold-agnostic.

export interface ScoreInput {
  prompt: string;
  durationSec: number;
  mode: 'text-to-video' | 'image-to-video';
  providerId: string;
}

export interface ScoreResult {
  score: number;
  reasons: string[];
}

// Per-provider max recommended duration (sec). Mirrors lib/providers
// capabilities; kept inline to avoid a runtime import (this file must be
// callable from plain Node + Astro).
const PROVIDER_MAX_DURATION: Record<string, number> = {
  runway: 5,
  pika: 5,
  stability: 4,
};

// A small allow-list of action verbs. We don't try to do real NLP; we count
// occurrences and treat 2+ as "multi-action".
const ACTION_VERBS = [
  'pan',
  'tilt',
  'zoom',
  'dolly',
  'track',
  'orbit',
  'crane',
  'jib',
  'whip',
  'push',
  'pull',
  'rotate',
  'cut',
  'reveal',
  'walk',
  'run',
  'jump',
  'turn',
];

const COMPLEX_MOTION = ['whip', 'orbit', 'crane', 'jib'];

function countVerbs(prompt: string): number {
  const lower = prompt.toLowerCase();
  let n = 0;
  for (const v of ACTION_VERBS) {
    // word-boundary match
    const re = new RegExp(`\\b${v}\\w*\\b`, 'g');
    const matches = lower.match(re);
    if (matches && matches.length > 0) n += 1;
  }
  return n;
}

export function scoreRender(input: ScoreInput): ScoreResult {
  const reasons: string[] = [];
  let score = 1.0;

  const lower = input.prompt.toLowerCase();

  // Multi-action prompts: explicit ", then" / " and then " connectors OR
  // 2+ distinct action verbs from the allowlist.
  const hasThen = /,\s*then\s/i.test(input.prompt) || /\sand\s+then\s/i.test(input.prompt);
  const verbCount = countVerbs(input.prompt);
  if (hasThen || verbCount >= 2) {
    score -= 0.25;
    reasons.push('multi-action prompt');
  }

  // Complex motion vocabulary
  if (COMPLEX_MOTION.some((w) => new RegExp(`\\b${w}\\w*\\b`, 'i').test(lower))) {
    score -= 0.10;
    reasons.push('complex motion');
  }

  // Duration over provider max
  const max = PROVIDER_MAX_DURATION[input.providerId];
  if (typeof max === 'number' && input.durationSec > max) {
    score -= 0.15;
    reasons.push(`duration ${input.durationSec}s exceeds ${input.providerId} max ${max}s`);
  }

  // Stability has no text-only mode (open SVD is image-to-video).
  if (input.providerId === 'stability' && input.mode === 'text-to-video') {
    score -= 0.30;
    reasons.push('text-to-video on stability (no native text control)');
  }

  // Long prompts blow past most providers' attention budget.
  if (input.prompt.length > 220) {
    score -= 0.10;
    reasons.push('prompt length > 220 chars');
  }

  if (score < 0) score = 0;
  if (score > 1) score = 1;
  // Round to 2dp for stable serialisation.
  score = Math.round(score * 100) / 100;

  return { score, reasons };
}

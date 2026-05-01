#!/usr/bin/env node
/**
 * Migrate data/terms.json to schema v2.
 *
 * Backfills:
 *   - review: { status: "approved" } if missing
 *   - assets: [] if missing
 *
 * Idempotent: running twice yields the same file. Writes with a stable
 * key order (v1 keys first, then v2 keys) and 2-space indentation.
 */

import { readFileSync, writeFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, resolve } from "node:path";

const __dirname = dirname(fileURLToPath(import.meta.url));
const TERMS_PATH = resolve(__dirname, "..", "data", "terms.json");

// Stable key order: v1 fields first, then v2 fields.
const KEY_ORDER = [
  "id",
  "name",
  "category",
  "priorityGroup",
  "priorityScore",
  "shortDefinition",
  "whyItMatters",
  "whenToUse",
  "humanShootHint",
  "aiPromptTemplate",
  "previewPrompt3s",
  "previewPrompt5s",
  "previewVideoUrl",
  "relatedTerms",
  "commonMistakes",
  "difficulty",
  "tags",
  // v2
  "aliases",
  "prerequisites",
  "providerSupport",
  "rights",
  "provenance",
  "qualityConfidence",
  "review",
  "community",
  "localisation",
  "assets",
];

function reorderKeys(term) {
  const out = {};
  for (const key of KEY_ORDER) {
    if (key in term) out[key] = term[key];
  }
  // Preserve any unknown keys at the end (defensive).
  for (const key of Object.keys(term)) {
    if (!(key in out)) out[key] = term[key];
  }
  return out;
}

function migrate(term) {
  const next = { ...term };
  let addedReview = false;
  let addedAssets = false;
  if (next.review == null) {
    next.review = { status: "approved" };
    addedReview = true;
  }
  if (next.assets == null) {
    next.assets = [];
    addedAssets = true;
  }
  return { term: reorderKeys(next), addedReview, addedAssets };
}

function main() {
  const raw = readFileSync(TERMS_PATH, "utf8");
  const terms = JSON.parse(raw);
  if (!Array.isArray(terms)) {
    throw new Error("data/terms.json must be a JSON array");
  }

  let reviewBackfilled = 0;
  let assetsBackfilled = 0;
  const migrated = terms.map((t) => {
    const { term, addedReview, addedAssets } = migrate(t);
    if (addedReview) reviewBackfilled++;
    if (addedAssets) assetsBackfilled++;
    return term;
  });

  const serialised = JSON.stringify(migrated, null, 2) + "\n";
  writeFileSync(TERMS_PATH, serialised, "utf8");

  console.log(
    `[migrate-terms-v2] terms=${migrated.length} review.backfilled=${reviewBackfilled} assets.backfilled=${assetsBackfilled}`,
  );
}

main();

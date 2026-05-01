// Runnable smoke tests for planner v2.
// Usage:
//   node --experimental-strip-types \
//     --import 'data:text/javascript,import{register}from"node:module";import{pathToFileURL}from"node:url";register("./scripts/ts-resolver.mjs",pathToFileURL("./"));' \
//     scripts/test-planner.mjs
//
// We import the .ts module directly via Node's experimental TypeScript
// loader (Node 22+) plus a tiny resolver hook that adds .ts extensions and
// JSON import attributes (see scripts/ts-resolver.mjs). No build step.
import assert from "node:assert/strict";

const planner = await import("../lib/planner.ts");
const { buildShotSequence, buildShotSequenceV2, parseBeats, scoreCandidates, classifyTopic } =
  planner;

const topics = [
  "Morning coffee routine in a sunlit cafe",
  "Product launch reveal of a new smartphone",
  "Tutorial: how to bake sourdough bread"
];

let failed = 0;
function check(name, fn) {
  try {
    fn();
    console.log("  ok  -", name);
  } catch (err) {
    failed += 1;
    console.error("  FAIL-", name, "\n      ", err.message);
  }
}

for (const topic of topics) {
  console.log(`\n# topic: ${topic}`);
  const v1 = buildShotSequence(topic);
  const v2 = buildShotSequenceV2(topic);

  check("v2 returns a non-empty sequence", () => {
    assert.ok(v2.sequence.length > 0, "expected at least one shot");
  });

  check("v2 first item is an anchor shot (Establishing/Wide/Master)", () => {
    const first = v2.sequence[0]?.term;
    assert.ok(
      ["Establishing Shot", "Wide Shot", "Master Shot"].includes(first ?? ""),
      `first shot was ${first}`
    );
  });

  check("v2 has no duplicate terms", () => {
    const ids = v2.sequence.map((i) => i.termId);
    assert.equal(new Set(ids).size, ids.length, "duplicate term ids found");
  });

  check("v2 obeys adjacent-category rule (or term is Editing/AI Workflow)", () => {
    for (let i = 1; i < v2.sequence.length; i += 1) {
      const prev = v2.sequence[i - 1];
      const cur = v2.sequence[i];
      if (prev.category === cur.category) {
        assert.ok(
          ["Editing", "AI Workflow"].includes(cur.category),
          `adjacent same category ${cur.category} at index ${i}`
        );
      }
    }
  });

  check("v2 every item has a beat label", () => {
    for (const item of v2.sequence) {
      assert.ok(typeof item.beat === "string" && item.beat.length > 0);
    }
  });

  check("v2 score is in 0..1", () => {
    for (const item of v2.sequence) {
      assert.ok(item.score >= 0 && item.score <= 1, `score out of range: ${item.score}`);
    }
  });

  check("v2 same classification as v1", () => {
    assert.equal(v2.type, v1.type);
  });

  check("scoreCandidates returns sorted scores", () => {
    const scored = scoreCandidates("primaryAction", v2.type);
    for (let i = 1; i < scored.length; i += 1) {
      assert.ok(scored[i - 1].score >= scored[i].score);
    }
  });

  check("parseBeats always sets context+subjectIntro+primaryAction+detail", () => {
    const b = parseBeats(topic);
    assert.ok(b.context && b.subjectIntro && b.primaryAction && b.detail);
  });

  check("v1 still works (regression)", () => {
    assert.ok(v1.sequence.length > 0);
    assert.equal(typeof classifyTopic(topic), "string");
  });
}

console.log("\n----------------------------------------");
if (failed > 0) {
  console.error(`${failed} assertion(s) failed`);
  process.exit(1);
}
console.log("all assertions passed");

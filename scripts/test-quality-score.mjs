// Unit-style assertions for lib/qualityScore.ts.
// Usage:
//   node --experimental-strip-types \
//     --import 'data:text/javascript,import{register}from"node:module";import{pathToFileURL}from"node:url";register("./scripts/ts-resolver.mjs",pathToFileURL("./"));' \
//     scripts/test-quality-score.mjs
//
// Wired up as `npm run test:quality` in the root package.json.
import assert from 'node:assert/strict';

const { scoreRender } = await import('../lib/qualityScore.ts');

let failures = 0;
function check(label, fn) {
  try {
    fn();
    console.log(`  ok  ${label}`);
  } catch (err) {
    failures += 1;
    console.error(`  FAIL ${label}`);
    console.error(err instanceof Error ? err.stack ?? err.message : String(err));
  }
}

console.log('quality score heuristics');

// 1. Multi-action prompt — uses ", then" connector
check('multi-action prompt (",  then" connector) penalised', () => {
  const r = scoreRender({
    prompt: 'Push in on the subject, then tilt up to the sky',
    durationSec: 5,
    mode: 'text-to-video',
    providerId: 'runway',
  });
  assert.ok(r.reasons.includes('multi-action prompt'), 'reason fired');
  assert.ok(r.score <= 0.75 + 1e-9, `score should be <=0.75, got ${r.score}`);
});

// 2. Complex motion (whip)
check('complex motion ("whip") penalised by -0.10', () => {
  const r = scoreRender({
    prompt: 'whip into the room',
    durationSec: 3,
    mode: 'text-to-video',
    providerId: 'runway',
  });
  assert.ok(r.reasons.includes('complex motion'));
  assert.equal(r.score, 0.9);
});

// 3. Duration over provider max (Stability max 4)
check('duration over provider max penalised', () => {
  const r = scoreRender({
    prompt: 'static product shot',
    durationSec: 5,
    mode: 'image-to-video',
    providerId: 'stability',
  });
  const reason = r.reasons.find((s) => s.startsWith('duration 5s exceeds stability'));
  assert.ok(reason, `expected duration reason, got ${r.reasons.join('; ')}`);
});

// 4. text-to-video on stability: -0.30
check('text-to-video on stability penalised by -0.30', () => {
  const r = scoreRender({
    prompt: 'a dog',
    durationSec: 3,
    mode: 'text-to-video',
    providerId: 'stability',
  });
  assert.ok(r.reasons.some((s) => s.includes('text-to-video on stability')));
  assert.equal(r.score, 0.7);
});

// 5. Long prompt > 220 chars
check('prompt length > 220 chars penalised by -0.10', () => {
  const long = 'a'.repeat(230);
  const r = scoreRender({
    prompt: long,
    durationSec: 3,
    mode: 'text-to-video',
    providerId: 'runway',
  });
  assert.ok(r.reasons.includes('prompt length > 220 chars'));
  assert.equal(r.score, 0.9);
});

if (failures > 0) {
  console.error(`\n${failures} test(s) failed`);
  process.exit(1);
}
console.log('\nall quality-score heuristics passed');

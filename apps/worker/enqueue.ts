// CLI: enqueue a render job from a JSON arg.
//   node --experimental-strip-types enqueue.ts '{"termId":"frame","providerId":"runway",...}'

import { enqueue } from './queue.ts';
import type { EnqueueInput } from './queue.ts';

const VALID_PROVIDERS = new Set(['runway', 'pika', 'stability', 'soraLegacy']);
const VALID_MODES = new Set(['text-to-video', 'image-to-video']);
const VALID_DURATIONS = new Set([3, 5]);

function fail(msg: string): never {
  console.error(`[enqueue] ${msg}`);
  process.exit(1);
}

function validate(input: unknown): EnqueueInput {
  if (!input || typeof input !== 'object') fail('payload must be a JSON object');
  const o = input as Record<string, unknown>;
  if (typeof o.termId !== 'string' || !o.termId) fail('termId (string) required');
  if (typeof o.providerId !== 'string' || !VALID_PROVIDERS.has(o.providerId))
    fail(`providerId must be one of ${[...VALID_PROVIDERS].join(', ')}`);
  if (typeof o.mode !== 'string' || !VALID_MODES.has(o.mode))
    fail(`mode must be one of ${[...VALID_MODES].join(', ')}`);
  if (typeof o.prompt !== 'string' || !o.prompt) fail('prompt (string) required');
  if (typeof o.durationSec !== 'number' || !VALID_DURATIONS.has(o.durationSec))
    fail('durationSec must be 3 or 5');
  return o as unknown as EnqueueInput;
}

async function main(): Promise<void> {
  const arg = process.argv[2];
  if (!arg) fail('usage: enqueue \'{"termId":"frame","providerId":"runway","mode":"text-to-video","prompt":"...","durationSec":3}\'');
  let parsed: unknown;
  try {
    parsed = JSON.parse(arg);
  } catch (err) {
    fail(`invalid JSON: ${err instanceof Error ? err.message : String(err)}`);
  }
  const input = validate(parsed);
  const job = await enqueue(input);
  console.log(`[enqueue] queued ${job.id} term=${job.termId} provider=${job.providerId}`);
}

main().catch((err) => {
  console.error('[enqueue] fatal:', err);
  process.exit(1);
});

// Render worker main loop.
//
// Scope: scaffolding only. Adapters at lib/providers/* are stubs and will
// throw "Not yet implemented" — the worker MUST handle this gracefully and
// dead-letter such jobs instead of crashing.
//
// NOTE (task 13 coordination): when a job succeeds we write a provenance
// document to content/provenance/<termId>-<jobId>.json. Task 13 owns the
// final on-disk schema (and C2PA sidecar). This worker keeps that file
// independent of data/terms.json so the term record stays small.

import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type { RenderRequest, VideoProvider, ProviderId } from '../../lib/providers/types.ts';
import { scoreRender } from '../../lib/qualityScore.ts';

// Quality-confidence threshold: renders scoring below this auto-route to
// the maintainer review queue (`review.status = 'pending'`); at-or-above
// auto-approve.
const REVIEW_THRESHOLD = 0.6;

// Lazy provider loader. The provider registry uses Astro's `import.meta.env`,
// which is undefined under plain Node. We import dynamically and surface any
// load- or construction-time error as a normal job failure (the same shape
// as the stub "Not yet implemented" errors). This keeps the worker robust
// regardless of which runtime the adapters target.
async function loadProvider(id: ProviderId): Promise<VideoProvider> {
  const mod = await import('../../lib/providers/index.ts');
  return mod.getProvider(id);
}

import {
  claimNext,
  complete,
  fail,
  list,
  listDeadLetter,
} from './queue.ts';
import { buildProvenance } from './provenance.ts';
import type { ProviderOutput } from './provenance.ts';
import type { RenderQueueJob } from './types.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = join(HERE, '..', '..');
const TERMS_PATH = join(REPO_ROOT, 'data', 'terms.json');
const PROVENANCE_DIR = join(REPO_ROOT, 'content', 'provenance');

const MAX_ATTEMPTS = 3;
const BACKOFF_MS = [1_000, 4_000, 16_000];

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

async function writeProvenanceFile(job: RenderQueueJob): Promise<string> {
  await mkdir(PROVENANCE_DIR, { recursive: true });
  const file = join(PROVENANCE_DIR, `${job.termId}-${job.id}.json`);
  await writeFile(file, JSON.stringify(job.result?.provenance, null, 2) + '\n', 'utf8');
  return file;
}

async function appendAssetToTerm(job: RenderQueueJob): Promise<void> {
  if (!job.result) return;
  const raw = await readFile(TERMS_PATH, 'utf8');
  const terms = JSON.parse(raw) as Array<Record<string, unknown>>;
  const term = terms.find((t) => t.id === job.termId);
  if (!term) {
    console.warn(`[worker] term '${job.termId}' not found in terms.json — skipping asset write`);
    return;
  }
  const assets = Array.isArray(term.assets) ? (term.assets as Array<Record<string, unknown>>) : [];
  assets.push({
    type: 'clip',
    url: job.result.videoUrl,
    hash: job.result.provenance.promptHash,
  });
  term.assets = assets;

  // Quality-confidence gate: score the render and either auto-approve or
  // route to the human review queue.
  const { score, reasons } = scoreRender({
    prompt: job.prompt,
    durationSec: job.durationSec,
    mode: job.mode,
    providerId: job.providerId,
  });
  term.qualityConfidence = score;
  const decidedStatus = score >= REVIEW_THRESHOLD ? 'approved' : 'pending';
  term.review = {
    status: decidedStatus,
    reviewer: decidedStatus === 'approved' ? 'auto' : undefined,
    reviewedAt: new Date().toISOString(),
  };
  console.log(
    `[worker] quality score=${score} status=${decidedStatus} reasons=[${reasons.join('; ')}] term=${job.termId}`,
  );

  await writeFile(TERMS_PATH, JSON.stringify(terms, null, 2) + '\n', 'utf8');
}

async function processJob(job: RenderQueueJob): Promise<void> {
  console.log(`[worker] processing ${job.id} (attempt ${job.attempts}/${MAX_ATTEMPTS}) provider=${job.providerId} term=${job.termId}`);
  try {
    const provider = await loadProvider(job.providerId);
    const req: RenderRequest = {
      termId: job.termId,
      mode: job.mode,
      prompt: job.prompt,
      durationSec: job.durationSec,
      referenceImageUrl: job.referenceImageUrl,
      aspectRatio: job.aspectRatio,
    };
    const renderJob = await provider.generate(req);

    const providerOutput: ProviderOutput = {
      videoUrl: renderJob.videoUrl ?? '',
      sourceAssetIds: job.referenceImageUrl ? [job.referenceImageUrl] : [],
    };
    const provenance = buildProvenance(job, providerOutput);
    const completed = await complete(job.id, {
      videoUrl: providerOutput.videoUrl,
      provenance,
    });
    if (completed) {
      await writeProvenanceFile(completed);
      await appendAssetToTerm(completed);
      console.log(`[worker] succeeded ${job.id} -> ${providerOutput.videoUrl}`);
    }
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const terminal = job.attempts >= MAX_ATTEMPTS;
    console.warn(`[worker] failed ${job.id} attempt=${job.attempts} terminal=${terminal} error="${message}"`);
    await fail(job.id, message, { terminal });
    if (!terminal) {
      const wait = BACKOFF_MS[Math.min(job.attempts - 1, BACKOFF_MS.length - 1)] ?? 1000;
      console.log(`[worker] backing off ${wait}ms before next claim of ${job.id}`);
      await delay(wait);
    }
  }
}

export interface RunOptions {
  // when true, exit after the queue is drained (useful for smoke tests / cron)
  drain?: boolean;
  // poll interval when idle
  idleMs?: number;
  // max iterations (safety net for tests). Infinity by default.
  maxIterations?: number;
}

export async function run(options: RunOptions = {}): Promise<void> {
  const { drain = false, idleMs = 1_000, maxIterations = Infinity } = options;
  let i = 0;
  while (i < maxIterations) {
    const job = await claimNext();
    if (!job) {
      if (drain) break;
      await delay(idleMs);
      i += 1;
      continue;
    }
    await processJob(job);
    i += 1;
  }
}

async function main(): Promise<void> {
  const args = new Set(process.argv.slice(2));
  const drain = args.has('--drain');
  console.log(`[worker] starting (drain=${drain})`);
  await run({ drain });
  if (drain) {
    const remaining = await list();
    const dead = await listDeadLetter();
    console.log(`[worker] drained. queue=${remaining.length} dead-letter=${dead.length}`);
  }
}

const isMain = import.meta.url === `file://${process.argv[1]}`;
if (isMain) {
  main().catch((err) => {
    console.error('[worker] fatal:', err);
    process.exit(1);
  });
}

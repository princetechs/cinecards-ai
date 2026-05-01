// File-backed queue. Atomic via tmp-file + rename. Intentionally simple —
// the production version (task 24+) will swap in BullMQ/Redis behind the
// same surface.

import { randomUUID } from 'node:crypto';
import { existsSync } from 'node:fs';
import { mkdir, readFile, rename, writeFile } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

import type {
  DeadLetterFile,
  QueueFile,
  RenderJobStatus,
  RenderQueueJob,
} from './types.ts';

const HERE = dirname(fileURLToPath(import.meta.url));
export const QUEUE_PATH = join(HERE, 'queue.json');
export const DEAD_LETTER_PATH = join(HERE, 'dead-letter.json');

async function readJson<T>(path: string, fallback: T): Promise<T> {
  if (!existsSync(path)) return fallback;
  const raw = await readFile(path, 'utf8');
  if (!raw.trim()) return fallback;
  return JSON.parse(raw) as T;
}

async function writeJsonAtomic(path: string, value: unknown): Promise<void> {
  await mkdir(dirname(path), { recursive: true });
  const tmp = `${path}.${process.pid}.${Date.now()}.tmp`;
  await writeFile(tmp, JSON.stringify(value, null, 2) + '\n', 'utf8');
  await rename(tmp, path);
}

async function loadQueue(): Promise<QueueFile> {
  return readJson<QueueFile>(QUEUE_PATH, { jobs: [] });
}

async function saveQueue(file: QueueFile): Promise<void> {
  await writeJsonAtomic(QUEUE_PATH, file);
}

async function loadDeadLetter(): Promise<DeadLetterFile> {
  return readJson<DeadLetterFile>(DEAD_LETTER_PATH, { jobs: [] });
}

async function saveDeadLetter(file: DeadLetterFile): Promise<void> {
  await writeJsonAtomic(DEAD_LETTER_PATH, file);
}

export type EnqueueInput = Omit<
  RenderQueueJob,
  'id' | 'status' | 'enqueuedAt' | 'attempts'
> & {
  id?: string;
};

export async function enqueue(input: EnqueueInput): Promise<RenderQueueJob> {
  const job: RenderQueueJob = {
    id: input.id ?? randomUUID(),
    termId: input.termId,
    providerId: input.providerId,
    mode: input.mode,
    prompt: input.prompt,
    durationSec: input.durationSec,
    referenceImageUrl: input.referenceImageUrl,
    aspectRatio: input.aspectRatio,
    seed: input.seed,
    status: 'queued',
    enqueuedAt: new Date().toISOString(),
    attempts: 0,
  };
  const file = await loadQueue();
  file.jobs.push(job);
  await saveQueue(file);
  return job;
}

export async function claimNext(): Promise<RenderQueueJob | null> {
  const file = await loadQueue();
  const job = file.jobs.find((j) => j.status === 'queued');
  if (!job) return null;
  job.status = 'running';
  job.startedAt = new Date().toISOString();
  job.attempts += 1;
  await saveQueue(file);
  return job;
}

export async function complete(
  jobId: string,
  result: RenderQueueJob['result'],
): Promise<RenderQueueJob | null> {
  const file = await loadQueue();
  const job = file.jobs.find((j) => j.id === jobId);
  if (!job) return null;
  job.status = 'succeeded';
  job.result = result;
  job.finishedAt = new Date().toISOString();
  job.error = undefined;
  await saveQueue(file);
  return job;
}

export interface FailOptions {
  // when true, the worker has decided this is terminal (max attempts reached
  // or a non-retryable error). The queue entry is moved to dead-letter.
  terminal?: boolean;
}

export async function fail(
  jobId: string,
  error: string,
  options: FailOptions = {},
): Promise<RenderQueueJob | null> {
  const file = await loadQueue();
  const idx = file.jobs.findIndex((j) => j.id === jobId);
  if (idx === -1) return null;
  const job = file.jobs[idx]!;
  job.error = error;
  job.finishedAt = new Date().toISOString();
  if (options.terminal) {
    job.status = 'failed';
    // move to dead letter
    file.jobs.splice(idx, 1);
    await saveQueue(file);
    const dl = await loadDeadLetter();
    dl.jobs.push(job);
    await saveDeadLetter(dl);
  } else {
    // requeue for another attempt
    job.status = 'queued';
    await saveQueue(file);
  }
  return job;
}

export async function list(status?: RenderJobStatus): Promise<RenderQueueJob[]> {
  const file = await loadQueue();
  if (!status) return file.jobs;
  return file.jobs.filter((j) => j.status === status);
}

export async function listDeadLetter(): Promise<RenderQueueJob[]> {
  const dl = await loadDeadLetter();
  return dl.jobs;
}

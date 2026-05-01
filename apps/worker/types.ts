// Render worker job & queue types (task 12 scaffolding).
// Mirrors lib/providers/types.ts where applicable, but adds queue lifecycle
// fields. The ProvenanceRecord type is canonical in lib/provenance.ts and
// re-exported here so the rest of the worker keeps importing from one place.

import type {
  ProviderId,
  RenderAspectRatio,
  RenderDuration,
  RenderMode,
} from '../../lib/providers/types.ts';

export type { ProvenanceRecord } from '../../lib/provenance.ts';
import type { ProvenanceRecord } from '../../lib/provenance.ts';

export type RenderJobStatus =
  | 'queued'
  | 'running'
  | 'succeeded'
  | 'failed';

export interface RenderQueueJobResult {
  videoUrl: string;
  provenance: ProvenanceRecord;
}

export interface RenderQueueJob {
  id: string;
  termId: string;
  providerId: ProviderId;
  mode: RenderMode;
  prompt: string;
  durationSec: RenderDuration;
  referenceImageUrl?: string;
  aspectRatio?: RenderAspectRatio;
  status: RenderJobStatus;
  enqueuedAt: string;
  startedAt?: string;
  finishedAt?: string;
  result?: RenderQueueJobResult;
  error?: string;
  attempts: number;
  // optional seed used for promptHash + (in future) determinism
  seed?: string;
}

export interface QueueFile {
  jobs: RenderQueueJob[];
}

export interface DeadLetterFile {
  jobs: RenderQueueJob[];
}

// Provenance helper. Builds the ProvenanceRecord written next to a successful
// render. The ProvenanceRecord type lives in lib/provenance.ts (single source
// of truth, also consumed by the Astro pages); this file owns the hash +
// skeleton-builder.

import { createHash } from 'node:crypto';

import type { ProvenanceRecord } from '../../lib/provenance.ts';
import type { RenderQueueJob } from './types.ts';

export interface ProviderOutput {
  videoUrl: string;
  modelVersion?: string;
  c2pa?: string;
  sourceAssetIds?: string[];
}

export function hashPrompt(prompt: string, seed?: string): string {
  return createHash('sha256')
    .update(prompt)
    .update('|seed=')
    .update(seed ?? '')
    .digest('hex');
}

export function buildProvenance(
  job: RenderQueueJob,
  providerOutput: ProviderOutput,
): ProvenanceRecord {
  return {
    provider: job.providerId,
    modelVersion: providerOutput.modelVersion,
    promptHash: hashPrompt(job.prompt, job.seed),
    sourceAssetIds: providerOutput.sourceAssetIds ?? [],
    renderDate: new Date().toISOString(),
    c2pa: providerOutput.c2pa,
  };
}

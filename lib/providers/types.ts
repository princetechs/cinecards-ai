// Provider adapter shared types for the CineCards AI render layer.
// The render worker (task 12) consumes this surface; adapters here are stubs.

export type ProviderId = 'runway' | 'pika' | 'stability' | 'soraLegacy';

export type RenderMode = 'text-to-video' | 'image-to-video';

export type RenderDuration = 3 | 5;

export type RenderAspectRatio = '16:9' | '9:16' | '1:1';

export interface RenderRequest {
  termId: string;
  mode: RenderMode;
  prompt: string;
  durationSec: RenderDuration;
  referenceImageUrl?: string;
  aspectRatio?: RenderAspectRatio;
}

export interface RenderJob {
  id: string;
  provider: string;
  status: 'queued' | 'running' | 'succeeded' | 'failed';
  videoUrl?: string;
  createdAt: string;
  error?: string;
}

export type RenderJobStatus = RenderJob;

export interface ProviderCapabilities {
  modes: Array<RenderMode>;
  durationsSec: number[];
  maxActions: number;
  aspectRatios: string[];
  notes?: string;
}

export interface VideoProvider {
  id: ProviderId;
  capabilities: ProviderCapabilities;
  generate(req: RenderRequest): Promise<RenderJob>;
  status(jobId: string): Promise<RenderJobStatus>;
  cancel(jobId: string): Promise<void>;
}

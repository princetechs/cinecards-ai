import type {
  ProviderCapabilities,
  RenderJob,
  RenderJobStatus,
  RenderRequest,
  VideoProvider,
} from './types';

const DEPRECATION_MESSAGE =
  'Sora API deprecated; shutdown 2026-09. Adapter retained for legacy data only.';

export class SoraLegacyProvider implements VideoProvider {
  readonly id = 'soraLegacy' as const;

  readonly capabilities: ProviderCapabilities = {
    modes: ['text-to-video', 'image-to-video'],
    durationsSec: [3, 5],
    maxActions: 1,
    aspectRatios: ['16:9', '9:16', '1:1'],
    notes: `LEGACY. ${DEPRECATION_MESSAGE}`,
  };

  async generate(_req: RenderRequest): Promise<RenderJob> {
    throw new Error(DEPRECATION_MESSAGE);
  }

  async status(_jobId: string): Promise<RenderJobStatus> {
    throw new Error(DEPRECATION_MESSAGE);
  }

  async cancel(_jobId: string): Promise<void> {
    throw new Error(DEPRECATION_MESSAGE);
  }
}

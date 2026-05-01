import type {
  ProviderCapabilities,
  RenderJob,
  RenderJobStatus,
  RenderRequest,
  VideoProvider,
} from './types';

export class StabilityProvider implements VideoProvider {
  readonly id = 'stability' as const;

  readonly capabilities: ProviderCapabilities = {
    modes: ['image-to-video'],
    durationsSec: [2, 3, 4],
    maxActions: 1,
    aspectRatios: ['16:9', '1:1'],
    notes:
      'Stable Video Diffusion (self-hosted path). Image-to-video only — SVD has no text-prompt control over motion.',
  };

  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = import.meta.env.STABILITY_API_KEY as string | undefined;
  }

  async generate(_req: RenderRequest): Promise<RenderJob> {
    if (!this.apiKey) {
      throw new Error('STABILITY_API_KEY is not configured');
    }
    throw new Error('Not yet implemented: stability generate');
  }

  async status(_jobId: string): Promise<RenderJobStatus> {
    throw new Error('Not yet implemented: stability status');
  }

  async cancel(_jobId: string): Promise<void> {
    throw new Error('Not yet implemented: stability cancel');
  }
}

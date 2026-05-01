import type {
  ProviderCapabilities,
  RenderJob,
  RenderJobStatus,
  RenderRequest,
  VideoProvider,
} from './types';

export class RunwayProvider implements VideoProvider {
  readonly id = 'runway' as const;

  readonly capabilities: ProviderCapabilities = {
    modes: ['text-to-video', 'image-to-video'],
    durationsSec: [3, 5, 10],
    maxActions: 1,
    aspectRatios: ['16:9', '9:16', '1:1'],
    notes:
      'Primary provider. For image-to-video, the reference image defines composition; the prompt should focus on motion only.',
  };

  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = import.meta.env.RUNWAY_API_KEY as string | undefined;
  }

  async generate(_req: RenderRequest): Promise<RenderJob> {
    if (!this.apiKey) {
      throw new Error('RUNWAY_API_KEY is not configured');
    }
    throw new Error('Not yet implemented: runway generate');
  }

  async status(_jobId: string): Promise<RenderJobStatus> {
    throw new Error('Not yet implemented: runway status');
  }

  async cancel(_jobId: string): Promise<void> {
    throw new Error('Not yet implemented: runway cancel');
  }
}

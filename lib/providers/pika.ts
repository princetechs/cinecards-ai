import type {
  ProviderCapabilities,
  RenderJob,
  RenderJobStatus,
  RenderRequest,
  VideoProvider,
} from './types';

export class PikaProvider implements VideoProvider {
  readonly id = 'pika' as const;

  readonly capabilities: ProviderCapabilities = {
    modes: ['text-to-video', 'image-to-video'],
    durationsSec: [3, 5],
    maxActions: 1,
    aspectRatios: ['16:9', '9:16'],
    notes: 'Routes through Fal AI. Optional secondary provider.',
  };

  private readonly apiKey: string | undefined;

  constructor() {
    this.apiKey = import.meta.env.PIKA_API_KEY as string | undefined;
  }

  async generate(_req: RenderRequest): Promise<RenderJob> {
    if (!this.apiKey) {
      throw new Error('PIKA_API_KEY is not configured');
    }
    throw new Error('Not yet implemented: pika generate');
  }

  async status(_jobId: string): Promise<RenderJobStatus> {
    throw new Error('Not yet implemented: pika status');
  }

  async cancel(_jobId: string): Promise<void> {
    throw new Error('Not yet implemented: pika cancel');
  }
}

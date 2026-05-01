import { PikaProvider } from './pika';
import { RunwayProvider } from './runway';
import { SoraLegacyProvider } from './sora';
import { StabilityProvider } from './stability';
import type { ProviderId, VideoProvider } from './types';

export * from './types';

const registry: Record<ProviderId, VideoProvider> = {
  runway: new RunwayProvider(),
  pika: new PikaProvider(),
  stability: new StabilityProvider(),
  soraLegacy: new SoraLegacyProvider(),
};

export function getProvider(id: ProviderId): VideoProvider {
  const provider = registry[id];
  if (!provider) {
    throw new Error(`Unknown provider id: ${id}`);
  }
  return provider;
}

export function listProviders(): VideoProvider[] {
  return Object.values(registry);
}

export interface PromptPackItem {
  termId: string;
  promptOverride: string | null;
  durationSec: number;
}

export interface PromptPack {
  id: string;
  name: string;
  useCase: string;
  items: PromptPackItem[];
  notes: string;
}

export interface SavedPackItem {
  termId: string;
  termName: string;
  prompt: string;
  durationSec: number;
}

export interface SavedPack {
  id: string;
  name: string;
  topic: string;
  savedAt: string;
  items: SavedPackItem[];
}

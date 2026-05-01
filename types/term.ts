export type TermCategory =
  | "Shots"
  | "Angles"
  | "Movement"
  | "Lighting"
  | "Composition"
  | "Editing"
  | "Lens / Optics"
  | "AI Workflow";

export type PriorityGroup =
  | "Foundation"
  | "Core Visual Grammar"
  | "Coverage and Edit Logic"
  | "Advanced Look"
  | "AI-Native Workflow";

export type Difficulty = "Beginner" | "Intermediate" | "Advanced";

export type ProviderSupportLevel = "full" | "partial" | "none";

export interface ProviderSupport {
  runway?: ProviderSupportLevel;
  pika?: ProviderSupportLevel;
  stability?: ProviderSupportLevel;
  soraLegacy?: ProviderSupportLevel;
}

export interface TermRights {
  licence: string;
  holder?: string;
  attribution?: string;
  consentFlags?: string[];
  derivativeOf?: string;
}

export interface TermProvenance {
  provider: string;
  modelVersion?: string;
  promptHash?: string;
  sourceAssetIds?: string[];
  renderDate?: string;
  c2pa?: string;
}

export type ReviewStatus = "draft" | "pending" | "approved" | "deprecated";

export interface TermReview {
  status: ReviewStatus;
  reviewer?: string;
  reviewedAt?: string;
}

export interface TermCommunity {
  upvotes?: number;
  bookmarks?: number;
  remixCount?: number;
  completionCount?: number;
}

export interface TermLocalisationEntry {
  name?: string;
  shortDefinition?: string;
  whyItMatters?: string;
}

export type TermAssetType = "image" | "clip" | "thumbnail" | "diagram";

export interface TermAsset {
  type: TermAssetType;
  url: string;
  hash?: string;
  rights?: Record<string, unknown>;
}

export interface Term {
  id: string;
  name: string;
  category: TermCategory;
  priorityGroup: PriorityGroup;
  priorityScore: number;
  shortDefinition: string;
  whyItMatters: string;
  whenToUse: string[];
  humanShootHint: string;
  aiPromptTemplate: string;
  previewPrompt3s: string;
  previewPrompt5s: string;
  previewVideoUrl: string | null;
  relatedTerms: string[];
  commonMistakes: string[];
  difficulty: Difficulty;
  tags: string[];
  // v2 (all optional — backwards compatible with the original 124 cards)
  aliases?: string[];
  prerequisites?: string[];
  providerSupport?: ProviderSupport;
  rights?: TermRights;
  provenance?: TermProvenance;
  qualityConfidence?: number;
  review?: TermReview;
  community?: TermCommunity;
  localisation?: Record<string, TermLocalisationEntry>;
  assets?: TermAsset[];
}

export interface ShotPlanItem {
  order: number;
  term: string;
  termId: string;
  category: TermCategory;
  priorityGroup: PriorityGroup;
  reason: string;
  prompt: string;
  duration: "3s" | "5s";
}

export type SequenceType =
  | "product"
  | "travel"
  | "dialogue"
  | "tutorial"
  | "cinematic"
  | "lifestyle"
  | "narrative";

export interface ShotPlan {
  topic: string;
  type: SequenceType;
  sequence: ShotPlanItem[];
}

// Canonical provenance contract for CineCards AI.
//
// One source of truth for the ProvenanceRecord shape. The render worker
// (apps/worker/provenance.ts) imports this type so the on-disk JSON written
// to content/provenance/<termId>-<jobId>.json matches what the Astro pages
// read back at build time.
//
// Records are immutable: a re-render produces a new file, never an in-place
// edit. See content/provenance/README.md for the file naming scheme.

import { readdir, readFile } from "node:fs/promises";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

// Resolve the provenance directory relative to this source file when running
// directly under tsx/Node, but fall back to process.cwd() under bundlers
// (Astro/Vite rewrite import.meta.url to a path inside .astro/* during the
// build). The repo root is two levels up from lib/ in the source tree.
function resolveProvenanceDir(): string {
  try {
    const here = dirname(fileURLToPath(import.meta.url));
    // Source layout: <repo>/lib/provenance.ts
    if (here.endsWith(`${"/"}lib`)) {
      return join(here, "..", "content", "provenance");
    }
  } catch {
    /* fall through */
  }
  return join(process.cwd(), "content", "provenance");
}

export interface ProvenanceRecord {
  provider: string;
  modelVersion?: string;
  promptHash: string;
  sourceAssetIds: string[];
  renderDate: string;
  c2pa?: string;
}

const PROVENANCE_DIR = resolveProvenanceDir();

/**
 * Read every provenance sidecar for a given term.
 *
 * Files are named `<termId>-<jobId>.json` and live in content/provenance/.
 * Returns an empty array if the directory is missing or has no matches —
 * provenance is optional and a term without renders is still valid.
 *
 * Intended to be called from Astro page frontmatter (build time), not from
 * client-side scripts: it touches the filesystem.
 */
export async function loadProvenance(termId: string): Promise<ProvenanceRecord[]> {
  let entries: string[];
  try {
    entries = await readdir(PROVENANCE_DIR);
  } catch {
    return [];
  }
  const prefix = `${termId}-`;
  const matches = entries.filter((name) => name.startsWith(prefix) && name.endsWith(".json"));
  const records: ProvenanceRecord[] = [];
  for (const name of matches) {
    try {
      const raw = await readFile(join(PROVENANCE_DIR, name), "utf8");
      const parsed = JSON.parse(raw) as ProvenanceRecord;
      if (parsed && typeof parsed.provider === "string" && typeof parsed.promptHash === "string") {
        records.push(parsed);
      }
    } catch {
      // skip unreadable / malformed files; they are not load-bearing
    }
  }
  // Stable order: oldest renders first.
  records.sort((a, b) => (a.renderDate ?? "").localeCompare(b.renderDate ?? ""));
  return records;
}

export interface RightsSummary {
  providerOwnership: string;
  copyrightStatus: string;
}

const COPYRIGHT_DEFAULT =
  "Copyright protection is uncertain for purely AI-generated material under current US Copyright Office guidance (2025). Add meaningful human selection or modification to strengthen any claim.";

const PROVIDER_OWNERSHIP: Record<string, string> = {
  runway: "Per Runway's terms, you retain ownership of the generated clip.",
  pika: "Per Pika's terms, you retain ownership of the generated clip.",
  stability: "Per Stability AI's terms, you retain ownership of the generated clip.",
  "sora-legacy":
    "Per OpenAI's Sora terms, you retain ownership of the generated clip subject to the platform's usage policy.",
};

/**
 * Plain-English summary of the rights posture for a given provider.
 *
 * Returns two SEPARATE strings: provider-granted ownership of the output, and
 * the (distinct) question of whether US copyright actually attaches to a
 * purely AI-generated clip. Per the deep-research report and US Copyright
 * Office 2025 guidance, those two questions must not be collapsed.
 */
export function summariseRights(provider: string): RightsSummary {
  const key = provider.toLowerCase();
  const providerOwnership =
    PROVIDER_OWNERSHIP[key] ??
    `Per ${provider}'s terms, you typically retain ownership of the generated clip — verify against the provider's current terms of service.`;
  return {
    providerOwnership,
    copyrightStatus: COPYRIGHT_DEFAULT,
  };
}

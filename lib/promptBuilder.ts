import type { Term } from "../types/term";
import { getTermByName } from "./termSearch";

const durationText = (duration: "3s" | "5s" | string) => duration === "3s" ? "3 seconds" : "5 seconds";

export function buildPrompt(termInput: Term | string, topic: string, duration: "3s" | "5s" = "5s"): string {
  const term = typeof termInput === "string" ? getTermByName(termInput) : termInput;
  const subject = topic.trim() || "[subject]";
  const promptDuration = durationText(duration);

  if (!term) {
    return `cinematic shot of ${subject}, clear subject, one action, natural light, ${promptDuration}`;
  }

  return term.aiPromptTemplate
    .replaceAll("[subject]", subject)
    .replaceAll("[topic]", subject)
    .replaceAll("[duration]", promptDuration);
}

export function buildPreviewPrompt(term: Term, topic: string, duration: "3s" | "5s" = "3s"): string {
  const subject = topic.trim() || "[subject]";
  const template = duration === "3s" ? term.previewPrompt3s : term.previewPrompt5s;

  return template
    .replaceAll("[subject]", subject)
    .replaceAll("[topic]", subject)
    .replaceAll("[duration]", durationText(duration));
}

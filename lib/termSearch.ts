import termsData from "../data/terms.json";
import type { Term, TermCategory } from "../types/term";

export const terms = (termsData as Term[]).sort((a, b) => b.priorityScore - a.priorityScore);

const normalize = (value: string) => value.toLowerCase().replace(/[^a-z0-9]+/g, " ").trim();

export function getAllTerms(): Term[] {
  return terms;
}

export function getTermByName(name: string): Term | undefined {
  const target = normalize(name);
  return terms.find((term) => normalize(term.name) === target || normalize(term.id) === target);
}

export function getTermById(id: string): Term | undefined {
  return terms.find((term) => term.id === id);
}

export function getTermsByCategory(category: TermCategory | string): Term[] {
  return terms.filter((term) => term.category === category);
}

export function searchTerms(query: string): Term[] {
  const q = normalize(query);
  if (!q) return terms;

  return terms
    .map((term) => {
      const haystack = normalize([
        term.name,
        term.category,
        term.priorityGroup,
        term.shortDefinition,
        term.whyItMatters,
        term.humanShootHint,
        term.aiPromptTemplate,
        term.tags.join(" "),
        term.relatedTerms.join(" ")
      ].join(" "));

      const exactName = normalize(term.name).includes(q) ? 3 : 0;
      const tagMatch = normalize(term.tags.join(" ")).includes(q) ? 2 : 0;
      const textMatch = haystack.includes(q) ? 1 : 0;

      return { term, score: exactName + tagMatch + textMatch };
    })
    .filter((result) => result.score > 0)
    .sort((a, b) => b.score - a.score || b.term.priorityScore - a.term.priorityScore)
    .map((result) => result.term);
}

export function getRelatedTerms(termId: string): Term[] {
  const term = getTermById(termId);
  if (!term) return [];

  return term.relatedTerms
    .map((relatedName) => getTermByName(relatedName))
    .filter((related): related is Term => Boolean(related));
}

export function getFilterOptions() {
  return {
    categories: Array.from(new Set(terms.map((term) => term.category))).sort(),
    priorityGroups: Array.from(new Set(terms.map((term) => term.priorityGroup))),
    difficulties: Array.from(new Set(terms.map((term) => term.difficulty))).sort()
  };
}

import type { Term } from "../../types/term";
import en from "./messages/en.json";
import es from "./messages/es.json";
import hi from "./messages/hi.json";

export type Locale = "en" | "es" | "hi";
export const LOCALES: Locale[] = ["en", "es", "hi"];
export const DEFAULT_LOCALE: Locale = "en";

const messages: Record<Locale, Record<string, unknown>> = {
  en: en as Record<string, unknown>,
  es: es as Record<string, unknown>,
  hi: hi as Record<string, unknown>
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (LOCALES as string[]).includes(value);
}

/**
 * Returns a copy of the term with name/shortDefinition/whyItMatters overridden
 * by the localisation for `locale` if present. Falls back to the source (en)
 * fields when a translation is missing.
 */
export function getLocalisedTerm(term: Term, locale: Locale): Term {
  if (locale === DEFAULT_LOCALE) return term;
  const entry = term.localisation?.[locale];
  if (!entry) return term;
  return {
    ...term,
    name: entry.name ?? term.name,
    shortDefinition: entry.shortDefinition ?? term.shortDefinition,
    whyItMatters: entry.whyItMatters ?? term.whyItMatters
  };
}

type DeepRecord = { [k: string]: unknown };

function deepMerge<T extends DeepRecord>(base: T, override: DeepRecord): T {
  const out: DeepRecord = { ...base };
  for (const key of Object.keys(override)) {
    const a = out[key];
    const b = override[key];
    if (
      a &&
      b &&
      typeof a === "object" &&
      typeof b === "object" &&
      !Array.isArray(a) &&
      !Array.isArray(b)
    ) {
      out[key] = deepMerge(a as DeepRecord, b as DeepRecord);
    } else if (b !== undefined) {
      out[key] = b;
    }
  }
  return out as T;
}

/**
 * UI strings for `locale`, with missing keys backfilled from English.
 */
export function getUiStrings(locale: Locale): typeof en {
  if (locale === DEFAULT_LOCALE) return en;
  const override = messages[locale] ?? {};
  return deepMerge(en as unknown as DeepRecord, override as DeepRecord) as unknown as typeof en;
}

/**
 * Build a URL path for `locale` from a base path that omits the locale prefix.
 * `/glossary` -> `/glossary` (en) or `/es/glossary` (es).
 */
export function localisedPath(path: string, locale: Locale): string {
  const clean = path.startsWith("/") ? path : `/${path}`;
  if (locale === DEFAULT_LOCALE) return clean;
  return `/${locale}${clean === "/" ? "" : clean}`;
}

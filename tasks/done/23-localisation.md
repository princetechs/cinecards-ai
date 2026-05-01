# 23 — Localisation

**Status:** ✅ Done (PARTIAL — only 3 sample term translations)

## What shipped

- `src/i18n/index.ts` exports `Locale`, `LOCALES`, `DEFAULT_LOCALE`, `getLocalisedTerm`, `getUiStrings`, `localisedPath`.
- UI message bundles in `src/i18n/messages/{en,es,hi}.json` (en is the source; missing keys in es/hi backfill from en).
- Localised dynamic routes via `getStaticPaths`: `/[lang]/glossary`, `/[lang]/glossary/[slug]`, `/[lang]/planner` (en stays at the original un-prefixed paths).
- `BaseLayout` accepts a `lang` prop and sets `<html lang>` accordingly.
- Locale toggle (EN/ES/HI) in `components/Header.astro` with vanilla JS path-rewriting.
- 3 Foundation terms translated (Establishing Shot, Wide Shot, Close-Up) into `es` and `hi`.
- README "Localisation" section explains how to add a locale and per-term translation.

Build went from ~131 to **382 pages**. The remaining 121 terms still fall back to English — bulk content translation is left to follow-up.

## Goal
Make terms translatable without forking the catalogue.

## Build
- `localisation` field on term cards (added in task 10)
- `src/i18n/` with locale loaders
- Locale toggle in Header; default `en`
- Astro routes: `/[lang]/glossary`, `/[lang]/planner`

## Acceptance
- Adding a new locale = dropping a JSON patch file; no code change required

## Depends on
10.

# CineCards AI Blog Writing Rules

Use this checklist before creating or publishing any blog post in `src/content/blog/`.

## Goal

Every CineCards AI blog post should help beginners make better videos with clear film language, practical AI video prompts, and links back into the product.

## Required Frontmatter

Each post must use the Astro Content Collection fields from `src/content/config.ts`:

- `title`: clear, search-friendly, and specific.
- `description`: 140-160 characters when possible; explain the reader outcome.
- `publishedAt`: ISO-style date, for example `2026-05-13`.
- `author`: usually `CineCards AI`.
- `category`: one of `shots`, `lighting`, `movement`, `editing`, `ai-prompting`.
- `tags`: 4-8 plain-language tags people search for.
- `difficulty`: `beginner`, `intermediate`, or `advanced`.
- `readingTime`: realistic minutes to read.
- `relatedTerms`: valid term IDs from `data/terms.json`.
- `featured`: only use `true` when the post should compete for homepage/blog prominence.
- `draft`: only use `true` for unfinished work.

## SEO Criteria

- Put the main keyword in the title, first paragraph, and at least one H2.
- Use a simple URL slug that matches the main search intent.
- Write a meta description that promises a concrete result.
- Use short H2s that answer searchable questions.
- Add internal links to:
  - `/planner`
  - `/glossary`
  - at least 2 glossary term pages
  - at least 1 related blog post
- Avoid keyword stuffing. Repeat terms naturally.
- Keep paragraphs short: usually 1-3 sentences.
- Include practical examples, prompts, tables, or steps.

## LLM-Readiness Criteria

Large language models should be able to extract the answer without guessing:

- Define the topic in the first 2 paragraphs.
- Include a concise step-by-step workflow.
- Use tables for comparisons.
- Use explicit examples with copyable prompt blocks.
- Name common mistakes and how to fix them.
- Avoid vague claims like "best", "amazing", or "revolutionary" unless explained.
- Prefer stable educational guidance over newsy model claims.

## CineCards Content Voice

- Beginner-friendly, practical, and direct.
- Explain film terms with plain language first, then the technical term.
- Show how the idea applies to both human filming and AI video prompting.
- Use `[subject]` and `[duration]` placeholders when writing reusable prompt templates.
- Keep examples concrete: coffee shop, product demo, travel scene, tutorial, dialogue, creator reel.
- Do not overpromise AI video consistency. Mention constraints when helpful.

## Validation Checklist

Before finishing blog work, run:

```bash
npm run check
npm run build
```

Also run this quick manual review:

- Frontmatter matches `src/content/config.ts`.
- `relatedTerms` all exist in `data/terms.json`.
- Internal links point to real routes.
- Headings do not skip levels.
- The post has at least one useful CTA to `/planner` or `/glossary`.
- The final section tells the reader what to do next.

For broader content changes, also run:

```bash
npm run validate:content
npm run audit:seo
```

# 25 — Blog Content Schema & Frontmatter Spec

**Status:** 🕐 Pending

## Goal
Define the MDX frontmatter schema for all blog posts as the single source of truth before any code is written.

## Build
- TypeScript type definition for blog post frontmatter (`BlogPost`)
- Fields: `title`, `slug`, `description`, `publishedAt`, `updatedAt`, `author`, `category` (shots | lighting | movement | editing | ai-prompting), `tags[]`, `difficulty` (beginner | intermediate | advanced), `readingTime`, `ogImage`, `canonicalUrl`, `relatedTerms[]` (glossary slugs), `featured` (bool), `draft` (bool)
- One sample `.mdx` file demonstrating every field
- Category and difficulty values documented as string unions

## Acceptance
- TypeScript type compiles with no errors
- Sample post validates against the type
- Every field has a comment explaining its purpose and whether it is required or optional

# Performance Audit

Use Lighthouse on the production preview, not the Astro dev server. The dev server ships development JavaScript and will create false warnings for minification and unused code.

## Local workflow

```bash
npm run build
npm run preview -- --host 127.0.0.1 --port 4322
npm run audit:lighthouse
```

To test a different local route or deployed URL:

```bash
LIGHTHOUSE_URL=http://127.0.0.1:4322/recipes npm run audit:lighthouse
LIGHTHOUSE_URL=https://www.aiscreens.in/ npm run audit:lighthouse
```

## Budgets

- Performance: 90+
- Accessibility: 95+
- Best Practices: 95+
- SEO: 95+
- First Contentful Paint: 2s or less
- Largest Contentful Paint: 3.5s or less
- Total Blocking Time: 200ms or less
- Cumulative Layout Shift: 0.1 or less
- Total byte weight: 600 KiB or less

The script writes the raw report to `.lighthouse/latest.json`, which is intentionally ignored by Git.

## Current target

The homepage should stay fast after visual upgrades: lightweight CSS/vanilla JS, no render-blocking remote fonts, lazy video loading, small image assets, and production-only audits before shipping.

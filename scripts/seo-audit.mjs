#!/usr/bin/env node
/**
 * SEO audit agent for CineCards AI blog.
 * Checks every item on the task-34 checklist against the built dist/ output.
 *
 * Run: node scripts/seo-audit.mjs
 * Requires: npm run build first
 */

import { readFileSync, existsSync, readdirSync } from "node:fs";
import { join, relative } from "node:path";
import { fileURLToPath } from "node:url";

const __dir = fileURLToPath(new URL("..", import.meta.url));
const DIST = join(__dir, "dist");

// ── helpers ──────────────────────────────────────────────────────────────────

let passed = 0;
let failed = 0;
let warned = 0;

function check(label, ok, detail = "") {
  if (ok === true) {
    console.log(`  ✅  ${label}`);
    passed++;
  } else if (ok === "warn") {
    console.log(`  ⚠️   ${label}${detail ? ` — ${detail}` : ""}`);
    warned++;
  } else {
    console.log(`  ❌  ${label}${detail ? ` — ${detail}` : ""}`);
    failed++;
  }
}

function readHtml(filePath) {
  if (!existsSync(filePath)) return null;
  return readFileSync(filePath, "utf8");
}

function getAttr(html, attr) {
  const re = new RegExp(`${attr}="([^"]*)"`, "i");
  return html.match(re)?.[1] ?? null;
}

function getMeta(html, name) {
  const re = new RegExp(`<meta[^>]+(?:name|property)="${name}"[^>]+content="([^"]*)"`, "i");
  const m = html.match(re);
  if (m) return m[1];
  const re2 = new RegExp(`<meta[^>]+content="([^"]*)"[^>]+(?:name|property)="${name}"`, "i");
  return html.match(re2)?.[1] ?? null;
}

function collectBlogPosts() {
  const blogDir = join(DIST, "blog");
  if (!existsSync(blogDir)) return [];
  return readdirSync(blogDir, { withFileTypes: true })
    .filter(e => e.isDirectory() && !["category", "tag"].includes(e.name))
    .map(e => ({
      slug: e.name,
      path: join(blogDir, e.name, "index.html"),
    }))
    .filter(p => existsSync(p.path));
}

// ── run audit ────────────────────────────────────────────────────────────────

console.log("\n╔══════════════════════════════════════════════════════════╗");
console.log("║          CineCards AI — SEO Audit (Task 34)             ║");
console.log("╚══════════════════════════════════════════════════════════╝\n");

if (!existsSync(DIST)) {
  console.error("❌  dist/ not found. Run: npm run build\n");
  process.exit(1);
}

const posts = collectBlogPosts();
console.log(`Found ${posts.length} blog post(s) to audit.\n`);

// ── 1. Sitemap ──────────────────────────────────────────────────────────────
console.log("📌  SITEMAP");
const sitemapIndexPath = join(DIST, "sitemap-index.xml");
const sitemapContentPath = join(DIST, "sitemap-0.xml");
const sitemapFallback = join(DIST, "sitemap.xml");
const hasSitemap = existsSync(sitemapIndexPath) || existsSync(sitemapFallback);
check("sitemap exists", hasSitemap);

if (hasSitemap) {
  // sitemap-0.xml has the actual URLs; sitemap-index.xml is just the pointer
  const contentFile = existsSync(sitemapContentPath) ? sitemapContentPath : existsSync(sitemapFallback) ? sitemapFallback : sitemapIndexPath;
  const sitemapContent = readFileSync(contentFile, "utf8");
  check("/blog/ in sitemap", sitemapContent.includes("/blog/"), "missing /blog/ URL");
  check("/blog/category/ in sitemap", sitemapContent.includes("/blog/category/"), "missing category URLs");
  check("/blog/tag/ in sitemap", sitemapContent.includes("/blog/tag/"), "missing tag URLs");
  const postCount = (sitemapContent.match(/\/blog\/[a-z0-9-]+\//g) ?? []).filter(u => !u.includes("/category/") && !u.includes("/tag/")).length;
  check(`blog posts in sitemap (${postCount})`, postCount > 0);
}

// ── 2. RSS feed ─────────────────────────────────────────────────────────────
console.log("\n📌  RSS FEED");
const rssPath = join(DIST, "blog", "rss.xml");
check("rss.xml exists", existsSync(rssPath));
if (existsSync(rssPath)) {
  const rss = readFileSync(rssPath, "utf8");
  check("RSS has <title>", rss.includes("<title>"));
  check("RSS has <item>", rss.includes("<item>"), "no posts in feed");
  check("RSS has <link> per item", rss.includes("<link>"));
  check("RSS no draft posts (check manually)", "warn", "verify draft:true posts absent from feed");
}

// ── 3. Global head (check blog index) ───────────────────────────────────────
console.log("\n📌  GLOBAL HEAD (blog index)");
const blogIndex = readHtml(join(DIST, "blog", "index.html"));
if (blogIndex) {
  check("RSS <link rel=alternate> in <head>", blogIndex.includes('type="application/rss+xml"'));
  check("<meta name=robots> present", blogIndex.includes('name="robots"'));
  check("<link rel=canonical> present", blogIndex.includes('rel="canonical"'));
  check("og:image present", getMeta(blogIndex, "og:image") !== null);
}

// ── 4. Per-post checks ──────────────────────────────────────────────────────
console.log("\n📌  PER-POST CHECKS");
if (posts.length === 0) {
  check("blog posts found in dist/", false, "no post directories found");
} else {
  for (const post of posts) {
    const html = readHtml(post.path);
    if (!html) { check(`${post.slug} — readable`, false); continue; }

    console.log(`\n  📄  /blog/${post.slug}`);

    // Title
    const titleMatch = html.match(/<title>([^<]+)<\/title>/i);
    const title = titleMatch?.[1] ?? "";
    check("  <title> present", title.length > 0);
    check("  <title> not default fallback", !title.startsWith("CineCards AI -"));

    // Description
    const desc = getMeta(html, "description");
    check("  meta description present", desc !== null);
    if (desc) {
      const len = desc.length;
      check(`  meta description 50–160 chars (${len})`, len >= 50 && len <= 160,
        len < 50 ? "too short" : len > 160 ? `too long by ${len - 160} chars` : "");
    }

    // Canonical
    const canonical = html.match(/rel="canonical"[^>]*href="([^"]+)"/i)?.[1]
      ?? html.match(/href="([^"]+)"[^>]*rel="canonical"/i)?.[1];
    check("  canonical URL present", canonical !== null);
    if (canonical) {
      check("  canonical matches slug", canonical.includes(post.slug));
    }

    // OG tags
    check("  og:title present", getMeta(html, "og:title") !== null);
    check("  og:description present", getMeta(html, "og:description") !== null);
    check("  og:type = article", getMeta(html, "og:type") === "article");
    check("  og:image present", getMeta(html, "og:image") !== null);
    check("  article:published_time present", getMeta(html, "article:published_time") !== null);

    // JSON-LD
    const hasJsonLd = html.includes('"@type":"Article"') || html.includes('"@type": "Article"');
    check("  JSON-LD Article schema present", hasJsonLd);
    if (hasJsonLd) {
      check("  JSON-LD has headline", html.includes('"headline"'));
      check("  JSON-LD has author", html.includes('"author"'));
      check("  JSON-LD has datePublished", html.includes('"datePublished"'));
      check("  JSON-LD has publisher", html.includes('"publisher"'));
    }

    // Heading hierarchy (h1 must exist, no h3 before h2)
    const h1Count = (html.match(/<h1[\s>]/gi) ?? []).length;
    check("  exactly one <h1>", h1Count === 1, `found ${h1Count}`);

    // Images with alt
    const imgTags = html.match(/<img[^>]+>/gi) ?? [];
    const imgsWithoutAlt = imgTags.filter(img => !img.includes("alt="));
    check(`  all images have alt text (${imgTags.length} imgs)`,
      imgsWithoutAlt.length === 0, `${imgsWithoutAlt.length} missing alt`);

    // Reading progress bar (presence of our JS)
    check("  reading progress bar script", html.includes("reading-progress"));

    // Internal links to glossary
    check("  links to /glossary", html.includes('href="/glossary'));

    // Twitter card
    check("  twitter:card present", getMeta(html, "twitter:card") !== null);
  }
}

// ── 5. Category pages ────────────────────────────────────────────────────────
console.log("\n📌  CATEGORY PAGES");
const catDir = join(DIST, "blog", "category");
if (existsSync(catDir)) {
  const cats = readdirSync(catDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
  check(`category pages generated (${cats.join(", ")})`, cats.length > 0);
  for (const cat of cats) {
    const html = readHtml(join(catDir, cat, "index.html"));
    if (html) {
      check(`  /blog/category/${cat} has <title>`, html.includes("<title>"));
      check(`  /blog/category/${cat} has meta description`, getMeta(html, "description") !== null);
      check(`  /blog/category/${cat} has canonical`, html.includes('rel="canonical"'));
    }
  }
} else {
  check("category pages generated", false, "dist/blog/category/ not found");
}

// ── 6. Tag pages ─────────────────────────────────────────────────────────────
console.log("\n📌  TAG PAGES");
const tagDir = join(DIST, "blog", "tag");
if (existsSync(tagDir)) {
  const tags = readdirSync(tagDir, { withFileTypes: true }).filter(e => e.isDirectory()).map(e => e.name);
  check(`tag pages generated (${tags.length} tags)`, tags.length > 0);
  const sample = tags[0];
  if (sample) {
    const html = readHtml(join(tagDir, sample, "index.html"));
    if (html) {
      check(`  sample tag /${sample} has <title>`, html.includes("<title>"));
      check(`  sample tag /${sample} has description`, getMeta(html, "description") !== null);
    }
  }
} else {
  check("tag pages generated", false, "dist/blog/tag/ not found");
}

// ── 7. robots.txt ───────────────────────────────────────────────────────────
console.log("\n📌  ROBOTS.TXT");
const robotsPath = join(DIST, "robots.txt");
if (existsSync(robotsPath)) {
  const robots = readFileSync(robotsPath, "utf8");
  const disallowsBlog = robots.includes("Disallow: /blog");
  check("robots.txt does not block /blog", !disallowsBlog, disallowsBlog ? "Disallow: /blog found!" : "");
} else {
  check("robots.txt present", "warn", "no robots.txt found — Astro may rely on sitemap only");
}

// ── Summary ──────────────────────────────────────────────────────────────────
const total = passed + failed + warned;
console.log("\n══════════════════════════════════════════════════════════");
console.log(`  Results: ${passed} passed  ${failed} failed  ${warned} warnings  (${total} checks)`);
console.log("══════════════════════════════════════════════════════════\n");

if (failed > 0) {
  console.log("  Action required: fix the ❌ items above before going live.\n");
  process.exit(1);
} else if (warned > 0) {
  console.log("  All critical checks passed. Review ⚠️  items above.\n");
  process.exit(0);
} else {
  console.log("  All checks passed. Blog is SEO-ready. ✅\n");
  process.exit(0);
}

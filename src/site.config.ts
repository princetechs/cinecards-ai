/**
 * Central site configuration.
 * Edit this file to update copy, tokens, and structure across the whole site.
 */

// ── Brand & identity ─────────────────────────────────────────────────────────
export const SITE_NAME    = "CineCards AI";
export const SITE_TAGLINE = "Learn film language. Build better AI video prompts.";
export const SITE_URL     = "https://cinecards.ai";
export const GITHUB_URL   = "https://github.com/princetechs/cinecards-ai";

// ── Design tokens (single source of truth) ──────────────────────────────────
export const tokens = {
  // Backgrounds
  bgHero:    "#0F0F13",   // dark cinema hero
  bgDark:    "#1A1A22",   // dark card / frame
  bgPage:    "#F8F5EF",   // warm paper — light sections
  bgWhite:   "#FFFFFF",
  bgSand:    "#EFE8DC",   // dune — alternate light section

  // Text
  textWhite:  "#FFFFFF",
  textPrimary:"#171717",
  textBody:   "#4F4A45",
  textMuted:  "#7A7268",
  textFaint:  "rgba(255,255,255,0.45)",  // on dark bg
  textGhost:  "rgba(255,255,255,0.25)",  // social proof on dark

  // Accent
  accent:     "#E4572E",
  accentDark: "#B83A1F",
  accentPale: "#FFE0D2",

  // Borders
  borderLight:"#E6DDD1",
  borderDark: "rgba(255,255,255,0.08)",

  // Radius
  radiusSm:   "8px",
  radiusMd:   "14px",
  radiusLg:   "20px",
  radiusFull: "999px",
} as const;

// ── Typography scale ─────────────────────────────────────────────────────────
export const type = {
  hero:     "clamp(40px, 5.5vw, 64px)",
  h1:       "clamp(28px, 4vw, 40px)",
  h2:       "clamp(20px, 2.5vw, 26px)",
  h3:       "20px",
  body:     "16px",
  small:    "14px",
  label:    "11px",
  mono:     "12.5px",
} as const;

// ── Hero section copy ────────────────────────────────────────────────────────
export const hero = {
  eyebrow:   "Open Source · 124 Film Terms · AI-Ready",
  headline1: "Learn film",
  headline2: "language.",
  headline3: "Build better AI",
  headline4: "video prompts.",
  subtitle:  "CineCards AI teaches shots, angles, lighting, movement, and editing — then turns them into prompts you can use in Runway, Pika, and any AI video tool.",
  cta1Label: "Start Learning",
  cta1Href:  "/glossary",
  cta2Label: "Plan a Sequence",
  cta2Href:  "/planner",
  socialProof: "Used by creators learning with Runway · Pika · Stable Video",
} as const;

// ── Stats strip ──────────────────────────────────────────────────────────────
export const stats = [
  { value: "124",  label: "Film Terms"           },
  { value: "15+",  label: "Prompt Packs"         },
  { value: "7",    label: "Shot Sequence Types"  },
] as const;

// ── Navigation ───────────────────────────────────────────────────────────────
export const navLinks = [
  { label: "Glossary",    href: "/glossary"   },
  { label: "Planner",     href: "/planner"    },
  { label: "Practice",    href: "/learn"      },
  { label: "Recipes",     href: "/recipes"    },
  { label: "Contribute",  href: "/contribute" },
] as const;

// ── SEO defaults ─────────────────────────────────────────────────────────────
export const seo = {
  defaultTitle:       `${SITE_NAME} - Visual film terms and AI video shot planning`,
  defaultDescription: "A lightweight open-source learning tool for cinematography, videography, and AI video prompts.",
  ogImage:            "/images/cinecards-hero.png",
  themeColor:         "#0F0F13",
} as const;

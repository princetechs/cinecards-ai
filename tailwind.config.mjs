/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}", "./components/**/*.{astro,ts}"],
  theme: {
    extend: {
      colors: {
        // ── Core design-system tokens ────────────────────────────────────
        ink:        "#171717",   // primary text / headings
        "ink-prose":"#4F4A45",   // body copy
        "ink-soft": "#7A7268",   // muted / secondary text
        "ink-muted":"#7A7268",
        rule:       "#E6DDD1",   // borders
        paper:      "#F8F5EF",   // warm page bg
        bone:       "#EFE8DC",   // sand-light surface
        clay:       "#E4572E",   // accent (orange-red)
        "clay-quiet":"#B83A1F",  // accent dark
        night:      "#0F0F13",   // hero / cinema dark bg

        // ── Explicit aliases (same values, different names) ──────────────
        page:            "#F8F5EF",
        canvas:          "#FFFFFF",
        "sand-light":    "#EFE8DC",
        "sand-rule":     "#E6DDD1",
        "sand-dark":     "#D8CFC3",
        "ink-new":       "#171717",
        "ink-body":      "#4F4A45",
        "ink-quiet":     "#7A7268",
        "accent":        "#E4572E",
        "accent-dark":   "#B83A1F",
        "accent-pale":   "#FFE0D2",
        dark:            "#0F0F13",
        "dark-card":     "#1A1A22",
        moss:            "#6d7866",
      },
      boxShadow: {
        soft: "0 4px 16px rgba(23,23,23,0.07)",
        lift: "0 8px 28px rgba(23,23,23,0.10)",
      },
      fontFamily: {
        display: ['"Space Grotesk"', "ui-sans-serif", "system-ui", "sans-serif"],
        body:    ["Inter",          "ui-sans-serif", "system-ui", "sans-serif"],
        ui:      ["Inter",          "ui-sans-serif", "system-ui", "sans-serif"],
        mono:    ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"],
      },
      maxWidth: {
        prose: "62ch",
      },
    },
  },
};

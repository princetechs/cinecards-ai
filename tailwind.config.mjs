/** @type {import('tailwindcss').Config} */
export default {
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}", "./components/**/*.{astro,ts}"],
  theme: {
    extend: {
      colors: {
        ink: "#171513",
        "ink-prose": "#2a2620",
        "ink-soft": "#5a4f47",
        "ink-muted": "#8c7d70",
        rule: "#e7ddd0",
        paper: "#f5f0e8",
        bone: "#fffaf2",
        clay: "#b86f4d",
        "clay-quiet": "#8c5b42",
        moss: "#6d7866",
        night: "#11100f"
      },
      boxShadow: {
        soft: "0 18px 50px rgba(32, 24, 18, 0.10)",
        lift: "0 12px 28px rgba(32, 24, 18, 0.14)"
      },
      fontFamily: {
        display: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        body: ['"Fraunces"', "ui-serif", "Georgia", "serif"],
        ui: ["Inter", "ui-sans-serif", "system-ui", "sans-serif"],
        mono: ['"JetBrains Mono"', "ui-monospace", "SFMono-Regular", "monospace"]
      },
      maxWidth: {
        prose: "62ch"
      }
    }
  }
};

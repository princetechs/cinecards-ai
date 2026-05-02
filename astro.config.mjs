import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://cinecards.ai",
  output: "static",
  integrations: [mdx(), sitemap()],
});

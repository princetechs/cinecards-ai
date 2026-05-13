import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import sitemap from "@astrojs/sitemap";

export default defineConfig({
  site: "https://www.aiscreens.in",
  output: "static",
  integrations: [mdx(), sitemap()],
});

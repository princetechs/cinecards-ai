import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";

export default defineConfig({
  site: "https://cinecards.ai",
  output: "static",
  integrations: [mdx()],
});

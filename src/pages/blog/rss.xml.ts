import rss from "@astrojs/rss";
import { getCollection } from "astro:content";
import type { APIContext } from "astro";

export async function GET(context: APIContext) {
  const posts = await getCollection("blog", ({ data }) => !data.draft);
  const sorted = posts.sort((a, b) => b.data.publishedAt.valueOf() - a.data.publishedAt.valueOf());

  return rss({
    title: "CineCards AI Blog — Cinematography & AI Video",
    description: "Practical guides on shots, lighting, camera movement, and writing cinematic AI video prompts for Runway, Pika, and Stable Video.",
    site: context.site!,
    items: sorted.map(post => ({
      title: post.data.title,
      description: post.data.description,
      pubDate: post.data.publishedAt,
      link: `/blog/${post.slug}/`,
      categories: [post.data.category, ...post.data.tags],
    })),
    customData: `<language>en-us</language>`,
    stylesheet: false,
  });
}

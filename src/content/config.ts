import { defineCollection, z } from "astro:content";

const blog = defineCollection({
  type: "content",
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishedAt: z.coerce.date(),
    updatedAt: z.coerce.date().optional(),
    author: z.string().default("CineCards AI"),
    category: z.enum(["shots", "lighting", "movement", "editing", "ai-prompting"]),
    tags: z.array(z.string()).default([]),
    difficulty: z.enum(["beginner", "intermediate", "advanced"]).default("beginner"),
    readingTime: z.number().optional(),
    ogImage: z.string().default("/images/blog/default-og.png"),
    relatedTerms: z.array(z.string()).default([]),
    featured: z.boolean().default(false),
    draft: z.boolean().default(false),
  }),
});

export const collections = { blog };

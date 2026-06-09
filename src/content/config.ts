import { defineCollection, z } from 'astro:content';

const blog = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    lastmod: z.coerce.date().optional(),
    draft: z.boolean().default(false),
    author: z.string().default('Y-A-S Team'),
    description: z.string().optional(),
    keywords: z.array(z.string()).optional(),
    tags: z.array(z.string()).optional(),
    series: z.array(z.string()).optional(),
    categories: z.array(z.string()).optional(),
    seriesOrder: z.number().optional(),
    images: z.array(z.string()).optional(),
    toc: z.boolean().default(false),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    image: z.string().optional(),
    tech: z.string().optional(),
    description: z.string().optional(),
    github: z.string().optional(),
    webUrl: z.string().optional(),
  }),
});

export const collections = { blog, projects };

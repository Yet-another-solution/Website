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
    // Shared id linking an entry to its translations in the other locales.
    // Defaults to the slug when the translations happen to share one.
    translationKey: z.string().optional(),
  }),
});

const projects = defineCollection({
  type: 'content',
  schema: z.object({
    title: z.string(),
    date: z.coerce.date(),
    draft: z.boolean().default(false),
    // When the page was last revised, shown in its details card and the sitemap.
    lastmod: z.coerce.date().optional(),
    status: z.enum(['active', 'completed']).optional(),
    // The <title> and breadcrumb-free search title; `title` stays the short name.
    seoTitle: z.string().optional(),
    image: z.string().optional(),
    // The JSON-LD type of the project: a code library or any other piece of work.
    schemaType: z.enum(['SoftwareSourceCode', 'CreativeWork']).default('CreativeWork'),
    // SoftwareSourceCode details for the JSON-LD.
    programmingLanguage: z.string().optional(),
    runtimePlatform: z.string().optional(),
    // One alt text per gallery screenshot, in file-name order.
    galleryAlt: z.array(z.string()).optional(),
    tech: z.string().optional(),
    // Required: it is the project card's text, the page subtitle and the meta description.
    description: z.string().min(1),
    github: z.string().optional(),
    webUrl: z.string().optional(),
    // See the blog collection — links an entry to its translations.
    translationKey: z.string().optional(),
  }),
});

export const collections = { blog, projects };

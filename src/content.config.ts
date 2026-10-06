import { defineCollection } from 'astro:content';
import { glob } from 'astro/loaders';
import { z } from 'astro/zod';

/**
 * Document sections (01–07). `number` drives headings and the TOC;
 * `order` controls position. Projects are nested under the section whose
 * `id` is `selected-work`.
 */
const sections = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/sections' }),
  schema: z.object({
    id: z.string(),
    number: z.string(),
    title: z.string(),
    navLabel: z.string(),
    order: z.number(),
    lead: z.string().optional(),
  }),
});

const projects = defineCollection({
  loader: glob({ pattern: '*.md', base: './src/content/projects' }),
  schema: z.object({
    id: z.string(),
    number: z.string(),
    title: z.string(),
    navLabel: z.string(),
    company: z.string(),
    context: z.string(),
    project: z.string(),
    domain: z.string(),
    summary: z.string(),
    role: z.string(),
    timeline: z.string(),
    platform: z.array(z.string()),
    partners: z.array(z.string()),
    accent: z.enum(['relay', 'account', 'tracking', 'spokgo']),
    featured: z.boolean().default(true),
    order: z.number(),
  }),
});

export const collections = { sections, projects };

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
    cardLine: z.string().optional(), // plain line under the headline on the homepage card: what it is, for whom, on what platform
    role: z.string(),
    timeline: z.string().optional(),
    platform: z.array(z.string()),
    partners: z.array(z.string()),
    // Named after the first case study to use each colour; yellow and lilac are spares for new ones.
    accent: z.enum(['relay', 'account', 'tracking', 'spokgo', 'yellow', 'lilac']),
    cover: z.string().optional(), // card image on the homepage, e.g. /images/work/<id>/cover.png; a placeholder shows until it is set
    coverAlt: z.string().optional(), // also the alt text for hero
    hero: z.string().optional(), // wide mockup image at the top of the case page
    coverColor: z.string().optional(), // bright card colour behind the cover mockup, e.g. #c9c1fb; matches the hero image background
    tags: z.array(z.string()).optional(), // card tags on the homepage; without them the card shows the role and first two platforms
    locked: z.boolean().default(false), // true puts the case page behind the password gate (src/components/CaseGate.astro)
    featured: z.boolean().default(true), // false hides the case study from the site (the editor's "Show on site")
    moreWork: z.boolean().default(false), // true lists it in the homepage's "More work" line instead of as a card; its page stays live
    order: z.number(),
  }),
});

export const collections = { sections, projects };

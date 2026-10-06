import { getCollection } from 'astro:content';

export interface OutlineItem {
  id: string;
  number: string;
  label: string;
  /** Longer label for the mobile bar and scroll tooltip (e.g. "Zenni Account"). */
  fullLabel: string;
  accent?: string;
  children?: OutlineItem[];
}

/** Document outline derived from content, used by the TOC, mobile menu and scroll spy. */
export async function getOutline(): Promise<OutlineItem[]> {
  const sections = (await getCollection('sections')).sort((a, b) => a.data.order - b.data.order);
  const projects = (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);

  return sections.map((s) => ({
    id: s.data.id,
    number: s.data.number,
    label: s.data.navLabel,
    fullLabel: s.data.navLabel,
    children:
      s.data.id === 'selected-work'
        ? projects.map((p) => ({
            id: p.data.id,
            number: p.data.number,
            label: p.data.navLabel,
            fullLabel: p.data.title,
            accent: p.data.accent,
          }))
        : undefined,
  }));
}

export async function getSortedSections() {
  return (await getCollection('sections')).sort((a, b) => a.data.order - b.data.order);
}

export async function getSortedProjects() {
  return (await getCollection('projects')).sort((a, b) => a.data.order - b.data.order);
}

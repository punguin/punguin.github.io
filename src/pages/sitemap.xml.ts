import type { APIRoute } from 'astro';
import { getSortedProjects } from '../lib/outline';

// Lists the homepage and every case study (except password-protected ones) so search engines and AI tools can find them.
export const GET: APIRoute = async ({ site }) => {
  const projects = await getSortedProjects();
  const urls = ['/', ...projects.filter((p) => !p.data.locked).map((p) => `/work/${p.data.id}/`)].map((path) => new URL(path, site).href);
  const body = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls.map((u) => `  <url><loc>${u}</loc></url>`).join('\n')}
</urlset>
`;
  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
};

# Pung Brooks — Design Practice

A long-form, document-style portfolio. One page, numbered sections, a persistent table of contents, and four case studies as chapters.

Built with Astro + TypeScript, vanilla CSS, and plain Markdown. The only client JavaScript is one small module (`src/scripts/document-nav.ts`, about 3 KB) for the scroll spy, sticky project headers, mobile menu, and mobile scroll indicator.

## Commands

```sh
npm install
npm run dev       # local dev server at http://localhost:4321
npm run build     # static output in dist/
npm run preview   # serve the built site
```

Every push to `main` builds the site and deploys it to GitHub Pages at https://punguin.github.io (`.github/workflows/deploy.yml`). Pull requests run the build only. Vercel is also connected to this repository: every pull request gets a preview deployment, and Vercel protects preview URLs so only people signed in to the Vercel team can open them. In the repository's Settings → Pages, "Source" must be set to "GitHub Actions". If a custom domain is added later, update `site` in `astro.config.mjs` so the canonical and Open Graph URLs match.

## Editing content

All copy lives in `src/content/`. Components hold no portfolio copy.

| What | Where |
| --- | --- |
| Hero | `src/content/hero.json` |
| Sections 01–06 | `src/content/sections/*.md` (frontmatter: `id`, `number`, `title`, `navLabel`, `order`, optional `lead`) |
| Case studies 03.1–03.4 | `src/content/projects/*.md` (frontmatter: number, company, summary/thesis, role, timing, platform, partners, accent, order) |
| Experience timeline | `src/content/experience.json` |
| Email, LinkedIn, résumé | `src/content/contact.json` |

The table of contents, mobile menu, selected-work index and scroll spy are all generated from the frontmatter. To add a project, add a Markdown file to `src/content/projects/` with the next `number` and `order`. Nothing else needs to change.

### Heading levels

Section bodies use `###` for subheads. Case-study bodies use `####` (the project thesis is the `<h3>`).

### Adding an image

Put the file in `public/images/` (or `src/assets/` if you want Astro to optimize it). Then replace a placeholder figure in the Markdown:

```html
<figure class="visual visual--wide">
  <img src="/images/relay-before-after.webp" width="1600" height="900" loading="lazy" decoding="async"
       alt="Old Relay home screen beside the redesigned one, showing …" />
  <figcaption>Why this evidence matters, not what it is.</figcaption>
</figure>
```

Sizes: `visual--inline` (reading width), `visual--wide` (extends up to 120px left on large screens), `visual--full` (up to 160px; use sparingly). Always set `width` and `height` to prevent layout shift. Use WebP or AVIF, and keep screenshots with text legible.

### Placeholders

Anything not yet written is marked so it is easy to find:

- `<p class="todo">…</p>` with a "To write" tag: case-study narrative still needed.
- `<figure class="visual … is-placeholder">`: evidence still needed.
- `"[To confirm]"` in project frontmatter: role, timing, platform, partners.
- `"placeholder": true` in `contact.json`.

Search for `todo`, `is-placeholder`, `[To confirm]` and `placeholder` to find them all.

## Architecture

- `src/pages/index.astro` renders the whole document from the content collections.
- `src/lib/outline.ts` derives the numbered outline used by every navigation surface.
- `src/styles/global.css` holds all tokens (color, type, spacing, layout) at the top, then base and layout rules. Component styles are scoped in each `.astro` file.
- `src/styles/fonts.css` self-hosts latin subsets of Bricolage Grotesque (800, display headlines only), Inter (400–700) and Roboto Mono (400, numbers and labels). The two faces used above the fold are preloaded.
- The visual system follows the "Say Briefly" style reference: Cream Paper canvas, Forest Ink for text and structure, Highlighter Yellow as a `<mark>` wash on a few key phrases, and one sticky-note pastel per case study (`--accent-*` in `global.css`). Buttons use 6px corners, cards 12px, navigation 16px.

### Navigation behaviour

- Desktop (1024px and up): sticky TOC to the right of the document. Active state uses weight, darker text and a small rule marker; hover is a faint background only.
- Below 1024px: the TOC is replaced by a sticky bar showing the current section number and name, with a MENU button that opens the full numbered list. A thin scroll indicator on the right edge shows a section tooltip while scrolling, then fades.
- Scroll spy: an `IntersectionObserver` watches a 1px line 30% down the viewport, so nothing is measured on raw scroll events. The last section whose top has crossed that line is active, which makes nested case studies win while you are inside them. "Top of document" is active at the hero.
- Links are real anchors, so hashes, direct links, and Back/Forward are native browser behaviour. Smooth scrolling is CSS and is turned off under `prefers-reduced-motion`.
- Each case study has an identifier bar ("03.2 · Zenni Optical") that becomes a compact sticky header ("03.2 · Zenni Account") while you read that project on desktop.

## Verified

Tested at 320, 375, 390, 768, 1024, 1280, 1440, 1728 and 2200px: no horizontal overflow. axe-core (WCAG 2.2 AA plus best practices) reports no violations at 375 and 1440px. Lighthouse: Performance 97 on mobile and 100 on desktop; Accessibility, Best Practices and SEO 100. Scores will change once real images are added.

# Pung Brooks — Design Practice

Portfolio site for Pung Brooks, live at https://pungbrooksdesign.com. A homepage with numbered sections (Selected work, How I work, Values, Experience, Contact) and one page per case study at `/work/<id>/`.

Built with Astro + TypeScript, vanilla CSS, and Markdown content collections. Client JavaScript is limited to small modules in `src/scripts/`: scroll spy for the contents lists, the How I work reveal animation, the case-study image viewer, and the `/admin/` editor.

## Commands

```sh
npm ci            # install (includes @vercel/analytics)
npm run dev       # local dev server at http://localhost:4321
npm run build     # static output in dist/
npm run preview   # serve the built site
```

## Hosting

- The domain pungbrooksdesign.com points at Vercel, which builds `main` for production and gives every pull request a preview deployment. Preview URLs are protected, so only people signed in to the Vercel team can open them.
- `.github/workflows/deploy.yml` also builds every push to `main` and deploys it to GitHub Pages; pull requests run the build only.
- `site` in `astro.config.mjs` and `public/CNAME` are set to pungbrooksdesign.com, so canonical and Open Graph URLs use the domain. `src/pages/sitemap.xml.ts` and `public/robots.txt` cover search engines.

## Editing content

All copy lives in `src/content/`. Components hold no portfolio copy.

| What | Where |
| --- | --- |
| Hero (greeting, portrait, headline, supporting copy) | `src/content/hero.json` |
| Homepage sections 01–05 | `src/content/sections/*.md` (frontmatter: `id`, `number`, `title`, `navLabel`, `order`, optional `lead`) |
| Case studies 01.1–01.4 | `src/content/projects/*.md` (see below) |
| Experience timeline | `src/content/experience.json` |
| Email, LinkedIn, résumé | `src/content/contact.json` (the résumé PDF is `public/Pung-Brooks-Resume.pdf`) |

The homepage contents list, the Selected work cards and each case study's contents list are generated from the content. To add a case study, add a Markdown file to `src/content/projects/` with the next `number` and `order`.

### Case study frontmatter

`id` (the URL), `number`, `title`, `navLabel`, `company`, `context`, `project`, `domain`, `summary` (the page headline), `role`, `timeline`, `platform`, `partners`, `accent`, `order`, and optional:

- `cover` and `coverAlt`: the homepage card image (`public/images/work/<id>/cover.webp`, 1600×1200). A placeholder shows until `cover` is set. `coverAlt` is also the alt text for `hero`.
- `hero`: the wide mockup at the top of the case page (`hero.webp`, 2400×1200).
- `featured: false`: hides the case study everywhere (homepage, `/work/` pages, next links, sitemap) without deleting it. SpokGo is hidden this way until its content exists.

### Case study structure

Every published case study follows the same impact-first outline, so its significance is clear in the first minute and the full reasoning is still there for anyone who keeps reading:

| Section | Markdown |
| --- | --- |
| Overview | The opening paragraph (styled as the lede), then a `<dl class="case-overview">` with *The problem*, *My role* and *What I did* rows |
| 01 / Impact | `#### 01 / Impact`, a headline line, then `<ul class="case-impact">` with 3–4 items |
| 02 / Key decisions | `#### 02 / Key decisions`, a headline line, then `<ol class="case-decisions">` linking to the 4.x sections |
| 03 / Understanding the problem | `#### 03 / Understanding the problem`, then `##### 3.1 People`, `##### 3.2 System`, `##### 3.3 Gaps`, each followed by `<p class="case-insight">` with its insight headline |
| 04 / Making it work | `#### 04 / Making it work`, then one `##### 4.x` per key decision, plus validation and launch |
| 05 / What it enabled | `#### 05 / What it enabled`, optionally followed by an unnumbered `##### Reflection` |

An impact item:

```html
<li>
  <p class="case-impact__figure">−46%</p>   <!-- add case-impact__figure--text for a word or phrase -->
  <p class="case-impact__label">Searches per carrier in the US</p>
  <p class="case-impact__note">While loads per carrier remained relatively flat.</p>
  <p class="case-impact__kind">Measured in production</p>
</li>
```

`case-impact__kind` says what kind of evidence it is: measured in production or after launch, A/B test, measured adoption, research finding, capability enabled, organizational outcome, shipped, or in the developer handoff. Use only documented results, and keep units as they were reported (percentage points stay percentage points; wrap a unit in `<span class="case-impact__unit">`).

A key decision:

```html
<li>
  <p class="case-decisions__title"><a href="#41-separate-primary-search-from-secondary-filtering">Separate viable-work search from secondary filtering</a></p>
  <p>What changed and why it mattered. <a class="case-decisions__more" href="#41-separate-primary-search-from-secondary-filtering">4.1 ↓</a></p>
</li>
```

Decision links point at the slug Astro generates from the `#####` heading (`4.1 Separate primary…` becomes `#41-separate-primary…`), so renaming a heading means updating its links.

Inside sections, the line right after a `####` heading is styled as the section headline, and the line after a numbered `#####` is its subhead. Numbered `####` and `#####` headings feed the sticky contents list beside the story (`src/components/CaseContents.astro`); unnumbered `#####` headings stay out of it. Label what shipped and what was direction with `<p class="label case-status">Shipped in the first release</p>` or `Direction for later phases`. Styles for all of these live in `src/components/Project.astro`.

### Adding an image

Put the file in `public/images/work/<id>/` and add a figure to the Markdown:

```html
<figure class="visual visual--wide">
  <img src="/images/work/amazon-relay/before-after.webp" loading="lazy"
       alt="Before: the old Relay trips screen … After: the redesigned home screen …" />
  <figcaption>Why this evidence matters, not what it is.</figcaption>
</figure>
```

Sizes: `visual--inline` (reading width), `visual--wide`, `visual--full` (use sparingly). Use WebP, keep screenshots legible, and hide personal details (names, addresses, order and tracking numbers) before publishing. On case pages, clicking an image opens it larger (`src/scripts/image-viewer.ts`).

### Placeholders

Anything not yet written is marked so it is easy to find:

- `<p class="todo">…</p>` with a "To write" tag: narrative still needed.
- `<figure class="visual … is-placeholder">`: evidence still needed (the Load Board case study has several).
- `"[To confirm]"` in project frontmatter: role, timing, platform, partners.

Search for `todo`, `is-placeholder` and `[To confirm]` to find them all.

## Editing the site in the browser

Open `/admin/` on the site for a small editor (`src/pages/admin.astro`, `src/scripts/case-editor.ts`).

- Homepage: the hero, each section's heading, contents label and text (the number and position stay fixed), the Experience timeline and the Contact links. The JSON forms are built from each file's own shape.
- Case studies: lists `src/content/projects/`, edits details and story, adds new ones, uploads images to `public/images/work/<id>/`, and saves each change as a commit through the GitHub API. It needs a fine-grained GitHub token limited to this repository with Contents: Read and write; the token stays in the browser. "Show on site" off sets `featured: false`.
- Known gap: the editor's frontmatter list doesn't include `hero`, so saving a case study from `/admin/` drops its hero image. Edit `hero` in the Markdown file directly until that is fixed.

## Architecture

- `src/pages/index.astro` renders the homepage from the content collections; `src/pages/work/[id].astro` renders each case study, with a "Next case study" link.
- `src/lib/outline.ts` sorts sections and the featured case studies.
- `src/styles/global.css` holds all tokens (color, type, spacing, layout) at the top, then base and layout rules. Component styles are scoped in each `.astro` file.
- `src/styles/fonts.css` self-hosts latin subsets of Caprasimo (display headlines), Inter (body, 400–700) and Roboto Mono (small labels). Caprasimo and Inter 400 are preloaded.
- Visual system: warm paper (`#faf9f6`) with a dot-grid background, near-black ink for text and every rule, Caprasimo headlines, sentence-case mono labels, and one teal accent (`--violet`, `#14b3a6`, named for an earlier color) used only as a fill, never for small text. Each case study also has a pastel `--accent-*`. Only clickable things (work cards, the next-case link) get a white outlined box; everything else is separated by thin dividers.
- How I work illustrations are inline SVG in `src/content/sections/02-how-i-work.md` and animate in once as they scroll into view (`src/scripts/reveal.ts`, off under reduced motion). `public/illustrations/*.svg` are static copies.
- Legacy files no page uses: `src/components/PickMyBrain.astro`, `src/assets/brain/`, `scripts/brain_sketch.py` and `scripts/bake_brain.mjs` (the old hero illustration), and `scripts/sketches.py` (the old hand-drawn How I work sketches; rerunning it overwrites `public/illustrations/*.svg`).

### Navigation behaviour

- Homepage, 1200px and up: a sticky contents list hangs in the left margin; its links turn light over the dark Values band.
- Case pages, 1100px and up: a sticky contents list sits to the right of the story, starting with "00 Overview" and nesting the 3.x and 4.x subsections. Below those widths the lists are hidden and the page reads top to bottom.
- Scroll spy (`src/scripts/document-nav.ts`): the last heading whose top has crossed a line 30% down the viewport is active.
- Links are real anchors, so hashes, direct links, and Back/Forward are native browser behaviour. Smooth scrolling is CSS and is turned off under `prefers-reduced-motion`.

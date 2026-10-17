// Bakes the still parts of the hero drawing (paper.svg and piece-*.svg from brain_sketch.py) into
// transparent WebP images. The pencil grain is an SVG turbulence filter, and browsers re-run that
// filter on every animation frame, so the page shows these pre-rendered images instead.
// Run after brain_sketch.py: node scripts/bake_brain.mjs (needs Playwright with Chromium, and Python Pillow).
import { readFileSync, readdirSync, mkdirSync, unlinkSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = path.join(root, 'src/assets/brain');
const out = path.join(root, 'public/illustrations/brain');
const SCALE = 2; // pixels per scene unit: sharp at the 1080px max width on 2x screens

const pw = await import(process.env.PLAYWRIGHT || 'playwright');
const browser = await pw.chromium.launch(process.env.CHROMIUM ? { executablePath: process.env.CHROMIUM } : {});
const font = readFileSync(path.join(root, 'public/fonts/caveat-latin-600-normal.woff2')).toString('base64');
const paper = readFileSync(path.join(src, 'paper.svg'), 'utf8');
const defs = paper.match(/<defs>.*?<\/defs>/s)[0]; // the shared pencil filters, needed by the pieces too

mkdirSync(out, { recursive: true });
for (const name of readdirSync(src).filter((f) => f.endsWith('.svg') && f !== 'live.svg')) {
  const svg = readFileSync(path.join(src, name), 'utf8');
  const [, , , w, h] = svg.match(/viewBox="(-?[\d.]+) (-?[\d.]+) ([\d.]+) ([\d.]+)"/).map(Number);
  const page = await browser.newPage({ viewport: { width: Math.ceil(w), height: Math.ceil(h) }, deviceScaleFactor: SCALE });
  await page.setContent(`<!doctype html><style>
    @font-face { font-family: Caveat; font-weight: 600; src: url(data:font/woff2;base64,${font}) format("woff2"); }
    html, body { margin: 0; background: transparent; } svg { display: block; width: 100vw; height: 100vh; }
  </style><svg width="0" height="0" style="position:absolute">${defs}</svg>${svg}`);
  await page.evaluate(() => document.fonts.ready);
  const png = path.join(out, name.replace('.svg', '.png'));
  await page.screenshot({ path: png, omitBackground: true });
  await page.close();
  const webp = png.replace('.png', '.webp');
  execFileSync('python3', ['-c', 'import sys; from PIL import Image; Image.open(sys.argv[1]).save(sys.argv[2], "WEBP", quality=88, method=6)', png, webp]);
  unlinkSync(png);
  console.log('baked', path.relative(root, webp));
}
await browser.close();

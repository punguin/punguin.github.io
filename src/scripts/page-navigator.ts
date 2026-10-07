/**
 * Navigator panel: a true-to-scale miniature of the page, like the Navigator in drawing tools.
 *
 *  - The map is the whole browser width scaled down uniformly, so the yellow box has the
 *    exact proportions of the window. When the page is longer than the panel, the map
 *    slides to keep the box in view.
 *  - A rail on the left shows the whole page length at once, with section numbers.
 *  - Click to jump, drag the box (or the rail) to scroll, hover for the section name.
 *
 * Page content is measured once per layout change into a tall offscreen canvas;
 * scrolling only copies the visible slice and redraws the box and the rail.
 */

type Section = { id: string; number: string; label: string; top: number; bottom: number };
type Rect = { x: number; y: number; w: number; h: number };
type Box = Rect & { fill?: string; stroke?: string };
type Line = Rect & { kind: 'text' | 'heading' | 'subhead' };

const panel = document.querySelector<HTMLElement>('[data-pnav]');
const phone = window.matchMedia('(max-width: 639px)');
const STORE_KEY = 'pung-brooks:navigator-minimized';

if (panel) initNavigator(panel);

function initNavigator(panel: HTMLElement) {
  const canvas = panel.querySelector<HTMLCanvasElement>('[data-pnav-map]')!;
  const ctx = canvas.getContext('2d');
  const toggle = panel.querySelector<HTMLButtonElement>('[data-pnav-toggle]')!;
  const pct = panel.querySelector<HTMLElement>('[data-pnav-pct]')!;
  const tip = panel.querySelector<HTMLElement>('[data-pnav-tip]')!;
  const tipNum = panel.querySelector<HTMLElement>('[data-pnav-tip-num]')!;
  const tipLabel = panel.querySelector<HTMLElement>('[data-pnav-tip-label]')!;
  const doc = document.querySelector<HTMLElement>('.document');
  if (!ctx || !doc) return;

  const css = getComputedStyle(document.documentElement);
  const color = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const INK = color('--forest-ink', '#1a3300');
  const YELLOW = color('--highlighter-yellow', '#ffe95c');
  const PAPER = color('--cream-paper', '#fcfaf5');
  const PENCIL = color('--pencil-gray', '#b6b6b6');
  const MUTED = color('--text-tertiary', '#5c6654');
  const MONO = css.getPropertyValue('--font-mono').trim() || 'monospace';
  const TONE = { text: 'rgba(26, 51, 0, 0.32)', subhead: 'rgba(26, 51, 0, 0.65)', heading: INK };

  // Section names come from the mobile menu, which already carries number + full title.
  const names = new Map<string, { number: string; label: string }>();
  document.querySelectorAll<HTMLAnchorElement>('.mnav__menu a[data-spy]').forEach((a) => {
    names.set(a.dataset.spy!, { number: a.querySelector('.mnav__n')?.textContent ?? '', label: a.dataset.full ?? '' });
  });

  const RAIL = 34; // whole-page overview with section numbers
  const GAP = 6;
  let W = 0; // canvas CSS width
  let H = 0; // canvas CSS height
  let mapX = 0; // left edge of the scaled map
  let mapW = 0;
  let dpr = 1;
  let pageH = 1;
  let s = 1; // uniform map scale: page px -> map px
  let rs = 1; // rail scale: page px -> rail px (whole page fits)
  let offset = 0; // how far the map has slid, in map px
  let sections: Section[] = [];
  const base = document.createElement('canvas');
  const bctx = base.getContext('2d')!;

  panel.hidden = false;

  // ---------- Open / minimized state ----------
  const readStored = () => {
    try { return localStorage.getItem(STORE_KEY); } catch { return null; }
  };
  const isMin = () => panel.classList.contains('is-min');
  const setMinimized = (min: boolean, remember = true) => {
    panel.classList.toggle('is-min', min);
    toggle.setAttribute('aria-expanded', String(!min));
    toggle.setAttribute('aria-label', min ? 'Expand navigator' : 'Minimize navigator');
    if (remember) {
      try { localStorage.setItem(STORE_KEY, min ? '1' : '0'); } catch { /* storage unavailable */ }
    }
    if (!min) requestAnimationFrame(layout);
  };
  // Open by default; on phones it starts as the small bar so it doesn't cover the text.
  const stored = readStored();
  setMinimized(stored ? stored === '1' : phone.matches, false);
  toggle.addEventListener('click', () => setMinimized(!isMin()));

  // ---------- Measure the page ----------
  function visible(c: string) {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return false;
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    return parts.length < 4 || parseFloat(parts[3]) > 0.05;
  }

  /** Fills, borders and text lines inside `root`, in coordinates relative to `origin`. */
  function collect(root: HTMLElement, origin: { x: number; y: number }) {
    const boxes: Box[] = [];
    const lines: Line[] = [];
    const rel = (r: DOMRect): Rect => ({ x: r.left - origin.x, y: r.top - origin.y, w: r.width, h: r.height });

    for (const el of [root, ...Array.from(root.querySelectorAll<HTMLElement>('*'))]) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      const st = getComputedStyle(el);
      if (st.visibility === 'hidden' || st.display === 'none') continue;
      const fill = visible(st.backgroundColor) ? st.backgroundColor : undefined;
      const stroke = parseFloat(st.borderTopWidth) >= 1 && visible(st.borderTopColor) && r.height > 24 ? st.borderTopColor : undefined;
      if (el.tagName === 'IMG' || el.tagName === 'svg') boxes.push({ ...rel(r), fill: fill ?? 'rgba(26, 51, 0, 0.08)', stroke: PENCIL });
      else if (fill || stroke) boxes.push({ ...rel(r), fill, stroke });
    }

    const walker = document.createTreeWalker(root, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const range = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const parent = n.parentElement;
      if (!parent || parent.closest('.visually-hidden, [hidden]')) continue;
      const kind: Line['kind'] = parent.closest('h1, h2, .project__title, .statement')
        ? 'heading'
        : parent.closest('h3, h4, .callout, strong, b, [aria-current]')
          ? 'subhead'
          : 'text';
      range.selectNodeContents(n);
      for (const r of Array.from(range.getClientRects())) {
        if (r.width < 1) continue;
        // The x-height band of each line, so lines stay distinct at small scales.
        const m = rel(r);
        lines.push({ x: m.x, y: m.y + m.h * 0.28, w: m.w, h: m.h * 0.44, kind });
      }
    }
    return { boxes, lines };
  }

  function paint(c: CanvasRenderingContext2D, boxes: Box[], lines: Line[], k: number, dx: number, dy: number) {
    for (const b of boxes) {
      const x = dx + b.x * k, y = dy + b.y * k, w = b.w * k, h = b.h * k;
      if (b.fill) {
        c.fillStyle = b.fill;
        c.fillRect(x, y, w, Math.max(h, 0.5));
      }
      if (b.stroke && h > 2) {
        c.strokeStyle = b.stroke;
        c.lineWidth = 0.6;
        c.strokeRect(x + 0.3, y + 0.3, w - 0.6, h - 0.6);
      }
    }
    for (const kind of ['text', 'subhead', 'heading'] as const) {
      c.fillStyle = TONE[kind];
      for (const l of lines) {
        if (l.kind !== kind) continue;
        c.fillRect(dx + l.x * k, dy + l.y * k, l.w * k, Math.max(l.h * k, kind === 'text' ? 0.6 : 1));
      }
    }
  }

  function measure() {
    // Sticky project bars would be measured where they are stuck; read them at rest.
    const bars = Array.from(document.querySelectorAll<HTMLElement>('[data-sticky-bar]'));
    const wasStuck = bars.map((b) => b.classList.contains('is-stuck'));
    bars.forEach((b) => { b.classList.remove('is-stuck'); b.style.position = 'static'; });

    const scrollY = window.scrollY;
    pageH = Math.max(document.documentElement.scrollHeight, 1);
    const page = collect(doc!, { x: 0, y: -scrollY });

    sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]')).map((el) => {
      const r = el.getBoundingClientRect();
      const n = names.get(el.id) ?? { number: '', label: el.id };
      return { id: el.id, ...n, top: r.top + scrollY, bottom: r.bottom + scrollY };
    });

    bars.forEach((b, i) => { b.style.position = ''; b.classList.toggle('is-stuck', wasStuck[i]); });

    base.width = Math.ceil(mapW * dpr);
    base.height = Math.min(Math.ceil(pageH * s * dpr), 32000);
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.fillStyle = PAPER;
    bctx.fillRect(0, 0, mapW, pageH * s);
    paint(bctx, page.boxes, page.lines, s, 0, 0);
  }

  // ---------- Per-frame drawing ----------
  let frame = 0;
  function draw() {
    frame = 0;
    if (!W || isMin()) return;
    const vh = window.innerHeight;
    const max = pageH - vh;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    pct.textContent = `${Math.round(progress * 100)}%`;

    const c = ctx!;
    c.setTransform(dpr, 0, 0, dpr, 0, 0);
    c.clearRect(0, 0, W, H);

    // Map: slide so the box stays centred, clamped at the ends of the page.
    const boxY = window.scrollY * s;
    const boxH = vh * s;
    offset = Math.max(0, Math.min(boxY + boxH / 2 - H / 2, pageH * s - H));
    c.save();
    c.beginPath();
    c.rect(mapX, 0, mapW, H);
    c.clip();
    c.fillStyle = PAPER;
    c.fillRect(mapX, 0, mapW, H);
    c.setTransform(1, 0, 0, 1, 0, 0);
    const srcH = Math.min(H * dpr, base.height - offset * dpr);
    if (srcH > 0) c.drawImage(base, 0, offset * dpr, base.width, srcH, mapX * dpr, 0, base.width, srcH);
    c.setTransform(dpr, 0, 0, dpr, 0, 0);

    // The window, at exactly its own proportions: highlighter wash and ink outline.
    const by = boxY - offset;
    c.fillStyle = hexAlpha(YELLOW, 0.3);
    c.fillRect(mapX, by, mapW, boxH);
    c.restore();
    c.strokeStyle = INK;
    c.lineWidth = 1.5;
    roundRect(c, mapX + 0.75, by + 0.75, mapW - 1.5, boxH - 1.5, 2);
    c.stroke();

    // Rail: the whole page at once, one pencil line per section, the current one inked.
    const current = currentSection();
    c.font = `500 9px ${MONO}`;
    c.textBaseline = 'top';
    c.textAlign = 'right';
    let lastLabel = -Infinity;
    for (const sec of sections) {
      const y0 = sec.top * rs;
      const y1 = sec.bottom * rs;
      const active = sec === current;
      c.fillStyle = active ? INK : PENCIL;
      c.fillRect(RAIL - 4, y0 + 1, active ? 2 : 1, Math.max(y1 - y0 - 2, 1));
      const ly = Math.min(Math.max(y0, lastLabel + 10), H - 10); // nudge crowded labels down
      c.fillStyle = active ? INK : MUTED;
      c.fillText(sec.number, RAIL - 8, ly);
      lastLabel = ly;
    }
    // Where the window sits on the whole page
    c.fillStyle = hexAlpha(YELLOW, 0.9);
    c.fillRect(RAIL - 5, window.scrollY * rs, 4, Math.max(vh * rs, 3));
    c.fillStyle = INK;
    c.fillRect(RAIL - 5, window.scrollY * rs, 4, 1);
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };

  function sectionAt(y: number) {
    let found: Section | undefined;
    for (const sec of sections) if (sec.top <= y) found = sec;
    return found;
  }
  const currentSection = () => sectionAt(window.scrollY + window.innerHeight * 0.3);

  // ---------- Layout ----------
  function layout() {
    if (isMin()) { schedule(); return; }
    const body = canvas.parentElement!;
    const bs = getComputedStyle(body);
    W = Math.floor(body.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight));
    const head = panel.querySelector<HTMLElement>('.pnav__head')!.offsetHeight;
    H = Math.round(Math.min(360, Math.max(140, window.innerHeight * 0.42 - head)));
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    mapX = RAIL + GAP;
    mapW = W - mapX;
    s = mapW / document.documentElement.clientWidth;
    pageH = Math.max(document.documentElement.scrollHeight, 1);
    rs = (H - 2) / pageH;
    canvas.style.height = `${H}px`;
    canvas.width = Math.round(W * dpr);
    canvas.height = Math.round(H * dpr);
    measure();
    draw();
  }

  let layoutTimer = 0;
  const relayout = () => { clearTimeout(layoutTimer); layoutTimer = window.setTimeout(layout, 120); };
  new ResizeObserver(relayout).observe(doc);
  window.addEventListener('resize', relayout);
  document.fonts?.ready.then(relayout);
  doc.querySelectorAll('img').forEach((img) => { if (!img.complete) img.addEventListener('load', relayout, { once: true }); });
  window.addEventListener('scroll', schedule, { passive: true });
  layout();

  // ---------- Pointer: click to jump, drag to scroll, hover for names ----------
  const local = (e: PointerEvent) => {
    const r = canvas.getBoundingClientRect();
    return { x: e.clientX - r.left, y: e.clientY - r.top };
  };
  const onRail = (x: number) => x < mapX - GAP / 2;
  const pageYAt = (x: number, y: number) => (onRail(x) ? y / rs : (offset + y) / s);
  const overBox = (x: number, y: number) => {
    const py = pageYAt(x, y);
    return py >= window.scrollY && py <= window.scrollY + window.innerHeight;
  };
  const instant = (top: number) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
  let drag: { startY: number; startScroll: number; k: number } | null = null;

  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const p = local(e);
    const k = onRail(p.x) ? rs : s;
    if (!overBox(p.x, p.y)) {
      // Jump so the clicked point lands in the middle of the window, then keep following a drag.
      const top = pageYAt(p.x, p.y) - window.innerHeight / 2;
      instant(top);
    }
    drag = { startY: e.clientY, startScroll: window.scrollY, k };
    panel.classList.add('is-dragging');
    hideTip();
  });

  canvas.addEventListener('pointermove', (e) => {
    const p = local(e);
    if (drag) {
      instant(drag.startScroll + (e.clientY - drag.startY) / drag.k);
      return;
    }
    canvas.classList.toggle('is-over-view', overBox(p.x, p.y));
    showTip(p.x, p.y);
  });

  const endDrag = () => { drag = null; panel.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', hideTip);

  function showTip(x: number, y: number) {
    const sec = sectionAt(pageYAt(x, y));
    tipNum.textContent = sec ? sec.number : '';
    tipLabel.textContent = sec ? sec.label : 'Top of document';
    tip.style.top = `${Math.max(0, y + canvas.offsetTop - tip.offsetHeight / 2)}px`;
    tip.classList.add('is-visible');
  }
  function hideTip() { tip.classList.remove('is-visible'); }
}

function hexAlpha(hex: string, a: number) {
  const h = hex.replace('#', '');
  const v = h.length === 3 ? h.split('').map((c) => c + c).join('') : h;
  const n = parseInt(v, 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${a})`;
}

function roundRect(c: CanvasRenderingContext2D, x: number, y: number, w: number, h: number, r: number) {
  c.beginPath();
  c.moveTo(x + r, y);
  c.arcTo(x + w, y, x + w, y + h, r);
  c.arcTo(x + w, y + h, x, y + h, r);
  c.arcTo(x, y + h, x, y, r);
  c.arcTo(x, y, x + w, y, r);
  c.closePath();
}

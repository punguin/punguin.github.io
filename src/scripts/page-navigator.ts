/**
 * Navigator panel (desktop): draws a miniature of the page from its real layout,
 * marks the visible part with a highlighter box, and scrolls the page on click or drag.
 *
 * The miniature is measured once per layout change (resize, fonts, images) into an
 * offscreen canvas; scrolling only redraws the section rail and the viewport box.
 */

type Section = { id: string; number: string; label: string; top: number; bottom: number };
type Box = { x: number; y: number; w: number; h: number; fill?: string; stroke?: string };
type Line = { x: number; y: number; w: number; h: number; kind: 'text' | 'heading' | 'subhead' };

const panel = document.querySelector<HTMLElement>('[data-pnav]');
const desktop = window.matchMedia('(min-width: 1024px)');
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
  const toc = document.querySelector<HTMLElement>('.toc__inner');
  if (!ctx || !doc) return;

  const css = getComputedStyle(document.documentElement);
  const color = (name: string, fallback: string) => css.getPropertyValue(name).trim() || fallback;
  const INK = color('--forest-ink', '#1a3300');
  const YELLOW = color('--highlighter-yellow', '#ffe95c');
  const PAPER = color('--cream-paper', '#fcfaf5');
  const PENCIL = color('--pencil-gray', '#b6b6b6');
  const MUTED = color('--text-tertiary', '#5c6654');

  // Section names come from the mobile menu, which already carries number + full title.
  const names = new Map<string, { number: string; label: string }>();
  document.querySelectorAll<HTMLAnchorElement>('.mnav__menu a[data-spy]').forEach((a) => {
    names.set(a.dataset.spy!, { number: a.querySelector('.mnav__n')?.textContent ?? '', label: a.dataset.full ?? '' });
  });

  const RAIL = 30; // left column for section numbers
  const PAD = 6;
  let W = 0;
  let H = 0;
  let dpr = 1;
  let pageH = 1;
  let sy = 1;
  let sections: Section[] = [];
  const base = document.createElement('canvas');
  const bctx = base.getContext('2d')!;

  panel.hidden = false;

  // ---------- Open / minimized state ----------
  const readStored = () => {
    try { return localStorage.getItem(STORE_KEY); } catch { return null; }
  };
  const setMinimized = (min: boolean, remember = true) => {
    panel.classList.toggle('is-min', min);
    toggle.setAttribute('aria-expanded', String(!min));
    toggle.setAttribute('aria-label', min ? 'Expand navigator' : 'Minimize navigator');
    if (remember) {
      try { localStorage.setItem(STORE_KEY, min ? '1' : '0'); } catch { /* storage unavailable */ }
    }
    if (!min) requestAnimationFrame(layout);
  };
  setMinimized(readStored() === '1', false);
  toggle.addEventListener('click', () => setMinimized(!panel.classList.contains('is-min')));

  // ---------- Measure the page ----------
  function measure() {
    // Sticky project bars would be measured where they are stuck; read them at rest.
    const stuck = Array.from(document.querySelectorAll<HTMLElement>('[data-sticky-bar]'));
    const wasStuck = stuck.map((b) => b.classList.contains('is-stuck'));
    stuck.forEach((b) => { b.classList.remove('is-stuck'); b.style.position = 'static'; });

    const scrollY = window.scrollY;
    const dr = doc!.getBoundingClientRect();
    pageH = Math.max(document.documentElement.scrollHeight, 1);
    const mapW = W - RAIL - PAD;
    const sx = mapW / dr.width;
    sy = H / pageH;
    const toMap = (r: DOMRect) => ({
      x: RAIL + Math.max(0, r.left - dr.left) * sx,
      y: (r.top + scrollY) * sy,
      w: Math.min(r.width, dr.right - Math.max(r.left, dr.left)) * sx,
      h: r.height * sy,
    });

    // Cards, chips, sticky notes, highlights: anything with a fill or a visible border.
    const boxes: Box[] = [];
    for (const el of Array.from(doc!.querySelectorAll<HTMLElement>('*'))) {
      const r = el.getBoundingClientRect();
      if (r.width < 4 || r.height < 4) continue;
      const s = getComputedStyle(el);
      const fill = visible(s.backgroundColor) ? s.backgroundColor : undefined;
      const stroke = parseFloat(s.borderTopWidth) >= 1 && visible(s.borderTopColor) && r.height > 40 ? s.borderTopColor : undefined;
      if (el.tagName === 'IMG' || el.tagName === 'svg' || el.matches('.visual__frame')) {
        boxes.push({ ...toMap(r), fill: fill ?? 'rgba(26, 51, 0, 0.08)', stroke: PENCIL });
      } else if (fill || stroke) {
        boxes.push({ ...toMap(r), fill, stroke });
      }
    }

    // Text, one bar per rendered line, so the miniature keeps the page's ragged rhythm.
    const lines: Line[] = [];
    const walker = document.createTreeWalker(doc!, NodeFilter.SHOW_TEXT, {
      acceptNode: (n) => (n.textContent?.trim() ? NodeFilter.FILTER_ACCEPT : NodeFilter.FILTER_REJECT),
    });
    const range = document.createRange();
    for (let n = walker.nextNode(); n; n = walker.nextNode()) {
      const parent = n.parentElement;
      if (!parent || parent.closest('[aria-hidden="true"], .visually-hidden')) continue;
      const kind: Line['kind'] = parent.closest('h1, h2, .project__title, .statement')
        ? 'heading'
        : parent.closest('h3, h4, .callout, strong, b')
          ? 'subhead'
          : 'text';
      range.selectNodeContents(n);
      for (const r of Array.from(range.getClientRects())) {
        if (r.width < 1) continue;
        const m = toMap(r);
        // Draw the x-height band rather than the full line box, so lines stay distinct when roomy.
        lines.push({ ...m, y: m.y + m.h * 0.25, h: Math.max(m.h * 0.5, 0.6), kind });
      }
    }

    sections = Array.from(document.querySelectorAll<HTMLElement>('[data-section]')).map((el) => {
      const r = el.getBoundingClientRect();
      const n = names.get(el.id) ?? { number: '', label: el.id };
      return { id: el.id, ...n, top: r.top + scrollY, bottom: r.bottom + scrollY };
    });

    stuck.forEach((b, i) => { b.style.position = ''; b.classList.toggle('is-stuck', wasStuck[i]); });

    drawBase(boxes, lines);
  }

  function visible(c: string) {
    const m = c.match(/rgba?\(([^)]+)\)/);
    if (!m) return false;
    const parts = m[1].split(/[\s,/]+/).filter(Boolean);
    return parts.length < 4 || parseFloat(parts[3]) > 0.05;
  }

  function drawBase(boxes: Box[], lines: Line[]) {
    base.width = W * dpr;
    base.height = H * dpr;
    bctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    bctx.fillStyle = PAPER;
    bctx.fillRect(0, 0, W, H);

    for (const b of boxes) {
      if (b.fill) {
        bctx.fillStyle = b.fill;
        bctx.fillRect(b.x, b.y, b.w, Math.max(b.h, 0.75));
      }
      if (b.stroke && b.h > 2) {
        bctx.strokeStyle = b.stroke;
        bctx.lineWidth = 0.75;
        bctx.strokeRect(b.x + 0.375, b.y + 0.375, b.w - 0.75, b.h - 0.75);
      }
    }

    const tone = { text: 'rgba(26, 51, 0, 0.30)', subhead: 'rgba(26, 51, 0, 0.62)', heading: INK };
    for (const kind of ['text', 'subhead', 'heading'] as const) {
      bctx.fillStyle = tone[kind];
      for (const l of lines) if (l.kind === kind) bctx.fillRect(l.x, l.y, l.w, kind === 'heading' ? Math.max(l.h, 1.25) : l.h);
    }

    // Section dividers across the map
    bctx.fillStyle = 'rgba(26, 51, 0, 0.12)';
    for (const s of sections) bctx.fillRect(RAIL, Math.round(s.top * sy), W - RAIL - PAD, 1);
  }

  // ---------- Per-frame overlay ----------
  let frame = 0;
  function draw() {
    frame = 0;
    if (!W || panel.classList.contains('is-min')) return;
    const max = pageH - window.innerHeight;
    const progress = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
    pct.textContent = `${Math.round(progress * 100)}%`;

    ctx!.setTransform(1, 0, 0, 1, 0, 0);
    ctx!.drawImage(base, 0, 0);
    ctx!.setTransform(dpr, 0, 0, dpr, 0, 0);

    // Section rail: a pencil line per section, the current one inked, with its number.
    const current = currentSection();
    ctx!.font = `500 9px ${css.getPropertyValue('--font-mono') || 'monospace'}`;
    ctx!.textBaseline = 'top';
    let lastLabel = -Infinity;
    for (const s of sections) {
      const y0 = s.top * sy;
      const y1 = s.bottom * sy;
      const active = s === current;
      ctx!.fillStyle = active ? INK : PENCIL;
      ctx!.fillRect(RAIL - 5, y0 + 1, active ? 2 : 1, Math.max(y1 - y0 - 2, 1));
      // Nudge crowded labels down rather than dropping them.
      const ly = Math.min(Math.max(y0, lastLabel + 10), H - 10);
      ctx!.fillStyle = active ? INK : MUTED;
      ctx!.textAlign = 'right';
      ctx!.fillText(s.number, RAIL - 9, ly);
      lastLabel = ly;
    }

    // Viewport box: a highlighter wash with an ink outline.
    const vy = window.scrollY * sy;
    const vh = Math.max(window.innerHeight * sy, 6);
    ctx!.fillStyle = hexAlpha(YELLOW, 0.42);
    ctx!.strokeStyle = INK;
    ctx!.lineWidth = 1.5;
    roundRect(ctx!, RAIL - 2, vy + 0.75, W - RAIL - PAD + 4, vh - 1.5, 3);
    ctx!.fill();
    ctx!.stroke();
  }
  const schedule = () => { if (!frame) frame = requestAnimationFrame(draw); };

  function currentSection(): Section | undefined {
    const line = window.scrollY + window.innerHeight * 0.3;
    let found: Section | undefined;
    for (const s of sections) if (s.top <= line) found = s;
    return found;
  }

  // ---------- Layout ----------
  function layout() {
    if (!desktop.matches || panel.classList.contains('is-min')) { schedule(); return; }
    // Dock under the table of contents column so it never covers the document.
    if (toc) {
      const tr = toc.getBoundingClientRect();
      panel.style.right = `${document.documentElement.clientWidth - tr.right}px`;
      panel.style.width = `${tr.width}px`;
    }
    const body = canvas.parentElement!;
    const bs = getComputedStyle(body);
    W = Math.floor(body.clientWidth - parseFloat(bs.paddingLeft) - parseFloat(bs.paddingRight));
    const tocBottom = toc ? parseFloat(getComputedStyle(toc).top) + toc.offsetHeight : 0;
    const head = panel.querySelector<HTMLElement>('.pnav__head')!.offsetHeight;
    const room = window.innerHeight - tocBottom - 16 /* gap */ - 16 /* bottom */ - head - 14;
    H = Math.round(Math.min(360, Math.max(140, room)));
    dpr = Math.min(window.devicePixelRatio || 1, 3);
    canvas.style.height = `${H}px`;
    canvas.width = W * dpr;
    canvas.height = H * dpr;
    measure();
    draw();
  }

  let layoutTimer = 0;
  const relayout = () => { clearTimeout(layoutTimer); layoutTimer = window.setTimeout(layout, 120); };
  new ResizeObserver(relayout).observe(doc);
  window.addEventListener('resize', relayout);
  desktop.addEventListener('change', relayout);
  document.fonts?.ready.then(relayout);
  doc.querySelectorAll('img').forEach((img) => { if (!img.complete) img.addEventListener('load', relayout, { once: true }); });
  window.addEventListener('scroll', schedule, { passive: true });
  layout();

  // ---------- Pointer: click to jump, drag the box to scroll ----------
  const pageYAt = (clientY: number) => (clientY - canvas.getBoundingClientRect().top) / sy;
  const overView = (clientY: number) => {
    const y = pageYAt(clientY);
    return y >= window.scrollY && y <= window.scrollY + window.innerHeight;
  };
  const instant = (top: number) => window.scrollTo({ top, behavior: 'instant' as ScrollBehavior });
  let grab: { offset: number; moved: boolean } | null = null;

  canvas.addEventListener('pointerdown', (e) => {
    if (e.button !== 0) return;
    e.preventDefault();
    canvas.setPointerCapture(e.pointerId);
    const y = pageYAt(e.clientY);
    if (overView(e.clientY)) {
      grab = { offset: y - window.scrollY, moved: false };
    } else {
      // Jump so the clicked point lands in the middle of the screen, then keep following a drag.
      grab = { offset: window.innerHeight / 2, moved: false };
      window.scrollTo({ top: y - window.innerHeight / 2 });
    }
    panel.classList.add('is-dragging');
  });

  canvas.addEventListener('pointermove', (e) => {
    if (grab) {
      grab.moved = true;
      instant(pageYAt(e.clientY) - grab.offset);
      hideTip();
      return;
    }
    canvas.classList.toggle('is-over-view', overView(e.clientY));
    showTip(e.clientY);
  });

  const endDrag = () => { grab = null; panel.classList.remove('is-dragging'); };
  canvas.addEventListener('pointerup', endDrag);
  canvas.addEventListener('pointercancel', endDrag);
  canvas.addEventListener('pointerleave', hideTip);

  function showTip(clientY: number) {
    const y = pageYAt(clientY);
    let s: Section | undefined;
    for (const sec of sections) if (sec.top <= y) s = sec;
    tipNum.textContent = s ? s.number : '';
    tipLabel.textContent = s ? s.label : 'Top of document';
    const cr = canvas.getBoundingClientRect();
    const local = clientY - cr.top + canvas.offsetTop;
    tip.style.top = `${Math.max(0, local - tip.offsetHeight / 2)}px`;
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

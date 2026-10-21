// "View as a presentation": turns the case study already on the page into 16:9 slides, with no
// separate slide content to keep in sync. Headlines, impact, decisions, images and callouts become
// slides; the narrative paragraphs around them become each slide's speaker notes.
//
// Slides are laid out on a fixed 1280 × 720 canvas and scaled to the screen, like a slide app.
// Keys: → ↓ Space PageDown next · ← ↑ PageUp previous · Home/End · N notes · P presenter window ·
// F fullscreen · Esc exit. The presenter window (?presenter) shows the current and next slide,
// the notes and a timer, and drives the audience view through a BroadcastChannel.

const W = 1280;
const H = 720;

const body = document.querySelector<HTMLElement>('.project--page .project__body');
const article = body?.closest<HTMLElement>('.project');
const hero = document.querySelector<HTMLElement>('.case-hero');
const trigger = document.querySelector<HTMLButtonElement>('[data-present]');

interface Slide {
  el: HTMLElement;
  notes: HTMLElement;
  title: string;
  source: Element | null;
}

const make = <K extends keyof HTMLElementTagNameMap>(tag: K, cls?: string, text?: string) => {
  const el = document.createElement(tag);
  if (cls) el.className = cls;
  if (text) el.textContent = text;
  return el;
};
const textOf = (el: Element | null | undefined) => (el?.textContent ?? '').replace(/\s+/g, ' ').trim();

/** A copy of page content that is safe to show twice: no ids, no in-page links, no audit tags. */
function copy<T extends Element>(el: T): T {
  const c = el.cloneNode(true) as T;
  c.removeAttribute('id');
  c.querySelectorAll('[id]').forEach((n) => n.removeAttribute('id'));
  c.querySelectorAll('.old-image-tag, .case-decisions__more, .private-lock--block, .private-lock__chip, .private-lock__btn').forEach((n) => n.remove());
  c.querySelectorAll('a').forEach((a) => a.replaceWith(...Array.from(a.childNodes)));
  const imgs = c instanceof HTMLImageElement ? [c] : Array.from(c.querySelectorAll('img'));
  imgs.forEach((img) => {
    img.loading = 'eager';
    img.removeAttribute('tabindex');
    img.removeAttribute('role');
    img.removeAttribute('data-old-image');
  });
  return c;
}

function build(): Slide[] {
  if (!body || !article) return [];
  const caseTitle = textOf(hero?.querySelector('.case-hero__title .visually-hidden')).replace(/:$/, '') || document.title;
  const slides: Slide[] = [];
  let kicker = '';
  let current: Slide | null = null;
  let pendingTitle: Element | null = null;

  const addSlide = (kind: string, title: string, main: Node[], opts: { kicker?: string; source?: Element | null; bare?: boolean } = {}) => {
    if (pendingTitle && current) current.notes.append(copy(pendingTitle));
    pendingTitle = null;
    const el = make('section', `deck-slide deck-slide--${kind}`);
    el.setAttribute('aria-roledescription', 'slide');
    if (!opts.bare) {
      const top = make('header', 'deck-slide__top');
      top.append(make('span', 'deck-slide__kicker', opts.kicker ?? kicker), make('span', 'deck-slide__case', caseTitle));
      el.append(top);
    }
    const fit = make('div', 'deck-fit prose project__body');
    fit.append(...main);
    const wrap = make('div', 'deck-slide__main');
    wrap.append(fit);
    el.append(wrap);
    current = { el, notes: make('div', 'deck-notes prose'), title, source: opts.source ?? null };
    slides.push(current);
    return current;
  };
  const note = (el: Element) => current?.notes.append(copy(el));

  // Title slide, from the hero.
  if (hero) {
    const head = make('div', 'deck-title');
    head.append(
      make('p', 'deck-title__kicker', textOf(hero.querySelector('.case-hero__kicker'))),
      make('h2', 'deck-title__headline', textOf(hero.querySelector('.case-hero__title')).replace(caseTitle + ':', '').trim()),
      make('p', 'deck-title__case', caseTitle),
    );
    const s = addSlide('title', caseTitle, [head], { bare: true, source: hero });
    const cover = hero.querySelector('.case-hero__media');
    if (cover) s.el.append(copy(cover));
  }

  const kids = Array.from(body.children);
  for (let i = 0; i < kids.length; i++) {
    const el = kids[i];
    const next = kids[i + 1];
    const cls = el.classList;
    const tag = el.tagName;
    const isPlainP = (n?: Element) => n?.tagName === 'P' && !n.classList.contains('label') && !n.classList.contains('callout') && !n.classList.contains('case-methods');

    if (tag === 'H4' || tag === 'H5') {
      // "#### 01 / Impact" or "##### 3.1 People": the line after it is the headline.
      kicker = textOf(el);
      const level = tag === 'H4' ? 'section' : 'sub';
      const main: Node[] = [];
      let headline = '';
      // A short line is the headline; a long one is narrative, so it goes to the notes instead.
      if ((isPlainP(next) || next?.classList.contains('case-insight')) && textOf(next).length <= 160) {
        headline = textOf(next);
        main.push(make('h2', `deck-headline deck-headline--${level}`, headline));
        i++;
      } else {
        main.push(make('h2', `deck-headline deck-headline--${level}`, kicker.replace(/^[\d.\s/]+/, '')));
      }
      const after = kids[i + 1];
      if (after?.matches('p.case-status')) { main.unshift(make('p', 'deck-status', textOf(after))); i++; }
      const list = kids[i + 1];
      if (list?.matches('.case-impact, .case-decisions')) { main.push(copy(list)); i++; }
      const isDivider = level === 'section' && main.length === 1;
      addSlide(isDivider ? 'divider' : level, headline || kicker, main, { source: el });
      continue;
    }

    if (tag === 'DL' && cls.contains('case-overview')) {
      // Overview rows on one slide; a row holding a list (e.g. "What I owned") gets its own slide.
      kicker = '00 / Overview';
      const rows = Array.from(el.children);
      const short = rows.filter((r) => !r.querySelector('ul, ol'));
      const dl = make('dl', 'deck-overview');
      short.forEach((r) => dl.append(copy(r)));
      addSlide('overview', 'Overview', [dl], { source: el });
      rows.filter((r) => r.querySelector('ul, ol')).forEach((r) => {
        const list = copy(r.querySelector('ul, ol')!);
        list.classList.add('deck-list');
        addSlide('list', textOf(r.querySelector('dt')), [make('h2', 'deck-headline deck-headline--list', textOf(r.querySelector('dt'))), list], { source: el });
      });
      continue;
    }

    if (cls.contains('case-impact') || cls.contains('case-decisions')) {
      addSlide('sub', kicker, [copy(el)], { source: el });
      continue;
    }

    if (tag === 'P' && cls.contains('concept-eval__title')) {
      if (pendingTitle) note(pendingTitle);
      pendingTitle = el;
      continue;
    }

    if (tag === 'P' && cls.contains('label') && !cls.contains('case-status')) {
      // "Tenets" + a list, or "Concept evaluation" + a headline for the next figure.
      if (next && (next.tagName === 'UL' || next.tagName === 'OL')) {
        const list = copy(next);
        list.classList.add('deck-list');
        addSlide('list', textOf(el), [make('h2', 'deck-headline deck-headline--list', textOf(el)), list], { source: el });
        i++;
      } else if (next?.classList.contains('concept-eval__title')) {
        addSlide('sub', textOf(next), [make('p', 'deck-status', textOf(el)), make('h2', 'deck-headline deck-headline--sub', textOf(next))], { source: el });
        i++;
      } else note(el);
      continue;
    }

    if (tag === 'FIGURE' || tag === 'TABLE') {
      const main: Node[] = [];
      const title = pendingTitle ? textOf(pendingTitle) : '';
      if (pendingTitle) main.push(make('h2', 'deck-headline deck-headline--visual', title));
      pendingTitle = null;
      const fig = copy(el);
      fig.classList.add('deck-figure');
      if (fig.matches('figure') && fig.querySelectorAll('img').length === 1 && fig.querySelector(':scope > img')) fig.classList.add('deck-figure--single');
      main.push(fig);
      addSlide('visual', title || textOf(el.querySelector('figcaption')) || 'Image', main, { source: el });
      continue;
    }

    if (cls.contains('callout') || cls.contains('decision-callout') || cls.contains('case-aside')) {
      const kind = cls.contains('callout') ? 'quote' : 'callout';
      addSlide(kind, textOf(el), [copy(el)], { source: el });
      continue;
    }

    // Everything else is narrative: it becomes the current slide's speaker notes.
    note(el);
  }
  if (pendingTitle && current) (current as Slide).notes.append(copy(pendingTitle));
  return slides;
}

/** Scale content down until it fits its slide; a lone image is sized to the space left. */
function fit(slide: HTMLElement) {
  const main = slide.querySelector<HTMLElement>('.deck-slide__main');
  const inner = main?.firstElementChild as HTMLElement | null;
  if (!main || !inner) return;
  inner.classList.remove('is-scaled');
  inner.style.transform = '';
  inner.style.width = '';
  const single = inner.querySelector<HTMLImageElement>('.deck-figure--single > img');
  if (single?.naturalWidth) {
    single.style.width = '';
    single.style.height = '';
    single.style.maxWidth = 'none';
    const ratio = single.naturalWidth / single.naturalHeight;
    const rest = inner.scrollHeight - single.offsetHeight;
    const w = Math.min(inner.clientWidth, Math.max(120, main.clientHeight - rest) * ratio);
    single.style.width = `${w}px`;
    single.style.height = `${w / ratio}px`;
  }
  const mainW = main.clientWidth;
  const mainH = main.clientHeight;
  if (inner.scrollHeight <= mainH && inner.scrollWidth <= mainW) return;
  // Too big: give the content a wider box and scale it down by the same factor, so it keeps
  // its proportions and fills the slide width.
  inner.classList.add('is-scaled');
  const fits = (k: number) => {
    inner.style.width = `${mainW / k}px`;
    return inner.scrollHeight * k <= mainH + 1;
  };
  let lo = 0.3;
  let hi = 1;
  for (let n = 0; n < 8; n++) {
    const mid = (lo + hi) / 2;
    if (fits(mid)) lo = mid; else hi = mid;
  }
  const s = lo;
  fits(s);
  const y = Math.max(0, (mainH - inner.scrollHeight * s) / 2);
  inner.style.transform = `translate(0, ${y}px) scale(${s})`;
}

/** Scale a 1280 × 720 canvas to fill its stage, centred. */
function scaleCanvas(stage: HTMLElement) {
  const canvas = stage.querySelector<HTMLElement>('.deck__canvas');
  if (!canvas) return;
  const s = Math.min(stage.clientWidth / W, stage.clientHeight / H);
  canvas.style.transform = `translate(-50%, -50%) scale(${s})`;
}

const params = new URLSearchParams(location.search);
const isPresenter = params.has('presenter');
const channel = 'BroadcastChannel' in window && article ? new BroadcastChannel(`case-deck:${article.id}`) : null;

let slides: Slide[] = [];
let deck: HTMLElement | null = null;
let index = 0;
let opener: HTMLElement | null = null;
let ignoreFullscreenExitUntil = 0;
let startedAt = 0;
let timer = 0;

function ensureDeck() {
  if (deck) return deck;
  slides = build();
  deck = make('div', 'deck');
  deck.hidden = true;
  deck.dataset.noAudit = '';
  deck.tabIndex = -1;
  if (hero) deck.style.setProperty('--case-color', getComputedStyle(hero).backgroundColor);
  deck.setAttribute('role', 'dialog');
  deck.setAttribute('aria-modal', 'true');
  deck.setAttribute('aria-label', isPresenter ? 'Speaker notes' : 'Presentation');
  deck.innerHTML = `
    <div class="deck__stage deck__stage--main"><div class="deck__canvas"></div></div>
    <aside class="deck__side" aria-label="Speaker notes">
      <div class="deck__next" hidden>
        <p class="deck__side-label">Next</p>
        <div class="deck__stage deck__stage--next"><div class="deck__canvas"></div></div>
      </div>
      <div class="deck__side-head">
        <p class="deck__side-label">Speaker notes</p>
        <p class="deck__timer" hidden>00:00</p>
      </div>
      <div class="deck__notes"></div>
    </aside>
    <div class="deck__bar">
      <button type="button" class="deck__btn" data-act="prev" aria-label="Previous slide"><span aria-hidden="true">←</span></button>
      <p class="deck__count" aria-live="polite"></p>
      <button type="button" class="deck__btn" data-act="next" aria-label="Next slide"><span aria-hidden="true">→</span></button>
      <span class="deck__bar-gap"></span>
      <button type="button" class="deck__btn deck__btn--text" data-act="notes" aria-pressed="false" title="Speaker notes (N)">Notes</button>
      <button type="button" class="deck__btn deck__btn--text" data-act="presenter" title="Open speaker notes in a new window (P)">Presenter view</button>
      <button type="button" class="deck__btn" data-act="fullscreen" aria-label="Full screen (F)" title="Full screen (F)"><span aria-hidden="true">⤢</span></button>
      <button type="button" class="deck__btn" data-act="close" aria-label="Exit presentation (Esc)" title="Exit (Esc)"><span aria-hidden="true">×</span></button>
    </div>
    <div class="deck__progress" aria-hidden="true"><span></span></div>
  `;
  const canvas = deck.querySelector<HTMLElement>('.deck__stage--main .deck__canvas')!;
  slides.forEach((s, i) => {
    s.el.setAttribute('aria-label', `Slide ${i + 1} of ${slides.length}: ${s.title}`);
    s.el.hidden = true;
    canvas.append(s.el);
    s.el.querySelectorAll('img').forEach((img) => img.addEventListener('load', () => { if (!s.el.hidden) fit(s.el); }));
  });
  if (isPresenter) {
    deck.classList.add('deck--presenter', 'deck--notes');
    deck.querySelector<HTMLElement>('.deck__next')!.hidden = false;
    deck.querySelector<HTMLElement>('.deck__timer')!.hidden = false;
    deck.querySelector<HTMLElement>('[data-act="presenter"]')!.hidden = true;
    deck.querySelector<HTMLElement>('[data-act="notes"]')!.hidden = true;
    deck.querySelector<HTMLElement>('[data-act="fullscreen"]')!.hidden = true;
  }
  document.body.append(deck);

  deck.addEventListener('click', (e) => {
    const btn = (e.target as Element).closest<HTMLElement>('[data-act]');
    if (btn) {
      const act = btn.dataset.act;
      if (act === 'prev') go(index - 1);
      if (act === 'next') go(index + 1);
      if (act === 'notes') toggleNotes();
      if (act === 'presenter') openPresenter();
      if (act === 'fullscreen') toggleFullscreen();
      if (act === 'close') close();
      return;
    }
    // Clicking the slide itself moves forward, like a slide app.
    if ((e.target as Element).closest('.deck__stage--main')) go(index + 1);
  });

  let touchX = 0;
  let touchY = 0;
  deck.addEventListener('touchstart', (e) => { touchX = e.touches[0].clientX; touchY = e.touches[0].clientY; }, { passive: true });
  deck.addEventListener('touchend', (e) => {
    const dx = e.changedTouches[0].clientX - touchX;
    const dy = e.changedTouches[0].clientY - touchY;
    if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) go(index + (dx < 0 ? 1 : -1));
  });

  // Hide the control bar while presenting; it comes back when the pointer moves.
  let idle = 0;
  deck.addEventListener('pointermove', () => {
    deck!.classList.remove('is-idle');
    clearTimeout(idle);
    idle = window.setTimeout(() => deck!.classList.add('is-idle'), 2500);
  });

  const ro = new ResizeObserver(() => layout());
  deck.querySelectorAll<HTMLElement>('.deck__stage').forEach((s) => ro.observe(s));
  return deck;
}

function layout() {
  if (!deck) return;
  deck.querySelectorAll<HTMLElement>('.deck__stage').forEach(scaleCanvas);
  const s = slides[index];
  if (s) fit(s.el);
  const preview = deck.querySelector<HTMLElement>('.deck__stage--next .deck-slide');
  if (preview) fit(preview);
}

function go(i: number, from?: 'remote') {
  if (!deck || !slides.length) return;
  const n = Math.max(0, Math.min(slides.length - 1, i));
  const prev = slides[index];
  index = n;
  if (prev) prev.el.hidden = true;
  const s = slides[n];
  s.el.hidden = false;
  fit(s.el);
  deck.querySelector('.deck__count')!.textContent = `${n + 1} / ${slides.length}`;
  deck.querySelector<HTMLElement>('.deck__progress span')!.style.width = `${((n + 1) / slides.length) * 100}%`;
  const notes = deck.querySelector<HTMLElement>('.deck__notes')!;
  notes.replaceChildren(make('p', 'deck-notes__title', s.title), ...(s.notes.childElementCount ? Array.from(s.notes.cloneNode(true).childNodes) : [make('p', 'deck-notes__empty', 'No notes for this slide.')]));
  notes.scrollTop = 0;
  if (isPresenter) {
    const next = deck.querySelector<HTMLElement>('.deck__stage--next .deck__canvas')!;
    const following = slides[n + 1];
    next.replaceChildren();
    if (following) {
      const c = following.el.cloneNode(true) as HTMLElement;
      c.hidden = false;
      next.append(c);
      c.querySelectorAll('img').forEach((img) => img.addEventListener('load', () => fit(c)));
      requestAnimationFrame(() => fit(c));
    } else next.append(make('p', 'deck__end', 'End of presentation'));
  }
  (deck.querySelector('[data-act="prev"]') as HTMLButtonElement).disabled = n === 0;
  (deck.querySelector('[data-act="next"]') as HTMLButtonElement).disabled = n === slides.length - 1;
  if (from !== 'remote') channel?.postMessage({ type: 'go', index: n });
}

function toggleNotes(force?: boolean) {
  if (!deck || isPresenter) return;
  const on = deck.classList.toggle('deck--notes', force);
  deck.querySelector('[data-act="notes"]')!.setAttribute('aria-pressed', String(on));
  requestAnimationFrame(layout);
}

function toggleFullscreen() {
  if (!deck) return;
  // F leaves full screen but keeps presenting in the window (handy for sharing one window on a call).
  if (document.fullscreenElement) { ignoreFullscreenExitUntil = Date.now() + 1500; document.exitFullscreen?.(); }
  else deck.requestFullscreen?.().catch(() => {});
}

function openPresenter() {
  // Browsers may leave full screen when a new window opens; keep the presentation running.
  ignoreFullscreenExitUntil = Date.now() + 1500;
  const url = new URL(location.href);
  url.search = '?presenter';
  url.hash = '';
  window.open(url.href, `case-deck-${article?.id}`, 'popup,width=1200,height=760');
}

function onKey(e: KeyboardEvent) {
  if (!deck || deck.hidden || e.metaKey || e.ctrlKey || e.altKey) return;
  const onButton = (e.target as Element).closest?.('button');
  const k = e.key;
  if (['ArrowRight', 'ArrowDown', 'PageDown'].includes(k) || (k === ' ' && !onButton)) { e.preventDefault(); go(index + 1); }
  else if (['ArrowLeft', 'ArrowUp', 'PageUp'].includes(k)) { e.preventDefault(); go(index - 1); }
  else if (k === 'Home') { e.preventDefault(); go(0); }
  else if (k === 'End') { e.preventDefault(); go(slides.length - 1); }
  else if (k === 'n' || k === 'N') toggleNotes();
  else if ((k === 'p' || k === 'P') && !isPresenter) openPresenter();
  else if ((k === 'f' || k === 'F') && !isPresenter) toggleFullscreen();
  else if (k === 'Escape') { e.preventDefault(); close(); }
}

function open(start = 0) {
  const d = ensureDeck();
  if (!slides.length) return;
  opener = document.activeElement as HTMLElement | null;
  d.hidden = false;
  document.documentElement.classList.add('has-deck');
  document.addEventListener('keydown', onKey);
  if (!isPresenter) d.requestFullscreen?.().catch(() => {});
  // Start clean: the slide shown when the presentation was last closed is still unhidden.
  slides.forEach((sl) => { sl.el.hidden = true; });
  index = 0;
  // The presenter window waits for the audience view to say where it is.
  go(start, isPresenter ? 'remote' : undefined);
  requestAnimationFrame(layout);
  d.focus({ preventScroll: true });
  if (isPresenter) {
    startedAt = Date.now();
    const t = d.querySelector<HTMLElement>('.deck__timer')!;
    timer = window.setInterval(() => {
      const sec = Math.floor((Date.now() - startedAt) / 1000);
      t.textContent = `${String(Math.floor(sec / 60)).padStart(2, '0')}:${String(sec % 60).padStart(2, '0')}`;
    }, 1000);
  }
}

function close() {
  if (!deck || deck.hidden) return;
  if (isPresenter) { window.close(); return; }
  deck.hidden = true;
  document.documentElement.classList.remove('has-deck');
  document.removeEventListener('keydown', onKey);
  clearInterval(timer);
  if (document.fullscreenElement) document.exitFullscreen?.().catch(() => {});
  // Land on the part of the case study the presentation had reached.
  const src = slides[index]?.source;
  if (src && index > 0) src.scrollIntoView({ block: 'start' });
  opener?.focus({ preventScroll: true });
}

document.addEventListener('fullscreenchange', () => {
  // Leaving full screen with Esc ends the presentation; F or opening the presenter window doesn't.
  if (!document.fullscreenElement && deck && !deck.hidden && Date.now() > ignoreFullscreenExitUntil) close();
});

channel?.addEventListener('message', (e) => {
  const msg = e.data as { type: string; index?: number };
  if (msg.type === 'go' && deck && !deck.hidden && msg.index !== index) go(msg.index ?? 0, 'remote');
  // A presenter window just opened: tell it where the audience view is.
  if (msg.type === 'hello' && !isPresenter && deck && !deck.hidden) channel.postMessage({ type: 'go', index });
});

if (body) {
  if (isPresenter) {
    document.title = `Speaker notes · ${document.title}`;
    open(0);
    channel?.postMessage({ type: 'hello' });
  } else if (trigger) {
    trigger.hidden = false;
    trigger.addEventListener('click', () => open(0));
  }
}

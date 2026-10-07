/**
 * Document navigation behaviour:
 *  - scroll spy (IntersectionObserver on a thin activation line ~30% down the viewport)
 *  - sticky project header compact state
 *  - mobile MENU toggle
 *  - mobile scroll section indicator + tooltip
 * Native anchors handle hash updates, smooth scrolling (CSS) and Back/Forward.
 */

type Meta = { number: string; label: string; accent?: string };

const targets = Array.from(document.querySelectorAll<HTMLElement>('#top, [data-section]'));
const spyLinks = Array.from(document.querySelectorAll<HTMLAnchorElement>('a[data-spy]'));
const meta = new Map<string, Meta>();
document.querySelectorAll<HTMLAnchorElement>('.mnav__menu a[data-spy]').forEach((a) => {
  meta.set(a.dataset.spy!, {
    number: a.querySelector('.mnav__n')?.textContent ?? '',
    label: a.dataset.full ?? '',
    accent: a.dataset.accent,
  });
});

const mnav = document.querySelector<HTMLElement>('[data-mnav]');
const mnavNum = document.querySelector<HTMLElement>('[data-mnav-num]');
const mnavLabel = document.querySelector<HTMLElement>('[data-mnav-label]');
const mnavCurrent = document.querySelector<HTMLAnchorElement>('[data-mnav-current]');
const ssi = document.querySelector<HTMLElement>('[data-ssi]');
const ssiNum = document.querySelector<HTMLElement>('[data-ssi-num]');
const ssiLabel = document.querySelector<HTMLElement>('[data-ssi-label]');

let activeId = '';

function setActive(id: string) {
  if (id === activeId) return;
  activeId = id;
  for (const a of spyLinks) {
    if (a.dataset.spy === id) a.setAttribute('aria-current', 'location');
    else a.removeAttribute('aria-current');
  }
  const m = meta.get(id);
  if (!m) return;
  if (mnavNum) mnavNum.textContent = m.number;
  if (mnavLabel) mnavLabel.textContent = m.label;
  if (mnavCurrent) mnavCurrent.href = `#${id}`;
  mnav?.style.setProperty('--mnav-accent', m.accent ? `var(--accent-${m.accent})` : 'transparent');
  if (ssiNum) ssiNum.textContent = id === 'top' ? '' : m.number;
  if (ssiLabel) ssiLabel.textContent = id === 'top' ? 'Top of document' : m.label;
}

/** The active target is the last one (in document order) whose top has crossed the activation line. */
function resolveActive() {
  const line = window.innerHeight * 0.3;
  let current = targets[0]?.id ?? 'top';
  for (const el of targets) {
    if (el.getBoundingClientRect().top <= line) current = el.id;
    else break;
  }
  // At the very bottom, the last section may never reach the line.
  if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 2) {
    current = targets[targets.length - 1].id;
  }
  setActive(current);
}

// IntersectionObserver fires only when a target edge crosses the 1px activation line,
// so we never measure on raw scroll events.
const spy = new IntersectionObserver(() => resolveActive(), {
  rootMargin: '-30% 0px -70% 0px',
  threshold: 0,
});
targets.forEach((el) => spy.observe(el));
const footer = document.querySelector('footer.site-footer');
if (footer) new IntersectionObserver(() => resolveActive(), { threshold: [0, 1] }).observe(footer);
window.addEventListener('hashchange', () => requestAnimationFrame(resolveActive));
resolveActive();

// ---------- Side column start ----------
// Line the TOC up with the white page (section 01) rather than the hero.
const shell = document.querySelector<HTMLElement>('.page-shell');
const sheet = document.querySelector<HTMLElement>('.sheet') ?? targets[1];
if (shell && sheet) {
  const alignToc = () => {
    const offset = sheet.getBoundingClientRect().top - shell.getBoundingClientRect().top;
    shell.style.setProperty('--toc-start', `${Math.max(0, Math.round(offset))}px`);
  };
  alignToc();
  new ResizeObserver(alignToc).observe(shell);
  document.fonts?.ready.then(alignToc);
}

// ---------- Sticky project headers ----------
// Checked on scroll (rAF-throttled) rather than by IntersectionObserver alone: an instant jump
// from above a project to inside it never changes the sentinel's intersection, so no entry fires.
const sentinels = Array.from(document.querySelectorAll<HTMLElement>('[data-sticky-sentinel]'));
let stickyFrame = 0;
const updateSticky = () => {
  stickyFrame = 0;
  for (const s of sentinels) {
    const bar = s.nextElementSibling as HTMLElement | null;
    bar?.classList.toggle('is-stuck', s.getBoundingClientRect().top < 0);
  }
};
window.addEventListener('scroll', () => { if (!stickyFrame) stickyFrame = requestAnimationFrame(updateSticky); }, { passive: true });
updateSticky();

// ---------- Mobile menu ----------
const toggle = document.querySelector<HTMLButtonElement>('[data-mnav-toggle]');
const toggleLabel = document.querySelector<HTMLElement>('[data-mnav-toggle-label]');
const menu = document.getElementById('mnav-menu');

function setMenu(open: boolean, restoreFocus = false) {
  if (!toggle || !menu) return;
  toggle.setAttribute('aria-expanded', String(open));
  menu.hidden = !open;
  if (toggleLabel) toggleLabel.textContent = open ? 'Close' : 'Menu';
  if (open) menu.querySelector<HTMLElement>('a[aria-current]')?.scrollIntoView({ block: 'nearest' });
  if (!open && restoreFocus) toggle.focus();
}
toggle?.addEventListener('click', () => setMenu(toggle.getAttribute('aria-expanded') !== 'true'));
menu?.addEventListener('click', (e) => {
  if ((e.target as HTMLElement).closest('a')) setMenu(false);
});
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape' && toggle?.getAttribute('aria-expanded') === 'true') setMenu(false, true);
});
document.addEventListener('click', (e) => {
  if (toggle?.getAttribute('aria-expanded') === 'true' && !mnav?.contains(e.target as Node)) setMenu(false);
});
const desktop = window.matchMedia('(min-width: 1024px)');
desktop.addEventListener('change', () => setMenu(false));

// ---------- Mobile scroll section indicator ----------
if (ssi) {
  const track = ssi.querySelector<HTMLElement>('[data-ssi-track]')!;
  const thumb = ssi.querySelector<HTMLElement>('[data-ssi-thumb]')!;
  const tip = ssi.querySelector<HTMLElement>('[data-ssi-tip]')!;
  let hideTimer = 0;
  let frame = 0;

  // Section ticks: measured once per layout change, not per scroll.
  const layoutTicks = () => {
    const docH = document.documentElement.scrollHeight;
    track.replaceChildren(
      ...targets.slice(1).map((el) => {
        const i = document.createElement('i');
        i.style.top = `${((el.getBoundingClientRect().top + window.scrollY) / docH) * 100}%`;
        return i;
      }),
    );
  };

  const update = () => {
    frame = 0;
    const max = document.documentElement.scrollHeight - window.innerHeight;
    const progress = max > 0 ? window.scrollY / max : 0;
    const h = ssi.clientHeight - thumb.offsetHeight;
    const y = Math.round(progress * h);
    thumb.style.transform = `translateY(${y}px)`;
    const tipY = Math.min(Math.max(y - 8, 0), ssi.clientHeight - tip.offsetHeight);
    tip.style.transform = `translateY(${tipY}px)`;
  };

  window.addEventListener(
    'scroll',
    () => {
      if (desktop.matches) return;
      if (!frame) frame = requestAnimationFrame(update);
      ssi.classList.add('is-active');
      clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => ssi.classList.remove('is-active'), 900);
    },
    { passive: true },
  );

  layoutTicks();
  new ResizeObserver(() => layoutTicks()).observe(document.body);
  document.fonts?.ready.then(layoutTicks);
}

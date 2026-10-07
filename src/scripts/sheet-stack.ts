// The white page sits on a loose pile of paper. The first time the reader scrolls far enough
// (the top of the page a quarter of the way up from the bottom of the screen), the pile is stacked:
// the sheets underneath drop in one after another and the page lands last. It plays once.
function initSheetStack(): void {
  const wrap = document.querySelector<HTMLElement>('.sheet-wrap');
  const sheet = wrap?.querySelector<HTMLElement>('.sheet');
  if (!wrap || !sheet || !('IntersectionObserver' in window)) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  const TRIGGER = 0.75; // fraction of the screen height
  // Already past the trigger (a reload partway down) or arriving on a link to a section: just show the pile.
  if (location.hash || wrap.getBoundingClientRect().top < innerHeight * TRIGGER) return;

  wrap.classList.add('is-waiting');
  const io = new IntersectionObserver((entries) => {
    const entry = entries.find((e) => e.isIntersecting);
    if (!entry) return;
    io.disconnect();
    // Jumped straight past it (a link to a later section): show the page at once, no stacking.
    if (entry.boundingClientRect.top < 0) wrap.classList.remove('is-waiting');
    else wrap.classList.replace('is-waiting', 'is-stacking');
  }, { rootMargin: `0px 0px -${(1 - TRIGGER) * 100}% 0px` });
  io.observe(wrap);
  // Once the page has landed, drop the animation so it no longer holds a transform (sticky bars and the TOC stay simple).
  const landed = (e: AnimationEvent): void => {
    if (e.target !== sheet) return; // animations inside the page bubble up here too
    sheet.removeEventListener('animationend', landed);
    wrap.classList.remove('is-stacking');
  };
  sheet.addEventListener('animationend', landed);
}

initSheetStack();

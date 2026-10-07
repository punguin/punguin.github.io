// The white page sits on a loose pile of paper. As the page scrolls into view the sheets
// underneath start fanned out and the page itself a little crooked; they square up and the page
// straightens, like a pile being tidied before reading.
function initSheetStack(): void {
  const wrap = document.querySelector<HTMLElement>('.sheet-wrap');
  const sheet = wrap?.querySelector<HTMLElement>('.sheet');
  if (!wrap || !sheet) return;
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) {
    sheet.classList.add('is-settled');
    return;
  }
  let queued = false;
  const update = (): void => {
    queued = false;
    // The wrapper's top, because the page itself is tilted while this runs.
    const top = wrap.getBoundingClientRect().top;
    // 0 while the page is still below the fold, 1 once its top is a fifth of the way down the screen.
    const p = Math.min(1, Math.max(0, (innerHeight - top) / (innerHeight * 0.8)));
    const fan = Math.pow(1 - p, 2);
    wrap.style.setProperty('--fan', fan.toFixed(3));
    sheet.classList.toggle('is-settled', fan === 0);
  };
  const queue = (): void => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
}

initSheetStack();

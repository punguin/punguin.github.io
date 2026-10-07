// The white page sits on a loose stack of paper. As the page scrolls into view the sheets
// underneath start fanned out and square up, like a pile being tidied before reading.
function initSheetStack(): void {
  const sheet = document.querySelector<HTMLElement>('.sheet');
  if (!sheet || window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  let queued = false;
  const update = (): void => {
    queued = false;
    const top = sheet.getBoundingClientRect().top;
    // 0 while the page is still below the fold, 1 once its top is a fifth of the way down the screen.
    const p = Math.min(1, Math.max(0, (innerHeight - top) / (innerHeight * 0.8)));
    const fan = Math.pow(1 - p, 2);
    sheet.style.setProperty('--fan', fan.toFixed(3));
  };
  const queue = (): void => {
    if (!queued) { queued = true; requestAnimationFrame(update); }
  };
  addEventListener('scroll', queue, { passive: true });
  addEventListener('resize', queue);
  update();
}

initSheetStack();

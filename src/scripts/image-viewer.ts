// Click any image in a case study to see it larger. Previous and next cycle through
// the case study's images in page order; arrow keys do the same, Escape closes.

const images = Array.from(
  document.querySelectorAll<HTMLImageElement>('.project__body img'),
).filter((img) => !img.closest('a, .is-placeholder'));

if (images.length) {
  const many = images.length > 1;
  const dialog = document.createElement('dialog');
  dialog.className = 'viewer';
  dialog.setAttribute('aria-label', 'Image viewer');
  dialog.innerHTML = `
    <div class="viewer__bar">
      <p class="viewer__count" aria-live="polite"></p>
      <button type="button" class="viewer__btn viewer__close" aria-label="Close">
        <span aria-hidden="true">×</span>
      </button>
    </div>
    <figure class="viewer__stage">
      <img class="viewer__img" alt="" />
      <figcaption class="viewer__caption"></figcaption>
    </figure>
    ${many ? `
    <button type="button" class="viewer__btn viewer__nav viewer__prev" aria-label="Previous image">
      <span aria-hidden="true">←</span>
    </button>
    <button type="button" class="viewer__btn viewer__nav viewer__next" aria-label="Next image">
      <span aria-hidden="true">→</span>
    </button>` : ''}
  `;
  document.body.append(dialog);

  const big = dialog.querySelector<HTMLImageElement>('.viewer__img')!;
  const caption = dialog.querySelector<HTMLElement>('.viewer__caption')!;
  const count = dialog.querySelector<HTMLElement>('.viewer__count')!;
  let current = 0;
  let opener: HTMLElement | null = null;

  const captionFor = (img: HTMLImageElement) =>
    img.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || '';

  const show = (i: number) => {
    current = (i + images.length) % images.length;
    const img = images[current];
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    const text = captionFor(img);
    caption.textContent = text;
    caption.hidden = !text;
    count.textContent = many ? `${current + 1} of ${images.length}` : '';
  };

  const open = (i: number) => {
    opener = images[i];
    show(i);
    dialog.showModal();
    document.documentElement.classList.add('has-viewer');
  };

  dialog.addEventListener('close', () => {
    document.documentElement.classList.remove('has-viewer');
    big.removeAttribute('src');
    opener?.focus();
  });

  // A click on the dark backdrop (outside the image and buttons) closes it.
  dialog.addEventListener('click', (e) => {
    const t = e.target as HTMLElement;
    if (t === dialog || t.classList.contains('viewer__stage')) dialog.close();
  });
  dialog.querySelector('.viewer__close')!.addEventListener('click', () => dialog.close());
  dialog.querySelector('.viewer__prev')?.addEventListener('click', () => show(current - 1));
  dialog.querySelector('.viewer__next')?.addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', (e) => {
    if (!many) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
  });

  // Simple swipe on touch screens.
  let startX: number | null = null;
  dialog.addEventListener('touchstart', (e) => { startX = e.touches[0].clientX; }, { passive: true });
  dialog.addEventListener('touchend', (e) => {
    if (!many || startX === null) return;
    const dx = e.changedTouches[0].clientX - startX;
    startX = null;
    if (Math.abs(dx) > 50) show(current + (dx < 0 ? 1 : -1));
  });

  images.forEach((img, i) => {
    img.classList.add('is-zoomable');
    img.tabIndex = 0;
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `View larger: ${img.alt || 'image'}`);
    img.addEventListener('click', () => open(i));
    img.addEventListener('keydown', (e) => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); open(i); }
    });
  });
}

// Click any image in a case study to see it larger. Previous and next cycle through
// the case study's images in page order; arrow keys do the same, Escape closes.
// Inside the viewer, pinch (touch or trackpad), Ctrl/⌘ + scroll, double-click or the
// + and − buttons zoom the image itself; drag or scroll pans it. The viewer takes
// those gestures, so the page behind never zooms or jumps.

const images = Array.from(
  document.querySelectorAll<HTMLImageElement>('.project__body img'),
).filter((img) => !img.closest('a, .rating-table'));

if (images.length) {
  const many = images.length > 1;
  const MIN = 1;
  const MAX = 6;
  const dialog = document.createElement('dialog');
  dialog.className = 'viewer';
  dialog.setAttribute('aria-label', 'Image viewer');
  dialog.innerHTML = `
    <div class="viewer__bar">
      <p class="viewer__count" aria-live="polite"></p>
      <div class="viewer__tools">
        <button type="button" class="viewer__btn viewer__out" aria-label="Zoom out">
          <span aria-hidden="true">−</span>
        </button>
        <button type="button" class="viewer__btn viewer__level" aria-label="Reset zoom">100%</button>
        <button type="button" class="viewer__btn viewer__in" aria-label="Zoom in">
          <span aria-hidden="true">+</span>
        </button>
        <button type="button" class="viewer__btn viewer__close" aria-label="Close">
          <span aria-hidden="true">×</span>
        </button>
      </div>
    </div>
    <figure class="viewer__stage">
      <img class="viewer__img" alt="" draggable="false" />
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
  const stage = dialog.querySelector<HTMLElement>('.viewer__stage')!;
  const caption = dialog.querySelector<HTMLElement>('.viewer__caption')!;
  const count = dialog.querySelector<HTMLElement>('.viewer__count')!;
  const level = dialog.querySelector<HTMLButtonElement>('.viewer__level')!;
  const zoomOut = dialog.querySelector<HTMLButtonElement>('.viewer__out')!;
  const zoomIn = dialog.querySelector<HTMLButtonElement>('.viewer__in')!;
  let current = 0;
  let opener: HTMLElement | null = null;

  // ---- Zoom and pan state: the image is moved with a transform, never the page.
  let scale = 1;
  let tx = 0;
  let ty = 0;

  const clamp = (v: number, lo: number, hi: number) => Math.min(hi, Math.max(lo, v));

  // Keep the zoomed image covering the screen; it cannot be dragged off into empty space.
  const limit = () => {
    const w = big.offsetWidth * scale;
    const h = big.offsetHeight * scale;
    const mx = Math.max(0, (w - window.innerWidth) / 2);
    const my = Math.max(0, (h - window.innerHeight) / 2);
    tx = clamp(tx, -mx, mx);
    ty = clamp(ty, -my, my);
  };

  const render = (animate = false) => {
    if (scale <= MIN) { scale = MIN; tx = 0; ty = 0; }
    limit();
    big.classList.toggle('is-animating', animate);
    big.style.transform = `translate(${tx}px, ${ty}px) scale(${scale})`;
    const zoomed = scale > MIN;
    dialog.classList.toggle('is-zoomed', zoomed);
    level.textContent = `${Math.round(scale * 100)}%`;
    zoomOut.disabled = !zoomed;
    zoomIn.disabled = scale >= MAX;
  };

  // Zoom to `next`, keeping the point under (x, y) on screen still.
  const zoomAt = (next: number, x: number, y: number, animate = false) => {
    next = clamp(next, MIN, MAX);
    const r = big.getBoundingClientRect();
    const cx = r.left + r.width / 2 - tx;
    const cy = r.top + r.height / 2 - ty;
    const px = x - cx;
    const py = y - cy;
    tx = px - (px - tx) * (next / scale);
    ty = py - (py - ty) * (next / scale);
    scale = next;
    render(animate);
  };

  const zoomCenter = (next: number) => zoomAt(next, window.innerWidth / 2, window.innerHeight / 2, true);
  const reset = (animate = false) => { scale = 1; tx = 0; ty = 0; render(animate); };

  const captionFor = (img: HTMLImageElement) =>
    img.closest('figure')?.querySelector('figcaption')?.textContent?.trim() || '';

  const show = (i: number) => {
    current = (i + images.length) % images.length;
    const img = images[current];
    reset();
    big.src = img.currentSrc || img.src;
    big.alt = img.alt;
    const text = captionFor(img);
    caption.textContent = text;
    caption.hidden = !text;
    count.textContent = many ? `${current + 1} of ${images.length}` : '';
  };

  // Hiding the page's scrollbar would shift everything sideways, so pad by its width.
  const lockPage = (on: boolean) => {
    const root = document.documentElement;
    if (on) {
      const bar = window.innerWidth - root.clientWidth;
      if (bar > 0) root.style.paddingRight = `${bar}px`;
      root.classList.add('has-viewer');
    } else {
      root.classList.remove('has-viewer');
      root.style.paddingRight = '';
    }
  };

  const open = (i: number) => {
    opener = images[i];
    show(i);
    lockPage(true);
    dialog.showModal();
  };

  dialog.addEventListener('close', () => {
    lockPage(false);
    big.removeAttribute('src');
    reset();
    opener?.focus({ preventScroll: true });
  });

  // ---- Pointer gestures: one finger or mouse pans, two fingers pinch.
  const pointers = new Map<number, { x: number; y: number }>();
  let moved = false;
  let startX = 0;
  let startY = 0;
  let lastTap = 0;

  const pair = () => {
    const [a, b] = Array.from(pointers.values());
    return { d: Math.hypot(a.x - b.x, a.y - b.y), x: (a.x + b.x) / 2, y: (a.y + b.y) / 2 };
  };

  stage.addEventListener('pointerdown', (e) => {
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    stage.setPointerCapture(e.pointerId);
    if (pointers.size === 1) { moved = false; startX = e.clientX; startY = e.clientY; }
    if (pointers.size === 2) moved = true;
    dialog.classList.add('is-dragging');
  });

  stage.addEventListener('pointermove', (e) => {
    const prev = pointers.get(e.pointerId);
    if (!prev) return;
    if (pointers.size === 2) {
      const before = pair();
      pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
      const after = pair();
      if (before.d > 0) zoomAt(scale * (after.d / before.d), before.x, before.y);
      tx += after.x - before.x;
      ty += after.y - before.y;
      render();
      return;
    }
    pointers.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (Math.hypot(e.clientX - startX, e.clientY - startY) > 6) moved = true;
    if (scale > MIN) {
      tx += e.clientX - prev.x;
      ty += e.clientY - prev.y;
      render();
    }
  });

  const endPointer = (e: PointerEvent) => {
    if (!pointers.has(e.pointerId)) return;
    pointers.delete(e.pointerId);
    if (pointers.size) return;
    dialog.classList.remove('is-dragging');
    // At normal size, a horizontal swipe moves to the next or previous image.
    const dx = e.clientX - startX;
    if (many && scale === MIN && e.pointerType !== 'mouse' && Math.abs(dx) > 50
        && Math.abs(dx) > Math.abs(e.clientY - startY)) {
      show(current + (dx < 0 ? 1 : -1));
      return;
    }
    // Double tap on touch toggles zoom (mouse uses dblclick below).
    if (!moved && e.pointerType === 'touch') {
      const now = Date.now();
      if (now - lastTap < 300) { toggleZoom(e.clientX, e.clientY); lastTap = 0; moved = true; }
      else lastTap = now;
    }
  };
  stage.addEventListener('pointerup', endPointer);
  stage.addEventListener('pointercancel', endPointer);

  const toggleZoom = (x: number, y: number) => {
    if (scale > MIN) reset(true);
    else zoomAt(2.5, x, y, true);
  };
  big.addEventListener('dblclick', (e) => { e.preventDefault(); toggleZoom(e.clientX, e.clientY); });

  // Trackpad pinch and Ctrl/⌘ + scroll arrive as wheel events with ctrlKey set.
  // Plain scrolling pans a zoomed image. Either way the page itself stays put.
  dialog.addEventListener('wheel', (e) => {
    e.preventDefault();
    if (e.ctrlKey || e.metaKey) {
      zoomAt(scale * Math.exp(-clamp(e.deltaY, -40, 40) * 0.01), e.clientX, e.clientY);
    } else if (scale > MIN) {
      tx -= e.deltaX;
      ty -= e.deltaY;
      render();
    }
  }, { passive: false });

  // Safari on a Mac reports trackpad pinch as gesture events instead.
  let gestureStart = 1;
  dialog.addEventListener('gesturestart', (e) => {
    e.preventDefault();
    gestureStart = scale;
  });
  dialog.addEventListener('gesturechange', (e) => {
    e.preventDefault();
    if (pointers.size) return; // touch pinch is already handled by pointer events
    const g = e as unknown as { scale: number; clientX: number; clientY: number };
    zoomAt(gestureStart * g.scale, g.clientX, g.clientY);
  });

  // A click on the dark backdrop (outside the image and buttons) closes it,
  // unless that click was the end of a drag or pinch.
  dialog.addEventListener('click', (e) => {
    if (moved) { moved = false; return; }
    const t = e.target as HTMLElement;
    if (scale === MIN && (t === dialog || t === stage)) dialog.close();
  });
  dialog.querySelector('.viewer__close')!.addEventListener('click', () => dialog.close());
  zoomIn.addEventListener('click', () => zoomCenter(scale * 1.5));
  zoomOut.addEventListener('click', () => zoomCenter(scale / 1.5));
  level.addEventListener('click', () => reset(true));
  dialog.querySelector('.viewer__prev')?.addEventListener('click', () => show(current - 1));
  dialog.querySelector('.viewer__next')?.addEventListener('click', () => show(current + 1));
  dialog.addEventListener('keydown', (e) => {
    if (e.key === '+' || e.key === '=') { e.preventDefault(); zoomCenter(scale * 1.5); return; }
    if (e.key === '-' || e.key === '_') { e.preventDefault(); zoomCenter(scale / 1.5); return; }
    if (e.key === '0') { e.preventDefault(); reset(true); return; }
    if (!many) return;
    if (e.key === 'ArrowLeft') { e.preventDefault(); show(current - 1); }
    if (e.key === 'ArrowRight') { e.preventDefault(); show(current + 1); }
  });
  window.addEventListener('resize', () => { if (dialog.open) render(); });

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

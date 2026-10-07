// Pick My Brain: hovering, focusing or tapping an orb shows its card in the panel.
// A tap or click keeps that card up after the pointer leaves; otherwise the panel goes back to the prompt.
function initPickMyBrain(): void {
  const root = document.querySelector<HTMLElement>('.brain');
  if (!root) return;
  const scene = root.querySelector<HTMLElement>('.brain__scene');
  const orbs = Array.from(root.querySelectorAll<HTMLButtonElement>('.orb'));
  const cards = Array.from(root.querySelectorAll<HTMLElement>('[data-card]'));
  let pinned = 'default';

  const show = (id: string): void => {
    for (const card of cards) card.hidden = card.dataset.card !== id;
    for (const orb of orbs) orb.classList.toggle('is-active', orb.dataset.orb === id);
  };

  for (const orb of orbs) {
    const id = orb.dataset.orb ?? 'default';
    orb.addEventListener('pointerenter', (e) => { if (e.pointerType === 'mouse') show(id); });
    orb.addEventListener('focus', () => show(id));
    orb.addEventListener('click', () => { pinned = id; show(id); });
  }
  scene?.addEventListener('pointerleave', (e) => { if (e.pointerType === 'mouse') show(pinned); });
}

initPickMyBrain();

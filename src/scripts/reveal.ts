/** Animates the How I work illustrations in once, as each scrolls into view. */
const arts = Array.from(document.querySelectorAll<SVGElement>('.question__art'));
const reduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
if (arts.length && 'IntersectionObserver' in window && !reduced) {
  document.documentElement.classList.add('reveal-ready');
  const io = new IntersectionObserver(
    (entries) => {
      for (const e of entries) {
        if (!e.isIntersecting) continue;
        e.target.classList.add('is-in');
        io.unobserve(e.target);
      }
    },
    { rootMargin: '0px 0px -12% 0px', threshold: 0.4 },
  );
  arts.forEach((a) => io.observe(a));
}

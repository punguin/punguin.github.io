// Pick My Brain: chaos to order, on a loop.
// Wiggly problem blobs rise from the tangle at the base of the neck, bounce off two ideas in the
// brain while their edges smooth and their colour settles, then leave the back of the head and
// lock into the boxes of order. Nine blobs fill the three boxes; the boxes hold, clear, and refill.
// Everything is a pure function of the loop clock, so pausing (offscreen, reduced motion) is free.

type Pt = [number, number];
interface BrainNode { id: string; x: number; y: number; rx: number; ry: number }
interface BrainConfig {
  tangle: Pt;
  exit: Pt;
  nodes: BrainNode[];
  boxes: { x: number; w: number; h: number; ys: number[]; segments: number };
}

const SVG_NS = 'http://www.w3.org/2000/svg';
const INK: [number, number, number] = [26, 51, 0];
const CHAOS_COLOURS: [number, number, number][] = [[240, 160, 120], [233, 168, 245], [127, 211, 211], [255, 220, 70]];

const SPAWN_EVERY = 1.15;  // seconds between blobs
const TRAVEL = 5.4;        // seconds from tangle to box
const HOLD = 1.4;          // seconds the full boxes stay up before clearing
const GAP = 2.6;           // pause in spawning between cycles, so the clear happens with no landings
const BLOB_R = 17;
// Share of the journey spent on each leg: rise up the neck, enter the brain, first node, second node, exit, lock in.
const LEGS = [0.13, 0.12, 0.15, 0.18, 0.17, 0.25];

const smoothstep = (a: number, b: number, x: number): number => {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
};
const lerp = (a: number, b: number, t: number): number => a + (b - a) * t;

function rng(seed: number): () => number {
  let s = seed >>> 0;
  return () => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = Math.imul(s ^ (s >>> 15), 1 | s);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function catmull(p0: Pt, p1: Pt, p2: Pt, p3: Pt, u: number): Pt {
  const u2 = u * u, u3 = u2 * u;
  const f = (a: number, b: number, c: number, d: number) =>
    0.5 * (2 * b + (-a + c) * u + (2 * a - 5 * b + 4 * c - d) * u2 + (-a + 3 * b - 3 * c + d) * u3);
  return [f(p0[0], p1[0], p2[0], p3[0]), f(p0[1], p1[1], p2[1], p3[1])];
}

function initPickMyBrain(): void {
  const svg = document.querySelector<SVGSVGElement>('.brain__svg');
  if (!svg?.dataset.config) return;
  const cfg = JSON.parse(svg.dataset.config) as BrainConfig;
  const blobLayer = svg.querySelector<SVGGElement>('.bm-blobs');
  const boxGroup = svg.querySelector<SVGGElement>('.bm-boxes');
  if (!blobLayer || !boxGroup) return;

  const { boxes } = cfg;
  const perCycle = boxes.ys.length * boxes.segments;
  const period = perCycle * SPAWN_EVERY + GAP;
  const lastLanding = (perCycle - 1) * SPAWN_EVERY + TRAVEL;
  const segW = boxes.w / boxes.segments;

  const segEls = Array.from(svg.querySelectorAll<SVGRectElement>('.bm-box__seg'));
  const nodeEls = cfg.nodes.map((n) => svg.querySelector<SVGGElement>(`[data-node="${n.id}"] .bm-node__bump`));

  // Angles round a blob, including the exact corners of a segment so the final shape is a crisp rectangle.
  const hw = segW / 2, hh = boxes.h / 2;
  const corner = Math.atan2(hh, hw);
  const angles = Array.from({ length: 40 }, (_, k) => (k / 40) * Math.PI * 2)
    .concat([corner, Math.PI - corner, Math.PI + corner, 2 * Math.PI - corner])
    .sort((a, b) => a - b);
  const rectR = angles.map((a) => Math.min(hw / Math.abs(Math.cos(a) || 1e-6), hh / Math.abs(Math.sin(a) || 1e-6)));

  interface Route { points: Pt[]; colour: [number, number, number]; ph1: number; ph2: number; slot: number }
  const routes = new Map<number, Route>();

  /** The k-th blob ever spawned: its path, colour and the box segment it fills. */
  function route(k: number): Route {
    const cached = routes.get(k);
    if (cached) return cached;
    const r = rng(k * 7919 + 13);
    const slot = k % perCycle;
    const box = Math.floor(slot / boxes.segments), seg = slot % boxes.segments;
    const [tx, ty] = cfg.tangle;
    const start: Pt = [tx + (r() - 0.5) * 60, ty + (r() - 0.5) * 16];
    const neck: Pt = [tx + (r() - 0.5) * 44, 540];
    const entry: Pt = [585 + (r() - 0.5) * 40, 408];
    // Two different ideas to bounce off, visited left to right so the flow heads for the exit.
    const pool = [...cfg.nodes];
    const a = pool.splice(Math.floor(r() * pool.length), 1)[0];
    const b = pool[Math.floor(r() * pool.length)];
    const [n1, n2] = a.x <= b.x ? [a, b] : [b, a];
    const bounce = (n: BrainNode, from: Pt): Pt => {
      const dx = from[0] - n.x, dy = from[1] - n.y;
      const len = Math.hypot(dx / n.rx, dy / n.ry) || 1;
      return [n.x + (dx / len) * (1 + BLOB_R / n.rx), n.y + (dy / len) * (1 + BLOB_R / n.ry)];
    };
    const b1 = bounce(n1, entry);
    const b2 = bounce(n2, b1);
    const exit: Pt = [cfg.exit[0], cfg.exit[1] + (r() - 0.5) * 60];
    const target: Pt = [boxes.x + seg * segW + hw, boxes.ys[box]];
    const made: Route = {
      points: [start, neck, entry, b1, b2, exit, target],
      colour: CHAOS_COLOURS[Math.floor(r() * CHAOS_COLOURS.length)],
      ph1: r() * 6.28, ph2: r() * 6.28, slot,
    };
    routes.set(k, made);
    if (routes.size > 40) routes.delete(routes.keys().next().value as number);
    return made;
  }

  function position(points: Pt[], p: number): Pt {
    let acc = 0, i = 0;
    while (i < LEGS.length - 1 && p > acc + LEGS[i]) acc += LEGS[i++];
    const u = Math.min(1, (p - acc) / LEGS[i]);
    const eased = lerp(u, u * u * (3 - 2 * u), 0.6);
    const at = (j: number) => points[Math.max(0, Math.min(points.length - 1, j))];
    return catmull(at(i - 1), at(i), at(i + 1), at(i + 2), eased);
  }

  const pool: SVGPathElement[] = [];
  function blobEl(i: number): SVGPathElement {
    while (pool.length <= i) {
      const el = document.createElementNS(SVG_NS, 'path');
      el.setAttribute('stroke', '#1a3300');
      blobLayer!.appendChild(el);
      pool.push(el);
    }
    return pool[i];
  }

  function drawBlob(el: SVGPathElement, rt: Route, p: number, t: number): Pt {
    let [x, y] = position(rt.points, p);
    const chaos = 1 - smoothstep(0.24, 0.72, p);        // wiggle fades as the brain works on it
    const lock = smoothstep(0.82, 1, p);                 // then it becomes a segment of a box
    // A little sideways wander while it is still a problem.
    x += Math.sin(t * 7 + rt.ph1) * 5 * chaos;
    y += Math.cos(t * 5 + rt.ph2) * 3 * chaos;
    if (lock > 0) {
      const target = rt.points[rt.points.length - 1];
      x = lerp(x, target[0], lock);
      y = lerp(y, target[1], lock);
    }
    const pts = angles.map((a, k) => {
      const wob = 1 + chaos * (0.24 * Math.sin(3 * a + rt.ph1 + t * 2.4) + 0.13 * Math.sin(5 * a + rt.ph2 - t * 3.3))
        + (1 - chaos) * 0.03 * Math.sin(2 * a + t * 2);
      const rr = lerp(BLOB_R * wob, rectR[k], lock);
      return [x + rr * Math.cos(a), y + rr * Math.sin(a)] as Pt;
    });
    // Smooth curves for blobs, straight edges once locked in.
    const tension = 1 - lock;
    const n = pts.length;
    let d = `M${pts[0][0].toFixed(1)},${pts[0][1].toFixed(1)}`;
    for (let i = 0; i < n; i++) {
      const p0 = pts[(i - 1 + n) % n], p1 = pts[i], p2 = pts[(i + 1) % n], p3 = pts[(i + 2) % n];
      d += ` C${(p1[0] + ((p2[0] - p0[0]) / 6) * tension).toFixed(1)},${(p1[1] + ((p2[1] - p0[1]) / 6) * tension).toFixed(1)}`
        + ` ${(p2[0] - ((p3[0] - p1[0]) / 6) * tension).toFixed(1)},${(p2[1] - ((p3[1] - p1[1]) / 6) * tension).toFixed(1)}`
        + ` ${p2[0].toFixed(1)},${p2[1].toFixed(1)}`;
    }
    el.setAttribute('d', `${d}Z`);
    const settle = smoothstep(0.3, 0.8, p);
    const c = rt.colour.map((v, i) => Math.round(lerp(v, INK[i], settle)));
    el.setAttribute('fill', `rgb(${c[0]},${c[1]},${c[2]})`);
    el.setAttribute('stroke-width', (2.4 * (1 - lock)).toFixed(2));
    return [x, y];
  }

  const bumpState = cfg.nodes.map(() => 0);

  function render(t: number): void {
    // Blobs in flight: from this cycle and the one before (its last blobs land after the next cycle starts).
    const cycle = Math.floor(t / period);
    const live: Pt[] = [];
    let used = 0;
    for (let c = Math.max(0, cycle - 1); c <= cycle; c++) {
      for (let j = 0; j < perCycle; j++) {
        const born = c * period + j * SPAWN_EVERY;
        if (t < born || t >= born + TRAVEL) continue;
        const el = blobEl(used++);
        el.style.display = '';
        live.push(drawBlob(el, route(c * perCycle + j), (t - born) / TRAVEL, t));
      }
    }
    for (let i = used; i < pool.length; i++) pool[i].style.display = 'none';

    // Box segments: filled once their blob lands, cleared together after the boxes have held.
    let filled = 0;
    segEls.forEach((el) => {
      const j = Number(el.dataset.box) * boxes.segments + Number(el.dataset.seg);
      const c = Math.floor((t - j * SPAWN_EVERY - TRAVEL) / period);
      const on = c >= 0 && t < c * period + lastLanding + HOLD;
      if (on) filled++;
      el.classList.toggle('is-filled', on);
    });
    boxGroup!.classList.toggle('is-full', filled === segEls.length);

    // Nodes squish a little as a blob bounces past.
    cfg.nodes.forEach((n, i) => {
      let k = 0;
      for (const [x, y] of live) {
        const d = Math.hypot((x - n.x) / (n.rx + 34), (y - n.y) / (n.ry + 34));
        k = Math.max(k, 1 - d);
      }
      k = smoothstep(0, 1, k);
      if (Math.abs(k - bumpState[i]) < 0.01) return;
      bumpState[i] = k;
      const sx = 1 + 0.07 * k, sy = 1 - 0.05 * k;
      nodeEls[i]?.setAttribute('transform', `translate(${n.x} ${n.y}) scale(${sx.toFixed(3)} ${sy.toFixed(3)}) translate(${-n.x} ${-n.y})`);
    });
  }

  const still = window.matchMedia('(prefers-reduced-motion: reduce)');
  // With reduced motion: one frame with the boxes full and a few blobs on their way.
  const STILL_AT = period + lastLanding + 0.2;
  let clock = TRAVEL * 0.6;  // start with the pipeline already flowing
  let last = 0, frame = 0, visible = true;

  const tick = (now: number): void => {
    const dt = last ? Math.min(0.05, (now - last) / 1000) : 0;
    last = now;
    clock += dt;
    render(clock);
    frame = requestAnimationFrame(tick);
  };
  const update = (): void => {
    cancelAnimationFrame(frame);
    last = 0;
    if (still.matches) render(STILL_AT);
    else if (visible) frame = requestAnimationFrame(tick);
  };

  new IntersectionObserver((entries) => {
    visible = entries.some((e) => e.isIntersecting);
    update();
  }).observe(svg);
  still.addEventListener('change', update);
  render(still.matches ? STILL_AT : clock);
}

initPickMyBrain();

"""Generate the hero illustration: a page from a designer's sketchbook with a loose cloud of marker
orbs, one for each complex domain or problem space in the work (a freight marketplace, drivers on the
road, clinical messaging, order status, customer accounts, design systems, real estate, greenfield
products), each holding a small pencil doodle and a handwritten label. Each orb drifts on its own
slow loop, so the cloud never moves in step.

Everything is drawn as pencil: variable-width strokes, a second exploratory pass on some lines,
overshoots and faint construction lines. Colour is marker / highlighter streaks that do not line up
with the pencil.

Writes into src/assets/brain/:
  paper.svg           the still drawing (also holds the shared pencil filters)
  piece-<id>.svg      one orb per file, each in its own layer so moving it is cheap
  motion.css          a slow drift for every orb
  layout.json         where each orb sits, in scene units
PickMyBrain.astro inlines them. Deterministic: cd scripts && python3 brain_sketch.py"""
import json, math, pathlib, random

INK = "#1a3300"
ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "src" / "content" / "brain.json").read_text())
OUT = ROOT / "src" / "assets" / "brain"
W, H = DATA["viewBox"]
X0 = 268  # the scene's left edge: the frame hugs the cloud of orbs
HAND = "Caveat, 'Segoe Print', 'Bradley Hand', cursive"


# Soft palette, kept from the site
TERRACOTTA, MINT, TEAL, LILAC, YELLOW, PINK = "#f3c3a6", "#d5f5c2", "#a8e5e5", "#f6d0ff", "#ffe95c", "#f7c6c0"



# ---------------------------------------------------------------- curves

def catmull(points, closed=False, samples=10):
    """Points along a Catmull-Rom spline through `points`."""
    pts = points[:]
    if closed:
        pts = [points[-1]] + points + points[:2]
    else:
        pts = [points[0]] + points + [points[-1]]
    out = []
    for i in range(1, len(pts) - 2):
        p0, p1, p2, p3 = pts[i - 1], pts[i], pts[i + 1], pts[i + 2]
        for s in range(samples):
            t = s / samples
            t2, t3 = t * t, t * t * t
            out.append(tuple(0.5 * ((2 * p1[k]) + (-p0[k] + p2[k]) * t + (2 * p0[k] - 5 * p1[k] + 4 * p2[k] - p3[k]) * t2
                                    + (-p0[k] + 3 * p1[k] - 3 * p2[k] + p3[k]) * t3) for k in (0, 1)))
    out.append(pts[-2])
    return out


def smooth_d(points, closed=False):
    """Catmull-Rom through points, as cubic path data (for paths that animate)."""
    pts = points + points[:3] if closed else points
    n = len(points) if closed else len(points) - 1
    d = f"M{pts[0][0]:.1f},{pts[0][1]:.1f}"
    for i in range(n):
        p0 = pts[i - 1] if (i > 0 or closed) else pts[0]
        p1, p2 = pts[i], pts[i + 1]
        p3 = pts[i + 2] if (closed or i + 2 < len(pts)) else pts[-1]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
    return d + (" Z" if closed else "")


def poly_d(pts, close=True):
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + (" Z" if close else "")


def length(pts):
    return sum(math.dist(a, b) for a, b in zip(pts, pts[1:]))


# ---------------------------------------------------------------- the pencil

class Pencil:
    """Draws like a soft pencil: each stroke is a filled ribbon whose width wanders and tapers."""

    def __init__(self, seed, k=1.0):
        self.r = random.Random(seed)
        self.parts = []
        self.k = k  # line-weight and type-size multiplier, for pencils drawing inside a scaled group

    def j(self, a):
        return self.r.uniform(-a, a)

    def ribbon(self, centre, w, opacity=1.0, taper=8):
        w *= self.k
        n = len(centre)
        if n < 2:
            return
        ph1, ph2 = self.r.uniform(0, 6.3), self.r.uniform(0, 6.3)
        left, right = [], []
        for i, (x, y) in enumerate(centre):
            a = centre[max(0, i - 1)]
            b = centre[min(n - 1, i + 1)]
            dx, dy = b[0] - a[0], b[1] - a[1]
            l = math.hypot(dx, dy) or 1
            nx, ny = -dy / l, dx / l
            k = 0.78 + 0.22 * math.sin(i * 0.09 + ph1) + 0.12 * math.sin(i * 0.31 + ph2)
            end = min(1.0, (i + 1) / taper, (n - i) / taper) ** 0.6
            hw = max(0.35, w * k * end) / 2
            left.append((x + nx * hw, y + ny * hw))
            right.append((x - nx * hw, y - ny * hw))
        op = "" if opacity >= 1 else f' opacity="{opacity:.2f}"'
        self.parts.append(f'<path d="{poly_d(left + right[::-1])}"{op}/>')

    def stroke(self, points, w=2.4, passes=1, closed=False, overshoot=0.0, jitter=1.6, samples=10):
        """A hand-drawn curve through points. A second pass is lighter and wanders a little off the first."""
        for p in range(passes):
            pts = [(x + self.j(jitter), y + self.j(jitter)) for x, y in points]
            if overshoot and not closed and len(pts) > 1:
                pts = _extend(pts, overshoot * self.r.uniform(0.4, 1.2), overshoot * self.r.uniform(0.4, 1.2))
            c = catmull(pts, closed=closed, samples=samples)
            if p == 0:
                self.ribbon(c, w)
            else:
                self.ribbon([(x + self.j(0.6) + 1.2, y + self.j(0.6) + 0.8) for x, y in c], w * 0.55, opacity=0.45)

    def line(self, x1, y1, x2, y2, w=2.2, passes=1, overshoot=3.0, bow=2.0):
        mx, my = (x1 + x2) / 2 + self.j(bow), (y1 + y2) / 2 + self.j(bow)
        self.stroke([(x1, y1), (mx, my), (x2, y2)], w=w, passes=passes, overshoot=overshoot, jitter=0.8, samples=8)

    def poly(self, pts, close=False, **k):
        seq = pts + ([pts[0]] if close else [])
        for a, b in zip(seq, seq[1:]):
            self.line(*a, *b, **k)

    def circle(self, cx, cy, r, w=2.2, passes=1, sweep=380, start=None, squash=1.0):
        """Not quite a circle: it starts anywhere, runs past where it began and never closes exactly."""
        for p in range(passes):
            a0 = math.radians(self.r.uniform(0, 360) if start is None else start + self.j(8))
            span = math.radians(sweep + self.j(12))
            n = max(10, int(r * span / 6))
            pts = []
            drift = self.j(r * 0.06)
            for i in range(n + 1):
                t = a0 + span * i / n
                rr = r * (1 + 0.035 * math.sin(3 * t + p)) + drift * i / n
                pts.append((cx + rr * math.cos(t), cy + rr * squash * math.sin(t)))
            c = catmull(pts, samples=4)
            if p == 0:
                self.ribbon(c, w)
            else:
                self.ribbon([(x + 1.4, y + 1) for x, y in c], w * 0.55, opacity=0.45)

    def arc(self, cx, cy, r, a0, a1, w=2.2, squash=1.0):
        n = max(6, int(abs(a1 - a0) / 8))
        pts = [(cx + r * math.cos(math.radians(a0 + (a1 - a0) * i / n)),
                cy + r * squash * math.sin(math.radians(a0 + (a1 - a0) * i / n))) for i in range(n + 1)]
        self.stroke(pts, w=w, jitter=0.5, samples=4)

    def dot(self, x, y, r=2.2):
        self.parts.append(f'<circle cx="{x + self.j(0.4):.1f}" cy="{y + self.j(0.4):.1f}" r="{r * self.k:.1f}"/>')

    def question(self, x, y, size=1.0, w=2.4):
        s = size
        self.stroke([(x - 8 * s, y - 10 * s), (x - 5 * s, y - 18 * s), (x + 3 * s, y - 20 * s), (x + 9 * s, y - 13 * s),
                     (x + 5 * s, y - 4 * s), (x, y + 1 * s), (x + 0.5 * s, y + 7 * s)], w=w, jitter=0.6, samples=6)
        self.dot(x + 0.5 * s, y + 15 * s, 2.0 * s)

    def text(self, x, y, s, size=22, rot=0.0, opacity=0.85, underline=False):
        size = round(size * self.k, 1)
        self.parts.append(
            f'<text x="{x:.1f}" y="{y:.1f}" transform="rotate({rot:.1f} {x:.1f} {y:.1f})" font-family="{HAND}" '
            f'font-weight="600" font-size="{size}" text-anchor="middle" stroke="none" opacity="{opacity}">{s}</text>')
        if underline:
            half = len(s) * size * 0.2
            rr = math.radians(rot)
            pts = []
            for i in range(9):
                u = -half + 2 * half * i / 8
                v = size * 0.28 + 2.2 * math.sin(i * 1.7)
                pts.append((x + u * math.cos(rr) - v * math.sin(rr), y + u * math.sin(rr) + v * math.cos(rr)))
            self.stroke(pts, w=1.5, jitter=0.4, samples=5)

    def svg(self):
        return "".join(self.parts)


def _extend(pts, a, b):
    (x0, y0), (x1, y1) = pts[0], pts[1]
    l = math.dist(pts[0], pts[1]) or 1
    first = (x0 - (x1 - x0) / l * a, y0 - (y1 - y0) / l * a)
    (x2, y2), (x3, y3) = pts[-2], pts[-1]
    l = math.dist(pts[-2], pts[-1]) or 1
    last = (x3 + (x3 - x2) / l * b, y3 + (y3 - y2) / l * b)
    return [first] + pts[1:-1] + [last] if len(pts) > 2 else [first, last]


# ---------------------------------------------------------------- the marker

def marker(cx, cy, w, h, colour, seed, angle=-8, opacity=0.62, nib=None):
    """Highlighter streaks back and forth over an area: overlaps go darker, the edges stay loose."""
    r = random.Random(seed)
    nib = nib or max(12, h / 3.2)
    rows = max(2, round(h / (nib * 0.78)))
    a = math.radians(angle + r.uniform(-3, 3))
    pts = []
    for i in range(rows):
        v = -h / 2 + nib / 2 + (h - nib) * i / max(1, rows - 1)
        half = w / 2 * math.sqrt(max(0.25, 1 - (2 * v / h) ** 2 * 0.55)) + r.uniform(-6, 6)
        for u in ((-half, half) if i % 2 == 0 else (half, -half)):
            u += r.uniform(-4, 4)
            pts.append((cx + u * math.cos(a) - v * math.sin(a), cy + u * math.sin(a) + v * math.cos(a)))
    return (f'<path d="{smooth_d(pts)}" fill="none" stroke="{colour}" stroke-width="{nib:.1f}" '
            f'stroke-linecap="round" stroke-linejoin="round" opacity="{opacity}"/>')


def dab(cx, cy, rx, ry, colour, seed, opacity=0.55):
    """A soft colour-pencil dab, a little irregular."""
    r = random.Random(seed)
    pts = [(cx + rx * (1 + r.uniform(-0.12, 0.12)) * math.cos(t), cy + ry * (1 + r.uniform(-0.12, 0.12)) * math.sin(t))
           for t in (2 * math.pi * k / 9 for k in range(9))]
    return f'<path d="{smooth_d(pts, closed=True)}" fill="{colour}" opacity="{opacity}" stroke="none"/>'



# ---------------------------------------------------------------- the scene

S = 1.0              # doodles are drawn at this scale inside their orbs

# The orbs: the complex domains and problem spaces in the work, as a hiring manager would scan for them.
# id: (centre, radius, wash colour, doodle, label, label offset,
#      drift: duration in seconds, how far it wanders as a share of its own size, and a phase).
ORBS = {
    "freight": ((560, 250), 85, TEAL, "browser", "freight marketplace", 65, (15.0, 3.2, 0.10)),     # Relay Load Board
    "clinical": ((782, 196), 66, LILAC, "conversation", "clinical messaging", 64, (17.2, 3.6, 0.30)),  # SpokGo, Spok
    "drivers": ((392, 352), 69, TERRACOTTA, "truck", "drivers on the road", 58, (14.1, 3.6, 0.55)),  # Relay mobile
    "orders": ((744, 412), 67, TEAL, "parcel", "order status", 60, (13.4, 3.8, 0.80)),           # Zenni Order Tracking
    "accounts": ((560, 488), 62, MINT, "glasses", "customer accounts", 54, (16.1, 3.4, 0.20)),   # Zenni Account
    "systems": ((918, 330), 55, YELLOW, "components", "design systems", 52, (14.8, 3.8, 0.42)),  # Meridian, Zenni DS
    "realestate": ((356, 500), 50, PINK, "house", "real estate", 46, (13.0, 4.2, 0.65)),     # Lone Wolf
    "greenfield": ((652, 98), 44, MINT, "sprout", "greenfield", 42, (12.2, 4.4, 0.90)),        # SpokGo, new products
}


def orb_wash(r, colour, seed):
    """A marker orb: a soft round fill, highlighter streaks over it, and a pencil ring that doesn't close."""
    return (dab(0, 0, r, r * 0.96, colour, seed, opacity=0.38)
            + marker(0, 0, r * 1.75, r * 1.7, colour, seed + 1, angle=-12, opacity=0.5, nib=max(14, r / 3)))


def orb_piece(oid):
    (cx, cy), r, colour, doodle, label, ly, _ = ORBS[oid]
    seed = sum(map(ord, oid))
    rnd = random.Random(seed)
    p = Pencil(seed)
    ring = Pencil(seed + 1)
    ring.circle(0, 0, r * 1.02, w=1.3, sweep=300, start=rnd.uniform(0, 360))
    globals()[doodle](p, 0, -8)
    p.text(0, ly, label, size=18, rot=rnd.uniform(-5, 5), opacity=0.75)
    body = (f'<g filter="url(#bm-marker)" style="mix-blend-mode:multiply">{orb_wash(r, colour, seed)}</g>'
            f'<g filter="url(#bm-pencil)" fill="{INK}" stroke="none"><g opacity="0.35">{ring.svg()}</g>'
            f'<g transform="scale({S})">{p.svg()}</g></g>')
    m = r + 34  # room for labels wider than the orb
    return body, (-m, -m, 2 * m, 2 * m)


def paper():
    """The still drawing: a couple of faint construction rings the cloud was laid out on."""
    cons = Pencil(3)
    cons.circle(632, 310, 300, w=1.1, sweep=250, start=150, squash=0.78)
    cons.circle(640, 300, 200, w=1.0, sweep=200, start=300, squash=0.8)
    construction = f'<g opacity="0.14">{cons.svg()}</g>'

    defs = (
        '<defs>'
        # pencil: a slight wobble, then graphite grain eaten out of the stroke
        '<filter id="bm-pencil" x="-2%" y="-2%" width="104%" height="104%" color-interpolation-filters="sRGB">'
        '<feTurbulence type="fractalNoise" baseFrequency="0.035" numOctaves="2" seed="7" result="warp"/>'
        '<feDisplacementMap in="SourceGraphic" in2="warp" scale="2.4" xChannelSelector="R" yChannelSelector="G" result="wob"/>'
        '<feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="2" seed="3" result="grain"/>'
        '<feColorMatrix in="grain" type="matrix" values="0 0 0 0 0  0 0 0 0 0  0 0 0 0 0  2.2 0 0 0 -0.25" result="tooth"/>'
        '<feComposite in="wob" in2="tooth" operator="in"/>'
        '</filter>'
        # marker: soft, slightly bleeding edges
        '<filter id="bm-marker" x="-5%" y="-5%" width="110%" height="110%">'
        '<feTurbulence type="fractalNoise" baseFrequency="0.05" numOctaves="2" seed="11" result="n"/>'
        '<feDisplacementMap in="SourceGraphic" in2="n" scale="7" xChannelSelector="R" yChannelSelector="G"/>'
        '</filter>'
        '<filter id="bm-smudge"><feGaussianBlur stdDeviation="1.6"/></filter>'
        '</defs>'
    )
    body = defs + construction
    return wrap(body, (X0, 0, W, H), cls="bm-paper")


def wrap(body, box, cls):
    x, y, w, h = box
    return (f'<svg class="{cls}" xmlns="http://www.w3.org/2000/svg" viewBox="{x:.0f} {y:.0f} {w:.0f} {h:.0f}" '
            f'aria-hidden="true" focusable="false" overflow="visible">{body}</svg>\n')


# ---------------------------------------------------------------- doodles (drawn around a centre)

def truck(p, x, y):
    p.poly([(x - 46, y - 22), (x + 14, y - 23), (x + 15, y + 18), (x - 45, y + 19)], close=True, w=2.3)
    p.poly([(x + 15, y - 9), (x + 33, y - 9), (x + 45, y + 3), (x + 45, y + 18), (x + 15, y + 18)], w=2.3)
    p.poly([(x + 20, y - 5), (x + 31, y - 5), (x + 38, y + 3), (x + 20, y + 3)], close=True, w=1.5, overshoot=1)
    for wx in (x - 30, x - 4, x + 32):
        p.circle(wx, y + 22, 6.5, w=2.2, sweep=370)
    for k, wy in enumerate((y - 10, y + 1, y + 12)):
        p.line(x - 72 + k * 3, wy, x - 56, wy, w=1.6, overshoot=1)


def glasses(p, x, y):
    p.circle(x - 25, y + 2, 19, w=2.4)
    p.circle(x + 25, y + 2, 19, w=2.4)
    p.arc(x, y + 4, 7, 205, 335, w=2.2)
    p.line(x - 44, y - 2, x - 62, y - 12, w=2.2)
    p.line(x + 44, y - 2, x + 62, y - 12, w=2.2)
    p.line(x - 33, y - 8, x - 27, y - 13, w=1.4, overshoot=0)
    p.line(x + 17, y - 8, x + 23, y - 13, w=1.4, overshoot=0)


def parcel(p, x, y):
    p.poly([(x - 30, y - 8), (x + 18, y - 8), (x + 18, y + 26), (x - 30, y + 26)], close=True, w=2.3)
    p.poly([(x - 30, y - 8), (x - 17, y - 22), (x + 31, y - 22), (x + 18, y - 8)], w=2.2)
    p.poly([(x + 18, y + 26), (x + 31, y + 12), (x + 31, y - 22)], w=2.2)
    p.line(x - 6, y - 8, x + 7, y - 22, w=1.5, overshoot=0)
    # a map pin above it, with a dotted wander between them
    p.circle(x - 50, y - 22, 8, w=2.2, sweep=300, start=150)
    p.stroke([(x - 57, y - 18), (x - 50, y - 6), (x - 43, y - 18)], w=2.1, jitter=0.4)
    p.dot(x - 50, y - 23, 2.2)
    for k in range(3):
        t = k / 2
        p.dot(x - 44 + 9 * t, y + 2 + 6 * t, 1.4)


def conversation(p, x, y):
    p.poly([(x - 52, y - 38), (x + 14, y - 39), (x + 15, y - 8), (x - 30, y - 8), (x - 42, y + 4), (x - 41, y - 8),
            (x - 52, y - 8)], close=True, w=2.2)
    p.line(x - 42, y - 28, x + 2, y - 28, w=1.4)
    p.line(x - 42, y - 18, x - 14, y - 18, w=1.4)
    p.poly([(x - 12, y + 2), (x + 52, y + 1), (x + 52, y + 34), (x + 44, y + 34), (x + 48, y + 46), (x + 34, y + 34),
            (x - 12, y + 34)], close=True, w=2.2)
    p.line(x + 20, y + 9, x + 20, y + 27, w=2.4, overshoot=0)
    p.line(x + 11, y + 18, x + 29, y + 18, w=2.4, overshoot=0)


def figma_pen(p, x, y):
    """A pen-tool curve with its handles: the bit of Figma that lives in my head."""
    p.stroke([(x - 30, y + 18), (x - 12, y - 6), (x + 10, y + 8), (x + 30, y - 16)], w=2.0)
    p.line(x - 24, y - 4, x, y - 22, w=1.2, overshoot=0)
    p.dot(x - 24, y - 4, 2.6); p.dot(x, y - 22, 2.6)
    p.poly([(x - 16, y - 16), (x - 8, y - 16), (x - 8, y - 8), (x - 16, y - 8)], close=True, w=1.4, overshoot=0)
    p.text(x - 2, y + 40, "figma", size=21, rot=4, opacity=0.75)


def sparkle(p, x, y, s=1.0, w=1.9):
    p.stroke([(x, y - 12 * s), (x + 2 * s, y - 2 * s), (x + 12 * s, y), (x + 2 * s, y + 2 * s), (x, y + 12 * s),
              (x - 2 * s, y + 2 * s), (x - 12 * s, y), (x - 2 * s, y - 2 * s), (x + 0.5, y - 12 * s)], w=w, jitter=0.5, samples=5)


def sparkles(p, x, y):
    sparkle(p, x - 10, y + 4, 1.0)
    sparkle(p, x + 14, y - 12, 0.55)
    p.text(x + 18, y + 18, "AI", size=22, rot=-8, opacity=0.75)


def browser(p, x, y):
    """The Load Board: a browser window with three search tabs, a filter column and result rows."""
    p.poly([(x - 52, y - 30), (x + 52, y - 31), (x + 53, y + 36), (x - 51, y + 37)], close=True, w=2.2)
    for k in range(3):  # tabs: several searches open at once
        tx = x - 46 + k * 28
        p.poly([(tx, y - 30), (tx + 3, y - 41), (tx + 22, y - 41), (tx + 25, y - 30)], w=1.6, overshoot=0)
    p.line(x - 51, y - 20, x + 52, y - 21, w=1.4, overshoot=0)
    p.line(x - 24, y - 20, x - 23, y + 36, w=1.4, overshoot=0)  # the filter panel
    for k in range(4):
        p.line(x - 46, y - 11 + k * 11, x - 32, y - 11 + k * 11, w=1.1, overshoot=0)
    for k in range(3):  # results
        p.poly([(x - 16, y - 13 + k * 15), (x + 44, y - 13 + k * 15), (x + 44, y - 3 + k * 15), (x - 16, y - 3 + k * 15)],
               close=True, w=1.2, overshoot=0)


def components(p, x, y):
    """Design systems: a few components on a grid (a button, a toggle, a card)."""
    p.poly([(x - 34, y - 26), (x + 2, y - 27), (x + 3, y - 12), (x - 33, y - 11)], close=True, w=1.9, overshoot=1)
    p.line(x - 24, y - 19, x - 8, y - 19, w=1.3, overshoot=0)
    p.stroke([(x + 12, y - 18), (x + 34, y - 19)], w=9, jitter=0.3)  # a toggle track, drawn as one thick mark
    p.circle(x + 30, y - 19, 6, w=1.8, sweep=360)
    p.poly([(x - 34, y - 2), (x + 34, y - 3), (x + 35, y + 30), (x - 33, y + 31)], close=True, w=1.9, overshoot=1)
    p.poly([(x - 26, y + 5), (x - 8, y + 5), (x - 8, y + 23), (x - 26, y + 23)], close=True, w=1.3, overshoot=0)
    for k in range(2):
        p.line(x - 1, y + 9 + k * 9, x + 26 - k * 8, y + 9 + k * 9, w=1.2, overshoot=0)


def house(p, x, y):
    """Real estate: a house beside a signed transaction form."""
    p.poly([(x - 34, y - 2), (x - 14, y - 22), (x + 6, y - 2)], w=2.1, overshoot=2)
    p.poly([(x - 29, y - 6), (x - 29, y + 22), (x + 1, y + 22), (x + 1, y - 6)], w=2.0, overshoot=1)
    p.poly([(x - 19, y + 22), (x - 19, y + 8), (x - 9, y + 8), (x - 9, y + 22)], w=1.4, overshoot=0)
    p.poly([(x + 12, y - 16), (x + 34, y - 17), (x + 35, y + 22), (x + 13, y + 23)], close=True, w=1.7, overshoot=1)
    for k in range(3):
        p.line(x + 17, y - 8 + k * 7, x + 30, y - 8 + k * 7, w=1.1, overshoot=0)
    p.stroke([(x + 16, y + 16), (x + 20, y + 12), (x + 23, y + 17), (x + 27, y + 12), (x + 31, y + 16)], w=1.3, jitter=0.3)


def sprout(p, x, y):
    """Greenfield: a seedling coming up out of fresh ground."""
    p.stroke([(x - 26, y + 18), (x - 8, y + 14), (x + 10, y + 16), (x + 26, y + 13)], w=1.9)
    p.stroke([(x, y + 15), (x + 1, y + 2), (x, y - 12)], w=2.0, jitter=0.4)
    p.stroke([(x, y - 4), (x - 10, y - 12), (x - 18, y - 10), (x - 12, y - 2), (x, y - 4)], w=1.8, jitter=0.4, samples=6)
    p.stroke([(x, y - 10), (x + 9, y - 20), (x + 18, y - 18), (x + 13, y - 9), (x, y - 10)], w=1.8, jitter=0.4, samples=6)


def system(p, x, y):
    """Understand the system: a few things and how they connect."""
    nodes = [(x - 22, y - 14), (x + 22, y - 18), (x + 2, y + 18), (x + 30, y + 16)]
    for a, b in [(0, 1), (0, 2), (1, 2), (2, 3), (1, 3)]:
        p.line(*nodes[a], *nodes[b], w=1.3, overshoot=0, bow=3)
    for k, (nx, ny) in enumerate(nodes):
        p.circle(nx, ny, 7 if k else 9, w=2.0, sweep=360)


# ---------------------------------------------------------------- the moving pieces

def pieces():
    """id: (svg body, box around the centre, centre in scene units, drift)."""
    return {oid: (*orb_piece(oid), o[0], o[6]) for oid, o in ORBS.items()}


# ---------------------------------------------------------------- the motion

def drift(pid, dur, amp, phase):
    """A slow wander for one piece: a lopsided loop (two sines at different rates, so it never traces a
    circle), a little bob and a little tilt. Distances are a share of the piece's own size, so the drift
    keeps its proportions at every screen width. Each piece has its own length and starting point,
    so the cloud never moves in step."""
    r = random.Random(pid)
    fx = r.choice([(1, 2), (2, 1), (1, 1)])
    ax, ay, tilt = amp * r.uniform(0.7, 1.0), amp * r.uniform(0.8, 1.2), r.uniform(1.2, 2.6)
    p1, p2, p3 = (r.uniform(0, 2 * math.pi) for _ in range(3))
    steps = 24  # sampled finely and played linearly, so the path stays smooth with no pause at each frame
    frames = []
    for i in range(steps + 1):
        t = 2 * math.pi * i / steps
        x = ax * math.sin(fx[0] * t + p1)
        y = ay * math.sin(fx[1] * t + p2)
        a = tilt * math.sin(t + p3)
        frames.append(f"  {100 * i / steps:.2f}% {{ transform: translate({x:.2f}%, {y:.2f}%) rotate({a:.2f}deg); }}")
    return [f".bm-orb--{pid} {{ animation: bm-drift-{pid} {dur}s linear infinite; animation-delay: {-dur * phase:.2f}s; }}",
            f"@keyframes bm-drift-{pid} {{", *frames, "}"]


def motion(all_pieces):
    css = ["/* Generated by scripts/brain_sketch.py: a slow drift for every orb. */"]
    for pid, (_, _, _, (dur, amp, phase)) in all_pieces.items():
        css += drift(pid, dur, amp, phase)
    return "\n".join(css) + "\n"


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*"):
        old.unlink()
    (OUT / "paper.svg").write_text(paper())
    all_pieces = pieces()
    layout = []
    for pid, (body, (bx, by, bw, bh), (cx, cy), _) in all_pieces.items():
        (OUT / f"piece-{pid}.svg").write_text(wrap(body, (bx, by, bw, bh), cls="bm-piece-svg"))
        layout.append({"id": pid, "x": cx + bx - X0, "y": cy + by, "w": bw, "h": bh, "ox": -bx / bw, "oy": -by / bh})
    (OUT / "layout.json").write_text(json.dumps(layout, indent=1) + "\n")
    (OUT / "motion.css").write_text(motion(all_pieces))
    total = sum(f.stat().st_size for f in OUT.glob("*"))
    print("wrote", len(list(OUT.glob("*"))), "files,", total, "bytes")

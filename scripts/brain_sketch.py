"""Generate the hero illustration: a page from a designer's sketchbook. A tangle of questions on the
left, a head in profile full of small doodles (accumulated work, ideas and interests), and one line
that wanders through it, finds its way out the back of the head and turns into a small star.

Everything is drawn as pencil: variable-width strokes, a second exploratory pass on some lines,
overshoots, faint construction lines and a couple of erased marks. Colour is marker / highlighter
streaks that do not line up with the pencil.

Writes into src/assets/brain/:
  paper.svg           the still drawing (also holds the shared pencil filters)
  piece-<id>.svg      the few doodles that move, each in its own layer so moving them is cheap
  live.svg            the parts drawn by the loop: the extra scribble, the wandering line, the star
  motion.css          the loop's keyframes, timed from the line's real geometry
  layout.json         where each piece sits, in scene units
PickMyBrain.astro inlines them. Deterministic: cd scripts && python3 brain_sketch.py"""
import json, math, pathlib, random

INK = "#1a3300"
ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "src" / "content" / "brain.json").read_text())
OUT = ROOT / "src" / "assets" / "brain"
W, H = DATA["viewBox"]
HAND = "Caveat, 'Segoe Print', 'Bradley Hand', cursive"

LOOP = 8.0  # seconds

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

    def __init__(self, seed):
        self.r = random.Random(seed)
        self.parts = []

    def j(self, a):
        return self.r.uniform(-a, a)

    def ribbon(self, centre, w, opacity=1.0, taper=8):
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
        self.parts.append(f'<circle cx="{x + self.j(0.4):.1f}" cy="{y + self.j(0.4):.1f}" r="{r:.1f}"/>')

    def question(self, x, y, size=1.0, w=2.4):
        s = size
        self.stroke([(x - 8 * s, y - 10 * s), (x - 5 * s, y - 18 * s), (x + 3 * s, y - 20 * s), (x + 9 * s, y - 13 * s),
                     (x + 5 * s, y - 4 * s), (x, y + 1 * s), (x + 0.5 * s, y + 7 * s)], w=w, jitter=0.6, samples=6)
        self.dot(x + 0.5 * s, y + 15 * s, 2.0 * s)

    def text(self, x, y, s, size=22, rot=0.0, opacity=0.85, underline=False):
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

HEAD_FRONT = [  # from the front of the neck, up the face, over the forehead, to the crown
    (432, 664), (426, 612), (414, 544), (366, 514), (320, 496), (304, 472), (300, 454),
    (290, 442), (303, 430), (286, 418), (294, 400), (286, 388), (248, 374), (263, 338),
    (296, 304), (301, 264), (313, 198), (356, 120), (440, 64), (560, 38), (650, 38),
]
HEAD_BACK = [  # from the crown (overlapping the front stroke) down the back of the head to the neck
    (612, 36), (700, 46), (812, 94), (892, 178), (925, 292), (905, 410), (852, 500), (802, 560), (794, 664),
]
BRAIN = (634, 292, 262, 210)  # cx, cy, rx, ry


def brain_outline(seed):
    cx, cy, rx, ry = BRAIN
    r = random.Random(seed)
    pts = []
    n = 24
    for k in range(n):
        t = 2 * math.pi * k / n
        bump = 1 + 0.05 * math.sin(5 * t + 0.4) + (0.045 if k % 2 else -0.015) + r.uniform(-0.01, 0.01)
        pts.append((cx + rx * bump * math.cos(t), cy + ry * bump * math.sin(t)))
    return pts


STAR = (1078, 252)

# The wandering line: one loose gesture. It enters over the brow, drifts between the doodles, loops
# once, doubles back, has a little second thought near the back of the head, then leaves for the star.
TRAIL = [
    (172, 290), (210, 268), (256, 252), (306, 246),               # out of the tangle, over the brow
    (352, 252), (392, 278), (428, 322), (452, 334),               # drifting down past the heart
    (520, 318), (572, 300), (612, 270), (628, 238),               # up between the truck and the bubbles
    (614, 214), (592, 226), (600, 256), (640, 276),               # a small loop
    (690, 282), (728, 300), (744, 326), (726, 340), (712, 322),   # wanders, doubles back on itself
    (730, 296), (776, 290), (812, 300),                           # under the glasses
    (842, 276), (856, 290), (850, 270), (880, 258),               # a second thought
    (926, 252), (978, 244), (1024, 250), (STAR[0] - 34, STAR[1] + 6),
]


def paper():
    pen = Pencil(1)
    faint = Pencil(2)

    # construction lines: the circle the head was built on, an eye line, a centre line
    cons = Pencil(3)
    cons.circle(612, 270, 312, w=1.2, sweep=300, start=150)
    cons.line(240, 316, 420, 312, w=1.0, overshoot=10)
    cons.line(624, 18, 618, 132, w=1.0, overshoot=6)
    cons.line(890, 470, 1000, 560, w=1.0, overshoot=4)
    construction = f'<g opacity="0.16">{cons.svg()}</g>'

    # erased marks: an earlier eye a little too high, and a path the line didn't take
    er = Pencil(4)
    er.arc(322, 286, 16, 200, 340, w=2.2)
    er.stroke([(704, 318), (742, 262), (792, 236), (838, 238)], w=2.2, jitter=1)
    er.stroke([(1040, 214), (1070, 200), (1098, 214)], w=1.8)
    erased = f'<g opacity="0.1" filter="url(#bm-smudge)">{er.svg()}</g>'

    # colour first, so the pencil sits on top and doesn't line up with it
    colour = "".join([
        marker(640, 288, 400, 300, YELLOW, 10, angle=-10, opacity=0.2, nib=54),     # a wash through the brain
        marker(500, 238, 120, 70, TERRACOTTA, 11, angle=-6),                         # truck
        marker(764, 226, 124, 56, MINT, 12, angle=8),                                # glasses
        marker(650, 368, 96, 70, TEAL, 13, angle=-10),                               # parcel
        marker(486, 400, 106, 74, LILAC, 14, angle=5),                               # conversation
        dab(306, 352, 15, 9, PINK, 15, opacity=0.7),                                 # blush
        marker(410, 300, 40, 30, PINK, 16, angle=0, opacity=0.5, nib=14),            # heart
    ])

    # head: two strokes that overlap at the crown instead of meeting
    pen.stroke(HEAD_FRONT, w=3.3, overshoot=4)
    pen.stroke(HEAD_BACK, w=3.3, overshoot=6)
    faint.stroke(HEAD_BACK[1:6], w=1.6, jitter=3)           # a lighter re-draw over the back of the head
    faint.stroke(HEAD_FRONT[13:19], w=1.4, jitter=2.5)      # and over the brow

    # face: a closed, happy eye with lashes, a brow, a nostril
    pen.arc(322, 304, 15, 20, 160, w=2.6)
    pen.line(312, 318, 309, 324, w=1.6, overshoot=0)
    pen.line(322, 320, 321, 327, w=1.6, overshoot=0)
    pen.stroke([(304, 280), (318, 274), (334, 276)], w=2.2)
    pen.arc(281, 383, 4, 120, 300, w=1.6)

    # brain: a lumpy outline drawn once, then a lighter second go, plus a few folds
    bo = brain_outline(3)
    pen.stroke(bo, w=2.3, closed=True)
    faint.stroke(brain_outline(4)[3:13], w=1.4, jitter=3)
    r = random.Random(7)
    for (x, y, ln, a) in [(560, 476, 110, -0.3), (870, 250, 80, 1.4), (404, 448, 70, 0.6),
                          (640, 76, 80, 0.12), (900, 340, 60, 1.9), (740, 470, 70, -0.4)]:
        pts = [(x + math.cos(a) * ln * s / 4 + 9 * math.sin(s * 2.1) + r.uniform(-4, 4),
                y + math.sin(a) * ln * s / 4 + 9 * math.cos(s * 1.7) + r.uniform(-4, 4)) for s in range(5)]
        faint.stroke(pts, w=1.5)

    # the doodles that stay still
    truck(pen, 500, 236)
    glasses(pen, 764, 222)
    parcel(pen, 650, 366)
    conversation(pen, 486, 398)
    heart(pen, 410, 300)
    figma_pen(pen, 824, 336)
    sparkles(pen, 782, 150)
    notebook(pen, 742, 394)
    skills(pen, 520, 460)

    # the scribble and its questions
    tangle(pen)

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
    body = (
        defs
        + f'<g filter="url(#bm-marker)" style="mix-blend-mode:multiply">{colour}</g>'
        + construction + erased
        + f'<g filter="url(#bm-pencil)" fill="{INK}" stroke="none">'
        + f'<g opacity="0.55">{faint.svg()}</g>{pen.svg()}</g>'
    )
    return wrap(body, (0, 0, W, H), cls="bm-paper")


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


def heart(p, x, y):
    p.stroke([(x, y + 14), (x - 13, y + 2), (x - 15, y - 8), (x - 8, y - 13), (x, y - 6), (x + 7, y - 13),
              (x + 15, y - 8), (x + 13, y + 2), (x + 1, y + 15)], w=2.2, passes=2)
    p.text(x - 2, y + 40, "values", size=21, rot=-6, opacity=0.75)


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


def notebook(p, x, y):
    """A little notebook of past work."""
    p.poly([(x - 18, y - 22), (x + 17, y - 21), (x + 18, y + 22), (x - 17, y + 23)], close=True, w=2.0)
    for k in range(4):
        p.circle(x - 18, y - 14 + k * 10, 3, w=1.3, sweep=280, start=90)
    for k in range(3):
        p.line(x - 9, y - 10 + k * 9, x + 10 - (k == 2) * 8, y - 10 + k * 9, w=1.2, overshoot=0)
    p.text(x + 6, y + 44, "experience", size=20, rot=-3, opacity=0.7)


def skills(p, x, y):
    """A stubby pencil and a scrawled word, nothing more."""
    p.poly([(x - 30, y + 6), (x + 6, y - 10), (x + 11, y - 1), (x - 25, y + 15)], close=True, w=1.9)
    p.poly([(x + 6, y - 10), (x + 20, y - 9), (x + 11, y - 1)], w=1.8)
    p.text(x + 50, y + 12, "skills", size=21, rot=-10, opacity=0.7)


def tangle(p):
    r = random.Random(12)
    pts = []
    for k in range(30):
        a = k * 2.2 + r.uniform(-0.7, 0.7)
        rad = r.uniform(10, 50)
        pts.append((116 + rad * 1.15 * math.cos(a) + r.uniform(-6, 6), 300 + rad * 0.8 * math.sin(a) + r.uniform(-6, 6)))
    pts.append((150, 286)); pts.append((168, 292))
    p.stroke(pts, w=1.9, jitter=1, samples=8)
    p.question(196, 216, 1.25)
    p.question(56, 238, 1.0)
    p.question(204, 398, 1.1)


# ---------------------------------------------------------------- the moving pieces

def note_piece():
    """A sticky note: "how I work". The line brushes past it, so it gets a small nudge."""
    p = Pencil(40)
    pts = [(-44, -36), (44, -40), (47, 38), (-41, 41)]
    col = (f'<path d="{smooth_d(pts, closed=True)}" fill="#fff4a3" stroke="none" opacity="0.92"/>'
           + marker(2, 2, 86, 72, YELLOW, 41, angle=-4, opacity=0.35, nib=22))
    tape = '<path d="M-18,-48 L22,-46 L20,-32 L-20,-34 Z" fill="#1a3300" opacity="0.1"/>'
    p.poly(pts, close=True, w=1.8, overshoot=2)
    p.text(0, -4, "how I", size=24, rot=-4, opacity=0.9)
    p.text(2, 20, "work", size=24, rot=-4, opacity=0.9, underline=True)
    body = (f'<g filter="url(#bm-marker)">{col}</g>{tape}'
            f'<g filter="url(#bm-pencil)" fill="{INK}" stroke="none">{p.svg()}</g>')
    return body, (-62, -62, 124, 124)


def plane_piece():
    """Play: a paper aeroplane that has just done a loop-the-loop. The line passes close and it tips a little."""
    p = Pencil(50)
    p.poly([(-30, 4), (30, -14), (-6, 22)], close=True, w=2.2, overshoot=2)
    p.line(30, -14, -10, 10, w=1.8, overshoot=0)
    p.line(-10, 10, -6, 22, w=1.6, overshoot=0)
    loop = Pencil(51)
    loop.stroke([(-34, -4), (-44, -12), (-48, -24), (-40, -30), (-34, -22), (-40, -12), (-47, -10)], w=1.5, jitter=0.4, samples=8)
    col = marker(-2, 4, 46, 26, "#ffd3b5", 52, angle=-16, opacity=0.6, nib=14)
    body = (f'<g filter="url(#bm-marker)">{col}</g>'
            f'<g filter="url(#bm-pencil)" fill="{INK}" stroke="none">{p.svg()}<g opacity="0.7">{loop.svg()}</g>'
            f'</g>')
    body = f'<g transform="scale(1.3)">{body}</g>'
    return body, (-80, -50, 124, 90)


PIECES = {  # id: (maker, centre in scene units, resting rotation)
    "note": (note_piece, (634, 132), -5),
    "plane": (plane_piece, (668, 450), -10),
}


# ---------------------------------------------------------------- the loop

def star_strokes(cx, cy):
    """The star, drawn in two loose strokes that don't quite close, plus a few rays."""
    r = random.Random(91)
    pts = []
    for k in range(11):
        a = -math.pi / 2 + k * math.pi / 5 + r.uniform(-0.05, 0.05)
        rr = (36 if k % 2 == 0 else 16) * r.uniform(0.92, 1.08)
        pts.append((cx + rr * math.cos(a), cy + rr * math.sin(a)))
    pts[-1] = (pts[-1][0] + 5, pts[-1][1] + 3)  # overshoots where it started
    first = poly_d(pts[:7], close=False)
    second = poly_d(pts[6:], close=False)
    retrace = poly_d([(x + 1.6, y + 1.2) for x, y in pts[1:6]], close=False)
    rays = []
    for a in (-140, -95, -45, 10, 160):
        t = math.radians(a)
        rays.append(f'M{cx + 46 * math.cos(t):.1f},{cy + 46 * math.sin(t):.1f} L{cx + 56 * math.cos(t):.1f},{cy + 56 * math.sin(t):.1f}')
    fill = marker(cx, cy + 2, 54, 46, YELLOW, 93, angle=-12, opacity=0.8, nib=17)
    return first, second, retrace, " ".join(rays), fill


def live():
    """What the loop draws: one more loop in the tangle, the wandering line, then the star."""
    centre = catmull(TRAIL, samples=12)
    pen = Pencil(60)
    pen.ribbon(centre, 2.6, taper=14)
    pen.ribbon([(x + 1.3, y + 1.0) for x, y in centre[40:260]], 1.2, opacity=0.35, taper=20)
    d = smooth_d(TRAIL)

    r = random.Random(13)
    extra = [(118 + 46 * math.cos(a) + r.uniform(-4, 4), 304 + 36 * math.sin(a) + r.uniform(-4, 4))
             for a in (k * 0.9 + 2.2 for k in range(9))]
    first, second, retrace, rays, fill = star_strokes(*STAR)

    body = (
        '<defs><mask id="bm-trail-mask" maskUnits="userSpaceOnUse" x="0" y="0" width="100%" height="100%">'
        f'<path class="bm-reveal" d="{d}" pathLength="1" fill="none" stroke="#fff" stroke-width="9" '
        'stroke-linecap="round" stroke-linejoin="round"/></mask></defs>'
        f'<path class="bm-extra" d="{smooth_d(extra)}" pathLength="1" fill="none" stroke="{INK}" stroke-width="1.7" '
        'stroke-linecap="round" opacity="0.9"/>'
        f'<g class="bm-trail" mask="url(#bm-trail-mask)" fill="{INK}" opacity="0.92">{pen.svg()}</g>'
        f'<g class="bm-star" fill="none" stroke="{INK}" stroke-linecap="round" stroke-linejoin="round">'
        f'<g class="bm-star-fill" style="mix-blend-mode:multiply">{fill}</g>'
        f'<path class="bm-star-a" d="{first}" pathLength="1" stroke-width="2.6"/>'
        f'<path class="bm-star-b" d="{second}" pathLength="1" stroke-width="2.6"/>'
        f'<path class="bm-star-c" d="{retrace}" pathLength="1" stroke-width="1.3" opacity="0.5"/>'
        f'<path class="bm-rays" d="{rays}" pathLength="1" stroke-width="2"/>'
        '</g>'
    )
    return wrap(body, (0, 0, W, H), cls="bm-live"), centre


def ease(u):  # gentle in and out
    return 0.5 - 0.5 * math.cos(math.pi * u)


def motion(centre):
    """Keyframes for the loop. The line's draw is eased by hand so we know when it passes each piece."""
    T0, T1 = 6.0, 64.0  # the line draws over this part of the loop (percent)
    lens = [0.0]
    for a, b in zip(centre, centre[1:]):
        lens.append(lens[-1] + math.dist(a, b))
    total = lens[-1]

    def when(frac):  # percent of the loop at which the line has drawn this fraction of itself
        lo, hi = 0.0, 1.0
        for _ in range(40):
            mid = (lo + hi) / 2
            lo, hi = (mid, hi) if ease(mid) < frac else (lo, mid)
        return T0 + (T1 - T0) * lo

    def closest(pt):
        i = min(range(len(centre)), key=lambda k: math.dist(centre[k], pt))
        return lens[i] / total

    steps = 24
    draw = "\n".join(f"  {T0 + (T1 - T0) * i / steps:.2f}% {{ stroke-dashoffset: {1 - ease(i / steps):.4f}; }}"
                     for i in range(steps + 1))
    css = [f"/* Generated by scripts/brain_sketch.py: one {LOOP:g}s loop. */",
           f".bm-reveal {{ stroke-dasharray: 1 2; animation: bm-draw {LOOP}s linear infinite; }}",
           "@keyframes bm-draw {",
           "  0% { stroke-dashoffset: 1; }",
           draw,
           "  100% { stroke-dashoffset: 0; }",
           "}",
           # the trail, the extra scribble and the star fade together at the end, then it all starts again
           f".bm-trail, .bm-extra, .bm-star {{ animation: bm-fade {LOOP}s ease-in-out infinite; }}",
           "@keyframes bm-fade { 0%, 88% { opacity: 1; } 97%, 100% { opacity: 0; } }",
           f".bm-extra {{ stroke-dasharray: 1 2; animation: bm-fade {LOOP}s ease-in-out infinite, bm-extra {LOOP}s ease-in-out infinite; }}",
           "@keyframes bm-extra { 0% { stroke-dashoffset: 1; } 9%, 100% { stroke-dashoffset: 0; } }",
           # the star: two strokes, a light retrace, the marker, then a few rays
           f".bm-star-a, .bm-star-b, .bm-star-c, .bm-rays {{ stroke-dasharray: 1 2; stroke-dashoffset: 1; }}",
           f".bm-star-a {{ animation: bm-star-a {LOOP}s linear infinite; }}",
           "@keyframes bm-star-a { 0%, 63% { stroke-dashoffset: 1; } 64% { stroke-dashoffset: 0.94; } 69% { stroke-dashoffset: 0.3; } 71%, 100% { stroke-dashoffset: 0; } }",
           f".bm-star-b {{ animation: bm-star-b {LOOP}s linear infinite; }}",
           "@keyframes bm-star-b { 0%, 71% { stroke-dashoffset: 1; } 74% { stroke-dashoffset: 0.35; } 76%, 100% { stroke-dashoffset: 0; } }",
           f".bm-star-c {{ animation: bm-star-c {LOOP}s ease-in-out infinite; }}",
           "@keyframes bm-star-c { 0%, 75% { stroke-dashoffset: 1; } 80%, 100% { stroke-dashoffset: 0; } }",
           f".bm-star-fill {{ animation: bm-star-fill {LOOP}s ease-in-out infinite; }}",
           "@keyframes bm-star-fill { 0%, 74% { opacity: 0; } 82%, 100% { opacity: 1; } }",
           f".bm-rays {{ animation: bm-rays {LOOP}s ease-in-out infinite; }}",
           "@keyframes bm-rays { 0%, 80% { stroke-dashoffset: 1; } 86%, 100% { stroke-dashoffset: 0; } }",
           ]
    for pid, (_, (cx, cy), rot) in PIECES.items():
        at = when(closest((cx, cy)))
        a, b, c = at - 1.5, at + 4, at + 11
        css.append(f".bm-piece--{pid} {{ animation: bm-nudge-{pid} {LOOP}s ease-in-out infinite; }}")
        css.append(f"@keyframes bm-nudge-{pid} {{ 0%, {a:.1f}% {{ transform: rotate(0deg) translateY(0); }} "
                   f"{b:.1f}% {{ transform: rotate({'-' if rot > 0 else ''}2.5deg) translateY(-3px); }} "
                   f"{c:.1f}%, 100% {{ transform: rotate(0deg) translateY(0); }} }}")
    return "\n".join(css) + "\n"


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*"):
        old.unlink()
    (OUT / "paper.svg").write_text(paper())
    live_svg, centre = live()
    (OUT / "live.svg").write_text(live_svg)
    layout = []
    for pid, (maker, (cx, cy), rot) in PIECES.items():
        body, (bx, by, bw, bh) = maker()
        (OUT / f"piece-{pid}.svg").write_text(
            wrap(f'<g transform="rotate({rot})">{body}</g>', (bx, by, bw, bh), cls="bm-piece-svg"))
        layout.append({"id": pid, "x": cx + bx, "y": cy + by, "w": bw, "h": bh, "ox": -bx / bw, "oy": -by / bh})
    (OUT / "layout.json").write_text(json.dumps(layout, indent=1) + "\n")
    (OUT / "motion.css").write_text(motion(centre))
    total = sum(f.stat().st_size for f in OUT.glob("*"))
    print("wrote", len(list(OUT.glob("*"))), "files,", total, "bytes; trail length", round(length(centre)))

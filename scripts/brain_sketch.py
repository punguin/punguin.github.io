"""Generate the hand-drawn "Pick My Brain" illustration from Pung's sketch, in the same style as
the How I work sketches: a tangle of questions on the left, a head in profile, and a brain full of
orbs. The orbs themselves (positions, sizes, fills, copy) live in src/content/brain.json.

Writes src/assets/brain/scene.svg (head, brain, tangle, trail), one orb-<id>.svg per orb and
star.svg. PickMyBrain.astro inlines them so CSS can animate their parts.
Deterministic: rerun after editing brain.json (cd scripts && python3 brain_sketch.py)."""
import json, math, pathlib, random, re
from sketches import Sketch, INK

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "src" / "content" / "brain.json").read_text())
OUT = ROOT / "src" / "assets" / "brain"
W, H = DATA["viewBox"]
STROKE = 2.6  # scene-unit stroke width for the main lines


def smooth(points, closed=False):
    """Catmull-Rom through points, as one cubic path."""
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


def wobbly(points, seed, passes=2, w=STROKE, closed=False, cls=""):
    """A hand-drawn smooth line: each pass jitters the points a little."""
    r = random.Random(seed)
    out = []
    for p in range(passes):
        jp = [(x + r.uniform(-3, 3), y + r.uniform(-3, 3)) for x, y in points]
        op = "" if p == 0 else ' opacity="0.5"'
        c = f' class="{cls}"' if cls and p == 0 else ""
        out.append(f'<path{c} d="{smooth(jp, closed)}" stroke-width="{w if p == 0 else w * 0.55:.1f}"{op}/>')
    return "".join(out)


# ---------- the head, the brain and the tangle ----------

HEAD = [  # profile facing left, from the front of the neck round to the back of the neck
    (430, 664), (424, 610), (412, 540), (364, 512), (318, 494), (302, 470), (298, 452),
    (288, 440), (302, 428), (284, 416), (292, 398), (284, 386), (246, 372), (262, 336),
    (296, 302), (300, 262), (312, 196), (356, 118), (440, 62), (560, 36), (690, 44),
    (810, 92), (892, 176), (924, 290), (904, 410), (850, 500), (800, 560), (792, 664),
]


def brain_outline():
    """A lumpy cloud around every orb, padded so none touches the edge."""
    cx, cy, rx, ry = 634, 292, 270, 218
    pts = []
    n = 26
    for k in range(n):
        t = 2 * math.pi * k / n
        bump = 1 + 0.045 * math.sin(5 * t) + (0.05 if k % 2 else -0.02)
        pts.append((cx + rx * bump * math.cos(t), cy + ry * bump * math.sin(t)))
    return pts


def gyri():
    """A few faint folds inside the brain, behind the orbs."""
    r = random.Random(7)
    paths = []
    for (x, y, length, a) in [(560, 470, 120, -0.3), (860, 250, 90, 1.4), (420, 470, 80, 0.5),
                              (700, 300, 70, 0.2), (360, 330, 60, 1.2), (640, 90, 90, 0.1), (900, 330, 70, 1.8)]:
        pts = []
        for i in range(6):
            s = i / 5
            pts.append((x + math.cos(a) * length * s + r.uniform(-8, 8) + 10 * math.sin(i * 2.1),
                        y + math.sin(a) * length * s + r.uniform(-8, 8) + 10 * math.cos(i * 1.7)))
        paths.append(f'<path d="{smooth(pts)}" stroke-width="1.8" opacity="0.35"/>')
    return "".join(paths)


def tangle():
    s = Sketch(11)
    r = random.Random(12)
    pts = []
    for k in range(24):
        a = k * 2.4 + r.uniform(-0.4, 0.4)
        rad = r.uniform(16, 56)
        pts.append((118 + rad * math.cos(a), 300 + rad * 0.85 * math.sin(a)))
    s.parts.append(f'<path d="{smooth(pts)}" stroke-width="2.4"/>')
    s.question(196, 214, 1.3)
    s.question(54, 236, 1.0)
    s.question(206, 398, 1.1)
    return f'<g class="bm-tangle">{"".join(s.parts)}</g>'


def trail():
    """The dotted line from the questions, over the brow and into the brain."""
    pts = [(176, 292), (228, 262), (268, 214), (318, 150), (380, 120)]
    s = Sketch(13)
    s.arrow(372, 124, 386, 116, w=2.4)
    return (f'<path class="bm-trail" d="{smooth(pts)}" pathLength="1" stroke-width="2.4"/>'
            f'<g class="bm-trail-end">{"".join(s.parts)}</g>')


def face():
    s = Sketch(17)
    # eye: an almond with a lash, looking forward
    s.circle(318, 322, 17, arc=(200, 340), passes=1, w=2.4)
    s.circle(318, 298, 17, arc=(40, 140), passes=1, w=2.4)
    s.circle(310, 310, 3.5, passes=1, w=3)
    s.line(304, 284, 330, 280, passes=1, w=2.4)  # brow
    # nostril and ear
    s.circle(282, 382, 4, arc=(120, 300), passes=1, w=1.8)
    return "".join(s.parts)


def scene():
    brain = brain_outline()
    body = (
        f'<path class="bm-brain-fill" d="{smooth(brain, closed=True)}" fill="#ffe95c" fill-opacity="0.22" stroke="none"/>'
        + wobbly(brain, 3, closed=True, w=2.2, cls="bm-brain")
        + gyri()
        + wobbly(HEAD, 1, w=STROKE, cls="bm-head")
        + face()
        + tangle()
        + trail()
    )
    return (f'<svg class="bm-scene-svg" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" fill="none" '
            f'stroke="{INK}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">{body}</svg>\n')


# ---------- the experience sketches, drawn at their own coordinates then fitted into an orb ----------

def truck():
    s = Sketch(21)
    s.rect(212, 128, 84, 54)
    s.poly([(298, 146), (326, 146), (342, 162), (342, 182), (298, 182)], close=True)
    s.poly([(304, 150), (324, 150), (334, 162), (304, 162)], close=True, passes=1, w=1.5)
    for x in (236, 274, 324):
        s.circle(x, 186, 9, passes=1)
    for y in (140, 156, 172):
        s.line(176 + (y % 3) * 4, y, 198, y, passes=1, w=1.5)
    return s, (176, 128, 342, 195)


def glasses():
    s = Sketch(31)
    s.circle(420, 156, 26); s.circle(486, 156, 26)
    s.circle(453, 156, 9, arc=(200, 340), passes=1)
    s.line(394, 150, 374, 140, passes=1); s.line(512, 150, 532, 140, passes=1)
    s.line(410, 146, 418, 140, passes=1, w=1.5); s.line(476, 146, 484, 140, passes=1, w=1.5)
    return s, (374, 130, 532, 182)


def parcel():
    s = Sketch(41)
    s.rect(600, 150, 64, 46)
    s.poly([(600, 150), (616, 132), (680, 132), (664, 150)])
    s.poly([(664, 196), (680, 178), (680, 132)])
    s.line(632, 150, 648, 132, passes=1, w=1.5)
    s.circle(700, 92, 10, arc=(150, 390))
    s.poly([(692, 98), (700, 114), (708, 98)], passes=1)
    s.circle(700, 91, 3, passes=1)
    s.line(672, 128, 696, 116, dash=True, w=1.5)
    return s, (600, 80, 710, 196)


def conversation():
    s = Sketch(51)
    s.poly([(764, 106), (846, 106), (846, 146), (790, 146), (776, 160), (778, 146), (764, 146)], close=True)
    for y, x2 in ((118, 830), (130, 812)):
        s.line(776, y, x2, y, passes=1, w=1.5)
    s.poly([(808, 164), (882, 164), (882, 204), (872, 204), (876, 218), (860, 204), (808, 204)], close=True)
    s.line(845, 174, 845, 194, passes=1, w=2.5); s.line(835, 184, 855, 184, passes=1, w=2.5)
    return s, (764, 106, 882, 218)


SKETCHES = {"truck": truck, "glasses": glasses, "parcel": parcel, "conversation": conversation}


def fitted(name, r):
    """The named sketch scaled into a circle of radius r centred on 0,0, strokes kept at scene weight."""
    s, (x0, y0, x1, y1) = SKETCHES[name]()
    w, h = x1 - x0, y1 - y0
    k = min(1.36 * r / w, 1.2 * r / h)
    cx, cy = (x0 + x1) / 2, (y0 + y1) / 2
    body = "".join(s.parts)
    body = re.sub(r'stroke-width="([\d.]+)"', lambda m: f'stroke-width="{float(m.group(1)) * 1.1 / k:.2f}"', body)
    body = re.sub(r'stroke-dasharray="5 6"', f'stroke-dasharray="{5 / k:.1f} {6 / k:.1f}"', body)
    return f'<g class="bm-art" transform="scale({k:.3f}) translate({-cx:.1f},{-cy:.1f})">{body}</g>'


def orb(o, i):
    r = o["r"]
    s = Sketch(100 + i)
    rnd = random.Random(200 + i)
    # a soft filled disc, slightly off-round, then the hand-drawn outline
    pts = []
    for k in range(14):
        t = 2 * math.pi * k / 14
        rr = r * (0.94 + rnd.uniform(-0.03, 0.03))
        pts.append((rr * math.cos(t), rr * math.sin(t)))
    fill = f'<path class="bm-orb-fill" d="{smooth(pts, closed=True)}" fill="{o["fill"]}" stroke="none"/>'
    if o["kind"] == "future":
        ring = f'<circle class="bm-orb-ring" cx="0" cy="0" r="{r * 0.92:.1f}" stroke-width="2.4" stroke-dasharray="7 8"/>'
    else:
        s.circle(0, 0, r * 0.94, w=2.4)
        ring = f'<g class="bm-orb-ring">{"".join(s.parts)}</g>'
    art = fitted(o["sketch"], r) if o.get("sketch") else ""
    pad = 6
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{-r - pad} {-r - pad} {2 * (r + pad)} {2 * (r + pad)}" '
            f'fill="none" stroke="{INK}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
            f'{fill}{ring}{art}</svg>\n')


def star():
    s = Sketch(91)
    pts = []
    for k in range(10):
        a = -math.pi / 2 + k * math.pi / 5
        rr = 34 if k % 2 == 0 else 15
        pts.append((50 + rr * math.cos(a), 50 + rr * math.sin(a)))
    s.poly(pts, close=True, w=2.4)
    rays = Sketch(92)
    for a in (-150, -110, -60, -20, 20, 160):
        t = math.radians(a)
        rays.line(50 + 42 * math.cos(t), 50 + 42 * math.sin(t), 50 + 52 * math.cos(t), 50 + 52 * math.sin(t), passes=1, w=2.2)
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="-6 -6 112 112" fill="none" stroke="{INK}" '
            f'stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">'
            f'<path d="M{" L".join(f"{x:.1f},{y:.1f}" for x, y in pts)} Z" fill="#ffe95c" stroke="none"/>'
            f'<g class="bm-star">{"".join(s.parts)}</g><g class="bm-rays">{"".join(rays.parts)}</g></svg>\n')


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("orb-*.svg"):
        old.unlink()
    (OUT / "scene.svg").write_text(scene())
    (OUT / "star.svg").write_text(star())
    for i, o in enumerate(DATA["orbs"]):
        (OUT / f"orb-{o['id']}.svg").write_text(orb(o, i))
    total = sum(p.stat().st_size for p in OUT.glob("*.svg"))
    print("wrote", len(list(OUT.glob("*.svg"))), "files,", total, "bytes")

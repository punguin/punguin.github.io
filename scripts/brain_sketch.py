"""Draw the static parts of the "Pick My Brain" illustration: a clean profile of a head, a
maze-like brain, and the hand-drawn tangle of questions at the base of the neck. The moving
parts (problem blobs, the brain nodes and the boxes of order) are built from
src/content/brain.json by PickMyBrain.astro and animated by src/scripts/pick-my-brain.ts.

Writes src/assets/brain/scene.svg. Deterministic: rerun after editing brain.json
(cd scripts && python3 brain_sketch.py)."""
import json, math, pathlib, random
from sketches import Sketch, INK

ROOT = pathlib.Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT / "src" / "content" / "brain.json").read_text())
OUT = ROOT / "src" / "assets" / "brain"


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


# A clean profile facing left: front of the neck, chin, lips, nose, brow, crown, back of the head.
HEAD = [
    (468, 600), (466, 540), (452, 498), (402, 478), (352, 462), (338, 442), (330, 426),
    (342, 414), (328, 402), (334, 388), (322, 376), (288, 360), (302, 330), (330, 292),
    (334, 254), (348, 180), (394, 108), (472, 60), (580, 40), (692, 58), (772, 116),
    (816, 208), (822, 308), (796, 400), (748, 470), (712, 530), (696, 600),
]


def arc_points(cx, cy, rx, ry, start, end, n, wobble=0.0, seed=0):
    r = random.Random(seed)
    out = []
    for k in range(n):
        t = start + (end - start) * k / (n - 1)
        f = 1 + wobble * math.sin(5 * t + 0.6) + r.uniform(-wobble, wobble)
        out.append((cx + rx * f * math.cos(t), cy + ry * f * math.sin(t)))
    return out


def brain():
    b = DATA["brain"]
    cx, cy, rx, ry = b["cx"], b["cy"], b["rx"], b["ry"]
    outline = arc_points(cx, cy, rx, ry, 0, 2 * math.pi, 23, wobble=0.035, seed=4)[:-1]
    parts = [f'<path class="bm-brain" d="{smooth(outline, closed=True)}"/>']
    # The maze: two inner rings, each broken by doorways, joined by a few short walls.
    for scale, gaps, seed in ((0.72, [(0.3, 0.75), (2.4, 2.9), (4.3, 4.8)], 5), (0.42, [(1.2, 1.8), (3.6, 4.2)], 6)):
        a = gaps[-1][1] - 2 * math.pi
        for g0, g1 in gaps:
            pts = arc_points(cx, cy, rx * scale, ry * scale, a, g0, 10, wobble=0.02, seed=seed)
            parts.append(f'<path class="bm-maze" d="{smooth(pts)}"/>')
            a = g1
    for t, r0, r1 in ((0.0, 0.42, 0.72), (1.9, 0.42, 0.72), (3.3, 0.72, 0.96), (5.2, 0.42, 0.72), (0.9, 0.72, 0.96)):
        c, s = math.cos(t), math.sin(t)
        parts.append(f'<path class="bm-maze" d="M{cx + rx * r0 * c:.1f},{cy + ry * r0 * s:.1f} '
                     f'L{cx + rx * r1 * c:.1f},{cy + ry * r1 * s:.1f}"/>')
    return "".join(parts)


def tangle():
    tx, ty = DATA["tangle"]
    s = Sketch(11)
    r = random.Random(12)
    pts = []
    for k in range(26):
        a = k * 2.4 + r.uniform(-0.4, 0.4)
        rad = r.uniform(14, 52)
        pts.append((tx + rad * math.cos(a), ty + rad * 0.6 * math.sin(a)))
    s.parts.append(f'<path d="{smooth(pts)}" stroke-width="2.4"/>')
    marks = []
    for i, (x, y, k) in enumerate(((tx - 92, ty - 22, 1.2), (tx + 96, ty - 40, 1.0), (tx + 60, ty + 42, 0.9), (tx - 58, ty + 40, 0.8))):
        q = Sketch(20 + i)
        q.question(x, y, k)
        marks.append(f'<g class="bm-q" style="--i:{i}">{"".join(q.parts)}</g>')
    return f'<g class="bm-tangle">{"".join(s.parts)}</g>{"".join(marks)}'


def scene():
    x, y, w, h = DATA["viewBox"]
    body = f'<path class="bm-head" d="{smooth(HEAD)}"/>' + brain() + tangle()
    return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="{x} {y} {w} {h}" fill="none" stroke="{INK}" '
            f'stroke-linecap="round" stroke-linejoin="round">{body}</svg>\n')


if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for old in OUT.glob("*.svg"):
        old.unlink()
    (OUT / "scene.svg").write_text(scene())
    print("wrote", OUT / "scene.svg", (OUT / "scene.svg").stat().st_size, "bytes")

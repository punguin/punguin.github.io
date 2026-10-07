"""Generate the hero's hand-drawn scene (src/assets/hero-scene.svg), in the same style as the
How I work sketches. It reads left to right as the site's own story: a tangled problem space,
then the four projects (Relay's trucks, Zenni's glasses, an order on its way, SpokGo's clinical
conversations), joined by one line that ends clear. Hero.astro animates the groups on a loop.
Deterministic: rerun to regenerate."""
import math, pathlib, random
from sketches import Sketch, INK

OUT = pathlib.Path(__file__).resolve().parent.parent / "src" / "assets" / "hero-scene.svg"
W, H = 960, 320
FILLS = {"relay": "#f3c3a6", "account": "#d5f5c2", "tracking": "#a8e5e5", "spokgo": "#f6d0ff", "yellow": "#ffe95c"}


def blob(seed, cx, cy, w, h, fill, tilt=0.0):
    """A sticky-note shape: a rounded, slightly uneven quad, filled and unstroked."""
    r = random.Random(seed)
    j = lambda a=5: r.uniform(-a, a)
    pts = [(-w / 2 + j(), -h / 2 + j()), (w / 2 + j(), -h / 2 + j()), (w / 2 + j(), h / 2 + j()), (-w / 2 + j(), h / 2 + j())]
    t = math.radians(tilt)
    pts = [(cx + x * math.cos(t) - y * math.sin(t), cy + x * math.sin(t) + y * math.cos(t)) for x, y in pts]
    d = f"M{(pts[0][0] + pts[1][0]) / 2:.1f},{(pts[0][1] + pts[1][1]) / 2:.1f}"
    for i in range(4):
        corner, nxt = pts[(i + 1) % 4], pts[(i + 2) % 4]
        d += f" Q{corner[0]:.1f},{corner[1]:.1f} {(corner[0] + nxt[0]) / 2:.1f},{(corner[1] + nxt[1]) / 2:.1f}"
    return f'<path class="hs-blob" d="{d} Z" fill="{fill}" stroke="none"/>'


def smooth(points):
    """Catmull-Rom through points, as one cubic path."""
    d = f"M{points[0][0]:.1f},{points[0][1]:.1f}"
    for i in range(len(points) - 1):
        p0 = points[max(i - 1, 0)]; p1 = points[i]; p2 = points[i + 1]; p3 = points[min(i + 2, len(points) - 1)]
        c1 = (p1[0] + (p2[0] - p0[0]) / 6, p1[1] + (p2[1] - p0[1]) / 6)
        c2 = (p2[0] - (p3[0] - p1[0]) / 6, p2[1] - (p3[1] - p1[1]) / 6)
        d += f" C{c1[0]:.1f},{c1[1]:.1f} {c2[0]:.1f},{c2[1]:.1f} {p2[0]:.1f},{p2[1]:.1f}"
    return d


def group(cls, s, i=None, extra=""):
    style = f' style="--i:{i}"' if i is not None else ""
    return f'<g class="{cls}"{style}>{extra}{"".join(s.parts)}</g>'


def tangle():
    s = Sketch(11)
    r = random.Random(12)
    pts = []
    for k in range(22):
        a = k * 2.4 + r.uniform(-0.4, 0.4)
        rad = r.uniform(12, 40)
        pts.append((100 + rad * math.cos(a), 160 + rad * 0.85 * math.sin(a)))
    s.parts.append(f'<path d="{smooth(pts)}" stroke-width="2"/>')
    s.question(150, 82, 1.1)
    return group("hs-v hs-tangle", s, 0)


def truck():
    s = Sketch(21)
    s.rect(212, 128, 84, 54)             # trailer
    s.poly([(298, 146), (326, 146), (342, 162), (342, 182), (298, 182)], close=True)  # cab
    s.poly([(304, 150), (324, 150), (334, 162), (304, 162)], close=True, passes=1, w=1.5)  # window
    for x in (236, 274, 324):
        s.circle(x, 186, 9, passes=1)
    for y in (140, 156, 172):            # speed lines
        s.line(176 + (y % 3) * 4, y, 198, y, passes=1, w=1.5)
    return group("hs-v", s, 1, blob(1, 270, 160, 190, 128, FILLS["relay"], -3))


def glasses():
    s = Sketch(31)
    s.circle(420, 156, 26); s.circle(486, 156, 26)
    s.circle(453, 156, 9, arc=(200, 340), passes=1)       # bridge
    s.line(394, 150, 374, 140, passes=1); s.line(512, 150, 532, 140, passes=1)  # temples
    s.line(410, 146, 418, 140, passes=1, w=1.5); s.line(476, 146, 484, 140, passes=1, w=1.5)  # glints
    return group("hs-v", s, 2, blob(2, 453, 158, 196, 124, FILLS["account"], 2.5))


def parcel():
    s = Sketch(41)
    s.rect(600, 150, 64, 46)                                   # front
    s.poly([(600, 150), (616, 132), (680, 132), (664, 150)])   # top
    s.poly([(664, 196), (680, 178), (680, 132)])               # side
    s.line(632, 150, 648, 132, passes=1, w=1.5)                # tape
    # location pin and the route to it
    s.circle(700, 92, 10, arc=(150, 390))
    s.poly([(692, 98), (700, 114), (708, 98)], passes=1)
    s.circle(700, 91, 3, passes=1)
    s.line(672, 128, 696, 116, dash=True, w=1.5)
    return group("hs-v", s, 3, blob(3, 640, 160, 176, 132, FILLS["tracking"], -2))


def conversation():
    s = Sketch(51)
    s.poly([(764, 106), (846, 106), (846, 146), (790, 146), (776, 160), (778, 146), (764, 146)], close=True)
    for y, x2 in ((118, 830), (130, 812)):
        s.line(776, y, x2, y, passes=1, w=1.5)
    s.poly([(808, 164), (882, 164), (882, 204), (872, 204), (876, 218), (860, 204), (808, 204)], close=True)
    s.line(845, 174, 845, 194, passes=1, w=2.5); s.line(835, 184, 855, 184, passes=1, w=2.5)  # clinical plus
    return group("hs-v", s, 4, blob(4, 822, 160, 176, 140, FILLS["spokgo"], 3))


def trail():
    """One line from the tangle to a clear finish: the path the animation draws."""
    r = random.Random(61)
    xs = [110, 180, 270, 360, 453, 545, 640, 730, 822, 900]
    pts = [(x, 268 + (r.uniform(-10, 10) if 0 < i < len(xs) - 1 else 0)) for i, x in enumerate(xs)]
    pts[0] = (118, 200)
    d = smooth(pts)
    s = Sketch(62)
    s.arrow(900, 268, 930, 262, w=2)
    # a little highlighter sparkle at the end
    spark = Sketch(63)
    for k in range(8):
        a = math.radians(k * 45)
        spark.line(944 + 9 * math.cos(a), 238 + 9 * math.sin(a), 944 + (16 if k % 2 == 0 else 13) * math.cos(a), 238 + (16 if k % 2 == 0 else 13) * math.sin(a), passes=1, w=2)
    return (f'<path class="hs-trail" d="{d}" pathLength="1" stroke-width="2.5"/>'
            f'<g class="hs-end">{"".join(s.parts)}<circle cx="944" cy="238" r="6" fill="{FILLS["yellow"]}" stroke="none"/>{"".join(spark.parts)}</g>')


def scene():
    body = "".join([tangle(), truck(), glasses(), parcel(), conversation(), trail()])
    return (f'<svg class="hero-scene" xmlns="http://www.w3.org/2000/svg" viewBox="0 60 {W} {H - 60}" fill="none" '
            f'stroke="{INK}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">{body}</svg>\n')


if __name__ == "__main__":
    OUT.parent.mkdir(parents=True, exist_ok=True)
    OUT.write_text(scene())
    print("wrote", OUT, OUT.stat().st_size, "bytes")

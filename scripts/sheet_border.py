"""Generate the pencil edge of the white page (src/assets/sheet-border.svg), drawn in the same hand as
the hero sketch: a soft line whose weight wanders, a lighter second pass that drifts off it, and
corners where the two edges run past each other instead of meeting neatly.

The page is as long as the whole site, so the edge is a CSS border-image: four corners plus four edge
tiles that repeat. Every edge tile is periodic (it starts and ends at the same height and weight), so
the repeats join without a seam. Deterministic: python3 scripts/sheet_border.py"""
import math, pathlib, random

INK = "#1a3300"  # the hero's pencil
ROOT = pathlib.Path(__file__).resolve().parent.parent
OUT = ROOT / "src" / "assets" / "sheet-border.svg"

C = 60     # corner slice (scene units); global.css slices the image here
M = 2000   # edge tile length
S = C * 2 + M
LINE = 44  # where the line runs inside the corner slice, leaving room outside it for the overshoots
W = 6.6    # line weight


def poly(pts):
    return "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts) + " Z"


def periodic(r, terms):
    """A wobble f(t) with f(0) = f(1) = 0, made of whole-number frequencies so tiles repeat cleanly."""
    waves = [(n, a, r.uniform(0, 2 * math.pi)) for n, a in terms]
    return lambda t: sum(a * (math.sin(2 * math.pi * n * t + p) - math.sin(p)) for n, a, p in waves)


def edge(r):
    """The pencil line along one edge tile, drawn horizontally from x=0 to x=M around y=0.
    Returns path data for the main line and its lighter retraces."""
    off = periodic(r, [(1, 2.6), (3, 1.3), (7, 0.6)])
    # weight: never zero on the main line, but it thins where the pencil eases off the paper
    weight = periodic(r, [(2, 0.16), (5, 0.12), (13, 0.1)])
    top, bot = [], []
    n = 160
    for i in range(n + 1):
        t = i / n
        x, y = t * M, off(t)
        hw = W * (1 + weight(t)) / 2
        top.append((x, y - hw))
        bot.append((x, y + hw))
    parts = [poly(top + bot[::-1])]
    # a few lighter strokes beside the line, as if it was gone over again
    for _ in range(5):
        a = r.uniform(0.05, 0.7)
        b = min(0.95, a + r.uniform(0.12, 0.3))
        dy = r.uniform(1.6, 3.2) * r.choice((-1, 1))
        drift = r.uniform(-1.2, 1.2)
        top, bot = [], []
        m = 30
        for i in range(m + 1):
            u = i / m
            t = a + (b - a) * u
            taper = min(1, u * 6, (1 - u) * 6) ** 0.6
            y = off(t) + dy + drift * u
            hw = max(0.3, W * 0.42 * taper) / 2
            top.append((t * M, y - hw))
            bot.append((t * M, y + hw))
        parts.append(f'<path d="{poly(top + bot[::-1])}" opacity="0.5"/>')
    return parts[0], parts[1:]


def corner_line(r, start, end):
    """A short stroke ending at full weight on the edge line (where the tile picks up), tapering at the
    free end, which overshoots past the corner."""
    (x0, y0), (x1, y1) = start, end
    l = math.dist(start, end)
    nx, ny = -(y1 - y0) / l, (x1 - x0) / l
    bow = r.uniform(-0.8, 0.8)
    a, b = [], []
    n = 40
    for i in range(n + 1):
        u = i / n
        x, y = x0 + (x1 - x0) * u, y0 + (y1 - y0) * u
        k = bow * math.sin(math.pi * u)
        x, y = x + nx * k, y + ny * k
        hw = W * max(0.12, min(1, u * 2.4)) ** 0.7 / 2
        a.append((x + nx * hw, y + ny * hw))
        b.append((x - nx * hw, y - ny * hw))
    return poly(a + b[::-1])


def main():
    r = random.Random(7)
    out = []
    # Edge tiles, drawn horizontally and turned into place. Order: top, right, bottom, left.
    places = [
        f"translate({C},{LINE})",
        f"translate({S - LINE},{C}) rotate(90)",
        f"translate({S - C},{S - LINE}) rotate(180)",
        f"translate({LINE},{S - C}) rotate(270)",
    ]
    for tf in places:
        main_d, extra = edge(r)
        out.append(f'<g transform="{tf}"><path d="{main_d}"/>{"".join(extra)}</g>')

    # Corners: each edge runs on past the corner, and the two lines cross a little off true.
    for cx, cy, sx, sy in [(0, 0, 1, 1), (S, 0, -1, 1), (S, S, -1, -1), (0, S, 1, -1)]:
        # the horizontal edge: from beyond the corner, in to where the tile starts
        h_over = r.uniform(22, 40)
        out.append(f'<path d="{corner_line(r, (cx + sx * (LINE - h_over), cy + sy * (LINE + r.uniform(-1.5, 1.5))), (cx + sx * C, cy + sy * LINE))}"/>')
        v_over = r.uniform(22, 40)
        out.append(f'<path d="{corner_line(r, (cx + sx * (LINE + r.uniform(-1.5, 1.5)), cy + sy * (LINE - v_over)), (cx + sx * LINE, cy + sy * C))}"/>')

    svg = (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {S} {S}" width="{S}" height="{S}">'
           f'<g fill="{INK}" fill-opacity="0.82">{"".join(out)}</g></svg>\n')
    OUT.write_text(svg)
    print(f"wrote {OUT.relative_to(ROOT)} ({len(svg) // 1024} KB)")


if __name__ == "__main__":
    main()

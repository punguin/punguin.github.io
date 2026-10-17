"""Generate the hand-drawn "How I work" sketches (Say Briefly style: monoline Forest Ink,
1.5–2px strokes, slightly imperfect). Deterministic: rerun to regenerate public/illustrations/*.svg."""
import math, random, pathlib

INK = "#1a3300"
OUT = pathlib.Path(__file__).resolve().parent.parent / "public" / "illustrations"
W, H = 240, 180

class Sketch:
    def __init__(self, seed):
        self.r = random.Random(seed)
        self.parts = []

    def j(self, a=1.4):
        return self.r.uniform(-a, a)

    def line(self, x1, y1, x2, y2, w=2, dash=False, passes=2):
        for p in range(passes):
            mx = (x1 + x2) / 2 + self.j(2.2)
            my = (y1 + y2) / 2 + self.j(2.2)
            d = f"M{x1+self.j():.1f},{y1+self.j():.1f} Q{mx:.1f},{my:.1f} {x2+self.j():.1f},{y2+self.j():.1f}"
            extra = ' stroke-dasharray="5 6"' if dash else ""
            op = "" if p == 0 else ' opacity="0.55"'
            self.parts.append(f'<path d="{d}" stroke-width="{w if p == 0 else w*0.6:.1f}"{extra}{op}/>')
            if dash:
                break

    def poly(self, pts, close=False, **k):
        seq = pts + ([pts[0]] if close else [])
        for a, b in zip(seq, seq[1:]):
            self.line(*a, *b, **k)

    def rect(self, x, y, w, h, **k):
        self.poly([(x, y), (x + w, y), (x + w, y + h), (x, y + h)], close=True, **k)

    def circle(self, cx, cy, r, w=2, passes=2, arc=(0, 360)):
        for p in range(passes):
            start = math.radians(arc[0] + self.j(8))
            end = math.radians(arc[1] + self.j(10) + (14 if arc == (0, 360) else 0))
            n = 28
            pts = []
            for i in range(n + 1):
                t = start + (end - start) * i / n
                rr = r + self.j(r * 0.05)
                pts.append((cx + rr * math.cos(t), cy + rr * math.sin(t)))
            d = "M" + " L".join(f"{x:.1f},{y:.1f}" for x, y in pts)
            op = "" if p == 0 else ' opacity="0.55"'
            self.parts.append(f'<path d="{d}" stroke-width="{w if p == 0 else w*0.6:.1f}"{op}/>')

    def arrow(self, x1, y1, x2, y2, **k):
        self.line(x1, y1, x2, y2, **k)
        a = math.atan2(y2 - y1, x2 - x1)
        for s in (-1, 1):
            self.line(x2, y2, x2 - 10 * math.cos(a + s * 0.45), y2 - 10 * math.sin(a + s * 0.45), passes=1)

    def question(self, x, y, size=1.0):
        """Hand-drawn question mark centred on (x, y)."""
        self.circle(x, y - 8 * size, 8 * size, w=2.5, passes=1, arc=(180, 400))
        self.line(x + 1, y + 0 * size, x, y + 8 * size, w=2.5, passes=1)
        self.circle(x, y + 15 * size, 1.5, w=2.5, passes=1)

    def bang(self, x, y, size=1.0):
        """Hand-drawn exclamation mark centred on (x, y)."""
        self.line(x, y - 14 * size, x, y + 5 * size, w=2.5, passes=1)
        self.circle(x, y + 12 * size, 1.5, w=2.5, passes=1)

    def svg(self):
        body = "\n  ".join(self.parts)
        return (f'<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 {W} {H}" width="{W}" height="{H}" '
                f'fill="none" stroke="{INK}" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">\n  {body}\n</svg>\n')

def person(s, x, y, scale=1.0):
    s.circle(x, y, 13 * scale)
    s.circle(x, y + 50 * scale, 26 * scale, arc=(200, 340))
    s.line(x - 4 * scale, y + 2 * scale, x - 4 * scale, y + 3 * scale, passes=1)
    s.line(x + 4 * scale, y + 2 * scale, x + 4 * scale, y + 3 * scale, passes=1)

def understand_people():
    s = Sketch(1)
    person(s, 66, 70, 1.25)
    person(s, 128, 88, 1.05)
    # speech bubble with a question mark
    s.poly([(150, 26), (214, 26), (214, 66), (176, 66), (164, 80), (166, 66), (150, 66)], close=True)
    s.question(182, 46)
    # thought dots
    s.circle(110, 44, 3, passes=1); s.circle(122, 34, 4.5, passes=1)
    s.line(30, 158, 210, 158, w=1.5)
    return s

def understand_the_system():
    s = Sketch(2)
    nodes = [(52, 52), (126, 36), (196, 70), (84, 128), (166, 140)]
    s.rect(30, 34, 44, 34); s.circle(126, 36, 18); s.rect(176, 52, 42, 36)
    s.circle(84, 128, 20); s.rect(144, 122, 46, 36)
    s.arrow(76, 50, 106, 40); s.arrow(144, 44, 174, 62); s.arrow(60, 70, 76, 108)
    s.arrow(104, 130, 142, 138); s.line(190, 90, 172, 120, dash=True)
    # small gear
    for k in range(8):
        a = math.radians(k * 45)
        s.line(126 + 8 * math.cos(a), 36 + 8 * math.sin(a), 126 + 13 * math.cos(a), 36 + 13 * math.sin(a), passes=1, w=1.5)
    return s

def find_the_gaps():
    s = Sketch(3)
    # two blocks that don't line up, with a dashed gap between them
    s.poly([(26, 70), (98, 70), (98, 92), (110, 92), (110, 116), (98, 116), (98, 140), (26, 140)], close=True)
    s.poly([(136, 60), (206, 60), (206, 130), (136, 130), (136, 108), (124, 108), (124, 84), (136, 84)], close=True)
    s.line(116, 40, 116, 160, dash=True)
    # magnifying glass over the gap
    s.circle(150, 44, 20)
    s.line(164, 58, 186, 82, w=3, passes=1)
    s.bang(150, 42, 0.8)
    return s

def close_the_gaps():
    s = Sketch(4)
    # two cliffs joined by a plank bridge
    s.poly([(18, 160), (18, 92), (86, 92), (100, 160)])
    s.poly([(222, 160), (222, 92), (154, 92), (140, 160)])
    s.line(80, 88, 160, 88, w=2.5)
    for x in range(92, 156, 12):
        s.line(x, 88, x, 98, passes=1, w=1.5)
    # a pencil drawing the last plank
    s.poly([(150, 30), (200, 64), (192, 74), (142, 40)], close=True)
    s.line(142, 40, 132, 26, passes=1); s.line(132, 26, 150, 30, passes=1)
    s.line(176, 44, 168, 56, passes=1, w=1.5)
    # sparkle
    s.line(56, 34, 56, 54, passes=1); s.line(46, 44, 66, 44, passes=1)
    return s

def see_what_changed():
    s = Sketch(5)
    s.line(34, 24, 34, 150); s.line(34, 150, 214, 150)
    s.poly([(42, 132), (82, 118), (112, 124), (148, 86), (190, 52)], w=2.5)
    s.circle(190, 52, 6, passes=1)
    s.line(112, 124, 112, 150, dash=True)
    # check mark
    s.poly([(150, 34), (160, 46), (182, 20)], w=3)
    # eye
    s.circle(74, 56, 16, arc=(200, 340)); s.circle(74, 44, 16, arc=(20, 160)); s.circle(74, 50, 5, passes=1)
    return s

SKETCHES = {
    "understand-people": understand_people,
    "understand-the-system": understand_the_system,
    "find-the-gaps": find_the_gaps,
    "close-the-gaps": close_the_gaps,
    "see-what-changed": see_what_changed,
}

if __name__ == "__main__":
    OUT.mkdir(parents=True, exist_ok=True)
    for name, fn in SKETCHES.items():
        (OUT / f"{name}.svg").write_text(fn().svg())
        print("wrote", name)

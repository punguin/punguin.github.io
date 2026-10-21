/**
 * Line-based three-way merge for the site editor. When a file changed on GitHub after the editor
 * loaded it, the editor merges the user's edits (base → mine) with the newer commit (base → theirs).
 * Returns null when both sides changed the same lines, so the caller can stop instead of
 * overwriting someone's work.
 */

type Hunk = { start: number; end: number; lines: string[] }; // replace base[start, end) with lines

function hunks(base: string[], other: string[]): Hunk[] {
  const n = base.length, m = other.length;
  // LCS table, filled from the end so matches can be walked forwards.
  const lcs = Array.from({ length: n + 1 }, () => new Uint32Array(m + 1));
  for (let i = n - 1; i >= 0; i--) {
    for (let j = m - 1; j >= 0; j--) {
      lcs[i][j] = base[i] === other[j] ? lcs[i + 1][j + 1] + 1 : Math.max(lcs[i + 1][j], lcs[i][j + 1]);
    }
  }
  const out: Hunk[] = [];
  let i = 0, j = 0, hunk: Hunk | null = null;
  const flush = () => { if (hunk) { hunk.end = i; out.push(hunk); hunk = null; } };
  while (i < n || j < m) {
    if (i < n && j < m && base[i] === other[j]) { flush(); i++; j++; continue; }
    hunk ??= { start: i, end: i, lines: [] };
    if (j < m && (i >= n || lcs[i][j + 1] >= lcs[i + 1][j])) hunk.lines.push(other[j++]);
    else i++;
  }
  flush();
  return out;
}

const same = (a: Hunk, b: Hunk) => a.start === b.start && a.end === b.end && a.lines.join('\n') === b.lines.join('\n');
// Hunks touch when their base ranges overlap, or when they insert at the same spot.
const clash = (a: Hunk, b: Hunk) => (a.start < b.end && b.start < a.end) || a.start === b.start || (a.start === a.end && a.start === b.end) || (b.start === b.end && b.start === a.end);

export function merge3(base: string, mine: string, theirs: string): string | null {
  if (mine === base || mine === theirs) return theirs;
  if (theirs === base) return mine;
  const b = base.split('\n');
  const ours = hunks(b, mine.split('\n'));
  const other = hunks(b, theirs.split('\n')).filter((h) => !ours.some((o) => same(o, h)));
  if (other.some((h) => ours.some((o) => !same(o, h) && clash(o, h)))) return null;
  const all = [...ours, ...other].sort((x, y) => y.start - x.start || y.end - x.end);
  for (const h of all) b.splice(h.start, h.end - h.start, ...h.lines);
  return b.join('\n');
}

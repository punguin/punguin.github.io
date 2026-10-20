// Image audit (Pung, 2026-10-20): images whose bytes still match the snapshot in
// src/data/image-audit.json are the old ones. Replacing a file changes its bytes, so its tag
// disappears on the next build. To turn the tags off, set AUDIT to false.
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import snapshot from '../data/image-audit.json';

export const AUDIT = true;

let cache: string[] | undefined;
export function oldImages(): string[] {
  if (!AUDIT) return [];
  return (cache ??= Object.entries(snapshot as Record<string, string>)
    .filter(([url, sha]) => {
      const file = path.join(process.cwd(), 'public', url);
      return fs.existsSync(file) && crypto.createHash('sha1').update(fs.readFileSync(file)).digest('hex') === sha;
    })
    .map(([url]) => url));
}

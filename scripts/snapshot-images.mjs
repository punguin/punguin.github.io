// Records a fingerprint of every page image (public/images, public/illustrations) in
// src/data/image-audit.json. Images whose bytes still match get an "Old" tag on the site
// (src/lib/old-images.ts), so replaced ones show clean. Run again to reset: node scripts/snapshot-images.mjs
import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

const PUBLIC = path.join(process.cwd(), 'public');
const IMAGE = /\.(png|jpe?g|webp|gif|svg|avif)$/i;
const walk = (dir) => fs.readdirSync(dir, { withFileTypes: true }).flatMap((d) => {
  const p = path.join(dir, d.name);
  return d.isDirectory() ? walk(p) : [p];
});

const out = {};
for (const dir of ['images', 'illustrations']) {
  for (const f of walk(path.join(PUBLIC, dir)).filter((f) => IMAGE.test(f)).sort()) {
    const url = '/' + path.relative(PUBLIC, f).split(path.sep).join('/');
    out[url] = crypto.createHash('sha1').update(fs.readFileSync(f)).digest('hex');
  }
}
fs.writeFileSync(path.join(process.cwd(), 'src/data/image-audit.json'), JSON.stringify(out, null, 2) + '\n');
console.log(`Recorded ${Object.keys(out).length} images.`);

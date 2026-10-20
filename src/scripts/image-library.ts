/**
 * Image library (/admin/images). Lists every image the site serves (rendered at build time) and swaps
 * one for a new file in place through the GitHub API: same path, so every page using it updates on the
 * next build. Raster images are re-encoded in the browser to the slot's format (WebP stays WebP) and
 * capped at 2400px wide; SVG slots take SVG files only. Shares the site editor's stored token.
 */

const REPO = 'punguin/punguin.github.io';
const API = 'https://api.github.com';
const STORE = 'pung-brooks:editor';
const MAX_WIDTH = 2400;
const MAX_BYTES = 8 * 1024 * 1024;
const MIME: Record<string, string> = { webp: 'image/webp', png: 'image/png', jpg: 'image/jpeg', jpeg: 'image/jpeg', gif: 'image/gif', avif: 'image/avif', svg: 'image/svg+xml' };

const $ = <T extends HTMLElement>(sel: string, root: ParentNode = document) => root.querySelector<T>(sel)!;
const status = $<HTMLElement>('[data-status]');
const connectForm = $<HTMLFormElement>('[data-connect]');
const connected = $<HTMLElement>('[data-connected]');
const picker = $<HTMLInputElement>('[data-file]');
const cards = Array.from(document.querySelectorAll<HTMLElement>('[data-asset]'));

let token = '';
let branch = '';
let target: HTMLElement | null = null; // the card the file picker is choosing for

function setStatus(text: string, kind: 'ok' | 'error' | 'busy' | '' = '') {
  status.textContent = text;
  status.dataset.kind = kind;
}

// ---------- GitHub ----------

async function gh(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', ...(init.headers || {}) },
  });
  if (!res.ok) {
    const msg = (await res.json().catch(() => ({}))).message || res.statusText;
    throw Object.assign(new Error(`GitHub said: ${msg} (${res.status})`), { status: res.status });
  }
  return res.json();
}

const toBase64 = (bytes: Uint8Array) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};

async function currentSha(path: string): Promise<string | undefined> {
  try {
    return (await gh(`/repos/${REPO}/contents/${path}?ref=${encodeURIComponent(branch)}`)).sha;
  } catch (err) {
    if ((err as { status?: number }).status === 404) return undefined; // not on this branch yet: create it
    throw err;
  }
}

// ---------- Connect (same stored token as the site editor) ----------

function remembered(): { token: string; branch: string } | null {
  try {
    const raw = sessionStorage.getItem(STORE) || localStorage.getItem(STORE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function connect(t: string, b: string, remember: boolean | null) {
  token = t; branch = b;
  setStatus('Connecting…', 'busy');
  try {
    const repo = await gh(`/repos/${REPO}`);
    if (!repo.permissions?.push) throw new Error('this token can read the repository but not save to it. Give it Contents: Read and write.');
    await gh(`/repos/${REPO}/branches/${encodeURIComponent(branch)}`);
    if (remember !== null) {
      try {
        const value = JSON.stringify({ token, branch });
        (remember ? localStorage : sessionStorage).setItem(STORE, value);
        (remember ? sessionStorage : localStorage).removeItem(STORE);
      } catch { /* storage blocked: stay connected for this visit only */ }
    }
    connectForm.hidden = true;
    connected.hidden = false;
    $('[data-branch]').textContent = branch;
    setStatus('');
  } catch (err) {
    token = '';
    connectForm.hidden = false;
    setStatus(`Couldn't connect: ${(err as Error).message}`, 'error');
  }
}

connectForm.addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(connectForm);
  connect(String(f.get('token')).trim(), String(f.get('branch')).trim(), f.get('remember') === 'on');
});
$('[data-disconnect]').addEventListener('click', () => {
  try { sessionStorage.removeItem(STORE); localStorage.removeItem(STORE); } catch { /* nothing stored */ }
  location.reload();
});

// ---------- Replacing ----------

const extOf = (path: string) => path.split('.').pop()!.toLowerCase();

/** Re-encodes a raster file to the slot's format, at most MAX_WIDTH wide. Falls back to the original bytes
 *  when the browser can't write that format (Safari and WebP); browsers still display it by its content. */
async function prepare(file: File, slotExt: string): Promise<{ bytes: Uint8Array; note: string }> {
  const raw = new Uint8Array(await file.arrayBuffer());
  if (slotExt === 'svg' || slotExt === 'gif') return { bytes: raw, note: '' };
  const bitmap = await createImageBitmap(file);
  const scale = Math.min(1, MAX_WIDTH / bitmap.width);
  const canvas = document.createElement('canvas');
  canvas.width = Math.round(bitmap.width * scale);
  canvas.height = Math.round(bitmap.height * scale);
  canvas.getContext('2d')!.drawImage(bitmap, 0, 0, canvas.width, canvas.height);
  const blob = await new Promise<Blob | null>((r) => canvas.toBlob(r, MIME[slotExt], 0.9));
  if (!blob || blob.type !== MIME[slotExt]) return { bytes: raw, note: ` Your browser can't save ${slotExt.toUpperCase()}, so the file was uploaded as it is.` };
  return { bytes: new Uint8Array(await blob.arrayBuffer()), note: scale < 1 ? ` Resized to ${canvas.width}px wide.` : '' };
}

async function replace(card: HTMLElement, file: File) {
  if (!token) {
    connectForm.hidden = false;
    connectForm.scrollIntoView({ behavior: 'smooth', block: 'center' });
    return setStatus('Connect to GitHub first, then replace the image.', 'error');
  }
  const path = card.dataset.path!;
  const slotExt = extOf(path);
  const isSvg = file.type === 'image/svg+xml' || /\.svg$/i.test(file.name);
  if (!file.type.startsWith('image/') && !isSvg) return setStatus('That file isn’t an image.', 'error');
  if (slotExt === 'svg' && !isSvg) return setStatus('This spot holds an SVG. Export the new version as SVG to replace it.', 'error');
  if (slotExt !== 'svg' && isSvg) return setStatus(`This spot holds a ${slotExt.toUpperCase()}. Export the new version as PNG, JPG or WebP to replace it.`, 'error');
  if (file.size > MAX_BYTES) return setStatus('That file is over 8 MB. Export a smaller one (about 2400px wide is plenty).', 'error');

  const name = path.split('/').pop()!;
  card.classList.add('is-busy');
  setStatus(`Replacing ${name}…`, 'busy');
  try {
    const { bytes, note } = await prepare(file, slotExt);
    const sha = await currentSha(path);
    await gh(`/repos/${REPO}/contents/${path}`, {
      method: 'PUT',
      body: JSON.stringify({ message: `Replace image: ${path.replace(/^public\//, '')}`, content: toBase64(bytes), branch, ...(sha ? { sha } : {}) }),
    });
    const preview = $<HTMLImageElement>('[data-preview]', card);
    preview.src = URL.createObjectURL(new Blob([bytes], { type: MIME[slotExt] }));
    const done = $<HTMLElement>('[data-done]', card);
    done.textContent = `Replaced on ${branch}. Pages update after the next build.`;
    done.hidden = false;
    card.removeAttribute('data-old');
    card.setAttribute('data-no-audit', '');
    preview.removeAttribute('data-old-image');
    preview.parentElement?.querySelector('.old-image-tag')?.remove();
    setStatus(`Replaced ${name} on ${branch}.${note} The site picks it up after its next build, usually about a minute.`, 'ok');
  } catch (err) {
    setStatus(`Couldn't replace ${name}. ${(err as Error).message}`, 'error');
  } finally {
    card.classList.remove('is-busy');
  }
}

picker.addEventListener('change', () => {
  const file = picker.files?.[0];
  if (file && target) replace(target, file);
  picker.value = '';
});

for (const card of cards) {
  $('[data-replace]', card).addEventListener('click', () => {
    target = card;
    picker.accept = extOf(card.dataset.path!) === 'svg' ? 'image/svg+xml,.svg' : 'image/png,image/jpeg,image/webp,image/gif,image/avif';
    picker.click();
  });
  $('[data-copy]', card).addEventListener('click', async (e) => {
    const btn = e.currentTarget as HTMLButtonElement;
    try { await navigator.clipboard.writeText(card.dataset.url!); btn.textContent = 'Copied'; } catch { btn.textContent = card.dataset.url!; }
    setTimeout(() => { btn.textContent = 'Copy path'; }, 1600);
  });
  card.addEventListener('dragover', (e) => { e.preventDefault(); card.classList.add('is-drop'); });
  card.addEventListener('dragleave', () => card.classList.remove('is-drop'));
  card.addEventListener('drop', (e) => {
    e.preventDefault();
    card.classList.remove('is-drop');
    const file = e.dataTransfer?.files[0];
    if (file) replace(card, file);
  });
  // Pixel size, once the preview has loaded.
  const img = $<HTMLImageElement>('[data-preview]', card);
  const dims = () => { if (img.naturalWidth) $('[data-dims]', card).textContent = `${img.naturalWidth} × ${img.naturalHeight}`; };
  if (img.complete) dims(); else img.addEventListener('load', dims, { once: true });
}

// ---------- Filters ----------

const search = $<HTMLInputElement>('[data-search]');
function filter() {
  const q = search.value.trim().toLowerCase();
  const show = (document.querySelector<HTMLInputElement>('input[name="show"]:checked')?.value) || 'all';
  for (const card of cards) {
    const match = (!q || card.dataset.searchText!.includes(q))
      && (show === 'all' || (show === 'svg' && card.hasAttribute('data-svg')) || (show === 'unused' && card.hasAttribute('data-unused')) || (show === 'old' && card.hasAttribute('data-old')));
    card.hidden = !match;
  }
  for (const group of document.querySelectorAll<HTMLElement>('[data-group]')) {
    group.hidden = !group.querySelector('[data-asset]:not([hidden])');
  }
}
search.addEventListener('input', filter);
document.querySelectorAll<HTMLInputElement>('input[name="show"]').forEach((r) => r.addEventListener('change', filter));
document.querySelectorAll<HTMLInputElement>('input[name="bg"]').forEach((r) => r.addEventListener('change', () => { document.body.dataset.bg = r.value; }));

// ---------- Start ----------

const saved = remembered();
if (saved) connect(saved.token, saved.branch, null);
else connectForm.hidden = false;

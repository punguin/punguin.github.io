/**
 * Case study editor (/admin). A small client-side tool that reads and writes the case study
 * Markdown files in src/content/projects/ through the GitHub API. Saving makes a commit, and the
 * host (Vercel) rebuilds the site from it. There is no server: the GitHub token stays in this
 * browser (session storage, or local storage when "remember" is ticked).
 */

const REPO = 'punguin/punguin.github.io';
const DIR = 'src/content/projects';
const IMAGES = 'public/images/work';
const API = 'https://api.github.com';
const STORE = 'pung-brooks:editor';

const KEYS = ['id', 'number', 'title', 'navLabel', 'company', 'context', 'project', 'domain', 'summary', 'role', 'timeline', 'platform', 'partners', 'accent', 'featured', 'order'] as const;
type Value = string | number | boolean | string[];
type Data = Record<string, Value>;
type Item = { path: string; sha: string; data: Data; body: string };

const $ = <T extends HTMLElement>(sel: string) => document.querySelector<T>(sel)!;
const connectForm = $<HTMLFormElement>('[data-connect]');
const app = $<HTMLElement>('[data-app]');
const list = $<HTMLUListElement>('[data-list]');
const form = $<HTMLFormElement>('[data-form]');
const empty = $<HTMLElement>('[data-empty]');
const status = $<HTMLElement>('[data-status]');
const body = $<HTMLTextAreaElement>('[name="body"]');
const viewLink = $<HTMLAnchorElement>('[data-view]');
const imageInput = $<HTMLInputElement>('[data-image-input]');

let token = '';
let branch = '';
let items: Item[] = [];
let current: Item | null = null; // null while creating a new one
let dirty = false;

// ---------- GitHub ----------

async function gh(path: string, init: RequestInit = {}) {
  const res = await fetch(`${API}${path}`, {
    ...init,
    headers: { Authorization: `Bearer ${token}`, Accept: 'application/vnd.github+json', ...(init.headers || {}) },
  });
  if (!res.ok) {
    const msg = (await res.json().catch(() => ({}))).message || res.statusText;
    throw new Error(`GitHub said: ${msg} (${res.status})`);
  }
  return res.json();
}

const toBase64 = (bytes: Uint8Array) => {
  let s = '';
  for (let i = 0; i < bytes.length; i += 0x8000) s += String.fromCharCode(...bytes.subarray(i, i + 0x8000));
  return btoa(s);
};
const encode = (text: string) => toBase64(new TextEncoder().encode(text));
const decode = (b64: string) => new TextDecoder().decode(Uint8Array.from(atob(b64.replace(/\n/g, '')), (c) => c.charCodeAt(0)));

async function putFile(path: string, content: string, message: string, sha?: string) {
  return gh(`/repos/${REPO}/contents/${path}`, {
    method: 'PUT',
    body: JSON.stringify({ message, content, branch, ...(sha ? { sha } : {}) }),
  });
}

// ---------- Front matter (the small subset these files use) ----------

function splitList(s: string): string[] {
  const out: string[] = [];
  let cur = '', quoted = false;
  for (const ch of s) {
    if (ch === '"') quoted = !quoted;
    if (ch === ',' && !quoted) { out.push(cur); cur = ''; } else cur += ch;
  }
  if (cur.trim()) out.push(cur);
  return out.map((v) => scalar(v.trim()) as string);
}

function scalar(v: string): Value {
  if (v.startsWith('"')) return JSON.parse(v);
  if (v.startsWith("'")) return v.slice(1, -1).replace(/''/g, "'");
  if (v === 'true' || v === 'false') return v === 'true';
  if (/^-?\d+(\.\d+)?$/.test(v)) return Number(v);
  return v;
}

function parse(text: string): { data: Data; body: string } {
  const m = text.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n?([\s\S]*)$/);
  if (!m) return { data: {}, body: text };
  const data: Data = {};
  for (const line of m[1].split(/\r?\n/)) {
    const kv = line.match(/^([A-Za-z]\w*):\s*(.*)$/);
    if (!kv) continue;
    const raw = kv[2].trim();
    data[kv[1]] = raw.startsWith('[') ? splitList(raw.slice(1, -1)) : scalar(raw);
  }
  return { data, body: m[2].replace(/^\n/, '') };
}

const quote = (s: string, inList = false) =>
  s === '' || /^[\s"'[\]{}#&*!|>%@`-]|: | #|\s$/.test(s) || /^(true|false|null|-?\d+(\.\d+)?)$/.test(s) || (inList && /[,"]/.test(s))
    ? JSON.stringify(s)
    : s;

function serialize(data: Data, text: string): string {
  // featured defaults to true, so it is only written when a case study is hidden.
  const lines = KEYS.filter((k) => data[k] !== undefined && !(k === 'featured' && data[k] === true)).map((k) => {
    const v = data[k];
    if (Array.isArray(v)) return `${k}: [${v.map((x) => quote(x, true)).join(', ')}]`;
    if (typeof v === 'string') return `${k}: ${k === 'number' ? JSON.stringify(v) : quote(v)}`;
    return `${k}: ${v}`;
  });
  return `---\n${lines.join('\n')}\n---\n\n${text.trim()}\n`;
}

// ---------- Screens ----------

function setStatus(text: string, kind: 'ok' | 'error' | 'busy' | '' = '') {
  status.textContent = text;
  status.dataset.kind = kind;
}

const slug = (s: string) => s.toLowerCase().normalize('NFKD').replace(/[^\w\s-]/g, '').trim().replace(/[\s_]+/g, '-').replace(/-+/g, '-');
const prefix = () => String(items[0]?.data.number ?? '01').split('.')[0];

function renderList() {
  list.innerHTML = '';
  for (const it of items) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ed-list__item';
    b.style.setProperty('--accent', `var(--accent-${it.data.accent})`);
    b.setAttribute('aria-current', String(it === current));
    b.innerHTML = `<span class="ed-list__num"></span><span class="ed-list__title"></span>${it.data.featured === false ? '<span class="ed-list__hidden">Hidden</span>' : ''}`;
    b.querySelector('.ed-list__num')!.textContent = String(it.data.number);
    b.querySelector('.ed-list__title')!.textContent = String(it.data.title);
    b.addEventListener('click', () => open(it));
    li.append(b);
    list.append(li);
  }
}

const field = (name: string) => form.elements.namedItem(name) as HTMLInputElement | null;

function fill(data: Data, text: string) {
  for (const k of ['title', 'summary', 'project', 'company', 'context', 'domain', 'role', 'timeline']) field(k)!.value = String(data[k] ?? '');
  field('platform')!.value = ((data.platform as string[]) || []).join(', ');
  field('partners')!.value = ((data.partners as string[]) || []).join(', ');
  field('order')!.value = String(data.order ?? items.length + 1);
  field('featured')!.checked = data.featured !== false;
  const accent = form.querySelector<HTMLInputElement>(`[name="accent"][value="${data.accent}"]`);
  if (accent) accent.checked = true;
  body.value = text;
}

function open(it: Item | null) {
  if (dirty && !confirm('You have unsaved changes. Leave them?')) return;
  current = it;
  form.hidden = false;
  empty.hidden = true;
  if (it) {
    fill(it.data, it.body);
    viewLink.href = `/work/${it.data.id}/`;
    viewLink.hidden = false;
    $('[data-form-title]').textContent = String(it.data.title);
  } else {
    fill({ accent: 'yellow', featured: true, platform: [], partners: [] }, TEMPLATE);
    viewLink.hidden = true;
    $('[data-form-title]').textContent = 'New case study';
  }
  dirty = false;
  setStatus('');
  renderList();
}

const TEMPLATE = ['A sentence or two on what you did and why it mattered.', '', ...['Context', 'System', 'Decisions', 'Tradeoffs', 'Outcome'].flatMap((h) => [`#### ${h}`, '', `<p class="todo"><span class="todo-tag">To write</span> ${h} goes here.</p>`, ''])].join('\n');

async function load() {
  setStatus('Loading case studies…', 'busy');
  const files = (await gh(`/repos/${REPO}/contents/${DIR}?ref=${encodeURIComponent(branch)}`)) as { name: string; path: string }[];
  items = await Promise.all(
    files.filter((f) => f.name.endsWith('.md')).map(async (f) => {
      const file = await gh(`/repos/${REPO}/contents/${f.path}?ref=${encodeURIComponent(branch)}`);
      return { path: f.path, sha: file.sha, ...parse(decode(file.content)) };
    }),
  );
  items.sort((a, b) => Number(a.data.order) - Number(b.data.order));
  renderList();
  setStatus('');
}

async function save(e: SubmitEvent) {
  e.preventDefault();
  const title = field('title')!.value.trim();
  if (!title) return setStatus('Give the case study a title first.', 'error');
  const order = Number(field('order')!.value) || items.length + 1;
  const id = current ? String(current.data.id) : slug(title);
  if (!current && items.some((it) => it.data.id === id)) return setStatus(`A case study called “${title}” already exists.`, 'error');
  const list = (name: string) => field(name)!.value.split(',').map((s) => s.trim()).filter(Boolean);
  const data: Data = {
    id,
    number: `${prefix()}.${order}`,
    title,
    navLabel: title,
    ...Object.fromEntries(['company', 'context', 'project', 'domain', 'summary', 'role', 'timeline'].map((k) => [k, field(k)!.value.trim()])),
    platform: list('platform'),
    partners: list('partners'),
    accent: (form.querySelector<HTMLInputElement>('[name="accent"]:checked')?.value) || 'yellow',
    featured: field('featured')!.checked,
    order,
  };
  const path = current ? current.path : `${DIR}/${String(order).padStart(2, '0')}-${id}.md`;
  setStatus('Saving…', 'busy');
  try {
    const res = await putFile(path, encode(serialize(data, body.value)), `${current ? 'Update' : 'Add'} case study: ${title}`, current?.sha);
    const saved: Item = { path, sha: res.content.sha, data, body: body.value };
    if (current) items[items.indexOf(current)] = saved; else items.push(saved);
    items.sort((a, b) => Number(a.data.order) - Number(b.data.order));
    current = saved;
    dirty = false;
    viewLink.href = `/work/${id}/`;
    viewLink.hidden = !data.featured;
    $('[data-form-title]').textContent = title;
    renderList();
    setStatus('Saved. The site rebuilds with it in a minute or two.', 'ok');
  } catch (err) {
    setStatus(`Couldn't save. ${(err as Error).message}`, 'error');
  }
}

// ---------- Story toolbar ----------

function insert(text: string) {
  const { selectionStart: a, selectionEnd: b, value } = body;
  const before = value.slice(0, a);
  const pad = before && !before.endsWith('\n\n') ? (before.endsWith('\n') ? '\n' : '\n\n') : '';
  body.value = `${before}${pad}${text}\n\n${value.slice(b).replace(/^\n+/, '')}`;
  body.selectionStart = body.selectionEnd = (before + pad + text).length;
  body.focus();
  dirty = true;
}

document.querySelectorAll<HTMLButtonElement>('[data-insert]').forEach((b) =>
  b.addEventListener('click', () => {
    const kind = b.dataset.insert;
    if (kind === 'heading') insert('#### Heading');
    if (kind === 'todo') insert('<p class="todo"><span class="todo-tag">To write</span> What goes here.</p>');
    if (kind === 'image') {
      if (!current) return setStatus('Save the case study once before adding images.', 'error');
      imageInput.click();
    }
  }),
);

imageInput.addEventListener('change', async () => {
  const file = imageInput.files?.[0];
  imageInput.value = '';
  if (!file || !current) return;
  if (file.size > 5 * 1024 * 1024) return setStatus('That image is over 5 MB. Export a smaller one (about 2400px wide is plenty).', 'error');
  const dot = file.name.lastIndexOf('.');
  const name = `${slug(dot > 0 ? file.name.slice(0, dot) : file.name) || 'image'}-${Date.now().toString(36)}${dot > 0 ? file.name.slice(dot).toLowerCase() : ''}`;
  const path = `${IMAGES}/${current.data.id}/${name}`;
  setStatus('Uploading image…', 'busy');
  try {
    await putFile(path, toBase64(new Uint8Array(await file.arrayBuffer())), `Add image to ${current.data.title}: ${name}`);
    const size = (form.querySelector<HTMLSelectElement>('[data-image-size]')?.value) || 'wide';
    insert(`<figure class="visual visual--${size}">\n<img src="/${path.replace(/^public\//, '')}" alt="Describe what the image shows" loading="lazy" />\n<figcaption>Caption.</figcaption>\n</figure>`);
    setStatus('Image uploaded. Edit its description and caption, then save.', 'ok');
  } catch (err) {
    setStatus(`Couldn't upload. ${(err as Error).message}`, 'error');
  }
});

// ---------- Connect ----------

function remembered(): { token: string; branch: string } | null {
  try {
    const raw = sessionStorage.getItem(STORE) || localStorage.getItem(STORE);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

async function connect(t: string, b: string, remember: boolean) {
  token = t; branch = b;
  setStatus('Connecting…', 'busy');
  try {
    const repo = await gh(`/repos/${REPO}`);
    if (!repo.permissions?.push) throw new Error('this token can read the repository but not save to it. Give it Contents: Read and write.');
    await gh(`/repos/${REPO}/branches/${encodeURIComponent(branch)}`);
    try {
      const value = JSON.stringify({ token, branch });
      (remember ? localStorage : sessionStorage).setItem(STORE, value);
      (remember ? sessionStorage : localStorage).removeItem(STORE);
    } catch { /* storage blocked: stay connected for this visit only */ }
    connectForm.hidden = true;
    app.hidden = false;
    $('[data-branch]').textContent = branch;
    await load();
  } catch (err) {
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
$('[data-new]').addEventListener('click', () => open(null));
form.addEventListener('submit', save);
form.addEventListener('input', () => { dirty = true; });
window.addEventListener('beforeunload', (e) => { if (dirty) e.preventDefault(); });

const saved = remembered();
if (saved) {
  let persistent = false;
  try { persistent = !!localStorage.getItem(STORE); } catch { /* storage blocked */ }
  connect(saved.token, saved.branch, persistent);
}

/**
 * Site editor (/admin). A small client-side tool that reads and writes the homepage content
 * (src/content/hero.json, experience.json, contact.json and the section Markdown files) and the
 * case study Markdown files in src/content/projects/ through the GitHub API. Saving makes a commit, and the
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

const pageForm = $<HTMLFormElement>('[data-page-form]');
const pageList = $<HTMLUListElement>('[data-page-list]');
const pageFields = $<HTMLElement>('[data-page-fields]');
const pageBody = $<HTMLTextAreaElement>('[data-page-body]');

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
    b.setAttribute('aria-current', String(it === current && !form.hidden));
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
  page = null;
  pageForm.hidden = true;
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

const TEMPLATE = ['A sentence or two on what you did and why it mattered.', '', ...['Context', 'People', 'System', 'Design', 'Impact'].flatMap((h, i) => [`#### 0${i} / ${h}`, '', 'One line that sums up this section.', '', `<p class="todo"><span class="todo-tag">To write</span> ${h} goes here.</p>`, ''])].join('\n');

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
  await loadPages();
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

// ---------- Homepage ----------
// The hero, experience and contact details are JSON; each homepage section is a Markdown file with a
// little front matter. JSON is edited through a form built from the file's own shape, so a new field
// added to a file shows up here without changing the editor.

type Json = string | number | boolean | null | Json[] | { [k: string]: Json };
type Page = { key: string; label: string; path: string; sha: string; kind: 'json' | 'md'; json?: Json; data?: Data; body?: string; anchor: string; hint: string };

const SECTIONS = 'src/content/sections';
const LABELS: Record<string, string> = {
  identity: 'Name and practice',
  statement: 'Headline',
  statementHighlight: 'Highlighted words in the headline',
  supporting: 'Supporting line',
  context: 'Context',
  capabilities: 'Capabilities',
  location: 'Location',
  primaryAction: 'Main button',
  secondaryAction: 'Second button',
  href: 'Link',
  roles: 'Roles',
  years: 'Years',
  focus: 'Focus areas',
  note: 'Note',
  education: 'Education',
  links: 'Links',
  value: 'Shown as',
  placeholder: 'Still a placeholder (shown as unfinished)',
  external: 'Opens in a new tab',
  navLabel: 'Contents label',
  title: 'Title',
  heading: 'Heading',
};
const HINTS: Record<string, string> = {
  hero: 'The top of the homepage. The highlighted words must appear exactly as written in the headline.',
  experience: 'The Experience section’s timeline. Add a role with “Add one”, and remove one with its own button.',
  contact: 'The Contact section. Untick “Still a placeholder” once a link is real.',
  section: 'The heading and contents label appear on the homepage; the number and position stay as they are.',
};
const label = (k: string) => LABELS[k] ?? k.replace(/([a-z])([A-Z])/g, '$1 $2').replace(/^./, (c) => c.toUpperCase());

let pages: Page[] = [];
let page: Page | null = null;
let readPage: (() => Json) | null = null;

async function loadPages() {
  const ref = `?ref=${encodeURIComponent(branch)}`;
  const getFile = async (path: string) => {
    const f = await gh(`/repos/${REPO}/contents/${path}${ref}`);
    return { sha: f.sha as string, text: decode(f.content) };
  };
  const json = async (key: string, label: string, anchor: string): Promise<Page> => {
    const path = `src/content/${key}.json`;
    const { sha, text } = await getFile(path);
    return { key, label, path, sha, kind: 'json', json: JSON.parse(text), anchor, hint: HINTS[key] };
  };
  const files = ((await gh(`/repos/${REPO}/contents/${SECTIONS}${ref}`)) as { name: string; path: string }[]).filter((f) => f.name.endsWith('.md'));
  const sections: Page[] = await Promise.all(files.map(async (f) => {
    const { sha, text } = await getFile(f.path);
    const { data, body } = parse(text);
    return { key: String(data.id), label: `${data.number} · ${data.navLabel}`, path: f.path, sha, kind: 'md' as const, data, body, anchor: `#${data.id}`, hint: HINTS.section };
  }));
  sections.sort((a, b) => Number(a.data!.order) - Number(b.data!.order));
  const [hero, experience, contact] = await Promise.all([json('hero', 'Hero', '#top'), json('experience', 'Experience: roles', '#experience'), json('contact', 'Contact: links', '#contact')]);
  pages = [hero, ...sections, experience, contact];
  renderPages();
}

function renderPages() {
  pageList.innerHTML = '';
  for (const p of pages) {
    const li = document.createElement('li');
    const b = document.createElement('button');
    b.type = 'button';
    b.className = 'ed-list__item';
    b.setAttribute('aria-current', String(p === page));
    b.textContent = p.label;
    b.addEventListener('click', () => openPage(p));
    li.append(b);
    pageList.append(li);
  }
}

/** Builds inputs for a JSON value and returns a function that reads the edited value back. */
function build(value: Json, key: string, into: HTMLElement): () => Json {
  if (key.startsWith('_')) return () => value; // notes for whoever edits the file by hand
  if (typeof value === 'boolean') {
    const l = document.createElement('label');
    l.className = 'ed-check';
    const i = document.createElement('input');
    i.type = 'checkbox';
    i.checked = value;
    l.append(i, ` ${label(key)}`);
    into.append(l);
    return () => i.checked;
  }
  if (typeof value === 'string' || typeof value === 'number' || value === null) {
    const l = document.createElement('label');
    const long = typeof value === 'string' && value.length > 70;
    const i = document.createElement(long ? 'textarea' : 'input') as HTMLInputElement;
    if (long) (i as unknown as HTMLTextAreaElement).rows = 3;
    if (typeof value === 'number') i.type = 'number';
    i.value = value === null ? '' : String(value);
    l.append(label(key), i);
    into.append(l);
    return () => (typeof value === 'number' ? Number(i.value) : i.value);
  }
  if (Array.isArray(value) && value.every((v) => typeof v === 'string')) {
    const l = document.createElement('label');
    const t = document.createElement('textarea');
    t.rows = Math.max(2, value.length);
    t.value = (value as string[]).join('\n');
    const hint = document.createElement('small');
    hint.textContent = 'One per line.';
    l.append(label(key), t, hint);
    into.append(l);
    return () => t.value.split('\n').map((v) => v.trim()).filter(Boolean);
  }
  const fs = document.createElement('fieldset');
  const lg = document.createElement('legend');
  lg.textContent = label(key);
  fs.append(lg);
  into.append(fs);
  if (Array.isArray(value)) {
    // A list of records (roles, links): each in its own box, with add and remove.
    const blank = (v: Json): Json =>
      typeof v === 'string' ? '' : typeof v === 'number' ? 0 : typeof v === 'boolean' ? false : Array.isArray(v) ? [] : v && typeof v === 'object' ? Object.fromEntries(Object.entries(v).map(([k, x]) => [k, blank(x)])) : v;
    const shape = value[0] ?? {};
    const getters: (() => Json)[] = [];
    const list = document.createElement('div');
    list.className = 'ed-page-fields';
    const addOne = (v: Json, i: number) => {
      const box = document.createElement('div');
      box.className = 'ed-page-fields';
      const get = build(v, `${label(key).replace(/s$/, '')} ${i + 1}`, box);
      const remove = document.createElement('button');
      remove.type = 'button';
      remove.className = 'ed-btn';
      remove.textContent = 'Remove';
      remove.addEventListener('click', () => { getters.splice(getters.indexOf(get), 1); box.remove(); dirty = true; });
      const actions = document.createElement('p');
      actions.className = 'ed-item-actions';
      actions.append(remove);
      box.querySelector('fieldset')?.append(actions);
      list.append(box);
      getters.push(get);
    };
    value.forEach(addOne);
    const add = document.createElement('button');
    add.type = 'button';
    add.className = 'ed-btn';
    add.textContent = 'Add one';
    add.addEventListener('click', () => { addOne(blank(shape), getters.length); dirty = true; });
    const actions = document.createElement('p');
    actions.className = 'ed-item-actions';
    actions.append(add);
    fs.append(list, actions);
    return () => getters.map((g) => g());
  }
  const entries = Object.entries(value).map(([k, v]) => [k, build(v, k, fs)] as const);
  return () => Object.fromEntries(entries.map(([k, g]) => [k, g()]));
}

function openPage(p: Page) {
  if (dirty && !confirm('You have unsaved changes. Leave them?')) return;
  page = p;
  current = null;
  form.hidden = true;
  empty.hidden = true;
  pageForm.hidden = false;
  $('[data-page-title]').textContent = p.label;
  $('[data-page-hint]').textContent = p.hint;
  $<HTMLAnchorElement>('[data-page-view]').href = `/${p.anchor}`;
  pageFields.innerHTML = '';
  const bodyWrap = $<HTMLElement>('[data-page-body-wrap]');
  if (p.kind === 'json') {
    const box = document.createElement('div');
    box.className = 'ed-page-fields';
    const gets = Object.entries(p.json as Record<string, Json>).map(([k, v]) => [k, build(v, k, box)] as const);
    readPage = () => Object.fromEntries(gets.map(([k, g]) => [k, g()]));
    pageFields.append(box);
    bodyWrap.hidden = true;
  } else {
    const fs = document.createElement('fieldset');
    fs.innerHTML = '<legend>Heading</legend>';
    const getTitle = build(String(p.data!.title), 'heading', fs);
    const getNav = build(String(p.data!.navLabel), 'navLabel', fs);
    pageFields.append(fs);
    readPage = () => ({ title: getTitle(), navLabel: getNav() });
    pageBody.value = p.body!;
    bodyWrap.hidden = false;
  }
  dirty = false;
  setStatus('');
  renderPages();
  renderList();
}

function serializeSection(data: Data, text: string) {
  const lines = Object.entries(data).map(([k, v]) => {
    if (Array.isArray(v)) return `${k}: [${v.map((x) => quote(x, true)).join(', ')}]`;
    if (typeof v === 'string') return `${k}: ${k === 'number' ? JSON.stringify(v) : quote(v)}`;
    return `${k}: ${v}`;
  });
  return `---\n${lines.join('\n')}\n---\n\n${text.replace(/^\n+/, '').replace(/\s+$/, '')}\n`;
}

async function savePage(e: SubmitEvent) {
  e.preventDefault();
  if (!page || !readPage) return;
  let content: string;
  const edited = readPage() as Record<string, Json>;
  if (page.kind === 'json') {
    const hero = edited as { statement?: string; statementHighlight?: string };
    if (page.key === 'hero' && hero.statementHighlight && !String(hero.statement).includes(hero.statementHighlight)) {
      return setStatus('The highlighted words need to appear exactly as written in the headline.', 'error');
    }
    content = `${JSON.stringify(edited, null, 2)}\n`;
  } else {
    const title = String(edited.title).trim();
    if (!title) return setStatus('Give the section a heading first.', 'error');
    const data: Data = { ...page.data!, title, navLabel: String(edited.navLabel).trim() || String(page.data!.navLabel) };
    content = serializeSection(data, pageBody.value);
  }
  setStatus('Saving…', 'busy');
  try {
    const res = await putFile(page.path, encode(content), `Update homepage: ${page.label}`, page.sha);
    page.sha = res.content.sha;
    if (page.kind === 'json') page.json = edited;
    else {
      page.data = { ...page.data!, title: String(edited.title).trim(), navLabel: String(edited.navLabel).trim() || String(page.data!.navLabel) };
      page.body = pageBody.value;
      page.label = `${page.data.number} · ${page.data.navLabel}`;
      $('[data-page-title]').textContent = page.label;
    }
    dirty = false;
    renderPages();
    setStatus('Saved. The site rebuilds with it in a minute or two.', 'ok');
  } catch (err) {
    setStatus(`Couldn't save. ${(err as Error).message}`, 'error');
  }
}

pageForm.addEventListener('submit', savePage);
pageForm.addEventListener('input', () => { dirty = true; });

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
    if (kind === 'heading') insert('#### 00 / Section\n\nOne line that sums up this section.');
    if (kind === 'step') insert('##### 1.1 Step title\n\nOne line that sums up this step.');
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

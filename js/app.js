import { ELEMENTS, CATEGORIES, BLOCKS, STATES } from './data.js';

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];
const scene = $('#scene');
const world = $('#world');
const reduceMotion = matchMedia('(prefers-reduced-motion: reduce)').matches;

const TILE_W = 76, TILE_H = 92, GAP = 6;
const DEG = 180 / Math.PI;

/* ---------- buat kotak unsur ---------- */
const items = ELEMENTS.map((e, i) => {
  const node = document.createElement('div');
  node.className = 'el';
  node.dataset.z = e.z;
  node.setAttribute('role', 'button');
  node.setAttribute('aria-label', `${e.name}, nomor atom ${e.z}`);
  node.innerHTML = `<span class="n">${e.z}</span><span class="s">${e.symbol}</span><span class="nm">${e.name}</span><span class="m">${e.mass}</span>`;
  world.appendChild(node);
  // posisi awal: tersebar acak jauh di belakang, lalu terbang masuk
  const start = {
    x: (Math.random() - .5) * 3000,
    y: (Math.random() - .5) * 2000,
    z: -2500 - Math.random() * 2000,
    rx: (Math.random() - .5) * 360,
    ry: (Math.random() - .5) * 360,
  };
  return { e, i, node, cur: { ...start }, from: { ...start }, to: { ...start }, t0: 0, dur: 1, delay: 0 };
});

/* ---------- susunan ---------- */
const N = items.length;
const LAYOUTS = {
  table: () => items.map(({ e }) => ({
    x: (e.col - 9.5) * (TILE_W + GAP),
    y: (e.row - 5.5) * (TILE_H + GAP) + (e.row > 7 ? 14 : 0),
    z: 0, rx: 0, ry: 0,
  })),
  sphere: () => {
    const r = 560;
    return items.map(({ i }) => {
      const phi = Math.acos(-1 + (2 * i) / (N - 1 || 1));
      const theta = Math.sqrt(N * Math.PI) * phi;
      const x = r * Math.sin(phi) * Math.sin(theta);
      const y3 = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.cos(theta);
      return { x, y: -y3, z, ry: Math.atan2(x, z) * DEG, rx: Math.asin(y3 / r) * DEG };
    });
  },
  helix: () => {
    const r = 540, step = 5.4;
    return items.map(({ i }) => {
      const theta = i * 0.175 + Math.PI;
      const x = r * Math.sin(theta), z = r * Math.cos(theta);
      return { x, y: (i - (N - 1) / 2) * step, z, rx: 0, ry: Math.atan2(x, z) * DEG };
    });
  },
  grid: () => items.map(({ i }) => ({
    x: ((i % 5) - 2) * (TILE_W + 70),
    y: ((Math.floor(i / 5) % 5) - 2) * (TILE_H + 56),
    z: (2 - Math.floor(i / 25)) * 360,
    rx: 0, ry: 0,
  })),
};

// ukuran isi tiap susunan (lebar, tinggi) untuk menghitung skala pas layar
const EXTENT = {
  table: [18 * (TILE_W + GAP), 10 * (TILE_H + GAP) + 14],
  sphere: [1120 + TILE_W, 1120 + TILE_H],
  helix: [1080 + TILE_W, N * 5.4 + TILE_H],
  grid: [5 * (TILE_W + 70) + 520, 5 * (TILE_H + 56) + 160],
};

/* ---------- kamera ---------- */
const cam = { rx: 0, ry: 0, zoom: 1, px: 0, py: 0 };
const goal = { rx: 0, ry: 0, zoom: 1, px: 0, py: 0 };
let fit = 1;
const PERSPECTIVE = 1800;
const DEPTH = { table: 0, sphere: 560, helix: 540, grid: 720 };
let layout = 'table';
let autoSpin = true;
let lastInput = 0;

function computeFit() {
  const [w, h] = EXTENT[layout];
  const small = innerWidth < 640;
  const availW = innerWidth * (small ? .96 : .9);
  const availH = innerHeight - (small ? 230 : 190);
  fit = Math.min(availW / w, availH / h);
  // susunan 3D: bagian depan tampak lebih besar karena perspektif, jadi kecilkan sedikit
  const depth = DEPTH[layout];
  if (depth) fit /= PERSPECTIVE / (PERSPECTIVE - depth * fit);
}

const ease = (t) => (t < .5 ? 16 * t ** 5 : 1 - (-2 * t + 2) ** 5 / 2); // ease in-out quint
const shortest = (a, b) => a + ((((b - a) % 360) + 540) % 360) - 180;

function setLayout(name, { instant = false } = {}) {
  layout = name;
  const targets = LAYOUTS[name]();
  const now = performance.now();
  items.forEach((it, k) => {
    it.from = { ...it.cur };
    const t = targets[k];
    it.to = { ...t, rx: shortest(it.cur.rx, t.rx), ry: shortest(it.cur.ry, t.ry) };
    it.t0 = now;
    it.dur = instant || reduceMotion ? 1 : 1300 + Math.random() * 500;
    it.delay = instant || reduceMotion ? 0 : (k / N) * 420 + Math.random() * 260;
    it.done = false;
  });
  computeFit();
  goal.px = 0; goal.py = 0; goal.zoom = 1;
  if (name === 'table') { goal.rx = 0; goal.ry = shortest(cam.ry, 0); }
  else if (name === 'grid') { goal.rx = 12; goal.ry = shortest(cam.ry, -22); }
  else { goal.rx = 10; }
  $$('[data-layout]').forEach((b) => {
    const on = b.dataset.layout === name;
    b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on);
  });
}

/* ---------- warna & keterangan ---------- */
const PALETTES = { cat: CATEGORIES, block: BLOCKS, state: STATES };
const KEY = { cat: 'cat', block: 'block', state: 'state' };
let colorMode = 'cat';
const hidden = new Set();

function setColor(mode) {
  colorMode = mode;
  hidden.clear();
  const pal = PALETTES[mode];
  items.forEach(({ e, node }) => node.style.setProperty('--c', pal[e[KEY[mode]]].color));
  const used = new Set(ELEMENTS.map((e) => e[KEY[mode]]));
  $('#legend').innerHTML = Object.entries(pal).filter(([k]) => used.has(k)).map(([k, v]) =>
    `<button data-key="${k}" style="--c:${v.color}" aria-pressed="true"><i></i>${v.label}</button>`).join('');
  $$('[data-color]').forEach((b) => {
    const on = b.dataset.color === mode;
    b.classList.toggle('is-active', on); b.setAttribute('aria-pressed', on);
  });
  if (selected) showInfo(selected);
  applyFilter();
}

$('#legend').addEventListener('click', (ev) => {
  const b = ev.target.closest('button'); if (!b) return;
  const k = b.dataset.key;
  hidden.has(k) ? hidden.delete(k) : hidden.add(k);
  b.classList.toggle('is-off', hidden.has(k));
  b.setAttribute('aria-pressed', !hidden.has(k));
  applyFilter();
});

/* ---------- pencarian ---------- */
const q = $('#q');
function matches(e, term) {
  if (!term) return true;
  if (/^\d+$/.test(term)) return e.z === +term;
  return e.symbol.toLowerCase() === term || e.name.toLowerCase().includes(term);
}
function applyFilter() {
  const term = q.value.trim().toLowerCase();
  items.forEach(({ e, node }) => {
    const ok = matches(e, term) && !hidden.has(e[KEY[colorMode]]);
    node.classList.toggle('is-dim', !ok);
  });
}
q.addEventListener('input', applyFilter);
q.addEventListener('keydown', (ev) => {
  if (ev.key === 'Enter') {
    const term = q.value.trim().toLowerCase();
    const hit = items.find(({ e }) => matches(e, term));
    if (hit) select(hit);
    q.blur();
  }
  if (ev.key === 'Escape') { q.value = ''; applyFilter(); q.blur(); }
});

/* ---------- detail unsur ---------- */
let selected = null;
const info = $('#info');
function showInfo(it) {
  const { e } = it;
  const pal = PALETTES[colorMode];
  info.style.setProperty('--c', pal[e[KEY[colorMode]]].color);
  $('#info-tile').innerHTML = `<span class="n">${e.z}</span><span class="s">${e.symbol}</span><span class="m">${e.mass}</span>`;
  const rows = [
    ['Nomor atom', e.z],
    ['Massa atom', e.mass.startsWith('[') ? `${e.mass} (isotop paling stabil)` : `${e.mass} u`],
    ['Kategori', CATEGORIES[e.cat].label],
    ['Golongan', e.group ?? (e.row === 9 ? 'Lantanida' : 'Aktinida')],
    ['Periode', e.period],
    ['Blok', e.block],
    ['Wujud (25 °C)', STATES[e.state].label],
  ];
  $('#info-body').innerHTML = `<h2>${e.name}</h2><dl>${rows.map(([k, v]) => `<dt>${k}</dt><dd>${v}</dd>`).join('')}</dl>`;
  info.hidden = false;
}
function select(it) {
  if (selected) selected.node.classList.remove('is-sel');
  selected = it;
  it.node.classList.add('is-sel');
  showInfo(it);
}
function deselect() {
  if (selected) selected.node.classList.remove('is-sel');
  selected = null;
  info.hidden = true;
}
$('#close').addEventListener('click', deselect);
addEventListener('keydown', (ev) => {
  if (ev.target === q) return;
  if (ev.key === 'Escape') deselect();
  const map = { 1: 'table', 2: 'sphere', 3: 'helix', 4: 'grid' };
  if (map[ev.key]) setLayout(map[ev.key]);
});
world.addEventListener('keydown', (ev) => {
  if (ev.key !== 'Enter' && ev.key !== ' ') return;
  const node = ev.target.closest('.el'); if (!node) return;
  ev.preventDefault(); select(items[node.dataset.z - 1]);
});

/* ---------- geser, putar, zoom ---------- */
const pointers = new Map();
let drag = null, pinch = null, vel = { x: 0, y: 0 };
const hint = $('#hint');

scene.addEventListener('pointerdown', (ev) => {
  pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  scene.setPointerCapture(ev.pointerId);
  if (pointers.size === 1) drag = { x: ev.clientX, y: ev.clientY, sx: ev.clientX, sy: ev.clientY, moved: false };
  if (pointers.size === 2) {
    const [a, b] = [...pointers.values()];
    pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), zoom: goal.zoom };
    drag = null;
  }
  vel = { x: 0, y: 0 };
  lastInput = performance.now();
});

scene.addEventListener('pointermove', (ev) => {
  if (!pointers.has(ev.pointerId)) return;
  pointers.set(ev.pointerId, { x: ev.clientX, y: ev.clientY });
  lastInput = performance.now();
  if (pinch && pointers.size >= 2) {
    const [a, b] = [...pointers.values()];
    goal.zoom = clamp(pinch.zoom * Math.hypot(a.x - b.x, a.y - b.y) / pinch.d, .4, 5);
    return;
  }
  if (!drag) return;
  const dx = ev.clientX - drag.x, dy = ev.clientY - drag.y;
  drag.x = ev.clientX; drag.y = ev.clientY;
  if (Math.hypot(ev.clientX - drag.sx, ev.clientY - drag.sy) > 6) { drag.moved = true; scene.classList.add('is-dragging'); }
  if (layout === 'table') { goal.px += dx; goal.py += dy; }
  else {
    goal.ry += dx * .3; goal.rx = clamp(goal.rx - dy * .3, -80, 80);
    vel = { x: dx * .3, y: -dy * .3 };
  }
});

function endPointer(ev) {
  if (!pointers.has(ev.pointerId)) return;
  pointers.delete(ev.pointerId);
  if (pointers.size < 2) pinch = null;
  if (drag && !drag.moved && pointers.size === 0) {
    const node = document.elementsFromPoint(ev.clientX, ev.clientY).find((n) => n.classList?.contains('el'));
    node ? select(items[node.dataset.z - 1]) : deselect();
  }
  if (pointers.size === 0) { drag = null; scene.classList.remove('is-dragging'); }
  hint.classList.add('is-hidden');
}
scene.addEventListener('pointerup', endPointer);
scene.addEventListener('pointercancel', endPointer);

scene.addEventListener('wheel', (ev) => {
  ev.preventDefault();
  const k = ev.ctrlKey ? .01 : .0015; // pinch di trackpad mengirim ctrlKey
  goal.zoom = clamp(goal.zoom * Math.exp(-ev.deltaY * k), .4, 5);
  lastInput = performance.now();
  hint.classList.add('is-hidden');
}, { passive: false });

const clamp = (v, a, b) => Math.min(b, Math.max(a, v));

/* ---------- tombol ---------- */
$$('[data-layout]').forEach((b) => b.addEventListener('click', () => setLayout(b.dataset.layout)));
$$('[data-color]').forEach((b) => b.addEventListener('click', () => setColor(b.dataset.color)));
$('#spin').addEventListener('click', (ev) => {
  autoSpin = !autoSpin;
  ev.currentTarget.classList.toggle('is-active', autoSpin);
  ev.currentTarget.setAttribute('aria-pressed', autoSpin);
});
$('#reset').addEventListener('click', () => {
  goal.zoom = 1; goal.px = 0; goal.py = 0;
  goal.rx = layout === 'table' ? 0 : layout === 'grid' ? 12 : 10;
  goal.ry = shortest(cam.ry, layout === 'grid' ? -22 : 0);
  vel = { x: 0, y: 0 };
});
addEventListener('resize', computeFit);

/* ---------- animasi ---------- */
const fmt = (p) => `translate3d(${p.x.toFixed(1)}px,${p.y.toFixed(1)}px,${p.z.toFixed(1)}px) rotateY(${p.ry.toFixed(2)}deg) rotateX(${p.rx.toFixed(2)}deg)`;

function frame(now) {
  // kotak unsur menuju posisi barunya
  for (const it of items) {
    if (it.done) continue;
    const t = clamp((now - it.t0 - it.delay) / it.dur, 0, 1);
    const k = ease(t);
    for (const key of ['x', 'y', 'z', 'rx', 'ry']) it.cur[key] = it.from[key] + (it.to[key] - it.from[key]) * k;
    it.node.style.transform = fmt(it.cur);
    if (t >= 1) it.done = true;
  }

  // kamera: inersia, putar otomatis, lalu mendekati tujuan
  const idle = now - lastInput > 2500 && pointers.size === 0;
  if (layout !== 'table' && pointers.size === 0) {
    goal.ry += vel.x; goal.rx = clamp(goal.rx + vel.y, -80, 80);
    vel.x *= .94; vel.y *= .94;
    if (autoSpin && idle && !reduceMotion) goal.ry += .12;
  }
  if (layout === 'table' && pointers.size === 0 && idle && goal.zoom === 1) { goal.px *= .96; goal.py *= .96; }
  for (const key of ['rx', 'ry', 'zoom', 'px', 'py']) cam[key] += (goal[key] - cam[key]) * .1;
  world.style.transform = `translate3d(${cam.px.toFixed(1)}px,${cam.py.toFixed(1)}px,0) scale(${(cam.zoom * fit).toFixed(4)}) rotateX(${cam.rx.toFixed(2)}deg) rotateY(${cam.ry.toFixed(2)}deg)`;
  requestAnimationFrame(frame);
}

items.forEach((it) => { it.node.tabIndex = 0; it.node.style.transform = fmt(it.cur); });
setColor('cat');
setLayout('table');
requestAnimationFrame(frame);
setTimeout(() => hint.classList.add('is-hidden'), 9000);

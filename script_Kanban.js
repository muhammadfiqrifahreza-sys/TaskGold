'use strict';
// Data (Array of Objects)
const STORAGE_KEY = 'taskgold.v2';
const STATUS = { todo: 'To Do', prog: 'In Progress', done: 'Selesai' };
const COLOR = { todo: 'var(--todo)', prog: 'var(--prog)', done: 'var(--done)' };
const addDays = n => {   // tanggal lokal (bukan UTC) agar tidak meleset sehari
  const d = new Date(); d.setDate(d.getDate() + n);
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}-${String(d.getDate()).padStart(2, '0')}`;
};

const seedTasks = () => [
  { id: 1, title: 'Laporan ERD & Normalisasi', course: 'Basis Data',        due: addDays(3),  done: 0, total: 4, status: 'todo' },
  { id: 2, title: 'Quiz Bab 3 Statistika',     course: 'Statistika',        due: addDays(5),  done: 0, total: 2, status: 'todo' },
  { id: 3, title: 'Rancang Topologi Jaringan', course: 'Jaringan Komputer', due: addDays(11), done: 0, total: 3, status: 'todo' },
  { id: 4, title: 'Landing Page Portofolio',   course: 'Pemrograman Web',   due: addDays(4),  done: 3, total: 5, status: 'prog' },
  { id: 5, title: 'Makalah Kecerdasan Buatan', course: 'Etika Profesi',     due: addDays(8),  done: 2, total: 6, status: 'prog' },
  { id: 6, title: 'Resume Jurnal Algoritma',   course: 'Struktur Data',     due: addDays(-3), done: 3, total: 3, status: 'done' },
  { id: 7, title: 'Tugas SQL Join',            course: 'Basis Data',        due: addDays(-6), done: 4, total: 4, status: 'done' },
];

const read = (key, fallback) => {
  try { return JSON.parse(localStorage.getItem(key)) || fallback(); } catch { return fallback(); }
};
let tasks = read(STORAGE_KEY, seedTasks);
const save = () => localStorage.setItem(STORAGE_KEY, JSON.stringify(tasks));

let view = 'board', filterCourse = 'Semua', query = '', activeTab = 'todo';

// Helpers
const $ = (s, r = document) => r.querySelector(s);
const $$ = (s, r = document) => [...r.querySelectorAll(s)];
const toDate = iso => new Date(iso + 'T00:00:00');
const fmtDate = iso => toDate(iso).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' });
const daysLeft = iso => Math.round((toDate(iso) - new Date().setHours(0, 0, 0, 0)) / 864e5);
const el = (tag, cls, text) => {
  const e = document.createElement(tag);
  if (cls) e.className = cls;
  if (text !== undefined) e.textContent = text;
  return e;
};
const visible = t =>
  (filterCourse === 'Semua' || t.course === filterCourse) &&
  (t.title + ' ' + t.course).toLowerCase().includes(query);

let toastTimer;
const toast = msg => {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 2200);
};

// Aksi data
const moveTask = (id, status) => {
  const t = tasks.find(x => x.id === id);
  if (!t || t.status === status) return;
  if (status === 'done') t.done = t.total;
  t.status = status;
  save(); render();
  toast(`"${t.title}" dipindah ke ${STATUS[status]}`);
};
const deleteTask = id => {
  const t = tasks.find(x => x.id === id);
  if (!t || !confirm(`Hapus tugas "${t.title}"?`)) return;
  tasks = tasks.filter(x => x.id !== id);
  save(); render(); toast('Tugas dihapus');
};
const bumpSubtask = id => {
  const t = tasks.find(x => x.id === id);
  if (!t) return;
  if (t.done >= t.total) { t.done = 0; save(); return render(); }   // reset siklus
  t.done++;
  if (t.done === t.total && t.status !== 'done') { t.done--; return moveTask(id, 'done'); }
  save(); render();
};

// Render: Papan Tugas
const buildCard = t => {
  const card = el('article', `card${t.status === 'done' ? ' is-done' : ''}`);
  card.draggable = true;
  card.dataset.id = t.id;
  card.append(el('h3', '', t.title), el('p', '', t.course));

  const bar = el('div', 'bar'), fillBar = el('i');
  fillBar.style.setProperty('--p', `${(t.done / t.total) * 100}%`);
  bar.append(fillBar);

  const left = daysLeft(t.due), late = t.status !== 'done' && left < 0;
  const meta = el('div', 'meta');
  meta.append(el('span', late ? 'late' : '', late ? `Terlambat ${-left} hari` : `Tenggat ${fmtDate(t.due)}`),
              el('span', '', `${t.done}/${t.total} subtugas`));

  const tools = el('div', 'tools');
  const mk = (txt, action, cls = '') => { const b = el('button', cls, txt); b.type = 'button'; b.dataset.action = action; return b; };
  tools.append(mk('+ Subtugas', 'bump'), mk('Pindah', 'move'), mk('Hapus', 'delete', 'del'));
  card.append(bar, meta, tools);
  return card;
};

const statCards = () => {
  const n = s => tasks.filter(t => t.status === s).length;
  const data = [
    [tasks.length, 'Total Tugas', ''],
    [n('prog'), 'In Progress', ''],
    [n('done'), 'Selesai', ''],
    [tasks.filter(t => t.status !== 'done' && daysLeft(t.due) <= 3).length, 'Deadline < 3 hari', 'warn'],
  ];
  $$('.stats').forEach(box => box.replaceChildren(...data.map(([v, l, c]) => {
    const a = el('article', `stat ${c}`);
    a.append(el('b', '', v), el('span', '', l));
    return a;
  })));
};

const renderChips = () => {
  const courses = ['Semua', ...new Set(tasks.map(t => t.course))];
  if (!courses.includes(filterCourse)) filterCourse = 'Semua';
  $('#chips').replaceChildren(...courses.map(c => {
    const b = el('button', 'chip', c);
    b.type = 'button';
    b.setAttribute('aria-pressed', c === filterCourse);
    b.addEventListener('click', () => { filterCourse = c; render(); });
    return b;
  }));
  $('#courseList').replaceChildren(...courses.slice(1).map(c => { const o = el('option'); o.value = c; return o; }));
};

const renderBoard = () => {
  Object.keys(STATUS).forEach(status => {
    const items = tasks.filter(t => t.status === status && visible(t));
    const col = $(`.column[data-status="${status}"]`), list = $('.list', col);
    list.replaceChildren(...items.map(buildCard));
    if (!items.length) list.append(el('p', 'empty', 'Belum ada tugas di sini.'));
    $('.count', col).textContent = items.length;
    col.classList.toggle('current', status === activeTab);
  });
  $('#tabs').replaceChildren(...Object.entries(STATUS).map(([key, label]) => {
    const b = el('button', '', `${label} ${tasks.filter(t => t.status === key && visible(t)).length}`);
    b.type = 'button';
    b.setAttribute('role', 'tab');
    b.setAttribute('aria-selected', key === activeTab);
    b.addEventListener('click', () => { activeTab = key; render(); });
    return b;
  }));
};

// Render: Statistik
const renderStatistik = () => {
  // distribusi status
  const total = tasks.length || 1;
  const counts = Object.keys(STATUS).map(k => tasks.filter(t => t.status === k).length);
  let acc = 0;
  const stops = Object.keys(STATUS).map((k, i) => {
    const from = acc; acc += (counts[i] / total) * 100;
    return `${COLOR[k]} ${from}% ${acc}%`;
  });
  $('#stack').style.background = tasks.length ? `linear-gradient(90deg, ${stops.join(',')})` : '';
  $('#statusCards').replaceChildren(...Object.entries(STATUS).map(([k, label], i) => {
    const card = el('div', 'scard'), head = el('span', 'sl'), dot = el('i', 'dot');
    dot.style.setProperty('--c', COLOR[k]);
    head.append(dot, label);
    const note = el('small', '', `tugas - ${Math.round(counts[i] / total * 100)}%`);
    note.style.color = COLOR[k];
    card.append(head, el('b', '', counts[i]), note);
    return card;
  }));

  // deadline terdekat (3 tugas belum selesai)
  const upcoming = tasks.filter(t => t.status !== 'done').sort((a, b) => a.due.localeCompare(b.due)).slice(0, 3);
  $('#deadlines').replaceChildren(...(upcoming.length ? upcoming.map(t => {
    const left = daysLeft(t.due), li = el('li'), info = el('div');
    info.append(el('strong', '', t.title), el('small', '', t.course));
    li.append(info, el('span', '', fmtDate(t.due)),
      el('em', left < 0 ? 'late' : '', left < 0 ? `Terlambat ${-left} hari` : left === 0 ? 'Hari ini' : `${left} hari lagi`));
    return li;
  }) : [el('li', 'empty-note', 'Tidak ada deadline. Semua tugas selesai!')]));
};

// Render: Mata Kuliah
const renderCourses = () => {
  const names = [...new Set(tasks.map(t => t.course))];
  $('#courses').replaceChildren(...names.map(name => {
    const list = tasks.filter(t => t.course === name);
    const done = list.filter(t => t.status === 'done').length;
    const next = list.filter(t => t.status !== 'done').sort((a, b) => a.due.localeCompare(b.due))[0];
    const card = el('article', 'course');

    const head = el('header');
    head.append(el('h3', '', name), el('span', '', `${list.length} tugas`));
    const bar = el('div', 'bar'), fillBar = el('i');
    fillBar.style.setProperty('--p', `${(done / list.length) * 100}%`);
    bar.append(fillBar);

    const mini = el('div', 'mini');
    Object.entries(STATUS).forEach(([k, label]) => {
      const s = el('span'), dot = el('i', 'dot');
      dot.style.setProperty('--c', COLOR[k]);
      s.append(dot, `${list.filter(t => t.status === k).length} ${label}`);
      mini.append(s);
    });

    const ul = el('ul');
    list.forEach(t => {
      const li = el('li', t.status === 'done' ? 'done' : ''), dot = el('i', 'dot');
      dot.style.setProperty('--c', COLOR[t.status]);
      li.append(dot, el('span', '', t.title), el('small', '', fmtDate(t.due)));
      ul.append(li);
    });

    const btn = el('button', 'btn ghost-btn', 'Lihat di papan');
    btn.type = 'button';
    btn.dataset.course = name;
    card.append(head, bar, mini,
      el('p', `next${next ? '' : ' ok'}`, next ? `Tenggat terdekat: ${fmtDate(next.due)}` : 'Semua tugas selesai'),
      ul, btn);
    return card;
  }));
};

// Navigasi antar layar
const TITLES = {
  board: ['Papan Tugas', () => new Date().toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })],
  stat: ['Statistik', () => 'Ringkasan progres tugas semester 5'],
  course: ['Mata Kuliah', () => `${new Set(tasks.map(t => t.course)).size} mata kuliah semester ini`],
};
const render = () => {
  document.body.dataset.view = view;
  $$('nav a[data-view]').forEach(a => a.dataset.view === view ? a.setAttribute('aria-current', 'page') : a.removeAttribute('aria-current'));
  $('#pageTitle').textContent = TITLES[view][0];
  $('#pageSub').textContent = TITLES[view][1]();
  statCards(); renderChips(); renderBoard(); renderStatistik(); renderCourses();
};
$('nav').addEventListener('click', e => {
  const a = e.target.closest('a');
  if (!a) return;
  e.preventDefault();
  if (a.dataset.soon !== undefined) return toast('Pengaturan belum tersedia');
  view = a.dataset.view; render();
});
$('#courses').addEventListener('click', e => {
  const b = e.target.closest('[data-course]');
  if (b) { filterCourse = b.dataset.course; view = 'board'; render(); }
});

// Drag & drop
const board = $('#board');
let draggedId = null;
board.addEventListener('dragstart', e => {
  const card = e.target.closest('.card');
  if (!card) return;
  draggedId = Number(card.dataset.id);
  e.dataTransfer.effectAllowed = 'move';
  e.dataTransfer.setData('text/plain', draggedId);
  requestAnimationFrame(() => card.classList.add('dragging'));
});
board.addEventListener('dragend', () => {
  $$('.dragging').forEach(c => c.classList.remove('dragging'));
  $$('.column.over').forEach(c => c.classList.remove('over'));
});
board.addEventListener('dragover', e => {
  const col = e.target.closest('.column');
  if (!col || draggedId === null) return;
  e.preventDefault();
  $$('.column.over').forEach(c => c !== col && c.classList.remove('over'));
  col.classList.add('over');
});
board.addEventListener('dragleave', e => {
  const col = e.target.closest('.column');
  if (col && !col.contains(e.relatedTarget)) col.classList.remove('over');
});
board.addEventListener('drop', e => {
  const col = e.target.closest('.column');
  if (!col || draggedId === null) return;
  e.preventDefault();
  col.classList.remove('over');
  moveTask(draggedId, col.dataset.status);
  draggedId = null;
});
board.addEventListener('click', e => {
  const addBtn = e.target.closest('[data-add]');
  if (addBtn) return openAdd(addBtn.dataset.add);
  const btn = e.target.closest('[data-action]');
  if (!btn) return;
  const id = Number(btn.closest('.card').dataset.id);
  ({ bump: bumpSubtask, delete: deleteTask, move: openMove })[btn.dataset.action](id);
});

// Dialog Tambah Tugas
const addDlg = $('#addDlg'), addForm = $('#addForm'), errBox = $('#formError');
function openAdd(status = 'todo') {
  addForm.reset();
  addForm.status.value = status;
  addForm.due.min = addDays(0);
  errBox.textContent = '';
  addDlg.showModal();
  $('#fTitle').focus();
}
const showError = (msg, field) => { errBox.textContent = msg; field.focus(); };

addForm.addEventListener('submit', e => {
  e.preventDefault();
  const f = new FormData(addForm);
  const title = f.get('title').trim(), course = f.get('course').trim(), due = f.get('due');
  const total = Math.min(20, Math.max(1, Number(f.get('total')) || 1));
  if (title.length < 3) return showError('Judul minimal 3 karakter.', addForm.title);
  if (!course)          return showError('Isi mata kuliah.', addForm.course);
  if (!due)             return showError('Pilih tanggal tenggat.', addForm.due);

  const status = f.get('status');
  tasks.push({ id: Date.now(), title, course, due, total, status, done: status === 'done' ? total : 0 });
  save(); render();
  addDlg.close();
  toast('Tugas ditambahkan');
});

// Dialog Pindah (layar sentuh)
const moveDlg = $('#moveDlg');
function openMove(id) {
  const t = tasks.find(x => x.id === id);
  $('#moveTitle').textContent = `${t.title} - ${t.course}`;
  $('#moveOpts').replaceChildren(...Object.entries(STATUS).map(([key, label]) => {
    const b = el('button', '', label);
    b.type = 'button';
    if (key === t.status) { b.setAttribute('aria-current', 'true'); b.append(el('small', '', 'Saat ini')); }
    b.addEventListener('click', () => { moveDlg.close(); moveTask(id, key); });
    return b;
  }));
  moveDlg.showModal();
}


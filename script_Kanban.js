'use strict';
/* ===== Data (Array of Objects) ===== */
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

/* ===== Helpers ===== */
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

/* ===== Aksi data ===== */
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
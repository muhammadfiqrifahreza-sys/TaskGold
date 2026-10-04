# TaskGold - Kanban Tugas Kuliah
 
Aplikasi web untuk mencatat dan memantau tugas kuliah dengan papan **kanban** (To Do -> In Progress -> Done).
 
- **Desain Figma:** https://www.figma.com/design/YFzDrnS4Z0oRvAqOFpVura
- **Live Demo:** https://muhammadfiqrifahreza-sys.github.io/TaskGold/
- **Repositori:** https://github.com/muhammadfiqrifahreza-sys/TaskGold
- **Pembuat:** Muhammad Fiqri Fahreza (NIM 2510131210024)
## Fungsi Web
 
TaskGold membantu mahasiswa mengatur tugas kuliah: melihat tugas apa yang belum dikerjakan, sedang dikerjakan, dan sudah selesai, lengkap dengan tenggat, progress subtugas, dan ringkasan statistik.
 
## Fitur Utama
 
- **Papan kanban:** seret (drag & drop) kartu tugas antar kolom To Do, In Progress, dan Selesai.
- **Tambah tugas:** form dengan validasi (judul, mata kuliah, tenggat, status awal, jumlah subtugas).
- **Progress subtugas:** tombol `+ Subtugas` menaikkan progress bar; jika penuh, kartu otomatis pindah ke Selesai.
- **Pindah status lewat tombol:** dialog "Pindah" sebagai pengganti drag di layar sentuh.
- **Hapus tugas** dengan konfirmasi.
- **Cari dan filter:** cari berdasarkan judul/mata kuliah, filter dengan chip mata kuliah.
- **Halaman Statistik:** total tugas, bar status tugas, jumlah per status, dan 3 deadline terdekat.
- **Halaman Mata Kuliah:** tugas dikelompokkan per mata kuliah beserta progress-nya.
- **Penyimpanan otomatis** di `localStorage`, jadi data tidak hilang saat halaman di-refresh.
- **Responsif:** desktop, tablet, dan mobile (sidebar menjadi bottom nav, kolom menjadi tab).
## Teknologi
 
- HTML5 semantik (`aside`, `nav`, `header`, `main`, `section`, `article`, `footer`, `dialog`)
- CSS3 (Flexbox, Grid, CSS Variables, Media Queries)
- JavaScript (DOM manipulation, event handling, array of objects, `localStorage`, HTML5 Drag and Drop API)
## Struktur Folder
 
```
taskgold/
├── index.html          # struktur halaman
├── style_Kanban.css    # tampilan dan responsive
├── script_Kanban.js    # logika dan interaktivitas
└── README.md
```
 
## Cara Menjalankan
 
1. Unduh atau clone repositori ini.
2. Pastikan `index.html`, `style_Kanban.css`, dan `script_Kanban.js` berada dalam satu folder.
3. Buka `index.html` di browser (Chrome, Edge, atau Firefox). Tidak perlu instalasi apa pun.
Untuk mengembalikan data contoh, hapus data situs (site data / localStorage) di browser lalu muat ulang halaman.
 
## Struktur Data
 
Setiap tugas disimpan sebagai object dalam array `tasks`:
 
```js
{ id: 1, title: 'Laporan ERD & Normalisasi', course: 'Basis Data',
  due: '2026-10-07', done: 0, total: 4, status: 'todo' }
```
 
`status` bernilai `todo`, `prog`, atau `done`.
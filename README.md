# Toko Buku online


Aplikasi web toko buku online berbasis **Node.js** dan **Express.js** dengan penyimpanan data menggunakan file JSON. Dibangun sebagai proyek kelompok dengan fitur lengkap untuk pengelolaan buku, keranjang belanja, dan manajemen pesanan.

---
## Anggota Kelompok & Pembagian Tugas

| No | Nama | NIM | Bagian |
|----|------|-----|--------|
| 1  | *(Muchamad Dio Vadel)* | *(202451084)* | Konfigurasi, Autentikasi & Middleware |
| 2  | *(Muhamad Hilmi Saputral)* | *(202451085)*  | Panel Admin (Buku, Kategori & Pesanan) |
| 3  | *(Farell Dyas Restu Pratama)* | *(202351113)* | Fitur User (Beranda, Keranjang, Checkout, Pesanan) |
| 4  | *(Martinho xavier)* | *(202451224)* | Frontend, Views & Tampilan |

### 1. Muchamad Dio Vadel — Konfigurasi, Autentikasi & Middleware
File yang dikerjakan: `app.js`, `config/db.js`, `middleware/auth.js`, `routes/auth.js`, `controllers/authController.js`

### 2. Muhamad Hilmi Saputral — Panel Admin
File yang dikerjakan: `routes/admin.js`, `controllers/adminController.js`, `views/admin/dashboard.ejs`, `views/admin/buku/`, `views/admin/kategori/index.ejs`, `views/admin/pesanan/`

### 3 Farell Dyas Restu Pratama — Fitur User
File yang dikerjakan: `routes/user.js`, `controllers/bukuController.js`, `views/user/checkout.ejs`, `views/user/detail-buku.ejs`, `data/db.json`

### 4.Martinho xavier — Frontend, Views & Tampilan
File yang dikerjakan: `views/partials/`, `views/auth/`, `views/error.ejs`, `views/user/` (sisa halaman), `public/`

---

## Fitur Aplikasi
### Fitur untuk User
- **Registrasi & Login** — buat akun baru, login dengan email & password
- **Beranda** — tampil daftar buku dengan paginasi 9 item per halaman
- **Filter & Pencarian** — filter buku by kategori dan pencarian by judul
- **Detail Buku** — informasi lengkap buku beserta 4 buku terkait dari kategori yang sama
- **Keranjang Belanja** — tambah buku (dengan pengecekan stok), ubah jumlah, hapus item
- **Checkout** — proses pemesanan: buat pesanan, kurangi stok, kosongkan keranjang
- **Riwayat Pesanan** — lihat semua pesanan milik user, diurutkan dari terbaru
- **Detail Pesanan** — lihat rincian item dan status pesanan
- **Logout** — keluar dari sesi

### Fitur untuk Admin
- **Dashboard** — statistik total buku, user, pesanan, kategori, dan pendapatan
- **Kelola Buku** — tambah, edit, hapus buku; paginasi 10 item; filter kategori & cari judul
- **Upload Gambar** — upload sampul buku dengan nama file acak (mencegah konflik)
- **Kelola Kategori** — tambah, edit, hapus kategori (hapus dicegah jika masih ada buku)
- **Kelola Pesanan** — lihat semua pesanan, filter by status, update status, hapus pesanan
- **Proteksi Rute** — semua halaman `/admin/*` hanya bisa diakses role `admin`


## ⚙️ Cara Menjalankan

### Prasyarat
Pastikan sudah terinstall:
- [Node.js](https://nodejs.org/) versi 18 ke atas
- npm (sudah ikut serta dengan Node.js)

### Langkah 1 — Ekstrak Proyek

```
git clone https://github.com/username/tokobuku.git
cd tokobuku
```

### Langkah 2 — Install Dependensi

```
npm install
```

### Langkah 3 — Konfigurasi Environment

File `.env` sudah tersedia di dalam folder proyek. Isinya:

```env
PORT=3000
SESSION_SECRET=tokobuku_secret_2024
```

> Tidak perlu mengubah apa pun untuk menjalankan secara lokal.

### Langkah 4 — Jalankan Aplikasi

```bash
# Mode development (server restart otomatis saat file diubah)
npm run dev

# Mode production
npm start
```

### Langkah 5 — Buka di Browser

http://localhost:3000

- Dashboard Admin: Buka http://localhost:3000/admin.


clau
## Akun Default

| Role  | Email               | Password   |
|-------|---------------------|------------|
| Admin | `admin@tokobuku.com` | `password` |
| User  | *(daftar sendiri via `/auth/register`)* | — |

---


### Alur Status Pesanan

```
menunggu  →  diproses  →  dikirim  →  selesai
```

⚠️ Status hanya bisa maju, tidak bisa mundur. Update dilakukan oleh admin melalui panel admin.



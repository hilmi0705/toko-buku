const { readDB, writeDB, newId } = require('../config/db');
const path = require('path');
const fs = require('fs');

const makeSlug = (str) => str.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '');

// DASHBOARD
const getDashboard = (req, res) => {
    const db = readDB();
    const pesananTerbaru = db.pesanans
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .slice(0, 5)
        .map(p => ({ ...p, user: db.users.find(u => u.id === p.user_id) }));

    const pendapatan = db.pesanans
        .filter(p => ['diproses','dikirim','selesai'].includes(p.status))
        .reduce((acc, p) => acc + p.total_harga, 0);

    res.render('admin/dashboard', {
        title: 'Dashboard Admin',
        totalBuku: db.bukus.length,
        totalUser: db.users.filter(u => u.role === 'user').length,
        totalPesanan: db.pesanans.length,
        totalKategori: db.kategoris.length,
        pesananTerbaru, pendapatan
    });
};

// BUKU LIST
const getBukuList = (req, res) => {
    const { search, kategori, page = 1 } = req.query;
    const db = readDB();
    const limit = 10;

    let bukus = db.bukus.map(b => ({ ...b, kategori: db.kategoris.find(k => k.id === b.kategori_id) }));
    if (search)   bukus = bukus.filter(b => b.judul.toLowerCase().includes(search.toLowerCase()));
    if (kategori) bukus = bukus.filter(b => b.kategori_id === parseInt(kategori));

    const count = bukus.length;
    const totalPages = Math.ceil(count / limit);
    bukus = bukus.slice((page - 1) * limit, page * limit);

    res.render('admin/buku/index', {
        title: 'Kelola Buku', bukus, kategoris: db.kategoris,
        search: search || '', selectedKategori: kategori || '',
        currentPage: parseInt(page), totalPages, count
    });
};

const getTambahBuku = (req, res) => {
    const db = readDB();
    res.render('admin/buku/tambah', { title: 'Tambah Buku', kategoris: db.kategoris });
};

const postTambahBuku = (req, res) => {
    const db = readDB();
    const { judul, penulis, penerbit, tahun_terbit, isbn, deskripsi, harga, stok, kategori_id } = req.body;
    const gambar = req.file ? req.file.filename : 'default-book.jpg';
    db.bukus.push({
        id: newId(db.bukus), judul, penulis, penerbit,
        tahun_terbit: parseInt(tahun_terbit) || null,
        isbn, deskripsi,
        harga: parseFloat(harga), stok: parseInt(stok) || 0,
        gambar, kategori_id: parseInt(kategori_id)
    });
    writeDB(db);
    req.flash('success', 'Buku berhasil ditambahkan!');
    res.redirect('/admin/buku');
};

const getEditBuku = (req, res) => {
    const db = readDB();
    const buku = db.bukus.find(b => b.id === parseInt(req.params.id));
    if (!buku) { req.flash('error', 'Buku tidak ditemukan.'); return res.redirect('/admin/buku'); }
    res.render('admin/buku/edit', { title: 'Edit Buku', buku, kategoris: db.kategoris });
};

const postEditBuku = (req, res) => {
    const db = readDB();
    const idx = db.bukus.findIndex(b => b.id === parseInt(req.params.id));
    if (idx === -1) { req.flash('error', 'Buku tidak ditemukan.'); return res.redirect('/admin/buku'); }

    const { judul, penulis, penerbit, tahun_terbit, isbn, deskripsi, harga, stok, kategori_id } = req.body;
    let gambar = db.bukus[idx].gambar;

    if (req.file) {
        if (gambar !== 'default-book.jpg') {
            const old = path.join(__dirname, '../public/images/', gambar);
            if (fs.existsSync(old)) fs.unlinkSync(old);
        }
        gambar = req.file.filename;
    }

    db.bukus[idx] = { ...db.bukus[idx], judul, penulis, penerbit, tahun_terbit: parseInt(tahun_terbit) || null, isbn, deskripsi, harga: parseFloat(harga), stok: parseInt(stok) || 0, gambar, kategori_id: parseInt(kategori_id) };
    writeDB(db);
    req.flash('success', 'Buku diperbarui!');
    res.redirect('/admin/buku');
};

const deleteBuku = (req, res) => {
    const db = readDB();
    const buku = db.bukus.find(b => b.id === parseInt(req.params.id));
    if (buku) {
        if (buku.gambar !== 'default-book.jpg') {
            const p = path.join(__dirname, '../public/images/', buku.gambar);
            if (fs.existsSync(p)) fs.unlinkSync(p);
        }
        db.bukus = db.bukus.filter(b => b.id !== parseInt(req.params.id));
        writeDB(db);
        req.flash('success', 'Buku dihapus!');
    }
    res.redirect('/admin/buku');
};

// KATEGORI
const getKategoriList = (req, res) => {
    const db = readDB();
    const kategoris = db.kategoris.map(k => ({
        ...k, bukus: db.bukus.filter(b => b.kategori_id === k.id)
    }));
    res.render('admin/kategori/index', { title: 'Kelola Kategori', kategoris });
};

const postTambahKategori = (req, res) => {
    const db = readDB();
    const { nama, deskripsi } = req.body;
    if (db.kategoris.find(k => k.nama.toLowerCase() === nama.toLowerCase())) {
        req.flash('error', 'Kategori sudah ada.');
        return res.redirect('/admin/kategori');
    }
    db.kategoris.push({ id: newId(db.kategoris), nama, slug: makeSlug(nama), deskripsi: deskripsi || '' });
    writeDB(db);
    req.flash('success', 'Kategori ditambahkan!');
    res.redirect('/admin/kategori');
};

const postEditKategori = (req, res) => {
    const db = readDB();
    const idx = db.kategoris.findIndex(k => k.id === parseInt(req.params.id));
    if (idx !== -1) {
        db.kategoris[idx] = { ...db.kategoris[idx], nama: req.body.nama, slug: makeSlug(req.body.nama), deskripsi: req.body.deskripsi || '' };
        writeDB(db);
        req.flash('success', 'Kategori diperbarui!');
    }
    res.redirect('/admin/kategori');
};

const deleteKategori = (req, res) => {
    const db = readDB();
    const id = parseInt(req.params.id);
    const count = db.bukus.filter(b => b.kategori_id === id).length;
    if (count > 0) { req.flash('error', `Masih ada ${count} buku di kategori ini.`); return res.redirect('/admin/kategori'); }
    db.kategoris = db.kategoris.filter(k => k.id !== id);
    writeDB(db);
    req.flash('success', 'Kategori dihapus!');
    res.redirect('/admin/kategori');
};

// PESANAN
const getPesananList = (req, res) => {
    const { status, page = 1 } = req.query;
    const db = readDB();
    const limit = 10;

    let pesanans = db.pesanans.map(p => ({ ...p, user: db.users.find(u => u.id === p.user_id) }));
    if (status) pesanans = pesanans.filter(p => p.status === status);
    pesanans = pesanans.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

    const count = pesanans.length;
    pesanans = pesanans.slice((page - 1) * limit, page * limit);

    res.render('admin/pesanan/index', {
        title: 'Kelola Pesanan', pesanans,
        selectedStatus: status || '',
        currentPage: parseInt(page), totalPages: Math.ceil(count / limit), count
    });
};

const getDetailPesananAdmin = (req, res) => {
    const db = readDB();
    const pesanan = db.pesanans.find(p => p.id === parseInt(req.params.id));
    if (!pesanan) { req.flash('error', 'Pesanan tidak ditemukan.'); return res.redirect('/admin/pesanan'); }

    pesanan.user = db.users.find(u => u.id === pesanan.user_id);
    pesanan.details = db.detail_pesanans
        .filter(d => d.pesanan_id === pesanan.id)
        .map(d => ({ ...d, buku: db.bukus.find(b => b.id === d.buku_id) }));

    res.render('admin/pesanan/detail', { title: `Pesanan ${pesanan.kode_pesanan}`, pesanan });
};

const updateStatusPesanan = (req, res) => {
    const db = readDB();
    const idx = db.pesanans.findIndex(p => p.id === parseInt(req.params.id));
    if (idx !== -1) { db.pesanans[idx].status = req.body.status; writeDB(db); req.flash('success', 'Status diperbarui!'); }
    res.redirect(`/admin/pesanan/${req.params.id}`);
};

const deletePesanan = (req, res) => {
    const db = readDB();
    db.pesanans = db.pesanans.filter(p => p.id !== parseInt(req.params.id));
    db.detail_pesanans = db.detail_pesanans.filter(d => d.pesanan_id !== parseInt(req.params.id));
    writeDB(db);
    req.flash('success', 'Pesanan dihapus!');
    res.redirect('/admin/pesanan');
};

module.exports = {
    getDashboard,
    getBukuList, getTambahBuku, postTambahBuku, getEditBuku, postEditBuku, deleteBuku,
    getKategoriList, postTambahKategori, postEditKategori, deleteKategori,
    getPesananList, getDetailPesananAdmin, updateStatusPesanan, deletePesanan
};

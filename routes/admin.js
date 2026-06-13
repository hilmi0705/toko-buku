// routes/admin.js
const express = require('express');
const r = express.Router();
const a = require('../controllers/adminController');
const { isAdmin } = require('../middleware/auth');
const multer = require('multer');
const path = require('path');
const crypto = require('crypto');

const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, path.join(__dirname, '../public/images/')),
    filename: (req, file, cb) => cb(null, 'buku-' + crypto.randomBytes(8).toString('hex') + path.extname(file.originalname))
});
const upload = multer({ storage, limits: { fileSize: 2 * 1024 * 1024 } });

r.use(isAdmin);

r.get('/dashboard', a.getDashboard);
r.get('/buku', a.getBukuList);
r.get('/buku/tambah', a.getTambahBuku);
r.post('/buku/tambah', upload.single('gambar'), a.postTambahBuku);
r.get('/buku/edit/:id', a.getEditBuku);
r.post('/buku/edit/:id', upload.single('gambar'), a.postEditBuku);
r.post('/buku/hapus/:id', a.deleteBuku);
r.get('/kategori', a.getKategoriList);
r.post('/kategori/tambah', a.postTambahKategori);
r.post('/kategori/edit/:id', a.postEditKategori);
r.post('/kategori/hapus/:id', a.deleteKategori);
r.get('/pesanan', a.getPesananList);
r.get('/pesanan/:id', a.getDetailPesananAdmin);
r.post('/pesanan/:id/status', a.updateStatusPesanan);
r.post('/pesanan/:id/hapus', a.deletePesanan);

module.exports = r;

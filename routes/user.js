// routes/user.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/bukuController');
const { isLoggedIn } = require('../middleware/auth');

r.get('/', c.getHome);
r.get('/buku/:id', c.getDetailBuku);
r.post('/keranjang/tambah', isLoggedIn, c.tambahKeranjang);
r.get('/keranjang', isLoggedIn, c.getKeranjang);
r.post('/keranjang/update', isLoggedIn, c.updateKeranjang);
r.post('/keranjang/hapus/:id', isLoggedIn, c.hapusKeranjang);
r.get('/checkout', isLoggedIn, c.getCheckout);
r.post('/checkout', isLoggedIn, c.prosesCheckout);
r.get('/pesanan', isLoggedIn, c.getRiwayatPesanan);
r.get('/pesanan/:id', isLoggedIn, c.getDetailPesanan);

module.exports = r;

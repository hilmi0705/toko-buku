const { readDB, writeDB, newId } = require('../config/db');

const formatRupiah = (n) => new Intl.NumberFormat('id-ID', { style: 'currency', currency: 'IDR', minimumFractionDigits: 0 }).format(n);

// GET / - Beranda
const getHome = (req, res) => {
    const { kategori, search, page = 1 } = req.query;
    const db = readDB();
    const limit = 9;

    let bukus = db.bukus.map(b => ({ ...b, kategori: db.kategoris.find(k => k.id === b.kategori_id) }));

    if (kategori) bukus = bukus.filter(b => b.kategori && b.kategori.slug === kategori);
    if (search)   bukus = bukus.filter(b => b.judul.toLowerCase().includes(search.toLowerCase()));

    const total = bukus.length;
    const totalPages = Math.ceil(total / limit);
    const offset = (page - 1) * limit;
    bukus = bukus.slice(offset, offset + limit);

    const jumlahKeranjang = req.session.user
        ? db.keranjangs.filter(k => k.user_id === req.session.user.id).length : 0;

    res.render('user/home', {
        title: 'Toko Buku Online', bukus,
        kategoris: db.kategoris,
        selectedKategori: kategori || '',
        search: search || '',
        currentPage: parseInt(page), totalPages, jumlahKeranjang
    });
};

// GET /buku/:id
const getDetailBuku = (req, res) => {
    const db = readDB();
    const buku = db.bukus.find(b => b.id === parseInt(req.params.id));
    if (!buku) { req.flash('error', 'Buku tidak ditemukan.'); return res.redirect('/'); }

    buku.kategori = db.kategoris.find(k => k.id === buku.kategori_id);
    const related = db.bukus
        .filter(b => b.kategori_id === buku.kategori_id && b.id !== buku.id)
        .slice(0, 4)
        .map(b => ({ ...b, kategori: db.kategoris.find(k => k.id === b.kategori_id) }));

    const jumlahKeranjang = req.session.user
        ? db.keranjangs.filter(k => k.user_id === req.session.user.id).length : 0;

    res.render('user/detail-buku', { title: buku.judul, buku, related, jumlahKeranjang });
};

// POST /keranjang/tambah
const tambahKeranjang = (req, res) => {
    const { buku_id, jumlah = 1 } = req.body;
    const user_id = req.session.user.id;
    const db = readDB();

    const buku = db.bukus.find(b => b.id === parseInt(buku_id));
    if (!buku || buku.stok < 1) { req.flash('error', 'Stok habis.'); return res.redirect('back'); }

    const existing = db.keranjangs.find(k => k.user_id === user_id && k.buku_id === parseInt(buku_id));
    if (existing) {
        const newJumlah = existing.jumlah + parseInt(jumlah);
        if (newJumlah > buku.stok) { req.flash('error', 'Melebihi stok.'); return res.redirect('back'); }
        existing.jumlah = newJumlah;
    } else {
        db.keranjangs.push({ id: newId(db.keranjangs), user_id, buku_id: parseInt(buku_id), jumlah: parseInt(jumlah) });
    }
    writeDB(db);
    req.flash('success', 'Ditambahkan ke keranjang!');
    res.redirect('back');
};

// GET /keranjang
const getKeranjang = (req, res) => {
    const db = readDB();
    const items = db.keranjangs
        .filter(k => k.user_id === req.session.user.id)
        .map(k => ({ ...k, buku: db.bukus.find(b => b.id === k.buku_id) }))
        .filter(k => k.buku);

    const total = items.reduce((acc, k) => acc + k.jumlah * k.buku.harga, 0);
    res.render('user/keranjang', { title: 'Keranjang', items, total, jumlahKeranjang: items.length });
};

// POST /keranjang/update
const updateKeranjang = (req, res) => {
    const { id, jumlah } = req.body;
    const db = readDB();
    const idx = db.keranjangs.findIndex(k => k.id === parseInt(id) && k.user_id === req.session.user.id);
    if (idx === -1) { req.flash('error', 'Item tidak ditemukan.'); return res.redirect('/keranjang'); }

    if (parseInt(jumlah) < 1) {
        db.keranjangs.splice(idx, 1);
        req.flash('info', 'Item dihapus.');
    } else {
        db.keranjangs[idx].jumlah = parseInt(jumlah);
        req.flash('success', 'Keranjang diperbarui.');
    }
    writeDB(db);
    res.redirect('/keranjang');
};

// POST /keranjang/hapus/:id
const hapusKeranjang = (req, res) => {
    const db = readDB();
    db.keranjangs = db.keranjangs.filter(k => !(k.id === parseInt(req.params.id) && k.user_id === req.session.user.id));
    writeDB(db);
    req.flash('info', 'Item dihapus.');
    res.redirect('/keranjang');
};

// GET /checkout
const getCheckout = (req, res) => {
    const db = readDB();
    const items = db.keranjangs
        .filter(k => k.user_id === req.session.user.id)
        .map(k => ({ ...k, buku: db.bukus.find(b => b.id === k.buku_id) }))
        .filter(k => k.buku);

    if (items.length === 0) { req.flash('error', 'Keranjang kosong.'); return res.redirect('/keranjang'); }

    const total = items.reduce((acc, k) => acc + k.jumlah * k.buku.harga, 0);
    const userDetail = db.users.find(u => u.id === req.session.user.id);
    res.render('user/checkout', { title: 'Checkout', items, total, userDetail, jumlahKeranjang: items.length });
};

// POST /checkout
const prosesCheckout = (req, res) => {
    const { alamat_pengiriman, catatan } = req.body;
    const user_id = req.session.user.id;
    const db = readDB();

    const items = db.keranjangs
        .filter(k => k.user_id === user_id)
        .map(k => ({ ...k, buku: db.bukus.find(b => b.id === k.buku_id) }))
        .filter(k => k.buku);

    if (items.length === 0) { req.flash('error', 'Keranjang kosong.'); return res.redirect('/keranjang'); }

    const total_harga = items.reduce((acc, k) => acc + k.jumlah * k.buku.harga, 0);
    const kode_pesanan = 'ORD-' + Date.now();

    const pesanan = {
        id: newId(db.pesanans),
        user_id, kode_pesanan, total_harga,
        status: 'menunggu',
        alamat_pengiriman,
        catatan: catatan || '',
        createdAt: new Date().toISOString()
    };
    db.pesanans.push(pesanan);

    items.forEach(item => {
        db.detail_pesanans.push({
            id: newId(db.detail_pesanans),
            pesanan_id: pesanan.id,
            buku_id: item.buku_id,
            jumlah: item.jumlah,
            harga_satuan: item.buku.harga,
            subtotal: item.jumlah * item.buku.harga
        });
        const b = db.bukus.find(b => b.id === item.buku_id);
        if (b) b.stok -= item.jumlah;
    });

    db.keranjangs = db.keranjangs.filter(k => k.user_id !== user_id);
    writeDB(db);

    req.flash('success', `Pesanan ${kode_pesanan} berhasil!`);
    res.redirect('/pesanan');
};

// GET /pesanan
const getRiwayatPesanan = (req, res) => {
    const db = readDB();
    const pesanans = db.pesanans
        .filter(p => p.user_id === req.session.user.id)
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .map(p => ({
            ...p,
            details: db.detail_pesanans
                .filter(d => d.pesanan_id === p.id)
                .map(d => ({ ...d, buku: db.bukus.find(b => b.id === d.buku_id) }))
        }));

    const jumlahKeranjang = db.keranjangs.filter(k => k.user_id === req.session.user.id).length;
    res.render('user/riwayat-pesanan', { title: 'Riwayat Pesanan', pesanans, jumlahKeranjang });
};

// GET /pesanan/:id
const getDetailPesanan = (req, res) => {
    const db = readDB();
    const pesanan = db.pesanans.find(p => p.id === parseInt(req.params.id) && p.user_id === req.session.user.id);
    if (!pesanan) { req.flash('error', 'Pesanan tidak ditemukan.'); return res.redirect('/pesanan'); }

    pesanan.details = db.detail_pesanans
        .filter(d => d.pesanan_id === pesanan.id)
        .map(d => ({ ...d, buku: db.bukus.find(b => b.id === d.buku_id) }));

    const jumlahKeranjang = db.keranjangs.filter(k => k.user_id === req.session.user.id).length;
    res.render('user/detail-pesanan', { title: `Pesanan ${pesanan.kode_pesanan}`, pesanan, jumlahKeranjang });
};

module.exports = {
    getHome, getDetailBuku,
    tambahKeranjang, getKeranjang, updateKeranjang, hapusKeranjang,
    getCheckout, prosesCheckout, getRiwayatPesanan, getDetailPesanan
};

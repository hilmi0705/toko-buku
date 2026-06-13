const bcrypt = require('bcryptjs');
const { readDB, writeDB, newId } = require('../config/db');

const getLogin = (req, res) => res.render('auth/login', { title: 'Login' });

const postLogin = async (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find(u => u.email === email);
    if (!user || !(await bcrypt.compare(password, user.password))) {
        req.flash('error', 'Email atau password salah.');
        return res.redirect('/auth/login');
    }
    req.session.user = { id: user.id, nama: user.nama, email: user.email, role: user.role };
    req.flash('success', `Selamat datang, ${user.nama}!`);
    if (user.role === 'admin') return res.redirect('/admin/dashboard');
    res.redirect('/');
};

const getRegister = (req, res) => res.render('auth/register', { title: 'Daftar Akun' });

const postRegister = async (req, res) => {
    try {
        const { nama, email, password, konfirmasi_password, telepon, alamat } = req.body;
        if (password !== konfirmasi_password) {
            req.flash('error', 'Password tidak cocok.');
            return res.redirect('/auth/register');
        }
        if (password.length < 6) {
            req.flash('error', 'Password minimal 6 karakter.');
            return res.redirect('/auth/register');
        }
        const db = readDB();
        if (db.users.find(u => u.email === email)) {
            req.flash('error', 'Email sudah terdaftar.');
            return res.redirect('/auth/register');
        }
        const hashed = await bcrypt.hash(password, 10);
        const user = { id: newId(db.users), nama, email, password: hashed, role: 'user', telepon: telepon || '', alamat: alamat || '' };
        db.users.push(user);
        writeDB(db);
        req.flash('success', 'Registrasi berhasil! Silakan login.');
        res.redirect('/auth/login');
    } catch (err) {
        console.error(err);
        req.flash('error', 'Terjadi kesalahan.');
        res.redirect('/auth/register');
    }
};

const logout = (req, res) => req.session.destroy(() => res.redirect('/auth/login'));

module.exports = { getLogin, postLogin, getRegister, postRegister, logout };

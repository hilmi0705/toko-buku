// routes/auth.js
const express = require('express');
const r = express.Router();
const c = require('../controllers/authController');
const { isGuest, isLoggedIn } = require('../middleware/auth');

r.get('/login', isGuest, c.getLogin);
r.post('/login', isGuest, c.postLogin);
r.get('/register', isGuest, c.getRegister);
r.post('/register', isGuest, c.postRegister);
r.get('/logout', isLoggedIn, c.logout);

module.exports = r;

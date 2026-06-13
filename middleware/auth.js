const isLoggedIn = (req, res, next) => {
    if (req.session && req.session.user) return next();
    req.flash('error', 'Silakan login terlebih dahulu.');
    res.redirect('/auth/login');
};

const isAdmin = (req, res, next) => {
    if (req.session && req.session.user && req.session.user.role === 'admin') return next();
    req.flash('error', 'Akses ditolak.');
    res.redirect('/');
};

const isGuest = (req, res, next) => {
    if (req.session && req.session.user) {
        if (req.session.user.role === 'admin') return res.redirect('/admin/dashboard');
        return res.redirect('/');
    }
    next();
};

const setLocals = (req, res, next) => {
    res.locals.user    = req.session.user || null;
    res.locals.success = req.flash('success');
    res.locals.error   = req.flash('error');
    res.locals.info    = req.flash('info');
    next();
};

module.exports = { isLoggedIn, isAdmin, isGuest, setLocals };

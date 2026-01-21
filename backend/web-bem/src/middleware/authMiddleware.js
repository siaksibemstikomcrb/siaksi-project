const jwt = require('jsonwebtoken');

// Middleware Cek Login
const authMiddleware = (req, res, next) => {
    // CARI TOKEN DI COOKIE (Bukan di Header lagi)
    const token = req.cookies.token;

    if (!token) {
        return res.status(401).json({ msg: 'Tidak ada token, otorisasi ditolak.' });
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET);
        req.user = decoded.user;
        next();
    } catch (err) {
        res.status(401).json({ msg: 'Token tidak valid.' });
    }
};

// Middleware Cek Role (Admin/Super Admin)
const role = (roles = []) => {
    return (req, res, next) => {
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: 'Akses ditolak. Anda tidak memiliki izin.' });
        }
        next();
    };
};

// PENTING: Export menggunakan Object
module.exports = { authMiddleware, role };
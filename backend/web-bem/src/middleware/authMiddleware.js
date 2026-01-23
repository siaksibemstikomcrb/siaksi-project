const jwt = require('jsonwebtoken');

// 1. Auth Middleware (Cek Token Login)
// Dipakai di semua file route
const authMiddleware = (req, res, next) => {
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

// 2. Admin Middleware (Versi Simpel)
// Dipakai di: userRoutes.js (Create User)
// Logic: Pokoknya kalau dia admin (apapun jenisnya), boleh lewat.
const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ msg: 'User tidak terautentikasi' });
    }

    const userRole = req.user.role; 

    // Cek apakah Super Admin atau Admin UKM
    if (userRole === 'super_admin' || (userRole && userRole.includes('admin'))) {
        next();
    } else {
        return res.status(403).json({ msg: 'Akses Ditolak: Khusus Admin!' });
    }
};

// 3. Role Middleware (Versi Spesifik)
// Dipakai di: adminRoutes.js
// Logic: Bisa milih role apa aja yang boleh (misal cuma ['super_admin'] aja)
const role = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'User tidak terautentikasi' });
        }
        
        // Kalau role user tidak ada di dalam daftar yang diizinkan -> tolak
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: `Akses Ditolak. Role ${req.user.role} tidak diizinkan.` });
        }
        next();
    };
};

// EXPORT KETIGANYA (Supaya userRoutes & adminRoutes sama-sama senang)
module.exports = { 
    authMiddleware, 
    adminMiddleware, 
    role 
};
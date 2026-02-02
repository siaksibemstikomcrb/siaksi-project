const jwt = require('jsonwebtoken');

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

const adminMiddleware = (req, res, next) => {
    if (!req.user) {
        return res.status(401).json({ msg: 'User tidak terautentikasi' });
    }

    const userRole = req.user.role; 

    if (userRole === 'super_admin' || (userRole && userRole.includes('admin'))) {
        next();
    } else {
        return res.status(403).json({ msg: 'Akses Ditolak: Khusus Admin!' });
    }
};

const role = (roles = []) => {
    return (req, res, next) => {
        if (!req.user) {
            return res.status(401).json({ msg: 'User tidak terautentikasi' });
        }
        
        if (!roles.includes(req.user.role)) {
            return res.status(403).json({ msg: `Akses Ditolak. Role ${req.user.role} tidak diizinkan.` });
        }
        next();
    };
};

module.exports = { 
    authMiddleware, 
    adminMiddleware, 
    role 
};
// backend/middleware/activityLogger.js
const db = require('../config/db');

const activityLogger = async (req, res, next) => {
    try {
        // 1. Jika User Login: Update status Last Active
        if (req.user && req.user.id) {
            await db.query(
                `UPDATE users SET last_active = NOW() WHERE id = $1`,
                [req.user.id]
            );
        }

        // 2. LOG PENGUNJUNG (Khusus URL Publik)
        // Kita hanya catat method GET dan URL tertentu biar database gak meledak
        const publicPaths = ['/api/news', '/api/learning', '/api/public']; 
        const isPublicPath = publicPaths.some(path => req.originalUrl.startsWith(path));

        if (req.method === 'GET' && isPublicPath) {
            // Ambil IP (Handle jika dibalik Proxy/Nginx)
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'];
            const isUser = !!req.user; // True jika ada token login

            // Simpan ke Visitor Logs (Fire and forget, gak perlu await biar cepet)
            db.query(
                `INSERT INTO visitor_logs (ip_address, user_agent, page_accessed, is_registered_user) 
                 VALUES ($1, $2, $3, $4)`,
                [ip, userAgent, req.originalUrl, isUser]
            ).catch(err => console.error("Visitor Log Error:", err.message));
        }

    } catch (err) {
        console.error("Activity Logger Error:", err.message);
    }
    next();
};

module.exports = activityLogger;
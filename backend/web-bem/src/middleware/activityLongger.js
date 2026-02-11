const db = require('../config/db');
const jwt = require('jsonwebtoken');
require('dotenv').config();

const activityLogger = async (req, res, next) => {
    try {
        let userId = null;

        const authHeader = req.headers['authorization'];
        if (authHeader && authHeader.startsWith('Bearer ')) {
            const token = authHeader.split(' ')[1];
            try {
                const decoded = jwt.verify(token, process.env.JWT_SECRET);
                userId = decoded.id;
            } catch (err) {
            }
        }

        if (userId) {
            db.query(
                `UPDATE users SET last_active = NOW() WHERE id = $1`,
                [userId]
            ).catch(err => console.error("Gagal update last_active:", err.message));
        }

        const publicPaths = ['/api/news', '/api/learning', '/api/public', '/api/ukms']; 
        const isPublicPath = publicPaths.some(path => req.originalUrl.startsWith(path));

        if (req.method === 'GET' && isPublicPath) {
            const ip = req.headers['x-forwarded-for'] || req.socket.remoteAddress;
            const userAgent = req.headers['user-agent'];
            
            db.query(
                `INSERT INTO visitor_logs (ip_address, user_agent, page_accessed, is_registered_user) 
                 VALUES ($1, $2, $3, $4)`,
                [ip, userAgent, req.originalUrl, !!userId]
            ).catch(err => console.error("Visitor Log Error:", err.message));
        }

    } catch (err) {
        console.error("Activity Logger Error:", err.message);
    }
    
    next();
};

module.exports = activityLogger;
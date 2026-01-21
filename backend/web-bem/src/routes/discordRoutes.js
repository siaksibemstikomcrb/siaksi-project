const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getAuthUrl, connectDiscord } = require('../controllers/discordController');

// Ambil URL Login (User klik tombol -> Hit ini)
router.get('/auth-url', authMiddleware, getAuthUrl);

// Kirim Kode Balikan (Setelah login -> Frontend kirim kode ke sini)
router.post('/connect', authMiddleware, connectDiscord);

module.exports = router;
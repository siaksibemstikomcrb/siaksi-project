const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getAuthUrl, connectDiscord } = require('../controllers/discordController');

router.get('/auth-url', authMiddleware, getAuthUrl);

router.post('/connect', authMiddleware, connectDiscord);

module.exports = router;
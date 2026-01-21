const express = require('express');
const router = express.Router();

// 1. IMPORT MIDDLEWARE
const { authMiddleware } = require('../middleware/authMiddleware');

// 2. IMPORT CONTROLLER
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');

// --- DEFINISI RUTE ---

router.get('/my', authMiddleware, getMyNotifications);
router.put('/read/:id', authMiddleware, markAsRead);

module.exports = router;
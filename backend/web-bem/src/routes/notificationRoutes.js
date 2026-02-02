const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getMyNotifications, markAsRead } = require('../controllers/notificationController');


router.get('/my', authMiddleware, getMyNotifications);
router.put('/read/:id', authMiddleware, markAsRead);

module.exports = router;
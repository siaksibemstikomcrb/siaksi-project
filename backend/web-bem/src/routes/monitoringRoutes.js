const express = require('express');
const router = express.Router();
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const { getGlobalMonitoring, getUKMDetail, getOnlineUsers, getVisitorStats } = require('../controllers/monitoringController');


router.get('/global', authMiddleware, getGlobalMonitoring);
router.get('/ukm/:id', authMiddleware, getUKMDetail);
router.get('/online-users', authMiddleware, getOnlineUsers);
router.get('/visitor-stats', authMiddleware, adminMiddleware, getVisitorStats);

module.exports = router;
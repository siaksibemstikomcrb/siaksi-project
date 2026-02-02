const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const { getGlobalMonitoring, getUKMDetail } = require('../controllers/monitoringController');


router.get('/global', authMiddleware, getGlobalMonitoring);

router.get('/ukm/:id', authMiddleware, getUKMDetail);

module.exports = router;
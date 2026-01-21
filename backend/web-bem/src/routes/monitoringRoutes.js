const express = require('express');
const router = express.Router();

// 1. IMPORT MIDDLEWARE
const { authMiddleware } = require('../middleware/authMiddleware');

// 2. IMPORT CONTROLLER
const { getGlobalMonitoring, getUKMDetail } = require('../controllers/monitoringController');

// --- DEFINISI RUTE ---

// Endpoint Monitoring Global
router.get('/global', authMiddleware, getGlobalMonitoring);

// Endpoint Detail UKM Spesifik
router.get('/ukm/:id', authMiddleware, getUKMDetail);

module.exports = router;
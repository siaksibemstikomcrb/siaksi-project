const express = require('express');
const router = express.Router();
const { authMiddleware, role } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { createAspiration, getAspirations } = require('../controllers/aspirationController');

// User kirim aspirasi (Perlu login, tapi nanti data user tidak ditampilkan di get)
router.post('/', authMiddleware, upload.single('image'), createAspiration);

// Admin & Super Admin melihat aspirasi masuk
router.get('/', authMiddleware, role(['admin', 'super_admin']), getAspirations);

module.exports = router;
const express = require('express');
const router = express.Router();
const { authMiddleware, role } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); // Pakai middleware upload yang sudah ada
const { createComplaint, getAllComplaints, updateStatus } = require('../controllers/complaintController');

// User biasa kirim complain (Teks + Gambar)
router.post('/', authMiddleware, upload.single('screenshot'), createComplaint);

// Super Admin melihat list complain
router.get('/', authMiddleware, role(['super_admin']), getAllComplaints);

// Super Admin update status
router.put('/:id/status', authMiddleware, role(['super_admin']), updateStatus);

module.exports = router;
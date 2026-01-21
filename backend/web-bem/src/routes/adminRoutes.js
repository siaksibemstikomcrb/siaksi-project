const express = require('express');
const router = express.Router();

// 1. IMPORT MIDDLEWARE (Destructuring Wajib & Konsisten)
const { authMiddleware, role } = require('../middleware/authMiddleware');

// 2. IMPORT CONTROLLER
const { 
  registerUser, 
  getAttendanceReport, 
  broadcastMessage,
  exportAttendance 
} = require('../controllers/adminController');

// --- DEFINISI RUTE ---

// Register User Baru (Hanya Super Admin)
router.post('/register-user', authMiddleware, role(['super_admin']), registerUser);

// Broadcast Pesan (Hanya Super Admin)
router.post('/broadcast', authMiddleware, role(['super_admin']), broadcastMessage);

// --- PERBAIKAN UTAMA ADA DI SINI ---
// Report Statistik di Website (Admin UKM & Super Admin)
// Kita tambahkan 'admin' DAN 'admin_ukm' agar aman
router.get('/report/:schedule_id', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), getAttendanceReport);

// Export ke Excel (Admin UKM & Super Admin)
router.get('/export/:schedule_id', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), exportAttendance);

module.exports = router;
const express = require('express');
const router = express.Router();

// 1. IMPORT CONTROLLER (Destructuring matches exports from controller)
const { 
    submitAttendance, 
    getMemberHistory, 
    getAttendanceBySchedule 
} = require('../controllers/attendanceController');

// 2. IMPORT MIDDLEWARE (Destructuring matches exports from middleware file)
const { authMiddleware, role } = require('../middleware/authMiddleware');

// --- DEFINISI RUTE ---

// Rute Absen (Member melakukan presensi)
router.post('/submit', authMiddleware, submitAttendance);

// Rute History Per Member (Member melihat riwayatnya sendiri)
router.get('/history/:userId', authMiddleware, getMemberHistory);

// Rute Lihat Daftar Hadir per Jadwal (KHUSUS ADMIN - Monitoring Detail)
router.get('/schedule/:schedule_id', authMiddleware, role(['super_admin', 'admin_ukm']), getAttendanceBySchedule);

module.exports = router;
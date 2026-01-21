const express = require('express');
const router = express.Router();

// Import controller (Pastikan update destructuring-nya)
const { 
    createSchedule, getAllSchedules, deleteSchedule, 
    getScheduleById, updateSchedule, cancelSchedule 
} = require('../controllers/scheduleController');

const { authMiddleware, role } = require('../middleware/authMiddleware');

// --- ROUTES ---
router.get('/', authMiddleware, getAllSchedules);
router.post('/', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), createSchedule);

// NEW: Get One & Update
router.get('/:id', authMiddleware, getScheduleById); // Ambil data lama
router.put('/:id', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), updateSchedule); // Simpan edit

// Cancel & Delete
router.put('/:id/cancel', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), cancelSchedule);
router.delete('/:id', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), deleteSchedule);

module.exports = router;
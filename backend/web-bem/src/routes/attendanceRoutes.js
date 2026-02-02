const express = require('express');
const router = express.Router();

const { 
    submitAttendance, 
    getMemberHistory, 
    getAttendanceBySchedule 
} = require('../controllers/attendanceController');

const { authMiddleware, role } = require('../middleware/authMiddleware');


router.post('/submit', authMiddleware, submitAttendance);
router.get('/history/:userId', authMiddleware, getMemberHistory);
router.get('/schedule/:schedule_id', authMiddleware, role(['super_admin', 'admin_ukm']), getAttendanceBySchedule);

module.exports = router;
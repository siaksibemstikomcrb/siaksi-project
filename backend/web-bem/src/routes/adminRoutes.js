const express = require('express');
const router = express.Router();

const { authMiddleware, role } = require('../middleware/authMiddleware');

const { 
  registerUser, 
  getAttendanceReport, 
  broadcastMessage,
  exportAttendance 
} = require('../controllers/adminController');


router.post('/register-user', authMiddleware, role(['super_admin']), registerUser);
router.post('/broadcast', authMiddleware, role(['super_admin']), broadcastMessage);
router.get('/report/:schedule_id', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), getAttendanceReport);
router.get('/export/:schedule_id', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), exportAttendance);

module.exports = router;
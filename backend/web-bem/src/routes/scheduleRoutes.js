const express = require('express');
const router = express.Router();

const { 
    createSchedule, getAllSchedules, deleteSchedule, 
    getScheduleById, updateSchedule, cancelSchedule 
} = require('../controllers/scheduleController');

const { authMiddleware, role } = require('../middleware/authMiddleware');

router.get('/', authMiddleware, getAllSchedules);
router.post('/', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), createSchedule);

router.get('/:id', authMiddleware, getScheduleById);
router.put('/:id', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), updateSchedule);

router.put('/:id/cancel', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), cancelSchedule);
router.delete('/:id', authMiddleware, role(['admin', 'admin_ukm', 'super_admin']), deleteSchedule);

module.exports = router;
const express = require('express');
const router = express.Router();
const { authMiddleware, role } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { createComplaint, getAllComplaints, updateStatus } = require('../controllers/complaintController');

router.post('/', authMiddleware, upload.single('screenshot'), createComplaint);

router.get('/', authMiddleware, role(['super_admin']), getAllComplaints);

router.put('/:id/status', authMiddleware, role(['super_admin']), updateStatus);

module.exports = router;
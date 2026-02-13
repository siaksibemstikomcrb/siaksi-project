const express = require('express');
const router = express.Router();
const { authMiddleware, role } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { createComplaint, getAllComplaints, getMyComplaints, respondToComplaint } = require('../controllers/complaintController');

router.post('/', authMiddleware, upload.single('screenshot'), createComplaint);

router.get('/my', authMiddleware, getMyComplaints);

router.get('/', authMiddleware, role(['super_admin']), getAllComplaints);

router.put('/:id/respond', authMiddleware, role(['super_admin']), upload.single('attachment'), respondToComplaint);

module.exports = router;
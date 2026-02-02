const express = require('express');
const router = express.Router();
const { authMiddleware, role } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload');
const { createAspiration, getAspirations } = require('../controllers/aspirationController');

router.post('/', authMiddleware, upload.single('image'), createAspiration);
router.get('/', authMiddleware, role(['admin', 'super_admin']), getAspirations);

module.exports = router;
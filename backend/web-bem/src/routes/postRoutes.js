const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');

// --- PERBAIKAN DI SINI ---
// Gunakan kurung kurawal { } untuk mengambil fungsi authMiddleware dari dalam object
const { authMiddleware } = require('../middleware/authMiddleware'); 

const multer = require('multer');
const { storage } = require('../config/cloudinary');

const upload = multer({ storage });

// 1. GET Public Posts
router.get('/public', postController.getPublicPosts);

// 2. GET Dashboard Posts
router.get('/dashboard', authMiddleware, postController.getDashboardPosts);

// 3. GET Post Detail
router.get('/:id', postController.getPostDetail);

// 4. CREATE Post
router.post('/', authMiddleware, upload.single('image'), postController.createPost);

// 5. UPDATE Status
router.put('/:id/status', authMiddleware, postController.updatePostStatus);

// 6. UPDATE Pin
router.put('/:id/pin', authMiddleware, postController.togglePinPost);

// 7. DELETE Post
router.delete('/:id', authMiddleware, postController.deletePost);

// 8. UPDATE post
router.put('/:id', authMiddleware, upload.single('image'), postController.updatePost);

module.exports = router;
const express = require('express');
const router = express.Router();
const postController = require('../controllers/postController');
const { authMiddleware } = require('../middleware/authMiddleware'); 
const multer = require('multer');
const { storage } = require('../config/cloudinary');
const upload = multer({ storage });

router.get('/public', postController.getPublicPosts);

router.get('/dashboard', authMiddleware, postController.getDashboardPosts);

router.get('/:id', postController.getPostDetail);

router.post('/', authMiddleware, upload.single('image'), postController.createPost);

router.put('/:id/status', authMiddleware, postController.updatePostStatus);

router.put('/:id/pin', authMiddleware, postController.togglePinPost);

router.delete('/:id', authMiddleware, postController.deletePost);

router.put('/:id', authMiddleware, upload.single('image'), postController.updatePost);

module.exports = router;
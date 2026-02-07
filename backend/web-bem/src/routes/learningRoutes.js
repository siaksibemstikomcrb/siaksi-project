const express = require('express');
const router = express.Router();
const { authMiddleware, role } = require('../middleware/authMiddleware');
const { addVideo, getVideos, deleteVideo, bulkDeleteVideos, bulkMoveVideos, updateVideo} = require('../controllers/learningController');
const { getCategoryTree, createCategory, deleteCategory } = require('../controllers/categoryController');

// ✅ UBAH INI: Hapus 'authMiddleware' agar Public bisa akses
router.get('/', getVideos); 

// 🔒 TAPI INI JANGAN DIUBAH (Hanya Admin yang boleh Tambah/Hapus)
router.post('/', authMiddleware, role(['admin', 'super_admin']), addVideo);
router.delete('/:id', authMiddleware, role(['admin', 'super_admin']), deleteVideo);

router.get('/categories', getCategoryTree); // Public
router.post('/categories', authMiddleware, role(['super_admin', 'admin']), createCategory);
router.delete('/categories/:id', authMiddleware, role(['super_admin', 'admin']), deleteCategory);
router.put('/:id', authMiddleware, role(['admin', 'super_admin']), updateVideo);
router.put('/bulk/move', authMiddleware, role(['admin', 'super_admin']), bulkMoveVideos);
router.post('/bulk/delete', authMiddleware, role(['admin', 'super_admin']), bulkDeleteVideos);

module.exports = router;
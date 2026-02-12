const express = require('express');
const router = express.Router();
const { authMiddleware, role } = require('../middleware/authMiddleware');
const { 
    addVideo, getVideos, getMaterialById, chatWithVideo, 
    deleteVideo, bulkDeleteVideos, bulkMoveVideos, updateVideo, generateMissingTranscripts
} = require('../controllers/learningController');
const { getCategoryTree, createCategory, deleteCategory } = require('../controllers/categoryController');


router.get('/categories', getCategoryTree);
router.post('/chat', chatWithVideo);

router.get('/', getVideos);                 

router.get('/:id', getMaterialById);        


router.post('/', authMiddleware, role(['admin', 'super_admin']), addVideo);
router.put('/:id', authMiddleware, role(['admin', 'super_admin']), updateVideo);
router.delete('/:id', authMiddleware, role(['admin', 'super_admin']), deleteVideo);
router.post('/generate-transcripts', generateMissingTranscripts);

router.put('/bulk/move', authMiddleware, role(['admin', 'super_admin']), bulkMoveVideos);
router.post('/bulk/delete', authMiddleware, role(['admin', 'super_admin']), bulkDeleteVideos);

router.post('/categories', authMiddleware, role(['super_admin', 'admin']), createCategory);
router.delete('/categories/:id', authMiddleware, role(['super_admin', 'admin']), deleteCategory);

module.exports = router;
const express = require('express');
const router = express.Router();
const { authMiddleware, role } = require('../middleware/authMiddleware');

const upload = require('../middleware/upload'); 

const { uploadDocument, deleteDocument, autoArchiveDocument } = require('../controllers/documentController');
const { createFolder, getFolderContent, deleteFolder, moveItems } = require('../controllers/folderController');


router.get('/content', authMiddleware, role(['admin', 'super_admin']), getFolderContent);

router.post('/folder', authMiddleware, role(['admin', 'super_admin']), createFolder);
router.delete('/folder/:id', authMiddleware, role(['admin', 'super_admin']), deleteFolder);

router.post('/upload', authMiddleware, role(['admin', 'super_admin']), upload.array('files', 10), uploadDocument);
router.delete('/file/:id', authMiddleware, role(['admin', 'super_admin']), deleteDocument);

router.put('/move', authMiddleware, role(['admin', 'super_admin']), moveItems);

router.post('/auto-archive', authMiddleware, role(['admin', 'super_admin']), upload.single('file'), autoArchiveDocument);

module.exports = router;
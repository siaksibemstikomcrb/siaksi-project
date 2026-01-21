const express = require('express');
const router = express.Router();
const { authMiddleware, role } = require('../middleware/authMiddleware');

// 1. Import Middleware Upload yang sudah dibuat terpisah
const upload = require('../middleware/upload'); 

// 2. Import Controller
const { uploadDocument, deleteDocument, autoArchiveDocument } = require('../controllers/documentController');
const { createFolder, getFolderContent, deleteFolder, moveItems } = require('../controllers/folderController');

// --- 3. DEFINISI ROUTES ---

// A. Explorer Data (Folder & File)
router.get('/content', authMiddleware, role(['admin', 'super_admin']), getFolderContent);

// B. Folder Management
router.post('/folder', authMiddleware, role(['admin', 'super_admin']), createFolder);
router.delete('/folder/:id', authMiddleware, role(['admin', 'super_admin']), deleteFolder);

// C. File Management (Upload & Delete)
router.post('/upload', authMiddleware, role(['admin', 'super_admin']), upload.array('files', 10), uploadDocument);
router.delete('/file/:id', authMiddleware, role(['admin', 'super_admin']), deleteDocument);

// D. Move Items (Pindah Folder/File)
router.put('/move', authMiddleware, role(['admin', 'super_admin']), moveItems);

// E. AUTO ARCHIVE (Fitur Baru: Keuangan & Sekretaris)
router.post('/auto-archive', authMiddleware, role(['admin', 'super_admin']), upload.single('file'), autoArchiveDocument);

module.exports = router;
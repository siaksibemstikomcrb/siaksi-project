const express = require('express');
const router = express.Router();
const { authMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 
const { 
    getMyProfile, 
    updatePhoto, 
    changePassword, 
    getUsers,     // <-- Tambahan baru
    deleteUser,
    resetUserPassword   // <-- Tambahan baru
} = require('../controllers/userController');

// --- Routes Pribadi (Member) ---
router.get('/me', authMiddleware, getMyProfile);
router.post('/photo', authMiddleware, upload.single('photo'), updatePhoto);
router.put('/password', authMiddleware, changePassword);
router.put('/:id/reset-password', authMiddleware, resetUserPassword);

// --- Routes Manajemen (Admin/Super Admin) ---
// GET /api/users -> Mengambil daftar anggota
router.get('/', authMiddleware, getUsers);

// DELETE /api/users/:id -> Menghapus anggota
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;
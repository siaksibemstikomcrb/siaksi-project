const express = require('express');
const router = express.Router();

// 1. IMPORT MIDDLEWARE (Gaya CommonJS)
const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 

// 2. IMPORT CONTROLLER USER BIASA
const { 
    getMyProfile, 
    updatePhoto, 
    changePassword, 
    getUsers,     
    deleteUser,
    resetUserPassword,
    createUser  
} = require('../controllers/userController');

// 3. IMPORT CONTROLLER BULK (YANG BARU)
const { uploadBulkUsers } = require('../controllers/BulkUserController');

// --- Routes Pribadi (Member) ---
router.get('/me', authMiddleware, getMyProfile);
router.post('/photo', authMiddleware, upload.single('photo'), updatePhoto);
router.put('/password', authMiddleware, changePassword);

// --- Routes Manajemen (Admin/Super Admin) ---

// Create User Manual
router.post('/', authMiddleware, adminMiddleware, createUser);

// IMPORT EXCEL (Route Baru)
// upload.single('file') -> Pastikan nama field di Postman/Frontend adalah "file"
router.post('/upload', authMiddleware, adminMiddleware, upload.single('file'), uploadBulkUsers);

// Reset Password Member
router.put('/:id/reset-password', authMiddleware, resetUserPassword);

// Get All Users
router.get('/', authMiddleware, getUsers);

// Delete User
router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;
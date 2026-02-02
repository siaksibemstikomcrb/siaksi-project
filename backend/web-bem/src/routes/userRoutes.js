const express = require('express');
const router = express.Router();

const { authMiddleware, adminMiddleware } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 

const { 
    getMyProfile, 
    updatePhoto, 
    changePassword, 
    getUsers,     
    deleteUser,
    resetUserPassword,
    createUser  
} = require('../controllers/userController');

const { uploadBulkUsers } = require('../controllers/BulkUserController');

router.get('/me', authMiddleware, getMyProfile);
router.post('/photo', authMiddleware, upload.single('photo'), updatePhoto);
router.put('/password', authMiddleware, changePassword);


router.post('/', authMiddleware, adminMiddleware, createUser);

router.post('/upload', authMiddleware, adminMiddleware, upload.single('file'), uploadBulkUsers);

router.put('/:id/reset-password', authMiddleware, resetUserPassword);

router.get('/', authMiddleware, getUsers);

router.delete('/:id', authMiddleware, deleteUser);

module.exports = router;
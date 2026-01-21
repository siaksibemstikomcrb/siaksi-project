const express = require('express');
const router = express.Router();

// 1. IMPORT MIDDLEWARE
const { authMiddleware, role } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 

// 2. IMPORT CONTROLLER
const { 
    getAllUKMs, 
    createUKM, 
    updateUKM, 
    deleteUKM,
    getMyProfile,       
    updateDescription,  
    updateLogo,
    updateContact,
    getUkmMembers,       // <--- Import Baru
    resetMemberPassword  // <--- Import Baru
} = require('../controllers/ukmController');

// --- DEFINISI RUTE ---

// Get All UKMs (Public/Authenticated General)
router.get('/', authMiddleware, getAllUKMs); 

// Profile UKM (Admin UKM)
router.get('/my-profile', authMiddleware, getMyProfile);

// Update Info UKM (Admin UKM & Super Admin)
router.put('/update-desc', authMiddleware, role(['admin', 'super_admin']), updateDescription);
router.post('/update-logo', authMiddleware, role(['admin', 'super_admin']), upload.single('logo'), updateLogo);
router.put('/update-contact', authMiddleware, role(['admin', 'super_admin']), updateContact);

// --- MEMBER MANAGEMENT (Fitur Baru) ---
// Admin hanya bisa lihat dan edit member UKM-nya sendiri
router.get('/members', authMiddleware, role(['admin']), getUkmMembers);
router.put('/members/:userId/reset-password', authMiddleware, role(['admin']), resetMemberPassword);


// CRUD UKM (Khusus Superadmin)
router.post('/', authMiddleware, role(['super_admin']), createUKM);
router.put('/:id', authMiddleware, role(['super_admin']), updateUKM);
router.delete('/:id', authMiddleware, role(['super_admin']), deleteUKM);

module.exports = router;
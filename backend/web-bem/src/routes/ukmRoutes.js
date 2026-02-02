const express = require('express');
const router = express.Router();
const { authMiddleware, role } = require('../middleware/authMiddleware');
const upload = require('../middleware/upload'); 

const { 
    getAllUKMs, 
    createUKM, 
    updateUKM, 
    deleteUKM,
    getMyProfile,       
    updateDescription,  
    updateLogo,
    updateContact,
    getUkmMembers,
    resetMemberPassword
} = require('../controllers/ukmController');

router.get('/', authMiddleware, getAllUKMs); 
router.get('/my-profile', authMiddleware, getMyProfile);
router.put('/update-desc', authMiddleware, role(['admin', 'super_admin']), updateDescription);
router.post('/update-logo', authMiddleware, role(['admin', 'super_admin']), upload.single('logo'), updateLogo);
router.put('/update-contact', authMiddleware, role(['admin', 'super_admin']), updateContact);
router.get('/members', authMiddleware, role(['admin']), getUkmMembers);
router.put('/members/:userId/reset-password', authMiddleware, role(['admin']), resetMemberPassword);
router.post('/', authMiddleware, role(['super_admin']), createUKM);
router.put('/:id', authMiddleware, role(['super_admin']), updateUKM);
router.delete('/:id', authMiddleware, role(['super_admin']), deleteUKM);

module.exports = router;
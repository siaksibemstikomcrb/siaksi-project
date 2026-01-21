const express = require('express');
const router = express.Router();
const multer = require('multer');
const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const { authMiddleware, role } = require('../middleware/authMiddleware');
const { sendMail, getInbox, getPendingBroadcasts, approveBroadcast, getUkmList } = require('../controllers/mailController');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        // Dokumen = RAW, Gambar = IMAGE (auto)
        const type = ['pdf','doc','docx','xls','xlsx','zip'].includes(ext) ? 'raw' : 'auto';
        return {
            folder: 'siaksi-info',
            resource_type: type,
            public_id: Date.now() + '-' + file.originalname.replace(/\s+/g, '-'),
        };
    },
});
const upload = multer({ storage });

// --- ROUTES ---
router.get('/ukm-list', authMiddleware, getUkmList);
router.post('/send', authMiddleware, upload.single('attachment'), sendMail);
router.get('/inbox', authMiddleware, getInbox);

// Khusus Super Admin
router.get('/pending', authMiddleware, role(['super_admin']), getPendingBroadcasts);
router.put('/approval', authMiddleware, role(['super_admin']), approveBroadcast);

module.exports = router;
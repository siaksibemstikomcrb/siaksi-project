const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        
        const originalName = path.parse(file.originalname).name;
        const safeName = originalName.replace(/[^a-zA-Z0-9]/g, '_'); 

        let resourceType = 'auto'; 
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'pdf'].includes(ext)) {
            resourceType = 'raw';
        }

        return {
            folder: 'siaksi-uploads', 
            resource_type: resourceType,
            public_id: Date.now() + '_' + safeName, 
        };
    },
});

const fileFilter = (req, file, cb) => {
    console.log(`[UPLOAD CHECK] File: ${file.originalname} | Tipe: ${file.mimetype}`);

    const allowedMimeTypes = [
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-powerpoint', 
        'application/vnd.openxmlformats-officedocument.presentationml.presentation',
        
        'application/zip', 
        'application/x-zip-compressed',
        'application/x-rar-compressed', 
        'application/vnd.rar',
        
        'application/octet-stream' 
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        console.log(`❌ DITOLAK: Tipe ${file.mimetype} tidak ada di whitelist.`);
        cb(null, false); 
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = upload;
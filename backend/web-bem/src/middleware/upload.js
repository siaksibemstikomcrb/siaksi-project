const multer = require('multer');
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const cloudinary = require('cloudinary').v2;
const path = require('path');

// 1. Config Cloudinary
cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET
});

// 2. Storage Engine
const storage = new CloudinaryStorage({
    cloudinary: cloudinary,
    params: async (req, file) => {
        const ext = file.originalname.split('.').pop().toLowerCase();
        
        // --- 1. BERSIHKAN NAMA FILE (Sanitasi) ---
        // Ganti spasi/kurung dengan underscore (_), buang karakter aneh
        const originalName = path.parse(file.originalname).name;
        const safeName = originalName.replace(/[^a-zA-Z0-9]/g, '_'); 

        let resourceType = 'auto'; 
        if (['doc', 'docx', 'xls', 'xlsx', 'ppt', 'pptx', 'zip', 'rar', 'pdf'].includes(ext)) {
            resourceType = 'raw';
        }

        return {
            folder: 'siaksi-uploads', 
            resource_type: resourceType,
            // --- 2. GUNAKAN NAMA BERSIH ---
            public_id: Date.now() + '_' + safeName, 
        };
    },
});

// 3. Filter File (Disini Kuncinya!)
const fileFilter = (req, file, cb) => {
    // Debugging: Lihat tipe file di terminal backend
    console.log(`[UPLOAD CHECK] File: ${file.originalname} | Tipe: ${file.mimetype}`);

    const allowedMimeTypes = [
        // Gambar
        'image/jpeg', 'image/png', 'image/gif', 'image/webp',
        
        // Dokumen Office
        'application/pdf',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document', // docx
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet', // xlsx
        'application/vnd.ms-powerpoint', 
        'application/vnd.openxmlformats-officedocument.presentationml.presentation', // pptx
        
        // Arsip
        'application/zip', 
        'application/x-zip-compressed',
        'application/x-rar-compressed', 
        'application/vnd.rar',
        
        // --- JURUS PAMUNGKAS ---
        // Banyak file (RAR, ZIP, DOCX, dll) terdeteksi sebagai ini oleh sistem operasi
        'application/octet-stream' 
    ];

    if (allowedMimeTypes.includes(file.mimetype)) {
        cb(null, true); // Lolos
    } else {
        console.log(`❌ DITOLAK: Tipe ${file.mimetype} tidak ada di whitelist.`);
        // Return null, false agar controller menangkapnya sebagai "File Kosong"
        cb(null, false); 
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // Maksimal 10MB
    }
});

module.exports = upload;
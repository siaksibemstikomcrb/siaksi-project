const cloudinary = require('cloudinary').v2;
const { CloudinaryStorage } = require('multer-storage-cloudinary');
const path = require('path');

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

const storage = new CloudinaryStorage({
  cloudinary: cloudinary,
  params: async (req, file) => {
    console.log(`[UPLOAD] Memproses file: ${file.originalname} (${file.mimetype})`);
    const fileExt = path.extname(file.originalname).toLowerCase(); 
    const fileName = path.basename(file.originalname, fileExt).replace(/[^a-z0-9]/gi, '_');
    const timestamp = Date.now();
    
    const isImage = file.mimetype.startsWith('image/');

    if (isImage) {
      console.log(`[UPLOAD] Tipe: GAMBAR`);
      return {
        folder: 'siaksi_posts',
        resource_type: 'image',
        public_id: `${fileName}-${timestamp}`, 
        transformation: [{ width: 1000, crop: "limit" }]
      };
    } else {
      const finalPublicId = `${fileName}-${timestamp}${fileExt}`;
      console.log(`[UPLOAD] Tipe: RAW/DOKUMEN -> Public ID: ${finalPublicId}`);
      
      return {
        folder: 'siaksi_documents',
        resource_type: 'raw',       
        public_id: finalPublicId,
        use_filename: false,
        unique_filename: false
      };
    }
  },
});

module.exports = { cloudinary, storage };
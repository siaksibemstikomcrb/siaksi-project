const db = require('../config/db');

// MODIFIKASI: Support Upload BANYAK File
const uploadDocument = async (req, res) => {
    try {
        // req.files (ARRAY) bukan req.file (SINGLE)
        if (!req.files || req.files.length === 0) {
            return res.status(400).json({ msg: "Tidak ada file yang diupload!" });
        }

        const { folder_id } = req.body;
        const ukm_id = req.user.ukm_id;
        const uploaded_by = req.user.id;
        const targetFolder = folder_id && folder_id !== 'null' ? folder_id : null;

        const uploadedFiles = [];

        // Loop setiap file yang diupload
        for (const file of req.files) {
            const file_path = file.path; // URL Cloudinary
            const file_type = file.originalname.split('.').pop().toLowerCase();
            const title = file.originalname; // Pakai nama file asli sebagai judul default

            const result = await db.query(
                `INSERT INTO documents (ukm_id, uploaded_by, title, folder_id, category, file_path, file_type)
                 VALUES ($1, $2, $3, $4, 'General', $5, $6) RETURNING *`,
                [ukm_id, uploaded_by, title, targetFolder, file_path, file_type]
            );
            uploadedFiles.push(result.rows[0]);
        }

        res.json({ msg: `${uploadedFiles.length} File berhasil diupload!`, data: uploadedFiles });

    } catch (err) {
        console.error("Upload Error:", err);
        res.status(500).send("Server Error saat upload.");
    }
};

const autoArchiveDocument = async (req, res) => {
    const { title, category } = req.body;
    const ukm_id = req.user.ukm_id; // Dari Token JWT
    const uploadedBy = req.user.id;
    const file = req.file; // Dari Multer/Cloudinary Middleware

    if (!file) return res.status(400).json({ msg: 'File PDF gagal digenerate.' });

    try {
        await db.query('BEGIN');

        // 1. CEK APAKAH FOLDER TUJUAN SUDAH ADA?
        let folderQuery = `SELECT id FROM Folders WHERE ukm_id = $1 AND name ILIKE $2`;
        let folderRes = await db.query(folderQuery, [ukm_id, category]);
        let folderId;

        if (folderRes.rows.length > 0) {
            // Folder sudah ada
            folderId = folderRes.rows[0].id;
        } else {
            // Folder belum ada, BUAT BARU OTOMATIS
            const createFolderQuery = `
                INSERT INTO Folders (name, ukm_id, created_at) 
                VALUES ($1, $2, NOW()) 
                RETURNING id
            `;
            const newFolder = await db.query(createFolderQuery, [category, ukm_id]);
            folderId = newFolder.rows[0].id;
        }

        // 2. SIMPAN DOKUMEN KE DALAM FOLDER TERSEBUT
        // Asumsi req.file.path adalah URL Cloudinary atau path lokal
        const docQuery = `
            INSERT INTO Documents (
                ukm_id, uploaded_by, title, category, file_path, file_type, folder_id, created_at
            ) VALUES ($1, $2, $3, $4, $5, 'pdf', $6, NOW())
            RETURNING *
        `;

        const newDoc = await db.query(docQuery, [
            ukm_id, 
            uploadedBy, 
            title, 
            'Auto-Generated', // Category internal
            file.path, // URL dari Cloudinary
            folderId   // Masuk ke folder otomatis
        ]);

        await db.query('COMMIT');
        res.json({ msg: 'Berhasil diarsipkan!', data: newDoc.rows[0] });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error("Auto Archive Error:", err.message);
        res.status(500).json({ msg: "Gagal mengarsipkan dokumen." });
    }
};

// HAPUS DOKUMEN (Sama seperti sebelumnya, cuma copas biar lengkap)
const deleteDocument = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM documents WHERE id = $1 AND ukm_id = $2", [id, req.user.ukm_id]);
        res.json({ msg: "File dihapus." });
    } catch (err) { res.status(500).send("Err"); }
};

module.exports = { uploadDocument, deleteDocument, autoArchiveDocument }; // getDocuments tidak dipakai lagi diganti getFolderContent
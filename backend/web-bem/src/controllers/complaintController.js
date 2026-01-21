const db = require('../config/db');

// 1. Buat Aduan (Untuk User / Member / Admin UKM)
const createComplaint = async (req, res) => {
    const { subject, message } = req.body;
    const user_id = req.user.id; // Dari token
    const file = req.file; // Dari Multer (gambar)

    try {
        let screenshotUrl = null;
        if (file) {
            // Simpan path gambar. Sesuaikan jika pakai Cloudinary atau Local
            screenshotUrl = file.path; 
        }

        const query = `
            INSERT INTO complaints (user_id, subject, message, screenshot_url)
            VALUES ($1, $2, $3, $4)
            RETURNING id
        `;
        
        await db.query(query, [user_id, subject, message, screenshotUrl]);

        res.status(201).json({ msg: 'Laporan Anda telah dikirim ke BEM. Terima kasih atas masukannya!' });

    } catch (err) {
        console.error("Error Create Complaint:", err.message);
        res.status(500).send('Server Error');
    }
};

// 2. Lihat Semua Aduan (KHUSUS SUPER ADMIN)
const getAllComplaints = async (req, res) => {
    try {
        // Kita join dengan tabel Users untuk tahu siapa pelapornya
        const query = `
            SELECT c.*, u.name as reporter_name, u.username, uk.ukm_name
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN ukms uk ON u.ukm_id = uk.id
            ORDER BY c.created_at DESC
        `;
        
        const result = await db.query(query);

        res.json({
            status: 'success',
            data: result.rows
        });

    } catch (err) {
        console.error("Error Get Complaints:", err.message);
        res.status(500).send('Server Error');
    }
};

// 3. Update Status (Misal ditandai sudah dibaca/selesai)
const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body; // 'read' atau 'resolved'

    try {
        await db.query('UPDATE complaints SET status = $1 WHERE id = $2', [status, id]);
        res.json({ msg: 'Status laporan diperbarui.' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

module.exports = { createComplaint, getAllComplaints, updateStatus };
const db = require('../config/db');

const createComplaint = async (req, res) => {
    try {
        const { subject, message } = req.body;
        const user_id = req.user.id;
        
        // Cek req.file dulu sebelum akses path
        let screenshotUrl = null;
        if (req.file) {
            screenshotUrl = req.file.path; // URL dari Cloudinary
        }

        const query = `
            INSERT INTO complaints (user_id, subject, message, screenshot_url)
            VALUES ($1, $2, $3, $4)
            RETURNING *
        `;
        
        const newComplaint = await db.query(query, [user_id, subject, message, screenshotUrl]);

        res.status(201).json({ 
            msg: 'Laporan Anda telah dikirim ke BEM. Terima kasih atas masukannya!',
            data: newComplaint.rows[0]
        });

    } catch (err) {
        console.error("Error Create Complaint:", err.message);
        res.status(500).json({ msg: 'Gagal mengirim laporan. Coba lagi nanti.' });
    }
};

const getAllComplaints = async (req, res) => {
    try {
        const query = `
            SELECT c.*, u.name as reporter_name, u.username, uk.ukm_name
            FROM complaints c
            JOIN users u ON c.user_id = u.id
            LEFT JOIN ukms uk ON u.ukm_id = uk.id
            ORDER BY c.created_at DESC
        `;
        const result = await db.query(query);
        res.json({ status: 'success', data: result.rows });
    } catch (err) { res.status(500).send('Server Error'); }
};

// 2. [BARU] Get My Complaints (Untuk User)
const getMyComplaints = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT * FROM complaints 
            WHERE user_id = $1 
            ORDER BY created_at DESC
        `;
        const result = await db.query(query, [userId]);
        res.json({ status: 'success', data: result.rows });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 3. [UPDATE] Respond / Update Status (Untuk Admin)
const respondToComplaint = async (req, res) => {
    const { id } = req.params;
    const { response_message } = req.body; // Pesan dari admin
    
    // Cek ada file lampiran dari admin gak?
    let adminAttachment = null;
    if (req.file) {
        adminAttachment = req.file.path;
    }

    try {
        const query = `
            UPDATE complaints 
            SET 
                status = 'resolved', 
                admin_response = $1, 
                admin_attachment = $2,
                responded_at = NOW()
            WHERE id = $3
            RETURNING *
        `;
        
        const result = await db.query(query, [response_message, adminAttachment, id]);
        
        if (result.rows.length === 0) return res.status(404).json({msg: "Laporan tidak ditemukan"});

        res.json({ msg: 'Laporan berhasil ditanggapi & diselesaikan.', data: result.rows[0] });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const updateStatus = async (req, res) => {
    const { id } = req.params;
    const { status } = req.body;

    try {
        await db.query('UPDATE complaints SET status = $1 WHERE id = $2', [status, id]);
        res.json({ msg: 'Status laporan diperbarui.' });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};



module.exports = { createComplaint, getAllComplaints, updateStatus, respondToComplaint, getMyComplaints };
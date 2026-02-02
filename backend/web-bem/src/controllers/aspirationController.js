const db = require('../config/db');

const createAspiration = async (req, res) => {
    const { subject, message, target } = req.body;
    
    
    const my_ukm_id = req.user.ukm_id; 
    const file = req.file;

    try {
        let destinationUkmId = null;

        if (target === 'ukm') {
            if (!my_ukm_id) {
                return res.status(400).json({ msg: 'Anda belum tergabung dalam UKM manapun.' });
            }
            destinationUkmId = my_ukm_id;
        } else if (target === 'bem') {
            destinationUkmId = null;
        } else {
            return res.status(400).json({ msg: 'Tujuan aspirasi tidak valid.' });
        }

        let imageUrl = null;
        if (file) imageUrl = file.path;

        const query = `
            INSERT INTO aspirations (user_id, ukm_id, subject, message, image_url)
            VALUES ($1, $2, $3, $4, $5)
        `;
        
        await db.query(query, [null, destinationUkmId, subject, message, imageUrl]);

        res.status(201).json({ msg: 'Aspirasi Anda berhasil dikirim secara anonim!' });

    } catch (err) {
        console.error("Error Create Aspiration:", err.message);
        res.status(500).send('Server Error');
    }
};

const getAspirations = async (req, res) => {
    const role = req.user.role;
    const ukm_id = req.user.ukm_id;

    try {
        let query = '';
        let params = [];

        if (role === 'super_admin') {
            query = `
                SELECT id, subject, message, image_url, created_at, 'Mahasiswa Anonim' as sender_alias
                FROM aspirations 
                WHERE ukm_id IS NULL 
                ORDER BY created_at DESC
            `;
        } else if (role === 'admin') {
            query = `
                SELECT id, subject, message, image_url, created_at, 'Anggota Anonim' as sender_alias
                FROM aspirations 
                WHERE ukm_id = $1 
                ORDER BY created_at DESC
            `;
            params = [ukm_id];
        } else {
            return res.status(403).json({ msg: 'Akses ditolak' });
        }
        
        const result = await db.query(query, params);

        res.json({
            status: 'success',
            data: result.rows
        });

    } catch (err) {
        console.error("Error Get Aspirations:", err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = { createAspiration, getAspirations };
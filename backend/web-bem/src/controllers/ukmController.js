const db = require('../config/db');
const bcrypt = require('bcrypt');

const createUKM = async (req, res) => {
    const { ukm_name, leader_name, description } = req.body;
    try {
        console.log("Data masuk ke Backend:", req.body);
        await db.query(
            'INSERT INTO UKMs (ukm_name, leader_name, description) VALUES ($1, $2, $3)',
            [ukm_name, leader_name, description]
        );
        res.json({ msg: 'Organisasi berhasil ditambahkan!' });
    } catch (err) {
        console.error("SQL ERROR DETAIL:", err.message); 
        res.status(500).json({ msg: 'Server Error', error: err.message });
    }
};

const getGlobalStats = async (req, res) => {
    try {
        const ukmCount = await db.query('SELECT COUNT(*) FROM UKMs');
        const userCount = await db.query('SELECT COUNT(*) FROM Users WHERE role_id = 3');
        
        res.json({
            total_ukm: ukmCount.rows[0].count,
            total_member: userCount.rows[0].count
        });
    } catch (err) {
        res.status(500).send('Server Error');
    }
};
const updateUKM = async (req, res) => {
    const { id } = req.params;
    const { ukm_name, leader_name, description } = req.body;
    try {
        await db.query(
            'UPDATE UKMs SET ukm_name = $1, leader_name = $2, description = $3 WHERE id = $4',
            [ukm_name, leader_name, description, id]
        );
        res.json({ msg: 'Data Organisasi berhasil diperbarui!' });
    } catch (err) {
        res.status(500).send('Server Error saat update UKM');
    }
};

const deleteUKM = async (req, res) => {
    const { id } = req.params;

    try {
        await db.query("DELETE FROM users WHERE ukm_id = $1", [id]);

        await db.query("DELETE FROM schedules WHERE ukm_id = $1", [id]);

        const result = await db.query("DELETE FROM ukms WHERE id = $1 RETURNING *", [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: "UKM tidak ditemukan." });
        }

        res.json({ msg: `UKM '${result.rows[0].ukm_name}' dan seluruh anggotanya berhasil dihapus.` });

    } catch (err) {
        console.error("Error Delete UKM:", err.message);
        if (err.code === '23503') {
            return res.status(400).json({ msg: "Gagal hapus: Masih ada data terkait (Dokumen/Postingan) yang harus dibersihkan dulu." });
        }
        res.status(500).send('Server Error saat menghapus UKM.');
    }
};

const getMyProfile = async (req, res) => {
    const ukm_id = req.user.ukm_id;

    if (!ukm_id) return res.status(404).json({ msg: 'User tidak memiliki UKM.' });

    try {
        const ukmQuery = await db.query('SELECT * FROM Ukms WHERE id = $1', [ukm_id]);
        if (ukmQuery.rows.length === 0) return res.status(404).json({ msg: 'UKM tidak ditemukan' });

        const memberCount = await db.query('SELECT COUNT(*) FROM Users WHERE ukm_id = $1 AND role_id = 3', [ukm_id]);
        const eventCount = await db.query('SELECT COUNT(*) FROM Schedules WHERE ukm_id = $1', [ukm_id]);

        const recentEvents = await db.query(`
            SELECT id, event_name AS title, start_time, description 
            FROM Schedules 
            WHERE ukm_id = $1 
            ORDER BY start_time DESC 
            LIMIT 3
        `, [ukm_id]);

        const members = await db.query(`
            SELECT id, username 
            FROM Users 
            WHERE ukm_id = $1 AND role_id = 3 
            LIMIT 5
        `, [ukm_id]);

        res.json({
            ukm: ukmQuery.rows[0],
            stats: {
                members: parseInt(memberCount.rows[0].count),
                events: parseInt(eventCount.rows[0].count)
            },
            recent_events: recentEvents.rows,
            members: members.rows
        });

    } catch (err) {
        console.error("Error Get Profile:", err.message);
        res.status(500).send('Server Error');
    }
};

const updateDescription = async (req, res) => {
    const { description } = req.body;
    const ukm_id = req.user.ukm_id;

    try {
        await db.query('UPDATE Ukms SET description = $1 WHERE id = $2', [description, ukm_id]);
        res.json({ msg: 'Deskripsi berhasil diupdate' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const updateLogo = async (req, res) => {
    const ukm_id = req.user.ukm_id;
    const file = req.file;

    if (!file) return res.status(400).json({ msg: 'No file uploaded' });

    try {
        
        const logoUrl = file.path;

        await db.query('UPDATE Ukms SET logo_url = $1 WHERE id = $2', [logoUrl, ukm_id]);
        
        res.json({ msg: 'Logo updated', logo_url: logoUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const getAllUKMs = async (req, res) => {
    try {
        const result = await db.query('SELECT * FROM UKMs ORDER BY ukm_name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error saat mengambil daftar UKM');
    }
};

const updateContact = async (req, res) => {
    const { contact_email, contact_phone } = req.body;
    const ukm_id = req.user.ukm_id;

    try {
        await db.query(
            'UPDATE Ukms SET contact_email = $1, contact_phone = $2 WHERE id = $3',
            [contact_email, contact_phone, ukm_id]
        );
        res.json({ msg: 'Informasi kontak berhasil diperbarui!' });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

const getUkmMembers = async (req, res) => {
    const ukm_id = req.user.ukm_id;

    try {
        const query = `
            SELECT id, nia, username, name, email, created_at
            FROM Users 
            WHERE ukm_id = $1 AND role_id = 3
            ORDER BY nia ASC
        `;
        
        const result = await db.query(query, [ukm_id]);

        res.json({
            status: 'success',
            data: result.rows
        });
    } catch (err) {
        console.error("Error Get Members:", err.message);
        res.status(500).send('Server Error');
    }
};

const resetMemberPassword = async (req, res) => {
    const { userId } = req.params; 
    const ukm_id = req.user.ukm_id; 

    try {
        const defaultPass = '123456';
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(defaultPass, salt);

        const query = `
            UPDATE Users 
            SET password_hash = $1 
            WHERE id = $2 AND ukm_id = $3 AND role_id = 3
            RETURNING id, username
        `;

        const result = await db.query(query, [hashedPassword, userId, ukm_id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ msg: 'User tidak ditemukan atau bukan anggota UKM Anda.' });
        }

        res.json({
            status: 'success',
            msg: `Password untuk user ${result.rows[0].username} berhasil direset menjadi '${defaultPass}'`
        });

    } catch (err) {
        console.error("Error Reset Password:", err.message);
        res.status(500).send('Server Error');
    }
};



module.exports = { createUKM, getGlobalStats, updateUKM, deleteUKM, getAllUKMs, getMyProfile, updateDescription, updateLogo, updateContact, getUkmMembers, resetMemberPassword };
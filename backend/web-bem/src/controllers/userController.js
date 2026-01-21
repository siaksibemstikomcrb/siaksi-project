const db = require('../config/db');
const bcrypt = require('bcryptjs');

// 1. GET MY PROFILE
const getMyProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        // Ambil data user
        const userQuery = await db.query(`
            SELECT u.id, u.username, u.profile_pic, r.role_name, k.ukm_name
            FROM Users u
            LEFT JOIN Roles r ON u.role_id = r.id
            LEFT JOIN Ukms k ON u.ukm_id = k.id
            WHERE u.id = $1
        `, [userId]);

        if (userQuery.rows.length === 0) return res.status(404).json({ msg: 'User tidak ditemukan' });

        // Hitung Statistik Absen (Fallback aman jika tabel belum siap)
        let attendanceCount = 0;
        try {
            const attResult = await db.query(
                "SELECT COUNT(*) FROM attendances WHERE user_id = $1 AND status ILIKE 'Hadir'", 
                [userId]
            );
            attendanceCount = parseInt(attResult.rows[0].count);
        } catch (error) {
            console.warn("Tabel attendances belum siap atau error query:", error.message);
        }

        res.json({
            user: userQuery.rows[0],
            stats: { attendance: attendanceCount }
        });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 2. UPDATE FOTO PROFIL
const updatePhoto = async (req, res) => {
    const userId = req.user.id;
    const file = req.file;

    if (!file) return res.status(400).json({ msg: 'No file uploaded' });

    try {
        const photoUrl = file.path; 
        await db.query('UPDATE Users SET profile_pic = $1 WHERE id = $2', [photoUrl, userId]);
        res.json({ msg: 'Foto profil berhasil diperbarui', profile_pic: photoUrl });
    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

// 3. GANTI PASSWORD
const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        // A. Ambil password_hash dari DB
        const userCheck = await db.query('SELECT password_hash FROM Users WHERE id = $1', [userId]);
        
        if (userCheck.rows.length === 0) return res.status(404).json({ msg: 'User tidak ditemukan' });

        // B. Bandingkan password lama user dengan hash di DB
        const validPassword = await bcrypt.compare(currentPassword, userCheck.rows[0].password_hash);

        if (!validPassword) return res.status(400).json({ msg: 'Password lama salah!' });

        // C. Hash password baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // D. Update kolom password_hash
        await db.query('UPDATE Users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);
        
        res.json({ msg: 'Password berhasil diubah!' });
    } catch (err) {
        console.error("Error Change Password:", err.message);
        res.status(500).send('Server Error');
    }
};

// 4. GET ALL USERS (Manajemen Anggota)
const getUsers = async (req, res) => {
    try {
        const { ukm_id, role } = req.user; // Dari Token JWT

        let query = `
            SELECT u.id, u.name, u.nia, u.email, u.profile_pic, r.role_name, u.created_at
            FROM Users u
            JOIN Roles r ON u.role_id = r.id
        `;
        let params = [];

        // LOGIC FILTER:
        // Jika Super Admin: Lihat semua.
        // Jika selain Super Admin (misal Admin UKM): Hanya lihat anggota UKM-nya sendiri.
        if (role !== 'super_admin') {
            query += ` WHERE u.ukm_id = $1`;
            params.push(ukm_id);
        }

        query += ` ORDER BY u.created_at DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);

    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
};

// 5. DELETE USER (Tendang Anggota)
const deleteUser = async (req, res) => {
    try {
        const { id } = req.params; // ID user yang mau dihapus
        
        // Cek dulu user ini ada gak?
        const check = await db.query("SELECT * FROM Users WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ msg: "User tidak ditemukan" });

        // EKSEKUSI HAPUS
        await db.query("DELETE FROM Users WHERE id = $1", [id]);

        res.json({ msg: "User berhasil dihapus dari organisasi." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
};

const resetUserPassword = async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ msg: "Password minimal 6 karakter." });
        }

        // Hash Password Baru
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Update ke DB
        await db.query("UPDATE Users SET password_hash = $1 WHERE id = $2", [hashedPassword, id]);

        res.json({ msg: "Password berhasil direset." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
};

// Eksport SEMUA fungsi (termasuk yang baru)
module.exports = { 
    getMyProfile, 
    updatePhoto, 
    changePassword, 
    getUsers, 
    deleteUser,
    resetUserPassword
};
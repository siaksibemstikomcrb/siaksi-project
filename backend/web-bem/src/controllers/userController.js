const db = require('../config/db');
const bcrypt = require('bcryptjs');

const getMyProfile = async (req, res) => {
    const userId = req.user.id;

    try {
        const userQuery = await db.query(`
            SELECT u.id, u.username, u.profile_pic, u.name, u.email, u.nia, r.role_name, k.ukm_name
            FROM Users u
            LEFT JOIN Roles r ON u.role_id = r.id
            LEFT JOIN Ukms k ON u.ukm_id = k.id
            WHERE u.id = $1
        `, [userId]);

        if (userQuery.rows.length === 0) return res.status(404).json({ msg: 'User tidak ditemukan' });

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

const changePassword = async (req, res) => {
    const { currentPassword, newPassword } = req.body;
    const userId = req.user.id;

    try {
        const userCheck = await db.query('SELECT password_hash FROM Users WHERE id = $1', [userId]);

        if (userCheck.rows.length === 0) return res.status(404).json({ msg: 'User tidak ditemukan' });

        const validPassword = await bcrypt.compare(currentPassword, userCheck.rows[0].password_hash);

        if (!validPassword) return res.status(400).json({ msg: 'Password lama salah!' });

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query('UPDATE Users SET password_hash = $1 WHERE id = $2', [hashedPassword, userId]);

        res.json({ msg: 'Password berhasil diubah!' });
    } catch (err) {
        console.error("Error Change Password:", err.message);
        res.status(500).send('Server Error');
    }
};

const getUsers = async (req, res) => {
    try {
        const { ukm_id, role } = req.user;

        let query = `
            SELECT u.id, u.name, u.username, u.nia, u.email, u.profile_pic, r.role_name, u.created_at
            FROM Users u
            JOIN Roles r ON u.role_id = r.id
        `;
        let params = [];

        // Kalau bukan super_admin, PAKSA cuma ambil data UKM dia sendiri
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

const deleteUser = async (req, res) => {
    try {
        const { id } = req.params;
        const { role, ukm_id } = req.user;

        const check = await db.query("SELECT * FROM Users WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ msg: "User tidak ditemukan" });

        // Cegah Admin Hapus User UKM Lain (Back-end Security)
        if (role !== 'super_admin' && check.rows[0].ukm_id !== ukm_id) {
            return res.status(403).json({ msg: "Anda tidak berhak menghapus anggota UKM lain." });
        }

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
        const { role, ukm_id } = req.user;

        if (!newPassword || newPassword.length < 6) {
            return res.status(400).json({ msg: "Password minimal 6 karakter." });
        }

        // Cek dulu user-nya ada apa nggak
        const check = await db.query("SELECT ukm_id FROM Users WHERE id = $1", [id]);
        if (check.rows.length === 0) return res.status(404).json({ msg: "User tidak ditemukan." });

        // Cegah Admin Reset Password UKM Lain
        if (role !== 'super_admin' && check.rows[0].ukm_id !== ukm_id) {
            return res.status(403).json({ msg: "Anda tidak berhak mereset password anggota UKM lain." });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        await db.query("UPDATE Users SET password_hash = $1 WHERE id = $2", [hashedPassword, id]);

        res.json({ msg: "Password berhasil direset." });
    } catch (error) {
        console.error(error);
        res.status(500).json({ msg: error.message });
    }
};

const createUser = async (req, res) => {
    let { username, name, password, role_id, ukm_id, nia, email } = req.body;
    const reqRole = req.user.role;
    const reqUkmId = req.user.ukm_id;

    console.log("📥 [Create User] Data Masuk:", req.body);

    try {
        // KEAMANAN BACKEND: Jika yang request adalah Admin biasa, paksa ukm_id nya jadi milik admin itu.
        if (reqRole !== 'super_admin') {
            ukm_id = reqUkmId;

            // Cegah Admin biasa bikin akun Super Admin
            if (parseInt(role_id) === 1) {
                return res.status(403).json({ msg: "Anda tidak berhak membuat akun Super Admin." });
            }
        }

        let parsedUkmId = parseInt(ukm_id);
        if (isNaN(parsedUkmId) || parsedUkmId === 0) {
            console.log("⚠️ UKM ID kosong. Default set ke 9 (BEM).");
            ukm_id = 9;
        } else {
            ukm_id = parsedUkmId;
        }

        let parsedRoleId = parseInt(role_id);
        if (isNaN(parsedRoleId)) {
            return res.status(400).json({ msg: "Role Wajib Dipilih!" });
        }
        role_id = parsedRoleId;

        const userExist = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ msg: 'Username sudah digunakan!' });
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const newUser = await db.query(
            `INSERT INTO users (username, name, password_hash, role_id, ukm_id, nia, email, is_active) 
             VALUES ($1, $2, $3, $4, $5, $6, $7, true) RETURNING *`,
            [username, name, hashedPassword, role_id, ukm_id, nia, email]
        );

        res.json({ msg: "User Berhasil Ditambahkan", user: newUser.rows[0] });

    } catch (err) {
        console.error("🔥 [Gagal Create User]:", err.message);
        res.status(500).json({ msg: "Gagal membuat user: " + err.message });
    }
};

const updateProfile = async (req, res) => {
    try {
        const { name, email, nia } = req.body;
        const userId = req.user.id;

        const query = `
            UPDATE users 
            SET name = $1, email = $2, nia = $3
            WHERE id = $4
            RETURNING id, name, email, nia, profile_pic
        `;

        const { rows } = await db.query(query, [name, email, nia, userId]);

        if (rows.length === 0) {
            return res.status(404).json({ msg: "User tidak ditemukan" });
        }

        res.json({
            msg: "Profil berhasil diperbarui",
            user: rows[0]
        });

    } catch (err) {
        console.error(err.message);
        res.status(500).send("Server Error");
    }
};

module.exports = {
    getMyProfile,
    updatePhoto,
    changePassword,
    getUsers,
    deleteUser,
    resetUserPassword,
    createUser,
    updateProfile
};
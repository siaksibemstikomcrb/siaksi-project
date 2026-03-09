const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const register = async (req, res) => {
    let { username, name, password, role_id, ukm_id, nia, email } = req.body;

    try {
        if (!ukm_id || ukm_id === "") {
            ukm_id = 9;
        }

        role_id = parseInt(role_id);

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

        res.json({ msg: "Registrasi Berhasil", user: newUser.rows[0] });

    } catch (err) {
        console.error("Gagal Register:", err.message);
        res.status(500).send('Server Error');
    }
};

const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        const cleanUsername = username.trim().toLowerCase();

        // UBAHAN 1: Pakai TRIM() di database dan LEFT JOIN (biar kalau role_id gak ada, user tetep ketemu)
        const userResult = await db.query(
            'SELECT u.*, r.role_name FROM Users u LEFT JOIN Roles r ON u.role_id = r.id WHERE TRIM(LOWER(u.username)) = $1',
            [cleanUsername]
        );

        const user = userResult.rows[0];

        // UBAHAN 2: Pesan error dipecah biar ketahuan apanya yang salah
        if (!user) {
            return res.status(401).json({ msg: `Username '${cleanUsername}' TIDAK DITEMUKAN di database!` });
        }

        const cleanPassword = password.trim();
        const isMatch = await bcrypt.compare(cleanPassword, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ msg: `Password untuk '${cleanUsername}' SALAH!` });
        }

        const payload = {
            user: {
                id: user.id,
                // Kasih fallback kalau role_name kosong
                role: user.role_name || 'user',
                ukm_id: user.ukm_id,
            },
        };

        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;

                const cookieOptions = {
                    maxAge: 24 * 60 * 60 * 1000,
                    httpOnly: true,
                    secure: false,
                    sameSite: 'lax'
                };

                res.cookie('token', token, cookieOptions);

                res.json({
                    msg: "Login berhasil",
                    token: token,
                    user: {
                        id: user.id,
                        name: user.name,
                        username: user.username,
                        role: user.role_name || 'user',
                        ukm_id: user.ukm_id
                    }
                });
            }
        );

    } catch (err) {
        console.error("ERROR LOGIN:", err.message);
        res.status(500).send('Server Error');
    }
};

const logout = (req, res) => {
    // --- SAMAKAN DENGAN PENGATURAN LOGIN AGAR BISA CLEAR COOKIE ---
    res.clearCookie('token', {
        httpOnly: true,
        secure: false,
        sameSite: 'lax'
    });

    res.status(200).json({ msg: 'Logout berhasil' });
};

module.exports = { register, login, logout };
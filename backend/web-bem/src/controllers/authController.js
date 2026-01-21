const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// A. LOGIN
const login = async (req, res) => {
    const { username, password } = req.body;

    try {
        // 1. Cek User di Database
        const userResult = await db.query(
            'SELECT u.*, r.role_name FROM Users u JOIN Roles r ON u.role_id = r.id WHERE u.username = $1',
            [username]
        );

        const user = userResult.rows[0];

        if (!user) {
            return res.status(401).json({ msg: 'Kredensial tidak valid.' });
        }

        // 2. Cek Password
        const isMatch = await bcrypt.compare(password, user.password_hash);

        if (!isMatch) {
            return res.status(401).json({ msg: 'Kredensial tidak valid.' });
        }

        // 3. Buat Payload Token
        const payload = {
            user: {
                id: user.id,
                role: user.role_name,
                ukm_id: user.ukm_id, 
            },
        };

        // 4. Generate Token & Set Cookie
        jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: '24h' },
            (err, token) => {
                if (err) throw err;

                // --- SETTING COOKIE HTTP-ONLY ---
                const cookieOptions = {
                    expires: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 jam
                    httpOnly: true, // PENTING: Mencegah XSS (JS tidak bisa baca cookie ini)
                    secure: process.env.NODE_ENV === 'production', // Hanya HTTPS di production
                    sameSite: 'strict' // Mencegah CSRF
                };

                // Kirim Cookie ke Browser
                res.cookie('token', token, cookieOptions);

                // Kirim Response JSON (TANPA TOKEN di body)
                res.json({ 
                    msg: "Login berhasil",
                    user: { 
                        id: user.id, 
                        name: user.name, 
                        username: user.username,
                        role: user.role_name,
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

// B. LOGOUT (Fitur Baru)
const logout = (req, res) => {
    // Menghapus cookie 'token' dari browser
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    res.status(200).json({ msg: 'Logout berhasil' });
};

module.exports = { login, logout };
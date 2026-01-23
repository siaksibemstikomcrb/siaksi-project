const db = require('../config/db');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// A. REGISTER (Baru Ditambahkan untuk Fix Error Super Admin)
const register = async (req, res) => {
    // 1. Ambil data dari body
    let { username, name, password, role_id, ukm_id, nia, email } = req.body;

    try {
        // --- LOGIC PERBAIKAN: SUPER ADMIN ---
        // Jika ukm_id kosong ("") atau null, otomatis set ke ID 9 (BEM STIKOM CIREBON)
        // Karena kolom ukm_id di database bersifat NOT NULL (Wajib Isi)
        if (!ukm_id || ukm_id === "") {
            ukm_id = 9; 
        }

        // Pastikan role_id jadi angka integer
        role_id = parseInt(role_id);
        
        // 2. Cek apakah username sudah ada
        const userExist = await db.query('SELECT * FROM users WHERE username = $1', [username]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ msg: 'Username sudah digunakan!' });
        }

        // 3. Hash Password
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        // 4. Masukkan ke Database
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

// B. LOGIN
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
    { expiresIn: '1h' }, // 👈 UBAH DISINI: Ganti '24h' jadi '1h' (1 Jam) atau '30m'
    (err, token) => {
        if (err) throw err;

        const cookieOptions = {
            maxAge: 60 * 60 * 1000, 
            
            httpOnly: true, 
            secure: process.env.NODE_ENV === 'production', 
            sameSite: 'strict'
        };

                res.cookie('token', token, cookieOptions);

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

// C. LOGOUT
const logout = (req, res) => {
    res.clearCookie('token', {
        httpOnly: true,
        secure: process.env.NODE_ENV === 'production',
        sameSite: 'strict'
    });
    
    res.status(200).json({ msg: 'Logout berhasil' });
};

// Jangan lupa export 'register' juga
module.exports = { register, login, logout };
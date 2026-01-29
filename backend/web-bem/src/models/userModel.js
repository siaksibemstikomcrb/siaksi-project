const db = require('../config/db');

const UserModel = {
    // Cari User berdasarkan Username
    findByUsername: async (username) => {
        const query = 'SELECT * FROM users WHERE username = $1';
        const result = await db.query(query, [username]);
        return result.rows[0];
    },

    // Cari User berdasarkan ID
    findById: async (id) => {
        const query = 'SELECT id, name, username, role_id, ukm_id FROM users WHERE id = $1';
        const result = await db.query(query, [id]);
        return result.rows[0];
    },

    // Tambah User Baru (Single)
    create: async (data) => {
        const { name, username, nia, password_hash, role_id, ukm_id } = data;
        const query = `
            INSERT INTO users (name, username, nia, password_hash, role_id, ukm_id, is_active)
            VALUES ($1, $2, $3, $4, $5, $6, true)
            RETURNING id, name, username
        `;
        const result = await db.query(query, [name, username, nia, password_hash, role_id, ukm_id]);
        return result.rows[0];
    },

    // Cek apakah username sudah ada
    usernameExists: async (username) => {
        const query = 'SELECT id FROM users WHERE username = $1';
        const result = await db.query(query, [username]);
        return result.rows.length > 0;
    }
};

module.exports = UserModel;
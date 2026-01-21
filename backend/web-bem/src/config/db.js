// src/config/db.js
const { Pool } = require('pg');
require('dotenv').config();

const pool = new Pool({
    user: process.env.DB_USER,      // Ini untuk username (postgres)
    host: process.env.DB_HOST,      // Ini untuk host (localhost)
    database: process.env.DB_NAME,  // Ini untuk nama database (absensi_1)
    password: String(process.env.DB_PASSWORD), // Ini untuk password (110305)
    port: process.env.DB_PORT,      // Ini untuk port (5432)
});



// Helper untuk menjalankan query
const query = (text, params) => pool.query(text, params);

// Log saat berhasil terhubung
pool.on('connect', () => {
    console.log('✅ Koneksi dengan database BERHASIL!');
});

// Log saat gagal terhubung
pool.on('error', (err) => {
    console.error('❌ Gagal menghubungkan dengan database:', err);
    process.exit(-1);
});

module.exports = {
    query,
};
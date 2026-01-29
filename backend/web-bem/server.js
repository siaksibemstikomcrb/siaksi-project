const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { client: discordBot } = require('./src/discord/bot');

const cookieParser = require('cookie-parser'); 
require('dotenv').config();

// --- 1. INISIALISASI APP ---
const app = express();
const PORT = process.env.PORT || 5000;

require('./src/config/db');

// ?? PENTING: AGAR IP USER TERBACA ASLI (BUKAN IP NGINX/LOCALHOST)
// Ini solusi utama masalah "Satu ke-blokir, semua ke-logout"
app.set('trust proxy', 1);

// --- 2. SECURITY HEADER (Helmet) ---
app.use(helmet());

// --- 3. PARSING DATA ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 

// --- 4. RATE LIMITER (Anti Spam) ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 Menit
    max: 1000, // ?? NAIKKAN BATAS (Dari 100 jadi 1000) agar aman saat input data massal
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        msg: "Terlalu banyak request, coba lagi nanti."
    }
});
app.use(limiter);

app.use(cors({
    origin: [
        'http://localhost:5173',           // Untuk testing di laptop
        'http://127.0.0.1:5173',           // Untuk testing di laptop
        'http://145.79.15.166',            // IP VPS Sendiri
        'http://siaksi.stikompoltekcirebon.ac.id',  // ?? DOMAIN KAMPUS (HTTP)
        'https://siaksi.stikompoltekcirebon.ac.id'  // ?? DOMAIN KAMPUS (HTTPS - Jaga-jaga)
    ],
    credentials: true, // Wajib true agar Cookie token bisa lewat
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

// --- 6. STATIC FILES ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 7. ROUTING ---
app.get('/', (req, res) => {
    res.send('? SERVER SIAKSI BERJALAN LANCAR (STABIL)');
});

// Import Routes
app.use('/api/auth', require('./src/routes/authRoutes'));
app.use('/api/admin', require('./src/routes/adminRoutes'));
app.use('/api/users', require('./src/routes/userRoutes'));
app.use('/api/ukms', require('./src/routes/ukmRoutes')); 
app.use('/api/posts', require('./src/routes/postRoutes'));
app.use('/api/documents', require('./src/routes/documentRoutes'));
app.use('/api/mail', require('./src/routes/mailRoutes'));
app.use('/api/complaints', require('./src/routes/complaintRoutes'));
app.use('/api/aspirations', require('./src/routes/aspirationRoutes'));
app.use('/api/attendance', require('./src/routes/attendanceRoutes'));
app.use('/api/monitoring', require('./src/routes/monitoringRoutes'));
app.use('/api/notifications', require('./src/routes/notificationRoutes'));
app.use('/api/schedules', require('./src/routes/scheduleRoutes'));
app.use('/api/discord', require('./src/routes/discordRoutes'));

// --- 8. ERROR HANDLER ---
app.use((err, req, res, next) => {
    // Cek status code, default ke 500 jika tidak ada
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;

    // LOG ERROR DI SERVER (Hanya tampilkan Stack Trace kalau BUKAN Production)
    // Supaya log server bersih dan tidak mencatat data sensitif berlebihan
    if (process.env.NODE_ENV !== 'production') {
        console.error("?? ERROR STACK:", err.stack);
    } else {
        // Di Production, cukup log pesan errornya saja (hemat storage log)
        console.error(`?? ERROR [${statusCode}]: ${err.message}`);
    }

    res.status(statusCode).json({
        status: 'error',
        // Logic Anti Bocor ke User
        msg: process.env.NODE_ENV === 'production' 
            ? 'Terjadi kesalahan pada sistem. Silakan hubungi admin.' 
            : err.message
    });
});

// --- 9. START SERVER ---
app.listen(PORT , async () => {
   console.log(`?? Server running on port ${PORT}`);
   console.log(`?? Socket.io ready on port ${PORT}`);

   // NYALAKAN BOT DISCORD DISINI
   try {
        await discordBot.login(process.env.DISCORD_BOT_TOKEN);
   } catch (err) {
        console.error("Gagal login Discord Bot:", err.message);
   }
});
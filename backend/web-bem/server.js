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

// --- 2. SECURITY HEADER (Helmet) ---
app.use(helmet());

// --- 3. PARSING DATA ---
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 

// --- 4. RATE LIMITER (Anti Spam) ---
const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, 
    max: 100, 
    standardHeaders: true,
    legacyHeaders: false,
    message: {
        status: 429,
        msg: "Terlalu banyak request, coba lagi nanti."
    }
});
app.use(limiter);

// --- 5. CORS (Izin Akses Frontend) ---
app.use(cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173', 
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    credentials: true,
    allowedHeaders: ['Content-Type', 'Authorization', 'x-auth-token']
}));

// --- 6. STATIC FILES ---
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// --- 7. ROUTING ---
app.get('/', (req, res) => {
    res.send('✅ SERVER SIAKSI BERJALAN LANCAR (STABIL)');
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
    console.error("🔥 ERROR LOG:", err.stack);
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    res.status(statusCode).json({
        status: 'error',
        msg: process.env.NODE_ENV === 'production' 
            ? 'Terjadi kesalahan pada server.' 
            : err.message
    });
});

// --- 9. START SERVER ---
app.listen(PORT , async () => {
   console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📡 Socket.io ready on port ${PORT}`);

    // NYALAKAN BOT DISCORD DISINI
    try {
        await discordBot.login(process.env.DISCORD_BOT_TOKEN);
    } catch (err) {
        console.error("Gagal login Discord Bot:", err.message);
    }
});
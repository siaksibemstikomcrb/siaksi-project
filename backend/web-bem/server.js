const express = require('express');
const cors = require('cors');
const path = require('path');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const { client: discordBot } = require('./src/discord/bot');
const cookieParser = require('cookie-parser'); 
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;
require('./src/config/db');

app.set('trust proxy', 1);
app.use(helmet());
app.use(express.json()); 
app.use(express.urlencoded({ extended: true })); 
app.use(cookieParser()); 

const limiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    max: 1000,
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
        'http://localhost:5173',
        'http://127.0.0.1:5173',
        'http://145.79.15.166',
        'http://siaksi.stikompoltekcirebon.ac.id',
        'https://siaksi.stikompoltekcirebon.ac.id'
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.get('/', (req, res) => {
    res.send('? SERVER SIAKSI BERJALAN LANCAR (STABIL)');
});

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

app.use((err, req, res, next) => {
    const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    if (process.env.NODE_ENV !== 'production') {
        console.error("?? ERROR STACK:", err.stack);
    } else {
        console.error(`?? ERROR [${statusCode}]: ${err.message}`);
    }

        res.status(statusCode).json({
            status: 'error',
            msg: process.env.NODE_ENV === 'production' 
                ? 'Terjadi kesalahan pada sistem. Silakan hubungi admin.' 
                : err.message
        });
});

app.listen(PORT , async () => {
   console.log(`?? Server running on port ${PORT}`);
   console.log(`?? Socket.io ready on port ${PORT}`);

   try {
        await discordBot.login(process.env.DISCORD_BOT_TOKEN);
   } catch (err) {
        console.error("Gagal login Discord Bot:", err.message);
   }
});
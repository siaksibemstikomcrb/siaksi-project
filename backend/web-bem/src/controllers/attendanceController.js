const db = require('../config/db');

const getDistanceInMeters = (lat1, lon1, lat2, lon2) => {
    const R = 6371e3; 
    const toRad = (val) => val * Math.PI / 180;
    
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lon2 - lon1);
    
    const a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2);
              
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c; 
};

const toLocalDateString = (date) => {
    return new Date(date).toLocaleDateString('en-CA', { 
        timeZone: 'Asia/Jakarta' 
    });
};

const getJakartaTime = () => {
    return new Date().toLocaleTimeString('en-GB', { 
        hour12: false, 
        timeZone: 'Asia/Jakarta' 
    });
};

const submitAttendance = async (req, res) => {
    const { schedule_id, reason, latitude, longitude } = req.body;
    const user_id = req.user.id; 

    try {
        const check = await db.query('SELECT id FROM Attendances WHERE user_id = $1 AND schedule_id = $2', [user_id, schedule_id]);
        if (check.rows.length > 0) {
            return res.status(400).json({ msg: 'Anda sudah melakukan absensi untuk kegiatan ini.' });
        }

        const scheduleRes = await db.query('SELECT * FROM Schedules WHERE id = $1', [schedule_id]);
        if (scheduleRes.rows.length === 0) return res.status(404).json({ msg: 'Jadwal tidak ditemukan' });
        
        const schedule = scheduleRes.rows[0];
        const now = new Date();

        const currentDateStr = toLocalDateString(now);
        const eventDateStr = toLocalDateString(schedule.event_date);
        const currentTime = getJakartaTime();

        const isIzin = reason && reason.length > 3;
        let status = 'Hadir';
        let finalReason = reason || '';

        if (isIzin) {
            status = 'Izin';
            if (currentDateStr > eventDateStr) {
                 return res.status(400).json({ msg: 'Kegiatan sudah selesai, tidak bisa mengajukan izin.' });
            }
        } else {
            
            if (currentDateStr !== eventDateStr) {
                return res.status(400).json({ 
                    msg: `Gagal. Kegiatan dijadwalkan tanggal ${new Date(schedule.event_date).toLocaleDateString('id-ID', {timeZone: 'Asia/Jakarta'})}, sedangkan hari ini tanggal ${new Date().toLocaleDateString('id-ID', {timeZone: 'Asia/Jakarta'})}` 
                });
            }

            if (currentTime < schedule.attendance_open_time) {
                return res.status(400).json({ msg: `Presensi belum dibuka. Buka jam: ${schedule.attendance_open_time} WIB` });
            }

            if (schedule.latitude && schedule.longitude) {
                if (!latitude || !longitude) {
                    return res.status(400).json({ msg: 'Lokasi GPS wajib diaktifkan untuk Absensi Hadir.' });
                }

                const distance = getDistanceInMeters(latitude, longitude, schedule.latitude, schedule.longitude);
                const radius = schedule.radius_meters || 50; 
                
                if (distance > radius) {
                    return res.status(400).json({ 
                        msg: `Anda berada di luar lokasi. Jarak: ${Math.floor(distance)}m (Maks: ${radius}m).` 
                    });
                }
            }
        }

        const result = await db.query(
            `INSERT INTO Attendances (user_id, schedule_id, status, attendance_time, reason, latitude, longitude)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6) RETURNING *`,
            [user_id, schedule_id, status, finalReason, latitude, longitude]
        );

        res.json({ 
            status: 'success',
            msg: isIzin ? 'Izin berhasil dicatat.' : 'Presensi Hadir berhasil!', 
            data: result.rows[0] 
        });

    } catch (err) {
        console.error("Error Submit Attendance:", err.message);
        res.status(500).send('Server Error');
    }
};

const getMemberHistory = async (req, res) => {
    try {
        const targetUserId = req.params.userId || req.user.id; 

        const userRes = await db.query('SELECT id, name, nia, ukm_id FROM Users WHERE id = $1', [targetUserId]);
        if (userRes.rows.length === 0) {
            return res.status(404).json({ msg: 'User tidak ditemukan' });
        }
        
        const user = userRes.rows[0];

        const historyRes = await db.query(`
            SELECT 
                s.event_name, 
                s.event_date, 
                s.start_time,
                COALESCE(a.status, 'Alpa') as status,
                a.attendance_time, 
                a.reason
            FROM Schedules s
            LEFT JOIN Attendances a ON s.id = a.schedule_id AND a.user_id = $1
            WHERE s.ukm_id = $2 
              AND s.status != 'BATAL' 
              AND s.event_date <= CURRENT_DATE 
            ORDER BY s.event_date DESC, s.start_time DESC
        `, [targetUserId, user.ukm_id]);

        const formattedHistory = historyRes.rows.map(row => ({
            ...row,
            attendance_time: row.attendance_time 
                ? new Date(row.attendance_time).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'})
                : null,
            event_date: new Date(row.event_date).toLocaleDateString('id-ID', {
                weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
            })
        }));

        res.json({ user, history: formattedHistory });

    } catch (err) {
        console.error("Error getMemberHistory:", err.message);
        res.status(500).send('Server Error');
    }
};

const getAttendanceBySchedule = async (req, res) => {
    const { schedule_id } = req.params;
    try {
        const result = await db.query(`
            SELECT a.id, a.status, a.attendance_time, a.reason, a.latitude, a.longitude,
                   u.name, u.nia, u.id as user_id
            FROM Attendances a
            JOIN Users u ON a.user_id = u.id
            WHERE a.schedule_id = $1
            ORDER BY a.attendance_time ASC
        `, [schedule_id]);

        res.json(result.rows);
    } catch (err) {
        console.error("Error getAttendanceBySchedule:", err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    submitAttendance,
    getMemberHistory,
    getAttendanceBySchedule
};
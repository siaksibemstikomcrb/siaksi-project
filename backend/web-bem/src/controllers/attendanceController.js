const db = require('../config/db');

const getJakartaDate = () => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
};

const getJakartaDateString = (dateObj) => {
    return new Date(dateObj).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
};

const submitAttendance = async (req, res) => {
    const { schedule_id, reason, latitude, longitude } = req.body;
    const user_id = req.user.id; 

    try {
        const check = await db.query('SELECT id FROM Attendances WHERE user_id = $1 AND schedule_id = $2', [user_id, schedule_id]);
        if (check.rows.length > 0) return res.status(400).json({ msg: 'Anda sudah melakukan absensi.' });

        const scheduleRes = await db.query('SELECT * FROM Schedules WHERE id = $1', [schedule_id]);
        if (scheduleRes.rows.length === 0) return res.status(404).json({ msg: 'Jadwal tidak ditemukan' });
        
        const schedule = scheduleRes.rows[0];
        
        const nowJakarta = getJakartaDate();
        
        const eventDateStr = getJakartaDateString(schedule.event_date);

        const openTime = new Date(`${eventDateStr}T${schedule.attendance_open_time}`);
        const closeTime = new Date(`${eventDateStr}T${schedule.attendance_close_time}`);
        
        if (closeTime < openTime) {
            closeTime.setDate(closeTime.getDate() + 1);
        }

        const isIzin = reason && reason.length > 3;
        let status = 'Hadir';
        let finalReason = reason || '';

        if (isIzin) {
            status = 'Izin';
            if (nowJakarta > closeTime) {
                 return res.status(400).json({ msg: 'Kegiatan sudah selesai, terlambat untuk izin.' });
            }
        } else {
            if (nowJakarta < openTime) {
                return res.status(400).json({ msg: `Presensi belum dibuka. Buka jam: ${schedule.attendance_open_time} WIB` });
            }
            if (nowJakarta > closeTime) {
                return res.status(400).json({ msg: `Presensi sudah ditutup pada jam: ${schedule.attendance_close_time} WIB` });
            }

            if (schedule.latitude && schedule.longitude) {
                if (!latitude || !longitude) return res.status(400).json({ msg: 'Lokasi GPS wajib diaktifkan.' });

                const getDistance = (lat1, lon1, lat2, lon2) => {
                    const R = 6371e3; 
                    const toRad = x => x * Math.PI / 180;
                    const dLat = toRad(lat2 - lat1);
                    const dLon = toRad(lon2 - lon1);
                    const a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon/2) * Math.sin(dLon/2);
                    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                    return R * c;
                };

                const distance = getDistance(latitude, longitude, schedule.latitude, schedule.longitude);
                const radius = schedule.radius_meters || 50; 
                
                if (distance > radius) {
                    return res.status(400).json({ msg: `Di luar lokasi. Jarak: ${Math.floor(distance)}m (Maks: ${radius}m).` });
                }
            }
        }

        const result = await db.query(
            `INSERT INTO Attendances (user_id, schedule_id, status, attendance_time, reason, latitude, longitude)
             VALUES ($1, $2, $3, CURRENT_TIMESTAMP, $4, $5, $6) RETURNING *`,
            [user_id, schedule_id, status, finalReason, latitude, longitude]
        );

        res.json({ status: 'success', msg: isIzin ? 'Izin berhasil.' : 'Presensi berhasil!', data: result.rows[0] });

    } catch (err) {
        console.error("Submit Error:", err.message);
        res.status(500).send('Server Error');
    }
};

const getMemberHistory = async (req, res) => {
    try {
        const targetUserId = req.params.userId || req.user.id; 
        const userRes = await db.query('SELECT id, name, nia, ukm_id FROM Users WHERE id = $1', [targetUserId]);
        if (userRes.rows.length === 0) return res.status(404).json({ msg: 'User tidak ditemukan' });
        
        const user = userRes.rows[0];

        const historyRes = await db.query(`
            SELECT 
                s.id, s.event_name, s.event_date, s.start_time, s.end_time, s.attendance_close_time,
                a.status, a.attendance_time, a.reason
            FROM Schedules s
            LEFT JOIN Attendances a ON s.id = a.schedule_id AND a.user_id = $1
            WHERE s.ukm_id = $2 AND s.status != 'BATAL' 
            ORDER BY s.event_date DESC, s.start_time DESC
        `, [targetUserId, user.ukm_id]);

        const nowJakarta = getJakartaDate();
        
        const formattedHistory = historyRes.rows.map(row => {
            const eventDateStr = getJakartaDateString(row.event_date);
            const closeTime = new Date(`${eventDateStr}T${row.attendance_close_time}`);
            const startTime = new Date(`${eventDateStr}T${row.start_time}`);
            
            if (closeTime < startTime) closeTime.setDate(closeTime.getDate() + 1);

            let computedStatus = row.status;
            if (!computedStatus) {
                if (nowJakarta > closeTime) computedStatus = 'Alpa'; 
                else computedStatus = 'Belum Absen';
            }

            return {
                ...row,
                status: computedStatus,
                attendance_time: row.attendance_time ? new Date(row.attendance_time).toLocaleTimeString('id-ID', {hour: '2-digit', minute:'2-digit'}) : null,
                event_date: new Date(row.event_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })
            };
        });

        res.json({ user, history: formattedHistory });
    } catch (err) {
        console.error("History Error:", err.message);
        res.status(500).send('Server Error');
    }
};

const getAttendanceBySchedule = async (req, res) => {
    const { schedule_id } = req.params;
    try {
        const result = await db.query(`
            SELECT a.id, a.status, a.attendance_time, a.reason, a.latitude, a.longitude, u.name, u.nia, u.id as user_id
            FROM Attendances a JOIN Users u ON a.user_id = u.id WHERE a.schedule_id = $1 ORDER BY a.attendance_time ASC
        `, [schedule_id]);
        res.json(result.rows);
    } catch (err) { res.status(500).send('Server Error'); }
};

module.exports = { submitAttendance, getMemberHistory, getAttendanceBySchedule };
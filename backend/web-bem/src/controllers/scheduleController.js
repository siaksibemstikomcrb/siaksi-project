const db = require('../config/db');
const { sendNotification } = require('../utils/notificationHelper'); 

// Helper: Dapatkan Waktu Jakarta (Objek Date)
const getJakartaDate = () => {
    const now = new Date();
    return new Date(now.toLocaleString("en-US", { timeZone: "Asia/Jakarta" }));
};

// Helper: Ambil String Tanggal "YYYY-MM-DD" sesuai Jakarta (PENTING BIAR GAK MUNDUR SEHARI)
const getJakartaDateString = (dateObj) => {
    return new Date(dateObj).toLocaleDateString('en-CA', { timeZone: 'Asia/Jakarta' });
};

const createSchedule = async (req, res) => {
    console.log("\n========== MULAI CREATE SCHEDULE ==========");
    const { 
        event_name, description, location, event_date, 
        start_time, end_time, 
        attendance_open_time, attendance_close_time, 
        tolerance_minutes,
        latitude, longitude, radius_meters,
        meeting_link 
    } = req.body;
    
    const ukm_id = req.user.ukm_id; 
    const created_by = req.user.id;

    try {
        const result = await db.query(
            `INSERT INTO Schedules (
                ukm_id, created_by_user_id, event_name, description, location, event_date, 
                start_time, end_time, attendance_open_time, attendance_close_time, 
                tolerance_minutes, latitude, longitude, radius_meters, meeting_link, status
            ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, 'AKTIF') 
            RETURNING *`,
            [
                ukm_id, created_by, event_name, description, location, event_date, 
                start_time, end_time, attendance_open_time, attendance_close_time, 
                tolerance_minutes || 0, latitude, longitude, radius_meters || 50, meeting_link
            ]
        );

        if (typeof sendNotification === 'function') {
            sendNotification({
                title: `Kegiatan Baru: ${event_name}`, 
                message: `Segera cek jadwal kegiatan baru.`,
                type: 'event',
                target_type: 'ukm_only',
                target_ukm_id: ukm_id, 
                sender_id: created_by
            }).catch(err => console.log("Notif error (ignored):", err.message));
        }

        res.status(201).json({ msg: 'Jadwal berhasil dibuat!', data: result.rows[0] });

    } catch (err) {
        console.error("Create Schedule Error:", err.message);
        res.status(500).json({ msg: 'Gagal membuat jadwal', error: err.message });
    }
};

const getAllSchedules = async (req, res) => {
    const { ukm_id, role, id } = req.user;
    const { all } = req.query; 

    try {
        let query;
        let params = [];
        let baseCondition = "s.status != 'BATAL'";

        if (role === 'super_admin') {
            query = `SELECT s.* FROM Schedules s WHERE ${baseCondition} ORDER BY s.event_date DESC`;
        } else {
            query = `
                SELECT s.*, 
                (SELECT status FROM Attendances WHERE schedule_id = s.id AND user_id = $1 LIMIT 1) as my_status
                FROM Schedules s
                WHERE s.ukm_id = $2 AND ${baseCondition}
                ORDER BY s.event_date DESC
            `;
            params = [id, ukm_id];
        }

        const result = await db.query(query, params);
        
        // --- FILTERING DI JAVASCRIPT (ANTI-TIMEZONE BUG) ---
        const nowJakarta = getJakartaDate();
        
        const filteredSchedules = result.rows.filter(schedule => {
            if (all === 'true') return true;

            // FIX: Gunakan Helper getJakartaDateString agar tanggal tidak mundur ke UTC
            const eventDateStr = getJakartaDateString(schedule.event_date);
            
            const closeTime = new Date(`${eventDateStr}T${schedule.attendance_close_time}`);
            const startTime = new Date(`${eventDateStr}T${schedule.start_time}`);

            // Handle Lintas Hari
            if (closeTime < startTime) {
                closeTime.setDate(closeTime.getDate() + 1);
            }

            // Tampilkan jika BELUM lewat waktu tutup
            return nowJakarta <= closeTime;
        });

        // Mapping Status
        const schedulesWithStatus = filteredSchedules.map(schedule => {
            const eventDateStr = getJakartaDateString(schedule.event_date); // FIX DISINI JUGA
            const startFull = new Date(`${eventDateStr}T${schedule.start_time}`);
            const endFull   = new Date(`${eventDateStr}T${schedule.end_time}`);

            if (endFull < startFull) {
                endFull.setDate(endFull.getDate() + 1);
            }

            let computedStatus = 'upcoming';
            if (nowJakarta > endFull) computedStatus = 'completed';
            else if (nowJakarta >= startFull && nowJakarta <= endFull) computedStatus = 'ongoing';

            return { ...schedule, status_kegiatan: computedStatus };
        });

        res.json(schedulesWithStatus);
        
    } catch (err) {
        console.error("Get All Error:", err.message);
        res.status(500).json({ msg: "Server Error" });
    }
};

const getScheduleById = async (req, res) => {
    const { id } = req.params;
    try {
        const result = await db.query('SELECT * FROM Schedules WHERE id = $1', [id]);
        if (result.rows.length === 0) return res.status(404).json({ msg: 'Jadwal tidak ditemukan' });
        res.json(result.rows[0]);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

const updateSchedule = async (req, res) => {
    const { id } = req.params;
    const { 
        event_name, description, location, event_date, 
        start_time, end_time, attendance_open_time, attendance_close_time, 
        tolerance_minutes, latitude, longitude, radius_meters, meeting_link 
    } = req.body;

    try {
        const result = await db.query(
            `UPDATE Schedules SET 
                event_name = $1, description = $2, location = $3, event_date = $4, 
                start_time = $5, end_time = $6, 
                attendance_open_time = $7, attendance_close_time = $8, 
                tolerance_minutes = $9,
                latitude = $10, longitude = $11, radius_meters = $12,
                meeting_link = $13
             WHERE id = $14 RETURNING *`,
            [
                event_name, description, location, event_date, 
                start_time, end_time, 
                attendance_open_time,
                attendance_close_time,
                tolerance_minutes, 
                latitude, longitude, radius_meters, 
                meeting_link, id
            ]
        );

        if (result.rows.length === 0) return res.status(404).json({ msg: 'Jadwal tidak ditemukan' });
        res.json({ msg: 'Jadwal berhasil diperbarui!', data: result.rows[0] });

    } catch (err) {
        console.error("Update Error:", err.message);
        res.status(500).send('Server Error saat update jadwal');
    }
};

const cancelSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('BEGIN');
        const updateQuery = "UPDATE Schedules SET status = 'BATAL' WHERE id = $1 RETURNING *";
        const result = await db.query(updateQuery, [id]);

        if (result.rowCount === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ msg: 'Jadwal tidak ditemukan.' });
        }
        await db.query("UPDATE Attendances SET status = 'Batal' WHERE schedule_id = $1", [id]);
        await db.query('COMMIT');
        res.json({ msg: 'Jadwal berhasil dibatalkan.', data: result.rows[0] });
    } catch (err) {
        await db.query('ROLLBACK');
        console.error("Cancel Error:", err.message);
        res.status(500).json({ msg: "Gagal membatalkan jadwal" });
    }
};

const deleteSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query('DELETE FROM Attendances WHERE schedule_id = $1', [id]);
        const result = await db.query('DELETE FROM Schedules WHERE id = $1', [id]);
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Jadwal tidak ditemukan' });
        res.json({ msg: 'Jadwal berhasil dihapus permanen' });
    } catch (err) {
        console.error("Delete Error:", err.message);
        res.status(500).send('Server Error');
    }
};

module.exports = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    cancelSchedule,
    deleteSchedule
};
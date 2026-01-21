const db = require('../config/db');
const { sendNotification } = require('../utils/notificationHelper'); 

// 1. CREATE SCHEDULE
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
        // --- AUTO-FIX DATABASE STRUCTURE (Perbaikan Otomatis) ---
        // Menambahkan kolom yang kurang secara otomatis tanpa buka pgAdmin
        await db.query("ALTER TABLE Schedules ADD COLUMN IF NOT EXISTS meeting_link TEXT;"); 
        await db.query("ALTER TABLE Schedules ADD COLUMN IF NOT EXISTS status VARCHAR(20) DEFAULT 'AKTIF';");
        
        // --- INI PERBAIKAN UTAMANYA ---
        // Menambahkan kolom created_by jika belum ada
        // await db.query("ALTER TABLE Schedules ADD COLUMN IF NOT EXISTS created_by INTEGER;"); 
        // ------------------------------

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

        // Notifikasi (Opsional)
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

// 2. GET ALL SCHEDULES
const getAllSchedules = async (req, res) => {
    const { ukm_id, role, id } = req.user;
    const { all } = req.query; 

    try {
        let query;
        let params = [];
        let timeFilter = "";
        
        // Jika ?all=true tidak ada, filter yang batal/lewat (Default behaviour)
        // TAPI untuk Admin Panel EventList, kita biasanya kirim ?all=true biar semua kelihatan
        if (all !== 'true') {
            timeFilter = `AND s.status != 'BATAL' AND (
                (s.event_date > CURRENT_DATE) OR 
                (s.event_date = CURRENT_DATE AND s.attendance_close_time > CURRENT_TIME)
            )`;
        }

        if (role === 'super_admin') {
            query = `SELECT s.* FROM Schedules s WHERE 1=1 ${timeFilter} ORDER BY s.event_date DESC`;
        } else {
            // Untuk member/admin UKM: Lihat jadwal UKM sendiri
            // + Status kehadiran user login (Hadir/Izin/dll)
            query = `
                SELECT s.*, 
                (SELECT status FROM Attendances WHERE schedule_id = s.id AND user_id = $1 LIMIT 1) as my_status
                FROM Schedules s
                WHERE s.ukm_id = $2 ${timeFilter}
                ORDER BY s.event_date DESC
            `;
            params = [id, ukm_id];
        }

        const result = await db.query(query, params);
        const schedulesWithStatus = result.rows.map(schedule => {
            // 1. Ambil Waktu Sekarang
            const now = new Date();
            
            // 2. Gabungkan Tanggal & Jam agar bisa dibandingkan
            // schedule.event_date biasanya objek Date, kita ambil string YYYY-MM-DD nya
            const dateStr = new Date(schedule.event_date).toISOString().split('T')[0];
            
            const startFull = new Date(`${dateStr}T${schedule.start_time}`);
            const endFull   = new Date(`${dateStr}T${schedule.end_time}`);

            // 3. Tentukan Status
            let computedStatus = 'upcoming'; // Default: Akan Datang

            if (now > endFull) {
                computedStatus = 'completed'; // Selesai
            } else if (now >= startFull && now <= endFull) {
                computedStatus = 'ongoing';   // Sedang Berlangsung
            } else {
                computedStatus = 'upcoming';  // Akan Datang
            }

            // 4. Return data asli + status hasil hitungan
            return { 
                ...schedule, 
                status_kegiatan: computedStatus // Frontend akan membaca field ini
            };
        });

        res.json(schedulesWithStatus);
        
    } catch (err) {
        console.error("Get All Error:", err.message);
        res.status(500).json({ msg: "Server Error" });
    }
};

// 3. GET ONE (Untuk Edit)
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

// 4. UPDATE (Simpan Edit)
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
                attendance_open_time,   // <-- Tambahkan ini (sebelumnya hilang)
                attendance_close_time,  // <-- Tambahkan ini (sebelumnya hilang)
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

// 5. CANCEL (SOFT DELETE) - Ubah Status jadi BATAL
// Ini dipanggil oleh tombol "Batalkan"
const cancelSchedule = async (req, res) => {
    const { id } = req.params;
    
    try {
        await db.query('BEGIN');

        // Update status jadwal
        const updateQuery = "UPDATE Schedules SET status = 'BATAL' WHERE id = $1 RETURNING *";
        const result = await db.query(updateQuery, [id]);

        if (result.rowCount === 0) {
            await db.query('ROLLBACK');
            return res.status(404).json({ msg: 'Jadwal tidak ditemukan.' });
        }

        // Update status absensi user jadi 'Batal' (agar tidak dianggap Alpa)
        await db.query("UPDATE Attendances SET status = 'Batal' WHERE schedule_id = $1", [id]);

        await db.query('COMMIT');
        res.json({ msg: 'Jadwal berhasil dibatalkan.', data: result.rows[0] });

    } catch (err) {
        await db.query('ROLLBACK');
        console.error("Cancel Error:", err.message);
        res.status(500).json({ msg: "Gagal membatalkan jadwal" });
    }
};

// 6. DELETE (HARD DELETE) - Hapus Permanen dari DB
// Ini dipanggil oleh tombol "Hapus Permanen"
const deleteSchedule = async (req, res) => {
    const { id } = req.params;
    try {
        // Karena ada Foreign Key constraint di tabel Attendances, 
        // kita hapus dulu absensinya, atau pastikan DB pake ON DELETE CASCADE.
        // Untuk aman, kita hapus manual:
        await db.query('DELETE FROM Attendances WHERE schedule_id = $1', [id]);
        
        // Baru hapus jadwalnya
        const result = await db.query('DELETE FROM Schedules WHERE id = $1', [id]);
        
        if (result.rowCount === 0) return res.status(404).json({ msg: 'Jadwal tidak ditemukan' });

        res.json({ msg: 'Jadwal berhasil dihapus permanen' });
    } catch (err) {
        console.error("Delete Error:", err.message);
        res.status(500).send('Server Error');
    }
};

// --- EXPORT SEMUA FUNGSI ---
module.exports = {
    createSchedule,
    getAllSchedules,
    getScheduleById,
    updateSchedule,
    cancelSchedule, // <--- Ini yang tadi kurang/salah nama
    deleteSchedule
};
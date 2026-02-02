const db = require('../config/db');
const bcrypt = require('bcryptjs');
const { sendNotification } = require('../utils/notificationHelper');
const ExcelJS = require('exceljs');
const getAttendanceReport = async (req, res) => {
    const { schedule_id } = req.params;
    const ukm_id = req.user.ukm_id;

    try {
        const report = await db.query(
            `SELECT 
             u.id as user_id, u.name, u.nia,
             COALESCE(a.status, 'Alpa') as status, 
             a.attendance_time, a.reason
             FROM Users u
             LEFT JOIN Attendances a ON u.id = a.user_id AND a.schedule_id = $1
             WHERE u.ukm_id = $2 AND u.role_id = 3
             ORDER BY u.name ASC`,
            [schedule_id, ukm_id]
        );

        res.json(report.rows);
    } catch (err) {
        res.status(500).send('Server Error Laporan');
    }
};
const registerUser = async (req, res) => {
    const { name, username, nia, password, role_id, ukm_id } = req.body;

    try {
        const userExist = await db.query('SELECT * FROM Users WHERE username = $1', [username]);
        if (userExist.rows.length > 0) {
            return res.status(400).json({ msg: 'Username sudah terdaftar.' });
        }

        const salt = await bcrypt.genSalt(10);
        const password_hash = await bcrypt.hash(password, salt);

        const newUser = await db.query(
            `INSERT INTO Users (name, username, nia, password_hash, role_id, ukm_id) 
             VALUES ($1, $2, $3, $4, $5, $6) RETURNING id, name, username, nia, role_id`,
            [name, username, nia, password_hash, role_id, ukm_id]
        );

        res.json({ msg: 'Akun berhasil dibuat!', user: newUser.rows[0] });
    } catch (err) {
        console.error("Gagal Register:", err.message);
        res.status(500).send('Server Error saat mendaftarkan user.');
    }
};

const getUKMReport = async (req, res) => {
    const { ukm_id } = req.params;
    try {
        const report = await db.query(`
            SELECT 
                u.id, u.name, u.nia,
                COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) as hadir,
                COUNT(CASE WHEN a.status = 'Telat' THEN 1 END) as telat,
                COUNT(CASE WHEN a.status = 'Izin' THEN 1 END) as izin,
                (SELECT COUNT(*) FROM Schedules WHERE ukm_id = $1) - COUNT(a.id) as alpa
            FROM Users u
            LEFT JOIN Attendances a ON u.id = a.user_id
            WHERE u.ukm_id = $1 AND u.role_id = 3
            GROUP BY u.id, u.name, u.nia
        `, [ukm_id]);
        
        res.json(report.rows);
    } catch (err) {
        res.status(500).send('Server Error');
    }
};

const broadcastMessage = async (req, res) => {
    const { title, message, target_ukm_id } = req.body;
    
    if (!title || !message) {
        return res.status(400).json({ msg: "Judul dan Pesan wajib diisi!" });
    }

    try {
        await sendNotification({
            title,
            message,
            type: 'info',
            target_type: target_ukm_id ? 'ukm_only' : 'all',
            target_ukm_id: target_ukm_id || null,
            sender_id: req.user.id
        });

        res.json({ msg: "Pengumuman berhasil dikirim!" });
    } catch (error) {
        console.error("Broadcast Error:", error);
        res.status(500).json({ msg: error.message });
    }
};

const exportAttendance = async (req, res) => {
    const { schedule_id } = req.params;

    try {
        const scheduleRes = await db.query("SELECT * FROM Schedules WHERE id = $1", [schedule_id]);
        if (scheduleRes.rows.length === 0) return res.status(404).json({ msg: "Kegiatan tidak ditemukan" });
        const schedule = scheduleRes.rows[0];

        const attendanceRes = await db.query(`
            SELECT u.name, u.nia, a.status, a.attendance_time, a.reason, a.latitude, a.longitude
            FROM Attendances a
            JOIN Users u ON a.user_id = u.id
            WHERE a.schedule_id = $1
            ORDER BY u.name ASC
        `, [schedule_id]);

        const workbook = new ExcelJS.Workbook();
        const worksheet = workbook.addWorksheet('Presensi');

        worksheet.mergeCells('A1:E1');
        worksheet.getCell('A1').value = `LAPORAN PRESENSI: ${schedule.event_name}`;
        worksheet.getCell('A1').font = { size: 16, bold: true };
        worksheet.getCell('A1').alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.mergeCells('A2:E2');
        worksheet.getCell('A2').value = `Tanggal: ${new Date(schedule.event_date).toLocaleDateString('id-ID')} | Lokasi: ${schedule.location}`;
        worksheet.getCell('A2').alignment = { vertical: 'middle', horizontal: 'center' };

        worksheet.getRow(4).values = ['No', 'Nama Anggota', 'NIA', 'Waktu Hadir', 'Status', 'Keterangan'];
        worksheet.getRow(4).font = { bold: true, color: { argb: 'FFFFFFFF' } };
        worksheet.getRow(4).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF2563EB' } };

        attendanceRes.rows.forEach((row, index) => {
            const timeStr = row.attendance_time ? new Date(row.attendance_time).toLocaleTimeString('id-ID') : '-';
            worksheet.addRow([
                index + 1, 
                row.name, 
                row.nia || '-', 
                timeStr, 
                row.status, 
                row.reason || (row.latitude ? 'GPS Valid' : '-')
            ]);
        });

        worksheet.columns = [
            { width: 5 },
            { width: 30 },
            { width: 15 },
            { width: 15 },
            { width: 15 },
            { width: 30 }
        ];

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', `attachment; filename=Laporan_${schedule.event_name.replace(/\s/g, '_')}.xlsx`);

        await workbook.xlsx.write(res);
        res.end();

    } catch (err) {
        console.error("Export Error:", err);
        res.status(500).send("Gagal generate Excel");
    }
};

module.exports = { 
    getAttendanceReport, 
    registerUser,
    getUKMReport,
    broadcastMessage,
    exportAttendance
};
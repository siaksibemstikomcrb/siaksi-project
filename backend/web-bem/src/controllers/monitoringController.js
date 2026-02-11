const db = require('../config/db');

const getGlobalMonitoring = async (req, res) => {
    try {
        const ukmCount = await db.query('SELECT COUNT(*) FROM UKMs');
        const userCount = await db.query('SELECT COUNT(*) FROM Users WHERE role_id = 3');

        const ukmListResult = await db.query(`
            SELECT 
                u.id, u.ukm_name, u.leader_name, u.description,
                (SELECT COUNT(*) FROM Users WHERE ukm_id = u.id AND role_id = 3) as total_members,
                (SELECT COUNT(*) FROM Schedules WHERE ukm_id = u.id) as total_events
            FROM UKMs u
        `);

        const ukmWithDetails = await Promise.all(ukmListResult.rows.map(async (ukm) => {
            const membersResult = await db.query(`
                SELECT 
                    u.name, u.nia,
                    COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) as hadir,
                    COUNT(CASE WHEN a.status = 'Izin' THEN 1 END) as izin,
                    COUNT(CASE WHEN a.status = 'Telat' THEN 1 END) as telat,
                    (SELECT COUNT(*) FROM Schedules WHERE ukm_id = $1) - 
                    COUNT(CASE WHEN a.status IN ('Hadir', 'Izin', 'Telat') THEN 1 END) as alpa
                FROM Users u
                LEFT JOIN Attendances a ON u.id = a.user_id
                WHERE u.ukm_id = $1 AND u.role_id IN (2, 3)
                GROUP BY u.id, u.name, u.nia
            `, [ukm.id]);

            return { ...ukm, members: membersResult.rows };
        }));

        res.json({
            summary: { 
                total_ukm: ukmCount.rows[0].count, 
                total_users: userCount.rows[0].count 
            },
            ukm_list: ukmWithDetails
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error pada Monitoring');
    }
};


const getUKMDetail = async (req, res) => {
    const { id } = req.params;
    try {
        const ukmInfo = await db.query('SELECT * FROM UKMs WHERE id = $1', [id]);
        if (ukmInfo.rows.length === 0) return res.status(404).json({ msg: 'UKM tidak ditemukan' });

        const admins = await db.query(
            'SELECT id, name, nia FROM Users WHERE ukm_id = $1 AND role_id = 2', 
            [id]
        );

        const membersStats = await db.query(`
            SELECT 
                u.id, u.name, u.nia,
                COUNT(CASE WHEN a.status = 'Hadir' THEN 1 END) as hadir,
                COUNT(CASE WHEN a.status = 'Izin' THEN 1 END) as izin,
                COUNT(CASE WHEN a.status = 'Telat' THEN 1 END) as telat,
                (
                  SELECT COUNT(*) FROM Schedules s
                  WHERE s.ukm_id = $1 
                  AND (s.event_date < CURRENT_DATE OR (s.event_date = CURRENT_DATE AND s.attendance_close_time < CURRENT_TIME))
                  AND NOT EXISTS (
                    SELECT 1 FROM Attendances att 
                    WHERE att.schedule_id = s.id AND att.user_id = u.id
                  )
                ) as alpa
            FROM Users u
            LEFT JOIN Attendances a ON u.id = a.user_id
            WHERE u.ukm_id = $1 AND u.role_id = 3 -- Hanya Member
            GROUP BY u.id, u.name, u.nia
        `, [id]);

        const eventsCount = await db.query('SELECT COUNT(*) FROM Schedules WHERE ukm_id = $1', [id]);

        res.json({
            ...ukmInfo.rows[0],
            total_events: eventsCount.rows[0].count,
            admins: admins.rows,
            members: membersStats.rows
        });
    } catch (err) {
        console.error(err.message);
        res.status(500).send('Server Error');
    }
};

const getOnlineUsers = async (req, res) => {
    const { role, ukm_id } = req.user;

    try {
        // PERBAIKAN: Tambahkan 'u.' di depan 'id' agar tidak ambigu
        let query = `
            SELECT u.id, u.name, u.username, u.profile_pic, r.role_name, k.ukm_name, u.last_active 
            FROM users u
            LEFT JOIN roles r ON u.role_id = r.id
            LEFT JOIN ukms k ON u.ukm_id = k.id
            WHERE u.last_active > NOW() - INTERVAL '5 minutes'
        `;
        
        let params = [];

        // Jika Admin UKM, hanya lihat anggotanya sendiri
        if (role !== 'super_admin') {
            query += ` AND u.ukm_id = $1`;
            params.push(ukm_id);
        }

        query += ` ORDER BY u.last_active DESC`;

        const result = await db.query(query, params);
        res.json(result.rows);

    } catch (err) {
        console.error(err); // Akan mencetak error detail ke terminal jika masih ada masalah
        res.status(500).send('Server Error');
    }
};

// Get Visitor Stats (Khusus Super Admin)
const getVisitorStats = async (req, res) => {
    try {
        // Hitung total kunjungan hari ini
        const todayHits = await db.query(
            `SELECT COUNT(*) FROM visitor_logs WHERE visited_at::date = CURRENT_DATE`
        );

        // Hitung total kunjungan bulan ini
        const monthHits = await db.query(
            `SELECT COUNT(*) FROM visitor_logs WHERE date_trunc('month', visited_at) = date_trunc('month', CURRENT_DATE)`
        );

        // Hitung User Unik (Berdasarkan IP) Hari Ini
        const uniqueVisitors = await db.query(
            `SELECT COUNT(DISTINCT ip_address) FROM visitor_logs WHERE visited_at::date = CURRENT_DATE`
        );

        res.json({
            today_hits: parseInt(todayHits.rows[0].count),
            month_hits: parseInt(monthHits.rows[0].count),
            unique_visitors_today: parseInt(uniqueVisitors.rows[0].count)
        });

    } catch (err) {
        console.error(err);
        res.status(500).send('Server Error');
    }
};

module.exports = { getGlobalMonitoring, getUKMDetail, getOnlineUsers, getVisitorStats};
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

module.exports = { getGlobalMonitoring, getUKMDetail };
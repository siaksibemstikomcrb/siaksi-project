const db = require('../config/db');

const sendNotification = async ({ title, message, type, target_type, target_ukm_id, sender_id }) => {
    const result = await db.query(
        'INSERT INTO notifications (title, message, type, target_type, target_ukm_id, sender_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING id',
        [title, message, type, target_type, target_ukm_id, sender_id]
    );
    const notificationId = result.rows[0].id;
    let userQuery = 'SELECT id FROM users WHERE is_active = true'; 
    let params = [];

    if (target_type === 'ukm_only') {
        userQuery += ' AND ukm_id = $1';
        params.push(target_ukm_id);
    }

    const users = await db.query(userQuery, params);

    if (users.rows.length > 0) {
        const insertValues = users.rows.map(u => `(${notificationId}, ${u.id})`).join(',');
        await db.query(`INSERT INTO user_notifications (notification_id, user_id) VALUES ${insertValues}`);
    }
};



module.exports = { sendNotification };
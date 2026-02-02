const db = require('../config/db');

const getMyNotifications = async (req, res) => {
    try {
        const userId = req.user.id;
        const query = `
            SELECT un.id as inbox_id, n.title, n.message, n.type, n.created_at, un.is_read
            FROM user_notifications un
            JOIN notifications n ON un.notification_id = n.id
            WHERE un.user_id = $1
            ORDER BY n.created_at DESC
            LIMIT 20
        `;
        const result = await db.query(query, [userId]);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

const markAsRead = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query('UPDATE user_notifications SET is_read = true WHERE id = $1', [id]);
        res.json({ msg: "Notifikasi dibaca" });
    } catch (error) {
        res.status(500).json({ msg: error.message });
    }
};

module.exports = { getMyNotifications, markAsRead };
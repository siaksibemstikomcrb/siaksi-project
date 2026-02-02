const axios = require('axios');
const db = require('../config/db');
const { syncUserRole } = require('../discord/bot');

exports.getAuthUrl = (req, res) => {
    const url = `https://discord.com/api/oauth2/authorize?client_id=${process.env.DISCORD_CLIENT_ID}&redirect_uri=${encodeURIComponent(process.env.DISCORD_REDIRECT_URI)}&response_type=code&scope=identify`;
    res.json({ url });
};

exports.connectDiscord = async (req, res) => {
    const { code } = req.body;
    const userId = req.user.id;

    if (!code) return res.status(400).json({ msg: "Code tidak ditemukan" });

    try {
        const tokenResponse = await axios.post(
            'https://discord.com/api/oauth2/token',
            new URLSearchParams({
                client_id: process.env.DISCORD_CLIENT_ID,
                client_secret: process.env.DISCORD_CLIENT_SECRET,
                grant_type: 'authorization_code',
                code: code,
                redirect_uri: process.env.DISCORD_REDIRECT_URI,
            }),
            { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
        );

        const accessToken = tokenResponse.data.access_token;

        const userResponse = await axios.get('https://discord.com/api/users/@me', {
            headers: { Authorization: `Bearer ${accessToken}` }
        });

        const discordId = userResponse.data.id;
        const discordUsername = userResponse.data.username;

        await db.query(
            "UPDATE users SET discord_id = $1 WHERE id = $2",
            [discordId, userId]
        );

        const userDb = await db.query(
            `SELECT u.role_id, r.role_name, k.ukm_name 
             FROM users u 
             LEFT JOIN roles r ON u.role_id = r.id 
             LEFT JOIN ukms k ON u.ukm_id = k.id 
             WHERE u.id = $1`, 
            [userId]
        );

        const userData = userDb.rows[0];
        
        const syncResult = await syncUserRole(
            discordId, 
            userData.role_name,
            userData.ukm_name
        );

        res.json({ 
            msg: "Berhasil terhubung ke Discord!", 
            discord_username: discordUsername,
            sync_status: syncResult
        });

    } catch (err) {
        console.error("Discord Connect Error:", err.response?.data || err.message);
        res.status(500).json({ msg: "Gagal menghubungkan akun Discord." });
    }
};
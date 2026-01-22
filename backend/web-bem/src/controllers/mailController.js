const db = require('../config/db');
const { client } = require('../discord/bot'); // <--- 1. Import Bot Discord
const { EmbedBuilder } = require('discord.js'); // Untuk tampilan pesan cantik

// --- HELPER: FUNGSI POST KE DISCORD ---
const postToDiscord = async (mailData) => {
    try {
        // Cari channel bernama 'pengumuman' atau 'announcements'
        // Pastikan Anda sudah buat channel ini di Discord Server Anda!
        const channel = client.channels.cache.find(c => 
            c.name === 'pengumuman' || c.name === 'announcements' || c.name === 'news'
        );

        if (!channel) {
            console.log("?? Discord Channel 'pengumuman' tidak ditemukan. Skip posting.");
            return;
        }

        // Buat Tampilan Pesan (Embed)
        const embed = new EmbedBuilder()
            .setColor(0x0099FF) // Warna Biru
            .setTitle(`?? ${mailData.title}`)
            .setDescription(mailData.description)
            .setFooter({ text: `Dikirim oleh: ${mailData.sender_name || 'Admin UKM'}` })
            .setTimestamp();

        // Jika ada gambar/file attachment
        if (mailData.file_path) {
            embed.setImage(mailData.file_path); // Tampilkan gambar full
        }

        await channel.send({ embeds: [embed] });
        console.log("? Berhasil posting ke Discord!");

    } catch (error) {
        console.error("? Gagal posting ke Discord:", error.message);
    }
};

// ==========================================
// A. KIRIM PESAN / SURAT
// ==========================================
const sendMail = async (req, res) => {
    try {
        const { title, description, target_ukm_ids } = req.body;
        const sender_ukm_id = req.user.ukm_id;
        
        // Cek File
        if (!req.file) return res.status(400).json({ msg: "Wajib lampirkan file/foto!" });
        const file_path = req.file.path;
        const file_type = req.file.originalname.split('.').pop().toLowerCase();

        // 1. TENTUKAN STATUS & SCOPE
        let status = 'approved'; 
        let targetScope = 'specific';

        // Jika Broadcast
        if (target_ukm_ids === 'BROADCAST_ALL') {
            targetScope = 'broadcast';
            // Jika bukan Super Admin, status jadi Pending
            if (req.user.role !== 'super_admin') {
                status = 'pending';
            }
        }

        // 2. SIMPAN KE TABLE MAILS
        const mailResult = await db.query(
            `INSERT INTO mails (sender_ukm_id, title, description, file_path, file_type, target_scope, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [sender_ukm_id, title, description, file_path, file_type, targetScope, status]
        );

        // 3. LOGIC NOTIFIKASI
        const newMail = mailResult.rows[0];

        // Jika Broadcast & Status Approved (Super Admin yg kirim) -> POST KE DISCORD
        if (targetScope === 'broadcast' && status === 'approved') {
            // Ambil nama pengirim untuk footer discord
            const senderInfo = await db.query("SELECT ukm_name FROM ukms WHERE id = $1", [sender_ukm_id]);
            const senderName = senderInfo.rows[0]?.ukm_name || 'Super Admin';
            
            // Panggil Helper Discord
            postToDiscord({ 
                title, 
                description, 
                file_path, 
                sender_name: senderName 
            });
        }

        // Logic Notifikasi ke Inbox User (Database)
        if (status === 'approved') {
            let targetUsersQuery = '';
            let params = [];

            if (targetScope === 'broadcast') {
               targetUsersQuery = "SELECT id FROM users"; // Semua Member
            } else {
                // Target Spesifik UKM
                const ukmIds = target_ukm_ids.split(',').map(id => parseInt(id));
                targetUsersQuery = "SELECT id FROM users WHERE ukm_id = ANY($1::int[]) AND role_id = 3";
                params = [ukmIds];
            }

            const targetUsers = await db.query(targetUsersQuery, params);
            
            if (targetUsers.rows.length > 0) {
                const values = targetUsers.rows.map(u => `(${newMail.id}, ${u.id})`).join(',');
                await db.query(`INSERT INTO mail_recipients (mail_id, user_id) VALUES ${values}`);
            }
        }

        res.status(201).json({ msg: status === 'pending' ? 'Broadcast menunggu persetujuan Super Admin.' : 'Pesan berhasil dikirim!' });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Gagal mengirim pesan" });
    }
};

// ==========================================
// B. GET INBOX (Pesan Masuk User)
// ==========================================
const getInbox = async (req, res) => {
    const userId = req.user.id;
    try {
        const result = await db.query(`
            SELECT m.*, u.ukm_name as sender_name, mr.is_read
            FROM mail_recipients mr
            JOIN mails m ON mr.mail_id = m.id
            JOIN ukms u ON m.sender_ukm_id = u.id
            WHERE mr.user_id = $1
            ORDER BY m.created_at DESC
        `, [userId]);
        res.json(result.rows);
    } catch (err) { 
        console.error(err);
        res.status(500).json({ msg: "Error ambil inbox" }); 
    }
};

// ==========================================
// C. GET PENDING BROADCASTS (Super Admin)
// ==========================================
const getPendingBroadcasts = async (req, res) => {
    try {
        const result = await db.query(`
            SELECT m.*, u.ukm_name as sender_name
            FROM mails m
            JOIN ukms u ON m.sender_ukm_id = u.id
            WHERE m.target_scope = 'broadcast' AND m.status = 'pending'
            ORDER BY m.created_at ASC
        `);
        res.json(result.rows);
    } catch (err) { 
        console.error(err);
        res.status(500).json({ msg: "Error" }); 
    }
};

// ==========================================
// D. APPROVE / REJECT BROADCAST
// ==========================================
const approveBroadcast = async (req, res) => {
    const { mailId, action } = req.body; 
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    try {
        // 1. Update Status di DB
        const result = await db.query(
            "UPDATE mails SET status = $1 WHERE id = $2 RETURNING *", 
            [newStatus, mailId]
        );
        
        const updatedMail = result.rows[0];

        // 2. Jika DISETUJUI -> Post ke Discord & Kirim ke Inbox User
        if (newStatus === 'approved') {
            
            // A. Post ke Discord
            const senderInfo = await db.query("SELECT ukm_name FROM ukms WHERE id = $1", [updatedMail.sender_ukm_id]);
            const senderName = senderInfo.rows[0]?.ukm_name;

            postToDiscord({
                title: updatedMail.title,
                description: updatedMail.description,
                file_path: updatedMail.file_path,
                sender_name: senderName
            });

            // B. Masukkan ke Inbox Semua User (Broadcast)
                const allUsers = await db.query("SELECT id FROM users");
            if (allUsers.rows.length > 0) {
                const values = allUsers.rows.map(u => `(${updatedMail.id}, ${u.id})`).join(',');
                await db.query(`INSERT INTO mail_recipients (mail_id, user_id) VALUES ${values} ON CONFLICT DO NOTHING`);
            }
        }

        res.json({ msg: `Broadcast berhasil di-${action}` });

    } catch (err) { 
        console.error("Approve Error:", err);
        res.status(500).json({ msg: "Gagal update status" }); 
    }
};

// ==========================================
// E. GET UKM LIST
// ==========================================
const getUkmList = async (req, res) => {
    try {
        const result = await db.query(
            "SELECT id, ukm_name as name FROM ukms WHERE id != $1 ORDER BY ukm_name ASC", 
            [req.user.ukm_id || 0]
        );
        res.json(result.rows);
    } catch (err) { res.status(500).json({ msg: "Error" }); }
};

module.exports = {
    sendMail,
    getInbox,
    getPendingBroadcasts,
    approveBroadcast,
    getUkmList
};
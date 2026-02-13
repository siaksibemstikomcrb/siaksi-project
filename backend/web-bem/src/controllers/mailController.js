const db = require('../config/db');
const { client } = require('../discord/bot');
const { EmbedBuilder } = require('discord.js');

// --- HELPER DISCORD ---
const postToDiscord = async (mailData) => {
    try {
        if (!client.isReady()) return; // Cek bot nyala atau ga

        const channel = client.channels.cache.find(c => 
            c.name === 'pengumuman' || c.name === 'announcements' || c.name === 'news'
        );

        if (!channel) {
            console.log("⚠️ Discord Channel 'pengumuman' tidak ditemukan. Skip posting.");
            return;
        }

        const embed = new EmbedBuilder()
            .setColor(0x0099FF)
            .setTitle(`📢 ${mailData.title}`)
            .setDescription(mailData.description || 'Tidak ada deskripsi.')
            .setFooter({ text: `Dikirim oleh: ${mailData.sender_name || 'Admin UKM'}` })
            .setTimestamp();

        if (mailData.file_path) {
            // Pastikan URL gambar bisa diakses publik jika ingin muncul di Discord,
            // atau kirim sebagai attachment jika lokal.
            // embed.setImage(mailData.file_path); 
        }

        await channel.send({ embeds: [embed] });
        console.log("✅ Berhasil posting ke Discord!");

    } catch (error) {
        console.error("❌ Gagal posting ke Discord:", error.message);
    }
};

// --- SEND MAIL ---
const sendMail = async (req, res) => {
    try {
        // Ambil data dari body. PENTING: target_ukm_ids dari FormData itu String.
        const { title, description, target_ukm_ids } = req.body;
        const sender_ukm_id = req.user.ukm_id; 
        
        if (!req.file) return res.status(400).json({ msg: "Wajib lampirkan file/foto!" });
        
        // Cloudinary path otomatis ada di req.file.path
        const file_path = req.file.path;
        const file_type = req.file.originalname.split('.').pop().toLowerCase();

        // 1. TENTUKAN STATUS & SCOPE
        let status = 'approved'; 
        let targetScope = 'specific';

        // Cek apakah broadcast semua atau spesifik
        if (target_ukm_ids === 'BROADCAST_ALL') {
            targetScope = 'broadcast';
            if (req.user.role !== 'super_admin') {
                status = 'pending';
            }
        }

        // 2. INSERT KE TABEL MAILS (Surat Utama)
        const mailResult = await db.query(
            `INSERT INTO mails (sender_ukm_id, title, description, file_path, file_type, target_scope, status)
             VALUES ($1, $2, $3, $4, $5, $6, $7) RETURNING *`,
            [sender_ukm_id, title, description, file_path, file_type, targetScope, status]
        );

        const newMail = mailResult.rows[0];

        // 3. LOGIKA DISCORD (Jika Broadcast)
        if (targetScope === 'broadcast' && status === 'approved') {
            const senderInfo = await db.query("SELECT ukm_name FROM ukms WHERE id = $1", [sender_ukm_id]);
            const senderName = senderInfo.rows[0]?.ukm_name || 'Super Admin';
            
            postToDiscord({ 
                title, 
                description, 
                file_path, 
                sender_name: senderName 
            });
        }

        // 4. DISTRIBUSI KE PENERIMA (Bagian yang diperbaiki)
        if (status === 'approved') {
            let targetUsersQuery = '';
            let params = [];

            if (targetScope === 'broadcast') {
               // Kirim ke SEMUA user (Admin UKM + Anggota)
               targetUsersQuery = "SELECT id FROM users";
            } else {
                // --- PERBAIKAN DISINI ---
                // Pastikan target_ukm_ids diubah jadi string dulu baru di-split (jaga-jaga error)
                const ukmIds = String(target_ukm_ids).split(',').map(id => parseInt(id));
                
                // KITA HAPUS "AND role_id = 3" AGAR ADMIN UKM JUGA DAPAT
                // Atau gunakan: WHERE ukm_id = ANY($1) AND role_id IN (2, 3)
                targetUsersQuery = `
                    SELECT id FROM users 
                    WHERE ukm_id = ANY($1::int[]) 
                    AND (role_id = 2)
                `; 
                params = [ukmIds];
            }

            const targetUsers = await db.query(targetUsersQuery, params);
            
            if (targetUsers.rows.length > 0) {
                // Insert Bulk ke mail_recipients
                const values = targetUsers.rows.map(u => `(${newMail.id}, ${u.id})`).join(',');
                await db.query(`INSERT INTO mail_recipients (mail_id, user_id) VALUES ${values}`);
            } else {
                console.log("Surat terkirim tapi tidak ada penerima yang cocok (User Kosong di UKM tsb).");
            }
        }

        res.status(201).json({ msg: status === 'pending' ? 'Broadcast menunggu persetujuan Super Admin.' : 'Pesan berhasil dikirim!' });

    } catch (err) {
        console.error("Send Mail Error:", err);
        res.status(500).json({ msg: "Gagal mengirim pesan: " + err.message });
    }
};

// --- GET INBOX (MEMBER) ---
const getInbox = async (req, res) => {
    const userId = req.user.id;
    try {
        // Query ini butuh kolom user_id & is_read di tabel mail_recipients
        const result = await db.query(`
            SELECT 
                m.*, 
                COALESCE(u.ukm_name, 'Super Admin') as sender_name,
                mr.is_read
            FROM mail_recipients mr
            JOIN mails m ON mr.mail_id = m.id
            LEFT JOIN ukms u ON m.sender_ukm_id = u.id
            WHERE mr.user_id = $1
            ORDER BY m.created_at DESC
        `, [userId]);
        
        res.json(result.rows);
    } catch (err) { 
        console.error("Get Inbox Error:", err);
        res.status(500).json({ msg: "Error ambil inbox" }); 
    }
};

// --- GET PENDING (SUPER ADMIN) ---
const getPendingBroadcasts = async (req, res) => {
    try {
        // PERBAIKAN LOGIC:
        // Ambil langsung dari tabel 'mails', JANGAN join ke mail_recipients
        // karena broadcast pending belum punya recipient.
        const result = await db.query(`
            SELECT 
                m.*, 
                COALESCE(u.ukm_name, 'Unknown UKM') as sender_name
            FROM mails m
            JOIN ukms u ON m.sender_ukm_id = u.id
            WHERE m.target_scope = 'broadcast' AND m.status = 'pending'
            ORDER BY m.created_at ASC
        `);
        res.json(result.rows);
    } catch (err) { 
        console.error("Get Pending Error:", err);
        res.status(500).json({ msg: "Error ambil pending list" }); 
    }
};

// --- APPROVE BROADCAST ---
const approveBroadcast = async (req, res) => {
    const { mailId, action } = req.body; 
    const newStatus = action === 'approve' ? 'approved' : 'rejected';
    
    try {
        // 1. Update Status Mail
        const result = await db.query(
            "UPDATE mails SET status = $1 WHERE id = $2 RETURNING *", 
            [newStatus, mailId]
        );
        
        if (result.rows.length === 0) return res.status(404).json({msg: "Mail not found"});

        const updatedMail = result.rows[0];

        // 2. Jika Approved -> Sebar ke Penerima & Discord
        if (newStatus === 'approved') {
            
            // Info Pengirim
            const senderInfo = await db.query("SELECT ukm_name FROM ukms WHERE id = $1", [updatedMail.sender_ukm_id]);
            const senderName = senderInfo.rows[0]?.ukm_name || 'Admin UKM';

            // Post Discord
            postToDiscord({
                title: updatedMail.title,
                description: updatedMail.description,
                file_path: updatedMail.file_path,
                sender_name: senderName
            });

            // Sebar ke Semua User (Tabel mail_recipients)
            const allUsers = await db.query("SELECT id FROM users");
            if (allUsers.rows.length > 0) {
                const values = allUsers.rows.map(u => `(${updatedMail.id}, ${u.id})`).join(',');
                // ON CONFLICT DO NOTHING biar ga error kalau double klik
                await db.query(`INSERT INTO mail_recipients (mail_id, user_id) VALUES ${values} ON CONFLICT DO NOTHING`);
            }
        }

        res.json({ msg: `Broadcast berhasil di-${action}` });

    } catch (err) { 
        console.error("Approve Error:", err);
        res.status(500).json({ msg: "Gagal update status" }); 
    }
};

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
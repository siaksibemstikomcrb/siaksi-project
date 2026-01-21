// src/discord/bot.js
const { Client, GatewayIntentBits } = require('discord.js');
const db = require('../config/db'); // Koneksi ke database utama
require('dotenv').config();

// 1. Inisialisasi Client dengan Izin Lengkap
const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers, // Wajib untuk manage role
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

// 2. Event: Bot Menyala
client.once('ready', async () => {
    console.log(`\n=============================================`);
    console.log(`🤖 BOT ONLINE: ${client.user.tag}`);
    console.log(`=============================================`);

    const envGuildId = process.env.DISCORD_GUILD_ID;
    console.log(`🎯 TARGET ID (.env) : ${envGuildId}`);

    // Cek apakah bot benar-benar ada di server itu?
    const guild = client.guilds.cache.get(envGuildId);

    if (!guild) {
        console.log(`❌ GAWAT! Bot TIDAK MENEMUKAN server dengan ID tersebut.`);
        console.log(`📜 Daftar Server yang dimasuki Bot saat ini:`);
        client.guilds.cache.forEach(g => {
            console.log(`   - Nama: ${g.name} | ID: ${g.id}`);
        });
        console.log(`👉 SOLUSI: Copy ID server di atas, lalu paste ke file .env`);
    } else {
        console.log(`✅ OK! Bot ada di server: "${guild.name}"`);
        console.log(`👥 Jumlah Member: ${guild.memberCount}`);
        
        try {
            await guild.members.fetch(); // Paksa fetch semua member
            console.log(`👀 Bot BERHASIL melihat daftar member.`);
        } catch (err) {
            console.log(`❌ Bot BUTA! Tidak bisa fetch member. Cek 'Server Members Intent' di Dev Portal.`);
        }
    }
    console.log(`=============================================\n`);
});

// 3. Fungsi Helper: Sinkronisasi Role (Akan dipanggil dari Controller Web)
// Ini adalah "Jembatan" antara Web dan Discord
const syncUserRole = async (discordId, roleWeb, ukmName = null) => {
    try {
        const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
        
        let member;
        try {
            // Coba ambil member. Kalau user BELUM JOIN, baris ini akan throw error 10007
            member = await guild.members.fetch(discordId);
        } catch (err) {
            // Jika errornya "Unknown Member", berarti user belum join server
            if (err.code === 10007 || err.message.includes('Unknown Member')) {
                console.log(`⚠️ User ${discordId} belum join server Discord.`);
                return { success: true, need_join: true, msg: 'User belum join server' };
            }
            throw err; // Lempar error lain jika bukan masalah member not found
        }

        // Jika sampai sini, berarti member ADA di server -> Kasih Role
        const roleMahasiswa = guild.roles.cache.find(r => r.name === 'Mahasiswa');
        if (roleMahasiswa) await member.roles.add(roleMahasiswa);

        // Logic UKM / Admin
        if (roleWeb === 'admin' || roleWeb === 'admin_ukm') {
             // ... logic role ukm ...
        }

        return { success: true, msg: 'Sinkronisasi Berhasil' };

    } catch (error) {
        console.error("Discord Sync Error:", error);
        // Jangan throw error, return success: false saja agar frontend tidak crash
        return { success: false, msg: error.message };
    }
};

// Export Client dan Helper Function
module.exports = { 
    client, 
    syncUserRole 
};
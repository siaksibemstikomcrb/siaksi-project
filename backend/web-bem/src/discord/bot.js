const { Client, GatewayIntentBits } = require('discord.js');
const db = require('../config/db');
require('dotenv').config();

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMembers,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent,
    ],
});

client.once('ready', async () => {
    console.log(`\n=============================================`);
    console.log(`🤖 BOT ONLINE: ${client.user.tag}`);
    console.log(`=============================================`);

    const envGuildId = process.env.DISCORD_GUILD_ID;
    console.log(`🎯 TARGET ID (.env) : ${envGuildId}`);

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
            await guild.members.fetch();
            console.log(`👀 Bot BERHASIL melihat daftar member.`);
        } catch (err) {
            console.log(`❌ Bot BUTA! Tidak bisa fetch member. Cek 'Server Members Intent' di Dev Portal.`);
        }
    }
    console.log(`=============================================\n`);
});

const syncUserRole = async (discordId, roleWeb, ukmName = null) => {
    try {
        const guild = await client.guilds.fetch(process.env.DISCORD_GUILD_ID);
        
        let member;
        try {
            member = await guild.members.fetch(discordId);
        } catch (err) {
            if (err.code === 10007 || err.message.includes('Unknown Member')) {
                console.log(`⚠️ User ${discordId} belum join server Discord.`);
                return { success: true, need_join: true, msg: 'User belum join server' };
            }
            throw err;
        }

        const roleMahasiswa = guild.roles.cache.find(r => r.name === 'Mahasiswa');
        if (roleMahasiswa) await member.roles.add(roleMahasiswa);

        if (roleWeb === 'admin' || roleWeb === 'admin_ukm') {
        }

        return { success: true, msg: 'Sinkronisasi Berhasil' };

    } catch (error) {
        console.error("Discord Sync Error:", error);
        return { success: false, msg: error.message };
    }
};

module.exports = { 
    client, 
    syncUserRole 
};
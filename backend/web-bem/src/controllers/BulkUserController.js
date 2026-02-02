const db = require('../config/db');
const bcrypt = require('bcryptjs');
const xlsx = require('xlsx');
const axios = require('axios'); 
const fs = require('fs');

const generateUkmCode = (ukmName) => {
    if (!ukmName) return "MHS";
    const name = ukmName.toLowerCase();
    if (name.includes("komputer") || name.includes("himakom")) return "HMK";
    if (name.includes("bem") || name.includes("eksekutif")) return "BEM";
    if (name.includes("dpm") || name.includes("dewan")) return "DPM";
    if (name.includes("choir") || name.includes("scc")) return "SCC";
    if (name.includes("art") || name.includes("crew")) return "ART";
    if (name.includes("olahraga") || name.includes("olg")) return "OLG";
    if (name.includes("robotika") || name.includes("uno")) return "UNO";
    if (name.includes("mata alam") || name.includes("ma")) return "MA";
    if (name.includes("radio") || name.includes("srtv")) return "SRTV";
    return name.substring(0, 3).toUpperCase();
};

const uploadBulkUsers = async (req, res) => {
    if (!req.file) return res.status(400).json({ msg: "File Excel wajib diupload!" });

    try {
        let finalUkmId = req.user.ukm_id; 
        let finalUkmCode = req.body.ukmCode;

        if (req.user.role === 'super_admin' && req.body.targetUkmId) {
            finalUkmId = req.body.targetUkmId;
        }

        if (!finalUkmCode || finalUkmCode === 'AUTO') {
            const ukmQuery = await db.query("SELECT ukm_name FROM ukms WHERE id = $1", [finalUkmId]);
            if (ukmQuery.rows.length === 0) throw new Error("Data UKM tidak ditemukan.");
            finalUkmCode = generateUkmCode(ukmQuery.rows[0].ukm_name);
        }

        let workbook;
        if (req.file.path.startsWith('http')) {
            const response = await axios.get(req.file.path, { responseType: 'arraybuffer' });
            workbook = xlsx.read(response.data, { type: 'buffer' });
        } else {
            workbook = xlsx.readFile(req.file.path);
        }

        const sheetName = workbook.SheetNames[0];
        const rawData = xlsx.utils.sheet_to_json(workbook.Sheets[sheetName], { header: 1, defval: "" });

        let headerRowIndex = 0;
        let headerMap = {};

        for (let i = 0; i < Math.min(rawData.length, 5); i++) {
            const row = rawData[i].map(val => String(val).toLowerCase().trim());
            if (row.includes('nama') || row.includes('nia') || row.includes('nim')) {
                headerRowIndex = i;
                row.forEach((colName, idx) => {
                    if (colName === 'nama') headerMap['nama'] = idx;
                    if (colName === 'nia' || colName === 'nim') headerMap['nia'] = idx;
                });
                break;
            }
        }

        if (!('nama' in headerMap) || !('nia' in headerMap)) {
            return res.status(400).json({ msg: "Gagal membaca Excel. Pastikan ada kolom 'NAMA' dan 'NIA'." });
        }

        const successData = [];
        const salt = await bcrypt.genSalt(10);

        console.log(`📂 Header ditemukan di baris ke-${headerRowIndex + 1}. Memproses data...`);

        for (let i = headerRowIndex + 1; i < rawData.length; i++) {
            const row = rawData[i];
            
            const nameRaw = row[headerMap['nama']];
            const niaRaw = row[headerMap['nia']];

            if (!nameRaw || !niaRaw) continue;

            const name = String(nameRaw).trim();
            const nia = String(niaRaw).trim();
            const cleanNIA = nia.replace(/[^a-zA-Z0-9]/g, ''); 

            if(name === "" || cleanNIA === "") continue;

            const rawPassword = `${finalUkmCode}${cleanNIA}`;
            
            const usernameGen = rawPassword.replace(/\s/g, ''); 

            const passwordHash = await bcrypt.hash(rawPassword, salt);

            const checkUser = await db.query("SELECT id FROM users WHERE LOWER(username) = LOWER($1)", [usernameGen]);
            
            if (checkUser.rows.length === 0) {
                await db.query(
                    `INSERT INTO users (name, username, nia, password_hash, role_id, ukm_id, is_active)
                     VALUES ($1, $2, $3, $4, 3, $5, true)`,
                    [name, usernameGen, cleanNIA, passwordHash, finalUkmId]
                );
                successData.push(usernameGen);
            }
        }

        if (!req.file.path.startsWith('http') && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }

        res.status(201).json({ 
            msg: `Berhasil import ${successData.length} anggota ke ${finalUkmCode}!`,
            ukm_code: finalUkmCode,
            total_data: successData.length,
            note: "Username & Password menggunakan format HURUF BESAR (Sesuai Kode UKM + NIA)"
        });

    } catch (error) {
        if (req.file && !req.file.path.startsWith('http') && fs.existsSync(req.file.path)) {
            fs.unlinkSync(req.file.path);
        }
        console.error("Bulk Upload Error:", error);
        res.status(500).json({ msg: "Gagal memproses file Excel", error: error.message });
    }
};

module.exports = { uploadBulkUsers };
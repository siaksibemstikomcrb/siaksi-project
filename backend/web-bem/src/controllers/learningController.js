const db = require('../config/db');
const { getVideoDetails, getPlaylistVideos } = require('../utils/youtubeHelper');
const { GoogleGenerativeAI } = require("@google/generative-ai");
const { YoutubeTranscript } = require('youtube-transcript');
const Hashids = require('hashids');
require('dotenv').config();

const hashids = new Hashids(process.env.HASHIDS_SALT || 'F2asVh2YusKa', 10); 

const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);

const formatResponse = (data) => {
    if (!data) return null;
    return {
        ...data,
        public_id: hashids.encode(data.id),
        id: undefined
    };
};

const fetchTranscript = async (videoId) => {
    try {
        const transcriptList = await YoutubeTranscript.fetchTranscript(videoId);
        if (transcriptList && transcriptList.length > 0) {
            return transcriptList.map(item => item.text).join(' ');
        }
        throw new Error("Transcript kosong");
    } catch (err) {
        try {
            const transcriptIndo = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'id' });
            return transcriptIndo.map(item => item.text).join(' ');
        } catch (err2) {
            try {
                const transcriptEng = await YoutubeTranscript.fetchTranscript(videoId, { lang: 'en' });
                return transcriptEng.map(item => item.text).join(' ');
            } catch (err3) {
                console.log(`Gagal total mengambil CC untuk video ${videoId}`);
                return ""; 
            }
        }
    }
};

const addVideo = async (req, res) => {
    const { videoUrl, category_id, ukm_id, description } = req.body; 

    try {
        if (videoUrl.includes('list=')) {
            const playlistId = videoUrl.split('list=')[1].split('&')[0];
            const videos = await getPlaylistVideos(playlistId);
            let successCount = 0;

            for (const video of videos) {
                const check = await db.query("SELECT id FROM learning_materials WHERE youtube_id = $1", [video.youtube_id]);
                if (check.rows.length === 0) {
                    const transcriptText = await fetchTranscript(video.youtube_id);
                    
                    await db.query(`
                        INSERT INTO learning_materials 
                        (ukm_id, title, youtube_id, thumbnail_url, channel_name, category_id, duration, description, transcript, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                    `, [
                        ukm_id || null, video.title, video.youtube_id, video.thumbnail_url, 
                        video.channel_name, category_id, video.duration, 
                        video.description || description, transcriptText
                    ]);
                    successCount++;
                }
            }
            return res.json({ msg: `Berhasil mengimport ${successCount} video dari Playlist!` });

        } else {
            let videoId = "";
            if (videoUrl.includes('youtu.be/')) videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
            else if (videoUrl.includes('v=')) videoId = videoUrl.split('v=')[1].split('&')[0];

            if (!videoId) return res.status(400).json({ msg: "Link YouTube tidak valid" });

            const check = await db.query("SELECT id FROM learning_materials WHERE youtube_id = $1", [videoId]);
            if (check.rows.length > 0) return res.status(400).json({ msg: "Video sudah ada!" });

            const details = await getVideoDetails(videoId);
            if (!details) return res.status(404).json({ msg: "Video tidak ditemukan di YouTube" });

            const transcriptText = await fetchTranscript(videoId);

            const saved = await db.query(`
                INSERT INTO learning_materials 
                (ukm_id, title, youtube_id, thumbnail_url, channel_name, category_id, duration, description, transcript, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, NOW())
                RETURNING *
            `, [
                ukm_id || null, details.title, details.youtube_id, details.thumbnail_url,
                details.channel_name, category_id, details.duration, 
                description || details.description, transcriptText
            ]);

            return res.json({ msg: "Video berhasil ditambahkan!", data: formatResponse(saved.rows[0]) });
        }

    } catch (err) {
        console.error("Add Video Error:", err);
        res.status(500).json({ msg: "Gagal memproses video" });
    }
};

const getVideos = async (req, res) => {
    try {
        const { category, search } = req.query;
        let query = `
            SELECT m.*, c.name as category_name, c.slug as category_slug
            FROM learning_materials m
            LEFT JOIN learning_categories c ON m.category_id = c.id
            WHERE 1=1
        `;
        let params = [];
        let counter = 1;

        if (category && category !== 'all') {
             if (!isNaN(category)) {
                query += ` AND (m.category_id = $${counter} OR m.category_id IN (SELECT id FROM learning_categories WHERE parent_id = $${counter}))`;
                params.push(category);
            } else {
                query += ` AND m.category_id IN (
                    SELECT id FROM learning_categories 
                    WHERE slug = $${counter} 
                    OR parent_id IN (SELECT id FROM learning_categories WHERE slug = $${counter})
                )`;
                params.push(category);
            }
            counter++;
        }

        if (search) {
            query += ` AND (LOWER(m.title) LIKE $${counter} OR LOWER(m.channel_name) LIKE $${counter})`;
            params.push(`%${search.toLowerCase()}%`);
            counter++;
        }

        query += " ORDER BY m.created_at DESC";
        const result = await db.query(query, params);

        const secureData = result.rows.map(item => formatResponse(item));

        res.json(secureData);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

const getMaterialById = async (req, res) => {
    const { id: public_id } = req.params;
    
    try {
        const decoded = hashids.decode(public_id);
        if (!decoded || decoded.length === 0) {
            return res.status(404).json({ msg: "Video tidak ditemukan (Invalid ID)" });
        }
        const originalId = decoded[0];

        const result = await db.query(`
            SELECT m.*, c.name as category_name 
            FROM learning_materials m
            LEFT JOIN learning_categories c ON m.category_id = c.id
            WHERE m.id = $1
        `, [originalId]);
        
        if(result.rows.length === 0) return res.status(404).json({msg: "Video tidak ditemukan"});
        
        res.json(formatResponse(result.rows[0]));

    } catch (err) {
        console.error(err);
        res.status(500).send("Server Error");
    }
};

const chatWithVideo = async (req, res) => {
    const { material_id, question } = req.body;

    try {
        const decoded = hashids.decode(material_id);
        
        if (!decoded || decoded.length === 0) {
            console.log("Gagal decode ID:", material_id);
            return res.status(400).json({ msg: "ID Materi tidak valid" });
        }
        const originalId = decoded[0];

        const material = await db.query(
            "SELECT title, description, transcript, channel_name FROM learning_materials WHERE id = $1", 
            [originalId]
        );

        if (material.rows.length === 0) return res.status(404).json({ msg: "Materi tidak ditemukan" });

        const { title, description, transcript, channel_name } = material.rows[0];
        
        const isTranscriptAvailable = transcript && transcript.length > 50 && !transcript.includes("Transkrip tidak tersedia");

        const model = genAI.getGenerativeModel({ model: "gemini-flash-latest" });

        let systemInstruction = "";

        if (isTranscriptAvailable) {
            systemInstruction = `
                Kamu adalah asisten belajar yang pintar.
                Konteks: Video berjudul "${title}" dari channel "${channel_name}".
                
                Tugas: Jawab pertanyaan user BERDASARKAN transkrip berikut ini.
                Jangan mengarang di luar transkrip kecuali diminta penjelasan umum.
                
                --- TRANSKRIP ---
                ${transcript.substring(0, 15000)}...
                --- END TRANSKRIP ---
            `;
        } else {
            systemInstruction = `
                Kamu adalah asisten belajar yang pintar.
                Konteks: Video berjudul "${title}" dari channel "${channel_name}".
                Deskripsi Video: "${description || 'Tidak ada deskripsi'}".

                PENTING: Video ini TIDAK MEMILIKI TRANSKRIP/SUBTITLE. 
                Jadi, kamu harus menjawab pertanyaan user menggunakan **Pengetahuan Umum** kamu tentang topik "${title}".
                
                Beritahu user di awal jawaban dengan sopan: "Maaf, video ini tidak memiliki teks otomatis, tapi saya akan mencoba menjelaskan konsep umumnya untukmu."
            `;
        }

        const prompt = `
            ${systemInstruction}
            
            Pertanyaan User: "${question}"
            Jawab dengan format Markdown yang rapi, ramah, dan edukatif.
        `;

        const result = await model.generateContent(prompt);
        const response = await result.response;
        
        res.json({ answer: response.text() });

    } catch (err) {
        console.error("AI Error:", err);
        res.status(500).json({ msg: "AI sedang sibuk, coba lagi nanti." });
    }
};

const deleteVideo = async (req, res) => {
    const { id: public_id } = req.params;

    try {
        const decoded = hashids.decode(public_id);
        if (!decoded || decoded.length === 0) return res.status(404).json({ msg: "ID tidak valid" });
        const originalId = decoded[0];

        await db.query("DELETE FROM learning_materials WHERE id = $1", [originalId]);
        res.json({ msg: "Video dihapus" });
    } catch (err) { res.status(500).json({ msg: "Gagal menghapus" }); }
};

const bulkDeleteVideos = async (req, res) => {
    try {
        const { videoIds } = req.body; 
        
        const originalIds = videoIds.map(hash => {
            const decoded = hashids.decode(hash);
            return decoded.length > 0 ? decoded[0] : null;
        }).filter(id => id !== null);

        if (originalIds.length === 0) return res.status(400).json({ msg: "Tidak ada ID yang valid" });

        await db.query("DELETE FROM learning_materials WHERE id = ANY($1::int[])", [originalIds]);
        res.json({ msg: "Video berhasil dihapus" });
    } catch (err) { res.status(500).json({ msg: "Gagal menghapus" }); }
};

const bulkMoveVideos = async (req, res) => {
    try {
        const { newCategoryId, videoIds } = req.body;
        
        const originalIds = videoIds.map(hash => {
            const decoded = hashids.decode(hash);
            return decoded.length > 0 ? decoded[0] : null;
        }).filter(id => id !== null);

        if (originalIds.length === 0) return res.status(400).json({ msg: "Tidak ada ID yang valid" });

        await db.query("UPDATE learning_materials SET category_id = $1 WHERE id = ANY($2::int[])", [newCategoryId, originalIds]);
        res.json({ msg: "Video berhasil dipindahkan" });
    } catch (err) { res.status(500).json({ msg: "Gagal memindahkan" }); }
};

const updateVideo = async (req, res) => {
    const { id: public_id } = req.params;
    
    try {
        const decoded = hashids.decode(public_id);
        if (!decoded || decoded.length === 0) return res.status(404).json({ msg: "ID tidak valid" });
        const originalId = decoded[0];

        await db.query("UPDATE learning_materials SET title = $1, description = $2, category_id = $3 WHERE id = $4", 
        [req.body.title, req.body.description, req.body.category_id, originalId]);
        res.json({ msg: "Video berhasil diperbarui" });
    } catch (err) { res.status(500).json({ msg: "Gagal update" }); }
};

const generateMissingTranscripts = async (req, res) => {
    try {
        const videos = await db.query(
            "SELECT id, title, youtube_id FROM learning_materials WHERE transcript IS NULL OR transcript = ''"
        );

        if (videos.rows.length === 0) {
            return res.json({ msg: "Semua video sudah punya transkrip. Aman!" });
        }

        let successCount = 0;
        let failCount = 0;

        for (const video of videos.rows) {
            try {
                console.log(`Processing: ${video.title}...`);
                const transcriptText = await fetchTranscript(video.youtube_id);

                if (transcriptText) {
                    await db.query(
                        "UPDATE learning_materials SET transcript = $1 WHERE id = $2",
                        [transcriptText, video.id]
                    );
                    successCount++;
                } else {
                    await db.query(
                        "UPDATE learning_materials SET transcript = $1 WHERE id = $2",
                        ["Transkrip tidak tersedia dari YouTube.", video.id]
                    );
                    failCount++;
                }

            } catch (err) {
                console.error(`Error pada video ${video.id}:`, err.message);
                failCount++;
            }
        }

        res.json({ 
            msg: "Proses Selesai!", 
            success: successCount,
            failed_no_cc: failCount
        });

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error saat generate transkrip" });
    }
};

module.exports = { 
    addVideo, getVideos, getMaterialById, chatWithVideo,
    deleteVideo, bulkDeleteVideos, bulkMoveVideos, updateVideo, generateMissingTranscripts
};
const db = require('../config/db');
// Pastikan fungsi ini ada di utils/youtubeHelper.js
const { getVideoDetails, getPlaylistVideos } = require('../utils/youtubeHelper');

// 1. Tambah Video (Support Satuan & Playlist)
const addVideo = async (req, res) => {
    // Ubah: Terima category_id, bukan category string
    const { videoUrl, category_id, ukm_id } = req.body; 

    try {
        // --- LOGIKA DETEKSI PLAYLIST ---
        if (videoUrl.includes('list=')) {
            // Ini Playlist!
            const playlistId = videoUrl.split('list=')[1].split('&')[0];
            const videos = await getPlaylistVideos(playlistId);

            console.log(`Menemukan ${videos.length} video dalam playlist.`);

            let successCount = 0;
            for (const video of videos) {
                // Cek duplikat berdasarkan youtube_id
                const check = await db.query("SELECT id FROM learning_materials WHERE youtube_id = $1", [video.youtube_id]);
                
                if (check.rows.length === 0) {
                    await db.query(`
                        INSERT INTO learning_materials 
                        (ukm_id, title, youtube_id, thumbnail_url, channel_name, category_id, duration, description, created_at)
                        VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                    `, [
                        ukm_id || null, 
                        video.title,
                        video.youtube_id,
                        video.thumbnail_url,
                        video.channel_name,
                        category_id, // Masukkan ID Kategori
                        video.duration,
                        video.description
                    ]);
                    successCount++;
                }
            }
            
            return res.json({ msg: `Berhasil mengimport ${successCount} video dari Playlist!` });

        } else {
            // --- LOGIKA VIDEO SATUAN ---
            let videoId = "";
            if (videoUrl.includes('youtu.be/')) {
                videoId = videoUrl.split('youtu.be/')[1].split('?')[0];
            } else if (videoUrl.includes('v=')) {
                videoId = videoUrl.split('v=')[1].split('&')[0];
            }

            if (!videoId) return res.status(400).json({ msg: "Link YouTube tidak valid" });

            const check = await db.query("SELECT id FROM learning_materials WHERE youtube_id = $1", [videoId]);
            if (check.rows.length > 0) return res.status(400).json({ msg: "Video sudah ada!" });

            const details = await getVideoDetails(videoId);
            if (!details) return res.status(404).json({ msg: "Video tidak ditemukan" });

            const saved = await db.query(`
                INSERT INTO learning_materials 
                (ukm_id, title, youtube_id, thumbnail_url, channel_name, category_id, duration, description, created_at)
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, NOW())
                RETURNING *
            `, [
                ukm_id || null,
                details.title,
                details.youtube_id,
                details.thumbnail_url,
                details.channel_name,
                category_id, // Masukkan ID Kategori
                details.duration,
                details.description
            ]);

            return res.json({ msg: "Video berhasil ditambahkan!", data: saved.rows[0] });
        }

    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Gagal memproses link YouTube" });
    }
};

// 2. Ambil Semua Video (Dengan Nama Kategori)
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
                // Filter by ID (Angka)
                query += ` AND (m.category_id = $${counter} OR m.category_id IN (SELECT id FROM learning_categories WHERE parent_id = $${counter}))`;
                params.push(category);
            } else {
                // Filter by Slug (String) - ✅ Perbaikan di sini (Ganti = jadi IN)
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
        res.json(result.rows);
    } catch (err) {
        console.error("Error Get Videos:", err.message); // Log error lebih jelas
        res.status(500).json({ msg: "Server Error" });
    }
};

const updateVideo = async (req, res) => {
    const { id } = req.params;
    const { title, description, category_id } = req.body;

    try {
        await db.query(
            "UPDATE learning_materials SET title = $1, description = $2, category_id = $3 WHERE id = $4",
            [title, description, category_id, id]
        );
        res.json({ msg: "Video berhasil diperbarui!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Gagal update video" });
    }
};

// 5. Bulk Move (Pindahkan Banyak Video ke Kategori Lain)
const bulkMoveVideos = async (req, res) => {
    const { videoIds, newCategoryId } = req.body; // videoIds: array [1, 2, 5]

    try {
        await db.query(
            "UPDATE learning_materials SET category_id = $1 WHERE id = ANY($2::int[])",
            [newCategoryId, videoIds]
        );
        res.json({ msg: `${videoIds.length} Video berhasil dipindahkan!` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Gagal memindahkan video" });
    }
};

// 6. Bulk Delete (Hapus Banyak Sekaligus)
const bulkDeleteVideos = async (req, res) => {
    const { videoIds } = req.body;

    try {
        await db.query(
            "DELETE FROM learning_materials WHERE id = ANY($1::int[])",
            [videoIds]
        );
        res.json({ msg: `${videoIds.length} Video berhasil dihapus permanen.` });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Gagal menghapus video" });
    }
};

// 3. Hapus Video
const deleteVideo = async (req, res) => {
    try {
        const { id } = req.params;
        await db.query("DELETE FROM learning_materials WHERE id = $1", [id]);
        res.json({ msg: "Video dihapus" });
    } catch (err) {
        res.status(500).json({ msg: "Gagal menghapus" });
    }
};

module.exports = { addVideo, getVideos, deleteVideo, bulkDeleteVideos, bulkMoveVideos, updateVideo};
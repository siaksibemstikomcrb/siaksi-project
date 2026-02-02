const pool = require('../config/db');
const { cloudinary } = require('../config/cloudinary');

exports.createPost = async (req, res) => {
  try {
    const { title, content, subtitle, external_link } = req.body;
    
    if (!title || !content) {
        return res.status(400).json({ message: "Judul dan Konten wajib diisi!" });
    }

    const ukm_id = req.user.ukm_id;
    const author_id = req.user.id;
    const role = req.user.role;

    const status = role === 'super_admin' ? 'approved' : 'pending';
    
    let image_url = null;
    let image_public_id = null;
    
    if (req.file) {
      image_url = req.file.path;
      image_public_id = req.file.filename;
    }

    const slug = title.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '') + '-' + Date.now();

    const newPost = await pool.query(
      `INSERT INTO posts (title, slug, subtitle, content, external_link, image_url, image_public_id, ukm_id, author_id, status) 
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *`,
      [title, slug, subtitle, content, external_link, image_url, image_public_id, ukm_id, author_id, status]
    );

    res.status(201).json({ 
      message: role === 'super_admin' ? "Berita berhasil dipublish!" : "Berita dikirim! Menunggu persetujuan Admin.", 
      data: newPost.rows[0] 
    });

  } catch (err) {
    console.error("Create Post Error:", err);
    res.status(500).json({ message: "Gagal membuat berita." });
  }
};

exports.getPublicPosts = async (req, res) => {
  try {
    const query = `
      SELECT p.*, u.ukm_name 
      FROM posts p
      LEFT JOIN ukms u ON p.ukm_id = u.id 
      WHERE p.status = 'approved'
      ORDER BY p.is_pinned DESC, p.created_at DESC
      LIMIT 20
    `;
    const result = await pool.query(query);
    res.json(result.rows);
  } catch (err) {
    console.error("Get Public Error:", err);
    res.status(500).json({ message: "Gagal mengambil berita." });
  }
};

exports.getPostDetail = async (req, res) => {
  try {
    const { id } = req.params;
    
    pool.query(`UPDATE posts SET views = views + 1 WHERE id = $1`, [id]).catch(err => {});

    const query = `
      SELECT p.*, u.ukm_name
      FROM posts p
      LEFT JOIN ukms u ON p.ukm_id = u.id
      WHERE p.id = $1
    `;
    const result = await pool.query(query, [id]);

    if (result.rows.length === 0) return res.status(404).json({ message: "Berita tidak ditemukan" });

    res.json(result.rows[0]);
  } catch (err) {
    console.error("Get Detail Error:", err);
    res.status(500).json({ message: "Server Error" });
  }
};

exports.updatePostStatus = async (req, res) => {
  try {
    const { id } = req.params;
    const { status } = req.body;

    if (!['approved', 'rejected'].includes(status)) {
        return res.status(400).json({ message: "Status tidak valid" });
    }

    const result = await pool.query(
      `UPDATE posts SET status = $1, updated_at = NOW() WHERE id = $2 RETURNING *`,
      [status, id]
    );

    res.json({ message: `Status berita diubah menjadi ${status}`, data: result.rows[0] });
  } catch (err) {
    console.error("Update Status Error:", err);
    res.status(500).json({ message: "Gagal update status." });
  }
};

exports.togglePinPost = async (req, res) => {
  try {
    const { id } = req.params;
    const { is_pinned } = req.body;

    await pool.query(`UPDATE posts SET is_pinned = $1 WHERE id = $2`, [is_pinned, id]);
    
    res.json({ message: is_pinned ? "Berita disematkan (Pinned)" : "Pin dilepas" });
  } catch (err) {
    console.error("Pin Error:", err);
    res.status(500).json({ message: "Gagal pin berita." });
  }
};

exports.getDashboardPosts = async (req, res) => {
    try {
        const { role, ukm_id } = req.user;
        let query = '';
        let params = [];

        if (role === 'super_admin') {
            query = `
                SELECT p.*, u.ukm_name 
                FROM posts p
                LEFT JOIN ukms u ON p.ukm_id = u.id
                ORDER BY p.created_at DESC
            `;
        } else {
            query = `
                SELECT p.*, u.ukm_name 
                FROM posts p
                LEFT JOIN ukms u ON p.ukm_id = u.id
                WHERE p.ukm_id = $1
                ORDER BY p.created_at DESC
            `;
            params = [ukm_id];
        }

        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error("Dashboard Error:", err);
        res.status(500).json({ message: "Gagal mengambil data dashboard." });
    }
};

exports.deletePost = async (req, res) => {
    try {
        const { id } = req.params;
        const post = await pool.query("SELECT image_public_id FROM posts WHERE id = $1", [id]);
        
        if (post.rows.length > 0 && post.rows[0].image_public_id) {
            await cloudinary.uploader.destroy(post.rows[0].image_public_id);
        }

        await pool.query("DELETE FROM posts WHERE id = $1", [id]);
        res.json({ message: "Berita berhasil dihapus" });
    } catch (err) {
        console.error("Delete Error:", err);
        res.status(500).json({ message: "Gagal menghapus berita." });
    }
};

exports.updatePost = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, subtitle, content, external_link } = req.body;
    
    let imageQuery = "";
    let params = [title, subtitle, content, external_link, id];
    let paramIndex = 6; 

    if (req.file) {
        const oldPost = await pool.query("SELECT image_public_id FROM posts WHERE id = $1", [id]);
        if (oldPost.rows[0]?.image_public_id) {
            await cloudinary.uploader.destroy(oldPost.rows[0].image_public_id);
        }
        
        imageQuery = `, image_url = $${paramIndex}, image_public_id = $${paramIndex+1}`;
        params.push(req.file.path, req.file.filename);
    }

    const query = `
        UPDATE posts 
        SET title = $1, subtitle = $2, content = $3, external_link = $4, updated_at = NOW() ${imageQuery}
        WHERE id = $5 RETURNING *
    `;

    const result = await pool.query(query, params);
    res.json({ message: "Berita berhasil diperbarui", data: result.rows[0] });

  } catch (err) {
    console.error("Update Error:", err);
    res.status(500).json({ message: "Gagal update berita" });
  }
};


const db = require('../config/db');

const createFolder = async (req, res) => {
    const { name, parent_id } = req.body;
    const ukm_id = req.user.ukm_id;

    try {
        const result = await db.query(
            "INSERT INTO folders (name, parent_id, ukm_id) VALUES ($1, $2, $3) RETURNING *",
            [name, parent_id || null, ukm_id]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Gagal membuat folder" });
    }
};

const getFolderContent = async (req, res) => {
    const ukm_id = req.user.ukm_id;
    const parent_id = req.query.folderId && req.query.folderId !== 'null' ? req.query.folderId : null;

    try {
        let folderQuery = "SELECT * FROM folders WHERE ukm_id = $1 AND parent_id ";
        folderQuery += parent_id ? "= $2" : "IS NULL";
        const folderParams = parent_id ? [ukm_id, parent_id] : [ukm_id];
        
        const folders = await db.query(folderQuery + " ORDER BY name ASC", folderParams);

        let docQuery = "SELECT * FROM documents WHERE ukm_id = $1 AND folder_id ";
        docQuery += parent_id ? "= $2" : "IS NULL";
        
        const files = await db.query(docQuery + " ORDER BY created_at DESC", folderParams);

        let currentFolder = null;
        if (parent_id) {
            const curr = await db.query("SELECT * FROM folders WHERE id = $1", [parent_id]);
            currentFolder = curr.rows[0];
        }

        res.json({
            currentFolder,
            folders: folders.rows,
            files: files.rows
        });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Gagal memuat data" });
    }
};

const deleteFolder = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM folders WHERE id = $1 AND ukm_id = $2", [id, req.user.ukm_id]);
        res.json({ msg: "Folder dihapus beserta isinya." });
    } catch (err) {
        res.status(500).json({ msg: "Server Error" });
    }
};

const moveItems = async (req, res) => {
    const { target_folder_id, items } = req.body; 
    const ukm_id = req.user.ukm_id;

    if (!items || items.length === 0) return res.status(400).json({ msg: "Tidak ada item dipilih" });

    try {
        const target = target_folder_id === 'root' ? null : target_folder_id;

        for (const item of items) {
            if (item.type === 'file') {
                await db.query(
                    "UPDATE documents SET folder_id = $1 WHERE id = $2 AND ukm_id = $3",
                    [target, item.id, ukm_id]
                );
            } else if (item.type === 'folder') {
                if (parseInt(target) === parseInt(item.id)) continue; 
                
                await db.query(
                    "UPDATE folders SET parent_id = $1 WHERE id = $2 AND ukm_id = $3",
                    [target, item.id, ukm_id]
                );
            }
        }

        res.json({ msg: "Berhasil dipindahkan!" });
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Gagal memindahkan item" });
    }
};

module.exports = { createFolder, getFolderContent, deleteFolder, moveItems };
const db = require('../config/db');

const getCategoryTree = async (req, res) => {
    try {
        const result = await db.query("SELECT * FROM learning_categories ORDER BY id ASC");
        const categories = result.rows;

        const buildTree = (items, parentId = null) => {
            return items
                .filter(item => item.parent_id === parentId)
                .map(item => ({
                    ...item,
                    children: buildTree(items, item.id)
                }));
        };

        const tree = buildTree(categories, null);
        res.json(tree);
    } catch (err) {
        console.error(err);
        res.status(500).json({ msg: "Server Error" });
    }
};

const createCategory = async (req, res) => {
    const { name, parent_id } = req.body;
    try {
        const slug = name.toLowerCase().replace(/ /g, '-').replace(/[^\w-]+/g, '');
        
        await db.query(
            "INSERT INTO learning_categories (name, slug, parent_id) VALUES ($1, $2, $3)",
            [name, slug, parent_id || null]
        );
        res.json({ msg: "Kategori berhasil dibuat!" });
    } catch (err) {
        res.status(500).json({ msg: "Gagal membuat kategori" });
    }
};

const deleteCategory = async (req, res) => {
    const { id } = req.params;
    try {
        await db.query("DELETE FROM learning_categories WHERE id = $1", [id]);
        res.json({ msg: "Kategori dihapus." });
    } catch (err) {
        res.status(500).json({ msg: "Gagal menghapus (Mungkin masih ada video di dalamnya)" });
    }
};

module.exports = { getCategoryTree, createCategory, deleteCategory };
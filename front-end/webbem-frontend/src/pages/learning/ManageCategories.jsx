import React, { useState, useEffect } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import { 
    Plus, Trash2, FolderTree, ChevronRight, 
    CornerDownRight, Layers, Loader2, FolderOpen 
} from 'lucide-react';

const ManageCategories = () => {
    const [categories, setCategories] = useState([]);
    const [name, setName] = useState('');
    const [parentId, setParentId] = useState('');
    const [loading, setLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    // Fetch Data
    const fetchCategories = async () => {
        setLoading(true);
        try {
            const res = await api.get('/learning/categories');
            setCategories(res.data);
        } catch (err) { 
            console.error(err);
            toast.error("Gagal memuat kategori");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchCategories(); }, []);

    // Handle Submit
    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name.trim()) return;

        setIsSubmitting(true);
        try {
            await api.post('/learning/categories', { 
                name, 
                parent_id: parentId === '' ? null : parentId 
            });
            toast.success("Kategori berhasil ditambahkan!");
            setName('');
            setParentId('');
            fetchCategories();
        } catch (err) {
            toast.error("Gagal menambah kategori");
        } finally {
            setIsSubmitting(false);
        }
    };

    // Handle Delete
    const handleDelete = async (id, categoryName) => {
        if(!confirm(`Hapus kategori "${categoryName}"? \nVideo di dalamnya akan kehilangan kategori.`)) return;
        try {
            await api.delete(`/learning/categories/${id}`);
            fetchCategories();
            toast.success("Kategori dihapus.");
        } catch(e) { toast.error("Gagal hapus kategori."); }
    };

    // --- RENDER HELPERS ---

    // 1. Render Options untuk Dropdown (Recursive text indent)
    const renderSelectOptions = (items, level = 0) => {
        return items.map(cat => (
            <React.Fragment key={cat.id}>
                <option value={cat.id} className="text-gray-900 font-medium">
                    {/* Visual indentasi di dalam select option */}
                    {level === 0 ? '📂 ' : '\u00A0\u00A0\u00A0\u00A0↳ '} 
                    {cat.name}
                </option>
                {cat.children && renderSelectOptions(cat.children, level + 1)}
            </React.Fragment>
        ));
    };

    // 2. Komponen Item Tree (Recursive Visual)
    const CategoryItem = ({ item, level = 0 }) => (
        <div className="relative">
            <div 
                className={`
                    group flex items-center justify-between p-4 mb-3 rounded-2xl border transition-all duration-200
                    ${level === 0 
                        ? 'bg-white border-gray-200 shadow-sm hover:shadow-md hover:border-blue-200' 
                        : 'bg-gray-50/80 border-gray-100 ml-6 md:ml-10 hover:bg-white hover:border-blue-100'}
                `}
            >
                <div className="flex items-center gap-3 overflow-hidden">
                    {/* Ikon Visual Berdasarkan Level */}
                    {level === 0 ? (
                        <div className="w-10 h-10 rounded-xl bg-blue-50 text-blue-600 flex items-center justify-center shrink-0">
                            <Layers size={20} />
                        </div>
                    ) : (
                        <div className="text-gray-400 shrink-0">
                            <CornerDownRight size={20} />
                        </div>
                    )}
                    
                    <div className="flex flex-col">
                        <span className={`font-bold truncate ${level === 0 ? 'text-gray-800 text-base' : 'text-gray-600 text-sm'}`}>
                            {item.name}
                        </span>
                        {level === 0 && (
                            <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                                {item.children?.length || 0} Sub-kategori
                            </span>
                        )}
                    </div>
                </div>

                <button 
                    onClick={() => handleDelete(item.id, item.name)} 
                    className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-colors opacity-100 lg:opacity-0 lg:group-hover:opacity-100 focus:opacity-100"
                    title="Hapus Kategori"
                >
                    <Trash2 size={18} />
                </button>
            </div>

            {/* Render Children (Rekursif) dengan Garis Penghubung */}
            {item.children && item.children.length > 0 && (
                <div className="relative">
                    {/* Garis Vertikal Penghubung */}
                    <div className="absolute left-[20px] md:left-[36px] top-[-10px] bottom-4 w-px border-l-2 border-dashed border-gray-200 z-0" />
                    {item.children.map(child => (
                        <CategoryItem key={child.id} item={child} level={level + 1} />
                    ))}
                </div>
            )}
        </div>
    );

    return (
        <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                        <div className="bg-gradient-to-br from-blue-600 to-indigo-600 text-white p-2 rounded-xl shadow-lg shadow-blue-200">
                            <FolderTree size={24} />
                        </div>
                        Kelola Kategori
                    </h1>
                    <p className="text-gray-500 text-sm mt-2 ml-1">Atur struktur materi pembelajaran (Parent & Sub-Category).</p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                
                {/* --- KOLOM KIRI: FORM (Sticky di Desktop) --- */}
                <div className="lg:col-span-4 lg:sticky lg:top-8 z-10">
                    <div className="bg-white p-6 rounded-3xl shadow-xl shadow-gray-100 border border-gray-100 overflow-hidden relative">
                        {/* Hiasan Background */}
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-50 rounded-bl-full -mr-8 -mt-8 z-0" />
                        
                        <div className="relative z-10">
                            <h3 className="font-bold text-lg text-gray-800 mb-6 flex items-center gap-2">
                                <Plus className="bg-blue-100 text-blue-600 rounded-lg p-1" size={24}/>
                                Tambah Baru
                            </h3>
                            
                            <form onSubmit={handleSubmit} className="space-y-5">
                                <div>
                                    <label className="text-xs font-extrabold uppercase text-gray-500 tracking-wider ml-1 mb-1.5 block">
                                        Nama Kategori
                                    </label>
                                    <input 
                                        value={name} 
                                        onChange={e => setName(e.target.value)} 
                                        required
                                        className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-900 font-bold focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all placeholder:font-normal"
                                        placeholder="Contoh: Javascript"
                                    />
                                </div>

                                <div>
                                    <label className="text-xs font-extrabold uppercase text-gray-500 tracking-wider ml-1 mb-1.5 block">
                                        Induk Kategori (Opsional)
                                    </label>
                                    <div className="relative">
                                        <select 
                                            value={parentId} 
                                            onChange={e => setParentId(e.target.value)}
                                            className="w-full bg-gray-50 border-2 border-gray-100 rounded-xl px-4 py-3 text-gray-700 font-medium focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none transition-all appearance-none cursor-pointer"
                                        >
                                            <option value="">✨ Buat sebagai Kategori Utama (Parent)</option>
                                            <option disabled>──────────</option>
                                            {renderSelectOptions(categories)}
                                        </select>
                                        <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">
                                            <ChevronRight size={16} className="rotate-90" />
                                        </div>
                                    </div>
                                    <p className="text-[11px] text-gray-400 mt-2 px-1 leading-snug">
                                        Pilih induk jika ingin membuat <b>Sub-Kategori</b>. Kosongkan untuk membuat kategori utama.
                                    </p>
                                </div>

                                <button 
                                    disabled={isSubmitting || !name.trim()} 
                                    className="w-full bg-gray-900 hover:bg-black text-white py-4 rounded-xl font-bold text-sm shadow-lg shadow-gray-200 transition-all active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
                                >
                                    {isSubmitting ? <Loader2 className="animate-spin" size={18}/> : <Plus size={18} />}
                                    {isSubmitting ? 'Menyimpan...' : 'Simpan Kategori'}
                                </button>
                            </form>
                        </div>
                    </div>
                </div>

                {/* --- KOLOM KANAN: LIST TREE --- */}
                <div className="lg:col-span-8">
                    <div className="bg-white/50 backdrop-blur-sm rounded-3xl border border-gray-200/60 p-1">
                        {loading ? (
                            <div className="flex flex-col items-center justify-center py-20">
                                <Loader2 className="animate-spin text-blue-500 mb-3" size={32} />
                                <p className="text-gray-400 text-sm font-medium">Memuat struktur kategori...</p>
                            </div>
                        ) : categories.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-20 text-center">
                                <div className="bg-gray-100 p-4 rounded-full mb-4">
                                    <FolderOpen size={32} className="text-gray-400" />
                                </div>
                                <h3 className="font-bold text-gray-800">Belum ada kategori</h3>
                                <p className="text-gray-500 text-sm mt-1">Mulai dengan menambahkan kategori baru di form sebelah.</p>
                            </div>
                        ) : (
                            <div className="p-4 md:p-6">
                                <div className="flex items-center justify-between mb-6 px-2">
                                    <h3 className="font-bold text-gray-700">Struktur Pohon</h3>
                                    <span className="text-xs font-bold bg-blue-50 text-blue-600 px-3 py-1 rounded-full border border-blue-100">
                                        {categories.length} Induk Utama
                                    </span>
                                </div>
                                {/* Render Root Categories */}
                                {categories.map(cat => (
                                    <CategoryItem key={cat.id} item={cat} level={0} />
                                ))}
                            </div>
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
};

export default ManageCategories;
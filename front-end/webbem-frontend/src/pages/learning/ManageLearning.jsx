import React, { useState, useEffect, useMemo } from 'react';
import api from '../../api/axios';
import { toast } from 'sonner';
import { 
    Plus, Trash2, Youtube, Search, Loader2, 
    Filter, MoreHorizontal, CheckSquare, Square, 
    FolderInput, Edit3, X, ChevronDown, CheckCircle
} from 'lucide-react';

const ManageLearning = () => {
    const [videos, setVideos] = useState([]);
    const [categoryTree, setCategoryTree] = useState([]);
    const [loading, setLoading] = useState(true);
    
    const [search, setSearch] = useState("");
    const [filterCategory, setFilterCategory] = useState("all");
    const [selectedIds, setSelectedIds] = useState([]);
    
    const [showImportModal, setShowImportModal] = useState(false);
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    
    const [importForm, setImportForm] = useState({ url: '', category_id: '' });
    const [editForm, setEditForm] = useState(null);
    const [moveTargetId, setMoveTargetId] = useState('');
    const [submitting, setSubmitting] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [vidRes, catRes] = await Promise.all([
                api.get('/learning?category=all'),
                api.get('/learning/categories')
            ]);
            setVideos(vidRes.data);
            setCategoryTree(catRes.data);
        } catch (err) {
            toast.error("Gagal memuat data");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const filteredVideos = useMemo(() => {
        return videos.filter(v => {
            const matchSearch = v.title.toLowerCase().includes(search.toLowerCase()) || 
                                v.channel_name.toLowerCase().includes(search.toLowerCase());
            
            const matchCat = filterCategory === 'all' 
                ? true 
                : v.category_id?.toString() === filterCategory;

            return matchSearch && matchCat;
        });
    }, [videos, search, filterCategory]);

    const toggleSelect = (id) => {
        setSelectedIds(prev => 
            prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
        );
    };

    const toggleSelectAll = () => {
        if (selectedIds.length === filteredVideos.length) {
            setSelectedIds([]);
        } else {
            setSelectedIds(filteredVideos.map(v => v.id));
        }
    };

    const handleBulkDelete = async () => {
        if(!confirm(`Yakin hapus ${selectedIds.length} video terpilih?`)) return;
        try {
            await api.post('/learning/bulk/delete', { videoIds: selectedIds });
            toast.success("Video berhasil dihapus");
            setSelectedIds([]);
            fetchData();
        } catch(e) { toast.error("Gagal hapus"); }
    };

    const handleBulkMove = async (e) => {
        e.preventDefault();
        if(!moveTargetId) return toast.warning("Pilih kategori tujuan!");
        
        setSubmitting(true);
        try {
            await api.put('/learning/bulk/move', { 
                videoIds: selectedIds, 
                newCategoryId: moveTargetId 
            });
            toast.success("Video berhasil dipindahkan!");
            setShowMoveModal(false);
            setSelectedIds([]);
            fetchData();
        } catch(e) { toast.error("Gagal memindahkan"); }
        finally { setSubmitting(false); }
    };

    const handleEditSave = async (e) => {
        e.preventDefault();
        setSubmitting(true);
        try {
            await api.put(`/learning/${editForm.id}`, {
                title: editForm.title,
                description: editForm.description,
                category_id: editForm.category_id
            });
            toast.success("Perubahan disimpan!");
            setShowEditModal(false);
            fetchData();
        } catch(e) { toast.error("Gagal update video"); }
        finally { setSubmitting(false); }
    };

    const handleAddVideo = async (e) => {
        e.preventDefault();
        if(!importForm.url || !importForm.category_id) return toast.warning("Lengkapi form!");
        
        setSubmitting(true);
        try {
            const res = await api.post('/learning', {
                videoUrl: importForm.url,
                category_id: importForm.category_id,
                ukm_id: null
            });
            toast.success(res.data.msg);
            setShowImportModal(false);
            setImportForm({ url: '', category_id: '' });
            fetchData(); 
        } catch (err) {
            toast.error(err.response?.data?.msg || "Gagal import");
        } finally {
            setSubmitting(false);
        }
    };

    const renderCategoryOptions = (cats, level = 0) => {
        return cats.map(cat => (
            <React.Fragment key={cat.id}>
                <option value={cat.id} className={level === 0 ? "font-bold text-black" : "text-gray-600"}>
                    {'\u00A0\u00A0'.repeat(level * 3)} {level > 0 ? '↳ ' : ''} {cat.name}
                </option>
                {cat.children && renderCategoryOptions(cat.children, level + 1)}
            </React.Fragment>
        ));
    };

    return (
        <div className="min-h-screen bg-gray-50/50 p-6 md:p-8 pb-32">
            
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 flex items-center gap-3">
                        <div className="bg-yellow-500 text-black p-2 rounded-xl shadow-lg shadow-yellow-500/20">
                            <Youtube size={24} />
                        </div>
                        Manajemen Video
                    </h1>
                    <p className="text-gray-500 text-sm mt-1 ml-1">Kelola, edit, dan atur struktur video pembelajaran.</p>
                </div>
                <div className="flex gap-3">
                    <button 
                        onClick={() => setShowImportModal(true)}
                        className="bg-black hover:bg-gray-800 text-white px-6 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg transition-all"
                    >
                        <Plus size={18} /> Import Video
                    </button>
                </div>
            </div>

            <div className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-4 items-center justify-between">
                <div className="relative w-full md:w-96">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari judul atau channel..."
                        className="w-full pl-11 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl focus:ring-2 focus:ring-yellow-500 focus:bg-white outline-none transition-all text-sm"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                
                <div className="flex items-center gap-3 w-full md:w-auto">
                    <Filter size={18} className="text-gray-400" />
                    <select 
                        className="bg-gray-50 border border-gray-200 text-gray-700 text-sm rounded-xl px-4 py-2.5 outline-none focus:ring-2 focus:ring-yellow-500 w-full md:w-64 cursor-pointer"
                        value={filterCategory}
                        onChange={(e) => setFilterCategory(e.target.value)}
                    >
                        <option value="all">Semua Kategori</option>
                        {renderCategoryOptions(categoryTree)}
                    </select>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm text-gray-600">
                        <thead className="bg-gray-50/80 border-b border-gray-200 uppercase text-xs font-bold text-gray-500">
                            <tr>
                                <th className="px-6 py-4 w-10">
                                    <button onClick={toggleSelectAll} className="text-gray-400 hover:text-black">
                                        {selectedIds.length > 0 && selectedIds.length === filteredVideos.length 
                                            ? <CheckSquare size={20} className="text-yellow-600"/> 
                                            : <Square size={20}/>
                                        }
                                    </button>
                                </th>
                                <th className="px-6 py-4">Video Info</th>
                                <th className="px-6 py-4">Kategori</th>
                                <th className="px-6 py-4 text-center">Aksi</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {loading ? (
                                <tr><td colSpan="4" className="text-center py-12"><Loader2 className="animate-spin mx-auto text-yellow-500"/></td></tr>
                            ) : filteredVideos.length === 0 ? (
                                <tr><td colSpan="4" className="text-center py-12 text-gray-400 font-medium">Tidak ada video yang cocok.</td></tr>
                            ) : (
                                filteredVideos.map((video) => (
                                    <tr key={video.id} className={`hover:bg-yellow-50/30 transition-colors ${selectedIds.includes(video.id) ? 'bg-yellow-50/60' : ''}`}>
                                        <td className="px-6 py-4">
                                            <button onClick={() => toggleSelect(video.id)} className="text-gray-300 hover:text-yellow-600">
                                                {selectedIds.includes(video.id) ? <CheckSquare size={20} className="text-yellow-600"/> : <Square size={20}/>}
                                            </button>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-4">
                                                <img src={video.thumbnail_url} className="w-24 h-14 object-cover rounded-lg shadow-sm border border-gray-200" alt="thumb" />
                                                <div>
                                                    <p className="font-bold text-gray-900 line-clamp-1">{video.title}</p>
                                                    <p className="text-xs text-gray-400 mt-1 flex items-center gap-2">
                                                        <span className="bg-gray-100 px-1.5 py-0.5 rounded">{video.channel_name}</span> 
                                                        • {video.duration}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className="px-2.5 py-1 bg-gray-100 border border-gray-200 rounded-md text-xs font-bold uppercase text-gray-600">
                                                {video.category_name || 'Uncategorized'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 text-center">
                                            <div className="flex items-center justify-center gap-2">
                                                <button 
                                                    onClick={() => { setEditForm(video); setShowEditModal(true); }}
                                                    className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                                    title="Edit Info"
                                                >
                                                    <Edit3 size={18} />
                                                </button>
                                                <button 
                                                    onClick={() => {
                                                        if(confirm('Hapus video ini?')) {
                                                            api.delete(`/learning/${video.id}`).then(() => {
                                                                toast.success("Terhapus");
                                                                fetchData();
                                                            });
                                                        }
                                                    }}
                                                    className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                                                >
                                                    <Trash2 size={18} />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {selectedIds.length > 0 && (
                <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-black text-white px-6 py-3 rounded-2xl shadow-2xl flex items-center gap-6 z-50 animate-in slide-in-from-bottom-4">
                    <div className="flex items-center gap-3 border-r border-gray-700 pr-6">
                        <div className="bg-yellow-500 text-black font-bold w-6 h-6 flex items-center justify-center rounded-full text-xs">
                            {selectedIds.length}
                        </div>
                        <span className="text-sm font-medium">Video Terpilih</span>
                    </div>
                    <div className="flex gap-2">
                        <button 
                            onClick={() => setShowMoveModal(true)}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-gray-800 rounded-lg transition-colors text-sm font-bold text-yellow-400"
                        >
                            <FolderInput size={18} /> Pindah Kategori
                        </button>
                        <button 
                            onClick={handleBulkDelete}
                            className="flex items-center gap-2 px-4 py-2 hover:bg-red-900/30 text-red-400 rounded-lg transition-colors text-sm font-bold"
                        >
                            <Trash2 size={18} /> Hapus
                        </button>
                    </div>
                    <button onClick={() => setSelectedIds([])} className="ml-2 text-gray-500 hover:text-white"><X size={18}/></button>
                </div>
            )}

            {showEditModal && editForm && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-lg shadow-2xl p-6 relative animate-in zoom-in-95">
                        <button onClick={() => setShowEditModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={20} /></button>
                        <h2 className="text-xl font-bold mb-6">Edit Video</h2>
                        <form onSubmit={handleEditSave} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Judul Video</label>
                                <input 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm font-bold"
                                    value={editForm.title}
                                    onChange={(e) => setEditForm({...editForm, title: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Kategori</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"
                                    value={editForm.category_id || ''}
                                    onChange={(e) => setEditForm({...editForm, category_id: e.target.value})}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {renderCategoryOptions(categoryTree)}
                                </select>
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Deskripsi</label>
                                <textarea 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm h-32 resize-none"
                                    value={editForm.description || ''}
                                    onChange={(e) => setEditForm({...editForm, description: e.target.value})}
                                />
                            </div>
                            <button disabled={submitting} className="w-full bg-black text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                                {submitting ? <Loader2 className="animate-spin"/> : <CheckCircle size={18}/>} Simpan Perubahan
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showMoveModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95">
                        <button onClick={() => setShowMoveModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={20} /></button>
                        <h2 className="text-xl font-bold mb-2">Pindahkan {selectedIds.length} Video</h2>
                        <p className="text-sm text-gray-500 mb-6">Pilih kategori tujuan untuk video yang dipilih.</p>
                        
                        <form onSubmit={handleBulkMove} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Kategori Tujuan</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"
                                    value={moveTargetId}
                                    onChange={(e) => setMoveTargetId(e.target.value)}
                                >
                                    <option value="">-- Pilih Kategori Baru --</option>
                                    {renderCategoryOptions(categoryTree)}
                                </select>
                            </div>
                            <button disabled={submitting} className="w-full bg-yellow-500 hover:bg-yellow-400 text-black py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                                {submitting ? <Loader2 className="animate-spin"/> : <FolderInput size={18}/>} Pindahkan Sekarang
                            </button>
                        </form>
                    </div>
                </div>
            )}

            {showImportModal && (
                <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
                    <div className="bg-white rounded-3xl w-full max-w-md shadow-2xl p-6 relative animate-in zoom-in-95">
                        <button onClick={() => setShowImportModal(false)} className="absolute top-4 right-4 text-gray-400 hover:text-black"><X size={20} /></button>
                        <h2 className="text-xl font-bold mb-4 flex items-center gap-2"><Youtube className="text-red-600"/> Import Materi</h2>
                        
                        <form onSubmit={handleAddVideo} className="space-y-4">
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Link YouTube / Playlist</label>
                                <input 
                                    autoFocus
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"
                                    placeholder="https://youtube.com/..."
                                    value={importForm.url}
                                    onChange={(e) => setImportForm({...importForm, url: e.target.value})}
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-bold uppercase mb-1">Kategori</label>
                                <select 
                                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-sm"
                                    value={importForm.category_id}
                                    onChange={(e) => setImportForm({...importForm, category_id: e.target.value})}
                                >
                                    <option value="">Pilih Kategori</option>
                                    {renderCategoryOptions(categoryTree)}
                                </select>
                            </div>
                            <button disabled={submitting} className="w-full bg-blue-600 text-white py-3 rounded-xl font-bold flex justify-center items-center gap-2">
                                {submitting ? <Loader2 className="animate-spin"/> : <Plus size={18}/>} Simpan Materi
                            </button>
                        </form>
                    </div>
                </div>
            )}

        </div>
    );
};

export default ManageLearning;
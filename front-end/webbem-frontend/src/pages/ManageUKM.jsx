import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { toast } from 'sonner';
import { 
    Building, Trash2, Plus, Search, 
    XCircle, Users, X, Loader2, CheckCircle 
} from 'lucide-react';

const ManageUKM = () => {
    const [ukms, setUkms] = useState([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [formLoading, setFormLoading] = useState(false);
    const [formData, setFormData] = useState({ ukm_name: '', leader_name: '', description: '' });

    const fetchUkms = async () => {
        try {
            const res = await api.get('/ukms'); 
            setUkms(res.data);
        } catch (error) {
            console.error("Gagal load UKM", error);
            toast.error("Gagal memuat data UKM.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchUkms();
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setFormLoading(true);
        
        try {
            await api.post('/ukms', formData);
            toast.success('Organisasi Berhasil Didaftarkan!');
            
            setFormData({ ukm_name: '', leader_name: '', description: '' });
            setIsModalOpen(false);
            
            fetchUkms(); 
        } catch (err) {
            console.error(err);
            toast.error(err.response?.data?.msg || 'Gagal mendaftarkan organisasi');
        } finally {
            setFormLoading(false);
        }
    };

    const handleDelete = async (id, ukmName) => {
        const confirmDelete = window.confirm(
            `⚠️ PERINGATAN!\n\nMenghapus UKM "${ukmName}" akan MENGHAPUS SEMUA ANGGOTA (User) di dalamnya.\n\nLanjut hapus?`
        );

        if (!confirmDelete) return;

        try {
            await api.delete(`/ukms/${id}`); 
            toast.success(`UKM ${ukmName} berhasil dihapus!`);
            setUkms(prevUkms => prevUkms.filter(ukm => ukm.id !== id));
        } catch (error) {
            console.error(error);
            toast.error("Gagal menghapus UKM.");
        }
    };

    const filteredUkms = ukms.filter(ukm => 
        ukm.ukm_name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (ukm.description && ukm.description.toLowerCase().includes(searchTerm.toLowerCase()))
    );

    return (
        <div className="p-4 md:p-6 min-h-screen bg-gray-50 font-sans text-slate-800 pb-20">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-bold text-slate-900 flex items-center gap-2">
                        <Building className="text-blue-600" /> Kelola UKM
                    </h1>
                    <p className="text-sm text-gray-500 mt-1">Manajemen Unit Kegiatan Mahasiswa</p>
                </div>
                
                <button 
                    onClick={() => setIsModalOpen(true)}
                    className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-5 py-3 md:py-2.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 transition-all shadow-md active:scale-95"
                >
                    <Plus size={18} /> Tambah UKM Baru
                </button>
            </div>

            <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200 mb-6 sticky top-0 z-10 md:static">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="relative w-full md:w-96">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                        <input 
                            type="text" 
                            placeholder="Cari nama UKM..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="w-full pl-10 pr-4 py-3 md:py-2.5 bg-gray-50 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all text-sm"
                        />
                    </div>
                    <div className="hidden md:block text-sm text-gray-500 font-medium bg-blue-50 px-4 py-2 rounded-lg border border-blue-100">
                        Total: <span className="text-blue-700 font-bold ml-1">{filteredUkms.length}</span>
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400 gap-3">
                    <Loader2 className="animate-spin text-blue-600" size={32} />
                    <p className="text-sm">Memuat data...</p>
                </div>
            ) : filteredUkms.length === 0 ? (
                <div className="flex flex-col items-center justify-center py-20 text-gray-400">
                    <XCircle size={48} className="mb-3 opacity-20" />
                    <p>Tidak ada data UKM ditemukan.</p>
                </div>
            ) : (
                <>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 md:hidden">
                        {filteredUkms.map((ukm) => (
                            <div key={ukm.id} className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-12 h-12 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center overflow-hidden shrink-0">
                                        {ukm.logo_url ? (
                                            <img src={ukm.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="text-xs font-bold text-gray-400">
                                                {ukm.ukm_name.substring(0,2).toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h3 className="font-bold text-slate-800 text-lg leading-tight truncate">{ukm.ukm_name}</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                            <Users size={12} /> 
                                            <span className="truncate">Ketua: {ukm.leader_name || '-'}</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="bg-gray-50 p-3 rounded-lg text-xs text-gray-600 line-clamp-2 min-h-[3rem]">
                                    {ukm.description || "Belum ada deskripsi."}
                                </div>
                                <div className="mt-auto pt-2 border-t border-gray-100">
                                    <button 
                                        onClick={() => handleDelete(ukm.id, ukm.ukm_name)}
                                        className="w-full flex items-center justify-center gap-2 py-2.5 bg-red-50 text-red-600 font-semibold rounded-lg text-sm active:bg-red-100 transition-colors"
                                    >
                                        <Trash2 size={16} /> Hapus UKM
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="hidden md:block bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className="bg-gray-50 text-gray-600 text-xs uppercase tracking-wider font-bold">
                                    <th className="p-4 border-b w-16 text-center">No</th>
                                    <th className="p-4 border-b w-20">Logo</th>
                                    <th className="p-4 border-b">Nama UKM & Ketua</th>
                                    <th className="p-4 border-b w-1/3">Deskripsi</th>
                                    <th className="p-4 border-b text-center w-24">Aksi</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 text-sm">
                                {filteredUkms.map((ukm, index) => (
                                    <tr key={ukm.id} className="hover:bg-blue-50/30 transition-colors group">
                                        <td className="p-4 text-center text-gray-500 font-medium">{index + 1}</td>
                                        <td className="p-4">
                                            <div className="w-10 h-10 rounded-full bg-white overflow-hidden border border-gray-200 shadow-sm flex items-center justify-center">
                                                {ukm.logo_url ? (
                                                    <img src={ukm.logo_url} alt="Logo" className="w-full h-full object-cover" />
                                                ) : (
                                                    <span className="text-xs font-bold text-gray-400">
                                                        {ukm.ukm_name.substring(0,2).toUpperCase()}
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="p-4">
                                            <p className="font-bold text-slate-800 text-base">{ukm.ukm_name}</p>
                                            <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                                                <Users size={12} /> Ketua: {ukm.leader_name || '-'}
                                            </div>
                                        </td>
                                        <td className="p-4 text-gray-500">
                                            <p className="truncate max-w-xs">{ukm.description || "-"}</p>
                                        </td>
                                        <td className="p-4 text-center">
                                            <button 
                                                onClick={() => handleDelete(ukm.id, ukm.ukm_name)}
                                                className="p-2 text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors"
                                                title="Hapus UKM"
                                            >
                                                <Trash2 size={16} />
                                            </button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </>
            )}

            {isModalOpen && (
                <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
                    <div className="bg-white w-full max-w-2xl rounded-3xl shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
                        <div className="flex justify-between items-center px-6 py-4 border-b border-gray-100 bg-gray-50">
                            <div className="flex items-center gap-3">
                                <div className="bg-blue-100 p-2 rounded-lg text-blue-600">
                                    <Building size={20} />
                                </div>
                                <h2 className="text-xl font-bold text-gray-800">Registrasi Organisasi</h2>
                            </div>
                            <button 
                                onClick={() => setIsModalOpen(false)}
                                className="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-200 rounded-full transition-colors"
                            >
                                <X size={24} />
                            </button>
                        </div>

                        <div className="p-6 md:p-8 max-h-[80vh] overflow-y-auto">
                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <InputGroup 
                                        label="Nama Organisasi" 
                                        value={formData.ukm_name} 
                                        placeholder="Contoh: BEM STIKOM" 
                                        onChange={(v) => setFormData({...formData, ukm_name: v})} 
                                    />
                                    <InputGroup 
                                        label="Ketua / Penanggung Jawab" 
                                        value={formData.leader_name} 
                                        placeholder="Nama Lengkap Ketua" 
                                        onChange={(v) => setFormData({...formData, leader_name: v})} 
                                    />
                                </div>
                                
                                <InputGroup 
                                    label="Deskripsi Singkat" 
                                    isTextArea 
                                    value={formData.description} 
                                    placeholder="Jelaskan visi misi organisasi..." 
                                    onChange={(v) => setFormData({...formData, description: v})} 
                                />

                                <div className="pt-4 flex gap-3 justify-end">
                                    <button 
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold rounded-xl transition-colors"
                                    >
                                        Batal
                                    </button>
                                    <button 
                                        type="submit" 
                                        disabled={formLoading}
                                        className="px-8 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg hover:shadow-blue-500/30 transition-all flex items-center gap-2 disabled:bg-gray-400"
                                    >
                                        {formLoading ? <Loader2 className="animate-spin" size={20} /> : <CheckCircle size={20} />}
                                        {formLoading ? 'Menyimpan...' : 'Simpan Data'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

const InputGroup = ({ label, value, placeholder, onChange, isTextArea }) => (
  <div className="space-y-2">
    <label className="text-xs font-bold text-gray-500 uppercase tracking-wide ml-1">{label}</label>
    {isTextArea ? (
        <textarea 
            required value={value} 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium h-32 focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none outline-none placeholder-gray-400" 
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)} 
        />
    ) : (
        <input 
            type="text" required value={value} 
            className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:bg-white focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder-gray-400" 
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)} 
        />
    )}
  </div>
);

export default ManageUKM;
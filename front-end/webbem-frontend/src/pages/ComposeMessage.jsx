import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { Send, Image as IconImage, CheckCircle, Users, Loader2, ChevronDown, Megaphone, Building2, X } from 'lucide-react';
import { toast } from 'sonner';

const ComposeMessage = () => {
    const [ukms, setUkms] = useState([]);
    const [formData, setFormData] = useState({ title: '', description: '', target: '' });
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);

    useEffect(() => {
        const fetchUkms = async () => {
            try {
                const res = await api.get('/mail/ukm-list');
                setUkms(res.data);
            } catch (err) {
                console.error(err);
            }
        };
        fetchUkms();

        const handleClickOutside = (event) => {
            if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
                setIsOpen(false);
            }
        };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!file || !formData.target) {
            return toast.warning('Data Belum Lengkap', {
                description: 'Mohon pilih tujuan dan lampirkan file surat.'
            });
        }

        const data = new FormData();
        data.append('title', formData.title);
        data.append('description', formData.description);
        data.append('target_ukm_ids', formData.target);
        data.append('attachment', file);

        setLoading(true);
        const toastId = toast.loading('Sedang mengirim surat...');

        try {
            const res = await api.post('/mail/send', data);
            toast.success('Berhasil Terkirim!', {
                id: toastId, 
                description: res.data.msg,
                duration: 4000, 
            });
            setFormData({ title: '', description: '', target: '' });
            setFile(null);
        } catch (err) {
            toast.error('Gagal Mengirim', {
                id: toastId,
                description: err.response?.data?.msg || 'Terjadi kesalahan server.',
            });
        } finally {
            setLoading(false);
        }
    };

    const getSelectedLabel = () => {
        if (!formData.target) return "Pilih Penerima...";
        if (formData.target === 'BROADCAST_ALL') return " Broadcast ke Semua User";
        const selected = ukms.find(u => u.id == formData.target);
        return selected ? selected.name : "Pilih Penerima...";
    };

    return (
        <div className="p-4 md:p-6 max-w-4xl mx-auto pb-24 font-sans">
            <div className="mb-6 border-b border-gray-200 pb-4">
                <h1 className="text-xl md:text-2xl font-extrabold text-gray-900 flex items-center gap-2">
                    <Send className="text-blue-600" size={24} /> 
                    Kirim Informasi
                </h1>
                <p className="text-gray-500 mt-1 text-sm md:text-base">Formulir pengiriman surat atau broadcast informasi.</p>
            </div>
            
            <form onSubmit={handleSubmit} className="space-y-6">
                
                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">
                        Tujuan Pengiriman
                    </label>
                    
                    <div className="relative" ref={dropdownRef}>
                        <button
                            type="button"
                            onClick={() => setIsOpen(!isOpen)}
                            className={`w-full p-4 flex items-center justify-between bg-gray-50 border rounded-xl transition-all duration-200 
                                ${isOpen ? 'border-blue-500 ring-2 ring-blue-100 bg-white' : 'border-gray-300 hover:border-gray-400 hover:bg-gray-100'}
                            `}
                        >
                            <div className="flex items-center gap-3 overflow-hidden">
                                <div className={`p-2 rounded-lg shrink-0 ${formData.target === 'BROADCAST_ALL' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'}`}>
                                    {formData.target === 'BROADCAST_ALL' ? <Megaphone size={20}/> : <Users size={20}/>}
                                </div>
                                <span className={`font-bold text-sm md:text-base truncate ${!formData.target ? 'text-gray-400' : 'text-gray-800'}`}>
                                    {getSelectedLabel()}
                                </span>
                            </div>
                            <ChevronDown size={18} className={`text-gray-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}/>
                        </button>

                        {isOpen && (
                            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-xl shadow-xl max-h-80 overflow-y-auto animate-in fade-in slide-in-from-top-2 custom-scrollbar">
                                <div 
                                    onClick={() => { setFormData({...formData, target: 'BROADCAST_ALL'}); setIsOpen(false); }}
                                    className="p-4 border-b border-gray-100 hover:bg-orange-50 cursor-pointer group transition-colors"
                                >
                                    <div className="flex items-center gap-3">
                                        <div className="p-2 bg-orange-100 text-orange-600 rounded-lg group-hover:bg-orange-200 transition-colors">
                                            <Megaphone size={18} />
                                        </div>
                                        <div>
                                            <p className="font-bold text-gray-800 text-sm">BROADCAST KE SEMUA USER</p>
                                            <p className="text-xs text-gray-500">Kirim notifikasi ke seluruh UKM & Mahasiswa</p>
                                        </div>
                                    </div>
                                </div>

                                <div className="p-2 bg-gray-50 text-[10px] font-bold text-gray-400 uppercase tracking-wider px-4 py-2 sticky top-0">
                                    Pilih UKM Spesifik
                                </div>
                                
                                {ukms.length > 0 ? (
                                    ukms.map(u => (
                                        <div 
                                            key={u.id} 
                                            onClick={() => { setFormData({...formData, target: u.id}); setIsOpen(false); }}
                                            className="px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center gap-3 border-b border-gray-50 last:border-0 transition-colors"
                                        >
                                            <Building2 size={16} className="text-gray-400" />
                                            <span className="text-sm font-medium text-gray-700">{u.name}</span>
                                            {formData.target == u.id && <CheckCircle size={16} className="ml-auto text-blue-600" />}
                                        </div>
                                    ))
                                ) : (
                                    <div className="p-4 text-center text-sm text-gray-400">Memuat data UKM...</div>
                                )}
                            </div>
                        )}
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all space-y-5">
                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Judul Surat / Event</label>
                        <input 
                            type="text" 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none font-bold text-sm md:text-base transition-all"
                            placeholder="Contoh: Undangan Rapat Koordinasi..."
                            value={formData.title}
                            onChange={e=>setFormData({...formData, title:e.target.value})}
                            required 
                        />
                    </div>

                    <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">Isi Pesan</label>
                        <textarea 
                            rows="5" 
                            className="w-full p-4 bg-gray-50 border border-gray-200 rounded-xl text-gray-900 placeholder-gray-400 focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none resize-y text-sm md:text-base transition-all leading-relaxed"
                            placeholder="Tulis detail pesan disini..."
                            value={formData.description}
                            onChange={e=>setFormData({...formData, description:e.target.value})}
                            required 
                        />
                    </div>
                </div>

                <div className="bg-white p-4 md:p-6 rounded-2xl border border-gray-200 shadow-sm hover:shadow-md transition-all">
                    <label className="block text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">Lampiran (Foto/Dokumen)</label>
                    <div className={`border-2 border-dashed rounded-xl p-6 md:p-8 text-center transition cursor-pointer relative group overflow-hidden ${file ? 'border-green-500 bg-green-50/50' : 'border-gray-300 hover:border-blue-400 hover:bg-blue-50/50'}`}>
                        <input 
                            type="file" 
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                            onChange={e => setFile(e.target.files[0])}
                        />
                        <div className="flex flex-col items-center justify-center text-gray-500 group-hover:scale-105 transition-transform duration-300">
                            {file ? (
                                <>
                                    <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mb-3 shadow-sm">
                                        <CheckCircle size={24} />
                                    </div>
                                    <span className="font-bold text-gray-900 text-sm md:text-base break-all px-4">{file.name}</span>
                                    <span className="text-xs text-green-600 font-bold mt-1 bg-green-100 px-2 py-1 rounded-md">File Siap Dikirim</span>
                                </>
                            ) : (
                                <>
                                    <div className="w-12 h-12 bg-blue-50 text-blue-500 rounded-full flex items-center justify-center mb-3 shadow-sm group-hover:bg-blue-600 group-hover:text-white transition-colors">
                                        <IconImage size={24} />
                                    </div>
                                    <span className="font-bold text-gray-700 text-sm">Klik untuk upload file</span>
                                    <span className="text-xs text-gray-400 mt-1">PDF, DOCX, JPG, PNG (Max 10MB)</span>
                                </>
                            )}
                        </div>
                        {file && (
                            <button 
                                type="button"
                                onClick={(e) => { e.stopPropagation(); setFile(null); }}
                                className="absolute top-2 right-2 p-1.5 bg-white rounded-full text-red-500 shadow hover:bg-red-50 z-20"
                                title="Hapus file"
                            >
                                <X size={14}/>
                            </button>
                        )}
                    </div>
                </div>

                <div className="pt-4">
                    <button 
                        disabled={loading} 
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-xl font-bold text-base md:text-lg transition-all shadow-lg shadow-blue-200 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed flex justify-center items-center gap-3 transform active:scale-[0.99]"
                    >
                        {loading ? (
                            <><Loader2 size={24} className="animate-spin" /> Mengirim Pesan...</>
                        ) : (
                            <><Send size={24}/> Kirim Sekarang</>
                        )}
                    </button>
                </div>

            </form>
        </div>
    );
};

export default ComposeMessage;
import { useState, useEffect } from 'react';
import { Send, Users, Building, AlertCircle, Upload, FileText, X } from 'lucide-react';
import api from '../api/axios';

const BroadcastPage = () => {
    const [ukms, setUkms] = useState([]);
    
    const [title, setTitle] = useState('');
    const [description, setDescription] = useState('');
    const [targetId, setTargetId] = useState('');
    const [file, setFile] = useState(null);

    const [loading, setLoading] = useState(false);

    useEffect(() => {
        const fetchUKMs = async () => {
            try {
                const res = await api.get('/ukms');
                setUkms(res.data);
            } catch (err) {
                console.error("Gagal ambil UKM", err);
            }
        };
        fetchUKMs();
    }, []);

    const handleFileChange = (e) => {
        if (e.target.files[0]) {
            setFile(e.target.files[0]);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        
        if (!title || !description || !file) {
            alert("Judul, Pesan, dan Lampiran File wajib diisi!");
            return;
        }

        setLoading(true);

        const formData = new FormData();
        formData.append('title', title);
        formData.append('description', description);
        
        if (targetId === '') {
            formData.append('target_ukm_ids', 'BROADCAST_ALL');
        } else {
            formData.append('target_ukm_ids', targetId);
        }

        formData.append('file', file);

        try {
            await api.post('/mail', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });

            alert("Pesan berhasil dikirim!");
            
            setTitle('');
            setDescription('');
            setTargetId('');
            setFile(null);
            
        } catch (err) {
            console.error(err);
            alert("Gagal mengirim: " + (err.response?.data?.msg || err.message));
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="max-w-2xl mx-auto p-6">
            <div className="flex items-center gap-3 mb-8">
                <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
                    <Send className="text-white" size={24} />
                </div>
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Kirim Surat / Pengumuman</h1>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Target Penerima</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3
                                ${targetId === '' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input 
                                    type="radio" 
                                    name="target" 
                                    checked={targetId === ''} 
                                    onChange={() => setTargetId('')}
                                    className="hidden"
                                />
                                <Users className={targetId === '' ? 'text-blue-600' : 'text-gray-400'} />
                                <span className="font-bold text-gray-800">Semua User (Broadcast)</span>
                            </label>

                            <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3
                                ${targetId !== '' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Building className={targetId !== '' ? 'text-blue-600' : 'text-gray-400'} />
                                        <span className="font-bold text-gray-800">Spesifik UKM</span>
                                    </div>
                                    <select 
                                        value={targetId}
                                        onChange={(e) => setTargetId(e.target.value)}
                                        className="w-full text-sm p-2 rounded-lg border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-blue-500"
                                        onClick={(e) => e.stopPropagation()} 
                                    >
                                        <option value="" disabled>Pilih UKM...</option>
                                        {ukms.map(ukm => (
                                            <option key={ukm.id} value={ukm.id}>{ukm.name || ukm.ukm_name}</option>
                                        ))}
                                    </select>
                                </div>
                            </label>
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Judul Surat/Pengumuman</label>
                        <input 
                            type="text" 
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Contoh: Undangan Rapat Koordinasi"
                            className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            required
                        />
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Isi Pesan</label>
                        <textarea 
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            placeholder="Tulis detail pesan di sini..."
                            rows="4"
                            className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 transition-all outline-none"
                            required
                        ></textarea>
                    </div>

                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Lampiran File (PDF/Gambar)</label>
                        <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors relative">
                            <input 
                                type="file" 
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                                required
                            />
                            {file ? (
                                <div className="flex items-center justify-center gap-2 text-blue-600">
                                    <FileText size={24} />
                                    <span className="font-bold truncate">{file.name}</span>
                                    <button onClick={(e) => {e.preventDefault(); setFile(null)}} className="z-10 p-1 hover:bg-blue-100 rounded-full">
                                        <X size={16}/>
                                    </button>
                                </div>
                            ) : (
                                <div className="flex flex-col items-center text-gray-400">
                                    <Upload size={32} className="mb-2" />
                                    <span className="font-medium text-sm">Klik atau tarik file ke sini</span>
                                    <span className="text-xs text-gray-300 mt-1">Wajib diisi</span>
                                </div>
                            )}
                        </div>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2 items-center active:scale-95"
                    >
                        {loading ? <Loader2 className="animate-spin"/> : <Send size={20} />}
                        {loading ? 'Mengirim...' : 'Kirim Sekarang'}
                    </button>
                </form>
            </div>
        </div>
    );
};

const Loader2 = ({className}) => (
    <svg className={className} width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M21 12a9 9 0 1 1-6.219-8.56" /></svg>
);

export default BroadcastPage;
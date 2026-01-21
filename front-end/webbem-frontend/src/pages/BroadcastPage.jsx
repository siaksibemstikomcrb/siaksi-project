import { useState, useEffect } from 'react';
import { Send, Users, Building, AlertCircle } from 'lucide-react';
import api from '../api/axios';

const BroadcastPage = () => {
    const [ukms, setUkms] = useState([]);
    const [formData, setFormData] = useState({
        title: '',
        message: '',
        target_ukm_id: '' // Kosong = Semua User
    });
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

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);
        try {
            const payload = {
                ...formData,
                target_ukm_id: formData.target_ukm_id === '' ? null : formData.target_ukm_id
            };

            await api.post('/admin/broadcast', payload);
            alert("Pesan berhasil disiarkan!");
            setFormData({ title: '', message: '', target_ukm_id: '' }); 
        } catch (err) {
            console.error(err);
            alert("Gagal mengirim pesan: " + (err.response?.data?.msg || err.message));
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
                <h1 className="text-2xl font-black text-gray-900 tracking-tight">Siarkan Pengumuman</h1>
            </div>

            <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* Pilihan Target */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Target Penerima</label>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3
                                ${formData.target_ukm_id === '' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <input 
                                    type="radio" 
                                    name="target_ukm_id" 
                                    value="" 
                                    checked={formData.target_ukm_id === ''} 
                                    onChange={handleChange}
                                    className="hidden"
                                />
                                <Users className={formData.target_ukm_id === '' ? 'text-blue-600' : 'text-gray-400'} />
                                <span className="font-bold text-gray-800">Semua User</span>
                            </label>

                            <label className={`cursor-pointer p-4 rounded-xl border-2 transition-all flex items-center gap-3
                                ${formData.target_ukm_id !== '' ? 'border-blue-600 bg-blue-50' : 'border-gray-200 hover:border-gray-300'}`}>
                                <div className="flex-1">
                                    <div className="flex items-center gap-3 mb-2">
                                        <Building className={formData.target_ukm_id !== '' ? 'text-blue-600' : 'text-gray-400'} />
                                        <span className="font-bold text-gray-800">Spesifik UKM</span>
                                    </div>
                                    
                                    {/* --- DROPDOWN FIX START --- */}
                                    <select 
                                        name="target_ukm_id"
                                        value={formData.target_ukm_id}
                                        onChange={handleChange}
                                        // PERBAIKAN 1: Tambahkan padding besar (p-3/p-4) agar tidak gepeng
                                        className="w-full text-sm p-3 rounded-lg border border-gray-300 bg-gray-50 text-gray-900 font-bold focus:outline-none focus:ring-2 focus:ring-blue-500"
                                        onClick={(e) => e.stopPropagation()} 
                                    >
                                        {/* PERBAIKAN 2: Pakai style={{ color: 'black' }} untuk memaksa warna hitam */}
                                        <option value="" disabled style={{ color: 'gray' }}>Pilih UKM...</option>
                                        
                                        {ukms.map(ukm => (
                                            <option 
                                                key={ukm.id} 
                                                value={ukm.id} 
                                                style={{ color: 'black', backgroundColor: 'white' }} // Force Style
                                            >
                                                {ukm.ukm_name} {/* Pastikan fieldnya ukm_name atau name sesuai API */}
                                            </option>
                                        ))}
                                    </select>
                                    {/* --- DROPDOWN FIX END --- */}

                                </div>
                            </label>
                        </div>
                    </div>

                    {/* Input Judul */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Judul Pengumuman</label>
                        <input 
                            type="text" 
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            placeholder="Contoh: Libur Kegiatan Kampus"
                            className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                            required
                        />
                    </div>

                    {/* Input Pesan */}
                    <div>
                        <label className="block text-sm font-bold text-gray-900 mb-2">Isi Pesan</label>
                        <textarea 
                            name="message"
                            value={formData.message}
                            onChange={handleChange}
                            placeholder="Tulis pesan lengkap di sini..."
                            rows="4"
                            className="w-full p-4 rounded-xl bg-gray-50 border border-gray-200 text-gray-900 font-medium focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all placeholder-gray-400"
                            required
                        ></textarea>
                    </div>

                    <div className="bg-yellow-50 p-4 rounded-xl flex gap-3 text-yellow-800 text-sm border border-yellow-100">
                        <AlertCircle size={20} className="flex-shrink-0" />
                        <p className="font-medium">Pesan ini akan muncul di menu notifikasi penerima dan tidak bisa ditarik kembali mohon gunakan dengan bijak.</p>
                    </div>

                    <button 
                        type="submit" 
                        disabled={loading}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl transition-all shadow-lg shadow-blue-200 disabled:opacity-50 disabled:cursor-not-allowed flex justify-center gap-2 items-center active:scale-95"
                    >
                        {loading ? 'Mengirim...' : (
                            <>
                                <Send size={20} /> Kirim Sekarang
                            </>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default BroadcastPage;
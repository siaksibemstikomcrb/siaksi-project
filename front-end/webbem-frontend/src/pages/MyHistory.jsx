import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, Calendar, CheckCircle, AlertCircle, Inbox } from 'lucide-react';

const MyHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');

    useEffect(() => {
        const fetchHistory = async () => {
            // --- SAFETY CHECK: JANGAN PANGGIL API JIKA USERID KOSONG ---
            if (!userId || userId === 'null') {
                console.warn("User ID tidak ditemukan. Harap login ulang.");
                setLoading(false);
                return;
            }

            try {
                // Mengambil data dari endpoint history yang sudah kita buat
                const res = await api.get(`/attendance/history/${userId}`);
                setHistory(res.data.history);
            } catch (err) {
                console.error("Gagal mengambil riwayat:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchHistory();
    }, [userId]);

    if (loading) return <div className="p-6 text-center text-gray-500">Memuat data riwayat...</div>;

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold mb-6 text-gray-800">Riwayat Presensi Saya</h1>
            
            {history.length > 0 ? (
                <div className="grid gap-4">
                    {history.map((item, index) => (
                        <div key={index} className="bg-white p-4 rounded-xl shadow-sm border border-gray-100 flex items-center justify-between hover:shadow-md transition-shadow">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-full ${
                                    item.status === 'Hadir' ? 'bg-green-100 text-green-600' : 
                                    item.status === 'Telat' ? 'bg-orange-100 text-orange-600' : 'bg-blue-100 text-blue-600'
                                }`}>
                                    {item.status === 'Hadir' ? <CheckCircle size={24} /> : <AlertCircle size={24} />}
                                </div>
                                <div>
                                    <h3 className="font-bold text-gray-800">{item.event_name}</h3>
                                    <div className="flex gap-4 text-sm text-gray-500 mt-1">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={14} /> 
                                            {new Date(item.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                        </span>
                                        <span className="flex items-center gap-1">
                                            <Clock size={14} /> 
                                            {item.attendance_time || '--:--'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                            <div className="text-right">
                                <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                                    item.status === 'Hadir' ? 'bg-green-50 text-green-700 border border-green-200' : 
                                    item.status === 'Telat' ? 'bg-orange-50 text-orange-700 border border-orange-200' : 
                                    'bg-blue-50 text-blue-700 border border-blue-200'
                                }`}>
                                    {item.status}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-12 flex flex-col items-center justify-center text-gray-400">
                    <Inbox size={48} className="mb-4 opacity-20" />
                    <p className="font-medium">Belum ada riwayat presensi tercatat.</p>
                </div>
            )}
        </div>
    );
};

export default MyHistory;
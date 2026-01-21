import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
    ArrowLeft, Calendar, MapPin, Clock, 
    FileSpreadsheet, CheckCircle2, XCircle, AlertCircle, User 
} from 'lucide-react';

const MonitoringDetail = () => {
    const { id } = useParams(); // Ambil ID Jadwal dari URL
    const navigate = useNavigate();
    const [detail, setDetail] = useState(null);
    const [attendees, setAttendees] = useState([]);
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState({ hadir: 0, izin: 0, telat: 0, total: 0 });

    useEffect(() => {
        const fetchData = async () => {
            try {
                // 1. Ambil Detail Jadwal
                const scheduleRes = await api.get(`/schedules/${id}`);
                setDetail(scheduleRes.data);

                // 2. Ambil Daftar Hadir (Kita butuh endpoint ini di backend)
                // Note: Pastikan backend punya endpoint: GET /api/attendance/schedule/:id
                const attendRes = await api.get(`/attendance/schedule/${id}`);
                setAttendees(attendRes.data);

                // Hitung Statistik
                const s = { hadir: 0, izin: 0, telat: 0, total: attendRes.data.length };
                attendRes.data.forEach(a => {
                    if (a.status === 'Hadir') s.hadir++;
                    else if (a.status === 'Izin') s.izin++;
                    else if (a.status === 'Telat') s.telat++;
                });
                setStats(s);

            } catch (err) {
                console.error("Gagal ambil data:", err);
                // alert("Gagal memuat data detail."); 
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [id]);

    // --- FUNGSI DOWNLOAD EXCEL ---
    const handleDownloadExcel = async () => {
        try {
            const response = await api.get(`/admin/export/${id}`, {
                responseType: 'blob', // PENTING: Agar dianggap file
            });

            // Buat link download virtual
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            // Nama file saat didownload
            link.setAttribute('download', `Laporan_${detail?.event_name || 'Kegiatan'}.xlsx`); 
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (err) {
            alert("Gagal mendownload laporan. Pastikan Anda adalah Admin.");
        }
    };

    if (loading) return <div className="p-10 text-center text-gray-500 font-bold">Memuat Data Presensi...</div>;
    if (!detail) return <div className="p-10 text-center text-red-500 font-bold">Data tidak ditemukan.</div>;

    return (
        <div className="max-w-6xl mx-auto p-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
            
            {/* HEADER & NAVIGASI */}
            <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-gray-500 hover:text-blue-600 font-bold mb-6 transition-colors">
                <ArrowLeft size={20} /> Kembali ke Monitoring
            </button>

            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 tracking-tight">{detail.event_name}</h1>
                    <div className="flex flex-wrap gap-4 mt-2 text-sm font-medium text-gray-600">
                        <div className="flex items-center gap-1"><Calendar size={16} className="text-blue-500"/> {new Date(detail.event_date).toLocaleDateString('id-ID', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}</div>
                        <div className="flex items-center gap-1"><Clock size={16} className="text-orange-500"/> {detail.start_time} - {detail.end_time} WIB</div>
                        <div className="flex items-center gap-1"><MapPin size={16} className="text-red-500"/> {detail.location || 'Online'}</div>
                    </div>
                </div>

                {/* TOMBOL DOWNLOAD UTAMA */}
                <button 
                    onClick={handleDownloadExcel}
                    className="bg-green-600 hover:bg-green-700 text-white px-6 py-3 rounded-xl font-bold flex items-center gap-2 shadow-lg shadow-green-100 transition-all active:scale-95"
                >
                    <FileSpreadsheet size={20} /> Download Laporan Excel
                </button>
            </div>

            {/* STATISTIK CARDS */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <StatCard label="Total Peserta" value={stats.total} color="blue" icon={<User size={20}/>} />
                <StatCard label="Hadir Tepat Waktu" value={stats.hadir} color="green" icon={<CheckCircle2 size={20}/>} />
                <StatCard label="Terlambat" value={stats.telat} color="orange" icon={<AlertCircle size={20}/>} />
                <StatCard label="Izin / Sakit" value={stats.izin} color="purple" icon={<FileSpreadsheet size={20}/>} />
            </div>

            {/* TABEL DATA */}
            <div className="bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-sm text-left">
                        <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs border-b border-gray-200">
                            <tr>
                                <th className="px-6 py-4">No</th>
                                <th className="px-6 py-4">Nama Anggota</th>
                                <th className="px-6 py-4">Waktu Check-in</th>
                                <th className="px-6 py-4">Status</th>
                                <th className="px-6 py-4">Lokasi / Keterangan</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100">
                            {attendees.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400 italic">Belum ada data presensi yang masuk.</td>
                                </tr>
                            ) : (
                                attendees.map((item, idx) => (
                                    <tr key={idx} className="hover:bg-gray-50 transition-colors">
                                        <td className="px-6 py-4 font-medium text-gray-500">{idx + 1}</td>
                                        <td className="px-6 py-4">
                                            <p className="font-bold text-gray-900">{item.name}</p>
                                            <p className="text-xs text-gray-400">{item.nia || 'No NIA'}</p>
                                        </td>
                                        <td className="px-6 py-4 font-mono text-gray-600">
                                            {item.attendance_time ? new Date(item.attendance_time).toLocaleTimeString('id-ID') : '-'}
                                        </td>
                                        <td className="px-6 py-4">
                                            <StatusBadge status={item.status} />
                                        </td>
                                        <td className="px-6 py-4 text-gray-600">
                                            {item.reason ? (
                                                <span className="italic text-gray-500">"{item.reason}"</span>
                                            ) : (
                                                item.latitude ? (
                                                    <span className="flex items-center gap-1 text-xs bg-blue-50 text-blue-600 px-2 py-1 rounded w-fit font-bold">
                                                        <MapPin size={12}/> GPS Valid
                                                    </span>
                                                ) : '-'
                                            )}
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
};

// Sub-components Kecil
const StatCard = ({ label, value, color, icon }) => (
    <div className={`bg-${color}-50 p-4 rounded-2xl border border-${color}-100`}>
        <div className={`text-${color}-600 mb-2`}>{icon}</div>
        <p className={`text-2xl font-black text-${color}-700`}>{value}</p>
        <p className={`text-xs font-bold text-${color}-600 uppercase`}>{label}</p>
    </div>
);

const StatusBadge = ({ status }) => {
    let style = "bg-gray-100 text-gray-600";
    if (status === 'Hadir') style = "bg-green-100 text-green-700 border-green-200";
    if (status === 'Telat') style = "bg-orange-100 text-orange-700 border-orange-200";
    if (status === 'Izin') style = "bg-purple-100 text-purple-700 border-purple-200";

    return (
        <span className={`px-3 py-1 rounded-full text-xs font-bold border ${style}`}>
            {status}
        </span>
    );
};

export default MonitoringDetail;
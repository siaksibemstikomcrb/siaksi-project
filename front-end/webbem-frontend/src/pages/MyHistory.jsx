import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Clock, Calendar, CheckCircle, AlertCircle, Inbox, ChevronDown, FileText, Info, XCircle } from 'lucide-react';

const MyHistory = () => {
    const [history, setHistory] = useState([]);
    const [loading, setLoading] = useState(true);
    const userId = localStorage.getItem('userId');
    const [expandedId, setExpandedId] = useState(null);

    useEffect(() => {
        const fetchHistory = async () => {
            if (!userId || userId === 'null') {
                setLoading(false);
                return;
            }
            try {
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

    const toggleExpand = (index) => {
        setExpandedId(expandedId === index ? null : index);
    };

    if (loading) return (
        <div className="h-screen flex items-center justify-center bg-gray-50">
            <div className="animate-pulse flex flex-col items-center">
                <div className="h-10 w-10 bg-slate-200 rounded-full mb-3"></div>
                <div className="h-4 w-32 bg-slate-200 rounded"></div>
            </div>
        </div>
    );

    return (
        <div className="min-h-screen bg-slate-50 font-sans text-slate-800 pb-20">
            
            <div className="sticky top-0 z-20 bg-white/95 backdrop-blur-sm border-b border-slate-200 px-6 py-5 shadow-sm">
                <div className="max-w-5xl mx-auto flex justify-between items-center">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 tracking-tight">Riwayat Presensi</h1>
                        <p className="text-xs text-slate-500 font-medium mt-0.5">Total Aktivitas: {history.length}</p>
                    </div>
                    <div className="hidden md:flex gap-3">
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-emerald-50 rounded-full border border-emerald-100">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                            <span className="text-xs font-bold text-emerald-700">Hadir</span>
                        </div>
                    </div>
                </div>
            </div>

            <div className="max-w-5xl mx-auto p-4 md:p-8 space-y-6">
                
                {history.length > 0 ? (
                    <>
                        <div className="flex flex-col gap-3 md:hidden">
                            {history.map((item, index) => {
                                const isExpanded = expandedId === index;
                                const statusStyle = getStatusStyle(item.status);

                                return (
                                    <div 
                                        key={index} 
                                        onClick={() => toggleExpand(index)}
                                        className={`bg-white rounded-2xl border transition-all duration-300 overflow-hidden cursor-pointer
                                            ${isExpanded ? 'border-blue-400 shadow-md ring-1 ring-blue-100' : 'border-gray-200 shadow-sm'}
                                        `}
                                    >
                                        <div className="p-4 flex items-center justify-between">
                                            <div className="flex items-center gap-3 overflow-hidden">
                                                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 border ${statusStyle.border} ${statusStyle.bg} ${statusStyle.text}`}>
                                                    <statusStyle.icon size={18} strokeWidth={2.5} />
                                                </div>
                                                <div className="min-w-0">
                                                    <h3 className="font-bold text-slate-900 text-sm truncate pr-2">{item.event_name}</h3>
                                                    <p className="text-xs text-slate-500 font-medium flex items-center gap-1 mt-0.5">
                                                        <Calendar size={12} />
                                                        {new Date(item.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase ${statusStyle.badgeBg} ${statusStyle.text} ${statusStyle.border}`}>
                                                    {item.status}
                                                </span>
                                                <ChevronDown size={16} className={`text-slate-300 transition-transform duration-300 ${isExpanded ? 'rotate-180 text-blue-500' : ''}`} />
                                            </div>
                                        </div>

                                        <div className={`bg-slate-50 border-t border-slate-100 transition-all duration-300 ease-in-out px-4 overflow-hidden ${isExpanded ? 'max-h-64 py-4 opacity-100' : 'max-h-0 py-0 opacity-0'}`}>
                                            <div className="grid grid-cols-2 gap-y-4 gap-x-2 text-sm text-slate-600">
                                                <div className="col-span-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Waktu Masuk</span>
                                                    <div className="flex items-center gap-2 font-mono font-bold text-slate-800 bg-white px-2 py-1 rounded border border-slate-200 w-fit">
                                                        <Clock size={14} className="text-blue-500"/> 
                                                        {item.attendance_time || '--:--'}
                                                    </div>
                                                </div>
                                                <div className="col-span-2 pt-2 border-t border-slate-200 mt-1">
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block mb-1">Catatan</span>
                                                    {item.reason ? (
                                                        <div className="flex gap-2 text-xs italic text-slate-600 bg-white p-2.5 rounded-lg border border-slate-200">
                                                            <FileText size={14} className="shrink-0 text-orange-400 mt-0.5"/>
                                                            "{item.reason}"
                                                        </div>
                                                    ) : (
                                                        <span className="text-xs text-slate-400 italic">Tidak ada catatan.</span>
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>

                        <div className="hidden md:block bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
                            <table className="w-full text-left border-collapse">
                                <thead className="bg-slate-50/95 backdrop-blur border-b border-slate-200 sticky top-[88px] z-10">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Nama Kegiatan</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Tanggal</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Waktu</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold text-slate-500 uppercase tracking-wider">Catatan</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-100">
                                    {history.map((item, index) => {
                                        const statusStyle = getStatusStyle(item.status);
                                        return (
                                            <tr key={index} className="hover:bg-slate-50/60 transition-colors group">
                                                <td className="px-6 py-4 font-bold text-slate-800">{item.event_name}</td>
                                                <td className="px-6 py-4 text-sm text-slate-600">
                                                    {new Date(item.event_date).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                                </td>
                                                <td className="px-6 py-4 text-sm font-mono text-center text-slate-600">
                                                    {item.attendance_time || '-'}
                                                </td>
                                                <td className="px-6 py-4 text-center">
                                                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border uppercase tracking-wide ${statusStyle.badgeBg} ${statusStyle.text} ${statusStyle.border}`}>
                                                        <statusStyle.icon size={12} strokeWidth={3} />
                                                        {item.status}
                                                    </span>
                                                </td>
                                                <td className="px-6 py-4">
                                                    <span className="text-sm text-slate-500 italic truncate max-w-xs block">
                                                        {item.reason || '-'}
                                                    </span>
                                                </td>
                                            </tr>
                                        );
                                    })}
                                </tbody>
                            </table>
                        </div>
                    </>
                ) : (
                    <div className="bg-white border-2 border-dashed border-slate-300 rounded-3xl p-12 flex flex-col items-center justify-center text-center mt-8">
                        <div className="bg-slate-50 p-6 rounded-full mb-4">
                            <Inbox size={40} className="text-slate-300" />
                        </div>
                        <h3 className="text-slate-900 font-bold text-lg">Belum Ada Riwayat</h3>
                        <p className="text-slate-500 text-sm mt-1 max-w-xs mx-auto">
                            Anda belum melakukan presensi pada kegiatan apapun.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
};

const getStatusStyle = (status) => {
    switch (status) {
        case 'Hadir': return { bg: 'bg-emerald-50', badgeBg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200', icon: CheckCircle };
        case 'Izin': return { bg: 'bg-blue-50', badgeBg: 'bg-blue-50', text: 'text-blue-700', border: 'border-blue-200', icon: Info };
        case 'Sakit': return { bg: 'bg-purple-50', badgeBg: 'bg-purple-50', text: 'text-purple-700', border: 'border-purple-200', icon: AlertCircle };
        case 'Telat': return { bg: 'bg-amber-50', badgeBg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200', icon: Clock };
        default: return { bg: 'bg-rose-50', badgeBg: 'bg-rose-50', text: 'text-rose-700', border: 'border-rose-200', icon: XCircle };
    }
};

export default MyHistory;
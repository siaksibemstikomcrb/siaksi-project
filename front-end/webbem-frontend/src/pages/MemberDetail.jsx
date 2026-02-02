import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { motion } from 'framer-motion';
import { ArrowLeft, User, Fingerprint, Activity, CheckCircle2, Clock, AlertCircle } from 'lucide-react';

const MemberDetail = () => {
  const { userId } = useParams();
  const navigate = useNavigate();
  const [history, setHistory] = useState([]);
  const [userInfo, setUserInfo] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchHistory = async () => {
    try {
      const res = await api.get(`/attendance/history/${userId}`);
      setHistory(res.data.history);
      setUserInfo(res.data.user);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  useEffect(() => { fetchHistory(); }, [userId]);

  const stats = {
    hadir: history.filter(h => h.status === 'Hadir').length,
    telat: history.filter(h => h.status === 'Telat').length,
    izin: history.filter(h => h.status === 'Izin').length,
    alpa: history.filter(h => h.status === 'Alpa').length,
    percent: history.length > 0 
      ? (((history.filter(h => h.status === 'Hadir' || h.status === 'Telat').length) / history.length) * 100).toFixed(0) 
      : 0
  };

  if (loading) return <div className="p-20 text-center font-bold text-gray-400">Memuat profil...</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      <button onClick={() => navigate(-1)} className="flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
        <ArrowLeft size={16} /> Kembali ke Daftar
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        <div className="lg:col-span-1 bg-white p-8 rounded-3xl border border-gray-100 shadow-sm relative overflow-hidden">
            <div className="relative z-10 text-center">
                <div className="w-24 h-24 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 border-4 border-white shadow-sm text-blue-600">
                    <User size={40} />
                </div>
                <h1 className="text-2xl font-black text-gray-900">{userInfo?.name}</h1>
                <p className="text-gray-500 font-medium">@{userInfo?.username}</p>
                <div className="mt-2 inline-block bg-gray-100 px-3 py-1 rounded-lg text-xs font-bold text-gray-600">
                    NIA: {userInfo?.nia || 'N/A'}
                </div>

                <div className="mt-8 pt-8 border-t border-gray-100">
                    <div className="flex justify-between items-end mb-2">
                        <span className="text-xs font-bold text-gray-400 uppercase">Kehadiran</span>
                        <span className="text-xl font-black text-blue-600">{stats.percent}%</span>
                    </div>
                    <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                        <div style={{ width: `${stats.percent}%` }} className="h-full bg-blue-600 rounded-full"></div>
                    </div>
                </div>
            </div>
        </div>

        <div className="lg:col-span-2 space-y-6">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <StatBox label="Hadir" value={stats.hadir} color="text-green-600" bg="bg-green-50" icon={<CheckCircle2 size={20}/>} />
                <StatBox label="Telat" value={stats.telat} color="text-orange-600" bg="bg-orange-50" icon={<Clock size={20}/>} />
                <StatBox label="Izin" value={stats.izin} color="text-blue-600" bg="bg-blue-50" icon={<Activity size={20}/>} />
                <StatBox label="Alpa" value={stats.alpa} color="text-red-600" bg="bg-red-50" icon={<AlertCircle size={20}/>} />
            </div>

            <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex items-center justify-between">
                <div>
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Total Riwayat Log</p>
                    <p className="text-3xl font-black text-gray-900">{history.length} <span className="text-lg font-medium text-gray-400">Kegiatan</span></p>
                </div>
                <div className="w-12 h-12 bg-gray-50 rounded-xl flex items-center justify-center text-gray-400">
                    <Activity size={24} />
                </div>
            </div>
        </div>
      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100">
            <h3 className="font-bold text-gray-900 text-lg">Riwayat Presensi Lengkap</h3>
        </div>
        <div className="overflow-x-auto">
            <table className="w-full text-left">
                <thead>
                    <tr className="bg-gray-50/50 text-gray-500 text-xs font-bold uppercase tracking-wider">
                        <th className="px-8 py-4">Kegiatan</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Waktu Absen</th>
                        <th className="px-8 py-4">Keterangan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {history.map((h, index) => (
                        <tr key={index} className="hover:bg-gray-50/50 transition-colors">
                            <td className="px-8 py-4">
                                <p className="font-bold text-gray-900 text-sm">{h.event_name}</p>
                                <p className="text-xs text-gray-500">{new Date(h.event_date).toLocaleDateString('id-ID', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                            </td>
                            <td className="px-6 py-4 text-center">
                                <StatusBadge status={h.status} />
                            </td>
                            <td className="px-6 py-4 text-center text-sm font-medium text-gray-700">
                                {h.attendance_time || '-'}
                            </td>
                            <td className="px-8 py-4 text-sm text-gray-500 italic">
                                {h.reason || '-'}
                            </td>
                        </tr>
                    ))}
                </tbody>
            </table>
        </div>
      </div>
    </div>
  );
};

const StatBox = ({ label, value, color, bg, icon }) => (
  <div className="bg-white border border-gray-100 p-6 rounded-2xl shadow-sm flex flex-col items-center justify-center hover:shadow-md transition-all">
    <div className={`p-3 ${bg} ${color} rounded-full mb-3`}>{icon}</div>
    <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">{label}</p>
    <p className={`text-3xl font-black ${color}`}>{value}</p>
  </div>
);

const StatusBadge = ({ status }) => {
  const colors = {
    Hadir: 'bg-green-100 text-green-700',
    Telat: 'bg-orange-100 text-orange-700',
    Izin: 'bg-blue-100 text-blue-700',
    Alpa: 'bg-red-100 text-red-700'
  };
  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${colors[status] || 'bg-gray-100 text-gray-600'}`}>
      {status}
    </span>
  );
};

export default MemberDetail;
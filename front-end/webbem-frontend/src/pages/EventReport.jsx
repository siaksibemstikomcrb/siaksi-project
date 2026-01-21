import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Clock, FileText, User } from 'lucide-react';

const EventReport = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Validasi ID sebelum fetch
    if (!scheduleId || scheduleId === 'undefined') {
        setLoading(false);
        return;
    }

    const fetchReport = async () => {
      try {
        const res = await api.get(`/admin/report/${scheduleId}`);
        setData(res.data);
        setLoading(false);
      } catch (err) { 
        console.error("Error fetching report:", err); 
        setLoading(false);
      }
    };
    fetchReport();
  }, [scheduleId]);

  if (loading) return <div className="p-10 text-center text-gray-400 font-medium">Memuat Laporan...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans">
      
      {/* Header Navigation */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
        <div>
            <button onClick={() => navigate(-1)} className="group mb-2 flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-gray-900 transition-colors">
                <ArrowLeft size={16} className="group-hover:-translate-x-1 transition-transform" /> Kembali ke Riwayat
            </button>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
                <FileText className="text-blue-600" /> Laporan Presensi
            </h1>
        </div>
        <div className="bg-blue-50 px-5 py-2 rounded-xl text-blue-700 font-bold text-sm border border-blue-100">
            Total Partisipan: {data.length}
        </div>
      </div>

      {/* Data Table */}
      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 border-b border-gray-100 text-gray-500 text-xs uppercase font-bold tracking-wider">
                <th className="px-8 py-5">Identitas Anggota</th>
                <th className="px-6 py-5 text-center">Status Kehadiran</th>
                <th className="px-6 py-5 text-center"><div className="flex items-center justify-center gap-2"><Clock size={14}/> Waktu</div></th>
                <th className="px-8 py-5">Catatan</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((row, i) => (
                <tr key={i} className="hover:bg-gray-50/50 transition-colors">
                  <td className="px-8 py-4">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-gray-500 font-bold text-sm">
                            {row.name.charAt(0)}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">{row.name}</p>
                            <p className="text-xs text-gray-500 font-medium">NIA: {row.nia || '-'}</p>
                        </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-center">
                    {/* Mengirim status dan attendance_time untuk logika tampilan */}
                    <StatusBadge status={row.status} time={row.attendance_time} />
                  </td>
                  <td className="px-6 py-4 text-center text-sm font-medium text-gray-600 tabular-nums">
                    {row.attendance_time || '-'}
                  </td>
                  <td className="px-8 py-4 text-sm text-gray-500 italic max-w-xs truncate">
                    {row.reason || '-'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        
        {data.length === 0 && (
            <div className="p-12 text-center text-gray-400 font-medium bg-white">
                Tidak ada data presensi atau ID Kegiatan salah.
            </div>
        )}
      </div>
    </div>
  );
};

// Sub-component for badges dengan Logika "Belum Absen"
const StatusBadge = ({ status, time }) => {
  let displayStatus = status;
  let styleKey = status;

  // LOGIKA FIX: Jika status 'Alpa' tapi tidak ada waktu absen (artinya default system),
  // kita anggap "Belum Absen" agar tidak terlihat menakutkan di awal.
  if (status === 'Alpa' && !time) {
     displayStatus = 'Belum Absen';
     styleKey = 'Belum';
  }

  const styles = {
    Hadir: 'bg-green-100 text-green-700',
    Telat: 'bg-orange-100 text-orange-700',
    Izin: 'bg-blue-100 text-blue-700',
    Alpa: 'bg-red-100 text-red-700',
    Belum: 'bg-gray-100 text-gray-500 font-medium border border-gray-200' // Style abu-abu netral
  };

  return (
    <span className={`px-3 py-1 rounded-lg text-xs font-bold ${styles[styleKey] || styles.Belum}`}>
      {displayStatus}
    </span>
  );
};

export default EventReport;
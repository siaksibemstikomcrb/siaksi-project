import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { ArrowLeft, Clock, FileText, User, ChevronDown, Calendar } from 'lucide-react';

const EventReport = () => {
  const { scheduleId } = useParams();
  const navigate = useNavigate();
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [expandedId, setExpandedId] = useState(null);

  useEffect(() => {
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

  const toggleExpand = (index) => {
      setExpandedId(expandedId === index ? null : index);
  };

  if (loading) return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-pulse flex flex-col items-center">
            <div className="h-8 w-8 bg-slate-200 rounded-full mb-2"></div>
            <div className="h-4 w-32 bg-slate-200 rounded"></div>
        </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-slate-800">
      
      <div className="sticky top-0 z-30 bg-white border-b border-gray-200 shadow-sm">
        <div className="max-w-5xl mx-auto px-4 py-4 md:px-8 flex items-center gap-4">
            <button onClick={() => navigate(-1)} className="p-2 -ml-2 hover:bg-gray-100 rounded-full transition-colors text-slate-600">
                <ArrowLeft size={20} />
            </button>
            <div className="flex-1">
                <h1 className="text-lg font-bold text-slate-900 leading-tight">Laporan Presensi</h1>
                <p className="text-xs text-slate-500 font-medium mt-0.5">Partisipan: {data.length} Orang</p>
            </div>
        </div>
      </div>

      <div className="max-w-5xl mx-auto p-4 md:p-8">
        
        <div className="flex flex-col gap-3 md:hidden">
            {data.map((row, i) => {
                const isExpanded = expandedId === i;
                return (
                    <div 
                        key={i} 
                        onClick={() => toggleExpand(i)}
                        className={`bg-white rounded-xl border transition-all duration-200 overflow-hidden cursor-pointer
                            ${isExpanded ? 'border-blue-300 shadow-md ring-1 ring-blue-100' : 'border-gray-200 shadow-sm'}
                        `}
                    >
                        <div className="p-4 flex items-center gap-4">
                            <div className="w-10 h-10 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-sm shrink-0 border border-slate-200">
                                {row.name.charAt(0)}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-center mb-1">
                                    <h3 className="font-bold text-slate-900 text-sm truncate pr-2">{row.name}</h3>
                                    <StatusBadge status={row.status} time={row.attendance_time} />
                                </div>
                                <div className="flex justify-between items-center">
                                    <p className="text-xs text-slate-500 font-mono">NIA: {row.nia || '-'}</p>
                                    <ChevronDown size={16} className={`text-slate-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                                </div>
                            </div>
                        </div>

                        <div 
                            className={`bg-slate-50 border-t border-slate-100 transition-all duration-300 ease-in-out px-4 overflow-hidden
                                ${isExpanded ? 'max-h-40 py-3 opacity-100' : 'max-h-0 py-0 opacity-0'}
                            `}
                        >
                            <div className="space-y-2 text-xs">
                                <div className="flex items-start gap-3">
                                    <div className="min-w-[20px] pt-0.5"><Clock size={14} className="text-blue-500"/></div>
                                    <div>
                                        <span className="font-bold text-slate-700 block">Waktu Presensi</span>
                                        <span className="font-mono text-slate-600">{row.attendance_time ? `${row.attendance_time} WIB` : '-'}</span>
                                    </div>
                                </div>
                                
                                {row.reason && (
                                    <div className="flex items-start gap-3">
                                        <div className="min-w-[20px] pt-0.5"><FileText size={14} className="text-orange-500"/></div>
                                        <div>
                                            <span className="font-bold text-slate-700 block">Keterangan / Alasan</span>
                                            <p className="text-slate-600 italic leading-relaxed">"{row.reason}"</p>
                                        </div>
                                    </div>
                                )}

                                {!row.attendance_time && !row.reason && (
                                    <p className="text-slate-400 italic pl-8">Tidak ada data tambahan.</p>
                                )}
                            </div>
                        </div>
                    </div>
                );
            })}
        </div>

        <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
            <table className="w-full text-left border-collapse">
                <thead>
                    <tr className="bg-slate-50 border-b border-gray-200 text-slate-500 text-xs uppercase font-bold tracking-wider">
                        <th className="px-6 py-4">Anggota</th>
                        <th className="px-6 py-4 text-center">Status</th>
                        <th className="px-6 py-4 text-center">Waktu</th>
                        <th className="px-6 py-4">Keterangan</th>
                    </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                    {data.map((row, i) => (
                    <tr key={i} className="hover:bg-slate-50/80 transition-colors">
                        <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                                <div className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-600 font-bold text-xs border border-slate-200">
                                    {row.name.charAt(0)}
                                </div>
                                <div>
                                    <p className="font-bold text-slate-900 text-sm">{row.name}</p>
                                    <p className="text-[10px] text-slate-500 font-mono">NIA: {row.nia || '-'}</p>
                                </div>
                            </div>
                        </td>
                        <td className="px-6 py-4 text-center">
                            <StatusBadge status={row.status} time={row.attendance_time} />
                        </td>
                        <td className="px-6 py-4 text-center text-sm font-mono text-slate-600">
                            {row.attendance_time || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-slate-500 italic max-w-xs truncate">
                            {row.reason || '-'}
                        </td>
                    </tr>
                    ))}
                </tbody>
            </table>
        </div>

        {data.length === 0 && (
            <div className="flex flex-col items-center justify-center py-20 text-center">
                <div className="bg-slate-100 p-4 rounded-full mb-4">
                    <User size={32} className="text-slate-300"/>
                </div>
                <p className="text-slate-500 font-medium">Belum ada data presensi.</p>
            </div>
        )}

      </div>
    </div>
  );
};

const StatusBadge = ({ status, time }) => {
  let displayStatus = status;
  let styleKey = status;

  if (status === 'Alpa' && !time) {
     displayStatus = 'Belum';
     styleKey = 'Belum';
  }

  const styles = {
    Hadir: 'bg-emerald-100 text-emerald-700 border-emerald-200',
    Telat: 'bg-amber-100 text-amber-700 border-amber-200',
    Izin: 'bg-blue-100 text-blue-700 border-blue-200',
    Sakit: 'bg-purple-100 text-purple-700 border-purple-200',
    Alpa: 'bg-rose-100 text-rose-700 border-rose-200',
    Belum: 'bg-slate-100 text-slate-500 border-slate-200'
  };

  return (
    <span className={`px-2.5 py-0.5 rounded-full text-[10px] uppercase font-bold border ${styles[styleKey] || styles.Belum}`}>
      {displayStatus}
    </span>
  );
};

export default EventReport;
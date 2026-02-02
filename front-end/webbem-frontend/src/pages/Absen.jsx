import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Clock, Calendar, CheckCircle2, X, MapPin, Video, ExternalLink, Globe, Loader2, Send, ChevronDown, AlertCircle } from 'lucide-react';
import { toast } from 'sonner';

const Absen = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [reason, setReason] = useState("");
  const [processing, setProcessing] = useState(false);
  const [expandedId, setExpandedId] = useState(null);

  const [time, setTime] = useState(new Date());
  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const greeting = time.getHours() < 12 ? "Pagi" : time.getHours() < 15 ? "Siang" : time.getHours() < 18 ? "Sore" : "Malam";

  const fetchSchedules = async () => {
    try {
      const res = await api.get('/schedules');
      setSchedules(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Gagal memuat jadwal:", err);
      toast.error("Gagal memuat jadwal kegiatan.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchSchedules(); }, []);

  const toggleExpand = (id) => {
      setExpandedId(expandedId === id ? null : id);
  };

  const handleHadir = async (scheduleId, isOnline) => {
    const promise = new Promise(async (resolve, reject) => {
        setProcessing(true);
        if (isOnline) {
            try {
                await api.post('/attendance/submit', { schedule_id: scheduleId, latitude: null, longitude: null });
                resolve("Berhasil Absen!");
                fetchSchedules();
            } catch (err) { reject(err.response?.data?.msg || "Gagal Absen."); } 
            finally { setProcessing(false); }
            return;
        }
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    await api.post('/attendance/submit', { schedule_id: scheduleId, latitude, longitude });
                    resolve("Berhasil Absen di Lokasi!");
                    fetchSchedules();
                } catch (err) { reject(err.response?.data?.msg || "Diluar jangkauan lokasi."); } 
                finally { setProcessing(false); }
            }, () => { setProcessing(false); reject("Gagal GPS. Aktifkan Izin Lokasi."); });
        } else { setProcessing(false); reject("Browser tidak dukung GPS."); }
    });
    toast.promise(promise, { loading: 'Memproses...', success: (d) => d, error: (e) => e });
  };

  const handleIzinSubmit = async () => {
    if (!reason) return toast.warning("Alasan wajib diisi!");
    setProcessing(true);
    try {
      await api.post('/attendance/submit', { schedule_id: selectedId, reason });
      toast.success("Izin terkirim");
      setShowModal(false);
      setReason("");
      fetchSchedules();
    } catch (err) { toast.error(err.response?.data?.msg || "Gagal kirim izin"); } 
    finally { setProcessing(false); }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans p-4 md:p-6 pb-24">
      
      <div className="bg-white rounded-3xl p-6 md:p-8 border border-gray-100 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="bg-green-100 text-green-700 text-[10px] font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-green-200">
                Member Area
              </span>
            </div>
            <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                Selamat {greeting}, <br/> <span className="text-blue-600">Anggota!</span>
            </h1>
            <p className="text-gray-500 font-medium mt-2 text-sm md:text-base">
                Silakan lakukan check-in sesuai jadwal kegiatan.
            </p>
          </div>

          <div className="bg-white px-5 py-4 rounded-2xl border border-gray-200 text-center min-w-[160px] shadow-sm w-full md:w-auto">
            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Server Clock</p>
            <p className="text-3xl font-black text-gray-900 tabular-nums tracking-tight leading-none mb-1">
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-[10px] font-bold text-gray-500">
              {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      <div>
        <h2 className="text-lg font-bold text-gray-900 flex items-center gap-2 mb-4 px-1">
            <Calendar size={20} className="text-blue-600" /> Jadwal Aktif
        </h2>
        
        {schedules.length === 0 ? (
          <div className="bg-white p-10 rounded-3xl text-center border border-dashed border-gray-300">
            <Calendar size={40} className="text-gray-300 mx-auto mb-3" />
            <p className="text-gray-900 font-bold">Tidak Ada Jadwal</p>
            <p className="text-gray-500 text-sm mt-1">Tunggu admin menerbitkan agenda.</p>
          </div>
        ) : (
          <div className="grid gap-4">
            {schedules.map((item) => {
                const isOnline = !item.latitude;
                const isExpanded = expandedId === item.id;
                const hasAttended = item.my_status; 

                return (
                  <div 
                    key={item.id} 
                    className={`bg-white rounded-3xl border transition-all duration-300 overflow-hidden shadow-sm
                        ${hasAttended ? 'border-green-200 bg-green-50/20' : isExpanded ? 'border-blue-300 ring-2 ring-blue-50 shadow-md' : 'border-gray-100'}
                    `}
                  >
                    <div 
                        onClick={() => toggleExpand(item.id)}
                        className="p-5 flex items-center justify-between cursor-pointer active:bg-gray-50 transition-colors"
                    >
                        <div className="flex items-center gap-4 overflow-hidden">
                            <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shrink-0 shadow-sm
                                ${hasAttended ? 'bg-green-100 text-green-600' : 'bg-blue-600 text-white'}
                            `}>
                                {hasAttended ? <CheckCircle2 size={24} /> : <Calendar size={24} />}
                            </div>

                            <div className="min-w-0">
                                <h3 className={`font-bold text-lg truncate ${hasAttended ? 'text-green-800' : 'text-gray-900'}`}>
                                    {item.event_name}
                                </h3>
                                <div className="flex items-center gap-2 mt-1">
                                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded border uppercase
                                        ${isOnline ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-orange-50 text-orange-700 border-orange-100'}
                                    `}>
                                        {isOnline ? 'Online' : 'Offline'}
                                    </span>
                                    <span className="text-xs text-gray-500 font-medium flex items-center gap-1">
                                        <Clock size={12}/> {item.start_time} WIB
                                    </span>
                                </div>
                            </div>
                        </div>

                        <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${isExpanded ? 'rotate-180' : ''}`} />
                    </div>

                    <div className={`transition-all duration-300 ease-in-out px-5 overflow-hidden ${isExpanded ? 'max-h-[500px] pb-5 opacity-100' : 'max-h-0 opacity-0'}`}>
                        <div className="pt-4 border-t border-gray-100 space-y-4">
                            
                            {item.description && (
                                <div className="bg-gray-50 p-3 rounded-xl text-xs text-gray-600 italic border border-gray-100">
                                    "{item.description}"
                                </div>
                            )}

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                <div className="flex items-start gap-3">
                                    <Clock size={16} className="text-blue-500 mt-0.5"/>
                                    <div>
                                        <span className="font-bold text-gray-900 block">Waktu</span>
                                        <span className="text-gray-500">{item.start_time} - {item.end_time} WIB</span>
                                    </div>
                                </div>
                                <div className="flex items-start gap-3">
                                    {isOnline ? <Video size={16} className="text-purple-500 mt-0.5"/> : <MapPin size={16} className="text-orange-500 mt-0.5"/>}
                                    <div className="min-w-0">
                                        <span className="font-bold text-gray-900 block">Lokasi</span>
                                        {isOnline ? (
                                            item.meeting_link ? (
                                                <a href={item.meeting_link} target="_blank" className="text-blue-600 underline truncate block hover:text-blue-800">
                                                    Link Meeting
                                                </a>
                                            ) : <span className="text-gray-400 italic">Link menyusul</span>
                                        ) : (
                                            <span className="text-gray-600">{item.location || 'Kampus Utama'}</span>
                                        )}
                                    </div>
                                </div>
                            </div>

                            {!hasAttended ? (
                                <div className="flex gap-3 pt-2">
                                    <button 
                                        onClick={() => { setSelectedId(item.id); setShowModal(true); }}
                                        className="flex-1 bg-white border-2 border-gray-200 text-gray-600 font-bold py-3 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all text-sm active:scale-95"
                                    >
                                        Izin
                                    </button>
                                    <button 
                                        onClick={() => handleHadir(item.id, isOnline)}
                                        disabled={processing}
                                        className="flex-[2] bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 active:scale-95 transition-all shadow-lg shadow-blue-200 text-sm flex justify-center items-center gap-2"
                                    >
                                        {processing ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle2 size={18}/>}
                                        {processing ? '...' : 'Hadir Sekarang'}
                                    </button>
                                </div>
                            ) : (
                                <div className="w-full bg-green-100 text-green-800 font-bold py-3 rounded-xl text-center text-sm border border-green-200 flex justify-center items-center gap-2">
                                    <CheckCircle2 size={18}/> Sudah Presensi: {hasAttended}
                                </div>
                            )}
                        </div>
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
          <div className="relative bg-white w-full max-w-sm rounded-t-3xl md:rounded-3xl p-6 animate-in slide-in-from-bottom-10 duration-300 shadow-2xl">
            <div className="w-12 h-1.5 bg-gray-200 rounded-full mx-auto mb-6 md:hidden"></div>
            
            <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold text-gray-900">Form Izin</h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={18}/></button>
            </div>
            
            <textarea 
                className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm font-medium focus:ring-2 focus:ring-blue-500 outline-none resize-none h-32 mb-4 placeholder-gray-400"
                placeholder="Alasan tidak bisa hadir..."
                value={reason}
                onChange={(e) => setReason(e.target.value)}
                autoFocus
            ></textarea>

            <button onClick={handleIzinSubmit} disabled={processing} className="w-full py-3.5 bg-blue-600 text-white font-bold rounded-xl hover:bg-blue-700 transition-all flex justify-center items-center gap-2 shadow-lg shadow-blue-200 active:scale-95">
                {processing ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>} Kirim Izin
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default Absen;
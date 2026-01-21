import { useEffect, useState } from 'react';
import api from '../api/axios';
import { Clock, Calendar, CheckCircle2, X, MapPin, Video, ExternalLink, Globe, Loader2, Send } from 'lucide-react';
import { toast } from 'sonner';

const Absen = () => {
  const [schedules, setSchedules] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [selectedId, setSelectedId] = useState(null);
  const [reason, setReason] = useState("");
  const [time, setTime] = useState(new Date());
  const [processing, setProcessing] = useState(false);

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

  const handleHadir = async (scheduleId, isOnline) => {
    // Gunakan toast promise untuk UX yang lebih baik
    const promise = new Promise(async (resolve, reject) => {
        setProcessing(true);
        
        // --- JIKA ONLINE (Tidak butuh GPS) ---
        if (isOnline) {
            try {
                const res = await api.post('/attendance/submit', { 
                    schedule_id: scheduleId, latitude: null, longitude: null 
                });
                resolve(res.data.msg);
                fetchSchedules();
            } catch (err) {
                reject(err.response?.data?.msg || "Gagal Absen.");
            } finally {
                setProcessing(false);
            }
            return;
        }

        // --- JIKA OFFLINE (Wajib GPS) ---
        if ("geolocation" in navigator) {
            navigator.geolocation.getCurrentPosition(async (position) => {
                const { latitude, longitude } = position.coords;
                try {
                    const res = await api.post('/attendance/submit', { 
                        schedule_id: scheduleId, latitude, longitude
                    });
                    resolve(res.data.msg);
                    fetchSchedules();
                } catch (err) {
                    reject(err.response?.data?.msg || "Lokasi tidak valid / Diluar jangkauan.");
                } finally {
                    setProcessing(false);
                }
            }, (error) => {
                setProcessing(false);
                reject("Gagal mengambil lokasi. Pastikan GPS aktif.");
            });
        } else {
            setProcessing(false);
            reject("Browser tidak mendukung Geolocation.");
        }
    });

    toast.promise(promise, {
        loading: 'Memproses kehadiran...',
        success: (data) => `${data}`,
        error: (err) => `${err}`,
    });
  };

  const handleIzinSubmit = async () => {
    if (!reason) return toast.warning("Alasan izin wajib diisi!");
    
    setProcessing(true);
    const toastId = toast.loading("Mengirim izin...");

    try {
      const res = await api.post('/attendance/submit', { schedule_id: selectedId, reason: reason });
      toast.success(res.data.msg, { id: toastId });
      setShowModal(false);
      setReason("");
      fetchSchedules();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Gagal mengirim izin", { id: toastId });
    } finally {
        setProcessing(false);
    }
  };

  if (loading) return <div className="h-[50vh] flex items-center justify-center text-gray-400 font-medium"><Loader2 className="animate-spin mr-2"/> Memuat Jadwal...</div>;

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans p-4 md:p-6">
      
      {/* HERO SECTION */}
      <div className="bg-white rounded-3xl p-8 border border-gray-100 shadow-lg relative overflow-hidden">
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-50 rounded-full -mr-20 -mt-20 blur-3xl opacity-50"></div>
        
        <div className="relative z-10 flex flex-col md:flex-row justify-between items-start md:items-center gap-8">
          <div>
            <div className="flex items-center gap-2 mb-3">
              <span className="bg-green-100 text-green-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide border border-green-200">Member Area</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-gray-900 tracking-tight">Selamat {greeting}, Anggota!</h1>
            <p className="text-gray-500 font-medium mt-2 text-lg">Panel presensi terpusat. Silakan lakukan check-in sesuai jadwal.</p>
          </div>

          <div className="bg-white px-6 py-5 rounded-2xl border border-gray-200 text-center min-w-[200px] shadow-sm">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">Server Clock</p>
            <p className="text-4xl font-black text-blue-600 tabular-nums tracking-tight leading-none mb-1">
              {time.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
            </p>
            <p className="text-xs font-bold text-gray-500">
              {time.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long' })}
            </p>
          </div>
        </div>
      </div>

      {/* AGENDA LIST */}
      <div className="space-y-6">
        <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
            <Calendar size={24} className="text-blue-600" /> Jadwal Kegiatan Aktif
        </h2>
        
        {schedules.length === 0 ? (
          <div className="bg-white p-12 rounded-3xl text-center border border-dashed border-gray-300">
            <div className="bg-gray-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-4 text-gray-400">
                <Calendar size={40} />
            </div>
            <p className="text-gray-900 font-bold text-xl">Tidak Ada Jadwal</p>
            <p className="text-gray-500 text-base mt-2 max-w-md mx-auto">
                Jadwal kegiatan akan muncul di sini saat Admin UKM menerbitkannya. Pastikan Anda login dengan akun yang benar.
            </p>
          </div>
        ) : (
          <div className="grid gap-6">
            {schedules.map((item) => {
                const isOnline = !item.latitude && !item.longitude;

                return (
                  <div key={item.id} className="bg-white p-6 md:p-8 rounded-3xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
                    <div className="flex-1 w-full">
                      <div className="flex items-center gap-3 mb-3">
                        <span className={`w-3 h-3 rounded-full animate-pulse ${isOnline ? 'bg-green-500' : 'bg-blue-600'}`}></span>
                        <h3 className="text-2xl font-bold text-gray-900">{item.event_name}</h3>
                        {isOnline && (
                             <span className="bg-green-50 text-green-700 text-[10px] font-bold px-2 py-1 rounded border border-green-200 uppercase tracking-wide">Online</span>
                        )}
                      </div>
                      
                      <div className="flex flex-wrap items-center gap-3 text-sm">
                        <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg font-bold border border-gray-100">
                          <Clock size={16} className="text-blue-500"/> {item.start_time} - {item.end_time} WIB
                        </div>
                        
                        {isOnline ? (
                             item.meeting_link ? (
                                <a 
                                    href={item.meeting_link} 
                                    target="_blank" 
                                    rel="noopener noreferrer"
                                    className="flex items-center gap-2 text-blue-700 bg-blue-50 hover:bg-blue-100 px-3 py-1.5 rounded-lg font-bold transition-colors border border-blue-100"
                                >
                                    <Video size={16} /> Join Meeting <ExternalLink size={12}/>
                                </a>
                             ) : (
                                <div className="flex items-center gap-2 text-gray-500 bg-gray-50 px-3 py-1.5 rounded-lg font-medium italic border border-gray-100">
                                    <Globe size={16} /> Online (Link menyusul)
                                </div>
                             )
                        ) : (
                            <div className="flex items-center gap-2 text-gray-700 bg-gray-50 px-3 py-1.5 rounded-lg font-medium border border-gray-100">
                                <MapPin size={16} className="text-red-500"/> {item.location || 'Lokasi Kampus'}
                            </div>
                        )}

                        {item.my_status && (
                          <span className={`px-3 py-1.5 rounded-lg text-xs font-bold uppercase flex items-center gap-1 border ${item.my_status === 'Hadir' ? 'bg-green-100 text-green-700 border-green-200' : 'bg-yellow-100 text-yellow-700 border-yellow-200'}`}>
                            <CheckCircle2 size={14} /> {item.my_status}
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 w-full md:w-auto">
                      {!item.my_status ? (
                        <>
                          <button 
                            onClick={() => handleHadir(item.id, isOnline)}
                            disabled={processing}
                            className="flex-1 md:flex-none bg-blue-600 text-white font-bold px-8 py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 active:scale-95 disabled:bg-gray-400 disabled:cursor-not-allowed disabled:shadow-none"
                          >
                            {processing ? 'Memproses...' : 'HADIR'}
                          </button>
                          <button 
                            onClick={() => { setSelectedId(item.id); setShowModal(true); }}
                            disabled={processing}
                            className="flex-1 md:flex-none bg-white border-2 border-gray-200 text-gray-700 font-bold px-8 py-3.5 rounded-xl hover:bg-gray-50 hover:border-gray-300 transition-all active:scale-95 disabled:bg-gray-100 disabled:text-gray-400"
                          >
                            IZIN
                          </button>
                        </>
                      ) : (
                        <div className="w-full md:w-auto px-8 py-3.5 bg-gray-100 rounded-xl border border-gray-200 text-center text-gray-400 font-bold text-sm uppercase tracking-wider cursor-default select-none">
                          Presensi Tercatat
                        </div>
                      )}
                    </div>
                  </div>
                );
            })}
          </div>
        )}
      </div>

      {/* MODAL IZIN */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-sm transition-opacity" onClick={() => setShowModal(false)}></div>
          
          <div className="relative bg-white w-full max-w-md rounded-3xl p-8 shadow-2xl animate-in zoom-in-95 duration-200 border border-gray-100">
            <div className="flex justify-between items-center mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Form Izin</h2>
                <button onClick={() => setShowModal(false)} className="p-2 bg-gray-100 rounded-full hover:bg-gray-200 transition-colors">
                    <X size={20} className="text-gray-500" />
                </button>
            </div>
            
            <p className="text-gray-500 font-medium text-sm mb-4">Mohon jelaskan alasan ketidakhadiran Anda secara singkat dan jelas.</p>
            
            <textarea 
              className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-gray-900 font-medium h-32 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all resize-none mb-6 placeholder-gray-400 text-base"
              placeholder="Contoh: Sakit demam, ada surat dokter..."
              value={reason}
              onChange={(e) => setReason(e.target.value)}
            ></textarea>

            <div className="flex gap-3">
              <button onClick={() => setShowModal(false)} className="flex-1 bg-white border border-gray-300 text-gray-700 font-bold py-3.5 rounded-xl hover:bg-gray-50 transition-all">Batal</button>
              <button 
                onClick={handleIzinSubmit} 
                disabled={processing}
                className="flex-1 bg-blue-600 text-white font-bold py-3.5 rounded-xl hover:bg-blue-700 transition-all shadow-lg shadow-blue-200 flex justify-center items-center gap-2 disabled:bg-gray-400"
              >
                {processing ? <Loader2 className="animate-spin" size={18}/> : <Send size={18}/>}
                Kirim
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Absen;
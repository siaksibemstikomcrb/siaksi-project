import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
  Plus, Calendar, MapPin, Globe, Clock, Check, 
  Search, Crosshair, Loader2, ChevronRight, ArrowLeft, 
  MoreHorizontal, CalendarDays, Users
} from 'lucide-react';
import { toast } from 'sonner';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

const KAMPUS_COORDS = { lat: -6.7126309, lng: 108.531254 };
let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

const MapController = ({ centerCoords }) => {
    const map = useMap();
    useEffect(() => {
        if (centerCoords) map.flyTo(centerCoords, 17, { duration: 1.5 });
    }, [centerCoords, map]);
    return null;
};

const LocationPicker = ({ position, setPosition }) => {
    useMapEvents({
        click(e) { setPosition(e.latlng); },
    });
    return position ? <Marker position={position} /> : null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  
  const [chartData, setChartData] = useState([]); 
  const [recentSchedules, setRecentSchedules] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('dashboard');
  const [submitting, setSubmitting] = useState(false);

  const [isOnline, setIsOnline] = useState(false);
  const [useRadius, setUseRadius] = useState(false);
  const [mapPosition, setMapPosition] = useState(null); 
  const [mapCenter, setMapCenter] = useState([KAMPUS_COORDS.lat, KAMPUS_COORDS.lng]); 
  const [searchQuery, setSearchQuery] = useState("");

  const [formData, setFormData] = useState({
    event_name: '', description: '', location: '', event_date: '',
    start_time: '', end_time: '', attendance_open_time: '',
    attendance_close_time: '', tolerance_minutes: 15, type: 'Rapat',
    latitude: '', longitude: '', radius_meters: 50, meeting_link: ''
  });

  useEffect(() => {
    if (mapPosition) setFormData(prev => ({ ...prev, latitude: mapPosition.lat, longitude: mapPosition.lng }));
  }, [mapPosition]);

  useEffect(() => {
    if (useRadius && !isOnline) {
        setMapPosition(KAMPUS_COORDS);
        setMapCenter([KAMPUS_COORDS.lat, KAMPUS_COORDS.lng]);
        setFormData(prev => ({ ...prev, latitude: KAMPUS_COORDS.lat, longitude: KAMPUS_COORDS.lng }));
        toast.info("Lokasi default: Kampus");
    } else {
        setMapPosition(null);
        setFormData(prev => ({ ...prev, latitude: '', longitude: '' }));
    }
  }, [useRadius, isOnline]);

  useEffect(() => {
    if (isOnline) {
        setUseRadius(false);
        setFormData(prev => ({ ...prev, latitude: '', longitude: '', location: 'Zoom / Google Meet' }));
        setMapPosition(null);
    } else {
        setFormData(prev => ({ ...prev, location: '', meeting_link: '' }));
    }
  }, [isOnline]);

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const fetchData = async () => {
        try {
            if (role === 'super_admin') {
                const res = await api.get('/monitoring/global');
                setChartData(res.data.ukm_list.map(ukm => ({
                    name: ukm.ukm_name || ukm.name, 
                    events: parseInt(ukm.total_events || 0)
                })));
            } else if (role === 'admin') {
                const res = await api.get('/schedules'); 
                setRecentSchedules(res.data.slice(0, 5));
            }
        } catch (err) { console.error("Error fetching data:", err); }
    };
    fetchData();
  }, [role, viewMode]);

  const handleMyLocation = () => {
    if (navigator.geolocation) {
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setMapPosition({ lat: latitude, lng: longitude });
            setMapCenter([latitude, longitude]);
        });
    }
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            setMapPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
            setMapCenter([parseFloat(lat), parseFloat(lon)]);
        } else { toast.error("Lokasi tidak ditemukan."); }
    } catch { toast.error("Gagal koneksi peta."); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = {
          ...formData,
          latitude: (isOnline || !useRadius) ? null : formData.latitude,
          longitude: (isOnline || !useRadius) ? null : formData.longitude,
          meeting_link: isOnline ? formData.meeting_link : null
      };
      await api.post('/schedules', payload);
      toast.success('Agenda Diterbitkan');
      
      setFormData({
        event_name: '', description: '', location: '', event_date: '',
        start_time: '', end_time: '', attendance_open_time: '',
        attendance_close_time: '', tolerance_minutes: 15, type: 'Rapat',
        latitude: '', longitude: '', radius_meters: 50, meeting_link: ''
      });
      setIsOnline(false);
      setUseRadius(false);
      
      setTimeout(() => {
          setViewMode('dashboard');
          setSubmitting(false);
      }, 500);
    } catch (err) {
      setSubmitting(false);
      toast.error('Gagal menerbitkan agenda.');
    }
  };

  if (!role) return null;

  return (
    <div className="min-h-screen bg-white font-sans text-slate-800 pb-20">
        
        <div className="sticky top-0 z-20 bg-white/80 backdrop-blur-md border-b border-slate-100 px-6 py-4">
            <div className="max-w-5xl mx-auto flex justify-between items-center">
                <div className="flex items-center gap-3">
                    {viewMode === 'create' && (
                        <button onClick={() => setViewMode('dashboard')} className="p-2 -ml-2 hover:bg-slate-50 rounded-full transition-colors">
                            <ArrowLeft size={20} className="text-slate-600" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-xl font-semibold tracking-tight text-slate-900">
                            {role === 'super_admin' ? 'Global Overview' : (viewMode === 'create' ? 'Agenda Baru' : 'Dashboard')}
                        </h1>
                        <p className="text-xs text-slate-500 font-medium hidden md:block">
                            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                        </p>
                    </div>
                </div>
                
                {viewMode === 'dashboard' && role === 'admin' && (
                    <button 
                        onClick={() => setViewMode('create')}
                        className="bg-slate-900 hover:bg-slate-800 text-white px-4 py-2 rounded-full text-sm font-medium transition-all flex items-center gap-2 shadow-lg shadow-slate-200 active:scale-95"
                    >
                        <Plus size={16} /> <span className="hidden sm:inline">Buat Agenda</span>
                    </button>
                )}
            </div>
        </div>

        <div className="max-w-5xl mx-auto px-6 py-8">
        
        {role === 'super_admin' && (
            <div className="space-y-8 animate-in fade-in duration-500">
                <div className="bg-slate-50 rounded-3xl p-6 border border-slate-100">
                    <h3 className="text-sm font-semibold text-slate-900 mb-6 flex items-center gap-2">
                        <Users size={16} className="text-blue-600"/> Aktivitas UKM
                    </h3>
                    <div className="h-64 w-full">
                        <ResponsiveContainer>
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} />
                                <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 4px 6px -1px rgba(0, 0, 0, 0.1)'}} />
                                <Bar dataKey="events" fill="#4f46e5" radius={[6, 6, 6, 6]} barSize={30} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>
        )}

        {role === 'admin' && viewMode === 'dashboard' && (
            <div className="animate-in fade-in duration-500">
                {recentSchedules.length > 0 ? (
                    <div className="space-y-4">
                        <div className="flex justify-between items-end mb-2">
                            <h2 className="text-lg font-semibold text-slate-900">Jadwal Terakhir</h2>
                            <button onClick={() => navigate('/admin/events')} className="text-sm text-blue-600 font-medium hover:underline flex items-center gap-1">
                                Lihat Semua <ChevronRight size={14}/>
                            </button>
                        </div>
                        
                        <div className="grid gap-3">
                            {recentSchedules.map((item, idx) => (
                                <div key={idx} className="group bg-white border border-slate-100 hover:border-blue-200 p-4 rounded-2xl shadow-sm hover:shadow-md transition-all flex justify-between items-center cursor-pointer">
                                    <div className="flex gap-4 items-center">
                                        <div className="h-12 w-12 bg-blue-50 text-blue-600 rounded-xl flex flex-col items-center justify-center border border-blue-100">
                                            <span className="text-[10px] font-bold uppercase">{new Date(item.event_date).toLocaleString('id-ID', { month: 'short' })}</span>
                                            <span className="text-lg font-bold leading-none">{new Date(item.event_date).getDate()}</span>
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-slate-900 group-hover:text-blue-600 transition-colors">{item.event_name}</h3>
                                            <div className="flex items-center gap-3 text-xs text-slate-500 mt-1">
                                                <span className="flex items-center gap-1"><Clock size={12}/> {item.start_time.slice(0,5)}</span>
                                                <span className="flex items-center gap-1"><MapPin size={12}/> {item.is_online ? 'Online' : 'Offline'}</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="bg-slate-50 p-2 rounded-full text-slate-400 group-hover:bg-blue-600 group-hover:text-white transition-all">
                                        <ChevronRight size={18} />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="text-center py-20 px-6">
                        <div className="bg-slate-50 w-20 h-20 rounded-full flex items-center justify-center mx-auto mb-6">
                            <CalendarDays size={32} className="text-slate-300" />
                        </div>
                        <h2 className="text-xl font-semibold text-slate-900 mb-2">Belum ada agenda</h2>
                        <p className="text-slate-500 mb-8 max-w-xs mx-auto text-sm">
                            Agenda yang Anda buat akan muncul di sini. Mulai buat jadwal untuk anggota sekarang.
                        </p>
                        <button 
                            onClick={() => setViewMode('create')}
                            className="bg-slate-900 text-white px-6 py-3 rounded-full font-medium shadow-lg shadow-slate-200 hover:scale-105 transition-transform"
                        >
                            Buat Agenda Pertama
                        </button>
                    </div>
                )}
            </div>
        )}

        {viewMode === 'create' && (
            <form onSubmit={handleSubmit} className="space-y-8 animate-in slide-in-from-right-8 duration-500">
                
                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Detail Kegiatan</h3>
                    <div className="grid gap-4">
                        <SoftInput placeholder="Nama Kegiatan (Cth: Rapat Bulanan)" value={formData.event_name} onChange={(e) => setFormData({...formData, event_name: e.target.value})} autoFocus />
                        <textarea 
                            className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all resize-none h-32"
                            placeholder="Deskripsi singkat..."
                            value={formData.description}
                            onChange={(e) => setFormData({...formData, description: e.target.value})}
                        />
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <SoftSelect value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} options={['Rapat', 'Kegiatan', 'Pelatihan', 'Lainnya']} />
                            <SoftInput type="date" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Waktu & Presensi</h3>
                    <div className="bg-slate-50 p-6 rounded-3xl space-y-6">
                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="text-xs font-medium text-slate-500 ml-2 mb-1 block">Mulai</label>
                                <SoftInput type="time" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} bg="bg-white" />
                            </div>
                            <div>
                                <label className="text-xs font-medium text-slate-500 ml-2 mb-1 block">Selesai</label>
                                <SoftInput type="time" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} bg="bg-white" />
                            </div>
                        </div>
                        
                        <div className="pt-4 border-t border-slate-200">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-semibold text-slate-700">Jendela Presensi</span>
                                <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-full border border-slate-200">
                                    <span className="text-[10px] text-slate-400">Toleransi</span>
                                    <input type="number" className="w-8 text-center font-bold text-slate-900 outline-none text-sm" value={formData.tolerance_minutes} onChange={(e) => setFormData({...formData, tolerance_minutes: e.target.value})} />
                                    <span className="text-[10px] text-slate-400">Menit</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-4">
                                <div className="flex-1 text-center">
                                    <input type="time" className="w-full bg-white border border-slate-200 rounded-xl px-2 py-3 text-center font-bold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.attendance_open_time} onChange={(e) => setFormData({...formData, attendance_open_time: e.target.value})} />
                                    <p className="text-[10px] text-slate-400 mt-2">Buka</p>
                                </div>
                                <span className="text-slate-300">-</span>
                                <div className="flex-1 text-center">
                                    <input type="time" className="w-full bg-white border border-slate-200 rounded-xl px-2 py-3 text-center font-bold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.attendance_close_time} onChange={(e) => setFormData({...formData, attendance_close_time: e.target.value})} />
                                    <p className="text-[10px] text-slate-400 mt-2">Tutup</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                <section className="space-y-4">
                    <h3 className="text-sm font-bold text-slate-400 uppercase tracking-wider">Lokasi</h3>
                    
                    <div className="flex gap-2 p-1 bg-slate-100 rounded-xl w-fit">
                        <button type="button" onClick={() => setIsOnline(false)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${!isOnline ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Offline (Kampus)</button>
                        <button type="button" onClick={() => setIsOnline(true)} className={`px-4 py-2 text-sm font-medium rounded-lg transition-all ${isOnline ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Online (Zoom)</button>
                    </div>

                    {isOnline ? (
                        <div className="space-y-4 animate-in fade-in">
                            <SoftInput placeholder="Link Meeting (https://...)" value={formData.meeting_link} onChange={(e) => setFormData({...formData, meeting_link: e.target.value})} />
                            <SoftInput placeholder="Platform (Zoom / Google Meet)" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                        </div>
                    ) : (
                        <div className="space-y-4 animate-in fade-in">
                            <div className="relative">
                                <input type="text" className="w-full pl-10 pr-4 py-4 rounded-2xl bg-slate-50 border-0 focus:bg-white focus:ring-2 focus:ring-blue-100 transition-all text-sm font-medium placeholder-slate-400" placeholder="Cari lokasi..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                <Search className="absolute left-3.5 top-4 text-slate-400" size={18} />
                                <button type="button" onClick={handleSearchLocation} className="absolute right-2 top-2 bg-slate-200 text-slate-600 px-3 py-2 rounded-xl text-xs font-bold hover:bg-slate-300 transition-colors">Cari</button>
                            </div>

                            <div className="h-64 w-full bg-slate-200 rounded-3xl overflow-hidden relative z-0">
                                <MapContainer center={mapCenter} zoom={17} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                                    <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapController centerCoords={mapCenter} />
                                    <LocationPicker position={mapPosition} setPosition={setMapPosition} />
                                </MapContainer>
                                <button type="button" onClick={handleMyLocation} className="absolute bottom-4 right-4 bg-white p-3 rounded-full shadow-lg z-[400] hover:scale-105 transition-transform text-slate-700">
                                    <Crosshair size={20}/>
                                </button>
                            </div>

                            <div className="flex items-center gap-3">
                                <input type="checkbox" id="radius" className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500" checked={useRadius} onChange={() => setUseRadius(!useRadius)} />
                                <label htmlFor="radius" className="text-sm font-medium text-slate-700">Wajib dalam radius</label>
                                {useRadius && (
                                    <div className="flex items-center gap-2 bg-slate-50 px-3 py-1 rounded-lg border border-slate-200 ml-auto">
                                        <input type="number" className="w-12 bg-transparent text-right font-bold text-slate-900 outline-none text-sm" value={formData.radius_meters} onChange={(e) => setFormData({...formData, radius_meters: e.target.value})} />
                                        <span className="text-xs text-slate-400">Meter</span>
                                    </div>
                                )}
                            </div>
                            <SoftInput placeholder="Nama Ruangan (Gedung A)" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                        </div>
                    )}
                </section>

                <div className="pt-6">
                    <button type="submit" disabled={submitting} className="w-full bg-slate-900 text-white font-medium py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2">
                        {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                        {submitting ? 'Memproses...' : 'Terbitkan Agenda'}
                    </button>
                </div>

            </form>
        )}
        </div>
    </div>
  );
};

const SoftInput = ({ type = "text", placeholder, value, onChange, bg = "bg-slate-50", ...props }) => (
    <input 
        type={type} 
        className={`w-full ${bg} border-0 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none`}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        {...props}
    />
);

const SoftSelect = ({ value, onChange, options }) => (
    <div className="relative">
        <select 
            className="w-full bg-slate-50 border-0 rounded-2xl px-5 py-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-100 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
            value={value}
            onChange={onChange}
        >
            {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
        </select>
        <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">▼</div>
    </div>
);

export default Dashboard;
import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, CartesianGrid 
} from 'recharts';
import { 
  Plus, Calendar, MapPin, Clock, Check, 
  Search, Crosshair, Loader2, ChevronRight, ArrowLeft, 
  CalendarDays, Users, LayoutDashboard, MonitorPlay, Eye
} from 'lucide-react';
import { toast } from 'sonner';

import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';
import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// --- IMPORT FITUR ANALITIK ---
import OnlineUsersCard from './analytic/OnlineUserCard';
import VisitorStats from './analytic/VisitorStats';

// --- LEAFLET SETUP ---
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

// --- MAIN COMPONENT ---
const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  
  const [chartData, setChartData] = useState([]); 
  const [recentSchedules, setRecentSchedules] = useState([]);
  const [currentTime, setCurrentTime] = useState(new Date());
  const [viewMode, setViewMode] = useState('dashboard');
  const [submitting, setSubmitting] = useState(false);

  // Form States
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

  // Handlers
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
    <div className="min-h-screen bg-slate-50/50 font-sans text-slate-800 pb-20">
        
        {/* --- HEADER --- */}
        <div className="sticky top-0 z-30 bg-white/80 backdrop-blur-xl border-b border-slate-200 px-4 sm:px-6 py-4 transition-all">
            <div className="max-w-7xl mx-auto flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <div className="flex items-center gap-3">
                    {viewMode === 'create' && (
                        <button onClick={() => setViewMode('dashboard')} className="p-2 -ml-2 hover:bg-slate-100 rounded-full transition-colors group">
                            <ArrowLeft size={20} className="text-slate-500 group-hover:text-slate-900" />
                        </button>
                    )}
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-slate-900 flex items-center gap-2">
                            {viewMode === 'create' ? 'Buat Agenda Baru' : 'Dashboard'}
                        </h1>
                        <p className="text-xs font-medium text-slate-500">
                            {role === 'super_admin' ? 'Monitoring & Analitik Global' : 'Kelola kegiatan organisasi Anda'}
                        </p>
                    </div>
                </div>
                
                <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end">
                    <div className="text-right hidden sm:block">
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">
                            {currentTime.toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'short' })}
                        </p>
                        <p className="text-lg font-black text-slate-900 leading-none tracking-tight">
                            {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                            <span className="text-xs font-medium text-slate-400 ml-1">WIB</span>
                        </p>
                    </div>

                    {viewMode === 'dashboard' && role === 'admin' && (
                        <button 
                            onClick={() => setViewMode('create')}
                            className="bg-slate-900 hover:bg-slate-800 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all flex items-center gap-2 shadow-lg shadow-slate-200 active:scale-95 hover:-translate-y-0.5"
                        >
                            <Plus size={18} /> <span className="hidden sm:inline">Agenda Baru</span>
                        </button>
                    )}
                </div>
            </div>
        </div>

        {/* --- MAIN CONTENT --- */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
        
        {/* === FITUR: DASHBOARD === */}
        {viewMode === 'dashboard' && (
            <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
                
                {/* 1. VISITOR STATS (Khusus Super Admin) */}
                {role === 'super_admin' && (
                    <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                        <div className="flex items-center gap-2 mb-4">
                            <div className="p-2 bg-purple-50 text-purple-600 rounded-lg"><Eye size={18}/></div>
                            <h3 className="font-bold text-slate-800 text-sm uppercase tracking-wide">Statistik Pengunjung</h3>
                        </div>
                        <VisitorStats />
                    </div>
                )}

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                    
                    {/* KOLOM KIRI (UTAMA) */}
                    <div className="lg:col-span-8 space-y-8">
                        
                        {/* Grafik Super Admin */}
                        {role === 'super_admin' && (
                            <div className="bg-white rounded-3xl p-6 border border-slate-100 shadow-sm">
                                <div className="flex items-center justify-between mb-6">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <div className="p-2 bg-blue-50 text-blue-600 rounded-lg">
                                            <Users size={18}/>
                                        </div>
                                        Aktivitas UKM
                                    </h3>
                                </div>
                                <div className="h-72 w-full">
                                    <ResponsiveContainer>
                                        <BarChart data={chartData}>
                                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 11, fill: '#64748b'}} interval={0} />
                                            <Tooltip cursor={{fill: '#f8fafc'}} contentStyle={{borderRadius:'12px', border:'none', boxShadow:'0 10px 15px -3px rgba(0, 0, 0, 0.1)'}} />
                                            <Bar dataKey="events" fill="#3b82f6" radius={[6, 6, 6, 6]} barSize={40} />
                                        </BarChart>
                                    </ResponsiveContainer>
                                </div>
                            </div>
                        )}

                        {/* Banner Admin UKM */}
                        {role === 'admin' && (
                            <div className="bg-gradient-to-r from-slate-900 to-slate-800 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-slate-200">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -mr-16 -mt-16 blur-3xl"></div>
                                <div className="relative z-10">
                                    <h2 className="text-2xl font-bold mb-2">Kelola Organisasi Lebih Mudah</h2>
                                    <p className="text-slate-300 max-w-lg text-sm leading-relaxed mb-6">
                                        Pantau jadwal, presensi anggota, dan publikasi berita dalam satu dashboard terintegrasi.
                                    </p>
                                    <div className="flex gap-3">
                                        <button onClick={() => setViewMode('create')} className="bg-white text-slate-900 px-4 py-2 rounded-lg text-sm font-bold hover:bg-slate-100 transition-colors">
                                            Buat Kegiatan
                                        </button>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* KOLOM KANAN (SIDEBAR) */}
                    <div className="lg:col-span-4 space-y-6">
                        
                        {/* 2. ONLINE USERS WIDGET (Muncul untuk Admin & Super Admin) */}
                        <OnlineUsersCard />

                        {/* List Jadwal Terakhir (Khusus Admin UKM) */}
                        {role === 'admin' && (
                            <div className="bg-white rounded-3xl border border-slate-100 shadow-sm overflow-hidden flex flex-col h-full max-h-[600px]">
                                <div className="p-6 border-b border-slate-100 flex justify-between items-center bg-white sticky top-0 z-10">
                                    <h3 className="font-bold text-slate-800 flex items-center gap-2">
                                        <CalendarDays size={18} className="text-blue-500"/> Jadwal Terakhir
                                    </h3>
                                    <button onClick={() => navigate('/admin/events')} className="text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition-colors">
                                        Lihat Semua
                                    </button>
                                </div>
                                
                                <div className="overflow-y-auto p-4 space-y-3 custom-scrollbar">
                                    {recentSchedules.length > 0 ? (
                                        recentSchedules.map((item, idx) => (
                                            <div key={idx} className="group bg-slate-50 hover:bg-white border border-transparent hover:border-blue-200 p-4 rounded-2xl transition-all duration-200 cursor-pointer shadow-sm hover:shadow-md">
                                                <div className="flex gap-4">
                                                    {/* Date Badge */}
                                                    <div className="flex flex-col items-center justify-center bg-white border border-slate-200 w-14 h-14 rounded-xl shadow-sm group-hover:border-blue-100 group-hover:bg-blue-50 transition-colors">
                                                        <span className="text-[10px] font-bold text-slate-400 uppercase group-hover:text-blue-500">
                                                            {new Date(item.event_date).toLocaleString('id-ID', { month: 'short' })}
                                                        </span>
                                                        <span className="text-xl font-black text-slate-800 leading-none group-hover:text-blue-700">
                                                            {new Date(item.event_date).getDate()}
                                                        </span>
                                                    </div>
                                                    
                                                    {/* Content */}
                                                    <div className="flex-1 min-w-0">
                                                        <h4 className="font-bold text-slate-900 text-sm truncate mb-1 group-hover:text-blue-700">{item.event_name}</h4>
                                                        <div className="flex flex-wrap gap-2">
                                                            <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium bg-slate-200 text-slate-600">
                                                                <Clock size={10}/> {item.start_time.slice(0,5)}
                                                            </span>
                                                            <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-medium border ${item.is_online ? 'bg-purple-50 text-purple-700 border-purple-100' : 'bg-orange-50 text-orange-700 border-orange-100'}`}>
                                                                {item.is_online ? <MonitorPlay size={10}/> : <MapPin size={10}/>}
                                                                {item.is_online ? 'Online' : 'Offline'}
                                                            </span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        ))
                                    ) : (
                                        <div className="text-center py-10">
                                            <div className="bg-slate-50 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-3">
                                                <Calendar size={24} className="text-slate-300" />
                                            </div>
                                            <p className="text-sm font-medium text-slate-900">Belum ada agenda</p>
                                            <p className="text-xs text-slate-500">Jadwal yang dibuat akan muncul di sini.</p>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        )}

        {/* === FITUR: CREATE FORM === */}
        {viewMode === 'create' && (
            <div className="max-w-3xl mx-auto animate-in slide-in-from-right-8 duration-500">
                <form onSubmit={handleSubmit} className="space-y-6">
                    
                    {/* SECTION 1: DETAIL */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <LayoutDashboard size={16} className="text-blue-600"/> Detail Kegiatan
                        </h3>
                        <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <SoftInput label="Nama Kegiatan" placeholder="Contoh: Rapat Bulanan" value={formData.event_name} onChange={(e) => setFormData({...formData, event_name: e.target.value})} autoFocus />
                                <SoftSelect label="Jenis Kegiatan" value={formData.type} onChange={(e) => setFormData({...formData, type: e.target.value})} options={['Rapat', 'Kegiatan', 'Pelatihan', 'Lainnya']} />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">Deskripsi</label>
                                <textarea 
                                    className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:bg-white transition-all resize-none h-28 outline-none"
                                    placeholder="Jelaskan secara singkat agenda kegiatan..."
                                    value={formData.description}
                                    onChange={(e) => setFormData({...formData, description: e.target.value})}
                                />
                            </div>
                        </div>
                    </div>

                    {/* SECTION 2: WAKTU */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider mb-4 flex items-center gap-2">
                            <Clock size={16} className="text-blue-600"/> Waktu & Presensi
                        </h3>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                            <SoftInput type="date" label="Tanggal Pelaksanaan" value={formData.event_date} onChange={(e) => setFormData({...formData, event_date: e.target.value})} />
                            <SoftInput type="time" label="Jam Mulai" value={formData.start_time} onChange={(e) => setFormData({...formData, start_time: e.target.value})} />
                            <SoftInput type="time" label="Jam Selesai" value={formData.end_time} onChange={(e) => setFormData({...formData, end_time: e.target.value})} />
                        </div>

                        <div className="bg-blue-50/50 rounded-2xl p-5 border border-blue-100">
                            <div className="flex items-center justify-between mb-4">
                                <span className="text-sm font-bold text-blue-900">Jendela Presensi</span>
                                <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-blue-100 shadow-sm">
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Toleransi</span>
                                    <input type="number" className="w-10 text-center font-bold text-slate-900 outline-none text-sm" value={formData.tolerance_minutes} onChange={(e) => setFormData({...formData, tolerance_minutes: e.target.value})} />
                                    <span className="text-[10px] font-bold text-slate-400 uppercase">Menit</span>
                                </div>
                            </div>
                            <div className="flex items-center gap-3">
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Buka</label>
                                    <input type="time" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-center font-bold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.attendance_open_time} onChange={(e) => setFormData({...formData, attendance_open_time: e.target.value})} />
                                </div>
                                <div className="pt-5 text-slate-300">-</div>
                                <div className="flex-1">
                                    <label className="text-[10px] font-bold text-slate-500 mb-1 block uppercase">Tutup</label>
                                    <input type="time" className="w-full bg-white border border-slate-200 rounded-xl px-3 py-2 text-center font-bold text-slate-900 shadow-sm outline-none focus:ring-2 focus:ring-blue-100" value={formData.attendance_close_time} onChange={(e) => setFormData({...formData, attendance_close_time: e.target.value})} />
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* SECTION 3: LOKASI */}
                    <div className="bg-white p-6 rounded-3xl border border-slate-100 shadow-sm">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
                            <h3 className="text-sm font-bold text-slate-900 uppercase tracking-wider flex items-center gap-2">
                                <MapPin size={16} className="text-blue-600"/> Lokasi Kegiatan
                            </h3>
                            <div className="flex bg-slate-100 p-1 rounded-xl">
                                <button type="button" onClick={() => setIsOnline(false)} className={`flex-1 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${!isOnline ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Offline</button>
                                <button type="button" onClick={() => setIsOnline(true)} className={`flex-1 px-4 py-1.5 text-xs font-bold rounded-lg transition-all ${isOnline ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-500 hover:text-slate-700'}`}>Online</button>
                            </div>
                        </div>

                        {isOnline ? (
                            <div className="space-y-4 animate-in fade-in">
                                <SoftInput label="Link Meeting" placeholder="https://zoom.us/j/..." value={formData.meeting_link} onChange={(e) => setFormData({...formData, meeting_link: e.target.value})} />
                                <SoftInput label="Platform" placeholder="Zoom / Google Meet" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                            </div>
                        ) : (
                            <div className="space-y-4 animate-in fade-in">
                                <div className="relative">
                                    <input type="text" className="w-full pl-10 pr-20 py-3 rounded-2xl bg-slate-50 border border-slate-200 focus:bg-white focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-sm font-medium placeholder-slate-400 outline-none" placeholder="Cari lokasi di peta..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                    <Search className="absolute left-3.5 top-3.5 text-slate-400" size={18} />
                                    <button type="button" onClick={handleSearchLocation} className="absolute right-1.5 top-1.5 bg-slate-200 hover:bg-slate-300 text-slate-600 px-3 py-1.5 rounded-xl text-xs font-bold transition-colors">
                                        Cari
                                    </button>
                                </div>

                                <div className="h-64 w-full bg-slate-100 rounded-2xl overflow-hidden relative z-0 border border-slate-200">
                                    <MapContainer center={mapCenter} zoom={17} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <MapController centerCoords={mapCenter} />
                                        <LocationPicker position={mapPosition} setPosition={setMapPosition} />
                                    </MapContainer>
                                    <button type="button" onClick={handleMyLocation} className="absolute bottom-3 right-3 bg-white p-2.5 rounded-xl shadow-md z-[400] hover:scale-105 transition-transform text-slate-700 border border-slate-200">
                                        <Crosshair size={20}/>
                                    </button>
                                </div>

                                <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between bg-slate-50 p-4 rounded-2xl border border-slate-200">
                                    <div className="flex items-center gap-3">
                                        <input type="checkbox" id="radius" className="w-5 h-5 text-blue-600 rounded-md border-slate-300 focus:ring-blue-500 cursor-pointer" checked={useRadius} onChange={() => setUseRadius(!useRadius)} />
                                        <label htmlFor="radius" className="text-sm font-bold text-slate-700 cursor-pointer select-none">Batasi Radius Presensi</label>
                                    </div>
                                    {useRadius && (
                                        <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg border border-slate-200 shadow-sm w-full sm:w-auto">
                                            <input type="number" className="w-full sm:w-16 bg-transparent text-right font-bold text-slate-900 outline-none text-sm" value={formData.radius_meters} onChange={(e) => setFormData({...formData, radius_meters: e.target.value})} />
                                            <span className="text-xs font-bold text-slate-400">Meter</span>
                                        </div>
                                    )}
                                </div>
                                <SoftInput label="Nama Tempat / Ruangan" placeholder="Contoh: Gedung A, Ruang 101" value={formData.location} onChange={(e) => setFormData({...formData, location: e.target.value})} />
                            </div>
                        )}
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="pt-4 pb-12 flex gap-4">
                        <button type="button" onClick={() => setViewMode('dashboard')} className="flex-1 px-6 py-4 rounded-2xl font-bold text-slate-500 bg-white border border-slate-200 hover:bg-slate-50 transition-all">
                            Batal
                        </button>
                        <button type="submit" disabled={submitting} className="flex-[2] bg-slate-900 text-white font-bold py-4 rounded-2xl hover:bg-slate-800 transition-all shadow-xl shadow-slate-200 active:scale-[0.98] disabled:opacity-70 flex justify-center items-center gap-2">
                            {submitting ? <Loader2 className="animate-spin" size={20} /> : <Check size={20} />}
                            {submitting ? 'Menyimpan...' : 'Terbitkan Agenda'}
                        </button>
                    </div>

                </form>
            </div>
        )}
        </div>
    </div>
  );
};

// --- REUSABLE COMPONENTS ---
const SoftInput = ({ type = "text", label, placeholder, value, onChange, ...props }) => (
    <div className="w-full">
        {label && <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{label}</label>}
        <input 
            type={type} 
            className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 placeholder-slate-400 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:bg-white transition-all outline-none"
            placeholder={placeholder}
            value={value}
            onChange={onChange}
            {...props}
        />
    </div>
);

const SoftSelect = ({ label, value, onChange, options }) => (
    <div className="w-full">
        {label && <label className="block text-xs font-bold text-slate-500 mb-1.5 ml-1">{label}</label>}
        <div className="relative">
            <select 
                className="w-full bg-slate-50 border border-slate-200 rounded-2xl px-4 py-3 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 focus:bg-white transition-all outline-none appearance-none cursor-pointer"
                value={value}
                onChange={onChange}
            >
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-slate-400">
                <ChevronRight size={16} className="rotate-90" />
            </div>
        </div>
    </div>
);

export default Dashboard;
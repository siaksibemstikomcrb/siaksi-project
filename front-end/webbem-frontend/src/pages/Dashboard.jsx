import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Users, Calendar, ShieldCheck, PlusCircle, 
  Clock, ArrowRight, CheckCircle, MapPin, Globe, Search, Crosshair, Link, Loader2, Map as MapIcon, ChevronRight
} from 'lucide-react';
import { toast } from 'sonner';

// --- IMPORT LEAFLET MAPS ---
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Koordinat Default (Kampus)
const KAMPUS_COORDS = { lat: -6.7126309, lng: 108.531254 };

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- HELPER MAP COMPONENTS ---
const MapController = ({ centerCoords }) => {
    const map = useMap();
    useEffect(() => {
        if (centerCoords) {
            map.flyTo(centerCoords, 17, { duration: 1.5 });
        }
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
  const [stats, setStats] = useState({ total_ukm: 0, total_users: 0, total_events: 0 });
  const [chartData, setChartData] = useState([]); 
  const [currentTime, setCurrentTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);

  // --- MAP & FORM STATE ---
  const [isOnline, setIsOnline] = useState(false);
  const [useRadius, setUseRadius] = useState(false);
  const [mapPosition, setMapPosition] = useState(null); 
  const [mapCenter, setMapCenter] = useState([KAMPUS_COORDS.lat, KAMPUS_COORDS.lng]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // FORM DATA
  const [formData, setFormData] = useState({
    event_name: '', description: '', location: '', event_date: '',
    start_time: '', end_time: '', attendance_open_time: '',
    attendance_close_time: '', tolerance_minutes: 15, type: 'Rapat',
    latitude: '', longitude: '', radius_meters: 50, meeting_link: ''
  });

  // --- LOGIC EFFECT ---
  useEffect(() => {
    if (mapPosition) {
        setFormData(prev => ({ ...prev, latitude: mapPosition.lat, longitude: mapPosition.lng }));
    }
  }, [mapPosition]);

  useEffect(() => {
    if (useRadius && !isOnline) {
        setMapPosition(KAMPUS_COORDS);
        setMapCenter([KAMPUS_COORDS.lat, KAMPUS_COORDS.lng]);
        setFormData(prev => ({ ...prev, latitude: KAMPUS_COORDS.lat, longitude: KAMPUS_COORDS.lng }));
        toast.info("Lokasi default diatur ke Kampus");
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
    if (role === 'super_admin') {
      const fetchGlobalStats = async () => {
        try {
          const res = await api.get('/monitoring/global');
          setStats({
            total_ukm: res.data.summary.total_ukm,
            total_users: res.data.summary.total_users,
            total_events: res.data.ukm_list.reduce((acc, ukm) => acc + parseInt(ukm.total_events || 0), 0)
          });
          const formattedChartData = res.data.ukm_list.map(ukm => ({
            name: ukm.ukm_name || ukm.name, 
            events: parseInt(ukm.total_events || 0)
          }));
          setChartData(formattedChartData);
        } catch (err) { console.error(err); }
      };
      fetchGlobalStats();
    }
  }, [role]);

  // --- HANDLERS ---
  const handleMyLocation = () => {
    if (navigator.geolocation) {
        toast.info("Mencari titik GPS...");
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            setMapPosition({ lat: latitude, lng: longitude });
            setMapCenter([latitude, longitude]);
            toast.success("Lokasi ditemukan!");
        }, () => toast.error("Gagal mengambil lokasi. Aktifkan GPS."));
    }
  };

  const handleSearchLocation = async (e) => {
    e.preventDefault();
    if (!searchQuery) return;
    setIsSearching(true);
    try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=json&q=${searchQuery}&limit=1`);
        const data = await response.json();
        if (data && data.length > 0) {
            const { lat, lon } = data[0];
            setMapPosition({ lat: parseFloat(lat), lng: parseFloat(lon) });
            setMapCenter([parseFloat(lat), parseFloat(lon)]);
            toast.success("Ketemu!");
        } else { toast.error("Lokasi tidak ditemukan!"); }
    } catch { toast.error("Error mencari lokasi."); } finally { setIsSearching(false); }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading("Menerbitkan...");
    try {
      const payload = {
          ...formData,
          latitude: (isOnline || !useRadius) ? null : formData.latitude,
          longitude: (isOnline || !useRadius) ? null : formData.longitude,
          meeting_link: isOnline ? formData.meeting_link : null
      };
      await api.post('/schedules', payload);
      toast.success('Agenda Terbit!', { id: toastId });
      setTimeout(() => navigate('/monitoring'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Gagal.', { id: toastId });
    } finally { setSubmitting(false); }
  };

  if (!role) return null;

  return (
    // CONTAINER UTAMA: Background abu-abu muda, padding bawah besar untuk sticky button
    <div className="min-h-screen bg-gray-50 pb-32 font-sans selection:bg-blue-100">
        
        {/* HEADER SECTION */}
        <div className="bg-white px-6 py-6 rounded-b-3xl shadow-sm border-b border-gray-100 mb-6">
            <div className="flex justify-between items-start">
                <div>
                    <h1 className="text-2xl font-black text-gray-900 tracking-tight">
                        {role === 'super_admin' ? 'Super Dashboard' : 'Buat Agenda'}
                    </h1>
                    <p className="text-gray-500 font-medium text-sm mt-1">SIAKSI Console</p>
                </div>
                <div className="bg-gray-50 px-3 py-2 rounded-xl border border-gray-100 text-right">
                    <p className="text-[10px] font-bold text-gray-400 uppercase">Waktu Server</p>
                    <p className="text-sm font-bold text-gray-900 tabular-nums">
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        </div>

        <div className="px-4 md:px-8 max-w-7xl mx-auto">
        {role === 'super_admin' ? (
          /* SUPER ADMIN VIEW */
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <StatCard title="Total UKM" value={stats.total_ukm} icon={<ShieldCheck size={24}/>} color="bg-blue-500" />
                <StatCard title="Total User" value={stats.total_users} icon={<Users size={24}/>} color="bg-purple-500" />
                <StatCard title="Kegiatan" value={stats.total_events} icon={<Calendar size={24}/>} color="bg-orange-500" />
            </div>
            
            <div className="bg-white p-6 rounded-3xl shadow-sm border border-gray-100">
                <h3 className="font-bold text-gray-900 mb-6">Statistik Kegiatan</h3>
                <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={chartData}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                            <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fontSize: 10}} interval={0} />
                            <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{borderRadius: '12px', border:'none', boxShadow:'0 10px 15px -3px rgba(0,0,0,0.1)'}} />
                            <Bar dataKey="events" radius={[6, 6, 0, 0]} fill="#3B82F6" barSize={30} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
                <NavButton onClick={() => navigate('/superadmin/manage-ukm')} label="Kelola UKM" color="blue" />
                <NavButton onClick={() => navigate('/superadmin/manage-users')} label="Kelola User" color="purple" />
            </div>
          </div>
        ) : (
          /* ADMIN UKM FORM - MODIFIKASI LEGA */
          <form onSubmit={handleSubmit} className="flex flex-col gap-6">
            
            {/* SECTION 1: INFO DASAR */}
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-5">
                <SectionHeader icon={<PlusCircle size={20}/>} title="Informasi Dasar" />
                
                <InputGroup label="Nama Kegiatan" value={formData.event_name} onChange={(v) => setFormData({...formData, event_name: v})} placeholder="Cth: Rapat Rutin" />
                
                <InputGroup label="Deskripsi" isTextArea value={formData.description} onChange={(v) => setFormData({...formData, description: v})} placeholder="Detail agenda..." />

                <InputGroup label="Kategori" value={formData.type} onChange={(v) => setFormData({...formData, type: v})} isSelect options={['Rapat', 'Kegiatan', 'Pelatihan']} />
            </div>

            {/* SECTION 2: LOKASI & MAPS */}
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <SectionHeader icon={<MapPin size={20}/>} title="Lokasi & Presensi" />

                {/* TOGGLE CARD */}
                <div className="bg-gray-50 p-4 rounded-2xl flex items-center justify-between border border-gray-200">
                    <div className="flex items-center gap-3">
                        <div className={`p-3 rounded-xl ${isOnline ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                            {isOnline ? <Globe size={24}/> : <MapPin size={24}/>}
                        </div>
                        <div>
                            <p className="font-bold text-gray-900 text-sm">Metode Acara</p>
                            <p className="text-xs text-gray-500 font-medium">{isOnline ? 'Online (Daring)' : 'Offline (Luring)'}</p>
                        </div>
                    </div>
                    <label className="relative inline-flex items-center cursor-pointer">
                        <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
                        <div className="w-12 h-7 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                    </label>
                </div>

                {isOnline ? (
                     <div className="animate-in fade-in slide-in-from-top-2">
                        <InputGroup label="Link Meeting" value={formData.meeting_link} onChange={(v) => setFormData({...formData, meeting_link: v})} placeholder="https://zoom.us/..." />
                        <div className="h-2"></div>
                        <InputGroup label="Platform / Info" value={formData.location} onChange={(v) => setFormData({...formData, location: v})} placeholder="Zoom Meeting" />
                     </div>
                ) : (
                    <div className="space-y-5 animate-in fade-in slide-in-from-top-2">
                        {/* RADIUS TOGGLE */}
                        <div className="flex items-center justify-between bg-blue-50/50 p-4 rounded-2xl border border-blue-100">
                            <div>
                                <p className="font-bold text-gray-800 text-sm">Wajib Radius?</p>
                                <p className="text-xs text-gray-500">Member harus ada di lokasi</p>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer">
                                <input type="checkbox" className="sr-only peer" checked={useRadius} onChange={() => setUseRadius(!useRadius)} />
                                <div className="w-10 h-6 bg-gray-300 rounded-full peer peer-checked:after:translate-x-full after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>

                        {useRadius && (
                            <div className="space-y-4">
                                {/* SEARCH BAR MAP */}
                                <div className="flex gap-2">
                                    <div className="relative flex-1">
                                        <input type="text" className="w-full pl-10 pr-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold transition-all" placeholder="Cari gedung/jalan..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                        <Search className="absolute left-3 top-3.5 text-gray-400" size={18} />
                                    </div>
                                    <button type="button" onClick={handleSearchLocation} className="bg-blue-600 text-white px-4 rounded-xl font-bold text-sm shadow-md active:scale-95 transition-transform">Cari</button>
                                </div>

                                {/* MAP CONTAINER */}
                                <div className="h-72 w-full rounded-2xl overflow-hidden shadow-lg border-2 border-white relative z-0">
                                    <MapContainer center={mapCenter} zoom={17} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                                        <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                        <MapController centerCoords={mapCenter} />
                                        <LocationPicker position={mapPosition} setPosition={setMapPosition} />
                                    </MapContainer>
                                    <button type="button" onClick={handleMyLocation} className="absolute bottom-4 right-4 bg-white text-blue-600 p-3 rounded-full shadow-lg z-[400] active:scale-90 transition-transform">
                                        <Crosshair size={24}/>
                                    </button>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Jarak Toleransi</p>
                                        <div className="flex items-center gap-2">
                                            <input type="number" className="w-full bg-transparent font-bold text-gray-900 outline-none text-lg" value={formData.radius_meters} onChange={(e) => setFormData({...formData, radius_meters: e.target.value})} />
                                            <span className="text-xs font-bold text-gray-400">Meter</span>
                                        </div>
                                    </div>
                                    <div className="bg-gray-50 p-3 rounded-xl border border-gray-200">
                                        <p className="text-[10px] uppercase text-gray-400 font-bold mb-1">Titik Koordinat</p>
                                        <p className="text-xs font-mono text-gray-600 truncate">{formData.latitude ? `${formData.latitude}, ${formData.longitude}` : 'Belum dipilih'}</p>
                                    </div>
                                </div>
                            </div>
                        )}
                        <InputGroup label="Nama Lokasi / Ruangan" value={formData.location} onChange={(v) => setFormData({...formData, location: v})} placeholder="Gedung A, Lantai 2" />
                    </div>
                )}
            </div>

            {/* SECTION 3: WAKTU */}
            <div className="bg-white p-5 md:p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
                <SectionHeader icon={<Clock size={20}/>} title="Waktu & Presensi" />

                <InputGroup label="Tanggal Acara" type="date" value={formData.event_date} onChange={(v) => setFormData({...formData, event_date: v})} />

                <div className="grid grid-cols-2 gap-4">
                    <InputGroup label="Mulai" type="time" value={formData.start_time} onChange={(v) => setFormData({...formData, start_time: v})} />
                    <InputGroup label="Selesai" type="time" value={formData.end_time} onChange={(v) => setFormData({...formData, end_time: v})} />
                </div>

                <div className="bg-orange-50 p-5 rounded-2xl border border-orange-100">
                    <p className="text-xs font-extrabold text-orange-600 uppercase mb-3 flex items-center gap-2">
                        <CheckCircle size={14}/> Jam Absen Dibuka
                    </p>
                    <div className="flex items-center gap-3">
                        <div className="flex-1">
                            <input type="time" className="w-full bg-white border border-orange-200 rounded-xl px-2 py-3 text-center font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-orange-400 outline-none" value={formData.attendance_open_time} onChange={(e) => setFormData({...formData, attendance_open_time: e.target.value})} />
                            <p className="text-[10px] text-center text-gray-400 mt-1 font-medium">BUKA</p>
                        </div>
                        <span className="text-orange-300 font-bold">-</span>
                        <div className="flex-1">
                            <input type="time" className="w-full bg-white border border-orange-200 rounded-xl px-2 py-3 text-center font-bold text-gray-900 shadow-sm focus:ring-2 focus:ring-orange-400 outline-none" value={formData.attendance_close_time} onChange={(e) => setFormData({...formData, attendance_close_time: e.target.value})} />
                            <p className="text-[10px] text-center text-gray-400 mt-1 font-medium">TUTUP</p>
                        </div>
                    </div>
                    <div className="mt-4 pt-4 border-t border-orange-200/50">
                        <div className="flex justify-between items-center">
                            <span className="text-xs font-bold text-gray-500 uppercase">Toleransi Keterlambatan</span>
                            <div className="flex items-center gap-2 bg-white px-3 py-1 rounded-lg border border-orange-100">
                                <input type="number" className="w-10 text-right font-bold text-gray-900 outline-none" value={formData.tolerance_minutes} onChange={(e) => setFormData({...formData, tolerance_minutes: e.target.value})} />
                                <span className="text-xs font-bold text-gray-400">Menit</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* STICKY BOTTOM BUTTON (MOBILE STYLE) */}
            <div className="fixed bottom-0 left-0 w-full bg-white/90 backdrop-blur-md border-t border-gray-200 p-4 z-50 md:static md:bg-transparent md:border-none md:p-0">
                <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-2xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 active:scale-95 disabled:bg-gray-400 disabled:scale-100">
                    {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle size={22} />}
                    {submitting ? 'Menyimpan...' : 'Terbitkan Agenda'}
                </button>
            </div>

          </form>
        )}
        </div>
    </div>
  );
};

// --- COMPONENTS YANG DIPERBAIKI (LEBIH LEGA) ---

const SectionHeader = ({ icon, title }) => (
    <div className="flex items-center gap-3 border-b border-gray-100 pb-4 mb-2">
        <div className="text-gray-400">{icon}</div>
        <h2 className="text-lg font-bold text-gray-900">{title}</h2>
    </div>
);

const StatCard = ({ title, value, icon, color }) => (
    <div className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm flex items-center gap-4">
        <div className={`p-4 rounded-2xl text-white shadow-md ${color}`}>{icon}</div>
        <div>
            <p className="text-xs font-bold text-gray-400 uppercase">{title}</p>
            <h3 className="text-2xl font-black text-gray-900">{value}</h3>
        </div>
    </div>
);

const NavButton = ({ onClick, label, color }) => (
    <button onClick={onClick} className="w-full bg-white p-4 rounded-2xl border border-gray-100 shadow-sm flex items-center justify-between hover:bg-gray-50 active:scale-95 transition-all">
        <span className="font-bold text-gray-700">{label}</span>
        <ChevronRight size={20} className="text-gray-300" />
    </button>
);

const InputGroup = ({ label, value, onChange, placeholder, isTextArea, isSelect, options, type="text" }) => (
    <div className="flex flex-col gap-2">
        <label className="text-xs font-bold text-gray-500 uppercase ml-1">{label}</label>
        {isTextArea ? (
            <textarea className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-medium min-h-[120px]" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
        ) : isSelect ? (
            <div className="relative">
                <select className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold appearance-none" value={value} onChange={(e) => onChange(e.target.value)}>
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-5 top-1/2 -translate-y-1/2 pointer-events-none text-gray-400">▼</div>
            </div>
        ) : (
            <input type={type} className="w-full bg-gray-50 border border-gray-200 rounded-2xl px-5 py-4 text-gray-900 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-sm font-bold placeholder-gray-400" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
        )}
    </div>
);

export default Dashboard;
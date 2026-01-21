import { useState, useEffect } from 'react';
import api from '../api/axios';
import { useNavigate } from 'react-router-dom';
import { 
  BarChart, Bar, ResponsiveContainer, XAxis, Tooltip, Cell, YAxis, CartesianGrid 
} from 'recharts';
import { 
  Users, Calendar, ShieldCheck, PlusCircle, 
  Clock, ArrowRight, CheckCircle, MapPin, Globe, Search, Crosshair, Link, Loader2, Map as MapIcon
} from 'lucide-react';
import { toast } from 'sonner';

// --- IMPORT LEAFLET MAPS ---
import { MapContainer, TileLayer, Marker, useMap, useMapEvents } from 'react-leaflet';
import 'leaflet/dist/leaflet.css';
import L from 'leaflet';

import icon from 'leaflet/dist/images/marker-icon.png';
import iconShadow from 'leaflet/dist/images/marker-shadow.png';

// Koordinat Default Kampus STIKOM Poltek Cirebon
const KAMPUS_COORDS = { lat: -6.7126309, lng: 108.531254 };

let DefaultIcon = L.icon({
    iconUrl: icon,
    shadowUrl: iconShadow,
    iconSize: [25, 41],
    iconAnchor: [12, 41]
});
L.Marker.prototype.options.icon = DefaultIcon;

// --- HELPER COMPONENTS FOR MAP ---
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
        click(e) {
            setPosition(e.latlng);
        },
    });
    return position ? <Marker position={position} /> : null;
};

const Dashboard = () => {
  const navigate = useNavigate();
  const role = localStorage.getItem('role');
  const [stats, setStats] = useState({ total_ukm: 0, total_users: 0, total_events: 0 });
  const [chartData, setChartData] = useState([]); 
  const [loading, setLoading] = useState(role === 'super_admin');
  const [currentTime, setCurrentTime] = useState(new Date());
  const [submitting, setSubmitting] = useState(false);

  // --- MAP & RADIUS STATE ---
  const [isOnline, setIsOnline] = useState(false);
  const [useRadius, setUseRadius] = useState(false);
  const [mapPosition, setMapPosition] = useState(null); 
  const [mapCenter, setMapCenter] = useState([KAMPUS_COORDS.lat, KAMPUS_COORDS.lng]); 
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearching, setIsSearching] = useState(false);

  // FORM DATA STATE
  const [formData, setFormData] = useState({
    event_name: '', description: '', location: '', event_date: '',
    start_time: '', end_time: '', attendance_open_time: '',
    attendance_close_time: '', tolerance_minutes: 15, type: 'Rapat',
    latitude: '', longitude: '', radius_meters: 50,
    meeting_link: ''
  });

  // Effect: Sinkronisasi Marker Map ke Form Latitude/Longitude
  useEffect(() => {
    if (mapPosition) {
        setFormData(prev => ({
            ...prev,
            latitude: mapPosition.lat,
            longitude: mapPosition.lng
        }));
    }
  }, [mapPosition]);

  // Effect: Logika Toggle Radius
  useEffect(() => {
    if (useRadius && !isOnline) {
        setMapPosition(KAMPUS_COORDS);
        setMapCenter([KAMPUS_COORDS.lat, KAMPUS_COORDS.lng]);
        setFormData(prev => ({
            ...prev,
            latitude: KAMPUS_COORDS.lat,
            longitude: KAMPUS_COORDS.lng
        }));
        toast.info("Lokasi default diatur ke Kampus");
    } else {
        setMapPosition(null);
        setFormData(prev => ({ ...prev, latitude: '', longitude: '' }));
    }
  }, [useRadius, isOnline]);

  // Effect: Reset Koordinat/Link jika toggle Online berubah
  useEffect(() => {
    if (isOnline) {
        setUseRadius(false);
        setFormData(prev => ({ 
            ...prev, 
            latitude: '', longitude: '', 
            location: 'Zoom / Google Meet' 
        }));
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
          setLoading(false);
        } catch (err) {
          console.error("Gagal ambil data:", err);
          setLoading(false);
        }
      };
      fetchGlobalStats();
    }
  }, [role]);

  const handleMyLocation = () => {
    if (navigator.geolocation) {
        toast.info("Mengambil lokasi GPS...");
        navigator.geolocation.getCurrentPosition((position) => {
            const { latitude, longitude } = position.coords;
            const newPos = { lat: latitude, lng: longitude };
            setMapPosition(newPos);
            setMapCenter([latitude, longitude]);
            toast.success("Lokasi ditemukan!");
        }, () => {
            toast.error("Gagal mengambil lokasi. Pastikan GPS aktif.");
        });
    } else {
        toast.error("Browser tidak mendukung Geolocation.");
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
            const newPos = { lat: parseFloat(lat), lng: parseFloat(lon) };
            setMapPosition(newPos);
            setMapCenter([parseFloat(lat), parseFloat(lon)]);
            toast.success("Lokasi ditemukan!");
        } else {
            toast.error("Lokasi tidak ditemukan!");
        }
    } catch (err) {
        toast.error("Gagal mencari lokasi.");
    } finally {
        setIsSearching(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    const toastId = toast.loading("Mempublikasikan jadwal...");

    try {
      const payload = {
          ...formData,
          latitude: (isOnline || !useRadius) ? null : formData.latitude,
          longitude: (isOnline || !useRadius) ? null : formData.longitude,
          meeting_link: isOnline ? formData.meeting_link : null
      };
      await api.post('/schedules', payload);
      toast.success('Jadwal Berhasil Diterbitkan!', { id: toastId });
      setTimeout(() => navigate('/monitoring'), 1000);
    } catch (err) {
      toast.error(err.response?.data?.msg || 'Gagal membuat jadwal.', { id: toastId });
    } finally {
        setSubmitting(false);
    }
  };

  if (!role) return null;

  return (
    // FIX 1: Padding Container utama dikurangi untuk mobile (p-4)
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans p-4 md:p-6 pb-24">
        
        {/* HEADER SECTION */}
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 md:mb-8 gap-4">
            <div>
                <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
                    {role === 'super_admin' ? 'Super Admin Overview' : 'Admin Console'}
                </h1>
                <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">SIAKSI - Manajemen Organisasi Mahasiswa</p>
            </div>
            {/* FIX 2: Width full on mobile */}
            <div className="w-full md:w-auto flex items-center gap-3 bg-white px-5 py-3 rounded-2xl shadow-sm border border-gray-200">
                <Clock size={20} className="text-blue-600" />
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-wider">Server Time</p>
                    <p className="text-lg font-bold text-gray-900 tabular-nums leading-none">
                        {currentTime.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })}
                    </p>
                </div>
            </div>
        </div>

        {role === 'super_admin' ? (
          /* ================================
              SUPER ADMIN VIEW
             ================================ */
          <div className="space-y-6 md:space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 md:gap-6">
                <StatCard title="Total UKM" value={stats.total_ukm} icon={<ShieldCheck size={28} className="text-blue-600"/>} bgIcon="bg-blue-100" />
                <StatCard title="Total Users" value={stats.total_users} icon={<Users size={28} className="text-purple-600"/>} bgIcon="bg-purple-100" />
                <StatCard title="Total Events" value={stats.total_events} icon={<Calendar size={28} className="text-orange-600"/>} bgIcon="bg-orange-100" />
            </div>
            
            {/* FIX 3: Gap lebih kecil di mobile */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
                {/* FIX 4: Padding Card dikurangi (p-5 untuk mobile, p-8 untuk desktop) */}
                <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-lg">
                    <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-4 md:mb-8">Distribusi Kegiatan UKM</h3>
                    <div className="h-64 md:h-80 w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={chartData}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f3f4f6" />
                                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 10}} dy={10} interval={0} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#6b7280', fontSize: 12}} />
                                <Tooltip cursor={{fill: '#f9fafb'}} contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 30px rgba(0,0,0,0.1)' }} />
                                <Bar dataKey="events" radius={[8, 8, 0, 0]} barSize={40}>
                                    {chartData.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={index % 2 === 0 ? '#3B82F6' : '#93C5FD'} />
                                    ))}
                                </Bar>
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
                <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-lg space-y-4 h-fit">
                    <h3 className="font-bold text-gray-900 text-lg md:text-xl mb-4">Aksi Cepat</h3>
                    <ActionButton onClick={() => navigate('/superadmin/manage-ukm')} label="Manajemen UKM" color="blue" />
                    <ActionButton onClick={() => navigate('/superadmin/manage-users')} label="Manajemen User" color="purple" />
                </div>
            </div>
          </div>
        ) : (
          /* ================================
              ADMIN UKM VIEW (FORM)
             ================================ */
          // FIX 5: Gap antar kolom dikurangi di mobile
          <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            
            {/* FIX 6: Card Form Padding Responsif (p-5 di HP, p-8 di Laptop) */}
            <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-lg">
                <div className="flex items-center gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
                    <div className="bg-blue-600 p-3 rounded-xl text-white shadow-md"><PlusCircle size={24} /></div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Buat Kegiatan Baru</h2>
                        <p className="text-gray-500 text-xs md:text-sm">Publikasikan agenda dan atur presensi.</p>
                    </div>
                </div>

                <div className="space-y-4 md:space-y-6">
                    <InputGroup label="Nama Kegiatan" value={formData.event_name} onChange={(v) => setFormData({...formData, event_name: v})} placeholder="Contoh: Rapat Koordinasi" />
                    
                    {/* TOGGLE ONLINE / OFFLINE */}
                    <div className="bg-gray-50 p-4 md:p-5 rounded-2xl border border-gray-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className={`p-3 rounded-xl ${isOnline ? 'bg-green-100 text-green-600' : 'bg-blue-100 text-blue-600'}`}>
                                {isOnline ? <Globe size={24}/> : <MapPin size={24}/>}
                            </div>
                            <div>
                                <p className="text-base font-bold text-gray-900">Metode Pelaksanaan</p>
                                <p className="text-sm text-gray-500 font-medium">{isOnline ? 'Online Meeting' : 'Offline / Tatap Muka'}</p>
                            </div>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer self-end sm:self-auto">
                            <input type="checkbox" className="sr-only peer" checked={isOnline} onChange={() => setIsOnline(!isOnline)} />
                            <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                    </div>

                    {/* INPUT LINK MEETING (ONLINE) */}
                    {isOnline && (
                         <div className="bg-green-50 p-4 md:p-5 rounded-2xl border border-green-200 animate-in fade-in slide-in-from-top-2 space-y-3">
                             <div className="flex items-center gap-2">
                                <Link size={18} className="text-green-700"/>
                                <label className="text-sm font-bold text-green-800 uppercase tracking-wide">Link Meeting</label>
                             </div>
                             <input type="url" className="w-full bg-white border border-green-300 rounded-xl px-5 py-4 text-gray-900 focus:ring-2 focus:ring-green-500 outline-none shadow-sm" placeholder="https://zoom.us/..." value={formData.meeting_link} onChange={(e) => setFormData({...formData, meeting_link: e.target.value})} />
                         </div>
                    )}

                    {/* TOGGLE RADIUS (OFFLINE ONLY) */}
                    {!isOnline && (
                        <div className="bg-blue-50/50 p-4 md:p-5 rounded-2xl border border-blue-100 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className={`p-3 rounded-xl ${useRadius ? 'bg-blue-600 text-white' : 'bg-gray-200 text-gray-500'}`}>
                                    <MapIcon size={24}/>
                                </div>
                                <div>
                                    <p className="text-base font-bold text-gray-900">Pembatasan Radius</p>
                                    <p className="text-sm text-gray-500 font-medium">Anggota wajib absen di lokasi.</p>
                                </div>
                            </div>
                            <label className="relative inline-flex items-center cursor-pointer self-end sm:self-auto">
                                <input type="checkbox" className="sr-only peer" checked={useRadius} onChange={() => setUseRadius(!useRadius)} />
                                <div className="w-14 h-8 bg-gray-300 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-blue-200 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[4px] after:left-[4px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-6 after:w-6 after:transition-all peer-checked:bg-blue-600"></div>
                            </label>
                        </div>
                    )}

                    {/* MAP SECTION (IF OFFLINE & RADIUS ON) */}
                    {!isOnline && useRadius && (
                        <div className="bg-white p-4 md:p-6 rounded-3xl border border-blue-100 space-y-5 animate-in fade-in zoom-in duration-300 shadow-inner bg-blue-50/30">
                            <div className="flex flex-col sm:flex-row gap-3">
                                <div className="relative flex-1">
                                    <input type="text" className="w-full pl-11 pr-4 py-3 rounded-xl border border-blue-200 focus:ring-2 focus:ring-blue-500 outline-none text-sm font-bold shadow-sm" placeholder="Cari lokasi custom..." value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleSearchLocation(e)} />
                                    <Search className="absolute left-4 top-3.5 text-blue-500" size={20} />
                                </div>
                                <div className="flex gap-2">
                                    <button type="button" onClick={handleSearchLocation} disabled={isSearching} className="flex-1 sm:flex-none bg-blue-600 text-white px-5 py-2 rounded-xl text-sm font-bold hover:bg-blue-700 transition-all">{isSearching ? '...' : 'Cari'}</button>
                                    <button type="button" onClick={handleMyLocation} className="bg-white text-blue-700 border border-blue-200 px-4 py-2 rounded-xl text-sm font-bold hover:bg-blue-50 transition-all flex items-center gap-2"><Crosshair size={20} /></button>
                                </div>
                            </div>

                            <div className="h-64 md:h-72 w-full rounded-2xl overflow-hidden border-4 border-white shadow-md z-0 relative">
                                <MapContainer center={mapCenter} zoom={17} scrollWheelZoom={false} style={{ height: "100%", width: "100%" }}>
                                    <TileLayer attribution='&copy; OpenStreetMap' url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
                                    <MapController centerCoords={mapCenter} />
                                    <LocationPicker position={mapPosition} setPosition={setMapPosition} />
                                </MapContainer>
                            </div>

                            <div className="grid grid-cols-2 gap-3 md:gap-4">
                                <InputGroup label="Latitude" value={formData.latitude} onChange={(v) => setFormData({...formData, latitude: v})} placeholder="Auto..." />
                                <InputGroup label="Longitude" value={formData.longitude} onChange={(v) => setFormData({...formData, longitude: v})} placeholder="Auto..." />
                            </div>
                            
                            <div>
                                <label className="text-sm font-bold text-gray-500 uppercase tracking-wide ml-1">Radius Toleransi (Meter)</label>
                                <input type="number" className="w-full mt-2 bg-white border border-gray-200 rounded-xl px-5 py-3 text-gray-900 font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.radius_meters} onChange={(e) => setFormData({...formData, radius_meters: e.target.value})} />
                            </div>
                        </div>
                    )}

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6">
                        <InputGroup label="Lokasi / Ruangan" value={formData.location} onChange={(v) => setFormData({...formData, location: v})} placeholder={isOnline ? "Zoom / GMeet" : "Gedung A, Lt 2"} />
                        <InputGroup label="Kategori" value={formData.type} onChange={(v) => setFormData({...formData, type: v})} isSelect options={['Rapat', 'Kegiatan', 'Pelatihan']} />
                    </div>

                    <InputGroup label="Deskripsi" isTextArea value={formData.description} onChange={(v) => setFormData({...formData, description: v})} placeholder="Detail kegiatan..." />
                </div>
            </div>

            {/* SIDEBAR: TIME SETTINGS */}
            {/* FIX 7: Sidebar juga menggunakan padding responsif */}
            <div className="bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-lg h-fit lg:sticky lg:top-6 space-y-4 md:space-y-6">
                <h3 className="text-xs font-extrabold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                    <Clock size={18} className="text-blue-500" /> Pengaturan Waktu
                </h3>
                <InputGroup label="Tanggal" type="date" value={formData.event_date} onChange={(v) => setFormData({...formData, event_date: v})} />
                <div className="grid grid-cols-2 gap-3 md:gap-4">
                    <InputGroup label="Mulai" type="time" value={formData.start_time} onChange={(v) => setFormData({...formData, start_time: v})} />
                    <InputGroup label="Selesai" type="time" value={formData.end_time} onChange={(v) => setFormData({...formData, end_time: v})} />
                </div>
                
                <div className="p-4 md:p-5 bg-gray-50 rounded-2xl border border-dashed border-gray-300">
                    <p className="text-xs font-extrabold text-gray-500 text-center mb-4 uppercase tracking-tighter">Jendela Presensi</p>
                    <div className="flex items-center gap-2 md:gap-3 mb-4">
                        <input type="time" className="flex-1 bg-white border border-gray-300 rounded-xl p-2 md:p-3 text-center text-sm md:text-lg font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.attendance_open_time} onChange={(e) => setFormData({...formData, attendance_open_time: e.target.value})} />
                        <span className="text-gray-400 font-bold">-</span>
                        <input type="time" className="flex-1 bg-white border border-gray-300 rounded-xl p-2 md:p-3 text-center text-sm md:text-lg font-bold shadow-sm focus:ring-2 focus:ring-blue-500 outline-none" value={formData.attendance_close_time} onChange={(e) => setFormData({...formData, attendance_close_time: e.target.value})} />
                    </div>
                    <input type="number" placeholder="Toleransi (Menit)" className="w-full bg-white border border-gray-300 rounded-xl p-3 text-center text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none" value={formData.tolerance_minutes} onChange={(e) => setFormData({...formData, tolerance_minutes: e.target.value})} />
                </div>

                <button type="submit" disabled={submitting} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all flex items-center justify-center gap-2 disabled:bg-gray-400">
                    {submitting ? <Loader2 className="animate-spin" /> : <CheckCircle size={20} />}
                    {submitting ? 'Publishing...' : 'Terbitkan Agenda'}
                </button>
            </div>
          </form>
        )}
    </div>
  );
};

// --- SMALL COMPONENTS ---
const StatCard = ({ title, value, icon, bgIcon }) => (
    <div className="bg-white p-5 md:p-6 rounded-3xl border border-gray-100 shadow-md hover:shadow-xl transition-all duration-300">
        <div className={`p-4 rounded-2xl ${bgIcon} w-fit mb-4 md:mb-5`}>{icon}</div>
        <p className="text-sm font-bold text-gray-500 mb-1 uppercase tracking-wide">{title}</p>
        <h3 className="text-3xl md:text-4xl font-extrabold text-gray-900 tabular-nums">{value}</h3>
    </div>
);

const ActionButton = ({ onClick, label, color }) => (
    <button onClick={onClick} className={`w-full flex items-center justify-between p-4 md:p-5 bg-gray-50 hover:bg-blue-50 border border-transparent hover:border-blue-200 rounded-2xl transition-all group`}>
        <span className="text-sm md:text-base font-bold text-gray-700 group-hover:text-blue-700">{label}</span>
        <div className="bg-white p-2 rounded-xl shadow-sm text-gray-400 group-hover:text-blue-600"><ArrowRight size={18} /></div>
    </button>
);

const InputGroup = ({ label, value, onChange, placeholder, isTextArea, isSelect, options, type="text" }) => (
    <div className="flex flex-col gap-2">
        <label className="text-sm font-bold text-gray-800 uppercase tracking-wide ml-1">{label}</label>
        {isTextArea ? (
            <textarea className="w-full bg-white border border-gray-300 rounded-xl px-4 md:px-5 py-3 md:py-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm h-32 text-sm md:text-base" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
        ) : isSelect ? (
            <select className="w-full bg-white border border-gray-300 rounded-xl px-4 md:px-5 py-3 md:py-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm appearance-none text-sm md:text-base" value={value} onChange={(e) => onChange(e.target.value)}>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        ) : (
            <input type={type} className="w-full bg-white border border-gray-300 rounded-xl px-4 md:px-5 py-3 md:py-4 text-gray-900 focus:ring-2 focus:ring-blue-500 outline-none shadow-sm text-sm md:text-base" placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} />
        )}
    </div>
);

export default Dashboard;
import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios'; // Sesuaikan path api
import { 
  Calendar, Clock, Save, ArrowLeft, MapPin, Globe, Search, 
  Crosshair, Link, Loader2, Map as MapIcon, CheckCircle
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

const EditSchedule = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  
  const [loading, setLoading] = useState(true);
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

  // --- 1. FETCH EXISTING DATA ---
  useEffect(() => {
    const fetchEvent = async () => {
        try {
            const res = await api.get(`/schedules/${id}`);
            const data = res.data;

            // Logic Deteksi Online/Offline
            const isOnlineEvent = !data.latitude && !data.longitude;
            setIsOnline(isOnlineEvent);
            setUseRadius(!isOnlineEvent && !!data.radius_meters); // Aktifkan radius jika offline dan ada datanya

            // Format Tanggal
            let formattedDate = '';
            if (data.event_date) {
                formattedDate = new Date(data.event_date).toISOString().split('T')[0];
            }

            setFormData({
                event_name: data.event_name || '',
                description: data.description || '',
                location: data.location || '',
                event_date: formattedDate,
                start_time: data.start_time || '',
                end_time: data.end_time || '',
                attendance_open_time: data.attendance_open_time || '',
                attendance_close_time: data.attendance_close_time || '',
                tolerance_minutes: data.tolerance_minutes || 15,
                type: data.type || 'Rapat',
                latitude: data.latitude || '',
                longitude: data.longitude || '',
                radius_meters: data.radius_meters || 50,
                meeting_link: data.meeting_link || ''
            });

            // Set Posisi Peta Awal
            if (!isOnlineEvent && data.latitude && data.longitude) {
                const pos = { lat: parseFloat(data.latitude), lng: parseFloat(data.longitude) };
                setMapPosition(pos);
                setMapCenter([pos.lat, pos.lng]);
            }

            setLoading(false);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat data jadwal.");
            navigate('/admin/events');
        }
    };
    fetchEvent();
  }, [id, navigate]);

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

  // Effect: Logika Toggle Radius (Hanya trigger jika user klik toggle, bukan saat load data awal)
  // Kita tambahkan pengecekan !loading agar tidak mereset data saat fetch
  useEffect(() => {
    if (!loading) {
        if (useRadius && !isOnline) {
            // Jika belum ada posisi, pakai default kampus
            if (!mapPosition) {
                setMapPosition(KAMPUS_COORDS);
                setMapCenter([KAMPUS_COORDS.lat, KAMPUS_COORDS.lng]);
                setFormData(prev => ({
                    ...prev,
                    latitude: KAMPUS_COORDS.lat,
                    longitude: KAMPUS_COORDS.lng
                }));
                toast.info("Lokasi diatur ke default Kampus");
            }
        } else if (!useRadius && !isOnline) {
            // Opsional: Jika radius dimatikan, apakah mau hapus koordinat? 
            // Biasanya dibiarkan saja, tapi radius dianggap tidak berlaku di backend logika
        }
    }
  }, [useRadius, isOnline, loading]);

  // Effect: Reset Koordinat/Link jika toggle Online berubah
  useEffect(() => {
    if (!loading) {
        if (isOnline) {
            setUseRadius(false);
            setFormData(prev => ({ 
                ...prev, 
                latitude: '', longitude: '', 
                location: prev.location.includes('Gedung') ? '' : prev.location // Reset lokasi fisik jika ada
            }));
            setMapPosition(null);
        } else {
            setFormData(prev => ({ ...prev, meeting_link: '' }));
        }
    }
  }, [isOnline, loading]);

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
    const toastId = toast.loading("Menyimpan perubahan...");

    try {
      const payload = {
          ...formData,
          // Logic: Jika Online ATAU Radius mati (dan tidak ada mapPosition), set null
          latitude: (isOnline) ? null : formData.latitude,
          longitude: (isOnline) ? null : formData.longitude,
          meeting_link: isOnline ? formData.meeting_link : null,
          // Pastikan nama lokasi terisi
          location: formData.location || (isOnline ? 'Online Meeting' : 'Lokasi Kampus')
      };

      await api.put(`/schedules/${id}`, payload);
      toast.success('Jadwal Berhasil Diperbarui!', { id: toastId });
      setTimeout(() => navigate('/admin/events'), 1000);
    } catch (err) {
      console.error(err);
      toast.error(err.response?.data?.msg || 'Gagal menyimpan jadwal.', { id: toastId });
    } finally {
        setSubmitting(false);
    }
  };

  if (loading) return <div className="h-screen flex items-center justify-center"><Loader2 className="animate-spin text-blue-600"/></div>;

  return (
    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 font-sans p-4 md:p-6 pb-24">
        
        {/* HEADER SECTION (Back Button) */}
        <button onClick={() => navigate('/admin/events')} className="mb-6 flex items-center text-gray-500 hover:text-blue-600 transition-colors font-bold text-sm group">
            <ArrowLeft size={18} className="mr-2 group-hover:-translate-x-1 transition-transform"/> Kembali ke Daftar
        </button>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-4 lg:gap-8">
            
            {/* LEFT COLUMN: MAIN FORM */}
            <div className="lg:col-span-2 bg-white p-5 md:p-8 rounded-3xl border border-gray-100 shadow-lg">
                <div className="flex items-center gap-4 mb-6 md:mb-8 pb-4 md:pb-6 border-b border-gray-100">
                    <div className="bg-blue-600 p-3 rounded-xl text-white shadow-md"><Calendar size={24} /></div>
                    <div>
                        <h2 className="text-xl md:text-2xl font-bold text-gray-900">Edit Kegiatan</h2>
                        <p className="text-gray-500 text-xs md:text-sm">Perbarui informasi jadwal dan lokasi.</p>
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

            {/* RIGHT COLUMN: SIDEBAR TIME SETTINGS */}
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
                    {submitting ? <Loader2 className="animate-spin" /> : <Save size={20} />}
                    {submitting ? 'Menyimpan...' : 'Simpan Perubahan'}
                </button>
            </div>
        </form>
    </div>
  );
};

// --- SMALL COMPONENTS ---
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

export default EditSchedule;
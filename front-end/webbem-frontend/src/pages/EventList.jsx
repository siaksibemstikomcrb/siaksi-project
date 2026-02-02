import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { 
  Calendar, Clock, Search, MapPin, 
  Edit3, Trash2, XCircle, Ban, CheckCircle2, 
  History
} from 'lucide-react';
import { toast } from 'sonner';

const EventList = () => {
  const navigate = useNavigate();
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [activeTab, setActiveTab] = useState('upcoming'); 

  const fetchEvents = async () => {
    try {
      const res = await api.get('/schedules?all=true');
      setEvents(res.data);
      setLoading(false);
    } catch (err) {
      console.error("Error fetching events:", err);
      toast.error("Gagal memuat data kegiatan.");
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEvents();
  }, []);

  const handleDelete = async (id) => {
    if (!confirm("Hapus permanen? Data absensi juga akan hilang.")) return;
    try {
      await api.delete(`/schedules/${id}`);
      setEvents(prev => prev.filter(ev => ev.id !== id));
      toast.success("Dihapus permanen.");
    } catch (err) {
      toast.error("Gagal menghapus.");
    }
  };

  const handleCancel = async (id) => {
    if (!confirm("Batalkan kegiatan ini?")) return;
    try {
      await api.put(`/schedules/${id}/cancel`); 
      setEvents(prev => prev.map(ev => ev.id === id ? { ...ev, status: 'BATAL' } : ev));
      toast.success("Kegiatan dibatalkan.");
    } catch (err) {
      toast.error("Gagal membatalkan.");
    }
  };

  const handleEdit = (id) => {
    navigate(`/admin/events/edit/${id}`);
  };

  const filteredData = useMemo(() => {
    const searchFiltered = events.filter(ev => 
      ev.event_name.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return searchFiltered.reduce((acc, ev) => {
      if (ev.status === 'BATAL') {
        acc.cancelled.push(ev);
      } 
      else if (ev.status_kegiatan === 'upcoming') {
        acc.upcoming.push(ev);
      } 
      else {
        acc.history.push(ev);
      }
      return acc;
    }, { upcoming: [], history: [], cancelled: [] });
  }, [events, searchTerm]);

  const TabButton = ({ id, label, icon, count, colorClass }) => (
    <button
      onClick={() => setActiveTab(id)}
      className={`flex items-center gap-2 px-4 py-3 rounded-xl transition-all font-bold text-sm whitespace-nowrap
        ${activeTab === id 
          ? `bg-white shadow-md text-gray-800 ring-1 ring-gray-200` 
          : 'text-gray-500 hover:bg-white/50 hover:text-gray-700'
        }`}
    >
      {icon}
      {label}
      <span className={`ml-1 px-2 py-0.5 rounded-full text-[10px] ${activeTab === id ? colorClass : 'bg-gray-200 text-gray-500'}`}>
        {count}
      </span>
    </button>
  );

  if (loading) return <div className="p-10 text-center text-gray-400">Memuat data...</div>;

  return (
    <div className="font-sans min-h-screen pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Manajemen Kegiatan</h1>
          <p className="text-gray-500 text-sm">Kelola jadwal dan riwayat kegiatan.</p>
        </div>
        
        <div className="relative w-full md:w-72">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"/>
          <input 
            type="text" 
            placeholder="Cari kegiatan..." 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm font-medium shadow-sm"
          />
        </div>
      </div>

      <div className="flex gap-2 overflow-x-auto pb-4 mb-4 scrollbar-hide">
        <TabButton 
          id="upcoming" 
          label="Akan Datang" 
          icon={<Calendar size={16} className={activeTab === 'upcoming' ? 'text-purple-600' : ''}/>} 
          count={filteredData.upcoming.length}
          colorClass="bg-purple-100 text-purple-700"
        />
        <TabButton 
          id="history" 
          label="Riwayat / Selesai" 
          icon={<History size={16} className={activeTab === 'history' ? 'text-blue-600' : ''}/>} 
          count={filteredData.history.length}
          colorClass="bg-blue-100 text-blue-700"
        />
        <TabButton 
          id="cancelled" 
          label="Dibatalkan" 
          icon={<XCircle size={16} className={activeTab === 'cancelled' ? 'text-red-600' : ''}/>} 
          count={filteredData.cancelled.length}
          colorClass="bg-red-100 text-red-700"
        />
      </div>

      <div className="grid gap-4">
        {filteredData[activeTab].length === 0 ? (
          <div className="text-center py-12 bg-white rounded-2xl border border-dashed border-gray-200">
            <p className="text-gray-400 font-medium">Tidak ada kegiatan di kategori ini.</p>
          </div>
        ) : (
          filteredData[activeTab].map((ev) => (
            <EventCard 
              key={ev.id} 
              ev={ev} 
              tabType={activeTab}
              onDelete={() => handleDelete(ev.id)}
              onCancel={() => handleCancel(ev.id)}
              onEdit={() => handleEdit(ev.id)}
              navigate={navigate}
            />
          ))
        )}
      </div>
    </div>
  );
};

const EventCard = ({ ev, tabType, onDelete, onCancel, onEdit, navigate }) => {
  const isBatal = tabType === 'cancelled';
  const isActuallyLive = ev.status_kegiatan === 'ongoing'; 

  return (
    <div className={`bg-white p-5 rounded-2xl border transition-all hover:shadow-md flex flex-col md:flex-row justify-between gap-4 
      ${isActuallyLive ? 'border-blue-300 ring-2 ring-blue-100' : 'border-gray-100'}
      ${isBatal ? 'opacity-70 bg-gray-50' : ''}
    `}>
      
      <div className="flex items-start gap-4">
        <div className={`flex flex-col items-center justify-center w-14 h-14 rounded-xl shrink-0 font-bold border
          ${isBatal ? 'bg-gray-100 border-gray-200 text-gray-400' : 
            isActuallyLive ? 'bg-blue-600 border-blue-600 text-white' : 'bg-gray-50 border-gray-100 text-gray-700'}`
        }>
          <span className="text-xs uppercase">{new Date(ev.event_date).toLocaleString('id-ID', { month: 'short' })}</span>
          <span className="text-xl">{new Date(ev.event_date).getDate()}</span>
        </div>

        <div>
          <h3 className={`font-bold text-lg leading-tight ${isBatal ? 'line-through text-gray-500' : 'text-gray-800'}`}>
            {ev.event_name}
            {isActuallyLive && !isBatal && (
                <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800">
                    SEDANG BERLANGSUNG
                </span>
            )}
          </h3>
          
          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
            <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
              <Clock size={14} className="text-blue-500"/> 
              {ev.start_time?.slice(0,5)} - {ev.end_time?.slice(0,5)} WIB
            </span>
            {ev.location && (
               <span className="flex items-center gap-1.5 bg-gray-50 px-2 py-1 rounded-md">
                 <MapPin size={14} className="text-red-500"/> {ev.location}
               </span>
            )}
          </div>
        </div>
      </div>

      <div className="flex items-center gap-2 self-end md:self-center border-t md:border-t-0 border-gray-100 pt-4 md:pt-0 w-full md:w-auto justify-end">
        
        <button 
          onClick={() => navigate(`/admin/events/${ev.id}`)}
          className="px-4 py-2 bg-gray-900 text-white rounded-lg text-xs font-bold hover:bg-gray-800 transition-colors"
        >
          {isActuallyLive ? 'Pantau Live' : 'Laporan'}
        </button>

        {!isBatal && (
          <button onClick={onEdit} className="p-2 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-lg border border-gray-200">
            <Edit3 size={18}/>
          </button>
        )}

        {(tabType === 'upcoming' || isActuallyLive) && !isBatal && (
          <button onClick={onCancel} className="p-2 text-gray-500 hover:text-orange-600 hover:bg-orange-50 rounded-lg border border-gray-200">
            <Ban size={18}/>
          </button>
        )}

        <button onClick={onDelete} className="p-2 text-gray-500 hover:text-red-600 hover:bg-red-50 rounded-lg border border-gray-200">
          <Trash2 size={18}/>
        </button>

      </div>
    </div>
  );
};

export default EventList;
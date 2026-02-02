import { useState, useEffect } from 'react';
import api from '../api/axios';
import { downloadPDF } from '../utils/downloadPDF';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, Users, Calendar, Download, ArrowRight, Shield, Filter } from 'lucide-react';

const GlobalMonitoring = () => {
  const navigate = useNavigate();
  const [searchTerm, setSearchTerm] = useState("");
  const [ukmStats, setUkmStats] = useState([]);
  const [summary, setSummary] = useState({ total_ukm: 0, total_users: 0 });
  const role = localStorage.getItem('role');
  const myUkmId = localStorage.getItem('ukm_id');

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await api.get('/monitoring/global'); 
        setUkmStats(res.data.ukm_list);
        setSummary(res.data.summary);
      } catch (err) { console.error("Error loading data"); }
    };
    fetchData();
  }, []);

  const filteredData = ukmStats.filter(item => 
    role === 'super_admin' 
      ? item.ukm_name.toLowerCase().includes(searchTerm.toLowerCase())
      : item.id === parseInt(myUkmId)
  );

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      
      <div className="flex flex-col md:flex-row justify-between items-end gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Monitoring UKM</h1>
          <p className="text-gray-500 text-sm mt-1">Pantau aktivitas dan statistik organisasi secara real-time.</p>
        </div>

        {role === 'super_admin' && (
          <div className="flex gap-4">
            <SummaryCard label="Total UKM" value={summary.total_ukm} color="text-blue-600" bg="bg-blue-50" />
            <SummaryCard label="Total Users" value={summary.total_users} color="text-purple-600" bg="bg-purple-50" />
          </div>
        )}
      </div>

      {role === 'super_admin' && (
        <div className="relative group">
          <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
            <Search className="text-gray-400 group-focus-within:text-blue-600 transition-colors" size={20} />
          </div>
          <input 
            type="text" 
            placeholder="Cari Nama UKM atau Organisasi..." 
            className="w-full bg-white border border-gray-200 rounded-2xl py-4 pl-12 pr-4 text-gray-800 font-medium outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all shadow-sm"
            onChange={(e) => setSearchTerm(e.target.value)} 
          />
          <div className="absolute inset-y-0 right-2 flex items-center">
             <button className="p-2 bg-gray-100 hover:bg-gray-200 rounded-xl text-gray-500 transition-colors">
                <Filter size={18} />
             </button>
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredData.map((ukm) => (
          <motion.div 
            key={ukm.id} 
            whileHover={{ y: -5 }}
            className="bg-white rounded-3xl border border-gray-100 p-6 shadow-sm hover:shadow-xl transition-all group flex flex-col justify-between h-full"
          >
            <div>
                <div className="flex justify-between items-start mb-4">
                    <div className="bg-blue-50 p-3 rounded-2xl text-blue-600">
                        <Shield size={24} />
                    </div>
                    <button 
                        onClick={(e) => { e.stopPropagation(); downloadPDF(ukm); }} 
                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition-all"
                        title="Download Report"
                    >
                        <Download size={20} />
                    </button>
                </div>
                
                <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-1">{ukm.ukm_name}</h3>
                <p className="text-gray-500 text-sm mb-6 line-clamp-2 h-10">
                    {ukm.description || 'Deskripsi organisasi belum ditambahkan.'}
                </p>
                
                <div className="grid grid-cols-2 gap-3 mb-6">
                    <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                            <Users size={14} /> <span className="text-xs font-bold uppercase">Anggota</span>
                        </div>
                        <p className="text-lg font-black text-gray-900">{ukm.total_members}</p>
                    </div>
                    <div className="bg-gray-50 p-3 rounded-xl">
                        <div className="flex items-center gap-1.5 text-gray-500 mb-1">
                            <Calendar size={14} /> <span className="text-xs font-bold uppercase">Kegiatan</span>
                        </div>
                        <p className="text-lg font-black text-gray-900">{ukm.total_events}</p>
                    </div>
                </div>
            </div>

            <button 
              onClick={() => navigate(`/monitoring/ukm/${ukm.id}`)} 
              className="w-full py-3 bg-white border border-gray-200 text-gray-700 font-bold rounded-xl hover:bg-blue-600 hover:text-white hover:border-transparent transition-all flex items-center justify-center gap-2 text-sm"
            >
              Lihat Detail <ArrowRight size={16} />
            </button>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

const SummaryCard = ({ label, value, color, bg }) => (
  <div className={`px-5 py-3 rounded-2xl border border-gray-100 shadow-sm ${bg} flex items-center gap-4`}>
    <div>
        <p className="text-xs font-bold text-gray-500 uppercase tracking-wider">{label}</p>
        <p className={`text-xl font-black ${color} tabular-nums`}>{value}</p>
    </div>
  </div>
);

export default GlobalMonitoring;
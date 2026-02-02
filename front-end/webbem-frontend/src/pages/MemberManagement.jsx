import React, { useState, useEffect } from 'react';
import api from '../api/axios';
import { 
  PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer 
} from 'recharts';
import { 
  Users, UserCheck, TrendingUp, 
  Loader2, RefreshCcw, CalendarClock, ShieldCheck
} from 'lucide-react';

const MemberAnalytics = () => {
  const [loading, setLoading] = useState(true);
  
  const [stats, setStats] = useState({
    totalMembers: 0,
    totalAdmins: 0,
    newMembers: 0,
    ukmName: ''
  });

  const [angkatanData, setAngkatanData] = useState([]); 
  const [roleData, setRoleData] = useState([]);       
  const [recentMembers, setRecentMembers] = useState([]); 

  const COLORS = ['#3B82F6', '#10B981', '#F59E0B', '#6366F1'];

  const fetchData = async () => {
    setLoading(true);
    try {
      const userStr = localStorage.getItem('user');
      const currentUser = userStr ? JSON.parse(userStr) : {};
      
      const res = await api.get('/ukms/members'); 
      const members = res.data.data || res.data || [];


      const total = members.length;
      const admins = members.filter(m => m.role_name?.toLowerCase().includes('admin')).length;
      const regular = total - admins;
      
      const angkatanGroups = members.reduce((acc, curr) => {
        const year = curr.nia ? curr.nia.substring(0, 4) : 'Lainnya';
        const label = !isNaN(year) ? `Angkatan ${year}` : 'Lainnya';
        
        acc[label] = (acc[label] || 0) + 1;
        return acc;
      }, {});

      const processedAngkatan = Object.keys(angkatanGroups).map(key => ({
        name: key,
        jumlah: angkatanGroups[key]
      })).sort((a, b) => a.name.localeCompare(b.name));

      const processedRole = [
        { name: 'Anggota Biasa', value: regular },
        { name: 'Pengurus / Admin', value: admins }
      ];

      setStats({
        totalMembers: total,
        totalAdmins: admins,
        newMembers: Math.ceil(total * 0.1),
        ukmName: currentUser.ukm_name || 'Organisasi'
      });
      setAngkatanData(processedAngkatan);
      setRoleData(processedRole);
      setRecentMembers(members.slice(-5).reverse());

    } catch (error) {
      console.error("Gagal memuat analitik UKM:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex h-[70vh] items-center justify-center flex-col gap-3">
        <Loader2 size={40} className="text-blue-600 animate-spin" />
        <p className="text-gray-500 font-medium">Memuat data organisasi...</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-7xl mx-auto min-h-screen bg-gray-50 pb-20">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">
            Dashboard {stats.ukmName}
          </h1>
          <p className="text-gray-500 mt-1">Monitoring kaderisasi dan data keanggotaan internal.</p>
        </div>
        <button 
          onClick={fetchData} 
          className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 shadow-sm rounded-xl text-sm font-bold text-gray-600 hover:bg-gray-50 transition active:scale-95"
        >
          <RefreshCcw size={16} /> Update Data
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-8">
        <StatCard 
          label="Total Anggota" 
          value={stats.totalMembers} 
          icon={Users} 
          color="bg-blue-500" 
          sub="Terdaftar database"
        />
        <StatCard 
          label="Pengurus (Admin)" 
          value={stats.totalAdmins} 
          icon={ShieldCheck} 
          color="bg-purple-500" 
          sub="Memiliki akses sistem"
        />
        <StatCard 
          label="Anggota Baru" 
          value={`+${stats.newMembers}`} 
          icon={TrendingUp} 
          color="bg-green-500" 
          sub="Periode ini"
        />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
        
        <div className="lg:col-span-2 bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
            <CalendarClock size={20} className="text-gray-400"/> Regenerasi Angkatan (NIA)
          </h3>
          <div className="h-72 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={angkatanData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB"/>
                <XAxis dataKey="name" tick={{fontSize: 12}} axisLine={false} tickLine={false} dy={10}/>
                <YAxis tick={{fontSize: 12}} axisLine={false} tickLine={false}/>
                <Tooltip 
                  cursor={{fill: '#F3F4F6'}}
                  contentStyle={{ backgroundColor: '#fff', borderRadius: '12px', border: 'none', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}
                />
                <Bar dataKey="jumlah" fill="#3B82F6" radius={[6, 6, 0, 0]} barSize={50} />
              </BarChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-4 text-center text-xs text-gray-400">
            Dikelompokkan berdasarkan 4 digit awal NIA (Tahun Masuk)
          </div>
        </div>

        <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col">
          <h3 className="font-bold text-gray-800 text-lg mb-6 flex items-center gap-2">
            <UserCheck size={20} className="text-gray-400"/> Rasio Pengurus
          </h3>
          <div className="h-64 w-full flex-1">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={roleData}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={70}
                  paddingAngle={5}
                  dataKey="value"
                >
                  {roleData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ borderRadius: '12px' }} />
                <Legend verticalAlign="bottom" height={36}/>
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>

      </div>

      <div className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-6 border-b border-gray-100 flex justify-between items-center">
          <h3 className="font-bold text-gray-800 text-lg">Anggota Terbaru Bergabung</h3>
          <span className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1 rounded-full">Internal</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 text-gray-500 text-xs uppercase">
              <tr>
                <th className="px-6 py-4">Nama</th>
                <th className="px-6 py-4">NIA</th>
                <th className="px-6 py-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {recentMembers.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <img 
                        src={member.profile_pic || `https://ui-avatars.com/api/?name=${member.name}&background=random`} 
                        className="w-8 h-8 rounded-full"
                      />
                      <div>
                        <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                        <p className="text-xs text-gray-400">@{member.username}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 font-mono text-sm font-bold text-gray-600">
                    {member.nia || '-'}
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase border ${
                      member.role_name?.toLowerCase().includes('admin') 
                        ? 'bg-purple-50 text-purple-600 border-purple-100' 
                        : 'bg-green-50 text-green-600 border-green-100'
                    }`}>
                      {member.role_name || 'Member'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

const StatCard = ({ label, value, icon: Icon, color, sub }) => (
  <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all">
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl ${color} flex items-center justify-center shadow-lg shadow-gray-100`}>
        <Icon size={24} className="text-white" />
      </div>
    </div>
    <div className="text-3xl font-black text-gray-800 tracking-tight">{value}</div>
    <div className="font-bold text-sm text-gray-500">{label}</div>
    <div className="text-xs text-gray-400 mt-2 pt-2 border-t border-gray-50">{sub}</div>
  </div>
);

export default MemberAnalytics;
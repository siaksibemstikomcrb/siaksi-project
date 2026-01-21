import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Camera, Shield, MapPin, Loader2, Key, CheckCircle, 
  CreditCard, Activity, Calendar
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ attendance: 0 });
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview'); // overview, security
  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [updatingPass, setUpdatingPass] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/users/me');
      setUser(res.data.user);
      setStats(res.data.stats);
      setLoading(false);
    } catch (err) {
      toast.error("Gagal memuat profil.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);

  const handlePhotoChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    const formData = new FormData();
    formData.append('photo', file);
    setUploading(true);
    try {
      const res = await api.post('/users/photo', formData, { headers: { 'Content-Type': 'multipart/form-data' } });
      setUser(prev => ({ ...prev, profile_pic: res.data.profile_pic }));
      toast.success("Foto diperbarui!");
    } catch (err) { toast.error("Gagal upload."); } 
    finally { setUploading(false); }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return toast.error("Konfirmasi password tidak cocok!");
    setUpdatingPass(true);
    try {
      await api.put('/users/password', { currentPassword: passData.current, newPassword: passData.new });
      toast.success("Password berhasil diubah!");
      setPassData({ current: '', new: '', confirm: '' });
    } catch (err) { toast.error(err.response?.data?.msg || "Gagal mengubah password."); } 
    finally { setUpdatingPass(false); }
  };
  if (loading) return <div className="flex h-screen items-center justify-center bg-gray-50"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-slate-800"> 
      {/* --- 1. BANNER & HEADER SECTION --- */}
      <div className="bg-white pb-8 shadow-sm border-b border-gray-200">
        {/* Banner Background */}
        <div className="h-48 bg-gradient-to-r from-blue-700 to-indigo-800 relative">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative">
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 gap-6">             
                {/* Avatar Profile */}
                <div className="relative group">
                    <div className="w-32 h-32 md:w-40 md:h-40 rounded-full border-4 border-white shadow-xl overflow-hidden bg-white">
                        <img 
                            src={user?.profile_pic || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                        {/* Overlay Upload */}
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]"
                        >
                            {uploading ? <Loader2 className="animate-spin" size={24}/> : <Camera size={24}/>}
                            <span className="text-[10px] font-bold mt-1">GANTI FOTO</span>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </div>
                </div>
                {/* Info Utama */}
                <div className="flex-1 text-center md:text-left mb-2">
                    <h1 className="text-3xl font-bold text-gray-900 capitalize">{user?.name || user?.username}</h1>
                    <p className="text-gray-500 font-medium">@{user?.username}</p>             
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mt-3">
                        <span className="flex items-center gap-1.5 bg-blue-50 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-blue-100">
                            <Shield size={14}/> {user?.role_name}
                        </span>
                        {user?.ukm_name && (
                             <span className="flex items-center gap-1.5 bg-orange-50 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-orange-100">
                                <MapPin size={14}/> {user?.ukm_name}
                            </span>
                        )}
                    </div>
                </div>
                {/* Tabs Navigation */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >Info Personal</button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`px-5 py-2 text-sm font-bold rounded-lg transition-all ${activeTab === 'security' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >Keamanan</button>
                </div>
            </div>
        </div>
      </div>
      {/* --- 2. CONTENT SECTION --- */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">     
        {/* === TAB 1: OVERVIEW === */}
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">      
                {/* KOLOM KIRI: STATS */}
                <div className="space-y-6">
                    {/* Attendance Card */}
                    <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden">
                         <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 z-0"></div>
                         <div className="relative z-10">
                             <p className="text-sm font-medium text-gray-500 mb-1">Total Kehadiran</p>
                             <p className="text-4xl font-black text-gray-900">{stats.attendance}</p>
                         </div>
                         <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center relative z-10">
                             <Activity size={24}/>
                         </div>
                    </div>
                     {/* Status Card */}
                     <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                <User size={20}/>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Status Akun</p>
                                <p className="text-xs text-green-600 font-medium">Aktif & Terverifikasi</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-blue-500 rounded-full"></div>
                        </div>
                        <p className="text-xs text-gray-400 mt-2 text-right">Kelengkapan data 100%</p>
                    </div>
                </div>
                {/* KOLOM KANAN: DETAIL INFO */}
                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-6 py-4 border-b border-gray-100 bg-gray-50/50 flex items-center gap-2">
                            <CreditCard size={18} className="text-gray-400"/>
                            <h3 className="font-bold text-gray-800 text-sm">Detail Informasi</h3>
                        </div>
                        <div className="divide-y divide-gray-50">
                            {/* Email */}
                            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 hover:bg-gray-50/50 transition">
                                <div className="text-sm font-medium text-gray-500">Alamat Email</div>
                                <div className="md:col-span-2 text-sm font-bold text-gray-900 flex items-center gap-2">
                                    <Mail size={16} className="text-gray-400"/> {user?.email}
                                </div>
                            </div>
                            {/* NIA */}
                            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 hover:bg-gray-50/50 transition">
                                <div className="text-sm font-medium text-gray-500">Nomor Induk (NIA)</div>
                                <div className="md:col-span-2 text-sm font-mono font-bold text-gray-900 bg-gray-100 inline-block px-2 py-1 rounded w-fit">
                                    {user?.nia || '-'}
                                </div>
                            </div>
                            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 hover:bg-gray-50/50 transition">
                                <div className="text-sm font-medium text-gray-500">Jabatan / Role</div>
                                <div className="md:col-span-2 text-sm font-bold text-gray-900 capitalize">
                                    {user?.role_name}
                                </div>
                            </div>
                            {/* Joined At (Placeholder jika ada data created_at) */}
                            <div className="px-6 py-4 grid grid-cols-1 md:grid-cols-3 gap-4 hover:bg-gray-50/50 transition">
                                <div className="text-sm font-medium text-gray-500">Terdaftar Sejak</div>
                                <div className="md:col-span-2 text-sm text-gray-700 flex items-center gap-2">
                                    <Calendar size={16} className="text-gray-400"/> 
                                    {new Date().getFullYear()} {/* Bisa diganti user.created_at nanti */}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )}
        {/* === TAB 2: SECURITY === */}
        {activeTab === 'security' && (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-8 pb-6 border-b border-gray-100">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl">
                            <Key size={24}/>
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900">Pengaturan Keamanan</h2>
                            <p className="text-sm text-gray-500">Update password Anda secara berkala.</p>
                        </div>
                    </div>              
                    <form onSubmit={handleChangePassword} className="space-y-6">
                        <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Password Saat Ini</label>
                            <input 
                                type="password" 
                                required 
                                className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
                                placeholder="Masukkan password lama..."
                                value={passData.current} 
                                onChange={e => setPassData({...passData, current: e.target.value})} />
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Password Baru</label>
                                <input 
                                    type="password" 
                                    required 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
                                    placeholder="Minimal 6 karakter"
                                    value={passData.new} 
                                    onChange={e => setPassData({...passData, new: e.target.value})}
                                    />
                            </div>
                            <div>
                                <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2">Konfirmasi</label>
                                <input 
                                    type="password" 
                                    required 
                                    className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl text-sm focus:ring-2 focus:ring-blue-500 focus:bg-white outline-none transition-all" 
                                    placeholder="Ulangi password baru"
                                    value={passData.confirm} 
                                    onChange={e => setPassData({...passData, confirm: e.target.value})} 
                                />
                            </div>
                        </div>
                        <div className="pt-4 flex justify-end">
                            <button 
                                type="submit" 
                                disabled={updatingPass} 
                                className="px-8 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl shadow-lg hover:bg-black transition-all flex items-center gap-2 disabled:opacity-70">
                                {updatingPass ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>} 
                                Simpan Password
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        )}

      </div>
    </div>
  );
};

export default UserProfile;
import React, { useState, useEffect, useRef } from 'react';
import { 
  User, Mail, Camera, Shield, MapPin, Loader2, Key, CheckCircle, 
  CreditCard, Activity, Calendar, FileText
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

const UserProfile = () => {
  const [loading, setLoading] = useState(true);
  const [user, setUser] = useState(null);
  const [stats, setStats] = useState({ attendance: 0 });
  const [uploading, setUploading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');
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

  if (loading) return (
    <div className="flex h-screen items-center justify-center bg-gray-50">
        <Loader2 className="animate-spin text-blue-600" size={40}/>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans text-slate-800"> 
      
      <div className="bg-white shadow-sm border-b border-gray-200">
        
        <div className="h-40 md:h-56 bg-gradient-to-r from-slate-800 to-blue-900 relative overflow-hidden">
            <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-10"></div>
            <div className="absolute bottom-0 left-0 w-full h-20 bg-gradient-to-t from-black/30 to-transparent"></div>
        </div>

        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 relative pb-6">
            
            <div className="flex flex-col md:flex-row items-center md:items-end -mt-16 md:-mt-20 gap-6">            
                
                <div className="relative group shrink-0">
                    <div className="w-32 h-32 md:w-44 md:h-44 rounded-full border-[6px] border-white shadow-2xl overflow-hidden bg-white">
                        <img 
                            src={user?.profile_pic || `https://ui-avatars.com/api/?name=${user?.username}&background=random`} 
                            alt="Profile" 
                            className="w-full h-full object-cover"
                        />
                        
                        <div 
                            onClick={() => fileInputRef.current.click()}
                            className="absolute inset-0 bg-black/40 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-[2px]"
                        >
                            {uploading ? <Loader2 className="animate-spin" size={28}/> : <Camera size={28}/>}
                            <span className="text-xs font-bold mt-1">UBAH</span>
                        </div>
                        <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handlePhotoChange} />
                    </div>
                    
                    <button 
                        onClick={() => fileInputRef.current.click()}
                        className="md:hidden absolute bottom-1 right-1 bg-white text-gray-700 p-2 rounded-full shadow-lg border border-gray-200"
                    >
                        <Camera size={16} />
                    </button>
                </div>

                <div className="flex-1 text-center md:text-left w-full md:mb-4">
                    <h1 className="text-2xl md:text-4xl font-black text-gray-900 capitalize tracking-tight leading-tight">
                        {user?.name || user?.username || "Nama Pengguna"}
                    </h1>
                    <p className="text-gray-500 font-medium text-sm md:text-base mt-1">@{user?.username}</p>            
                    
                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-2 mt-3">
                        <span className="flex items-center gap-1.5 bg-blue-100 text-blue-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-blue-200">
                            <Shield size={12}/> {user?.role_name}
                        </span>
                        {user?.ukm_name && (
                             <span className="flex items-center gap-1.5 bg-orange-100 text-orange-700 px-3 py-1 rounded-full text-xs font-bold uppercase border border-orange-200">
                                <MapPin size={12}/> {user?.ukm_name}
                            </span>
                        )}
                    </div>
                </div>

                <div className="w-full md:w-auto grid grid-cols-2 gap-2 bg-gray-100 p-1.5 rounded-xl">
                    <button 
                        onClick={() => setActiveTab('overview')}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'overview' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <User size={16} />
                        <span className="hidden md:inline">Info </span>Personal
                        <span className="md:hidden">Info</span>
                    </button>
                    <button 
                        onClick={() => setActiveTab('security')}
                        className={`flex items-center justify-center gap-2 px-4 py-2.5 text-sm font-bold rounded-lg transition-all ${activeTab === 'security' ? 'bg-white text-blue-600 shadow-sm ring-1 ring-black/5' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Shield size={16} />
                        Keamanan
                    </button>
                </div>

            </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-6 md:mt-8">     
        
        {activeTab === 'overview' && (
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">      
                
                <div className="space-y-4 md:space-y-6">
                    
                    <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100 flex items-center justify-between relative overflow-hidden group">
                         <div className="absolute right-0 top-0 w-24 h-24 bg-emerald-50 rounded-bl-full -mr-4 -mt-4 transition-transform group-hover:scale-110"></div>
                         <div className="relative z-10">
                             <p className="text-xs md:text-sm font-semibold text-gray-500 mb-1 uppercase tracking-wider">Total Kehadiran</p>
                             <p className="text-3xl md:text-4xl font-black text-gray-900">{stats.attendance}</p>
                         </div>
                         <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-2xl flex items-center justify-center relative z-10 shadow-sm">
                             <Activity size={24}/>
                         </div>
                    </div>

                     <div className="bg-white p-5 md:p-6 rounded-2xl shadow-sm border border-gray-100">
                        <div className="flex items-center gap-4 mb-4">
                            <div className="w-10 h-10 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center">
                                <CheckCircle size={20}/>
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">Status Akun</p>
                                <p className="text-xs text-green-600 font-bold bg-green-50 px-2 py-0.5 rounded-md inline-block mt-0.5">Aktif</p>
                            </div>
                        </div>
                        <div className="w-full bg-gray-100 h-2 rounded-full overflow-hidden">
                            <div className="w-full h-full bg-blue-500 rounded-full"></div>
                        </div>
                        <p className="text-[10px] text-gray-400 mt-2 text-right">Data Sinkron</p>
                    </div>
                </div>

                <div className="lg:col-span-2">
                    <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
                        <div className="px-5 py-4 border-b border-gray-100 bg-gray-50 flex items-center gap-2">
                            <FileText size={18} className="text-blue-600"/>
                            <h3 className="font-bold text-gray-800 text-sm uppercase tracking-wide">Detail Biodata</h3>
                        </div>
                        
                        <div className="divide-y divide-gray-50">
                            
                            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 hover:bg-gray-50/50 transition">
                                <div className="text-xs md:text-sm font-medium text-gray-500 uppercase md:normal-case">Nama Lengkap</div>
                                <div className="md:col-span-2 text-sm md:text-base font-medium text-gray-900">
                                    {user?.name}
                                </div>
                            </div>

                            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 hover:bg-gray-50/50 transition">
                                <div className="text-xs md:text-sm font-medium text-gray-500 uppercase md:normal-case">Alamat Email</div>
                                <div className="md:col-span-2 text-sm md:text-base font-medium text-gray-900 break-all">
                                    {user?.email || "-"}
                                </div>
                            </div>

                            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 hover:bg-gray-50/50 transition">
                                <div className="text-xs md:text-sm font-medium text-gray-500 uppercase md:normal-case">Nomor Induk (NIA)</div>
                                <div className="md:col-span-2">
                                    <span className="text-sm font-mono font-bold text-gray-700 bg-gray-100 px-2 py-1 rounded border border-gray-200">
                                        {user?.nia || '-'}
                                    </span>
                                </div>
                            </div>

                            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 hover:bg-gray-50/50 transition">
                                <div className="text-xs md:text-sm font-medium text-gray-500 uppercase md:normal-case">Hak Akses</div>
                                <div className="md:col-span-2 text-sm font-medium text-gray-900 capitalize">
                                    {user?.role_name?.replace('_', ' ')}
                                </div>
                            </div>

                            <div className="px-5 py-4 grid grid-cols-1 md:grid-cols-3 gap-1 md:gap-4 hover:bg-gray-50/50 transition">
                                <div className="text-xs md:text-sm font-medium text-gray-500 uppercase md:normal-case">Terdaftar Sejak</div>
                                <div className="md:col-span-2 text-sm text-gray-700 flex items-center gap-2">
                                    <Calendar size={14} className="text-gray-400"/> 
                                    {user?.created_at ? new Date(user.created_at).getFullYear() : new Date().getFullYear()}
                                </div>
                            </div>

                        </div>
                    </div>
                </div>
            </div>
        )}

        {activeTab === 'security' && (
            <div className="max-w-2xl mx-auto">
                <div className="bg-white p-6 md:p-8 rounded-2xl border border-gray-100 shadow-sm">
                    <div className="flex items-center gap-4 mb-6 md:mb-8 pb-6 border-b border-gray-100">
                        <div className="p-3 bg-red-50 text-red-600 rounded-xl shadow-sm">
                            <Key size={24}/>
                        </div>
                        <div>
                            <h2 className="text-lg md:text-xl font-bold text-gray-900">Ubah Password</h2>
                            <p className="text-xs md:text-sm text-gray-500">Amankan akun Anda dengan password yang kuat.</p>
                        </div>
                    </div>              
                    <form onSubmit={handleChangePassword} className="space-y-5">
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
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
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
                                className="w-full md:w-auto px-8 py-3 bg-gray-900 text-white font-bold text-sm rounded-xl shadow-lg hover:bg-black transition-all flex items-center justify-center gap-2 disabled:opacity-70">
                                {updatingPass ? <Loader2 className="animate-spin" size={18}/> : <CheckCircle size={18}/>} 
                                Simpan Perubahan
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
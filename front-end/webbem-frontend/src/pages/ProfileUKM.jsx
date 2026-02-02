import React, { useState, useEffect, useRef } from 'react';
import { 
  Users, Calendar, Edit3, Camera, Save, MapPin, Globe, Mail, Loader2, 
  Phone, ChevronRight, Lock, Eye, EyeOff, CheckCircle
} from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

const ProfileUKM = () => {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState({ ukm: null, stats: {}, recent_events: [], members: [] });
  
  const [isEditing, setIsEditing] = useState(false);
  const [editDesc, setEditDesc] = useState('');
  const [updating, setUpdating] = useState(false);

  const [isEditingContact, setIsEditingContact] = useState(false);
  const [contactForm, setContactForm] = useState({ email: '', phone: '' });
  const [updatingContact, setUpdatingContact] = useState(false);

  const [passData, setPassData] = useState({ current: '', new: '', confirm: '' });
  const [showPass, setShowPass] = useState(false);
  const [updatingPass, setUpdatingPass] = useState(false);

  const [uploading, setUploading] = useState(false);
  const fileInputRef = useRef(null);

  const fetchProfile = async () => {
    try {
      const res = await api.get('/ukms/my-profile');
      setData(res.data);
      setEditDesc(res.data.ukm.description || '');
      setContactForm({
        email: res.data.ukm.contact_email || '',
        phone: res.data.ukm.contact_phone || ''
      });
      setLoading(false);
    } catch (err) {
      console.error(err);
      toast.error("Gagal memuat profil UKM.");
      setLoading(false);
    }
  };

  useEffect(() => { fetchProfile(); }, []);


  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.warning("Ukuran maksimal foto 2MB");

    const formData = new FormData();
    formData.append('logo', file);

    setUploading(true);
    try {
      const res = await api.post('/ukms/update-logo', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      setData(prev => ({ ...prev, ukm: { ...prev.ukm, logo_url: res.data.logo_url } }));
      toast.success("Foto profil berhasil diperbarui!");
    } catch (err) {
      toast.error("Gagal mengupload foto.");
    } finally {
      setUploading(false);
    }
  };

  const handleSaveDescription = async () => {
    setUpdating(true);
    try {
      await api.put('/ukms/update-desc', { description: editDesc });
      setData(prev => ({ ...prev, ukm: { ...prev.ukm, description: editDesc } }));
      setIsEditing(false);
      toast.success("Deskripsi berhasil disimpan!");
    } catch (err) {
      toast.error("Gagal menyimpan perubahan.");
    } finally {
      setUpdating(false);
    }
  };

  const handleSaveContact = async () => {
    setUpdatingContact(true);
    try {
      await api.put('/ukms/update-contact', {
        contact_email: contactForm.email,
        contact_phone: contactForm.phone
      });
      setData(prev => ({
        ...prev,
        ukm: { ...prev.ukm, contact_email: contactForm.email, contact_phone: contactForm.phone }
      }));
      setIsEditingContact(false);
      toast.success("Kontak berhasil diperbarui!");
    } catch (err) {
      toast.error("Gagal menyimpan kontak.");
    } finally {
      setUpdatingContact(false);
    }
  };

  const handleChangePassword = async (e) => {
    e.preventDefault();
    if (passData.new !== passData.confirm) return toast.error("Konfirmasi password tidak cocok!");
    if (passData.new.length < 6) return toast.error("Password minimal 6 karakter.");

    setUpdatingPass(true);
    try {
      await api.put('/users/password', {
        currentPassword: passData.current,
        newPassword: passData.new
      });
      toast.success("Password Admin berhasil diubah!");
      setPassData({ current: '', new: '', confirm: '' });
    } catch (err) {
      toast.error(err.response?.data?.msg || "Gagal mengubah password.");
    } finally {
      setUpdatingPass(false);
    }
  };

  const handleImageError = (e) => { e.target.src = "https://via.placeholder.com/150?text=UKM"; };

  if (loading) return <div className="flex justify-center items-center h-screen"><Loader2 className="animate-spin text-blue-600" size={40}/></div>;

  const { ukm, stats, recent_events, members } = data;

  return (
    <div className="min-h-screen bg-gray-50 pb-20 font-sans">
      
      <div className="bg-white border-b border-gray-200">
        <div className="h-48 bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-800 relative overflow-hidden">
            <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/cubes.png')]"></div>
        </div>
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="relative -mt-16 flex flex-col md:flex-row items-center md:items-end gap-6 pb-6">
            <div className="relative group shrink-0">
              <div className="w-32 h-32 md:w-40 md:h-40 rounded-2xl border-4 border-white shadow-xl overflow-hidden bg-white">
                <img src={ukm?.logo_url || "https://via.placeholder.com/150?text=UKM"} alt="Logo UKM" onError={handleImageError} className="w-full h-full object-contain p-2"/>
                <div onClick={() => fileInputRef.current.click()} className="absolute inset-0 bg-black/60 flex flex-col items-center justify-center text-white opacity-0 group-hover:opacity-100 transition-all cursor-pointer backdrop-blur-sm">
                  {uploading ? <Loader2 className="animate-spin"/> : <Camera size={24}/>}
                  <span className="text-xs font-bold mt-1">Ganti Logo</span>
                </div>
                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
              </div>
            </div>
            <div className="flex-1 text-center md:text-left">
              <h1 className="text-3xl md:text-4xl font-black text-gray-900 tracking-tight mb-1">{ukm?.ukm_name}</h1>
              <p className="text-gray-500 font-medium flex items-center justify-center md:justify-start gap-2"><MapPin size={16} className="text-blue-500"/> STIKOM Poltek Cirebon</p>
            </div>
            <div className="flex gap-3">
               <div className="bg-blue-50 px-4 py-2 rounded-xl border border-blue-100 text-center">
                  <span className="block text-xl font-black text-blue-700">{stats.members || 0}</span>
                  <span className="text-xs font-bold text-blue-400 uppercase">Anggota</span>
               </div>
               <div className="bg-purple-50 px-4 py-2 rounded-xl border border-purple-100 text-center">
                  <span className="block text-xl font-black text-purple-700">{stats.events || 0}</span>
                  <span className="text-xs font-bold text-purple-400 uppercase">Kegiatan</span>
               </div>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mt-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          
          <div className="lg:col-span-2 space-y-8">
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2"><Globe size={20} className="text-blue-600"/> Tentang Kami</h2>
                {!isEditing && <button onClick={() => setIsEditing(true)} className="text-xs font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-lg hover:bg-blue-100 flex items-center gap-1"><Edit3 size={14}/> Edit</button>}
              </div>
              {isEditing ? (
                <div className="animate-in fade-in">
                  <textarea rows={6} className="w-full bg-gray-50 p-4 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-gray-700 leading-relaxed text-sm" value={editDesc} onChange={(e) => setEditDesc(e.target.value)} />
                  <div className="flex justify-end gap-2 mt-3">
                    <button onClick={() => { setIsEditing(false); setEditDesc(ukm.description); }} className="px-4 py-2 text-gray-500 font-bold hover:bg-gray-100 rounded-lg text-xs">Batal</button>
                    <button onClick={handleSaveDescription} disabled={updating} className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-lg text-xs flex items-center gap-2">{updating ? <Loader2 className="animate-spin" size={14}/> : <Save size={14}/>} Simpan</button>
                  </div>
                </div>
              ) : (
                <div className="prose max-w-none text-gray-600 text-sm leading-relaxed whitespace-pre-line">{ukm?.description || "Belum ada deskripsi."}</div>
              )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
               <h2 className="text-lg font-bold text-gray-800 flex items-center gap-2 mb-6"><Calendar size={20} className="text-purple-600"/> Kegiatan Terbaru</h2>
               {recent_events && recent_events.length > 0 ? (
                 <div className="space-y-6 pl-2">
                    {recent_events.map((evt) => (
                      <div key={evt.id} className="relative pl-8 border-l-2 border-gray-100 last:border-0">
                         <div className="absolute -left-[9px] top-0 w-4 h-4 rounded-full bg-purple-100 border-2 border-purple-500"></div>
                         <div>
                            <span className="text-xs font-bold text-purple-600 bg-purple-50 px-2 py-1 rounded-md mb-2 inline-block">
                               {new Date(evt.start_time).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                            </span>
                            <h3 className="text-base font-bold text-gray-900">{evt.title}</h3>
                            <p className="text-sm text-gray-500 mt-1 line-clamp-2">{evt.description || 'Tidak ada deskripsi.'}</p>
                         </div>
                      </div>
                    ))}
                 </div>
               ) : <div className="text-center py-8 bg-gray-50 rounded-xl border border-dashed border-gray-200"><p className="text-gray-400 text-sm">Belum ada kegiatan.</p></div>}
            </div>
          </div>

          <div className="space-y-8">
            
            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Informasi Kontak</h3>
                  {!isEditingContact && <button onClick={() => setIsEditingContact(true)} className="text-[10px] font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md flex items-center gap-1"><Edit3 size={12}/> Edit Kontak</button>}
               </div>
               {isEditingContact ? (
                 <div className="space-y-3 animate-in zoom-in-95">
                    <input type="email" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={contactForm.email} onChange={(e) => setContactForm({...contactForm, email: e.target.value})} placeholder="Email"/>
                    <input type="text" className="w-full p-2 bg-gray-50 border border-gray-200 rounded-lg text-sm" value={contactForm.phone} onChange={(e) => setContactForm({...contactForm, phone: e.target.value})} placeholder="No Telp"/>
                    <div className="flex gap-2 pt-2">
                        <button onClick={() => setIsEditingContact(false)} className="flex-1 py-2 text-xs font-bold text-gray-500 bg-gray-100 rounded-lg">Batal</button>
                        <button onClick={handleSaveContact} disabled={updatingContact} className="flex-1 py-2 text-xs font-bold text-white bg-blue-600 rounded-lg flex justify-center items-center gap-1">{updatingContact ? <Loader2 size={12} className="animate-spin"/> : <Save size={12}/>} Simpan</button>
                    </div>
                 </div>
               ) : (
                 <div className="space-y-4">
                    <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600 shrink-0"><Mail size={16}/></div><div className="overflow-hidden"><p className="text-xs text-gray-400 font-bold">Email</p><p className="text-sm font-medium text-gray-800 truncate">{ukm?.contact_email || "-"}</p></div></div>
                    <div className="flex items-center gap-3"><div className="w-8 h-8 rounded-full bg-green-50 flex items-center justify-center text-green-600 shrink-0"><Phone size={16}/></div><div><p className="text-xs text-gray-400 font-bold">WhatsApp</p><p className="text-sm font-medium text-gray-800">{ukm?.contact_phone || "-"}</p></div></div>
                 </div>
               )}
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200">
               <div className="flex justify-between items-center mb-4">
                  <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider">Anggota</h3>
                  <span className="text-xs font-bold text-blue-600 bg-blue-50 px-2 py-1 rounded-md">{stats.members || 0} Orang</span>
               </div>
               <div className="space-y-3">
                  {members && members.length > 0 ? members.map(m => (
                      <div key={m.id} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded-lg transition-colors cursor-default">
                         <div className="w-8 h-8 rounded-full bg-gradient-to-tr from-gray-200 to-gray-300 flex items-center justify-center text-xs font-bold text-gray-600">{m.username.charAt(0).toUpperCase()}</div>
                         <div className="overflow-hidden"><p className="text-sm font-bold text-gray-800 truncate">{m.username}</p><p className="text-[10px] text-gray-400 truncate">Anggota Aktif</p></div>
                      </div>
                  )) : <p className="text-xs text-gray-400 italic">Belum ada anggota.</p>}
               </div>
            </div>

            <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-200 border-t-4 border-t-orange-500">
                <div className="flex justify-between items-center mb-4">
                   <h3 className="text-sm font-bold text-gray-800 flex items-center gap-2"><Lock size={16} className="text-orange-500"/> Ganti Password</h3>
                   <button 
                      onClick={() => setShowPass(!showPass)} 
                      className="text-gray-400 hover:text-gray-600 transition-colors"
                      title={showPass ? "Sembunyikan Password" : "Lihat Password"}
                   >
                      {showPass ? <EyeOff size={16}/> : <Eye size={16}/>}
                   </button>
                </div>
                
                <form onSubmit={handleChangePassword} className="space-y-3">
                   <div>
                      <input 
                        type={showPass ? "text" : "password"} 
                        placeholder="Password Lama"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={passData.current}
                        onChange={e => setPassData({...passData, current: e.target.value})}
                        required
                      />
                   </div>
                   <div className="grid grid-cols-2 gap-2">
                      <input 
                        type={showPass ? "text" : "password"} 
                        placeholder="Password Baru"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={passData.new}
                        onChange={e => setPassData({...passData, new: e.target.value})}
                        required
                      />
                      <input 
                        type={showPass ? "text" : "password"} 
                        placeholder="Ulangi Baru"
                        className="w-full p-2.5 bg-gray-50 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-orange-500 outline-none"
                        value={passData.confirm}
                        onChange={e => setPassData({...passData, confirm: e.target.value})}
                        required
                      />
                   </div>
                   <button 
                      type="submit" 
                      disabled={updatingPass}
                      className="w-full py-2.5 bg-gray-900 hover:bg-black text-white font-bold rounded-lg text-xs flex justify-center items-center gap-2 transition-all shadow-lg shadow-gray-200"
                   >
                      {updatingPass ? <Loader2 size={14} className="animate-spin"/> : <CheckCircle size={14}/>} Update Password
                   </button>
                </form>
            </div>

          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileUKM;
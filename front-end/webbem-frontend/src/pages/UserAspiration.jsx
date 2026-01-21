import React, { useState } from 'react';
import { 
  Send, Image, MessageCircle, Info, Building, ShieldCheck, 
  Loader2, X, ChevronRight 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';

const UserAspiration = () => {
  const [formData, setFormData] = useState({ subject: '', message: '', target: 'ukm' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    processFile(selected);
  };

  const processFile = (selected) => {
    if (selected) {
      if (selected.size > 5 * 1024 * 1024) { // Validasi 5MB
        toast.warning("Ukuran file maksimal 5MB");
        return;
      }
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
  };

  const removeFile = () => {
    setFile(null);
    setPreview(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.subject || !formData.message) {
      return toast.warning("Judul dan pesan wajib diisi!");
    }

    setLoading(true);
    const data = new FormData();
    data.append('subject', formData.subject);
    data.append('message', formData.message);
    data.append('target', formData.target); 
    if (file) {
      data.append('image', file);
    }

    try {
      await api.post('/aspirations', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Aspirasi berhasil dikirim!", {
        description: "Identitas Anda tetap terjaga (Anonim)."
      });
      setFormData({ subject: '', message: '', target: 'ukm' });
      removeFile();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal mengirim aspirasi.");
    } finally {
      setLoading(false);
    }
  };

  // Drag & Drop Handlers
  const onDragOver = (e) => { e.preventDefault(); setIsDragging(true); };
  const onDragLeave = (e) => { e.preventDefault(); setIsDragging(false); };
  const onDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    processFile(e.dataTransfer.files[0]);
  };

  return (
    <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 font-sans">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section with Gradient Text */}
        <div className="text-center mb-10">
           <h1 className="text-4xl font-black text-slate-900 tracking-tight mb-2">
             Kotak <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Aspirasi</span>
           </h1>
           <p className="text-lg text-slate-500 max-w-2xl mx-auto">
             Suarakan ide brilianmu untuk perubahan yang lebih baik. <br/>
             Kami menjamin privasi Anda sepenuhnya.
           </p>
        </div>

        <div className="bg-white rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-8 py-4 border-b border-purple-100 flex items-start gap-4">
            <div className="p-2 bg-white rounded-full shadow-sm text-purple-600 mt-1">
              <Info size={20} />
            </div>
            <div>
              <h3 className="font-bold text-purple-900 text-sm uppercase tracking-wide">Mode Anonim Aktif</h3>
              <p className="text-sm text-purple-700/80 leading-relaxed">
                Sistem secara otomatis menyembunyikan identitas (Nama & NIM) Anda dari penerima pesan. Berbicaralah dengan bebas namun tetap bertanggung jawab.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-8 space-y-8">
            
            {/* Target Selection Cards */}
            <div className="space-y-3">
               <label className="block text-sm font-bold text-slate-700 uppercase tracking-wider">Tujuan Pengiriman</label>
               <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  
                  {/* Option: UKM */}
                  <div 
                    onClick={() => setFormData({...formData, target: 'ukm'})}
                    className={`cursor-pointer group relative flex items-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                      formData.target === 'ukm' 
                        ? 'border-purple-600 bg-purple-50/50 shadow-md ring-1 ring-purple-600' 
                        : 'border-slate-100 hover:border-purple-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-3 rounded-xl mr-4 transition-colors ${formData.target === 'ukm' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-purple-500'}`}>
                      <Building size={24} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${formData.target === 'ukm' ? 'text-purple-900' : 'text-slate-700'}`}>UKM Saya</h4>
                      <p className="text-xs text-slate-500">Kirim ke pengurus internal UKM</p>
                    </div>
                    {formData.target === 'ukm' && <div className="absolute top-4 right-4 text-purple-600"><div className="w-3 h-3 bg-purple-600 rounded-full animate-pulse"></div></div>}
                  </div>

                  {/* Option: BEM */}
                  <div 
                    onClick={() => setFormData({...formData, target: 'bem'})}
                    className={`cursor-pointer group relative flex items-center p-4 rounded-2xl border-2 transition-all duration-300 ${
                      formData.target === 'bem' 
                        ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-1 ring-indigo-600' 
                        : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                    }`}
                  >
                    <div className={`p-3 rounded-xl mr-4 transition-colors ${formData.target === 'bem' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-500'}`}>
                      <ShieldCheck size={24} />
                    </div>
                    <div>
                      <h4 className={`font-bold ${formData.target === 'bem' ? 'text-indigo-900' : 'text-slate-700'}`}>BEM (Pusat)</h4>
                      <p className="text-xs text-slate-500">Kirim ke Super Admin / BEM</p>
                    </div>
                    {formData.target === 'bem' && <div className="absolute top-4 right-4 text-indigo-600"><div className="w-3 h-3 bg-indigo-600 rounded-full animate-pulse"></div></div>}
                  </div>

               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* Left Column: Inputs */}
              <div className="lg:col-span-2 space-y-6">
                
                {/* Subject Input */}
                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 group-focus-within:text-purple-600 transition-colors">Topik Aspirasi</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Usulan Perbaikan Fasilitas Sekretariat"
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300 font-medium"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  />
                </div>

                {/* Message Input */}
                <div className="group">
                  <label className="block text-sm font-bold text-slate-700 mb-2 ml-1 group-focus-within:text-purple-600 transition-colors">Detail Pesan</label>
                  <textarea 
                    rows="6"
                    placeholder="Jelaskan aspirasi, ide, atau keluhan Anda secara rinci..."
                    className="w-full px-5 py-4 rounded-xl bg-slate-50 border-2 border-slate-100 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300 font-medium resize-none leading-relaxed"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
              </div>

              {/* Right Column: File Upload */}
              <div className="lg:col-span-1">
                <label className="block text-sm font-bold text-slate-700 mb-2">Bukti / Foto (Opsional)</label>
                
                {!preview ? (
                  <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`relative w-full h-64 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center text-center p-6 transition-all duration-300 ${
                      isDragging 
                        ? 'border-purple-500 bg-purple-50 scale-105' 
                        : 'border-slate-300 hover:border-purple-400 hover:bg-slate-50'
                    }`}
                  >
                    <input 
                      type="file" 
                      accept="image/*"
                      onChange={handleFileChange}
                      className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                    />
                    <div className="bg-white p-4 rounded-full shadow-sm mb-4">
                      <Image className={`w-8 h-8 ${isDragging ? 'text-purple-600' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Klik atau Drag foto</p>
                    <p className="text-xs text-slate-400 mt-2">Max. 5MB (JPG, PNG)</p>
                  </div>
                ) : (
                  <div className="relative w-full h-64 rounded-2xl overflow-hidden shadow-md group border border-slate-200">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button 
                        type="button"
                        onClick={removeFile}
                        className="bg-red-500 text-white p-2 rounded-full hover:bg-red-600 hover:scale-110 transition-all shadow-lg"
                       >
                         <X size={20} />
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-100" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
               <p className="text-xs text-slate-400 italic flex items-center gap-2">
                 <ShieldCheck size={14} />
                 Data dienkripsi dan dikirim secara aman.
               </p>
               <button 
                  disabled={loading}
                  className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 hover:-translate-y-1 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3"
                >
                  {loading ? (
                    <>
                      <Loader2 size={20} className="animate-spin" />
                      Sedang Mengirim...
                    </>
                  ) : (
                    <>
                      <Send size={20} />
                      Kirim Aspirasi Sekarang
                      <ChevronRight size={18} className="opacity-70" />
                    </>
                  )}
                </button>
            </div>

          </form>
        </div>
      </div>
    </div>
  );
};

export default UserAspiration;
import React, { useState } from 'react';
import { 
  Send, Image, Info, Building, ShieldCheck, 
  Loader2, X, ChevronRight, Sparkles 
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
    <div className="min-h-screen bg-slate-50 py-6 md:py-12 px-3 md:px-6 font-sans pb-24">
      <div className="max-w-4xl mx-auto">
        
        {/* Header Section */}
        <div className="text-center mb-6 md:mb-10">
           <div className="inline-flex items-center gap-2 bg-white px-4 py-1.5 rounded-full shadow-sm mb-3 border border-purple-100">
              <Sparkles size={16} className="text-purple-600" />
              <span className="text-xs font-bold text-purple-700 uppercase tracking-wider">Suara Mahasiswa</span>
           </div>
           <h1 className="text-2xl md:text-4xl font-black text-slate-900 tracking-tight mb-2">
             Kotak <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-600 to-indigo-600">Aspirasi</span>
           </h1>
           <p className="text-sm md:text-lg text-slate-500 max-w-2xl mx-auto leading-relaxed">
             Punya ide brilian? Kirimkan masukanmu untuk kemajuan organisasi.
           </p>
        </div>

        <div className="bg-white rounded-2xl md:rounded-3xl shadow-xl overflow-hidden border border-slate-100">
          
          {/* Info Banner */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 px-5 md:px-8 py-4 border-b border-purple-100 flex items-start gap-3 md:gap-4">
            <div className="p-2 bg-white rounded-full shadow-sm text-purple-600 mt-0.5 shrink-0">
              <Info size={18} />
            </div>
            <div>
              <h3 className="font-bold text-purple-900 text-xs md:text-sm uppercase tracking-wide">Privasi Terjamin (Anonim)</h3>
              <p className="text-xs md:text-sm text-purple-700/80 leading-snug mt-1">
                Sistem menyembunyikan identitas Anda dari penerima pesan. Sampaikan dengan jujur dan bertanggung jawab.
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-4 md:p-8 space-y-6 md:space-y-8">
            
            {/* Target Selection Cards */}
            <div className="space-y-3">
               <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider ml-1">Tujuan Pengiriman</label>
               {/* Grid 2 kolom di HP biar hemat tempat */}
               <div className="grid grid-cols-2 gap-3 md:gap-4">
                 
                 {/* Option: UKM */}
                 <div 
                   onClick={() => setFormData({...formData, target: 'ukm'})}
                   className={`cursor-pointer group relative flex flex-col md:flex-row items-center md:items-start text-center md:text-left p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all duration-300 ${
                     formData.target === 'ukm' 
                       ? 'border-purple-600 bg-purple-50/50 shadow-md ring-1 ring-purple-600' 
                       : 'border-slate-100 hover:border-purple-200 hover:bg-slate-50'
                   }`}
                 >
                   <div className={`p-2 md:p-3 rounded-xl mb-2 md:mb-0 md:mr-4 transition-colors ${formData.target === 'ukm' ? 'bg-purple-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-purple-500'}`}>
                     <Building size={20} className="md:w-6 md:h-6" />
                   </div>
                   <div>
                     <h4 className={`font-bold text-sm md:text-base ${formData.target === 'ukm' ? 'text-purple-900' : 'text-slate-700'}`}>UKM Saya</h4>
                     <p className="text-[10px] md:text-xs text-slate-500">Pengurus Internal</p>
                   </div>
                   {formData.target === 'ukm' && <div className="absolute top-2 right-2 md:top-4 md:right-4 text-purple-600"><div className="w-2 h-2 bg-purple-600 rounded-full animate-pulse"></div></div>}
                 </div>

                 {/* Option: BEM */}
                 <div 
                   onClick={() => setFormData({...formData, target: 'bem'})}
                   className={`cursor-pointer group relative flex flex-col md:flex-row items-center md:items-start text-center md:text-left p-3 md:p-4 rounded-xl md:rounded-2xl border-2 transition-all duration-300 ${
                     formData.target === 'bem' 
                       ? 'border-indigo-600 bg-indigo-50/50 shadow-md ring-1 ring-indigo-600' 
                       : 'border-slate-100 hover:border-indigo-200 hover:bg-slate-50'
                   }`}
                 >
                   <div className={`p-2 md:p-3 rounded-xl mb-2 md:mb-0 md:mr-4 transition-colors ${formData.target === 'bem' ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-400 group-hover:text-indigo-500'}`}>
                     <ShieldCheck size={20} className="md:w-6 md:h-6" />
                   </div>
                   <div>
                     <h4 className={`font-bold text-sm md:text-base ${formData.target === 'bem' ? 'text-indigo-900' : 'text-slate-700'}`}>BEM Pusat</h4>
                     <p className="text-[10px] md:text-xs text-slate-500">Super Admin</p>
                   </div>
                   {formData.target === 'bem' && <div className="absolute top-2 right-2 md:top-4 md:right-4 text-indigo-600"><div className="w-2 h-2 bg-indigo-600 rounded-full animate-pulse"></div></div>}
                 </div>

               </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 md:gap-8">
              {/* Left Column: Inputs */}
              <div className="lg:col-span-2 space-y-5">
                
                {/* Subject Input */}
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Topik Aspirasi</label>
                  <input 
                    type="text" 
                    placeholder="Contoh: Usulan Perbaikan Fasilitas"
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300 font-bold text-sm md:text-base"
                    value={formData.subject}
                    onChange={e => setFormData({...formData, subject: e.target.value})}
                  />
                </div>

                {/* Message Input */}
                <div className="group">
                  <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Detail Pesan</label>
                  <textarea 
                    rows="6"
                    placeholder="Jelaskan aspirasi, ide, atau keluhan Anda secara rinci disini..."
                    className="w-full px-4 py-3.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-800 placeholder-slate-400 focus:bg-white focus:border-purple-500 focus:ring-4 focus:ring-purple-500/10 outline-none transition-all duration-300 font-medium text-sm md:text-base resize-none leading-relaxed"
                    value={formData.message}
                    onChange={e => setFormData({...formData, message: e.target.value})}
                  ></textarea>
                </div>
              </div>

              {/* Right Column: File Upload */}
              <div className="lg:col-span-1">
                <label className="block text-xs font-bold text-slate-500 uppercase tracking-wider mb-2 ml-1">Bukti Foto (Opsional)</label>
                
                {!preview ? (
                  <div 
                    onDragOver={onDragOver}
                    onDragLeave={onDragLeave}
                    onDrop={onDrop}
                    className={`relative w-full h-48 md:h-64 border-2 border-dashed rounded-xl flex flex-col items-center justify-center text-center p-6 transition-all duration-300 ${
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
                    <div className="bg-white p-3 rounded-xl shadow-sm mb-3 border border-slate-100">
                      <Image className={`w-6 h-6 md:w-8 md:h-8 ${isDragging ? 'text-purple-600' : 'text-slate-400'}`} />
                    </div>
                    <p className="text-sm font-bold text-slate-700">Upload Foto</p>
                    <p className="text-[10px] md:text-xs text-slate-400 mt-1">Max. 5MB</p>
                  </div>
                ) : (
                  <div className="relative w-full h-48 md:h-64 rounded-xl overflow-hidden shadow-md group border border-slate-200">
                    <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                       <button 
                        type="button"
                        onClick={removeFile}
                        className="bg-white text-red-500 p-3 rounded-full hover:scale-110 transition-all shadow-lg"
                       >
                         <X size={20} />
                       </button>
                    </div>
                  </div>
                )}
              </div>
            </div>

            <hr className="border-slate-100 my-6" />

            {/* Action Buttons */}
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
               <p className="text-[10px] md:text-xs text-slate-400 italic flex items-center gap-2 bg-slate-50 px-3 py-2 rounded-lg border border-slate-100 w-full sm:w-auto">
                 <ShieldCheck size={14} />
                 Data dienkripsi aman 256-bit SSL.
               </p>
               <button 
                 disabled={loading}
                 className="w-full sm:w-auto px-8 py-4 bg-gradient-to-r from-purple-600 to-indigo-600 text-white font-bold rounded-xl shadow-lg shadow-purple-200 hover:shadow-purple-300 active:scale-95 disabled:opacity-70 disabled:cursor-not-allowed transition-all duration-300 flex items-center justify-center gap-3 text-sm md:text-base"
               >
                 {loading ? (
                   <>
                     <Loader2 size={20} className="animate-spin" />
                     Mengirim...
                   </>
                 ) : (
                   <>
                     <Send size={20} />
                     Kirim Aspirasi
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
import React, { useState } from 'react';
import { Send, Image, AlertCircle, CheckCircle, MessageSquareWarning, X } from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios';

const UserComplaint = () => {
  const [formData, setFormData] = useState({ subject: '', message: '' });
  const [file, setFile] = useState(null);
  const [preview, setPreview] = useState(null);
  const [loading, setLoading] = useState(false);

  const handleFileChange = (e) => {
    const selected = e.target.files[0];
    if (selected) {
      if (selected.size > 2 * 1024 * 1024) { // Validasi 2MB
        return toast.error("Ukuran file maksimal 2MB!");
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
    if (file) {
      data.append('screenshot', file);
    }

    try {
      await api.post('/complaints', data, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      toast.success("Laporan berhasil dikirim ke BEM!");
      setFormData({ subject: '', message: '' });
      removeFile();
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal mengirim laporan.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 p-3 md:p-8 pb-24 md:pb-8 flex justify-center items-start md:items-center">
      
      {/* Container Utama */}
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-sm border border-gray-100 overflow-hidden">
        
        {/* Header Section */}
        <div className="bg-blue-50 p-6 md:p-8 text-center border-b border-blue-100">
          <div className="bg-blue-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4 shadow-inner">
            <MessageSquareWarning size={32} className="text-blue-600" />
          </div>
          <h1 className="text-xl md:text-2xl font-black text-gray-900 tracking-tight">Layanan Pengaduan BEM</h1>
          <p className="text-gray-500 text-sm md:text-base mt-2 max-w-md mx-auto leading-relaxed">
            Temukan bug atau punya saran? <br className="hidden md:block"/>
            Bantu kami meningkatkan sistem SIAKSI dengan masukan Anda.
          </p>
        </div>

        {/* Form Section */}
        <form onSubmit={handleSubmit} className="p-5 md:p-8 space-y-5 md:space-y-6">
          
          {/* Subject */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Perihal / Judul</label>
            <input 
              type="text" 
              placeholder="Contoh: Error saat upload proposal"
              className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all text-gray-900 font-medium placeholder-gray-400"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Deskripsi & Detail</label>
            <textarea 
              rows="5"
              placeholder="Jelaskan masalah yang Anda alami secara rinci..."
              className="w-full px-4 py-3.5 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none text-gray-900 font-medium placeholder-gray-400"
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
            ></textarea>
          </div>

          {/* Screenshot Upload (Area Diperbesar) */}
          <div>
            <label className="block text-xs font-bold text-gray-500 uppercase tracking-wide mb-2 ml-1">Bukti Screenshot (Opsional)</label>
            
            {!preview ? (
              <div className="border-2 border-dashed border-gray-300 rounded-2xl p-8 text-center hover:bg-gray-50 hover:border-blue-400 transition-all cursor-pointer relative group bg-gray-50/50">
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
                <div className="flex flex-col items-center text-gray-400 group-hover:text-blue-500 transition-colors">
                  <div className="bg-white p-3 rounded-xl shadow-sm mb-3 border border-gray-100 group-hover:scale-110 transition-transform">
                    <Image size={24} />
                  </div>
                  <span className="text-sm font-bold text-gray-600">Ketuk untuk upload gambar</span>
                  <span className="text-xs mt-1 text-gray-400">Maksimal 2MB (JPG/PNG)</span>
                </div>
              </div>
            ) : (
              <div className="relative rounded-2xl overflow-hidden border border-gray-200 group">
                <img src={preview} alt="Preview" className="w-full h-48 md:h-64 object-cover" />
                <div className="absolute inset-0 bg-black/40 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                  <p className="text-white font-bold text-sm">Ganti Gambar</p>
                </div>
                <button 
                  type="button" 
                  onClick={removeFile}
                  className="absolute top-2 right-2 bg-white/90 p-2 rounded-full text-red-500 hover:bg-red-50 shadow-md transition-transform active:scale-95 z-20"
                >
                  <X size={18} />
                </button>
                {/* Input file overlay untuk ganti gambar */}
                <input 
                  type="file" 
                  accept="image/*"
                  onChange={handleFileChange}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                />
              </div>
            )}
          </div>

          {/* Info Box */}
          <div className="bg-yellow-50 p-4 rounded-xl border border-yellow-100 flex gap-3 items-start">
            <AlertCircle size={20} className="text-yellow-600 shrink-0 mt-0.5" />
            <p className="text-xs text-yellow-700 leading-relaxed">
              Laporan Anda akan masuk ke database BEM dan ditinjau oleh administrator sistem. Mohon gunakan bahasa yang sopan.
            </p>
          </div>

          {/* Submit Button */}
          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-95 transition-all flex items-center justify-center gap-2 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed"
          >
            {loading ? 'Mengirim...' : <><Send size={20} /> Kirim Laporan</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserComplaint;
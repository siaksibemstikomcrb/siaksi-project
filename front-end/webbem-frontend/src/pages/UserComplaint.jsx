import React, { useState } from 'react';
import { Send, Image, AlertCircle, CheckCircle } from 'lucide-react';
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
      setFile(selected);
      setPreview(URL.createObjectURL(selected));
    }
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
      setFile(null);
      setPreview(null);
    } catch (error) {
      toast.error("Gagal mengirim laporan. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 p-8">
        <div className="text-center mb-8">
          <h1 className="text-2xl font-black text-gray-800">Layanan Pengaduan BEM</h1>
          <p className="text-gray-500 mt-2">
            Temukan bug? Atau punya saran untuk kemajuan sistem? <br/>
            Kirimkan masukan Anda langsung kepada kami.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Subject */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Perihal / Judul</label>
            <input 
              type="text" 
              placeholder="Contoh: Error saat upload proposal"
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all"
              value={formData.subject}
              onChange={e => setFormData({...formData, subject: e.target.value})}
            />
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Deskripsi Masalah / Saran</label>
            <textarea 
              rows="5"
              placeholder="Jelaskan detail masalahnya..."
              className="w-full px-4 py-3 rounded-xl bg-gray-50 border border-gray-200 focus:bg-white focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none"
              value={formData.message}
              onChange={e => setFormData({...formData, message: e.target.value})}
            ></textarea>
          </div>

          {/* Screenshot Upload */}
          <div>
            <label className="block text-sm font-bold text-gray-700 mb-2">Lampiran Screenshot (Opsional)</label>
            <div className="border-2 border-dashed border-gray-300 rounded-xl p-6 text-center hover:bg-gray-50 transition-colors cursor-pointer relative">
              <input 
                type="file" 
                accept="image/*"
                onChange={handleFileChange}
                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
              />
              {preview ? (
                <div className="relative h-48 w-full">
                    <img src={preview} alt="Preview" className="h-full w-full object-contain rounded-lg" />
                    <p className="text-xs text-gray-500 mt-2">Klik untuk ganti gambar</p>
                </div>
              ) : (
                <div className="flex flex-col items-center text-gray-400">
                  <Image size={40} className="mb-2" />
                  <span className="text-sm font-medium">Klik untuk upload foto/screenshot</span>
                  <span className="text-xs mt-1">Maksimal 2MB (JPG/PNG)</span>
                </div>
              )}
            </div>
          </div>

          <button 
            disabled={loading}
            className="w-full bg-blue-600 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 hover:bg-blue-700 transition-all flex items-center justify-center gap-2"
          >
            {loading ? 'Mengirim...' : <><Send size={20} /> Kirim Laporan</>}
          </button>
        </form>
      </div>
    </div>
  );
};

export default UserComplaint;
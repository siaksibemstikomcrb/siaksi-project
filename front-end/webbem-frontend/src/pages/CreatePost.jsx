import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, ArrowLeft, Image as ImageIcon, Loader2 } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

const CreatePost = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
        if (file.size > 2 * 1024 * 1024) {
            return toast.error("Ukuran gambar maksimal 2MB!");
        }
        setImage(file);
        setPreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content || !image) {
        return toast.warning("Mohon lengkapi judul, konten, dan gambar!");
    }

    setLoading(true);
    
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('content', content);
    formData.append('external_link', externalLink);
    formData.append('image', image); 

    try {
      await api.post('/posts', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Berita berhasil dibuat!");
      navigate('/admin/posts'); 
    } catch (err) {
      console.error(err);
      toast.error("Gagal membuat berita. Coba lagi.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center pb-20">
      <div className="w-full max-w-4xl">
        
        <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
            <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors bg-white md:bg-transparent shadow-sm md:shadow-none border border-gray-200 md:border-none"><ArrowLeft size={20}/></button>
            <h1 className="text-xl md:text-2xl font-black text-gray-800">Tulis Berita Baru</h1>
        </div>

        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-8 space-y-5 md:space-y-6">
            
            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Judul Artikel <span className="text-red-500">*</span></label>
                <input 
                    type="text" 
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Kegiatan Bakti Sosial BEM 2025"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none font-bold text-base md:text-lg"
                    required
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Sub-Judul (Ringkasan Singkat)</label>
                <input 
                    type="text" 
                    value={subtitle}
                    onChange={(e) => setSubtitle(e.target.value)}
                    placeholder="Opsional: Muncul di bawah judul (Max 150 karakter)"
                    maxLength={150}
                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                />
            </div>

            <div>
                <label className="block text-sm font-bold text-gray-700 mb-2">Gambar Sampul <span className="text-red-500">*</span></label>
                <div className="border-2 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative overflow-hidden group min-h-[180px] md:min-h-[200px]">
                    <input 
                        type="file" 
                        accept="image/*"
                        onChange={handleImageChange}
                        className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                    />
                    
                    {preview ? (
                        <div className="relative w-full h-48 md:h-64 rounded-lg overflow-hidden">
                            <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                            <div className="absolute inset-0 bg-black/50 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold pointer-events-none">
                                Ganti Gambar
                            </div>
                        </div>
                    ) : (
                        <div className="space-y-2 py-8 pointer-events-none">
                            <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                                <ImageIcon size={24}/>
                            </div>
                            <p className="text-sm font-medium text-gray-600">Klik untuk upload atau drag & drop</p>
                            <p className="text-xs text-gray-400">PNG, JPG, WEBP (Max 2MB)</p>
                        </div>
                    )}
                </div>
            </div>

            <div className="h-auto pb-6 md:pb-12">
                <label className="block text-sm font-bold text-gray-700 mb-2">Isi Berita <span className="text-red-500">*</span></label>
                <ReactQuill 
                    theme="snow" 
                    value={content} 
                    onChange={setContent} 
                    className="h-64 md:h-72 mb-12 md:mb-0"
                    modules={{
                        toolbar: [
                            [{ 'header': [1, 2, false] }],
                            ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                            [{'list': 'ordered'}, {'list': 'bullet'}],
                            ['link', 'clean']
                        ],
                    }}
                />
            </div>

            <div className="pt-8 md:pt-0">
                <label className="block text-sm font-bold text-gray-700 mb-2">Link Eksternal (Opsional)</label>
                <input 
                    type="url" 
                    value={externalLink}
                    onChange={(e) => setExternalLink(e.target.value)}
                    placeholder="Contoh: https://bit.ly/pendaftaran-acara"
                    className="w-full p-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none text-blue-600 text-sm"
                />
                <p className="text-xs text-gray-400 mt-1">Gunakan untuk link pendaftaran Google Form atau info tambahan.</p>
            </div>

            <div className="pt-6 border-t border-gray-100 flex flex-col md:flex-row justify-end gap-3">
                <button 
                    type="button"
                    onClick={() => navigate(-1)}
                    disabled={loading}
                    className="order-2 md:order-1 px-6 py-3 rounded-xl font-bold text-gray-500 hover:bg-gray-100 transition-all border border-gray-200 md:border-none"
                >
                    Batal
                </button>
                <button 
                    type="submit" 
                    disabled={loading}
                    className="order-1 md:order-2 w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg shadow-blue-200 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                    {loading ? <Loader2 size={20} className="animate-spin"/> : <Save size={20}/>}
                    {loading ? 'Mengunggah...' : 'Terbitkan Berita'}
                </button>
            </div>

        </form>
      </div>
    </div>
  );
};

export default CreatePost;
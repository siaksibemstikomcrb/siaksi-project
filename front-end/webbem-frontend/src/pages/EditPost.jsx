import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, ArrowLeft, Image as ImageIcon, Loader2, Info, Link as LinkIcon } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

const EditPost = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);
  
  // State Form
  const [title, setTitle] = useState('');
  const [subtitle, setSubtitle] = useState('');
  const [content, setContent] = useState('');
  const [externalLink, setExternalLink] = useState('');
  const [image, setImage] = useState(null);
  const [preview, setPreview] = useState(null);

  // FETCH DATA LAMA
  useEffect(() => {
    const fetchPost = async () => {
        setFetching(true);
        try {
            const res = await api.get(`/posts/${id}`);
            const data = res.data;
            setTitle(data.title);
            setSubtitle(data.subtitle || '');
            setContent(data.content);
            setExternalLink(data.external_link || '');
            setPreview(data.image_url); // Gunakan URL gambar dari database untuk preview awal
        } catch (err) {
            console.error(err);
            toast.error("Gagal mengambil data berita");
            navigate('/admin/posts');
        } finally {
            setFetching(false);
        }
    };
    if (id) fetchPost();
  }, [id, navigate]);

  // Handle Gambar Upload
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

  // Handle Submit Update
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title || !content) {
        return toast.warning("Judul dan konten wajib diisi!");
    }

    setLoading(true);
    const formData = new FormData();
    formData.append('title', title);
    formData.append('subtitle', subtitle);
    formData.append('content', content);
    formData.append('external_link', externalLink);
    
    // Hanya kirim gambar jika user memilih file baru
    if (image) {
        formData.append('image', image);
    }

    try {
      await api.put(`/posts/${id}`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });
      
      toast.success("Berita berhasil diperbarui!");
      navigate('/admin/posts'); 
    } catch (err) {
      console.error(err);
      toast.error("Gagal memperbarui berita.");
    } finally {
      setLoading(false);
    }
  };

  if (fetching) {
    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 text-slate-500">
            <Loader2 className="animate-spin mb-2" size={32} />
            <p className="font-bold">Memuat data berita...</p>
        </div>
    );
  }

  return (
    <div className="p-4 md:p-8 bg-gray-50 min-h-screen flex justify-center">
      <div className="w-full max-w-5xl">
        
        {/* Header Navigation */}
        <div className="flex items-center justify-between mb-8">
            <div className="flex items-center gap-4">
                <button 
                  onClick={() => navigate(-1)} 
                  className="p-3 bg-white hover:bg-gray-100 rounded-2xl border border-gray-200 transition-all shadow-sm active:scale-90"
                >
                  <ArrowLeft size={20} className="text-slate-600" />
                </button>
                <div className="min-w-0">
                  <h1 className="text-2xl font-black text-slate-900 leading-none">Edit Berita</h1>
                  <p className="text-xs font-bold text-slate-400 mt-1 uppercase tracking-widest">Post Editor v2.0</p>
                </div>
            </div>
            <div className="hidden sm:flex items-center gap-2 bg-amber-50 text-amber-700 px-4 py-2 rounded-full border border-amber-100 font-bold text-xs uppercase tracking-tighter">
                <Info size={14}/> Editing Mode
            </div>
        </div>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            
            {/* KOLOM KIRI: EDITOR UTAMA */}
            <div className="lg:col-span-2 space-y-6">
                <div className="bg-white rounded-3xl border border-gray-200 p-6 md:p-8 shadow-sm space-y-8">
                    {/* Input Judul Utama */}
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Judul Berita Utama <span className="text-red-500">*</span></label>
                        <textarea 
                            rows="2"
                            value={title}
                            onChange={(e) => setTitle(e.target.value)}
                            placeholder="Tulis judul berita..."
                            className="w-full bg-gray-50 border border-gray-200 rounded-2xl p-4 text-xl md:text-2xl font-bold text-slate-900 focus:ring-4 focus:ring-blue-500/10 focus:border-blue-500 outline-none transition-all resize-none placeholder-slate-300"
                            required
                        />
                    </div>

                    {/* Editor Konten */}
                    <div className="space-y-3">
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 block">Narasi Berita <span className="text-red-500">*</span></label>
                        <div className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50 text-slate-900">
                            <ReactQuill 
                                theme="snow" 
                                value={content} 
                                onChange={setContent} 
                                className="bg-white min-h-[400px] text-slate-900"
                                modules={{
                                    toolbar: [
                                        [{ 'header': [1, 2, 3, false] }],
                                        ['bold', 'italic', 'underline', 'strike'],
                                        [{'list': 'ordered'}, {'list': 'bullet'}],
                                        ['link', 'blockquote', 'code-block'],
                                        ['clean']
                                    ],
                                }}
                            />
                        </div>
                    </div>
                </div>
            </div>

            {/* KOLOM KANAN: PENGATURAN TAMBAHAN */}
            <div className="space-y-6">
                {/* Upload Gambar */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm">
                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4 block">Gambar Sampul</label>
                    <div className="relative aspect-video rounded-2xl border-2 border-dashed border-gray-200 flex flex-col items-center justify-center text-center hover:bg-blue-50/30 hover:border-blue-300 transition-all overflow-hidden group">
                        <input 
                            type="file" accept="image/*" onChange={handleImageChange}
                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                        />
                        {preview ? (
                            <>
                                <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center pointer-events-none">
                                    <span className="text-white font-bold text-xs uppercase bg-white/20 backdrop-blur-md px-4 py-2 rounded-full border border-white/30">Ganti Media</span>
                                </div>
                            </>
                        ) : (
                            <div className="p-4 space-y-2 pointer-events-none">
                                <div className="w-12 h-12 bg-blue-50 text-blue-600 rounded-2xl flex items-center justify-center mx-auto shadow-sm">
                                    <ImageIcon size={24}/>
                                </div>
                                <p className="text-xs font-bold text-slate-600">Unggah Gambar</p>
                                <p className="text-[10px] text-slate-400 uppercase tracking-tighter">PNG, JPG, WEBP (Max 2MB)</p>
                            </div>
                        )}
                    </div>
                    <p className="text-[9px] text-slate-400 mt-2 italic text-center">Kosongkan jika tidak ingin mengubah gambar.</p>
                </div>

                {/* Ringkasan & Link */}
                <div className="bg-white p-6 rounded-3xl border border-gray-200 shadow-sm space-y-6">
                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Sub-Judul (Opsional)</label>
                        <textarea 
                            rows="3" value={subtitle} onChange={(e) => setSubtitle(e.target.value)}
                            placeholder="Ringkasan singkat..."
                            maxLength={150}
                            className="w-full bg-gray-50 border border-gray-200 rounded-xl p-4 text-sm font-medium text-slate-900 focus:ring-2 focus:ring-blue-500 outline-none transition-all resize-none placeholder-slate-300"
                        />
                    </div>

                    <div>
                        <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-3 block">Link Informasi Luar</label>
                        <div className="relative">
                          <LinkIcon size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400" />
                          <input 
                              type="url" value={externalLink} onChange={(e) => setExternalLink(e.target.value)}
                              placeholder="https://..."
                              className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-11 pr-4 py-3.5 text-sm font-bold text-blue-600 focus:ring-2 focus:ring-blue-500 outline-none transition-all placeholder-slate-300"
                          />
                        </div>
                    </div>

                    <div className="pt-4">
                        <button 
                            type="submit" disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white py-4 rounded-2xl font-bold flex items-center justify-center gap-3 shadow-xl shadow-blue-200 transition-all active:scale-[0.98] disabled:bg-slate-400 disabled:shadow-none"
                        >
                            {loading ? <Loader2 className="animate-spin" size={20}/> : <Save size={20}/>}
                            {loading ? 'Menyimpan...' : 'Simpan Perubahan'}
                        </button>
                    </div>
                </div>
            </div>

        </form>
      </div>
    </div>
  );
};

export default EditPost;
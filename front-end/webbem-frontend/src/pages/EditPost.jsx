import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import ReactQuill from 'react-quill-new';
import 'react-quill-new/dist/quill.snow.css';
import { Save, ArrowLeft, Image as ImageIcon, Loader2, MonitorPlay } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

const EditPost = () => {
    const { id } = useParams();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const [title, setTitle] = useState('');
    const [subtitle, setSubtitle] = useState('');
    const [content, setContent] = useState('');
    const [externalLink, setExternalLink] = useState('');
    const [image, setImage] = useState(null);
    const [preview, setPreview] = useState(null);

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
                setPreview(data.image_url);
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
        if (!title || !content) {
            return toast.warning("Judul dan konten wajib diisi!");
        }

        setLoading(true);
        const formData = new FormData();
        formData.append('title', title);
        formData.append('subtitle', subtitle);
        formData.append('content', content);
        formData.append('external_link', externalLink);

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
        <div className="p-4 md:p-6 bg-gray-50 min-h-screen flex justify-center pb-20 font-sans">
            <div className="w-full max-w-4xl">

                <div className="flex items-center gap-3 md:gap-4 mb-5 md:mb-6">
                    <button onClick={() => navigate(-1)} className="p-2 hover:bg-white rounded-full transition-colors bg-white md:bg-transparent shadow-sm md:shadow-none border border-gray-200 md:border-none"><ArrowLeft size={20} /></button>
                    <h1 className="text-xl md:text-2xl font-black text-gray-800 tracking-tight">Edit Berita</h1>
                </div>

                <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-sm border border-gray-200 p-5 md:p-8 space-y-6 md:space-y-8">

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-[11px]">Judul Artikel <span className="text-red-500">*</span></label>
                            <input
                                type="text"
                                value={title}
                                onChange={(e) => setTitle(e.target.value)}
                                placeholder="Contoh: Kegiatan Bakti Sosial BEM 2025"
                                className="w-full p-4 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none font-black text-lg md:text-2xl text-slate-900 transition-all placeholder:font-medium placeholder:text-gray-300"
                                required
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-[11px]">Sub-Judul (Ringkasan Singkat)</label>
                            <input
                                type="text"
                                value={subtitle}
                                onChange={(e) => setSubtitle(e.target.value)}
                                placeholder="Opsional: Muncul di bawah judul (Max 150 karakter)"
                                maxLength={150}
                                className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-sm font-medium text-slate-700 transition-all"
                            />
                        </div>

                        <div className="md:col-span-2">
                            <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-[11px]">Gambar Sampul</label>
                            <div className="border-2 border-dashed border-gray-300 rounded-xl p-2 flex flex-col items-center justify-center text-center hover:bg-gray-50 transition-colors relative overflow-hidden group min-h-[250px] md:min-h-[350px] bg-slate-50">
                                <input
                                    type="file"
                                    accept="image/*"
                                    onChange={handleImageChange}
                                    className="absolute inset-0 opacity-0 cursor-pointer z-10 w-full h-full"
                                />

                                {preview ? (
                                    <div className="relative w-full h-64 md:h-full rounded-lg overflow-hidden">
                                        <img src={preview} alt="Preview" className="w-full h-full object-cover" />
                                        <div className="absolute inset-0 bg-black/60 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity text-white font-bold tracking-widest uppercase text-sm pointer-events-none">
                                            Ganti Gambar Sampul
                                        </div>
                                    </div>
                                ) : (
                                    <div className="space-y-3 py-8 pointer-events-none">
                                        <div className="w-16 h-16 bg-white shadow-sm border border-gray-100 text-blue-600 rounded-full flex items-center justify-center mx-auto">
                                            <ImageIcon size={28} />
                                        </div>
                                        <p className="text-base font-bold text-slate-700 tracking-tight">Klik untuk upload foto</p>
                                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">PNG, JPG, WEBP (Max 2MB)</p>
                                    </div>
                                )}
                            </div>
                            <p className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Biarkan kosong jika tidak ingin mengubah gambar.</p>
                        </div>
                    </div>

                    {/* AREA ISI BERITA (SIMULASI FRONT-END) */}
                    <div className="pt-4 border-t border-gray-100">
                        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-4 gap-2">
                            <label className="block text-sm font-bold text-gray-700 uppercase tracking-wider text-[11px]">
                                Isi Berita <span className="text-red-500">*</span>
                            </label>
                            <div className="flex items-center gap-2 text-[10px] font-bold text-blue-600 bg-blue-50 px-3 py-1.5 rounded-full uppercase tracking-widest">
                                <MonitorPlay size={12} /> Mode Pratinjau Editorial Aktif
                            </div>
                        </div>

                        {/* SUNTIKAN CSS KHUSUS AGAR EDITOR SAMA PERSIS DENGAN HALAMAN DETAIL */}
                        <style>{`
    .editor-preview .ql-toolbar {
        border-top-left-radius: 0.75rem;
        border-top-right-radius: 0.75rem;
        background-color: #f8fafc;
        border-color: #e2e8f0;
        padding: 12px;
    }
    .editor-preview .ql-container {
        border-bottom-left-radius: 0.75rem;
        border-bottom-right-radius: 0.75rem;
        border-color: #e2e8f0;
        font-family: ui-serif, Georgia, Cambria, "Times New Roman", Times, serif !important;
        font-size: 18px !important;
        min-height: 500px;
    }
    @media (min-width: 768px) {
        .editor-preview .ql-container { font-size: 20px !important; }
    }
    .editor-preview .ql-editor {
        line-height: 1.8 !important;
        color: #1e293b !important;
        padding: 2rem !important;
    }
    
    /* INI KUNCI ANTI TEKS KEPOTONG */
    .editor-preview .ql-editor p, 
    .editor-preview .ql-editor li, 
    .editor-preview .ql-editor div {
        word-break: normal !important;
        overflow-wrap: normal !important;
        white-space: pre-wrap !important;
        hyphens: none !important;
        -webkit-hyphens: none !important;
        text-align: left !important; /* Paksa rata kiri, jangan justify */
        margin-bottom: 1.5rem;
    }

    .editor-preview .ql-editor h1, 
    .editor-preview .ql-editor h2 {
        font-family: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif !important;
        font-weight: 900 !important;
        color: #0f172a !important;
        margin-top: 2rem !important;
        margin-bottom: 1rem !important;
        text-transform: uppercase !important;
        text-align: left !important;
    }
`}</style>

                        <ReactQuill
                            theme="snow"
                            value={content}
                            onChange={setContent}
                            className="editor-preview shadow-sm"
                            modules={{
                                toolbar: [
                                    [{ 'header': [2, false] }],
                                    ['bold', 'italic', 'underline', 'strike', 'blockquote'],
                                    [{ 'list': 'ordered' }, { 'list': 'bullet' }],
                                    ['link', 'clean']
                                ],
                            }}
                            placeholder="Ketik isi berita Anda di sini... (Tampilan ini sudah disesuaikan dengan hasil akhir di website)"
                        />
                    </div>

                    <div className="pt-4">
                        <label className="block text-sm font-bold text-gray-700 mb-2 uppercase tracking-wider text-[11px]">Link Eksternal (Opsional)</label>
                        <input
                            type="url"
                            value={externalLink}
                            onChange={(e) => setExternalLink(e.target.value)}
                            placeholder="Contoh: https://bit.ly/pendaftaran-acara"
                            className="w-full p-3.5 rounded-xl border border-gray-200 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 outline-none text-blue-600 font-medium text-sm transition-all"
                        />
                        <p className="text-[11px] font-bold text-gray-400 mt-2 uppercase tracking-widest">Gunakan untuk tombol pendaftaran, formulir, atau dokumen g-drive.</p>
                    </div>

                    <div className="pt-8 border-t border-gray-100 flex flex-col md:flex-row justify-end gap-3 md:gap-4 mt-8">
                        <button
                            type="button"
                            onClick={() => navigate(-1)}
                            disabled={loading}
                            className="order-2 md:order-1 px-8 py-3.5 rounded-xl font-bold text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all border border-gray-200 md:border-transparent text-sm uppercase tracking-widest"
                        >
                            Batal
                        </button>
                        <button
                            type="submit"
                            disabled={loading}
                            className="order-1 md:order-2 w-full md:w-auto bg-blue-600 hover:bg-slate-900 text-white px-10 py-3.5 rounded-xl font-black text-sm uppercase tracking-widest flex items-center justify-center gap-2 shadow-lg hover:shadow-xl transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? <Loader2 size={18} className="animate-spin" /> : <Save size={18} />}
                            {loading ? 'MENYIMPAN...' : 'SIMPAN PERUBAHAN'}
                        </button>
                    </div>

                </form>
            </div>
        </div>
    );
};

export default EditPost;
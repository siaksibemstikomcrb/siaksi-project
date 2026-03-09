import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import {
    ArrowUp, Share2, ArrowLeft, Link as LinkIcon, X,
    Clock, MapPin, Mail, ChevronRight, Shield
} from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

// Hapus import quill css jika merusak styling bawaan Tailwind, 
// atau biarkan jika kamu butuh spesifik styling list/blockquote dari quill
import 'react-quill-new/dist/quill.snow.css';

const DetailSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-32 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
            <div className="h-6 w-32 bg-slate-200 animate-pulse mb-8" />
            <div className="h-14 w-full bg-slate-200 animate-pulse" />
            <div className="h-14 w-3/4 bg-slate-200 animate-pulse" />
            <div className="h-6 w-1/2 bg-slate-200 animate-pulse mt-4" />
            <div className="aspect-video w-full bg-slate-200 animate-pulse mt-8" />
        </div>
        <div className="hidden lg:block lg:col-span-4 space-y-6 pt-10">
            <div className="h-6 w-40 bg-slate-200 animate-pulse border-b-2 border-slate-900 pb-2" />
            <div className="h-24 w-full bg-slate-200 animate-pulse" />
            <div className="h-24 w-full bg-slate-200 animate-pulse" />
            <div className="h-60 w-full bg-slate-900 animate-pulse mt-10" />
        </div>
    </div>
);

const RelatedPostCard = ({ item, navigate }) => (
    <div
        className="group cursor-pointer flex gap-4 items-center py-5 border-b border-slate-200 last:border-0 transition-colors"
        onClick={() => navigate(`/news/${item.id}`)}
    >
        <div className="w-24 aspect-square bg-slate-100 shrink-0 overflow-hidden relative">
            <img
                src={item.image_url}
                className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                alt={item.title}
                onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
            />
        </div>
        <div className="flex-1 min-w-0 flex flex-col justify-center">
            <span className="text-[10px] font-black text-blue-600 uppercase mb-1.5 block tracking-widest">{item.ukm_name}</span>
            <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-600 line-clamp-3 mb-2 transition-colors">
                {item.title}
            </h4>
            <span className="text-[10px] font-bold text-slate-400 flex items-center gap-1 uppercase tracking-wider">
                <Clock size={10} />
                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
            </span>
        </div>
    </div>
);

const PostDetail = () => {
    const { id } = useParams();
    const navigate = useNavigate();

    const [post, setPost] = useState(null);
    const [relatedPosts, setRelatedPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [isImageOpen, setIsImageOpen] = useState(false);
    const [showScrollTop, setShowScrollTop] = useState(false);

    const handleImageError = (e) => {
        e.target.src = 'https://via.placeholder.com/800x450?text=SIAKSI+NEWS';
    };

    useEffect(() => {
        const handleScroll = () => setShowScrollTop(window.scrollY > 400);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    useEffect(() => {
        window.scrollTo(0, 0);
        const fetchAllData = async () => {
            setLoading(true);
            try {
                const [postRes, relatedRes] = await Promise.all([
                    api.get(`/posts/${id}`),
                    api.get(`/posts/public`)
                ]);
                setPost(postRes.data);
                setRelatedPosts(relatedRes.data.filter(p => p.id !== parseInt(id)).slice(0, 4));
            } catch (err) {
                console.error("Error:", err);
                toast.error("Gagal memuat berita.");
            } finally {
                setLoading(false);
            }
        };
        if (id) fetchAllData();
    }, [id]);

    const handleShare = async () => {
        if (!post) return;
        const shareData = {
            title: post.title,
            text: post.subtitle,
            url: window.location.href,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) { }
        } else {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Tautan berhasil disalin!');
        }
    };

    if (loading) return <div className="bg-white min-h-screen"><Navbar isTransparent={false} /><DetailSkeleton /></div>;
    if (!post) return null;

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-blue-200 selection:text-blue-900 overflow-x-hidden">
            <Navbar isTransparent={false} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">

                {/* Tombol Kembali Editorial */}
                <div className="mb-10">
                    <button onClick={() => navigate('/news')} className="flex items-center text-xs font-black uppercase tracking-widest text-slate-500 hover:text-slate-900 transition-colors group">
                        <ArrowLeft size={14} className="mr-2 group-hover:-translate-x-1 transition-transform" /> INDEKS BERITA
                    </button>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16">

                    {/* MAIN ARTICLE AREA */}
                    <div className="lg:col-span-8 min-w-0 w-full overflow-hidden">

                        <header className="mb-10">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="bg-blue-600 text-white font-black text-[10px] uppercase tracking-widest px-3 py-1.5 flex items-center gap-2">
                                    <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" />
                                    {post.ukm_name}
                                </span>
                            </div>

                            <h1 className="text-4xl md:text-5xl lg:text-6xl font-black text-slate-900 mb-6 leading-[1.05] tracking-tighter break-words">
                                {post.title}
                            </h1>

                            {post.subtitle && (
                                <p className="text-lg md:text-2xl text-slate-600 font-serif leading-relaxed italic mb-8">
                                    "{post.subtitle}"
                                </p>
                            )}

                            {/* Author & Meta Data Line */}
                            <div className="flex flex-col sm:flex-row sm:items-center justify-between border-y-2 border-slate-100 py-4 mb-10 gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="min-w-0">
                                        <p className="text-sm font-bold text-slate-900 uppercase tracking-wide">Tim Redaksi {post.ukm_name}</p>
                                        <p className="text-[11px] text-slate-500 uppercase tracking-widest font-bold mt-1">
                                            {new Date(post.created_at).toLocaleDateString('id-ID', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} <span className="mx-1">•</span> {new Date(post.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })} WIB
                                        </p>
                                    </div>
                                </div>
                                <button onClick={handleShare} className="flex items-center justify-center gap-2 px-5 py-2.5 bg-slate-50 hover:bg-slate-100 text-slate-900 text-xs font-black uppercase tracking-widest transition-colors border border-slate-200">
                                    <Share2 size={14} /> Bagikan Artikel
                                </button>
                            </div>
                        </header>

                        <figure className="relative w-full mb-12 group cursor-zoom-in bg-slate-100 border border-slate-100" onClick={() => setIsImageOpen(true)}>
                            <img
                                src={post.image_url}
                                onError={handleImageError}
                                className="w-full h-auto max-h-[650px] object-cover transition-transform duration-700"
                                alt={post.title}
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                                <span className="bg-slate-900 text-white px-6 py-3 text-xs font-black tracking-widest uppercase opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    Perbesar Foto
                                </span>
                            </div>
                        </figure>

                        {/* CONTENT ARTICLE */}
                        <article className="relative w-full overflow-hidden">
                            <style>{`
        /* CSS Khusus untuk menjinakkan Quill agar tidak manjang ke samping */
        .siaksi-content {
            width: 100% !important;
            max-width: 100% !important;
            overflow-wrap: break-word !important;
            word-wrap: break-word !important;
            word-break: break-word !important;
            white-space: normal !important; /* Kunci biar teks nggak manjang kesamping */
        }
        
        .siaksi-content p, 
        .siaksi-content li, 
        .siaksi-content h1, 
        .siaksi-content h2, 
        .siaksi-content h3 {
            width: 100% !important;
            white-space: pre-wrap !important; /* Jaga enter-an tapi tetep bungkus teks */
        }

        /* Benerin gambar biar gak luber */
        .siaksi-content img {
            max-width: 100% !important;
            height: auto !important;
            display: block;
            margin: 2rem auto;
        }

        /* Benerin tabel kalau admin masukin tabel dari Quill */
        .siaksi-content table {
            width: 100% !important;
            border-collapse: collapse;
            overflow-x: auto;
            display: block;
        }
    `}</style>

                            <div
                                className="siaksi-content prose prose-slate prose-lg max-w-none 
        text-[18px] md:text-[20px] text-slate-800 font-serif leading-[1.8]
        text-left w-full
        prose-p:mb-6 prose-p:mt-0
        prose-headings:font-sans prose-headings:text-slate-900 prose-headings:font-black prose-headings:tracking-tight
        prose-h2:text-3xl prose-h2:mt-12 prose-h2:mb-6 prose-h2:uppercase
        prose-img:rounded-none prose-img:border prose-img:border-slate-200
        prose-a:text-blue-600 prose-a:no-underline hover:prose-a:underline"
                                dangerouslySetInnerHTML={{ __html: post.content }}
                            />
                        </article>

                        {post.external_link && (
                            <a href={post.external_link} target="_blank" rel="noreferrer" className="block mt-12 group">
                                <div className="bg-white border-2 border-slate-900 p-6 flex items-center justify-between hover:bg-slate-900 hover:text-white transition-colors">
                                    <div className="flex items-center gap-4 font-bold min-w-0">
                                        <LinkIcon size={20} className="text-blue-600 group-hover:text-blue-400 shrink-0" />
                                        <span className="truncate text-sm md:text-base uppercase tracking-wider">Tautan Eksternal Pendaftaran / Dokumen</span>
                                    </div>
                                    <ArrowUp size={24} className="rotate-45 text-slate-400 group-hover:text-white group-hover:translate-x-1 group-hover:-translate-y-1 transition-all shrink-0" />
                                </div>
                            </a>
                        )}

                        {/* MOBILE RELATED POSTS SECTION */}
                        <div className="lg:hidden mt-16 pt-10 border-t-4 border-slate-900">
                            <h3 className="font-black text-slate-900 mb-6 text-xl uppercase tracking-tighter">Berita Terkait</h3>
                            <div className="flex flex-col">
                                {relatedPosts.map(item => (
                                    <RelatedPostCard key={item.id} item={item} navigate={navigate} />
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* SIDEBAR EDITORIAL */}
                    <aside className="hidden lg:block lg:col-span-4 pl-4 border-l border-slate-200">
                        <div className="sticky top-28 space-y-12">

                            <div>
                                <h3 className="font-black text-slate-900 mb-6 text-sm uppercase tracking-widest border-b-2 border-slate-900 inline-block pb-2">
                                    Baca Juga
                                </h3>
                                <div className="flex flex-col">
                                    {relatedPosts.map(item => (
                                        <RelatedPostCard key={item.id} item={item} navigate={navigate} />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-slate-900 p-8 text-white relative overflow-hidden border-t-4 border-blue-600">
                                <div className="relative z-10">
                                    <span className="text-blue-400 font-bold text-[10px] uppercase tracking-widest mb-3 block">Ekosistem Kampus</span>
                                    <h3 className="font-black text-2xl mb-4 leading-tight">Terhubung dengan Organisasimu!</h3>
                                    <p className="text-slate-400 text-sm mb-8 leading-relaxed font-medium">Masuk untuk melihat agenda, melakukan presensi, dan memantau aktivitas UKM secara real-time.</p>
                                    <button onClick={() => navigate('/login')} className="w-full bg-blue-600 text-white font-black py-4 hover:bg-white hover:text-slate-900 transition-colors text-xs uppercase tracking-widest">
                                        Masuk SIAKSI
                                    </button>
                                </div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>

            {/* MODAL GAMBAR PERBESAR */}
            <AnimatePresence>
                {isImageOpen && (
                    <motion.div
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-slate-900/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                        onClick={() => setIsImageOpen(false)}
                    >
                        <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors">
                            <X size={32} />
                        </button>
                        <motion.img
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            src={post.image_url}
                            onError={handleImageError}
                            className="max-w-full max-h-[90vh] object-contain border border-slate-700 shadow-2xl"
                            onClick={(e) => e.stopPropagation()}
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showScrollTop && (
                    <motion.button
                        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: 20 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
                        className="fixed bottom-8 right-8 bg-slate-900 text-white p-4 shadow-xl hover:bg-blue-600 transition-colors z-40 border border-slate-700"
                    >
                        <ArrowUp size={20} />
                    </motion.button>
                )}
            </AnimatePresence>

            <footer className="bg-slate-900 pt-20 pb-10 px-4 mt-20 border-t-[8px] border-blue-600">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    <div className="md:col-span-5">
                        <h3 className="text-4xl font-black text-white mb-6 tracking-tighter">SIAKSI.</h3>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-sm text-sm">
                            Platform ekosistem digital untuk manajemen organisasi mahasiswa yang adaptif dan terintegrasi. Menyajikan berita aktual dan terpercaya.
                        </p>
                    </div>
                    <div className="md:col-span-3 md:col-start-7">
                        <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-widest border-b border-slate-800 pb-2">Navigasi</h4>
                        <ul className="space-y-4 text-sm text-slate-400 font-medium">
                            <li><button onClick={() => navigate('/')} className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={14} /> Beranda</button></li>
                            <li><button onClick={() => navigate('/news')} className="hover:text-white transition-colors flex items-center gap-2"><ChevronRight size={14} /> Kabar Berita</button></li>
                        </ul>
                    </div>
                    <div className="md:col-span-3">
                        <h4 className="text-white font-bold mb-6 text-xs uppercase tracking-widest border-b border-slate-800 pb-2">Kontak Redaksi</h4>
                        <ul className="space-y-4 text-sm text-slate-400 font-medium">
                            <li className="flex gap-3"><MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" /> STIKOM Poltek Cirebon</li>
                            <li className="flex gap-3"><Mail size={16} className="text-blue-500 shrink-0 mt-0.5" /> siaksibemstimcrb@gmail.com</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800 flex flex-col md:flex-row justify-between items-center gap-4 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <p>&copy; {new Date().getFullYear()} BEM STIKOM Poltek Cirebon. All Rights Reserved.</p>
                    <div className="flex items-center gap-1.5 text-slate-600">
                        <Shield size={12} /> VERSI 1.0.0
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PostDetail;
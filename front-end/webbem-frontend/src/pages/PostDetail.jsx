import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { 
    Calendar, ArrowUp, Share2, Eye, ArrowLeft, 
    Link as LinkIcon, X, Clock, MapPin, Building, Mail, ChevronRight, AlertTriangle,
    Shield
} from 'lucide-react';
import api from '../api/axios';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';
import 'react-quill-new/dist/quill.snow.css';

const DetailSkeleton = () => (
    <div className="max-w-7xl mx-auto px-4 pt-24 pb-12 grid grid-cols-1 lg:grid-cols-12 gap-12">
        <div className="lg:col-span-8 space-y-6">
            <div className="h-8 w-32 bg-gray-200 rounded animate-pulse" />
            <div className="h-12 w-full bg-gray-200 rounded animate-pulse" />
            <div className="h-6 w-2/3 bg-gray-200 rounded animate-pulse" />
            <div className="aspect-video w-full bg-gray-200 rounded-2xl animate-pulse mt-6" />
        </div>
        <div className="hidden lg:block lg:col-span-4 space-y-4">
            <div className="h-60 w-full bg-gray-200 rounded-2xl animate-pulse" />
        </div>
    </div>
);

const RelatedPostCard = ({ item, navigate }) => (
    <div 
        className="group cursor-pointer flex gap-4 items-start p-3 rounded-xl hover:bg-gray-50 transition-colors border border-transparent hover:border-gray-100" 
        onClick={() => navigate(`/news/${item.id}`)}
    >
        <div className="w-20 h-20 rounded-xl overflow-hidden shrink-0 bg-gray-100 relative shadow-sm">
            <img 
                src={item.image_url} 
                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" 
                alt={item.title}
                onError={(e) => e.target.src = 'https://via.placeholder.com/150'}
            />
        </div>
        <div className="flex-1 min-w-0">
            <span className="text-[10px] font-bold text-blue-600 uppercase mb-1 block truncate">{item.ukm_name}</span>
            <h4 className="text-sm font-semibold text-gray-800 leading-snug group-hover:text-blue-600 line-clamp-2 mb-1">
                {item.title}
            </h4>
            <span className="text-[11px] text-gray-400 flex items-center gap-1">
                <Calendar size={10}/>
                {new Date(item.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
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
        e.target.src = 'https://via.placeholder.com/800x450?text=No+Image+Available';
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
                setRelatedPosts(relatedRes.data.filter(p => p.id !== parseInt(id)).slice(0, 5));
            } catch (err) {
                console.error("Error:", err);
                toast.error("Gagal memuat berita.");
            } finally {
                setLoading(false);
            }
        };
        if(id) fetchAllData();
    }, [id]);

    const handleShare = async () => {
        if (!post) return;
        const shareData = {
            title: post.title,
            text: post.subtitle,
            url: window.location.href,
        };
        if (navigator.share) {
            try { await navigator.share(shareData); } catch (err) {}
        } else {
            await navigator.clipboard.writeText(window.location.href);
            toast.success('Link disalin!');
        }
    };

    if (loading) return <div className="bg-white min-h-screen"><Navbar isTransparent={false} /><DetailSkeleton /></div>;
    if (!post) return null;

    return (
        <div className="bg-white min-h-screen font-sans selection:bg-blue-100 selection:text-blue-900 overflow-x-hidden">
            <Navbar isTransparent={false} />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 pb-16">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    
                    <div className="lg:col-span-8 min-w-0 w-full overflow-hidden">
                        
                        <button onClick={() => navigate('/news')} className="flex items-center text-sm font-medium text-gray-500 mb-8 hover:text-blue-600 transition-colors group">
                            <ArrowLeft size={16} className="mr-2 group-hover:-translate-x-1 transition-transform"/> Kembali ke Berita
                        </button>

                        <header className="mb-8">
                            <div className="flex flex-wrap items-center gap-3 mb-6">
                                <span className="text-blue-600 font-bold text-[10px] bg-blue-50 px-3 py-1 rounded-md uppercase tracking-widest border border-blue-100">
                                    {post.ukm_name}
                                </span>
                                <span className="text-xs text-gray-400 font-medium flex items-center gap-1.5">
                                    <Clock size={14}/> {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                </span>
                            </div>
                            
                           <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold text-gray-900 mb-6 leading-[1.2] tracking-tight break-words">
                                {post.title}
                            </h1>
                            
                            {post.subtitle && (
                                <p className="text-lg md:text-xl text-gray-500 font-normal leading-relaxed italic border-l-4 border-gray-100 pl-4">
                                    {post.subtitle}
                                </p>
                            )}
                        </header>

                        <div className="flex flex-wrap items-center justify-between border-y border-gray-100 py-5 mb-10 gap-4">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-700 rounded-full flex items-center justify-center font-bold text-white text-xs shadow-lg">
                                    {post.ukm_name.charAt(0)}
                                </div>
                                <div className="min-w-0">
                                    <p className="text-sm font-bold text-gray-900 truncate">Admin {post.ukm_name}</p>
                                    <p className="text-[11px] text-gray-500 uppercase tracking-tighter">Penulis Kontributor</p>
                                </div>
                            </div>
                            <button onClick={handleShare} className="flex items-center gap-2 px-5 py-2 hover:bg-gray-50 rounded-full text-gray-600 text-sm font-bold transition-all border border-gray-200 active:scale-95">
                                <Share2 size={16}/> Bagikan
                            </button>
                        </div>

                        <figure className="relative w-full aspect-video rounded-3xl overflow-hidden mb-12 shadow-2xl bg-gray-100 group cursor-zoom-in" onClick={() => setIsImageOpen(true)}>
                            <img 
                                src={post.image_url} 
                                onError={handleImageError}
                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" 
                                alt={post.title} 
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                                <span className="bg-black/60 backdrop-blur-md text-white px-5 py-2.5 rounded-full text-xs font-bold opacity-0 group-hover:opacity-100 transition-all transform translate-y-2 group-hover:translate-y-0">
                                    Klik untuk Perbesar
                                </span>
                            </div>
                        </figure>

                        {post.external_link && (
                            <a href={post.external_link} target="_blank" rel="noreferrer" className="block mb-12 group">
                                <div className="bg-blue-50 border border-blue-100 rounded-2xl p-5 flex items-center justify-between hover:bg-blue-100 transition-all">
                                    <div className="flex items-center gap-4 text-blue-700 font-bold min-w-0">
                                        <div className="bg-blue-600 text-white p-2.5 rounded-xl shrink-0 shadow-md">
                                            <LinkIcon size={20}/>
                                        </div>
                                        <span className="truncate text-sm md:text-base">Kunjungi Link Pendaftaran / Informasi</span>
                                    </div>
                                    <ArrowUp size={20} className="rotate-45 text-blue-600 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform shrink-0"/>
                                </div>
                            </a>
                        )}

<article className="relative w-full">

<div 
    className="ql-editor prose prose-slate max-w-none 
    text-[17px] md:text-[19px] text-[#222222] font-normal leading-[1.85]
    prose-p:mb-8 prose-p:mt-0 
    prose-headings:text-[#111111] prose-headings:font-bold prose-headings:tracking-tight
    prose-h2:text-2xl prose-h2:mt-12 prose-h2:mb-4
    prose-img:rounded-xl prose-img:shadow-sm prose-img:my-10
    prose-table:block prose-table:overflow-x-auto
    prose-li:mb-2
    
    /* GANTI BAGIAN INI */
    break-words" 
    dangerouslySetInnerHTML={{ __html: post.content }}
/>
</article>

                        <div className="lg:hidden mt-16 pt-10 border-t border-gray-100">
                            <h3 className="font-bold text-gray-900 mb-8 text-xl">Berita Terkait</h3>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {relatedPosts.map(item => (
                                    <RelatedPostCard key={item.id} item={item} navigate={navigate} />
                                ))}
                            </div>
                        </div>
                    </div>

                    <aside className="hidden lg:block lg:col-span-4">
                        <div className="sticky top-28 space-y-8">
                            <div className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm">
                                <h3 className="font-bold text-gray-900 mb-6 flex items-center gap-3 text-lg">
                                    <span className="w-1.5 h-6 bg-blue-600 rounded-full"/> Berita Terkait
                                </h3>
                                <div className="space-y-3">
                                    {relatedPosts.map(item => (
                                        <RelatedPostCard key={item.id} item={item} navigate={navigate} />
                                    ))}
                                </div>
                            </div>

                            <div className="bg-blue-600 rounded-3xl p-8 text-white relative overflow-hidden shadow-xl shadow-blue-200">
                                <div className="relative z-10">
                                    <h3 className="font-bold text-xl mb-3">Ayo Bergabung!</h3>
                                    <p className="text-blue-100 text-sm mb-6 leading-relaxed font-medium">Kembangkan potensi dirimu dengan aktif di organisasi mahasiswa.</p>
                                    <button onClick={() => navigate('/login')} className="w-full bg-white text-blue-700 font-bold py-4 rounded-2xl hover:bg-blue-50 transition-all text-sm shadow-lg shadow-black/10 active:scale-95">
                                        Masuk ke SIAKSI
                                    </button>
                                </div>
                                <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/10 rounded-full blur-3xl"></div>
                            </div>
                        </div>
                    </aside>

                </div>
            </div>

            <AnimatePresence>
                {isImageOpen && (
                    <motion.div 
                        initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] bg-black/95 backdrop-blur-sm flex items-center justify-center p-4 cursor-zoom-out"
                        onClick={() => setIsImageOpen(false)}
                    >
                        <button className="absolute top-6 right-6 text-white/70 hover:text-white p-3 bg-white/10 rounded-full transition-all">
                            <X size={24}/>
                        </button>
                        <motion.img 
                            initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.9, opacity: 0 }}
                            src={post.image_url} 
                            onError={handleImageError}
                            className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl"
                            onClick={(e) => e.stopPropagation()} 
                        />
                    </motion.div>
                )}
            </AnimatePresence>

            <AnimatePresence>
                {showScrollTop && (
                    <motion.button 
                        initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.8 }}
                        onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })} 
                        className="fixed bottom-8 right-8 bg-blue-600 text-white p-4 rounded-2xl shadow-xl shadow-blue-200 hover:bg-blue-700 transition-all z-40 active:scale-90"
                    >
                        <ArrowUp size={24}/>
                    </motion.button>
                )}
            </AnimatePresence>

            <footer className="bg-[#020617] pt-20 pb-10 px-4 border-t border-slate-800/50 mt-20">
                <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
                    <div className="md:col-span-5">
                        <h3 className="text-3xl font-black text-white mb-6 tracking-tighter">SIAKSI</h3>
                        <p className="text-slate-400 font-medium leading-relaxed max-w-sm">
                            Platform ekosistem digital untuk manajemen organisasi mahasiswa yang adaptif dan terintegrasi.
                        </p>
                    </div>
                    <div className="md:col-span-3 md:col-start-7">
                        <h4 className="text-white font-bold mb-6 text-lg">Navigasi</h4>
                        <ul className="space-y-4 text-sm text-slate-400 font-semibold">
                            <li><button onClick={() => navigate('/')} className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Beranda</button></li>
                            <li><button onClick={() => navigate('/news')} className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Kabar Berita</button></li>
                        </ul>
                    </div>
                    <div className="md:col-span-3">
                        <h4 className="text-white font-bold mb-6 text-lg">Pusat Bantuan</h4>
                        <ul className="space-y-4 text-sm text-slate-400 font-medium">
                            <li className="flex gap-4"><MapPin size={18} className="text-blue-500 shrink-0"/> STIKOM Poltek Cirebon</li>
                            <li className="flex gap-4"><Mail size={18} className="text-blue-500 shrink-0"/> siaksibemstimcrb@gmail.com</li>
                        </ul>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto pt-10 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-6 text-[10px] font-bold text-slate-500 uppercase tracking-widest">
                    <p>&copy; {new Date().getFullYear()} BEM STIKOM Poltek Cirebon.</p>
                    <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-500">
                        <Shield size={12} /> BEM 2025-2026
                    </div>
                </div>
            </footer>
        </div>
    );
};

export default PostDetail;
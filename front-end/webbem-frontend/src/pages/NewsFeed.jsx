import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Calendar, ArrowRight, Search, XCircle, Clock, MapPin, Mail, Shield, ChevronRight } from 'lucide-react';
import api from '../api/axios';

const NewsSkeleton = () => (
    <div className="flex flex-col gap-4 animate-pulse">
        <div className="aspect-[4/3] w-full bg-slate-200" />
        <div className="space-y-2">
            <div className="h-3 w-1/4 bg-slate-200" />
            <div className="h-6 w-full bg-slate-200" />
            <div className="h-6 w-5/6 bg-slate-200" />
        </div>
        <div className="h-3 w-full bg-slate-200 mt-2" />
        <div className="h-3 w-2/3 bg-slate-200" />
    </div>
);

const HeadlineSkeleton = () => (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 mb-16 animate-pulse">
        <div className="lg:col-span-8">
            <div className="aspect-video w-full bg-slate-200 mb-4" />
            <div className="h-10 w-3/4 bg-slate-200 mb-3" />
            <div className="h-4 w-1/2 bg-slate-200" />
        </div>
        <div className="lg:col-span-4 flex flex-col gap-8">
            <div className="h-4 w-1/3 bg-slate-200 mb-2" />
            <div className="flex gap-4">
                <div className="w-1/3 aspect-[4/3] bg-slate-200" />
                <div className="flex-1 space-y-2"><div className="h-4 w-full bg-slate-200" /><div className="h-4 w-2/3 bg-slate-200" /></div>
            </div>
            <div className="flex gap-4">
                <div className="w-1/3 aspect-[4/3] bg-slate-200" />
                <div className="flex-1 space-y-2"><div className="h-4 w-full bg-slate-200" /><div className="h-4 w-2/3 bg-slate-200" /></div>
            </div>
        </div>
    </div>
);

const NewsFeed = () => {
    const navigate = useNavigate();
    const location = useLocation();

    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState('');
    const [visibleCount, setVisibleCount] = useState(6);

    const stripHtml = (html) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const handleImageError = (e) => {
        e.target.src = 'https://via.placeholder.com/800x600?text=SIAKSI+NEWS';
    };

    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await api.get('/posts/public');
                setPosts(res.data);
            } catch (err) {
                console.error("Failed to fetch news:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat = params.get('cat');
        const search = params.get('search');

        setFilterCategory(cat ? decodeURIComponent(cat) : 'Semua');
        setSearchQuery(search ? decodeURIComponent(search) : '');
        setVisibleCount(6);
    }, [location.search]);

    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const dbName = post.ukm_name ? post.ukm_name.toLowerCase().trim() : '';
            const filterName = filterCategory.toLowerCase().trim();

            const isCategoryMatch = filterCategory === 'Semua' || filterCategory === 'All' || dbName.includes(filterName);

            const query = searchQuery.toLowerCase();
            const isSearchMatch = !searchQuery || post.title.toLowerCase().includes(query) || (post.content && stripHtml(post.content).toLowerCase().includes(query));

            return isCategoryMatch && isSearchMatch;
        });
    }, [posts, filterCategory, searchQuery]);

    const pinnedPosts = useMemo(() => filteredPosts.filter(p => p.is_pinned), [filteredPosts]);
    const displayPosts = filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    const clearSearch = () => navigate('/news');

    const topHeadline = pinnedPosts.length > 0 ? pinnedPosts[0] : (displayPosts.length > 0 ? displayPosts[0] : null);

    // Jangan tampilkan topHeadline lagi di daftar grid bawah
    const gridPosts = displayPosts.filter(p => p.id !== topHeadline?.id).slice(0, visibleCount);
    const subHeadlines = displayPosts.filter(p => p.id !== topHeadline?.id).slice(0, 3); // Ambil 3 untuk sidebar jika tidak ada search

    return (
        <div className="min-h-screen bg-white font-sans selection:bg-blue-200 selection:text-blue-900">
            <Navbar isTransparent={false} />

            {/* Header Kategori / Search Bar (Ala Editorial) */}
            <div className="border-b border-slate-200 pt-28 pb-8">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-slate-900 uppercase tracking-tighter leading-none mb-2">
                            {searchQuery ? 'Hasil Pencarian' : 'News & Media'}
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide uppercase text-sm">
                            {searchQuery ? `Kata Kunci: "${searchQuery}"` : (filterCategory === 'Semua' ? 'Kabar Terbaru BEM & UKM' : `Kategori: ${filterCategory}`)}
                        </p>
                    </div>

                    <div className="w-full md:w-80 flex items-center bg-slate-50 border border-slate-200 p-1">
                        <Search size={18} className="text-slate-400 mx-3" />
                        <input
                            type="text"
                            placeholder="Cari berita..."
                            className="w-full bg-transparent border-none outline-none text-sm py-2"
                            value={searchQuery}
                            onChange={(e) => navigate(e.target.value ? `/news?search=${e.target.value}` : '/news')}
                        />
                        {searchQuery && (
                            <button onClick={clearSearch} className="p-2 text-slate-400 hover:text-red-500 transition-colors">
                                <XCircle size={16} />
                            </button>
                        )}
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
                {loading ? (
                    <>
                        <HeadlineSkeleton />
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 mt-12 border-t border-slate-200 pt-12">
                            {[1, 2, 3].map(i => <NewsSkeleton key={i} />)}
                        </div>
                    </>
                ) : (
                    <>
                        {/* MAIN EDITORIAL SECTION */}
                        {!searchQuery && topHeadline && (
                            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 mb-16">

                                {/* Berita Utama (Kiri/Besar) */}
                                <div
                                    className="lg:col-span-8 group cursor-pointer"
                                    onClick={() => navigate(`/news/${topHeadline.id}`)}
                                >
                                    <div className="relative overflow-hidden mb-6 aspect-video bg-slate-100">
                                        <div className="absolute top-4 left-4 z-10">
                                            <span className="bg-blue-600 text-white text-[10px] font-black uppercase tracking-widest px-3 py-1.5 flex items-center gap-2">
                                                <span className="w-1.5 h-1.5 bg-white rounded-full animate-pulse" /> SOROTAN UTAMA
                                            </span>
                                        </div>
                                        <img
                                            src={topHeadline.image_url}
                                            alt={topHeadline.title}
                                            onError={handleImageError}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                        />
                                    </div>
                                    <div className="flex items-center gap-3 text-xs font-bold text-blue-600 uppercase tracking-widest mb-3">
                                        <span>{topHeadline.ukm_name}</span>
                                        <span className="text-slate-300">•</span>
                                        <span className="text-slate-500">{new Date(topHeadline.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
                                    </div>
                                    <h2 className="text-3xl md:text-5xl font-black text-slate-900 leading-[1.1] mb-4 group-hover:text-blue-700 transition-colors">
                                        {topHeadline.title}
                                    </h2>
                                    <p className="text-slate-600 text-base md:text-lg font-serif line-clamp-3 leading-relaxed">
                                        {stripHtml(topHeadline.content)}
                                    </p>
                                </div>

                                {/* Berita Samping (Kanan) - Ala Koran */}
                                <div className="lg:col-span-4 flex flex-col border-t lg:border-t-0 lg:border-l border-slate-200 pt-8 lg:pt-0 lg:pl-8">
                                    <h3 className="font-black text-slate-900 uppercase tracking-widest text-xs mb-6 flex items-center justify-between">
                                        TERPOPULER <ArrowRight size={14} />
                                    </h3>

                                    <div className="flex flex-col gap-8">
                                        {subHeadlines.map((post, idx) => (
                                            <div
                                                key={post.id}
                                                onClick={() => navigate(`/news/${post.id}`)}
                                                className={`group cursor-pointer flex gap-4 ${idx !== subHeadlines.length - 1 ? 'border-b border-slate-100 pb-8' : ''}`}
                                            >
                                                <div className="w-24 h-24 shrink-0 bg-slate-100 overflow-hidden">
                                                    <img
                                                        src={post.image_url}
                                                        alt={post.title}
                                                        onError={handleImageError}
                                                        className="w-full h-full object-cover grayscale group-hover:grayscale-0 transition-all duration-500"
                                                    />
                                                </div>
                                                <div className="flex-1 flex flex-col justify-center">
                                                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest mb-1.5">
                                                        {post.ukm_name}
                                                    </span>
                                                    <h4 className="text-sm font-bold text-slate-900 leading-snug group-hover:text-blue-700 transition-colors line-clamp-3">
                                                        {post.title}
                                                    </h4>
                                                </div>
                                            </div>
                                        ))}
                                    </div>

                                    {/* Kotak Berlangganan (Aksen Visual) */}
                                    <div className="mt-auto pt-8">
                                        <div className="bg-blue-50 p-6 border border-blue-100">
                                            <h4 className="font-black text-blue-900 uppercase tracking-tight mb-2">Tetap Terhubung</h4>
                                            <p className="text-sm text-blue-800/70 mb-4 font-medium">Dapatkan info kegiatan dan berita BEM langsung di ujung jari Anda.</p>
                                            <button onClick={() => window.scrollTo(0, 0)} className="w-full bg-blue-600 text-white text-xs font-bold uppercase tracking-widest py-3 hover:bg-slate-900 transition-colors">
                                                Jelajahi SIAKSI
                                            </button>
                                        </div>
                                    </div>
                                </div>

                            </div>
                        )}

                        {/* GRID BERITA BAWAH (LATEST NEWS) */}
                        <div className="border-t-4 border-slate-900 pt-8 mt-12">
                            <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tighter mb-8">
                                {searchQuery ? 'Hasil Pencarian' : 'Semua Berita'}
                            </h3>

                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-8 gap-y-12">
                                <AnimatePresence mode='popLayout'>
                                    {gridPosts.map((post) => (
                                        <motion.div
                                            key={post.id}
                                            layout
                                            initial={{ opacity: 0, y: 20 }}
                                            whileInView={{ opacity: 1, y: 0 }}
                                            viewport={{ once: true }}
                                            className="group cursor-pointer flex flex-col"
                                            onClick={() => navigate(`/news/${post.id}`)}
                                        >
                                            <div className="aspect-[4/3] w-full overflow-hidden bg-slate-100 mb-4">
                                                <img
                                                    src={post.image_url}
                                                    alt={post.title}
                                                    loading="lazy"
                                                    onError={handleImageError}
                                                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                                                />
                                            </div>

                                            <div className="flex items-center justify-between mb-3 border-b border-slate-100 pb-3">
                                                <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">
                                                    {post.ukm_name}
                                                </span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider flex items-center gap-1">
                                                    <Clock size={10} /> {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                                </span>
                                            </div>

                                            <h3 className="text-lg font-black text-slate-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-3">
                                                {post.title}
                                            </h3>

                                            <p className="text-slate-500 text-sm font-serif line-clamp-3">
                                                {stripHtml(post.content)}
                                            </p>
                                        </motion.div>
                                    ))}
                                </AnimatePresence>
                            </div>

                            {displayPosts.length === 0 && (
                                <div className="py-24 text-center">
                                    <Search size={48} className="text-slate-200 mx-auto mb-4" />
                                    <h3 className="text-xl font-black text-slate-900 uppercase">Tidak Ada Berita</h3>
                                    <p className="text-slate-500 mt-2">Tidak menemukan artikel untuk pencarian ini.</p>
                                </div>
                            )}

                            {gridPosts.length < displayPosts.length - 1 && (
                                <div className="mt-16 text-center">
                                    <button
                                        onClick={() => setVisibleCount(prev => prev + 6)}
                                        className="px-8 py-3 border-2 border-slate-900 text-slate-900 text-xs font-black uppercase tracking-widest hover:bg-slate-900 hover:text-white transition-colors"
                                    >
                                        Muat Lebih Banyak
                                    </button>
                                </div>
                            )}
                        </div>
                    </>
                )}
            </div>

            {/* Footer Gelap ala Editorial */}
            <footer className="bg-slate-900 pt-20 pb-10 px-4 mt-24 border-t-[8px] border-blue-600">
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

export default NewsFeed;
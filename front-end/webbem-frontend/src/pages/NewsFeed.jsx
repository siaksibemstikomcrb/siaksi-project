import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Pin, Calendar, ArrowRight, Filter, ChevronLeft, ChevronRight, Search, XCircle } from 'lucide-react';
import api from '../api/axios';

// --- KOMPONEN KECIL: SKELETON LOADER ---
const NewsSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm h-full flex flex-col">
        <div className="h-52 bg-gray-200 animate-pulse" />
        <div className="p-6 flex-1 flex flex-col gap-3">
            <div className="h-4 w-1/3 bg-gray-200 animate-pulse rounded" />
            <div className="h-6 w-full bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-full bg-gray-200 animate-pulse rounded" />
            <div className="h-4 w-2/3 bg-gray-200 animate-pulse rounded" />
            <div className="mt-auto h-8 w-full bg-gray-200 animate-pulse rounded pt-4" />
        </div>
    </div>
);

const NewsFeed = () => {
    const navigate = useNavigate();
    const location = useLocation();
    const scrollRef = useRef(null);

    // State
    const [posts, setPosts] = useState([]);
    const [loading, setLoading] = useState(true);
    const [filterCategory, setFilterCategory] = useState('Semua');
    const [searchQuery, setSearchQuery] = useState(''); // Tambahan State Search
    const [visibleCount, setVisibleCount] = useState(6);

    // Helper: Strip HTML
    const stripHtml = (html) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    // Helper: Image Error Fallback
    const handleImageError = (e) => {
        e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; // Ganti dengan aset lokal placeholder kamu
    };

    // 1. Fetch Data
    useEffect(() => {
        const fetchPosts = async () => {
            setLoading(true);
            try {
                const res = await api.get('/posts/public');
                setPosts(res.data);
            } catch (err) {
                console.error("Failed to fetch news:", err);
            } finally {
                // Beri sedikit delay buatan agar skeleton terlihat smooth (opsional)
                setTimeout(() => setLoading(false), 500);
            }
        };
        fetchPosts();
    }, []);

    // 2. Handle URL Params (Category & Search)
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat = params.get('cat');
        const search = params.get('search'); // Tangkap param search

        if (cat) setFilterCategory(decodeURIComponent(cat));
        else setFilterCategory('Semua');

        if (search) setSearchQuery(decodeURIComponent(search));
        else setSearchQuery('');
        
        setVisibleCount(6); // Reset pagination saat filter berubah
    }, [location.search]);

// 3. Filtering Logic (Optimized with useMemo)
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            // Filter by Category
            const dbName = post.ukm_name ? post.ukm_name.toLowerCase().trim() : '';
            const filterName = filterCategory.toLowerCase().trim();

            const isCategoryMatch = 
                filterCategory === 'Semua' || 
                filterCategory === 'All' || 
                dbName.includes(filterName); // <--- KEMBALIKAN KE 'INCLUDES'

            // Filter by Search Query
            const query = searchQuery.toLowerCase();
            const isSearchMatch = 
                !searchQuery || 
                post.title.toLowerCase().includes(query) ||
                (post.content && stripHtml(post.content).toLowerCase().includes(query)); // Tambahkan check post.content

            return isCategoryMatch && isSearchMatch;
        });
    }, [posts, filterCategory, searchQuery]);

    const pinnedPosts = useMemo(() => filteredPosts.filter(p => p.is_pinned), [filteredPosts]);
    
    // Sort postingan terbaru dulu (Opsional, tergantung API sudah sort atau belum)
    const displayPosts = filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Scroll Handler for Pinned Section
    const scroll = (direction) => {
        if(scrollRef.current){
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    // Clear Search Handler
    const clearSearch = () => {
        navigate('/news'); // Reset URL
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-200 selection:text-blue-900">
            <Navbar isTransparent={false} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-12">
                
                {/* Header Section dengan Info Filter */}
                <div className="mb-8">
                    <h2 className="text-3xl font-bold text-gray-900 flex items-center gap-2 mb-2">
                        {searchQuery ? (
                            <>Hasil Pencarian: "<span className="text-blue-600 italic">{searchQuery}</span>"</>
                        ) : (
                            <>{filterCategory === 'Semua' ? 'Berita Terkini' : `Kabar ${filterCategory}`}</>
                        )}
                    </h2>
                    
                    {/* Breadcrumb / Active Filters */}
                    <div className="flex flex-wrap gap-2 items-center text-sm text-gray-500">
                        <span>Menampilkan {filteredPosts.length} artikel</span>
                        {(filterCategory !== 'Semua' || searchQuery) && (
                            <button 
                                onClick={clearSearch}
                                className="flex items-center gap-1 text-red-500 hover:text-red-700 font-medium ml-2 transition-colors"
                            >
                                <XCircle size={14}/> Reset Filter
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    // --- IMPROVEMENT: SKELETON LOADING ---
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => <NewsSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        {/* PINNED SECTION (Hanya muncul jika tidak sedang searching & di kategori Semua) */}
                        {!searchQuery && filterCategory === 'Semua' && pinnedPosts.length > 0 && (
                            <div className="mb-16 relative group">
                                <div className="flex items-center gap-2 mb-4">
                                    <Pin size={20} className="text-red-600 fill-red-600"/>
                                    <h3 className="font-bold text-gray-800 uppercase tracking-wider text-sm">Highlight</h3>
                                </div>

                                {/* Tombol Navigasi Carousel */}
                                {pinnedPosts.length > 1 && (
                                    <>
                                        <button onClick={() => scroll('left')} className="absolute left-4 top-[55%] -translate-y-1/2 z-30 bg-white/20 hover:bg-white/90 hover:text-black backdrop-blur-md p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-white/20">
                                            <ChevronLeft size={24}/>
                                        </button>
                                        <button onClick={() => scroll('right')} className="absolute right-4 top-[55%] -translate-y-1/2 z-30 bg-white/20 hover:bg-white/90 hover:text-black backdrop-blur-md p-3 rounded-full text-white transition-all opacity-0 group-hover:opacity-100 shadow-xl border border-white/20">
                                            <ChevronRight size={24}/>
                                        </button>
                                    </>
                                )}

                                <div 
                                    ref={scrollRef}
                                    className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar rounded-3xl shadow-2xl"
                                >
                                    {pinnedPosts.map((post) => (
                                        <div 
                                            key={post.id} 
                                            className="min-w-full relative h-[450px] md:h-[550px] snap-center cursor-pointer shrink-0"
                                            onClick={() => navigate(`/news/${post.id}`)}
                                        >
                                            {/* Gradient Overlay yang lebih smooth */}
                                            <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent z-10" />
                                            
                                            <img 
                                                src={post.image_url} 
                                                alt={post.title} 
                                                onError={handleImageError}
                                                className="w-full h-full object-cover" 
                                            />
                                            
                                            <div className="absolute bottom-0 left-0 w-full p-6 md:p-12 z-20">
                                                <span className="inline-block bg-blue-600 text-white text-xs font-bold px-3 py-1 rounded-full mb-3 shadow-lg">
                                                    {post.ukm_name}
                                                </span>
                                                <h1 className="text-2xl md:text-5xl font-bold text-white mb-3 leading-tight max-w-4xl line-clamp-2 hover:underline decoration-blue-500 underline-offset-4">
                                                    {post.title}
                                                </h1>
                                                <p className="text-gray-300 line-clamp-2 max-w-2xl text-sm md:text-base">
                                                    {stripHtml(post.content)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* EMPTY STATE */}
                        {displayPosts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-24 bg-white rounded-3xl border-2 border-dashed border-gray-200">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <Search size={40} className="text-gray-400"/>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Tidak ada berita ditemukan</h3>
                                <p className="text-gray-500 text-sm mt-1">Coba kata kunci lain atau ubah kategori filter.</p>
                                <button onClick={clearSearch} className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-full text-sm font-bold hover:bg-blue-700 transition-all">
                                    Lihat Semua Berita
                                </button>
                            </div>
                        )}

                        {/* GRID POSTS */}
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <AnimatePresence>
                                {displayPosts.slice(0, visibleCount).map((post, idx) => (
                                    <motion.div 
                                        key={post.id}
                                        layout // Animasi layout saat filtering
                                        initial={{ opacity: 0, scale: 0.9 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        transition={{ duration: 0.3 }}
                                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col group h-full"
                                        onClick={() => navigate(`/news/${post.id}`)}
                                    >
                                        <div className="h-52 overflow-hidden relative shrink-0">
                                            {/* Badge UKM */}
                                            <span className="absolute top-3 left-3 bg-white/95 backdrop-blur text-[10px] font-bold px-3 py-1 rounded-full z-10 text-gray-800 shadow-sm border border-gray-100">
                                                {post.ukm_name}
                                            </span>
                                            <img 
                                                src={post.image_url} 
                                                alt={post.title} 
                                                loading="lazy" // Optimization
                                                onError={handleImageError}
                                                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" 
                                            />
                                        </div>
                                        
                                        <div className="p-6 flex-1 flex flex-col">
                                            <div className="flex items-center gap-2 text-xs text-gray-400 mb-3 font-medium">
                                                <Calendar size={14} className="text-blue-500"/> 
                                                {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' })}
                                            </div>
                                            
                                            <h3 className="text-lg font-bold text-gray-900 mb-3 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            
                                            <p className="text-gray-500 text-sm line-clamp-3 mb-6 flex-1 leading-relaxed">
                                                {stripHtml(post.content)}
                                            </p>
                                            
                                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center mt-auto">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-gradient-to-br from-blue-500 to-indigo-600 rounded-full flex items-center justify-center text-[10px] font-bold text-white shadow-sm">
                                                        {post.ukm_name ? post.ukm_name.charAt(0) : 'A'}
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-medium">Admin</span>
                                                </div>
                                                <span className="text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                    Baca <ArrowRight size={14}/>
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* LOAD MORE BUTTON */}
                        {displayPosts.length > visibleCount && (
                            <div className="mt-16 flex justify-center">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 6)}
                                    className="px-8 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all flex items-center gap-2"
                                >
                                    Muat Lebih Banyak <ChevronDownIcon />
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

// Ikon kecil tambahan
const ChevronDownIcon = () => (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round">
        <path d="m6 9 6 6 6-6"/>
    </svg>
);

export default NewsFeed;
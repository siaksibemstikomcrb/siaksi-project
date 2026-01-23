import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Navbar from '../components/Navbar';
import { Pin, Calendar, ArrowRight, Search, XCircle, ChevronLeft, ChevronRight } from 'lucide-react';
import api from '../api/axios';

// --- SKELETON LOADER (RESPONSIVE) ---
const NewsSkeleton = () => (
    <div className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm flex flex-col h-full animate-pulse">
        <div className="aspect-video w-full bg-gray-200" />
        <div className="p-5 flex-1 flex flex-col gap-3">
            <div className="h-4 w-1/3 bg-gray-200 rounded" />
            <div className="h-6 w-full bg-gray-200 rounded" />
            <div className="h-4 w-full bg-gray-200 rounded" />
            <div className="mt-auto h-8 w-full bg-gray-200 rounded pt-4" />
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
    const [searchQuery, setSearchQuery] = useState(''); 
    const [visibleCount, setVisibleCount] = useState(6);

    const stripHtml = (html) => {
        if (!html) return "";
        const doc = new DOMParser().parseFromString(html, 'text/html');
        return doc.body.textContent || "";
    };

    const handleImageError = (e) => {
        e.target.src = 'https://via.placeholder.com/600x400?text=No+Image'; 
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
                setLoading(false);
            }
        };
        fetchPosts();
    }, []);

    // 2. Handle URL Params
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        const cat = params.get('cat');
        const search = params.get('search'); 

        setFilterCategory(cat ? decodeURIComponent(cat) : 'Semua');
        setSearchQuery(search ? decodeURIComponent(search) : '');
        setVisibleCount(6); 
    }, [location.search]);

    // 3. Filtering Logic
    const filteredPosts = useMemo(() => {
        return posts.filter(post => {
            const dbName = post.ukm_name ? post.ukm_name.toLowerCase().trim() : '';
            const filterName = filterCategory.toLowerCase().trim();

            const isCategoryMatch = 
                filterCategory === 'Semua' || 
                filterCategory === 'All' || 
                dbName.includes(filterName); 

            const query = searchQuery.toLowerCase();
            const isSearchMatch = 
                !searchQuery || 
                post.title.toLowerCase().includes(query) ||
                (post.content && stripHtml(post.content).toLowerCase().includes(query)); 

            return isCategoryMatch && isSearchMatch;
        });
    }, [posts, filterCategory, searchQuery]);

    const pinnedPosts = useMemo(() => filteredPosts.filter(p => p.is_pinned), [filteredPosts]);
    const displayPosts = filteredPosts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

    // Scroll Handler
    const scroll = (direction) => {
        if(scrollRef.current){
            const { current } = scrollRef;
            const scrollAmount = direction === 'left' ? -current.offsetWidth : current.offsetWidth;
            current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
        }
    };

    const clearSearch = () => {
        navigate('/news'); 
    };

    return (
        <div className="min-h-screen bg-gray-50 font-sans selection:bg-blue-200 selection:text-blue-900 pb-24">
            <Navbar isTransparent={false} />
            
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-24 md:pt-32">
                
                {/* HEADER SECTION */}
                <div className="mb-8 md:mb-12">
                    <h2 className="text-2xl md:text-4xl font-black text-gray-900 flex flex-col md:flex-row md:items-center gap-2 mb-3 leading-tight">
                        {searchQuery ? (
                            <>
                                <span className="text-gray-400 font-medium text-lg">Pencarian:</span> 
                                <span className="italic text-blue-600">"{searchQuery}"</span>
                            </>
                        ) : (
                            <>{filterCategory === 'Semua' ? 'Berita & Kegiatan' : `Kabar ${filterCategory}`}</>
                        )}
                    </h2>
                    
                    <div className="flex flex-wrap gap-3 items-center text-sm text-gray-500 font-medium">
                        <span className="bg-white px-3 py-1 rounded-full border border-gray-200 shadow-sm">
                            {filteredPosts.length} Artikel Ditemukan
                        </span>
                        {(filterCategory !== 'Semua' || searchQuery) && (
                            <button 
                                onClick={clearSearch}
                                className="flex items-center gap-1 text-red-600 bg-red-50 px-3 py-1 rounded-full hover:bg-red-100 transition-colors"
                            >
                                <XCircle size={14}/> Hapus Filter
                            </button>
                        )}
                    </div>
                </div>

                {loading ? (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                        {[1, 2, 3, 4, 5, 6].map(i => <NewsSkeleton key={i} />)}
                    </div>
                ) : (
                    <>
                        {/* --- PINNED / HIGHLIGHT SECTION --- */}
                        {!searchQuery && filterCategory === 'Semua' && pinnedPosts.length > 0 && (
                            <div className="mb-12 md:mb-16 relative group">
                                <div className="flex items-center gap-2 mb-4 md:mb-6 pl-1">
                                    <div className="bg-red-100 p-1.5 rounded-lg">
                                        <Pin size={18} className="text-red-600 fill-red-600"/>
                                    </div>
                                    <h3 className="font-extrabold text-gray-800 uppercase tracking-widest text-xs md:text-sm">Highlight</h3>
                                </div>

                                {/* Navigation Arrows (Desktop Only) */}
                                {pinnedPosts.length > 1 && (
                                    <>
                                        <button onClick={() => scroll('left')} className="hidden md:flex absolute -left-5 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-xl border border-gray-100 transition-all opacity-0 group-hover:opacity-100 hover:scale-110">
                                            <ChevronLeft size={24}/>
                                        </button>
                                        <button onClick={() => scroll('right')} className="hidden md:flex absolute -right-5 top-1/2 -translate-y-1/2 z-30 bg-white hover:bg-gray-50 text-gray-800 p-3 rounded-full shadow-xl border border-gray-100 transition-all opacity-0 group-hover:opacity-100 hover:scale-110">
                                            <ChevronRight size={24}/>
                                        </button>
                                    </>
                                )}

                                {/* Carousel Container */}
                                <div 
                                    ref={scrollRef}
                                    className="flex overflow-x-auto snap-x snap-mandatory no-scrollbar gap-4 md:gap-6 pb-4"
                                >
                                    {pinnedPosts.map((post) => (
                                        <div 
                                            key={post.id} 
                                            className="min-w-[85vw] md:min-w-[calc(100%-100px)] lg:min-w-[800px] relative h-[250px] sm:h-[350px] md:h-[450px] snap-center cursor-pointer shrink-0 rounded-2xl md:rounded-3xl overflow-hidden shadow-lg hover:shadow-2xl transition-all duration-500 group/card"
                                            onClick={() => navigate(`/news/${post.id}`)}
                                        >
                                            <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent z-10" />
                                            <img 
                                                src={post.image_url} 
                                                alt={post.title} 
                                                onError={handleImageError}
                                                className="w-full h-full object-cover group-hover/card:scale-105 transition-transform duration-700" 
                                            />
                                            
                                            <div className="absolute bottom-0 left-0 w-full p-5 md:p-10 z-20 flex flex-col justify-end h-full">
                                                <span className="self-start bg-blue-600/90 backdrop-blur-sm text-white text-[10px] md:text-xs font-bold px-3 py-1 rounded-full mb-2 md:mb-4 shadow-sm border border-white/10">
                                                    {post.ukm_name}
                                                </span>
                                                <h1 className="text-xl sm:text-2xl md:text-4xl font-bold text-white mb-2 md:mb-3 leading-tight line-clamp-2 md:line-clamp-2">
                                                    {post.title}
                                                </h1>
                                                <p className="text-gray-300 text-xs md:text-base line-clamp-2 max-w-2xl hidden sm:block">
                                                    {stripHtml(post.content)}
                                                </p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* --- REGULAR GRID --- */}
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                            <AnimatePresence mode='popLayout'>
                                {displayPosts.slice(0, visibleCount).map((post) => (
                                    <motion.div 
                                        key={post.id}
                                        layout
                                        initial={{ opacity: 0, scale: 0.95 }}
                                        whileInView={{ opacity: 1, scale: 1 }}
                                        viewport={{ once: true }}
                                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full group"
                                        onClick={() => navigate(`/news/${post.id}`)}
                                    >
                                        <div className="aspect-video overflow-hidden relative shrink-0">
                                            <span className="absolute top-3 left-3 bg-white/95 backdrop-blur-sm text-[10px] font-bold px-2 py-1 rounded-md z-10 text-gray-800 shadow-sm">
                                                {post.ukm_name}
                                            </span>
                                            <img 
                                                src={post.image_url} 
                                                alt={post.title} 
                                                loading="lazy"
                                                onError={handleImageError}
                                                className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" 
                                            />
                                        </div>
                                        
                                        <div className="p-5 flex-1 flex flex-col">
                                            <div className="flex items-center gap-2 text-[10px] md:text-xs text-gray-400 mb-2 font-bold uppercase tracking-wide">
                                                <Calendar size={12} className="text-blue-500"/> 
                                                {new Date(post.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </div>
                                            
                                            <h3 className="text-base md:text-lg font-bold text-gray-900 mb-2 leading-snug group-hover:text-blue-600 transition-colors line-clamp-2">
                                                {post.title}
                                            </h3>
                                            
                                            <p className="text-gray-500 text-xs md:text-sm line-clamp-3 mb-4 flex-1 leading-relaxed">
                                                {stripHtml(post.content)}
                                            </p>
                                            
                                            <div className="pt-4 border-t border-gray-50 flex justify-between items-center mt-auto">
                                                <div className="flex items-center gap-2">
                                                    <div className="w-6 h-6 bg-gray-100 rounded-full flex items-center justify-center text-[10px] font-bold text-gray-600">
                                                        {post.ukm_name ? post.ukm_name.charAt(0) : 'A'}
                                                    </div>
                                                    <span className="text-xs text-gray-500 font-medium">Admin</span>
                                                </div>
                                                <span className="text-blue-600 text-xs font-bold flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                                    Baca <ArrowRight size={12}/>
                                                </span>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </AnimatePresence>
                        </div>

                        {/* EMPTY STATE */}
                        {displayPosts.length === 0 && (
                            <div className="flex flex-col items-center justify-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-200 text-center px-4">
                                <div className="bg-gray-50 p-4 rounded-full mb-4">
                                    <Search size={32} className="text-gray-400"/>
                                </div>
                                <h3 className="text-lg font-bold text-gray-900">Tidak ada berita ditemukan</h3>
                                <p className="text-gray-500 text-sm mt-1 mb-6">Coba kata kunci lain atau reset filter.</p>
                                <button onClick={clearSearch} className="px-6 py-2.5 bg-blue-600 text-white rounded-xl text-sm font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-200">
                                    Reset Pencarian
                                </button>
                            </div>
                        )}

                        {/* LOAD MORE */}
                        {displayPosts.length > visibleCount && (
                            <div className="mt-12 flex justify-center">
                                <button 
                                    onClick={() => setVisibleCount(prev => prev + 6)}
                                    className="px-8 py-3 bg-white border border-gray-200 rounded-full text-sm font-bold text-gray-600 hover:bg-gray-50 hover:text-blue-600 hover:border-blue-200 shadow-sm transition-all flex items-center gap-2 active:scale-95"
                                >
                                    Muat Lebih Banyak
                                </button>
                            </div>
                        )}
                    </>
                )}
            </div>
        </div>
    );
};

export default NewsFeed;
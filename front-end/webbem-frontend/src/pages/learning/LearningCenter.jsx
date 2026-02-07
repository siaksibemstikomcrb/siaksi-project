import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { 
    Play, Clock, Search, Loader2, Zap, 
    ChevronRight, FolderOpen, ArrowLeft 
} from 'lucide-react';
import api from '../../api/axios';

const LearningCenter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  
  // Ambil parameter dari URL
  const activeCategory = queryParams.get('category'); // Slug kategori aktif
  const searchQuery = queryParams.get('search')?.toLowerCase() || "";
  
  const [videos, setVideos] = useState([]);
  const [categories, setCategories] = useState([]); 
  const [loading, setLoading] = useState(true);
  const [searchInput, setSearchInput] = useState(searchQuery);

  // 1. Fetch Struktur Kategori (Tree)
  useEffect(() => {
    const fetchCategories = async () => {
        try {
            const res = await api.get('/learning/categories');
            setCategories(res.data);
        } catch (err) {
            console.error("Gagal load kategori:", err);
        }
    };
    fetchCategories();
  }, []);

  // 2. Fetch Video
  useEffect(() => {
    const fetchVideos = async () => {
      setLoading(true);
      try {
        const res = await api.get('/learning', {
          params: {
            category: activeCategory === 'all' ? null : activeCategory,
            search: searchQuery
          }
        });
        setVideos(res.data);
      } catch (err) {
        console.error("Gagal load video:", err);
      } finally {
        setLoading(false);
      }
    };
    fetchVideos();
  }, [activeCategory, searchQuery]);

const handleSearchSubmit = (e) => {
      e.preventDefault();
      // PERBAIKAN: Tambahkan encodeURIComponent di sini juga
      navigate(`/learning?category=${activeCategory || 'all'}&search=${encodeURIComponent(searchInput)}`);
  };

  // --- LOGIKA RECURSIVE CATEGORY FINDER ---
  const findCategoryNode = (nodes, targetSlug) => {
      for (const node of nodes) {
          if (node.slug === targetSlug) return node;
          if (node.children && node.children.length > 0) {
              const found = findCategoryNode(node.children, targetSlug);
              if (found) return found;
          }
      }
      return null;
  };

  const activeNode = activeCategory && activeCategory !== 'all' 
      ? findCategoryNode(categories, activeCategory) 
      : null;

  let subCategoriesToShow = [];
  let parentLabel = "Filter";

  if (activeNode) {
      if (activeNode.children && activeNode.children.length > 0) {
          // Punya anak -> Tampilkan anak
          subCategoriesToShow = activeNode.children;
          parentLabel = `Channel di ${activeNode.name}`;
      } else {
          // Tidak punya anak -> Cari parent agar bisa menampilkan saudara
          const findParent = (nodes, targetId) => {
              for (const node of nodes) {
                  if (node.children?.some(child => child.id === targetId)) return node;
                  if (node.children) {
                      const found = findParent(node.children, targetId);
                      if (found) return found;
                  }
              }
              return null;
          };
          const parentNode = findParent(categories, activeNode.id);
          if (parentNode) {
              subCategoriesToShow = parentNode.children;
              parentLabel = `Channel Lain di ${parentNode.name}`;
          }
      }
  }

  return (
    <div className="min-h-screen bg-[#FDFBF7] font-sans pb-20">
      
      {/* HERO BANNER */}
      <div className="relative bg-[#0a0a0a] text-white overflow-hidden border-b border-yellow-900/30">
          <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-yellow-500/10 rounded-full blur-[100px] -mr-32 -mt-32 pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-96 h-96 bg-yellow-600/5 rounded-full blur-[80px] -ml-20 -mb-20 pointer-events-none"></div>
          <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.03)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.03)_1px,transparent_1px)] bg-[size:40px_40px] pointer-events-none"></div>

          <div className="max-w-7xl mx-auto px-4 md:px-6 pt-16 pb-20 relative z-10">
              <div className="max-w-3xl">
                  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/40 text-yellow-400 text-xs font-bold mb-6 backdrop-blur-sm">
                      <Zap size={14} fill="currentColor" /> <span>SILearning Platform Belajar Mahasiswa</span>
                  </div>
                  <h1 className="text-4xl md:text-6xl font-black mb-6 leading-tight tracking-tight">
                      Tingkatkan Skill,<br/>
                      <span className="text-transparent bg-clip-text bg-gradient-to-r from-yellow-300 via-yellow-400 to-yellow-600">Raih Masa Depan.</span>
                  </h1>
                  <p className="text-gray-400 text-base md:text-lg mb-8 leading-relaxed max-w-lg font-medium">
                      Belajar lebih mudah dan terstruktur dengan SILearning, kami mengumpulkan Playlist yang akan membuat kamu lebih mudah mau belajar apa...
                  </p>
                  <form onSubmit={handleSearchSubmit} className="relative max-w-lg group">
                      <div className="absolute inset-y-0 left-4 flex items-center pointer-events-none">
                          <Search className="text-gray-500 group-focus-within:text-yellow-500 transition-colors" size={20} />
                      </div>
                      <input 
                          type="text" 
                          placeholder="Cari materi yang ingin kamu pelajari..."
                          className="w-full pl-12 pr-4 py-4 bg-white/5 border border-white/10 rounded-2xl text-white placeholder-gray-500 focus:bg-black/40 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none backdrop-blur-md transition-all shadow-lg"
                          value={searchInput}
                          onChange={(e) => setSearchInput(e.target.value)}
                      />
                  </form>
              </div>
          </div>
      </div>

      {/* --- STICKY NAVIGATION (FIXED Z-INDEX) --- */}
      {/* UPDATE: Mengubah z-30 menjadi z-10 agar tertutup oleh Sidebar (z-30) */}
      <div className="sticky top-0 z-10 bg-[#FDFBF7]/95 backdrop-blur-md border-b border-gray-200 shadow-sm transition-all">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
           
           {/* Level 1: Induk */}
           <div className="flex items-center gap-8 overflow-x-auto no-scrollbar py-4">
              <button
                  onClick={() => navigate('/learning')}
                  className={`whitespace-nowrap pb-2 text-sm font-bold border-b-2 transition-all ${
                      !activeCategory || activeCategory === 'all' 
                      ? 'border-yellow-500 text-black' 
                      : 'border-transparent text-gray-500 hover:text-black'
                  }`}
              >
                  Semua Topik
              </button>
              
              {categories.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => navigate(`/learning?category=${cat.slug}`)}
                  className={`whitespace-nowrap pb-2 text-sm font-bold border-b-2 transition-all flex items-center gap-2 ${
                    (activeCategory === cat.slug || findCategoryNode([cat], activeCategory))
                      ? 'border-yellow-500 text-black'
                      : 'border-transparent text-gray-500 hover:text-black'
                  }`}
                >
                  {cat.name}
                </button>
              ))}
           </div>

           {/* Level 2: Sub-Kategori */}
           {subCategoriesToShow.length > 0 && (
               <div className="flex items-center gap-3 pb-4 overflow-x-auto no-scrollbar animate-in slide-in-from-top-2">
                   {activeNode && activeNode.children?.length > 0 && (
                       <div className="text-[10px] font-black text-gray-400 uppercase tracking-widest mr-2 flex items-center gap-1 shrink-0">
                           <ChevronRight size={12}/> {parentLabel}:
                       </div>
                   )}

                   {subCategoriesToShow.map(child => (
                       <button
                           key={child.id}
                           onClick={() => navigate(`/learning?category=${child.slug}`)}
                           className={`px-4 py-1.5 rounded-full text-xs font-bold transition-all border shrink-0 ${
                               activeCategory === child.slug
                                   ? 'bg-yellow-400 text-black border-yellow-400 shadow-md shadow-yellow-200'
                                   : 'bg-white text-gray-600 border-gray-200 hover:border-yellow-400 hover:text-black'
                           }`}
                       >
                           {child.name}
                       </button>
                   ))}
               </div>
           )}
        </div>
      </div>

      {/* CONTENT GRID */}
      <div className="max-w-7xl mx-auto px-4 md:px-6 py-8">
        {loading ? (
          <div className="flex flex-col items-center justify-center py-24">
             <Loader2 size={40} className="animate-spin text-yellow-500 mb-4" />
             <p className="text-gray-400 font-medium">Sedang memuat materi...</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
             {videos.length > 0 ? (
               videos.map((video) => (
                  <div 
                     key={video.id} 
                     onClick={() => navigate(`/learning/nonton/${video.id}`, { state: { videoData: video } })}
                     className="group bg-white rounded-2xl p-3 border border-gray-100 shadow-sm hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col h-full"
                  >
                     <div className="relative aspect-video rounded-xl overflow-hidden mb-4 bg-gray-100 shrink-0">
                        <img 
                           src={video.thumbnail_url} 
                           alt={video.title} 
                           className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                        <div className="absolute inset-0 bg-black/10 group-hover:bg-black/0 transition-colors" />
                        <div className="absolute bottom-2 right-2 bg-black/80 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1 border border-white/10">
                           <Clock size={10} className="text-yellow-400" /> {video.duration || '00:00'}
                        </div>
                        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                            <div className="w-12 h-12 bg-yellow-400 backdrop-blur-sm rounded-full flex items-center justify-center text-black shadow-lg shadow-black/20 transform scale-75 group-hover:scale-100 transition-transform">
                                <Play size={20} fill="currentColor" className="ml-1" />
                            </div>
                        </div>
                     </div>

                     <div className="px-2 pb-2 flex flex-col flex-1">
                        <div className="flex items-center gap-2 mb-3">
                           <span className="px-2.5 py-0.5 rounded text-[10px] font-extrabold uppercase tracking-wide border bg-gray-100 text-gray-600 border-gray-200 group-hover:bg-yellow-50 group-hover:text-yellow-700 group-hover:border-yellow-200 transition-colors">
                              {video.category_name || 'Umum'}
                           </span>
                        </div>
                        <h3 className="font-bold text-gray-900 leading-snug mb-2 line-clamp-2 group-hover:text-yellow-600 transition-colors flex-1 text-[15px]">
                           {video.title}
                        </h3>
                        <div className="flex items-center gap-3 text-xs text-gray-500 font-medium mt-auto pt-4 border-t border-dashed border-gray-100">
                           <div className="w-6 h-6 rounded-full bg-gray-900 text-white flex items-center justify-center text-[10px] font-bold shrink-0 shadow-md shadow-gray-200">
                              {video.channel_name ? video.channel_name.charAt(0) : 'A'}
                           </div>
                           <span className="truncate">{video.channel_name || 'Admin'}</span>
                        </div>
                     </div>
                  </div>
               ))
             ) : (
               <div className="col-span-full py-24 text-center">
                  <div className="bg-white p-6 rounded-full w-24 h-24 flex items-center justify-center mx-auto mb-6 border border-gray-100 shadow-[0_0_40px_-10px_rgba(0,0,0,0.05)]">
                    <FolderOpen size={40} className="text-gray-300" />
                  </div>
                  <h3 className="text-gray-900 font-black text-xl mb-2">Materi tidak ditemukan</h3>
                  <p className="text-gray-500 text-sm max-w-xs mx-auto leading-relaxed">
                    Belum ada video di kategori ini atau hasil pencarian kosong.
                  </p>
                  {activeCategory && (
                      <button 
                        onClick={() => navigate('/learning')}
                        className="mt-8 px-6 py-2.5 bg-black text-white rounded-xl text-sm font-bold hover:bg-gray-800 transition-all shadow-lg shadow-gray-200"
                      >
                        Lihat Semua Topik
                      </button>
                  )}
               </div>
             )}
          </div>
        )}
      </div>
    </div>
  );
};

export default LearningCenter;
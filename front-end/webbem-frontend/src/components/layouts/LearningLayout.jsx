import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Search, LogIn, Code, Sprout, Brain, Scale, Languages,
  Layers, Zap, ChevronDown, LayoutGrid 
} from 'lucide-react';
import api from '../../api/axios';

const LearningLayout = () => {
  const [searchQuery, setSearchQuery] = useState("");
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 1024);
  const [categories, setCategories] = useState([]); 
  const [expandedIds, setExpandedIds] = useState([]); 
  
  const navigate = useNavigate();
  const location = useLocation();
  
  // Ambil category slug dari URL
  const currentSlug = new URLSearchParams(location.search).get('category');

  // 1. Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // 2. Fetch Kategori & Auto Expand (VERSI FIX ANTI-CRASH)
  useEffect(() => {
    const fetchCategories = async () => {
      try {
        const res = await api.get('/learning/categories');
        setCategories(res.data);
        
        // --- PERBAIKAN PENTING DI SINI ---
        // Jangan jalankan logika expand jika category='all' atau kosong
        if (currentSlug && currentSlug !== 'all') {
            const path = findPathToSlug(res.data, currentSlug);
            
            // Cek apakah path ditemukan (tidak null) & berbentuk array
            if (path && Array.isArray(path)) {
                setExpandedIds(prev => [...new Set([...prev, ...path])]);
            }
        }
        // ---------------------------------

      } catch (err) {
        console.error("Gagal load kategori sidebar", err);
      }
    };
    fetchCategories();
  }, [currentSlug]);

  // Helper: Cari path ID dari root sampai ke slug target
  const findPathToSlug = (nodes, slug, path = []) => {
      for (const node of nodes) {
          if (node.slug === slug) return [...path, node.id];
          if (node.children) {
              const found = findPathToSlug(node.children, slug, [...path, node.id]);
              if (found) return found;
          }
      }
      return null;
  };

const handleSearch = (e) => {
    e.preventDefault();
    // PERBAIKAN: Tambahkan encodeURIComponent agar tanda '+' terbaca
    navigate(`/learning?category=all&search=${encodeURIComponent(searchQuery)}`);
  };

  const toggleExpand = (e, id) => {
      e.stopPropagation();
      e.preventDefault();
      setExpandedIds(prev => 
          prev.includes(id) ? prev.filter(i => i !== id) : [...prev, id]
      );
  };

  const renderCategoryTree = (nodes, level = 0) => {
      return nodes.map(node => {
          const hasChildren = node.children && node.children.length > 0;
          const isExpanded = expandedIds.includes(node.id);
          const isActive = currentSlug === node.slug;
          
          return (
              <div key={node.id} className="select-none">
                  <div 
                      className={`
                          flex items-center justify-between px-3 py-2.5 rounded-xl cursor-pointer transition-all mb-1
                          ${isActive 
                              ? 'bg-yellow-500 text-black font-bold shadow-lg shadow-yellow-500/20' 
                              : 'text-gray-400 hover:bg-white/5 hover:text-white font-medium'
                          }
                      `}
                      style={{ paddingLeft: `${level * 16 + 12}px` }} 
                      onClick={(e) => { 
                          if (hasChildren && !isActive) {
                              toggleExpand(e, node.id); 
                          } else {
                              navigate(`/learning?category=${node.slug}`);
                              if(window.innerWidth < 1024) setIsSidebarOpen(false);
                          }
                      }}
                  >
                      <div className="flex items-center gap-3 overflow-hidden">
                          {level === 0 && (
                              <span className={isActive ? 'text-black' : 'text-gray-500'}>
                                  {getCategoryIcon(node.slug)}
                              </span>
                          )}
                          <span className="truncate text-sm">{node.name}</span>
                      </div>

                      {hasChildren && (
                          <button 
                              onClick={(e) => toggleExpand(e, node.id)}
                              className={`p-1 rounded-md hover:bg-black/20 transition-transform ${isExpanded ? 'rotate-180' : ''}`}
                          >
                              <ChevronDown size={14} />
                          </button>
                      )}
                  </div>

                  {hasChildren && isExpanded && (
                      <div className="animate-in slide-in-from-top-2 fade-in duration-200">
                          {renderCategoryTree(node.children, level + 1)}
                      </div>
                  )}
              </div>
          );
      });
  };

  const getCategoryIcon = (slug) => {
    if(slug.includes('coding') || slug.includes('dev')) return <Code size={18} />;
    if(slug.includes('tani') || slug.includes('agro')) return <Sprout size={18} />;
    if(slug.includes('soft') || slug.includes('skill')) return <Brain size={18} />;
    if(slug.includes('politik') || slug.includes('sosial')) return <Scale size={18} />;
    if(slug.includes('bahasa')) return <Languages size={18} />;
    return <Layers size={18} />;
  };

  return (
    <div className="flex h-screen bg-[#0a0a0a] font-sans text-gray-300 overflow-hidden selection:bg-yellow-500 selection:text-black">
      
      {/* Mobile Overlay */}
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/80 z-20 lg:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      {/* --- SIDEBAR --- */}
      <aside 
        className={`
          fixed lg:relative z-30 h-full bg-[#050505] border-r border-white/10 
          transition-all duration-300 ease-in-out flex flex-col
          w-72 flex-shrink-0 
          ${isSidebarOpen ? 'translate-x-0' : '-translate-x-full lg:w-0 lg:translate-x-0 lg:hidden'}
        `}
      >
        <div className="h-20 flex items-center justify-between px-6 border-b border-white/5 shrink-0">
          <Link to="/learning" className="flex items-center gap-3 group">
            <div className="bg-yellow-500 p-1.5 rounded-lg text-black group-hover:rotate-12 transition-transform shadow-[0_0_15px_rgba(234,179,8,0.4)]">
                <Zap size={22} fill="currentColor" />
            </div>
            <div className="flex flex-col">
                <h1 className="text-lg font-black text-white tracking-tight leading-none">
                SI <span className="text-yellow-500">Learning</span>
                </h1>
                <span className="text-[10px] text-gray-500 font-bold tracking-widest mt-0.5">LEARNING CENTER</span>
            </div>
          </Link>
          <button onClick={() => setIsSidebarOpen(false)} className="lg:hidden text-gray-500 hover:text-red-500 transition-colors">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 custom-scrollbar">
          
          <div className="mb-6">
              <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3">Menu Utama</p>
              
              <Link 
                to="/learning"
                onClick={() => window.innerWidth < 1024 && setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-bold transition-all ${
                !location.search.includes('category=') || location.search.includes('category=all')
                    ? 'bg-yellow-500 text-black shadow-lg shadow-yellow-900/20' 
                    : 'text-gray-400 hover:bg-white/5 hover:text-white'
                }`}
              >
                <LayoutGrid size={18} /> Semua Topik
              </Link>
          </div>

          <div>
              <p className="px-3 text-[10px] font-bold text-gray-500 uppercase tracking-widest mb-3 flex items-center justify-between">
                  Kategori Belajar
                  <span className="bg-white/10 text-white px-1.5 py-0.5 rounded text-[9px]">{categories.length}</span>
              </p>
              
              <div className="space-y-0.5">
                  {renderCategoryTree(categories)}
              </div>
          </div>

        </nav>

        <div className="p-4 border-t border-white/5 bg-[#080808]">
            <Link to="/" className="flex items-center justify-center gap-2 w-full py-3 rounded-xl border border-white/10 hover:bg-white/5 text-xs font-bold text-gray-400 hover:text-white transition-all">
                Kembali ke Dashboard Utama
            </Link>
        </div>
      </aside>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300 bg-[#0a0a0a]">
        
        {/* Header Navigation */}
        <header className="h-20 bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/5 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 relative">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors"
            >
              <Menu size={24} />
            </button>
            
            {/* SEARCH BAR (Sudah terhubung dengan handleSearch di atas) */}
            <form onSubmit={handleSearch} className="hidden md:block w-96 relative group">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-500 group-focus-within:text-yellow-500 transition-colors">
                    <Search size={18} />
                </span>
                <input 
                type="text" 
                placeholder="Cari materi, tutorial..." 
                className="w-full pl-11 pr-4 py-2.5 bg-white/5 border border-white/10 rounded-full text-sm text-white placeholder-gray-500 focus:bg-black focus:border-yellow-500/50 focus:ring-4 focus:ring-yellow-500/10 outline-none transition-all"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                />
            </form>
          </div>

          <div className="flex items-center gap-3">
             <Link to="/login" className="flex items-center gap-2 text-sm font-bold text-black bg-yellow-500 hover:bg-yellow-400 px-5 py-2.5 rounded-full transition shadow-lg shadow-yellow-500/20">
               <LogIn size={16} />
               <span className="hidden md:inline">Masuk</span>
             </Link>
          </div>
        </header>

        {/* Content Area */}
        <div className="flex-1 overflow-y-auto bg-[#FDFBF7] scroll-smooth">
          <Outlet /> 
        </div>

      </main>
    </div>
  );
};

export default LearningLayout;
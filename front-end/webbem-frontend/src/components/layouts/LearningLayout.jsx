import React, { useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  Menu, X, Search, Globe, Code, Sprout, Brain, Scale, Languages, LogIn 
} from 'lucide-react';

const LearningLayout = () => {
  const [searchQuery, setSearchQuery] = useState("");
  
  const [isSidebarOpen, setIsSidebarOpen] = useState(window.innerWidth > 768);
  
  const navigate = useNavigate();
  const location = useLocation();

  
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 768) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const categories = [
    { name: 'Semua Topik', slug: 'all', icon: <Globe size={18} /> },
    { name: 'Coding & IT', slug: 'coding', icon: <Code size={18} /> },
    { name: 'Pertanian', slug: 'pertanian', icon: <Sprout size={18} /> },
    { name: 'Soft Skill', slug: 'soft-skill', icon: <Brain size={18} /> },
    { name: 'Politik & Sosial', slug: 'politik', icon: <Scale size={18} /> },
    { name: 'Bahasa Asing', slug: 'bahasa', icon: <Languages size={18} /> },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    navigate(`/learning?search=${searchQuery}`);
  };

  return (
    <div className="flex h-screen bg-gray-50 font-sans text-gray-800 overflow-hidden">
      
      {isSidebarOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-20 md:hidden backdrop-blur-sm transition-opacity"
          onClick={() => setIsSidebarOpen(false)}
        ></div>
      )}

      <aside 
        className={`
          fixed md:relative z-30 h-full bg-white border-r border-gray-200 
          transition-all duration-300 ease-in-out flex flex-col
          overflow-hidden whitespace-nowrap 
          w-64 flex-shrink-0 
          ${isSidebarOpen 
            ? 'translate-x-0'  
            : '-translate-x-full md:w-0 md:translate-x-0' 
          }
        `}
      >
        <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 min-w-[16rem]">
          <h1 className="text-xl font-extrabold text-blue-600 tracking-tighter truncate">
            SIAKSI <span className="text-gray-800 font-light">Learning</span>
          </h1>
          <button onClick={() => setIsSidebarOpen(false)} className="md:hidden text-gray-500 hover:text-red-500">
            <X size={24} />
          </button>
        </div>

        <nav className="flex-1 overflow-y-auto p-4 space-y-1 min-w-[16rem]">
          <p className="px-3 text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">
            Kategori Belajar
          </p>
          
          {categories.map((cat) => {
            const isActive = location.search.includes(`category=${cat.slug}`) || (cat.slug === 'all' && !location.search.includes('category'));
            
            return (
              <Link 
                key={cat.slug}
                to={cat.slug === 'all' ? '/learning' : `/learning?category=${cat.slug}`}
                onClick={() => window.innerWidth < 768 && setIsSidebarOpen(false)}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                  isActive 
                    ? 'bg-blue-50 text-blue-700' 
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <span className={`${isActive ? 'text-blue-600' : 'text-gray-400'}`}>
                    {cat.icon}
                </span>
                {cat.name}
              </Link>
            )
          })}
        </nav>
      </aside>

      <main className="flex-1 flex flex-col h-screen overflow-hidden relative transition-all duration-300">
        
        <header className="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 md:px-8 shrink-0 z-10 relative shadow-sm md:shadow-none">
          
          <div className="flex items-center gap-4">
            <button 
              onClick={() => setIsSidebarOpen(!isSidebarOpen)}
              className="p-2 rounded-lg hover:bg-gray-100 text-gray-600 transition-colors"
            >
              <Menu size={24} />
            </button>
            
            <div className={`font-bold text-blue-600 text-lg transition-opacity duration-300 ${isSidebarOpen ? 'hidden md:opacity-0 md:block' : 'opacity-100'}`}>
                SIAKSI Academy
            </div>
          </div>

          <form onSubmit={handleSearch} className="hidden md:block flex-1 max-w-xl mx-auto px-8 relative">
            <span className="absolute left-11 top-1/2 -translate-y-1/2 text-gray-400">
                <Search size={18} />
            </span>
            <input 
              type="text" 
              placeholder="Cari materi..." 
              className="w-full pl-10 pr-4 py-2 bg-gray-100 border-transparent focus:bg-white focus:border-blue-300 focus:ring-4 focus:ring-blue-100 rounded-full text-sm transition-all outline-none"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </form>

          <div className="ml-4">
             <Link to="/login" className="flex items-center gap-2 text-sm font-semibold text-gray-600 hover:text-blue-600 px-3 py-2 rounded-lg hover:bg-gray-50 transition">
               <LogIn size={18} />
               <span className="hidden md:inline">Masuk</span>
             </Link>
          </div>
        </header>

        <div className="flex-1 overflow-y-auto bg-[#FDFBF7]">
          <Outlet /> 
        </div>

      </main>
    </div>
  );
};

export default LearningLayout;
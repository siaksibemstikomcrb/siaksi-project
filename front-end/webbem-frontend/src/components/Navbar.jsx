import React, { useState, useEffect, useRef } from 'react';
import { useNavigate, Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Search, Home, Cpu, Newspaper, LogIn, Search as SearchIcon, X 
} from 'lucide-react';

import Dock from './ui/Dock'; 

// --- IMPORT LOGO ---
import logoSiaksi from '../assets/images/logo/logo-4.png';
import logoBem from '../assets/images/logo/logo-bem.png';
import logoStikom from '../assets/images/logo/logo-stikom.png';

const CINEMATIC_EASE = [0.25, 1, 0.5, 1];

const Navbar = ({ isTransparent = false }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const [isScrolled, setIsScrolled] = useState(false);
  
  // State Search
  const [showSearch, setShowSearch] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  
  const searchContainerRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 20);
    window.addEventListener('scroll', handleScroll);
    
    const handleClickOutside = (event) => {
      if (searchContainerRef.current && !searchContainerRef.current.contains(event.target)) {
        if (window.innerWidth > 768) {
            setShowSearch(false);
        }
      }
    };
    document.addEventListener("mousedown", handleClickOutside);

    return () => {
        window.removeEventListener('scroll', handleScroll);
        document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleScrollToSection = (sectionId) => {
    if (location.pathname !== '/') {
        navigate('/');
        setTimeout(() => {
            const element = document.getElementById(sectionId);
            if (element) element.scrollIntoView({ behavior: 'smooth' });
            else window.scrollTo({ top: 0, behavior: 'smooth' });
        }, 300); 
    } else {
        const element = document.getElementById(sectionId);
        if (element) element.scrollIntoView({ behavior: 'smooth' });
        else window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/news?search=${encodeURIComponent(searchQuery)}`);
      setShowSearch(false);
      setSearchQuery('');
    }
  };

  const isHome = location.pathname === '/';
  const navBackgroundClass = (isTransparent && !isScrolled && isHome) 
    ? 'bg-transparent border-transparent py-6' 
    : 'bg-[#020617]/90 backdrop-blur-xl border-white/5 py-4 shadow-xl';

  const dockItems = [
    { 
      icon: <Home size={20} />, 
      label: 'Beranda', 
      onClick: () => handleScrollToSection('top') 
    },
    { 
      icon: <Cpu size={20} />, 
      label: 'Fitur', 
      onClick: () => handleScrollToSection('features') 
    },
    { 
      icon: <Newspaper size={20} />, 
      label: 'Berita', 
      onClick: () => navigate('/news') 
    },
    { 
      icon: <SearchIcon size={20} />, 
      label: 'Cari', 
      onClick: () => setShowSearch(true) 
    },
    { 
      icon: <LogIn size={20} />, 
      label: 'Login', 
      onClick: () => navigate('/login') 
    },
  ];

  return (
    <>
      {/* --- TOP NAVBAR --- */}
      <motion.nav 
        initial={{ y: -100 }} 
        animate={{ y: 0 }} 
        transition={{ duration: 0.8, ease: CINEMATIC_EASE }}
        className={`fixed top-0 left-0 right-0 z-40 transition-all duration-500 border-b ${navBackgroundClass}`}
      >
        <div className="max-w-7xl mx-auto px-4 flex justify-between items-center relative">
          
          {/* === LOGO SECTION (DIPERBESAR & LENGKAP) === */}
          <div className="flex items-center gap-3 md:gap-4 cursor-pointer group z-50" onClick={() => navigate('/')}>
              {/* Logo SIAKSI */}
              <img 
                src={logoSiaksi} 
                alt="SIAKSI" 
                className="h-12 md:h-14 w-auto transition-transform group-hover:scale-105" 
              />
              
              {/* Divider Vertical */}
              <div className="h-8 w-[1px] bg-white/20 mx-1 hidden sm:block"></div>

              {/* Logo STIKOM */}
              <img 
                src={logoStikom} 
                alt="STIKOM" 
                className="h-8 md:h-8 w-auto opacity-90 transition-transform group-hover:scale-105" 
              />

              {/* Logo BEM */}
              <img 
                src={logoBem} 
                alt="BEM" 
                className="h-8 md:h-8 w-auto opacity-90 transition-transform group-hover:scale-105" 
              />
          </div>

          {/* DESKTOP MENU */}
          <div className="hidden md:flex items-center gap-1 bg-white/5 p-1 rounded-full border border-white/5 absolute left-1/2 -translate-x-1/2">
              <button onClick={() => handleScrollToSection('top')} className="px-5 py-2 rounded-full text-sm text-white hover:bg-white/10 transition-all">Home</button>
              <button onClick={() => handleScrollToSection('features')} className="px-5 py-2 rounded-full text-sm text-slate-400 hover:text-white transition-all">Fitur</button>
              <Link to="/news" className="px-5 py-2 rounded-full text-sm text-slate-400 hover:text-white transition-all">Berita</Link>
          </div>

          {/* DESKTOP ACTIONS */}
          <div className="hidden md:flex items-center gap-3" ref={searchContainerRef}>
              <div className="relative flex items-center">
                <AnimatePresence>
                    {showSearch && (
                        <motion.form
                            initial={{ width: 0, opacity: 0 }}
                            animate={{ width: 220, opacity: 1 }}
                            exit={{ width: 0, opacity: 0 }}
                            transition={{ duration: 0.3, ease: "easeOut" }}
                            onSubmit={handleSearchSubmit}
                            className="overflow-hidden mr-2"
                        >
                            <input 
                                autoFocus
                                type="text" 
                                placeholder="Cari..." 
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full bg-white/10 border border-white/10 text-white text-sm px-4 py-2 rounded-full outline-none focus:border-blue-500/50"
                            />
                        </motion.form>
                    )}
                </AnimatePresence>

                <button 
                    onClick={() => setShowSearch(!showSearch)} 
                    className={`p-2 rounded-full transition-all ${showSearch ? 'bg-white text-blue-950 rotate-90' : 'text-slate-400 hover:text-white'}`}
                >
                    {showSearch ? <X size={20} /> : <Search size={20} />}
                </button>
              </div>

              <button onClick={() => navigate('/login')} className="bg-white text-blue-950 px-6 py-2 rounded-full font-bold text-sm transition-all hover:bg-blue-50">
                Login
              </button>
          </div>
        </div>
      </motion.nav>

      {/* --- MOBILE FLOATING SEARCH BAR (GLASS PILL STYLE) --- */}
      <AnimatePresence>
        {showSearch && (
            <motion.div 
                className="fixed top-24 left-1/2 -translate-x-1/2 z-50 w-[85%] max-w-[320px] md:hidden"
                initial={{ y: -20, opacity: 0, scale: 0.9 }}
                animate={{ y: 0, opacity: 1, scale: 1 }}
                exit={{ y: -20, opacity: 0, scale: 0.9 }}
                transition={{ type: "spring", stiffness: 300, damping: 25 }}
            >
                <div className="
                    bg-black/30 backdrop-blur-xl 
                    border border-white/20 
                    rounded-full 
                    shadow-[0_8px_32px_0_rgba(0,0,0,0.36)]
                    flex items-center px-4 py-2.5 gap-3
                ">
                    <Search size={18} className="text-white/70 ml-1" />
                    <form onSubmit={handleSearchSubmit} className="flex-1">
                        <input 
                            autoFocus
                            type="text" 
                            placeholder="Cari..." 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full bg-transparent text-white text-sm outline-none placeholder:text-white/50"
                        />
                    </form>
                    <div className="h-4 w-[1px] bg-white/20"></div>
                    <button 
                        onClick={() => setShowSearch(false)}
                        className="p-1 rounded-full text-white/70 hover:text-white hover:bg-white/20 transition-colors"
                    >
                        <X size={16} />
                    </button>
                </div>
            </motion.div>
        )}
      </AnimatePresence>

      {/* --- MOBILE DOCK (Bottom Bar) --- */}
      <div className="md:hidden">
        <Dock 
          items={dockItems} 
          panelHeight={60} 
          baseItemSize={40} 
          magnification={55} 
        />
      </div>
    </>
  );
};

export default Navbar;
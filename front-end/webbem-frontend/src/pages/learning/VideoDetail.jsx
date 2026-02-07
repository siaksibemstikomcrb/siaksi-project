import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  ChevronLeft, Download, BookOpen, Code, Youtube, Clock, 
  Maximize2, Minimize2, ChevronDown, ChevronUp, Play, X, Edit3, Check 
} from 'lucide-react';
import CodePlayground from '../CodePlayground'; 
import api from '../../api/axios';

// --- DAFTAR BAHASA (Disesuaikan dengan Screenshot) ---
const SUPPORTED_LANGUAGES = [
    { id: 'javascript', name: 'JavaScript (Node.js)' },
    { id: 'typescript', name: 'TypeScript (TS)' },
    { id: 'python', name: 'Python 3' },
    { id: 'cpp', name: 'C++ (G++)' },
    { id: 'java', name: 'Java (OpenJDK)' },
    { id: 'c', name: 'C (GCC)' },
    { id: 'csharp', name: 'C# (Mono)' },
    { id: 'go', name: 'Golang (Go)' },
    { id: 'ruby', name: 'Ruby' },
    { id: 'php', name: 'PHP' },
    { id: 'kotlin', name: 'Kotlin' },
    { id: 'swift', name: 'Swift' },
    { id: 'dart', name: 'Dart' },
];

const VideoDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  // UI States
  const [activeTab, setActiveTab] = useState('notes'); 
  const [notes, setNotes] = useState("");
  const [isExpanded, setIsExpanded] = useState(false); // Mode Fokus
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [showMobileWorkspace, setShowMobileWorkspace] = useState(false);
  
  // Language States
  const [currentLang, setCurrentLang] = useState('javascript');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  // Data States
  const [relatedVideos, setRelatedVideos] = useState([]);
  
  const video = location.state?.videoData;

  // --- LOGIKA DETEKSI BAHASA DARI KATEGORI ---
  const getLanguageFromCategory = (category) => {
      if (!category) return 'javascript';
      const cat = category.toLowerCase();
      
      if (cat.includes('c++') || cat.includes('cpp')) return 'cpp';
      if (cat.includes('c#') || cat.includes('csharp')) return 'csharp';
      if (cat.includes('java') && !cat.includes('script')) return 'java';
      if (cat.includes('python')) return 'python';
      if (cat.includes('go') || cat.includes('golang')) return 'go';
      if (cat.includes('ruby')) return 'ruby';
      if (cat.includes('swift')) return 'swift';
      if (cat.includes('kotlin')) return 'kotlin';
      if (cat.includes('dart')) return 'dart';
      if (cat.includes('php')) return 'php';
      if (cat.includes('typescript') || cat.includes('ts')) return 'typescript';
      if (cat.includes('html')) return 'html'; // Code playground biasanya handle HTML sbg text/xml atau JS
      if (cat.includes('css')) return 'css';
      if (cat === 'c' || cat === 'bahasa c') return 'c';
      
      return 'javascript';
  };

  // --- FETCH & INIT ---
  useEffect(() => {
    const fetchRelated = async () => {
        if (!video?.category_name && !video?.category) return;
        try {
            const categoryQuery = video.category_slug || video.category_name || video.category;
            const res = await api.get('/learning', {
                params: { category: categoryQuery }
            });
            const others = res.data.filter(v => v.id !== video.id);
            setRelatedVideos(others);
        } catch (err) {
            console.error("Gagal load related videos", err);
        }
    };

    if (video) {
        fetchRelated();
        setIsDescOpen(false); 
        setNotes(""); 
        setShowMobileWorkspace(false);
        
        // Auto-set bahasa saat ganti video
        const detectedLang = getLanguageFromCategory(video.category_name || video.category);
        setCurrentLang(detectedLang);
    }
  }, [video]);

  if (!video) return null;

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.text(`Catatan: ${video.title}`, 20, 20);
    doc.setFontSize(12); doc.text(doc.splitTextToSize(notes, 170), 20, 40);
    doc.save(`Catatan-${video.title}.pdf`);
  };

  const handleSwitchVideo = (newVideo) => {
      navigate(`/learning/nonton/${newVideo.id}`, { state: { videoData: newVideo } });
      window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  return (
    <div className="h-screen bg-[#0a0a0a] font-sans text-gray-200 flex flex-col overflow-hidden selection:bg-yellow-500 selection:text-black relative">
      
      {/* HEADER */}
      <div className="h-16 bg-[#0a0a0a] border-b border-white/10 flex items-center justify-between px-6 shrink-0 z-20">
        <button 
            onClick={() => navigate('/learning')} 
            className="group flex items-center gap-3 text-gray-400 hover:text-white font-bold transition-colors"
        >
            <div className="w-8 h-8 rounded-full bg-white/5 border border-white/10 flex items-center justify-center group-hover:bg-yellow-500 group-hover:text-black transition-all">
                <ChevronLeft size={18} />
            </div>
            <span className="hidden md:inline text-sm">Kembali ke List</span>
        </button>
        <span className="text-[10px] font-bold text-yellow-500 uppercase tracking-widest bg-yellow-500/10 px-3 py-1 rounded-full border border-yellow-500/20">
            {video.category_name || video.category || 'Materi'}
        </span>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 overflow-hidden p-4 md:p-6 relative">
        <div className="max-w-[1920px] mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            
            {/* KOLOM KIRI (VIDEO & INFO) */}
            <div className={`
                flex flex-col h-full overflow-y-auto pr-2 custom-scrollbar gap-6
                ${isExpanded ? 'lg:col-span-4' : 'lg:col-span-8'}
            `}>
                <div className="bg-black rounded-2xl overflow-hidden shadow-2xl border border-white/10 shrink-0 aspect-video w-full relative z-10">
                    <iframe 
                        className="w-full h-full"
                        src={`https://www.youtube.com/embed/${video.youtube_id || video.videoId}?autoplay=0&modestbranding=1&rel=0`} 
                        title={video.title}
                        frameBorder="0"
                        allowFullScreen
                    ></iframe>
                </div>

                <div className="bg-[#121212] rounded-2xl p-6 border border-white/5">
                    <div className="flex justify-between items-start gap-4">
                        <div>
                            <h1 className="text-xl md:text-2xl font-black text-white leading-tight mb-2">{video.title}</h1>
                            <div className="flex items-center gap-4 text-xs font-bold text-gray-500">
                                <span className="flex items-center gap-1"><Youtube size={14} className="text-red-500"/> {video.channel_name || video.channel}</span>
                                <span className="flex items-center gap-1"><Clock size={14} className="text-yellow-500"/> {video.duration || '10:00'}</span>
                            </div>
                        </div>
                        <button onClick={() => setIsDescOpen(!isDescOpen)} className="p-2 bg-white/5 rounded-lg text-gray-400 hover:text-white">
                            {isDescOpen ? <ChevronUp size={18}/> : <ChevronDown size={18}/>}
                        </button>
                    </div>
                    {isDescOpen && (
                        <p className="mt-4 text-sm text-gray-400 leading-relaxed pt-4 border-t border-white/5 animate-in fade-in">
                            {video.description || "Tidak ada deskripsi."}
                        </p>
                    )}
                </div>

                <div className="pb-24 lg:pb-0">
                    <h3 className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-3">Materi Lainnya</h3>
                    <div className="space-y-3">
                        {relatedVideos.map((v) => (
                            <div 
                                key={v.id} 
                                onClick={() => handleSwitchVideo(v)}
                                className="flex gap-4 p-3 bg-[#121212] rounded-xl border border-white/5 hover:border-yellow-500/50 cursor-pointer group transition-all"
                            >
                                <div className="w-24 h-16 bg-black rounded-lg overflow-hidden shrink-0 relative">
                                    <img src={v.thumbnail_url} className="w-full h-full object-cover opacity-70 group-hover:opacity-100" alt={v.title} />
                                </div>
                                <div className="flex flex-col justify-center">
                                    <h4 className="text-sm font-bold text-gray-300 group-hover:text-yellow-500 line-clamp-2 leading-snug">{v.title}</h4>
                                    <p className="text-[10px] text-gray-500 mt-1">{v.channel_name}</p>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* KOLOM KANAN (WORKSPACE - DESKTOP) */}
            <div className={`
                hidden lg:flex flex-col h-full bg-[#121212] rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 relative
                ${isExpanded ? 'lg:col-span-8' : 'lg:col-span-4'}
            `}>
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#151515] shrink-0 relative z-20">
                    <div className="flex bg-black/30 p-1 rounded-lg">
                        <button 
                            onClick={() => setActiveTab('notes')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'notes' ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            <BookOpen size={14}/> Catatan
                        </button>
                        <button 
                            onClick={() => setActiveTab('code')}
                            className={`px-4 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Code size={14}/> Code
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
                        {/* --- DESKTOP DROPDOWN BAHASA --- */}
                        {activeTab === 'code' && (
                            <div className="relative">
                                <button 
                                    onClick={() => setIsLangDropdownOpen(!isLangDropdownOpen)}
                                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-xs font-bold text-gray-300 transition-colors"
                                >
                                    {SUPPORTED_LANGUAGES.find(l => l.id === currentLang)?.name || 'Pilih Bahasa'}
                                    <ChevronDown size={14} className={`transition-transform ${isLangDropdownOpen ? 'rotate-180' : ''}`}/>
                                </button>

                                {isLangDropdownOpen && (
                                    <>
                                        <div className="fixed inset-0 z-10" onClick={() => setIsLangDropdownOpen(false)}></div>
                                        <div className="absolute top-full right-0 mt-2 w-52 bg-[#1e1e1e] border border-white/10 rounded-xl shadow-xl z-20 overflow-hidden py-1 max-h-60 overflow-y-auto custom-scrollbar">
                                            {SUPPORTED_LANGUAGES.map((lang) => (
                                                <button
                                                    key={lang.id}
                                                    onClick={() => {
                                                        setCurrentLang(lang.id);
                                                        setIsLangDropdownOpen(false);
                                                    }}
                                                    className={`w-full text-left px-4 py-2 text-xs font-bold flex items-center justify-between hover:bg-white/5 transition-colors ${currentLang === lang.id ? 'text-yellow-500 bg-yellow-500/10' : 'text-gray-400'}`}
                                                >
                                                    {lang.name}
                                                    {currentLang === lang.id && <Check size={12}/>}
                                                </button>
                                            ))}
                                        </div>
                                    </>
                                )}
                            </div>
                        )}

                        <div className="w-px bg-white/10 h-6 mx-1"></div>
                        
                        <button onClick={() => setIsExpanded(!isExpanded)} className="text-gray-500 hover:text-white p-2 rounded-lg hover:bg-white/5">
                            {isExpanded ? <Minimize2 size={18}/> : <Maximize2 size={18}/>}
                        </button>
                    </div>
                </div>

                {/* Content Workspace */}
                <div className="flex-1 overflow-hidden relative">
                    {activeTab === 'notes' ? (
                        <div className="h-full flex flex-col">
                            <textarea 
                                className="flex-1 w-full bg-transparent p-6 text-gray-300 font-mono text-sm leading-relaxed focus:outline-none resize-none custom-scrollbar"
                                placeholder="Tulis rangkuman materi di sini..."
                                value={notes}
                                onChange={(e) => setNotes(e.target.value)}
                                style={{ backgroundImage: 'linear-gradient(#222 1px, transparent 1px)', backgroundSize: '100% 32px', lineHeight: '32px' }}
                            />
                            <div className="p-4 border-t border-white/10 bg-[#151515]">
                                <button onClick={handleDownloadPDF} disabled={!notes.trim()} className="w-full py-2 bg-white/5 hover:bg-yellow-500 hover:text-black text-xs font-bold rounded-lg transition-colors border border-white/10 hover:border-yellow-500 disabled:opacity-50">
                                    Simpan PDF
                                </button>
                            </div>
                        </div>
                    ) : (
                        // ✅ PANGGIL CODE PLAYGROUND DI SINI
                        <CodePlayground defaultLanguage={currentLang} />
                    )}
                </div>
            </div>

        </div>
      </div>

      {/* MOBILE DRAWER */}
      <div className={`
          fixed bottom-0 left-0 right-0 z-50 bg-[#121212] rounded-t-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] 
          transition-transform duration-300 ease-in-out lg:hidden flex flex-col h-[60vh]
          ${showMobileWorkspace ? 'translate-y-0' : 'translate-y-full'}
      `}>
          <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#151515] rounded-t-3xl">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto absolute left-0 right-0 top-3"></div>
              <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                      {activeTab === 'notes' ? 'Catatan' : 'Code'}
                  </span>
                  
                  {/* MOBILE DROPDOWN BAHASA */}
                  {activeTab === 'code' && (
                      <select 
                        value={currentLang}
                        onChange={(e) => setCurrentLang(e.target.value)}
                        className="bg-[#2a2a2a] text-gray-200 text-xs font-bold px-2 py-1 rounded border border-white/10 outline-none"
                      >
                          {SUPPORTED_LANGUAGES.map(lang => (
                              <option key={lang.id} value={lang.id}>{lang.name}</option>
                          ))}
                      </select>
                  )}
              </div>
              <button onClick={() => setShowMobileWorkspace(false)} className="mt-2 text-gray-400 hover:text-white">
                  <ChevronDown size={24} />
              </button>
          </div>

          <div className="p-4 shrink-0">
             <div className="flex bg-black/40 p-1 rounded-xl">
                <button onClick={() => setActiveTab('notes')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${activeTab === 'notes' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>Catatan</button>
                <button onClick={() => setActiveTab('code')} className={`flex-1 py-2 rounded-lg text-xs font-bold ${activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>Coding</button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden relative bg-[#0a0a0a]">
             {activeTab === 'notes' ? (
                 <div className="h-full flex flex-col">
                    <textarea 
                        className="flex-1 w-full bg-transparent p-4 text-gray-300 font-mono text-sm resize-none focus:outline-none"
                        placeholder="Mulai mencatat..."
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                    />
                    <div className="p-4 border-t border-white/10">
                        <button onClick={handleDownloadPDF} disabled={!notes.trim()} className="w-full py-3 bg-white/10 rounded-xl text-xs font-bold text-white">Simpan PDF</button>
                    </div>
                 </div>
             ) : (
                 // ✅ PANGGIL CODE PLAYGROUND (MOBILE)
                 <CodePlayground defaultLanguage={currentLang} />
             )}
          </div>
      </div>

      {!showMobileWorkspace && (
          <div className="fixed bottom-6 right-6 z-50 lg:hidden">
              <button onClick={() => setShowMobileWorkspace(true)} className="bg-yellow-500 text-black p-4 rounded-full shadow-2xl active:scale-95 transition-transform">
                 <Edit3 size={24} />
              </button>
          </div>
      )}

    </div>
  );
};

export default VideoDetail;
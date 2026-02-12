import React, { useState, useEffect, useRef } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  ChevronLeft, BookOpen, Code, Youtube, Clock, 
  Maximize2, Minimize2, ChevronDown, ChevronUp, Edit3, Check,
  Bot, Send, Loader2, User 
} from 'lucide-react';
import CodePlayground from '../CodePlayground'; 
import api from '../../api/axios';

import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { Prism as SyntaxHighlighter } from 'react-syntax-highlighter';
import { vscDarkPlus } from 'react-syntax-highlighter/dist/esm/styles/prism';

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
  
  const [activeTab, setActiveTab] = useState('notes'); 
  const [notes, setNotes] = useState("");
  const [isExpanded, setIsExpanded] = useState(false);
  const [isDescOpen, setIsDescOpen] = useState(false);
  const [showMobileWorkspace, setShowMobileWorkspace] = useState(false);
  
  const [currentLang, setCurrentLang] = useState('javascript');
  const [isLangDropdownOpen, setIsLangDropdownOpen] = useState(false);
  
  const [chatMessages, setChatMessages] = useState([]);
  const [chatInput, setChatInput] = useState("");
  const [isChatTyping, setIsChatTyping] = useState(false);
  const chatEndRef = useRef(null);

  const [relatedVideos, setRelatedVideos] = useState([]);
  const video = location.state?.videoData;

  const getLanguageFromCategory = (category) => {
      if (!category) return 'javascript';
      const cat = category.toLowerCase();
      if (cat.includes('python')) return 'python';
      if (cat.includes('java')) return 'java';
      if (cat.includes('cpp')) return 'cpp';
      if (cat.includes('c#')) return 'csharp';
      if (cat.includes('go')) return 'go';
      if (cat.includes('php')) return 'php';
      return 'javascript';
  };

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
        
        setChatMessages([
            { role: 'ai', text: `Halo! Saya asisten pintar untuk video **"${video.title}"**. Ada yang kurang paham? Tanyakan saja! 🤖` }
        ]);

        const detectedLang = getLanguageFromCategory(video.category_name || video.category);
        setCurrentLang(detectedLang);
    }
  }, [video]);

  useEffect(() => {
      chatEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [chatMessages, isChatTyping]);

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

  const handleSendChat = async (e) => {
      e.preventDefault();
      if (!chatInput.trim()) return;

      const userMsg = chatInput;
      setChatInput("");
      setChatMessages(prev => [...prev, { role: 'user', text: userMsg }]);
      setIsChatTyping(true);

      try {
          const res = await api.post('/learning/chat', {
              material_id: video.id,
              question: userMsg
          });

          setChatMessages(prev => [...prev, { role: 'ai', text: res.data.answer }]);
      } catch (err) {
          console.error("AI Error:", err);
          setChatMessages(prev => [...prev, { role: 'ai', text: "Maaf, server AI sedang sibuk. Coba lagi nanti ya!" }]);
      } finally {
          setIsChatTyping(false);
      }
  };

  return (
    <div className="h-screen bg-[#0a0a0a] font-sans text-gray-200 flex flex-col overflow-hidden selection:bg-yellow-500 selection:text-black relative">
      
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

      <div className="flex-1 overflow-hidden p-4 md:p-6 relative">
        <div className="max-w-[1920px] mx-auto h-full grid grid-cols-1 lg:grid-cols-12 gap-6">
            
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

            <div className={`
                hidden lg:flex flex-col h-full bg-[#121212] rounded-2xl border border-white/10 overflow-hidden transition-all duration-300 relative
                ${isExpanded ? 'lg:col-span-8' : 'lg:col-span-4'}
            `}>
                <div className="h-14 border-b border-white/10 flex items-center justify-between px-4 bg-[#151515] shrink-0 relative z-20">
                    <div className="flex bg-black/30 p-1 rounded-lg gap-1">
                        <button 
                            onClick={() => setActiveTab('notes')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'notes' ? 'bg-yellow-500 text-black' : 'text-gray-500 hover:text-white'}`}
                        >
                            <BookOpen size={14}/> Catatan
                        </button>
                        <button 
                            onClick={() => setActiveTab('code')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Code size={14}/> Code
                        </button>
                        <button 
                            onClick={() => setActiveTab('ai')}
                            className={`px-3 py-1.5 rounded-md text-xs font-bold transition-all flex items-center gap-2 ${activeTab === 'ai' ? 'bg-purple-600 text-white shadow-lg shadow-purple-900/20' : 'text-gray-500 hover:text-white'}`}
                        >
                            <Bot size={14}/> AI Tutor
                        </button>
                    </div>

                    <div className="flex items-center gap-2">
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

                <div className="flex-1 overflow-hidden relative">
                    
                    {activeTab === 'notes' && (
                        <div className="h-full flex flex-col animate-in fade-in zoom-in-95 duration-200">
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
                    )}

                    {activeTab === 'code' && (
                        <div className="h-full animate-in fade-in zoom-in-95 duration-200">
                            <CodePlayground defaultLanguage={currentLang} />
                        </div>
                    )}

                    {activeTab === 'ai' && (
                        <div className="h-full flex flex-col bg-[#0f0f0f] animate-in fade-in zoom-in-95 duration-200">
                            <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                                {chatMessages.map((msg, idx) => (
                                    <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'ai' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}>
                                            {msg.role === 'ai' ? <Bot size={16}/> : <User size={16}/>}
                                        </div>
                                        
                                        <div className={`max-w-[85%] rounded-2xl text-sm leading-relaxed overflow-hidden shadow-sm 
                                            ${msg.role === 'user' 
                                                ? 'bg-white/10 text-white rounded-tr-none px-4 py-2' 
                                                : 'bg-[#1e1e1e] text-gray-300 border border-white/10 rounded-tl-none'}`
                                        }>
                                            {msg.role === 'user' ? (
                                                <span>{msg.text}</span>
                                            ) : (
                                                <div className="markdown-body p-4">
                                                    <ReactMarkdown
                                                        remarkPlugins={[remarkGfm]}
                                                        components={{
                                                            code({node, inline, className, children, ...props}) {
                                                                const match = /language-(\w+)/.exec(className || '')
                                                                return !inline && match ? (
                                                                    <div className="rounded-lg overflow-hidden my-3 border border-white/10">
                                                                        <div className="bg-[#151515] px-3 py-1 text-[10px] font-mono text-gray-500 border-b border-white/10 flex justify-between items-center">
                                                                            <span className="uppercase">{match[1]}</span>
                                                                        </div>
                                                                        <SyntaxHighlighter
                                                                            children={String(children).replace(/\n$/, '')}
                                                                            style={vscDarkPlus}
                                                                            language={match[1]}
                                                                            PreTag="div"
                                                                            customStyle={{ margin: 0, borderRadius: 0, fontSize: '13px' }}
                                                                            {...props}
                                                                        />
                                                                    </div>
                                                                ) : (
                                                                    <code className="bg-white/10 text-yellow-500 px-1 py-0.5 rounded font-mono text-xs" {...props}>
                                                                        {children}
                                                                    </code>
                                                                )
                                                            },
                                                            p: ({children}) => <p className="mb-3 last:mb-0">{children}</p>,
                                                            ul: ({children}) => <ul className="list-disc pl-4 mb-3 space-y-1">{children}</ul>,
                                                            ol: ({children}) => <ol className="list-decimal pl-4 mb-3 space-y-1">{children}</ol>,
                                                            strong: ({children}) => <strong className="text-white font-bold">{children}</strong>,
                                                            a: ({href, children}) => <a href={href} target="_blank" rel="noreferrer" className="text-blue-400 hover:underline">{children}</a>
                                                        }}
                                                    >
                                                        {msg.text}
                                                    </ReactMarkdown>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                ))}
                                {isChatTyping && (
                                    <div className="flex gap-3">
                                        <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center shrink-0"><Bot size={16}/></div>
                                        <div className="bg-purple-900/20 px-4 py-3 rounded-2xl rounded-tl-none border border-purple-500/20 flex items-center gap-1">
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"></span>
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-100"></span>
                                            <span className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce delay-200"></span>
                                        </div>
                                    </div>
                                )}
                                <div ref={chatEndRef} />
                            </div>

                            <form onSubmit={handleSendChat} className="p-4 border-t border-white/10 bg-[#151515] flex gap-2">
                                <input 
                                    type="text" 
                                    className="flex-1 bg-[#222] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-purple-500 outline-none"
                                    placeholder="Tanya AI..."
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    disabled={isChatTyping}
                                />
                                <button type="submit" disabled={!chatInput.trim()} className="p-2 bg-purple-600 rounded-lg text-white hover:bg-purple-500 transition-colors"><Send size={18}/></button>
                            </form>
                        </div>
                    )}
                </div>
            </div>

        </div>
      </div>

      <div className={`
          fixed bottom-0 left-0 right-0 z-50 bg-[#121212] rounded-t-3xl border-t border-white/10 shadow-[0_-10px_40px_rgba(0,0,0,0.8)] 
          transition-transform duration-300 ease-in-out lg:hidden flex flex-col h-[70vh]
          ${showMobileWorkspace ? 'translate-y-0' : 'translate-y-full'}
      `}>
          <div className="px-6 py-3 border-b border-white/10 flex items-center justify-between shrink-0 bg-[#151515] rounded-t-3xl">
              <div className="w-10 h-1 bg-white/20 rounded-full mx-auto absolute left-0 right-0 top-3"></div>
              <div className="flex items-center gap-3 mt-2">
                  <span className="text-xs font-bold text-yellow-500 uppercase tracking-wider">
                      {activeTab === 'notes' ? 'Catatan' : activeTab === 'code' ? 'Code' : 'AI Assistant'}
                  </span>
                  
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
                <button onClick={() => setActiveTab('notes')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'notes' ? 'bg-yellow-500 text-black' : 'text-gray-500'}`}>Catatan</button>
                <button onClick={() => setActiveTab('code')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'code' ? 'bg-blue-600 text-white' : 'text-gray-500'}`}>Coding</button>
                <button onClick={() => setActiveTab('ai')} className={`flex-1 py-2 rounded-lg text-xs font-bold transition-all ${activeTab === 'ai' ? 'bg-purple-600 text-white' : 'text-gray-500'}`}>AI Chat</button>
             </div>
          </div>

          <div className="flex-1 overflow-hidden relative bg-[#0a0a0a]">
             {activeTab === 'notes' && (
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
             )}
             
             {activeTab === 'code' && (
                 <CodePlayground defaultLanguage={currentLang} />
             )}

             {activeTab === 'ai' && (
                 <div className="h-full flex flex-col">
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar">
                        {chatMessages.map((msg, idx) => (
                            <div key={idx} className={`flex gap-3 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                                <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 border ${msg.role === 'ai' ? 'bg-purple-600 border-purple-500 text-white' : 'bg-gray-700 border-gray-600 text-gray-300'}`}>
                                    {msg.role === 'ai' ? <Bot size={14}/> : <User size={14}/>}
                                </div>
                                <div className={`max-w-[85%] rounded-xl text-sm leading-relaxed overflow-hidden ${msg.role === 'user' ? 'bg-white/10 text-white px-4 py-2' : 'bg-[#1e1e1e] text-purple-100 border border-purple-500/20'}`}>
                                    {msg.role === 'user' ? (
                                        <span>{msg.text}</span>
                                    ) : (
                                        <div className="markdown-body p-4">
                                            <ReactMarkdown remarkPlugins={[remarkGfm]}>
                                                {msg.text}
                                            </ReactMarkdown>
                                        </div>
                                    )}
                                </div>
                            </div>
                        ))}
                        {isChatTyping && <div className="text-gray-500 text-xs italic p-4">AI sedang mengetik...</div>}
                        <div ref={chatEndRef} />
                    </div>
                    <form onSubmit={handleSendChat} className="p-4 border-t border-white/10 bg-[#151515] flex gap-2">
                        <input 
                            type="text" 
                            className="flex-1 bg-[#222] border border-white/10 rounded-lg px-4 py-2 text-sm text-white focus:border-purple-500 outline-none"
                            placeholder="Tanya AI..."
                            value={chatInput}
                            onChange={(e) => setChatInput(e.target.value)}
                            disabled={isChatTyping}
                        />
                        <button type="submit" disabled={!chatInput.trim()} className="p-2 bg-purple-600 rounded-lg text-white"><Send size={18}/></button>
                    </form>
                 </div>
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
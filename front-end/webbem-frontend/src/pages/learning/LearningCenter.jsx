import React, { useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Play, Clock, ChevronRight, BarChart3, Search } from 'lucide-react';

const LearningCenter = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const activeCategory = queryParams.get('category');
  const searchQuery = queryParams.get('search')?.toLowerCase() || "";
  const [selectedPlaylist, setSelectedPlaylist] = useState('all');

  const allVideos = [
    { id: 1, title: "Roadmap Frontend Developer 2025", category: "coding", channel: "Web Programming UNPAS", videoId: "cnL8a1wO3nw", duration: "10:05" },
    { id: 2, title: "AI untuk Proggramer", category: "Coding", channel: "Web Proggraming UNPAS", videoId: "ilmdAEUmdo8", duration: "15:30" },
    { id: 3, title: "Belajar Coding Dari 0", category: "Coding", channel: "webdev dan Agung Hapsah", videoId: "unxpUD9Xd_c", duration: "08:45" },
    { id: 4, title: "Kalian Gak Butuh Microservices", category: "coding", channel: "Proggramer Zaman Now", videoId: "BZ1loXWoP1k", duration: "12:20" },
    { id: 5, title: "Pelaku Usaha Harus Paham Ini", category: "Umum", channel: "MALAKA", videoId: "IaHWk_HW23g", duration: "20:10" },
    { id: 6, title: "TPurbaya Sadewa: Pendirian dalam Berkebijakan Itu Penting | Endgame #245", category: "Politik", channel: "Gita Wirjawan", videoId: "Ss6ud71pmvQ", duration: "11:00" },
  ];

  const categoriesList = [
    { id: 'all', label: 'Semua Materi', desc: 'Jelajahi semua video' },
    { id: 'coding', label: 'Programming & IT', desc: 'HTML, CSS, JS, Python' },
    { id: 'pertanian', label: 'Agrikultur Modern', desc: 'Hidroponik, Organik' },
    { id: 'soft-skill', label: 'Pengembangan Diri', desc: 'Public Speaking, Leadership' },
  ];

  const filteredVideos = useMemo(() => {
    return allVideos.filter(video => {
      const categoryFilter = activeCategory 
        ? video.category === activeCategory
        : selectedPlaylist !== 'all' 
          ? video.category === selectedPlaylist 
          : true;
      const searchFilter = video.title.toLowerCase().includes(searchQuery) || 
                           video.channel.toLowerCase().includes(searchQuery);
      
      return categoryFilter && searchFilter;
    });
  }, [activeCategory, searchQuery, selectedPlaylist]);

  const handleWatch = (video) => {
    navigate(`/learning/nonton/${video.id}`, { state: { videoData: video } });
  };

  const handlePlaylistClick = (catId) => {
    setSelectedPlaylist(catId);
  };

  return (
    <div className="min-h-screen bg-[#FDFBF7] p-6 md:p-10 font-sans text-gray-800">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <div className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-1">
            Program Belajar {selectedPlaylist === 'all' ? 'Mahasiswa' : selectedPlaylist}
          </div>
          <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900">
            SIAKSI Learning
          </h1>
        </div>
        <div className="flex items-center gap-4 bg-white px-4 py-2 rounded-full shadow-sm border border-gray-100">
           <div className="text-sm font-bold text-gray-600">Level Kamu</div>
           <div className="w-24 h-2 bg-gray-200 rounded-full overflow-hidden">
              <div className="h-full bg-green-500 w-[60%] rounded-full"></div>
           </div>
           <span className="text-xs font-bold text-green-600">60%</span>
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-10">
        <div className="lg:col-span-2 bg-[#FFE066] rounded-[2rem] p-8 md:p-10 relative overflow-hidden shadow-sm flex flex-col justify-center min-h-[240px]">
           <div className="absolute -right-10 -bottom-10 w-64 h-64 bg-yellow-300 rounded-full opacity-50 blur-2xl"></div>
           <div className="relative z-10 max-w-lg">
             <h2 className="text-3xl md:text-4xl font-black text-gray-900 leading-tight mb-4">
               Compiling Nature<br/>
               <span className="text-gray-800/80">From DNA Strings to Life.exe.</span>
             </h2>
             <p className="font-medium text-gray-800 mb-6">
               Temukan banyak materi pembelajaran untuk meningkatkan skill organisasi dan akademikmu.
             </p>
             <button className="bg-gray-900 text-white px-6 py-3 rounded-full font-bold text-sm hover:bg-black transition shadow-lg inline-flex items-center gap-2">
               Mulai Belajar Sekarang <ChevronRight size={16} />
             </button>
           </div>
        </div>
        <div className="bg-[#18181B] rounded-[2rem] p-8 flex flex-col justify-between text-white shadow-lg relative overflow-hidden">
           <div className="absolute top-0 right-0 w-32 h-32 bg-gray-800 rounded-bl-full opacity-20"></div>
           <div>
              <div className="flex justify-between items-start mb-6">
                 <span className="bg-gray-800 text-xs font-bold px-3 py-1 rounded-full text-gray-300 border border-gray-700">
                    Daily Stats
                 </span>
                 <BarChart3 size={20} className="text-gray-400" />
              </div>
              <h3 className="text-4xl font-bold mb-1">12</h3>
              <p className="text-gray-400 text-sm">Video Diselesaikan</p>
           </div>
           <div className="mt-6">
              <div className="flex justify-between text-sm mb-2">
                 <span className="text-gray-400">Target Minggu Ini</span>
                 <span className="font-bold text-green-400">80%</span>
              </div>
              <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                 <div className="h-full bg-green-500 w-[80%] rounded-full shadow-[0_0_10px_rgba(34,197,94,0.5)]"></div>
              </div>
           </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <div className="lg:col-span-1 space-y-6">
           <div>
              <h3 className="font-bold text-lg mb-4 flex items-center gap-2">
                 <span className="w-2 h-6 bg-green-500 rounded-full"></span>
                 Kategori Materi
              </h3>
              <div className="space-y-3">
                 {categoriesList.map((cat, index) => (
                    <div 
                      key={cat.id}
                      onClick={() => handlePlaylistClick(cat.id)}
                      className={`group p-4 rounded-2xl cursor-pointer transition-all border-2 ${
                        selectedPlaylist === cat.id 
                        ? 'bg-white border-green-500 shadow-md' 
                        : 'bg-transparent border-transparent hover:bg-white hover:border-gray-200'
                      }`}
                    >
                       <div className="flex items-start gap-3">
                          <div className={`mt-1 w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 ${
                             selectedPlaylist === cat.id ? 'border-green-500 bg-green-50' : 'border-gray-300'
                          }`}>
                             {selectedPlaylist === cat.id && <div className="w-2.5 h-2.5 bg-green-500 rounded-full"></div>}
                          </div>
                          
                          <div>
                             <h4 className={`font-bold text-sm ${selectedPlaylist === cat.id ? 'text-gray-900' : 'text-gray-500 group-hover:text-gray-700'}`}>
                                {cat.label}
                             </h4>
                             <p className="text-xs text-gray-400 mt-1 line-clamp-1">{cat.desc}</p>
                          </div>
                       </div>
                    </div>
                 ))}
              </div>
           </div>
        </div>

        <div className="lg:col-span-3">
           <div className="flex justify-between items-center mb-6">
              <h3 className="font-bold text-lg">
                 {searchQuery ? `Hasil Pencarian: "${searchQuery}"` : "Materi Tersedia"}
              </h3>
              <div className="text-sm text-gray-500">
                 {filteredVideos.length} Video
              </div>
           </div>

           {filteredVideos.length > 0 ? (
             <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
               {filteredVideos.map((video) => (
                  <div 
                    key={video.id} 
                    onClick={() => handleWatch(video)}
                    className="group bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 hover:border-green-400 hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                  >

                     <div className="relative aspect-video bg-gray-200 overflow-hidden">
                        <img 
                           src={`https://img.youtube.com/vi/${video.videoId}/mqdefault.jpg`} 
                           className="w-full h-full object-cover group-hover:scale-110 transition duration-700"
                           alt={video.title}
                        />

                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/10 flex items-center justify-center opacity-0 group-hover:opacity-100 transition duration-300">
                           <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm">
                              <Play size={20} className="ml-1 text-gray-900" fill="currentColor" />
                           </div>
                        </div>

                        <div className="absolute bottom-3 right-3 bg-black/70 backdrop-blur-md text-white text-[10px] font-bold px-2 py-1 rounded-md flex items-center gap-1">
                           <Clock size={10} /> {video.duration}
                        </div>
                     </div>

                     <div className="p-5">
                        <div className="flex items-center gap-2 mb-2">
                           <span className={`text-[10px] font-bold uppercase tracking-wider px-2 py-1 rounded-md ${
                              video.category === 'coding' ? 'bg-blue-100 text-blue-700' :
                              video.category === 'pertanian' ? 'bg-green-100 text-green-700' :
                              'bg-purple-100 text-purple-700'
                           }`}>
                              {video.category}
                           </span>
                        </div>
                        <h3 className="font-bold text-gray-800 leading-snug mb-2 line-clamp-2 group-hover:text-green-600 transition-colors">
                           {video.title}
                        </h3>
                        <div className="flex items-center gap-2 text-xs text-gray-500 font-medium">
                           <div className="w-5 h-5 rounded-full bg-gray-200 flex items-center justify-center text-[10px] text-gray-600 font-bold">
                              {video.channel.charAt(0)}
                           </div>
                           {video.channel}
                        </div>
                     </div>
                  </div>
               ))}
             </div>
           ) : (
             <div className="bg-white rounded-3xl p-10 text-center border border-dashed border-gray-300">
                <Search size={48} className="mx-auto text-gray-300 mb-4" />
                <h3 className="text-gray-900 font-bold text-lg">Materi tidak ditemukan</h3>
                <p className="text-gray-500 text-sm mt-1">Coba cari dengan kata kunci lain.</p>
             </div>
           )}
        </div>

      </div>
    </div>
  );
};

export default LearningCenter;
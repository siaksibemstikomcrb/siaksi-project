import React, { useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { jsPDF } from 'jspdf';
import { 
  ChevronLeft, Download, BookOpen, Code, Youtube, Clock, 
  Maximize2, Minimize2 
} from 'lucide-react';
import CodePlayground from '../../components/CodePlayground'; 

const VideoDetail = () => {
  const location = useLocation();
  const navigate = useNavigate();
  
  const [activeTab, setActiveTab] = useState('notes'); 
  const [notes, setNotes] = useState("");
  
  const [isExpanded, setIsExpanded] = useState(false);
  
  const video = location.state?.videoData;

  if (!video) {
    return (
      <div className="flex h-screen items-center justify-center flex-col gap-4 bg-[#FDFBF7]">
        <div className="bg-white p-8 rounded-3xl shadow-lg text-center border border-gray-100">
            <h2 className="text-xl font-bold text-gray-800 mb-2">Video tidak ditemukan! 😢</h2>
            <button onClick={() => navigate('/learning')} className="bg-gray-900 text-white px-6 py-2 rounded-full font-bold">Kembali</button>
        </div>
      </div>
    );
  }

  const handleDownloadPDF = () => {
    const doc = new jsPDF();
    doc.setFontSize(18); doc.setFont("helvetica", "bold");
    doc.text(`Catatan: ${video.title}`, 10, 20);
    doc.setFontSize(10); doc.setFont("helvetica", "normal");
    doc.text(`Channel: ${video.channel} | Tgl: ${new Date().toLocaleDateString()}`, 10, 28);
    doc.line(10, 32, 200, 32);
    doc.setFontSize(12);
    const splitNotes = doc.splitTextToSize(notes, 180); 
    doc.text(splitNotes, 10, 42);
    doc.save(`Catatan-${video.title}.pdf`);
  };

  return (
    <div className="min-h-screen lg:h-screen bg-[#FDFBF7] p-4 md:p-6 font-sans text-gray-800 flex flex-col lg:overflow-hidden">
      
      <div className="max-w-[1600px] w-full mx-auto mb-4 flex items-center justify-between shrink-0">
        <button 
            onClick={() => navigate(-1)} 
            className="group flex items-center gap-2 text-gray-500 hover:text-gray-900 font-bold transition-colors"
        >
            <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center group-hover:border-gray-400 transition-colors">
                <ChevronLeft size={18} />
            </div>
            Kembali
        </button>

        <div className="hidden md:flex items-center gap-2 text-sm text-gray-400">
            <span className="text-gray-800 font-medium truncate max-w-[300px]">{video.title}</span>
        </div>
      </div>

      <div className="max-w-[1600px] w-full mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6 lg:h-full pb-2">
        
        <div className={`flex flex-col gap-4 transition-all duration-500 ease-in-out lg:overflow-y-auto ${
            isExpanded ? 'lg:col-span-4 order-1 lg:order-1' : 'lg:col-span-8 order-1'
        }`}>
          
          <div className={`bg-black rounded-[1.5rem] overflow-hidden shadow-xl w-full shrink-0 relative group transition-all duration-500 ${
              isExpanded ? 'aspect-video lg:aspect-[4/3]' : 'aspect-video'
          }`}>
            <iframe 
              className="w-full h-full"
              src={`https://www.youtube.com/embed/${video.videoId}`} 
              title={video.title}
              frameBorder="0"
              allowFullScreen
            ></iframe>
          </div>

          <div className="bg-white p-6 rounded-[1.5rem] border border-gray-100 shadow-sm transition-all shrink-0">
            <div className="flex justify-between items-start gap-4">
                <div>
                    {!isExpanded && (
                        <div className="flex items-center gap-2 mb-2 animate-fadeIn">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider ${video.color || 'bg-blue-100 text-blue-700'}`}>
                                {video.category}
                            </span>
                            <span className="flex items-center gap-1 text-xs font-semibold text-gray-400 bg-gray-100 px-2 py-1 rounded-full">
                                <Clock size={12} /> {video.duration || "10:00"}
                            </span>
                        </div>
                    )}
                    <h1 className={`font-extrabold text-gray-900 leading-tight transition-all ${
                        isExpanded ? 'text-lg line-clamp-2' : 'text-2xl md:text-3xl'
                    }`}>
                        {video.title}
                    </h1>
                </div>
            </div>
            
            {!isExpanded && (
                <div className="flex items-center gap-3 pt-4 mt-4 border-t border-gray-50 animate-fadeIn">
                    <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center text-red-600">
                        <Youtube size={20} />
                    </div>
                    <div>
                        <p className="text-xs text-gray-400 font-bold uppercase">Video Source</p>
                        <p className="text-sm font-bold text-gray-700">{video.channel}</p>
                    </div>
                </div>
            )}
          </div>
        </div>

        <div className={`flex flex-col transition-all duration-500 ease-in-out 
            h-[600px] lg:h-[calc(100vh-100px)]
            ${isExpanded ? 'lg:col-span-8 order-2 lg:order-2' : 'lg:col-span-4 order-2'}
        `}>
          
          <div className="bg-white p-1.5 rounded-2xl border border-gray-200 flex mb-4 shadow-sm relative shrink-0">
            <button 
              onClick={() => setActiveTab('notes')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'notes' ? 'bg-gray-900 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <BookOpen size={16} /> <span className={isExpanded ? 'inline' : 'hidden sm:inline'}>Catatan</span>
            </button>
            <button 
              onClick={() => setActiveTab('code')}
              className={`flex-1 py-2.5 rounded-xl text-sm font-bold flex items-center justify-center gap-2 transition-all ${activeTab === 'code' ? 'bg-blue-600 text-white shadow' : 'text-gray-500 hover:bg-gray-50'}`}
            >
              <Code size={16} /> <span className={isExpanded ? 'inline' : 'hidden sm:inline'}>Live Code</span>
            </button>

            <div className="hidden lg:flex items-center">
                <div className="w-px bg-gray-200 mx-1 my-1"></div>
                <button 
                    onClick={() => setIsExpanded(!isExpanded)}
                    className="px-3 rounded-xl hover:bg-gray-100 text-gray-500 transition-colors flex items-center justify-center"
                    title={isExpanded ? "Kecilkan Workspace" : "Perbesar Workspace"}
                >
                    {isExpanded ? <Minimize2 size={18} /> : <Maximize2 size={18} />}
                </button>
            </div>
          </div>

          <div className="bg-white rounded-[1.5rem] border border-gray-100 shadow-sm flex-1 flex flex-col overflow-hidden relative transition-all h-full">
            
            {activeTab === 'notes' && (
              <div className="flex flex-col h-full p-1 animate-fadeIn">
                 <div className="flex-1 relative"> 
                    <div className="absolute top-0 left-6 bottom-0 w-px bg-red-100 z-10 pointer-events-none"></div>
                    <textarea 
                      className="w-full h-full p-6 pl-10 bg-[#FFFDF5] text-gray-700 font-medium leading-relaxed resize-none focus:outline-none font-handwriting"
                      style={{ backgroundImage: 'linear-gradient(#E5E7EB 1px, transparent 1px)', backgroundSize: '100% 32px', lineHeight: '32px' }}
                      placeholder="Mulai menulis rangkuman di sini..."
                      value={notes}
                      onChange={(e) => setNotes(e.target.value)}
                    ></textarea>
                 </div>
                 <div className="p-4 bg-white border-t border-gray-100 shrink-0">
                    <button onClick={handleDownloadPDF} className="w-full bg-red-50 hover:bg-red-100 text-red-600 py-3 rounded-xl font-bold transition flex items-center justify-center gap-2 border border-red-100">
                        <Download size={18} /> Simpan PDF
                    </button>
                 </div>
              </div>
            )}

            {activeTab === 'code' && (
              <div className="h-full animate-fadeIn bg-gray-900 flex flex-col">
                 <div className="flex-1 relative">
                    <CodePlayground />
                 </div>
              </div>
            )}
          
          </div>
        </div>

      </div>
    </div>
  );
};

export default VideoDetail;
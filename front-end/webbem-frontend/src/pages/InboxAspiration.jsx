import React, { useState, useEffect } from 'react';
import { MessageCircle, Calendar, VenetianMask, X, Maximize2 } from 'lucide-react';
import api from '../api/axios';

const InboxAspiration = () => {
  const [aspirations, setAspirations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [selectedImg, setSelectedImg] = useState(null);

  useEffect(() => {
    fetchAspirations();
  }, []);

  const fetchAspirations = async () => {
    setLoading(true);
    try {
      const res = await api.get('/aspirations');
      setAspirations(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-5xl mx-auto font-sans">
      <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
        <MessageCircle className="text-purple-600" /> Inbox Aspirasi (Anonim)
      </h1>

      <div className="grid gap-6">
        {loading ? (
          <p className="text-center text-gray-400 animate-pulse">Memuat aspirasi...</p>
        ) : aspirations.length === 0 ? (
          <p className="text-gray-500 italic text-center py-10">Belum ada aspirasi masuk.</p>
        ) : (
          aspirations.map((item) => (
            <div key={item.id} className="bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden hover:shadow-md transition-all">
              <div className="p-6">
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="font-bold text-lg text-gray-900 mb-1">{item.subject}</h3>
                    <div className="flex items-center gap-4 text-[10px] uppercase tracking-wider font-bold">
                      <span className="flex items-center gap-1 text-gray-400">
                        <Calendar size={12} /> {new Date(item.created_at).toLocaleDateString('id-ID')}
                      </span>
                      <span className="flex items-center gap-1 text-purple-600 bg-purple-50 px-2 py-0.5 rounded-lg">
                        <VenetianMask size={12} /> {item.sender_alias}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="bg-slate-50 p-5 rounded-2xl border border-slate-100 mb-4">
                  <p className="text-gray-700 text-sm leading-relaxed italic">
                    "{item.message}"
                  </p>
                </div>

                {item.image_url && (
                  <div className="mt-4">
                    <p className="text-[10px] font-black text-gray-400 mb-2 uppercase tracking-widest">Lampiran Bukti:</p>
                    <div 
                      className="relative w-40 h-40 rounded-2xl overflow-hidden cursor-zoom-in group border-2 border-slate-100 shadow-sm"
                      onClick={() => setSelectedImg(item.image_url)}
                    >
                      <img 
                        src={item.image_url} 
                        alt="Bukti Aspirasi" 
                        className="w-full h-full object-cover transition-transform group-hover:scale-110"
                      />
                      <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                        <Maximize2 className="text-white" size={20} />
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
      </div>

      {selectedImg && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-10">
          <div 
            className="absolute inset-0 bg-black/90 backdrop-blur-sm"
            onClick={() => setSelectedImg(null)}
          ></div>
          <div className="relative max-w-4xl w-full max-h-full flex flex-col items-center">
            <button 
              onClick={() => setSelectedImg(null)}
              className="absolute -top-12 right-0 p-2 bg-white/10 hover:bg-white/20 text-white rounded-full transition-colors"
            >
              <X size={24} />
            </button>
            <img 
              src={selectedImg} 
              alt="Preview Besar" 
              className="max-w-full max-h-[80vh] rounded-2xl shadow-2xl object-contain border border-white/10"
            />
          </div>
        </div>
      )}
    </div>
  );
};

export default InboxAspiration;
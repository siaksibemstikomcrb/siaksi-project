import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
import { 
    Mail, User, Download, X, Search, 
    CheckCheck, Filter, MessageSquare, Megaphone, Inbox 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const InfoInbox = () => {
    // --- STATE ---
    const [mails, setMails] = useState([]);
    const [selected, setSelected] = useState(null);
    const [filterType, setFilterType] = useState('all'); // 'all', 'direct', 'broadcast'
    const [searchQuery, setSearchQuery] = useState('');
    const [loading, setLoading] = useState(true);

    // --- FETCH DATA ---
    useEffect(() => {
        fetchInbox();
    }, []);

    const fetchInbox = async () => {
        setLoading(true);
        try {
            const res = await api.get('/mail/inbox');
            // Jika backend belum support is_read, default ke false
            const data = res.data.map(m => ({ ...m, is_read: m.is_read || false }));
            setMails(data);
        } catch (err) {
            console.error(err);
            toast.error("Gagal memuat pesan.");
        } finally {
            setLoading(false);
        }
    };

    // --- ACTIONS ---
    const markAsRead = async (mail) => {
        if (mail.is_read) return;
        
        // Optimistic Update
        const updatedMails = mails.map(m => m.id === mail.id ? { ...m, is_read: true } : m);
        setMails(updatedMails);

        try {
            // await api.put(`/mail/read/${mail.id}`); 
        } catch (err) {
            console.error("Gagal menandai pesan terbaca");
        }
    };

    const handleMarkAllRead = () => {
        if(!confirm("Tandai semua pesan sebagai sudah dibaca?")) return;
        
        const updatedMails = mails.map(m => ({ ...m, is_read: true }));
        setMails(updatedMails);
        toast.success("Semua pesan ditandai sudah dibaca");
        
        // api.put('/mail/read-all');
    };

    const handleSelectMessage = (mail) => {
        setSelected(mail);
        markAsRead(mail);
    };

    // --- FILTER & SEARCH LOGIC ---
    const filteredMails = useMemo(() => {
        return mails.filter(mail => {
            const matchesType = 
                filterType === 'all' ? true :
                filterType === 'broadcast' ? mail.target_scope === 'broadcast' :
                mail.target_scope !== 'broadcast';

            const matchesSearch = 
                mail.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                mail.sender_name.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesType && matchesSearch;
        });
    }, [mails, filterType, searchQuery]);

    const getLink = (url) => {
        if (!url) return '#';
        if (url.includes('/upload/')) {
            return url.replace('/upload/', '/upload/fl_attachment/');
        }
        return url;
    };

    return (
        <div className="p-3 md:p-8 max-w-6xl mx-auto font-sans min-h-screen bg-gray-50 pb-24">
            
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-black text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                            <Inbox size={24} className="md:w-7 md:h-7" />
                        </div>
                        Kotak Masuk
                    </h1>
                    <p className="text-gray-500 mt-1 ml-1 text-xs md:text-sm font-medium">
                        {mails.filter(m => !m.is_read).length} Pesan belum dibaca
                    </p>
                </div>

                <button 
                    onClick={handleMarkAllRead}
                    className="w-full md:w-auto px-4 py-3 bg-white border border-gray-200 text-gray-600 text-xs md:text-sm font-bold rounded-xl hover:bg-gray-50 transition flex items-center justify-center gap-2 shadow-sm active:scale-95"
                >
                    <CheckCheck size={16} className="text-blue-500"/> Tandai Semua Dibaca
                </button>
            </div>

            {/* SEARCH & TABS */}
            <div className="bg-white p-3 md:p-2 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-3">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                    <input 
                        type="text" 
                        placeholder="Cari pesan..." 
                        className="w-full pl-11 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none transition placeholder-gray-400"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Tabs - SCROLLABLE ON MOBILE */}
                <div className="flex overflow-x-auto pb-1 md:pb-0 gap-2 no-scrollbar bg-gray-50 md:bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${filterType === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Mail size={14}/> Semua
                    </button>
                    <button 
                        onClick={() => setFilterType('direct')}
                        className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${filterType === 'direct' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <MessageSquare size={14}/> Pesan Masuk
                    </button>
                    <button 
                        onClick={() => setFilterType('broadcast')}
                        className={`px-4 py-2 rounded-lg text-xs md:text-sm font-bold transition flex items-center gap-2 whitespace-nowrap flex-shrink-0 ${filterType === 'broadcast' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Megaphone size={14}/> Pengumuman
                    </button>
                </div>
            </div>

            {/* MESSAGE LIST */}
            <div className="flex flex-col gap-3">
                {loading ? (
                    <div className="text-center py-12 text-gray-400 flex flex-col items-center gap-2">
                         <div className="w-6 h-6 border-2 border-gray-300 border-t-blue-600 rounded-full animate-spin"></div>
                         <span className="text-sm">Memuat pesan...</span>
                    </div>
                ) : filteredMails.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-14 h-14 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-3">
                            <Filter className="text-gray-300" size={24} />
                        </div>
                        <p className="text-gray-500 font-medium text-sm">Tidak ada pesan ditemukan.</p>
                    </div>
                ) : (
                    filteredMails.map((m, i) => (
                        <motion.div 
                            key={m.id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleSelectMessage(m)}
                            className={`group p-4 rounded-2xl border cursor-pointer transition-all active:scale-[0.98] flex gap-3 md:gap-4 items-start relative overflow-hidden
                                ${!m.is_read ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-50' : 'bg-white border-gray-100 hover:border-blue-200'}
                            `}
                        >
                            {/* Unread Indicator (Mobile Friendly) */}
                            {!m.is_read && (
                                <div className="absolute top-4 right-4 w-2.5 h-2.5 bg-blue-500 rounded-full z-10 shadow-sm ring-2 ring-white" />
                            )}

                            {/* Icon / Thumbnail */}
                            <div className={`w-12 h-12 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 border 
                                ${m.target_scope === 'broadcast' ? 'bg-orange-50 border-orange-100 text-orange-500' : 'bg-blue-50 border-blue-100 text-blue-500'}
                            `}>
                                {m.file_path && ['jpg','png','jpeg'].includes(m.file_type) ? (
                                    <img src={m.file_path} className="w-full h-full object-cover rounded-2xl" alt="attachment" />
                                ) : (
                                    m.target_scope === 'broadcast' ? <Megaphone size={20} className="md:w-7 md:h-7" /> : <Mail size={20} className="md:w-7 md:h-7" />
                                )}
                            </div>

                            <div className="flex-1 min-w-0 pt-0.5">
                                <div className="flex justify-between items-start gap-2 mb-1">
                                    <span className={`text-[10px] font-extrabold uppercase tracking-wide px-2 py-0.5 rounded-md
                                        ${m.target_scope === 'broadcast' ? 'bg-orange-50 text-orange-600' : 'bg-blue-50 text-blue-600'}
                                    `}>
                                        {m.target_scope === 'broadcast' ? 'Broadcast' : 'Pesan'}
                                    </span>
                                    <span className="text-[10px] font-bold text-gray-400 whitespace-nowrap">
                                        {new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                
                                <h3 className={`text-sm md:text-lg pr-6 leading-tight mb-1 ${!m.is_read ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                    {m.title}
                                </h3>
                                
                                <p className={`text-xs md:text-sm line-clamp-2 mb-2 leading-relaxed ${!m.is_read ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                                    {m.description}
                                </p>
                                
                                <div className="flex items-center gap-3 text-[10px] md:text-xs font-bold text-gray-400">
                                    <div className="flex items-center gap-1.5 truncate max-w-[120px]">
                                        <div className="w-4 h-4 rounded-full bg-gray-100 flex items-center justify-center shrink-0">
                                            <User size={8} />
                                        </div>
                                        {m.sender_name}
                                    </div>
                                    {m.file_type && (
                                        <div className="flex items-center gap-1 text-gray-500 bg-gray-50 px-1.5 py-0.5 rounded border border-gray-200">
                                            <Download size={8} /> File
                                        </div>
                                    )}
                                </div>
                            </div>
                        </motion.div>
                    ))
                )}
            </div>

            {/* DETAIL MODAL */}
            <AnimatePresence>
                {selected && (
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-end md:items-center justify-center p-0 md:p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
                        <motion.div 
                            initial={{ opacity: 0, y: 100 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            exit={{ opacity: 0, y: 100 }}
                            className="bg-white w-full max-w-2xl rounded-t-3xl md:rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" 
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header Modal */}
                            <div className="p-5 md:p-6 border-b border-gray-100 bg-gray-50/80 sticky top-0 z-10 backdrop-blur-sm">
                                <div className="flex justify-between items-start gap-4">
                                    <div>
                                        <div className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-md text-[10px] font-black uppercase tracking-widest mb-2
                                            ${selected.target_scope === 'broadcast' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}
                                        `}>
                                            {selected.target_scope === 'broadcast' ? <Megaphone size={10}/> : <MessageSquare size={10}/>}
                                            {selected.target_scope === 'broadcast' ? 'Broadcast' : 'Direct'}
                                        </div>
                                        <h2 className="text-xl md:text-2xl font-black text-gray-900 leading-tight">{selected.title}</h2>
                                        
                                        <div className="flex items-center gap-2 mt-3 text-xs md:text-sm text-gray-500">
                                            <div className="flex items-center gap-1.5 bg-white px-2 py-1 rounded border border-gray-200 shadow-sm">
                                                <User size={12} className="text-blue-500"/>
                                                <span className="font-bold text-gray-700">{selected.sender_name}</span>
                                            </div>
                                            <span className="text-gray-300">•</span>
                                            <span>{new Date(selected.created_at).toLocaleDateString('id-ID', { dateStyle: 'long' })}</span>
                                        </div>
                                    </div>
                                    <button onClick={() => setSelected(null)} className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full text-gray-500 transition shadow-sm shrink-0">
                                        <X size={20}/>
                                    </button>
                                </div>
                            </div>

                            {/* Content Scrollable */}
                            <div className="p-5 md:p-6 overflow-y-auto custom-scrollbar bg-white">
                                {['jpg','png','jpeg'].includes(selected.file_type) && (
                                    <div className="mb-6 rounded-2xl overflow-hidden border border-gray-100 bg-gray-50 p-2">
                                        <img src={selected.file_path} className="w-full h-auto max-h-80 object-contain rounded-xl" alt="Preview" />
                                    </div>
                                )}

                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap font-medium">
                                    {selected.description}
                                </div>
                            </div>

                            {/* Footer / Action */}
                            {selected.file_path && (
                                <div className="p-4 md:p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                                    <a 
                                        href={getLink(selected.file_path)} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="w-full md:w-auto px-6 py-3.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition flex items-center justify-center gap-2 text-sm"
                                    >
                                        <Download size={18}/> 
                                        Download Lampiran
                                    </a>
                                </div>
                            )}
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
};

export default InfoInbox;
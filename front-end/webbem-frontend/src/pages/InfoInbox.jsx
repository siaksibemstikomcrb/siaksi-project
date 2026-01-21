import { useState, useEffect, useMemo } from 'react';
import api from '../api/axios';
// PERBAIKAN: Ganti 'CheckDouble' menjadi 'CheckCheck'
import { 
    Mail, Calendar, User, Download, X, Search, 
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
            // Panggil API (jika ada endpointnya)
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
        
        // Panggil API
        // api.put('/mail/read-all');
    };

    const handleSelectMessage = (mail) => {
        setSelected(mail);
        markAsRead(mail);
    };

    // --- FILTER & SEARCH LOGIC ---
    const filteredMails = useMemo(() => {
        return mails.filter(mail => {
            // 1. Filter by Category (Direct vs Broadcast)
            const matchesType = 
                filterType === 'all' ? true :
                filterType === 'broadcast' ? mail.target_scope === 'broadcast' :
                mail.target_scope !== 'broadcast'; // 'direct'

            // 2. Filter by Search
            const matchesSearch = 
                mail.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
                mail.sender_name.toLowerCase().includes(searchQuery.toLowerCase());

            return matchesType && matchesSearch;
        });
    }, [mails, filterType, searchQuery]);

    // Fix link download
    const getLink = (url) => {
        if (!url) return '#';
        if (url.includes('/upload/')) {
            return url.replace('/upload/', '/upload/fl_attachment/');
        }
        return url;
    };

    return (
        <div className="p-4 md:p-8 max-w-6xl mx-auto font-sans min-h-screen bg-gray-50/50">
            
            {/* HEADER & CONTROLS */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
                <div>
                    <h1 className="text-3xl font-black text-gray-900 flex items-center gap-3">
                        <div className="p-2 bg-blue-600 rounded-xl text-white shadow-lg shadow-blue-200">
                            <Inbox size={28} />
                        </div>
                        Kotak Masuk
                    </h1>
                    <p className="text-gray-500 mt-1 ml-1 text-sm font-medium">
                        {mails.filter(m => !m.is_read).length} Pesan belum dibaca
                    </p>
                </div>

                <div className="flex flex-wrap gap-2 w-full md:w-auto">
                    <button 
                        onClick={handleMarkAllRead}
                        className="px-4 py-2.5 bg-white border border-gray-200 text-gray-600 text-sm font-bold rounded-xl hover:bg-gray-50 transition flex items-center gap-2 shadow-sm"
                    >
                        {/* PERBAIKAN ICON DISINI */}
                        <CheckCheck size={18} className="text-blue-500"/> Tandai Semua Dibaca
                    </button>
                </div>
            </div>

            {/* SEARCH & TABS */}
            <div className="bg-white p-2 rounded-2xl border border-gray-200 shadow-sm mb-6 flex flex-col md:flex-row gap-2">
                {/* Search Bar */}
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                    <input 
                        type="text" 
                        placeholder="Cari pesan atau pengirim..." 
                        className="w-full pl-12 pr-4 py-3 bg-gray-50 border-none rounded-xl text-sm font-medium focus:ring-2 focus:ring-blue-100 outline-none transition"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>

                {/* Filter Tabs */}
                <div className="flex bg-gray-100 p-1 rounded-xl">
                    <button 
                        onClick={() => setFilterType('all')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${filterType === 'all' ? 'bg-white text-gray-900 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Mail size={16}/> Semua
                    </button>
                    <button 
                        onClick={() => setFilterType('direct')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${filterType === 'direct' ? 'bg-white text-blue-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <MessageSquare size={16}/> Pesan Masuk
                    </button>
                    <button 
                        onClick={() => setFilterType('broadcast')}
                        className={`px-4 py-2 rounded-lg text-sm font-bold transition flex items-center gap-2 ${filterType === 'broadcast' ? 'bg-white text-orange-600 shadow-sm' : 'text-gray-500 hover:text-gray-700'}`}
                    >
                        <Megaphone size={16}/> Pengumuman
                    </button>
                </div>
            </div>

            {/* MESSAGE LIST */}
            <div className="grid gap-3">
                {loading ? (
                    <div className="text-center py-12 text-gray-400">Memuat pesan...</div>
                ) : filteredMails.length === 0 ? (
                    <div className="text-center py-16 bg-white rounded-3xl border border-dashed border-gray-200">
                        <div className="w-16 h-16 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-4">
                            <Filter className="text-gray-300" size={32} />
                        </div>
                        <p className="text-gray-500 font-medium">Tidak ada pesan ditemukan.</p>
                    </div>
                ) : (
                    filteredMails.map((m, i) => (
                        <motion.div 
                            key={m.id} 
                            initial={{ opacity: 0, y: 10 }} 
                            animate={{ opacity: 1, y: 0 }} 
                            transition={{ delay: i * 0.05 }}
                            onClick={() => handleSelectMessage(m)}
                            className={`group p-4 md:p-5 rounded-2xl border cursor-pointer transition-all hover:-translate-y-1 hover:shadow-lg flex gap-4 items-start relative overflow-hidden
                                ${!m.is_read ? 'bg-white border-blue-200 shadow-md ring-1 ring-blue-100' : 'bg-white border-gray-100 hover:border-blue-200'}
                            `}
                        >
                            {/* Unread Indicator */}
                            {!m.is_read && (
                                <div className="absolute top-0 right-0 w-16 h-16 bg-gradient-to-bl from-blue-500 to-transparent opacity-10 pointer-events-none rounded-bl-full" />
                            )}
                            {!m.is_read && (
                                <div className="absolute top-4 right-4 w-2 h-2 bg-blue-500 rounded-full" />
                            )}

                            {/* Thumbnail / Icon Type */}
                            <div className={`w-14 h-14 md:w-16 md:h-16 rounded-2xl flex items-center justify-center shrink-0 border 
                                ${m.target_scope === 'broadcast' ? 'bg-orange-50 border-orange-100 text-orange-500' : 'bg-blue-50 border-blue-100 text-blue-500'}
                            `}>
                                {m.file_path && ['jpg','png','jpeg'].includes(m.file_type) ? (
                                    <img src={m.file_path} className="w-full h-full object-cover rounded-2xl" alt="attachment" />
                                ) : (
                                    m.target_scope === 'broadcast' ? <Megaphone size={28} /> : <Mail size={28} />
                                )}
                            </div>

                            <div className="flex-1 min-w-0">
                                <div className="flex justify-between items-start mb-1">
                                    <div className="flex flex-col">
                                        <span className={`text-xs font-bold uppercase tracking-wider mb-1 
                                            ${m.target_scope === 'broadcast' ? 'text-orange-600' : 'text-blue-600'}
                                        `}>
                                            {m.target_scope === 'broadcast' ? 'Pengumuman / Broadcast' : 'Pesan UKM'}
                                        </span>
                                        <h3 className={`text-base md:text-lg truncate pr-6 ${!m.is_read ? 'font-black text-gray-900' : 'font-bold text-gray-700'}`}>
                                            {m.title}
                                        </h3>
                                    </div>
                                    <span className="text-xs font-bold text-gray-400 whitespace-nowrap bg-gray-50 px-2 py-1 rounded-lg border border-gray-100">
                                        {new Date(m.created_at).toLocaleDateString('id-ID', { day: 'numeric', month: 'short' })}
                                    </span>
                                </div>
                                
                                <p className={`text-sm line-clamp-2 mb-3 ${!m.is_read ? 'text-gray-600 font-medium' : 'text-gray-400'}`}>
                                    {m.description}
                                </p>
                                
                                <div className="flex items-center gap-4 text-xs font-bold text-gray-400">
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-5 h-5 rounded-full bg-gray-100 flex items-center justify-center">
                                            <User size={10} />
                                        </div>
                                        {m.sender_name}
                                    </div>
                                    {m.file_type && (
                                        <div className="flex items-center gap-1 text-gray-500 bg-gray-50 px-2 py-0.5 rounded border border-gray-200">
                                            <Download size={10} /> Lampiran ({m.file_type.toUpperCase()})
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
                    <div className="fixed inset-0 z-50 bg-black/60 flex items-center justify-center p-4 backdrop-blur-sm" onClick={() => setSelected(null)}>
                        <motion.div 
                            initial={{ opacity: 0, scale: 0.95, y: 20 }} 
                            animate={{ opacity: 1, scale: 1, y: 0 }} 
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="bg-white w-full max-w-2xl rounded-3xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]" 
                            onClick={e => e.stopPropagation()}
                        >
                            {/* Header Modal */}
                            <div className="p-6 border-b border-gray-100 flex justify-between items-start bg-gray-50/50">
                                <div>
                                    <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-black uppercase tracking-widest mb-3
                                        ${selected.target_scope === 'broadcast' ? 'bg-orange-100 text-orange-700' : 'bg-blue-100 text-blue-700'}
                                    `}>
                                        {selected.target_scope === 'broadcast' ? <Megaphone size={12}/> : <MessageSquare size={12}/>}
                                        {selected.target_scope === 'broadcast' ? 'Broadcast' : 'Direct Message'}
                                    </div>
                                    <h2 className="text-2xl font-black text-gray-900 leading-tight">{selected.title}</h2>
                                    <p className="text-sm text-gray-500 font-bold mt-2 flex items-center gap-2">
                                        Dari: <span className="text-blue-600">{selected.sender_name}</span>
                                        <span className="w-1 h-1 bg-gray-300 rounded-full"/>
                                        <span>{new Date(selected.created_at).toLocaleDateString('id-ID', { dateStyle: 'full' })}</span>
                                    </p>
                                </div>
                                <button onClick={() => setSelected(null)} className="p-2 bg-white border border-gray-200 hover:bg-gray-100 rounded-full text-gray-500 transition shadow-sm">
                                    <X size={20}/>
                                </button>
                            </div>

                            {/* Content Scrollable */}
                            <div className="p-6 overflow-y-auto custom-scrollbar">
                                {/* Image Preview if available */}
                                {['jpg','png','jpeg'].includes(selected.file_type) && (
                                    <div className="mb-6 rounded-2xl overflow-hidden border border-gray-200 bg-gray-50 shadow-sm">
                                        <img src={selected.file_path} className="w-full h-auto max-h-96 object-contain mx-auto" alt="Preview" />
                                    </div>
                                )}

                                <div className="prose prose-sm max-w-none text-gray-700 leading-relaxed whitespace-pre-wrap">
                                    {selected.description}
                                </div>
                            </div>

                            {/* Footer / Action */}
                            {selected.file_path && (
                                <div className="p-6 border-t border-gray-100 bg-gray-50 flex justify-end">
                                    <a 
                                        href={getLink(selected.file_path)} 
                                        target="_blank" 
                                        rel="noreferrer"
                                        className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl shadow-lg shadow-blue-200 transition flex items-center gap-2"
                                    >
                                        <Download size={18}/> 
                                        Download Lampiran {selected.file_type && `(${selected.file_type.toUpperCase()})`}
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
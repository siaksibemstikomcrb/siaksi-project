import { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { 
    Folder, FileText, Image as ImageIcon, Upload, FolderPlus, 
    ArrowLeft, Trash2, Download, Cloud, File, CheckSquare, Square, 
    Move, X, CornerDownRight, ChevronRight, Home, FileArchive, MonitorPlay,
    Loader2, CheckCircle2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'sonner';

const DocumentArchive = () => {
    // --- STATE UTAMA ---
    const [content, setContent] = useState({ folders: [], files: [] });
    const [currentFolder, setCurrentFolder] = useState(null);
    const [loading, setLoading] = useState(false);
    
    // --- STATE SELEKSI & DRAG DROP ---
    const [selectedItems, setSelectedItems] = useState([]); 
    const [isDragging, setIsDragging] = useState(false);
    const [dragTarget, setDragTarget] = useState(null);

    // --- STATE UPLOAD & DOWNLOAD ---
    const [uploading, setUploading] = useState(false);
    const [uploadProgress, setUploadProgress] = useState(0); 
    const [downloading, setDownloading] = useState(false); // State untuk loading download

    // --- STATE MODAL ---
    const [showFolderModal, setShowFolderModal] = useState(false);
    const [newFolderName, setNewFolderName] = useState("");
    
    // --- STATE MODAL PINDAH (MOVE TO) ---
    const [showMoveModal, setShowMoveModal] = useState(false);
    const [modalFolders, setModalFolders] = useState([]); 
    const [modalCurrentFolder, setModalCurrentFolder] = useState(null); 
    const [moving, setMoving] = useState(false);

    const fileInputRef = useRef(null);

    // --- 1. FETCH DATA UTAMA ---
    const fetchContent = async (folderId = null) => {
        setLoading(true);
        try {
            const res = await api.get(`/documents/content`, { params: { folderId } });
            setContent({ folders: res.data.folders, files: res.data.files });
            setCurrentFolder(res.data.currentFolder);
            setSelectedItems([]); 
        } catch (err) { 
            console.error(err);
            toast.error("Gagal memuat dokumen");
        } 
        finally { setLoading(false); }
    };

    useEffect(() => { fetchContent(null); }, []);

    // --- 2. LOGIKA SELEKSI ---
    const toggleSelection = (type, id) => {
        const itemKey = `${type}-${id}`;
        if (selectedItems.includes(itemKey)) {
            setSelectedItems(selectedItems.filter(i => i !== itemKey));
        } else {
            setSelectedItems([...selectedItems, itemKey]);
        }
    };
    
    // FITUR BARU: PILIH SEMUA FILE
    const selectAllFiles = () => {
        const allFileKeys = content.files.map(f => `file-${f.id}`);
        // Jika semua sudah terpilih, batalkan pilihan. Jika belum, pilih semua.
        const allSelected = allFileKeys.every(k => selectedItems.includes(k));
        
        if (allSelected) {
            // Hapus file dari seleksi (sisakan folder jika ada)
            setSelectedItems(selectedItems.filter(i => !i.startsWith('file-')));
        } else {
            // Gabungkan seleksi folder yg sudah ada dengan semua file
            const foldersOnly = selectedItems.filter(i => i.startsWith('folder-'));
            setSelectedItems([...foldersOnly, ...allFileKeys]);
            toast.success(`${allFileKeys.length} file dipilih`);
        }
    };

    const isSelected = (type, id) => selectedItems.includes(`${type}-${id}`);

    // --- 3. DRAG & DROP ---
    const handleDragStart = (e, type, id) => {
        if (!isSelected(type, id)) setSelectedItems([`${type}-${id}`]);
        e.dataTransfer.effectAllowed = "move";
        setIsDragging(true);
    };
    const handleDragOver = (e, folderId) => { e.preventDefault(); setDragTarget(folderId); };
    const handleDragLeave = () => setDragTarget(null);
    const handleDrop = async (e, targetFolderId) => {
        e.preventDefault(); setIsDragging(false); setDragTarget(null);
        await executeMove(targetFolderId);
    };

    // --- 4. EKSEKUSI PINDAH ---
    const executeMove = async (targetFolderId) => {
        const itemsToMove = selectedItems.map(item => {
            const [type, id] = item.split('-');
            return { type, id: parseInt(id) };
        });

        if (itemsToMove.length === 0) return;

        setMoving(true);
        try {
            await api.put('/documents/move', {
                target_folder_id: targetFolderId,
                items: itemsToMove
            });
            fetchContent(currentFolder?.id);
            setShowMoveModal(false);
            toast.success(`Berhasil memindahkan ${itemsToMove.length} item!`);
        } catch (err) {
            toast.error("Gagal memindahkan file.");
        } finally {
            setMoving(false);
        }
    };

    // --- 5. LOGIKA MODAL PINDAH ---
    const fetchModalContent = async (folderId = null) => {
        try {
            const res = await api.get(`/documents/content`, { params: { folderId } });
            setModalFolders(res.data.folders); 
            setModalCurrentFolder(res.data.currentFolder);
        } catch (err) { console.error(err); }
    };

    const openMoveModal = () => {
        setModalCurrentFolder(null); 
        fetchModalContent(null);
        setShowMoveModal(true);
    };

    // --- 6. UPLOAD & FILES ---
    const handleFileUpload = async (e) => {
        const files = e.target.files;
        if (!files || files.length === 0) return;
        const formData = new FormData();
        formData.append('folder_id', currentFolder?.id || null);
        for (let i = 0; i < files.length; i++) { formData.append('files', files[i]); }

        setUploading(true); setUploadProgress(0);
        try {
            await api.post('/documents/upload', formData, {
                headers: { 'Content-Type': 'multipart/form-data' },
                onUploadProgress: (ev) => setUploadProgress(Math.round((ev.loaded * 100) / ev.total))
            });
            toast.success("Upload berhasil!");
            setTimeout(() => { setUploading(false); fetchContent(currentFolder?.id); }, 800);
        } catch (err) { 
            setUploading(false); 
            toast.error("Gagal upload file."); 
        } 
        finally { if (fileInputRef.current) fileInputRef.current.value = ""; }
    };

    const handleCreateFolder = async () => {
        if (!newFolderName) return;
        try {
            await api.post('/documents/folder', { name: newFolderName, parent_id: currentFolder?.id || null });
            setShowFolderModal(false); setNewFolderName(""); fetchContent(currentFolder?.id);
            toast.success("Folder dibuat");
        } catch (err) { toast.error("Gagal buat folder"); }
    };

    const handleDeleteSelected = async () => {
        if(!confirm(`Hapus ${selectedItems.length} item yang dipilih?`)) return;
        try {
            for (const item of selectedItems) {
                const [type, id] = item.split('-');
                if (type === 'folder') await api.delete(`/documents/folder/${id}`);
                else await api.delete(`/documents/file/${id}`);
            }
            fetchContent(currentFolder?.id);
            toast.success("Item berhasil dihapus");
        } catch (err) { toast.error("Gagal menghapus."); }
    };

    const handleDeleteSingle = async (type, id) => {
        if(!confirm(`Hapus item ini?`)) return;
        try {
            if (type === 'folder') await api.delete(`/documents/folder/${id}`);
            else await api.delete(`/documents/file/${id}`);
            fetchContent(currentFolder?.id);
            toast.success("Dihapus.");
        } catch (err) { toast.error("Gagal menghapus."); }
    };

    // =========================================================
    // FITUR URL & DOWNLOAD
    // =========================================================
    const getDownloadUrl = (file) => {
        if (!file || !file.file_path) return '#';
        let url = file.file_path;
        
        if (url.includes('/upload/')) {
            const hasExtension = /\.(pdf|docx|doc|xlsx|xls|pptx|ppt|zip|rar|jpg|jpeg|png)$/i.test(url);
            if (!hasExtension) return url; 
            
            const safeTitle = file.title ? file.title.replace(/[^a-zA-Z0-9-_]/g, '_') : 'download';
            if (url.includes('/image/upload/')) return url.replace('/upload/', `/upload/fl_attachment:${safeTitle}/`);
            if (url.includes('/raw/upload/')) return url.replace('/upload/', '/upload/fl_attachment/');
        }
        return url;
    };

    // --- FITUR BARU: DOWNLOAD BANYAK SEKALIGUS ---
   // --- FITUR BARU: DOWNLOAD BANYAK SEKALIGUS (DENGAN PERBAIKAN EKSTENSI) ---
    const handleBulkDownload = async () => {
        // Filter hanya ambil yang tipe-nya FILE
        const filesToDownload = selectedItems
            .filter(item => item.startsWith('file-'))
            .map(item => {
                const id = parseInt(item.split('-')[1]);
                return content.files.find(f => f.id === id);
            })
            .filter(Boolean);

        if (filesToDownload.length === 0) {
            return toast.error("Pilih minimal satu file untuk didownload.");
        }

        setDownloading(true);
        toast.info(`Memulai download ${filesToDownload.length} file...`);

        // Loop download satu per satu
        for (let i = 0; i < filesToDownload.length; i++) {
            const file = filesToDownload[i];
            
            try {
                // 1. Tentukan Nama File yang Benar (Paksa pakai ekstensi)
                // Kalau judulnya 'Laporan', dan tipenya 'pdf', jadikan 'Laporan.pdf'
                let fileName = file.title;
                if (!fileName.toLowerCase().endsWith(`.${file.file_type}`)) {
                    fileName = `${fileName}.${file.file_type}`;
                }

                // 2. Ambil URL (Gunakan URL asli, jangan yang dimodifikasi 'fl_attachment' dulu)
                // Kita akan fetch manual, jadi butuh URL mentah
                const fileUrl = file.file_path; 

                // 3. FETCH DATA SEBAGAI BLOB (PENTING!)
                // Ini membypass masalah nama file dari Cloudinary
                const response = await fetch(fileUrl);
                const blob = await response.blob();
                
                // 4. Buat Link Palsu di Memory Browser
                const blobUrl = window.URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = blobUrl;
                link.setAttribute('download', fileName); // Browser PASTI nurut nama ini
                document.body.appendChild(link);
                
                // 5. Klik & Bersihkan
                link.click();
                document.body.removeChild(link);
                window.URL.revokeObjectURL(blobUrl);

            } catch (error) {
                console.error(`Gagal download ${file.title}`, error);
                // Fallback: Kalau fetch gagal (kena CORS), coba buka tab baru aja
                window.open(getDownloadUrl(file), '_blank');
            }

            // Delay kecil biar browser ga nge-hang kalau download banyak
            await new Promise(resolve => setTimeout(resolve, 800));
        }

        setDownloading(false);
        toast.success("Proses download selesai!");
    };

    // --- ICON HELPER ---
    const getFileIcon = (type) => {
        if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(type)) return <ImageIcon size={32} className="text-purple-500" />;
        if (type === 'pdf') return <FileText size={32} className="text-red-500" />;
        if (['doc', 'docx'].includes(type)) return <FileText size={32} className="text-blue-600" />;
        if (['xls', 'xlsx', 'csv'].includes(type)) return <FileText size={32} className="text-green-600" />;
        if (['ppt', 'pptx'].includes(type)) return <MonitorPlay size={32} className="text-orange-500" />;
        if (['zip', 'rar', '7z'].includes(type)) return <FileArchive size={32} className="text-yellow-600" />;
        return <File size={32} className="text-gray-400" />;
    };

    return (
        <div className="p-3 md:p-6 h-[calc(100vh-80px)] flex flex-col bg-gray-50/50 relative">
            
            {/* HEADER RESPONSIVE */}
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4 md:mb-6 gap-3">
                <div className="w-full md:w-auto">
                    <h1 className="text-lg md:text-2xl font-bold text-gray-800 flex items-center gap-2 truncate">
                        {currentFolder && (
                            <button onClick={() => fetchContent(currentFolder.parent_id)} 
                                onDragOver={(e) => handleDragOver(e, 'back-btn')}
                                onDragLeave={handleDragLeave}
                                onDrop={(e) => handleDrop(e, currentFolder.parent_id || 'root')}
                                className={`p-1 rounded-full transition ${dragTarget === 'back-btn' ? 'bg-blue-200' : 'hover:bg-gray-200'}`}
                            >
                                <ArrowLeft size={24} />
                            </button>
                        )}
                        <span className="truncate max-w-[200px] md:max-w-none">{currentFolder ? currentFolder.name : "My Drive (UKM)"}</span>
                    </h1>
                    <p className="text-gray-500 text-xs md:text-sm mt-1 ml-1 flex items-center gap-2">
                        {currentFolder ? "Folder Penyimpanan" : "Root Directory"}
                        {/* Tombol Pilih Semua (Khusus Mobile) */}
                        {content.files.length > 0 && (
                            <button onClick={selectAllFiles} className="md:hidden text-blue-600 font-bold text-xs bg-blue-50 px-2 py-1 rounded ml-2">
                                {selectedItems.length === content.files.length ? "Batal Pilih" : "Pilih Semua"}
                            </button>
                        )}
                    </p>
                </div>

                <div className="grid grid-cols-2 gap-2 w-full md:flex md:w-auto">
                    <button onClick={() => setShowFolderModal(true)} className="justify-center flex items-center gap-2 px-3 py-2 bg-white border border-gray-300 text-gray-700 rounded-xl hover:bg-gray-50 font-medium transition text-xs md:text-sm">
                        <FolderPlus size={16} /> Folder Baru
                    </button>
                    <button onClick={() => fileInputRef.current.click()} className="justify-center flex items-center gap-2 px-3 py-2 bg-blue-600 text-white rounded-xl hover:bg-blue-700 font-medium transition shadow-lg shadow-blue-600/20 active:scale-95 text-xs md:text-sm">
                        <Upload size={16} /> Upload
                    </button>
                    <input type="file" multiple className="hidden" ref={fileInputRef} onChange={handleFileUpload} />
                </div>
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 overflow-y-auto pb-32 px-1" onClick={() => setSelectedItems([])}>
                {/* Empty State */}
                {!loading && content.folders.length === 0 && content.files.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-64 text-gray-400 border-2 border-dashed border-gray-200 rounded-2xl mx-4 mt-8">
                        <FolderPlus size={48} className="mb-2 opacity-20" />
                        <p>Folder ini kosong</p>
                    </div>
                )}

                {/* Folders Grid */}
                {content.folders.length > 0 && (
                    <div className="mb-6">
                        <h3 className="text-xs font-bold text-gray-400 uppercase mb-3 ml-1">Folders</h3>
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                            {content.folders.map(folder => (
                                <div 
                                    key={folder.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, 'folder', folder.id)}
                                    onDragOver={(e) => handleDragOver(e, folder.id)}
                                    onDragLeave={handleDragLeave}
                                    onDrop={(e) => { e.stopPropagation(); if (!isSelected('folder', folder.id)) handleDrop(e, folder.id); }}
                                    onClick={(e) => { e.stopPropagation(); toggleSelection('folder', folder.id); }}
                                    onDoubleClick={(e) => { e.stopPropagation(); fetchContent(folder.id); }}
                                    className={`group p-3 md:p-4 rounded-xl border-2 transition cursor-pointer flex flex-col items-center text-center relative select-none
                                        ${dragTarget === folder.id ? 'border-blue-500 bg-blue-100 scale-105 z-10' : 'border-transparent bg-white hover:shadow-md border-gray-200'}
                                        ${isSelected('folder', folder.id) ? 'ring-2 ring-blue-500 bg-blue-50' : ''}
                                    `}
                                >
                                    <div className={`absolute top-2 left-2 ${isSelected('folder', folder.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {isSelected('folder', folder.id) ? <CheckSquare size={18} className="text-blue-600 fill-white"/> : <Square size={18} className="text-gray-300"/>}
                                    </div>
                                    <Folder size={40} className={`${isSelected('folder', folder.id) ? 'text-blue-500 fill-blue-100' : 'text-blue-200 fill-blue-100'} mb-2 md:w-12 md:h-12`} />
                                    <span className="text-xs md:text-sm font-medium text-gray-700 truncate w-full px-1">{folder.name}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* Files Grid */}
                {content.files.length > 0 && (
                    <div>
                        <div className="flex justify-between items-center mb-3 ml-1">
                            <h3 className="text-xs font-bold text-gray-400 uppercase">Files</h3>
                            {/* Tombol Select All Desktop */}
                            <button onClick={selectAllFiles} className="hidden md:flex items-center gap-1 text-xs font-bold text-blue-600 hover:bg-blue-50 px-2 py-1 rounded transition">
                                <CheckCircle2 size={14} /> Pilih Semua
                            </button>
                        </div>
                        
                        <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-3 md:gap-4">
                            {content.files.map(file => (
                                <div 
                                    key={file.id}
                                    draggable
                                    onDragStart={(e) => handleDragStart(e, 'file', file.id)}
                                    onClick={(e) => { e.stopPropagation(); toggleSelection('file', file.id); }}
                                    className={`group relative p-2 md:p-4 rounded-xl border-2 hover:shadow-md transition flex flex-col justify-between h-32 md:h-40 cursor-grab active:cursor-grabbing
                                        ${isSelected('file', file.id) ? 'ring-2 ring-blue-500 bg-blue-50 border-blue-200' : 'bg-white border-gray-200'}
                                    `}
                                >
                                    <div className={`absolute top-2 left-2 z-10 ${isSelected('file', file.id) ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                        {isSelected('file', file.id) ? <CheckSquare size={18} className="text-blue-600 fill-white"/> : <Square size={18} className="text-gray-300"/>}
                                    </div>
                                    <div className="flex justify-center items-center flex-1 mb-2 overflow-hidden pointer-events-none">
                                        {['jpg','jpeg','png','gif','webp'].includes(file.file_type) ? (
                                            <img src={file.file_path} alt={file.title} className="max-h-full object-cover rounded-lg" />
                                        ) : getFileIcon(file.file_type)}
                                    </div>
                                    <div className="text-center pointer-events-none">
                                        <p className="text-[10px] md:text-xs font-medium text-gray-700 truncate w-full">{file.title}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* --- FLOATING ACTION BAR (OPTIMAL UNTUK MOBILE) --- */}
            <AnimatePresence>
                {selectedItems.length > 0 && (
                    <motion.div 
                        initial={{ y: 100, opacity: 0 }} animate={{ y: 0, opacity: 1 }} exit={{ y: 100, opacity: 0 }}
                        className="fixed bottom-4 left-3 right-3 md:left-1/2 md:right-auto md:-translate-x-1/2 md:w-auto bg-slate-900 text-white shadow-2xl rounded-2xl p-2 md:p-3 border border-slate-700 z-40 flex items-center justify-between gap-2 md:gap-4"
                    >
                        <div className="flex items-center gap-2 pl-2 border-r border-slate-700 pr-3">
                            <span className="bg-blue-500 text-white text-[10px] md:text-xs font-bold px-2 py-0.5 rounded-full">{selectedItems.length}</span>
                            <span className="text-xs md:text-sm font-medium hidden md:inline">Terpilih</span>
                        </div>

                        <div className="flex items-center gap-1 md:gap-2">
                            {/* TOMBOL BULK DOWNLOAD BARU */}
                            <button 
                                onClick={handleBulkDownload} 
                                disabled={downloading}
                                className="flex flex-col md:flex-row items-center gap-1 px-3 py-1.5 md:py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-blue-400"
                            >
                                {downloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                <span className="text-[10px] md:text-sm font-medium">Unduh</span>
                            </button>

                            <button onClick={openMoveModal} className="flex flex-col md:flex-row items-center gap-1 px-3 py-1.5 md:py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-yellow-400">
                                <CornerDownRight size={18} /> 
                                <span className="text-[10px] md:text-sm font-medium">Pindah</span>
                            </button>

                            <button onClick={handleDeleteSelected} className="flex flex-col md:flex-row items-center gap-1 px-3 py-1.5 md:py-2 bg-slate-800 hover:bg-slate-700 rounded-xl transition text-red-400">
                                <Trash2 size={18} /> 
                                <span className="text-[10px] md:text-sm font-medium">Hapus</span>
                            </button>

                            <div className="w-[1px] h-8 bg-slate-700 mx-1"></div>

                            <button onClick={() => setSelectedItems([])} className="p-2 hover:bg-slate-800 rounded-full text-gray-400">
                                <X size={20} />
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* --- MODAL PINDAH KE (MOVE TO) --- */}
            {showMoveModal && (
                <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
                    <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="bg-white w-full max-w-md rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]">
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                            <h3 className="font-bold text-gray-800">Pindahkan {selectedItems.length} Item</h3>
                            <button onClick={() => setShowMoveModal(false)}><X size={20} className="text-gray-400" /></button>
                        </div>
                        
                        <div className="p-2 bg-white flex items-center gap-2 border-b border-gray-100 text-sm text-gray-600">
                            <button onClick={() => { setModalCurrentFolder(null); fetchModalContent(null); }} className="p-1 hover:bg-gray-100 rounded"><Home size={16}/></button>
                            <ChevronRight size={14} className="text-gray-300"/>
                            <span className="font-medium text-blue-600 truncate max-w-[200px]">
                                {modalCurrentFolder ? modalCurrentFolder.name : "Root"}
                            </span>
                        </div>

                        <div className="flex-1 overflow-y-auto p-2">
                            {modalCurrentFolder && (
                                <button 
                                    onClick={() => fetchModalContent(modalCurrentFolder.parent_id)}
                                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-gray-50 text-left mb-1"
                                >
                                    <div className="bg-gray-200 p-2 rounded-lg"><ArrowLeft size={16} className="text-gray-600"/></div>
                                    <span className="text-sm font-bold text-gray-600">... (Kembali)</span>
                                </button>
                            )}

                            {modalFolders.length === 0 ? (
                                <div className="text-center py-8 text-gray-400 text-sm">Tidak ada sub-folder</div>
                            ) : (
                                modalFolders.map(folder => (
                                    <button 
                                        key={folder.id}
                                        onClick={() => fetchModalContent(folder.id)}
                                        disabled={selectedItems.includes(`folder-${folder.id}`)}
                                        className="w-full flex items-center justify-between p-3 rounded-xl hover:bg-blue-50 text-left group disabled:opacity-50 disabled:cursor-not-allowed"
                                    >
                                        <div className="flex items-center gap-3">
                                            <Folder size={20} className="text-blue-300 fill-blue-100 group-hover:text-blue-500" />
                                            <span className="text-sm font-medium text-gray-700">{folder.name}</span>
                                        </div>
                                        <ChevronRight size={16} className="text-gray-300 group-hover:text-blue-400" />
                                    </button>
                                ))
                            )}
                        </div>

                        <div className="p-4 border-t border-gray-100 bg-gray-50 flex justify-end gap-2">
                            <button onClick={() => setShowMoveModal(false)} className="px-4 py-2 text-gray-600 font-bold text-sm hover:bg-gray-200 rounded-lg">Batal</button>
                            <button 
                                onClick={() => executeMove(modalCurrentFolder?.id || 'root')}
                                disabled={moving}
                                className="px-6 py-2 bg-blue-600 text-white font-bold text-sm rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:bg-gray-400"
                            >
                                {moving ? "Memindahkan..." : "Pindah Sini"}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

            {/* PROGRESS OVERLAY & CREATE FOLDER MODAL */}
            <AnimatePresence>
                {uploading && (
                    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[80] flex items-center justify-center bg-black/60 backdrop-blur-sm px-4">
                        <div className="bg-white p-6 rounded-2xl flex flex-col items-center animate-bounce">
                            <Cloud size={48} className="text-blue-500 mb-2" />
                            <span className="font-bold text-gray-700">{uploadProgress}% Uploading...</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {showFolderModal && (
                <div className="fixed inset-0 bg-black/50 z-[70] flex items-center justify-center p-4">
                    <div className="bg-white p-6 rounded-2xl w-full max-w-sm shadow-2xl animate-fade-in-up">
                        <h3 className="text-lg font-bold mb-4">Buat Folder Baru</h3>
                        <input autoFocus type="text" className="w-full border border-gray-300 rounded-lg p-3 outline-none focus:ring-2 focus:ring-blue-500" placeholder="Nama Folder..." value={newFolderName} onChange={(e) => setNewFolderName(e.target.value)} onKeyDown={(e) => e.key === 'Enter' && handleCreateFolder()} />
                        <div className="flex justify-end gap-2 mt-6">
                            <button onClick={() => setShowFolderModal(false)} className="px-4 py-2 text-gray-500 hover:bg-gray-100 rounded-lg font-bold text-sm">Batal</button>
                            <button onClick={handleCreateFolder} className="px-4 py-2 bg-blue-600 text-white rounded-lg font-bold text-sm hover:bg-blue-700">Buat</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default DocumentArchive;
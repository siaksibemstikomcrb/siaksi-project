import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
    LogOut, Activity, Users, Calendar, 
    ShieldCheck, Building, X, Bell, Send, FolderOpen, 
    Printer, Newspaper, BookOpen, 
    ChevronRight, MessageCircle, MessageSquare,
    Home 
} from 'lucide-react';
import api from '../api/axios'; 

const Sidebar = ({ isOpen, setIsOpen }) => {
    const navigate = useNavigate();
    const location = useLocation();
    const role = localStorage.getItem('role');
    
    const [unreadCount, setUnreadCount] = useState(0); 
    const [openMenus, setOpenMenus] = useState({}); 

    // --- 1. KONFIGURASI MENU ---
    const MENU_ITEMS = [
        {
            title: "Main Menu",
            items: [
                { label: "Dashboard", path: '/admin-dashboard', icon: Home, roles: ['admin', 'super_admin'] },
                { label: "Presensi", path: "/absen", icon: Activity, roles: ['member'] },
                { label: "Riwayat Saya", path: "/my-history", icon: Calendar, roles: ['member'] },
                { label: "Notifikasi", path: "/notifications", icon: Bell, roles: ['all'], badge: unreadCount },
            ]
        },
        {
            title: "Manajemen & Kegiatan",
            roles: ['admin', 'super_admin'],
            items: [
                { 
                    label: "Kelola Event", 
                    icon: Calendar,
                    roles: ['admin', 'super_admin'],
                    children: [
                        { label: "Buat Jadwal", path: "/admin-dashboard" },
                        { label: "Riwayat Acara", path: "/admin/events" },
                        { label: "Presensi Anggota", path: "/admin/members" },
                    ]
                },
                { 
                    label: "Data Master", 
                    icon: Building,
                    roles: ['super_admin', 'admin'], // ✅ UPDATE: Admin bisa lihat menu ini
                    children: [
                        // Kelola UKM tetap KHUSUS Super Admin
                        { label: "Kelola UKM", path: "/superadmin/manage-ukm", roles: ['super_admin'] }, 
                        
                        // Kelola Users (Input Manual) -> BISA Admin & Super Admin
                        { label: "Kelola Users", path: "/superadmin/manage-users", roles: ['super_admin', 'admin'] },
                        
                        // Import Excel -> BISA Admin & Super Admin
                        { label: "Import Anggota (Excel)", path: "/superadmin/import-members", roles: ['super_admin', 'admin'] }, 
                    ]
                }
            ]
        },
        {
            title: "Publikasi & Informasi",
            roles: ['admin', 'super_admin'],
            items: [
                {
                    label: "Berita & Artikel",
                    icon: Newspaper,
                    roles: ['admin', 'super_admin'],
                    children: [
                        { label: "Kelola Berita", path: "/admin/posts" },
                        { label: "Tulis Artikel", path: "/admin/posts/create" },
                    ]
                },
                {
                    label: "Broadcast Info",
                    icon: Send,
                    roles: ['admin', 'super_admin'],
                    children: [
                        { label: "Kirim Pesan", path: "/info/compose" },
                        { label: "Kotak Masuk", path: "/info/inbox" },
                        { label: "Approval", path: "/info/approval", roles: ['super_admin'] },
                    ]
                }
            ]
        },
        {
            title: "Tools & Arsip",
            roles: ['admin', 'super_admin'],
            items: [
                { label: "Monitoring", path: "/monitoring", icon: Activity, roles: ['admin', 'super_admin'] },
                { label: "E-Arsip (Drive)", path: "/admin/archives", icon: FolderOpen, roles: ['admin', 'super_admin'] },
                { label: "Keuangan", path: "/admin/finance-tools", icon: BookOpen, roles: ['admin', 'super_admin'] },
                { label: "Generator Surat", path: "/admin/letter-generator", icon: Printer, roles: ['admin', 'super_admin'] },
            ]
        },
        {
            title: "Layanan",
            items: [
                { label: "Lapor BEM", path: "/complaint", icon: ShieldCheck, roles: ['member', 'admin', 'admin_ukm'] },
                { label: "Kotak Aspirasi", path: "/aspirasi", icon: MessageCircle, roles: ['member', 'admin', 'admin_ukm'] },
                { label: "Inbox Laporan", path: "/superadmin/complaints", icon: MessageSquare, roles: ['super_admin'] },
                { label: "Inbox Aspirasi", path: "/admin/aspirasi", icon: MessageCircle, roles: ['admin', 'super_admin'] },
            ]
        }
    ];

    // --- 2. LOGIC ---
    useEffect(() => {
        if (role) {
            const getNotif = async () => {
                try {
                    const res = await api.get('/notifications/my');
                    setUnreadCount(res.data.filter(n => !n.is_read).length);
                } catch (e) { console.error(e); }
            };
            getNotif();
            const interval = setInterval(getNotif, 60000);
            return () => clearInterval(interval);
        }
    }, [role]);

    const hasRole = (allowedRoles) => {
        if (!allowedRoles || allowedRoles.includes('all')) return true;
        return allowedRoles.includes(role);
    };

    const isActive = (path) => {
        if (location.pathname === path) return true;
        if (path !== '/' && location.pathname.startsWith(path)) return true;
        return false;
    };

    const toggleMenu = (label) => {
        setOpenMenus(prev => ({ ...prev, [label]: !prev[label] }));
    };

    // Auto open dropdown jika anaknya aktif
    useEffect(() => {
        MENU_ITEMS.forEach(group => {
            if(group.items) {
                group.items.forEach(item => {
                    if (item.children) {
                        const childActive = item.children.some(child => isActive(child.path));
                        if (childActive) {
                            setOpenMenus(prev => ({ ...prev, [item.label]: true }));
                        }
                    }
                });
            }
        });
    }, [location.pathname]);

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    if (!role) return null;

    // --- 3. RENDER ---
    return (
        <>
            {/* Mobile Overlay */}
            {isOpen && (
                <div className="fixed inset-0 bg-black/60 backdrop-blur-[2px] z-30 md:hidden transition-opacity" onClick={() => setIsOpen(false)} />
            )}

            {/* Sidebar Container */}
            <aside className={`
                fixed md:static inset-y-0 left-0 z-40 w-72 bg-white border-r border-gray-200 
                transform transition-transform duration-300 ease-in-out flex flex-col shadow-2xl md:shadow-none
                ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
            `}>
                
                {/* Header */}
                <div className="h-16 flex items-center justify-between px-6 border-b border-gray-100 bg-white sticky top-0 z-10">
                    <div className="flex items-center gap-3">
                        <div className="bg-slate-900 w-8 h-8 rounded-lg flex items-center justify-center text-white">
                            <ShieldCheck size={18} />
                        </div>
                        <span className="font-bold text-lg text-slate-800 tracking-tight">SIAKSI</span>
                    </div>
                    <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400">
                        <X size={24} />
                    </button>
                </div>

                {/* Menu List */}
                <div className="flex-1 overflow-y-auto px-4 py-6 space-y-6 custom-scrollbar">
                    {MENU_ITEMS.map((group, idx) => {
                        if (!hasRole(group.roles)) return null;

                        return (
                            <div key={idx}>
                                {group.title && (
                                    <h3 className="px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider mb-2">
                                        {group.title}
                                    </h3>
                                )}
                                <div className="space-y-1">
                                    {group.items.map((item, itemIdx) => {
                                        if (!hasRole(item.roles)) return null;

                                        // 1. Menu dengan Dropdown
                                        if (item.children) {
                                            const isOpen = openMenus[item.label];
                                            const isChildActive = item.children.some(c => isActive(c.path));
                                            
                                            return (
                                                <div key={itemIdx} className="mb-1">
                                                    <button 
                                                        onClick={() => toggleMenu(item.label)}
                                                        className={`w-full flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium
                                                            ${isOpen || isChildActive ? 'text-slate-800 bg-slate-50' : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'}
                                                        `}
                                                    >
                                                        <div className="flex items-center gap-3">
                                                            <item.icon size={18} className={isOpen || isChildActive ? 'text-blue-600' : 'text-slate-400'} />
                                                            <span>{item.label}</span>
                                                        </div>
                                                        <ChevronRight size={16} className={`text-slate-300 transition-transform duration-200 ${isOpen ? 'rotate-90' : ''}`} />
                                                    </button>

                                                    {isOpen && (
                                                        <div className="mt-1 ml-4 pl-4 border-l border-slate-200 space-y-1">
                                                            {item.children.map((child, cIdx) => {
                                                                if (child.roles && !hasRole(child.roles)) return null;
                                                                const active = isActive(child.path);
                                                                return (
                                                                    <Link 
                                                                        key={cIdx} 
                                                                        to={child.path}
                                                                        onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                                                                        className={`block px-3 py-2 rounded-md text-sm transition-colors
                                                                            ${active ? 'text-blue-600 font-medium bg-blue-50' : 'text-slate-500 hover:text-slate-900 hover:bg-slate-50'}
                                                                        `}
                                                                    >
                                                                        {child.label}
                                                                    </Link>
                                                                );
                                                            })}
                                                        </div>
                                                    )}
                                                </div>
                                            );
                                        }

                                        // 2. Menu Biasa
                                        const active = isActive(item.path);
                                        return (
                                            <Link 
                                                key={itemIdx}
                                                to={item.path}
                                                onClick={() => window.innerWidth < 768 && setIsOpen(false)}
                                                className={`flex items-center justify-between px-3 py-2.5 rounded-lg transition-all text-sm font-medium mb-1
                                                    ${active 
                                                        ? 'bg-slate-900 text-white shadow-md shadow-slate-200' 
                                                        : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                                                    }
                                                `}
                                            >
                                                <div className="flex items-center gap-3">
                                                    <item.icon size={18} className={active ? 'text-slate-200' : 'text-slate-400'} />
                                                    <span>{item.label}</span>
                                                </div>
                                                {item.badge > 0 && (
                                                    <span className="bg-red-500 text-white text-[10px] font-bold px-1.5 py-0.5 rounded-full min-w-[18px] text-center">
                                                        {item.badge}
                                                    </span>
                                                )}
                                            </Link>
                                        );
                                    })}
                                </div>
                            </div>
                        );
                    })}
                </div>

                {/* Footer Profile */}
                <div className="p-4 border-t border-gray-100 bg-slate-50/50">
                    <div className="flex items-center gap-3 p-2 rounded-xl border border-slate-200 bg-white shadow-sm mb-3">
                        <div className="w-9 h-9 rounded-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                            {role.charAt(0).toUpperCase()}
                        </div>
                        <div className="flex-1 overflow-hidden">
                            <p className="text-xs font-bold text-slate-800 truncate uppercase">{role.replace('_', ' ')}</p>
                            <Link to="/user/profile" className="text-[10px] text-slate-500 hover:text-blue-600 flex items-center gap-1">
                                Lihat Profil <ChevronRight size={10} />
                            </Link>
                        </div>
                    </div>
                    
                    <button 
                        onClick={handleLogout}
                        className="w-full flex items-center justify-center gap-2 px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    >
                        <LogOut size={16} />
                        <span>Keluar</span>
                    </button>
                </div>

            </aside>
        </>
    );
};

export default Sidebar;
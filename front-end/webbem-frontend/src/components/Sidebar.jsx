import { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { 
  LogOut, LayoutDashboard, Activity, Users, Calendar, 
  ShieldCheck, Building, X, Bell, Send, FolderOpen, Inbox, 
  ShieldAlert, Printer, Newspaper, PenTool, BookOpen, 
  ChevronRight, Settings, User, MessageSquare, MessageCircle
} from 'lucide-react';
import api from '../api/axios'; 

const Sidebar = ({ isOpen, setIsOpen }) => {
  const navigate = useNavigate();
  const location = useLocation();
  const role = localStorage.getItem('role');
  const [unreadCount, setUnreadCount] = useState(0); 

  const fetchUnreadCount = async () => {
    try {
      const res = await api.get('/notifications/my');
      const unread = res.data.filter(n => !n.is_read).length;
      setUnreadCount(unread);
    } catch (err) {
      console.error("Gagal mengambil notifikasi:", err);
    }
  };

  useEffect(() => {
    if (role) {
      fetchUnreadCount();
      const interval = setInterval(fetchUnreadCount, 60000);
      return () => clearInterval(interval);
    }
  }, [role]);

  const handleLogout = () => {
    localStorage.clear();
    navigate('/');
  };

  const isActive = (path) => {
      if (path === '/') return location.pathname === '/';
      return location.pathname === path || location.pathname.startsWith(`${path}/`);
  };

  const handleLinkClick = () => {
    if (window.innerWidth < 768) {
        setIsOpen(false);
    }
  };

  if (!role) return null;

  // Tentukan Link Profil berdasarkan Role
  const profileLink = (role === 'admin' || role === 'super_admin') 
    ? '/admin/profile' 
    : '/user/profile';

  const profileLabel = (role === 'admin' || role === 'super_admin') 
    ? 'Kelola UKM' 
    : 'Akun Saya';

  return (
    <>
      {/* Mobile Backdrop */}
      {isOpen && (
        <div 
            className="fixed inset-0 bg-black/50 z-30 md:hidden backdrop-blur-sm transition-opacity"
            onClick={() => setIsOpen(false)}
        />
      )}

      <aside className={`
        fixed md:static inset-y-0 left-0 z-40 w-64 bg-white border-r border-gray-200 
        transform transition-transform duration-300 ease-in-out flex flex-col shadow-xl md:shadow-none
        ${isOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0'}
      `}>
        
        {/* 1. BRAND HEADER */}
        <div className="h-20 flex items-center justify-between px-6 border-b border-gray-100">
            <div className="flex items-center gap-3">
                <div className="bg-blue-600 w-9 h-9 rounded-xl flex items-center justify-center shadow-lg shadow-blue-200">
                    <ShieldCheck size={20} className="text-white" />
                </div>
                <div className="flex flex-col">
                    <span className="font-black text-xl text-gray-800 tracking-tight leading-none">SIAKSI</span>
                    <span className="text-[10px] font-bold text-blue-600 uppercase tracking-widest">Dashboard</span>
                </div>
            </div>
            <button onClick={() => setIsOpen(false)} className="md:hidden text-gray-400 hover:text-gray-600">
                <X size={24} />
            </button>
        </div>

        {/* 2. USER PROFILE CARD */}
        <div className="px-5 pt-6 pb-2">
            <Link 
                to={profileLink} 
                onClick={handleLinkClick}
                className="group relative block"
            >
                <div className="absolute inset-0 bg-blue-600 rounded-2xl blur opacity-10 group-hover:opacity-30 transition-opacity duration-500"></div>
                <div className="relative bg-gradient-to-br from-white to-blue-50/50 p-4 rounded-2xl border border-blue-100 shadow-sm group-hover:shadow-md group-hover:-translate-y-1 transition-all duration-300 flex items-center gap-3">
                    <div className="relative">
                        <div className="w-10 h-10 rounded-full bg-blue-600 text-white flex items-center justify-center font-bold text-sm shadow-md ring-2 ring-white">
                            {role.charAt(0).toUpperCase()}
                        </div>
                        <div className="absolute -bottom-1 -right-1 bg-green-500 w-3 h-3 rounded-full border-2 border-white"></div>
                    </div>
                    <div className="flex-1 overflow-hidden">
                        <p className="text-xs font-bold text-blue-600 uppercase tracking-wider mb-0.5">{profileLabel}</p>
                        <div className="flex items-center gap-1 text-gray-600 group-hover:text-blue-700 transition-colors">
                            <span className="text-xs font-medium truncate">Edit Profil</span>
                            <Settings size={10} />
                        </div>
                    </div>
                    <div className="text-gray-300 group-hover:text-blue-500 transition-colors">
                        <ChevronRight size={18} />
                    </div>
                </div>
            </Link>
        </div>

        {/* 3. NAVIGATION MENUS */}
        <div className="flex-1 overflow-y-auto px-4 space-y-1 custom-scrollbar">
            <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 mt-4">Main Menu</p>

            <SidebarLink 
                to="/notifications" 
                label="Notifikasi" 
                icon={<Bell size={20}/>} 
                active={isActive('/notifications')} 
                onClick={handleLinkClick}
                badge={unreadCount} 
            />

            {/* Member Menu */}
            {role === 'member' && (
              <>
                <SidebarLink to="/absen" label="Presensi" icon={<Activity size={20}/>} active={isActive('/absen')} onClick={handleLinkClick} />
                <SidebarLink 
                    to="/my-history" 
                    label="Riwayat Saya" 
                    icon={<Calendar size={20}/>} 
                    active={isActive('/my-history')} 
                    onClick={handleLinkClick} 
                />

                <SidebarLink 
                    to="/user/profile" 
                    label="Profil Saya" 
                    icon={<User size={20}/>} 
                    active={isActive('/user/profile')} 
                    onClick={handleLinkClick} 
                />
              </>
            )}

            {/* Admin Menu */}
            {role === 'admin' && (
                <>
                    <SidebarLink to="/admin-dashboard" label="Buat Jadwal" icon={<Calendar size={20}/>} active={isActive('/admin-dashboard')} onClick={handleLinkClick} />
                    <SidebarLink to="/admin/events" label="Riwayat Acara" icon={<LayoutDashboard size={20}/>} active={isActive('/admin/events')} onClick={handleLinkClick} />
                    
                    <SidebarLink 
                        to="/admin/members" 
                        label="Presensi Anggota" 
                        icon={<Activity size={20}/>} 
                        active={isActive('/admin/members')} 
                        onClick={handleLinkClick} 
                    />

                    {/* --- MENU BARU: MANAJEMEN USER (ADMIN UKM) --- */}
                    <SidebarLink 
                        to="/superadmin/manage-users" 
                        label="Kelola Anggota" 
                        icon={<Users size={20}/>} 
                        active={isActive('/superadmin/manage-users')} 
                        onClick={handleLinkClick} 
                    />

                    <SidebarLink 
                        to="/admin/aspirasi" 
                        label="Inbox Aspirasi" 
                        icon={<MessageCircle size={20}/>} 
                        active={isActive('/admin/aspirasi')} 
                        onClick={handleLinkClick} 
                    />
                </>
            )}

            {/* Super Admin Menu */}
            {role === 'super_admin' && (
                <>
                    <SidebarLink to="/admin-dashboard" label="Overview" icon={<LayoutDashboard size={20}/>} active={isActive('/admin-dashboard')} onClick={handleLinkClick} />
                    
                    <SidebarLink 
                        to="/superadmin/complaints" 
                        label="Inbox Laporan" 
                        icon={<MessageSquare size={20}/>} 
                        active={isActive('/superadmin/complaints')} 
                        onClick={handleLinkClick} 
                    />

                    <SidebarLink 
                        to="/admin/aspirasi" 
                        label="Inbox Aspirasi" 
                        icon={<MessageCircle size={20}/>} 
                        active={isActive('/admin/aspirasi')} 
                        onClick={handleLinkClick} 
                    />
                </>
            )}
            
            {/* --- MENU LAPOR & ASPIRASI (UNTUK SEMUA KECUALI SUPER ADMIN) --- */}
            {(role === 'member' || role === 'admin' || role === 'admin_ukm') && (
                <>
                    <SidebarLink 
                        to="/complaint" 
                        label="Lapor ke BEM" 
                        icon={<ShieldAlert size={20}/>} 
                        active={isActive('/complaint')} 
                        onClick={handleLinkClick} 
                    />
                    <SidebarLink 
                        to="/aspirasi" 
                        label="Kotak Aspirasi" 
                        icon={<MessageCircle size={20}/>} 
                        active={isActive('/aspirasi')} 
                        onClick={handleLinkClick} 
                    />
                </>
            )}

            {/* Common Monitoring & Tools (Untuk Admin & Super Admin) */}
            {(role === 'admin' || role === 'super_admin') && (
                <>
                    <div className="my-6 border-t border-gray-100 mx-2"></div>
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Tools & Monitoring</p>

                    <SidebarLink 
                        to="/monitoring" 
                        label={role === 'super_admin' ? 'Global Monitor' : 'Monitor UKM'} 
                        icon={<Activity size={20}/>} 
                        active={isActive('/monitoring')} 
                        onClick={handleLinkClick}
                    />
                    <SidebarLink 
                        to="/admin/archives" 
                        label="E-Arsip (Drive)" 
                        icon={<FolderOpen size={20}/>} 
                        active={isActive('/admin/archives')} 
                        onClick={handleLinkClick} 
                    />
                    
                    <SidebarLink 
                        to="/admin/finance-tools" 
                        label="Pencatatan Digital" 
                        icon={<BookOpen size={20}/>} 
                        active={isActive('/admin/finance-tools')} 
                        onClick={handleLinkClick} 
                    />

                    <SidebarLink 
                        to="/admin/letter-generator" 
                        label="Buat Surat Otomatis" 
                        icon={<Printer size={20}/>} 
                        active={isActive('/admin/letter-generator')} 
                        onClick={handleLinkClick} 
                    />
                </>
            )}

            {/* --- FITUR SURAT MENYURAT & BERITA --- */}
            {(role === 'admin' || role === 'super_admin') && (
                <>
                    <div className="my-6 border-t border-gray-100 mx-2"></div>
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Publikasi & Info</p>
                    
                    <SidebarLink 
                        to="/admin/posts" 
                        label="Kelola Berita" 
                        icon={<Newspaper size={20}/>} 
                        active={isActive('/admin/posts')} 
                        onClick={handleLinkClick} 
                    />
                    
                    <SidebarLink 
                        to="/admin/posts/create" 
                        label="Tulis Artikel" 
                        icon={<PenTool size={20}/>} 
                        active={isActive('/admin/posts/create')} 
                        onClick={handleLinkClick} 
                    />

                    <div className="h-2"></div>

                    <SidebarLink 
                        to="/info/compose" 
                        label="Broadcast Pesan" 
                        icon={<Send size={20}/>} 
                        active={isActive('/info/compose')} 
                        onClick={handleLinkClick} 
                    />
                    <SidebarLink 
                        to="/info/inbox" 
                        label="Kotak Masuk" 
                        icon={<Inbox size={20}/>} 
                        active={isActive('/info/inbox')} 
                        onClick={handleLinkClick} 
                    />
                    
                    {role === 'super_admin' && (
                        <SidebarLink 
                            to="/info/approval" 
                            label="Acc Broadcast" 
                            icon={<ShieldAlert size={20}/>} 
                            active={isActive('/info/approval')} 
                            onClick={handleLinkClick} 
                        />
                    )}
                </>
            )}

            {/* Data Master Section (Super Admin Only) */}
            {role === 'super_admin' && (
                <>
                    <div className="my-6 border-t border-gray-100 mx-2"></div>
                    <p className="px-4 text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Data Master</p>
                    <SidebarLink to="/superadmin/manage-ukm" label="Kelola UKM" icon={<Building size={20}/>} active={isActive('/superadmin/manage-ukm')} onClick={handleLinkClick} />
                    <SidebarLink to="/superadmin/manage-users" label="Kelola Users" icon={<Users size={20}/>} active={isActive('/superadmin/manage-users')} onClick={handleLinkClick} />
                </>
            )}
        </div>

        {/* 4. LOGOUT SECTION */}
        <div className="p-4 border-t border-gray-100 bg-gray-50/50">
            <button 
                onClick={handleLogout}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-bold text-red-600 bg-white border border-red-100 hover:bg-red-50 hover:border-red-200 rounded-xl transition-all shadow-sm"
            >
                <LogOut size={18} />
                <span>Sign Out</span>
            </button>
        </div>
      </aside>
    </>
  );
};

// Sub-component Link
const SidebarLink = ({ to, label, icon, active, onClick, badge }) => (
  <Link 
    to={to} 
    onClick={onClick}
    className={`flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-200 mb-1 font-medium text-sm
    ${active 
        ? 'bg-blue-600 text-white shadow-lg shadow-blue-200' 
        : 'text-gray-500 hover:bg-gray-100 hover:text-gray-900'
    }`}
  >
    <div className="flex items-center gap-3">
        <div className={`${active ? 'text-white' : 'text-gray-400'}`}>
            {icon}
        </div>
        <span>{label}</span>
    </div>
    
    {badge > 0 && (
        <span className={`
            flex items-center justify-center min-w-[20px] h-5 px-1.5 rounded-full text-[10px] font-bold
            ${active ? 'bg-white text-blue-600' : 'bg-red-500 text-white'}
        `}>
            {badge > 99 ? '99+' : badge}
        </span>
    )}
  </Link>
);

export default Sidebar;
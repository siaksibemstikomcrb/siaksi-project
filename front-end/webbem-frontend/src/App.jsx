import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { Toaster } from 'sonner';

// --- API ---
import api from './api/axios';

// Components
import Layout from './components/Layout';
import ProtectedRoute from './components/ProtectedRoute';

// Pages - Public
import Login from './pages/Login';
import HomePage from './pages/Home';
import NewsFeed from './pages/NewsFeed'; 
import PostDetail from './pages/PostDetail'; 

// Pages - Dashboard & User
import Absen from './pages/Absen';
import MyHistory from './pages/MyHistory';
import Dashboard from './pages/Dashboard';

// Monitoring & Management Pages
import GlobalMonitoring from './pages/GlobalMonitoring';
import MonitoringDetail from './pages/MonitoringDetail';
import UKMDetail from './pages/UKMDetail';
import MemberDetail from './pages/MemberDetail';
import ManageUsers from './pages/ManageUsers';
import ManageUKM from './pages/ManageUKM';

// Events & Notifications
import EventList from './pages/EventList';
import EventReport from './pages/EventReport';
import NotificationsPage from './pages/NotificationsPage';
import BroadcastPage from './pages/BroadcastPage';
import DocumentArchive from './pages/DocumentArchive';
import ComposeMessage from './pages/ComposeMessage';
import InfoInbox from './pages/InfoInbox';
import BroadcastApproval from './pages/BroadcastApproval';
import LetterGenerator from './pages/LetterGenerator';
import ManagePosts from './pages/ManagePosts';
import CreatePost from './pages/CreatePost';
import EditPost from './pages/EditPost';
import EditSchedule from './pages/EditSchedule';
import ProfileUKM from './pages/ProfileUKM';

// --- IMPORT BARU ---
import FinanceTools from './pages/FinanceTools'; 
import UserProfile from './pages/UserProfile';
import MemberManagement from './pages/MemberManagement';

// --- IMPORT FITUR COMPLAINT ---
import UserComplaint from './pages/UserComplaint';
import AdminComplaints from './pages/AdminComplaints';

// --- IMPORT FITUR ASPIRASI (BARU) ---
import UserAspiration from './pages/UserAspiration';
import InboxAspiration from './pages/InboxAspiration';
// legalpage
import LegalPage from './pages/LegalPage';
// discord
import ConnectDiscord from './pages/ConnectDiscord';

// --- RESPONSE PAGE (ERROR & MAINTENANCE) ---
import NotFound from './pages/response/NotFound';
import MaintenancePage from './pages/response/MaintenancePage';
import GeneralError from './pages/response/GeneralError'; // <-- SUDAH DITAMBAHKAN

// --- KOMPONEN UTAMA ---
function App() {
  return (
    <Router>
      <Toaster position="top-center" richColors closeButton />
      <IdleTimer /> {/* Komponen Pemantau Aktivitas */}

      <Routes>
        {/* ====================================================
            PUBLIC ROUTES (Tanpa Sidebar / Layout Dashboard)
            ==================================================== */}
        <Route path="/" element={<HomePage/>} />
        <Route path="/login" element={<Login />} />
        
        {/* Route Portal Berita (Public) - SEDANG MAINTENANCE */}
        <Route path="/news" element={<MaintenancePage title="Portal Berita Lagi Update Dulu Ya..." />} />
        <Route path="/news/:id" element={<MaintenancePage title="Berita Tidak Tersedia" />} />
        
        {/* ====================================================
            PROTECTED ROUTES (Dengan Sidebar & Layout Admin)
            ==================================================== */}
        <Route path="/privacy" element={<LegalPage />} />
        <Route path="/terms" element={<LegalPage />} />
        {/* Absensi & Dashboard */}
        <Route path="/absen" element={<Layout><Absen /></Layout>} />
        <Route path="/my-history" element={<Layout><MyHistory /></Layout>} />
        <Route path="/admin-dashboard" element={<Layout><Dashboard /></Layout>} />
        
        {/* Monitoring */}
        <Route path="/monitoring" element={<Layout><GlobalMonitoring /></Layout>} />
        <Route path="/monitoring/ukm/:id" element={<Layout><UKMDetail /></Layout>} />
        <Route path="/monitoring/user/:userId" element={<Layout><MemberDetail /></Layout>} />
        <Route path="/connect/discord" element={<ConnectDiscord />} />
        
        <Route 
          path="/monitoring/:id" 
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin', 'admin_ukm']}>
                <Layout><MonitoringDetail /></Layout>
            </ProtectedRoute>
          } 
        />

        {/* --- MANAJEMEN ANGGOTA (ADMIN UKM) --- */}
        <Route 
          path="/admin/members" 
          element={
            <ProtectedRoute allowedRoles={['admin', 'super_admin']}>
               <Layout><MemberManagement /></Layout>
            </ProtectedRoute>
          } 
        />

        <Route path="/admin/profile" element={<Layout><ProfileUKM /></Layout>} />
        
        {/* Super Admin Management */}
        <Route path="/superadmin/manage-ukm" element={<Layout><ManageUKM /></Layout>} />
        <Route path="/superadmin/manage-users" element={<Layout><ManageUsers /></Layout>} />
        <Route path="/superadmin/broadcast" element={<Layout><BroadcastPage /></Layout>} />
        <Route path="/user/profile" element={<Layout><UserProfile /></Layout>} />
        
        {/* Content Management */}
        <Route path="/admin/posts" element={<Layout><ManagePosts /></Layout>} />
        <Route path="/admin/posts/create" element={<Layout><CreatePost /></Layout>} />
        <Route path="/admin/posts/edit/:id" element={<Layout><EditPost /></Layout>} />
        
        {/* Event Management */}
        <Route path="/admin/events" element={<Layout><EventList /></Layout>} />
        <Route path="/admin/events/:scheduleId" element={<Layout><EventReport /></Layout>} />
        <Route path="/admin/events/edit/:id" element={<Layout><MaintenancePage title="Edit Event Ditutup Guys..." /></Layout>} />
        
        {/* Notifications */}
        <Route path="/notifications" element={<Layout><NotificationsPage /></Layout>} />

        {/* Administrasi & Arsip */}
        <Route path="/admin/archives" element={<Layout><DocumentArchive /></Layout>} />
        <Route path="/admin/letter-generator" element={<Layout><MaintenancePage title="Generator Surat Lagi Di Update ya :)" /></Layout>} />
        
        {/* --- RUTE BARU: PENCATATAN DIGITAL --- */}
        <Route path="/admin/finance-tools" element={<Layout><FinanceTools /></Layout>} />

        {/* Surat Menyurat (Pusat Informasi) */}
        <Route path="/info/compose" element={<Layout><ComposeMessage /></Layout>} />
        <Route path="/info/inbox" element={<Layout><InfoInbox /></Layout>} />
        <Route path="/info/approval" element={<Layout><BroadcastApproval /></Layout>} />

        {/* --- FITUR LAYANAN PENGADUAN (COMPLAINT) --- */}
        <Route path="/complaint" element={<Layout><UserComplaint /></Layout>} />
        <Route 
          path="/superadmin/complaints" 
          element={
            <ProtectedRoute allowedRoles={['super_admin']}>
                <Layout><AdminComplaints /></Layout>
            </ProtectedRoute>
          } 
        />

        {/* --- FITUR ASPIRASI (BARU) --- */}
        {/* User Biasa: Kirim Aspirasi */}
        <Route path="/aspirasi" element={<Layout><UserAspiration /></Layout>} />

        {/* Admin UKM & Super Admin: Baca Inbox Aspirasi */}
        <Route 
          path="/admin/aspirasi" 
          element={
            <ProtectedRoute allowedRoles={['super_admin', 'admin']}>
                <Layout><InboxAspiration /></Layout>
            </ProtectedRoute>
          } 
        />

        {/* ====================================================
            RESPONSE & ERROR PAGES (Baru Ditambahkan)
            ==================================================== */}
        {/* 1. Maintenance Mode (Bisa dipanggil manual) */}
        <Route path="/maintenance" element={<MaintenancePage />} />

        {/* 2. Error 403 (Forbidden / Akses Ditolak) */}
        <Route path="/forbidden" element={<GeneralError type="403" />} />

        {/* 3. Error 500 (Server Error) */}
        <Route path="/server-error" element={<GeneralError type="500" />} />

        {/* 4. Catch All (404 Not Found) - Taruh Paling Bawah */}
        <Route path="*" element={<NotFound />} />

      </Routes>
    </Router>
  );
}

// --- KOMPONEN IDLE TIMER (AUTO LOGOUT) ---
const IdleTimer = () => {
    const navigate = useNavigate();
    
    useEffect(() => {
        // SETTING WAKTU AUTO LOGOUT (Contoh: 30 Menit)
        const TIMEOUT_MS = 30 * 60 * 1000; 
        let logoutTimer;

        // Fungsi Logout Otomatis
        const performLogout = async () => {
           console.log("⏳ User tidak aktif (Idle), otomatis logout...");
           try {
               await api.post('/auth/logout'); 
           } catch (e) {
               console.error("Gagal logout di server (mungkin token sudah expired)", e);
           } finally {
               localStorage.clear();
               navigate('/login');
           }
        };

        // Fungsi Reset Timer
        const resetTimer = () => {
            if (window.location.pathname === '/login' || window.location.pathname === '/') return;

            if (logoutTimer) clearTimeout(logoutTimer);
            logoutTimer = setTimeout(performLogout, TIMEOUT_MS);
        };

        // Pasang Event Listener
        window.addEventListener('mousemove', resetTimer);
        window.addEventListener('keypress', resetTimer);
        window.addEventListener('click', resetTimer);
        window.addEventListener('scroll', resetTimer);
        window.addEventListener('touchstart', resetTimer);

        resetTimer();

        return () => {
            if (logoutTimer) clearTimeout(logoutTimer);
            window.removeEventListener('mousemove', resetTimer);
            window.removeEventListener('keypress', resetTimer);
            window.removeEventListener('click', resetTimer);
            window.removeEventListener('scroll', resetTimer);
            window.removeEventListener('touchstart', resetTimer);
        };
    }, [navigate]);

    return null;
};

export default App;
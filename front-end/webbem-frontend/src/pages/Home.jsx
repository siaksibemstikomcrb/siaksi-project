import React, { useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { 
  motion, useScroll, useTransform, useMotionTemplate, useMotionValue 
} from 'framer-motion';
import { 
  ShieldCheck, Globe, Users, Bot, 
  Zap, ChevronRight, FileCheck, 
  AlertTriangle, Terminal, Lock, Database, 
  FileText, Mail, HardDrive,
  MapPin, ArrowRight, MessageSquare
} from 'lucide-react';

import useWindowSize from '../components/reacrt-bits/useWindowSize'; 
import CardSwap, { Card } from '../components/reacrt-bits/CardSwap';

import Navbar from '../components/Navbar';
import bgHero from '../assets/images/home/backgorund-hero.png';
import frameFigma from '../assets/images/home/figma-frame.png';
import imgDashboard from '../assets/images/home/dashboard.png';
import imgSearch from '../assets/images/home/search.png';
import imgCursor from '../assets/images/home/cursor.png';

import dash1 from '../assets/images/asset-home/das-1.png';
import dash5 from '../assets/images/asset-home/das-5.png';
import dash7 from '../assets/images/asset-home/das-7.png';
import dash8 from '../assets/images/asset-home/das-8.png';
import dash10 from '../assets/images/asset-home/das-10.png';
import learning1 from '../assets/images/asset-home/learning-1.png';

const showcaseImages = [
  { src: dash7, alt: "Dashboard UKM" },
  { src: dash1, alt: "Aspirasi" },
  { src: dash5, alt: "Presensi GPS" },
  { src: dash8, alt: "Cloud Drive" },
  { src: dash10, alt: "Keuangan" },
  { src: learning1, alt: "Learning Center" },
];

const TechBadge = ({ children, color = "blue" }) => {
  const colors = {
    blue: "bg-blue-500/10 text-blue-400 border-blue-500/20",
    purple: "bg-purple-500/10 text-purple-400 border-purple-500/20",
    green: "bg-green-500/10 text-green-400 border-green-500/20",
    orange: "bg-orange-500/10 text-orange-400 border-orange-500/20",
    red: "bg-red-500/10 text-red-400 border-red-500/20",
  };
  return (
    <span className={`px-2 py-1 rounded text-[10px] font-mono border ${colors[color]} uppercase tracking-wider`}>
      {children}
    </span>
  );
};

const SpotlightCard = ({ children, className = "", noHover = false }) => {
  const mouseX = useMotionValue(0);
  const mouseY = useMotionValue(0);

  function handleMouseMove({ currentTarget, clientX, clientY }) {
    const { left, top } = currentTarget.getBoundingClientRect();
    mouseX.set(clientX - left);
    mouseY.set(clientY - top);
  }

  return (
    <div
      className={`relative border border-white/5 bg-slate-950/20 overflow-hidden group backdrop-blur-sm ${className}`}
      onMouseMove={handleMouseMove}
    >
      {!noHover && (
        <motion.div
          className="pointer-events-none absolute -inset-px opacity-0 transition duration-300 group-hover:opacity-100"
          style={{
            background: useMotionTemplate`
              radial-gradient(
                600px circle at ${mouseX}px ${mouseY}px,
                rgba(59, 130, 246, 0.08),
                transparent 80%
              )
            `,
          }}
        />
      )}
      <div className="relative h-full z-10">{children}</div>
    </div>
  );
};

const SectionHeader = ({ title, subtitle, label }) => (
  <div className="mb-16 md:text-center max-w-3xl mx-auto px-6 relative z-10">
    {label && <span className="text-blue-500 font-mono text-xs tracking-widest uppercase mb-2 block">{label}</span>}
    <h2 className="text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight bg-clip-text text-transparent bg-gradient-to-b from-white to-white/60">{title}</h2>
    <p className="text-slate-400 text-lg leading-relaxed">{subtitle}</p>
  </div>
);

const Home = () => {
  const navigate = useNavigate();
  const targetRef = useRef(null);
  const { scrollYProgress } = useScroll({ target: targetRef, offset: ["start start", "end start"] });
  const opacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);

  const size = useWindowSize();
  const isMobile = size.width < 768;

  const cardWidth = isMobile ? (size.width - 48) : 700; 
  const cardHeight = isMobile ? 250 : 420;

  return (
    <div className="bg-[#020617] min-h-screen text-slate-200 font-sans selection:bg-blue-500/30 selection:text-blue-100 overflow-x-hidden">
      <Navbar isTransparent={true} />
      
      <div className="fixed inset-0 pointer-events-none z-0">
          <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-900/10 rounded-full blur-[120px]" />
          <div className="absolute bottom-[20%] right-[-5%] w-[40%] h-[40%] bg-purple-900/10 rounded-full blur-[120px]" />
      </div>

      <section className="relative w-full flex items-center justify-center overflow-hidden pt-32 pb-20 lg:pt-48 lg:pb-32 px-4 sm:px-6 z-10">
            
        <div className="absolute inset-0 z-0 mask-image-b-gradient"> 
            <img 
              src={bgHero} 
              alt="Hero Background" 
              className="w-full h-full object-cover opacity-40 md:opacity-50 mask-gradient-to-b" 
            />
            <div className="absolute bottom-0 left-0 w-full h-32 bg-gradient-to-t from-[#020617] to-transparent" />
        </div>

        <div className="relative z-20 w-full max-w-[1300px]">
          
          <motion.div 
              initial={{ opacity: 0, y: 40, scale: 0.98 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }} 
              className="relative w-full"
          >
               <div className="relative">
                 <img 
                    src={frameFigma} 
                    alt="Interface Frame" 
                    className="hidden md:block w-full h-auto object-cover shadow-2xl rounded-[2.5rem] border border-white/5 opacity-80" 
                  />
                  <div className="relative md:absolute inset-0 z-10 md:p-12 lg:px-16 lg:py-20 grid lg:grid-cols-12 gap-12 lg:gap-12 items-center">
                    <div className="lg:col-span-5 flex flex-col justify-center h-full relative z-20 pt-10 lg:pt-0 text-center lg:text-left">
                        <motion.div 
                          initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.3 }}
                          className="inline-flex items-center self-center lg:self-start px-3 py-1 md:px-4 md:py-1.5 rounded-full bg-white/5 border border-white/10 text-blue-300 text-[10px] md:text-xs font-medium mb-6 backdrop-blur-md"
                        >
                          Website Resmi BEM STIKOM PolTek Cirebon <ArrowRight size={12} className="ml-2 text-blue-400"/>
                        </motion.div>

                        <motion.h1 
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
                          className="text-4xl md:text-5xl lg:text-7xl font-medium text-white leading-[1.1] mb-6 md:mb-8 tracking-tighter"
                        >
                          Satu Aplikasi, <br/>
                          <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Ribuan Aktifitas.</span>
                        </motion.h1>

                        <motion.p 
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.5 }}
                          className="text-slate-400 text-base md:text-lg leading-relaxed mb-8 md:mb-10 max-w-lg mx-auto lg:mx-0 px-4 md:px-0"
                        >
                          Sistem Informasi Aktivitas, Kehadiran, dan Administrasi. Platform manajemen organisasi mahasiswa yang terintegrasi penuh.
                        </motion.p>

                        <motion.div 
                          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}
                          className="flex flex-row items-center justify-center lg:justify-start gap-3 relative z-10"
                        >
                          <button 
                            onClick={() => navigate('/login')}
                            className="h-12 px-6 md:h-14 md:px-8 rounded-xl bg-blue-600 text-white text-sm md:text-base font-bold hover:bg-blue-700 transition-all hover:shadow-lg hover:shadow-blue-500/25"
                          >
                            Masuk Sistem
                          </button>
                          <button 
                            onClick={() => navigate('/news')}
                            className="h-12 px-6 md:h-14 md:px-8 rounded-xl border border-white/10 bg-white/5 text-white text-sm md:text-base font-medium hover:bg-white/10 transition-all backdrop-blur-md"
                          >
                            Berita
                          </button>
                        </motion.div>
                    </div>

                    <div className="lg:col-span-7 h-full flex flex-col justify-center lg:justify-end pb-0 relative z-10 mt-8 md:mt-12 lg:mt-0">
                        <div className="relative w-full max-w-[700px] ml-auto">
                           <motion.div 
                               initial={{ opacity: 0, y: 40 }} 
                               animate={{ opacity: 1, y: 0 }} 
                               transition={{ delay: 0.6, duration: 0.8 }}
                               className="relative z-30 mb-[-10%] ml-auto w-[85%] md:w-[75%] lg:w-[65%]"
                           >
                               <img src={imgSearch} alt="Search Bar" className="w-full h-auto drop-shadow-2xl" />
                           </motion.div>
                           <motion.div 
                               initial={{ opacity: 0, scale: 0.9, y: 40 }} 
                               animate={{ opacity: 1, scale: 1, y: 0 }} 
                               transition={{ delay: 0.4, duration: 0.8 }}
                               className="relative z-20 rounded-2xl overflow-hidden shadow-2xl shadow-blue-900/20 border border-white/10"
                           >
                               <img src={imgDashboard} alt="Dashboard Interface" className="w-full h-auto object-cover" />
                           </motion.div>
                        </div>
                    </div>
                  </div>
               </div>
          </motion.div>
        </div>
      </section>

      <section className="relative w-full py-20 lg:py-32 px-4 sm:px-6 z-10"> 
        <div className="absolute inset-0 bg-gradient-to-b from-[#020617] via-[#0a0a0a] to-[#020617] opacity-80 -z-10" />

        <div className="max-w-[1400px] mx-auto grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-20 items-center">
          
          <div className="order-1 lg:order-1 z-20 max-w-xl mx-auto lg:mx-0 text-left lg:text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-purple-500/10 border border-purple-500/20 text-purple-400 text-xs font-medium mb-6">
              <span className="w-2 h-2 rounded-full bg-purple-500 animate-pulse"></span>
              Interface Gallery
            </div>
            
            <h2 className="text-3xl md:text-5xl lg:text-6xl font-medium text-white mb-6 leading-[1.2] tracking-tight">
              Banyak Fitur, <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-purple-400 to-blue-500">
                Dapat Kamu Gunakan.
              </span>
            </h2>
            
            <p className="text-slate-400 text-base md:text-lg lg:text-xl leading-relaxed mb-8">
              Dari manajemen anggota, presensi GPS, hingga laporan keuangan otomatis, semuanya dirancang untuk kemudahan Anda.
            </p>

            <ul className="space-y-4 inline-block text-left">
              {[
                "Dashboard Admin",
                "Manajemen Arsip Digital Terstruktur",
                "Sistem Pembelajaran Terintegrasi",
                "Laporan Keuangan Otomatis"
              ].map((item, idx) => (
                <li key={idx} className="flex items-center gap-3 text-slate-300 text-base md:text-lg">
                  <div className="w-6 h-6 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400 text-xs shrink-0">
                    ✓
                  </div>
                  {item}
                </li>
              ))}
            </ul>
          </div>

          <div className="order-2 lg:order-2 relative w-full flex items-center justify-center lg:justify-end mt-32 sm:mt-40 lg:mt-0 min-h-[250px] lg:min-h-[600px]">
             
             <div className="absolute top-1/2 left-1/2 lg:left-3/4 -translate-x-1/2 -translate-y-1/2 w-[300px] lg:w-[600px] h-[300px] lg:h-[600px] bg-purple-600/10 blur-[100px] rounded-full pointer-events-none" />

             <CardSwap
                width={cardWidth}  
                height={cardHeight} 
                cardDistance={isMobile ? 25 : 50}     
                verticalDistance={isMobile ? 25 : 60} 
                delay={3500} 
                pauseOnHover={true}
                skewAmount={0} 
                easing="elastic"
             >
                {showcaseImages.map((img, index) => (
                  <Card key={index} className="bg-[#0f172a] border border-white/10 shadow-2xl rounded-xl overflow-hidden relative">
                     <img src={img.src} alt={img.alt} className="w-full h-full object-cover object-top opacity-95" />
                     <div className="absolute top-3 right-3 px-2 py-1 bg-black/60 backdrop-blur-md rounded-md border border-white/10">
                        <p className="text-white text-[10px] font-medium tracking-wide">{img.alt}</p>
                     </div>
                  </Card>
                ))}
             </CardSwap>
          </div>
        </div>
      </section>

      <section className="relative py-24 px-6 z-10">
        <div className="max-w-7xl mx-auto">
            <SectionHeader 
            label="Core Architecture"
            title="Manajemen Organisasi Terpadu" 
            subtitle="Fitur inti pengelolaan organisasi yang dirancang untuk efisiensi Admin UKM dan BEM."
            />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <SpotlightCard className="rounded-2xl p-8"> 
                    <div className="w-12 h-12 bg-blue-600/10 rounded-lg flex items-center justify-center text-blue-500 mb-6 border border-blue-500/20">
                        <Users size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Manajemen UKM & Anggota</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        Database terpusat untuk seluruh anggota. Fitur <strong>Import Excel</strong> memudahkan input data massal. Kelola struktur organisasi dan hak akses dengan mudah.
                    </p>
                    <div className="flex gap-2"><TechBadge color="blue">Bulk Import</TechBadge> <TechBadge color="blue">RBAC</TechBadge></div>
                </SpotlightCard>

                <SpotlightCard className="rounded-2xl p-8">
                    <div className="w-12 h-12 bg-green-600/10 rounded-lg flex items-center justify-center text-green-500 mb-6 border border-green-500/20">
                        <MapPin size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">Event & Presensi GPS</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        Buat jadwal kegiatan dan pantau kehadiran anggota menggunakan <strong>Geo-tagging</strong>. Presensi hanya valid jika anggota berada di radius lokasi rapat.
                    </p>
                    <TechBadge color="green">Geolocation API</TechBadge>
                </SpotlightCard>

                <SpotlightCard className="rounded-2xl p-8">
                    <div className="w-12 h-12 bg-orange-600/10 rounded-lg flex items-center justify-center text-orange-500 mb-6 border border-orange-500/20">
                        <HardDrive size={24} />
                    </div>
                    <h3 className="text-xl font-bold text-white mb-3">E-Arsip & Generator Surat</h3>
                    <p className="text-slate-400 text-sm leading-relaxed mb-4">
                        Simpan LPJ dan Proposal di Cloud aman. Gunakan fitur <strong>Generator Surat</strong> untuk membuat surat resmi organisasi secara otomatis sesuai template.
                    </p>
                    <div className="flex gap-2"><TechBadge color="orange">Cloud</TechBadge> <TechBadge color="orange">PDF Gen</TechBadge></div>
                </SpotlightCard>
            </div>
        </div>
      </section>
    
      <section className="relative py-24 px-6 overflow-hidden z-10">
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808012_1px,transparent_1px),linear-gradient(to_bottom,#80808012_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none opacity-50 mask-image-radial-gradient" /> 
        
        <div className="max-w-7xl mx-auto relative z-10">
          <SectionHeader 
             label="Innovation Layer"
             title="Sistem Cerdas & Terkoneksi" 
             subtitle="Mengadopsi teknologi Artificial Intelligence terbaru untuk mendukung pembelajaran mahasiswa."
          />

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 auto-rows-[minmax(300px,auto)]">
            
            <SpotlightCard className="lg:col-span-7 rounded-3xl p-8 lg:p-10 flex flex-col justify-between relative overflow-hidden border-purple-500/20">
               <div className="absolute -top-20 -right-20 w-64 h-64 bg-purple-600/20 blur-[80px] rounded-full pointer-events-none" />
               
               <div className="relative z-10">
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-lg text-white shadow-lg shadow-purple-900/50">
                        <Bot size={24} />
                     </div>
                     <span className="text-purple-400 font-mono text-xs uppercase tracking-widest">SILearning</span>
                  </div>
                  
                  <h3 className="text-3xl font-bold text-white mb-4">AI Learning Center</h3>
                  <p className="text-slate-400 leading-relaxed mb-6 max-w-lg">
                     Platform belajar mandiri yang revolusioner. Tonton video tutorial (C++, React, dll) dan chat langsung dengan <strong>AI Tutor</strong> jika ada materi yang membingungkan.
                  </p>

                  <ul className="space-y-3 mb-8">
                     {[
                        "Smart Fallback: AI menjawab meski video tanpa subtitle",
                        "Code Playground: Editor koding langsung di browser",
                        "Personal Notes: Simpan rangkuman materi ke PDF"
                     ].map((item, i) => (
                        <li key={i} className="flex items-center gap-3 text-sm text-slate-300">
                           <div className="w-5 h-5 rounded-full bg-purple-500/20 flex items-center justify-center text-purple-400"><FileCheck size={12}/></div>
                           {item}
                        </li>
                     ))}
                  </ul>
               </div>
               
               <div className="mt-auto bg-[#1e293b]/50 backdrop-blur-md rounded-t-xl border border-white/5 p-4 relative shadow-2xl translate-y-4 lg:translate-y-0">
                  <div className="flex gap-4 mb-4">
                     <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-xs font-bold">M</div>
                     <div className="bg-slate-700/50 rounded-2xl rounded-tl-none p-3 text-xs text-slate-200">
                        Bisa jelaskan fungsi `useEffect` di menit 04:20?
                     </div>
                  </div>
                  <div className="flex gap-4">
                     <div className="w-8 h-8 rounded-full bg-purple-600 flex items-center justify-center"><Bot size={16}/></div>
                     <div className="bg-purple-900/20 border border-purple-500/30 rounded-2xl rounded-tl-none p-3 text-xs text-purple-200 w-3/4">
                        Tentu! Di menit itu, `useEffect` digunakan untuk fetch data API saat komponen pertama kali dirender (Mounting).
                     </div>
                  </div>
               </div>
            </SpotlightCard>

            <SpotlightCard className="lg:col-span-5 rounded-3xl p-8 relative flex flex-col justify-between border-blue-500/20">
               <div className="absolute top-0 right-0 p-6 opacity-20"><Zap size={100} className="text-blue-500"/></div>
               
               <div>
                  <div className="flex items-center gap-3 mb-6">
                     <div className="p-2 bg-blue-600/20 text-blue-400 rounded-lg border border-blue-500/30">
                        <Mail size={24} />
                     </div>
                     <span className="text-blue-400 font-mono text-xs uppercase tracking-widest">Internal Communication</span>
                  </div>
                  
                  <h3 className="text-2xl font-bold text-white mb-4">Sistem Broadcast & Surat</h3>
                  <p className="text-slate-400 text-sm leading-relaxed mb-6">
                     Komunikasi resmi antar UKM yang terstruktur. Fitur <strong>Inbox</strong> dan <strong>Compose</strong> dengan dukungan lampiran dokumen.
                  </p>

                  <div className="bg-slate-900/50 rounded-xl p-4 border border-white/5 space-y-4">
                     <div className="flex items-center gap-3 pb-3 border-b border-white/5">
                        <div className="bg-yellow-500/20 p-2 rounded text-yellow-500"><AlertTriangle size={16}/></div>
                        <div>
                           <div className="text-white text-xs font-bold">Approval System</div>
                           <div className="text-[10px] text-slate-500">Pesan broadcast harus disetujui Admin Utama untuk mencegah spam.</div>
                        </div>
                     </div>
                     <div className="flex items-center gap-3">
                         <div className="bg-blue-500/20 p-2 rounded text-blue-500"><FileText size={16}/></div>
                         <div>
                           <div className="text-white text-xs font-bold">Attachment Support</div>
                           <div className="text-[10px] text-slate-500">Kirim PDF/DOCX yang tersimpan otomatis di Cloud.</div>
                        </div>
                     </div>
                  </div>
               </div>
               
               <div className="mt-6 flex gap-2">
                  <TechBadge color="blue">SMTP</TechBadge>
                  <TechBadge color="blue">Approval Flow</TechBadge>
               </div>
            </SpotlightCard>

            <SpotlightCard className="lg:col-span-12 rounded-3xl p-8 flex flex-col md:flex-row items-center gap-8 border-orange-500/20 bg-gradient-to-r from-slate-950/50 to-orange-950/10 backdrop-blur-sm">
               <div className="flex-1">
                  <div className="flex items-center gap-3 mb-4">
                     <div className="p-2 bg-orange-500/20 text-orange-500 rounded-lg border border-orange-500/30">
                        <MessageSquare size={24} />
                     </div>
                     <h3 className="text-2xl font-bold text-white">Layanan Pengaduan & Aspirasi</h3>
                  </div>
                  <p className="text-slate-400 text-sm leading-relaxed mb-4 max-w-2xl">
                     Wadah resmi mahasiswa untuk melapor masalah fasilitas atau memberi saran ke BEM. Dilengkapi fitur upload <strong>Bukti Screenshot</strong> dan status tracking (Pending/Selesai).
                  </p>
                  <div className="flex gap-2">
                     <TechBadge color="orange">Ticketing System</TechBadge>
                     <TechBadge color="orange">Evidence Upload</TechBadge>
                  </div>
               </div>
               <div className="w-full md:w-1/3 bg-slate-900/50 rounded-xl border border-white/5 p-4">
                  <div className="flex justify-between items-center mb-2">
                     <span className="text-xs text-slate-400">Status Laporan</span>
                     <span className="text-[10px] bg-green-500/20 text-green-400 px-2 py-0.5 rounded">Selesai</span>
                  </div>
                  <div className="text-sm text-white font-medium mb-1">AC Ruang 404 Rusak</div>
                  <div className="text-xs text-slate-500 mb-3">Dilaporkan: 12 Feb 2026</div>
                  <div className="p-2 bg-slate-800/80 rounded text-xs text-slate-300 border border-white/5">
                     <span className="text-blue-400 font-bold">Admin:</span> Terima kasih, teknisi sudah memperbaiki unit tersebut.
                  </div>
               </div>
            </SpotlightCard>

          </div>
        </div>
      </section>

      <section className="relative py-24 z-10">
         <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-6 grid lg:grid-cols-2 gap-16 items-center">
          
          <div>
            <div className="flex items-center gap-2 mb-4">
              <ShieldCheck className="text-green-500" size={24} />
              <span className="text-green-500 font-mono text-sm tracking-widest uppercase">Security Architecture Report</span>
            </div>
            
            <h2 className="text-3xl md:text-5xl font-bold text-white mb-6">Defense in Depth Strategy</h2>
            <p className="text-slate-400 text-lg mb-10 leading-relaxed">
              Kami menerapkan keamanan berlapis. Dari jaringan terluar hingga inti database, setiap request divalidasi dengan standar industri untuk mencegah serangan modern.
            </p>

            <div className="space-y-6">
               <div className="flex gap-4 group">
                  <div className="mt-1 w-10 h-10 rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center text-blue-400 group-hover:border-blue-500 transition-colors">
                     <Globe size={20}/>
                  </div>
                  <div>
                     <h4 className="text-white font-bold text-lg">1. Network & Server Security</h4>
                     <p className="text-slate-500 text-sm mt-1">
                        Perlindungan level infrastruktur dengan <strong>Rate Limiting</strong> (Anti-DDoS), <strong>CORS Whitelist</strong>, dan Trust Proxy configuration.
                     </p>
                  </div>
               </div>

               <div className="flex gap-4 group">
                  <div className="mt-1 w-10 h-10 rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center text-purple-400 group-hover:border-purple-500 transition-colors">
                     <Lock size={20}/>
                  </div>
                  <div>
                     <h4 className="text-white font-bold text-lg">2. App Hardening & Auth</h4>
                     <p className="text-slate-500 text-sm mt-1">
                        Implementasi <strong>Helmet</strong> untuk keamanan Header HTTP. Autentikasi berbasis <strong>JWT (JSON Web Token)</strong> dengan RBAC Middleware untuk pemisahan hak akses.
                     </p>
                  </div>
               </div>

               <div className="flex gap-4 group">
                  <div className="mt-1 w-10 h-10 rounded-lg bg-slate-800/50 border border-white/10 flex items-center justify-center text-green-400 group-hover:border-green-500 transition-colors">
                     <Database size={20}/>
                  </div>
                  <div>
                     <h4 className="text-white font-bold text-lg">3. Data & File Protection</h4>
                     <p className="text-slate-500 text-sm mt-1">
                        Pencegahan <strong>SQL Injection</strong> dengan Parameterized Queries. Upload file aman via <strong>Cloud</strong> dengan filter whitelist ketat (hanya PDF/IMG) dan sanitasi nama file.
                     </p>
                  </div>
               </div>
            </div>
          </div>

          <div className="relative font-mono text-xs md:text-sm">
             <div className="absolute inset-0 bg-blue-500/10 blur-[100px] rounded-full" />
             
             <div className="relative rounded-xl bg-[#0f172a]/80 backdrop-blur-md border border-white/10 shadow-2xl overflow-hidden ring-1 ring-white/5">
                <div className="flex items-center justify-between px-4 py-3 bg-[#1e293b]/50 border-b border-white/5">
                   <div className="flex items-center gap-2">
                      <Terminal size={14} className="text-slate-400"/>
                      <span className="text-slate-400">root@siaksi-server:~#</span>
                   </div>
                   <div className="flex gap-1.5">
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                      <div className="w-2.5 h-2.5 rounded-full bg-slate-600" />
                   </div>
                </div>

                <div className="p-6 space-y-4 text-slate-300 h-[400px] overflow-y-auto custom-scrollbar">
                   <div>
                      <span className="text-green-400">➜</span> <span className="text-blue-400">run-security-audit</span> --verbose
                   </div>
                   <div className="space-y-2 pl-4 border-l border-slate-700 ml-1 mt-2">
                      <div className="flex justify-between items-center">
                         <span>[NETWORK] express-rate-limit</span>
                         <span className="text-green-400 bg-green-900/20 px-2 rounded">[ACTIVE]</span>
                      </div>
                   </div>
                   <div className="pt-4 border-t border-white/5 text-slate-500 mt-4">
                      <span className="text-white font-bold">Live Traffic Log:</span> <br/>
                      <div className="mt-2 space-y-1 font-mono text-[10px] md:text-xs">
                         <div><span className="text-blue-500">INFO:</span> User 8492 login success (JWT Generated)</div>
                         <div><span className="text-blue-500">INFO:</span> Upload 'Laporan.pdf' {'->'} Sanitize {'->'} Cloudinary [OK]</div>
                         <div><span className="text-red-500">WARN:</span> IP 10.20.1.5 blocked by CORS Policy</div>
                         <div><span className="text-red-500">CRITICAL:</span> Attempted SQL Injection detected on /login {'->'} BLOCKED</div>
                      </div>
                   </div>
                </div>
             </div>
          </div>

        </div>
      </section>

      <section className="relative py-24 px-6 z-10">
         <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
         
         <div className="max-w-7xl mx-auto text-center mb-12">
            <h2 className="text-3xl font-bold text-white mb-4">Portal Informasi Publik</h2>
            <p className="text-slate-400">Berita kegiatan dan transparansi organisasi untuk seluruh civitas akademika.</p>
         </div>

         <div className="max-w-7xl mx-auto grid md:grid-cols-2 gap-8">
            <SpotlightCard className="rounded-2xl p-0 h-[300px] group cursor-pointer border-none bg-transparent">
               <div className="h-2/3 bg-slate-800 relative overflow-hidden rounded-t-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"/>
                  <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1523580494863-6f3031224c94?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50 group-hover:scale-110 transition-transform duration-700"/>
                  <div className="absolute bottom-4 left-4 z-20">
                     <span className="px-2 py-1 bg-blue-600 text-white text-[10px] rounded mb-2 inline-block">Kegiatan</span>
                     <h3 className="text-white font-bold text-lg">Inaugurasi Art Media Crew 2026</h3>
                  </div>
               </div>
               <div className="h-1/3 p-4 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between rounded-b-2xl border border-t-0 border-white/5">
                  <p className="text-slate-400 text-sm line-clamp-2">Dokumentasi kegiatan pelantikan anggota baru yang dilaksanakan pada 8-9 Februari.</p>
                  <ArrowRight className="text-blue-500 group-hover:translate-x-2 transition-transform"/>
               </div>
            </SpotlightCard>

            <SpotlightCard className="rounded-2xl p-0 h-[300px] group cursor-pointer border-none bg-transparent">
               <div className="h-2/3 bg-slate-800 relative overflow-hidden rounded-t-2xl">
                  <div className="absolute inset-0 bg-gradient-to-t from-slate-900 to-transparent z-10"/>
                  <div className="w-full h-full bg-[url('https://images.unsplash.com/photo-1434030216411-0b793f4b4173?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-50 group-hover:scale-110 transition-transform duration-700"/>
                  <div className="absolute bottom-4 left-4 z-20">
                     <span className="px-2 py-1 bg-green-600 text-white text-[10px] rounded mb-2 inline-block">Akademik</span>
                     <h3 className="text-white font-bold text-lg">Jadwal UTS Semester Genap</h3>
                  </div>
               </div>
               <div className="h-1/3 p-4 bg-slate-900/50 backdrop-blur-sm flex items-center justify-between rounded-b-2xl border border-t-0 border-white/5">
                  <p className="text-slate-400 text-sm line-clamp-2">Informasi penting mengenai pelaksanaan Ujian Tengah Semester bagi kelas Reguler dan Malam.</p>
                  <ArrowRight className="text-green-500 group-hover:translate-x-2 transition-transform"/>
               </div>
            </SpotlightCard>
         </div>
      </section>

      <section className="relative py-24 px-6 overflow-hidden z-10">
        <div className="absolute inset-0 bg-gradient-to-t from-blue-900/10 to-transparent -z-10" />
        
        <div className="max-w-5xl mx-auto relative z-10">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }}
            className="bg-gradient-to-r from-blue-900/50 to-slate-900/50 backdrop-blur-lg rounded-[3rem] px-8 py-20 md:px-20 md:py-24 text-center relative overflow-hidden border border-white/10 shadow-2xl"
          >
            <div className="absolute top-0 right-0 -mr-20 -mt-20 w-96 h-96 bg-blue-600 rounded-full blur-[100px] opacity-20" />
            <div className="absolute bottom-0 left-0 -ml-20 -mb-20 w-80 h-80 bg-purple-600 rounded-full blur-[100px] opacity-20" />
            
            <h2 className="relative text-3xl md:text-5xl font-bold text-white mb-6 tracking-tight leading-tight">
              Siap untuk Transformasi Digital?
            </h2>
            <p className="relative text-blue-100 text-lg md:text-xl font-light mb-10 max-w-2xl mx-auto">
              Akses seluruh fitur SIAKSI mulai dari presensi, pembelajaran AI, hingga administrasi surat dalam satu dashboard.
            </p>
            
            <div className="relative flex flex-col sm:flex-row justify-center gap-4">
              <button onClick={() => navigate('/login')} className="h-14 px-10 rounded-full bg-white text-blue-900 font-bold hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center gap-2">
                Akses Dashboard Sekarang <ArrowRight size={20}/>
              </button>
            </div>
          </motion.div>
        </div>
      </section>

<footer className="relative pt-20 pb-10 bg-[#020617] z-10">
         <div className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent to-[#020617] -mt-32 pointer-events-none" />
         <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 md:gap-8 mb-16">
            <div className="col-span-1 md:col-span-2">
              <div className="flex items-center gap-2 mb-6">
                <span className="text-2xl font-bold text-white tracking-tight">SIAKSI</span>
              </div>
              <p className="text-slate-400 leading-relaxed mb-6 max-w-sm text-sm">
                Sistem Informasi Aktivitas, Kehadiran, dan Administrasi BEM STIKOM Poltek Cirebon. 
                Platform resmi manajemen organisasi mahasiswa berbasis data dan kecerdasan buatan.
              </p>
              <div className="flex gap-4">
                 <a href="https://muhamadariz.my.id" target="_blank" rel="noopener noreferrer" title="Developer Portfolio" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer">
                    <Globe size={14}/>
                 </a>
                 <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center text-slate-400 hover:bg-blue-600 hover:text-white transition-all cursor-pointer"><Mail size={14}/></div>
              </div>
            </div>
            
            <div>
              <h4 className="font-bold text-white mb-6">Platform</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={12}/> Beranda</a></li>
                <li><a href="/news" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={12}/> Berita Kegiatan</a></li>
                <li><a href="/login" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={12}/> Login Anggota</a></li>
                {/* Link Tambahan ke Web Pribadi */}
                <li>
                  <a href="https://muhamadariz.my.id" target="_blank" rel="noopener noreferrer" className="text-blue-400/80 hover:text-blue-400 transition-colors flex items-center gap-2">
                    <ChevronRight size={12}/> Developer Profile
                  </a>
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-bold text-white mb-6">Hubungi Kami</h4>
              <ul className="space-y-4 text-slate-400 text-sm">
                <li className="flex gap-3 items-start">
                   <MapPin size={18} className="mt-0.5 text-blue-500 shrink-0"/>
                   <span>Jl. Kedawung, Cirebon, Jawa Barat</span>
                </li>
                <li className="flex gap-3 items-center">
                   <Mail size={18} className="text-blue-500 shrink-0"/>
                   <span>bemstikomcrb@gmail.com</span>
                </li>
                  <li className="flex gap-3 items-center">
                   <Mail size={18} className="text-blue-500 shrink-0"/>
                   <span>siaksibemstikomcrb@gmail.com</span>
                </li>
              </ul>
            </div>
          </div>
          
          <div className="pt-8 border-t border-white/5 flex flex-col md:flex-row justify-between items-center gap-4">
            <div className="flex flex-col md:flex-row items-center gap-2 md:gap-4">
              <p className="text-slate-500 text-[10px] md:text-xs">
                &copy; {new Date().getFullYear()} BEM STIKOM Poltek Cirebon
              </p>
              <span className="hidden md:block w-1 h-1 bg-slate-800 rounded-full" />
              {/* Teks Pengenal Developer */}
              <p className="text-slate-500 text-[10px] md:text-xs">
                Developed by <a href="https://muhamadariz.my.id" target="_blank" rel="noopener noreferrer" className="text-blue-500/80 hover:text-blue-400 font-semibold transition-colors">Muhammad Ariz</a>
              </p>
            </div>
            <div className="flex gap-6 text-[10px] md:text-xs text-slate-500">
               <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
               <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Home;
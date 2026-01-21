import React from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  CheckCircle, ArrowRight, Calendar, Smartphone, 
  FileText, Zap, Globe, ChevronRight, MapPin, 
  Mail, Building, BarChart3, Layers, Shield,
  Users 
} from 'lucide-react';

import Navbar from '../components/Navbar'; 
import Particles from '../components/ui/Particles'; // <--- IMPORT PARTICLES DISINI (Sesuaikan path)

import content1 from '../assets/images/content-1.jpg'; 
import content2 from '../assets/images/content-2.jpg'; 
import content3 from '../assets/images/content-3.jpg'; 

// ==========================================
// 1. ANIMATION CONFIG
// ==========================================
const CINEMATIC_EASE = [0.25, 1, 0.5, 1];

const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { 
    opacity: 1, 
    y: 0, 
    transition: { duration: 1, ease: CINEMATIC_EASE } 
  }
};

const fadeIn = {
  hidden: { opacity: 0 },
  visible: { 
    opacity: 1, 
    transition: { duration: 1.2, ease: CINEMATIC_EASE } 
  }
};

const containerStagger = {
  visible: {
    transition: { staggerChildren: 0.15 }
  }
};

const hoverCard = {
  hover: { 
    y: -8,
    boxShadow: "0 20px 40px -10px rgba(59, 130, 246, 0.15)",
    transition: { duration: 0.4, ease: "easeOut" }
  }
};

const ProBadge = ({ text }) => (
  <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 backdrop-blur-md mb-6">
    <span className="w-1.5 h-1.5 rounded-full bg-blue-500 animate-pulse"/>
    <span className="text-xs font-medium text-blue-400 tracking-wide uppercase">{text}</span>
  </div>
);

const SectionTitle = ({ title, subtitle, centered = true, dark = false }) => (
  <motion.div 
    initial="hidden" 
    whileInView="visible" 
    viewport={{ once: true, margin: "-100px" }}
    variants={fadeInUp}
    className={`mb-16 ${centered ? 'text-center mx-auto' : 'text-left'} max-w-3xl`}
  >
    <h2 className={`text-sm font-medium tracking-widest uppercase mb-3 ${dark ? 'text-blue-400' : 'text-blue-600'}`}>
      {title}
    </h2>
    <h3 className={`text-3xl md:text-4xl lg:text-5xl font-medium tracking-tight leading-[1.1] ${dark ? 'text-white' : 'text-slate-900'}`}>
      {subtitle}
    </h3>
  </motion.div>
);

// ==========================================
// 3. MAIN COMPONENT
// ==========================================
const Home = () => {
  const navigate = useNavigate();

  return (
    <div className="w-full min-h-screen bg-white font-sans selection:bg-blue-600 selection:text-white">
      <Navbar isTransparent={true} />

      {/* HERO SECTION */}
      <section className="relative pt-32 pb-20 lg:pt-48 lg:pb-32 overflow-hidden bg-[#020617] isolate">
        
        {/* === BACKGROUND AREA (INTEGRASI PARTICLES) === */}
        <div className="absolute inset-0 z-0">
          
          {/* Efek Blur Biru (Opsional: Tetap ada agar atmosfer warnanya bagus) */}
          <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[1000px] h-[600px] bg-blue-600/20 rounded-[100%] blur-[120px] mix-blend-screen opacity-50 pointer-events-none" />
          
          {/* KOMPONEN PARTICLES */}
          {/* Kita set absolute inset-0 agar memenuhi seluruh section hero */}
          <div className="absolute inset-0 w-full h-full">
            <Particles
                particleColors={['#ffffff', '#3b82f6']} // Putih & Biru (Sesuai tema)
                particleCount={200}
                particleSpread={10}
                speed={0.1}
                particleBaseSize={100}
                moveParticlesOnHover={true}
                alphaParticles={false}
                disableRotation={false}
            />
          </div>
        </div>

        {/* === KONTEN UTAMA (Tetap sama) === */}
        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col items-center text-center pointer-events-none">
            {/* Note: Saya tambahkan pointer-events-none di container utama, 
                lalu pointer-events-auto di elemen interaktif (button/text)
                agar mouse movement untuk particles di background tetap terdeteksi 
                di area kosong, tapi tombol tetap bisa diklik.
            */}

          <motion.div 
            initial="hidden"
            animate="visible"
            variants={containerStagger}
            className="max-w-4xl mx-auto mb-16 pointer-events-auto" // Aktifkan pointer event untuk teks
          >
            <motion.div variants={fadeInUp} className="flex justify-center">
              <ProBadge text="BEM STIKOM POLTEK CIREBON" />
            </motion.div>
            
            <motion.div variants={fadeInUp}>
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-medium text-white leading-[1.1] tracking-tight mb-8">
                Satu Sistem untuk <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-300 via-blue-500 to-indigo-500">
                  Ribuan Aktivitas.
                </span>
              </h1>
            </motion.div>

            <motion.div variants={fadeInUp}>
              <p className="text-lg md:text-xl text-slate-400 font-normal leading-relaxed max-w-2xl mx-auto mb-10">
                Tinggalkan administrasi manual. <strong className="text-white font-medium">SIAKSI</strong> mendigitalkan presensi, laporan, dan manajemen anggota STIKOM Poltek Cirebon dalam satu dashboard terpusat.
              </p>
            </motion.div>

            <motion.div variants={fadeInUp} className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <button onClick={() => navigate('/login')} className="h-12 px-8 rounded-full bg-blue-600 hover:bg-blue-500 text-white font-medium transition-all shadow-[0_0_20px_-5px_rgba(37,99,235,0.5)] flex items-center gap-2 group">
                Mulai Sekarang <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform"/>
              </button>
              <button onClick={() => navigate('/news')} className="h-12 px-8 rounded-full bg-white/5 border border-white/10 hover:bg-white/10 text-white font-medium backdrop-blur-sm transition-all flex items-center gap-2">
                <Globe size={18} /> Jelajahi Kegiatan
              </button>
            </motion.div>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 100, rotateX: 20 }}
            animate={{ opacity: 1, y: 0, rotateX: 0 }}
            transition={{ duration: 1.2, ease: "easeOut", delay: 0.2 }}
            className="relative w-full max-w-5xl mx-auto perspective-[2000px] pointer-events-auto"
          >
            <div className="relative rounded-2xl bg-slate-900 border border-slate-800 p-2 shadow-2xl shadow-blue-900/20 overflow-hidden ring-1 ring-white/10">
              <div className="rounded-xl overflow-hidden bg-slate-800 aspect-[16/9] relative group">
                <img src={content1} alt="Dashboard UI" className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity duration-700" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-50" />
                
                <motion.div 
                  initial={{ y: 20, opacity: 0 }}
                  animate={{ y: 0, opacity: 1 }}
                  transition={{ delay: 1, duration: 1 }}
                  className="absolute bottom-8 left-8 bg-slate-900/80 backdrop-blur-md border border-slate-700 p-4 rounded-xl flex items-center gap-4 shadow-lg"
                >
                  <div className="w-10 h-10 rounded-full bg-green-500/20 flex items-center justify-center">
                    <CheckCircle className="text-green-500" size={20} />
                  </div>
                  <div>
                    <p className="text-xs text-slate-400">Status Validasi</p>
                    <p className="text-sm text-white font-medium">Laporan Diterima</p>
                  </div>
                </motion.div>
              </div>
            </div>
            <div className="absolute -inset-4 bg-blue-500/20 blur-3xl -z-10 rounded-[3rem]" />
          </motion.div>
        </div>
      </section>

      {/* ... SISANYA SAMA PERSIS DENGAN KODE SEBELUMNYA ... */}
      
      {/* FEATURES SECTION (Z-PATTERN) */}
      <section id='features' className="py-24 lg:py-32 px-4 bg-white overflow-hidden">
        <div className="max-w-7xl mx-auto">
          <SectionTitle 
            title="Solusi Modern" 
            subtitle="Transformasi Digital Tanpa Hambatan."
          />

          <div className="space-y-24">
            {/* Feature 1 */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="order-2 md:order-1 relative"
              >
                <div className="absolute -inset-4 bg-blue-500/5 rounded-3xl -z-10 rotate-3" />
                <div className="rounded-2xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 h-[300px] md:h-[400px] w-full">
                   <img src={content2} alt="Paperless" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                </div>
              </motion.div>
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerStagger}
                className="order-1 md:order-2"
              >
                <motion.div variants={fadeInUp} className="w-14 h-14 bg-blue-50 rounded-2xl flex items-center justify-center mb-6 text-blue-600">
                  <FileText size={28} />
                </motion.div>
                <motion.h3 variants={fadeInUp} className="text-3xl font-medium text-slate-900 mb-4">Paperless Administration</motion.h3>
                <motion.p variants={fadeInUp} className="text-lg text-slate-500 font-normal leading-relaxed mb-6">
                  Tidak ada lagi tumpukan berkas fisik. Semua surat, proposal, dan laporan tersimpan aman di cloud database.
                </motion.p>
                <motion.ul variants={fadeInUp} className="space-y-3">
                  {['Arsip Digital Aman', 'Pencarian Dokumen Cepat', 'Hemat Biaya Operasional'].map((item, i) => (
                    <li key={i} className="flex items-center gap-3 text-slate-600 font-medium">
                      <CheckCircle size={18} className="text-blue-500" /> {item}
                    </li>
                  ))}
                </motion.ul>
              </motion.div>
            </div>

            {/* Feature 2 (Reversed) */}
            <div className="grid md:grid-cols-2 gap-12 lg:gap-20 items-center">
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={containerStagger}
              >
                <motion.div variants={fadeInUp} className="w-14 h-14 bg-indigo-50 rounded-2xl flex items-center justify-center mb-6 text-indigo-600">
                  <Zap size={28} />
                </motion.div>
                <motion.h3 variants={fadeInUp} className="text-3xl font-medium text-slate-900 mb-4">Real-time Validation</motion.h3>
                <motion.p variants={fadeInUp} className="text-lg text-slate-500 font-normal leading-relaxed mb-6">
                  Sistem presensi cerdas dengan validasi lokasi (Geo-tagging) dan waktu. Memastikan data kehadiran valid.
                </motion.p>
                <motion.div variants={fadeInUp} className="p-4 bg-slate-50 rounded-xl border border-slate-100 flex gap-4 items-center">
                  <div className="bg-white p-3 rounded-lg shadow-sm text-indigo-600"><MapPin size={24} /></div>
                  <div>
                    <p className="font-medium text-slate-900">GPS Tracking Enabled</p>
                    <p className="text-sm text-slate-500">Radius lokasi terkunci otomatis.</p>
                  </div>
                </motion.div>
              </motion.div>
              <motion.div 
                initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
                className="relative"
              >
                 <div className="absolute -inset-4 bg-indigo-500/5 rounded-3xl -z-10 -rotate-3" />
                 <div className="rounded-2xl overflow-hidden shadow-2xl shadow-slate-200 border border-slate-100 h-[300px] md:h-[400px] w-full">
                   <img src={content3} alt="Validation" className="w-full h-full object-cover hover:scale-105 transition-transform duration-700" />
                 </div>
              </motion.div>
            </div>
          </div>
        </div>
      </section>

      {/* BENTO GRID (GLASS CARDS) */}
      <section className="py-24 bg-slate-50">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle 
            title="Ekosistem Lengkap" 
            subtitle="Fitur Esensial untuk Organisasi." 
          />

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 auto-rows-[320px]">
            {/* Main Feature Card */}
            <motion.div 
              initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeInUp}
              whileHover="hover"
              className="md:col-span-2 bg-gradient-to-br from-[#0f172a] to-[#1e293b] rounded-3xl p-10 text-white relative overflow-hidden group flex flex-col justify-between"
            >
              <div className="relative z-10">
                <div className="w-12 h-12 bg-blue-500/20 border border-blue-500/30 rounded-2xl flex items-center justify-center mb-6">
                  <Smartphone size={24} className="text-blue-400"/>
                </div>
                <h3 className="text-2xl font-medium mb-3">Mobile First Design</h3>
                <p className="text-slate-400 font-light max-w-sm">
                  Dioptimalkan untuk layar sentuh. Akses dashboard dan validasi surat langsung dari smartphone Anda.
                </p>
              </div>
              <div className="absolute right-0 bottom-0 w-64 h-64 bg-gradient-to-tl from-blue-600/30 to-transparent rounded-tl-full opacity-50 group-hover:scale-110 transition-transform duration-700" />
            </motion.div>

            {/* Side Card 1 */}
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              whileHover="hover" 
              viewport={{ once: true }} 
              transition={{ delay: 0.1 }}
              variants={{ ...fadeInUp, ...hoverCard }}
              className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-200 flex flex-col justify-center group"
            >
              <div className="w-12 h-12 bg-orange-50 text-orange-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <Calendar size={24} />
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2">Easy Scheduling</h3>
              <p className="text-slate-500 font-normal">Anda akan lebih mudah mengatur jadwal pertemuan dan kegiatan</p>
            </motion.div>

             {/* Side Card 2 */}
             <motion.div 
              initial="hidden" 
              whileInView="visible" 
              whileHover="hover" 
              viewport={{ once: true }} 
              transition={{ delay: 0.2 }}
              variants={{ ...fadeInUp, ...hoverCard }}
              className="bg-white rounded-3xl p-8 border border-slate-200 hover:border-blue-200 flex flex-col justify-center group"
            >
              <div className="w-12 h-12 bg-teal-50 text-teal-600 rounded-2xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <BarChart3 size={24} />
              </div>
              <h3 className="text-xl font-medium text-slate-900 mb-2">Auto Reporting</h3>
              <p className="text-slate-500 font-normal">Generate laporan kegiatan (LPJ) otomatis dalam format PDF siap cetak.</p>
            </motion.div>

            {/* Wide Bottom Card */}
            <motion.div 
              initial="hidden" 
              whileInView="visible" 
              whileHover="hover" 
              viewport={{ once: true }} 
              transition={{ delay: 0.3 }}
              variants={{ ...fadeInUp, ...hoverCard }}
              className="md:col-span-2 bg-white rounded-3xl p-10 border border-slate-200 hover:border-blue-200 relative overflow-hidden group flex items-center"
            >
              <div className="relative z-10 max-w-lg">
                <h3 className="text-2xl font-medium text-slate-900 mb-3">Keamanan Data Terjamin</h3>
                <p className="text-slate-500 font-normal mb-6">
                  Enkripsi end-to-end untuk data anggota dan arsip organisasi. Hak akses bertingkat (Admin, Pengurus, Anggota).
                </p>
                <div className="flex gap-4">
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700"><Shield size={16} className="text-green-500"/> Encrypted</span>
                  <span className="flex items-center gap-2 text-sm font-medium text-slate-700"><Layers size={16} className="text-blue-500"/> Backups</span>
                </div>
              </div>
              <div className="absolute right-0 top-0 h-full w-1/3 bg-gradient-to-l from-slate-50 to-transparent pointer-events-none" />
            </motion.div>
          </div>
        </div>
      </section>

      {/* TIMELINE SECTION */}
      <section className="py-24 bg-[#020617] text-white border-y border-white/5">
        <div className="max-w-7xl mx-auto px-4">
          <SectionTitle 
            title="Alur Penggunaan" 
            subtitle="3 Langkah Menuju Efisiensi." 
            dark={true}
          />

          <div className="relative mt-20 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="hidden md:block absolute top-12 left-[16%] right-[16%] h-0.5 bg-gradient-to-r from-blue-900 via-blue-500 to-blue-900 opacity-50" />

            {[
              { step: "01", title: "Login Akun", desc: "Gunakan NIA yang terdaftar.", icon: Users },
              { step: "02", title: "Pilih Kegiatan", desc: "Cek jadwal aktif di dashboard.", icon: Calendar },
              { step: "03", title: "Konfirmasi", desc: "Validasi kehadiran satu klik.", icon: CheckCircle }
            ].map((item, idx) => (
              <motion.div 
                key={idx}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: idx * 0.2, duration: 0.8 }}
                className="relative flex flex-col items-center text-center group"
              >
                <div className="w-24 h-24 rounded-full bg-[#0f172a] border-4 border-[#1e293b] flex items-center justify-center relative z-10 mb-8 group-hover:border-blue-500 transition-colors duration-500">
                  <div className="w-16 h-16 rounded-full bg-blue-600/20 flex items-center justify-center text-blue-400 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                    <item.icon size={32} />
                  </div>
                  <div className="absolute -top-3 -right-3 w-8 h-8 rounded-full bg-blue-600 text-white text-xs font-bold flex items-center justify-center border-4 border-[#0f172a]">
                    {item.step}
                  </div>
                </div>
                <h3 className="text-xl font-medium text-white mb-3">{item.title}</h3>
                <p className="text-slate-400 font-light max-w-xs">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA SECTION */}
      <section className="py-24 px-4 overflow-hidden">
        <div className="max-w-6xl mx-auto">
          <motion.div 
            initial="hidden" whileInView="visible" viewport={{ once: true }} variants={fadeIn}
            className="relative rounded-[3rem] bg-blue-600 px-6 py-20 text-center overflow-hidden shadow-2xl shadow-blue-900/30"
          >
            <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
              <div className="absolute -top-[50%] -left-[20%] w-[800px] h-[800px] bg-white/10 rounded-full blur-[100px]" />
              <div className="absolute -bottom-[50%] -right-[20%] w-[800px] h-[800px] bg-indigo-900/20 rounded-full blur-[100px]" />
            </div>

            <div className="relative z-10 max-w-3xl mx-auto">
              <h2 className="text-3xl md:text-5xl font-medium text-white mb-6 leading-tight">
                Siap Meningkatkan Kualitas <br/>Organisasi Anda?
              </h2>
              <p className="text-blue-100 text-lg md:text-xl font-light mb-10">
                Bergabunglah dengan transformasi digital STIKOM Poltek Cirebon. Efisien, Transparan, dan Terintegrasi.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <button onClick={() => navigate('/login')} className="h-14 px-10 rounded-2xl bg-white text-blue-700 font-medium hover:bg-blue-50 transition-colors shadow-lg flex items-center justify-center gap-2">
                  Akses Sistem <ArrowRight size={20} />
                </button>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* FOOTER */}
      <footer className="bg-[#020617] pt-20 pb-32 md:pb-10 px-4 border-t border-slate-800/50">
        <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-12 gap-12 mb-16">
          <div className="md:col-span-5">
            <h3 className="text-2xl font-bold text-white mb-6 tracking-tight">SIAKSI</h3>
            <p className="text-slate-400 font-light leading-relaxed mb-6 max-w-sm">
              Sistem Informasi Aktivitas, Kehadiran, dan Administrasi. Platform resmi manajemen organisasi mahasiswa STIKOM Poltek Cirebon.
            </p>
            <div className="flex items-center gap-3">
              <span className="px-3 py-1 rounded-full bg-blue-500/10 border border-blue-500/20 text-blue-400 text-xs font-medium">
                Dalam Tahap Pengembangan
              </span>
              <span className="px-3 py-1 rounded-full bg-green-500/10 border border-green-500/20 text-green-400 text-xs font-medium flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse"/> SIAKSI
              </span>
            </div>
          </div>
          
          <div className="md:col-span-3 md:col-start-7">
            <h4 className="text-white font-medium mb-6">Menu Akses</h4>
            <ul className="space-y-4 text-sm text-slate-400 font-normal">
              <li><a href="#" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Beranda</a></li>
              <li><a href="/news" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Berita Kegiatan</a></li>
              <li><a href="/login" className="hover:text-blue-400 transition-colors flex items-center gap-2"><ChevronRight size={14}/> Login Anggota</a></li>
            </ul>
          </div>

          <div className="md:col-span-3">
            <h4 className="text-white font-medium mb-6">Hubungi Kami</h4>
            <ul className="space-y-4 text-sm text-slate-400 font-normal">
              <li className="flex gap-3"><MapPin size={18} className="text-slate-500 flex-shrink-0"/> Jl. Kedawung, Cirebon</li>
              <li className="flex gap-3"><Building size={18} className="text-slate-500 flex-shrink-0"/> Sekretariat BEM STIKOM Cirebon</li>
              <li className="flex gap-3"><Mail size={18} className="text-slate-500 flex-shrink-0"/> siaksibemstikomcrb@gmail.com</li>
              <li className="flex gap-3"><Mail size={18} className="text-slate-500 flex-shrink-0"/> bemstikomcrb@gmail.com</li>
            </ul>
          </div>
        </div>
        
        <div className="max-w-7xl mx-auto pt-8 border-t border-slate-800/50 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-slate-500 font-light">
          <p>&copy; {new Date().getFullYear()} BEM STIKOM Poltek Cirebon. All rights reserved.</p>
          <div className="flex gap-6">
             <a href="/privacy" className="hover:text-white transition-colors">Privacy Policy</a>
             <a href="/terms" className="hover:text-white transition-colors">Terms of Service</a>
          </div>
        </div>
      </footer>

    </div>
  );
};

export default Home;
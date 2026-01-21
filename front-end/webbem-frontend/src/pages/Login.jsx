import { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { useNavigate, Link } from 'react-router-dom';
import { Lock, User, ShieldCheck, Home, ArrowRight, Loader2, CalendarClock } from 'lucide-react';
import { motion } from 'framer-motion';
import bgLogin from '../assets/images/bg-1.jpg'; 
import bgLoginMobile from '../assets/images/bg-2.jpg'; 
import { toast } from 'sonner';

// --- VARIANTS (LOGIC ANIMASI) ---

// 1. Desktop Animation (Original Logic) - Tetap muncul dari samping
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.8, ease: "easeOut" } }
};

// 2. Mobile Animation - Bottom Sheet (Muncul dari bawah)
const bottomSheetVariant = {
  hidden: { opacity: 0, y: 100 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.6, type: "spring", damping: 25, stiffness: 200 } }
};

const Login = () => {
  const [formData, setFormData] = useState({ username: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [currentTime, setCurrentTime] = useState('');
  const [isMobile, setIsMobile] = useState(window.innerWidth < 1024);
  const navigate = useNavigate();

  // Logic Time (Hanya Pemanis)
  useEffect(() => {
    const updateTime = () => {
        const now = new Date();
        setCurrentTime(now.toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }));
    };
    updateTime();
    const interval = setInterval(updateTime, 60000);
    
    // Handler resize untuk menentukan animasi desktop vs mobile
    const handleResize = () => setIsMobile(window.innerWidth < 1024);
    window.addEventListener('resize', handleResize);
    return () => {
        clearInterval(interval);
        window.removeEventListener('resize', handleResize);
    }
  }, []);

  const handleLogin = async (e) => {
    e.preventDefault();
    if(!formData.username || !formData.password) {
        return toast.warning('Input Tidak Lengkap', { description: 'Mohon isi username dan password.' });
    }
    setLoading(true);
    const toastId = toast.loading('Mengautentikasi...'); 

    try {
      const res = await api.post('/auth/login', formData);
      localStorage.setItem('token', res.data.token);
      localStorage.setItem('role', res.data.user.role);
      localStorage.setItem('ukm_id', res.data.user.ukm_id);
      localStorage.setItem('userId', res.data.user.id);

      toast.success(`Selamat Datang, ${res.data.user.name}!`, {
        id: toastId,
        description: 'Login berhasil, mengalihkan...',
        duration: 2000,
      });
      
      setTimeout(() => {
          if (res.data.user.role === 'admin' || res.data.user.role === 'super_admin') {
            navigate('/admin-dashboard');
          } else {
            navigate('/absen');
          }
      }, 1000);

    } catch (err) {
      toast.error('Login Gagal', {
        id: toastId,
        description: err.response?.data?.msg || 'Periksa kembali username & password anda.',
      });
    } finally {
        setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex bg-gray-50 lg:bg-[#0B1120] font-sans overflow-hidden relative">
      
      {/* ========================================================= */}
      {/* 1. KHUSUS MOBILE: Header Image & Text (SIAKSI)            */}
      {/* ========================================================= */}
      {/* Hidden di Desktop (lg:hidden) agar logic desktop tidak terganggu */}
      <div className="absolute top-0 left-0 w-full h-[45vh] lg:hidden z-0 overflow-hidden">
         <img src={bgLoginMobile} alt="Background Mobile" className="w-full h-full object-cover object-center brightness-75" />
         <div className="absolute inset-0 bg-gradient-to-b from-blue-950/70 via-blue-900/40 to-transparent"></div>

         <div className="absolute inset-0 flex flex-col items-center justify-start pt-16 px-6 text-center text-white z-10">
            {/* Badge Waktu */}
            <div className="inline-flex items-center gap-2 bg-white/15 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-5 shadow-sm">
                <CalendarClock size={13} className="text-blue-50" />
                <span className="text-[11px] font-medium tracking-wide text-blue-50">{currentTime} WIB • Presensi Online</span>
            </div>
            {/* Judul Mobile */}
            <motion.h1 
                initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}
                className="text-4xl font-semibold tracking-tight drop-shadow-lg text-white"
            >
                SIAKSI
            </motion.h1>
            <motion.p 
                initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }}
                className="text-blue-100/90 text-sm mt-2 max-w-[260px] font-normal leading-relaxed drop-shadow-md"
            >
                Sistem Informasi Aktivitas, Kehadiran, dan Administrasi
            </motion.p>
         </div>
      </div>

      {/* ========================================================= */}
      {/* 2. KHUSUS DESKTOP: Left Side (Original Logic)             */}
      {/* ========================================================= */}
      {/* Menggunakan logic awal: Flex, variants fadeInLeft, bg-1.jpg */}
      <motion.div variants={fadeInLeft} initial="hidden" animate="visible" className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gray-900">
        <motion.img initial={{ scale: 1.1 }} animate={{ scale: 1 }} transition={{ duration: 2, ease: "easeOut" }} src={bgLogin} alt="Login Visual" className="absolute inset-0 w-full h-full object-cover opacity-40 mix-blend-overlay" />
        <div className="absolute inset-0 bg-gradient-to-tr from-blue-900/80 to-purple-900/60 mix-blend-multiply"></div>
        <div className="relative z-10 p-16 flex flex-col justify-between h-full text-white">
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.2 }}>
                <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-1.5 rounded-full border border-white/20 mb-6">
                    <ShieldCheck size={16} className="text-blue-400" />
                    <span className="text-xs font-bold uppercase tracking-widest">Secure Gateway</span>
                </div>
            </motion.div>
            <div className="space-y-4">
                <motion.h1 variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.3 }} className="text-5xl font-bold leading-tight">
                    Welcome to <br />
                    <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-cyan-300">SIAKSI Core.</span>
                </motion.h1>
                <motion.p variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.4 }} className="text-gray-300 text-lg max-w-md">
                    Platform manajemen presensi terpadu. Masuk untuk mengakses dashboard organisasi dan jadwal kegiatan.
                </motion.p>
            </div>
            <motion.div variants={fadeInUp} initial="hidden" animate="visible" transition={{ delay: 0.5 }} className="text-sm text-gray-500 font-mono">
                © 2026 BEM STIKOM Poltek Cirebon
            </motion.div>
        </div>
      </motion.div>

      {/* ========================================================= */}
      {/* 3. FORM AREA (Shared but Styled Differently)              */}
      {/* ========================================================= */}
      <div className="w-full lg:w-1/2 flex flex-col relative z-10">
        
        {/* Tombol Home - Posisi Absolute menyesuaikan mode */}
        <Link to="/" className="absolute top-6 right-6 lg:right-8 flex items-center gap-2 text-white/80 lg:text-gray-400 hover:text-white transition-colors group z-20">
            <div className="w-10 h-10 rounded-full bg-white/10 lg:bg-white/5 border border-white/20 lg:border-white/10 flex items-center justify-center group-hover:bg-blue-600 group-hover:border-blue-500 transition-all">
                <Home size={18} />
            </div>
            <span className="text-sm font-medium hidden sm:block">Back to Home</span>
        </Link>

        {/* CONTAINER FORM */}
        {/* LOGIC: Gunakan 'variants' dinamis. Jika Mobile -> BottomSheet. Jika Desktop -> FadeInRight (Original Logic) */}
        <motion.div 
            variants={isMobile ? bottomSheetVariant : fadeInRight}
            initial="hidden" 
            animate="visible" 
            className="flex-1 flex flex-col justify-start lg:justify-center items-center p-6 md:p-12 
                       mt-[35vh] lg:mt-0 
                       bg-white lg:bg-transparent 
                       rounded-t-[30px] lg:rounded-none 
                       shadow-[0_-10px_40px_-15px_rgba(0,0,0,0.1)] lg:shadow-none 
                       transition-all"
        >
            <div className="w-full max-w-md space-y-8">
                
                {/* HEADLINE */}
                <div className="text-center lg:text-left pt-2 lg:pt-0">
                    <h2 className="text-2xl md:text-3xl font-semibold tracking-tight text-gray-900 lg:text-white">
                        Sign In
                    </h2>
                    <p className="text-gray-500 lg:text-gray-400 mt-2 text-sm font-normal">
                        Masukan identitas anda untuk melanjutkan.
                    </p>
                </div>

                <form onSubmit={handleLogin} className="space-y-6 mt-8">
                    
                    {/* INPUT USERNAME */}
                    <div className="space-y-2">
                        {/* STYLE BARU: Tracking Widest, Font Medium, Text Small */}
                        <label className="text-[11px] font-medium uppercase tracking-widest ml-1 text-gray-500 lg:text-gray-400">
                            Identity (NIA/User)
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-gray-400 group-focus-within:text-blue-600 lg:group-focus-within:text-blue-400">
                                <User size={20} strokeWidth={1.5} />
                            </div>
                            <input 
                                type="text" 
                                required 
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-normal transition-all outline-none
                                           /* Mobile: Light Theme */
                                           bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 
                                           focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                                           /* Desktop: Dark Theme (Original Logic) */
                                           lg:bg-[#131b2e] lg:border-gray-700 lg:text-white lg:placeholder-gray-600 lg:focus:bg-[#131b2e]
                                           lg:focus:border-blue-500 lg:focus:ring-1 lg:focus:ring-blue-500"
                                placeholder="Masukan NIA atau Username" 
                                onChange={(e) => setFormData({...formData, username: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* INPUT PASSWORD */}
                    <div className="space-y-2">
                        <label className="text-[11px] font-medium uppercase tracking-widest ml-1 text-gray-500 lg:text-gray-400">
                            Passphrase
                        </label>
                        <div className="relative group">
                            <div className="absolute left-4 top-1/2 -translate-y-1/2 transition-colors text-gray-400 group-focus-within:text-blue-600 lg:group-focus-within:text-blue-400">
                                <Lock size={20} strokeWidth={1.5} />
                            </div>
                            <input 
                                type="password" 
                                required 
                                className="w-full pl-12 pr-4 py-3.5 rounded-xl text-sm font-normal transition-all outline-none
                                           bg-gray-50 border border-gray-200 text-gray-800 placeholder-gray-400 
                                           focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10
                                           lg:bg-[#131b2e] lg:border-gray-700 lg:text-white lg:placeholder-gray-600 lg:focus:bg-[#131b2e]
                                           lg:focus:border-blue-500 lg:focus:ring-1 lg:focus:ring-blue-500"
                                placeholder="••••••••" 
                                onChange={(e) => setFormData({...formData, password: e.target.value})} 
                            />
                        </div>
                    </div>

                    {/* SUBMIT BUTTON */}
                    <div className="pt-2">
                        <button 
                            type="submit" 
                            disabled={loading}
                            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3.5 rounded-xl 
                                       shadow-lg shadow-blue-600/30 lg:shadow-blue-900/40 hover:shadow-blue-600/40 active:scale-[0.98] 
                                       flex items-center justify-center gap-2 transition-all disabled:opacity-70 disabled:cursor-not-allowed text-sm tracking-wide"
                        >
                            {loading ? (
                                <><Loader2 size={18} className="animate-spin" /> Authenticating...</>
                            ) : (
                                <>Authorize Login <ArrowRight size={18} strokeWidth={2} /></>
                            )}
                        </button>
                    </div>
                </form>

                <div className="text-center">
                    <p className="text-gray-400 lg:text-gray-500 text-xs font-normal">
                        Lupa kata sandi? Silahkan Hubungi Pihak Admin UKM
                    </p>
                </div>
            </div>
        </motion.div>
      </div>
    </div>
  );
};

export default Login;
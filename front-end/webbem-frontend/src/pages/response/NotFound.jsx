import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import content1 from '../../assets/images/gif/not-found.png';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        // CONTAINER UTAMA:
        // flex-col (Mobile: Atas-Bawah)
        // md:flex-row (Desktop/Tablet: Kiri-Kanan)
        <div className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center px-6 gap-8 md:gap-16 relative">
            
            {/* 1. GAMBAR */}
            <div className="w-full max-w-[250px] md:max-w-[350px]">
                <img 
                    src={content1} 
                    alt="Halaman Tidak Ditemukan" 
                    className="w-full h-auto object-contain mx-auto"
                />
            </div>
            
            {/* 2. KONTEN TEKS */}
            {/* Mobile: text-center, Desktop: text-left */}
            <div className="max-w-md text-center md:text-left space-y-4">
                
                {/* Judul: Font Medium (Tidak Bold), Ukuran Sedang */}
                <h1 className="text-2xl md:text-3xl font-medium text-black leading-snug">
                    Aduh Halaman Gak Ketemu...
                </h1>
                
                {/* Pesan: Abu-abu gelap, font normal */}
                <p className="text-gray-600 text-base font-normal leading-relaxed">
                    Maaf, kami tidak dapat menemukan halaman yang Kamu cari. Mungkin telah dihapus atau alamatnya salah.
                </p>

                {/* Tombol: Konsisten dengan halaman Maintenance */}
                <button 
                    onClick={() => navigate('/')} 
                    className="mt-6 px-6 py-2.5 bg-blue-600 hover:bg-blue-700 text-white text-sm font-medium rounded-lg transition-all duration-300 flex items-center justify-center md:justify-start gap-2 mx-auto md:mx-0 shadow-sm hover:shadow-md"
                >
                    <ArrowLeft size={18} />
                    Kembali ke Beranda
                </button>
            </div>

            {/* Footer Copyright */}
            <div className="absolute bottom-6 text-gray-400 text-xs text-center w-full">
                &copy; {new Date().getFullYear()} SIAKSI Team
            </div>
        </div>
    );
};

export default NotFound;
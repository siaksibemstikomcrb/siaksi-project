import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';

// Import Gambar sesuai request
import img403 from '../../assets/images/gif/403.png';
import img500 from '../../assets/images/gif/500.png';

const GeneralError = ({ type = "500" }) => {
    const navigate = useNavigate();

    // Konfigurasi konten berdasarkan tipe error
    const errorConfig = {
        "403": {
            title: "Akses Ditolak",
            msg: "Maaf, Kamu tidak memiliki izin untuk mengakses halaman ini. Silakan hubungi administrator jika ini kesalahan.",
            image: img403
        },
        "500": {
            title: "Terjadi Kesalahan Server",
            msg: "Sepertinya ada masalah teknis di sisi server kami. Silakan coba muat ulang halaman atau kembali lagi nanti.",
            image: img500
        }
    };

    // Pilih konten berdasarkan props type (Default ke 500 kalau typo)
    const content = errorConfig[type] || errorConfig["500"];

    return (
        // CONTAINER UTAMA (Layout Persis Not Found / Maintenance)
        // flex-col (Mobile: Atas-Bawah)
        // md:flex-row (Desktop/Tablet: Kiri-Kanan)
        <div className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center px-6 gap-8 md:gap-16 relative">
            
            {/* 1. GAMBAR (Dinamis sesuai tipe error) */}
            <div className="w-full max-w-[250px] md:max-w-[350px]">
                <img 
                    src={content.image} 
                    alt={`Error ${type}`} 
                    className="w-full h-auto object-contain mx-auto"
                />
            </div>
            
            {/* 2. KONTEN TEKS */}
            {/* Mobile: text-center, Desktop: text-left */}
            <div className="max-w-md text-center md:text-left space-y-4">
                
                {/* Judul: Font Medium (Tidak Bold), Hitam */}
                <h1 className="text-2xl md:text-3xl font-medium text-black leading-snug">
                    {content.title}
                </h1>
                
                {/* Pesan: Abu-abu gelap, font normal */}
                <p className="text-gray-600 text-base font-normal leading-relaxed">
                    {content.msg}
                </p>

                {/* Tombol: Konsisten (Clean Blue) */}
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
                &copy; {new Date().getFullYear()} SIAKSI Team • Error Code: {type}
            </div>
        </div>
    );
};

export default GeneralError;
import React from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import content1 from '../assets/images/gif/not-found.gif';

const NotFound = () => {
    const navigate = useNavigate();

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-white p-6 text-center">
            {/* GIF Image */}
            <div className="w-full max-w-md mb-8">
                <img 
                    src={content1} 
                    alt="Halaman Tidak Ditemukan" 
                    className="w-full h-auto object-contain mx-auto"
                />
            </div>
            
            {/* Text Content */}
            <div className="max-w-lg space-y-4">
                <h1 className="text-3xl md:text-4xl font-medium text-gray-900 leading-tight">
                    Halaman tidak ditemukan
                </h1>
                <p className="text-gray-500 text-base md:text-lg font-normal leading-relaxed">
                    Maaf, kami tidak dapat menemukan halaman yang Anda cari. Mungkin telah dihapus atau alamatnya salah.
                </p>
            </div>

            {/* Back Button */}
            <button 
                onClick={() => navigate('/')} 
                className="mt-10 px-8 py-3 bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium rounded-full transition-all duration-300 flex items-center gap-2 shadow-sm hover:shadow-md active:scale-[0.98]"
            >
                <ArrowLeft size={18} />
                Kembali ke Beranda
            </button>
        </div>
    );
};

export default NotFound;
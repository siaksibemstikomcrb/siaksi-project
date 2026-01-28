import React from 'react';
import { useNavigate } from 'react-router-dom';
// Import gambar lokal
import maintenanceImg from '../../assets/images/gif/503.png';

const MaintenancePage = ({ title = "Sedang Dalam Perbaikan", msg }) => {
  const navigate = useNavigate();

  return (
    // CONTAINER UTAMA:
    // flex-col (Mobile: Atas-Bawah)
    // md:flex-row (Desktop/Tablet: Kiri-Kanan)
    <div className="min-h-screen bg-white flex flex-col md:flex-row items-center justify-center px-6 gap-8 md:gap-16">
      
      {/* 1. GAMBAR */}
      <div className="w-full max-w-[250px] md:max-w-[350px]">
        <img 
          src={maintenanceImg} 
          alt="Maintenance" 
          className="w-full h-auto object-contain"
        />
      </div>

      {/* 2. KONTEN TEKS */}
      {/* Mobile: text-center, Desktop: text-left */}
      <div className="max-w-md text-center md:text-left">
        
        {/* Judul: Font Medium (Tidak Bold), Ukuran Sedang */}
        <h1 className="text-2xl md:text-3xl font-medium text-black mb-3 leading-snug">
            {title}
        </h1>
        
        {/* Pesan: Abu-abu gelap biar enak dibaca */}
        <p className="text-gray-600 text-base font-normal mb-6 leading-relaxed">
          {msg || "Halaman ini sedang dalam perbaikan sistem. Silakan kembali lagi nanti."}
        </p>

        {/* Tombol: Simple & Clean */}
        <button 
          onClick={() => navigate(-1)} 
          className="group px-6 py-2.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center justify-center md:justify-start gap-2 mx-auto md:mx-0"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 group-hover:-translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
          </svg>
          Kembali
        </button>

      </div>
      
      {/* Footer Copyright (Tetap di bawah) */}
      <div className="absolute bottom-6 text-gray-400 text-xs text-center w-full">
        &copy; {new Date().getFullYear()} SIAKSI Team
      </div>
    </div>
  );
};

export default MaintenancePage;
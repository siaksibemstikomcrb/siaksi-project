import React, { useEffect, useState } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { ArrowLeft, Shield, FileText, Calendar, Mail, MapPin } from 'lucide-react';
import Navbar from '../components/Navbar';

const LegalPage = () => {
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const isPrivacy = pathname === '/privacy';
  
  // Scroll ke atas saat halaman berubah
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);

  // --- CONTENT DATA (Biar Rapi & Mudah Diedit) ---
  const privacyContent = [
    {
      id: 'collection',
      title: '1. Data yang Kami Kumpulkan',
      content: (
        <>
          <p>Kami mengumpulkan beberapa jenis informasi untuk memastikan sistem SIAKSI berjalan optimal bagi organisasi BEM STIKOM:</p>
          <ul className="list-disc pl-5 space-y-2 mt-3 text-slate-600">
            <li><strong>Informasi Akun:</strong> Nomor Induk Anggota (NIA), Nama Lengkap, Program Studi, dan Kata Sandi (terenkripsi).</li>
            <li><strong>Data Lokasi (Geo-tagging):</strong> Koordinat GPS diambil <em>hanya</em> pada saat Anda menekan tombol "Check-in" atau "Check-out" untuk validasi kehadiran. Kami tidak melacak lokasi secara real-time (background tracking).</li>
            <li><strong>Media & Dokumen:</strong> Foto dokumentasi kegiatan atau file laporan yang Anda unggah secara sadar.</li>
            <li><strong>Device Log:</strong> Informasi teknis seperti alamat IP dan jenis perangkat untuk keamanan sistem.</li>
          </ul>
        </>
      )
    },
    {
      id: 'usage',
      title: '2. Penggunaan Data',
      content: (
        <p>
          Data Anda digunakan semata-mata untuk keperluan internal organisasi, meliputi: Validasi kehadiran (Presensi), 
          penyusunan Laporan Pertanggungjawaban (LPJ), manajemen struktur organisasi, dan komunikasi internal (Broadcast Info).
          Kami menjamin data Anda tidak akan dijual atau dibagikan ke pihak ketiga untuk tujuan komersial/iklan.
        </p>
      )
    },
    {
      id: 'security',
      title: '3. Keamanan Data',
      content: (
        <p>
          Kami menerapkan standar keamanan industri, termasuk enkripsi <em>end-to-end</em> untuk password dan protokol HTTPS 
          untuk transmisi data. Akses ke database dibatasi hanya untuk Super Admin dan pengurus inti yang berwenang.
        </p>
      )
    },
    {
      id: 'retention',
      title: '4. Penyimpanan & Penghapusan',
      content: (
        <p>
          Data Anda akan disimpan selama Anda masih menjadi anggota aktif atau alumni BEM STIKOM Poltek Cirebon. 
          Anda berhak mengajukan permohonan penghapusan akun atau koreksi data melalui Admin jika sudah tidak aktif.
        </p>
      )
    }
  ];

  const termsContent = [
    {
      id: 'acceptance',
      title: '1. Persetujuan Pengguna',
      content: (
        <p>
          Dengan mendaftar dan menggunakan SIAKSI, Anda menyatakan bahwa Anda adalah mahasiswa aktif STIKOM Poltek Cirebon 
          dan setuju untuk mematuhi seluruh aturan yang tertulis di sini serta AD/ART Organisasi.
        </p>
      )
    },
    {
      id: 'conduct',
      title: '2. Kode Etik Penggunaan',
      content: (
        <>
          <p>Anda setuju untuk menggunakan layanan ini secara bertanggung jawab. Dilarang keras melakukan tindakan berikut:</p>
          <ul className="list-disc pl-5 space-y-2 mt-3 text-slate-600">
            <li><strong>Manipulasi Absensi:</strong> Menggunakan aplikasi Fake GPS, Emulator, atau metode lain untuk memalsukan lokasi kehadiran.</li>
            <li><strong>Sharing Akun:</strong> Memberikan akses akun kepada orang lain untuk tujuan apapun.</li>
            <li><strong>Konten Ilegal:</strong> Mengunggah konten yang mengandung SARA, pornografi, atau ujaran kebencian.</li>
            <li><strong>Peretasan:</strong> Mencoba menembus keamanan sistem, melakukan <em>SQL Injection</em>, atau serangan DDoS.</li>
          </ul>
        </>
      )
    },
    {
      id: 'termination',
      title: '3. Sanksi & Penangguhan',
      content: (
        <p>
          Pelanggaran terhadap ketentuan di atas akan dikenakan sanksi bertingkat, mulai dari peringatan lisan, 
          penangguhan akun sementara (suspend), hingga pemecatan dari keanggotaan organisasi sesuai keputusan Sidang BEM.
        </p>
      )
    },
    {
      id: 'disclaimer',
      title: '4. Batasan Tanggung Jawab',
      content: (
        <p>
          SIAKSI disediakan "sebagaimana adanya". Pengembang tidak bertanggung jawab atas kegagalan absensi akibat 
          gangguan sinyal provider, kerusakan perangkat pengguna, atau kelalaian pengguna dalam menjaga kerahasiaan akun.
        </p>
      )
    }
  ];

  const contentData = isPrivacy ? privacyContent : termsContent;
  const headerTitle = isPrivacy ? 'Kebijakan Privasi' : 'Syarat & Ketentuan';
  const headerDesc = isPrivacy 
    ? 'Komitmen kami untuk melindungi data dan privasi anggota.' 
    : 'Aturan main penggunaan platform digital BEM STIKOM.';

  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 selection:bg-blue-100 selection:text-blue-900">
      {/* Navbar Non-Transparent */}
      <Navbar isTransparent={false} />

      <main className="pt-32 pb-24 px-4 sm:px-6">
        <div className="max-w-6xl mx-auto">
          
          {/* --- HEADER SECTION --- */}
          <div className="mb-16 text-center max-w-3xl mx-auto">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-slate-100 border border-slate-200 text-slate-500 text-xs font-medium mb-6">
              <Calendar size={12} />
              Terakhir diperbarui: 15 Januari 2026
            </div>
            <h1 className="text-4xl md:text-5xl font-black text-slate-900 mb-6 tracking-tight">
              {headerTitle}
            </h1>
            <p className="text-lg text-slate-500 leading-relaxed">
              {headerDesc} Mohon dibaca dengan seksama.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            
            {/* --- SIDEBAR NAV (STICKY) --- */}
            <aside className="hidden lg:block lg:col-span-4 xl:col-span-3">
              <div className="sticky top-32 p-6 rounded-2xl bg-white border border-slate-200 shadow-sm">
                <h4 className="text-xs font-bold text-slate-400 uppercase tracking-widest mb-4">Daftar Isi</h4>
                <nav className="space-y-1">
                  {contentData.map((item) => (
                    <a 
                      key={item.id}
                      href={`#${item.id}`}
                      className="block text-sm font-medium text-slate-600 hover:text-blue-600 hover:bg-blue-50 px-3 py-2 rounded-lg transition-colors"
                    >
                      {item.title}
                    </a>
                  ))}
                </nav>
                
                <div className="mt-8 pt-6 border-t border-slate-100">
                  <button 
                    onClick={() => navigate('/')}
                    className="flex items-center gap-2 text-sm font-bold text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    <ArrowLeft size={16} /> Kembali ke Home
                  </button>
                </div>
              </div>
            </aside>

            {/* --- MAIN CONTENT --- */}
            <div className="lg:col-span-8 xl:col-span-9">
              <div className="bg-white rounded-3xl p-8 md:p-12 shadow-xl shadow-slate-200/50 border border-slate-100">
                {/* Intro Icon */}
                <div className={`w-16 h-16 rounded-2xl flex items-center justify-center mb-10 ${isPrivacy ? 'bg-blue-50 text-blue-600' : 'bg-orange-50 text-orange-600'}`}>
                   {isPrivacy ? <Shield size={32} /> : <FileText size={32} />}
                </div>

                <div className="space-y-16">
                  {contentData.map((section) => (
                    <section key={section.id} id={section.id} className="scroll-mt-32 group">
                      <h2 className="text-2xl font-bold text-slate-900 mb-4 flex items-center gap-3 group-hover:text-blue-700 transition-colors">
                        {section.title}
                      </h2>
                      <div className="text-slate-600 leading-relaxed text-lg">
                        {section.content}
                      </div>
                    </section>
                  ))}
                </div>

                {/* Footer Contact Box */}
                <div className="mt-16 p-6 bg-slate-50 rounded-2xl border border-slate-100 flex flex-col sm:flex-row gap-6 items-start sm:items-center">
                  <div className="p-3 bg-white rounded-full shadow-sm text-slate-400">
                    <Mail size={24} />
                  </div>
                  <div>
                    <h4 className="font-bold text-slate-900 text-lg">Masih ada pertanyaan?</h4>
                    <p className="text-slate-500 text-sm mb-1">Hubungi tim Admin BEM STIKOM jika ada poin yang kurang jelas.</p>
                    <a href="mailto:bem@stikompoltek.ac.id" className="text-blue-600 font-bold hover:underline">
                      bemstikomcrb@stikompoltek.ac.id
                    </a>
                  </div>
                </div>

              </div>
            </div>

          </div>
        </div>
      </main>

      {/* Simple Footer */}
<footer className="py-8 pb-32 md:pb-8 bg-slate-900 text-center text-slate-500 text-sm">
        <div className="flex justify-center gap-6 mb-4">
            <span className="flex items-center gap-2"><MapPin size={14}/> Cirebon, Indonesia</span>
            <span>&copy; {new Date().getFullYear()} BEM STIKOM.</span>
        </div>
      </footer>
    </div>
  );
};

export default LegalPage;
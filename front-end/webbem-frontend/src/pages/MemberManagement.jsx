import React, { useState, useEffect } from 'react';
import { 
  Users, Search, RefreshCw, KeyRound, 
  AlertTriangle, CheckCircle 
} from 'lucide-react';
import { toast } from 'sonner';
import api from '../api/axios'; // Pastikan path axios sesuai

const MemberManagement = () => {
  const [members, setMembers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [resettingId, setResettingId] = useState(null); // Untuk loading status per tombol

  // 1. Fetch Data Anggota
  const fetchMembers = async () => {
    setLoading(true);
    try {
      // Sesuai route backend: router.get('/members', ...)
      const res = await api.get('/ukms/members'); 
      setMembers(res.data.data);
    } catch (error) {
      console.error(error);
      toast.error("Gagal memuat data anggota.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchMembers();
  }, []);

  // 2. Handle Reset Password
  const handleResetPassword = async (userId, username) => {
    // Konfirmasi dulu biar gak kepencet
    const isConfirmed = window.confirm(
      `Yakin ingin mereset password untuk user "${username}" menjadi '123456'?`
    );

    if (!isConfirmed) return;

    setResettingId(userId); // Aktifkan loading di tombol spesifik
    try {
      // Sesuai route backend: router.put('/members/:userId/reset-password', ...)
      const res = await api.put(`/ukms/members/${userId}/reset-password`);
      
      // Tampilkan notifikasi sukses
      toast.success(
        <div className="flex flex-col gap-1">
          <span className="font-bold">Berhasil Reset!</span>
          <span className="text-xs">Password {username} sekarang: 123456</span>
        </div>, 
        { duration: 5000 } // Tampil agak lama biar admin bisa baca
      );
    } catch (error) {
      toast.error(error.response?.data?.msg || "Gagal mereset password");
    } finally {
      setResettingId(null);
    }
  };

  // Filter pencarian
  const filteredMembers = members.filter(m => 
    m.username.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.nia?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="p-6 max-w-6xl mx-auto min-h-screen bg-gray-50">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-black text-gray-800 flex items-center gap-2">
            <Users className="text-blue-600" />
            Manajemen Anggota
          </h1>
          <p className="text-gray-500 text-sm">
            Pantau akun anggota dan reset password jika diperlukan.
          </p>
        </div>
        
        <div className="flex items-center gap-2 bg-white px-3 py-2 rounded-xl border border-gray-200 shadow-sm w-full md:w-auto">
          <Search size={18} className="text-gray-400" />
          <input 
            type="text"
            placeholder="Cari NIA / Nama / Username..."
            className="bg-transparent outline-none text-sm w-full md:w-64"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {/* Tabel Data */}
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-gray-500">Memuat data anggota...</div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="bg-gray-50 text-gray-600 font-bold uppercase text-xs border-b border-gray-100">
                <tr>
                  <th className="px-6 py-4">No</th>
                  <th className="px-6 py-4">NIA</th>
                  <th className="px-6 py-4">Username</th>
                  <th className="px-6 py-4">Nama Lengkap</th>
                  <th className="px-6 py-4 text-center">Aksi (Keamanan)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-50">
                {filteredMembers.length > 0 ? (
                  filteredMembers.map((member, index) => (
                    <tr key={member.id} className="hover:bg-blue-50/50 transition-colors">
                      <td className="px-6 py-4 font-medium text-gray-500">{index + 1}</td>
                      <td className="px-6 py-4">
                        <span className="bg-blue-100 text-blue-700 px-2 py-1 rounded text-xs font-bold font-mono">
                          {member.nia || '-'}
                        </span>
                      </td>
                      <td className="px-6 py-4 font-bold text-gray-700">
                        {member.username}
                      </td>
                      <td className="px-6 py-4 text-gray-600">
                        {member.name || 'Belum diisi'}
                      </td>
                      <td className="px-6 py-4 flex justify-center">
                        <button
                          onClick={() => handleResetPassword(member.id, member.username)}
                          disabled={resettingId === member.id}
                          className="flex items-center gap-2 bg-white border border-red-200 text-red-600 hover:bg-red-50 hover:border-red-300 px-3 py-1.5 rounded-lg text-xs font-bold transition-all shadow-sm group"
                          title="Reset Password ke Default (123456)"
                        >
                          {resettingId === member.id ? (
                            <RefreshCw size={14} className="animate-spin" />
                          ) : (
                            <KeyRound size={14} className="group-hover:rotate-45 transition-transform" />
                          )}
                          {resettingId === member.id ? 'Memproses...' : 'Reset Password'}
                        </button>
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td colSpan="5" className="px-6 py-8 text-center text-gray-400 italic">
                      Tidak ada data anggota ditemukan.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <div className="mt-4 flex items-start gap-2 text-xs text-gray-500 bg-yellow-50 p-3 rounded-lg border border-yellow-100">
        <AlertTriangle size={16} className="text-yellow-600 shrink-0" />
        <p>
          <span className="font-bold text-yellow-700">Catatan Admin:</span> Fitur "Reset Password" akan mengubah password anggota tersebut menjadi <span className="font-mono bg-white px-1 rounded border border-yellow-200 mx-1 font-bold">123456</span>. Pastikan anggota segera mengganti password setelah login.
        </p>
      </div>
    </div>
  );
};

export default MemberManagement;
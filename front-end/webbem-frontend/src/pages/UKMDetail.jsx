import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { downloadPDF } from '../utils/downloadPDF';
import { motion } from 'framer-motion';
import { ArrowLeft, Download, Shield, Users, Activity, ExternalLink, Calendar, CheckCircle, Clock, XCircle } from 'lucide-react';

const UKMDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [ukmData, setUkmData] = useState(null);
  const [loading, setLoading] = useState(true);
  const role = localStorage.getItem('role');
  const myUkmId = localStorage.getItem('ukm_id');

  useEffect(() => {
    if (role === 'admin' && myUkmId !== id) {
      alert("Unauthorized Access");
      navigate('/monitoring');
    }
  }, [id, role, myUkmId, navigate]);

  const fetchDetail = async () => {
    try {
      const res = await api.get(`/monitoring/ukm/${id}`);
      setUkmData(res.data);
      setLoading(false);
    } catch (err) { setLoading(false); }
  };

  useEffect(() => { fetchDetail(); }, [id]);

  if (loading) return <div className="p-20 text-center font-bold text-gray-400">Loading data...</div>;
  if (!ukmData) return <div className="text-center p-20 text-gray-500">Data tidak ditemukan.</div>;

  return (
    <div className="space-y-8 animate-in fade-in duration-700">
      
      {/* Header Section */}
      <div className="bg-white p-8 rounded-3xl border border-gray-100 shadow-sm flex flex-col md:flex-row justify-between items-start md:items-center gap-6">
        <div>
            <div className="flex items-center gap-3 mb-2">
                <button onClick={() => navigate(-1)} className="p-2 bg-gray-100 hover:bg-gray-200 rounded-full text-gray-600 transition-colors">
                    <ArrowLeft size={18} />
                </button>
                <span className="bg-blue-100 text-blue-700 text-xs font-bold px-3 py-1 rounded-full uppercase tracking-wide">Organisasi Resmi</span>
            </div>
            <h1 className="text-3xl font-extrabold text-gray-900 mt-2">{ukmData.ukm_name}</h1>
            <p className="text-gray-500 text-sm mt-1 max-w-2xl">{ukmData.description || 'Tidak ada deskripsi.'}</p>
        </div>
        <button 
            onClick={() => downloadPDF(ukmData)}
            className="flex items-center gap-2 bg-white border border-gray-200 text-gray-700 px-6 py-3 rounded-xl font-bold hover:bg-gray-50 transition-all shadow-sm"
        >
            <Download size={18} /> <span>Download Laporan</span>
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        
        {/* Left Column: Info & Stats */}
        <div className="space-y-6">
            {/* Admin Card */}
            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm">
                <h3 className="text-sm font-bold text-gray-900 uppercase tracking-widest mb-4 flex items-center gap-2">
                    <Shield size={16} className="text-blue-600" /> Admin Pengurus
                </h3>
                <div className="space-y-3">
                    {ukmData.admins?.map((admin) => (
                        <div key={admin.id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl">
                            <div className="w-10 h-10 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center font-bold">
                                {admin.name.charAt(0)}
                            </div>
                            <div>
                                <p className="text-sm font-bold text-gray-900">{admin.name}</p>
                                <p className="text-xs text-gray-500">NIA: {admin.nia || '-'}</p>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Total Activities Stats */}
            <div className="bg-blue-600 p-8 rounded-3xl text-white shadow-lg shadow-blue-200">
                <p className="text-blue-200 text-xs font-bold uppercase tracking-wider mb-2">Total Kegiatan</p>
                <div className="flex items-end gap-2">
                    <span className="text-5xl font-black">{ukmData.total_events}</span>
                    <span className="text-sm font-medium mb-1">Agenda Terlaksana</span>
                </div>
            </div>
        </div>

        {/* Right Column: Members Table */}
        <div className="lg:col-span-2 bg-white rounded-3xl border border-gray-100 shadow-sm overflow-hidden flex flex-col">
            <div className="p-6 border-b border-gray-100 flex justify-between items-center">
                <h3 className="font-bold text-gray-900 text-lg">Daftar Anggota</h3>
                <span className="bg-gray-100 text-gray-600 px-3 py-1 rounded-lg text-xs font-bold">{ukmData.members?.length} Orang</span>
            </div>
            
            <div className="overflow-x-auto flex-1">
                <table className="w-full text-left border-collapse">
                    <thead>
                        <tr className="bg-gray-50/50 text-gray-500 text-xs uppercase tracking-wider font-bold">
                            <th className="px-6 py-4">Identitas</th>
                            <th className="px-6 py-4 text-center">Hadir</th>
                            <th className="px-6 py-4 text-center">Telat</th>
                            <th className="px-6 py-4 text-center">Alpa</th>
                            <th className="px-6 py-4 text-right">Detail</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {ukmData.members?.map((member) => (
                            <tr key={member.id} className="hover:bg-gray-50/80 transition-colors">
                                <td className="px-6 py-4">
                                    <p className="font-bold text-gray-900 text-sm">{member.name}</p>
                                    <p className="text-xs text-gray-500">NIA: {member.nia || '-'}</p>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-2 py-1 bg-green-100 text-green-700 rounded-md text-xs font-bold">{member.hadir}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-2 py-1 bg-orange-100 text-orange-700 rounded-md text-xs font-bold">{member.telat}</span>
                                </td>
                                <td className="px-6 py-4 text-center">
                                    <span className="inline-block px-2 py-1 bg-red-100 text-red-700 rounded-md text-xs font-bold">{member.alpa}</span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button 
                                        onClick={() => navigate(`/monitoring/user/${member.id}`)}
                                        className="p-2 text-gray-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                                    >
                                        <ExternalLink size={18} />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
      </div>
    </div>
  );
};

export default UKMDetail;
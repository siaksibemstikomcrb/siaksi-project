import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, User, Eye, CheckCircle, ExternalLink } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchComplaints();
  }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.data);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const markAsResolved = async (id) => {
    try {
        await api.put(`/complaints/${id}/status`, { status: 'resolved' });
        toast.success("Laporan ditandai selesai");
        fetchComplaints();
    } catch (err) {
        toast.error("Gagal update status");
    }
  };

  return (
    <div className="p-6">
      <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-2">
        <MessageSquare className="text-red-500" /> Kotak Masuk Laporan (Bug/Saran)
      </h1>

      <div className="grid gap-4">
        {loading ? <p>Memuat...</p> : complaints.length === 0 ? (
            <p className="text-gray-500 italic">Belum ada laporan masuk.</p>
        ) : (
            complaints.map((item) => (
                <div key={item.id} className={`bg-white p-6 rounded-2xl border ${item.status === 'resolved' ? 'border-green-200 bg-green-50/30' : 'border-gray-200'} shadow-sm`}>
                    <div className="flex justify-between items-start mb-4">
                        <div>
                            <h3 className="font-bold text-lg text-gray-800">{item.subject}</h3>
                            <div className="flex items-center gap-4 text-xs text-gray-500 mt-1">
                                <span className="flex items-center gap-1"><Calendar size={12}/> {new Date(item.created_at).toLocaleDateString()}</span>
                                <span className="flex items-center gap-1"><User size={12}/> {item.reporter_name} ({item.ukm_name || 'Member'})</span>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <span className={`px-3 py-1 rounded-full text-xs font-bold ${item.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {item.status === 'resolved' ? 'Selesai' : 'Pending'}
                            </span>
                        </div>
                    </div>

                    <p className="text-gray-600 text-sm mb-4 bg-gray-50 p-3 rounded-lg border border-gray-100">
                        "{item.message}"
                    </p>

                    {item.screenshot_url && (
                        <div className="mb-4">
                             <p className="text-xs font-bold text-gray-400 mb-1">Lampiran Screenshot:</p>
                             <a 
                                href={`http://localhost:5000/${item.screenshot_url}`}
                                target="_blank" 
                                rel="noreferrer"
                                className="inline-flex items-center gap-2 text-blue-600 text-sm hover:underline"
                             >
                                <ExternalLink size={14} /> Lihat Gambar
                             </a>
                        </div>
                    )}

                    {item.status !== 'resolved' && (
                        <div className="flex justify-end pt-2 border-t border-gray-100">
                            <button 
                                onClick={() => markAsResolved(item.id)}
                                className="flex items-center gap-2 text-sm font-bold text-green-600 hover:bg-green-50 px-3 py-2 rounded-lg transition-colors"
                            >
                                <CheckCircle size={16} /> Tandai Selesai
                            </button>
                        </div>
                    )}
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default AdminComplaints;
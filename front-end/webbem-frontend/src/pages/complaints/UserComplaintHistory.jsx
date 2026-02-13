import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, MessageCircle } from 'lucide-react';
import api from '../../api/axios';

const UserComplaintHistory = () => {
  const [myComplaints, setMyComplaints] = useState([]);

  useEffect(() => {
    const fetchMyHistory = async () => {
      try {
        const res = await api.get('/complaints/my');
        setMyComplaints(res.data.data || []);
      } catch (err) { console.error(err); }
    };
    fetchMyHistory();
  }, []);

  return (
    <div className="max-w-3xl mx-auto p-4 md:p-0 mt-8">
      <h2 className="text-lg font-bold text-gray-800 mb-4">Riwayat Laporan Saya</h2>
      <div className="space-y-4">
        {myComplaints.length === 0 ? (
            <p className="text-gray-500 text-sm">Belum ada riwayat laporan.</p>
        ) : (
            myComplaints.map(item => (
                <div key={item.id} className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="font-bold text-gray-900">{item.subject}</h3>
                        <span className={`px-2 py-1 rounded text-xs font-bold flex items-center gap-1 ${item.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                            {item.status === 'resolved' ? <CheckCircle size={12}/> : <Clock size={12}/>}
                            {item.status === 'resolved' ? 'Selesai' : 'Sedang Diproses'}
                        </span>
                    </div>
                    <p className="text-gray-600 text-sm mb-3">"{item.message}"</p>
                    
                    {item.status === 'resolved' && item.admin_response && (
                        <div className="mt-4 bg-blue-50 p-4 rounded-lg border border-blue-100 relative">
                            <div className="absolute -top-3 left-4 bg-blue-100 text-blue-700 px-2 py-0.5 rounded text-[10px] font-bold border border-blue-200 flex items-center gap-1">
                                <MessageCircle size={10}/> Balasan Admin
                            </div>
                            <p className="text-sm text-gray-800 mt-1">{item.admin_response}</p>
                            
                            {item.admin_attachment && (
                                <div className="mt-3">
                                    <img src={item.admin_attachment} alt="Balasan Admin" className="h-32 rounded-lg border border-blue-200" />
                                </div>
                            )}
                            
                            <p className="text-[10px] text-gray-400 mt-2 text-right">
                                Ditanggapi pada: {new Date(item.responded_at).toLocaleDateString()}
                            </p>
                        </div>
                    )}
                </div>
            ))
        )}
      </div>
    </div>
  );
};

export default UserComplaintHistory;
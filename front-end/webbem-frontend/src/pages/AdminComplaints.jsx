import React, { useState, useEffect } from 'react';
import { MessageSquare, Calendar, User, CheckCircle, ExternalLink, Send, X, Image as IconImage } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

const AdminComplaints = () => {
  const [complaints, setComplaints] = useState([]);
  const [loading, setLoading] = useState(false);
  
  const [selectedComplaint, setSelectedComplaint] = useState(null);
  const [responseText, setResponseText] = useState('');
  const [responseFile, setResponseFile] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => { fetchComplaints(); }, []);

  const fetchComplaints = async () => {
    setLoading(true);
    try {
      const res = await api.get('/complaints');
      setComplaints(res.data.data || []); 
    } catch (error) { toast.error("Gagal mengambil data."); } 
    finally { setLoading(false); }
  };

  const handleRespondSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const formData = new FormData();
    formData.append('response_message', responseText);
    if (responseFile) {
        formData.append('attachment', responseFile);
    }

    try {
        await api.put(`/complaints/${selectedComplaint.id}/respond`, formData);
        toast.success("Tanggapan berhasil dikirim!");
        fetchComplaints();
        closeModal();
    } catch (err) {
        toast.error("Gagal mengirim tanggapan.");
    } finally {
        setSubmitting(false);
    }
  };

  const openModal = (item) => {
      setSelectedComplaint(item);
      setResponseText(`Halo ${item.reporter_name}, laporan anda telah kami terima dan...`);
  };

  const closeModal = () => {
      setSelectedComplaint(null);
      setResponseText('');
      setResponseFile(null);
  };

  return (
    <div className="p-6 max-w-6xl mx-auto relative">
      <h1 className="text-2xl font-black text-gray-800 mb-6 flex items-center gap-3">
        <MessageSquare className="text-red-500" /> Kotak Masuk Laporan
      </h1>

      <div className="grid gap-4">
        {complaints.map((item) => (
            <div key={item.id} className={`bg-white p-6 rounded-2xl border ${item.status === 'resolved' ? 'border-green-200 bg-green-50/30' : 'border-gray-200'} shadow-sm`}>
                <div className="flex justify-between items-start mb-4">
                    <div>
                        <div className="flex items-center gap-2 mb-1">
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${item.status === 'resolved' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                {item.status === 'resolved' ? 'Selesai' : 'Pending'}
                            </span>
                            <span className="text-xs text-gray-400">{new Date(item.created_at).toLocaleDateString()}</span>
                        </div>
                        <h3 className="font-bold text-lg text-gray-900">{item.subject}</h3>
                        <p className="text-xs text-gray-500">Oleh: <span className="text-blue-600 font-bold">{item.reporter_name}</span> ({item.ukm_name || 'Member'})</p>
                    </div>

                    {item.status !== 'resolved' && (
                        <button onClick={() => openModal(item)} className="bg-blue-600 text-white text-xs font-bold px-4 py-2 rounded-lg hover:bg-blue-700 flex items-center gap-2">
                            <Send size={14} /> Tanggapi
                        </button>
                    )}
                </div>

                <p className="text-gray-700 text-sm mb-4 bg-gray-50 p-3 rounded-lg">"{item.message}"</p>
                {item.screenshot_url && (
                    <img src={item.screenshot_url} alt="Bukti" className="h-24 rounded-lg border cursor-pointer" onClick={()=>window.open(item.screenshot_url)}/>
                )}

                {item.admin_response && (
                    <div className="mt-4 pt-4 border-t border-green-200">
                        <p className="text-xs font-bold text-green-700 mb-1">✅ Tanggapan Admin:</p>
                        <p className="text-sm text-gray-800 italic">"{item.admin_response}"</p>
                        {item.admin_attachment && (
                             <a href={item.admin_attachment} target="_blank" className="text-xs text-blue-600 underline mt-1 block">Lihat Lampiran Balasan</a>
                        )}
                    </div>
                )}
            </div>
        ))}
      </div>

      {selectedComplaint && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-sm">
              <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg overflow-hidden animate-in fade-in zoom-in-95">
                  <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-gray-50">
                      <h3 className="font-bold text-gray-800">Tanggapi Laporan</h3>
                      <button onClick={closeModal}><X size={20} className="text-gray-400 hover:text-red-500"/></button>
                  </div>
                  <form onSubmit={handleRespondSubmit} className="p-6 space-y-4">
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Pesan Balasan</label>
                          <textarea 
                            className="w-full p-3 border rounded-xl focus:ring-2 focus:ring-blue-500 outline-none text-sm"
                            rows="4"
                            value={responseText}
                            onChange={(e)=>setResponseText(e.target.value)}
                            required
                          ></textarea>
                      </div>
                      <div>
                          <label className="block text-xs font-bold text-gray-500 mb-1">Lampiran Foto (Opsional)</label>
                          <input type="file" onChange={(e)=>setResponseFile(e.target.files[0])} className="text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-xs file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"/>
                      </div>
                      <button disabled={submitting} className="w-full bg-blue-600 text-white font-bold py-3 rounded-xl hover:bg-blue-700 disabled:opacity-50">
                          {submitting ? 'Mengirim...' : 'Kirim Tanggapan & Selesaikan'}
                      </button>
                  </form>
              </div>
          </div>
      )}
    </div>
  );
};
export default AdminComplaints;
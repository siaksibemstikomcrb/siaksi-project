import { useState, useEffect } from 'react';
import api from '../api/axios';
import { Check, X, ShieldAlert } from 'lucide-react';

const BroadcastApproval = () => {
    const [list, setList] = useState([]);

    const fetchPending = () => api.get('/mail/pending').then(res => setList(res.data));
    useEffect(() => { fetchPending(); }, []);

    const handleAction = async (id, action) => {
        if(!confirm(`Yakin ingin me-${action} pesan ini?`)) return;
        try {
            await api.put('/mail/approval', { mailId: id, action });
            fetchPending();
        } catch(e) { alert("Error"); }
    };

    return (
        <div className="p-6 max-w-4xl mx-auto">
            <h1 className="text-2xl font-bold text-gray-800 mb-6 flex items-center gap-2"><ShieldAlert className="text-orange-500"/> Persetujuan Broadcast</h1>
            
            {list.length === 0 ? <p className="text-center text-gray-400 py-10">Tidak ada pesan pending.</p> : (
                <div className="space-y-4">
                    {list.map(item => (
                        <div key={item.id} className="bg-white p-6 rounded-2xl border border-orange-100 shadow-sm flex flex-col md:flex-row gap-6">
                            <div className="flex-1">
                                <span className="bg-orange-100 text-orange-700 text-xs font-bold px-2 py-1 rounded mb-2 inline-block">PENDING APPROVAL</span>
                                <h3 className="font-bold text-lg">{item.title}</h3>
                                <p className="text-sm text-gray-600 mt-1 mb-2">Oleh: {item.sender_name}</p>
                                <p className="text-sm bg-gray-50 p-3 rounded-lg text-gray-500 italic">"{item.description}"</p>
                                <a href={item.file_path} target="_blank" className="text-blue-600 text-xs font-bold mt-2 inline-block hover:underline">Lihat Lampiran</a>
                            </div>
                            <div className="flex flex-col justify-center gap-2 w-full md:w-32">
                                <button onClick={() => handleAction(item.id, 'approve')} className="py-2 px-4 bg-green-600 text-white rounded-lg font-bold hover:bg-green-700 flex items-center justify-center gap-2"><Check size={16}/> Setuju</button>
                                <button onClick={() => handleAction(item.id, 'reject')} className="py-2 px-4 bg-red-100 text-red-600 rounded-lg font-bold hover:bg-red-200 flex items-center justify-center gap-2"><X size={16}/> Tolak</button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};
export default BroadcastApproval;
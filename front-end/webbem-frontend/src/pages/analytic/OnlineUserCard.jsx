import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { User, Circle } from 'lucide-react';

const OnlineUsersCard = () => {
    const [users, setUsers] = useState([]);

    useEffect(() => {
        const fetchOnline = async () => {
            try {
                const res = await api.get('/monitoring/online-users');
                setUsers(res.data);
            } catch (err) { console.error(err); }
        };
        
        fetchOnline();
        // Update tiap 10 detik biar realtime-ish
        const interval = setInterval(fetchOnline, 10000);
        return () => clearInterval(interval);
    }, []);

    return (
        <div className="bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-4 flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse"></div>
                Pengguna Online ({users.length})
            </h3>
            <div className="space-y-4 max-h-60 overflow-y-auto pr-2">
                {users.length === 0 ? (
                    <p className="text-sm text-gray-400 italic">Tidak ada user lain yang online.</p>
                ) : (
                    users.map(user => (
                        <div key={user.id} className="flex items-center gap-3">
                            <div className="relative">
                                <img 
                                    src={user.profile_pic || `https://ui-avatars.com/api/?name=${user.name}`} 
                                    alt={user.name} 
                                    className="w-8 h-8 rounded-full object-cover border border-gray-200"
                                />
                                <div className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-green-500 border-2 border-white rounded-full"></div>
                            </div>
                            <div className="min-w-0">
                                <p className="text-sm font-bold text-gray-900 truncate">{user.name}</p>
                                <p className="text-[10px] text-gray-500 truncate">
                                    {user.role_name} • {user.ukm_name || 'Umum'}
                                </p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default OnlineUsersCard;
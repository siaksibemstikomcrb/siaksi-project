import { useEffect, useState } from 'react';
import api from '../../api/axios';
import { Globe, Users, Eye } from 'lucide-react';

const VisitorStats = () => {
    const [stats, setStats] = useState({ today_hits: 0, unique_visitors_today: 0, month_hits: 0 });

    useEffect(() => {
        api.get('/monitoring/visitor-stats').then(res => setStats(res.data)).catch(console.error);
    }, []);

    return (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="bg-blue-50 p-4 rounded-2xl border border-blue-100 flex items-center gap-4">
                <div className="p-3 bg-blue-100 text-blue-600 rounded-xl"><Eye size={20}/></div>
                <div>
                    <p className="text-xs text-blue-600 font-bold uppercase">Page Views (Hari Ini)</p>
                    <p className="text-2xl font-black text-gray-900">{stats.today_hits}</p>
                </div>
            </div>
            <div className="bg-purple-50 p-4 rounded-2xl border border-purple-100 flex items-center gap-4">
                <div className="p-3 bg-purple-100 text-purple-600 rounded-xl"><Users size={20}/></div>
                <div>
                    <p className="text-xs text-purple-600 font-bold uppercase">Pengunjung Unik</p>
                    <p className="text-2xl font-black text-gray-900">{stats.unique_visitors_today}</p>
                </div>
            </div>
            <div className="bg-orange-50 p-4 rounded-2xl border border-orange-100 flex items-center gap-4">
                <div className="p-3 bg-orange-100 text-orange-600 rounded-xl"><Globe size={20}/></div>
                <div>
                    <p className="text-xs text-orange-600 font-bold uppercase">Total Bulan Ini</p>
                    <p className="text-2xl font-black text-gray-900">{stats.month_hits}</p>
                </div>
            </div>
        </div>
    );
};

export default VisitorStats;
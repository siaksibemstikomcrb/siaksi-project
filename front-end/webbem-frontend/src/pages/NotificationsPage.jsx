import { useState, useEffect } from 'react';
import { Bell, CheckCheck, Info, Calendar, MapPin } from 'lucide-react';
import api from '../api/axios';

const NotificationsPage = () => {
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchNotifications = async () => {
    try {
      const res = await api.get('/notifications/my');
      setNotifications(res.data);
    } catch (err) {
      console.error("Gagal mengambil notifikasi", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchNotifications();
  }, []);

  const handleMarkAsRead = async (id) => {
    try {
      await api.put(`/notifications/read/${id}`);
      setNotifications(prev => 
        prev.map(n => n.inbox_id === id ? { ...n, is_read: true } : n)
      );
    } catch (err) {
      console.error("Gagal memperbarui status baca", err);
    }
  };

  const getIcon = (type) => {
    switch (type) {
      case 'attendance': return <MapPin className="text-blue-600" size={20} />;
      case 'event': return <Calendar className="text-green-600" size={20} />;
      default: return <Info className="text-gray-600" size={20} />;
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto p-4 md:p-6">
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-3">
          <div className="bg-blue-600 p-2 rounded-lg shadow-lg shadow-blue-200">
            <Bell className="text-white" size={24} />
          </div>
          <h1 className="text-2xl font-black text-gray-900 tracking-tight">Notifikasi</h1>
        </div>
        <span className="text-sm font-bold text-gray-700 bg-white border border-gray-200 px-3 py-1 rounded-full shadow-sm">
          {notifications.filter(n => !n.is_read).length} Belum dibaca
        </span>
      </div>

      <div className="space-y-4">
        {notifications.length === 0 ? (
          <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-gray-300">
            <Bell className="mx-auto text-gray-400 mb-4" size={48} />
            <p className="text-gray-600 font-bold text-lg">Belum ada notifikasi untukmu.</p>
          </div>
        ) : (
          notifications.map((notif) => (
            <div 
              key={notif.inbox_id}
              className={`group relative bg-white p-5 rounded-2xl border transition-all duration-200 
                ${notif.is_read 
                  ? 'border-gray-200 opacity-80' 
                  : 'border-blue-200 shadow-md shadow-blue-100/50 ring-1 ring-blue-50'
                }`}
            >
              <div className="flex gap-4">
                <div className={`flex-shrink-0 w-12 h-12 rounded-xl flex items-center justify-center border
                  ${notif.is_read ? 'bg-gray-50 border-gray-100' : 'bg-blue-50 border-blue-100'}`}>
                  {getIcon(notif.type)}
                </div>

                <div className="flex-1">
                  <div className="flex justify-between items-start mb-1.5">
                    <h3 className={`font-bold text-lg ${!notif.is_read ? 'text-blue-800' : 'text-gray-900'}`}>
                      {notif.title}
                    </h3>
                    <span className="text-xs font-bold text-gray-500 uppercase tracking-wide bg-gray-100 px-2 py-1 rounded-md">
                      {new Date(notif.created_at).toLocaleDateString('id-ID')}
                    </span>
                  </div>

                  <p className="text-sm text-gray-800 font-medium leading-relaxed mb-3">
                    {notif.message}
                  </p>
                  
                  {!notif.is_read && (
                    <button 
                      onClick={() => handleMarkAsRead(notif.inbox_id)}
                      className="flex items-center gap-1.5 text-xs font-bold text-blue-600 hover:text-blue-800 transition-colors bg-blue-50 px-3 py-1.5 rounded-lg w-fit"
                    >
                      <CheckCheck size={14} />
                      Tandai sudah dibaca
                    </button>
                  )}
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default NotificationsPage;
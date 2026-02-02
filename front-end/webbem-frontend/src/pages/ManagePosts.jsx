import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Edit, Trash2, CheckCircle, XCircle, Pin, Search, Eye, Filter } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

const ManagePosts = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [role, setRole] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    const userRole = localStorage.getItem('role');
    setRole(userRole);
    fetchPosts();
  }, []);

  const fetchPosts = async () => {
    setLoading(true);
    try {
      const res = await api.get('/posts/dashboard'); 
      setPosts(res.data);
    } catch (err) {
      toast.error("Gagal memuat data berita.");
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (id, newStatus) => {
    try {
      await api.put(`/posts/${id}/status`, { status: newStatus });
      toast.success(`Berita berhasil di-${newStatus}`);
      fetchPosts();
    } catch (err) {
      toast.error("Gagal update status");
    }
  };

  const handlePin = async (id, currentPinStatus) => {
    try {
      await api.put(`/posts/${id}/pin`, { is_pinned: !currentPinStatus });
      toast.success(currentPinStatus ? "Pin dilepas" : "Berita disematkan di atas!");
      fetchPosts();
    } catch (err) {
      toast.error("Gagal update pin");
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Yakin ingin menghapus berita ini?")) return;
    try {
      await api.delete(`/posts/${id}`);
      toast.success("Berita dihapus");
      setPosts(posts.filter(p => p.id !== id));
    } catch (err) {
      toast.error("Gagal menghapus");
    }
  };

  const filteredPosts = posts.filter(p => filterStatus === 'all' ? true : p.status === filterStatus);

  return (
    <div className="p-6 bg-gray-50 min-h-screen">
      
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
        <div>
          <h1 className="text-2xl font-black text-gray-800">Kelola Berita & Kegiatan</h1>
          <p className="text-gray-500 text-sm">Buat, edit, dan kelola publikasi organisasi.</p>
        </div>
        <button 
          onClick={() => navigate('/admin/posts/create')} 
          className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-xl font-bold flex items-center gap-2 shadow-lg hover:shadow-blue-200 transition-all"
        >
          <Plus size={18}/> Buat Berita Baru
        </button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        <div className="bg-white p-4 rounded-xl border border-gray-100 shadow-sm">
            <span className="text-gray-400 text-xs font-bold uppercase">Total Post</span>
            <p className="text-2xl font-black text-gray-800">{posts.length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-orange-100 shadow-sm">
            <span className="text-orange-500 text-xs font-bold uppercase">Pending</span>
            <p className="text-2xl font-black text-gray-800">{posts.filter(p => p.status === 'pending').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-green-100 shadow-sm">
            <span className="text-green-500 text-xs font-bold uppercase">Published</span>
            <p className="text-2xl font-black text-gray-800">{posts.filter(p => p.status === 'approved').length}</p>
        </div>
        <div className="bg-white p-4 rounded-xl border border-blue-100 shadow-sm">
            <span className="text-blue-500 text-xs font-bold uppercase">Total Views</span>
            <p className="text-2xl font-black text-gray-800">{posts.reduce((acc, curr) => acc + (curr.views || 0), 0)}</p>
        </div>
      </div>

      <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
        {['all', 'pending', 'approved', 'rejected'].map(status => (
            <button
                key={status}
                onClick={() => setFilterStatus(status)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all ${filterStatus === status ? 'bg-gray-800 text-white' : 'bg-white text-gray-500 hover:bg-gray-100'}`}
            >
                {status}
            </button>
        ))}
      </div>

      <div className="bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead className="bg-gray-50 border-b border-gray-100">
              <tr>
                <th className="p-4 text-xs font-extrabold text-gray-400 uppercase">Cover</th>
                <th className="p-4 text-xs font-extrabold text-gray-400 uppercase">Judul & Info</th>
                <th className="p-4 text-xs font-extrabold text-gray-400 uppercase">Status</th>
                <th className="p-4 text-xs font-extrabold text-gray-400 uppercase text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {loading ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Memuat data...</td></tr>
              ) : filteredPosts.length === 0 ? (
                <tr><td colSpan="4" className="p-8 text-center text-gray-400">Belum ada berita.</td></tr>
              ) : (
                filteredPosts.map((post) => (
                  <tr key={post.id} className="hover:bg-gray-50 transition-colors group">
                    <td className="p-4 w-24">
                        <div className="w-16 h-12 rounded-lg overflow-hidden bg-gray-100">
                            <img src={post.image_url} alt="Cover" className="w-full h-full object-cover" />
                        </div>
                    </td>
                    <td className="p-4">
                        <div className="flex flex-col">
                            <span className="font-bold text-gray-800 line-clamp-1">{post.title}</span>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="text-[10px] bg-gray-100 px-2 py-0.5 rounded text-gray-500 font-bold uppercase">{post.ukm_name}</span>
                                <span className="text-xs text-gray-400 flex items-center gap-1"><Eye size={10}/> {post.views}</span>
                                {post.is_pinned && <span className="text-[10px] bg-blue-100 text-blue-600 px-2 py-0.5 rounded font-bold flex items-center gap-1"><Pin size={8} fill="currentColor"/> PINNED</span>}
                            </div>
                        </div>
                    </td>
                    <td className="p-4">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold capitalize 
                            ${post.status === 'approved' ? 'bg-green-100 text-green-600' : 
                              post.status === 'pending' ? 'bg-orange-100 text-orange-600' : 
                              'bg-red-100 text-red-600'}`}>
                            {post.status}
                        </span>
                    </td>
               <td className="p-4 text-right">
                  <div className="flex items-center justify-end gap-2">
                      
                      <button 
                          onClick={() => window.open(`/news/${post.id}`, '_blank')} 
                          className="p-2 hover:bg-gray-100 text-gray-500 rounded-lg transition-colors" 
                          title="Lihat Postingan"
                      >
                          <Eye size={18}/>
                      </button>

                      <button 
                          onClick={() => navigate(`/admin/posts/edit/${post.id}`)} 
                          className="p-2 hover:bg-blue-50 text-blue-600 rounded-lg transition-colors" 
                          title="Edit Berita"
                      >
                          <Edit size={18}/>
                      </button>

                      {role === 'super_admin' && (
                          <>
                              {post.status === 'pending' && (
                                  <>
                                      <button onClick={() => handleStatusChange(post.id, 'approved')} className="p-2 bg-green-50 text-green-600 rounded-lg hover:bg-green-100" title="Setujui"><CheckCircle size={18}/></button>
                                      <button onClick={() => handleStatusChange(post.id, 'rejected')} className="p-2 bg-red-50 text-red-600 rounded-lg hover:bg-red-100" title="Tolak"><XCircle size={18}/></button>
                                  </>
                              )}
                              <button onClick={() => handlePin(post.id, post.is_pinned)} className={`p-2 rounded-lg transition-colors ${post.is_pinned ? 'bg-blue-100 text-blue-600' : 'bg-gray-100 text-gray-400 hover:bg-blue-50 hover:text-blue-500'}`} title="Pin/Unpin">
                                  <Pin size={18} fill={post.is_pinned ? "currentColor" : "none"}/>
                              </button>
                          </>
                      )}
                      
                      <button onClick={() => handleDelete(post.id)} className="p-2 hover:bg-red-50 text-gray-400 hover:text-red-500 rounded-lg transition-colors"><Trash2 size={18}/></button>
                  </div>
              </td>
                                </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ManagePosts;
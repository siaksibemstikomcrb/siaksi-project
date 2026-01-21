import { useState } from 'react';
import api from '../api/axios';
import { ShieldCheck, Plus, Building, Loader2 } from 'lucide-react';
import { toast } from 'sonner';

const ManageUKM = () => {
  const [formData, setFormData] = useState({ ukm_name: '', leader_name: '', description: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const toastId = toast.loading('Mendaftarkan organisasi...');

    try {
      await api.post('/ukms', formData);
      toast.success('Organisasi Berhasil Didaftarkan!', { id: toastId });
      setFormData({ ukm_name: '', leader_name: '', description: '' });
    } catch (err) {
      toast.error('Gagal mendaftarkan organisasi', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex justify-center p-6 animate-in fade-in zoom-in duration-500">
      <div className="w-full max-w-3xl bg-white p-8 md:p-10 rounded-3xl border border-gray-100 shadow-lg">
        
        {/* Header */}
        <div className="flex items-center gap-5 mb-8 pb-6 border-b border-gray-100">
          <div className="bg-blue-600 p-4 rounded-2xl text-white shadow-lg shadow-blue-200">
            <Building size={32} />
          </div>
          <div>
            <h1 className="text-3xl font-extrabold text-gray-900">Registrasi Organisasi</h1>
            <p className="text-gray-500 font-medium mt-1">Tambahkan UKM atau Organisasi baru ke dalam sistem.</p>
          </div>
        </div>
        
        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
             <InputGroup label="Nama Organisasi" value={formData.ukm_name} placeholder="Contoh: BEM STIKOM" onChange={(v) => setFormData({...formData, ukm_name: v})} />
             <InputGroup label="Ketua Umum / Penanggung Jawab" value={formData.leader_name} placeholder="Nama Lengkap" onChange={(v) => setFormData({...formData, leader_name: v})} />
          </div>
          
          <InputGroup label="Deskripsi & Visi" isTextArea value={formData.description} placeholder="Jelaskan visi dan misi organisasi..." onChange={(v) => setFormData({...formData, description: v})} />

          <div className="pt-6">
            <button 
                type="submit" 
                disabled={loading}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-4 rounded-xl shadow-lg shadow-blue-200 transition-all active:scale-[0.98] flex items-center justify-center gap-2 disabled:bg-gray-400"
            >
                {loading ? <Loader2 className="animate-spin" /> : <Plus size={20} />}
                {loading ? 'Menyimpan...' : 'Simpan Organisasi'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

const InputGroup = ({ label, value, placeholder, onChange, isTextArea }) => (
  <div className="space-y-2">
    <label className="text-sm font-bold text-gray-800 uppercase tracking-wide ml-1">{label}</label>
    {isTextArea ? (
        <textarea 
            required value={value} 
            className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 font-medium h-32 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all resize-none outline-none placeholder-gray-400" 
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)} 
        />
    ) : (
        <input 
            type="text" required value={value} 
            className="w-full bg-white border border-gray-300 rounded-xl px-5 py-4 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all outline-none placeholder-gray-400" 
            placeholder={placeholder}
            onChange={(e) => onChange(e.target.value)} 
        />
    )}
  </div>
);

export default ManageUKM;
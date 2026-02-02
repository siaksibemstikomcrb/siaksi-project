import React, { useState, useEffect, useRef } from 'react';
import api from '../api/axios';
import { 
    Trash2, Search, UserPlus, ShieldAlert, Users, 
    Building, Briefcase, ChevronDown, Check, Loader2, Key, X, RefreshCw, Smartphone 
} from 'lucide-react';
import { toast } from 'sonner';

const ManageUsers = () => {
    const [users, setUsers] = useState([]);
    const [search, setSearch] = useState('');
    const [loadingUsers, setLoadingUsers] = useState(true);
    const [ukmList, setUkmList] = useState([]);
    const [showAddForm, setShowAddForm] = useState(false);
    const [formData, setFormData] = useState({ 
        name: '', username: '', nia: '', password: '', role_id: '3', ukm_id: '' 
    });

    const [loadingSubmit, setLoadingSubmit] = useState(false);
    const [resetModal, setResetModal] = useState({ show: false, userId: null, userName: '' });
    const [newPass, setNewPass] = useState('');
    const [loadingReset, setLoadingReset] = useState(false);
    const myRole = localStorage.getItem('role');

    const fetchData = async () => {
        setLoadingUsers(true);
        try {
            const resUser = await api.get('/users'); 
            setUsers(resUser.data);

            if (myRole === 'super_admin') {
                const resUkm = await api.get('/ukms');
                setUkmList(resUkm.data);
            }
        } catch (err) {
            toast.error("Gagal memuat data.");
        } finally {
            setLoadingUsers(false);
        }
    };

    useEffect(() => { fetchData(); }, []);

    const handleDelete = async (userId, userName) => {
        if (!window.confirm(`Yakin ingin mengeluarkan ${userName}?`)) return;
        try {
            await api.delete(`/users/${userId}`);
            toast.success(`Berhasil menghapus ${userName}`);
            fetchData();
        } catch (err) {
            toast.error("Gagal menghapus user.");
        }
    };

const handleSubmit = async (e) => {
    e.preventDefault();
    setLoadingSubmit(true);

    let payload = { ...formData };

    if (payload.role_id === '1') {
        payload.ukm_id = '9';
        payload.nia = '-';
    }

    try {
        await api.post('/users', payload);
        
        toast.success(`User ${payload.username} berhasil dibuat!`);
        
        setFormData({ name: '', username: '', nia: '', password: '', role_id: '3', ukm_id: '' });
        setShowAddForm(false);
        fetchData(); 
    } catch (err) {
        console.error(err);
        toast.error(err.response?.data?.msg || 'Gagal membuat user');
    } finally {
        setLoadingSubmit(false);
    }
};

    const openResetModal = (user) => {
        setResetModal({ show: true, userId: user.id, userName: user.name });
        setNewPass('');
    };

    const handleResetPassword = async (e) => {
        e.preventDefault();
        if (newPass.length < 6) return toast.error("Password minimal 6 karakter");

        setLoadingReset(true);
        try {
            await api.put(`/users/${resetModal.userId}/reset-password`, { newPassword: newPass });
            toast.success(`Password untuk ${resetModal.userName} berhasil direset!`);
            setResetModal({ show: false, userId: null, userName: '' });
        } catch (err) {
            toast.error("Gagal mereset password.");
        } finally {
            setLoadingReset(false);
        }
    };

    const filteredUsers = users.filter(user => 
        user.name.toLowerCase().includes(search.toLowerCase()) || 
        (user.nia && user.nia.includes(search))
    );

    const roleOptions = [
        { value: '3', label: 'Member / Anggota' },
        { value: '2', label: 'Admin UKM' },
        { value: '1', label: 'Super Admin' }
    ];
    const ukmOptions = ukmList.map(ukm => ({ value: ukm.id, label: ukm.ukm_name }));

    if (myRole !== 'super_admin' && myRole !== 'admin') return <DeniedView />;

    return (
        <div className="min-h-screen bg-gray-50 p-4 md:p-8 font-sans text-slate-800 relative pb-20">
            
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <div>
                    <h1 className="text-2xl md:text-3xl font-extrabold text-gray-900 tracking-tight">Manajemen Anggota</h1>
                    <p className="text-gray-500 font-medium mt-1 text-sm md:text-base">
                        {myRole === 'super_admin' ? 'Kelola seluruh pengguna sistem.' : 'Kelola data anggota UKM Anda.'}
                    </p>
                </div>
                {myRole === 'super_admin' && (
                    <button 
                        onClick={() => setShowAddForm(!showAddForm)}
                        className={`w-full md:w-auto px-5 py-3 rounded-xl font-bold flex items-center justify-center gap-2 shadow-lg transition-all active:scale-95
                        ${showAddForm ? 'bg-red-50 text-red-600 border border-red-200' : 'bg-blue-600 text-white hover:bg-blue-700'}`}
                    >
                        {showAddForm ? <Users size={20}/> : <UserPlus size={20}/>}
                        {showAddForm ? 'Tutup Form' : 'Tambah User'}
                    </button>
                )}
            </div>

            {showAddForm && myRole === 'super_admin' && (
                <div className="bg-white p-6 md:p-8 rounded-3xl border border-blue-100 shadow-xl mb-8 animate-in slide-in-from-top-4 fade-in duration-300">
                    <h2 className="text-xl font-bold text-gray-800 mb-6 flex items-center gap-2">
                        <UserPlus className="text-blue-600"/> Form Tambah Pengguna
                    </h2>
                    <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-5">
                        <InputGroup label="Nama Lengkap" value={formData.name} placeholder="Budi Santoso" onChange={(v) => setFormData({...formData, name: v})} />
                        <InputGroup label="Username" value={formData.username} placeholder="budi123" onChange={(v) => setFormData({...formData, username: v})} />
                        {formData.role_id !== '1' && <InputGroup label="NIA" value={formData.nia} placeholder="2023001" onChange={(v) => setFormData({...formData, nia: v})} />}
                        <div className="relative">
                            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block">Password</label>
                            <input type="password" required value={formData.password} className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-xl outline-none focus:ring-2 focus:ring-blue-500" placeholder="••••••" onChange={(e) => setFormData({...formData, password: e.target.value})} />
                        </div>
                        <CustomDropdown label="Role" options={roleOptions} value={formData.role_id} onChange={(v) => setFormData({...formData, role_id: v})} icon={Briefcase} />
                        {formData.role_id !== '1' && <CustomDropdown label="UKM" options={ukmOptions} value={formData.ukm_id} onChange={(v) => setFormData({...formData, ukm_id: v})} icon={Building} />}
                        <div className="md:col-span-2 pt-4">
                            <button type="submit" disabled={loadingSubmit} className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3.5 rounded-xl shadow-md transition flex justify-center items-center gap-2">
                                {loadingSubmit ? <Loader2 className="animate-spin"/> : <Check/>} Simpan Data
                            </button>
                        </div>
                    </form>
                </div>
            )}

            <div className="bg-white p-2 rounded-xl border border-gray-200 shadow-sm mb-6 flex items-center gap-3 sticky top-0 z-20 md:static">
                <div className="p-3 bg-gray-50 rounded-lg text-gray-400"><Search size={20} /></div>
                <input type="text" placeholder="Cari Nama atau NIA..." className="flex-1 outline-none text-gray-700 bg-transparent py-2" onChange={(e) => setSearch(e.target.value)} />
            </div>

            <div className="hidden md:block bg-white rounded-2xl border border-gray-200 shadow-sm overflow-hidden">
                <table className="w-full text-left border-collapse">
                    <thead className="bg-gray-50 border-b border-gray-200">
                        <tr>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase">User Profile</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase">Identitas</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase">Role</th>
                            <th className="p-5 text-xs font-bold text-gray-500 uppercase text-center">Aksi</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-100">
                        {loadingUsers ? (
                            <tr><td colSpan="4" className="p-10 text-center text-gray-400"><Loader2 className="animate-spin mx-auto mb-2"/>Memuat data...</td></tr>
                        ) : filteredUsers.length === 0 ? (
                            <tr><td colSpan="4" className="p-10 text-center text-gray-400">Tidak ada data ditemukan.</td></tr>
                        ) : (
                            filteredUsers.map((user) => (
                                <tr key={user.id} className="hover:bg-blue-50/30 transition-colors">
                                    <td className="p-5 flex items-center gap-4">
                                        <img src={user.profile_pic || `https://ui-avatars.com/api/?name=${user.name}&background=random`} className="w-10 h-10 rounded-full object-cover border"/>
                                        <div>
                                            <p className="font-bold text-gray-900 text-sm">{user.name}</p>
                                            <p className="text-xs text-gray-500">@{user.username || user.name.toLowerCase().replace(/\s/g,'')}</p>
                                        </div>
                                    </td>
                                    <td className="p-5">
                                        <span className="font-mono bg-gray-100 px-2 py-1 rounded text-xs font-bold text-gray-600">{user.nia || '-'}</span>
                                    </td>
                                    <td className="p-5">
                                        <RoleBadge role={user.role_name} />
                                    </td>
                                    <td className="p-5 text-center flex justify-center gap-2">
                                        <button onClick={() => openResetModal(user)} className="p-2 text-gray-400 hover:text-orange-500 hover:bg-orange-50 rounded-lg transition" title="Reset Password">
                                            <Key size={18} />
                                        </button>
                                        <button onClick={() => handleDelete(user.id, user.name)} className="p-2 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition" title="Hapus User">
                                            <Trash2 size={18} />
                                        </button>
                                    </td>
                                </tr>
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            <div className="md:hidden flex flex-col gap-4">
                {loadingUsers ? (
                    <div className="py-20 text-center text-gray-400 flex flex-col items-center">
                        <Loader2 className="animate-spin mb-2" size={32}/> Memuat data...
                    </div>
                ) : filteredUsers.length === 0 ? (
                    <div className="bg-white p-8 rounded-2xl border border-dashed border-gray-300 text-center text-gray-500">
                        Tidak ada data yang cocok.
                    </div>
                ) : (
                    filteredUsers.map((user) => (
                        <div key={user.id} className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm flex flex-col gap-4 active:scale-[0.99] transition-transform">
                            <div className="flex items-start justify-between">
                                <div className="flex items-center gap-3">
                                    <img src={user.profile_pic || `https://ui-avatars.com/api/?name=${user.name}&background=random`} className="w-14 h-14 rounded-full object-cover border border-gray-100 shadow-sm"/>
                                    <div>
                                        <h3 className="font-bold text-gray-900 text-lg leading-tight">{user.name}</h3>
                                        <p className="text-sm text-gray-500 font-medium">@{user.username || 'user'}</p>
                                    </div>
                                </div>
                                <RoleBadge role={user.role_name} />
                            </div>

                            <div className="bg-gray-50 rounded-xl p-3 flex justify-between items-center border border-gray-100">
                                <span className="text-xs font-bold text-gray-400 uppercase">Nomor Induk (NIA)</span>
                                <span className="font-mono font-bold text-gray-800 text-lg tracking-wide">{user.nia || '-'}</span>
                            </div>

                            <div className="grid grid-cols-2 gap-3 mt-1">
                                <button 
                                    onClick={() => openResetModal(user)}
                                    className="py-3 bg-white border border-gray-200 text-gray-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-gray-50 active:bg-gray-100"
                                >
                                    <Key size={18} className="text-orange-500"/> Reset Pass
                                </button>
                                <button 
                                    onClick={() => handleDelete(user.id, user.name)}
                                    className="py-3 bg-red-50 border border-red-100 text-red-600 rounded-xl text-sm font-bold flex items-center justify-center gap-2 hover:bg-red-100 active:bg-red-200"
                                >
                                    <Trash2 size={18}/> Hapus
                                </button>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {resetModal.show && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4 animate-in fade-in zoom-in duration-200">
                    <div className="bg-white w-full max-w-md rounded-3xl p-6 shadow-2xl">
                        <div className="flex justify-between items-center mb-6 border-b border-gray-100 pb-4">
                            <h3 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                                <RefreshCw className="text-orange-500"/> Reset Password
                            </h3>
                            <button onClick={() => setResetModal({show:false})} className="p-2 bg-gray-100 rounded-full text-gray-500"><X size={20}/></button>
                        </div>
                        
                        <div className="mb-6">
                            <p className="text-gray-500 text-sm mb-4 bg-blue-50 p-3 rounded-lg border border-blue-100">
                                Masukkan password baru untuk <strong className="text-gray-900">{resetModal.userName}</strong>.
                            </p>
                            <label className="text-xs font-bold text-gray-500 uppercase mb-2 block ml-1">Password Baru</label>
                            <input 
                                type="text" 
                                value={newPass}
                                onChange={(e) => setNewPass(e.target.value)}
                                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3.5 text-gray-900 font-bold focus:ring-2 focus:ring-orange-500 outline-none text-lg placeholder-gray-300"
                                placeholder="Min. 6 Karakter"
                            />
                        </div>

                        <div className="flex gap-3">
                            <button onClick={() => setResetModal({show:false})} className="flex-1 py-3.5 font-bold text-gray-500 bg-white border border-gray-200 hover:bg-gray-50 rounded-xl transition">Batal</button>
                            <button 
                                onClick={handleResetPassword}
                                disabled={loadingReset}
                                className="flex-1 py-3.5 font-bold text-white bg-orange-500 hover:bg-orange-600 rounded-xl shadow-lg shadow-orange-200 transition flex justify-center items-center gap-2 disabled:bg-gray-300"
                            >
                                {loadingReset ? <Loader2 className="animate-spin"/> : <Check/>} Simpan
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};


const RoleBadge = ({ role }) => {
    const isAdmin = role?.toLowerCase().includes('admin');
    const isSuper = role?.toLowerCase().includes('super');
    
    let style = "bg-green-50 text-green-700 border-green-200";
    if (isSuper) style = "bg-purple-50 text-purple-700 border-purple-200";
    else if (isAdmin) style = "bg-blue-50 text-blue-700 border-blue-200";

    return (
        <span className={`px-2.5 py-1 rounded-lg text-[10px] md:text-xs font-bold uppercase border tracking-wide ${style}`}>
            {role}
        </span>
    );
};

const InputGroup = ({ label, value, placeholder, onChange }) => (
    <div>
      <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">{label}</label>
      <input type="text" required value={value} className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-3 text-gray-900 font-medium focus:ring-2 focus:ring-blue-500 focus:bg-white transition-all outline-none placeholder-gray-400" placeholder={placeholder} onChange={(e) => onChange(e.target.value)} />
    </div>
);

const CustomDropdown = ({ label, options, value, onChange, placeholder = "Pilih...", icon: Icon }) => {
    const [isOpen, setIsOpen] = useState(false);
    const dropdownRef = useRef(null);
    useEffect(() => {
        const handleClickOutside = (event) => { if (dropdownRef.current && !dropdownRef.current.contains(event.target)) setIsOpen(false); };
        document.addEventListener("mousedown", handleClickOutside);
        return () => document.removeEventListener("mousedown", handleClickOutside);
    }, []);
    const selected = options.find(opt => String(opt.value) === String(value));
    return (
        <div className="relative" ref={dropdownRef}>
            <label className="text-xs font-bold text-gray-500 uppercase mb-1 block ml-1">{label}</label>
            <div onClick={() => setIsOpen(!isOpen)} className={`w-full bg-gray-50 border cursor-pointer rounded-xl px-4 py-3 flex items-center justify-between transition-all ${isOpen ? 'ring-2 ring-blue-500 bg-white' : 'border-gray-200'}`}>
                <div className="flex items-center gap-2 overflow-hidden">{Icon && <Icon size={18} className="text-gray-400 flex-shrink-0" />}<span className={`text-sm font-medium truncate ${selected ? 'text-gray-900' : 'text-gray-400'}`}>{selected ? selected.label : placeholder}</span></div>
                <ChevronDown size={16} className={`text-gray-400 transition ${isOpen ? 'rotate-180' : ''}`} />
            </div>
            {isOpen && (<div className="absolute z-50 mt-2 w-full bg-white border border-gray-100 rounded-xl shadow-xl max-h-48 overflow-y-auto animate-in slide-in-from-top-2 duration-200">{options.map((opt) => (<div key={opt.value} onClick={() => { onChange(opt.value); setIsOpen(false); }} className={`px-4 py-3 text-sm font-medium cursor-pointer hover:bg-gray-50 flex justify-between ${String(value) === String(opt.value) ? 'text-blue-600 bg-blue-50' : 'text-gray-700'}`}>{opt.label}{String(value) === String(opt.value) && <Check size={16}/>}</div>))}</div>)}
        </div>
    );
};

const DeniedView = () => (
    <div className="h-[70vh] flex flex-col items-center justify-center text-center p-6">
        <div className="bg-red-50 p-6 rounded-full mb-4 animate-bounce"><ShieldAlert className="text-red-500" size={48} /></div>
        <h2 className="text-2xl font-bold text-gray-900">Akses Ditolak</h2>
        <p className="text-gray-500 mt-2">Halaman ini hanya untuk Administrator.</p>
    </div>
);

export default ManageUsers;
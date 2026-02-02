import { useEffect, useState, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import api from '../api/axios';
import { Loader2, CheckCircle, XCircle, ExternalLink } from 'lucide-react';

const ConnectDiscord = () => {
    const [searchParams] = useSearchParams();
    const navigate = useNavigate();
    const [status, setStatus] = useState('processing');
    const [message, setMessage] = useState('Menghubungkan akun Discord...');
    const [inviteLink, setInviteLink] = useState(null);
    
    const hasFetched = useRef(false);

    useEffect(() => {
        const connect = async () => {
            if (hasFetched.current) return;
            
            const code = searchParams.get('code');
            if (!code) {
                setStatus('error');
                setMessage('Kode otorisasi tidak ditemukan.');
                return;
            }

            hasFetched.current = true;

            try {
                const res = await api.post('/discord/connect', { code });
                
                setStatus('success');

                if (res.data.sync_status?.need_join) {
                    setMessage(`Akun terhubung! Langkah terakhir: Masuk ke Server Kampus.`);
                    setInviteLink("https://discord.gg/NpTRhxzf"); 
                } else {
                    setMessage(`Berhasil! Akun Discord ${res.data.discord_username} telah terhubung.`);
                    setTimeout(() => navigate('/profile'), 3000);
                }

            } catch (err) {
                console.error("Connect Error:", err);
                setStatus('error');
                const serverMsg = err.response?.data?.msg || err.message;
                setMessage(serverMsg === 'Invalid "code" in request.' 
                    ? 'Kode kadaluarsa. Silakan coba klik tombol di Profil lagi.' 
                    : 'Gagal menghubungkan Discord.');
            }
        };

        connect();
    }, [searchParams, navigate]);

    return (
        <div className="h-screen flex flex-col items-center justify-center bg-gray-50 p-4">
            <div className="bg-white p-8 rounded-3xl shadow-xl max-w-md w-full text-center">
                
                {status === 'processing' && (
                    <div className="flex flex-col items-center gap-4">
                        <Loader2 size={48} className="text-blue-600 animate-spin" />
                        <h2 className="text-xl font-bold text-gray-800">Sedang Menghubungkan...</h2>
                        <p className="text-gray-500">Mohon tunggu sebentar...</p>
                    </div>
                )}

                {status === 'success' && (
                    <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                        <div className="p-4 bg-green-100 text-green-600 rounded-full">
                            <CheckCircle size={48} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Sukses!</h2>
                        <p className="text-gray-500">{message}</p>

                        {inviteLink ? (
                            <div className="mt-4 w-full">
                                <a 
                                    href={inviteLink}
                                    target="_blank"
                                    rel="noreferrer"
                                    className="w-full px-6 py-3 bg-[#5865F2] text-white rounded-xl font-bold hover:bg-[#4752c4] transition flex items-center justify-center gap-2 mb-3"
                                >
                                    <ExternalLink size={18} />
                                    Join Server Discord
                                </a>
                                <p className="text-xs text-gray-400">Klik tombol di atas untuk masuk ke server.</p>
                            </div>
                        ) : (
                            <p className="text-xs text-gray-400 mt-4">Mengalihkan kembali...</p>
                        )}
                    </div>
                )}

                {status === 'error' && (
                    <div className="flex flex-col items-center gap-4 animate-in zoom-in duration-300">
                        <div className="p-4 bg-red-100 text-red-600 rounded-full">
                            <XCircle size={48} />
                        </div>
                        <h2 className="text-xl font-bold text-gray-800">Gagal Terhubung</h2>
                        <p className="text-red-500 font-medium">{message}</p>
                        <button 
                            onClick={() => navigate('/profile')}
                            className="mt-4 px-6 py-2 bg-gray-900 text-white rounded-xl font-bold hover:bg-black transition"
                        >
                            Kembali ke Profil
                        </button>
                    </div>
                )}

            </div>
        </div>
    );
};

export default ConnectDiscord;
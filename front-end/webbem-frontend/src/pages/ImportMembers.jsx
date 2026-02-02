import React, { useState, useEffect } from 'react';
import api from '../api/axios'; 
import { toast } from 'sonner';
import { Upload, FileSpreadsheet, CheckCircle, AlertCircle, Building, Download } from 'lucide-react';

const ImportMembers = () => {
    const [ukmList, setUkmList] = useState([]);
    const [selectedUkmId, setSelectedUkmId] = useState("");
    const [file, setFile] = useState(null);
    const [loading, setLoading] = useState(false);
    const [fetching, setFetching] = useState(true);

    const role = localStorage.getItem('role');

    useEffect(() => {
        const fetchUkms = async () => {
            try {
                const response = await api.get('/mail/ukm-list'); 
                setUkmList(response.data);
            } catch (error) {
                console.error("Gagal ambil data UKM", error);
                toast.error("Gagal memuat daftar UKM.");
            } finally {
                setFetching(false);
            }
        };

        if (role === 'super_admin') {
            fetchUkms();
        } else {
            setFetching(false);
        }
    }, [role]);

    const getUkmCode = (ukmName) => {
        if (!ukmName) return "MHS"; 
        const name = ukmName.toLowerCase();
        if (name.includes("komputer") || name.includes("himakom")) return "HMK";
        if (name.includes("bem") || name.includes("eksekutif")) return "BEM";
        if (name.includes("dpm") || name.includes("dewan")) return "DPM";
        if (name.includes("choir") || name.includes("scc")) return "SCC";
        if (name.includes("art") || name.includes("crew")) return "ART";
        if (name.includes("olahraga") || name.includes("olg")) return "OLG";
        if (name.includes("robotika") || name.includes("uno")) return "UNO";
        if (name.includes("mata alam") || name.includes("ma")) return "MA";
        if (name.includes("radio") || name.includes("srtv")) return "SRTV";
        return name.substring(0, 3).toUpperCase();
    };

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async (e) => {
        e.preventDefault();
        
        if (role === 'super_admin' && !selectedUkmId) {
            toast.error("Pilih UKM target terlebih dahulu!");
            return;
        }

        if (!file) {
            toast.error("File Excel wajib diupload!");
            return;
        }

        let targetCode = "";
        
        if (role === 'super_admin') {
            const selectedUkmData = ukmList.find(u => u.id === parseInt(selectedUkmId));
            if (selectedUkmData) {
                targetCode = getUkmCode(selectedUkmData.name); 
            }
        } else {
            targetCode = "AUTO"; 
        }

        const formData = new FormData();
        formData.append("ukmCode", targetCode); 
        if (selectedUkmId) formData.append("targetUkmId", selectedUkmId); 
        formData.append("file", file);   

        setLoading(true);
        try {
            const response = await api.post("/users/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" }
            });

            if(response.data.total_data === 0) {
                toast.warning(response.data.msg);
            } else {
                toast.success(response.data.msg);
            }

            setFile(null);
            setSelectedUkmId("");
            document.getElementById('fileInput').value = ""; 
        } catch (error) {
            console.error(error);
            toast.error(error.response?.data?.msg || "Gagal upload file");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="p-6 bg-white rounded-xl shadow-md max-w-2xl mx-auto mt-10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-6 gap-4">
                <h2 className="text-2xl font-bold flex items-center gap-2 text-slate-800">
                    <FileSpreadsheet className="text-green-600" />
                    Import Anggota
                </h2>
                
                <a 
                    href="/template_anggota.xlsx" 
                    download="Format_Import_Anggota.xlsx"
                    className="flex items-center gap-2 text-sm font-bold text-blue-600 hover:text-white bg-blue-50 hover:bg-blue-600 border border-blue-200 px-4 py-2 rounded-lg transition-all shadow-sm"
                >
                    <Download size={16} />
                    Download Format Excel
                </a>
            </div>

            <div className="bg-slate-50 p-5 rounded-xl mb-8 border border-slate-200 shadow-sm">
                <h4 className="font-bold text-slate-800 mb-3 flex items-center gap-2 border-b border-slate-200 pb-2">
                    <AlertCircle size={18} className="text-orange-500" /> 
                    Panduan Format File:
                </h4>
                <div className="text-sm text-slate-600 space-y-2">
                    <p>Pastikan file Excel Anda memiliki struktur kolom seperti ini:</p>
                    
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse border border-slate-300 bg-white rounded-lg text-xs">
                            <thead>
                                <tr className="bg-slate-100">
                                    <th className="border border-slate-300 p-2 font-bold text-center w-10">A</th>
                                    <th className="border border-slate-300 p-2 font-bold text-center w-32">B</th>
                                    <th className="border border-slate-300 p-2 font-bold text-center">C</th>
                                </tr>
                            </thead>
                            <tbody>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-mono font-bold text-center bg-yellow-50 text-yellow-700">1</td>
                                    <td className="border border-slate-300 p-2 font-bold text-center">NIA</td>
                                    <td className="border border-slate-300 p-2 font-bold">NAMA</td>
                                </tr>
                                <tr>
                                    <td className="border border-slate-300 p-2 font-mono text-center text-slate-400">2</td>
                                    <td className="border border-slate-300 p-2 text-center">102024041</td>
                                    <td className="border border-slate-300 p-2">Budi Santoso</td>
                                </tr>
                            </tbody>
                        </table>
                    </div>

                    <ul className="list-disc list-inside space-y-1 mt-2 text-slate-700 font-medium">
                        <li><span className="text-red-600 font-bold">PENTING:</span> Header (Judul Kolom) wajib ada di <b>Baris Pertama (Row 1)</b>.</li>
                        <li>Jangan ada judul surat/kop surat di baris 1. Hapus jika ada.</li>
                        <li>Sistem otomatis mendeteksi kolom bernama <b>NIA</b> dan <b>NAMA</b> (Huruf besar/kecil tidak masalah).</li>
                    </ul>
                </div>
            </div>

            <form onSubmit={handleUpload} className="space-y-6">
                
                {role === 'super_admin' && (
                    <div>
                        <label className="block text-sm font-bold text-slate-700 mb-2 flex items-center gap-2">
                            <Building size={16} /> Pilih UKM Tujuan
                        </label>
                        {fetching ? (
                            <p className="text-sm text-gray-500 animate-pulse">Memuat daftar UKM...</p>
                        ) : (
                            <select 
                                value={selectedUkmId} 
                                onChange={(e) => setSelectedUkmId(e.target.value)}
                                className="w-full p-3 border border-slate-300 rounded-lg focus:ring-2 focus:ring-blue-500 bg-white"
                                required
                            >
                                <option value="">-- Pilih UKM --</option>
                                {ukmList.map((u) => (
                                    <option key={u.id} value={u.id}>
                                        {u.name} (Kode: {getUkmCode(u.name)})
                                    </option>
                                ))}
                            </select>
                        )}
                    </div>
                )}

                <div className="border-2 border-dashed border-slate-300 rounded-xl p-10 text-center hover:bg-slate-50 transition cursor-pointer relative group">
                    <input 
                        id="fileInput"
                        type="file" 
                        accept=".xlsx, .xls"
                        onChange={handleFileChange}
                        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                    />
                    <div className="flex flex-col items-center">
                        <div className="bg-blue-100 p-4 rounded-full mb-3 group-hover:scale-110 transition-transform">
                            <Upload className="w-8 h-8 text-blue-600" />
                        </div>
                        <span className="text-slate-700 font-semibold text-lg">
                            {file ? file.name : "Klik untuk Upload Excel"}
                        </span>
                        <span className="text-sm text-slate-400 mt-1">Format: .xlsx atau .xls</span>
                    </div>
                </div>

                <button 
                    type="submit" 
                    disabled={loading || (role === 'super_admin' && !selectedUkmId)}
                    className={`w-full py-3.5 rounded-xl text-white font-bold transition flex justify-center items-center gap-2 shadow-lg
                        ${loading || (role === 'super_admin' && !selectedUkmId)
                            ? "bg-slate-400 cursor-not-allowed shadow-none" 
                            : "bg-blue-600 hover:bg-blue-700 hover:shadow-blue-500/30"}
                    `}
                >
                    {loading ? "Sedang Memproses Data..." : (
                        <>
                            <CheckCircle size={20} />
                            Mulai Proses Import
                        </>
                    )}
                </button>
            </form>
        </div>
    );
};

export default ImportMembers;
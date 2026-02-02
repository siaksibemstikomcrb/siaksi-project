import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { FileText, Printer, Plus, Trash2, Settings, X, Type, Layout, Bold, Italic, Underline, AlignCenter, Building2, Lock, ShieldCheck, Eye, EyeOff, User } from 'lucide-react';
import api from '../api/axios';
import { toast } from 'sonner';

import logoBEM from '../assets/images/logo-ukm-org/logo-bem.png';
import logoDPM from '../assets/images/logo-ukm-org/dpm.png';
import logoArt from '../assets/images/logo-ukm-org/art.png';
import logoChoir from '../assets/images/logo-ukm-org/scc.png';
import logoHimakom from '../assets/images/logo-ukm-org/himakom.png';
import logoOlahraga from '../assets/images/logo-ukm-org/olahraga.png';
import logoUno from '../assets/images/logo-ukm-org/robotik.png';
import logoSrtv from '../assets/images/logo-ukm-org/srtv.png';
import logoMataAlam from '../assets/images/logo-ukm-org/matalam.png'; 
import logoStikom from '../assets/images/logo-ukm-org/logo-stikom.png';

const UKM_PRESETS = [
  { 
    id: 9, 
    name: 'BADAN EKSEKUTIF MAHASISWA (BEM)', 
    campus: 'STIKOM POLTEK CIREBON', 
    address: 'Jl. Pusri No. 01 Kedawung, Cirebon, Jawa Barat, 45153', 
    logo: logoBEM, 
    showCampusLogo: true,
    swapLogos: true
  },
  { 
    id: 15, 
    name: 'DEWAN PERWAKILAN MAHASISWA (DPM)', 
    campus: 'STIKOM POLTEK CIREBON', 
    address: 'Jl. Pusri No. 01 Kedawung, Cirebon, Jawa Barat, 45153', 
    logo: logoDPM, 
    showCampusLogo: true,
    swapLogos: true
  },
  { 
    id: 14, 
    parentOrg: 'MAHASISWA PECINTA ALAM', 
    name: 'MATA ALAM', 
    campus: 'STIKOM POLTEK CIREBON', 
    address: 'Sekretariat Kampus I Jln. Pusri No. 01 ByPass Kedawung, Cirebon Jawa Barat 45153. Telp (0231) 486475 Ext 82/83', 
    logo: logoMataAlam, 
    showCampusLogo: false,
    swapLogos: false
  },
  { 
    id: 5, 
    name: 'STIKOM CIREBON CHOIR (SCC)', 
    campus: 'STIKOM POLTEK CIREBON', 
    address: 'Jln. Brigjend Darsono No. 33 Cirebon. Phone (0231) 486475', 
    logo: logoChoir, 
    showCampusLogo: false,
    swapLogos: false
  },
  { id: 6, name: 'ART MEDIA CREW', campus: 'STIKOM POLTEK CIREBON', address: 'Jl. Pusri No.01, Kedawung Cirebon Jawa Barat phone (0231) 486475', logo: logoArt, showCampusLogo: false },
  { id: 7, name: 'HIMAKOM (Himpunan Mahasiswa Komputer)', campus: 'STIKOM POLTEK CIREBON', address: 'Jl. Pusri No 31 Kedawung phone (0231) 48647', logo: logoHimakom, showCampusLogo: false },
  { id: 11, name: 'UKM OLAHRAGA', campus: 'STIKOM POLTEK CIREBON', address: 'Jln. Brigjend Darsono No. 33 Cirebon Telp (0231) 486475', logo: logoOlahraga, showCampusLogo: false },
  { id: 10, name: 'UNIT ROBOTIKA (UNO)', campus: 'STIKOM POLTEK CIREBON', address: 'Jl. Pusri No. 01 Kedawung, Cirebon, Jawa Barat, 45153', logo: logoUno, showCampusLogo: false },
  { id: 8, name: 'STIKOM RADIO TELEVISION (SRTV)', campus: 'STIKOM POLTEK CIREBON', address: 'Jl. Pusri No. 01 Kedawung, Cirebon, Jawa Barat, 45153', logo: logoSrtv, showCampusLogo: false }
];

const RichTextEditor = ({ label, value, onChange, rows = 3 }) => {
  const handleFormat = (command) => document.execCommand(command, false, null);
  return (
    <div className="space-y-1">
      <div className="flex justify-between items-end">
        <label className="text-xs font-extrabold text-gray-400 uppercase tracking-wider">{label}</label>
        <div className="flex bg-gray-100 rounded-t-lg border border-gray-300 border-b-0 overflow-hidden">
          <button type="button" onClick={() => handleFormat('bold')} className="p-1.5 hover:bg-gray-200 text-gray-700" title="Bold"><Bold size={14}/></button>
          <button type="button" onClick={() => handleFormat('italic')} className="p-1.5 hover:bg-gray-200 text-gray-700" title="Italic"><Italic size={14}/></button>
          <button type="button" onClick={() => handleFormat('underline')} className="p-1.5 hover:bg-gray-200 text-gray-700" title="Underline"><Underline size={14}/></button>
        </div>
      </div>
      <div className="input-field overflow-y-auto" style={{ minHeight: `${rows * 20}px` }} contentEditable suppressContentEditableWarning onInput={(e) => onChange(e.currentTarget.innerHTML)} dangerouslySetInnerHTML={{ __html: value }} />
    </div>
  );
};

const LetterGenerator = () => {
  const navigate = useNavigate();
  const [isVerified, setIsVerified] = useState(false);
  const [authInput, setAuthInput] = useState(''); 
  const [passwordInput, setPasswordInput] = useState('');
  const [loadingVerify, setLoadingVerify] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const [userRole, setUserRole] = useState(null);
  const [lockedUkmId, setLockedUkmId] = useState(null);

  const [headerData, setHeaderData] = useState({
    parentOrg: '', orgName: '', campus: '', address: '', logoUrl: '', showCampusLogo: false, swapLogos: false
  });
  const [settings, setSettings] = useState({
    paperSize: 'A4', fontSize: 12, lineHeight: 1.5, marginTop: 25, marginBottom: 25, fontFamily: 'Times New Roman'
  });
  const [form, setForm] = useState({
    nomor: '', lampiran: '-', perihal: '', 
    date: new Date().toLocaleDateString('id-ID', {day: 'numeric', month: 'long', year: 'numeric'}),
    tujuan: '', tempat: 'Tempat', useSalam: true, 
    paragraf_pembuka: 'Sehubungan akan dilaksanakannya kegiatan <b>"Nama Kegiatan"</b>, maka dengan ini kami memohon...',
    isi_utama: 'Adapun ketentuan kegiatan tersebut adalah...',
    penutup: 'Demikian surat ini kami sampaikan. Atas perhatian dan kerjasamanya kami ucapkan terimakasih.',
    signatories: [{ id: 1, jabatan: 'Sekretaris', nama: '(Nama Lengkap)', nia: 'NIA. -' }, { id: 2, jabatan: 'Ketua Pelaksana', nama: '(Nama Lengkap)', nia: 'NIA. -' }],
    useMengetahui: false, mengetahui: { jabatan: 'Presiden Mahasiswa', nama: '(Nama Presma)', nia: 'NIA. -' }
  });
  const [showSettings, setShowSettings] = useState(false);

  useEffect(() => {
    const role = localStorage.getItem('role');
    const ukmId = parseInt(localStorage.getItem('ukm_id'));
    const savedUser = localStorage.getItem('username') || localStorage.getItem('email') || ''; 
    
    setAuthInput(savedUser); 
    setUserRole(role);

    const myPreset = UKM_PRESETS.find(p => p.id === ukmId);

    if (role === 'super_admin') {
        loadPreset(UKM_PRESETS[0]);
    } else if (myPreset) {
        loadPreset(myPreset);
        setLockedUkmId(ukmId);
    } else {
        loadPreset(UKM_PRESETS[0]);
    }
  }, []);

  const loadPreset = (preset) => {
    setHeaderData({
        parentOrg: preset.parentOrg || '',
        orgName: preset.name,
        campus: preset.campus,
        address: preset.address,
        logoUrl: preset.logo,
        showCampusLogo: preset.showCampusLogo,
        swapLogos: preset.swapLogos || false
    });
  };

const handleVerify = async (e) => {
    e.preventDefault();
    setLoadingVerify(true);
    
    const payload = { 
        username: authInput, 
        password: passwordInput 
    }; 

    try {
        const res = await api.post('/auth/login', payload);
        
        if (res.status === 200) {
            setIsVerified(true);
            toast.success("Akses Diberikan!");
        }
    } catch (err) {
        console.error(err);
        const errorMsg = err.response?.data?.msg || "Gagal Verifikasi!";
        toast.error(errorMsg);
    } finally {
        setLoadingVerify(false);
    }
  };

  const handleUkmChange = (e) => {
    const ukmId = parseInt(e.target.value);
    const selected = UKM_PRESETS.find(u => u.id === ukmId);
    if (selected) loadPreset(selected);
  };
  const handleChange = (e) => setForm({...form, [e.target.name]: e.target.value});
  const handleHeaderChange = (e) => setHeaderData({...headerData, [e.target.name]: e.target.value});
  const handleRichChange = (field, val) => setForm({...form, [field]: val});
  const handleSignatoryChange = (id, field, value) => setForm(prev => ({ ...prev, signatories: prev.signatories.map(s => s.id === id ? { ...s, [field]: value } : s) }));
  const addSignatory = () => setForm(prev => ({ ...prev, signatories: [...prev.signatories, { id: Date.now(), jabatan: 'Jabatan', nama: '(Nama)', nia: 'NIA. -' }] }));
  const removeSignatory = (id) => setForm(prev => ({ ...prev, signatories: prev.signatories.filter(s => s.id !== id) }));
  const handlePrint = () => window.print();
  const paperDimensions = { 'A4': { width: '210mm', height: '297mm' }, 'F4': { width: '215mm', height: '330mm' } };

  if (!isVerified) {
    return (
        <div className="fixed inset-0 z-50 bg-gray-100 flex items-center justify-center p-4">
            <div className="bg-white max-w-md w-full rounded-2xl shadow-2xl p-8 border border-gray-200 text-center animate-in zoom-in-95">
                <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-600">
                    <ShieldCheck size={32} />
                </div>
                <h2 className="text-2xl font-black text-gray-900 mb-2">Verifikasi Keamanan</h2>
                <p className="text-gray-500 text-sm mb-6">
                    Masukkan akun Anda untuk membuka akses <b>Letter Generator</b>.
                </p>
                <form onSubmit={handleVerify} className="space-y-4 text-left">
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Username / Email</label>
                        <div className="relative mt-1">
                            <User className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type="text" 
                                placeholder="username" 
                                className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition font-bold text-gray-800"
                                value={authInput}
                                onChange={(e) => setAuthInput(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div>
                        <label className="text-xs font-bold text-gray-500 uppercase ml-1">Password</label>
                        <div className="relative mt-1">
                            <Lock className="absolute left-3 top-3.5 text-gray-400" size={18} />
                            <input 
                                type={showPassword ? "text" : "password"} 
                                placeholder="******" 
                                className="w-full pl-10 pr-10 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 outline-none transition font-bold"
                                value={passwordInput}
                                onChange={(e) => setPasswordInput(e.target.value)}
                                required
                            />
                            <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-3 top-3.5 text-gray-400 hover:text-gray-600">
                                {showPassword ? <EyeOff size={18}/> : <Eye size={18}/>}
                            </button>
                        </div>
                    </div>
                    <button 
                        type="submit" 
                        disabled={loadingVerify}
                        className="w-full bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 rounded-xl shadow-lg shadow-blue-200 transition active:scale-95 flex justify-center gap-2 mt-4"
                    >
                        {loadingVerify ? 'Memeriksa...' : 'Buka Generator'}
                    </button>
                    <button type="button" onClick={() => navigate('/admin-dashboard')} className="w-full text-center text-sm text-gray-400 hover:text-gray-600 font-bold mt-4">Kembali ke Dashboard</button>
                </form>
            </div>
        </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row h-screen bg-gray-100 font-sans text-gray-900 overflow-hidden">
      
      <div className="w-full lg:w-[420px] bg-white border-r border-gray-300 flex flex-col h-1/2 lg:h-full print:hidden shadow-xl z-20 order-2 lg:order-1">
        <div className="p-4 border-b border-gray-200 flex justify-between items-center bg-gray-50 sticky top-0 z-10">
            <h2 className="text-lg font-black text-gray-800 flex items-center gap-2"><FileText className="text-blue-600" size={20}/> Generator</h2>
            <div className="flex gap-2">
                <button onClick={() => setShowSettings(!showSettings)} className="p-2 rounded-lg hover:bg-gray-200 text-gray-600"><Settings size={20} /></button>
                <button onClick={handlePrint} className="bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded-lg font-bold text-xs flex items-center gap-2 shadow-lg"><Printer size={16}/> Print</button>
            </div>
        </div>

        <div className="flex-1 overflow-y-auto p-5 space-y-6 custom-scrollbar">
            {showSettings && (
                <div className="bg-blue-50 p-4 rounded-xl border border-blue-100 space-y-4 mb-4 shadow-inner">
                    <div className="flex justify-between items-center"><h3 className="text-xs font-bold text-blue-800 uppercase flex items-center gap-1"><Settings size={12}/> Layout Settings</h3><button onClick={() => setShowSettings(false)}><X size={14} className="text-blue-400"/></button></div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="lbl"><Layout size={12}/> Kertas</label><select value={settings.paperSize} onChange={(e) => setSettings({...settings, paperSize: e.target.value})} className="input-field-sm w-full cursor-pointer"><option value="A4">A4 (Standar)</option><option value="F4">F4 (Folio)</option></select></div>
                        <div><label className="lbl"><Type size={12}/> Font</label><select value={settings.fontFamily} onChange={(e) => setSettings({...settings, fontFamily: e.target.value})} className="input-field-sm w-full cursor-pointer"><option value="Times New Roman">Times New Roman</option><option value="Arial">Arial</option><option value="Calibri">Calibri</option><option value="Georgia">Georgia</option></select></div>
                    </div>
                    <div className="grid grid-cols-2 gap-3">
                        <div><label className="lbl">Size (pt)</label><input type="number" value={settings.fontSize} onChange={(e) => setSettings({...settings, fontSize: Number(e.target.value)})} className="input-field-sm"/></div>
                        <div><label className="lbl">Line Height</label><input type="number" step="0.1" value={settings.lineHeight} onChange={(e) => setSettings({...settings, lineHeight: Number(e.target.value)})} className="input-field-sm"/></div>
                        <div><label className="lbl">Margin Atas (mm)</label><input type="number" value={settings.marginTop} onChange={(e) => setSettings({...settings, marginTop: Number(e.target.value)})} className="input-field-sm"/></div>
                        <div><label className="lbl">Margin Bawah</label><input type="number" value={settings.marginBottom} onChange={(e) => setSettings({...settings, marginBottom: Number(e.target.value)})} className="input-field-sm"/></div>
                    </div>
                </div>
            )}

            <div className="space-y-4 pb-4 border-b border-gray-100">
                <div className="flex items-center gap-2 mb-2">
                    <Building2 size={16} className="text-blue-600"/>
                    <h3 className="text-sm font-bold text-gray-800 uppercase tracking-wider">Identitas Organisasi</h3>
                </div>
                
                {lockedUkmId ? (
                    <div className="bg-green-50 p-4 rounded-xl border border-green-200 flex items-center gap-3">
                        <div className="p-2 bg-white rounded-lg border border-green-100 shadow-sm">
                            <img src={headerData.logoUrl} className="w-8 h-8 object-contain" alt="Logo" />
                        </div>
                        <div className="flex-1">
                            <p className="text-xs text-green-600 font-bold uppercase tracking-wide flex items-center gap-1"><Lock size={10}/> Terkunci Otomatis</p>
                            <p className="text-sm font-black text-gray-800 leading-tight line-clamp-1">{headerData.orgName}</p>
                        </div>
                    </div>
                ) : (
                    <div className="bg-blue-50 p-3 rounded-lg border border-blue-100">
                        <label className="lbl text-blue-800 mb-2">Pilih Organisasi (Super Admin Mode)</label>
                        <select value={headerData.orgName === UKM_PRESETS.find(u => u.name === headerData.orgName)?.name ? UKM_PRESETS.find(u => u.name === headerData.orgName)?.id : undefined} onChange={handleUkmChange} className="w-full p-2.5 rounded-lg border border-blue-200 text-sm font-bold text-gray-800 focus:ring-2 focus:ring-blue-500 outline-none bg-white cursor-pointer shadow-sm">
                            {UKM_PRESETS.map(ukm => <option key={ukm.id} value={ukm.id}>{ukm.name}</option>)}
                        </select>
                    </div>
                )}

                <div className="space-y-2 mt-2">
                    <label className="lbl">Alamat (Kustomisasi)</label>
                    <textarea name="address" rows="2" value={headerData.address} onChange={handleHeaderChange} className="input-field resize-none text-xs" />
                </div>
            </div>

            <div className="space-y-5 pb-10">
                <div className="space-y-2"><Label>Detail Surat</Label><input name="nomor" placeholder="Nomor Surat" className="input-field" onChange={handleChange} /><input name="perihal" placeholder="Perihal" className="input-field" onChange={handleChange} /><div className="grid grid-cols-2 gap-2"><input name="lampiran" value={form.lampiran} placeholder="Lampiran" className="input-field" onChange={handleChange} /><input name="date" value={form.date} placeholder="Tanggal" className="input-field" onChange={handleChange} /></div></div>
                <div className="space-y-2"><Label>Penerima</Label><input name="tujuan" placeholder="Kepada Yth..." className="input-field" onChange={handleChange} /><input name="tempat" value={form.tempat} placeholder="Di Tempat" className="input-field" onChange={handleChange} /></div>
                <div className="space-y-2">
                    <div className="flex justify-between items-center"><Label>Isi Surat</Label><div className="flex items-center gap-2"><input type="checkbox" checked={form.useSalam} onChange={(e) => setForm({...form, useSalam: e.target.checked})} id="useSalam" /><label htmlFor="useSalam" className="text-xs text-gray-600 font-bold cursor-pointer">Pakai Salam</label></div></div>
                    <RichTextEditor label="Paragraf Pembuka" value={form.paragraf_pembuka} onChange={(val) => handleRichChange('paragraf_pembuka', val)} rows={3} />
                    <RichTextEditor label="Isi Utama" value={form.isi_utama} onChange={(val) => handleRichChange('isi_utama', val)} rows={5} />
                    <RichTextEditor label="Penutup" value={form.penutup} onChange={(val) => handleRichChange('penutup', val)} rows={2} />
                </div>
                <div className="space-y-3 pt-4 border-t border-gray-100">
                    <div className="flex justify-between items-center"><Label>Tanda Tangan</Label><button onClick={addSignatory} className="btn-add"><Plus size={14}/> Tambah</button></div>
                    <div className="space-y-3">{form.signatories.map((signer, index) => (<div key={signer.id} className="p-3 bg-gray-50 border border-gray-200 rounded-lg relative group transition hover:bg-white hover:shadow-sm"><button onClick={() => removeSignatory(signer.id)} className="absolute top-2 right-2 text-gray-400 hover:text-red-500 opacity-0 group-hover:opacity-100 transition"><Trash2 size={16}/></button><p className="text-[10px] font-bold text-gray-400 mb-1 uppercase">Posisi {index + 1}</p><input value={signer.jabatan} onChange={(e) => handleSignatoryChange(signer.id, 'jabatan', e.target.value)} className="input-field-xs font-bold mb-1" placeholder="Jabatan" /><input value={signer.nama} onChange={(e) => handleSignatoryChange(signer.id, 'nama', e.target.value)} className="input-field-xs mb-1" placeholder="Nama" /><input value={signer.nia} onChange={(e) => handleSignatoryChange(signer.id, 'nia', e.target.value)} className="input-field-xs" placeholder="NIA" /></div>))}</div>
                    <div className="pt-2"><div className="flex items-center gap-2 mb-2"><input type="checkbox" checked={form.useMengetahui} onChange={(e) => setForm({...form, useMengetahui: e.target.checked})} id="useMengetahui" /><label htmlFor="useMengetahui" className="text-xs font-extrabold text-blue-600 uppercase tracking-wider cursor-pointer flex items-center gap-1"><AlignCenter size={12}/> Ada Pihak Mengetahui?</label></div>{form.useMengetahui && <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg"><input value={form.mengetahui.jabatan} onChange={(e) => setForm({...form, mengetahui: {...form.mengetahui, jabatan: e.target.value}})} className="input-field-xs font-bold mb-1" placeholder="Jabatan (Tengah)" /><input value={form.mengetahui.nama} onChange={(e) => setForm({...form, mengetahui: {...form.mengetahui, nama: e.target.value}})} className="input-field-xs mb-1" placeholder="Nama Lengkap" /><input value={form.mengetahui.nia} onChange={(e) => setForm({...form, mengetahui: {...form.mengetahui, nia: e.target.value}})} className="input-field-xs" placeholder="NIA" /></div>}</div>
                </div>
            </div>
        </div>
      </div>

      <div className="flex-1 bg-gray-200 lg:p-8 p-4 overflow-auto flex justify-center items-start print:p-0 print:bg-white print:block print:overflow-visible order-1 lg:order-2 h-1/2 lg:h-full border-b lg:border-b-0 border-gray-300">
        <div id="printable-content" className="bg-white shadow-2xl print:shadow-none relative transition-all duration-300 transform origin-top" style={{ width: paperDimensions[settings.paperSize].width, minHeight: paperDimensions[settings.paperSize].height, paddingTop: `${settings.marginTop}mm`, paddingBottom: `${settings.marginBottom}mm`, paddingLeft: '25mm', paddingRight: '25mm', fontSize: `${settings.fontSize}pt`, lineHeight: settings.lineHeight, fontFamily: settings.fontFamily, color: 'black' }}>
            
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none z-0 overflow-hidden">
                <img src={headerData.logoUrl} alt="Watermark" className="w-96 h-96 object-contain opacity-10 grayscale" />
            </div>
            
            <div className="relative z-10">
                <div className="flex items-center justify-center border-b-4 border-double border-black pb-4 mb-6 gap-4 px-4 h-28">
                    
                    <div className="w-24 h-24 flex items-center justify-center shrink-0">
                        {headerData.swapLogos ? (
                            <img src={logoStikom} alt="Logo Kampus" className="max-w-full max-h-full object-contain grayscale-0" />
                        ) : (
                            headerData.logoUrl ? <img src={headerData.logoUrl} alt="Logo UKM" className="max-w-full max-h-full object-contain" /> : <div className="w-full h-full border border-dashed border-gray-300 flex items-center justify-center text-[8px] text-gray-400">NO LOGO</div>
                        )}
                    </div>
                    
                    <div className="text-center flex-1">
                        {headerData.parentOrg && <h3 className="font-bold text-sm uppercase tracking-wider">{headerData.parentOrg}</h3>}
                        <h1 className="font-black text-2xl uppercase tracking-wide leading-none my-1 scale-y-110">{headerData.orgName}</h1>
                        <h2 className="font-bold text-lg uppercase leading-tight">{headerData.campus}</h2>
                        <p className="text-[10px] italic mt-1 leading-tight">{headerData.address}</p>
                    </div>

                    <div className="w-24 h-24 flex items-center justify-center shrink-0">
                        {headerData.swapLogos ? (
                             headerData.logoUrl ? <img src={headerData.logoUrl} alt="Logo UKM" className="max-w-full max-h-full object-contain" /> : null
                        ) : (
                            headerData.showCampusLogo ? (
                                <img src={logoStikom} alt="Logo Kampus" className="max-w-full max-h-full object-contain grayscale-0" />
                            ) : null
                        )}
                    </div>

                </div>

                <div className="flex justify-between items-start mb-6"><div className="w-1/2"><table className="w-full text-left table-fixed border-collapse"><tbody><tr><td className="w-20 align-top">Nomor</td><td className="w-2 align-top">:</td><td className="break-words">{form.nomor}</td></tr><tr><td className="w-20 align-top">Lampiran</td><td className="w-2 align-top">:</td><td className="break-words">{form.lampiran}</td></tr><tr><td className="w-20 align-top">Perihal</td><td className="w-2 align-top">:</td><td className="font-bold break-words">{form.perihal}</td></tr></tbody></table></div><div className="text-right w-1/3"><p>Cirebon, {form.date}</p></div></div>
                <div className="mb-6"><p>Yth.</p><p className="font-bold">{form.tujuan}</p><p>Di {form.tempat}</p></div>
                <div className="text-justify space-y-4 mb-8">{form.useSalam && <p>Assalamu'alaikum Wr. Wb.</p>}<p>Dengan hormat,</p><div className="indent-10" dangerouslySetInnerHTML={{ __html: form.paragraf_pembuka }} /><div className="indent-10" dangerouslySetInnerHTML={{ __html: form.isi_utama }} /><div className="indent-10" dangerouslySetInnerHTML={{ __html: form.penutup }} />{form.useSalam && <p className="mt-4">Wassalamu'alaikum Wr. Wb.</p>}</div>
                <div className="mt-10 w-full px-2">
                    <div className="flex flex-wrap justify-between gap-y-10">{form.signatories.map((signer, index) => { const isLastAndOdd = (index === form.signatories.length - 1) && (form.signatories.length % 2 !== 0); return (<div key={signer.id} className={`flex flex-col items-center mb-8 break-inside-avoid ${isLastAndOdd ? 'mx-auto w-full' : 'w-[45%]'}`}><p className="text-center">{signer.jabatan}</p><div className="h-24"></div><p className="font-bold underline text-center">{signer.nama}</p><p className="text-sm text-center">{signer.nia}</p></div>); })}</div>
                    {form.useMengetahui && <div className="flex flex-col items-center mt-4 w-full"><p className="text-center">Mengetahui,</p><p className="text-center">{form.mengetahui.jabatan}</p><div className="h-24"></div><p className="font-bold underline text-center">{form.mengetahui.nama}</p><p className="text-sm text-center">{form.mengetahui.nia}</p></div>}
                </div>
            </div>
        </div>
        <div className="fixed bottom-4 right-4 bg-black/80 text-white text-[10px] px-3 py-1.5 rounded-full shadow-lg print:hidden backdrop-blur-md z-30 lg:hidden">Geser untuk melihat kertas 👉</div>
      </div>
    </div>
  );
};

const css = `
  @media print { @page { margin: 0; } body { visibility: hidden; } #printable-content { visibility: visible; position: fixed; left: 0; top: 0; width: 100%; height: 100%; z-index: 9999; background: white; margin: 0; padding: 0; overflow: visible; } #printable-content * { visibility: visible; } .print\\:hidden { display: none !important; } }
  .lbl { font-size: 0.75rem; font-weight: 800; color: #9ca3af; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 0.25rem; display: block; }
  .input-field { width: 100%; padding: 10px; background: #fff; border: 1px solid #d1d5db; border-radius: 8px; font-size: 14px; outline: none; color: #000; }
  .input-field:focus { border-color: #2563eb; ring: 2px solid rgba(37,99,235,0.1); }
  .input-field-sm { width: 100%; padding: 6px; border: 1px solid #d1d5db; border-radius: 6px; font-size: 12px; }
  .input-field-xs { width: 100%; padding: 4px 8px; border: 1px solid #e5e7eb; border-radius: 4px; font-size: 12px; background: transparent; }
  .input-field-xs:focus { background: white; border-color: #2563eb; }
  .btn-add { font-size: 11px; background: #dcfce7; color: #166534; padding: 4px 10px; border-radius: 6px; font-weight: 700; display: flex; align-items: center; gap: 4px; transition: all; }
  .btn-add:hover { background: #bbf7d0; }
  .custom-scrollbar::-webkit-scrollbar { width: 6px; }
  .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
  .custom-scrollbar::-webkit-scrollbar-thumb { background: #d1d5db; border-radius: 10px; }
`;

const Label = ({ children }) => <label className="lbl">{children}</label>;

export default () => <><style>{css}</style><LetterGenerator /></>;
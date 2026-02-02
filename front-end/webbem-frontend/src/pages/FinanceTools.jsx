import React, { useState } from 'react';
import { 
  Plus, Trash2, DollarSign, Archive, PenTool, Calendar, AlignLeft, TrendingUp, TrendingDown 
} from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import api from '../api/axios';
import { toast } from 'sonner';

const FinanceTools = () => {
  const [activeTab, setActiveTab] = useState('finance'); 
  const [loading, setLoading] = useState(false);

  const [financeTitle, setFinanceTitle] = useState(`Laporan Keuangan - ${new Date().toLocaleDateString('id-ID')}`);
  const [rows, setRows] = useState([
    { date: '', desc: '', income: '', expense: '' }
  ]);

  const calculateDataWithBalance = () => {
    let currentBalance = 0;
    return rows.map(row => {
      const inc = parseFloat(row.income) || 0;
      const exp = parseFloat(row.expense) || 0;
      currentBalance = currentBalance + inc - exp;
      return { ...row, balance: currentBalance };
    });
  };

  const handleAddRow = () => {
    setRows([...rows, { date: '', desc: '', income: '', expense: '' }]);
  };

  const handleRemoveRow = (index) => {
    const newRows = [...rows];
    newRows.splice(index, 1);
    setRows(newRows);
  };

  const handleRowChange = (index, field, value) => {
    const newRows = [...rows];
    newRows[index][field] = value;
    setRows(newRows);
  };

  const [noteTitle, setNoteTitle] = useState('');
  const [noteContent, setNoteContent] = useState('');

  const handleSaveToArchive = async (type) => {
    setLoading(true);
    const toastId = toast.loading("Sedang membuat dokumen PDF...");

    try {
      const doc = new jsPDF();
      let blob;
      let rawFilename;
      let folderName;

      if (type === 'finance') {
        doc.text(financeTitle, 14, 15);
        doc.setFontSize(10);
        doc.text(`Dibuat pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);

        const tableData = calculateDataWithBalance();
        const tableRows = tableData.map(row => [
          row.date, 
          row.desc, 
          row.income ? `Rp ${Number(row.income).toLocaleString('id-ID')}` : '-', 
          row.expense ? `Rp ${Number(row.expense).toLocaleString('id-ID')}` : '-', 
          `Rp ${Number(row.balance).toLocaleString('id-ID')}`
        ]);

        autoTable(doc, {
          startY: 25,
          head: [['Tanggal', 'Keterangan', 'Pemasukan', 'Pengeluaran', 'Saldo']],
          body: tableRows,
          theme: 'grid',
          headStyles: { fillColor: [37, 99, 235] },
          styles: { fontSize: 8, cellPadding: 2 }
        });

        const finalBalance = tableData.length > 0 ? tableData[tableData.length - 1].balance : 0;
        doc.setFontSize(12);
        doc.text(`Sisa Saldo Akhir: Rp ${finalBalance.toLocaleString('id-ID')}`, 14, doc.lastAutoTable.finalY + 10);

        blob = doc.output('blob');
        rawFilename = financeTitle;
        folderName = "Keuangan";

      } else {
        if (!noteTitle || !noteContent) throw new Error("Judul dan isi tidak boleh kosong");
        
        doc.setFontSize(16);
        doc.text(noteTitle, 14, 15);
        doc.setFontSize(10);
        doc.text(`Dibuat pada: ${new Date().toLocaleString('id-ID')}`, 14, 22);
        
        doc.setFontSize(12);
        const splitText = doc.splitTextToSize(noteContent, 180);
        doc.text(splitText, 14, 30);

        blob = doc.output('blob');
        rawFilename = noteTitle;
        folderName = "Pencatatan Umum";
      }

      const safeFilename = rawFilename.toLowerCase().endsWith('.pdf') 
        ? rawFilename 
        : `${rawFilename}.pdf`;

      const formData = new FormData();
      formData.append('title', safeFilename);
      formData.append('category', folderName); 
      
      formData.append('file', blob, safeFilename);

      await api.post('/documents/auto-archive', formData, {
        headers: { 'Content-Type': 'multipart/form-data' }
      });

      toast.success('Berhasil diarsipkan ke E-Arsip!', { id: toastId });
      
      if (type === 'secretary') { setNoteTitle(''); setNoteContent(''); }

    } catch (err) {
      console.error("Archive Error:", err);
      toast.error(err.message || 'Gagal mengirim file. Cek koneksi internet.', { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 md:p-6 bg-gray-50 min-h-screen pb-32 md:pb-24 font-sans">
      <div className="max-w-6xl mx-auto">
        
        <div className="mb-6 md:mb-8 text-center md:text-left">
          <h1 className="text-2xl md:text-3xl font-black text-gray-900 mb-2">Pencatatan Digital</h1>
          <p className="text-gray-500 text-sm md:text-base italic">Konversi data otomatis ke PDF dan sinkronisasi ke Cloud Drive.</p>
        </div>

        <div className="flex gap-2 mb-6 bg-white p-1.5 rounded-xl w-full md:w-fit border border-gray-200 shadow-sm mx-auto md:mx-0">
          <button 
            onClick={() => setActiveTab('finance')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-all ${activeTab === 'finance' ? 'bg-blue-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <DollarSign size={18}/> Bendahara
          </button>
          <button 
            onClick={() => setActiveTab('secretary')}
            className={`flex-1 md:flex-none px-6 py-2.5 rounded-lg text-sm font-bold flex justify-center items-center gap-2 transition-all ${activeTab === 'secretary' ? 'bg-purple-600 text-white shadow-md' : 'text-gray-500 hover:bg-gray-100'}`}
          >
            <PenTool size={18}/> Sekretaris
          </button>
        </div>

        {activeTab === 'finance' ? (
          <div className="space-y-4 animate-in fade-in duration-500">
            <div className="bg-white p-5 rounded-2xl shadow-sm border border-gray-200 flex flex-col md:flex-row justify-between gap-4 items-center">
              <div className="w-full md:w-1/2">
                <label className="text-[10px] font-bold text-gray-400 uppercase tracking-widest block mb-1">Nama Laporan</label>
                <input 
                  value={financeTitle}
                  onChange={(e) => setFinanceTitle(e.target.value)}
                  className="w-full text-lg font-bold text-gray-800 border-b-2 border-transparent focus:border-blue-600 outline-none py-1 transition-colors"
                />
              </div>
              <button 
                onClick={() => handleSaveToArchive('finance')}
                disabled={loading}
                className="w-full md:w-auto bg-blue-600 hover:bg-blue-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 shadow-lg shadow-blue-200 transition-all active:scale-95"
              >
                <Archive size={18}/> {loading ? 'Mengirim...' : 'Arsip PDF'}
              </button>
            </div>

            <div className="hidden md:block bg-white rounded-2xl shadow-sm border border-gray-200 overflow-hidden">
              <table className="w-full text-left">
                <thead>
                  <tr className="bg-slate-50 border-b border-gray-200">
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase w-12 text-center">#</th>
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase w-44">Tanggal</th>
                    <th className="p-4 text-[10px] font-bold text-gray-500 uppercase">Keterangan</th>
                    <th className="p-4 text-[10px] font-bold text-green-600 uppercase w-40 text-right">Masuk</th>
                    <th className="p-4 text-[10px] font-bold text-red-600 uppercase w-40 text-right">Keluar</th>
                    <th className="p-4 text-[10px] font-bold text-blue-600 uppercase w-40 text-right">Saldo</th>
                    <th className="p-4 w-12"></th>
                  </tr>
                </thead>
                <tbody>
                  {calculateDataWithBalance().map((row, index) => (
                    <tr key={index} className="border-b border-gray-100 hover:bg-slate-50 transition-colors">
                      <td className="p-4 text-center text-xs text-slate-300 font-bold">{index + 1}</td>
                      <td className="p-2"><input type="date" value={row.date} onChange={(e) => handleRowChange(index, 'date', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" /></td>
                      <td className="p-2"><input type="text" value={row.desc} onChange={(e) => handleRowChange(index, 'desc', e.target.value)} className="w-full p-2 border border-slate-200 rounded-lg text-sm" placeholder="Keterangan..." /></td>
                      <td className="p-2"><input type="number" value={row.income} onChange={(e) => handleRowChange(index, 'income', e.target.value)} className="w-full p-2 bg-green-50/30 border-green-100 text-green-700 font-bold rounded-lg text-sm text-right" /></td>
                      <td className="p-2"><input type="number" value={row.expense} onChange={(e) => handleRowChange(index, 'expense', e.target.value)} className="w-full p-2 bg-red-50/30 border-red-100 text-red-700 font-bold rounded-lg text-sm text-right" /></td>
                      <td className="p-4 text-sm font-black text-slate-700 text-right">{row.balance.toLocaleString('id-ID')}</td>
                      <td className="p-2 text-center">
                        <button onClick={() => handleRemoveRow(index)} className="text-slate-300 hover:text-red-500"><Trash2 size={18}/></button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="md:hidden space-y-4">
              {calculateDataWithBalance().map((row, index) => (
                <div key={index} className="bg-white p-4 rounded-2xl border border-gray-200 shadow-sm space-y-3 relative">
                  <div className="flex justify-between items-center">
                    <span className="text-[10px] font-black bg-slate-100 text-slate-500 px-2 py-0.5 rounded">ITEM #{index + 1}</span>
                    <button onClick={() => handleRemoveRow(index)} className="text-red-400"><Trash2 size={16}/></button>
                  </div>
                  <input type="date" value={row.date} onChange={(e) => handleRowChange(index, 'date', e.target.value)} className="w-full p-2 bg-slate-50 border rounded-xl text-sm font-bold" />
                  <textarea value={row.desc} onChange={(e) => handleRowChange(index, 'desc', e.target.value)} className="w-full p-3 border rounded-xl text-sm" placeholder="Uraian..." rows={2} />
                  <div className="grid grid-cols-2 gap-3">
                    <div className="bg-green-50 p-2 rounded-xl border border-green-100">
                      <label className="text-[8px] font-bold text-green-600 block uppercase">Masuk</label>
                      <input type="number" value={row.income} onChange={(e) => handleRowChange(index, 'income', e.target.value)} className="w-full bg-transparent font-black text-green-700 text-sm outline-none" placeholder="0" />
                    </div>
                    <div className="bg-red-50 p-2 rounded-xl border border-red-100">
                      <label className="text-[8px] font-bold text-red-600 block uppercase">Keluar</label>
                      <input type="number" value={row.expense} onChange={(e) => handleRowChange(index, 'expense', e.target.value)} className="w-full bg-transparent font-black text-red-700 text-sm outline-none" placeholder="0" />
                    </div>
                  </div>
                  <div className="flex justify-between items-center pt-2 border-t text-sm">
                    <span className="font-bold text-slate-400">SALDO</span>
                    <span className="font-black text-blue-600">Rp {row.balance.toLocaleString('id-ID')}</span>
                  </div>
                </div>
              ))}
            </div>

            <button onClick={handleAddRow} className="w-full py-5 border-2 border-dashed border-slate-300 rounded-2xl text-slate-400 font-bold hover:bg-white hover:border-blue-500 hover:text-blue-500 transition-all flex justify-center items-center gap-2 group">
              <Plus size={20} className="group-hover:scale-125 transition-transform"/> Tambah Transaksi
            </button>
          </div>
        ) : (
          <div className="bg-white rounded-3xl shadow-sm border border-gray-200 p-6 md:p-8 space-y-6 animate-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col md:flex-row justify-between items-center gap-4 border-b pb-6">
              <div>
                <h2 className="text-xl font-black text-slate-800">Notulensi Digital</h2>
                <p className="text-sm text-slate-400 italic">Arsipkan hasil rapat langsung ke E-Arsip dalam format PDF.</p>
              </div>
              <button 
                onClick={() => handleSaveToArchive('secretary')}
                disabled={loading}
                className="w-full md:w-auto bg-purple-600 hover:bg-purple-700 text-white px-8 py-3.5 rounded-xl font-bold text-sm flex justify-center items-center gap-2 shadow-lg transition-all active:scale-95"
              >
                <Archive size={18}/> {loading ? 'Archiving...' : 'Arsip Catatan'}
              </button>
            </div>
            <div className="space-y-5">
              <input 
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
                placeholder="Judul Catatan / Rapat"
                className="w-full p-4 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white outline-none font-bold text-lg transition-all"
              />
              <textarea 
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={15}
                placeholder="Tuliskan detail pembahasan rapat disini..."
                className="w-full p-5 rounded-2xl bg-slate-50 border-2 border-transparent focus:border-purple-500 focus:bg-white outline-none text-sm leading-relaxed transition-all resize-none"
              />
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FinanceTools;
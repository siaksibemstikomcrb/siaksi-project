import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';

export const downloadPDF = (ukmData) => {
  const doc = new jsPDF();

  doc.setFontSize(18);
  doc.text(`LAPORAN KEHADIRAN: ${ukmData.ukm_name.toUpperCase()}`, 14, 20);
  
  doc.setFontSize(11);
  doc.setTextColor(100);
  doc.text(`Ketua Umum: ${ukmData.leader_name}`, 14, 30);
  doc.text(`Tanggal Cetak: ${new Date().toLocaleDateString('id-ID')}`, 14, 35);

  const tableColumn = ["Nama Anggota", "NIA", "Hadir", "Telat", "Izin", "Alpa"];
  const tableRows = ukmData.members.map(member => [
    member.name,
    member.nia || '-',
    `${member.hadir}x`,
    `${member.telat}x`,
    `${member.izin}x`,
    `${member.alpa}x`,
  ]);

  autoTable(doc, {
    head: [tableColumn],
    body: tableRows,
    startY: 45,
    theme: 'grid',
    headStyles: { fillColor: [30, 41, 59], textColor: [255, 255, 255] },
    styles: { fontSize: 9 },
  });

  doc.save(`Laporan_${ukmData.ukm_name}.pdf`);
};
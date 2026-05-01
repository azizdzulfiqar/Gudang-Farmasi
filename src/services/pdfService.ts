import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { SuratPesanan, BAPB, Transaksi, AppSettings } from '../types';
import { format } from 'date-fns';
import { dataService } from './dataService';

const getHeader = (doc: jsPDF, settings: AppSettings) => {
  const pageWidth = doc.internal.pageSize.getWidth();
  
  if (settings.logoKlinik) {
    try {
      doc.addImage(settings.logoKlinik, 'PNG', 15, 10, 20, 20);
    } catch (e) {
      console.error('Error adding logo to PDF', e);
    }
  }

  // Header Klinik / RS Style
  doc.setFontSize(16);
  doc.setFont('helvetica', 'bold');
  doc.text(settings.namaKlinik.toUpperCase(), pageWidth / 2, 15, { align: 'center' });
  
  doc.setFontSize(9);
  doc.setFont('helvetica', 'normal');
  doc.text(settings.alamatKlinik, pageWidth / 2, 20, { align: 'center' });
  doc.text(`Telp: ${settings.teleponKlinik}`, pageWidth / 2, 24, { align: 'center' });
  
  // Double line under header
  doc.setLineWidth(0.5);
  doc.line(15, 28, pageWidth - 15, 28);
  doc.setLineWidth(0.1);
  doc.line(15, 29.5, pageWidth - 15, 29.5);
};

export const pdfService = {
  generateSPPDF: (sp: SuratPesanan) => {
    const doc = new jsPDF();
    const settings = dataService.getSettings();
    getHeader(doc, settings);
    
    // Document Title
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('SURAT PESANAN OBAT', 105, 40, { align: 'center' });
    doc.setFontSize(11);
    doc.text(`Nomor: ${sp.nomor}`, 105, 46, { align: 'center' });
    
    // Document Details
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    // Left side info
    doc.text('Tanggal Pesanan', 15, 60);
    doc.text(':', 45, 60);
    doc.text(format(new Date(sp.tanggal), 'dd MMMM yyyy'), 48, 60);
    
    doc.text('Metode Bayar', 15, 66);
    doc.text(':', 45, 66);
    doc.text('Kredit / Jatuh Tempo', 48, 66);
    
    // Right side (Supplier)
    doc.setFont('helvetica', 'bold');
    doc.text('Kepada Yth,', 130, 60);
    doc.text(sp.supplierNama, 130, 66);
    doc.setFont('helvetica', 'normal');
    doc.text('Distributor Farmasi Terkait', 130, 72);
    doc.text('Di Tempat', 130, 78);
    
    // Table content
    const body = sp.items.map((item, index) => [
      { content: (index + 1).toString(), styles: { halign: 'center' } },
      item.namaObat,
      { content: item.jumlah.toString(), styles: { halign: 'center' } },
      { content: item.satuan, styles: { halign: 'center' } },
      '' // Notes column
    ]);
    
    autoTable(doc, {
      startY: 90,
      head: [[
        { content: 'NO', styles: { halign: 'center' } }, 
        'NAMA SEDIAAN OBAT / ALAT KESEHATAN', 
        { content: 'JUMLAH', styles: { halign: 'center' } }, 
        { content: 'SATUAN', styles: { halign: 'center' } }, 
        'KETERANGAN'
      ]],
      body: body as any,
      theme: 'grid',
      headStyles: { 
        fillColor: [240, 240, 240], 
        textColor: [0, 0, 0], 
        fontStyle: 'bold',
        lineWidth: 0.1,
        lineColor: [200, 200, 200]
      },
      styles: {
        fontSize: 9,
        cellPadding: 3,
      },
      columnStyles: {
        0: { cellWidth: 10 },
        1: { cellWidth: 'auto' },
        2: { cellWidth: 25 },
        3: { cellWidth: 25 },
        4: { cellWidth: 40 }
      }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 15;
    
    // Notes footer
    doc.setFontSize(8);
    doc.setFont('helvetica', 'italic');
    doc.text('Catatan:', 15, finalY);
    doc.text('1. Mohon barang dikirim sesuai dengan pesanan di atas.', 15, finalY + 4);
    doc.text('2. Sertakan Faktur dan Surat Jalan pada saat pengiriman.', 15, finalY + 8);
    doc.text('3. Barang yang mendekati kadaluarsa (< 1 tahun) mohon dikonfirmasi.', 15, finalY + 12);
    
    // Signatures
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    const signatureY = finalY + 30;
    
    doc.text('Dipesan Oleh,', 25, signatureY);
    doc.text('Petugas Logistik', 25, signatureY + 5);
    doc.text('( ____________________ )', 20, signatureY + 35);
    
    doc.text('Mengetahui,', 145, signatureY);
    doc.text('Apoteker Penanggung Jawab', 145, signatureY + 5);
    doc.setFont('helvetica', 'bold');
    doc.text(`( ${settings.namaPenanggungJawab} )`, 140, signatureY + 35);
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(9);
    doc.text(`SIPA: ${settings.noSIPA}`, 140, signatureY + 40);
    
    // Footer page number
    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Halaman ${i} dari ${pageCount}`, 195, 285, { align: 'right' });
        doc.text(`Dicetak pada: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 15, 285);
    }
    
    doc.save(`SP_${sp.nomor}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  },

  generateNotaPDF: (tx: Transaksi) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [80, 150] // receipt printer style
    });
    const settings = dataService.getSettings();
    
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.namaKlinik, 40, 10, { align: 'center' });
    
    doc.setFontSize(7);
    doc.setFont('helvetica', 'normal');
    doc.text(settings.alamatKlinik, 40, 14, { align: 'center', maxWidth: 60 });
    doc.text(`Telp: ${settings.teleponKlinik}`, 40, 22, { align: 'center' });
    
    doc.setLineWidth(0.1);
    doc.line(5, 25, 75, 25);
    
    doc.setFontSize(8);
    doc.text(`No: ${tx.nomor}`, 5, 30);
    doc.text(`Tgl: ${format(new Date(tx.tanggal), 'dd/MM/yyyy')}`, 5, 34);
    doc.text(`Cust: ${tx.customerNama}`, 5, 38);
    if (tx.dokter) doc.text(`Dokt: ${tx.dokter}`, 5, 42);
    
    doc.line(5, 45, 75, 45);
    
    let y = 50;
    tx.items.forEach(item => {
      doc.setFont('helvetica', 'bold');
      doc.text(item.namaObat, 5, y);
      y += 4;
      
      doc.setFont('helvetica', 'normal');
      doc.setFontSize(7);
      if (item.aturanPakai || item.kadaluarsa) {
        let details = [];
        if (item.aturanPakai) details.push(item.aturanPakai);
        if (item.kadaluarsa) details.push(`ED: ${item.kadaluarsa}`);
        doc.text(details.join(' | '), 5, y);
        y += 4;
      }

      doc.text(`${item.jumlah} x Rp ${item.harga.toLocaleString()}`, 10, y);
      doc.text(item.subtotal.toLocaleString(), 75, y, { align: 'right' });
      y += 6;
      
      doc.setFontSize(8); // Reset size for next item name
      
      if (y > 130) {
        doc.addPage();
        y = 10;
      }
    });
    
    doc.line(5, y, 75, y);
    y += 6;
    doc.setFont('helvetica', 'bold');
    doc.text('TOTAL', 5, y);
    doc.text(`Rp ${tx.total.toLocaleString()}`, 75, y, { align: 'right' });
    
    y += 10;
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(7);
    doc.text('Terima Kasih Atas Kepercayaannya', 40, y, { align: 'center' });
    y += 4;
    doc.text('Semoga Cepat Sembuh', 40, y, { align: 'center' });
    y += 6;
    doc.text(`Penanggung Jawab: ${settings.namaPenanggungJawab}`, 40, y, { align: 'center' });

    doc.save(`Nota_${tx.nomor}.pdf`);
  },

  generateBAPBPDF: (bapb: BAPB) => {
    const doc = new jsPDF();
    const settings = dataService.getSettings();
    const pageWidth = doc.internal.pageSize.getWidth();
    getHeader(doc, settings);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text('BERITA ACARA PENERIMAAN BARANG (BAPB)', pageWidth / 2, 40, { align: 'center' });
    
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    doc.text(`No. BAPB`, 15, 55);
    doc.text(`: ${bapb.nomor}`, 45, 55);
    doc.text(`Tanggal`, 15, 60);
    doc.text(`: ${format(new Date(bapb.tanggal), 'dd MMMM yyyy')}`, 45, 60);
    
    doc.text(`Supplier`, 110, 55);
    doc.text(`: ${bapb.supplierNama}`, 140, 55);
    doc.text(`Ref. SP`, 110, 60);
    doc.text(`: ${bapb.nomorSP || '-'}`, 140, 60);
    
    autoTable(doc, {
      startY: 70,
      head: [['NO', 'KODE/BATCH', 'NAMA SEDIAAN', 'EXPIRED', 'QTY', 'SATUAN', 'LOKASI']],
      body: bapb.items.map((it, idx) => [
        idx + 1,
        it.batch,
        it.namaObat,
        it.kadaluarsa,
        it.jumlah,
        it.satuan,
        it.lokasiNama
      ]),
      theme: 'grid',
      headStyles: { fillColor: [60, 60, 60] }
    });
    
    const finalY = (doc as any).lastAutoTable.finalY + 20;
    
    doc.text('Penerima,', 30, finalY);
    doc.text('( ____________________ )', 20, finalY + 25);
    
    doc.text('Mengetahui / Gudang,', 140, finalY);
    doc.text('( ____________________ )', 135, finalY + 25);

    doc.save(`BAPB_${bapb.nomor}.pdf`);
  },

  generateLabelPDF: (obatNama: string, aturanPakai: string, customerNama: string, exp: string) => {
    const doc = new jsPDF({
      unit: 'mm',
      format: [50, 40] // standard sticker label size
    });
    const settings = dataService.getSettings();

    // Top Clinic Name
    doc.setFontSize(8);
    doc.setFont('helvetica', 'bold');
    doc.text(settings.namaKlinik, 25, 6, { align: 'center' });
    
    doc.setLineWidth(0.1);
    doc.line(5, 8, 45, 8);

    // Patient
    doc.setFontSize(6);
    doc.text(`Pasien: ${customerNama}`, 5, 12);
    
    // Drug
    doc.setFontSize(8);
    doc.text(obatNama, 5, 17, { maxWidth: 40 });

    // Usage instruction (The most important part)
    doc.setFillColor(37, 99, 235); // primary color
    doc.roundedRect(5, 20, 40, 10, 2, 2, 'F');
    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(aturanPakai || "Sesuai Petunjuk", 25, 26.5, { align: 'center' });

    // Footer
    doc.setTextColor(0, 0, 0);
    doc.setFontSize(5);
    doc.text(`Tgl: ${format(new Date(), 'dd/MM/yy')}`, 5, 34);
    if (exp) doc.text(`EXP: ${exp}`, 30, 34);
    
    doc.setFontSize(6);
    doc.text(`Keluarkan Oleh FarmasiEase`, 25, 38, { align: 'center' });

    doc.save(`Label_${obatNama.replace(/\s+/g, '_')}.pdf`);
  },

  generateTablePDF: (title: string, headers: string[], body: any[][], footer?: string[]) => {
    const doc = new jsPDF({ orientation: 'landscape' });
    const settings = dataService.getSettings();
    const pageWidth = doc.internal.pageSize.getWidth();
    getHeader(doc, settings);
    
    doc.setFontSize(14);
    doc.setFont('helvetica', 'bold');
    doc.text(title.toUpperCase(), pageWidth / 2, 40, { align: 'center' });
    
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text(`Dicetak pada: ${format(new Date(), 'dd/MM/yyyy HH:mm:ss')}`, 15, 48);

    autoTable(doc, {
      startY: 52,
      head: [headers],
      body: body,
      theme: 'grid',
      headStyles: { fillColor: [40, 40, 40], fontSize: 8 },
      styles: { fontSize: 7 },
      foot: footer ? [footer] : undefined,
      footStyles: { fillColor: [40, 40, 40], fontSize: 8, fontStyle: 'bold' }
    });

    const pageCount = (doc as any).internal.getNumberOfPages();
    for (let i = 1; i <= pageCount; i++) {
        doc.setPage(i);
        doc.setFontSize(8);
        doc.text(`Halaman ${i} dari ${pageCount}`, pageWidth - 15, 200, { align: 'right' });
    }

    doc.save(`${title.replace(/\s+/g, '_')}_${format(new Date(), 'yyyyMMdd')}.pdf`);
  }
};

import React from 'react';
import { 
  Plus, 
  FileText, 
  Edit, 
  Trash2, 
  Printer, 
  Eye, 
  X, 
  User, 
  Stethoscope, 
  ShoppingBag,
  Calendar,
  Save,
  PlusSquare,
  PlusCircle,
  CheckCircle,
  Tag,
  Brain
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { SearchableSelect } from '@/components/SearchableSelect';
import { dataService } from '@/services/dataService';
import { Transaksi, TransaksiItem, Obat, Customer, Dokter } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';

import { pdfService } from '@/services/pdfService';
import { DataTable, Column } from '@/components/DataTable';
import ClinicalCheck, { ClinicalCheckContent } from '@/components/ClinicalCheck';
import { GoogleGenAI } from "@google/genai";

export default function TransaksiPeresepan() {
  const [items, setItems] = React.useState<Transaksi[]>([]);
  const [obats, setObats] = React.useState<Obat[]>([]);
  const [customers, setCustomers] = React.useState<Customer[]>([]);
  const [dokters, setDokters] = React.useState<Dokter[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isClinicalCheckOpen, setIsClinicalCheckOpen] = React.useState(false);
  const [selectedTx, setSelectedTx] = React.useState<Transaksi | null>(null);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  // Clinical Check State (local to handle side panel)
  const [analysis, setAnalysis] = React.useState<string>('');
  const [analysisLoading, setAnalysisLoading] = React.useState(false);
  const [analysisSeverity, setAnalysisSeverity] = React.useState<'low' | 'medium' | 'high' | 'none'>('none');

  const runAnalysis = async () => {
    const drugs = formData.items.map(i => i.namaObat);
    if (drugs.length === 0) return;
    setAnalysisLoading(true);
    setAnalysis('');
    
    try {
      const apiKey = (process.env.GEMINI_API_KEY2 && process.env.GEMINI_API_KEY2 !== 'undefined') 
        ? process.env.GEMINI_API_KEY2 
        : process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'undefined') {
        throw new Error("GEMINI_API_KEY_MISSING");
      }
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        As a clinical pharmacist assistant, analyze the following list of medications:
        Medications: ${drugs.join(', ')}
        
        Please provide:
        1. Potential Drug-Drug Interactions (if any)
        2. Contraindications or warnings
        3. Simple advice for the patient
        
        Final verdict must be clear: [SAFE], [CAUTION], or [DANGER].
        Keep the response professional, concise, and in Indonesian.
        Format with markdown.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || '';
      setAnalysis(text);

      if (text.includes('[DANGER]') || text.includes('DANGER') || text.includes('BAHAYA')) {
        setAnalysisSeverity('high');
      } else if (text.includes('[CAUTION]') || text.includes('PERINGATAN')) {
        setAnalysisSeverity('medium');
      } else {
        setAnalysisSeverity('low');
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
      setAnalysis("Maaf, terjadi kesalahan saat melakukan analisis klinis. Pastikan API Key diatur.");
      setAnalysisSeverity('high');
    } finally {
      setAnalysisLoading(false);
    }
  };

  React.useEffect(() => {
    if (isClinicalCheckOpen && !analysis && formData.items.length > 0) {
      runAnalysis();
    }
  }, [isClinicalCheckOpen]);

  // Form State
  const [formData, setFormData] = React.useState({
    nomor: '',
    tanggal: format(new Date(), 'yyyy-MM-dd'),
    customerId: '',
    customerNama: '',
    dokter: '',
    items: [] as TransaksiItem[]
  });

  const [editingIndex, setEditingIndex] = React.useState<number | null>(null);

  // Current Item Form
  const [currentItem, setCurrentItem] = React.useState({
    obatId: '',
    jumlah: 1,
    aturanPakai: '',
    kadaluarsa: ''
  });

  const [availableBatches, setAvailableBatches] = React.useState<{batch: string, kadaluarsa: string}[]>([]);

  React.useEffect(() => {
    if (currentItem.obatId) {
      const batches = dataService.getObatBatches(currentItem.obatId);
      setAvailableBatches(batches);
    } else {
      setAvailableBatches([]);
    }
  }, [currentItem.obatId]);

  React.useEffect(() => {
    loadData();
    setObats(dataService.getObat());
    setCustomers(dataService.getCustomers());
    setDokters(dataService.getDokter());
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const all = dataService.getTransaksi();
      setItems(all.filter(t => t.tipe === 'Peresepan').sort((a, b) => b.created_at - a.created_at));
      setIsLoading(false);
    }, 500);
  };

  const generateNomor = () => {
    const date = new Date();
    const prefix = 'TXP';
    const stamp = format(date, 'yyyyMMdd');
    const random = Math.floor(1000 + Math.random() * 9000);
    return `${prefix}-${stamp}-${random}`;
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({
      nomor: generateNomor(),
      tanggal: format(new Date(), 'yyyy-MM-dd'),
      customerId: '',
      customerNama: '',
      dokter: '',
      items: []
    });
    setIsDialogOpen(true);
  };

  const handleEdit = (tx: Transaksi) => {
    setEditingId(tx.id);
    setFormData({
      nomor: tx.nomor,
      tanggal: tx.tanggal,
      customerId: tx.customerId || '',
      customerNama: tx.customerNama || '',
      dokter: tx.dokter || '',
      items: tx.items
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Hapus Transaksi?',
      text: 'Apakah Anda yakin ingin menghapus transaksi ini? Stok akan dikembalikan.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        dataService.deleteTransaksi(id);
        toast.success('Transaksi berhasil dihapus');
        loadData();
      }
    });
  };

  const handleAddItem = () => {
    const obat = obats.find(o => o.id === currentItem.obatId);
    if (!obat) return;

    if (obat.stokTotal < currentItem.jumlah) {
      toast.error(`Stok tidak mencukupi. Sisa stok: ${obat.stokTotal}`);
      return;
    }

    if (editingIndex !== null) {
      const updatedItems = [...formData.items];
      updatedItems[editingIndex] = {
        ...updatedItems[editingIndex],
        obatId: obat.id,
        namaObat: obat.nama,
        jumlah: currentItem.jumlah,
        harga: obat.hargaJual,
        subtotal: obat.hargaJual * currentItem.jumlah,
        aturanPakai: currentItem.aturanPakai,
        kadaluarsa: currentItem.kadaluarsa
      };
      setFormData({ ...formData, items: updatedItems });
      setEditingIndex(null);
      toast.success('Item diperbarui');
    } else {
      const newItem: TransaksiItem = {
        obatId: obat.id,
        namaObat: obat.nama,
        jumlah: currentItem.jumlah,
        harga: obat.hargaJual,
        subtotal: obat.hargaJual * currentItem.jumlah,
        aturanPakai: currentItem.aturanPakai,
        kadaluarsa: currentItem.kadaluarsa
      };

      setFormData({
        ...formData,
        items: [...formData.items, newItem]
      });
    }
    setCurrentItem({ obatId: '', jumlah: 1, aturanPakai: '', kadaluarsa: '' });
  };

  const handleEditItem = (index: number) => {
    const item = formData.items[index];
    setCurrentItem({
      obatId: item.obatId,
      jumlah: item.jumlah,
      aturanPakai: item.aturanPakai || '',
      kadaluarsa: item.kadaluarsa || ''
    });
    setEditingIndex(index);
  };

  const handleCancelEdit = () => {
    setEditingIndex(null);
    setCurrentItem({ obatId: '', jumlah: 1, aturanPakai: '', kadaluarsa: '' });
  };

  const handleRemoveItem = (index: number) => {
    const newItems = [...formData.items];
    newItems.splice(index, 1);
    setFormData({ ...formData, items: newItems });
  };

  const calculateTotal = () => formData.items.reduce((acc, curr) => acc + curr.subtotal, 0);

  const handleSave = () => {
    if (formData.items.length === 0) {
      toast.error('Tambahkan minimal satu obat');
      return;
    }
    if (!formData.customerId) {
        toast.error('Pilih Customer');
        return;
    }

    const customer = customers.find(c => c.id === formData.customerId);

    const payload = {
      ...formData,
      customerNama: customer?.nama || '',
      tipe: 'Peresepan' as const,
      total: calculateTotal(),
      created_at: editingId ? items.find(i => i.id === editingId)!.created_at : Date.now()
    };

    if (editingId) {
      dataService.updateTransaksi(editingId, payload);
      toast.success('Transaksi diperbarui');
    } else {
      dataService.addTransaksi(payload);
      toast.success('Transaksi berhasil disimpan');
    }

    setIsDialogOpen(false);
    loadData();
  };

  const handleViewDetail = (tx: Transaksi) => {
    setSelectedTx(tx);
    setIsDetailOpen(true);
  };

  const handlePrint = (tx: Transaksi) => {
    toast.info(`Mencetak Nota ${tx.nomor}...`);
    pdfService.generateNotaPDF(tx);
  };

  const columns: Column<Transaksi>[] = [
    { 
      header: 'No. Nota', 
      accessorKey: 'nomor', 
      className: 'font-mono text-xs font-bold text-primary' 
    },
    { 
      header: 'Tanggal', 
      cell: (item) => format(new Date(item.tanggal), 'dd MMM yyyy'),
      className: 'text-sm'
    },
    { 
      header: 'Customer / Pasien',
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-semibold text-sm">{item.customerNama}</span>
          <span className="text-[10px] text-muted-foreground flex items-center gap-1">
            <Stethoscope size={10} /> {item.dokter || 'Tanpa Dokter'}
          </span>
        </div>
      )
    },
    { 
      header: 'Total Transaksi', 
      align: 'right',
      className: 'font-black text-emerald-700',
      cell: (item) => `Rp ${item.total.toLocaleString()}`
    },
    {
      header: 'Aksi',
      align: 'center',
      cell: (item) => (
        <div className="flex justify-center gap-2">
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => handleViewDetail(item)}>
            <Eye size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(item)}>
            <Edit size={16} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-rose-600" onClick={() => handleDelete(item.id)}>
            <Trash2 size={16} />
          </Button>
          <Button variant="outline" size="icon" className="h-8 w-8" onClick={() => handlePrint(item)}>
            <Printer size={16} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Transaksi Peresepan</h1>
          <p className="text-muted-foreground mt-1">Penjualan obat resep dan obat bebas kepada pelanggan.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-sm bg-primary hover:bg-primary/90">
          <Plus size={18} /> Transaksi Baru
        </Button>
      </div>

      <DataTable 
        data={items} 
        columns={columns} 
        isLoading={isLoading}
        searchPlaceholder="Cari nomor nota atau nama customer..."
      />

      {/* Transaction Modal */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-none w-full h-full p-0 m-0 flex flex-col bg-white border-none rounded-none outline-none translate-x-0 translate-y-0 top-0 left-0 sm:max-w-none">
          <div className="flex-none p-4 md:p-6 border-b bg-muted/20">
            <DialogHeader>
              <div className="flex items-center justify-between gap-3 w-full">
                <div className="flex items-center gap-3">
                  <div className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center text-primary">
                     <ShoppingBag size={22} />
                  </div>
                  <div>
                    <DialogTitle className="text-xl">
                      {editingId ? 'Koreksi Transaksi' : 'Input Transaksi Baru'}
                    </DialogTitle>
                    <p className="text-xs text-muted-foreground">Lengkapi data resep dan item obat di bawah ini.</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <Button variant="outline" onClick={() => setIsDialogOpen(false)} className="h-10">Batal</Button>
                  <Button onClick={handleSave} className="h-10 gap-2 px-6 bg-primary font-bold shadow-lg shadow-primary/20">
                    <Save size={18} /> Simpan Transaksi
                  </Button>
                </div>
              </div>
            </DialogHeader>
          </div>
          
          <div className="flex-1 flex overflow-hidden w-full">
            <div className="flex-1 overflow-y-auto w-full">
              <div className="w-full px-4 md:px-10 py-6 space-y-8">
                {/* Form Header Info */}
                <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
                  <div className="space-y-4 lg:col-span-3 bg-muted/10 p-6 rounded-2xl border shadow-sm">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Nomor Nota</Label>
                        <Input value={formData.nomor} readOnly className="h-11 bg-white font-mono font-bold text-primary border-primary/20" />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Tanggal</Label>
                        <div className="relative">
                          <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                          <Input 
                            type="date" 
                            className="pl-9 h-11 shadow-sm" 
                            value={formData.tanggal} 
                            onChange={(e) => setFormData({...formData, tanggal: e.target.value})} 
                          />
                        </div>
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Pelanggan / Pasien</Label>
                        <SearchableSelect 
                          options={customers.map(c => ({ value: c.id, label: `${c.nama} (${c.kode})` }))}
                          value={formData.customerId}
                          onValueChange={(v) => setFormData({...formData, customerId: v})}
                          placeholder="Pilih pasien..."
                          className="h-11 shadow-sm w-full md:min-w-[200px]"
                        />
                      </div>
                      <div className="space-y-1.5">
                        <Label className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">Dokter</Label>
                        <SearchableSelect 
                          options={[
                            { value: "TANPA DOKTER", label: "-- TANPA DOKTER (UMUM) --" },
                            ...dokters.map(d => ({ value: d.nama, label: `${d.nama} (${d.spesialisasi})` }))
                          ]}
                          value={formData.dokter}
                          onValueChange={(v) => setFormData({...formData, dokter: v})}
                          placeholder="Pilih dokter..."
                          className="h-11 shadow-sm w-full md:min-w-[200px]"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Summary Section */}
                  <div className="bg-primary rounded-2xl p-6 flex flex-col justify-center relative overflow-hidden shadow-xl shadow-primary/20">
                    <div className="absolute -right-6 -top-6 text-white/10 rotate-12">
                       <ShoppingBag size={120} />
                    </div>
                    <div className="relative z-10 text-white">
                      <div className="text-[10px] font-black tracking-[0.2em] text-white/60 uppercase mb-1">Total Pembayaran</div>
                      <div className="flex items-baseline gap-1">
                        <span className="text-lg font-bold text-white/80">Rp</span>
                        <span className="text-4xl font-black tracking-tight">
                          {calculateTotal().toLocaleString()}
                        </span>
                      </div>
                      <div className="mt-4 pt-4 border-t border-white/10 flex justify-between items-center text-xs">
                         <span className="text-white/60 font-bold uppercase">Item</span>
                         <span className="font-black text-lg">{formData.items.length}</span>
                      </div>
                    </div>
                    {formData.items.length >= 2 && (
                      <Button 
                        onClick={() => {
                          if (isClinicalCheckOpen) {
                            setIsClinicalCheckOpen(false);
                          } else {
                            setIsClinicalCheckOpen(true);
                            if (!analysis) runAnalysis();
                          }
                        }}
                        variant="outline" 
                        className={cn(
                          "mt-3 w-full border-white/20 text-white hover:bg-white/20 h-10 rounded-xl gap-2 font-bold",
                          isClinicalCheckOpen ? "bg-white/30" : "bg-white/10"
                        )}
                      >
                        <Brain size={16} /> {isClinicalCheckOpen ? 'Tutup AI Check' : 'AI Clinical Check'}
                      </Button>
                    )}
                  </div>
                </div>

                {/* Items Section */}
                <div className="space-y-4">
                  <div className="flex items-center justify-between border-b pb-2">
                    <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                      <PlusSquare size={20} className="text-primary" /> Rincian Pengambilan Obat
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 lg:grid-cols-12 gap-3 bg-white p-6 rounded-2xl border-2 border-dashed border-muted shadow-sm">
                    <div className="lg:col-span-4 space-y-1.5">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase px-1">Obat</Label>
                      <SearchableSelect 
                        options={obats.map(o => ({ 
                          value: o.id, 
                          label: `${o.nama} (${o.kode}) - Rp ${o.hargaJual.toLocaleString()} - STOK: ${o.stokTotal}`,
                          disabled: o.stokTotal <= 0 
                        }))}
                        value={currentItem.obatId}
                        onValueChange={(v) => setCurrentItem({...currentItem, obatId: v})}
                        placeholder="Pilih obat..."
                        className="bg-muted/10 border-0 h-11 text-sm w-full"
                      />
                    </div>
                    <div className="lg:col-span-1 space-y-1.5">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase px-1 text-center block">Qty</Label>
                      <Input 
                        type="number" 
                        min="1" 
                        className="bg-muted/10 border-0 h-11 font-black text-center text-primary"
                        value={currentItem.jumlah} 
                        onChange={(e) => setCurrentItem({...currentItem, jumlah: parseInt(e.target.value) || 0})} 
                      />
                    </div>
                    <div className="lg:col-span-3 space-y-1.5">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase px-1">Aturan Pakai</Label>
                      <Input 
                        placeholder="cth: 3 x 1 sesudah makan"
                        className="bg-muted/10 border-0 h-11"
                        value={currentItem.aturanPakai} 
                        onChange={(e) => setCurrentItem({...currentItem, aturanPakai: e.target.value})} 
                      />
                    </div>
                    <div className="lg:col-span-2 space-y-1.5">
                      <Label className="text-[10px] font-black text-muted-foreground uppercase px-1">ED (MM/YY)</Label>
                      <div className="relative">
                        <Input 
                          placeholder="MM/YY"
                          className="bg-muted/10 border-0 h-11"
                          value={currentItem.kadaluarsa} 
                          onChange={(e) => setCurrentItem({...currentItem, kadaluarsa: e.target.value})} 
                          list="ed-suggestions"
                        />
                        <datalist id="ed-suggestions">
                          {availableBatches.map((b, i) => (
                            <option key={i} value={b.kadaluarsa}>
                              {b.kadaluarsa} (Batch: {b.batch})
                            </option>
                          ))}
                        </datalist>
                      </div>
                    </div>
                    <div className="lg:col-span-2 flex items-end gap-2">
                      <Button 
                        onClick={handleAddItem} 
                        disabled={!currentItem.obatId || currentItem.jumlah < 1} 
                        className={cn(
                          "w-full h-11 font-black shadow-lg shadow-primary/20 gap-2",
                          editingIndex !== null ? "bg-amber-500 hover:bg-amber-600" : "bg-primary hover:bg-primary/90"
                        )}
                      >
                        {editingIndex !== null ? <CheckCircle size={16} /> : <PlusCircle size={16} />} 
                        {editingIndex !== null ? 'UPDATE' : 'TAMBAH'}
                      </Button>
                      {editingIndex !== null && (
                        <Button 
                          variant="outline" 
                          size="icon"
                          onClick={handleCancelEdit} 
                          className="h-11 w-11 shrink-0 border-rose-200 text-rose-500 hover:bg-rose-50"
                        >
                          <X size={18} />
                        </Button>
                      )}
                    </div>
                  </div>

                  <div className="border border-muted rounded-2xl bg-white shadow-lg overflow-hidden">
                    <Table>
                       <TableHeader className="bg-muted/50 h-12">
                          <TableRow className="hover:bg-transparent">
                             <TableHead className="text-[10px] uppercase font-black px-6">Item Obat</TableHead>
                             <TableHead className="text-right text-[10px] uppercase font-black">Harga</TableHead>
                             <TableHead className="text-center w-[120px] text-[10px] uppercase font-black">Qty</TableHead>
                             <TableHead className="text-right text-[10px] uppercase font-black pr-6">Subtotal</TableHead>
                             <TableHead className="w-[80px]"></TableHead>
                          </TableRow>
                       </TableHeader>
                       <TableBody>
                          {formData.items.length === 0 ? (
                            <TableRow>
                              <TableCell colSpan={5} className="text-center py-20 text-muted-foreground">
                                 <div className="flex flex-col items-center gap-4 opacity-20">
                                    <ShoppingBag size={60} strokeWidth={1} />
                                    <p className="text-sm font-bold uppercase tracking-widest">List Belum Berisi Item</p>
                                 </div>
                              </TableCell>
                            </TableRow>
                          ) : (
                            <>
                              {formData.items.map((item, idx) => (
                                 <TableRow key={idx} className="group hover:bg-muted/10 transition-all">
                                    <TableCell className="px-6 py-4">
                                       <div className="font-bold text-sm text-gray-900">{item.namaObat}</div>
                                       <div className="flex items-center gap-3 mt-1">
                                         <div className="text-[10px] font-mono text-muted-foreground bg-muted px-1.5 py-0.5 rounded shadow-sm">
                                           {obats.find(o => o.id === item.obatId)?.kode}
                                         </div>
                                         {item.aturanPakai && (
                                           <div className="text-[10px] font-bold text-primary flex items-center gap-1">
                                             <FileText size={10} /> {item.aturanPakai}
                                           </div>
                                         )}
                                         {item.kadaluarsa && (
                                           <div className="text-[10px] font-bold text-rose-600 flex items-center gap-1">
                                             <Calendar size={10} /> ED: {item.kadaluarsa}
                                           </div>
                                         )}
                                       </div>
                                    </TableCell>
                                    <TableCell className="text-right text-xs font-medium text-gray-500">
                                       Rp {item.harga.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center">
                                       <span className="bg-primary/10 text-primary text-xs font-bold px-3 py-1 rounded-lg">
                                          {item.jumlah}
                                       </span>
                                    </TableCell>
                                    <TableCell className="text-right pr-6 font-bold text-sm text-primary">
                                       Rp {item.subtotal.toLocaleString()}
                                    </TableCell>
                                    <TableCell className="text-center px-6">
                                       <div className="flex justify-end gap-1 opacity-0 group-hover:opacity-100 transition-all">
                                         <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleEditItem(idx)}
                                            className="h-8 w-8 text-blue-600 hover:bg-blue-50"
                                         >
                                            <Edit size={14} />
                                         </Button>
                                         <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => pdfService.generateLabelPDF(item.namaObat, item.aturanPakai || '', formData.customerNama, item.kadaluarsa || '')}
                                            className="h-8 w-8 text-emerald-600 hover:bg-emerald-50"
                                            title="Cetak Etiket"
                                         >
                                            <Tag size={14} />
                                         </Button>
                                         <Button 
                                            variant="ghost" 
                                            size="icon" 
                                            onClick={() => handleRemoveItem(idx)}
                                            className="h-8 w-8 text-rose-500 hover:bg-rose-50"
                                         >
                                            <Trash2 size={14} />
                                         </Button>
                                       </div>
                                    </TableCell>
                                 </TableRow>
                              ))}
                              <TableRow className="bg-primary/[0.02] border-t-2">
                                 <TableCell colSpan={3} className="text-right py-6 px-6">
                                    <span className="text-xs font-bold uppercase text-muted-foreground">Subtotal Akhir</span>
                                  </TableCell>
                                 <TableCell className="text-right pr-6 py-6 font-black text-xl text-primary">
                                    Rp {calculateTotal().toLocaleString()}
                                 </TableCell>
                                 <TableCell></TableCell>
                              </TableRow>
                            </>
                          )}
                       </TableBody>
                    </Table>
                  </div>
                </div>
              </div>
            </div>

            {/* Side Panel Clinical Check */}
            {isClinicalCheckOpen && (
              <div className="w-[500px] border-l bg-slate-50 flex flex-col animate-in slide-in-from-right duration-500 shadow-2xl relative z-20">
                <div className="p-6 border-b flex items-center justify-between bg-white">
                   <div className="flex items-center gap-3">
                      <Brain className="text-primary" size={28} />
                      <h3 className="text-xl font-black">AI Clinical Insight</h3>
                   </div>
                   <Button variant="ghost" size="icon" onClick={() => setIsClinicalCheckOpen(false)}>
                      <X size={20} />
                   </Button>
                </div>
                <div className="flex-1 overflow-hidden">
                  <ClinicalCheckContent 
                    drugs={formData.items.map(i => i.namaObat)}
                    loading={analysisLoading}
                    analysis={analysis}
                    severity={analysisSeverity}
                    runAnalysis={runAnalysis}
                    onClose={() => setIsClinicalCheckOpen(false)}
                  />
                </div>
              </div>
            )}
          </div>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="max-w-2xl">
            <DialogHeader>
                <DialogTitle>Detail Transaksi</DialogTitle>
            </DialogHeader>
            {selectedTx && (
                <div className="space-y-4 py-2">
                    <div className="grid grid-cols-2 gap-4 text-sm bg-muted/50 p-3 rounded-lg border">
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Nomor</p>
                            <p className="font-mono font-bold text-primary">{selectedTx.nomor}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Tanggal</p>
                            <p className="font-bold">{format(new Date(selectedTx.tanggal), 'dd MMMM yyyy')}</p>
                        </div>
                        <div className="col-span-2 pt-2 border-t mt-2">
                            <p className="text-[10px] font-bold text-muted-foreground uppercase">Customer</p>
                            <p className="font-bold flex items-center gap-2"><User size={14} /> {selectedTx.customerNama}</p>
                        </div>
                        {selectedTx.dokter && (
                            <div className="col-span-2 pt-2">
                                <p className="text-[10px] font-bold text-muted-foreground uppercase">Dokter</p>
                                <p className="font-bold flex items-center gap-2"><Stethoscope size={14} /> {selectedTx.dokter}</p>
                            </div>
                        )}
                    </div>
                    
                    <div className="border rounded-lg overflow-hidden">
                        <Table>
                            <TableHeader className="bg-muted text-[10px] uppercase">
                                <TableRow>
                                    <TableHead>Item</TableHead>
                                    <TableHead className="text-right">Qty</TableHead>
                                    <TableHead className="text-right">Subtotal</TableHead>
                                </TableRow>
                            </TableHeader>
                            <TableBody>
                                {selectedTx.items.map((item, id) => (
                                    <TableRow key={id} className="text-xs">
                                        <TableCell>
                                          <div className="font-bold">{item.namaObat}</div>
                                          {(item.aturanPakai || item.kadaluarsa) && (
                                            <div className="flex gap-2 mt-0.5 opacity-70">
                                              {item.aturanPakai && <span>{item.aturanPakai}</span>}
                                              {item.kadaluarsa && <span>ED: {item.kadaluarsa}</span>}
                                            </div>
                                          )}
                                        </TableCell>
                                        <TableCell className="text-right">{item.jumlah}</TableCell>
                                        <TableCell className="text-right font-bold">Rp {item.subtotal.toLocaleString()}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </div>

                    <div className="flex justify-between items-center p-3 bg-emerald-50 border border-emerald-100 rounded-lg">
                        <span className="text-xs font-bold text-emerald-800">TOTAL AKHIR</span>
                        <span className="text-xl font-black text-emerald-700 font-mono">Rp {selectedTx.total.toLocaleString()}</span>
                    </div>

                    <div className="flex justify-end gap-2 pt-4">
                        <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Tutup</Button>
                        <Button className="gap-2" onClick={() => handlePrint(selectedTx)}>
                            <Printer size={16} /> Cetak Nota
                        </Button>
                    </div>
                </div>
            )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

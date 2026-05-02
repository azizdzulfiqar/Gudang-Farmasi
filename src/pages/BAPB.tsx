import React from 'react';
import { Plus, Truck, CheckCircle, Package, Calendar as CalendarIcon, MapPin, Trash2, Eye, MoreVertical, Printer, AlertTriangle } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu";
import { dataService } from '@/services/dataService';
import { SearchableSelect } from '@/components/SearchableSelect';
import { BAPB, SuratPesanan, Obat, Lokasi, BAPBItem, Supplier, AppSettings } from '@/types';
import { toast } from 'sonner';
import { format, addDays, differenceInDays, parseISO, isPast } from 'date-fns';
import { useLocation, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import { pdfService } from '@/services/pdfService';
import { DataTable, Column } from '@/components/DataTable';
import { cn } from '@/lib/utils';

export default function BAPBPage() {
  const location = useLocation();
  const navigate = useNavigate();
  const spSelectRef = React.useRef<HTMLButtonElement>(null);
  const [items, setItems] = React.useState<BAPB[]>([]);
  const [sps, setSPs] = React.useState<SuratPesanan[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [obats, setObats] = React.useState<Obat[]>([]);
  const [lokasis, setLokasis] = React.useState<Lokasi[]>([]);
  const [settings, setSettings] = React.useState<AppSettings | null>(null);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedBAPB, setSelectedBAPB] = React.useState<BAPB | null>(null);
  const [useSP, setUseSP] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [lastItemCount, setLastItemCount] = React.useState(0);

  const [tempItem, setTempItem] = React.useState({
    obatId: '',
    jumlah: 1,
  });

  const [newBAPB, setNewBAPB] = React.useState<{
    spId?: string;
    supplierId: string;
    items: BAPBItem[];
    noInvoice: string;
    noFakturPajak: string;
    diskonPersen: number;
    diskonTotal: number;
    ppnTotal: number;
    usePPN: boolean;
    materaiOngkir: number;
    tanggalJatuhTempo: string;
    isPercentDiscount: boolean;
  }>({
    supplierId: '',
    items: [],
    noInvoice: '',
    noFakturPajak: '',
    diskonPersen: 0,
    diskonTotal: 0,
    ppnTotal: 0,
    usePPN: true,
    materaiOngkir: 0,
    tanggalJatuhTempo: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
    isPercentDiscount: false,
  });

  const hnaTotal = newBAPB.items.reduce((sum, i) => sum + (i.jumlah * (i.hargaBeli || 0)), 0);
  
  const calculatedDiscount = React.useMemo(() => {
    if (newBAPB.isPercentDiscount) {
      return (hnaTotal * (newBAPB.diskonPersen / 100));
    }
    return newBAPB.diskonTotal;
  }, [newBAPB.isPercentDiscount, newBAPB.diskonPersen, newBAPB.diskonTotal, hnaTotal]);

  const finalAmount = (hnaTotal - calculatedDiscount) + (newBAPB.usePPN ? newBAPB.ppnTotal : 0) + newBAPB.materaiOngkir;

  React.useEffect(() => {
    const currentSettings = dataService.getSettings();
    setSettings(currentSettings);
    loadData();
    const allSPs = dataService.getSP();
    const sentSPs = allSPs.filter(s => s.status === 'Sent');
    setSPs(sentSPs);
    setSuppliers(dataService.getSuppliers());
    
    const allObats = dataService.getObat();
    setObats(allObats);
    
    const allLokasis = dataService.getLokasi();
    setLokasis(allLokasis);

    // Initial PPN Total if opening with SP
    if (location.state?.spId) {
      const targetSP = allSPs.find(s => s.id === location.state.spId);
      if (targetSP) {
        setUseSP(true);
        setIsAddOpen(true);
        
        const hna = targetSP.items.reduce((sum, item) => {
          const obat = allObats.find(o => o.id === item.obatId);
          return sum + (item.jumlah * (obat?.hargaBeli || 0));
        }, 0);
        
        const ppn = Math.round(hna * (currentSettings.persenPPN / 100));
        
        setNewBAPB({
          spId: targetSP.id,
          supplierId: targetSP.supplierId,
          items: targetSP.items.map(item => ({
            ...item,
            batch: '',
            kadaluarsa: '',
            lokasiId: allLokasis[0]?.id || '',
            lokasiNama: allLokasis[0]?.nama || ''
          })),
          noInvoice: '',
          noFakturPajak: '',
          diskonPersen: 0,
          diskonTotal: 0,
          ppnTotal: ppn,
          usePPN: true,
          materaiOngkir: 0,
          tanggalJatuhTempo: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
          isPercentDiscount: false,
        });

        // Focus SP select after a short delay to allow dialog to open
        setTimeout(() => {
          spSelectRef.current?.focus();
        }, 300);
      }
    }
  }, [location]); 

  // Auto-calculate PPN based on settings
  React.useEffect(() => {
    if (settings && isAddOpen) {
      if (!newBAPB.usePPN) {
        if (newBAPB.ppnTotal !== 0) {
          setNewBAPB(prev => ({ ...prev, ppnTotal: 0 }));
        }
        return;
      }
      const net = hnaTotal - calculatedDiscount;
      const autoPPN = Math.round(net * (settings.persenPPN / 100));
      if (autoPPN !== newBAPB.ppnTotal) {
        setNewBAPB(prev => ({ ...prev, ppnTotal: autoPPN }));
      }
    }
  }, [hnaTotal, calculatedDiscount, settings, isAddOpen, newBAPB.usePPN]);

  // Auto-focus first empty batch field when items are added
  React.useEffect(() => {
    if (isAddOpen && newBAPB.items.length > lastItemCount) {
      const firstEmptyBatchIdx = newBAPB.items.findIndex((item, idx) => !item.batch);
      if (firstEmptyBatchIdx !== -1) {
        setTimeout(() => {
          const el = document.getElementById(`batch-input-${firstEmptyBatchIdx}`);
          if (el) el.focus();
        }, 300); // Wait for animations/transitions
      }
    }
    setLastItemCount(newBAPB.items.length);
  }, [newBAPB.items.length, isAddOpen, lastItemCount]);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setItems(dataService.getBAPB());
      setIsLoading(false);
    }, 500);
  };

  const handlePrint = (item: BAPB) => {
    toast.info(`Mencetak BAPB ${item.nomor}...`);
    pdfService.generateBAPBPDF(item);
  };

  const handleSPChange = (spId: string) => {
    const sp = sps.find(s => s.id === spId);
    if (!sp) return;

    setNewBAPB({
      ...newBAPB,
      spId: sp.id,
      supplierId: sp.supplierId,
      items: sp.items.map(item => {
        const obat = obats.find(o => o.id === item.obatId);
        return {
          ...item,
          batch: '',
          kadaluarsa: '',
          lokasiId: lokasis[0]?.id || '',
          lokasiNama: lokasis[0]?.nama || '',
          hargaBeli: obat?.hargaBeli || 0
        };
      })
    });
  };

  const updateItem = (index: number, field: keyof BAPBItem, value: any) => {
    const newItems = [...newBAPB.items];
    newItems[index] = { ...newItems[index], [field]: value };
    
    if (field === 'lokasiId') {
      const lock = lokasis.find(l => l.id === value);
      newItems[index].lokasiNama = lock?.nama || '';
    }

    setNewBAPB({ ...newBAPB, items: newItems });
  };

  const addItem = () => {
    if (!tempItem.obatId || tempItem.jumlah <= 0) return;
    const obat = obats.find(o => o.id === tempItem.obatId);
    if (!obat) return;

    setNewBAPB({
      ...newBAPB,
      items: [
        ...newBAPB.items,
        {
          obatId: obat.id,
          namaObat: obat.nama,
          jumlah: tempItem.jumlah,
          satuan: obat.satuan,
          batch: '',
          kadaluarsa: '',
          lokasiId: lokasis[0]?.id || '',
          lokasiNama: lokasis[0]?.nama || '',
          hargaBeli: obat.hargaBeli
        }
      ]
    });
    setTempItem({ obatId: '', jumlah: 1 });
  };

  const removeItem = (index: number) => {
    const list = [...newBAPB.items];
    list.splice(index, 1);
    setNewBAPB({ ...newBAPB, items: list });
  };

  const pullFromSP = () => {
    if (!newBAPB.spId) {
      toast.error('Pilih Surat Pesanan terlebih dahulu');
      return;
    }
    const sp = sps.find(s => s.id === newBAPB.spId);
    if (!sp) return;

    setNewBAPB({
      ...newBAPB,
      items: sp.items.map(item => {
        const obat = obats.find(o => o.id === item.obatId);
        return {
          ...item,
          batch: '',
          kadaluarsa: '',
          lokasiId: lokasis[0]?.id || '',
          lokasiNama: lokasis[0]?.nama || '',
          hargaBeli: obat?.hargaBeli || 0
        };
      })
    });
    toast.success('Item berhasil diambil dari SP ' + sp.nomor);
  };

  const handleSave = () => {
    if (!newBAPB.supplierId || newBAPB.items.length === 0 || newBAPB.items.some(i => !i.batch || !i.kadaluarsa)) {
      toast.error('Lengkapi nomor batch, kadaluarsa, supplier, dan minimal 1 item');
      return;
    }

    const supplier = suppliers.find(s => s.id === newBAPB.supplierId);
    
    if (editingId) {
      dataService.updateBAPB(editingId, {
        supplierId: newBAPB.supplierId,
        supplierNama: supplier?.nama || '',
        items: newBAPB.items,
        noInvoice: newBAPB.noInvoice,
        noFakturPajak: newBAPB.noFakturPajak,
        diskonTotal: calculatedDiscount,
        ppnTotal: newBAPB.usePPN ? newBAPB.ppnTotal : 0,
        usePPN: newBAPB.usePPN,
        materaiOngkir: newBAPB.materaiOngkir,
        jumlahDibayar: finalAmount,
        tanggalJatuhTempo: newBAPB.tanggalJatuhTempo,
      });
      toast.success('BAPB berhasil diperbarui');
    } else {
      const nomor = `BAPB-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 1000)}`;

      dataService.addBAPB({
        nomor,
        tanggal: new Date().toISOString(),
        spId: newBAPB.spId,
        nomorSP: sps.find(s => s.id === newBAPB.spId)?.nomor,
        supplierId: newBAPB.supplierId,
        supplierNama: supplier?.nama || '',
        items: newBAPB.items,
        status: 'Received',
        noInvoice: newBAPB.noInvoice,
        noFakturPajak: newBAPB.noFakturPajak,
        diskonTotal: calculatedDiscount,
        ppnTotal: newBAPB.usePPN ? newBAPB.ppnTotal : 0,
        usePPN: newBAPB.usePPN,
        materaiOngkir: newBAPB.materaiOngkir,
        jumlahDibayar: finalAmount,
        tanggalJatuhTempo: newBAPB.tanggalJatuhTempo,
        created_at: Date.now()
      });
      toast.success('Penerimaan barang (BAPB) berhasil disimpan');
    }

    setIsAddOpen(false);
    loadData();
    setEditingId(null);
    setNewBAPB({ 
      supplierId: '', 
      items: [], 
      noInvoice: '', 
      noFakturPajak: '', 
      diskonPersen: 0,
      diskonTotal: 0, 
      ppnTotal: 0, 
      usePPN: true,
      materaiOngkir: 0,
      tanggalJatuhTempo: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      isPercentDiscount: false
    });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Stock akan dikurangkan kembali jika data dihapus!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        dataService.deleteBAPB(id);
        toast.success('BAPB berhasil dihapus');
        loadData();
      }
    });
  };

  const handleViewDetail = (item: BAPB) => {
    setSelectedBAPB(item);
    setIsDetailOpen(true);
  };

  const handleEdit = (item: BAPB) => {
    setEditingId(item.id);
    setUseSP(!!item.spId);
    setNewBAPB({
      spId: item.spId,
      supplierId: item.supplierId,
      items: [...item.items],
      noInvoice: item.noInvoice || '',
      noFakturPajak: item.noFakturPajak || '',
      diskonPersen: item.diskonTotal ? Math.round((item.diskonTotal / item.items.reduce((sum, i) => sum + (i.jumlah * (i.hargaBeli || 0)), 0)) * 100) : 0,
      diskonTotal: item.diskonTotal || 0,
      ppnTotal: item.ppnTotal || 0,
      usePPN: !!item.usePPN,
      materaiOngkir: item.materaiOngkir || 0,
      tanggalJatuhTempo: item.tanggalJatuhTempo || format(addDays(new Date(), 30), 'yyyy-MM-dd'),
      isPercentDiscount: false,
    });
    setIsAddOpen(true);
  };

  const handleMarkPaid = (item: BAPB) => {
    Swal.fire({
      title: 'Konfirmasi Pembayaran',
      text: `Apakah Anda yakin ingin menandai BAPB ${item.nomor} sebagai LUNAS?`,
      icon: 'question',
      showCancelButton: true,
      confirmButtonText: 'Ya, Tandai Lunas',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#2563eb'
    }).then((result) => {
      if (result.isConfirmed) {
        dataService.markBAPBPaid(item.id);
        loadData();
        toast.success(`BAPB ${item.nomor} telah ditandai Lunas`);
      }
    });
  };

  const columns: Column<BAPB>[] = [
    { header: 'No. BAPB', accessorKey: 'nomor', className: 'font-mono font-medium' },
    { 
      header: 'Tgl. Terima', 
      cell: (item) => format(new Date(item.tanggal), 'dd/MM/yyyy') 
    },
    { header: 'Distributor', accessorKey: 'supplierNama' },
    { 
      header: 'Batas Bayar', 
      cell: (item) => {
        if (!item.tanggalJatuhTempo) return '-';
        const dueDate = parseISO(item.tanggalJatuhTempo);
        const daysLeft = differenceInDays(dueDate, new Date());
        const isNear = daysLeft <= 3 && daysLeft >= 0;
        const isOverdue = isPast(dueDate) && format(dueDate, 'yyyy-MM-dd') !== format(new Date(), 'yyyy-MM-dd');

        return (
          <div className="flex flex-col gap-1">
            <span className={cn(
              "font-medium",
              isOverdue ? "text-destructive" : isNear ? "text-orange-600" : ""
            )}>
              {format(dueDate, 'dd/MM/yyyy')}
            </span>
            {isNear && !isOverdue && (
              <span className="text-[10px] bg-orange-100 text-orange-700 px-1 py-0.5 rounded font-bold animate-pulse">
                H-{daysLeft}
              </span>
            )}
            {isOverdue && (
              <span className="text-[10px] bg-red-100 text-red-700 px-1 py-0.5 rounded font-bold">
                JATUH TEMPO
              </span>
            )}
          </div>
        );
      }
    },
    { header: 'Ref. SP', accessorKey: 'nomorSP' },
    { 
      header: 'Item', 
      align: 'center',
      cell: (item) => item.items.length 
    },
    { 
      header: 'Status', 
      cell: (item) => (
        <Badge className={cn(
          item.status === 'Paid' 
            ? "bg-blue-100 text-blue-700 hover:bg-blue-100 border-blue-200"
            : "bg-green-100 text-green-700 hover:bg-green-100 border-green-200"
        )}>
          {item.status === 'Paid' ? 'Lunas' : 'Selesai'}
        </Badge>
      )
    },
    {
      header: '',
      align: 'right',
      className: 'w-[50px]',
      cell: (item) => (
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
            <MoreVertical size={16} />
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem onClick={() => handleViewDetail(item)}>
              <Eye size={14} className="mr-2" /> Detail BAPB
            </DropdownMenuItem>
            {item.status !== 'Paid' && (
              <DropdownMenuItem onClick={() => handleMarkPaid(item)} className="text-blue-600">
                <CheckCircle size={14} className="mr-2" /> Tandai Lunas
              </DropdownMenuItem>
            )}
            <DropdownMenuItem onClick={() => handleEdit(item)}>
              <CalendarIcon size={14} className="mr-2" /> Edit BAPB
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handlePrint(item)}>
              <Printer size={14} className="mr-2" /> Cetak BAPB
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
              <Trash2 size={14} className="mr-2" /> Hapus
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      )
    }
  ];

  const pendingPayments = items.filter(item => {
    if (!item.tanggalJatuhTempo || item.status === 'Paid') return false;
    const dueDate = parseISO(item.tanggalJatuhTempo);
    const daysLeft = differenceInDays(dueDate, new Date());
    return daysLeft <= 3 && !isPast(dueDate);
  });

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">BAPB (Penerimaan)</h1>
          <p className="text-muted-foreground mt-1">Penerimaan barang masuk dari supplier ke gudang.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Plus size={18} /> Penerimaan Baru
        </Button>
      </div>

      {pendingPayments.length > 0 && (
        <div className="bg-orange-50 border border-orange-200 rounded-xl p-4 flex gap-4 items-center animate-in slide-in-from-top duration-500 shadow-sm">
          <div className="h-10 w-10 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
             <AlertTriangle size={20} />
          </div>
          <div className="flex-1">
            <h4 className="font-bold text-orange-900 leading-none">Peringatan Pembayaran Jatuh Tempo</h4>
            <p className="text-sm text-orange-700 mt-1">
              Ada <span className="font-black underline">{pendingPayments.length} BAPB</span> yang akan jatuh tempo dalam 3 hari kedepan. Silahkan cek kolom Batas Bayar.
            </p>
          </div>
          <Button variant="outline" size="sm" className="bg-white border-orange-200 text-orange-700 hover:bg-orange-100" onClick={() => loadData()}>
            Refresh
          </Button>
        </div>
      )}

      <DataTable 
        data={items} 
        columns={columns} 
        isLoading={isLoading}
        searchPlaceholder="Cari nomor BAPB atau supplier..."
      />

      {/* Add Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) {
          setEditingId(null);
          setLastItemCount(0);
          setNewBAPB({ 
             supplierId: '', 
             items: [], 
             noInvoice: '', 
             noFakturPajak: '', 
             diskonPersen: 0,
             diskonTotal: 0, 
             ppnTotal: 0, 
             usePPN: true,
             materaiOngkir: 0,
             tanggalJatuhTempo: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
             isPercentDiscount: false
           });
        }
      }}>
        <DialogContent className="sm:max-w-[900px] max-h-[90vh] overflow-y-auto">
          <DialogHeader><DialogTitle>{editingId ? 'Edit BAPB' : 'Input Penerimaan Barang (BAPB)'}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="flex gap-4 items-center p-4 bg-muted/30 rounded-lg border">
               <Label className="flex items-center gap-2 cursor-pointer">
                  <input 
                    type="checkbox" 
                    checked={useSP} 
                    onChange={(e) => {
                      setUseSP(e.target.checked);
                      if (!e.target.checked) setNewBAPB({ 
                        supplierId: '', 
                        items: [],
                        noInvoice: '',
                        noFakturPajak: '',
                        diskonPersen: 0,
                        diskonTotal: 0,
                        ppnTotal: 0,
                        usePPN: true,
                        materaiOngkir: 0,
                        tanggalJatuhTempo: format(addDays(new Date(), 30), 'yyyy-MM-dd'),
                        isPercentDiscount: false
                      });
                    }} 
                    className="w-4 h-4 rounded border-gray-300"
                  />
                  <span>Gunakan Surat Pesanan (SP)</span>
               </Label>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {useSP ? (
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <Label>Nomor SP</Label>
                    {newBAPB.spId && (
                      <Button 
                        type="button"
                        variant="link" 
                        size="sm" 
                        className="h-auto p-0 text-xs gap-1"
                        onClick={pullFromSP}
                      >
                        <Plus size={12} /> Ambil Item dari SP
                      </Button>
                    )}
                  </div>
                  <SearchableSelect 
                    options={sps.map(sp => ({ value: sp.id, label: `${sp.nomor} (${sp.supplierNama})` }))}
                    value={newBAPB.spId || ''}
                    onValueChange={handleSPChange}
                    placeholder="Pilih Nomor SP"
                    className="h-9 w-full md:min-w-[200px]"
                  />
                </div>
              ) : (
                <div className="space-y-2">
                  <Label>Supplier</Label>
                  <SearchableSelect 
                    onValueChange={(v) => setNewBAPB({...newBAPB, supplierId: v})}
                    value={newBAPB.supplierId}
                    options={suppliers.map(s => ({ value: s.id, label: s.nama }))}
                    placeholder="Pilih Supplier"
                    className="h-9 w-full md:min-w-[200px]"
                  />
                </div>
              )}
              <div className="space-y-2">
                <Label>Tanggal Penerimaan</Label>
                <Input type="date" defaultValue={format(new Date(), 'yyyy-MM-dd')} />
              </div>
              <div className="space-y-2">
                <Label className="text-orange-600 flex items-center gap-2 font-bold">
                   <CalendarIcon size={14} /> Batas Pembayaran (Term)
                </Label>
                <Input 
                  type="date" 
                  value={newBAPB.tanggalJatuhTempo} 
                  onChange={(e) => setNewBAPB({...newBAPB, tanggalJatuhTempo: e.target.value})}
                  className="border-orange-200 focus-visible:ring-orange-500"
                />
                <p className="text-[10px] text-muted-foreground italic">Biasanya 30 hari dari tanggal terima</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>No. Invoice</Label>
                <Input 
                  placeholder="Masukkan Nomor Invoice" 
                  value={newBAPB.noInvoice}
                  onChange={(e) => setNewBAPB({...newBAPB, noInvoice: e.target.value})}
                />
              </div>
              <div className="space-y-2">
                <Label>No. Faktur Pajak</Label>
                <Input 
                  placeholder="Masukkan Nomor Faktur Pajak" 
                  value={newBAPB.noFakturPajak}
                  onChange={(e) => setNewBAPB({...newBAPB, noFakturPajak: e.target.value})}
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Total HNA (Bruto)</Label>
                <div className="text-xl font-bold p-2 bg-muted rounded">
                  Rp {hnaTotal.toLocaleString()}
                </div>
              </div>
              <div className="space-y-2">
                <Label>Diskon</Label>
                <div className="flex gap-2">
                  <div className="flex-1 space-y-1">
                    <Input 
                      type="number" 
                      value={newBAPB.isPercentDiscount ? newBAPB.diskonPersen : newBAPB.diskonTotal}
                      onChange={(e) => {
                        const val = Number(e.target.value);
                        if (newBAPB.isPercentDiscount) {
                          setNewBAPB({...newBAPB, diskonPersen: val});
                        } else {
                          setNewBAPB({...newBAPB, diskonTotal: val});
                        }
                      }}
                    />
                    <p className="text-[10px] text-muted-foreground italic">
                      = Rp {calculatedDiscount.toLocaleString()}
                    </p>
                  </div>
                  <Button 
                    type="button" 
                    variant="outline" 
                    size="sm"
                    onClick={() => setNewBAPB({...newBAPB, isPercentDiscount: !newBAPB.isPercentDiscount})}
                  >
                    {newBAPB.isPercentDiscount ? '%' : 'Rp'}
                  </Button>
                </div>
              </div>
              <div className="space-y-2">
                <div className="flex items-center justify-between">
                  <Label>PPN ({settings?.persenPPN || 0}%) (Rp)</Label>
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox" 
                      id="usePPN"
                      checked={newBAPB.usePPN}
                      onChange={(e) => setNewBAPB({...newBAPB, usePPN: e.target.checked})}
                      className="w-4 h-4"
                    />
                    <Label htmlFor="usePPN" className="text-xs font-normal cursor-pointer">Pakai PPN</Label>
                  </div>
                </div>
                <Input 
                  type="number" 
                  value={newBAPB.ppnTotal}
                  readOnly
                  className="bg-muted text-muted-foreground cursor-not-allowed"
                />
              </div>
            </div>

            <div className="grid grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label className="text-slate-600 font-bold">Total HPP (Netto)</Label>
                <div className="text-xl font-bold p-2 bg-slate-100 rounded text-slate-700 border border-slate-200">
                  Rp {(hnaTotal - calculatedDiscount).toLocaleString()}
                </div>
                <p className="text-[10px] text-muted-foreground italic">Harga setelah potongan diskon</p>
              </div>
              <div className="space-y-2">
                <Label>Materai + Ongkir (Rp)</Label>
                <Input 
                  type="number" 
                  value={newBAPB.materaiOngkir}
                  onChange={(e) => setNewBAPB({...newBAPB, materaiOngkir: Number(e.target.value)})}
                />
              </div>
              <div className="space-y-2">
                <Label className="text-primary font-bold">Grand Total (Total Tagihan)</Label>
                <div className="text-2xl font-black text-primary p-2 bg-primary/5 rounded border border-primary/20">
                  Rp {finalAmount.toLocaleString()}
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <Label>Item Diterima</Label>
              </div>

              {/* Add Item form if not strictly from SP or to allow adding extras */}
              <div className="grid grid-cols-12 gap-2 items-end bg-muted/20 p-3 rounded-lg border">
                <div className="col-span-6 space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Pilih Obat</Label>
                  <SearchableSelect 
                    options={obats.map(o => ({ value: o.id, label: `${o.nama} (${o.satuan})` }))}
                    value={tempItem.obatId}
                    onValueChange={(v) => setTempItem({...tempItem, obatId: v})}
                    placeholder="Cari obat..."
                    className="h-9 w-full md:min-w-[200px]"
                  />
                </div>
                <div className="col-span-3 space-y-1">
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Jumlah</Label>
                  <Input 
                    type="number" 
                    className="h-9" 
                    value={tempItem.jumlah}
                    onChange={(e) => setTempItem({...tempItem, jumlah: Number(e.target.value)})}
                  />
                </div>
                <div className="col-span-3">
                  <Button onClick={addItem} variant="secondary" className="w-full h-9 gap-2">
                    <Plus size={16} /> Tambah
                  </Button>
                </div>
              </div>

              <div className="border rounded-lg overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-muted/50">
                      <TableHead>Nama Obat</TableHead>
                      <TableHead className="w-20">Jumlah</TableHead>
                      <TableHead>Harga Beli</TableHead>
                      <TableHead>No. Batch</TableHead>
                      <TableHead>Kadaluarsa</TableHead>
                      <TableHead>Lokasi</TableHead>
                      <TableHead className="w-[50px]"></TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {newBAPB.items.map((item, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="text-xs font-medium">{item.namaObat}</TableCell>
                        <TableCell>
                          <Input 
                             type="number" 
                             className="h-8 w-16" 
                             value={item.jumlah}
                             onChange={(e) => updateItem(idx, 'jumlah', Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                             type="number" 
                             className="h-8 w-24" 
                             value={item.hargaBeli}
                             onChange={(e) => updateItem(idx, 'hargaBeli', Number(e.target.value))}
                          />
                        </TableCell>
                        <TableCell>
                          <Input 
                            id={`batch-input-${idx}`}
                            placeholder="Batch *" 
                            className={cn("h-8", !item.batch && "border-destructive/50 bg-destructive/5")} 
                            value={item.batch}
                            onChange={(e) => updateItem(idx, 'batch', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                           <Input 
                            type="date" 
                            className={cn("h-8", !item.kadaluarsa && "border-destructive/50 bg-destructive/5")} 
                            value={item.kadaluarsa}
                            onChange={(e) => updateItem(idx, 'kadaluarsa', e.target.value)}
                          />
                        </TableCell>
                        <TableCell>
                          <SearchableSelect 
                            options={lokasis.map(l => ({ value: l.id, label: l.nama }))}
                            value={item.lokasiId || ''}
                            onValueChange={(v) => updateItem(idx, 'lokasiId', v)}
                            placeholder="Pilih Lokasi"
                            className="h-8 w-fit min-w-[120px]"
                          />
                        </TableCell>
                        <TableCell>
                          <Button 
                            variant="ghost" 
                            size="icon" 
                            className="h-8 w-8 text-destructive"
                            onClick={() => removeItem(idx)}
                          >
                            <Plus size={14} className="rotate-45" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                    {newBAPB.items.length === 0 && (
                      <TableRow><TableCell colSpan={6} className="text-center py-8 text-muted-foreground">Silahkan pilih SP atau tambah item secara manual</TableCell></TableRow>
                    )}
                  </TableBody>
                </Table>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button onClick={handleSave} className="gap-2"><CheckCircle size={16} /> Verifikasi & Terima Stok</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Detail Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader>
            <DialogTitle>Detail BAPB {selectedBAPB?.nomor}</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4 text-sm bg-muted/30 p-4 rounded-lg">
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Informasi Umum</p>
                <p><span className="font-semibold">Tanggal:</span> {selectedBAPB && format(new Date(selectedBAPB.tanggal), 'dd MMMM yyyy')}</p>
                <p><span className="font-semibold">Supplier:</span> {selectedBAPB?.supplierNama}</p>
                <p className={cn(
                  "p-1 rounded inline-block px-2 mt-2 font-bold",
                  selectedBAPB?.tanggalJatuhTempo && isPast(parseISO(selectedBAPB.tanggalJatuhTempo)) 
                    ? "bg-red-50 text-red-700" 
                    : "bg-orange-50 text-orange-700"
                )}>
                  <span className="font-semibold">Batas Bayar:</span> {selectedBAPB?.tanggalJatuhTempo ? format(parseISO(selectedBAPB.tanggalJatuhTempo), 'dd MMMM yyyy') : '-'}
                </p>
              </div>
              <div className="space-y-1">
                <p className="text-muted-foreground font-medium">Referensi & Status</p>
                <p><span className="font-semibold">Nomor SP:</span> {selectedBAPB?.nomorSP || '-'}</p>
                <p><span className="font-semibold">Status:</span> 
                  <span className={cn(
                    "ml-2 px-2 py-0.5 rounded text-xs font-bold",
                    selectedBAPB?.status === 'Paid' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
                  )}>
                    {selectedBAPB?.status === 'Paid' ? 'LUNAS' : 'SELESAI'}
                  </span>
                </p>
                {selectedBAPB?.status === 'Paid' && selectedBAPB?.paid_at && (
                  <p><span className="font-semibold">Tgl Bayar:</span> {format(new Date(selectedBAPB.paid_at), 'dd/MM/yyyy HH:mm')}</p>
                )}
              </div>
            </div>

            <div className="border rounded-lg overflow-hidden">
              <Table>
                <TableHeader>
                  <TableRow className="bg-muted/50">
                    <TableHead>Nama Obat</TableHead>
                    <TableHead className="text-center">Jumlah</TableHead>
                    <TableHead>Batch</TableHead>
                    <TableHead>Exp. Date</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedBAPB?.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell className="font-medium">{item.namaObat}</TableCell>
                      <TableCell className="text-center">{item.jumlah} {item.satuan}</TableCell>
                      <TableCell className="font-mono text-xs">{item.batch}</TableCell>
                      <TableCell>{item.kadaluarsa}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            <div className="bg-slate-50 p-4 rounded-xl border border-slate-100 flex flex-col gap-2">
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Subtotal HNA (Bruto)</span>
                <span className="font-semibold">Rp {selectedBAPB?.items.reduce((sum, item) => sum + (item.jumlah * (item.hargaBeli || 0)), 0).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">Total Potongan Diskon</span>
                <span className="font-semibold text-red-600">- Rp {selectedBAPB?.diskonTotal?.toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-2 border-t border-slate-200 mt-1">
                <span className="text-sm font-bold text-slate-700 uppercase tracking-tighter">Total HPP (Netto)</span>
                <span className="text-sm font-black text-slate-900 bg-slate-200/50 px-2 py-1 rounded">
                   Rp {((selectedBAPB?.items.reduce((sum, item) => sum + (item.jumlah * (item.hargaBeli || 0)), 0) || 0) - (selectedBAPB?.diskonTotal || 0)).toLocaleString()}
                </span>
              </div>
              <div className="flex justify-between items-center text-xs">
                <span className="text-slate-500">PPN & Biaya Lainnya</span>
                <span className="font-semibold text-slate-700">Rp {((selectedBAPB?.ppnTotal || 0) + (selectedBAPB?.materaiOngkir || 0)).toLocaleString()}</span>
              </div>
              <div className="flex justify-between items-center py-3 border-t-2 border-primary/20 bg-primary/5 -mx-4 px-4 mt-2">
                <span className="font-black text-primary uppercase text-xs">Grand Total Penagihan</span>
                <span className="text-xl font-black text-primary">Rp {selectedBAPB?.jumlahDibayar?.toLocaleString()}</span>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDetailOpen(false)}>Tutup</Button>
            {selectedBAPB && (
              <Button onClick={() => handlePrint(selectedBAPB)} variant="secondary" className="gap-2">
                <Printer size={16} /> Cetak BAPB
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

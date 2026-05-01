import React from 'react';
import { Plus, FileText, Send, Trash2, MoreVertical, Printer, Eye, Truck, Sparkles } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { SearchableSelect } from '@/components/SearchableSelect';
import { dataService } from '@/services/dataService';
import { SuratPesanan, Supplier, Obat, DetilItem, BAPB } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { useNavigate } from 'react-router-dom';
import { pdfService } from '@/services/pdfService';
import Swal from 'sweetalert2';
import { DataTable, Column } from '@/components/DataTable';
import { cn } from '@/lib/utils';

export default function SuratPesananPage() {
  const navigate = useNavigate();
  const [items, setItems] = React.useState<SuratPesanan[]>([]);
  const [bapbs, setBapbs] = React.useState<BAPB[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [obats, setObats] = React.useState<Obat[]>([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [selectedSP, setSelectedSP] = React.useState<SuratPesanan | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  
  const [newSP, setNewSP] = React.useState<{
    supplierId: string;
    items: DetilItem[];
  }>({
    supplierId: '',
    items: []
  });

  const [tempItem, setTempItem] = React.useState({ obatId: '', jumlah: 0 });

  React.useEffect(() => {
    loadData();
    setSuppliers(dataService.getSuppliers());
    setObats(dataService.getObat());
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setItems(dataService.getSP());
      setBapbs(dataService.getBAPB());
      setIsLoading(false);
    }, 500);
  };

  const handlePrint = (item: SuratPesanan) => {
    toast.info(`Mencetak Surat Pesanan ${item.nomor}...`);
    pdfService.generateSPPDF(item);
  };

  const handleDelete = (id: string) => {
    // Check if this SP is already linked to a BAPB
    const linkedBAPB = bapbs.find(b => b.spId === id);
    if (linkedBAPB) {
      toast.error('SP tidak dapat dihapus karena sudah memiliki data penerimaan (BAPB)');
      return;
    }

    Swal.fire({
      title: 'Apakah Anda yakin?',
      text: "Data Surat Pesanan ini akan dihapus permanen!",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#3085d6',
      cancelButtonColor: '#d33',
      confirmButtonText: 'Ya, hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        dataService.deleteSP(id);
        Swal.fire(
          'Dihapus!',
          'Surat Pesanan berhasil dihapus.',
          'success'
        );
        loadData();
      }
    });
  };

  const handleCreateBAPB = (item: SuratPesanan) => {
    // In a real app, we might pass state to navigate
    toast.success(`Mengarahkan ke BAPB untuk SP ${item.nomor}...`);
    navigate('/logistik/bapb', { state: { spId: item.id } });
  };

  const showDetail = (item: SuratPesanan) => {
    setSelectedSP(item);
    setIsDetailOpen(true);
  };

  const handleEdit = (item: SuratPesanan) => {
    // Cannot edit if already has BAPB
    if (bapbs.find(b => b.spId === item.id)) {
      toast.error('SP tidak dapat diedit karena sudah memiliki data penerimaan (BAPB)');
      return;
    }

    setEditingId(item.id);
    setNewSP({
      supplierId: item.supplierId,
      items: [...item.items]
    });
    setIsAddOpen(true);
  };

  const addItem = () => {
    if (!tempItem.obatId || tempItem.jumlah <= 0) return;
    const obat = obats.find(o => o.id === tempItem.obatId);
    if (!obat) return;

    setNewSP(prev => ({
      ...prev,
      items: [...prev.items, { 
        obatId: obat.id, 
        namaObat: obat.nama, 
        jumlah: tempItem.jumlah,
        satuan: obat.satuan 
      }]
    }));
    setTempItem({ obatId: '', jumlah: 0 });
  };

  const removeItem = (index: number) => {
    setNewSP(prev => ({
      ...prev,
      items: prev.items.filter((_, i) => i !== index)
    }));
  };

  const handleSave = () => {
    if (!newSP.supplierId || newSP.items.length === 0) {
      toast.error('Lengkapi data supplier dan item pesanan');
      return;
    }

    const supplier = suppliers.find(s => s.id === newSP.supplierId);
    
    if (editingId) {
      dataService.updateSP(editingId, {
        supplierId: newSP.supplierId,
        supplierNama: supplier?.nama || '',
        items: newSP.items,
      });
      toast.success('Surat Pesanan berhasil diperbarui');
    } else {
      const nomor = `SP-${format(new Date(), 'yyyyMMdd')}-${Math.floor(Math.random() * 1000)}`;
      dataService.addSP({
        nomor,
        tanggal: new Date().toISOString(),
        supplierId: newSP.supplierId,
        supplierNama: supplier?.nama || '',
        items: newSP.items,
        status: 'Sent',
        created_at: Date.now()
      });
      toast.success('Surat Pesanan berhasil dibuat');
    }

    setIsAddOpen(false);
    setEditingId(null);
    loadData();
    setNewSP({ supplierId: '', items: [] });
  };

  const handleGenerateSuggestions = () => {
    const suggestions = dataService.getReorderSuggestions();
    if (suggestions.length === 0) {
      toast.info('Seluruh stok obat masih dalam batas aman (di atas minimal).');
      return;
    }

    Swal.fire({
      title: 'Smart Reorder AI',
      text: `Ditemukan ${suggestions.length} item obat dengan stok kritis. Buat draft Surat Pesanan otomatis?`,
      icon: 'info',
      showCancelButton: true,
      confirmButtonText: 'Ya, Buat SP',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#2563eb'
    }).then((result) => {
      if (result.isConfirmed) {
        const itemsToOrder = suggestions.map(s => ({
          obatId: s.id,
          namaObat: s.nama,
          jumlah: s.saranOrder,
          satuan: obats.find(o => o.id === s.id)?.satuan || '',
          keterangan: 'Auto-suggestion (Low Stock)'
        }));
        
        setNewSP(prev => ({ ...prev, items: itemsToOrder }));
        setIsAddOpen(true);
        toast.success(`${suggestions.length} item stok rendah telah ditambahkan ke draft.`);
      }
    });
  };

  const columns: Column<SuratPesanan>[] = [
    { header: 'Nomor SP', accessorKey: 'nomor', className: 'font-mono font-medium' },
    { 
      header: 'Tanggal', 
      cell: (item) => format(new Date(item.tanggal), 'dd/MM/yyyy') 
    },
    { header: 'Supplier', accessorKey: 'supplierNama' },
    { 
      header: 'Jumlah Item', 
      accessorKey: 'items', 
      align: 'center',
      cell: (item) => item.items.length 
    },
    { 
      header: 'Status', 
      align: 'center',
      cell: (item) => (
        <Badge variant={item.status === 'Completed' ? 'default' : 'secondary'}>
          {item.status === 'Sent' ? 'Terkirim' : 'Diterima'}
        </Badge>
      )
    },
    {
      header: 'Aksi',
      align: 'right',
      className: 'w-[150px]',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          {item.status === 'Sent' && (
            <Button 
              variant="outline" 
              size="sm" 
              className="h-8 text-[10px] uppercase font-bold border-green-200 bg-green-50 text-green-700 hover:bg-green-100 gap-1 px-2"
              onClick={() => handleCreateBAPB(item)}
            >
              <Truck size={12} /> Proses
            </Button>
          )}
          <Button variant="ghost" size="icon" className="h-8 w-8" onClick={() => showDetail(item)}>
            <Eye size={16} className="text-blue-600" />
          </Button>
          <DropdownMenu>
            <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }))}>
              <MoreVertical size={16} />
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem onClick={() => handlePrint(item)}>
                <Printer size={14} className="mr-2" /> Cetak SP
              </DropdownMenuItem>
              {!bapbs.find(b => b.spId === item.id) && (
                <DropdownMenuItem onClick={() => handleEdit(item)}>
                  <FileText size={14} className="mr-2" /> Edit SP
                </DropdownMenuItem>
              )}
              {item.status !== 'Completed' && (
                <DropdownMenuItem onClick={() => handleCreateBAPB(item)} className="text-green-600">
                  <Truck size={14} className="mr-2" /> Buat BAPB
                </DropdownMenuItem>
              )}
              {!bapbs.find(b => b.spId === item.id) && (
                <DropdownMenuItem onClick={() => handleDelete(item.id)} className="text-destructive">
                  <Trash2 size={14} className="mr-2" /> Hapus SP
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Surat Pesanan</h1>
          <p className="text-muted-foreground mt-1">Kelola dokumen pengadaan barang ke supplier.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-primary/20 hover:bg-primary/5 text-primary font-bold shadow-sm" onClick={handleGenerateSuggestions}>
            <Sparkles size={18} /> Smart Suggestions
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2 min-w-[150px]">
            <Plus size={18} /> Buat SP Baru
          </Button>
        </div>
      </div>

      <DataTable 
        data={items} 
        columns={columns} 
        isLoading={isLoading}
        searchPlaceholder="Cari nomor SP atau supplier..."
      />

      {/* Detail SP Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Surat Pesanan</DialogTitle>
          </DialogHeader>
          {selectedSP && (
            <div className="space-y-6 py-4">
              <div className="grid grid-cols-2 gap-4 bg-muted/30 p-4 rounded-xl border">
                <div>
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Nomor SP</Label>
                  <p className="font-mono font-bold text-lg">{selectedSP.nomor}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Tanggal</Label>
                  <p className="font-bold">{format(new Date(selectedSP.tanggal), 'dd MMMM yyyy')}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Supplier</Label>
                  <p className="font-bold">{selectedSP.supplierNama}</p>
                </div>
                <div>
                  <Label className="text-[10px] uppercase font-bold text-muted-foreground">Status</Label>
                  <div>
                    <Badge variant={selectedSP.status === 'Completed' ? 'default' : 'secondary'}>
                      {selectedSP.status === 'Sent' ? 'Terkirim' : 'Diterima'}
                    </Badge>
                  </div>
                </div>
              </div>

              <div className="border rounded-xl overflow-hidden">
                <Table>
                  <TableHeader className="bg-muted/50">
                    <TableRow>
                      <TableHead className="px-4">Item Obat</TableHead>
                      <TableHead className="text-right px-4">Kuantitas</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {selectedSP.items.map((it, idx) => (
                      <TableRow key={idx}>
                        <TableCell className="px-4 font-medium">{it.namaObat}</TableCell>
                        <TableCell className="text-right px-4 font-bold">{it.jumlah} {it.satuan}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button onClick={() => setIsDetailOpen(false)}>Tutup</Button>
            {selectedSP && (
              <Button onClick={() => handlePrint(selectedSP)} variant="outline" className="gap-2">
                <Printer size={16} /> Cetak
              </Button>
            )}
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add SP Dialog */}
      <Dialog open={isAddOpen} onOpenChange={(open) => {
        setIsAddOpen(open);
        if (!open) setEditingId(null);
      }}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader><DialogTitle>{editingId ? 'Edit Surat Pesanan' : 'Buat Surat Pesanan Baru'}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="space-y-2">
              <Label>Pilih Supplier</Label>
              <SearchableSelect 
                options={suppliers.map(s => ({ value: s.id, label: s.nama }))}
                value={newSP.supplierId}
                onValueChange={(v) => setNewSP({...newSP, supplierId: v})}
                placeholder="Pilih Supplier"
                className="h-11 shadow-sm w-full md:min-w-[200px]"
              />
            </div>

            <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-6 space-y-2">
                  <Label>Cari Obat</Label>
                  <SearchableSelect 
                    options={obats.map(o => ({ value: o.id, label: `${o.nama} (${o.satuan})` }))}
                    value={tempItem.obatId}
                    onValueChange={(v) => setTempItem({...tempItem, obatId: v})}
                    placeholder="Pilih Obat"
                    className="h-11 shadow-sm w-full md:min-w-[200px]"
                  />
                </div>
                <div className="col-span-4 space-y-2">
                  <Label>Jumlah</Label>
                  <Input 
                    type="number" 
                    value={tempItem.jumlah} 
                    onChange={(e) => setTempItem({...tempItem, jumlah: Number(e.target.value)})}
                  />
                </div>
                <div className="col-span-2">
                  <Button onClick={addItem} type="button" className="w-full"><Plus size={18} /></Button>
                </div>
              </div>

              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nama Obat</TableHead>
                    <TableHead className="text-right">Jumlah</TableHead>
                    <TableHead></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {newSP.items.map((item, idx) => (
                    <TableRow key={idx}>
                      <TableCell>{item.namaObat}</TableCell>
                      <TableCell className="text-right">{item.jumlah} {item.satuan}</TableCell>
                      <TableCell className="text-right">
                        <Button variant="ghost" size="icon" onClick={() => removeItem(idx)} className="text-destructive"><Trash2 size={14} /></Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {newSP.items.length === 0 && (
                    <TableRow><TableCell colSpan={3} className="text-center text-muted-foreground text-xs py-4">Belum ada item ditambahkan</TableCell></TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => {
              setIsAddOpen(false);
              setEditingId(null);
            }}>Batal</Button>
            <Button onClick={handleSave} className="gap-2">
              <Send size={16} /> {editingId ? 'Simpan Perubahan' : 'Simpan & Kirim SP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

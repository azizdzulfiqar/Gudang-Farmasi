import React from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { Plus, FileText, Send, Trash2, MoreVertical, Printer, Eye, Truck, Sparkles } from 'lucide-react';
import { Button, buttonVariants } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { dataService } from '@/services/dataService';
import { SuratPesanan, MappingSPKhusus, BAPB, Supplier, Obat, DetilItem } from '@/types';
import { DataTable, Column } from '@/components/DataTable';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';
import { toast } from 'sonner';
import { pdfService } from '@/services/pdfService';
import Swal from 'sweetalert2';
import { cn } from '@/lib/utils';
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { SearchableSelect } from '@/components/SearchableSelect';

export default function SuratPesananKhususPage() {
  const { type } = useParams<{ type: string }>();
  const navigate = useNavigate();
  
  const [items, setItems] = React.useState<SuratPesanan[]>([]);
  const [bapbs, setBapbs] = React.useState<BAPB[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [obats, setObats] = React.useState<Obat[]>([]);
  const [mappings, setMappings] = React.useState<MappingSPKhusus[]>([]);
  const [mapping, setMapping] = React.useState<MappingSPKhusus | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [isDetailOpen, setIsDetailOpen] = React.useState(false);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [selectedSP, setSelectedSP] = React.useState<SuratPesanan | null>(null);

  const [newSP, setNewSP] = React.useState<{
    supplierId: string;
    items: DetilItem[];
    jenisSP: string;
  }>({
    supplierId: '',
    items: [],
    jenisSP: type || ''
  });

  const [tempItem, setTempItem] = React.useState({ obatId: '', jumlah: 0 });

  React.useEffect(() => {
    const allMappings = dataService.getMappingSPKhusus();
    setMappings(allMappings);
    const found = allMappings.find(m => m.jenisSP === type);
    
    setMapping(found || null);
    loadData();
    setBapbs(dataService.getBAPB());
    setSuppliers(dataService.getSuppliers());
    setObats(dataService.getObat());
    
    if (type) {
      setNewSP(prev => ({ ...prev, jenisSP: type }));
    }
  }, [type]);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const allSP = dataService.getSP();
      setItems(allSP.filter(sp => sp.jenisSP === type));
      setIsLoading(false);
    }, 500);
  };

  const handlePrint = (item: SuratPesanan) => {
    toast.info(`Mencetak Surat Pesanan ${item.nomor}...`);
    pdfService.generateSPPDF(item);
  };

  const handleDelete = (id: string) => {
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
        Swal.fire('Dihapus!', 'Surat Pesanan berhasil dihapus.', 'success');
        loadData();
      }
    });
  };

  const handleCreateBAPB = (item: SuratPesanan) => {
    toast.success(`Mengarahkan ke BAPB untuk SP ${item.nomor}...`);
    navigate('/logistik/bapb', { state: { spId: item.id } });
  };

  const showDetail = (item: SuratPesanan) => {
    setSelectedSP(item);
    setIsDetailOpen(true);
  };

  const handleEdit = (item: SuratPesanan) => {
    if (bapbs.find(b => b.spId === item.id)) {
      toast.error('SP tidak dapat diedit karena sudah memiliki data penerimaan (BAPB)');
      return;
    }
    setEditingId(item.id);
    setNewSP({
      supplierId: item.supplierId,
      items: [...item.items],
      jenisSP: item.jenisSP || type || ''
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
        jenisSP: newSP.jenisSP
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
        jenisSP: newSP.jenisSP,
        status: 'Sent',
        created_at: Date.now()
      });
      toast.success('Surat Pesanan berhasil dibuat');
    }

    setIsAddOpen(false);
    setEditingId(null);
    loadData();
    setNewSP({ supplierId: '', items: [], jenisSP: type || '' });
  };

  const filteredObats = obats.filter(o => {
    return o.kategoriId === mapping?.kategoriId;
  });

  const columns: Column<SuratPesanan>[] = [
    { 
      header: 'Nomor SP', 
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-mono font-medium">{item.nomor}</span>
          <span className="text-[9px] font-bold text-amber-600 bg-amber-50 px-1.5 py-0.5 rounded w-fit mt-1 uppercase">
            {item.jenisSP}
          </span>
        </div>
      )
    },
    { 
      header: 'Tanggal', 
      cell: (item) => format(new Date(item.tanggal), 'dd/MM/yyyy')
    },
    { 
      header: 'Supplier', 
      accessorKey: 'supplierNama'
    },
    { 
      header: 'Jumlah Item', 
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
      <div className="flex justify-between items-end">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <Badge variant="secondary">{type}</Badge>
            <h1 className="text-3xl font-bold tracking-tight">Surat Pesanan {type}</h1>
          </div>
          <p className="text-muted-foreground">
            {mapping ? `Mapping Kategori: ${mapping.kategoriNama}` : 'Kelola Surat Pesanan Khusus.'}
          </p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={() => navigate('/logistik/sp')}>
            Semua SP
          </Button>
          <Button onClick={() => setIsAddOpen(true)} className="gap-2">
            <Plus size={18} /> Buat SP {type}
          </Button>
        </div>
      </div>

      <div className="bg-card border rounded-xl overflow-hidden shadow-sm">
        <DataTable 
          data={items} 
          columns={columns} 
          isLoading={isLoading}
          searchPlaceholder={`Cari SP ${type}...`}
        />
      </div>

      {/* Detail SP Dialog */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detail Surat Pesanan {type}</DialogTitle>
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
        if (!open) {
          setEditingId(null);
          setNewSP({ supplierId: '', items: [], jenisSP: type || '' });
        }
      }}>
        <DialogContent className="sm:max-w-[700px]">
          <DialogHeader><DialogTitle>{editingId ? `Edit Surat Pesanan ${type}` : `Buat Surat Pesanan ${type} Baru`}</DialogTitle></DialogHeader>
          <div className="space-y-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Jenis SP</Label>
                <Input value={newSP.jenisSP} readOnly className="bg-muted font-bold text-amber-700" />
              </div>
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
            </div>

            <div className="border rounded-lg p-4 space-y-4 bg-muted/20">
              <div className="grid grid-cols-12 gap-3 items-end">
                <div className="col-span-6 space-y-2">
                  <Label>Cari Obat {type}</Label>
                  <SearchableSelect 
                    options={filteredObats.map(o => ({ value: o.id, label: `${o.nama} (${o.satuan})` }))}
                    value={tempItem.obatId}
                    onValueChange={(v) => {
                      setTempItem({...tempItem, obatId: v});
                      if (tempItem.jumlah === 0) setTempItem(prev => ({ ...prev, obatId: v, jumlah: 1 }));
                    }}
                    placeholder={`Cari Obat ${type}`}
                    className="h-11 shadow-sm w-full md:min-w-[200px]"
                  />
                  {filteredObats.length === 0 && (
                    <p className="text-[10px] text-destructive">Tidak ada obat tersedia untuk kategori ini</p>
                  )}
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
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button onClick={handleSave} className="gap-2">
              <Send size={16} /> {editingId ? 'Simpan Perubahan' : 'Simpan & Kirim SP'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

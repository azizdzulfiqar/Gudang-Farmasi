import React from 'react';
import { Move } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from '@/components/SearchableSelect';
import { dataService } from '@/services/dataService';
import { Obat, Lokasi, PindahLokasi } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { DataTable, Column } from '@/components/DataTable';

export default function PindahLokasiPage() {
  const [obats, setObats] = React.useState<Obat[]>([]);
  const [lokasis, setLokasis] = React.useState<Lokasi[]>([]);
  const [history, setHistory] = React.useState<PindahLokasi[]>([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    obatId: '',
    dariLokasiId: '',
    keLokasiId: '',
    jumlah: 0,
    keterangan: ''
  });

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setObats(dataService.getObat());
      setLokasis(dataService.getLokasi());
      setHistory(JSON.parse(localStorage.getItem('farmasi_pindah') || '[]'));
      setIsLoading(false);
    }, 500);
  };

  const handleMove = () => {
    if (!formData.obatId || !formData.keLokasiId || !formData.jumlah) return;

    const obat = obats.find(o => o.id === formData.obatId);
    if (!obat) return;

    const dari = lokasis.find(l => l.id === formData.dariLokasiId)?.nama || 'Lokasi Awal';
    const ke = lokasis.find(l => l.id === formData.keLokasiId)?.nama || 'Lokasi Tujuan';

    const newMove: PindahLokasi = {
      id: Math.random().toString(36).substr(2, 9),
      tanggal: new Date().toISOString(),
      obatId: formData.obatId,
      namaObat: obat.nama,
      dariLokasiId: formData.dariLokasiId,
      keLokasiId: formData.keLokasiId,
      jumlah: formData.jumlah,
      keterangan: formData.keterangan || `Pindah dari ${dari} ke ${ke}`
    };

    // Log Mutasi (Location change doesn't affect total stock, but we track it for audit)
    dataService.logMutasi({
      tanggal: Date.now(),
      obatId: formData.obatId,
      tipe: 'Pindah',
      jumlah: formData.jumlah,
      saldoAwal: obat.stokTotal,
      saldoAkhir: obat.stokTotal,
      referensiId: newMove.id,
      referensiNomor: `MOV-${newMove.id.substr(0, 4).toUpperCase()}`,
      keterangan: newMove.keterangan || `Pindah dari ${dari} ke ${ke}`
    });

    const newHistory = [newMove, ...history];
    setHistory(newHistory);
    localStorage.setItem('farmasi_pindah', JSON.stringify(newHistory));

    toast.success('Obat berhasil dipindahkan lokasi');
    setIsAddOpen(false);
    setFormData({ obatId: '', dariLokasiId: '', keLokasiId: '', jumlah: 0, keterangan: '' });
  };

  const columns: Column<PindahLokasi>[] = [
    { 
      header: 'Tanggal', 
      cell: (item) => format(new Date(item.tanggal), 'dd/MM/yyyy HH:mm'),
      className: 'text-xs'
    },
    { header: 'Nama Obat', accessorKey: 'namaObat', className: 'font-medium' },
    { 
      header: 'Tujuan', 
      cell: (item) => (
         <div className="flex items-center gap-2 text-xs">
           <span className="text-muted-foreground">Ke:</span>
           {lokasis.find(l => l.id === item.keLokasiId)?.nama}
         </div>
      )
    },
    { header: 'Jumlah', accessorKey: 'jumlah', align: 'center', className: 'font-bold px-4' },
    { header: 'Keterangan', accessorKey: 'keterangan', className: 'text-xs text-muted-foreground italic' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Pindah Lokasi</h1>
          <p className="text-muted-foreground mt-1">Mutasi barang antar rak atau gudang penyimpanan.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <Move size={18} /> Buat Mutasi Lokasi
        </Button>
      </div>

      <DataTable 
        data={history} 
        columns={columns} 
        isLoading={isLoading}
        searchPlaceholder="Cari obat atau keterangan..."
      />

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Mutasi Lokasi Obat</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
              <div className="space-y-2">
                <Label>Nama Obat</Label>
                <SearchableSelect 
                  options={obats.map(o => ({ value: o.id, label: o.nama }))}
                  value={formData.obatId}
                  onValueChange={(v) => setFormData({...formData, obatId: v})}
                  placeholder="Pilih Obat"
                  className="h-11 shadow-sm w-full md:min-w-[200px]"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2 text-left">
                  <Label>Lokasi Awal (Opsional)</Label>
                  <SearchableSelect 
                    options={lokasis.map(l => ({ value: l.id, label: l.nama }))}
                    value={formData.dariLokasiId}
                    onValueChange={(v) => setFormData({...formData, dariLokasiId: v})}
                    placeholder="Pilih"
                    className="h-11 shadow-sm w-full md:min-w-[150px]"
                  />
                </div>
                <div className="space-y-2 text-left">
                  <Label>Lokasi Tujuan</Label>
                  <SearchableSelect 
                    options={lokasis.map(l => ({ value: l.id, label: l.nama }))}
                    value={formData.keLokasiId}
                    onValueChange={(v) => setFormData({...formData, keLokasiId: v})}
                    placeholder="Pilih"
                    className="h-11 shadow-sm w-full md:min-w-[150px]"
                  />
                </div>
              </div>
             <div className="space-y-2">
                <Label>Jumlah Pindah</Label>
                <Input 
                  type="number" 
                  value={formData.jumlah} 
                  onChange={(e) => setFormData({...formData, jumlah: Number(e.target.value)})}
                />
             </div>
             <div className="space-y-2">
                <Label>Keterangan</Label>
                <Input 
                  placeholder="Alasan pindah..." 
                  value={formData.keterangan} 
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                />
             </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button onClick={handleMove}>Konfirmasi Pindah</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

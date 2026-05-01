import React from 'react';
import { ClipboardCheck, Save, AlertTriangle, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from '@/components/SearchableSelect';
import { dataService } from '@/services/dataService';
import { Obat, StokOpname } from '@/types';
import { toast } from 'sonner';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import { DataTable, Column } from '@/components/DataTable';

export default function StokOpnamePage() {
  const [obats, setObats] = React.useState<Obat[]>([]);
  const [history, setHistory] = React.useState<StokOpname[]>([]);
  const [isAddOpen, setIsAddOpen] = React.useState(false);
  const [isLoading, setIsLoading] = React.useState(false);

  const [formData, setFormData] = React.useState({
    obatId: '',
    stokFisik: 0,
    keterangan: ''
  });

  const selectedObat = obats.find(o => o.id === formData.obatId);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setObats(dataService.getObat());
      setHistory(dataService.getOpname());
      setIsLoading(false);
    }, 500);
  };

  const handleOpname = () => {
    if (!formData.obatId || formData.stokFisik < 0) {
      toast.error('Lengkapi data opname');
      return;
    }

    const currentObat = obats.find(o => o.id === formData.obatId);
    if (!currentObat) return;

    const selisih = formData.stokFisik - currentObat.stokTotal;

    dataService.addOpname({
      tanggal: new Date().toISOString(),
      obatId: formData.obatId,
      stokSistem: currentObat.stokTotal,
      stokFisik: formData.stokFisik,
      selisih,
      keterangan: formData.keterangan || (selisih === 0 ? 'Stok Sesuai' : 'Penyesuaian Fisik')
    });
    
    loadData();
    toast.success('Stok Opname berhasil disimpan & Stok diperbarui');
    setIsAddOpen(false);
    setFormData({ obatId: '', stokFisik: 0, keterangan: '' });
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Hapus riwayat opname?',
      text: 'Stok akan dikembalikan ke kondisi sebelum opname dan tercatat di kartu stok.',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus & Perbaiki Stok!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        dataService.deleteOpname(id);
        loadData();
        toast.success('Record opname dihapus & Stok dibatalkan');
      }
    });
  };

  const columns: Column<StokOpname>[] = [
    { 
      header: 'Tanggal', 
      cell: (item) => format(new Date(item.tanggal), 'dd/MM/yyyy HH:mm'),
      className: 'text-xs'
    },
    { 
      header: 'Nama Obat', 
      cell: (item) => obats.find(o => o.id === item.obatId)?.nama || 'Unknown',
      className: 'font-medium'
    },
    { 
      header: 'Stok Sistem', 
      accessorKey: 'stokSistem', 
      align: 'right', 
      className: 'font-mono' 
    },
    { 
      header: 'Stok Fisik', 
      accessorKey: 'stokFisik', 
      align: 'right', 
      className: 'font-mono bg-muted/30' 
    },
    { 
      header: 'Selisih', 
      align: 'right',
      cell: (item) => (
        <span className={cn(
          "font-bold font-mono px-2 py-1 rounded",
          item.selisih > 0 ? "text-green-600 bg-green-50" : item.selisih < 0 ? "text-destructive bg-destructive/10" : "text-muted-foreground bg-muted"
        )}>
          {item.selisih > 0 ? `+${item.selisih}` : item.selisih}
        </span>
      )
    },
    { 
      header: 'Keterangan', 
      accessorKey: 'keterangan', 
      className: 'text-xs text-muted-foreground italic' 
    },
    {
      header: '',
      align: 'right',
      className: 'w-[50px]',
      cell: (item) => (
        <Button 
          variant="ghost" 
          size="icon" 
          className="h-8 w-8 text-destructive opacity-50 hover:opacity-100"
          onClick={() => handleDelete(item.id)}
        >
          <Trash2 size={14} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Stok Opname</h1>
          <p className="text-muted-foreground mt-1">Verifikasi stok fisik dengan catatan sistem.</p>
        </div>
        <Button onClick={() => setIsAddOpen(true)} className="gap-2">
          <ClipboardCheck size={18} /> Berita Acara Opname
        </Button>
      </div>

      <DataTable 
        data={history} 
        columns={columns} 
        isLoading={isLoading}
        searchPlaceholder="Cari keterangan atau nama obat..."
      />

      <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>Pencatatan Stok Opname</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
             <div className="space-y-2">
                <Label>Pilih Obat</Label>
                <SearchableSelect 
                  options={obats.map(o => ({ value: o.id, label: `${o.nama} (Sistem: ${o.stokTotal})` }))}
                  value={formData.obatId}
                  onValueChange={(v) => setFormData({...formData, obatId: v})}
                  placeholder="Pilih Obat"
                  className="h-11 shadow-sm w-full md:min-w-[200px]"
                />
             </div>
             
             {selectedObat && (
               <div className="p-4 rounded-lg bg-muted/50 border space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-muted-foreground">Stok Saat Ini (Sistem):</span>
                    <span className="font-bold">{selectedObat.stokTotal} {selectedObat.satuan}</span>
                  </div>
               </div>
             )}

             <div className="space-y-2">
                <Label>Jumlah Stok Fisik (Aktual)</Label>
                <Input 
                  type="number" 
                  autoFocus
                  placeholder="Masukkan jumlah yang dihitung..."
                  onChange={(e) => setFormData({...formData, stokFisik: Number(e.target.value)})}
                />
             </div>

             <div className="space-y-2">
                <Label>Keterangan Penyesuaian</Label>
                <Input 
                  placeholder="Alasan selisih jika ada..." 
                  value={formData.keterangan} 
                  onChange={(e) => setFormData({...formData, keterangan: e.target.value})}
                />
             </div>

             {selectedObat && formData.stokFisik !== selectedObat.stokTotal && (
               <div className="flex items-start gap-2 p-3 bg-orange-50 border border-orange-200 rounded text-orange-800 text-xs">
                 <AlertTriangle size={14} className="shrink-0 mt-0.5" />
                 <p>Terdeteksi selisih <strong>{formData.stokFisik - selectedObat.stokTotal}</strong>. Sistem akan menyesuaikan stok total secara otomatis.</p>
               </div>
             )}
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsAddOpen(false)}>Batal</Button>
            <Button onClick={handleOpname} className="gap-2">
              <Save size={16} /> Simpan Opname
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

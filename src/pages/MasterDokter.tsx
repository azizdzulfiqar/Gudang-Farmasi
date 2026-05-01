import React from 'react';
import { Plus, Search, Stethoscope, Edit, UserPlus, Phone } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from '@/components/SearchableSelect';
import { dataService } from '@/services/dataService';
import { Dokter, Spesialis } from '@/types';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/DataTable';

export default function MasterDokter() {
  const [items, setItems] = React.useState<Dokter[]>([]);
  const [spesialisList, setSpesialisList] = React.useState<Spesialis[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState<Omit<Dokter, 'id'>>({
    kode: '',
    nama: '',
    spesialisasi: '',
    telepon: ''
  });

  const loadData = () => {
    setItems(dataService.getDokter());
    setSpesialisList(dataService.getSpesialis());
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const columns: Column<Dokter>[] = [
    { header: 'Kode', accessorKey: 'kode', className: 'font-mono text-xs font-bold w-[100px]' },
    { 
      header: 'Nama Dokter', 
      cell: (item) => (
        <div className="flex items-center gap-2 font-medium">
          <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
            <Stethoscope size={14} />
          </div>
          {item.nama}
        </div>
      )
    },
    { 
      header: 'Spesialisasi', 
      cell: (item) => (
        <span className="text-xs px-2 py-1 bg-muted rounded-full font-medium">
          {item.spesialisasi || 'Umum'}
        </span>
      )
    },
    { header: 'Telepon', accessorKey: 'telepon', cell: (item) => item.telepon || '-' },
    { 
      header: 'Aksi', 
      align: 'right',
      cell: (item) => (
        <div className="flex items-center justify-end">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>
            <Edit size={16} />
          </Button>
        </div>
      )
    },
  ];

  const handleEdit = (item: Dokter) => {
    setEditingId(item.id);
    setFormData({
      kode: item.kode,
      nama: item.nama,
      spesialisasi: item.spesialisasi,
      telepon: item.telepon
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      kode: `DR-${(items.length + 1).toString().padStart(3, '0')}`,
      nama: '',
      spesialisasi: '',
      telepon: ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nama || !formData.kode) {
      toast.error('Nama dan Kode harus diisi');
      return;
    }
    
    if (editingId) {
      dataService.updateDokter(editingId, formData);
      toast.success('Data dokter diperbarui');
    } else {
      dataService.addDokter(formData);
      toast.success('Dokter baru ditambahkan');
    }
    
    setIsDialogOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Data Dokter</h1>
          <p className="text-sm text-muted-foreground">Kelola data dokter pemeriksa / pemberi resep</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus size={16} /> Tambah Dokter
        </Button>
      </div>

      <DataTable 
        data={items} 
        columns={columns} 
        searchPlaceholder="Cari dokter, kode, atau spesialisasi..." 
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <UserPlus size={20} />
              {editingId ? 'Edit Data Dokter' : 'Tambah Dokter Baru'}
            </DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="kode" className="text-right">Kode</Label>
              <Input
                id="kode"
                className="col-span-3 font-mono"
                value={formData.kode}
                onChange={(e) => setFormData({...formData, kode: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama" className="text-right">Nama</Label>
              <Input
                id="nama"
                autoComplete="off"
                className="col-span-3"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value.toUpperCase()})}
              />
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="spesialisasi" className="text-right text-xs">Spesialisasi</Label>
              <div className="col-span-3">
                <SearchableSelect 
                  options={spesialisList.map(s => ({ value: s.nama, label: s.nama }))}
                  value={formData.spesialisasi}
                  onValueChange={(v) => setFormData({...formData, spesialisasi: v})}
                  placeholder="Pilih spesialisasi..."
                  className="w-full"
                />
              </div>
            </div>
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="telepon" className="text-right">Telepon</Label>
              <div className="col-span-3 relative">
                <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={14} />
                <Input
                  id="telepon"
                  className="pl-9"
                  value={formData.telepon}
                  onChange={(e) => setFormData({...formData, telepon: e.target.value})}
                />
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan Data</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

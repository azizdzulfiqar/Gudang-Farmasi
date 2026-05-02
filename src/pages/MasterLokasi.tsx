import React from 'react';
import { Plus, MapPin, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { dataService } from '@/services/dataService';
import { Lokasi } from '@/types';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/DataTable';

export default function MasterLokasi() {
  const [items, setItems] = React.useState<Lokasi[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({ kode: '', nama: '' });
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => { loadData(); }, []);
  
  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setItems(dataService.getLokasi());
      setIsLoading(false);
    }, 500);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    const nextNum = items.length + 1;
    const autoKode = `LOC-${nextNum.toString().padStart(3, '0')}`;
    setFormData({ kode: autoKode, nama: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Lokasi) => {
    setEditingId(item.id);
    setFormData({ kode: item.kode, nama: item.nama });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nama) return;
    
    if (editingId) {
      dataService.updateLokasi(editingId, formData);
      toast.success('Lokasi berhasil diperbarui');
    } else {
      dataService.addLokasi(formData);
      toast.success('Lokasi berhasil ditambahkan');
    }
    
    setIsDialogOpen(false);
    loadData();
    setFormData({ kode: '', nama: '' });
    setEditingId(null);
  };

  const columns: Column<Lokasi>[] = [
    { header: 'Kode', accessorKey: 'kode', className: 'font-mono text-xs w-[120px]' },
    { 
      header: 'Nama Lokasi / Rak', 
      cell: (item) => (
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-muted-foreground" />
          {item.nama}
        </div>
      ),
      className: 'font-medium'
    },
    {
      header: '',
      align: 'right',
      className: 'w-[100px]',
      cell: (item) => (
        <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(item)}>
          <Edit size={14} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Lokasi Penyimpanan</h1>
          <p className="text-muted-foreground mt-1">Manajemen rak, almari, and sub-gudang penyimpanan.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={18} /> Tambah Lokasi
        </Button>
      </div>

      <div>
        <DataTable 
          data={items} 
          columns={columns} 
          isLoading={isLoading}
          searchPlaceholder="Cari lokasi..."
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Lokasi' : 'Tambah Lokasi Baru'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Kode Lokasi</Label>
              <Input value={formData.kode} readOnly className="bg-muted font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Nama Lokasi</Label>
              <Input 
                placeholder="Contoh: RAK A - GUDANG LOBI" 
                value={formData.nama} 
                onChange={(e) => setFormData({ ...formData, nama: e.target.value })} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

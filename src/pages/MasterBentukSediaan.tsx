import React from 'react';
import { Plus, Boxes, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { dataService } from '@/services/dataService';
import { BentukSediaan } from '@/types';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/DataTable';
import Swal from 'sweetalert2';

export default function MasterBentukSediaan() {
  const [items, setItems] = React.useState<BentukSediaan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({ nama: '' });
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setItems(dataService.getBentukSediaan());
      setIsLoading(false);
    }, 500);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ nama: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: BentukSediaan) => {
    setEditingId(item.id);
    setFormData({ nama: item.nama });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: BentukSediaan) => {
    Swal.fire({
      title: 'Hapus Bentuk Sediaan?',
      text: `Yakin ingin menghapus ${item.nama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        dataService.deleteBentukSediaan(item.id);
        toast.success('Bentuk sediaan berhasil dihapus');
        loadData();
      }
    });
  };

  const handleSave = () => {
    if (!formData.nama) return;
    
    if (editingId) {
      dataService.updateBentukSediaan(editingId, formData);
      toast.success('Bentuk sediaan berhasil diperbarui');
    } else {
      dataService.addBentukSediaan(formData);
      toast.success('Bentuk sediaan berhasil ditambahkan');
    }
    
    setIsDialogOpen(false);
    loadData();
    setFormData({ nama: '' });
    setEditingId(null);
  };

  const columns: Column<BentukSediaan>[] = [
    { 
      header: 'Nama Bentuk Sediaan', 
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Boxes size={16} className="text-muted-foreground" />
          {item.nama}
        </div>
      ),
      className: 'font-medium'
    },
    {
      header: 'Aksi',
      align: 'right',
      className: 'w-[120px]',
      cell: (item) => (
        <div className="flex justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={() => handleEdit(item)}>
            <Edit size={14} />
          </Button>
          <Button variant="ghost" size="icon" className="h-8 w-8 text-red-600" onClick={() => handleDelete(item)}>
            <Trash2 size={14} />
          </Button>
        </div>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Bentuk Sediaan</h1>
          <p className="text-muted-foreground mt-1">Definisi wujud fisik obat (Tablet, Syrup, Injeksi, dsb).</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={18} /> Tambah Bentuk Sediaan
        </Button>
      </div>

      <div>
        <DataTable 
          data={items} 
          columns={columns} 
          isLoading={isLoading}
          searchPlaceholder="Cari bentuk sediaan..."
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Bentuk Sediaan' : 'Tambah Bentuk Sediaan'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Bentuk Sediaan</Label>
              <Input 
                placeholder="Contoh: SIRUP, TABLET, SUSPENSI" 
                value={formData.nama} 
                onChange={(e) => setFormData({ nama: e.target.value.toUpperCase() })} 
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

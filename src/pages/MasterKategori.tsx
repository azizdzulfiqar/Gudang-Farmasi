import React from 'react';
import { Plus, Tag, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { dataService } from '@/services/dataService';
import { Kategori } from '@/types';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/DataTable';

export default function MasterKategori() {
  const [items, setItems] = React.useState<Kategori[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({ nama: '' });
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setItems(dataService.getKategori());
      setIsLoading(false);
    }, 500);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ nama: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Kategori) => {
    setEditingId(item.id);
    setFormData({ nama: item.nama });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nama) return;
    
    if (editingId) {
      dataService.updateKategori(editingId, formData);
      toast.success('Kategori berhasil diperbarui');
    } else {
      dataService.addKategori(formData);
      toast.success('Kategori berhasil ditambahkan');
    }
    
    setIsDialogOpen(false);
    loadData();
    setFormData({ nama: '' });
    setEditingId(null);
  };

  const columns: Column<Kategori>[] = [
    { 
      header: 'Nama Kategori', 
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Tag size={16} className="text-muted-foreground" />
          {item.nama}
        </div>
      ),
      className: 'font-medium'
    },
    {
      header: 'Aksi',
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
          <h1 className="text-3xl font-bold tracking-tight">Kategori Obat</h1>
          <p className="text-muted-foreground mt-1">Klasifikasi sediaan farmasi.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={18} /> Tambah Kategori
        </Button>
      </div>

      <div className="max-w-2xl">
        <DataTable 
          data={items} 
          columns={columns} 
          isLoading={isLoading}
          searchPlaceholder="Cari kategori..."
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Kategori' : 'Tambah Kategori'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Kategori</Label>
              <Input 
                placeholder="Contoh: OBAT KERAS" 
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

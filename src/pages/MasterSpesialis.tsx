import React from 'react';
import { Plus, Tag, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from '@/components/ui/label';
import { dataService } from '@/services/dataService';
import { Spesialis } from '@/types';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/DataTable';

export default function MasterSpesialis() {
  const [items, setItems] = React.useState<Spesialis[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);
  const [formData, setFormData] = React.useState<Omit<Spesialis, 'id'>>({
    nama: ''
  });

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setItems(dataService.getSpesialis());
      setIsLoading(false);
    }, 500);
  };

  React.useEffect(() => {
    loadData();
  }, []);

  const handleEdit = (item: Spesialis) => {
    setEditingId(item.id);
    setFormData({
      nama: item.nama
    });
    setIsDialogOpen(true);
  };

  const handleAdd = () => {
    setEditingId(null);
    setFormData({
      nama: ''
    });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nama) {
      toast.error('Nama spesialis harus diisi');
      return;
    }
    
    if (editingId) {
      dataService.updateSpesialis(editingId, formData);
      toast.success('Spesialis diperbarui');
    } else {
      dataService.addSpesialis(formData);
      toast.success('Spesialis ditambahkan');
    }
    
    setIsDialogOpen(false);
    loadData();
  };

  const columns: Column<Spesialis>[] = [
    { 
      header: 'Nama Spesialisasi', 
      cell: (item) => (
        <div className="flex items-center gap-2">
           <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center text-primary">
              <Tag size={14} />
           </div>
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
          <Edit size={16} />
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Master Spesialis Dokter</h1>
          <p className="text-sm text-muted-foreground">Kelola daftar spesialisasi dokter</p>
        </div>
        <Button onClick={handleAdd} className="gap-2">
          <Plus size={16} /> Tambah Spesialis
        </Button>
      </div>

      <div className="max-w-2xl">
        <DataTable 
          data={items} 
          columns={columns} 
          isLoading={isLoading}
          searchPlaceholder="Cari spesialis..."
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Spesialis' : 'Tambah Spesialis Baru'}</DialogTitle>
          </DialogHeader>
          
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="nama" className="text-right">Nama</Label>
              <Input
                id="nama"
                className="col-span-3"
                value={formData.nama}
                onChange={(e) => setFormData({...formData, nama: e.target.value.toUpperCase()})}
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

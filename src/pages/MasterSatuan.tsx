import React from 'react';
import { Plus, Layers, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { dataService } from '@/services/dataService';
import { Satuan } from '@/types';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/DataTable';

export default function MasterSatuan() {
  const [items, setItems] = React.useState<Satuan[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({ nama: '' });
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => { loadData(); }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setItems(dataService.getSatuan());
      setIsLoading(false);
    }, 500);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ nama: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Satuan) => {
    setEditingId(item.id);
    setFormData({ nama: item.nama });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (!formData.nama) return;
    
    if (editingId) {
      dataService.updateSatuan(editingId, formData);
      toast.success('Satuan berhasil diperbarui');
    } else {
      dataService.addSatuan(formData);
      toast.success('Satuan berhasil ditambahkan');
    }
    
    setIsDialogOpen(false);
    loadData();
    setFormData({ nama: '' });
    setEditingId(null);
  };

  const columns: Column<Satuan>[] = [
    { 
      header: 'Nama Satuan', 
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Layers size={16} className="text-muted-foreground" />
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
          <h1 className="text-3xl font-bold tracking-tight">Satuan Obat</h1>
          <p className="text-muted-foreground mt-1">Definisi unit sediaan (Tablet, Botol, dll).</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={18} /> Tambah Satuan
        </Button>
      </div>

      <div className="max-w-2xl">
        <DataTable 
          data={items} 
          columns={columns} 
          isLoading={isLoading}
          searchPlaceholder="Cari satuan..."
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Satuan' : 'Tambah Satuan'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Nama Satuan</Label>
              <Input 
                placeholder="Contoh: TABLET" 
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

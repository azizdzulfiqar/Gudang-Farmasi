import React from 'react';
import { Plus, Search, MapPin, Phone, Building2, Edit } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { dataService } from '@/services/dataService';
import { Supplier } from '@/types';
import { toast } from 'sonner';
import Swal from 'sweetalert2';
import { DataTable, Column } from '@/components/DataTable';

export default function MasterSupplier() {
  const [items, setItems] = React.useState<Supplier[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({ kode: '', nama: '', alamat: '', telepon: '' });

  React.useEffect(() => { loadData(); }, []);
  const loadData = () => setItems(dataService.getSuppliers());

  const columns: Column<Supplier>[] = [
    { header: 'Kode', accessorKey: 'kode', className: 'font-mono text-xs' },
    { 
      header: 'Nama Perusahaan', 
      cell: (item) => (
        <div className="flex items-center gap-2 font-medium">
          <Building2 size={16} className="text-muted-foreground" />
          {item.nama}
        </div>
      )
    },
    { 
      header: 'Alamat', 
      cell: (item) => (
        <div className="flex items-center gap-2">
          <MapPin size={16} className="text-muted-foreground" />
          {item.alamat}
        </div>
      )
    },
    { 
      header: 'Telepon', 
      cell: (item) => (
        <div className="flex items-center gap-2">
          <Phone size={16} className="text-muted-foreground" />
          {item.telepon}
        </div>
      )
    },
    { 
      header: 'Aksi', 
      align: 'right',
      className: 'w-[100px]',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button variant="ghost" size="icon" className="h-8 w-8 text-blue-600" onClick={(e) => { e.stopPropagation(); handleEdit(item); }}>
            <Edit size={16} />
          </Button>
        </div>
      )
    },
  ];

  const handleOpenAdd = () => {
    setEditingId(null);
    const nextNum = items.length + 1;
    const autoKode = `SPL-${nextNum.toString().padStart(3, '0')}`;
    setFormData({ kode: autoKode, nama: '', alamat: '', telepon: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Supplier) => {
    setEditingId(item.id);
    setFormData({ kode: item.kode, nama: item.nama, alamat: item.alamat, telepon: item.telepon });
    setIsDialogOpen(true);
  };

  const handleSave = () => {
    if (editingId) {
      dataService.updateSupplier(editingId, formData);
      toast.success('Supplier berhasil diperbarui');
    } else {
      dataService.addSupplier(formData);
      toast.success('Supplier berhasil ditambahkan');
    }
    setIsDialogOpen(false);
    loadData();
    setFormData({ kode: '', nama: '', alamat: '', telepon: '' });
    setEditingId(null);
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Hapus data supplier?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        dataService.deleteSupplier(id);
        toast.success('Supplier berhasil dihapus');
        loadData();
      }
    });
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Data Supplier</h1>
          <p className="text-muted-foreground mt-1">Daftar pemasok resmi untuk pengadaan obat.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={18} /> Tambah Supplier
        </Button>
      </div>

      <DataTable 
        data={items} 
        columns={columns} 
        searchPlaceholder="Cari supplier..." 
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Supplier' : 'Tambah Supplier'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-2">
            <div className="space-y-2">
              <Label>Kode Supplier</Label>
              <Input value={formData.kode} readOnly className="bg-muted font-mono" />
            </div>
            <div className="space-y-2">
              <Label>Nama Supplier</Label>
              <Input value={formData.nama} onChange={(e) => setFormData({...formData, nama: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Alamat</Label>
              <Input value={formData.alamat} onChange={(e) => setFormData({...formData, alamat: e.target.value})} />
            </div>
            <div className="space-y-2">
              <Label>Telepon</Label>
              <Input value={formData.telepon} onChange={(e) => setFormData({...formData, telepon: e.target.value})} />
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

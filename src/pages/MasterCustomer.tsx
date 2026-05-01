import React from 'react';
import { Plus, Search, Users, Edit, CheckCircle2, XCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { dataService } from '@/services/dataService';
import { Customer } from '@/types';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';
import Swal from 'sweetalert2';
import { DataTable, Column } from '@/components/DataTable';

export default function MasterCustomer() {
  const [items, setItems] = React.useState<Customer[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({ 
    kode: '', 
    nama: '', 
    alamat: '', 
    telepon: '', 
    aktif: true 
  });

  React.useEffect(() => { loadData(); }, []);
  const loadData = () => setItems(dataService.getCustomers());

  const columns: Column<Customer>[] = [
    { header: 'Kode', accessorKey: 'kode', className: 'font-mono text-xs w-[120px]' },
    { 
      header: 'Nama Pelanggan', 
      cell: (item) => (
        <div className="flex items-center gap-2 font-medium">
          <Users size={16} className="text-muted-foreground" />
          {item.nama}
        </div>
      )
    },
    { header: 'Alamat', accessorKey: 'alamat', cell: (item) => item.alamat || '-' },
    { header: 'Telepon', accessorKey: 'telepon', className: 'font-mono text-sm', cell: (item) => item.telepon || '-' },
    { 
      header: 'Status', 
      align: 'center',
      cell: (item) => (
        <button 
           onClick={(e) => { e.stopPropagation(); handleToggleStatus(item); }}
           className={cn(
             "flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider transition-colors",
             item.aktif ? "bg-emerald-100 text-emerald-700" : "bg-rose-100 text-rose-700"
           )}
        >
          {item.aktif ? <CheckCircle2 size={12} /> : <XCircle size={12} />}
          {item.aktif ? 'Aktif' : 'Non-Aktif'}
        </button>
      )
    },
    { 
      header: 'Aksi', 
      align: 'right',
      className: 'w-[100px]',
      cell: (item) => (
        <div className="flex items-center justify-end">
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
    const autoKode = `CUST-${nextNum.toString().padStart(3, '0')}`;
    setFormData({ kode: autoKode, nama: '', alamat: '', telepon: '', aktif: true });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Customer) => {
    setEditingId(item.id);
    setFormData({ 
      kode: item.kode, 
      nama: item.nama, 
      alamat: item.alamat, 
      telepon: item.telepon, 
      aktif: item.aktif 
    });
    setIsDialogOpen(true);
  };

  const handleToggleStatus = (item: Customer) => {
    dataService.updateCustomer(item.id, { aktif: !item.aktif });
    loadData();
    toast.success(`Customer ${item.nama} ${!item.aktif ? 'diaktifkan' : 'dinonaktifkan'}`);
  };

  const handleSave = () => {
    if (!formData.nama) {
      toast.error('Nama customer harus diisi');
      return;
    }
    
    if (editingId) {
      dataService.updateCustomer(editingId, formData);
      toast.success('Data customer berhasil diperbarui');
    } else {
      dataService.addCustomer(formData);
      toast.success('Customer baru berhasil ditambahkan');
    }
    
    setIsDialogOpen(false);
    loadData();
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Customer</h1>
          <p className="text-muted-foreground mt-1">Kelola data pelanggan / pasien apotek.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-sm">
          <Plus size={18} /> Tambah Customer
        </Button>
      </div>

      <DataTable 
        data={items} 
        columns={columns} 
        searchPlaceholder="Cari nama atau kode customer..." 
      />

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Customer' : 'Tambah Customer'}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kode Customer</Label>
                <Input value={formData.kode} readOnly className="bg-muted font-mono" />
              </div>
              <div className="space-y-2 flex flex-col justify-end">
                <div className="flex items-center gap-2 mb-2">
                   <Switch 
                     checked={formData.aktif} 
                     onCheckedChange={(v) => setFormData({...formData, aktif: v})} 
                   />
                   <Label className="text-xs font-bold uppercase tracking-tight">Status Aktif</Label>
                </div>
              </div>
            </div>
            <div className="space-y-2">
              <Label>Nama Lengkap</Label>
              <Input 
                placeholder="Masukkan nama customer / pasien" 
                value={formData.nama} 
                onChange={(e) => setFormData({...formData, nama: e.target.value.toUpperCase()})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Nomor Telepon / WA</Label>
              <Input 
                placeholder="08xxxxxxxx" 
                value={formData.telepon} 
                onChange={(e) => setFormData({...formData, telepon: e.target.value})} 
              />
            </div>
            <div className="space-y-2">
              <Label>Alamat Lengkap</Label>
              <Input 
                placeholder="Jl. Contoh No. 123" 
                value={formData.alamat} 
                onChange={(e) => setFormData({...formData, alamat: e.target.value})} 
              />
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

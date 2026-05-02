import React from 'react';
import { Plus, Link, Edit, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { dataService } from '@/services/dataService';
import { MappingSPKhusus, Kategori } from '@/types';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/DataTable';
import { SearchableSelect } from '@/components/SearchableSelect';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import Swal from 'sweetalert2';

export default function MasterMappingSPKhusus() {
  const [items, setItems] = React.useState<MappingSPKhusus[]>([]);
  const [kategoris, setKategoris] = React.useState<Kategori[]>([]);
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  const [formData, setFormData] = React.useState({ 
    kategoriId: '', 
    kategoriNama: '', 
    jenisSP: '', 
    keterangan: '' 
  });
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => { 
    loadData(); 
    setKategoris(dataService.getKategori());
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setItems(dataService.getMappingSPKhusus());
      setIsLoading(false);
    }, 500);
  };

  const handleOpenAdd = () => {
    setEditingId(null);
    setFormData({ kategoriId: '', kategoriNama: '', jenisSP: '', keterangan: '' });
    setIsDialogOpen(true);
  };

  const handleEdit = (item: MappingSPKhusus) => {
    setEditingId(item.id);
    setFormData({ 
      kategoriId: item.kategoriId, 
      kategoriNama: item.kategoriNama, 
      jenisSP: item.jenisSP, 
      keterangan: item.keterangan || '' 
    });
    setIsDialogOpen(true);
  };

  const handleDelete = (item: MappingSPKhusus) => {
    Swal.fire({
      title: 'Hapus Mapping?',
      text: `Yakin ingin menghapus mapping untuk ${item.kategoriNama}?`,
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#64748b',
      confirmButtonText: 'Ya, Hapus',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        dataService.deleteMappingSPKhusus(item.id);
        toast.success('Mapping berhasil dihapus');
        loadData();
      }
    });
  };

  const handleSave = () => {
    if (!formData.kategoriId || !formData.jenisSP) {
      toast.error('Kategori dan Jenis SP harus diisi');
      return;
    }
    
    if (editingId) {
      dataService.updateMappingSPKhusus(editingId, formData);
      toast.success('Mapping berhasil diperbarui');
    } else {
      dataService.addMappingSPKhusus(formData);
      toast.success('Mapping berhasil ditambahkan');
    }
    
    setIsDialogOpen(false);
    loadData();
  };

  const columns: Column<MappingSPKhusus>[] = [
    { 
      header: 'Kategori Obat', 
      cell: (item) => (
        <div className="font-medium text-slate-900 uppercase">
          {item.kategoriNama}
        </div>
      )
    },
    { 
      header: 'Jenis Surat Pesanan', 
      cell: (item) => (
        <div className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
          {item.jenisSP}
        </div>
      )
    },
    { 
      header: 'Keterangan', 
      accessorKey: 'keterangan'
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

  const types = ['NARKOTIKA', 'PSIKOTROPIKA', 'PREKURSOR', 'OBAT OBAT TERTENTU'];

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Mapping SP Khusus</h1>
          <p className="text-muted-foreground mt-1">Konfigurasi kategori obat untuk pembuatan Surat Pesanan Khusus.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2">
          <Plus size={18} /> Tambah Mapping
        </Button>
      </div>

      <div>
        <DataTable 
          data={items} 
          columns={columns} 
          isLoading={isLoading}
          searchPlaceholder="Cari mapping..."
        />
      </div>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingId ? 'Edit Mapping' : 'Tambah Mapping'}</DialogTitle></DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Kategori Obat</Label>
              <SearchableSelect 
                options={kategoris.map(k => ({ value: k.id, label: k.nama }))}
                value={formData.kategoriId}
                onValueChange={(v) => {
                  const k = kategoris.find(kat => kat.id === v);
                  setFormData({ ...formData, kategoriId: v, kategoriNama: k?.nama || '' });
                }}
                placeholder="Pilih Kategori"
              />
            </div>
            
            <div className="space-y-2">
              <Label>Jenis Surat Pesanan Khusus</Label>
              <Select 
                value={formData.jenisSP} 
                onValueChange={(v) => setFormData({ ...formData, jenisSP: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Jenis SP" />
                </SelectTrigger>
                <SelectContent>
                  {types.map(t => (
                    <SelectItem key={t} value={t}>{t}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Keterangan</Label>
              <Input 
                placeholder="Opsional..." 
                value={formData.keterangan} 
                onChange={(e) => setFormData({ ...formData, keterangan: e.target.value })} 
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>Simpan Mapping</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

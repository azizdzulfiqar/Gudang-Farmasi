import React from 'react';
import { 
  Plus, 
  Search, 
  Filter, 
  MoreVertical, 
  Edit, 
  AlertCircle,
  Sparkles,
  Bot,
  Loader2
} from 'lucide-react';
import Swal from 'sweetalert2';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { SearchableSelect } from '@/components/SearchableSelect';
import { dataService } from '@/services/dataService';
import { aiService } from '@/services/aiService';
import { Obat, Kategori, Satuan } from '@/types';
import { toast } from 'sonner';
import { DataTable, Column } from '@/components/DataTable';
import Markdown from 'react-markdown';

export default function MasterObat() {
  const [items, setItems] = React.useState<Obat[]>([]);
  const [kategoris, setKategoris] = React.useState<Kategori[]>([]);
  const [satuans, setSatuans] = React.useState<Satuan[]>([]);
  const [settings, setSettings] = React.useState(dataService.getSettings());
  const [isDialogOpen, setIsDialogOpen] = React.useState(false);
  const [editingId, setEditingId] = React.useState<string | null>(null);
  
  const [isAnalyzing, setIsAnalyzing] = React.useState(false);
  const [aiAnalysis, setAiAnalysis] = React.useState<string | null>(null);
  const [isAIModalOpen, setIsAIModalOpen] = React.useState(false);
  const [selectedObat, setSelectedObat] = React.useState<Obat | null>(null);

  const [formData, setFormData] = React.useState<Omit<Obat, 'id' | 'created_at'>>({
    kode: '',
    nama: '',
    satuan: '',
    kategori: '',
    stokTotal: 0,
    minStok: 10,
    hargaBeli: 0,
    hargaJual: 0,
    deskripsi: '',
  });

  React.useEffect(() => {
    loadData();
    setKategoris(dataService.getKategori());
    setSatuans(dataService.getSatuan());
  }, []);

  const loadData = () => {
    setItems(dataService.getObat());
  };

  const columns: Column<Obat>[] = [
    { header: 'Kode', accessorKey: 'kode', className: 'font-mono text-xs font-semibold w-[120px]' },
    { header: 'Nama Obat', accessorKey: 'nama', className: 'font-medium' },
    { 
      header: 'Kategori', 
      cell: (item) => <Badge variant="outline" className="font-normal">{item.kategori}</Badge>
    },
    { header: 'Satuan', accessorKey: 'satuan', align: 'center' },
    { 
      header: 'Stok', 
      align: 'right',
      cell: (item) => (
        <span className={item.stokTotal <= item.minStok ? 'text-destructive font-bold' : 'font-semibold'}>
          {item.stokTotal}
        </span>
      )
    },
    { 
      header: 'Status', 
      align: 'right',
      cell: (item) => (
        item.stokTotal <= item.minStok ? (
          <Badge variant="destructive" className="animate-pulse">Stok Rendah</Badge>
        ) : (
          <Badge variant="secondary" className="bg-green-100 text-green-700 hover:bg-green-100 border-green-200">Normal</Badge>
        )
      )
    },
    { 
      header: 'Aksi', 
      align: 'right',
      className: 'w-[140px]',
      cell: (item) => (
        <div className="flex items-center justify-end gap-1">
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-8 px-2 text-orange-600 hover:text-orange-700 hover:bg-orange-50 gap-1.5"
            onClick={() => handleAIAnalysis(item)}
            title="Analisis Interaksi Obat (AI)"
          >
            <Sparkles size={14} />
            <span className="text-[10px] font-bold uppercase tracking-tight">AI Analisis</span>
          </Button>
          <Button 
            variant="ghost" 
            size="icon" 
            className="h-8 w-8 text-blue-600 hover:text-blue-700 hover:bg-blue-50"
            onClick={() => handleEdit(item)}
          >
            <Edit size={16} />
          </Button>
        </div>
      )
    },
  ];

  const handleAIAnalysis = async (obat: Obat) => {
    setSelectedObat(obat);
    setIsAIModalOpen(true);
    setIsAnalyzing(true);
    setAiAnalysis(null);
    
    try {
      const result = await aiService.getDrugInfo(obat.nama);
      setAiAnalysis(result);
    } catch (error) {
      toast.error('Gagal mendapatkan analisis AI');
    } finally {
      setIsAnalyzing(false);
    }
  };

  const resetForm = () => {
    setFormData({
      kode: '',
      nama: '',
      satuan: '',
      kategori: '',
      stokTotal: 0,
      minStok: 10,
      hargaBeli: 0,
      hargaJual: 0,
      deskripsi: '',
    });
    setEditingId(null);
  };

  const handleOpenAdd = () => {
    resetForm();
    const nextNum = items.length + 1;
    const autoKode = `OB-${nextNum.toString().padStart(3, '0')}`;
    setFormData(prev => ({ ...prev, kode: autoKode }));
    setIsDialogOpen(true);
  };

  const handleEdit = (item: Obat) => {
    setFormData({
      kode: item.kode,
      nama: item.nama,
      satuan: item.satuan,
      kategori: item.kategori,
      stokTotal: item.stokTotal,
      minStok: item.minStok,
      hargaBeli: item.hargaBeli,
      hargaJual: item.hargaJual,
      deskripsi: item.deskripsi || '',
    });
    setEditingId(item.id);
    setIsDialogOpen(true);
  };

  const handleBeliChange = (val: number) => {
    const margin = settings.persenMargin / 100;
    const autoJual = Math.round(val * (1 + margin));
    setFormData({ ...formData, hargaBeli: val, hargaJual: autoJual });
  };

  const handleSave = () => {
    try {
      if (editingId) {
        dataService.updateObat(editingId, formData);
        toast.success('Obat berhasil diperbarui');
      } else {
        dataService.addObat({ ...formData, created_at: Date.now() });
        toast.success('Obat berhasil ditambahkan');
      }
      setIsDialogOpen(false);
      loadData();
      resetForm();
    } catch (error) {
      toast.error('Gagal menyimpan data');
    }
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Hapus data obat?',
      text: 'Data yang dihapus tidak dapat dikembalikan!',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      cancelButtonColor: '#6b7280',
      confirmButtonText: 'Ya, Hapus!',
      cancelButtonText: 'Batal'
    }).then((result) => {
      if (result.isConfirmed) {
        dataService.deleteObat(id);
        toast.success('Data obat berhasil dihapus');
        loadData();
      }
    });
  };

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Master Data Obat</h1>
          <p className="text-muted-foreground mt-1">Daftar sediaan farmasi dan manajemen stok pusat.</p>
        </div>
        <Button onClick={handleOpenAdd} className="gap-2 shadow-sm">
          <Plus size={18} />
          <span>Tambah Obat</span>
        </Button>
      </div>

      <DataTable 
        data={items} 
        columns={columns} 
        searchPlaceholder="Cari kode atau nama obat..." 
      />

      {/* AI Analysis Modal */}
      <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
        <DialogContent className="sm:max-w-[700px] max-h-[90vh] flex flex-col p-0 overflow-hidden border-orange-200">
          <div className="bg-orange-50/50 border-b border-orange-100 p-6 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-orange-600 p-2 rounded-xl text-white shadow-md shadow-orange-200">
                <Bot size={24} />
              </div>
              <div>
                <DialogTitle className="text-xl font-bold text-orange-950">Analisis Interaksi Obat</DialogTitle>
                <p className="text-xs text-orange-700 font-medium opacity-80 uppercase tracking-wider">Clinical Insight & Risk Mitigation (Gemini AI)</p>
              </div>
            </div>
            {selectedObat && (
              <Badge variant="outline" className="bg-white border-orange-200 text-orange-700 px-3 py-1 font-mono">
                {selectedObat.kode}
              </Badge>
            )}
          </div>
          
          <div className="flex-1 overflow-y-auto p-6 scrollbar-thin scrollbar-thumb-orange-200">
            {selectedObat && (
              <div className="mb-6 grid grid-cols-3 gap-4 p-4 rounded-xl bg-slate-50 border border-slate-100 italic">
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Nama Obat</p>
                  <p className="text-sm font-bold text-slate-700">{selectedObat.nama}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Kategori</p>
                  <p className="text-sm font-semibold text-slate-600">{selectedObat.kategori}</p>
                </div>
                <div className="space-y-1">
                  <p className="text-[10px] text-muted-foreground uppercase font-bold tracking-tight">Bentuk Sediaan</p>
                  <p className="text-sm font-semibold text-slate-600">{selectedObat.satuan}</p>
                </div>
              </div>
            )}

            {isAnalyzing ? (
              <div className="flex flex-col items-center justify-center py-20 gap-4">
                <div className="relative">
                  <Loader2 size={48} className="animate-spin text-orange-600 opacity-20" />
                  <Sparkles size={20} className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-orange-500 animate-pulse" />
                </div>
                <div className="text-center space-y-1">
                  <p className="text-sm font-bold text-slate-700 uppercase tracking-widest">Analisis Interaksi Obat...</p>
                  <p className="text-xs text-muted-foreground">Mengevaluasi risiko klinis dan farmakogenetik...</p>
                </div>
              </div>
            ) : aiAnalysis ? (
              <div className="prose prose-sm prose-slate max-w-none prose-headings:text-orange-900 prose-headings:font-black prose-headings:tracking-tight prose-h3:border-l-4 prose-h3:border-orange-500 prose-h3:pl-3 prose-h3:bg-orange-50/30 prose-h3:py-1 prose-h3:mt-8 markdown-body bg-white p-2 rounded-lg">
                <Markdown>{aiAnalysis}</Markdown>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-10 text-center">
                 <AlertCircle size={40} className="text-destructive opacity-20 mb-2" />
                 <p className="text-muted-foreground italic">Terjadi masalah saat memuat analisis AI.</p>
                 <Button variant="link" onClick={() => handleAIAnalysis(selectedObat!)} className="text-orange-600">Coba Lagi</Button>
              </div>
            )}
          </div>

          <div className="bg-slate-50 border-t border-slate-100 p-4">
            <div className="flex flex-col items-center gap-3">
              <p className="text-[10px] text-slate-500 text-center leading-relaxed max-w-[500px]">
                <span className="font-bold text-slate-600">MEDICAL DISCLAIMER:</span> Insight ini dihasilkan oleh kecerdasan buatan untuk tujuan pendukung keputusan. 
                Selalu konsultasikan dengan apoteker atau dokter untuk keputusan klinis dan interaksi obat yang tepat pada pasien. 
                Data stok dan kategori produk di aplikasi ini bersifat administratif.
              </p>
              <Button 
                onClick={() => setIsAIModalOpen(false)} 
                className="w-full sm:w-auto px-8 bg-slate-900 hover:bg-slate-800 text-white rounded-full shadow-lg"
              >
                Selesai & Tutup
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Form Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>{editingId ? 'Edit Data Obat' : 'Tambah Data Obat Baru'}</DialogTitle>
          </DialogHeader>
          <div className="grid gap-6 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="kode">Kode Obat (Otomatis)</Label>
                <Input 
                  id="kode" 
                  placeholder="Generating..." 
                  value={formData.kode}
                  readOnly
                  className="bg-muted font-mono"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="nama">Nama Obat</Label>
                <Input 
                  id="nama" 
                  placeholder="Nama sediaan"
                  value={formData.nama}
                  onChange={(e) => setFormData({...formData, nama: e.target.value})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="satuan">Satuan</Label>
                <SearchableSelect 
                  options={satuans.map(s => ({ value: s.nama, label: s.nama }))}
                  value={formData.satuan}
                  onValueChange={(v) => setFormData({...formData, satuan: v})}
                  placeholder="Pilih Satuan"
                  className="w-full md:min-w-[180px]"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="kategori">Kategori</Label>
                <SearchableSelect 
                  options={kategoris.map(k => ({ value: k.nama, label: k.nama }))}
                  value={formData.kategori}
                  onValueChange={(v) => setFormData({...formData, kategori: v})}
                  placeholder="Pilih Kategori"
                  className="w-full md:min-w-[180px]"
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="hargaBeli">Harga Beli</Label>
                <Input 
                  id="hargaBeli" 
                  type="number"
                  value={formData.hargaBeli}
                  onChange={(e) => handleBeliChange(Number(e.target.value))}
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="hargaJual">Harga Jual</Label>
                <Input 
                  id="hargaJual" 
                  type="number"
                  value={formData.hargaJual}
                  onChange={(e) => setFormData({...formData, hargaJual: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="minStok">Minimum Stok</Label>
                <Input 
                  id="minStok" 
                  type="number"
                  value={formData.minStok}
                  onChange={(e) => setFormData({...formData, minStok: Number(e.target.value)})}
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label htmlFor="deskripsi">Deskripsi Obat</Label>
              <Input 
                id="deskripsi" 
                placeholder="Keterangan tambahan..."
                value={formData.deskripsi}
                onChange={(e) => setFormData({...formData, deskripsi: e.target.value})}
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Batal</Button>
            <Button onClick={handleSave}>{editingId ? 'Simpan Perubahan' : 'Simpan Data'}</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

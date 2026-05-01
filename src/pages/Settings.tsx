import React from 'react';
import { dataService } from '@/services/dataService';
import { AppSettings } from '@/types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { Save, Building2, UserCog, Percent, Image as ImageIcon, Download, Upload, Trash2, Database } from 'lucide-react';
import Swal from 'sweetalert2';

export default function Settings() {
  const [settings, setSettings] = React.useState<AppSettings>(dataService.getSettings());

  const handleSave = () => {
    dataService.updateSettings(settings);
    toast.success('Pengaturan berhasil disimpan');
    // Refresh to apply changes if needed, but usually state is enough
  };

  const handleExport = () => {
    const data = dataService.exportData();
    const blob = new Blob([data], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `farmasi_backup_${new Date().toISOString().split('T')[0]}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    toast.success('Backup data berhasil diunduh');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      Swal.fire({
        title: 'Konfirmasi Impor',
        text: 'Mengimpor data akan menimpa data yang ada di sistem saat ini. Lanjutkan?',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonText: 'Ya, Impor Data',
        cancelButtonText: 'Batal',
        confirmButtonColor: '#2563eb'
      }).then((result) => {
        if (result.isConfirmed) {
          const success = dataService.importData(content);
          if (success) {
            toast.success('Data berhasil diimpor! Halaman akan dimuat ulang.');
            setTimeout(() => window.location.reload(), 1500);
          } else {
            toast.error('Gagal mengimpor data. Format file tidak valid.');
          }
        }
      });
    };
    reader.readAsText(file);
  };

  const handleClearData = () => {
    Swal.fire({
      title: 'Hapus SEMUA Data?',
      text: 'Tindakan ini akan menghapus seluruh data transaksi, stok, dan master. Data tidak bisa dikembalikan!',
      icon: 'error',
      showCancelButton: true,
      confirmButtonText: 'Ya, Hapus Permanen',
      cancelButtonText: 'Batal',
      confirmButtonColor: '#d33'
    }).then((result) => {
      if (result.isConfirmed) {
        localStorage.clear();
        toast.success('Semua data telah dihapus.');
        setTimeout(() => window.location.reload(), 1000);
      }
    });
  };

  const handleLogoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 1024 * 1024) { // 1MB limit
        toast.error('Ukuran logo terlalu besar (maks 1MB)');
        return;
      }
      const reader = new FileReader();
      reader.onloadend = () => {
        setSettings({ ...settings, logoKlinik: reader.result as string });
      };
      reader.readAsDataURL(file);
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10" id="settings-page">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Pengaturan Aplikasi</h1>
          <p className="text-muted-foreground">Kelola informasi klinik, margin harga, dan identitas apotek.</p>
        </div>
        <Button onClick={handleSave} className="gap-2">
          <Save size={18} /> Simpan Perubahan
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Informasi Klinik */}
        <Card id="clinic-info-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Building2 className="text-primary" size={20} />
              <CardTitle>Informasi Klinik / RS</CardTitle>
            </div>
            <CardDescription>Nama dan alamat yang akan tampil di kop surat/nota.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama-klinik">Nama Klinik / Rumah Sakit</Label>
              <Input 
                id="nama-klinik" 
                value={settings.namaKlinik} 
                onChange={(e) => setSettings({ ...settings, namaKlinik: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="alamat-klinik">Alamat Lengkap</Label>
              <Input 
                id="alamat-klinik" 
                value={settings.alamatKlinik} 
                onChange={(e) => setSettings({ ...settings, alamatKlinik: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="telp-klinik">Nomor Telepon</Label>
              <Input 
                id="telp-klinik" 
                value={settings.teleponKlinik} 
                onChange={(e) => setSettings({ ...settings, teleponKlinik: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Logo */}
        <Card id="logo-setting-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <ImageIcon className="text-primary" size={20} />
              <CardTitle>Logo Klinik</CardTitle>
            </div>
            <CardDescription>Upload logo untuk tampilan di laporan dan nota.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4 flex flex-col items-center">
            <div className="w-32 h-32 border-2 border-dashed rounded-lg flex items-center justify-center overflow-hidden bg-muted/20">
              {settings.logoKlinik ? (
                <img src={settings.logoKlinik} alt="Logo" className="w-full h-full object-contain" referrerPolicy="no-referrer" />
              ) : (
                <ImageIcon size={40} className="text-muted-foreground" />
              )}
            </div>
            <div className="w-full">
              <Label htmlFor="logo-upload" className="cursor-pointer">
                <div className="flex items-center justify-center gap-2 w-full h-10 border rounded-md hover:bg-muted transition-colors">
                   Pilih File Logo
                </div>
                <Input 
                  id="logo-upload" 
                  type="file" 
                  accept="image/*" 
                  className="hidden" 
                  onChange={handleLogoUpload}
                />
              </Label>
              <p className="text-[10px] text-muted-foreground mt-2 text-center text-red-500 font-medium">*Direkomendasikan rasio 1:1 format PNG/JPG</p>
            </div>
          </CardContent>
        </Card>

        {/* Penanggung Jawab */}
        <Card id="responsible-person-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <UserCog className="text-primary" size={20} />
              <CardTitle>Penanggung Jawab (Apoteker)</CardTitle>
            </div>
            <CardDescription>Identitas apoteker pengelola apotek (APA).</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="nama-pj">Nama Lengkap & Gelar</Label>
              <Input 
                id="nama-pj" 
                placeholder="cth: Apt. John Doe, S.Farm"
                value={settings.namaPenanggungJawab} 
                onChange={(e) => setSettings({ ...settings, namaPenanggungJawab: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="no-sipa">Nomor SIPA</Label>
              <Input 
                id="no-sipa" 
                placeholder="cth: 1990xxxx/SIPA_34.71/2023/xxx"
                value={settings.noSIPA} 
                onChange={(e) => setSettings({ ...settings, noSIPA: e.target.value })}
              />
            </div>
          </CardContent>
        </Card>

        {/* Keuangan & Pajak */}
        <Card id="financial-settings-card">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Percent className="text-primary" size={20} />
              <CardTitle>Pajak & Margin Keuntungan</CardTitle>
            </div>
            <CardDescription>Default kalkulasi untuk harga jual dan pembelian.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="persen-ppn">Persen PPN (%)</Label>
              <Input 
                id="persen-ppn" 
                type="number"
                value={settings.persenPPN} 
                onChange={(e) => setSettings({ ...settings, persenPPN: Number(e.target.value) })}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="persen-margin">Default Margin Jual (%)</Label>
              <Input 
                id="persen-margin" 
                type="number"
                value={settings.persenMargin} 
                onChange={(e) => setSettings({ ...settings, persenMargin: Number(e.target.value) })}
              />
              <p className="text-[10px] text-muted-foreground mt-1 text-slate-400">Margin akan digunakan sebagai default saat input master obat baru.</p>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-10">
        <Card id="backup-card" className="border-2 border-primary/10 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Database className="text-primary" size={20} />
              <CardTitle>Ekspor & Cadangkan Data</CardTitle>
            </div>
            <CardDescription>Simpan seluruh data sistem ke dalam file lokal .json</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-sm text-muted-foreground leading-relaxed">
              Database disimpan di memori browser lokal Anda. Sangat disarankan untuk melakukan ekspor data secara berkala agar aman jika cache browser dibersihkan.
            </p>
            <Button variant="outline" className="w-full h-12 gap-2 border-primary/20 hover:bg-primary/5 hover:text-primary transition-all font-bold" onClick={handleExport}>
              <Download size={18} /> Unduh File Database (.json)
            </Button>
          </CardContent>
        </Card>

        <Card id="restore-card" className="border-2 border-blue-500/10 shadow-sm">
          <CardHeader>
            <div className="flex items-center gap-2">
              <Upload className="text-blue-600" size={20} />
              <CardTitle>Impor & Pulihkan Data</CardTitle>
            </div>
            <CardDescription>Unggah file backup untuk memulihkan database sistem.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="import-file" className="text-xs font-bold text-slate-500 uppercase">Pilih File Backup</Label>
              <Input id="import-file" type="file" accept=".json" onChange={handleImport} className="cursor-pointer" />
            </div>
            <div className="pt-4 border-t border-dashed">
              <Button variant="outline" className="w-full text-destructive border-destructive/20 hover:bg-red-50 hover:text-destructive transition-all gap-2 text-xs font-bold uppercase tracking-wider" onClick={handleClearData}>
                <Trash2 size={16} /> Reset Seluruh Sistem (Danger)
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pb-20">
        <Card className="border-2 shadow-sm">
          <CardHeader>
            <CardTitle>Keyboard Shortcuts</CardTitle>
            <CardDescription>Jalan pintas untuk pengoperasian sistem lebih cepat</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              {[
                { keys: ["Ctrl", "K"], desc: "Buka Command Palette / Pencarian" },
                { keys: ["Ctrl", "S"], desc: "Simpan Form / Document" },
                { keys: ["Ctrl", "P"], desc: "Print Laporan / Dokumen" },
                { keys: ["Esc"], desc: "Tutup Modal / Batal" },
              ].map((s, i) => (
                <div key={i} className="flex justify-between items-center text-sm py-2 border-b last:border-0 border-dashed">
                  <span className="text-muted-foreground">{s.desc}</span>
                  <div className="flex gap-1">
                    {s.keys.map((k, j) => (
                      <kbd key={j} className="px-1.5 py-0.5 rounded border bg-muted font-mono text-[10px] font-bold shadow-sm">{k}</kbd>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="border-2 shadow-sm relative overflow-hidden group">
          <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full -mr-16 -mt-16 group-hover:bg-primary/10 transition-all" />
          <CardHeader>
            <CardTitle>Integrasi AI (Gemini)</CardTitle>
            <CardDescription>Pengaturan kecerdasan buatan untuk farmasi</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="p-4 rounded-xl bg-slate-50 border border-slate-100 italic text-sm text-slate-500">
               "Gemini melayani fitur Smart Dashboard, Smart Reorder, dan Analisis Klinis Obat secara otomatis."
            </div>
            <Button variant="outline" className="w-full gap-2 border-primary/20 text-primary font-bold">
               Cek Koneksi Gemini API
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

import React from 'react';
import { ArrowUpCircle, ArrowDownCircle, RefreshCw, FileText, Filter } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { SearchableSelect } from '@/components/SearchableSelect';
import { dataService } from '@/services/dataService';
import { MutasiStok, Obat } from '@/types';
import { format } from 'date-fns';
import { cn } from '@/lib/utils';
import { DataTable, Column } from '@/components/DataTable';

export default function KartuStok() {
  const [obats, setObats] = React.useState<Obat[]>([]);
  const [selectedObat, setSelectedObat] = React.useState<string>('');
  const [mutasi, setMutasi] = React.useState<MutasiStok[]>([]);
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    setObats(dataService.getObat());
  }, []);

  React.useEffect(() => {
    setIsLoading(true);
    setTimeout(() => {
      // Always show newest transactions at top for the audit log
      const list = selectedObat 
        ? dataService.getMutasi(selectedObat)
        : dataService.getMutasi();
      
      setMutasi(list.sort((a, b) => b.tanggal - a.tanggal));
      setIsLoading(false);
    }, 300);
  }, [selectedObat]);

  const getTipeIcon = (tipe: string) => {
    switch (tipe) {
      case 'Masuk': return <ArrowUpCircle className="text-emerald-500 shrink-0" size={16} />;
      case 'Keluar': return <ArrowDownCircle className="text-destructive shrink-0" size={16} />;
      case 'Opname': return <FileText className="text-amber-500 shrink-0" size={16} />;
      case 'Pindah': return <RefreshCw className="text-blue-500 shrink-0" size={16} />;
      default: return null;
    }
  };

  const columns: Column<MutasiStok>[] = [
    { 
      header: 'Waktu Transaksi', 
      cell: (item) => format(item.tanggal, 'dd MMM yyyy HH:mm'),
      className: 'whitespace-nowrap font-mono text-[11px] text-muted-foreground w-[150px]'
    },
    ...(!selectedObat ? [{ 
      header: 'Item', 
      cell: (item: MutasiStok) => obats.find(o => o.id === item.obatId)?.nama || 'Deleted Item',
      className: 'font-medium text-xs'
    }] : []),
    { 
      header: 'Jenis', 
      cell: (item) => (
        <div className="flex items-center gap-2">
          {getTipeIcon(item.tipe)}
          <span className="text-[10px] uppercase font-bold tracking-tighter opacity-70">{item.tipe}</span>
        </div>
      )
    },
    { 
      header: 'Saldo Awal', 
      accessorKey: 'saldoAwal', 
      align: 'right',
      className: 'font-mono text-sm opacity-60 italic' 
    },
    { 
      header: 'Mutasi', 
      align: 'right',
      className: 'w-[100px]',
      cell: (item) => (
        <div className={cn(
          "inline-flex items-center justify-end w-full px-2 py-1 rounded text-sm font-black font-mono",
          item.tipe === 'Masuk' || (item.tipe === 'Opname' && item.saldoAkhir > item.saldoAwal) 
            ? 'text-emerald-700 bg-emerald-50' 
            : 'text-rose-700 bg-rose-50'
        )}>
          { (item.tipe === 'Masuk' || (item.tipe === 'Opname' && item.saldoAkhir > item.saldoAwal)) ? '+' : '-'}{item.jumlah}
        </div>
      )
    },
    { 
      header: 'Saldo Akhir', 
      accessorKey: 'saldoAkhir', 
      align: 'right',
      className: 'font-black font-mono text-base bg-muted/10' 
    },
    { 
      header: 'Referensi / Ket', 
      cell: (item) => (
        <div className="flex flex-col">
          <span className="font-bold text-[10px] text-primary">{item.referensiNomor}</span>
          <span className="text-[10px] text-muted-foreground line-clamp-1 italic">{item.keterangan}</span>
        </div>
      ),
      className: 'w-[200px]'
    },
  ];

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Kartu Stok</h1>
          <p className="text-muted-foreground mt-1">Lacak setiap pergerakan obat untuk audit dan verifikasi stok pusat.</p>
        </div>
        <div className="flex items-center gap-2">
          {selectedObat && (
            <div className="bg-primary/10 text-primary px-4 py-2 rounded-lg border border-primary/20 flex items-center gap-4">
              <div className="text-xs font-bold uppercase tracking-wider opacity-60">Sisa Stok Saat Ini</div>
              <div className="text-2xl font-black">{obats.find(o => o.id === selectedObat)?.stokTotal}</div>
            </div>
          )}
        </div>
      </div>

      <div className="flex flex-col md:flex-row gap-4 bg-card p-5 rounded-xl border shadow-sm items-end">
        <div className="flex-1 space-y-2">
          <label className="text-sm font-bold flex items-center gap-2">
             <Filter size={14} /> Pilih Sediaan Obat
          </label>
          <SearchableSelect 
            options={[
              { value: "", label: "Tampilkan Semua Pergerakan" },
              ...obats.map(o => ({ value: o.id, label: `${o.nama} (${o.kode})` }))
            ]}
            value={selectedObat}
            onValueChange={setSelectedObat}
            placeholder="Pilih obat untuk audit..."
            className="h-11 border-2 w-full md:w-[400px]"
          />
        </div>
        <Button variant="outline" size="lg" className="h-11" onClick={() => setSelectedObat('')}>Bersihkan Filter</Button>
      </div>

      <DataTable 
        data={mutasi} 
        columns={columns} 
        isLoading={isLoading}
        searchPlaceholder="Cari referensi atau keterangan..."
      />
    </div>
  );
}

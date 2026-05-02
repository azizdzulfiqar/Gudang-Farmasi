import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from '@/components/SearchableSelect';
import { dataService } from '@/services/dataService';
import { SuratPesanan, Supplier } from '@/types';
import { format } from 'date-fns';
import { pdfService } from '@/services/pdfService';
import { exportService } from '@/services/exportService';
import { DataTable, Column } from '@/components/DataTable';

export default function RekapSuratPesananPage() {
  const [sps, setSps] = React.useState<SuratPesanan[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [filterStartDate, setFilterStartDate] = React.useState(format(new Date(), 'yyyy-MM-01'));
  const [filterEndDate, setFilterEndDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterSupplier, setFilterSupplier] = React.useState('all');
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setSps(dataService.getSP());
      setSuppliers(dataService.getSuppliers());
      setIsLoading(false);
    }, 500);
  };

  const filteredSPs = sps.filter(item => {
    const itemDate = format(new Date(item.tanggal), 'yyyy-MM-dd');
    const dateMatch = itemDate >= filterStartDate && itemDate <= filterEndDate;
    const supplierMatch = filterSupplier === 'all' || item.supplierId === filterSupplier;
    return dateMatch && supplierMatch;
  });

  const columns: Column<SuratPesanan>[] = [
    { header: 'No', cell: (_, idx) => <span>{idx + 1}</span>, className: 'w-12 text-center' },
    { 
      header: 'Tanggal', 
      cell: (item) => format(new Date(item.tanggal), 'dd/MM/yyyy') 
    },
    { header: 'No. SP', accessorKey: 'nomor', className: 'font-mono' },
    { header: 'Distributor', accessorKey: 'supplierNama' },
    { header: 'Item', cell: (item) => item.items.length, align: 'center' },
    { header: 'Status', accessorKey: 'status', align: 'center' },
  ];

  const handleExport = () => {
    const headers = ['NO', 'TANGGAL', 'NOMOR SP', 'DISTRIBUTOR', 'JUMLAH ITEM', 'STATUS'];
    const body = filteredSPs.map((item, idx) => [
      idx + 1,
      format(new Date(item.tanggal), 'dd/MM/yyyy'),
      item.nomor,
      item.supplierNama,
      item.items.length,
      item.status
    ]);
    
    pdfService.generateTablePDF('Rekap Surat Pesanan (SP)', headers, body);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'Tanggal', 'Nomor SP', 'Distributor', 'Jumlah Item', 'Status'];
    const rows = filteredSPs.map((item, idx) => [
      idx + 1,
      format(new Date(item.tanggal), 'yyyy-MM-dd'),
      item.nomor,
      item.supplierNama,
      item.items.length,
      item.status
    ]);
    exportService.exportToCSV('Rekap_Surat_Pesanan', headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Tanggal Mulai :</Label>
            <Input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Tanggal Akhir :</Label>
            <Input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Supplier :</Label>
            <SearchableSelect 
              options={[
                { value: "all", label: "Semua" },
                ...suppliers.map(s => ({ value: s.id, label: s.nama }))
              ]}
              value={filterSupplier}
              onValueChange={setFilterSupplier}
              placeholder="Semua"
              className="h-9 w-full md:min-w-[200px]"
            />
          </div>
          <div className="flex items-end gap-2">
            <Button onClick={loadData} className="h-9 px-6 bg-blue-600 hover:bg-blue-700 text-white gap-2">
              {isLoading ? <Loader2 className="animate-spin" size={16} /> : null} Lihat
            </Button>
            <div className="flex bg-slate-100 p-1 rounded-md border border-slate-200">
              <Button 
                onClick={handleExport} 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-[10px] font-bold hover:bg-white hover:text-primary transition-all"
              >
                PDF
              </Button>
              <Button 
                onClick={handleExportCSV} 
                variant="ghost" 
                size="sm" 
                className="h-7 px-2 text-[10px] font-bold hover:bg-white hover:text-primary transition-all"
              >
                CSV
              </Button>
            </div>
          </div>
        </div>
      </div>

      <DataTable 
        data={filteredSPs} 
        columns={columns} 
        isLoading={isLoading}
        searchPlaceholder="Cari nomor SP atau supplier..."
      />
    </div>
  );
}

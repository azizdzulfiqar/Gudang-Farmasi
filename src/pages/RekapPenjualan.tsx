import React from 'react';
import { Download, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableRow, TableCell, TableFooter } from "@/components/ui/table";
import { Label } from "@/components/ui/label";
import { dataService } from '@/services/dataService';
import { Transaksi } from '@/types';
import { format } from 'date-fns';
import { pdfService } from '@/services/pdfService';
import { exportService } from '@/services/exportService';
import { DataTable, Column } from '@/components/DataTable';

export default function RekapPenjualanPage() {
  const [txs, setTxs] = React.useState<Transaksi[]>([]);
  const [filterStartDate, setFilterStartDate] = React.useState(format(new Date(), 'yyyy-MM-01'));
  const [filterEndDate, setFilterEndDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setTxs(dataService.getTransaksi());
      setIsLoading(false);
    }, 500);
  };

  const filteredTxs = txs.filter(item => {
    const itemDate = format(new Date(item.tanggal), 'yyyy-MM-dd');
    return itemDate >= filterStartDate && itemDate <= filterEndDate;
  });

  const totalSales = filteredTxs.reduce((sum, t) => sum + (t.total || 0), 0);

  const columns: Column<Transaksi>[] = [
    { header: 'No', cell: (_, idx) => idx + 1, className: 'w-12 text-center' },
    { 
      header: 'Tanggal', 
      cell: (item) => format(new Date(item.tanggal), 'dd/MM/yyyy HH:mm') 
    },
    { header: 'No. Transaksi', accessorKey: 'nomor', className: 'font-mono' },
    { header: 'Tipe', accessorKey: 'tipe', className: 'capitalize' },
    { 
      header: 'Total Transaksi', 
      align: 'right', 
      className: 'font-bold text-primary',
      cell: (item) => `Rp ${(item.total || 0).toLocaleString()}` 
    },
  ];

  const tableFooter = (
    <TableRow className="bg-slate-800 hover:bg-slate-800 border-none">
      <TableCell colSpan={4} className="text-white text-xs font-bold py-2">Grand Total Penjualan</TableCell>
      <TableCell className="text-white text-xs font-bold text-right border-l border-slate-700">Rp {totalSales.toLocaleString()}</TableCell>
    </TableRow>
  );

  const handleExport = () => {
    const headers = ['NO', 'TANGGAL', 'NOMOR TRANSAKSI', 'TIPE', 'CUSTOMER', 'TOTAL (RP)'];
    const body = filteredTxs.map((t, idx) => [
      idx + 1,
      format(new Date(t.tanggal), 'dd/MM/yyyy HH:mm'),
      t.nomor,
      t.tipe,
      t.customerNama || '-',
      t.total.toLocaleString()
    ]);
    const footer = ['', '', '', '', 'GRAND TOTAL PENJUALAN', `Rp ${totalSales.toLocaleString()}`];
    
    pdfService.generateTablePDF('Rekap Penjualan Peresepan', headers, body, footer);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'Tanggal', 'Nomor Transaksi', 'Tipe', 'Customer', 'Total'];
    const rows = filteredTxs.map((t, idx) => [
      idx + 1,
      format(new Date(t.tanggal), 'yyyy-MM-dd HH:mm'),
      t.nomor,
      t.tipe,
      t.customerNama || '-',
      t.total
    ]);
    exportService.exportToCSV('Rekap_Penjualan', headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold tracking-tight">Rekap Penjualan / Peresepan</h1>
      </div>

      <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Tanggal Mulai :</Label>
            <Input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="h-9" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Tanggal Akhir :</Label>
            <Input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="h-9" />
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
        data={filteredTxs} 
        columns={columns} 
        isLoading={isLoading} 
        footer={tableFooter}
        searchPlaceholder="Cari nomor transaksi..."
      />
    </div>
  );
}

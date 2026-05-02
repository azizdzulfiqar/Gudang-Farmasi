import React from 'react';
import { 
  Download,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { TableRow, TableCell, TableFooter } from "@/components/ui/table";
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import { SearchableSelect } from '@/components/SearchableSelect';
import { dataService } from '@/services/dataService';
import { BAPB, Obat, Supplier, Lokasi } from '@/types';
import { format } from 'date-fns';
import { pdfService } from '@/services/pdfService';
import { exportService } from '@/services/exportService';
import { DataTable, Column } from '@/components/DataTable';
import { cn } from '@/lib/utils';

export default function RekapBAPBPage() {
  const [bapbs, setBapbs] = React.useState<BAPB[]>([]);
  const [obats, setObats] = React.useState<Obat[]>([]);
  const [suppliers, setSuppliers] = React.useState<Supplier[]>([]);
  const [lokasis, setLokasis] = React.useState<Lokasi[]>([]);
  
  const [filterStartDate, setFilterStartDate] = React.useState(format(new Date(), 'yyyy-MM-01'));
  const [filterEndDate, setFilterEndDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [filterBAPB, setFilterBAPB] = React.useState('all');
  const [filterBarang, setFilterBarang] = React.useState('all');
  const [filterSediaan, setFilterSediaan] = React.useState('all');
  const [filterSupplier, setFilterSupplier] = React.useState('all');
  const [filterGudang, setFilterGudang] = React.useState('all');

  const [isLoading, setIsLoading] = React.useState(false);

  React.useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      setBapbs(dataService.getBAPB());
      setObats(dataService.getObat());
      setSuppliers(dataService.getSuppliers());
      setLokasis(dataService.getLokasi());
      setIsLoading(false);
    }, 500);
  };

  const filteredBAPBs = bapbs.filter(item => {
    const itemDate = format(new Date(item.tanggal), 'yyyy-MM-dd');
    const dateMatch = itemDate >= filterStartDate && itemDate <= filterEndDate;
    const bapbMatch = filterBAPB === 'all' || item.nomor === filterBAPB;
    const supplierMatch = filterSupplier === 'all' || item.supplierId === filterSupplier;
    
    // Barang filter
    const barangMatch = filterBarang === 'all' || item.items.some(i => i.obatId === filterBarang);
    
    // Sediaan filter (requires joining with obat data)
    const sediaanMatch = filterSediaan === 'all' || item.items.some(i => {
      const obat = obats.find(o => o.id === i.obatId);
      return obat?.kategori?.toUpperCase() === filterSediaan.toUpperCase();
    });
    
    // Gudang filter
    const gudangMatch = filterGudang === 'all' || item.items.some(i => i.lokasiId === filterGudang);

    return dateMatch && bapbMatch && supplierMatch && barangMatch && sediaanMatch && gudangMatch;
  });

  const totals = filteredBAPBs.reduce((acc, item) => {
    const hna = item.items.reduce((sum, i) => sum + (i.jumlah * (i.hargaBeli || 0)), 0);
    return {
      hna: acc.hna + hna,
      diskon: acc.diskon + (item.diskonTotal || 0),
      hpp: acc.hpp + (hna - (item.diskonTotal || 0)),
      ppn: acc.ppn + (item.ppnTotal || 0),
      materai: acc.materai + (item.materaiOngkir || 0),
      total: acc.total + (item.jumlahDibayar || 0)
    };
  }, { hna: 0, diskon: 0, hpp: 0, ppn: 0, materai: 0, total: 0 });

  const columns: Column<BAPB>[] = [
    { header: 'No', cell: (_, idx) => idx + 1, className: 'w-12 text-center' },
    { header: 'Tanggal', cell: (item) => format(new Date(item.tanggal), 'dd/MM/yyyy'), className: 'min-w-[100px]' },
    { 
      header: 'Batas Bayar', 
      cell: (item) => item.tanggalJatuhTempo ? format(new Date(item.tanggalJatuhTempo), 'dd/MM/yyyy') : '-', 
      className: 'min-w-[110px] font-medium text-orange-700' 
    },
    { header: 'Nama Supplier', accessorKey: 'supplierNama', className: 'min-w-[150px] font-medium' },
    { header: 'No BAPB', accessorKey: 'nomor', className: 'min-w-[120px] font-mono' },
    { header: 'No Invoice', accessorKey: 'noInvoice', className: 'min-w-[120px]' },
    { header: 'No Faktur Pajak', accessorKey: 'noFakturPajak', className: 'min-w-[120px]' },
    { 
      header: 'Status', 
      cell: (item) => (
        <Badge className={cn(
          "text-[10px] font-bold px-1.5 py-0.5",
          item.status === 'Paid' ? "bg-blue-100 text-blue-700" : "bg-green-100 text-green-700"
        )}>
          {item.status === 'Paid' ? 'LUNAS' : 'SELESAI'}
        </Badge>
      ),
      className: 'min-w-[80px] text-center'
    },
    { 
      header: 'Harga Beli (HNA)', 
      align: 'right', 
      className: 'min-w-[120px] font-medium',
      cell: (item) => item.items.reduce((sum, i) => sum + (i.jumlah * (i.hargaBeli || 0)), 0).toLocaleString() 
    },
    { 
      header: 'Diskon (Rp)', 
      align: 'right', 
      className: 'min-w-[120px]',
      cell: (item) => (item.diskonTotal || 0).toLocaleString() 
    },
    { 
      header: 'HPP (HB - Diskon)', 
      align: 'right', 
      className: 'min-w-[150px] font-medium',
      cell: (item) => {
        const hna = item.items.reduce((sum, i) => sum + (i.jumlah * (i.hargaBeli || 0)), 0);
        return (hna - (item.diskonTotal || 0)).toLocaleString();
      }
    },
    { header: 'PPN', align: 'right', className: 'min-w-[100px]', cell: (item) => (item.ppnTotal || 0).toLocaleString() },
    { header: 'Materai + Ongkir', align: 'right', className: 'min-w-[120px]', cell: (item) => (item.materaiOngkir || 0).toLocaleString() },
    { header: 'Jumlah Dibayar', align: 'right', className: 'min-w-[120px] font-bold text-primary', cell: (item) => (item.jumlahDibayar || 0).toLocaleString() },
  ];

  const tableFooter = (
    <TableRow className="bg-slate-800 hover:bg-slate-800 border-none">
      <TableCell colSpan={8} className="text-white text-xs font-bold py-2">Grand Total</TableCell>
      <TableCell className="text-white text-xs font-bold text-right border-l border-slate-700">{totals.hna.toLocaleString()}</TableCell>
      <TableCell className="text-white text-xs font-bold text-right border-l border-slate-700">{totals.diskon.toLocaleString()}</TableCell>
      <TableCell className="text-white text-xs font-bold text-right border-l border-slate-700">{totals.hpp.toLocaleString()}</TableCell>
      <TableCell className="text-white text-xs font-bold text-right border-l border-slate-700">{totals.ppn.toLocaleString()}</TableCell>
      <TableCell className="text-white text-xs font-bold text-right border-l border-slate-700">{totals.materai.toLocaleString()}</TableCell>
      <TableCell className="text-white text-xs font-bold text-right border-l border-slate-700">{totals.total.toLocaleString()}</TableCell>
    </TableRow>
  );

  const handleExport = () => {
    const headers = ['NO', 'TANGGAL', 'BATAS BAYAR', 'SUPPLIER', 'NO BAPB', 'NO INVOICE', 'STATUS', 'HNA (RP)', 'DISKON (RP)', 'HPP (RP)', 'JUMLAH DIBAYAR (RP)'];
    const body = filteredBAPBs.map((item, idx) => {
      const hna = item.items.reduce((sum, i) => sum + (i.jumlah * (i.hargaBeli || 0)), 0);
      const hpp = hna - (item.diskonTotal || 0);
      return [
        idx + 1,
        format(new Date(item.tanggal), 'dd/MM/yyyy'),
        item.tanggalJatuhTempo ? format(new Date(item.tanggalJatuhTempo), 'dd/MM/yyyy') : '-',
        item.supplierNama,
        item.nomor,
        item.noInvoice || '-',
        item.status === 'Paid' ? 'LUNAS' : 'SELESAI',
        hna.toLocaleString(),
        (item.diskonTotal || 0).toLocaleString(),
        hpp.toLocaleString(),
        (item.jumlahDibayar || 0).toLocaleString()
      ];
    });
    
    const footer = [
      'TOTAL', '', '', '', '', '', '',
      totals.hna.toLocaleString(), 
      totals.diskon.toLocaleString(), 
      totals.hpp.toLocaleString(), 
      totals.total.toLocaleString()
    ];
    
    pdfService.generateTablePDF('Rekap Penerimaan Barang (BAPB)', headers, body, footer);
  };

  const handleExportCSV = () => {
    const headers = ['No', 'Tanggal', 'Batas Bayar', 'Supplier', 'No BAPB', 'No Invoice', 'Status', 'HNA', 'Diskon', 'HPP', 'Total'];
    const rows = filteredBAPBs.map((item, idx) => {
      const hna = item.items.reduce((sum, i) => sum + (i.jumlah * (i.hargaBeli || 0)), 0);
      const hpp = hna - (item.diskonTotal || 0);
      return [
        idx + 1,
        format(new Date(item.tanggal), 'yyyy-MM-dd'),
        item.tanggalJatuhTempo ? format(new Date(item.tanggalJatuhTempo), 'yyyy-MM-dd') : '-',
        item.supplierNama,
        item.nomor,
        item.noInvoice || '-',
        item.status,
        hna,
        item.diskonTotal || 0,
        hpp,
        item.jumlahDibayar || 0
      ];
    });
    exportService.exportToCSV('Rekap_BAPB', headers, rows);
  };

  return (
    <div className="space-y-6">
      <div className="bg-white p-4 rounded-lg border shadow-sm space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Tanggal Mulai :</Label>
            <Input 
              type="date" 
              value={filterStartDate} 
              onChange={(e) => setFilterStartDate(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Tanggal Akhir :</Label>
            <Input 
              type="date" 
              value={filterEndDate} 
              onChange={(e) => setFilterEndDate(e.target.value)}
              className="h-9"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">BAPB :</Label>
            <SearchableSelect 
              options={[
                { value: "all", label: "%-SEMUA" },
                ...bapbs.map(b => ({ value: b.nomor, label: b.nomor }))
              ]}
              value={filterBAPB}
              onValueChange={setFilterBAPB}
              placeholder="%-SEMUA"
              className="h-9 w-full md:min-w-[150px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Barang :</Label>
            <SearchableSelect 
              options={[
                { value: "all", label: "%-SEMUA" },
                ...obats.map(o => ({ value: o.id, label: o.nama }))
              ]}
              value={filterBarang}
              onValueChange={setFilterBarang}
              placeholder="%-SEMUA"
              className="h-9 w-full md:min-w-[200px]"
            />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold">Bentuk Sediaan :</Label>
            <SearchableSelect 
              options={[
                { value: "all", label: "SEMUA" },
                { value: "TABLET", label: "TABLET" },
                { value: "SIRUP", label: "SIRUP" },
                { value: "KAPSUL", label: "KAPSUL" }
              ]}
              value={filterSediaan}
              onValueChange={setFilterSediaan}
              placeholder="SEMUA"
              className="h-9 w-full md:min-w-[120px]"
            />
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
              className="h-9 w-full md:min-w-[150px]"
            />
          </div>
        </div>

        <div className="flex flex-wrap items-end gap-4 border-t pt-4">
          <div className="space-y-1.5 w-fit text-left">
            <Label className="text-xs font-bold">Gudang :</Label>
            <SearchableSelect 
              options={[
                { value: "all", label: "Semua Gudang" },
                ...lokasis.map(l => ({ value: l.id, label: l.nama }))
              ]}
              value={filterGudang}
              onValueChange={setFilterGudang}
              placeholder="Semua Gudang"
              className="h-9 w-full md:min-w-[150px]"
            />
          </div>
          <div className="flex gap-2">
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
        data={filteredBAPBs} 
        columns={columns} 
        isLoading={isLoading} 
        footer={tableFooter}
        searchPlaceholder="Cari BAPB, Supplier, Invoice, atau Barang..."
      />
    </div>
  );
}

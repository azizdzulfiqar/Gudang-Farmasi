import React from 'react';
import { 
  TrendingUp, 
  ArrowUpRight, 
  Search, 
  Printer, 
  Download,
  AlertTriangle,
  Package,
  Calendar,
  History
} from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { dataService } from '@/services/dataService';
import { format, parseISO } from 'date-fns';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '@/components/ui/table';
import { cn } from '@/lib/utils';

interface InventoryInsightsProps {
  mode?: 'prices' | 'stock';
}

export default function InventoryInsights({ mode: initialMode }: InventoryInsightsProps) {
  const [activeTab, setActiveTab] = React.useState<'prices' | 'stock'>(initialMode || 'prices');
  const [searchTerm, setSearchTerm] = React.useState('');
  const [priceTrends, setPriceTrends] = React.useState<any[]>([]);
  const [stockReport, setStockReport] = React.useState<any[]>([]);

  React.useEffect(() => {
    if (initialMode) {
      setActiveTab(initialMode);
    }
  }, [initialMode]);

  React.useEffect(() => {
    setPriceTrends(dataService.getPriceTrend());
    setStockReport(dataService.getObat());
  }, []);

  const filteredTrends = priceTrends.filter(t => 
    t.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    t.supplier.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const filteredStock = stockReport.filter(s => 
    s.nama.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.kategori.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className={cn("space-y-6", !initialMode && "pb-20")}>
      {!initialMode && (
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 sticky top-0 bg-slate-50/80 backdrop-blur-md py-4 z-10">
          <div>
            <h1 className="text-3xl font-black tracking-tighter text-slate-900">Inventory Intelligence</h1>
            <p className="text-muted-foreground font-medium text-sm">Strategic reports and price fluctuation monitoring.</p>
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" size="sm" onClick={handlePrint} className="rounded-xl font-bold gap-2">
              <Printer size={16} /> Print Report
            </Button>
            <Button size="sm" className="rounded-xl font-bold gap-2 shadow-sm">
              <Download size={16} /> Export PDF
            </Button>
          </div>
        </div>
      )}

      {!initialMode && (
        <div className="flex items-center gap-1 p-1 bg-slate-200/50 rounded-2xl w-fit">
          <button 
            onClick={() => setActiveTab('prices')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-black uppercase tracking-tighter transition-all",
              activeTab === 'prices' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            Anomali Harga
          </button>
          <button 
            onClick={() => setActiveTab('stock')}
            className={cn(
              "px-6 py-2 rounded-xl text-sm font-black uppercase tracking-tighter transition-all",
              activeTab === 'stock' ? "bg-white text-primary shadow-sm" : "text-slate-500 hover:text-slate-800"
            )}
          >
            Kesehatan Stok
          </button>
        </div>
      )}

      <div className="flex items-center gap-4">
        <div className="relative flex-1 group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 group-focus-within:text-primary transition-colors" size={18} />
          <Input 
            placeholder="Cari obat atau supplier..." 
            className="pl-10 h-12 bg-white border-2 rounded-2xl focus-visible:ring-primary/20 shadow-sm"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      {activeTab === 'prices' ? (
        <Card className="border-2 rounded-3xl overflow-hidden shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-800">Rekap Kenaikan Harga</CardTitle>
                <CardDescription>Obat dengan kenaikan harga beli (HNA) signifikan pada transaksi terakhir.</CardDescription>
              </div>
              <TrendingUp className="text-red-500 animate-bounce" size={24} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 py-4">Nama Obat</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Harga Lama</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Harga Baru</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Selisih (%)</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 py-4">Supplier & Tanggal</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredTrends.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={5} className="h-40 text-center">
                      <div className="flex flex-col items-center gap-2 opacity-40">
                         <History size={40} />
                         <p className="font-bold">Tidak ada anomali harga ditemukan</p>
                      </div>
                    </TableCell>
                  </TableRow>
                ) : filteredTrends.map((trend, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-slate-800 py-4">
                      {trend.nama}
                    </TableCell>
                    <TableCell className="text-right font-mono text-slate-400 line-through">
                      Rp {trend.oldPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right font-black text-red-600">
                      Rp {trend.newPrice.toLocaleString()}
                    </TableCell>
                    <TableCell className="text-center">
                      <Badge className="bg-red-50 text-red-600 border-red-100 font-black rounded-lg gap-1">
                        <ArrowUpRight size={10} />
                        {(trend.percentage).toFixed(1)}%
                      </Badge>
                    </TableCell>
                    <TableCell className="py-4">
                      <div className="flex flex-col">
                        <span className="text-xs font-bold text-slate-600">{trend.supplier}</span>
                        <span className="text-[10px] text-slate-400 font-medium">Update: {format(parseISO(trend.lastUpdate), 'dd MMM yyyy')}</span>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      ) : (
        <Card className="border-2 rounded-3xl overflow-hidden shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-800">Laporan Status Stok</CardTitle>
                <CardDescription>Overview ketersediaan stok, nilai aset, dan sediaan per kategori.</CardDescription>
              </div>
              <Package className="text-primary" size={24} />
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-50/50">
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 py-4">Nama Obat</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400">Kategori</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-center">Stok</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Nilai Aset</TableHead>
                  <TableHead className="font-black uppercase text-[10px] tracking-widest text-slate-400 text-right">Status</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredStock.map((item, idx) => (
                  <TableRow key={idx} className="hover:bg-slate-50/50">
                    <TableCell className="font-bold text-slate-800 py-4">
                      {item.nama}
                    </TableCell>
                    <TableCell>
                       <span className="text-[10px] uppercase font-bold text-slate-400 bg-slate-100 px-2 py-0.5 rounded-full">{item.kategori}</span>
                    </TableCell>
                    <TableCell className="text-center">
                      <div className="flex flex-col items-center">
                         <span className={cn(
                           "text-md font-black tabular-nums",
                           item.stokTotal <= item.minStok ? "text-red-600" : "text-slate-800"
                         )}>{item.stokTotal}</span>
                         <span className="text-[10px] text-slate-400 uppercase font-black">{item.satuan}</span>
                      </div>
                    </TableCell>
                    <TableCell className="text-right font-black text-slate-700">
                      Rp {(item.stokTotal * item.hargaBeli).toLocaleString()}
                    </TableCell>
                    <TableCell className="text-right">
                       {item.stokTotal <= item.minStok ? (
                         <div className="flex items-center justify-end gap-1.5 text-red-500 animate-pulse">
                            <AlertTriangle size={14} />
                            <span className="text-[10px] font-black uppercase">Low Stock</span>
                         </div>
                       ) : (
                         <div className="flex items-center justify-end gap-1.5 text-emerald-500">
                            <div className="w-2 h-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black uppercase">Healthy</span>
                         </div>
                       )}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  );
}

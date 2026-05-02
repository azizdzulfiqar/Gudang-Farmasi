import React from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Package, 
  AlertCircle, 
  Download,
  ArrowRight,
  Brain
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { dataService } from '@/services/dataService';
import { pdfService } from '@/services/pdfService';
import { exportService } from '@/services/exportService';
import { Obat, Transaksi } from '@/types';
import { format } from 'date-fns';

export default function LaporanPage() {
  const navigate = useNavigate();
  const [obats, setObats] = React.useState<Obat[]>([]);
  const [txs, setTxs] = React.useState<Transaksi[]>([]);

  React.useEffect(() => {
    setObats(dataService.getObat());
    setTxs(dataService.getTransaksi());
  }, []);

  const totalInvValue = obats.reduce((sum, o) => sum + (o.stokTotal * o.hargaBeli), 0);
  const totalSales = txs.reduce((sum, t) => sum + (t.total || 0), 0);

  const handleExportPDF = () => {
    const headers = ['Kode', 'Nama Sediaan', 'Satuan', 'Stok Fisik', 'Harga Beli', 'Total Nilai'];
    const body = obats.map(o => [
      o.kode,
      o.nama,
      o.satuan,
      o.stokTotal,
      `Rp ${o.hargaBeli.toLocaleString()}`,
      `Rp ${(o.stokTotal * o.hargaBeli).toLocaleString()}`
    ]);
    const footer = ['', '', '', '', 'VALUASI STOK', `Rp ${totalInvValue.toLocaleString()}`];
    pdfService.generateTablePDF('Laporan Valuasi Inventori', headers, body, footer);
  };

  const handleExportCSV = () => {
    const headers = ['Kode', 'Nama Sediaan', 'Satuan', 'Stok Fisik', 'Harga Beli', 'Total Nilai'];
    const rows = obats.map(o => [
      o.kode,
      o.nama,
      o.satuan,
      o.stokTotal,
      o.hargaBeli,
      o.stokTotal * o.hargaBeli
    ]);
    exportService.exportToCSV('Laporan_Inventori', headers, rows);
  };

  return (
    <div className="space-y-8 animate-in slide-in-from-bottom-4 duration-700">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Laporan Strategis</h1>
          <p className="text-muted-foreground mt-1">Analisa performa inventori dan pergerakan obat.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" className="gap-2 border-slate-200" onClick={handleExportPDF}>
            <Download size={18} /> PDF
          </Button>
          <Button variant="outline" className="gap-2 border-slate-200" onClick={handleExportCSV}>
            <Download size={18} /> CSV
          </Button>
        </div>
      </div>

      <div className="grid gap-6 md:grid-cols-3">
        <Card className="bg-gradient-to-br from-primary/5 to-transparent border-primary/10">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-xs font-bold tracking-widest">Valuasi Stok</CardDescription>
            <CardTitle className="text-3xl font-black">Rp {totalInvValue.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp size={12} className="text-green-500" />
              <span>Berdasarkan harga beli saat ini</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500/5 to-transparent border-blue-500/10">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-xs font-bold tracking-widest">Total Sales</CardDescription>
            <CardTitle className="text-3xl font-black">Rp {totalSales.toLocaleString()}</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <TrendingUp size={12} className="text-green-500" />
              <span>{txs.length} Transaksi tercatat</span>
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-destructive/5 to-transparent border-destructive/10">
          <CardHeader className="pb-2">
            <CardDescription className="uppercase text-xs font-bold tracking-widest">Items Under Stock</CardDescription>
            <CardTitle className="text-3xl font-black text-destructive">
              {obats.filter(o => o.stokTotal <= o.minStok).length}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <AlertCircle size={12} className="text-destructive" />
              <span>Perlu pengadaan segera (SP)</span>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card 
          className="bg-white border-2 rounded-2xl shadow-sm hover:border-primary/50 cursor-pointer transition-all active:scale-[0.98] group"
          onClick={() => navigate('/rekap?type=prices')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardDescription className="uppercase text-[10px] font-black tracking-widest text-slate-400">Inventory Intelligence</CardDescription>
              <CardTitle className="text-xl font-bold">Analisa Kenaikan Harga</CardTitle>
            </div>
            <div className="h-10 w-10 rounded-xl bg-orange-100 flex items-center justify-center text-orange-600 group-hover:scale-110 transition-transform">
               <TrendingUp size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Monitor anomali harga beli dari supplier secara otomatis dan real-time.</p>
            <div className="mt-4 flex items-center gap-2 text-primary font-bold text-sm">
               Buka Intelligence Dashboard <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>

        <Card 
          className="bg-white border-2 rounded-2xl shadow-sm hover:border-primary/50 cursor-pointer transition-all active:scale-[0.98] group"
          onClick={() => navigate('/rekap?type=stock_report')}
        >
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <div className="space-y-1">
              <CardDescription className="uppercase text-[10px] font-black tracking-widest text-slate-400">Inventory Report</CardDescription>
              <CardTitle className="text-xl font-bold">Laporan Stok Lengkap</CardTitle>
            </div>
            <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary group-hover:scale-110 transition-transform">
               <Package size={20} />
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground">Laporan ketersediaan stok fisik, valuasi aset, dan status kesehatan gudang.</p>
            <div className="mt-4 flex items-center gap-2 text-primary font-bold text-sm">
               Lihat Laporan Stok <ArrowRight size={16} className="group-hover:translate-x-1 transition-transform" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Items Stok Rendah</CardTitle>
            <CardDescription>Obat yang mencapai batas minimum.</CardDescription>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nama Obat</TableHead>
                  <TableHead className="text-right">Sisa</TableHead>
                  <TableHead className="text-right">Min</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {obats.filter(o => o.stokTotal <= o.minStok).slice(0, 5).map(o => (
                  <TableRow key={o.id}>
                    <TableCell className="font-medium text-xs">{o.nama}</TableCell>
                    <TableCell className="text-right text-xs font-bold text-destructive">{o.stokTotal}</TableCell>
                    <TableCell className="text-right text-xs text-muted-foreground">{o.minStok}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Transaksi Terbaru</CardTitle>
            <CardDescription>Layanan peresepan/penjualan terakhir.</CardDescription>
          </CardHeader>
          <CardContent>
             <div className="space-y-4">
                {txs.slice(0, 5).map(t => (
                  <div key={t.id} className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 transition-colors cursor-pointer">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center text-blue-600">
                        <TrendingDown size={20} />
                      </div>
                      <div>
                        <p className="text-sm font-bold">{t.nomor}</p>
                        <p className="text-xs text-muted-foreground">{format(new Date(t.tanggal), 'dd MMM yyyy')}</p>
                      </div>
                    </div>
                    <div className="text-right">
                       <p className="text-sm font-black">Rp {(t.total || 0).toLocaleString()}</p>
                       <p className="text-[10px] text-muted-foreground uppercase">{t.tipe}</p>
                    </div>
                  </div>
                ))}
                {txs.length === 0 && <p className="text-center py-4 text-muted-foreground text-xs italic">Belum ada transaksi</p>}
             </div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Daftaran Sediaan Farmasi (Slow vs Fast Moving)</CardTitle>
          <CardDescription>Visualisasi detil stok item untuk audit bulanan.</CardDescription>
        </CardHeader>
        <CardContent>
           <Table>
             <TableHeader>
               <TableRow className="bg-muted">
                 <TableHead>Kode</TableHead>
                 <TableHead>Nama Sediaan</TableHead>
                 <TableHead>Satuan</TableHead>
                 <TableHead className="text-right">Stok Fisik</TableHead>
                 <TableHead className="text-right">Harga Satuan</TableHead>
                 <TableHead className="text-right">Total Nilai</TableHead>
                 <TableHead>Status</TableHead>
               </TableRow>
             </TableHeader>
             <TableBody>
               {obats.slice(0, 10).map(o => (
                 <TableRow key={o.id}>
                    <TableCell className="font-mono text-[10px]">{o.kode}</TableCell>
                    <TableCell className="font-bold text-sm">{o.nama}</TableCell>
                    <TableCell className="text-xs">{o.satuan}</TableCell>
                    <TableCell className="text-right font-bold">{o.stokTotal}</TableCell>
                    <TableCell className="text-right text-xs">Rp {o.hargaBeli.toLocaleString()}</TableCell>
                    <TableCell className="text-right font-black">Rp {(o.stokTotal * o.hargaBeli).toLocaleString()}</TableCell>
                    <TableCell>
                      {o.stokTotal > o.minStok * 2 ? (
                        <Badge className="bg-green-100 text-green-700 hover:bg-green-200 border-green-200">Surplus</Badge>
                      ) : o.stokTotal > o.minStok ? (
                        <Badge variant="outline">Aman</Badge>
                      ) : (
                        <Badge variant="destructive">Kritis</Badge>
                      )}
                    </TableCell>
                 </TableRow>
               ))}
             </TableBody>
           </Table>
        </CardContent>
      </Card>
    </div>
  );
}


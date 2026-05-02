import React from 'react';
import { 
  TrendingUp, 
  Download, 
  Calendar,
  Filter,
  DollarSign,
  ShoppingCart,
  Users,
  Search,
  ArrowUpRight,
  ArrowDownRight
} from 'lucide-react';
import { 
  Card, 
  CardContent, 
  CardHeader, 
  CardTitle, 
  CardDescription 
} from "@/components/ui/card";
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  AreaChart, 
  Area,
  PieChart,
  Pie,
  Cell,
  Legend
} from 'recharts';
import { dataService } from '@/services/dataService';
import { pdfService } from '@/services/pdfService';
import { exportService } from '@/services/exportService';
import { Transaksi } from '@/types';
import { format, subDays, startOfMonth, endOfMonth, isWithinInterval } from 'date-fns';
import { cn } from '@/lib/utils';

const COLORS = ['#0f172a', '#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6'];

export default function LaporanPenjualanPage() {
  const [txs, setTxs] = React.useState<Transaksi[]>([]);
  const [dateRange, setDateRange] = React.useState({
    start: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    end: format(endOfMonth(new Date()), 'yyyy-MM-dd')
  });
  const [searchQuery, setSearchQuery] = React.useState('');

  React.useEffect(() => {
    setTxs(dataService.getTransaksi());
  }, []);

  const filteredTxs = txs.filter(t => {
    const tDate = new Date(t.tanggal);
    const inRange = isWithinInterval(tDate, {
      start: new Date(dateRange.start),
      end: new Date(dateRange.end)
    });
    const matchesSearch = t.nomor.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          t.customerNama?.toLowerCase().includes(searchQuery.toLowerCase());
    return inRange && matchesSearch;
  });

  // Calculate metrics
  const totalRevenue = filteredTxs.reduce((sum, t) => sum + (t.total || 0), 0);
  const avgOrderValue = filteredTxs.length > 0 ? totalRevenue / filteredTxs.length : 0;
  const totalCustomers = new Set(filteredTxs.map(t => t.customerNama)).size;

  // Chart Data: Daily Revenue
  const dailyData = React.useMemo(() => {
    const dataMap: Record<string, number> = {};
    filteredTxs.forEach(t => {
      const day = format(new Date(t.tanggal), 'dd MMM');
      dataMap[day] = (dataMap[day] || 0) + (t.total || 0);
    });
    return Object.entries(dataMap).map(([name, total]) => ({ name, total }));
  }, [filteredTxs]);

  // Chart Data: Sales by Type
  const typeData = React.useMemo(() => {
    const dataMap: Record<string, number> = {};
    filteredTxs.forEach(t => {
      dataMap[t.tipe] = (dataMap[t.tipe] || 0) + (t.total || 0);
    });
    return Object.entries(dataMap).map(([name, value]) => ({ name, value }));
  }, [filteredTxs]);

  // Calculate Top Products dynamically from filtered transactions
  const topProducts = React.useMemo(() => {
    const productMap: Record<string, { name: string; qty: number; revenue: number }> = {};
    
    filteredTxs.forEach(t => {
      (t.items || []).forEach(item => {
        if (!productMap[item.obatId]) {
          productMap[item.obatId] = { name: item.namaObat, qty: 0, revenue: 0 };
        }
        productMap[item.obatId].qty += item.jumlah;
        productMap[item.obatId].revenue += item.subtotal;
      });
    });

    return Object.values(productMap)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5);
  }, [filteredTxs]);

  const handleExportPDF = () => {
    const headers = ['Nomor', 'Tanggal', 'Tipe', 'Customer', 'Total'];
    const body = filteredTxs.map(t => [
      t.nomor,
      format(new Date(t.tanggal), 'dd/MM/yyyy'),
      t.tipe,
      t.customerNama || 'UMUM',
      `Rp ${t.total.toLocaleString()}`
    ]);
    const footer = ['', '', '', 'TOTAL OMZET', `Rp ${totalRevenue.toLocaleString()}`];
    pdfService.generateTablePDF('Laporan Penjualan', headers, body, footer);
  };

  const handleExportCSV = () => {
    const headers = ['Nomor', 'Tanggal', 'Tipe', 'Customer', 'Total'];
    const rows = filteredTxs.map(t => [
      t.nomor,
      format(new Date(t.tanggal), 'yyyy-MM-dd'),
      t.tipe,
      t.customerNama || 'UMUM',
      t.total
    ]);
    exportService.exportToCSV('Laporan_Penjualan', headers, rows);
  };

  return (
    <div className="space-y-8 pb-10">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-black tracking-tight text-slate-900 uppercase italic">Laporan Penjualan</h1>
          <p className="text-muted-foreground font-medium">Analisis mendalam performa nilai transaksi dan volume pelayanan.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            className="rounded-xl font-bold bg-white shadow-sm border-slate-200"
            onClick={handleExportPDF}
          >
            <Download size={18} className="mr-2" /> PDF
          </Button>
          <Button 
            className="rounded-xl font-bold bg-slate-900 shadow-xl shadow-slate-200"
            onClick={handleExportCSV}
          >
            <Download size={18} className="mr-2" /> CSV Export
          </Button>
        </div>
      </div>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 bg-slate-50 p-4 rounded-2xl border border-slate-200 shadow-inner">
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Dari Tanggal</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="date" 
              value={dateRange.start} 
              onChange={(e) => setDateRange(prev => ({ ...prev, start: e.target.value }))}
              className="pl-9 h-10 rounded-xl bg-white focus:ring-primary/20 border-slate-200 font-medium"
            />
          </div>
        </div>
        <div className="space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Sampai Tanggal</label>
          <div className="relative">
            <Calendar size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              type="date" 
              value={dateRange.end} 
              onChange={(e) => setDateRange(prev => ({ ...prev, end: e.target.value }))}
              className="pl-9 h-10 rounded-xl bg-white focus:ring-primary/20 border-slate-200 font-medium"
            />
          </div>
        </div>
        <div className="md:col-span-2 space-y-1.5">
          <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest px-1">Cari Transaksi</label>
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <Input 
              placeholder="Nomor struk atau nama pelanggan..." 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-10 rounded-xl bg-white focus:ring-primary/20 border-slate-200 font-medium"
            />
          </div>
        </div>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {[
          { label: 'Total Omzet', value: `Rp ${totalRevenue.toLocaleString()}`, sub: 'Revenue periode ini', icon: <DollarSign className="text-blue-600" />, color: 'bg-blue-50 border-blue-100' },
          { label: 'Volume Transaksi', value: filteredTxs.length, sub: 'Total struk keluar', icon: <ShoppingCart className="text-orange-600" />, color: 'bg-orange-50 border-orange-100' },
          { label: 'Avg Sale / Ticket', value: `Rp ${Math.round(avgOrderValue).toLocaleString()}`, sub: 'Rerata nilai transaksi', icon: <TrendingUp className="text-emerald-600" />, color: 'bg-emerald-50 border-emerald-100' },
          { label: 'Unique Customers', value: totalCustomers, sub: 'Pelanggan aktif', icon: <Users className="text-purple-600" />, color: 'bg-purple-50 border-purple-100' },
        ].map((m, i) => (
          <Card key={i} className={cn("border-2 shadow-none transition-all hover:scale-[1.02] cursor-default", m.color)}>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-xs font-black uppercase tracking-tighter text-slate-600">{m.label}</CardTitle>
              <div className="p-2 bg-white rounded-lg border shadow-sm">{m.icon}</div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-black text-slate-900">{m.value}</div>
              <p className="text-[10px] text-slate-500 font-bold uppercase mt-1">{m.sub}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Sales Trend Chart */}
        <Card className="lg:col-span-2 border-2 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <div className="flex items-center justify-between">
              <div>
                <CardTitle className="text-lg font-black uppercase tracking-tight">Tren Penjualan Harian</CardTitle>
                <CardDescription className="text-xs font-bold text-slate-400">Nilai omzet per hari dalam periode terpilih</CardDescription>
              </div>
              <TrendingUp size={24} className="text-primary opacity-20" />
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[350px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={dailyData}>
                  <defs>
                    <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#0f172a" stopOpacity={0.1}/>
                      <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                  <XAxis 
                    dataKey="name" 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                    dy={10}
                  />
                  <YAxis 
                    axisLine={false} 
                    tickLine={false} 
                    tick={{ fontSize: 10, fontWeight: 700, fill: '#64748b' }} 
                    tickFormatter={(val) => `Rp${(val/1000)}k`}
                  />
                  <Tooltip 
                    contentStyle={{ borderRadius: '12px', border: '2px solid #f1f5f9', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                    formatter={(val: number) => [`Rp ${val.toLocaleString()}`, 'Omzet']}
                  />
                  <Area type="monotone" dataKey="total" stroke="#0f172a" strokeWidth={3} fillOpacity={1} fill="url(#colorTotal)" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Breakdown Pie Chart */}
        <Card className="border-2 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg font-black uppercase tracking-tight text-center">Proporsi Tipe Penjualan</CardTitle>
            <CardDescription className="text-[10px] font-bold text-slate-400 text-center">Resep vs Bebas</CardDescription>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={typeData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {typeData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip 
                    formatter={(val: number) => `Rp ${val.toLocaleString()}`}
                    contentStyle={{ borderRadius: '12px', fontWeight: 'bold' }}
                  />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Products */}
        <Card className="border-2 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b">
            <CardTitle className="text-lg font-black uppercase tracking-tight">Obat Terlaris (Top 5)</CardTitle>
            <CardDescription className="text-xs font-bold text-slate-400 italic">Berdasarkan volume penjualan minggu ini</CardDescription>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-slate-100/50 hover:bg-slate-100/50">
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 pl-6">Produk Sediaan</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 text-right">Volume</TableHead>
                  <TableHead className="text-[10px] font-black uppercase text-slate-500 text-right pr-6">Revenue</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {topProducts.map((p, i) => (
                  <TableRow key={i} className="hover:bg-slate-50 transition-colors">
                    <TableCell className="font-bold text-sm pl-6 py-4">{p.name}</TableCell>
                    <TableCell className="text-right font-black text-slate-600">{p.qty}</TableCell>
                    <TableCell className="text-right font-black text-primary pr-6">Rp {p.revenue.toLocaleString()}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Detailed Transactions Table */}
        <Card className="border-2 shadow-sm rounded-3xl overflow-hidden">
          <CardHeader className="bg-slate-50 border-b flex flex-row items-center justify-between">
            <div>
              <CardTitle className="text-lg font-black uppercase tracking-tight">Detail Transaksi Terbaru</CardTitle>
              <CardDescription className="text-xs font-bold text-slate-400 italic">Daftar transaksi dalam periode terpilih</CardDescription>
            </div>
            <Button variant="ghost" size="sm" className="font-bold text-[10px] hover:bg-white border">VIEW ALL</Button>
          </CardHeader>
          <CardContent className="p-0">
            <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
              <Table>
                <TableHeader className="sticky top-0 bg-white z-10">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="text-[10px] font-black uppercase text-slate-500 pl-6">Nomor</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-500">Tgl</TableHead>
                    <TableHead className="text-[10px] font-black uppercase text-slate-500 text-right pr-6">Total</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredTxs.slice(0, 20).map((t) => (
                    <TableRow key={t.id} className="group hover:bg-slate-50 transition-colors cursor-pointer">
                      <TableCell className="font-mono text-xs pl-6 py-4">
                        <div className="flex flex-col">
                          <span className="font-bold text-slate-900">{t.nomor}</span>
                          <span className="text-[9px] uppercase font-black text-slate-400 tracking-tighter">{t.tipe} / {t.customerNama || 'UMUM'}</span>
                        </div>
                      </TableCell>
                      <TableCell className="text-xs font-bold text-slate-500 italic">
                        {format(new Date(t.tanggal), 'dd/MM')}
                      </TableCell>
                      <TableCell className="text-right pr-6">
                        <div className="flex items-center justify-end gap-1 font-black text-slate-800">
                          Rp {t.total.toLocaleString()}
                          <ArrowUpRight size={12} className="text-emerald-500 opacity-0 group-hover:opacity-100 transition-opacity" />
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                  {filteredTxs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-10 text-muted-foreground italic text-xs">
                        Tidak ada data ditemukan untuk filter ini.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

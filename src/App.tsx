import React from 'react';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { format, parseISO, differenceInDays, isPast } from 'date-fns';
import { AlertTriangle, ArrowRight, TrendingUp, Package, Calendar, Activity, Bot } from 'lucide-react';
import { motion } from 'motion/react';
import { Button } from './components/ui/button';
import { dataService } from './services/dataService';
import { cn } from './lib/utils';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  BarChart, Bar, Cell
} from 'recharts';
import Layout from './components/Layout';
import MasterObat from './pages/MasterObat';
import MasterSupplier from './pages/MasterSupplier';
import MasterLokasi from './pages/MasterLokasi';
import MasterKategori from './pages/MasterKategori';
import MasterSatuan from './pages/MasterSatuan';
import MasterBentukSediaan from './pages/MasterBentukSediaan';
import MasterMappingSPKhusus from './pages/MasterMappingSPKhusus';
import MasterCustomer from './pages/MasterCustomer';
import MasterDokter from './pages/MasterDokter';
import MasterSpesialis from './pages/MasterSpesialis';
import TransaksiPeresepan from './pages/TransaksiPeresepan';
import SuratPesanan from './pages/SuratPesanan';
import SuratPesananKhususPage from './pages/SuratPesananKhusus';
import BAPB from './pages/BAPB';
import KartuStok from './pages/KartuStok';
import PindahLokasi from './pages/PindahLokasi';
import StokOpname from './pages/StokOpname';
import Laporan from './pages/Laporan';
import RekapSuratPesanan from './pages/RekapSuratPesanan';
import RekapBAPB from './pages/RekapBAPB';
import RekapPenjualan from './pages/RekapPenjualan';
import LaporanPenjualan from './pages/LaporanPenjualan';
import Intelligence from './pages/Intelligence';
import InteractionCheckPage from './pages/InteractionCheck';
import Settings from './pages/Settings';

// Dashboard component
const Dashboard = () => {
  const navigate = useNavigate();
  const [stats, setStats] = React.useState({
    totalObat: 0,
    stokRendah: 0,
    spPending: 0,
    transaksiHariIni: 0,
    bapbJatuhTempo: 0
  });

  const [analytics, setAnalytics] = React.useState<any[]>([]);
  const [topProducts, setTopProducts] = React.useState<any[]>([]);
  const [expiryAlerts, setExpiryAlerts] = React.useState<any[]>([]);
  const [logs, setLogs] = React.useState<any[]>([]);

  React.useEffect(() => {
    const obats = dataService.getObat();
    const sps = dataService.getSP();
    const txs = dataService.getTransaksi();
    const bapbs = dataService.getBAPB();
    
    const nearDue = bapbs.filter((b: any) => {
      if (!b.tanggalJatuhTempo || b.status === 'Paid') return false;
      const dueDate = parseISO(b.tanggalJatuhTempo);
      const daysLeft = differenceInDays(dueDate, new Date());
      return daysLeft <= 3 && !isPast(dueDate);
    }).length;

    setStats({
      totalObat: obats.length,
      stokRendah: obats.filter((o: any) => o.stokTotal <= o.minStok).length,
      spPending: sps.filter((s: any) => s.status === 'Sent').length,
      transaksiHariIni: txs.filter(t => t.tanggal.startsWith(format(new Date(), 'yyyy-MM-dd'))).length,
      bapbJatuhTempo: nearDue
    });

    setAnalytics(dataService.getSalesAnalytics());
    setTopProducts(dataService.getTopProducts());
    setExpiryAlerts(dataService.getExpiryAlerts());
    setLogs(dataService.getLogs());
  }, []);

  const totalRevenue = analytics.reduce((acc, curr) => acc + curr.total, 0);
  const avgOrder = analytics.length > 0 ? totalRevenue / analytics.length : 0;

  const score = React.useMemo(() => {
    if (stats.totalObat === 0) return 100;
    const criticalPercent = (stats.stokRendah / stats.totalObat) * 100;
    return Math.round(100 - criticalPercent);
  }, [stats]);

  return (
    <div className="space-y-8 animate-in fade-in duration-700 pb-20">
      <div className="flex justify-between items-end">
        <div className="flex flex-col gap-2">
          <h1 className="text-4xl font-extrabold tracking-tight">Overview Gudang</h1>
          <p className="text-muted-foreground font-medium">Informasi terkini operasional farmasi hari ini.</p>
        </div>
        <div className="flex gap-4">
          <div className="bg-card border-2 rounded-2xl px-6 py-3 shadow-sm text-right">
             <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest mb-1">Rev. 30 Hari</p>
             <p className="text-2xl font-black text-primary">Rp {totalRevenue.toLocaleString()}</p>
          </div>
        </div>
      </div>

      {/* AI Insights Card */}
      <div className="bg-gradient-to-br from-slate-900 to-slate-800 text-white rounded-3xl p-8 shadow-xl relative overflow-hidden group">
        <div className="absolute top-0 right-0 w-64 h-64 bg-primary/20 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-primary/30 transition-all duration-700" />
        <div className="relative z-10 grid md:grid-cols-3 gap-8">
          <div className="col-span-2">
            <div className="flex items-center gap-3 mb-6">
              <div className="bg-primary p-2 rounded-xl shadow-lg shadow-primary/20 border border-white/10">
                <Bot size={24} />
              </div>
              <h2 className="text-xl font-bold italic">Smart Dashboard Insight</h2>
            </div>
            <div className="space-y-4">
               <p className="text-slate-300 text-sm leading-relaxed max-w-xl">
                 Berdasarkan analisis data sediaan, tingkat ketersediaan obat Anda berada di angka <span className="text-green-400 font-bold">{score}%</span>. 
                 Terdapat <span className="text-orange-400 font-bold">{expiryAlerts.length} item</span> yang mendekati masa kadaluarsa dalam 90 hari. 
                 Saran AI: Segera lakukan pengadaan untuk <span className="text-rose-400 font-bold">{stats.stokRendah} item</span> yang stoknya kritis.
               </p>
               <div className="flex gap-3">
                 <Button className="bg-primary hover:bg-primary/90 text-white rounded-xl px-6" onClick={() => navigate('/laporan')}>
                   Lihat Detail Laporan
                 </Button>
                 <Button variant="outline" className="text-white border-white/10 hover:bg-white/5 rounded-xl px-6" onClick={() => navigate('/inventori/opname')}>
                   Update Stok Opname
                 </Button>
               </div>
            </div>
          </div>
          <div className="hidden md:flex flex-col justify-center border-l border-white/10 pl-8">
            <div className="mb-6">
               <p className="text-slate-400 text-xs font-bold uppercase mb-2 tracking-widest">Efficiency Score</p>
               <div className="flex items-baseline gap-2">
                 <span className="text-5xl font-black tracking-tighter">{score}%</span>
                 {score > 80 ? <TrendingUp className="text-green-400" size={20} /> : <AlertTriangle className="text-rose-400" size={20} />}
               </div>
            </div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
               <div className={cn("w-2 h-2 rounded-full animate-pulse", score > 80 ? "bg-green-500" : "bg-rose-500")} />
               {score > 80 ? "Sistem Berjalan Optimal" : "Perlu Tindakan Manajemen"}
            </div>
          </div>
        </div>
      </div>

      {stats.bapbJatuhTempo > 0 && (
        <div className="bg-orange-50 border-2 border-orange-200 rounded-2xl p-6 flex gap-6 items-center shadow-sm animate-bounce-subtle">
          <div className="h-12 w-12 bg-orange-100 rounded-full flex items-center justify-center text-orange-600 shrink-0">
             <AlertTriangle size={24} />
          </div>
          <div className="flex-1">
            <h3 className="font-bold text-orange-900 text-lg">Peringatan Pembayaran</h3>
            <p className="text-orange-700 text-sm">
              Ada <span className="font-bold">{stats.bapbJatuhTempo} tagihan BAPB</span> yang akan jatuh tempo dalam 3 hari ke depan. Harap segera dikoordinasikan untuk pembayaran.
            </p>
          </div>
          <Button 
            className="bg-orange-600 hover:bg-orange-700 text-white gap-2 shadow-lg"
            onClick={() => navigate('/logistik/bapb')}
          >
            Lihat BAPB <ArrowRight size={16} />
          </Button>
        </div>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {[
          { label: "Total Sediaan", value: stats.totalObat, sub: "Item Obat Terdaftar", icon: <Package size={24}/>, color: "primary" },
          { label: "Stok Kritis", value: stats.stokRendah, sub: "Perlu Segera Direstock", icon: <AlertTriangle size={24}/>, color: "destructive" },
          { label: "SP Aktif", value: stats.spPending, sub: "Pesanan Belum Diterima", icon: <Calendar size={24}/>, color: "blue" },
          { label: "Transaksi", value: stats.transaksiHariIni, sub: "Peresepan Hari Ini", icon: <TrendingUp size={24}/>, color: "green" },
        ].map((c, i) => (
          <div key={i} className={cn(
            "rounded-2xl border-2 p-6 shadow-sm hover:shadow-md transition-all group overflow-hidden relative",
            c.color === 'primary' ? "border-primary/10 bg-card" : 
            c.color === 'destructive' ? "border-destructive/10 bg-card" :
            c.color === 'blue' ? "border-blue-500/10 bg-card" : "border-green-500/10 bg-card"
          )}>
            <div className={cn(
              "absolute -right-4 -top-4 w-24 h-24 rounded-full blur-3xl opacity-20",
              c.color === 'primary' ? "bg-primary" : 
              c.color === 'destructive' ? "bg-destructive" :
              c.color === 'blue' ? "bg-blue-500" : "bg-green-500"
            )} />
            <div className="flex justify-between items-start mb-4">
              <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-widest">{c.label}</h3>
              <div className={cn(
                 "p-2 rounded-lg",
                 c.color === 'primary' ? "bg-primary/10 text-primary" : 
                 c.color === 'destructive' ? "bg-destructive/10 text-destructive" :
                 c.color === 'blue' ? "bg-blue-500/10 text-blue-600" : "bg-green-500/10 text-green-600"
              )}>
                {c.icon}
              </div>
            </div>
            <p className={cn(
              "text-4xl font-black",
              c.color === 'destructive' ? "text-destructive" :
              c.color === 'blue' ? "text-blue-600" :
              c.color === 'green' ? "text-green-600" : "text-foreground"
            )}>{c.value}</p>
            <div className="mt-4 text-[10px] font-bold text-muted-foreground italic">{c.sub}</div>
          </div>
        ))}
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Sales Chart */}
        <div className="lg:col-span-2 rounded-2xl border-2 bg-card p-6 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h3 className="font-bold text-lg">Trend Penjualan</h3>
              <p className="text-xs text-muted-foreground">Volume transaksi peresepan 30 hari terakhir</p>
            </div>
            <div className="flex gap-2">
              <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 rounded-lg text-[10px] font-bold text-blue-600 border border-blue-100">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-600" /> PELAYANAN
              </div>
              <div className="p-2 border rounded-lg bg-muted/50">
                 <TrendingUp size={16} className="text-primary" />
              </div>
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="colorTotal" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#2563eb" stopOpacity={0.2}/>
                    <stop offset="95%" stopColor="#2563eb" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#64748b'}} 
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#64748b'}}
                  tickFormatter={(val) => `Rp ${val/1000}k`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                  formatter={(val: any) => [`Rp ${val.toLocaleString()}`, 'Total Penjualan']}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="#2563eb" 
                  strokeWidth={4}
                  fillOpacity={1} 
                  fill="url(#colorTotal)" 
                  animationDuration={1500}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Inventory Velocity */}
        <div className="rounded-2xl border-2 bg-card p-6 shadow-sm flex flex-col">
          <h3 className="font-bold text-lg mb-4">Stock Velocity</h3>
          <p className="text-xs text-muted-foreground mb-6">Obat dengan perputaran stok tercepat</p>
          <div className="flex-1 space-y-6">
            {topProducts.map((p, i) => (
              <div key={i} className="flex items-center gap-4 group">
                <div className="relative">
                   <div className="h-10 w-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-sm group-hover:bg-primary group-hover:text-white transition-all">
                    {p.nama.charAt(0)}
                  </div>
                  {i < 3 && (
                    <div className="absolute -top-1 -right-1 w-4 h-4 bg-yellow-400 rounded-full border-2 border-white flex items-center justify-center text-[8px] font-bold text-white">
                      {i + 1}
                    </div>
                  )}
                </div>
                <div className="flex-1 overflow-hidden">
                  <p className="font-bold text-sm truncate group-hover:text-primary transition-colors">{p.nama}</p>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full mt-2 overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${(p.total / (topProducts[0]?.total || 1)) * 100}%` }}
                      transition={{ duration: 1, delay: 0.5 + i * 0.1 }}
                      className="h-full bg-primary rounded-full shadow-[0_0_8px_rgba(37,99,235,0.4)]" 
                    />
                  </div>
                </div>
                <div className="text-right">
                  <p className="font-black text-sm text-slate-700">{p.total}</p>
                  <p className="text-[10px] text-muted-foreground uppercase font-bold">Qty</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="flex flex-col items-center justify-center py-20 opacity-30 italic text-sm text-center">
                 <Package size={40} className="mb-2" />
                 Belum ada data perputaran barang
              </div>
            )}
          </div>
          <div className="mt-6 pt-6 border-t border-dashed">
             <Button variant="ghost" className="w-full text-xs font-bold gap-2 text-muted-foreground hover:text-primary transition-colors" onClick={() => navigate('/rekap/penjualan')}>
               Analisis Lengkap <ArrowRight size={14} />
             </Button>
          </div>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Expiry Alerts */}
        <div className="rounded-2xl border-2 bg-card p-6 shadow-sm">
          <div className="flex items-center gap-2 mb-4">
            <Activity className="text-orange-500" size={20} />
            <h3 className="font-bold text-lg">Peringatan Kadaluarsa (90 Hari)</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b text-muted-foreground font-medium">
                  <th className="pb-2 text-[10px] uppercase">Obat</th>
                  <th className="pb-2 text-[10px] uppercase">Batch</th>
                  <th className="pb-2 text-[10px] uppercase">Tgl EXP</th>
                  <th className="pb-2 text-right text-[10px] uppercase">Sisa Hari</th>
                </tr>
              </thead>
              <tbody className="divide-y text-xs">
                {expiryAlerts.map((a, i) => (
                  <tr key={i} className="group hover:bg-muted/30">
                    <td className="py-3 pr-4 font-medium">{a.obatNama}</td>
                    <td className="py-3 px-2 font-mono">{a.batch}</td>
                    <td className="py-3 px-2">{format(parseISO(a.kadaluarsa), 'dd/MM/yyyy')}</td>
                    <td className="py-3 pl-4 text-right">
                      <span className={cn(
                        "font-bold px-2 py-0.5 rounded text-[10px]",
                        a.daysLeft <= 30 ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                      )}>
                        {a.daysLeft} Hari
                      </span>
                    </td>
                  </tr>
                ))}
                {expiryAlerts.length === 0 && (
                  <tr>
                    <td colSpan={4} className="py-8 text-center text-muted-foreground italic">Tidak ada obat mendekati kadaluarsa</td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* System Activity */}
        <div className="rounded-2xl border-2 bg-card p-6 shadow-sm">
          <h3 className="font-bold text-lg mb-4">Aktivitas Terkini</h3>
          <div className="space-y-4">
            {logs.map((log, i) => (
              <div key={i} className="flex gap-3 items-start p-3 rounded-xl hover:bg-muted/30 transition-colors">
                <div className="mt-1 w-2 h-2 rounded-full bg-primary shrink-0" />
                <div className="flex-1 overflow-hidden">
                  <p className="text-xs font-bold leading-tight line-clamp-1">{log.action}</p>
                  <div className="flex justify-between items-center mt-1">
                    <p className="text-[10px] text-muted-foreground">{log.module}</p>
                    <p className="text-[10px] text-muted-foreground italic">{format(log.timestamp, 'HH:mm')}</p>
                  </div>
                </div>
              </div>
            ))}
            {logs.length === 0 && (
              <div className="p-4 rounded-xl border border-dashed flex flex-col items-center justify-center text-muted-foreground text-sm py-12">
                <Package size={32} className="opacity-20 mb-2" />
                Belum ada aktivitas tercatat.
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default function App() {
  return (
    <Router>
      <Layout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/master/obat" element={<MasterObat />} />
          <Route path="/master/supplier" element={<MasterSupplier />} />
          <Route path="/master/lokasi" element={<MasterLokasi />} />
          <Route path="/master/kategori" element={<MasterKategori />} />
          <Route path="/master/satuan" element={<MasterSatuan />} />
          <Route path="/master/bentuk-sediaan" element={<MasterBentukSediaan />} />
          <Route path="/master/mapping-sp-khusus" element={<MasterMappingSPKhusus />} />
          <Route path="/master/customer" element={<MasterCustomer />} />
          <Route path="/master/dokter" element={<MasterDokter />} />
          <Route path="/master/spesialis" element={<MasterSpesialis />} />
          <Route path="/logistik/sp" element={<SuratPesanan />} />
          <Route path="/logistik/sp-khusus/:type" element={<SuratPesananKhususPage />} />
          <Route path="/logistik/bapb" element={<BAPB />} />
          <Route path="/penjualan/peresepan" element={<TransaksiPeresepan />} />
          <Route path="/inventori/pindah" element={<PindahLokasi />} />
          <Route path="/inventori/opname" element={<StokOpname />} />
          <Route path="/inventori/kartu" element={<KartuStok />} />
          <Route path="/laporan" element={<Laporan />} />
          <Route path="/rekap/sp" element={<RekapSuratPesanan />} />
          <Route path="/rekap/bapb" element={<RekapBAPB />} />
          <Route path="/rekap/penjualan" element={<RekapPenjualan />} />
          <Route path="/laporan/penjualan" element={<LaporanPenjualan />} />
          <Route path="/intelligence" element={<Intelligence />} />
          <Route path="/clinical/interaction" element={<InteractionCheckPage />} />
          <Route path="/settings" element={<Settings />} />
        </Routes>
      </Layout>
    </Router>
  );
}

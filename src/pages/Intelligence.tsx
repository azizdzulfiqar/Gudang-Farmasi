import React from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '@/services/dataService';
import { format, addDays } from 'date-fns';
import { 
  TrendingUp, TrendingDown, Target, Brain, 
  Package, AlertCircle, ShoppingCart, 
  ArrowUpRight, BarChart3, PieChart,
  Loader2, X
} from 'lucide-react';
import { 
  ResponsiveContainer, AreaChart, Area, XAxis, YAxis, 
  CartesianGrid, Tooltip, BarChart, Bar, Cell 
} from 'recharts';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { Badge } from '@/components/ui/badge';
import Markdown from 'react-markdown';

export default function IntelligencePage() {
  const [forecast, setForecast] = React.useState<any[]>([]);
  const [finance, setFinance] = React.useState<any>(null);
  const [analytics, setAnalytics] = React.useState<any[]>([]);
  const [topProducts, setTopProducts] = React.useState<any[]>([]);
  const [timeRange, setTimeRange] = React.useState<'30' | '90'>('30');
  const [showAdvice, setShowAdvice] = React.useState(true);
  const [isRestockingAI, setIsRestockingAI] = React.useState(false);
  const [restockNotice, setRestockNotice] = React.useState<string | null>(null);

  React.useEffect(() => {
    // Simulate data changes based on time range
    const multiplier = timeRange === '90' ? 2.8 : 1;
    const baseForecast = dataService.getInventoryForecast();
    const baseAnalytics = dataService.getSalesAnalytics();
    
    setForecast(baseForecast);
    setFinance(dataService.getFinancialInsights());
    setAnalytics(baseAnalytics.map(item => ({ ...item, total: item.total * multiplier })));
    setTopProducts(dataService.getTopProducts().map(item => ({ ...item, total: Math.round(item.total * multiplier) })));
  }, [timeRange]);

  const handleRestockAI = async () => {
    setIsRestockingAI(true);
    setRestockNotice(null);
    try {
      const lowStockItems = forecast.filter(i => i.status === 'Critical' || i.status === 'Warning');
      const itemsList = lowStockItems.map(i => `${i.nama} (${i.daysRemaining} hari tersisa)`).join(', ');
      
      const prompt = `Analisis kebutuhan restock untuk item berikut: ${itemsList}. Berikan prioritas pengadaan dan estimasi kuantitas yang harus dipesan berdasarkan status kritis mereka. Berikan saran singkat dan padat.`;
      
      // We can use aiService here
      // Importing it if not present
      const { aiService } = await import('@/services/aiService');
      const analysis = await aiService.askAssistant(prompt, "Sistem Analisis Stok FarmasiEase.");
      setRestockNotice(analysis);
    } catch (error) {
      setRestockNotice("Gagal mendapatkan rekomendasi AI. Silakan periksa koneksi atau API Key.");
    } finally {
      setIsRestockingAI(false);
    }
  };

  const totalRevenue = analytics.reduce((sum, item) => sum + item.total, 0);
  const forecastedRevenue = totalRevenue * 1.15; // Placeholder AI forecast logic

  return (
    <div className="space-y-8 pb-20 animate-in fade-in duration-700">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h1 className="text-4xl font-extrabold tracking-tight flex items-center gap-3">
            <Brain className="text-primary" size={36} />
            Business Intelligence
          </h1>
          <p className="text-muted-foreground font-medium mt-1">Analisis prediktif dan metrik kesehatan bisnis FarmasiEase.</p>
        </div>
        <div className="flex bg-slate-100 p-1 rounded-xl border">
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "rounded-lg font-bold text-xs px-4 transition-all",
              timeRange === '30' ? "bg-white shadow-sm" : "text-muted-foreground opacity-50"
            )}
            onClick={() => setTimeRange('30')}
          >
            LAST 30 DAYS
          </Button>
          <Button 
            variant="ghost" 
            size="sm" 
            className={cn(
              "rounded-lg font-bold text-xs px-4 transition-all",
              timeRange === '90' ? "bg-white shadow-sm" : "text-muted-foreground opacity-50"
            )}
            onClick={() => setTimeRange('90')}
          >
            90 DAYS
          </Button>
        </div>
      </div>

      {/* Bento Grid Layout */}
      <div className="grid grid-cols-1 md:grid-cols-4 lg:grid-cols-6 gap-4">
        
        {/* Main Revenue Chart - Large Span */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="md:col-span-4 lg:col-span-4 bg-card border-2 rounded-3xl p-8 shadow-sm relative overflow-hidden"
        >
          <div className="flex justify-between items-start mb-10">
            <div>
              <h3 className="text-sm font-bold text-muted-foreground uppercase tracking-wider">Revenue Intelligence</h3>
              <div className="flex items-baseline gap-3 mt-1">
                 <p className="text-4xl font-black">Rp {totalRevenue.toLocaleString()}</p>
                 <Badge variant="outline" className="bg-green-50 text-green-700 border-green-200 gap-1 px-2">
                   <TrendingUp size={12} /> +15.2%
                 </Badge>
              </div>
            </div>
            <div className="text-right">
              <p className="text-[10px] font-bold text-muted-foreground uppercase">AI Prediction (Next Month)</p>
              <p className="text-lg font-bold text-primary">Rp {forecastedRevenue.toLocaleString()}</p>
            </div>
          </div>

          <div className="h-[350px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="primaryGrad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="var(--primary)" stopOpacity={0.15}/>
                    <stop offset="95%" stopColor="var(--primary)" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                <XAxis 
                  dataKey="date" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}} 
                  dy={10}
                />
                <YAxis 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 11, fill: '#94a3b8', fontWeight: 600}}
                  tickFormatter={(val) => `Rp ${val/1000000}M`}
                />
                <Tooltip 
                  contentStyle={{ borderRadius: '20px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.15)', padding: '12px' }}
                  itemStyle={{ fontWeight: 800, fontSize: '13px' }}
                />
                <Area 
                  type="monotone" 
                  dataKey="total" 
                  stroke="var(--primary)" 
                  strokeWidth={4}
                  fill="url(#primaryGrad)" 
                  animationDuration={2000}
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        {/* Financial Health - Square */}
        <motion.div 
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="md:col-span-2 lg:col-span-2 bg-slate-900 text-white border-2 border-slate-800 rounded-3xl p-8 shadow-xl flex flex-col justify-between"
        >
          <div>
             <div className="bg-white/10 w-12 h-12 rounded-2xl flex items-center justify-center mb-6">
               <Target size={24} className="text-primary" />
             </div>
             <h3 className="text-xl font-bold mb-2">Financial Pulse</h3>
             <p className="text-slate-400 text-sm leading-relaxed">Analisis margin keuntungan real-time berdasarkan HPP rata-rata.</p>
          </div>
          
          <div className="space-y-6 mt-10">
            <div className="flex justify-between items-end">
              <div>
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Gross Margin</p>
                <p className="text-4xl font-black">{Math.round(finance?.margin || 0)}%</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] uppercase font-bold text-slate-500 tracking-widest">Est. Profit</p>
                <p className="text-xl font-bold text-green-400">Rp {Math.round(finance?.grossProfit || 0).toLocaleString()}</p>
              </div>
            </div>
            
            <div className="w-full h-2 bg-white/10 rounded-full overflow-hidden">
              <motion.div 
                initial={{ width: 0 }}
                animate={{ width: `${finance?.margin || 0}%` }}
                transition={{ duration: 1.5, ease: "easeOut" }}
                className="h-full bg-primary"
              />
            </div>
            
            <div className="grid grid-cols-2 gap-4 pt-4 border-t border-white/5">
              <div>
                <p className="text-[10px] text-slate-500 font-bold uppercase">Inventory Cost</p>
                <p className="text-sm font-bold">Rp {finance?.purchases.toLocaleString()}</p>
              </div>
              <div className="text-right">
                <p className="text-[10px] text-slate-500 font-bold uppercase">GMROI Scale</p>
                <p className="text-sm font-bold text-blue-400">High Performer</p>
              </div>
            </div>
          </div>
        </motion.div>

        {/* Stock Out Prediction - High span */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="md:col-span-3 lg:col-span-3 bg-card border-2 rounded-3xl p-8 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-orange-50 p-2 rounded-xl text-orange-600">
                <Package size={20} />
              </div>
              <h3 className="font-bold">AI Stock-Out Predictor</h3>
            </div>
            <Badge className="bg-orange-100 text-orange-700 border-orange-200">Experimental</Badge>
          </div>

          <div className="space-y-6">
            {restockNotice && (
              <motion.div 
                initial={{ opacity: 0, height: 0 }}
                animate={{ opacity: 1, height: 'auto' }}
                className="bg-primary/10 border border-primary/20 p-4 rounded-2xl text-xs relative"
              >
                <div className="flex items-center gap-2 mb-2">
                  <Brain size={14} className="text-primary" />
                  <span className="font-bold text-primary uppercase">Rekomendasi AI</span>
                  <Button 
                    variant="ghost" 
                    size="icon" 
                    className="h-5 w-5 ml-auto rounded-full"
                    onClick={() => setRestockNotice(null)}
                  >
                    <X size={12} />
                  </Button>
                </div>
                <div className="prose prose-xs prose-slate max-w-none markdown-body text-[11px]">
                   <Markdown>{restockNotice}</Markdown>
                </div>
              </motion.div>
            )}
            {forecast.slice(0, 5).map((item, i) => (
              <div key={i} className="flex items-center gap-4 group p-1 transition-all">
                <div className="h-10 w-10 rounded-xl bg-slate-50 border flex items-center justify-center font-bold text-slate-500">
                  {i + 1}
                </div>
                <div className="flex-1 overflow-hidden">
                  <div className="flex justify-between mb-1">
                    <p className="text-sm font-bold truncate">{item.nama}</p>
                    <p className={cn(
                      "text-[10px] font-black uppercase px-2 py-0.5 rounded",
                      item.status === 'Critical' ? "bg-red-100 text-red-600" : "bg-orange-100 text-orange-600"
                    )}>
                      {item.daysRemaining} Hari Lagi
                    </p>
                  </div>
                  <div className="w-full h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <motion.div 
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.max(10, (item.daysRemaining / 30) * 100)}%` }}
                      className={cn(
                        "h-full rounded-full",
                        item.status === 'Critical' ? "bg-red-500 shadow-[0_0_8px_rgba(239,68,68,0.4)]" : "bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.4)]"
                      )}
                    />
                  </div>
                </div>
              </div>
            ))}
            {forecast.length === 0 && (
              <div className="py-20 text-center opacity-30 italic text-sm">
                 <Brain size={48} className="mx-auto mb-4" />
                 Belum ada tren penjualan untuk prediksi pergerakan stok.
              </div>
            )}
          </div>
          
          <Button 
            variant="outline" 
            className="w-full mt-6 rounded-xl border-dashed py-6 group hover:border-primary hover:text-primary transition-all relative overflow-hidden"
            onClick={handleRestockAI}
            disabled={isRestockingAI}
          >
            {isRestockingAI ? (
              <>
                <Loader2 size={16} className="mr-2 animate-spin" />
                Menganalisis Data Stok...
              </>
            ) : (
              <>
                Lihat Rekomendasi Restock Penuh <ArrowUpRight size={16} className="ml-2 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
              </>
            )}
            {isRestockingAI && (
              <motion.div 
                className="absolute inset-0 bg-primary/5"
                initial={{ x: '-100%' }}
                animate={{ x: '100%' }}
                transition={{ repeat: Infinity, duration: 1.5, ease: "linear" }}
              />
            )}
          </Button>
        </motion.div>

        {/* Top Movers Bar Chart */}
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="md:col-span-3 lg:col-span-3 bg-card border-2 rounded-3xl p-8 shadow-sm"
        >
          <div className="flex justify-between items-center mb-8">
            <div className="flex items-center gap-3">
              <div className="bg-blue-50 p-2 rounded-xl text-blue-600">
                <BarChart3 size={20} />
              </div>
              <h3 className="font-bold">Item Pergerakan Tercepat</h3>
            </div>
            <p className="text-[10px] font-black text-muted-foreground uppercase opacity-50">BY VOLUME</p>
          </div>

          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={topProducts} layout="vertical" margin={{ left: -20 }}>
                <XAxis type="number" hide />
                <YAxis 
                  dataKey="nama" 
                  type="category" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fontSize: 10, fill: '#64748b', fontWeight: 600}} 
                  width={100}
                />
                <Tooltip 
                  cursor={{fill: 'transparent'}}
                  contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgb(0 0 0 / 0.1)' }}
                />
                <Bar dataKey="total" radius={[0, 8, 8, 0]} barSize={24}>
                  {topProducts.map((_, index) => (
                    <Cell key={`cell-${index}`} fill={index === 0 ? 'var(--primary)' : '#94a3b8'} opacity={1 - (index * 0.1)} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="mt-4 grid grid-cols-3 gap-2">
            {[
              { label: 'Fast Moving', color: 'bg-primary' },
              { label: 'Normal', color: 'bg-slate-300' },
              { label: 'Slow Moving', color: 'bg-slate-100' },
            ].map((tag, i) => (
              <div key={i} className="flex items-center gap-1.5">
                <div className={cn("w-2 h-2 rounded-full", tag.color)} />
                <span className="text-[9px] font-bold text-muted-foreground uppercase">{tag.label}</span>
              </div>
            ))}
          </div>
        </motion.div>

      </div>

      {/* Suggestion Section */}
      <AnimatePresence>
        {showAdvice && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            className="bg-primary/5 border-2 border-primary/10 rounded-[2rem] p-10 relative overflow-hidden"
          >
            <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
              <Brain size={200} />
            </div>
            <div className="relative z-10 max-w-4xl">
              <Badge className="mb-4 bg-primary text-white hover:bg-primary/90 rounded-lg px-3">AI SMART ADVICE</Badge>
              <h2 className="text-3xl font-black tracking-tight mb-4 leading-tight">Optimalkan Stok Anda dengan Data, Bukan Tebakan.</h2>
              <p className="text-slate-600 leading-relaxed mb-8">
                Sistem mendeteksi bahwa <span className="font-extrabold text-slate-900">{topProducts[0]?.nama || 'beberapa item'}</span> memiliki perputaran stok sangat tinggi 
                namun margin hanya <span className="font-extrabold text-slate-900">12%</span>. Pertimbangkan untuk merevisi harga jual atau mencari supplier alternatif untuk meningkatkan profitabilitas.
              </p>
              <div className="flex flex-wrap gap-4">
                 <Button 
                   className="rounded-2xl px-8 h-12 font-bold shadow-lg shadow-primary/20"
                   onClick={() => {
                     window.dispatchEvent(new CustomEvent('farmasi-ai-command', { 
                       detail: { 
                         text: `Berdasarkan dashboard Business Intelligence hari ini, berikan analisis mendalam terkait item fast moving ${topProducts[0]?.nama || ''} dan strategi optimasi stok untuk periode mendatang.`,
                         autoSend: true 
                       } 
                     }));
                   }}
                 >
                   Minta Rekomendasi Lanjutan
                 </Button>
                 <Button 
                   variant="ghost" 
                   className="rounded-2xl px-8 h-12 font-bold"
                   onClick={() => setShowAdvice(false)}
                 >
                   Abaikan Sementara
                 </Button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

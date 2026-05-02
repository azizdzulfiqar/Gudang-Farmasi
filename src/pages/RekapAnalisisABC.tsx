import React from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Cell,
  PieChart,
  Pie,
  Legend
} from 'recharts';
import { 
  Search, 
  Download, 
  FileSpreadsheet, 
  TrendingUp,
  AlertCircle,
  PieChart as PieChartIcon,
  Layers,
  Loader2,
  Calendar,
  BarChart3
} from 'lucide-react';
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { dataService } from '@/services/dataService';
import { format } from 'date-fns';
import { Label } from "@/components/ui/label";
import * as XLSX from 'xlsx';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import { toast } from 'sonner';

export default function RekapAnalisisABC() {
  const [searchTerm, setSearchTerm] = React.useState('');
  const [categoryFilter, setCategoryFilter] = React.useState('all');
  const [filterStartDate, setFilterStartDate] = React.useState(format(new Date(), 'yyyy-MM-01'));
  const [filterEndDate, setFilterEndDate] = React.useState(format(new Date(), 'yyyy-MM-dd'));
  const [isLoading, setIsLoading] = React.useState(false);
  const [abcData, setAbcData] = React.useState<any[]>([]);
  const [categories, setCategories] = React.useState<string[]>([]);

  React.useEffect(() => {
    loadData();
  }, []);

  const handleExportExcel = () => {
    if (filteredData.length === 0) {
      toast.error('Tidak ada data untuk diekspor');
      return;
    }

    const dataToExport = filteredData.map(item => ({
      'Nama Obat': item.nama,
      'Kategori': item.kategori,
      'Volume Jual': item.volume,
      'Nilai Investasi': item.totalValue,
      'Kumulatif (%)': item.cumulativePercentage.toFixed(2),
      'Kelas ABC': item.abcCategory
    }));

    const ws = XLSX.utils.json_to_sheet(dataToExport);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, 'Analisis ABC');
    XLSX.writeFile(wb, `Analisis_ABC_${filterStartDate}_to_${filterEndDate}.xlsx`);
    toast.success('Laporan Excel berhasil diunduh');
  };

  const handleDownloadPDF = () => {
    if (filteredData.length === 0) {
      toast.error('Tidak ada data untuk diunduh');
      return;
    }

    const doc = new jsPDF();
    
    // Header
    doc.setFontSize(18);
    doc.text('Laporan Analisis ABC Penjualan', 14, 22);
    doc.setFontSize(11);
    doc.text(`Periode: ${filterStartDate} s/d ${filterEndDate}`, 14, 30);
    doc.text(`Dicetak pada: ${format(new Date(), 'dd/MM/yyyy HH:mm')}`, 14, 37);

    // Summary
    doc.setFontSize(12);
    doc.text('Ringkasan:', 14, 47);
    doc.text(`- Kategori A: ${summary.A} item`, 14, 54);
    doc.text(`- Kategori B: ${summary.B} item`, 14, 61);
    doc.text(`- Kategori C: ${summary.C} item`, 14, 68);

    const tableData = filteredData.map(item => [
      item.nama,
      item.kategori,
      item.volume.toLocaleString(),
      `Rp ${item.totalValue.toLocaleString()}`,
      `${item.cumulativePercentage.toFixed(1)}%`,
      item.abcCategory
    ]);

    autoTable(doc, {
      startY: 75,
      head: [['Obat', 'Kategori', 'Volume', 'Nilai Investasi', 'Kumulatif %', 'Kelas']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [79, 70, 229], textColor: [255, 255, 255] },
    });

    doc.save(`Analisis_ABC_${filterStartDate}_to_${filterEndDate}.pdf`);
    toast.success('Laporan PDF berhasil diunduh');
  };

  const loadData = () => {
    setIsLoading(true);
    setTimeout(() => {
      const txs = dataService.getTransaksi();
      const drugs = dataService.getObat();
      
      // Filter by date
      const filteredTxs = txs.filter(t => {
        const itemDate = format(new Date(t.tanggal), 'yyyy-MM-dd');
        return itemDate >= filterStartDate && itemDate <= filterEndDate;
      });

      // Aggregate data
      const aggregation: Record<string, any> = {};
      
      filteredTxs.forEach(tx => {
        tx.items.forEach(item => {
          if (!aggregation[item.obatId]) {
            const obat = drugs.find(d => d.id === item.obatId);
            aggregation[item.obatId] = {
              id: item.obatId,
              nama: item.namaObat,
              kategori: obat?.kategori || 'Tanpa Kategori',
              volume: 0,
              totalValue: 0,
            };
          }
          aggregation[item.obatId].volume += item.jumlah;
          aggregation[item.obatId].totalValue += item.subtotal;
        });
      });

      const result = Object.values(aggregation);
      setAbcData(result);
      
      const cats = Array.from(new Set(drugs.map(d => d.kategori))).filter(Boolean);
      setCategories(cats as string[]);
      
      setIsLoading(false);
    }, 500);
  };

  const processedData = React.useMemo(() => {
    let sorted = [...abcData].sort((a, b) => b.totalValue - a.totalValue);
    
    const totalGrandValue = sorted.reduce((sum, item) => sum + item.totalValue, 0);
    let cumulativeSum = 0;

    return sorted.map((item) => {
      cumulativeSum += item.totalValue;
      const cumulativePercentage = totalGrandValue > 0 ? (cumulativeSum / totalGrandValue) * 100 : 0;
      
      let abcCategory = 'C';
      if (cumulativePercentage <= 70) abcCategory = 'A';
      else if (cumulativePercentage <= 90) abcCategory = 'B';

      return {
        ...item,
        cumulativePercentage,
        abcCategory
      };
    });
  }, [abcData]);

  const filteredData = processedData.filter(item => {
    const matchesSearch = item.nama.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCategory = categoryFilter === 'all' || item.kategori === categoryFilter;
    return matchesSearch && matchesCategory;
  });

  const summary = {
    A: processedData.filter(d => d.abcCategory === 'A').length,
    B: processedData.filter(d => d.abcCategory === 'B').length,
    C: processedData.filter(d => d.abcCategory === 'C').length,
    totalValue: processedData.reduce((sum, d) => sum + d.totalValue, 0)
  };

  const chartData = [
    { name: 'Kategori A', count: summary.A, value: processedData.filter(d => d.abcCategory === 'A').reduce((s, x) => s + x.totalValue, 0) },
    { name: 'Kategori B', count: summary.B, value: processedData.filter(d => d.abcCategory === 'B').reduce((s, x) => s + x.totalValue, 0) },
    { name: 'Kategori C', count: summary.C, value: processedData.filter(d => d.abcCategory === 'C').reduce((s, x) => s + x.totalValue, 0) },
  ];

  const COLORS = ['#ef4444', '#f59e0b', '#22c55e'];

  return (
    <div className="space-y-6">
      {/* Date Filter Section */}
      <div className="bg-white p-6 rounded-2xl border shadow-sm space-y-4">
        <div className="flex items-center gap-2 mb-2">
          <Calendar className="text-primary" size={20} />
          <h3 className="font-black text-slate-800 uppercase tracking-tight">Periode Analisis</h3>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-slate-500">Tanggal Mulai</Label>
            <Input type="date" value={filterStartDate} onChange={(e) => setFilterStartDate(e.target.value)} className="h-11 rounded-xl border-2" />
          </div>
          <div className="space-y-1.5">
            <Label className="text-xs font-bold uppercase text-slate-500">Tanggal Akhir</Label>
            <Input type="date" value={filterEndDate} onChange={(e) => setFilterEndDate(e.target.value)} className="h-11 rounded-xl border-2" />
          </div>
          <div className="flex items-end">
            <Button onClick={loadData} className="w-full h-11 rounded-xl font-bold gap-2" disabled={isLoading}>
              {isLoading ? <Loader2 className="animate-spin" size={18} /> : <Search size={18} />}
              Perbarui Analisis
            </Button>
          </div>
        </div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card className="border-none shadow-sm bg-rose-50 border-l-4 border-l-rose-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-rose-600 uppercase tracking-widest mb-1">Kategori A (Prioritas Tinggi)</p>
                <h3 className="text-3xl font-black text-rose-900">{summary.A} Item</h3>
                <p className="text-xs text-rose-700 mt-2 font-bold italic">Menyumbang ~70% dari Nilai Investasi</p>
              </div>
              <div className="bg-rose-500/10 p-3 rounded-xl text-rose-600">
                <AlertCircle size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-amber-50 border-l-4 border-l-amber-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-amber-600 uppercase tracking-widest mb-1">Kategori B (Menengah)</p>
                <h3 className="text-3xl font-black text-amber-900">{summary.B} Item</h3>
                <p className="text-xs text-amber-700 mt-2 font-bold italic">Menyumbang ~20% dari Nilai Investasi</p>
              </div>
              <div className="bg-amber-500/10 p-3 rounded-xl text-amber-600">
                <TrendingUp size={24} />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm bg-emerald-50 border-l-4 border-l-emerald-500">
          <CardContent className="p-6">
            <div className="flex justify-between items-start">
              <div>
                <p className="text-xs font-black text-emerald-600 uppercase tracking-widest mb-1">Kategori C (Rutin)</p>
                <h3 className="text-3xl font-black text-emerald-900">{summary.C} Item</h3>
                <p className="text-xs text-emerald-700 mt-2 font-bold italic">Menyumbang ~10% dari Nilai Investasi</p>
              </div>
              <div className="bg-emerald-500/10 p-3 rounded-xl text-emerald-600">
                <Layers size={24} />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <BarChart3 className="text-primary" size={20} />
              <h3 className="text-lg font-black tracking-tight">Investasi Berdasarkan Kategori</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} />
                  <YAxis axisLine={false} tickLine={false} hide />
                  <Tooltip 
                    cursor={{fill: '#f8fafc'}}
                    contentStyle={{ borderRadius: '12px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)' }}
                  />
                  <Bar dataKey="value" radius={[8, 8, 0, 0]}>
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Bar>
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        <Card className="border-none shadow-sm overflow-hidden">
          <CardContent className="p-6">
            <div className="flex items-center gap-2 mb-6">
              <PieChartIcon className="text-primary" size={20} />
              <h3 className="text-lg font-black tracking-tight">Proporsi Jumlah Item</h3>
            </div>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={chartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={100}
                    paddingAngle={5}
                    dataKey="count"
                  >
                    {chartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip />
                  <Legend verticalAlign="bottom" height={36}/>
                </PieChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="bg-white p-4 rounded-xl border shadow-sm space-y-4">
        <div className="flex flex-col md:flex-row justify-between gap-4">
          <div className="flex items-center gap-3 flex-1">
             <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground" size={18} />
                <Input 
                   placeholder="Cari item obat..." 
                   className="pl-10 h-11 border-slate-200 bg-slate-50/50 rounded-xl"
                   value={searchTerm}
                   onChange={(e) => setSearchTerm(e.target.value)}
                />
             </div>
             <Select value={categoryFilter} onValueChange={setCategoryFilter}>
               <SelectTrigger className="w-[200px] h-11 border-slate-200 bg-slate-50/50 font-bold rounded-xl">
                 <SelectValue placeholder="Semua Kategori" />
               </SelectTrigger>
               <SelectContent className="rounded-xl">
                 <SelectItem value="all">Semua Kategori</SelectItem>
                 {categories.map(cat => (
                   <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                 ))}
               </SelectContent>
             </Select>
          </div>
          <div className="flex gap-2">
             <Button variant="outline" className="h-11 font-bold gap-2 rounded-xl" onClick={handleExportExcel}>
                <FileSpreadsheet size={18} /> Export Excel
             </Button>
             <Button variant="outline" className="h-11 font-bold gap-2 rounded-xl" onClick={handleDownloadPDF}>
                <Download size={18} /> Download Analisis
             </Button>
          </div>
        </div>

        <div className="rounded-xl border border-slate-100 overflow-hidden">
          <table className="w-full text-sm">
            <thead className="bg-slate-50 text-xs font-black uppercase tracking-wider text-slate-500">
              <tr>
                <th className="px-5 py-4 text-left">Obat</th>
                <th className="px-5 py-4 text-left">Kategori</th>
                <th className="px-5 py-4 text-right">Volume Jual</th>
                <th className="px-5 py-4 text-right">Nilai Investasi</th>
                <th className="px-5 py-4 text-right">Kumulatif (%)</th>
                <th className="px-5 py-4 text-center">Kelas ABC</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {filteredData.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-5 py-10 text-center text-slate-400 font-bold italic">
                    {isLoading ? 'Memuat data...' : 'Tidak ada data transaksi pada periode ini.'}
                  </td>
                </tr>
              ) : (
                filteredData.map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/50 transition-colors">
                    <td className="px-5 py-4 font-bold text-slate-800">{item.nama}</td>
                    <td className="px-5 py-4 text-xs font-black text-slate-500 uppercase">{item.kategori}</td>
                    <td className="px-5 py-4 text-right tabular-nums font-medium">{item.volume.toLocaleString()} Unit</td>
                    <td className="px-5 py-4 text-right tabular-nums font-bold">Rp {item.totalValue.toLocaleString()}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex flex-col items-end gap-1">
                        <span className="text-[10px] font-black text-slate-400">{item.cumulativePercentage.toFixed(1)}%</span>
                        <div className="w-20 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={cn(
                              "h-full rounded-full transition-all duration-1000",
                              item.abcCategory === 'A' ? 'bg-rose-500' :
                              item.abcCategory === 'B' ? 'bg-amber-500' :
                              'bg-emerald-500'
                            )}
                            style={{ width: `${item.cumulativePercentage}%` }}
                          />
                        </div>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-center">
                      <Badge 
                        className={cn(
                          "h-8 w-8 rounded-lg flex items-center justify-center p-0 font-black text-lg",
                          item.abcCategory === 'A' ? 'bg-rose-500 text-white shadow-[0_0_15px_-3px_rgba(244,63,94,0.4)]' :
                          item.abcCategory === 'B' ? 'bg-amber-500 text-white' :
                          'bg-emerald-500 text-white'
                        )}
                      >
                        {item.abcCategory}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

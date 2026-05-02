import React from 'react';
import { 
  FileText, 
  Truck, 
  TrendingUp,
  BarChart3,
  ChevronRight,
  Layers
} from 'lucide-react';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Card } from "@/components/ui/card";
import RekapSuratPesananPage from './RekapSuratPesanan';
import RekapBAPBPage from './RekapBAPB';
import RekapPenjualanPage from './RekapPenjualan';
import RekapAnalisisABCPage from './RekapAnalisisABC';
import InventoryInsights from './InventoryInsights';
import { useSearchParams } from 'react-router-dom';

export default function RekapLaporan() {
  const [searchParams, setSearchParams] = useSearchParams();
  const initialType = searchParams.get('type') || 'sp';
  const [activeRekap, setActiveRekap] = React.useState(initialType);

  React.useEffect(() => {
    const type = searchParams.get('type');
    if (type) setActiveRekap(type);
  }, [searchParams]);

  const handleRekapChange = (val: string) => {
    setActiveRekap(val);
    setSearchParams({ type: val });
  };

  const rekapOptions = [
    { value: 'sp', label: 'Rekap Surat Pesanan (SP)', icon: <FileText className="text-blue-500" size={18} /> },
    { value: 'bapb', label: 'Rekap BAPB (Penerimaan)', icon: <Truck className="text-orange-500" size={18} /> },
    { value: 'penjualan', label: 'Rekap Penjualan / Peresepan', icon: <TrendingUp className="text-green-500" size={18} /> },
    { value: 'abc', label: 'Rekap Analisis ABC Perjenis', icon: <Layers className="text-purple-500" size={18} /> },
    { value: 'prices', label: 'Rekap Kenaikan Harga (HNA)', icon: <TrendingUp className="text-red-500" size={18} /> },
    { value: 'stock_report', label: 'Laporan Status Stok', icon: <BarChart3 className="text-indigo-500" size={18} /> },
  ];

  const renderContent = () => {
    switch (activeRekap) {
      case 'sp':
        return <RekapSuratPesananPage />;
      case 'bapb':
        return <RekapBAPBPage />;
      case 'penjualan':
        return <RekapPenjualanPage />;
      case 'abc':
        return <RekapAnalisisABCPage />;
      case 'prices':
        return <InventoryInsights mode="prices" />;
      case 'stock_report':
        return <InventoryInsights mode="stock" />;
      default:
        return <RekapSuratPesananPage />;
    }
  };

  const selectedOption = rekapOptions.find(opt => opt.value === activeRekap);

  return (
    <div className="space-y-6 animate-in fade-in duration-500">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-white p-6 rounded-2xl border shadow-sm">
        <div className="flex items-center gap-3">
          <div className="bg-primary/10 p-3 rounded-xl text-primary">
            <BarChart3 size={24} />
          </div>
          <div>
            <h1 className="text-2xl font-black tracking-tight">Pusat Rekap Laporan</h1>
            <p className="text-muted-foreground text-xs font-bold uppercase tracking-widest mt-1">Gudang & Pelayanan</p>
          </div>
        </div>

        <div className="flex items-center gap-3">
           <span className="text-xs font-bold text-muted-foreground uppercase tracking-widest hidden lg:block">Pilih Jenis Laporan:</span>
           <Select value={activeRekap} onValueChange={handleRekapChange}>
             <SelectTrigger className="w-full md:w-[400px] h-12 rounded-xl border-2 font-bold bg-slate-50">
               <div className="flex items-center gap-2">
                 {selectedOption?.icon}
                 <span>{selectedOption?.label}</span>
               </div>
             </SelectTrigger>
             <SelectContent className="rounded-xl border-2">
               {rekapOptions.map((opt) => (
                 <SelectItem key={opt.value} value={opt.value} className="font-bold py-3">
                   <div className="flex items-center gap-2">
                     {opt.icon}
                     {opt.label}
                   </div>
                 </SelectItem>
               ))}
             </SelectContent>
           </Select>
        </div>
      </div>

      <div className="bg-white rounded-2xl border shadow-sm p-1">
         {/* We wrap the content in a slightly styled box but each page already has its own headers usually */}
         {/* To make it look integrated, we might want to hide the page-internal headers if they duplicates */}
         <div className="p-4 md:p-6">
           {renderContent()}
         </div>
      </div>
    </div>
  );
}

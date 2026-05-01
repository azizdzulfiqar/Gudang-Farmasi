import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Search, Command, LayoutDashboard, Package, ShoppingCart, Users, Settings as SettingsIcon, FileText, X, ArrowRight } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import { dataService } from '@/services/dataService';
import { Obat } from '@/types';

export default function CommandPalette() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [query, setQuery] = React.useState('');
  const [results, setResults] = React.useState<any[]>([]);
  const navigate = useNavigate();

  React.useEffect(() => {
    const down = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        setIsOpen((open) => !open);
      }
      if (e.key === 'Escape') {
        setIsOpen(false);
      }
    };

    document.addEventListener('keydown', down);
    return () => document.removeEventListener('keydown', down);
  }, []);

  React.useEffect(() => {
    if (!query) {
      setResults([
        { id: 'nav-dashboard', title: 'Pergi ke Dashboard', icon: <LayoutDashboard size={16} />, path: '/' },
        { id: 'nav-obat', title: 'Data Master Obat', icon: <Package size={16} />, path: '/master/obat' },
        { id: 'nav-transaksi', title: 'Input Transaksi Baru', icon: <ShoppingCart size={16} />, path: '/transaksi/peresepan' },
        { id: 'nav-laporan', title: 'Buka Laporan Penjualan', icon: <FileText size={16} />, path: '/laporan/penjualan' },
        { id: 'nav-settings', title: 'Pengaturan Sistem', icon: <SettingsIcon size={16} />, path: '/settings' },
      ]);
      return;
    }

    const obats = dataService.getObat();
    const filteredObats = obats
      .filter(o => o.nama.toLowerCase().includes(query.toLowerCase()) || o.kode.toLowerCase().includes(query.toLowerCase()))
      .slice(0, 5)
      .map(o => ({
        id: `obat-${o.id}`,
        title: o.nama,
        subtitle: `${o.kode} • Stok: ${o.stokTotal}`,
        icon: <Package size={16} />,
        path: '/master/obat',
        data: o
      }));

    setResults(filteredObats);
  }, [query]);

  const handleSelect = (path: string) => {
    navigate(path);
    setIsOpen(false);
    setQuery('');
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-start justify-center pt-[20vh] px-4 sm:px-6">
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 bg-slate-900/40 backdrop-blur-sm" 
            onClick={() => setIsOpen(false)} 
          />
          
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: -20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: -20 }}
            className="relative w-full max-w-xl bg-white rounded-2xl shadow-2xl border overflow-hidden"
          >
            <div className="flex items-center px-4 border-b">
              <Search className="text-slate-400 mr-3" size={20} />
              <input
                autoFocus
                className="w-full h-14 bg-transparent outline-none text-slate-800 placeholder:text-slate-400"
                placeholder="Cari fitur, obat, atau ketik perintah..."
                value={query}
                onChange={(e) => setQuery(e.target.value)}
              />
              <div className="flex items-center gap-1 ml-2">
                <span className="text-[10px] bg-slate-100 px-1.5 py-0.5 rounded border font-mono">ESC</span>
                <button onClick={() => setIsOpen(false)}>
                  <X size={18} className="text-slate-400 hover:text-slate-600" />
                </button>
              </div>
            </div>

            <div className="max-h-[400px] overflow-y-auto p-2">
              <div className="px-2 py-2 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                {query ? 'Hasil Pencarian' : 'Navigasi Cepat'}
              </div>
              <div className="space-y-1">
                {results.map((item) => (
                  <button
                    key={item.id}
                    onClick={() => handleSelect(item.path)}
                    className="w-full flex items-center gap-3 p-3 rounded-xl hover:bg-slate-50 transition-colors group text-left"
                  >
                    <div className="p-2 rounded-lg bg-slate-100 text-slate-600 group-hover:bg-primary group-hover:text-white transition-colors">
                      {item.icon}
                    </div>
                    <div className="flex-1">
                      <div className="text-sm font-semibold text-slate-700">{item.title}</div>
                      {item.subtitle && <div className="text-xs text-slate-400">{item.subtitle}</div>}
                    </div>
                    <ArrowRight size={14} className="text-slate-300 opacity-0 group-hover:opacity-100 transition-all -translate-x-2 group-hover:translate-x-0" />
                  </button>
                ))}
                {results.length === 0 && (
                  <div className="p-8 text-center text-slate-400 italic text-sm">
                    Tidak ditemukan hasil untuk "{query}"
                  </div>
                )}
              </div>
            </div>

            <div className="p-3 bg-slate-50 border-t flex justify-between items-center text-[10px] text-slate-400 font-medium">
              <div className="flex gap-3">
                <span className="flex items-center gap-1"><Command size={10} /> + K untuk buka</span>
                <span className="flex items-center gap-1">ENTER untuk pilih</span>
              </div>
              <div className="italic">FarmasiEase Smart Search</div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}

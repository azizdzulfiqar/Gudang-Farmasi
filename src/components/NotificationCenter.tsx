import React from 'react';
import { Bell, Info, AlertTriangle, X, Check, ArrowRight } from 'lucide-react';
import { 
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Button, buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { dataService } from '@/services/dataService';
import { format, parseISO } from 'date-fns';

export default function NotificationCenter() {
  const [notifications, setNotifications] = React.useState<any[]>([]);

  React.useEffect(() => {
    const obats = dataService.getObat();
    const bapbs = dataService.getBAPB();
    const exps = dataService.getExpiryAlerts();
    
    const alerts: any[] = [];

    // Low Stock
    obats.filter(o => o.stokTotal <= o.minStok).forEach(o => {
      alerts.push({
        id: `low-${o.id}`,
        title: 'Stok Kritis!',
        message: `${o.nama} tersisa ${o.stokTotal} ${o.satuan}.`,
        type: 'error',
        time: new Date(),
        icon: <AlertTriangle size={14} />
      });
    });

    // Expiry
    exps.slice(0, 5).forEach(e => {
      alerts.push({
        id: `exp-${e.batch}`,
        title: 'Mendekati Kadaluarsa',
        message: `${e.obatNama} (Batch: ${e.batch}) akan kadaluarsa dalam ${e.daysLeft} hari.`,
        type: 'warning',
        time: new Date(),
        icon: <Info size={14} />
      });
    });

    // BAPB Due
    bapbs.filter(b => b.status !== 'Paid' && b.tanggalJatuhTempo).forEach(b => {
      const today = new Date();
      const due = parseISO(b.tanggalJatuhTempo!);
      const diff = Math.ceil((due.getTime() - today.getTime()) / (1000 * 3600 * 24));
      if (diff <= 7 && diff >= 0) {
        alerts.push({
          id: `due-${b.id}`,
          title: 'Tempo Pembayaran',
          message: `BAPB ${b.nomor} jatuh tempo dalam ${diff} hari (${b.tanggalJatuhTempo}).`,
          type: 'info',
          time: new Date(),
          icon: <Bell size={14} />
        });
      }
    });

    setNotifications(alerts.sort((a, b) => b.time.getTime() - a.time.getTime()));
  }, []);

  const unreadCount = notifications.length;

  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon' }), "relative hover:bg-slate-100 rounded-full h-10 w-10")}>
        <Bell size={20} className="text-slate-600" />
        {unreadCount > 0 && (
          <span className="absolute top-2 right-2 flex h-4 w-4">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75"></span>
            <span className="relative inline-flex rounded-full h-4 w-4 bg-red-500 border-2 border-white items-center justify-center text-[8px] font-bold text-white">
              {unreadCount}
            </span>
          </span>
        )}
      </PopoverTrigger>
      <PopoverContent className="w-[380px] p-0 overflow-hidden rounded-2xl shadow-2xl border-2" align="end">
        <div className="p-4 bg-slate-50 border-b flex justify-between items-center">
          <div>
            <h3 className="font-bold text-sm">Pusat Notifikasi</h3>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider font-semibold">Terdapat {unreadCount} alert sistem</p>
          </div>
          <Button variant="ghost" size="sm" className="h-8 text-[10px] uppercase font-bold" onClick={() => setNotifications([])}>
            Hapus Semua
          </Button>
        </div>
        
        <div className="max-h-[400px] overflow-y-auto px-1 py-1 custom-scrollbar">
          {notifications.length > 0 ? (
            notifications.map((notif) => (
              <div key={notif.id} className="p-3 m-1 rounded-xl transition-all hover:bg-slate-50 border border-transparent hover:border-slate-100 flex gap-3 group relative">
                <div className={cn(
                  "mt-0.5 h-8 w-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                  notif.type === 'error' ? "bg-red-50 text-red-500" :
                  notif.type === 'warning' ? "bg-orange-50 text-orange-500" :
                  "bg-blue-50 text-blue-500"
                )}>
                  {notif.icon}
                </div>
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs font-bold text-slate-800">{notif.title}</h4>
                  <p className="text-[11px] text-slate-500 leading-relaxed mt-0.5">{notif.message}</p>
                  <p className="text-[9px] text-slate-400 mt-2 font-medium">{format(notif.time, 'HH:mm • dd MMM')}</p>
                </div>
                <div className="opacity-0 group-hover:opacity-100 transition-all">
                  <Button variant="ghost" size="icon" className="h-6 w-6 rounded-lg text-slate-300 hover:text-slate-500">
                    <X size={12} />
                  </Button>
                </div>
              </div>
            ))
          ) : (
            <div className="py-12 text-center flex flex-col items-center gap-3">
              <div className="bg-slate-50 p-4 rounded-full">
                <Check size={32} className="text-slate-200" />
              </div>
              <p className="text-sm text-slate-400 font-medium px-8 italic">Semua aman! Tidak ada peringatan sistem saat ini.</p>
            </div>
          )}
        </div>

        <div className="p-2 border-t bg-slate-50/50">
           <Button variant="ghost" className="w-full h-10 text-xs font-bold text-primary hover:bg-primary/5 rounded-xl gap-2">
             Tinjau Semua Log Sistem <ArrowRight size={14} />
           </Button>
        </div>
      </PopoverContent>
    </Popover>
  );
}

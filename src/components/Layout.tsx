import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { 
  LayoutDashboard, 
  Database, 
  FileText, 
  Truck, 
  ArrowRightLeft, 
  ClipboardCheck, 
  History, 
  BarChart3,
  TrendingUp,
  Menu,
  X,
  Package,
  Brain,
  Users,
  MapPin,
  Tag,
  Layers,
  Link as LinkIcon,
  ChevronDown,
  ChevronRight,
  Stethoscope,
  Settings
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Toaster } from '@/components/ui/sonner';
import { dataService } from '@/services/dataService';
import { MappingSPKhusus } from '@/types';
import AIAssistant from './AIAssistant';
import CommandPalette from './CommandPalette';
import NotificationCenter from './NotificationCenter';
import { Search, Command } from 'lucide-react';

interface SidebarItemProps {
  to: string;
  icon: React.ReactNode;
  label: string;
  active?: boolean;
  className?: string;
}

const SidebarItem = ({ to, icon, label, active, className }: SidebarItemProps) => (
  <Link to={to}>
    <Button
      variant={active ? "secondary" : "ghost"}
      className={cn(
        "w-full justify-start gap-3 px-3 py-2",
        active ? "bg-secondary text-secondary-foreground" : "hover:bg-accent text-muted-foreground hover:text-accent-foreground",
        className
      )}
    >
      {icon}
      <span>{label}</span>
    </Button>
  </Link>
);

const NavGroup = ({ label }: { label: string }) => (
  <div className="px-3 mb-2 mt-4">
    <h2 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">{label}</h2>
  </div>
);

export default function Layout({ children }: { children: React.ReactNode }) {
  const [sidebarOpen, setSidebarOpen] = React.useState(true);
  const [masterDataOpen, setMasterDataOpen] = React.useState(false);
  const [spKhususOpen, setSpKhususOpen] = React.useState(false);
  const [mappings, setMappings] = React.useState<MappingSPKhusus[]>([]);
  const location = useLocation();

  React.useEffect(() => {
    setMappings(dataService.getMappingSPKhusus());
  }, []);

  // Auto-expand Master Data if current path is a master page
  React.useEffect(() => {
    if (location.pathname.startsWith('/master/')) {
      setMasterDataOpen(true);
    }
    if (location.pathname.startsWith('/logistik/sp-khusus/')) {
      setSpKhususOpen(true);
    }
  }, [location.pathname]);

  const menuItems = [
    { to: "/", icon: <LayoutDashboard size={20} />, label: "Dashboard", group: "Main" },
    { to: "/intelligence", icon: <TrendingUp size={20} />, label: "Intelligence", group: "Main" },
    { to: "/clinical/interaction", icon: <Brain size={20} />, label: "Interaksi Obat AI", group: "Main" },
    { to: "/master/obat", icon: <Package size={20} />, label: "Data Obat", group: "Master Data" },
    { to: "/master/supplier", icon: <Users size={20} />, label: "Supplier", group: "Master Data" },
    { to: "/master/lokasi", icon: <MapPin size={20} />, label: "Lokasi", group: "Master Data" },
    { to: "/master/kategori", icon: <Tag size={20} />, label: "Kategori", group: "Master Data" },
    { to: "/master/satuan", icon: <Layers size={20} />, label: "Satuan", group: "Master Data" },
    { to: "/master/bentuk-sediaan", icon: <Layers size={20} />, label: "Bentuk Sediaan", group: "Master Data" },
    { to: "/master/mapping-sp-khusus", icon: <LinkIcon size={20} />, label: "Mapping SP Khusus", group: "Master Data" },
    { to: "/master/customer", icon: <Users size={20} />, label: "Pelanggan", group: "Master Data" },
    { to: "/master/dokter", icon: <Stethoscope size={20} />, label: "Dokter", group: "Master Data" },
    { to: "/master/spesialis", icon: <Tag size={20} />, label: "Spesialis Dokter", group: "Master Data" },
    { to: "/penjualan/peresepan", icon: <FileText size={20} />, label: "Penjualan Resep", group: "Pelayanan" },
    { to: "/logistik/sp", icon: <FileText size={20} />, label: "Surat Pesanan", group: "Logistik" },
    { to: "/logistik/bapb", icon: <Truck size={20} />, label: "BAPB (Penerimaan)", group: "Logistik" },
    { to: "/inventori/pindah", icon: <ArrowRightLeft size={20} />, label: "Pindah Lokasi", group: "Inventori" },
    { to: "/inventori/opname", icon: <ClipboardCheck size={20} />, label: "Stok Opname", group: "Inventori" },
    { to: "/inventori/kartu", icon: <History size={20} />, label: "Kartu Stok", group: "Inventori" },
    { to: "/laporan", icon: <BarChart3 size={20} />, label: "Dashboard Laporan", group: "Laporan" },
    { to: "/laporan/penjualan", icon: <TrendingUp size={20} />, label: "Laporan Penjualan", group: "Laporan" },
    { to: "/rekap", icon: <History size={20} />, label: "Pusat Rekap Laporan", group: "Rekap Laporan" },
    { to: "/settings", icon: <Settings size={20} />, label: "Pengaturan", group: "Sistem" },
  ];

  const groups = Array.from(new Set(menuItems.map(item => item.group)));

  return (
    <div className="min-h-screen bg-background flex">
      {/* Sidebar Backdrop (Mobile only) */}
      {sidebarOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/50 backdrop-blur-sm z-40 md:hidden"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar */}
      <aside 
        className={cn(
          "bg-card border-r transition-all duration-300 flex flex-col fixed inset-y-0 z-50 overflow-hidden",
          sidebarOpen ? "w-64 translate-x-0" : "-translate-x-full md:translate-x-0 w-0 md:w-20"
        )}
      >
        <div className="p-6 border-bottom flex items-center gap-3">
          <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center text-primary-foreground shadow-lg">
            <Package size={24} />
          </div>
          {sidebarOpen && <span className="font-bold text-xl tracking-tight">FarmasiEase</span>}
        </div>

        <nav className="flex-1 px-2 space-y-1 mt-4 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {groups.map(group => {
            const isMasterData = group === "Master Data";
            
            if (isMasterData) {
              const itemsInGroup = menuItems.filter(item => item.group === group);
              const isGroupActive = itemsInGroup.some(item => location.pathname === item.to);

              return (
                <div key={group} className="space-y-1">
                  {sidebarOpen && (
                    <Button
                      variant="ghost"
                      onClick={() => setMasterDataOpen(!masterDataOpen)}
                      className={cn(
                        "w-full justify-between items-center px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground mt-4",
                        isGroupActive && "text-primary bg-primary/5"
                      )}
                    >
                      <div className="flex items-center gap-3">
                        <Database size={20} />
                        <h2 className="text-xs font-semibold uppercase tracking-wider">Master Data</h2>
                      </div>
                      {masterDataOpen ? <ChevronDown size={16} /> : <ChevronRight size={16} />}
                    </Button>
                  )}
                  {(masterDataOpen || !sidebarOpen) && itemsInGroup
                    .map(item => (
                      <div key={item.to}>
                        <SidebarItem 
                          to={item.to}
                          icon={item.icon}
                          active={location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to + '/'))}
                          label={sidebarOpen ? item.label : ""}
                          className={sidebarOpen ? "pl-9" : ""}
                        />
                      </div>
                    ))}
                </div>
              );
            }

            return (
              <div key={group}>
                {sidebarOpen && <NavGroup label={group} />}
                {menuItems
                  .filter(item => item.group === group)
                  .map(item => {
                    // Special case for Surat Pesanan Khusus Dropdown
                    if (item.to === '/logistik/sp' && group === 'Logistik' && mappings.length > 0) {
                      return (
                        <div key="sp-khusus-group" className="space-y-1">
                          <SidebarItem 
                            to={item.to}
                            icon={item.icon}
                            active={location.pathname === item.to}
                            label={sidebarOpen ? item.label : ""}
                          />
                          
                          {sidebarOpen && (
                            <Button
                              variant="ghost"
                              onClick={() => setSpKhususOpen(!spKhususOpen)}
                              className={cn(
                                "w-full justify-between items-center px-3 py-2 text-muted-foreground hover:bg-accent hover:text-accent-foreground ml-0",
                                location.pathname.startsWith('/logistik/sp-khusus/') && "text-primary bg-primary/5"
                              )}
                            >
                              <div className="flex items-center gap-3">
                                <FileText size={20} />
                                <span className={cn("text-sm", !sidebarOpen && "hidden")}>SP Khusus</span>
                              </div>
                              {spKhususOpen ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                            </Button>
                          )}
                          
                          {spKhususOpen && sidebarOpen && mappings.map(m => (
                            <SidebarItem 
                              key={m.id}
                              to={`/logistik/sp-khusus/${m.jenisSP}`}
                              icon={<div className="w-1.5 h-1.5 rounded-full bg-slate-400 ml-1.5" />}
                              active={location.pathname === `/logistik/sp-khusus/${m.jenisSP}`}
                              label={m.jenisSP}
                              className="pl-9 h-8 text-xs font-normal"
                            />
                          ))}
                        </div>
                      );
                    }

                    return (
                      <div key={item.to}>
                        <SidebarItem 
                          to={item.to}
                          icon={item.icon}
                          active={location.pathname === item.to || (item.to !== '/' && location.pathname.startsWith(item.to + '/'))}
                          label={sidebarOpen ? item.label : ""}
                        />
                      </div>
                    );
                  })}
              </div>
            );
          })}
        </nav>

        <div className="p-4 border-t border-border/50">
          <div className="flex items-center gap-3 px-2">
            <div className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-xs font-semibold">AD</div>
            {sidebarOpen && (
              <div className="flex-1 overflow-hidden">
                <p className="text-sm font-medium truncate">Admin Gudang</p>
                <p className="text-xs text-muted-foreground truncate">aziz@farmasi.com</p>
              </div>
            )}
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className={cn(
        "flex-1 flex flex-col transition-all duration-300 min-w-0",
        sidebarOpen ? "md:ml-64" : "ml-0 md:ml-20"
      )}>
        {/* Header */}
        <header className="h-16 border-b bg-card/50 backdrop-blur-md sticky top-0 z-40 px-6 flex items-center justify-between">
          <Button variant="ghost" size="icon" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? <X size={20} /> : <Menu size={20} />}
          </Button>
          <div className="flex items-center gap-4">
             <button 
               onClick={() => window.dispatchEvent(new KeyboardEvent('keydown', { key: 'k', metaKey: true }))}
               className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-slate-100 hover:bg-slate-200 border rounded-xl text-slate-500 transition-all group"
             >
               <Search size={16} className="group-hover:text-primary transition-colors" />
               <span className="text-xs font-semibold">Cari Fitur atau Obat</span>
               <div className="flex items-center gap-1 ml-4 py-0.5 px-1.5 bg-white rounded border border-slate-200 text-[10px] font-mono shadow-sm">
                 <Command size={10} /><span>K</span>
               </div>
             </button>
             <NotificationCenter />
             <div className="h-8 w-px bg-slate-200 mx-1" />
          </div>
        </header>

        {/* Content Area */}
        <div className="p-6 w-full">
          {children}
        </div>
      </main>
      <CommandPalette />
      <AIAssistant />
      <Toaster position="top-right" richColors />
    </div>
  );
}

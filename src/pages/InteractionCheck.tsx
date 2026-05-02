import React from 'react';
import { Brain, Search, Trash2, Plus, Calendar, ShieldAlert, AlertCircle, CheckCircle2, Info } from 'lucide-react';
import { dataService } from '@/services/dataService';
import { InteractionCheck, Obat } from '@/types';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { ClinicalCheckContent } from '@/components/ClinicalCheck';
import { GoogleGenAI } from "@google/genai";
import { cn } from '@/lib/utils';
import { format } from 'date-fns';
import { SearchableSelect } from '@/components/SearchableSelect';
import Swal from 'sweetalert2';
import { toast } from 'sonner';

export default function InteractionCheckPage() {
  const [checks, setChecks] = React.useState<InteractionCheck[]>([]);
  const [searchTerm, setSearchTerm] = React.useState('');
  const [isModalOpen, setIsModalOpen] = React.useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = React.useState(false);
  const [selectedCheck, setSelectedCheck] = React.useState<InteractionCheck | null>(null);
  const [obats, setObats] = React.useState<Obat[]>([]);

  // New Check State
  const [selectedDrugs, setSelectedDrugs] = React.useState<string[]>([]);
  const [analysis, setAnalysis] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [severity, setSeverity] = React.useState<'low' | 'medium' | 'high' | 'none'>('none');
  const [isSaved, setIsSaved] = React.useState(false);
  const [isEditing, setIsEditing] = React.useState(false);
  const [editedAnalysis, setEditedAnalysis] = React.useState('');

  React.useEffect(() => {
    loadData();
    setObats(dataService.getObat());
  }, []);

  const loadData = () => {
    setChecks(dataService.getInteractionChecks());
  };

  const handleUpdate = () => {
    if (selectedCheck) {
      dataService.updateInteractionCheck(selectedCheck.id, { 
        analysis: editedAnalysis 
      });
      setIsEditing(false);
      loadData();
      // Update selected check to reflect changes
      setSelectedCheck({ ...selectedCheck, analysis: editedAnalysis });
      toast.success('Analisis berhasil diperbarui');
    }
  };

  // Auto-trigger analysis when drugs are selected
  React.useEffect(() => {
    if (selectedDrugs.length >= 2 && !loading && !analysis) {
      handleRunAnalysis();
    }
  }, [selectedDrugs]);

  const handleRunAnalysis = async () => {
    if (selectedDrugs.length < 2) {
      toast.error('Pilih minimal 2 obat untuk dicek interaksinya');
      return;
    }
    
    setLoading(true);
    setAnalysis('');
    setIsSaved(false);
    
    try {
      const apiKey = (process.env.GEMINI_API_KEY2 && process.env.GEMINI_API_KEY2 !== 'undefined') 
        ? process.env.GEMINI_API_KEY2 
        : process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'undefined') {
        throw new Error("GEMINI_API_KEY_MISSING");
      }
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        As a clinical pharmacist assistant, analyze the following list of medications:
        Medications: ${selectedDrugs.join(', ')}
        
        Please provide:
        1. Potential Drug-Drug Interactions (if any)
        2. Contraindications or warnings
        3. Simple advice for the patient
        
        Final verdict must be clear: [SAFE], [CAUTION], or [DANGER].
        Keep the response professional, concise, and in Indonesian.
        Format with markdown.
      `;

      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: prompt,
      });

      const text = response.text || '';
      setAnalysis(text);

      let currentSeverity: 'low' | 'medium' | 'high' | 'none' = 'low';
      if (text.includes('[DANGER]') || text.includes('DANGER') || text.includes('BAHAYA')) {
        currentSeverity = 'high';
      } else if (text.includes('[CAUTION]') || text.includes('PERINGATAN')) {
        currentSeverity = 'medium';
      }
      
      setSeverity(currentSeverity);
    } catch (error) {
      console.error("AI Analysis failed:", error);
      toast.error('Gagal melakukan analisis AI');
    } finally {
      setLoading(false);
    }
  };

  const handleSaveResult = () => {
    if (!analysis) return;
    
    dataService.addInteractionCheck({
      drugs: selectedDrugs,
      analysis: analysis,
      severity: severity
    });
    
    setIsSaved(true);
    loadData();
    toast.success('Hasil analisis disimpan ke riwayat');
  };

  const handleDelete = (id: string) => {
    Swal.fire({
      title: 'Hapus Riwayat?',
      text: "Data ini tidak dapat dikembalikan",
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#ef4444',
      confirmButtonText: 'Ya, Hapus'
    }).then((result) => {
      if (result.isConfirmed) {
        dataService.deleteInteractionCheck(id);
        loadData();
        toast.success('Hapus riwayat berhasil');
      }
    });
  };

  const filteredChecks = checks.filter(c => 
    c.drugs.some(d => d.toLowerCase().includes(searchTerm.toLowerCase())) ||
    c.analysis.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Cek Interaksi Obat AI</h1>
          <p className="text-muted-foreground">Analisis keamanan dan interaksi klinis menggunakan kecerdasan buatan.</p>
        </div>
        <Button onClick={() => setIsModalOpen(true)} className="gap-2 rounded-xl font-bold">
          <Plus size={18} /> Cek Baru
        </Button>
      </div>

      <div className="flex items-center gap-3 bg-white p-6 rounded-2xl border shadow-sm mb-6">
        <div className="bg-primary/10 p-3 rounded-xl">
          <Brain className="text-primary" size={24} />
        </div>
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-muted-foreground" size={20} />
          <Input 
            placeholder="Cari riwayat berdasarkan nama obat atau hasil analisis..." 
            className="pl-12 h-14 border-slate-200 bg-slate-50/50 rounded-xl text-lg focus:ring-primary/20"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredChecks.map((check) => (
          <Card key={check.id} className="overflow-hidden group hover:shadow-lg transition-all border-2 border-slate-100">
            <CardHeader className={cn(
              "p-4 border-b",
              check.severity === 'high' ? "bg-rose-50" :
              check.severity === 'medium' ? "bg-amber-50" :
              "bg-emerald-50"
            )}>
              <div className="flex justify-between items-start">
                <div className="flex items-center gap-2">
                  <Calendar size={14} className="text-muted-foreground" />
                  <span className="text-[10px] font-bold text-muted-foreground uppercase">{format(check.tanggal, 'PPP HH:mm')}</span>
                </div>
                <Button 
                  variant="ghost" 
                  size="icon" 
                  className="h-8 w-8 text-rose-500 opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleDelete(check.id);
                  }}
                >
                  <Trash2 size={14} />
                </Button>
              </div>
            </CardHeader>
            <CardContent className="p-6 cursor-pointer" onClick={() => {
              setSelectedCheck(check);
              setIsViewModalOpen(true);
            }}>
              <div className="space-y-4">
                <div className="flex flex-wrap gap-1.5">
                  {check.drugs.slice(0, 3).map((d, i) => (
                    <Badge key={i} variant="secondary" className="bg-slate-100 text-slate-700 text-[10px] font-bold py-0.5 px-2">{d}</Badge>
                  ))}
                  {check.drugs.length > 3 && <Badge variant="outline" className="bg-white text-[10px] py-0.5 px-2">+{check.drugs.length - 3} lagi</Badge>}
                </div>
                
                <div className="flex items-center gap-2 py-1 border-y border-slate-50">
                  {check.severity === 'high' && <ShieldAlert className="text-rose-600" size={20} />}
                  {check.severity === 'medium' && <AlertCircle className="text-amber-600" size={20} />}
                  {check.severity === 'low' && <CheckCircle2 className="text-emerald-600" size={20} />}
                  <span className={cn(
                    "text-sm font-black uppercase tracking-tight",
                    check.severity === 'high' ? "text-rose-700" :
                    check.severity === 'medium' ? "text-amber-700" :
                    "text-emerald-700"
                  )}>
                    {check.severity === 'high' ? 'High Risk' : 
                     check.severity === 'medium' ? 'Caution' : 
                     'Safe'}
                  </span>
                </div>

                <p className="text-xs text-slate-600 line-clamp-4 leading-relaxed h-16">
                  {check.analysis.replace(/[#*]/g, '').substring(0, 200)}...
                </p>
                
                <div className="pt-2 flex justify-between items-center text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                  <span>AI Powered</span>
                  <span>Lihat Detail →</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}

        {filteredChecks.length === 0 && (
          <div className="col-span-full py-20 bg-white rounded-3xl border-2 border-dashed flex flex-col items-center justify-center text-muted-foreground opacity-30">
            <Brain size={64} strokeWidth={1} />
            <p className="mt-4 font-bold uppercase tracking-widest">Belum ada riwayat cek</p>
          </div>
        )}
      </div>

      {/* NEW CHECK MODAL */}
        <Dialog open={isModalOpen} onOpenChange={(open) => {
          setIsModalOpen(open);
          if (!open) {
            setAnalysis('');
            setSeverity('none');
            setIsSaved(false);
            setSelectedDrugs([]);
          }
        }}>
        <DialogContent className="max-w-6xl bg-white border-2 min-h-[80vh] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b">
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <Plus className="text-primary" size={28} />
              Cek Interaksi Baru
            </DialogTitle>
          </DialogHeader>

          <div className="flex-1 overflow-y-auto flex flex-col">
             <div className="p-8 bg-slate-50 border-b space-y-6">
                <div className="flex flex-col gap-2">
                  <label className="text-xs font-black uppercase tracking-wider text-slate-500 px-1 flex items-center gap-2">
                    <Search size={14} /> Pilih Daftar Obat (Minimal 2)
                  </label>
                  <div className="flex gap-3">
                    <div className="flex-1">
                      <SearchableSelect 
                        options={obats.map(o => ({ value: o.id, label: o.nama }))}
                        value=""
                        onValueChange={(v) => {
                          const obat = obats.find(o => o.id === v);
                          if (obat && !selectedDrugs.includes(obat.nama)) {
                            setSelectedDrugs([...selectedDrugs, obat.nama]);
                            setAnalysis('');
                            setSeverity('none');
                            setIsSaved(false);
                          }
                        }}
                        placeholder="Klik untuk mencari dan menambah obat..."
                        className="h-14 shadow-sm text-lg border-2 border-slate-200 focus:border-primary/50"
                      />
                    </div>
                    {selectedDrugs.length > 0 && (
                      <Button variant="outline" className="text-rose-500 border-rose-200 hover:bg-rose-50 h-14 px-6 font-bold rounded-xl" onClick={() => {
                        setSelectedDrugs([]);
                        setAnalysis('');
                        setSeverity('none');
                        setIsSaved(false);
                      }}>
                        Bersihkan Semua
                      </Button>
                    )}
                  </div>
                </div>

                {selectedDrugs.length > 0 && (
                  <div className="flex flex-wrap gap-2 animate-in fade-in slide-in-from-top-2">
                     {selectedDrugs.map((d, i) => (
                       <Badge key={i} className="pl-4 pr-1.5 py-1.5 gap-2 h-10 bg-white border-2 border-primary/20 shadow-sm font-bold text-sm text-primary rounded-xl">
                         {d}
                         <Button 
                          variant="ghost" 
                          size="icon" 
                          className="h-7 w-7 rounded-lg hover:bg-rose-50 hover:text-rose-500 transition-colors" 
                          onClick={() => {
                            setSelectedDrugs(selectedDrugs.filter(item => item !== d));
                            setAnalysis('');
                            setSeverity('none');
                            setIsSaved(false);
                          }}
                         >
                           <Search className="rotate-45" size={14} />
                         </Button>
                       </Badge>
                     ))}
                  </div>
                )}
             </div>

             <div className="flex-1 overflow-y-auto">
                {selectedDrugs.length >= 2 ? (
                  <ClinicalCheckContent 
                    drugs={selectedDrugs}
                    loading={loading}
                    analysis={analysis}
                    severity={severity}
                    runAnalysis={handleRunAnalysis}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveResult}
                    isSaved={isSaved}
                  />
                ) : (
                  <div className="h-full flex flex-col items-center justify-center p-12 text-center text-muted-foreground opacity-50">
                    <Info size={48} strokeWidth={1} className="mb-4" />
                    <h3 className="font-bold text-lg">Pilih Minimal 2 Obat</h3>
                    <p className="text-sm max-w-xs mx-auto">AI memerlukan minimal dua jenis obat untuk menganalisis potensi interaksi antar obat.</p>
                  </div>
                )}
             </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* VIEW MODAL */}
      <Dialog open={isViewModalOpen} onOpenChange={(open) => {
        setIsViewModalOpen(open);
        if (!open) setIsEditing(false);
      }}>
        <DialogContent className="max-w-6xl bg-white border-2 min-h-[80vh] max-h-[90vh] flex flex-col p-0 overflow-hidden">
          <DialogHeader className="p-6 pb-2 border-b flex flex-row items-center justify-between space-y-0">
            <DialogTitle className="flex items-center gap-2 text-2xl font-black">
              <Brain className="text-primary" size={28} />
              Detail Riwayat Clinical Check
            </DialogTitle>
            <div className="flex items-center gap-2 pr-8">
              {!isEditing ? (
                <Button variant="outline" className="gap-2" onClick={() => {
                  setEditedAnalysis(selectedCheck?.analysis || '');
                  setIsEditing(true);
                }}>
                  Edit Analisis
                </Button>
              ) : (
                <div className="flex gap-2">
                   <Button variant="ghost" onClick={() => setIsEditing(false)}>Batal</Button>
                   <Button onClick={handleUpdate}>Simpan Perubahan</Button>
                </div>
              )}
            </div>
          </DialogHeader>

          {selectedCheck && (
            <div className="flex-1 overflow-y-auto">
              {isEditing ? (
                <div className="p-6 h-full flex flex-col gap-4">
                  <div className="bg-amber-50 border border-amber-200 p-3 rounded-lg text-xs text-amber-800 font-medium">
                    Anda sedang mengedit hasil analisis. Gunakan format Markdown untuk hasil yang lebih rapi.
                  </div>
                  <textarea 
                    className="flex-1 w-full p-6 font-mono text-sm bg-slate-50 border rounded-2xl focus:ring-2 focus:ring-primary/20 outline-none resize-none"
                    value={editedAnalysis}
                    onChange={(e) => setEditedAnalysis(e.target.value)}
                  />
                </div>
              ) : (
                <ClinicalCheckContent 
                  drugs={selectedCheck.drugs}
                  loading={false}
                  analysis={selectedCheck.analysis}
                  severity={selectedCheck.severity}
                  runAnalysis={() => {}} // Not needed for view
                  onClose={() => setIsViewModalOpen(false)}
                />
              )}
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
}

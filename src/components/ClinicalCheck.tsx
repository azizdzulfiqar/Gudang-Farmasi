import React from 'react';
import { GoogleGenAI } from "@google/genai";
import { Brain, AlertCircle, CheckCircle2, ShieldAlert, Loader2, Info, Copy, Printer } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';
import { toast } from 'sonner';

interface ClinicalCheckProps {
  drugs: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
}

export function ClinicalCheckContent({ drugs, loading, analysis, severity, runAnalysis, onClose, onSave, isSaved }: { 
  drugs: string[], 
  loading: boolean, 
  analysis: string, 
  severity: 'low' | 'medium' | 'high' | 'none',
  runAnalysis: () => void,
  onClose?: () => void,
  onSave?: () => void,
  isSaved?: boolean
}) {
  const handleCopy = () => {
    if (!analysis) return;
    navigator.clipboard.writeText(analysis);
    toast.success('Analisis disalin ke clipboard');
  };

  const handlePrint = () => {
    if (!analysis) return;
    const printWindow = window.open('', '_blank');
    if (!printWindow) return;
    
    const formattedDate = new Date().toLocaleString('id-ID', {
      dateStyle: 'long',
      timeStyle: 'short'
    });

    printWindow.document.write(`
      <html>
        <head>
          <title>Laporan Interaksi Obat AI - FarmasiEase</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;700;900&display=swap');
            body { font-family: 'Inter', sans-serif; padding: 50px; color: #1e293b; line-height: 1.6; }
            .header { border-bottom: 4px solid #0f172a; padding-bottom: 20px; margin-bottom: 30px; display: flex; justify-content: space-between; align-items: center; }
            .title { font-weight: 900; font-size: 24px; text-transform: uppercase; letter-spacing: -0.025em; }
            .meta { font-size: 12px; color: #64748b; font-weight: bold; }
            .section { margin-bottom: 30px; }
            .section-title { font-weight: 900; font-size: 14px; text-transform: uppercase; color: #64748b; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 5px; }
            .drugs { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 20px; }
            .drug-badge { background: #f1f5f9; padding: 4px 12px; border-radius: 6px; font-weight: 700; font-size: 13px; border: 1px solid #e2e8f0; }
            .severity { display: inline-block; padding: 6px 16px; border-radius: 99px; font-weight: 900; text-transform: uppercase; font-size: 14px; margin-bottom: 20px; }
            .severity-high { background: #fff1f2; color: #be123c; border: 1px solid #fecdd3; }
            .severity-medium { background: #fffbeb; color: #b45309; border: 1px solid #fde68a; }
            .severity-low { background: #ecfdf5; color: #047857; border: 1px solid #a7f3d0; }
            .analysis { font-size: 15px; white-space: pre-wrap; background: #fafafa; padding: 25px; border-radius: 12px; border: 1px solid #f1f5f9; }
            .footer { margin-top: 50px; padding-top: 20px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; font-style: italic; }
            @media print {
              body { padding: 0; }
              .no-print { display: none; }
            }
          </style>
        </head>
        <body>
          <div class="header">
            <div class="title">Clinical Interaction Report</div>
            <div class="meta">FarmasiEase AI Assistant</div>
          </div>
          
          <div class="section">
            <div class="section-title">Medication Profile</div>
            <div class="drugs">
              ${drugs.map(d => `<span class="drug-badge">${d}</span>`).join('')}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Assessment Level</div>
            <div class="severity severity-${severity}">
              ${severity === 'high' ? 'HIGH RISK INTERACTION' : severity === 'medium' ? 'PRECAUTIONS NEEDED' : 'NO SIGNIFICANT CONCERNS'}
            </div>
          </div>

          <div class="section">
            <div class="section-title">Detailed Analysis</div>
            <div class="analysis">${analysis}</div>
          </div>

          <div class="footer">
            Disclaimer: This analysis is AI-generated and intended for clinical support only. Final decisions must be made by qualified healthcare professionals.<br>
            Generated on: ${formattedDate}
          </div>
          
          <script>
            window.onload = function() { window.print(); window.onafterprint = function() { window.close(); }; }
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  return (
    <div className="flex flex-col h-full">
      <div className="flex-1 overflow-y-auto p-6 space-y-6">
        <div className="bg-slate-50 p-4 rounded-2xl border border-dashed text-sm flex flex-col gap-2">
          <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Checking medications:</p>
          <div className="flex flex-wrap gap-2">
            {drugs.map((d, i) => (
              <Badge key={i} variant="secondary" className="bg-white border shadow-sm px-3 py-1 font-bold">{d}</Badge>
            ))}
          </div>
        </div>

        <div className={cn(
          "min-h-[300px] rounded-2xl p-8 relative overflow-hidden transition-colors duration-500",
          loading ? "bg-slate-50 flex items-center justify-center" : 
          severity === 'high' ? "bg-rose-50 border-2 border-rose-100" :
          severity === 'medium' ? "bg-amber-50 border-2 border-amber-100" :
          "bg-emerald-50 border-2 border-emerald-100"
        )}>
          {loading ? (
            <div className="flex flex-col items-center gap-4">
              <Loader2 className="animate-spin text-primary" size={40} />
              <p className="text-sm font-bold text-muted-foreground animate-pulse text-center px-4">Menghubungkan ke Gemini AI...</p>
            </div>
          ) : (
            <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
              <div className="flex items-center gap-3 mb-6 p-4 rounded-2xl bg-white/50 border border-current/10">
                  {severity === 'high' && <ShieldAlert className="text-rose-600" size={32} />}
                  {severity === 'medium' && <AlertCircle className="text-amber-600" size={32} />}
                  {severity === 'low' && <CheckCircle2 className="text-emerald-600" size={32} />}
                  <div>
                    <h3 className={cn(
                      "text-xl font-black uppercase tracking-tight",
                      severity === 'high' ? "text-rose-700" :
                      severity === 'medium' ? "text-amber-700" :
                      "text-emerald-700"
                    )}>
                      {severity === 'high' ? 'High Risk Interaction' : 
                       severity === 'medium' ? 'Precautions Needed' : 
                       'No Significant Concerns'}
                    </h3>
                    <p className="text-[10px] font-bold opacity-70 uppercase tracking-widest">AI Clinical Assessment</p>
                  </div>
               </div>
               <div className="prose prose-base md:prose-lg max-w-none prose-slate prose-p:leading-relaxed prose-li:my-1 text-slate-800 prose-headings:text-slate-900 prose-headings:font-black prose-strong:text-slate-900 prose-strong:font-bold">
                  <ReactMarkdown>{analysis}</ReactMarkdown>
               </div>
               
               <div className="flex items-center gap-2 mt-8 pt-6 border-t border-current/10">
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={handleCopy}
                   className={cn(
                     "gap-2 font-bold rounded-lg text-xs uppercase tracking-widest",
                     severity === 'high' ? "hover:bg-rose-100 text-rose-700" :
                     severity === 'medium' ? "hover:bg-amber-100 text-amber-700" :
                     "hover:bg-emerald-100 text-emerald-700"
                   )}
                 >
                   <Copy size={14} /> Salin Teks
                 </Button>
                 <Button 
                   variant="ghost" 
                   size="sm" 
                   onClick={handlePrint}
                   className={cn(
                     "gap-2 font-bold rounded-lg text-xs uppercase tracking-widest",
                     severity === 'high' ? "hover:bg-rose-100 text-rose-700" :
                     severity === 'medium' ? "hover:bg-amber-100 text-amber-700" :
                     "hover:bg-emerald-100 text-emerald-700"
                   )}
                 >
                   <Printer size={14} /> Cetak Laporan
                 </Button>
               </div>
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 p-4 bg-blue-50 rounded-xl border border-blue-100 text-blue-700">
          <Info size={16} className="shrink-0" />
          <p className="text-[10px] leading-tight italic">
            Disclaimer: Analisis ini bersifat bantuan (AI). Keputusan klinis tetap berada di tangan Apoteker/Dokter yang bertugas.
          </p>
        </div>
      </div>

      <div className="flex justify-end items-center gap-4 p-6 border-t bg-slate-50">
        <div className="flex-1">
          {isSaved && (
             <div className="flex items-center gap-2 text-emerald-600 text-sm font-bold px-4 bg-emerald-50 py-2 rounded-full w-fit border border-emerald-100">
                <CheckCircle2 size={18} /> Tersimpan di Riwayat
             </div>
          )}
        </div>
        <div className="flex items-center gap-3">
          {onClose && <Button variant="outline" onClick={onClose} className="rounded-xl px-6 h-12 font-bold bg-white">Kembali</Button>}
          <Button onClick={runAnalysis} variant="secondary" disabled={loading} className="rounded-xl px-6 h-12 font-bold">
            {analysis ? 'Analisis Ulang' : 'Mulai Analisis'}
          </Button>
          {onSave && !isSaved && analysis && !loading && (
            <Button onClick={onSave} className="rounded-xl px-10 h-12 font-black uppercase tracking-wider shadow-xl shadow-primary/20 bg-primary hover:bg-primary/90 text-white">
              Simpan Hasil Analisis
            </Button>
          )}
        </div>
      </div>
    </div>
  );
}

export default function ClinicalCheck({ drugs, isOpen, onOpenChange }: ClinicalCheckProps) {
  const [analysis, setAnalysis] = React.useState<string>('');
  const [loading, setLoading] = React.useState(false);
  const [severity, setSeverity] = React.useState<'low' | 'medium' | 'high' | 'none'>('none');

  const runAnalysis = async () => {
    if (drugs.length === 0) return;
    setLoading(true);
    setAnalysis('');
    
    try {
      const apiKey = (process.env.GEMINI_API_KEY2 && process.env.GEMINI_API_KEY2 !== 'undefined') 
        ? process.env.GEMINI_API_KEY2 
        : process.env.GEMINI_API_KEY;

      if (!apiKey || apiKey === 'undefined') {
        throw new Error("GEMINI_API_KEY_MISSING");
      }
      const ai = new GoogleGenAI({ apiKey });

      const prompt = `
        As a clinical pharmacist assistant, analyze the following list of medications for a patient's prescription:
        Medications: ${drugs.join(', ')}
        
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

      if (text.includes('[DANGER]') || text.includes('DANGER') || text.includes('BAHAYA')) {
        setSeverity('high');
      } else if (text.includes('[CAUTION]') || text.includes('PERINGATAN')) {
        setSeverity('medium');
      } else {
        setSeverity('low');
      }
    } catch (error) {
      console.error("AI Analysis failed:", error);
      if (error instanceof Error && (error.message.includes('API key') || error.message.includes('MISSING'))) {
        setAnalysis("### ⚠️ API Key Missing / Invalid\nGemini API Key belum diatur. Silakan tambahkan **GEMINI_API_KEY2** pada menu **Settings > Secrets** di AI Studio untuk mengaktifkan fitur ini.");
        setSeverity('high');
      } else {
        setAnalysis("Maaf, terjadi kesalahan saat melakukan analisis klinis. Pastikan koneksi internet stabil.");
      }
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (isOpen && drugs.length > 0) {
      runAnalysis();
    }
  }, [isOpen]);

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl bg-white border-2 max-h-[90vh] flex flex-col p-0 overflow-y-auto">
        <DialogHeader className="p-6 pb-2 border-b">
          <DialogTitle className="flex items-center gap-2 text-2xl font-black">
            <Brain className="text-primary" size={28} />
            AI Clinical Insight
          </DialogTitle>
        </DialogHeader>

        <ClinicalCheckContent 
          drugs={drugs}
          loading={loading}
          analysis={analysis}
          severity={severity}
          runAnalysis={runAnalysis}
          onClose={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  );
}

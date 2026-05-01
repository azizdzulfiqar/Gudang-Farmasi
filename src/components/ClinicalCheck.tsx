import React from 'react';
import { GoogleGenAI } from "@google/genai";
import { Brain, AlertCircle, CheckCircle2, ShieldAlert, Loader2, Info } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import ReactMarkdown from 'react-markdown';
import { Badge } from '@/components/ui/badge';
import { cn } from '@/lib/utils';

interface ClinicalCheckProps {
  drugs: string[];
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
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
      const apiKey = process.env.GEMINI_API_KEY2;
      if (!apiKey) {
        throw new Error("GEMINI_API_KEY2_MISSING");
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
      if (error instanceof Error && (error.message === "GEMINI_API_KEY2_MISSING" || error.message.includes('API key'))) {
        setAnalysis("### ⚠️ API Key Missing / Invalid\nGemini API Key (GEMINI_API_KEY2) belum diatur. Silakan tambahkan **GEMINI_API_KEY2** pada menu **Settings > Secrets** di AI Studio untuk mengaktifkan fitur ini.");
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
      <DialogContent className="max-w-2xl bg-white border-2">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-2xl font-black">
            <Brain className="text-primary" size={28} />
            AI Clinical Insight
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6 py-4">
          <div className="bg-slate-50 p-4 rounded-2xl border border-dashed text-sm flex flex-col gap-2">
            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest px-1">Checking medications:</p>
            <div className="flex flex-wrap gap-2">
              {drugs.map((d, i) => (
                <Badge key={i} variant="secondary" className="bg-white border shadow-sm px-3 py-1 font-bold">{d}</Badge>
              ))}
            </div>
          </div>

          <div className={cn(
            "min-h-[200px] rounded-2xl p-6 relative overflow-hidden transition-colors duration-500",
            loading ? "bg-slate-50 flex items-center justify-center" : 
            severity === 'high' ? "bg-rose-50 border-2 border-rose-100" :
            severity === 'medium' ? "bg-amber-50 border-2 border-amber-100" :
            "bg-emerald-50 border-2 border-emerald-100"
          )}>
            {loading ? (
              <div className="flex flex-col items-center gap-4">
                <Loader2 className="animate-spin text-primary" size={40} />
                <p className="text-sm font-bold text-muted-foreground animate-pulse">Menghubungkan ke Gemini AI...</p>
              </div>
            ) : (
              <div className="relative z-10 animate-in fade-in slide-in-from-bottom-4 duration-700">
                 <div className="flex items-center gap-3 mb-6">
                    {severity === 'high' && <ShieldAlert className="text-rose-600" size={32} />}
                    {severity === 'medium' && <AlertCircle className="text-amber-600" size={32} />}
                    {severity === 'low' && <CheckCircle2 className="text-emerald-600" size={32} />}
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
                 </div>
                 <div className="prose prose-sm max-w-none prose-slate prose-p:leading-relaxed prose-li:my-1">
                    <ReactMarkdown>{analysis}</ReactMarkdown>
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

          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline" onClick={() => onOpenChange(false)} className="rounded-xl px-6 h-11 font-bold">Tutup</Button>
            <Button onClick={runAnalysis} variant="ghost" disabled={loading} className="rounded-xl px-6 h-11 font-bold text-primary">Analisis Ulang</Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}

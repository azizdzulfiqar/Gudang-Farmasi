import React from 'react';
import { Bot, Send, X, MessageSquare, Loader2, Minimize2, Maximize2, Sparkles } from 'lucide-react';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { aiService } from '@/services/aiService';
import { motion, AnimatePresence } from 'motion/react';
import { cn } from '@/lib/utils';
import Markdown from 'react-markdown';

export default function AIAssistant() {
  const [isOpen, setIsOpen] = React.useState(false);
  const [isMinimized, setIsMinimized] = React.useState(false);
  const [input, setInput] = React.useState('');
  const [messages, setMessages] = React.useState<{ text: string; isBot: boolean }[]>([
    { text: "Halo! Saya Asisten Farmasi AI. Ada yang bisa saya bantu terkait obat atau manajemen operasional farmasi Anda hari ini?", isBot: true }
  ]);
  const [isLoading, setIsLoading] = React.useState(false);
  const scrollRef = React.useRef<HTMLDivElement>(null);

  React.useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isLoading]);

  const handleSend = async () => {
    if (!input.trim() || isLoading) return;

    const userMsg = input.trim();
    setInput('');
    setMessages(prev => [...prev, { text: userMsg, isBot: false }]);
    setIsLoading(true);

    try {
      const response = await aiService.askAssistant(
        userMsg, 
        "Anda adalah asisten cerdas untuk aplikasi FarmasiEase. Gunakan data analitik, stok, dan klinis untuk membantu pengguna. Jawab dengan format markdown yang rapi."
      );
      setMessages(prev => [...prev, { text: response || 'Maaf, terjadi kendala saat menghubungi asisten AI.', isBot: true }]);
    } catch (error) {
       setMessages(prev => [...prev, { text: "Terjadi kesalahan koneksi ke layanan Gemini. Pastikan API Key sudah terkonfigurasi.", isBot: true }]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-[100] flex flex-col items-end">
      <AnimatePresence>
        {isOpen && !isMinimized && (
          <motion.div
            initial={{ opacity: 0, scale: 0.8, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.8, y: 20 }}
            className="mb-4 w-[350px] md:w-[400px] h-[500px] bg-card border-2 shadow-2xl rounded-2xl flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-primary text-primary-foreground flex justify-between items-center bg-gradient-to-r from-primary to-blue-600">
              <div className="flex items-center gap-3">
                <div className="bg-white/20 p-1.5 rounded-lg border border-white/30 backdrop-blur-sm">
                  <Bot size={20} />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Farmasi Assistant</h3>
                  <div className="flex items-center gap-1.5">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full animate-pulse" />
                    <span className="text-[10px] opacity-80 uppercase tracking-tighter">AI Powered by Gemini</span>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-1">
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" onClick={() => setIsMinimized(true)}>
                  <Minimize2 size={16} />
                </Button>
                <Button variant="ghost" size="icon" className="h-8 w-8 hover:bg-white/20" onClick={() => setIsOpen(false)}>
                  <X size={16} />
                </Button>
              </div>
            </div>

            {/* Messages */}
            <div 
              ref={scrollRef}
              className="flex-1 overflow-y-auto p-4 space-y-4 custom-scrollbar bg-slate-50/50"
            >
              {messages.map((m, i) => (
                <div key={i} className={cn(
                  "flex flex-col max-w-[85%]",
                  m.isBot ? "items-start" : "items-end ml-auto"
                )}>
                  <div className={cn(
                    "p-3 rounded-2xl text-sm shadow-sm md:max-w-md break-words",
                    m.isBot 
                      ? "bg-white border rounded-tl-none text-slate-800" 
                      : "bg-primary text-primary-foreground rounded-tr-none"
                  )}>
                    <div className="prose prose-xs prose-slate max-w-none prose-p:leading-relaxed markdown-body">
                      <Markdown>{m.text}</Markdown>
                    </div>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1 px-1">
                    {m.isBot ? 'Assistant' : 'Anda'}
                  </span>
                </div>
              ))}
              {isLoading && (
                <div className="flex items-start gap-2">
                  <div className="bg-white border p-3 rounded-2xl rounded-tl-none text-slate-700 flex items-center gap-2">
                    <Loader2 size={16} className="animate-spin text-primary" />
                    <span className="text-sm italic">Berpikir...</span>
                  </div>
                </div>
              )}
            </div>

            {/* Input */}
            <div className="p-4 border-t bg-card">
              <form 
                onSubmit={(e) => { e.preventDefault(); handleSend(); }}
                className="flex gap-2"
              >
                <Input 
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Tanya info obat atau tips..."
                  className="rounded-full bg-muted/30 focus-visible:ring-primary h-10"
                />
                <Button type="submit" size="icon" className="rounded-full shrink-0 h-10 w-10 shadow-lg" disabled={!input || isLoading}>
                  <Send size={18} />
                </Button>
              </form>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Trigger Button or Minimized Bubble */}
      <AnimatePresence>
        {!isOpen ? (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
            <Button 
              size="lg"
              className="h-14 w-14 rounded-full shadow-2xl bg-primary hover:bg-blue-700 text-white border-2 border-white/20 p-0"
              onClick={() => setIsOpen(true)}
            >
              <Bot size={28} />
              <div className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 border-2 border-white rounded-full" />
            </Button>
          </motion.div>
        ) : isMinimized && (
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
          >
             <Button 
              size="sm"
              className="bg-primary shadow-xl rounded-full gap-2 pr-4 border-2 border-white/20"
              onClick={() => setIsMinimized(false)}
            >
              <Bot size={16} />
              <span className="text-xs font-bold uppercase tracking-tight">AI Assistant Minimized</span>
              <Maximize2 size={14} className="ml-1" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

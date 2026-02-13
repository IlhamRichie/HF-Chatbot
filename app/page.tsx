'use client';

import { useState, useEffect, useRef } from 'react';
import { 
  MessageSquare, 
  FileSearch, 
  Database, 
  Send, 
  User, 
  Bot, 
  FileText, 
  RefreshCw,
  Timer // <-- Tambahan icon jam/waktu
} from 'lucide-react';

// Tipe data untuk pesan
type Message = {
  role: 'user' | 'bot';
  content: string;
  type?: 'text' | 'retrieval_result'; 
  sources?: string[]; 
  timeTaken?: number; // <-- Tambahan field untuk waktu respon (detik)
};

export default function Home() {
  const [mode, setMode] = useState<'retrieval' | 'generative' | 'rag'>('generative'); 
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Auto-scroll ke bawah saat ada chat baru
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };
  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. Tampilkan pesan user
    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    
    const currentMessage = input; 
    setInput('');
    setLoading(true);

    // --- MULAI PENGHITUNG WAKTU ---
    const startTime = Date.now();

    try {
      // 2. KIRIM KE BACKEND
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          message: currentMessage,
          mode: mode 
        }),
      });

      const data = await response.json();

      if (!response.ok) throw new Error(data.error || 'Gagal mengambil respon');

      // --- AKHIRI PENGHITUNG WAKTU ---
      const endTime = Date.now();
      const durationSeconds = ((endTime - startTime) / 1000).toFixed(2); // Hitung dalam detik

      // 3. TERIMA BALASAN
      const botResponse: Message = {
        role: 'bot',
        content: data.reply.generated_text || data.reply, 
        type: mode === 'retrieval' ? 'retrieval_result' : 'text',
        sources: data.sources || [],
        timeTaken: parseFloat(durationSeconds) // <-- Simpan waktunya di sini
      };

      setMessages((prev) => [...prev, botResponse]);

    } catch (error) {
      console.error('Error:', error);
      
      const endTime = Date.now();
      const durationSeconds = ((endTime - startTime) / 1000).toFixed(2);
      
      const errorMsg: Message = { 
        role: 'bot', 
        content: 'Maaf, terjadi kesalahan koneksi ke server AI (Hugging Face).',
        type: 'text',
        timeTaken: parseFloat(durationSeconds)
      };
      setMessages((prev) => [...prev, errorMsg]);
    } finally {
      setLoading(false);
    }
  };

  // Fungsi Format Teks Sederhana
  const formatText = (text: string) => {
    const parts = text.split(/(\*\*.*?\*\*)/g);
    return parts.map((part, index) => {
      if (part.startsWith('**') && part.endsWith('**')) {
        return <strong key={index} className="text-indigo-400">{part.slice(2, -2)}</strong>;
      }
      return part;
    });
  };

  return (
    <div className="flex h-screen font-sans bg-gray-900 text-gray-100">
      
      {/* --- SIDEBAR --- */}
      <div className="w-72 border-r p-5 flex flex-col hidden md:flex bg-gray-800 border-gray-700">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            CHATBOT VIA HF
          </h1>
        </div>
        
        <div className="space-y-3">
          <p className="text-xs uppercase font-bold tracking-wider mb-2 text-gray-500">
            Pilih Model Otak
          </p>
          
          {[
            { id: 'generative', icon: MessageSquare, label: 'Gemma (PDF)', color: 'blue', desc: 'Tanya Jawab Materi' },
            { id: 'retrieval', icon: FileSearch, label: 'Retrieval (Tegal)', color: 'green', desc: 'Cari Klasifikasi' },
            { id: 'rag', icon: Database, label: 'RAG System', color: 'purple', desc: 'Analisis Dokumen' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all text-left ${
                mode === item.id 
                  ? `bg-${item.color}-600 text-white shadow-md shadow-${item.color}-500/20` 
                  : 'hover:bg-gray-700 text-gray-300'
              }`}
            >
              <item.icon size={20} />
              <div>
                <span className="font-medium block">{item.label}</span>
                <span className={`text-[10px] ${mode === item.id ? 'text-blue-100' : 'text-gray-400'}`}>{item.desc}</span>
              </div>
            </button>
          ))}
        </div>

        <div className="mt-auto pt-6 border-t border-gray-700">
           <button onClick={() => setMessages([])} className="flex items-center gap-2 text-sm text-gray-500 hover:text-red-500 transition-colors w-full p-2">
              <RefreshCw size={14} /> Reset Percakapan
           </button>
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Header */}
        <div className="h-16 border-b flex items-center px-6 backdrop-blur-md sticky top-0 z-10 justify-between bg-gray-900/80 border-gray-700">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {mode === 'retrieval' && <FileSearch className="text-green-500" />}
            {mode === 'generative' && <MessageSquare className="text-blue-500" />}
            {mode === 'rag' && <Database className="text-purple-500" />}
            <span className="text-gray-100">
              Mode {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </span>
          </h2>
        </div>

        {/* Chat Bubbles */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center opacity-40 text-gray-400">
              <Bot size={64} className="mb-4 text-blue-400" />
              <p className="text-lg font-medium">Halo! Saya Gemma Chatbot.</p>
              <p className="text-sm">Silakan tanya apa saja tentang PDF materi.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'bot' && (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg mt-1">
                  <Bot size={18} className="text-white" />
                </div>
              )}

              <div className={`max-w-[85%] md:max-w-[75%] rounded-2xl p-4 md:p-5 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
              }`}>
                
                <div className="whitespace-pre-wrap leading-relaxed text-[15px]">
                    {formatText(msg.content)}
                </div>

                {/* --- INDIKATOR WAKTU RESPON --- */}
                {msg.role === 'bot' && msg.timeTaken !== undefined && (
                  <div className="mt-2 text-[11px] text-gray-400 flex items-center gap-1.5 font-mono">
                    <Timer size={12} className="text-gray-500" />
                    <span>Dibalas dalam {msg.timeTaken} detik</span>
                  </div>
                )}

                {/* Bagian References / Sources (Kalau Ada) */}
                {msg.sources && msg.sources.length > 0 && (
                  <div className="mt-3 pt-3 border-t text-xs border-gray-700">
                    <p className="font-bold mb-2 flex items-center gap-1 opacity-70">
                      <FileText size={12} /> Sumber Referensi:
                    </p>
                    <div className="flex flex-wrap gap-2">
                      {msg.sources.map((src, i) => (
                        <span key={i} className="px-2 py-1 rounded-md text-[10px] bg-gray-700 text-green-300">
                          {src}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 md:w-10 md:h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm mt-1 bg-gray-700 text-gray-300">
                  <User size={18} />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-4">
               <div className="w-8 h-8 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 opacity-50">
                  <Bot size={18} className="text-white" />
                </div>
              <div className="p-4 rounded-2xl rounded-tl-none flex items-center gap-2 bg-gray-800 border border-gray-700">
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
          
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div className="p-4 md:p-6 border-t bg-gray-800 border-gray-700">
          <div className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Ketik pesan untuk Gemma (${mode})...`}
              className="flex-1 px-5 py-3 md:py-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm bg-gray-900 border-gray-700 text-white placeholder-gray-500"
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 md:p-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/30"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-xs text-gray-400 mt-2">
            Model: Gemma 3 (Generative) & BERT (Retrieval)
          </p>
        </div>

      </div>
    </div>
  );
}
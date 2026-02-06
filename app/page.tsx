'use client';

import { useState } from 'react';
import { 
  MessageSquare, 
  FileSearch, 
  Database, 
  Send, 
  User, 
  Bot, 
  FileText, 
  Sun, 
  Moon 
} from 'lucide-react';

// Tipe data untuk pesan
type Message = {
  role: 'user' | 'bot';
  content: string;
  type?: 'text' | 'retrieval_result'; 
  sources?: string[]; 
};

export default function Home() {
  // State Theme: Default 'light' sesuai request
  const [theme, setTheme] = useState<'light' | 'dark'>('light');
  
  // State Mode
  const [mode, setMode] = useState<'generative' | 'retrieval' | 'rag'>('generative');
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  const sendMessage = async () => {
    if (!input.trim()) return;

    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // SIMULASI BACKEND
    setTimeout(() => {
      let botResponse: Message = { role: 'bot', content: '' };

      if (mode === 'generative') {
        botResponse = {
          role: 'bot',
          content: 'Ini adalah jawaban mode Generative. Tampilan sekarang lebih bersih dengan tema terang!',
          type: 'text'
        };
      } else if (mode === 'retrieval') {
        botResponse = {
          role: 'bot',
          content: 'Berikut dokumen yang ditemukan:',
          type: 'retrieval_result',
          sources: ['Laporan_Akhir_2024.pdf', 'Data_Survey_Q1.xlsx']
        };
      } else if (mode === 'rag') {
        botResponse = {
          role: 'bot',
          content: 'Berdasarkan analisis dokumen, tren penjualan menunjukkan kenaikan signifikan pada kuartal ketiga.',
          type: 'text',
          sources: ['Laporan_Keuangan.pdf (Hal 12)', 'Memo_Internal.docx']
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setLoading(false);
    }, 1500);
  };

  // Helper untuk handling warna dinamis
  const isDark = theme === 'dark';

  return (
    <div className={`flex h-screen font-sans transition-colors duration-300 ${isDark ? 'bg-gray-900 text-gray-100' : 'bg-gray-50 text-gray-800'}`}>
      
      {/* --- SIDEBAR --- */}
      <div className={`w-72 border-r p-5 flex flex-col transition-colors duration-300 ${
        isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'
      }`}>
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-bold bg-gradient-to-r from-blue-500 to-purple-600 bg-clip-text text-transparent">
            Chatbot HF x Next.js
          </h1>
          
          {/* Tombol Switch Theme */}
          <button 
            onClick={() => setTheme(isDark ? 'light' : 'dark')}
            className={`p-2 rounded-full transition-all ${isDark ? 'hover:bg-gray-700 text-yellow-400' : 'hover:bg-gray-100 text-gray-600'}`}
            title="Ganti Tema"
          >
            {isDark ? <Sun size={20} /> : <Moon size={20} />}
          </button>
        </div>
        
        <div className="space-y-3">
          <p className={`text-xs uppercase font-bold tracking-wider mb-2 ${isDark ? 'text-gray-500' : 'text-gray-400'}`}>
            Pilih Mode
          </p>
          
          {[
            { id: 'generative', icon: MessageSquare, label: 'Generative', color: 'blue' },
            { id: 'retrieval', icon: FileSearch, label: 'Retrieval', color: 'green' },
            { id: 'rag', icon: Database, label: 'RAG System', color: 'purple' },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setMode(item.id as any)}
              className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-all font-medium ${
                mode === item.id 
                  ? `bg-${item.color}-600 text-white shadow-md shadow-${item.color}-500/20` 
                  : isDark 
                    ? 'hover:bg-gray-700 text-gray-300' 
                    : 'hover:bg-gray-100 text-gray-600'
              }`}
            >
              <item.icon size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </div>

        <div className={`mt-auto pt-6 border-t ${isDark ? 'border-gray-700' : 'border-gray-200'}`}>
          <div className={`flex items-center gap-3 p-3 rounded-lg ${isDark ? 'bg-gray-900/50' : 'bg-gray-100'}`}>
            <div className={`w-2 h-2 rounded-full ${isDark ? 'bg-green-400' : 'bg-green-500'} animate-pulse`} />
            <p className="text-sm font-medium">System Online</p>
          </div>
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col relative">
        
        {/* Header */}
        <div className={`h-16 border-b flex items-center px-8 backdrop-blur-md sticky top-0 z-10 transition-colors ${
          isDark ? 'bg-gray-900/80 border-gray-700' : 'bg-white/80 border-gray-200'
        }`}>
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {mode === 'generative' && <MessageSquare className="text-blue-500" />}
            {mode === 'retrieval' && <FileSearch className="text-green-500" />}
            {mode === 'rag' && <Database className="text-purple-500" />}
            <span className={isDark ? 'text-gray-100' : 'text-gray-800'}>
              Sesi {mode.charAt(0).toUpperCase() + mode.slice(1)}
            </span>
          </h2>
        </div>

        {/* Chat Bubbles */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6 scroll-smooth">
          {messages.length === 0 && (
            <div className={`h-full flex flex-col items-center justify-center opacity-40 ${isDark ? 'text-gray-400' : 'text-gray-500'}`}>
              <div className={`p-6 rounded-full mb-4 ${isDark ? 'bg-gray-800' : 'bg-gray-200'}`}>
                <Bot size={48} />
              </div>
              <p className="text-lg font-medium">Siap membantu, Bos!</p>
              <p className="text-sm">Mulai ketik pertanyaan di bawah.</p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {/* Avatar Bot */}
              {msg.role === 'bot' && (
                <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0 shadow-lg">
                  <Bot size={20} className="text-white" />
                </div>
              )}

              {/* Bubble Chat */}
              <div className={`max-w-[75%] rounded-2xl p-5 shadow-sm ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : isDark 
                    ? 'bg-gray-800 text-gray-100 rounded-tl-none border border-gray-700'
                    : 'bg-white text-gray-800 rounded-tl-none border border-gray-200'
              }`}>
                <p className="leading-relaxed text-[15px]">{msg.content}</p>

                {/* --- UI Mode Retrieval --- */}
                {msg.type === 'retrieval_result' && msg.sources && (
                  <div className="mt-4 grid gap-2">
                    {msg.sources.map((src, i) => (
                      <div key={i} className={`flex items-center gap-3 p-3 rounded-lg border transition-colors cursor-pointer group ${
                        isDark 
                          ? 'bg-gray-900 border-gray-700 hover:border-green-500' 
                          : 'bg-gray-50 border-gray-200 hover:border-green-500 hover:bg-green-50'
                      }`}>
                        <div className={`p-2 rounded ${isDark ? 'bg-gray-800' : 'bg-white'}`}>
                          <FileText size={16} className="text-green-500" />
                        </div>
                        <span className={`text-sm font-medium ${isDark ? 'text-gray-300 group-hover:text-green-400' : 'text-gray-700 group-hover:text-green-700'}`}>
                          {src}
                        </span>
                      </div>
                    ))}
                  </div>
                )}

                {/* --- UI Mode RAG --- */}
                {mode === 'rag' && msg.sources && msg.role === 'bot' && (
                  <div className={`mt-4 pt-3 border-t text-xs ${isDark ? 'border-gray-700 text-gray-400' : 'border-gray-100 text-gray-500'}`}>
                    <p className="font-bold mb-2 flex items-center gap-1 text-purple-500">
                      <Database size={12} /> Referensi:
                    </p>
                    <ul className="space-y-1">
                      {msg.sources.map((src, i) => (
                        <li key={i} className="flex gap-2">
                          <span className="text-purple-400">•</span>
                          {src}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {/* Avatar User */}
              {msg.role === 'user' && (
                <div className={`w-10 h-10 rounded-full flex items-center justify-center shrink-0 shadow-sm ${isDark ? 'bg-gray-700 text-gray-300' : 'bg-gray-200 text-gray-600'}`}>
                  <User size={20} />
                </div>
              )}
            </div>
          ))}

          {/* Loading Indicator */}
          {loading && (
            <div className="flex gap-4">
               <div className="w-10 h-10 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shrink-0">
                  <Bot size={20} className="text-white" />
                </div>
              <div className={`p-4 rounded-2xl rounded-tl-none flex items-center gap-2 ${isDark ? 'bg-gray-800' : 'bg-white border border-gray-200'}`}>
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <span className="w-2 h-2 bg-indigo-500 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className={`p-6 border-t transition-colors ${isDark ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
          <div className="max-w-4xl mx-auto flex gap-3">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Tanya sesuatu di mode ${mode}...`}
              className={`flex-1 px-5 py-4 rounded-xl border focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all shadow-sm ${
                isDark 
                  ? 'bg-gray-900 border-gray-700 text-white placeholder-gray-500' 
                  : 'bg-gray-50 border-gray-200 text-gray-900 placeholder-gray-400'
              }`}
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-4 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-blue-500/30"
            >
              <Send size={20} />
            </button>
          </div>
        </div>

      </div>
    </div>
  );
}
'use client';

import { useState } from 'react';
import { MessageSquare, FileSearch, Database, Send, User, Bot, FileText } from 'lucide-react';

// Tipe data untuk pesan
type Message = {
  role: 'user' | 'bot';
  content: string;
  type?: 'text' | 'retrieval_result'; // Khusus mode retrieval
  sources?: string[]; // Khusus mode RAG
};

export default function Home() {
  // State untuk Mode (Generative, Retrieval, RAG)
  const [mode, setMode] = useState<'generative' | 'retrieval' | 'rag'>('generative');
  
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<Message[]>([]);
  const [loading, setLoading] = useState(false);

  // Fungsi Simulasi Kirim Pesan (Backend Mocking)
  const sendMessage = async () => {
    if (!input.trim()) return;

    // 1. Masukkan pesan user
    const userMsg: Message = { role: 'user', content: input };
    setMessages((prev) => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    // 2. SIMULASI LOGIC (Nanti ini diganti fetch ke API beneran)
    setTimeout(() => {
      let botResponse: Message = { role: 'bot', content: '' };

      if (mode === 'generative') {
        // Mode 1: Generative (Ngarang bebas / Pengetahuan umum Model)
        botResponse = {
          role: 'bot',
          content: 'Ini adalah jawaban mode Generative. Model menjawab berdasarkan training datanya saja tanpa melihat dokumen eksternal.',
          type: 'text'
        };
      } else if (mode === 'retrieval') {
        // Mode 2: Retrieval (Cuma nyari dokumen)
        botResponse = {
          role: 'bot',
          content: 'Berikut adalah dokumen yang relevan dengan pertanyaan Anda:',
          type: 'retrieval_result', // UI beda nanti
          sources: ['Skripsi_Bab1.pdf', 'Jurnal_Internasional_2023.pdf', 'Dataset_V1.csv']
        };
      } else if (mode === 'rag') {
        // Mode 3: RAG (Jawab + Sumber)
        botResponse = {
          role: 'bot',
          content: 'Berdasarkan dokumen yang saya baca, metodologi yang digunakan adalah Quantitative. Hal ini disebutkan secara spesifik dalam Bab 3.',
          type: 'text',
          sources: ['Skripsi_Bab3.pdf (Halaman 40)'] // Ada sitasi
        };
      }

      setMessages((prev) => [...prev, botResponse]);
      setLoading(false);
    }, 1500); // Delay pura-pura mikir
  };

  return (
    <div className="flex h-screen bg-gray-900 text-gray-100 font-sans">
      
      {/* --- SIDEBAR (Pilih Mode) --- */}
      <div className="w-64 bg-gray-800 border-r border-gray-700 p-4 flex flex-col">
        <h1 className="text-xl font-bold mb-8 text-blue-400">DosenBot AI</h1>
        
        <div className="space-y-2">
          <p className="text-xs text-gray-500 uppercase font-semibold mb-2">Pilih Mode</p>
          
          <button
            onClick={() => setMode('generative')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              mode === 'generative' ? 'bg-blue-600 text-white' : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <MessageSquare size={18} />
            <span className="font-medium">Generative</span>
          </button>

          <button
            onClick={() => setMode('retrieval')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              mode === 'retrieval' ? 'bg-green-600 text-white' : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <FileSearch size={18} />
            <span className="font-medium">Retrieval</span>
          </button>

          <button
            onClick={() => setMode('rag')}
            className={`w-full flex items-center gap-3 px-4 py-3 rounded-lg transition-all ${
              mode === 'rag' ? 'bg-purple-600 text-white' : 'hover:bg-gray-700 text-gray-300'
            }`}
          >
            <Database size={18} />
            <span className="font-medium">RAG System</span>
          </button>
        </div>

        <div className="mt-auto pt-4 border-t border-gray-700">
          <p className="text-sm text-gray-500 text-center">Mode Aktif: <span className="font-bold text-white uppercase">{mode}</span></p>
        </div>
      </div>

      {/* --- MAIN CHAT AREA --- */}
      <div className="flex-1 flex flex-col">
        
        {/* Header */}
        <div className="h-16 border-b border-gray-700 flex items-center px-6 bg-gray-800/50 backdrop-blur">
          <h2 className="font-semibold text-lg flex items-center gap-2">
            {mode === 'generative' && <MessageSquare className="text-blue-500" />}
            {mode === 'retrieval' && <FileSearch className="text-green-500" />}
            {mode === 'rag' && <Database className="text-purple-500" />}
            Chat Session
          </h2>
        </div>

        {/* Chat Bubbles */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {messages.length === 0 && (
            <div className="h-full flex flex-col items-center justify-center text-gray-500 opacity-50">
              <Bot size={64} className="mb-4" />
              <p>Silakan mulai percakapan dengan mode <strong>{mode}</strong></p>
            </div>
          )}

          {messages.map((msg, idx) => (
            <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              
              {msg.role === 'bot' && (
                <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center shrink-0">
                  <Bot size={16} />
                </div>
              )}

              <div className={`max-w-[70%] rounded-2xl p-4 ${
                msg.role === 'user' 
                  ? 'bg-blue-600 text-white rounded-tr-none' 
                  : 'bg-gray-700 text-gray-100 rounded-tl-none border border-gray-600'
              }`}>
                {/* Isi Pesan */}
                <p className="leading-relaxed">{msg.content}</p>

                {/* KHUSUS MODE RETRIEVAL: Tampilkan Kartu Dokumen */}
                {msg.type === 'retrieval_result' && msg.sources && (
                  <div className="mt-4 space-y-2">
                    {msg.sources.map((src, i) => (
                      <div key={i} className="flex items-center gap-2 bg-gray-800 p-2 rounded border border-gray-600 text-sm text-green-400 cursor-pointer hover:bg-gray-900">
                        <FileText size={14} />
                        <span>{src}</span>
                      </div>
                    ))}
                  </div>
                )}

                {/* KHUSUS MODE RAG: Tampilkan Sumber Kecil di Bawah */}
                {mode === 'rag' && msg.sources && msg.role === 'bot' && (
                  <div className="mt-3 pt-3 border-t border-gray-600 text-xs text-gray-400">
                    <p className="font-semibold mb-1 text-purple-400">Sumber Referensi:</p>
                    <ul className="list-disc list-inside">
                      {msg.sources.map((src, i) => (
                        <li key={i}>{src}</li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>

              {msg.role === 'user' && (
                <div className="w-8 h-8 rounded-full bg-gray-600 flex items-center justify-center shrink-0">
                  <User size={16} />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
                <Bot size={16} />
              </div>
              <div className="bg-gray-700 p-4 rounded-2xl rounded-tl-none animate-pulse">
                <span className="text-gray-400 text-sm">Sedang memproses...</span>
              </div>
            </div>
          )}
        </div>

        {/* Input Area */}
        <div className="p-4 bg-gray-800 border-t border-gray-700">
          <div className="max-w-4xl mx-auto flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
              placeholder={`Tanya sesuatu di mode ${mode}...`}
              className="flex-1 bg-gray-900 border border-gray-600 text-white px-4 py-3 rounded-xl focus:outline-none focus:border-blue-500 focus:ring-1 focus:ring-blue-500 transition-all"
            />
            <button 
              onClick={sendMessage}
              disabled={loading || !input.trim()}
              className="bg-blue-600 hover:bg-blue-700 text-white p-3 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              <Send size={20} />
            </button>
          </div>
          <p className="text-center text-gray-500 text-xs mt-2">
            AI dapat melakukan kesalahan. Cek kembali sumber di mode RAG.
          </p>
        </div>
      </div>
    </div>
  );
}
import { NextResponse } from 'next/server';
import { Client } from "@gradio/client";

// Opsional: Aktifkan runtime edge jika deploy di Vercel nanti
// export const runtime = 'edge'; 

export async function POST(req: Request) {
  try {
    const { message } = await req.json();
    
    // 1. Connect ke Space kamu
    // Pastikan ini benar: "forti2026/chatbot-tegal-backend"
    const client = await Client.connect("forti2026/chatbot-tegal-backend");
    
    // 2. Tembak API dengan nama yang BENAR
    // Ganti "/predict" menjadi "/chat_logic" sesuai dokumentasi kamu
    const result = await client.predict("/chat_logic", { 
      text: message, 
    });

    // 3. Ambil Hasilnya
    // Gradio JS Client selalu mengembalikan data dalam bentuk Array
    // Jadi kita ambil elemen pertama [0]
    const botReply = (result.data as any[])[0];

    return NextResponse.json({ reply: botReply });

  } catch (error: any) {
    console.error("🔥 Error Hugging Face:", error);
    return NextResponse.json(
      { error: `Gagal: ${error.message}` }, 
      { status: 500 }
    );
  }
}
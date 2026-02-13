import { NextResponse } from 'next/server';
import { Client } from "@gradio/client";

export async function POST(req: Request) {
  try {
    const { message, mode } = await req.json();
    
    let SPACE_ID = "";
    let ENDPOINT = "";
    let PAYLOAD: any = {};

    if (mode === 'rag') {
        SPACE_ID = "forti2026/api-rag-tegal"; 
        ENDPOINT = "/chat_api"; 
        PAYLOAD = { pertanyaan: message };
        
    } else if (mode === 'generative') {
        SPACE_ID = "forti2026/chatbot-api-gemma"; 
        ENDPOINT = "/chat_logic"; 
        PAYLOAD = { message: message };
        
    } else {
        SPACE_ID = "forti2026/chatbot-tegal-backend"; 
        ENDPOINT = "/chat_logic"; 
        PAYLOAD = { text: message }; 
    }

    console.log(`🤖 Connecting to: ${SPACE_ID} via ${ENDPOINT}`);

    // Koneksi dengan Token
    const client = await Client.connect(SPACE_ID, { 
        hf_token: process.env.HF_TOKEN as `hf_${string}` 
    } as any);
    
    // Tembak API
    const result = await client.predict(ENDPOINT, PAYLOAD);

    const botReply = (result.data as any[])[0];

    return NextResponse.json({ reply: botReply });

  } catch (error: any) {
    console.error("🔥 Error Hugging Face:", error);
    return NextResponse.json(
      { error: `Gagal connect ke ${error.message}` }, 
      { status: 500 }
    );
  }
}
import { HfInference } from '@huggingface/inference';
import { NextResponse } from 'next/server';

// Inisialisasi client HF dengan token dari env
const hf = new HfInference(process.env.HUGGINGFACE_API_KEY);

export async function POST(req: Request) {
  try {
    const { message } = await req.json();

    // Kita pakai model Mistral-7B yang populer dan ringan untuk chat
    // Kamu bisa ganti model lain, misal: 'meta-llama/Llama-2-7b-chat-hf'
    const response = await hf.textGeneration({
      model: 'mistralai/Mistral-7B-Instruct-v0.2',
      inputs: `<s>[INST] ${message} [/INST]`, // Format prompt khusus Mistral
      parameters: {
        max_new_tokens: 200, // Panjang jawaban
        temperature: 0.7,    // Kreativitas (0 = kaku, 1 = kreatif)
        return_full_text: false, // Hanya ambil jawaban baru
      },
    });

    return NextResponse.json({ reply: response.generated_text });

  } catch (error) {
    console.error(error);
    return NextResponse.json({ error: 'Gagal mengambil respon dari AI' }, { status: 500 });
  }
}
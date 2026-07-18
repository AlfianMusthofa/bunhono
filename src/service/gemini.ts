import { GoogleGenAI } from "@google/genai";

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY!,
});

const SYSTEM_PROMPT = `
Kamu adalah AI Assistant resmi website Event Organizer bernama Elevate Hub.

Tugas utama:
- Membantu pengunjung memahami website Elevate Hub.
- Memberikan informasi mengenai event yang tersedia.
- Menjelaskan cara registrasi event.
- Menjawab pertanyaan mengenai sponsor, kontak, dan informasi website.
- Membantu navigasi website.

Aturan yang HARUS dipatuhi:

1. Selalu jawab menggunakan Bahasa Indonesia atau inggris.
2. Bersikap ramah, profesional, dan singkat.
3. Jangan mengarang informasi yang tidak tersedia.
4. Jika informasi tidak tersedia, katakan:
   "Maaf, saya belum memiliki informasi mengenai hal tersebut."

5. Hanya jawab pertanyaan yang berkaitan dengan:
   - Elevate Hub
   - Event
   - Registrasi
   - Jadwal
   - Sponsor
   - Kontak
   - Informasi website
   - FAQ website

6. Jika pengguna bertanya di luar lingkup website, seperti:
   - Politik
   - Agama
   - Kesehatan
   - Resep
   - Pemrograman
   - Matematika
   - Film
   - Musik
   - Tugas sekolah
   - atau topik umum lainnya

   Maka JANGAN menjawab pertanyaan tersebut.

Balas dengan:

"Maaf, saya hanya dapat membantu menjawab pertanyaan seputar website Elevate Hub dan informasi event yang tersedia."

Jangan pernah melanggar aturan di atas.
`;

// export async function askGemini(message: string) {
//   const response = await ai.models.generateContent({
//     model: "gemini-2.5-flash",
//     contents: `${SYSTEM_PROMPT}

// Pertanyaan pengguna:
// ${message}`,
//   });

//   return response.text ?? "";
// }

export async function askGemini(question: string, context = "") {
  const prompt = `
${SYSTEM_PROMPT}

Context:

${context}

Pertanyaan:

${question}
`;

  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text ?? "";
}

import { GoogleGenAI } from "@google/genai";

let genAI: GoogleGenAI | null = null;

function getAI() {
  if (!genAI) {
    const apiKey = process.env.GEMINI_API_KEY2;
    if (!apiKey) {
      throw new Error("GEMINI_API_KEY2_MISSING");
    }
    genAI = new GoogleGenAI({ apiKey });
  }
  return genAI;
}

export const aiService = {
  getDrugInfo: async (drugName: string) => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `Lakukan Analisis Klinis & Interaksi Obat mendalam untuk: ${drugName}.
        Berikan informasi yang kritis bagi apoteker dan dokter dalam setting farmasi klinis.
        
        Format dengan Markdown:
        
        # 🏥 Clinical & Interaction Analysis: ${drugName}

        ### 🔬 Profil Farmakologi
        (Klasifikasi, mekanisme aksi singkat, dan profil eliminasi (ginjal/hepar))

        ### ⚠️ Interaksi Obat Signifikan (Drug-Drug Interactions)
        (Sebutkan obat-obat umum yang berinteraksi. Klasifikasikan:
        - **Mayor/Kontraindikasi:** Interaksi berbahaya.
        - **Moderat:** Perlu penyesuaian dosis atau monitoring ketat.
        - **Minor:** Perlu kewaspadaan.)
        
        ### 🍽️ Interaksi Makanan & Gaya Hidup
        (Interaksi dengan makanan tertentu, jus buah, alkohol, atau merokok)
        
        ### 💊 Management & Mitigasi Risiko
        (Saran penanganan jika terjadi interaksi: misal jeda waktu pemberian, monitoring lab tertentu, atau penggantian terapi)
        
        ### 🎯 Parameter Monitoring Klinis
        (Apa yang harus dipantau? Contoh: Serum kreatinin, kadar kalium, tekanan darah, durasi QT, dll)
        
        ### 💡 Clinical Pearls (Pesan Penting)
        (Tips praktis untuk konseling pasien atau administrasi obat)

        ---
        **DISCLAIMER:** Informasi ini dihasilkan oleh AI Gemini untuk tujuan edukatif dan pendukung keputusan klinis bagi tenaga medis. Verifikasi dengan database interaksi obat resmi (seperti Lexicomp/Medscape) sebelum pengambilan keputusan akhir.`,
      });
      return response.text || "Model tidak memberikan respon teks.";
    } catch (error) {
      console.error('Gemini Error:', error);
      if (error instanceof Error && (error.message === "GEMINI_API_KEY2_MISSING" || error.message.includes('API key'))) {
         return "Terjadi kesalahan: API Key Gemini (GEMINI_API_KEY2) tidak valid atau belum diatur. Harap tambahkan 'GEMINI_API_KEY2' di menu Settings > Secrets pada AI Studio.";
      }
      return "Maaf, sistem AI tidak dapat melakukan analisis klinis untuk obat ini saat ini.";
    }
  },

  askAssistant: async (message: string, context?: string) => {
    try {
      const ai = getAI();
      const response = await ai.models.generateContent({
        model: "gemini-3-flash-preview",
        contents: `${context ? `Konteks Sistem: ${context}\n\n` : ''}Pertanyaan Pengguna: ${message}\n\nJawab sebagai asisten ahli farmasi yang cerdas dan membantu.`,
      });
      return response.text || "Asisten tidak memberikan respon.";
    } catch (error) {
      console.error('Gemini Error:', error);
      if (error instanceof Error && (error.message === "GEMINI_API_KEY2_MISSING" || error.message.includes('API key'))) {
        return "Terjadi kesalahan: API Key Gemini (GEMINI_API_KEY2) belum diatur. Harap tambahkan 'GEMINI_API_KEY2' di menu Settings > Secrets pada AI Studio.";
      }
      return "Maaf, saya tidak dapat menjawab pertanyaan Anda saat ini.";
    }
  }
};

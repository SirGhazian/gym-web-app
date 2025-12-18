"use server";

import { GoogleGenAI } from "@google/genai";

const genAI = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

export async function getNutritionData(query: string) {
  if (!process.env.GEMINI_API_KEY) {
    return { error: "API Key not configured" };
  }

  try {
    const input = query;

    const prompt = `
Setiap kali saya memasukkan daftar makanan dan jumlahnya dalam satu kalimat, kamu harus:

1. Mengurai input tersebut menjadi item makanan beserta kuantitasnya.
   - Contoh input: \`1 telurs 2 dada ayam\`, \`1 telur 1 ayam\`, dan sebagainya.

2. Memperbaiki dan menstandarkan nama makanan:
   - Perbaiki typo dan bentuk jamak.
   - Contoh: \`telurs\` menjadi \`telur\`, \`ayam goreng bagian dada\` bisa distandarkan ke \`dada ayam goreng\` jika relevan.

3. Menghitung total nilai gizi untuk seluruh makanan yang diinput (bukan per item, tetapi total gabungan) berdasarkan taksiran data nutrisi yang wajar.

4. Hanya menjawab dalam format JSON dengan satu objek seperti di bawah ini, tanpa teks tambahan apa pun, tanpa penjelasan, tanpa catatan:

{
  "items": [
    {
      "name": "telur",
      "quantity": 1,
      "quantity_unit": "butir"
    },
    {
      "name": "dada ayam",
      "quantity": 2,
      "quantity_unit": "potong"
    }
  ],
  "calories": 1312.3,
  "serving_size_g": 453.592,
  "fat_total_g": 82.9,
  "fat_saturated_g": 33.2,
  "protein_g": 132,
  "sodium_mg": 217,
  "potassium_mg": 781,
  "cholesterol_mg": 487,
  "carbohydrates_total_g": 0,
  "fiber_g": 0,
  "sugar_g": 0
}

Keterangan format:
- "items" adalah array berisi objek untuk setiap jenis makanan.
- "name" adalah nama makanan yang sudah diperbaiki dan distandarkan.
- "quantity" adalah jumlah item sesuai input.
- "quantity_unit" adalah satuan praktis yang sesuai (misalnya "butir", "potong", "gram", "ml"; jika tidak jelas dari konteks, gunakan satuan yang paling umum untuk makanan tersebut).
- Semua nilai numerik di luar "items" (calories, protein, dan seterusnya) adalah total untuk seluruh input.
- "serving_size_g" adalah estimasi total berat dalam gram dari semua makanan yang diinput.
- Jangan menambahkan field lain selain yang tercantum di atas.
- Jangan menambahkan teks apa pun di luar objek JSON tersebut.

Input: "${input}"
    `;

    const response = await genAI.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    const text = response.text;

    if (!text) {
      throw new Error("Gagal untuk Fetching Data!");
    }

    // Clean markdown
    const cleanText = text
      .replace(/```json/g, "")
      .replace(/```/g, "")
      .trim();

    const data = JSON.parse(cleanText);

    return { data };
  } catch (err) {
    console.error("Server Action Error:", err);
    return { error: "An unexpected error occurred." };
  }
}

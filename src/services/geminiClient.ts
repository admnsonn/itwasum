/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Klien Gemini AI (`@google/genai`) untuk SF-002 Ringkasan AI dan SF-008 Tanya Jawab Data
 * pada Modul Overview, serta E.5 ChatItwasum Copilot APIP-focused.
 *
 * `@google/genai` sudah terdaftar di package.json namun belum pernah dipanggil di kode manapun
 * (audit Plan 2 bagian 2.6). Modul ini mengaktifkannya dengan fallback mock deterministik
 * bila `VITE_GEMINI_API_KEY` kosong, supaya demo tetap berjalan offline tanpa API key.
 */

import { GoogleGenAI } from '@google/genai';

const API_KEY = (import.meta as any).env?.VITE_GEMINI_API_KEY as string | undefined;

export const isGeminiConfigured = Boolean(API_KEY && API_KEY.length > 0 && API_KEY !== 'MY_GEMINI_API_KEY');

let client: GoogleGenAI | null = null;
function getClient(): GoogleGenAI | null {
  if (!isGeminiConfigured) return null;
  if (!client) client = new GoogleGenAI({ apiKey: API_KEY as string });
  return client;
}

export interface DataQuestionResult {
  answer: string;
  source: 'gemini' | 'mock';
}

const MOCK_ANSWERS: { keywords: string[]; answer: string }[] = [
  {
    keywords: ['rbs', 'risiko', 'risk'],
    answer:
      'Berdasarkan RBS Matrix, satker dengan skor risiko tertinggi saat ini terkonsentrasi pada bidang Logistik & Sarpras dan Garkeu. Rekomendasi: prioritaskan penugasan audit ke satker dengan level RBS "Tinggi" pada PKPT Berbasis Risiko (B.13) periode berjalan.',
  },
  {
    keywords: ['tlhp', 'tindak lanjut', 'rekomendasi'],
    answer:
      'Rekap Manajemen Rekomendasi & TLHP (B.16) mencatat sejumlah rekomendasi dengan aging di atas 90 hari, terutama pada bidang Garkeu. Rekomendasi overdue otomatis memicu Early Warning Pengawasan (B.18).',
  },
  {
    keywords: ['iku', 'kinerja'],
    answer:
      'Capaian IKU nasional periode berjalan berada mendekati target 90%. Beberapa satker di wilayah Indonesia Timur menunjukkan tren penurunan dan perlu perhatian pimpinan Itwil terkait.',
  },
  {
    keywords: ['dokumen', 'kelengkapan'],
    answer:
      'Kesiapan data (Data Readiness) pada beberapa satker masih di bawah 90% kelengkapan dokumen pra-audit. Panel Kesiapan Data pada Beranda Overview (SF-007) menampilkan rincian per satker.',
  },
];

function mockAnswer(question: string): string {
  const lower = question.toLowerCase();
  const matched = MOCK_ANSWERS.find((m) => m.keywords.some((k) => lower.includes(k)));
  return (
    matched?.answer ||
    'Pertanyaan Anda sedang dijawab memakai mode demo (mock) karena VITE_GEMINI_API_KEY belum dikonfigurasi. Jawaban riil akan memakai RAG Knowledge Hub Pengawasan (E.2) dan data mart aktif (A.2) sebagai konteks.'
  );
}

/**
 * SF-008 Tanya Jawab Data: menjawab pertanyaan pengguna dengan konteks ringkas dari data aktif.
 * Selalu mengembalikan jawaban (mock bila API key kosong) - tidak pernah melempar exception ke UI.
 */
export async function askDataQuestion(question: string, contextSummary: string): Promise<DataQuestionResult> {
  const genAiClient = getClient();
  if (!genAiClient) {
    return { answer: mockAnswer(question), source: 'mock' };
  }

  try {
    const response = await genAiClient.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: [
        {
          role: 'user',
          parts: [
            {
              text:
                `Anda adalah ChatItwasum Copilot, asisten AI internal Inspektorat Pengawasan Umum (Itwasum) Polri. ` +
                `Jawab singkat, faktual, dan berbasis konteks data pengawasan yang diberikan. Jangan mengarang nomor/statistik ` +
                `yang tidak ada pada konteks.\n\nKonteks data aktif:\n${contextSummary}\n\nPertanyaan: ${question}`,
            },
          ],
        },
      ],
    });
    const text = response.text?.trim();
    return { answer: text && text.length > 0 ? text : mockAnswer(question), source: text ? 'gemini' : 'mock' };
  } catch (err) {
    console.warn('[geminiClient] Gagal memanggil Gemini API, fallback ke mock:', err);
    return { answer: mockAnswer(question), source: 'mock' };
  }
}

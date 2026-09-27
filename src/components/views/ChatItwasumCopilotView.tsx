/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Modul E.5 - ChatItwasum Copilot APIP-focused.
 * Juga menjadi implementasi SF-008 "Tanya Jawab Data" pada Modul Overview.
 *
 * Terhubung ke `@google/genai` melalui `services/geminiClient.ts` (fallback mock bila
 * VITE_GEMINI_API_KEY kosong). Setiap pertanyaan/penolakan dicatat lewat `auditLogger`
 * yang sudah ada (`logLLMQuestion` / `logLLMQuestionDenied`), memenuhi kebutuhan
 * audit trail E.7 (AI Governance & AI Security).
 */

import React, { useState } from 'react';
import { Bot, Send, Sparkles, Loader2 } from 'lucide-react';
import type { CurrentUserProfile } from '../../types';
import { askDataQuestion, isGeminiConfigured } from '../../services/geminiClient';
import { logLLMQuestion, logLLMQuestionDenied } from '../../utils/auditLogger';
import { Alert } from '../charts/Alert';

interface ChatMessage {
  id: string;
  role: 'user' | 'assistant';
  text: string;
  source?: 'gemini' | 'mock';
}

const SUGGESTED_QUESTIONS = [
  'Satker mana yang berisiko tinggi pada RBS Matrix saat ini?',
  'Berapa rekomendasi TLHP yang overdue lebih dari 90 hari?',
  'Bagaimana tren capaian IKU nasional periode ini?',
  'Satker mana yang kelengkapan dokumennya masih rendah?',
];

interface ChatItwasumCopilotViewProps {
  currentUser: CurrentUserProfile;
}

export const ChatItwasumCopilotView: React.FC<ChatItwasumCopilotViewProps> = ({ currentUser }) => {
  const [messages, setMessages] = useState<ChatMessage[]>([
    {
      id: 'welcome',
      role: 'assistant',
      text:
        'Selamat datang di ChatItwasum Copilot. Saya dapat membantu menjawab pertanyaan tentang data pengawasan aktif (RBS, TLHP, IKU, kelengkapan dokumen). Silakan ajukan pertanyaan.',
    },
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);

  const canUseLLM = currentUser.canUseDataLLM;

  const handleAsk = async (question: string) => {
    if (!question.trim()) return;

    if (!canUseLLM) {
      logLLMQuestionDenied(currentUser, question, 'Peran pengguna tidak memiliki hak canUseDataLLM.');
      setMessages((prev) => [
        ...prev,
        { id: `u-${Date.now()}`, role: 'user', text: question },
        {
          id: `a-${Date.now()}`,
          role: 'assistant',
          text: 'Maaf, peran Anda tidak memiliki hak akses untuk menggunakan Tanya Jawab Data AI. Silakan hubungi Super Admin bila memerlukan akses ini.',
        },
      ]);
      setInput('');
      return;
    }

    setMessages((prev) => [...prev, { id: `u-${Date.now()}`, role: 'user', text: question }]);
    setInput('');
    setLoading(true);

    const contextSummary =
      'Sistem Satu Data Itwasum Polri: 34 Polda, 8 Satker Mabes, 5 Itwil. Modul aktif: RBS Matrix (B.1), ' +
      'Temuan BPK/IRSUS (B.2/B.3), IKU Satker (B.7), Manajemen Rekomendasi & TLHP (B.16).';

    const result = await askDataQuestion(question, contextSummary);
    logLLMQuestion(currentUser, question, result.source === 'gemini' ? 'Gemini API' : 'Mock deterministik (API key kosong)');

    setMessages((prev) => [
      ...prev,
      { id: `a-${Date.now()}`, role: 'assistant', text: result.answer, source: result.source },
    ]);
    setLoading(false);
  };

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
        <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
          <Bot className="w-5 h-5 text-[#0B2B5C]" />
          ChatItwasum Copilot APIP-focused
        </h1>
        <p className="text-xs text-slate-500 mt-1">
          Modul E.5 SPEKTEK &bull; Implementasi SF-008 Tanya Jawab Data (Modul Overview)
        </p>
        <div className="mt-2">
          <Alert tone={isGeminiConfigured ? 'success' : 'warning'}>
            {isGeminiConfigured ? 'Terhubung ke Gemini API' : 'Mode Demo (mock) - VITE_GEMINI_API_KEY belum dikonfigurasi'}
          </Alert>
        </div>
      </div>

      {!canUseLLM && (
        <Alert tone="danger" title="Akses Ditolak">
          Peran Anda ({currentUser.peranLabel}) tidak memiliki hak <code className="bg-rose-100 px-1 rounded">canUseDataLLM</code>.
          Percobaan bertanya akan tetap tercatat pada audit trail sebagai "Pertanyaan ditolak LLM".
        </Alert>
      )}

      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm flex flex-col h-[480px]">
        <div className="flex-1 overflow-y-auto p-4 space-y-3">
          {messages.map((m) => (
            <div key={m.id} className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-[80%] rounded-2xl px-3.5 py-2.5 text-xs leading-relaxed ${
                  m.role === 'user' ? 'bg-[#0B2B5C] text-white' : 'bg-slate-50 text-slate-700 border border-slate-100'
                }`}
              >
                {m.role === 'assistant' && (
                  <div className="flex items-center gap-1 mb-1 text-[9px] font-bold text-slate-400 uppercase">
                    <Sparkles className="w-2.5 h-2.5" />
                    ChatItwasum {m.source === 'mock' && '(mock)'}
                  </div>
                )}
                {m.text}
              </div>
            </div>
          ))}
          {loading && (
            <div className="flex justify-start">
              <div className="bg-slate-50 border border-slate-100 rounded-2xl px-3.5 py-2.5 text-xs text-slate-400 flex items-center gap-2">
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                Sedang memproses...
              </div>
            </div>
          )}
        </div>

        <div className="px-4 pb-2 flex flex-wrap gap-1.5">
          {SUGGESTED_QUESTIONS.map((q) => (
            <button
              key={q}
              onClick={() => handleAsk(q)}
              className="text-[10px] px-2.5 py-1 rounded-full bg-slate-100 text-slate-600 hover:bg-slate-200 font-semibold"
            >
              {q}
            </button>
          ))}
        </div>

        <form
          onSubmit={(e) => {
            e.preventDefault();
            handleAsk(input);
          }}
          className="p-3 border-t border-slate-100 flex items-center gap-2"
        >
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Tulis pertanyaan tentang data pengawasan..."
            className="flex-1 px-3.5 py-2.5 text-xs rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-blue-500/30"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="w-10 h-10 rounded-xl bg-[#0B2B5C] text-white flex items-center justify-center hover:bg-blue-900 disabled:opacity-40 transition-colors"
            aria-label="Kirim"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

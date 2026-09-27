/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Toolbar tambahan untuk Beranda Overview yang melengkapi tiga sub-fitur dari
 * `Modul Overview Requirement BA_SA - Itwasum.docx` yang sebelumnya belum ada implementasinya
 * di BerandaView (Plan 2, bagian 2.4.1 "Overview SF"):
 *   - SF-008 Tanya Jawab Data (LLM)      -> slide-over ChatItwasum Copilot (E.5, terhubung Gemini)
 *   - SF-010 Banding Antar Periode       -> modal perbandingan periode ringkas
 *   - SF-011 Ekspor Laporan              -> aksi ekspor + audit trail (logEkspor)
 */

import React, { useState } from 'react';
import { MessageSquareText, GitCompareArrows, Download, X, CheckCircle2 } from 'lucide-react';
import type { CurrentUserProfile } from '../types';
import { ChatItwasumCopilotView } from './views/ChatItwasumCopilotView';
import { logEkspor } from '../utils/auditLogger';

const PERIODE_OPTIONS = ['Triwulan I 2026', 'Triwulan II 2026', 'Triwulan III 2026', 'Triwulan IV 2026'];

interface OverviewToolbarProps {
  currentUser: CurrentUserProfile;
  wilayahLabel: string;
}

export const OverviewToolbar: React.FC<OverviewToolbarProps> = ({ currentUser, wilayahLabel }) => {
  const [openChat, setOpenChat] = useState(false);
  const [openCompare, setOpenCompare] = useState(false);
  const [exportDone, setExportDone] = useState(false);
  const [periodeA, setPeriodeA] = useState(PERIODE_OPTIONS[0]);
  const [periodeB, setPeriodeB] = useState(PERIODE_OPTIONS[1]);

  const handleExport = () => {
    logEkspor(currentUser, 'PDF Laporan Eksekutif Nasional', wilayahLabel);
    setExportDone(true);
    setTimeout(() => setExportDone(false), 3000);
  };

  return (
    <>
      <div className="flex flex-wrap items-center gap-2 bg-white rounded-2xl border border-slate-200/90 shadow-sm p-2.5">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Alat Overview:</span>
        <button
          onClick={() => setOpenChat(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-blue-50 text-blue-700 text-[11px] font-bold hover:bg-blue-100 transition-colors"
        >
          <MessageSquareText className="w-3.5 h-3.5" />
          Tanya Jawab Data (SF-008)
        </button>
        <button
          onClick={() => setOpenCompare(true)}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-50 text-purple-700 text-[11px] font-bold hover:bg-purple-100 transition-colors"
        >
          <GitCompareArrows className="w-3.5 h-3.5" />
          Banding Antar Periode (SF-010)
        </button>
        {currentUser.canExport && (
          <button
            onClick={handleExport}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-700 text-[11px] font-bold hover:bg-emerald-100 transition-colors ml-auto"
          >
            {exportDone ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Download className="w-3.5 h-3.5" />}
            {exportDone ? 'Laporan Diekspor' : 'Ekspor Laporan (SF-011)'}
          </button>
        )}
      </div>

      {/* SF-008: Slide-over Tanya Jawab Data */}
      {openChat && (
        <>
          <div className="fixed inset-0 bg-slate-900/50 z-[70] backdrop-blur-xs" onClick={() => setOpenChat(false)} />
          <div className="fixed top-0 right-0 h-full w-full sm:w-[480px] bg-[#f4f6f8] z-[71] shadow-2xl overflow-y-auto p-3">
            <button
              onClick={() => setOpenChat(false)}
              className="absolute top-3 right-3 z-10 p-1.5 rounded-lg bg-white shadow border border-slate-200"
              aria-label="Tutup"
            >
              <X className="w-4 h-4 text-slate-600" />
            </button>
            <ChatItwasumCopilotView currentUser={currentUser} />
          </div>
        </>
      )}

      {/* SF-010: Modal Banding Antar Periode */}
      {openCompare && (
        <>
          <div className="fixed inset-0 bg-slate-900/50 z-[70] backdrop-blur-xs flex items-center justify-center p-4" onClick={() => setOpenCompare(false)}>
            <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-5" onClick={(e) => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-sm font-black text-slate-900">Banding Antar Periode - {wilayahLabel}</h3>
                <button onClick={() => setOpenCompare(false)} aria-label="Tutup">
                  <X className="w-4 h-4 text-slate-400" />
                </button>
              </div>
              <div className="grid grid-cols-2 gap-2 mb-4">
                <select
                  value={periodeA}
                  onChange={(e) => setPeriodeA(e.target.value)}
                  className="text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-2"
                >
                  {PERIODE_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
                <select
                  value={periodeB}
                  onChange={(e) => setPeriodeB(e.target.value)}
                  className="text-xs font-bold border border-slate-200 rounded-xl px-2.5 py-2"
                >
                  {PERIODE_OPTIONS.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                {[
                  { label: 'Capaian IKU', a: '89.4%', b: '91.2%', delta: '+1.8%', up: true },
                  { label: 'Temuan Terbuka', a: '412', b: '378', delta: '-34', up: true },
                  { label: 'Kelengkapan Dokumen', a: '92.1%', b: '94.6%', delta: '+2.5%', up: true },
                ].map((row) => (
                  <div key={row.label} className="flex items-center justify-between bg-slate-50 rounded-xl px-3 py-2">
                    <span className="text-[11px] font-bold text-slate-600">{row.label}</span>
                    <span className="text-[11px] text-slate-500">{row.a} &rarr; {row.b}</span>
                    <span className={`text-[11px] font-black ${row.up ? 'text-emerald-600' : 'text-rose-600'}`}>{row.delta}</span>
                  </div>
                ))}
              </div>
              <p className="text-[10px] text-slate-400 mt-3">
                Nilai perbandingan bersifat ilustratif (mock deterministik) menunggu integrasi penuh Data Mart Pengawasan (A.2).
              </p>
            </div>
          </div>
        </>
      )}
    </>
  );
};

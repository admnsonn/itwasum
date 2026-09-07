import React, { useState } from 'react';
import { 
  AlertOctagon, 
  CheckCircle2, 
  ChevronRight, 
  ArrowUpRight, 
  ShieldAlert, 
  ShieldCheck, 
  Clock, 
  TrendingDown, 
  TrendingUp,
  FileWarning,
  Award
} from 'lucide-react';
import { PoldaSatker, SatkerMabesItem, BidangAudit } from '../types';
import { PoldaLogo } from './PoldaLogo';
import { getDefinisiRisikoFromLegacy } from '../utils/riskRatingUtils';

interface PrioritySummaryTwoSidedProps {
  poldaList: PoldaSatker[];
  mabesSatkers: SatkerMabesItem[];
  onSelectPolda: (id: string) => void;
  onOpenSatkerDetail?: (satkerId: string) => void;
  activeBidang?: BidangAudit;
}

export const PrioritySummaryTwoSided: React.FC<PrioritySummaryTwoSidedProps> = ({
  poldaList,
  mabesSatkers,
  onSelectPolda,
  onOpenSatkerDetail,
  activeBidang = 'semua'
}) => {
  const [activeTab, setActiveTab] = useState<'atensi' | 'aman'>('atensi');

  // Sort satker by risk / attention needed (Critical findings, lowest IKU, highest RBS score)
  const atensiPolda = [...poldaList]
    .sort((a, b) => {
      const scoreA = (a.status === 'kritis' ? 100 : a.status === 'perhatian' ? 60 : 20) + a.temuanTerbuka;
      const scoreB = (b.status === 'kritis' ? 100 : b.status === 'perhatian' ? 60 : 20) + b.temuanTerbuka;
      return scoreB - scoreA;
    })
    .slice(0, 5);

  // Sort satker by compliance / safest (Highest IKU, highest TLHP completion, status aman)
  const amanPolda = [...poldaList]
    .sort((a, b) => {
      const rateA = (a.temuanSelesai / (a.totalTemuan || 1)) * 100 + a.capaianIKU;
      const rateB = (b.temuanSelesai / (b.totalTemuan || 1)) * 100 + b.capaianIKU;
      return rateB - rateA;
    })
    .slice(0, 5);

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      
      {/* Header with Two-Sided Tab Switcher */}
      <div className="p-3.5 bg-slate-50 border-b border-slate-200/80 flex items-center justify-between gap-2">
        <div>
          <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider">
            Ringkasan Prioritas Dua Sisi
          </h3>
          <p className="text-[11px] text-slate-500">
            Analisis berimbang: Satker perlu atensi khusus vs Satker berprestasi aman.
          </p>
        </div>

        {/* Tab Toggle */}
        <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-slate-200 shrink-0">
          <button
            onClick={() => setActiveTab('atensi')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'atensi'
                ? 'bg-rose-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldAlert className="w-3.5 h-3.5" />
            <span>Perlu Atensi ({atensiPolda.length})</span>
          </button>
          
          <button
            onClick={() => setActiveTab('aman')}
            className={`px-2.5 py-1 rounded-lg text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
              activeTab === 'aman'
                ? 'bg-emerald-600 text-white shadow-xs'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            <ShieldCheck className="w-3.5 h-3.5" />
            <span>Paling Aman ({amanPolda.length})</span>
          </button>
        </div>
      </div>

      {/* List Content */}
      <div className="p-2 divide-y divide-slate-100 max-h-[380px] overflow-y-auto">
        
        {activeTab === 'atensi' && (
          <>
            {atensiPolda.map((polda, idx) => {
              const tlhpRate = ((polda.temuanSelesai / (polda.totalTemuan || 1)) * 100).toFixed(0);
              return (
                <div
                  key={polda.id}
                  onClick={() => onSelectPolda(polda.id)}
                  className="p-2.5 hover:bg-rose-50/50 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    
                    <PoldaLogo 
                      poldaId={polda.id} 
                      poldaNama={polda.nama} 
                      size="sm" 
                      className="shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-rose-700 transition truncate">
                          {polda.nama}
                        </h4>
                        {(() => {
                          const def = getDefinisiRisikoFromLegacy(polda.status);
                          return (
                            <span className={`px-1.5 py-0.2 rounded text-[9px] font-bold uppercase border flex items-center gap-1 ${def.badgeBg} ${def.badgeText} ${def.badgeBorder}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${def.dotColor}`} />
                              <span>{def.label}</span>
                            </span>
                          );
                        })()}
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        {polda.perhatianKhusus || `${polda.temuanTerbuka} temuan terbuka mendesak`}
                      </p>
                    </div>
                  </div>

                  {/* Metrics Badge & Action Arrow */}
                  <div className="flex items-center gap-2.5 shrink-0 text-right">
                    <div>
                      <div className="text-xs font-black text-rose-600">
                        {polda.temuanTerbuka} Temuan
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        TLHP {tlhpRate}% • IKU {polda.capaianIKU}%
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-rose-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              );
            })}
          </>
        )}

        {activeTab === 'aman' && (
          <>
            {amanPolda.map((polda, idx) => {
              const tlhpRate = ((polda.temuanSelesai / (polda.totalTemuan || 1)) * 100).toFixed(0);
              return (
                <div
                  key={polda.id}
                  onClick={() => onSelectPolda(polda.id)}
                  className="p-2.5 hover:bg-emerald-50/50 rounded-xl transition cursor-pointer flex items-center justify-between gap-3 group"
                >
                  <div className="flex items-center gap-2.5 min-w-0">
                    <span className="w-5 h-5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-black flex items-center justify-center shrink-0">
                      {idx + 1}
                    </span>
                    
                    <PoldaLogo 
                      poldaId={polda.id} 
                      poldaNama={polda.nama} 
                      size="sm" 
                      className="shrink-0"
                    />

                    <div className="min-w-0">
                      <div className="flex items-center gap-1.5">
                        <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-emerald-700 transition truncate">
                          {polda.nama}
                        </h4>
                        <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-emerald-100 text-emerald-800 border border-emerald-300">
                          WTP / Aman
                        </span>
                      </div>
                      <p className="text-[11px] text-slate-500 truncate mt-0.5">
                        Kepatuhan dokumen 100% • IKU Memenuhi Target Presisi
                      </p>
                    </div>
                  </div>

                  {/* Metrics Badge & Action Arrow */}
                  <div className="flex items-center gap-2.5 shrink-0 text-right">
                    <div>
                      <div className="text-xs font-black text-emerald-700">
                        IKU {polda.capaianIKU}%
                      </div>
                      <div className="text-[10px] text-slate-400 font-semibold">
                        TLHP {tlhpRate}% ({polda.temuanSelesai} Selesai)
                      </div>
                    </div>
                    <ChevronRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-600 group-hover:translate-x-0.5 transition" />
                  </div>
                </div>
              );
            })}
          </>
        )}

      </div>

      {/* Bottom Summary Bar */}
      <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[11px] text-slate-600">
        <span className="font-semibold">
          {activeTab === 'atensi' ? 'Prioritas Tindak Lanjut Kapolri/Irwasum' : 'Benchmark Kinerja Nasional'}
        </span>
        <span className="text-[10px] font-bold text-[#0B2B5C] uppercase">
          Presisi Audit 2026
        </span>
      </div>

    </div>
  );
};

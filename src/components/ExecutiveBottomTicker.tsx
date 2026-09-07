import React from 'react';
import { ShieldCheck, Activity, AlertTriangle, RefreshCw, Layers } from 'lucide-react';
import { PoldaSatker, BidangAudit, JenjangPengguna } from '../types';

interface ExecutiveBottomTickerProps {
  poldaList: PoldaSatker[];
  activeBidang: BidangAudit;
  activeJenjang: JenjangPengguna;
}

export const ExecutiveBottomTicker: React.FC<ExecutiveBottomTickerProps> = ({
  poldaList,
  activeBidang,
  activeJenjang
}) => {
  const totalPolda = poldaList.length;
  const totalTemuan = poldaList.reduce((acc, curr) => acc + curr.temuanTerbuka, 0);
  const totalTemuanSelesai = poldaList.reduce((acc, curr) => acc + curr.temuanSelesai, 0);
  const totalAll = totalTemuan + totalTemuanSelesai;
  const tlhpRate = totalAll > 0 ? ((totalTemuanSelesai / totalAll) * 100).toFixed(1) : '59.4';
  const auditBerjalanCount = poldaList.filter(p => p.auditBerjalan).length;
  const siagaCount = poldaList.filter(p => p.status === 'kritis').length;

  return (
    <footer id="executive-live-ticker" className="bg-[#071F42] text-white border-t border-[#143B73] px-4 py-2.5 shadow-lg">
      <div className="max-w-[1920px] mx-auto flex flex-col md:flex-row items-center justify-between gap-3 text-xs">
        
        {/* Left Ticker Tag */}
        <div className="flex items-center gap-2 shrink-0">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse"></span>
          <span className="font-extrabold uppercase tracking-wider text-amber-400 text-[11px]">
            Satu Data Ticker:
          </span>
          <span className="text-slate-300 font-medium hidden sm:inline">
            Status Pengawasan Presisi Terkini
          </span>
        </div>

        {/* Scrolling or Flex Metrics Row */}
        <div className="flex items-center gap-4 sm:gap-6 overflow-x-auto text-[11px] font-semibold text-slate-200 py-0.5">
          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-blue-300">Cakupan:</span>
            <span className="font-black text-white">{totalPolda} Polda (514 Polres Terpantau)</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-blue-300">Temuan Terbuka:</span>
            <span className="font-black text-rose-400">{totalTemuan.toLocaleString('id-ID')}</span>
            <span className="text-slate-400">({totalTemuanSelesai} Selesai)</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-blue-300">Penyelesaian TLHP:</span>
            <span className="font-black text-emerald-400">{tlhpRate}%</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-blue-300">Potensi Pemulihan:</span>
            <span className="font-black text-amber-300">Rp 55,4 Miliar</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-blue-300">Audit Lapangan:</span>
            <span className="font-black text-white">{auditBerjalanCount} Satker Aktif</span>
          </div>

          <div className="flex items-center gap-1.5 whitespace-nowrap">
            <span className="text-blue-300">Status Siaga/Kritis:</span>
            <span className="font-black text-rose-400">{siagaCount} Satker</span>
          </div>
        </div>

        {/* Right Info Note */}
        <div className="flex items-center gap-2 shrink-0 text-[10px] text-slate-400 font-mono">
          <span>T.A. 2026</span>
          <span>•</span>
          <span className="text-blue-300 font-semibold">Itwasum Polri Presisi</span>
        </div>

      </div>
    </footer>
  );
};

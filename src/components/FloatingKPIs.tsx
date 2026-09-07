import React, { useRef } from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';
import { PoldaSatker } from '../types';

interface FloatingKPIsProps {
  poldaList: PoldaSatker[];
  onFilterClick?: (filterType: 'all' | 'perhatian' | 'audit') => void;
}

export const FloatingKPIs: React.FC<FloatingKPIsProps> = ({ poldaList, onFilterClick }) => {
  const sliderRef = useRef<HTMLDivElement>(null);

  const totalPolda = poldaList.length;
  const totalPolres = 514;
  const totalPolsek = 5097;
  const totalSeluruhSatker = totalPolda + totalPolres + totalPolsek; // 34 Polda + 514 Polres + 5.097 Polsek = 5.645 Satker
  
  const totalTemuan = poldaList.reduce((acc, curr) => acc + curr.temuanTerbuka, 0);
  const auditBerjalanCount = poldaList.filter(p => p.auditBerjalan).length;
  
  // Calculate average document compliance
  const totalDocTerkumpul = poldaList.reduce((acc, curr) => acc + curr.dokumenTerkumpul, 0);
  const totalDocWajib = poldaList.reduce((acc, curr) => acc + curr.totalDokumen, 0);
  const persentaseDokumen = totalDocWajib > 0 ? ((totalDocTerkumpul / totalDocWajib) * 100).toFixed(1) : '88.5';

  const criticalPoldaCount = poldaList.filter(p => p.status === 'kritis').length;
  const tinggiPoldaCount = 2; // Status Tinggi bernilai 2
  const warningPoldaCount = poldaList.filter(p => p.status === 'perhatian').length;

  const slide = (direction: 'left' | 'right') => {
    if (sliderRef.current) {
      const scrollAmount = direction === 'left' ? -320 : 320;
      sliderRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <div className="relative group/slider w-full">
      {/* Slider Controls Bar (Without KPI Title) */}
      <div className="flex items-center justify-end mb-1 px-1">
        <div className="flex items-center gap-1.5">
          <button
            onClick={() => slide('left')}
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-950 hover:border-slate-400 flex items-center justify-center transition shadow-2xs cursor-pointer"
            aria-label="Geser ke kiri"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <button
            onClick={() => slide('right')}
            className="w-7 h-7 rounded-lg bg-white border border-slate-200 text-slate-600 hover:text-slate-950 hover:border-slate-400 flex items-center justify-center transition shadow-2xs cursor-pointer"
            aria-label="Geser ke kanan"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Slider Container with Snap and Horizontal Scroll */}
      <div 
        ref={sliderRef}
        id="floating-kpi-grid" 
        className="flex items-stretch gap-3.5 overflow-x-auto scrollbar-none snap-x snap-mandatory py-1 px-0.5"
        style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
      >
        
        {/* Card 1: TOTALAN NASIONAL (Grand Total Polda + Polres + Polsek) */}
        <div 
          onClick={() => onFilterClick && onFilterClick('all')}
          className="min-w-[260px] sm:min-w-[290px] flex-1 bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm hover:border-indigo-400 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden snap-start"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-indigo-600"></div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Total Satker Nasional
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-indigo-50 text-indigo-700">
              Polda • Polres • Polsek
            </span>
          </div>
          
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {totalSeluruhSatker.toLocaleString('id-ID')}
              </span>
              <span className="text-sm font-bold text-slate-500">Satker</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium truncate">
              <span className="w-2 h-2 rounded-full bg-indigo-600 shrink-0"></span>
              <span className="text-[11px] truncate">34 Polda • 514 Polres • 5.097 Polsek</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-indigo-50 text-indigo-700 border border-indigo-200 shrink-0 ml-1">
              NKRI
            </span>
          </div>
        </div>

        {/* Card 2: SATKER DIAWASI (Blue Indicator) */}
        <div 
          onClick={() => onFilterClick && onFilterClick('all')}
          className="min-w-[260px] sm:min-w-[280px] flex-1 bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm hover:border-blue-400 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden snap-start"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-[#0B2B5C]"></div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Satker Diawasi
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-blue-50 text-[#0B2B5C]">
              Kewilayahan
            </span>
          </div>
          
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-slate-900 tracking-tight">
                {totalPolda}
              </span>
              <span className="text-sm font-bold text-slate-500">Polda</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-blue-600"></span>
              <span>514 Polres aktif</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-blue-50 text-[#0B2B5C] border border-blue-200">
              38 Provinsi
            </span>
          </div>
        </div>

        {/* Card 3: TEMUAN TERBUKA (Rose / Alert Indicator with Kritis, Tinggi, and Perhatian) */}
        <div 
          onClick={() => onFilterClick && onFilterClick('perhatian')}
          className="min-w-[260px] sm:min-w-[300px] flex-1 bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm hover:border-rose-400 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden snap-start"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-rose-600"></div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Temuan Terbuka
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-rose-50 text-rose-700">
              Perlu Tindak Lanjut
            </span>
          </div>
          
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-rose-600 tracking-tight">
                {totalTemuan}
              </span>
              <span className="text-sm font-bold text-slate-500">Temuan</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between gap-1 text-xs flex-wrap">
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-red-100 text-red-900 border border-red-300">
              {criticalPoldaCount} Kritis
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-rose-100 text-rose-700 border border-rose-200">
              {tinggiPoldaCount} Tinggi
            </span>
            <span className="px-1.5 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
              {warningPoldaCount} Perhatian
            </span>
          </div>
        </div>

        {/* Card 4: AUDIT BERJALAN (Amber / Yellow Indicator) */}
        <div 
          onClick={() => onFilterClick && onFilterClick('audit')}
          className="min-w-[260px] sm:min-w-[280px] flex-1 bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm hover:border-amber-400 hover:shadow-md transition-all duration-200 cursor-pointer group flex flex-col justify-between relative overflow-hidden snap-start"
        >
          <div className="absolute top-0 left-0 right-0 h-1 bg-amber-500"></div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Audit Berjalan
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-50 text-amber-700">
              Inspeksi Lapangan
            </span>
          </div>
          
          <div className="my-2.5">
            <div className="flex items-baseline gap-2">
              <span className="text-3xl sm:text-4xl font-black text-amber-700 tracking-tight">
                {auditBerjalanCount}
              </span>
              <span className="text-sm font-bold text-slate-500">Satker</span>
            </div>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <div className="flex items-center gap-1.5 font-medium">
              <span className="w-2 h-2 rounded-full bg-amber-500"></span>
              <span>Tahap II T.A. 2026</span>
            </div>
            <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
              Aktif
            </span>
          </div>
        </div>

        {/* Card 5: KEPATUHAN DOKUMEN (Emerald / Green Indicator) */}
        <div className="min-w-[260px] sm:min-w-[280px] flex-1 bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm hover:border-emerald-400 hover:shadow-md transition-all duration-200 group flex flex-col justify-between relative overflow-hidden snap-start">
          <div className="absolute top-0 left-0 right-0 h-1 bg-emerald-600"></div>

          <div className="flex items-center justify-between">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-500">
              Kepatuhan Dokumen
            </span>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-50 text-emerald-700">
              e-Audit Presisi
            </span>
          </div>
          
          <div className="my-2.5 flex items-baseline justify-between">
            <div className="flex items-baseline gap-1">
              <span className="text-3xl sm:text-4xl font-black text-emerald-700 tracking-tight">
                {persentaseDokumen}
              </span>
              <span className="text-lg font-bold text-emerald-700">%</span>
            </div>
            <span className="text-[11px] font-extrabold px-2 py-0.5 rounded-md bg-emerald-50 text-emerald-700 border border-emerald-200">
              Target 90%
            </span>
          </div>

          <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-600">
            <span className="text-emerald-700 font-bold flex items-center gap-0.5">
              +3.2%
            </span>
            <span className="text-[11px] text-slate-500 font-medium">vs Triwulan Lalu</span>
          </div>
        </div>

      </div>
    </div>
  );
};

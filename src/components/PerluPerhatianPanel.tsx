import React, { useState } from 'react';
import { ChevronRight } from 'lucide-react';
import { PerluPerhatianItem } from '../types';
import { PoldaLogo } from './PoldaLogo';

interface PerluPerhatianPanelProps {
  items: PerluPerhatianItem[];
  onSelectPolda: (poldaId: string) => void;
}

export const PerluPerhatianPanel: React.FC<PerluPerhatianPanelProps> = ({ items, onSelectPolda }) => {
  const [activeFilter, setActiveFilter] = useState<'all' | 'kritis' | 'tinggi' | 'perhatian'>('all');

  const filteredItems = items.filter(item => {
    if (activeFilter === 'all') return true;
    return item.tingkat === activeFilter;
  });

  const kritisCount = items.filter(i => i.tingkat === 'kritis').length;
  const tinggiCount = items.filter(i => i.tingkat === 'tinggi').length;
  const perhatianCount = items.filter(i => i.tingkat === 'perhatian').length;

  return (
    <div id="perlu-perhatian-card" className="bg-white rounded-2xl p-4.5 border border-slate-200/90 shadow-sm">
      {/* Header */}
      <div className="flex items-center justify-between pb-3 border-b border-slate-100">
        <div>
          <h3 className="font-extrabold text-sm sm:text-base text-slate-900 tracking-tight">
            Perlu Perhatian Hari Ini
          </h3>
          <p className="text-[11px] text-slate-500 mt-0.5">
            Daftar Satker berstatus Kritis, Tinggi, dan Perhatian
          </p>
        </div>
        <span className="px-2.5 py-0.5 rounded-md text-xs font-black bg-slate-900 text-white">
          {items.length} Satker
        </span>
      </div>

      {/* Filter Tabs with Color Indicators (Urutan: Semua -> Kritis -> Tinggi -> Perhatian) */}
      <div className="flex items-center gap-1.5 my-3 overflow-x-auto scrollbar-none pb-0.5">
        <button
          onClick={() => setActiveFilter('all')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition whitespace-nowrap cursor-pointer ${
            activeFilter === 'all'
              ? 'bg-[#0B2B5C] text-white shadow-2xs'
              : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
          }`}
        >
          Semua ({items.length})
        </button>

        {/* 1. Kritis (Merah Tua) */}
        <button
          onClick={() => setActiveFilter('kritis')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeFilter === 'kritis'
              ? 'bg-red-900 text-white shadow-2xs'
              : 'bg-red-50 text-red-900 hover:bg-red-100 border border-red-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-red-900 ring-2 ring-red-300"></span>
          Kritis ({kritisCount})
        </button>

        {/* 2. Tinggi (Merah Muda) */}
        <button
          onClick={() => setActiveFilter('tinggi')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeFilter === 'tinggi'
              ? 'bg-rose-500 text-white shadow-2xs'
              : 'bg-rose-50 text-rose-700 hover:bg-rose-100 border border-rose-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-rose-500 ring-2 ring-rose-200"></span>
          Tinggi ({tinggiCount})
        </button>

        {/* 3. Perhatian (Kuning/Amber) */}
        <button
          onClick={() => setActiveFilter('perhatian')}
          className={`px-2.5 py-1 rounded-lg text-[11px] font-bold transition flex items-center gap-1.5 whitespace-nowrap cursor-pointer ${
            activeFilter === 'perhatian'
              ? 'bg-amber-500 text-white shadow-2xs'
              : 'bg-amber-50 text-amber-800 hover:bg-amber-100 border border-amber-200'
          }`}
        >
          <span className="w-2 h-2 rounded-full bg-amber-500 ring-2 ring-amber-200"></span>
          Perhatian ({perhatianCount})
        </button>
      </div>

      {/* Human Sentences List with Color Marker Borders & Badges */}
      <div className="space-y-2.5 max-h-[380px] overflow-y-auto pr-0.5">
        {filteredItems.map((item) => {
          const isCritical = item.tingkat === 'kritis';
          const isTinggi = item.tingkat === 'tinggi';

          // Color markers: Kritis (Merah Tua), Tinggi (Merah Muda), Perhatian (Kuning)
          const borderMarkerClass = isCritical
            ? 'border-l-4 border-l-red-900 bg-red-950/[0.03] border-slate-200/90'
            : isTinggi
            ? 'border-l-4 border-l-rose-500 bg-rose-50/20 border-slate-200/90'
            : 'border-l-4 border-l-amber-500 bg-amber-50/20 border-slate-200/90';

          const badgeClass = isCritical
            ? 'bg-red-900 text-white'
            : isTinggi
            ? 'bg-rose-500 text-white'
            : 'bg-amber-500 text-white';

          return (
            <div
              key={item.id}
              onClick={() => onSelectPolda(item.poldaId)}
              className={`p-3.5 rounded-xl border ${borderMarkerClass} hover:shadow-xs transition-all duration-150 cursor-pointer flex items-start justify-between gap-3 group`}
            >
              <div className="flex items-start gap-3 min-w-0">
                <PoldaLogo 
                  poldaId={item.poldaId} 
                  poldaNama={item.namaPolda} 
                  size="sm"
                  className="mt-0.5 shrink-0"
                />
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-bold text-xs sm:text-sm text-slate-900 group-hover:text-[#0B2B5C] transition">
                      {item.namaPolda}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider ${badgeClass}`}>
                      {item.tingkat === 'kritis' ? 'Kritis' : item.tingkat === 'tinggi' ? 'Tinggi' : 'Perhatian'}
                    </span>
                    <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-600 border border-slate-200">
                      {item.kategori}
                    </span>
                  </div>
                  <p className="text-xs text-slate-700 mt-1 leading-snug font-medium">
                    {item.pesanManusiawi}
                  </p>
                  <div className="mt-1.5 text-[11px] text-slate-500 font-medium">
                    Tenggat: <strong className="text-slate-800 font-bold">{item.tenggatWaktu}</strong>
                  </div>
                </div>
              </div>

              <button
                className="self-center p-1.5 rounded-lg bg-white border border-slate-200 group-hover:bg-[#0B2B5C] group-hover:text-white group-hover:border-[#0B2B5C] text-slate-600 transition shrink-0"
                aria-label={`Buka detail ${item.namaPolda}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          );
        })}
      </div>
    </div>
  );
};

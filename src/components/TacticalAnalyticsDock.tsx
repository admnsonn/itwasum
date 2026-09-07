import React, { useState } from 'react';
import { 
  TrendingUp, 
  Grid3X3, 
  Layers, 
  Building2,
  FileCheck2,
  ShieldCheck,
  ChevronRight
} from 'lucide-react';
import { SatkerTrendHeatmap } from './SatkerTrendHeatmap';
import { DomainSummaryCards } from './DomainSummaryCards';
import { PoldaSatker, SatkerMapItem, MainNavId, BidangAudit, TingkatObjek } from '../types';

interface TacticalAnalyticsDockProps {
  poldaList: PoldaSatker[];
  selectedPoldaId: string | null;
  selectedSatkerItem?: SatkerMapItem | null;
  onSelectPolda: (id: string | null) => void;
  onSelectSatkerItem?: (item: SatkerMapItem) => void;
  onNavigateToModule?: (module: MainNavId, targetPoldaId?: string) => void;
  onOpenDetailDrawer?: () => void;
  activeBidang: BidangAudit;
  onSelectBidang: (bidang: BidangAudit) => void;
  tingkatObjek?: TingkatObjek;
}

export const TacticalAnalyticsDock: React.FC<TacticalAnalyticsDockProps> = ({
  poldaList,
  selectedPoldaId,
  selectedSatkerItem,
  onSelectPolda,
  onSelectSatkerItem,
  onNavigateToModule,
  onOpenDetailDrawer,
  activeBidang,
  onSelectBidang,
  tingkatObjek = 'semua'
}) => {
  const [activeDockTab, setActiveDockTab] = useState<'tren' | 'pilar'>('tren');

  return (
    <div id="tactical-analytics-dock" className="space-y-3">
      {/* Dock Mode Selector Tabs */}
      <div className="flex items-center justify-between pb-1 flex-wrap gap-2">
        <div className="flex items-center gap-1.5 p-1 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
          <button
            onClick={() => setActiveDockTab('tren')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeDockTab === 'tren'
                ? 'bg-[#0B2B5C] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <TrendingUp className="w-3.5 h-3.5" />
            <span>Tren 12 Bulan &amp; Heatmap Kepatuhan</span>
          </button>

          <button
            onClick={() => setActiveDockTab('pilar')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition cursor-pointer flex items-center gap-1.5 ${
              activeDockTab === 'pilar'
                ? 'bg-[#0B2B5C] text-white shadow-2xs'
                : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            <span>4 Pilar Pengawasan (GARKEU, OPSNAL, SARPRAS, SDM)</span>
          </button>
        </div>

        <div className="text-[11px] text-slate-500 font-medium hidden sm:block">
          Analitik Mutu &amp; Audit Presisi Itwasum T.A. 2026 {tingkatObjek !== 'semua' ? `(${tingkatObjek.toUpperCase()})` : ''}
        </div>
      </div>

      {/* Dynamic Content View */}
      {activeDockTab === 'tren' && (
        <SatkerTrendHeatmap
          poldaList={poldaList}
          selectedPoldaId={selectedPoldaId}
          selectedSatkerItem={selectedSatkerItem}
          onSelectPolda={onSelectPolda}
          onSelectSatkerItem={onSelectSatkerItem}
          onNavigateToModule={onNavigateToModule}
          onOpenDetailDrawer={onOpenDetailDrawer}
        />
      )}

      {activeDockTab === 'pilar' && (
        <DomainSummaryCards
          activeBidang={activeBidang}
          onSelectBidang={onSelectBidang}
        />
      )}
    </div>
  );
};

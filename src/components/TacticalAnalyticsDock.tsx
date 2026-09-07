import React from 'react';
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
  // Always show the Tren 12 Bulan + Heatmap view (remove the '4 Pilar' switch)

  return (
    <div id="tactical-analytics-dock" className="space-y-3">
        <SatkerTrendHeatmap
          poldaList={poldaList}
          selectedPoldaId={selectedPoldaId}
          selectedSatkerItem={selectedSatkerItem}
          onSelectPolda={onSelectPolda}
          onSelectSatkerItem={onSelectSatkerItem}
          onNavigateToModule={onNavigateToModule}
          onOpenDetailDrawer={onOpenDetailDrawer}
        />
    </div>
  );
};

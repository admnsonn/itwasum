import React, { useState, useMemo } from 'react';
import { 
  Building, 
  Shield, 
  ChevronRight, 
  Search, 
  Eye,
  Crosshair,
  MapPin,
  X,
  Layers,
  ChevronDown
} from 'lucide-react';
import { SatkerMapItem, TingkatSatker, PoldaSatker } from '../types';
import { 
  ALL_MABES_ITWASUM_MAP_DATA, 
  ALL_SATKER_MABES_MAP_DATA, 
  ALL_COMBINED_SATKERS_DATA,
  ITWIL_JURISDICTIONS, 
  ItwilJurisdiction 
} from '../data/allSatkersData';
import { PoldaLogo } from './PoldaLogo';

interface ItwasumHierarchySidebarProps {
  onSelectSatkerItem: (item: SatkerMapItem) => void;
  onFocusItwilRegion?: (itwil: ItwilJurisdiction) => void;
  onOpenLogoExplorer?: (satkerId?: string) => void;
  selectedSatkerId?: string | null;
  poldaList?: PoldaSatker[];
}

export const ItwasumHierarchySidebar: React.FC<ItwasumHierarchySidebarProps> = ({
  onSelectSatkerItem,
  onFocusItwilRegion,
  onOpenLogoExplorer,
  selectedSatkerId,
  poldaList = []
}) => {
  const [activeTab, setActiveTab] = useState<'itwil' | 'mabes' | 'satker_mabes' | 'polda'>('itwil');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItwilId, setSelectedItwilId] = useState<string | null>(
    selectedSatkerId?.startsWith('itwil-') ? selectedSatkerId : 'itwil-1'
  );

  // Active Itwil Configuration
  const activeItwil = useMemo(() => {
    return ITWIL_JURISDICTIONS.find(it => it.id === selectedItwilId) || ITWIL_JURISDICTIONS[0];
  }, [selectedItwilId]);

  // Filtered List Based on Active Tab & Search Query
  const displayedItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    let items: SatkerMapItem[] = [];
    if (activeTab === 'itwil') {
      items = ALL_MABES_ITWASUM_MAP_DATA.filter(s => s.tingkat === 'Itwil');
    } else if (activeTab === 'mabes') {
      items = ALL_MABES_ITWASUM_MAP_DATA.filter(s => s.tingkat === 'Mabes' || s.tingkat === 'Itwasum' || s.tingkat === 'Biro-Mabes');
    } else if (activeTab === 'satker_mabes') {
      items = ALL_SATKER_MABES_MAP_DATA;
    } else {
      // Polda
      items = ALL_COMBINED_SATKERS_DATA.filter(s => s.tingkat === 'Polda');
    }

    if (!query) return items;

    return items.filter(item => 
      item.nama.toLowerCase().includes(query) ||
      item.singkatan.toLowerCase().includes(query) ||
      item.pimpinanNama.toLowerCase().includes(query) ||
      item.pimpinanJabatan.toLowerCase().includes(query) ||
      (item.wilayahHukum && item.wilayahHukum.toLowerCase().includes(query)) ||
      (item.keteranganKhusus && item.keteranganKhusus.toLowerCase().includes(query))
    );
  }, [activeTab, searchQuery]);

  const handleSelect = (satker: SatkerMapItem) => {
    onSelectSatkerItem(satker);
    if (satker.tingkat === 'Itwil') {
      setSelectedItwilId(satker.id);
      const itwilObj = ITWIL_JURISDICTIONS.find(it => it.id === satker.id);
      if (itwilObj && onFocusItwilRegion) {
        onFocusItwilRegion(itwilObj);
      }
    }
  };

  return (
    <div id="itwasum-hierarchy-sidebar" className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col">
      
      {/* Header */}
      <div className="p-4 border-b border-slate-100 bg-slate-50/50">
        <div className="flex items-center justify-between gap-2 mb-1">
          <h3 className="font-extrabold text-sm text-slate-900 tracking-tight">
            Struktur Komando & Satker
          </h3>
          <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-200/80 text-slate-700">
            {activeTab === 'itwil' ? 'Itwil I - V' : activeTab === 'mabes' ? 'Mabes & Itwasum' : activeTab === 'satker_mabes' ? '8 Satker' : '34 Polda'}
          </span>
        </div>
        <p className="text-xs text-slate-500 leading-relaxed">
          Hierarki pengawasan Itwasum, wilayah Itwil, dan satker jajaran.
        </p>

        {/* Live Search Input */}
        <div className="relative mt-3">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Cari satker, pimpinan, wilayah..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-9 pr-8 py-2 bg-white border border-slate-200 rounded-xl text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2B5C]/20 focus:border-[#0B2B5C] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

        {/* Level Selector Tabs */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-1.5 mt-3">
          {[
            { id: 'itwil', label: 'Itwil I - V' },
            { id: 'mabes', label: 'Mabes & Itwasum' },
            { id: 'satker_mabes', label: 'Satker Mabes' },
            { id: 'polda', label: 'Polda (34)' }
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => {
                setActiveTab(tab.id as any);
                setSearchQuery('');
              }}
              className={`py-1.5 px-2 rounded-lg text-[11px] font-bold text-center transition cursor-pointer ${
                activeTab === tab.id
                  ? 'bg-[#0B2B5C] text-white shadow-xs'
                  : 'bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:bg-slate-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>
      </div>

      {/* Selected Itwil Regional Highlight Banner (When in Itwil mode) */}
      {activeTab === 'itwil' && activeItwil && (
        <div className="p-3.5 bg-slate-50 border-b border-slate-200 text-xs space-y-2">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900">
              {activeItwil.nama}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {activeItwil.poldaIds.length} Polda Diawasi
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {activeItwil.cakupan}
          </p>

          {/* Supervised Polda Quick Chips */}
          <div className="flex flex-wrap gap-1 pt-1">
            {activeItwil.poldaIds.map((poldaId) => {
              const poldaItem = ALL_COMBINED_SATKERS_DATA.find(s => s.id === poldaId);
              const isPoldaActive = selectedSatkerId === poldaId;
              return (
                <button
                  key={poldaId}
                  onClick={() => {
                    if (poldaItem) onSelectSatkerItem(poldaItem);
                  }}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                    isPoldaActive
                      ? 'bg-[#0B2B5C] text-white border-[#0B2B5C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#0B2B5C] hover:text-[#0B2B5C]'
                  }`}
                >
                  {poldaItem?.singkatan || poldaId.replace('polda-', '').toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Satker List (Scrollable, clean UX) */}
      <div className="p-3 space-y-2 max-h-[580px] overflow-y-auto overscroll-contain">
        {displayedItems.length === 0 ? (
          <div className="py-8 text-center text-xs text-slate-400">
            Tidak ada satker yang cocok dengan pencarian.
          </div>
        ) : (
          displayedItems.map((satker) => {
            const isSelected = selectedSatkerId === satker.id;

            return (
              <div
                key={satker.id}
                onClick={() => handleSelect(satker)}
                className={`p-3 rounded-xl border transition-all duration-150 cursor-pointer flex flex-col justify-between gap-2.5 ${
                  isSelected
                    ? 'bg-slate-50/90 border-[#0B2B5C] ring-2 ring-[#0B2B5C]/15 shadow-xs'
                    : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                }`}
              >
                {/* Top Row: Logo, Hierarchy Pill & Name */}
                <div className="flex items-start gap-2.5">
                  <div className="w-9 h-10 rounded-lg bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                    <PoldaLogo 
                      poldaId={satker.id} 
                      poldaSingkatan={satker.singkatan} 
                      poldaNama={satker.nama} 
                      size="sm" 
                    />
                  </div>

                  <div className="min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1.5 mb-0.5">
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-extrabold bg-slate-100 text-slate-700 border border-slate-200 uppercase tracking-tight">
                        {satker.tingkat}
                      </span>
                      <span className="text-[10px] font-bold text-slate-600">
                        IKU: <strong className="text-slate-900">{satker.capaianIKU}%</strong>
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 leading-snug line-clamp-1">
                      {satker.nama}
                    </h4>

                    <p className="text-[11px] text-slate-600 font-medium mt-0.5 line-clamp-1">
                      <span className="font-semibold text-slate-700">{satker.pimpinanJabatan}:</span> {satker.pimpinanNama}
                    </p>
                  </div>
                </div>

                {/* Bottom Row: Context & Action Buttons */}
                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                  <span className="text-[10px] text-slate-500 line-clamp-1 flex-1 mr-2">
                    {satker.wilayahHukum || satker.keteranganKhusus || satker.ibukota}
                  </span>

                  <div className="flex items-center gap-1 shrink-0">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelect(satker);
                      }}
                      className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 hover:bg-[#0B2B5C] hover:text-white text-slate-700 border border-slate-200 transition cursor-pointer flex items-center gap-1"
                    >
                      <span>Pilih</span>
                      <ChevronRight className="w-3 h-3" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* Footer Utility Bar */}
      {onOpenLogoExplorer && (
        <div className="p-3 bg-slate-50 border-t border-slate-200 flex items-center justify-between text-xs">
          <span className="text-[11px] text-slate-500 font-medium">
            Repositori Lambang & Motto
          </span>
          <button
            onClick={() => onOpenLogoExplorer(selectedSatkerId || undefined)}
            className="px-2.5 py-1 rounded-lg bg-white border border-slate-200 hover:border-slate-300 text-slate-800 text-[11px] font-bold transition cursor-pointer"
          >
            Buka Katalog Logo
          </button>
        </div>
      )}

    </div>
  );
};

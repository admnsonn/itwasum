import React, { useState } from 'react';
import { 
  Building, 
  Shield, 
  Compass, 
  ChevronRight, 
  CheckCircle2, 
  AlertTriangle, 
  Layers, 
  Sparkles, 
  Search, 
  ExternalLink,
  Users,
  Award,
  Eye,
  Crosshair,
  MapPin
} from 'lucide-react';
import { SatkerMapItem, TingkatSatker } from '../types';
import { 
  ALL_MABES_ITWASUM_MAP_DATA, 
  ALL_SATKER_MABES_MAP_DATA, 
  ITWIL_JURISDICTIONS, 
  ItwilJurisdiction 
} from '../data/allSatkersData';
import { getPoldaEmblemSvgString } from '../utils/poldaEmblemGenerator';
import { PoldaLogo } from './PoldaLogo';

interface ItwasumHierarchyBarProps {
  onSelectSatkerItem: (item: SatkerMapItem) => void;
  onFocusItwilRegion?: (itwil: ItwilJurisdiction) => void;
  onOpenLogoExplorer?: (satkerId?: string) => void;
  selectedSatkerId?: string | null;
}

export const ItwasumHierarchyBar: React.FC<ItwasumHierarchyBarProps> = ({
  onSelectSatkerItem,
  onFocusItwilRegion,
  onOpenLogoExplorer,
  selectedSatkerId
}) => {
  const [activeTab, setActiveTab] = useState<'itwil' | 'mabes' | 'satker_mabes'>('itwil');
  const [selectedItwilId, setSelectedItwilId] = useState<string | null>('itwil-1');

  const activeItwil = ITWIL_JURISDICTIONS.find(it => it.id === selectedItwilId) || ITWIL_JURISDICTIONS[0];

  const handleItwilClick = (itwil: ItwilJurisdiction) => {
    setSelectedItwilId(itwil.id);
    const satkerItem = ALL_MABES_ITWASUM_MAP_DATA.find(s => s.id === itwil.id);
    if (satkerItem) {
      onSelectSatkerItem(satkerItem);
    }
    if (onFocusItwilRegion) {
      onFocusItwilRegion(itwil);
    }
  };

  return (
    <div className="w-full bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden transition-all duration-200">
      
      {/* Top Bar Header & Navigation Pills */}
      <div className="px-4 sm:px-6 py-3.5 bg-gradient-to-r from-slate-900 via-[#0B2B5C] to-slate-900 text-white flex flex-col md:flex-row md:items-center md:justify-between gap-3 border-b border-blue-900/60">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-amber-400 text-slate-950 flex items-center justify-center font-black shadow-md shrink-0">
            <Shield className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-extrabold text-sm sm:text-base text-white tracking-tight">
                Inspektorat Pengawasan — Itwil I–V
              </h3>
              <span className="hidden sm:inline-block px-2 py-0.5 rounded-full text-[10px] font-black bg-amber-400 text-slate-950 uppercase tracking-wide">
                Tingkat Mabes
              </span>
            </div>
            <p className="text-xs text-blue-200">
              Ringkasan pengawasan regional dan akses cepat ke profil Itwil.
            </p>
          </div>
        </div>

        {/* Level Switcher Tabs */}
        <div className="flex items-center gap-1.5 bg-white/10 p-1 rounded-xl backdrop-blur-xs border border-white/10 self-start md:self-auto overflow-x-auto max-w-full">
          <button
            onClick={() => setActiveTab('itwil')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'itwil'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>Inspektorat Wilayah (Itwil I - V)</span>
          </button>

          <button
            onClick={() => setActiveTab('mabes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'mabes'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>Mabes & Itwasum Polri</span>
          </button>

          <button
            onClick={() => setActiveTab('satker_mabes')}
            className={`px-3 py-1.5 rounded-lg text-xs font-bold transition whitespace-nowrap cursor-pointer ${
              activeTab === 'satker_mabes'
                ? 'bg-amber-400 text-slate-950 shadow-sm'
                : 'text-blue-100 hover:text-white hover:bg-white/10'
            }`}
          >
            <span>Satker Utama Mabes (8)</span>
          </button>
        </div>
      </div>

      {/* Main Content Area Based on Active Tab */}
      <div className="p-4 sm:p-5 bg-slate-50/60">
        
        {/* TAB 1: INSPEKTORAT WILAYAH (ITWIL I, II, III, IV, V) */}
        {activeTab === 'itwil' && (
          <div className="space-y-4">
            
            {/* 5 Itwil Cards Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {ITWIL_JURISDICTIONS.map((itwil) => {
                const satkerItem = ALL_MABES_ITWASUM_MAP_DATA.find(s => s.id === itwil.id);
                const isSelected = selectedItwilId === itwil.id || selectedSatkerId === itwil.id;
                
                return (
                  <button
                    key={itwil.id}
                    onClick={() => handleItwilClick(itwil)}
                    className={`p-3.5 rounded-2xl border text-left transition-all relative flex flex-col justify-between cursor-pointer group ${
                      isSelected
                        ? 'bg-white border-[#0B2B5C] ring-2 ring-[#0B2B5C]/20 shadow-md scale-[1.02]'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:shadow-xs'
                    }`}
                  >
                    <div>
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div className="w-10 h-11 rounded-lg bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs group-hover:scale-105 transition-transform">
                          <PoldaLogo 
                            poldaId={itwil.id} 
                            poldaSingkatan={itwil.id.toUpperCase()} 
                            poldaNama={itwil.nama} 
                            size="sm" 
                          />
                        </div>
                        <span 
                          className="px-2 py-0.5 rounded-full text-[10px] font-black text-white"
                          style={{ backgroundColor: itwil.warnaTema }}
                        >
                          {itwil.id.toUpperCase()}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1 group-hover:text-blue-900">
                        {itwil.singkatan}
                      </h4>
                      <p className="text-[10px] text-slate-500 font-semibold mt-0.5 line-clamp-1">
                        {itwil.pimpinan}
                      </p>
                      <p className="text-[10px] text-slate-600 font-medium mt-1 line-clamp-2 leading-relaxed">
                        {itwil.cakupan}
                      </p>
                    </div>

                    <div className="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between text-[11px]">
                      <div className="flex items-center gap-1">
                        <span className="text-slate-400 font-semibold text-[10px]">IKU:</span>
                        <span className="font-black text-emerald-700">
                          {satkerItem?.capaianIKU || 94}%
                        </span>
                      </div>
                      <span className="text-[10px] font-bold text-blue-700 group-hover:underline flex items-center gap-0.5">
                        <span>Pilih</span>
                        <ChevronRight className="w-3 h-3" />
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Selected Itwil Regional Spotlight & Jurisdiction Details */}
            {activeItwil && (
              <div className="p-4 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 animate-in fade-in duration-200">
                <div className="space-y-1.5 max-w-2xl">
                  <div className="flex items-center gap-2">
                    <span 
                      className="w-3 h-3 rounded-full"
                      style={{ backgroundColor: activeItwil.warnaTema }}
                    />
                    <h5 className="font-black text-sm text-slate-900">
                      {activeItwil.nama}
                    </h5>
                  </div>
                  <p className="text-xs text-slate-600 leading-relaxed">
                    {activeItwil.pimpinan} — {activeItwil.jabatan}
                  </p>
                  
                  {/* Supervised Polda Badges */}
                  {activeItwil.poldaIds.length > 0 && (
                    <div className="pt-2 flex items-center gap-1.5 flex-wrap">
                      <span className="text-[11px] font-extrabold text-slate-400 uppercase mr-1">
                        Polda Di Bawah Pengawasan ({activeItwil.poldaIds.length}):
                      </span>
                      {activeItwil.poldaIds.map((poldaId) => {
                        const satkerPolda = ALL_MABES_ITWASUM_MAP_DATA.find(s => s.id === poldaId) || {
                          id: poldaId,
                          singkatan: poldaId.replace('polda-', '').toUpperCase()
                        };
                        return (
                          <button
                            key={poldaId}
                            onClick={() => {
                              const item = ALL_MABES_ITWASUM_MAP_DATA.find(s => s.id === poldaId);
                              if (item) onSelectSatkerItem(item);
                            }}
                            className="px-2 py-0.5 rounded-lg bg-slate-100 hover:bg-blue-100 hover:text-blue-900 text-slate-700 text-[10px] font-bold transition border border-slate-200 cursor-pointer"
                          >
                            Polda {satkerPolda.singkatan}
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Quick Action Buttons */}
                <div className="flex items-center gap-2 shrink-0 w-full lg:w-auto">
                  <button
                    onClick={() => {
                      if (onFocusItwilRegion) onFocusItwilRegion(activeItwil);
                    }}
                    className="flex-1 lg:flex-initial px-3.5 py-2 rounded-xl bg-[#0B2B5C] hover:bg-blue-900 text-white font-bold text-xs shadow-xs flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Crosshair className="w-3.5 h-3.5 text-amber-400" />
                    <span>Fokus Peta Wilayah</span>
                  </button>

                  <button
                    onClick={() => {
                      const item = ALL_MABES_ITWASUM_MAP_DATA.find(s => s.id === activeItwil.id);
                      if (item) onSelectSatkerItem(item);
                    }}
                    className="flex-1 lg:flex-initial px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-800 font-bold text-xs border border-slate-200 flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Eye className="w-3.5 h-3.5 text-blue-700" />
                    <span>Dossier Detail</span>
                  </button>

                  {onOpenLogoExplorer && (
                    <button
                      onClick={() => onOpenLogoExplorer(activeItwil.id)}
                      className="px-3 py-2 rounded-xl bg-amber-50 hover:bg-amber-100 text-amber-900 border border-amber-200 font-bold text-xs flex items-center gap-1 transition cursor-pointer"
                      title="Lihat Lambang Resmi & Motto"
                    >
                      <Shield className="w-3.5 h-3.5 text-amber-600" />
                      <span className="hidden sm:inline">Logo</span>
                    </button>
                  )}
                </div>
              </div>
            )}

          </div>
        )}

        {/* TAB 2: MABES & ITWASUM POLRI (PUSAT KOMANDO) */}
        {activeTab === 'mabes' && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-3">
            {ALL_MABES_ITWASUM_MAP_DATA.map((satker) => {
              const isSelected = selectedSatkerId === satker.id;
              return (
                <div
                  key={satker.id}
                  className={`p-4 rounded-2xl border bg-white flex flex-col justify-between transition-all ${
                    isSelected ? 'border-[#0B2B5C] ring-2 ring-[#0B2B5C]/20 shadow-md' : 'border-slate-200 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="w-11 h-12 rounded-xl bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                        <PoldaLogo 
                          poldaId={satker.id} 
                          poldaSingkatan={satker.singkatan} 
                          poldaNama={satker.nama} 
                          size="sm" 
                        />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-[#0B2B5C] text-amber-300 border border-amber-400/40">
                        {satker.tingkat}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 leading-snug">
                      {satker.nama}
                    </h4>
                    <p className="text-[11px] font-bold text-blue-900 mt-1">
                      {satker.pimpinanJabatan}: <span className="font-semibold text-slate-700">{satker.pimpinanNama}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                      {satker.keteranganKhusus || satker.wilayahHukum}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] text-slate-500">
                      IKU: <strong className="text-emerald-700">{satker.capaianIKU}%</strong>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => onSelectSatkerItem(satker)}
                        className="px-2.5 py-1 rounded-lg bg-[#0B2B5C] hover:bg-blue-900 text-white font-bold text-[10px] transition cursor-pointer"
                      >
                        Detail Satker
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* TAB 3: SATKER UTAMA MABES POLRI (BARESKRIM, KORLANTAS, BRIMOB, DLL.) */}
        {activeTab === 'satker_mabes' && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {ALL_SATKER_MABES_MAP_DATA.map((satker) => {
              const isSelected = selectedSatkerId === satker.id;
              return (
                <div
                  key={satker.id}
                  className={`p-4 rounded-2xl border bg-white flex flex-col justify-between transition-all ${
                    isSelected ? 'border-[#0B2B5C] ring-2 ring-[#0B2B5C]/20 shadow-md' : 'border-slate-200 shadow-2xs'
                  }`}
                >
                  <div>
                    <div className="flex items-start justify-between gap-2 mb-2.5">
                      <div className="w-10 h-11 rounded-xl bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-xs">
                        <PoldaLogo 
                          poldaId={satker.id} 
                          poldaSingkatan={satker.singkatan} 
                          poldaNama={satker.nama} 
                          size="sm" 
                        />
                      </div>
                      <span className="px-2 py-0.5 rounded-full text-[10px] font-black bg-slate-900 text-blue-200 border border-blue-400/40">
                        {satker.singkatan}
                      </span>
                    </div>

                    <h4 className="font-extrabold text-xs text-slate-900 line-clamp-1">
                      {satker.nama}
                    </h4>
                    <p className="text-[11px] font-bold text-blue-900 mt-1 line-clamp-1">
                      {satker.pimpinanJabatan}: <span className="font-semibold text-slate-700">{satker.pimpinanNama}</span>
                    </p>
                    <p className="text-[10px] text-slate-500 mt-1 line-clamp-2">
                      {satker.keteranganKhusus || satker.motto}
                    </p>
                  </div>

                  <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between">
                    <div className="text-[10px] text-slate-500">
                      IKU: <strong className="text-emerald-700">{satker.capaianIKU}%</strong>
                    </div>
                    <button
                      onClick={() => onSelectSatkerItem(satker)}
                      className="px-2.5 py-1 rounded-lg bg-[#0B2B5C] hover:bg-blue-900 text-white font-bold text-[10px] transition cursor-pointer"
                    >
                      Buka Profil
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        )}

      </div>

    </div>
  );
};

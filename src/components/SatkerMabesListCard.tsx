import React from 'react';
import { 
  Building2, 
  ChevronRight, 
  ShieldAlert, 
  ShieldCheck, 
  Activity, 
  Wallet, 
  Truck, 
  Users,
  Search
} from 'lucide-react';
import { SatkerMabesItem, BidangAudit } from '../types';

interface SatkerMabesListCardProps {
  satkers: SatkerMabesItem[];
  activeBidang: BidangAudit;
  onSelectMabesSatker?: (satker: SatkerMabesItem) => void;
}

export const SatkerMabesListCard: React.FC<SatkerMabesListCardProps> = ({
  satkers,
  activeBidang,
  onSelectMabesSatker
}) => {
  const filteredSatkers = activeBidang === 'semua' 
    ? satkers 
    : satkers.filter(s => s.bidangPrioritas.toLowerCase() === activeBidang.toLowerCase());

  return (
    <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4 space-y-3">
      
      {/* Header */}
      <div className="flex items-center justify-between pb-2 border-b border-slate-100">
        <div className="flex items-center gap-2">
          <div className="p-1.5 rounded-lg bg-[#0B2B5C] text-amber-400">
            <Building2 className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider">
              Satuan Kerja Tingkat Pusat (Mabes Polri)
            </h3>
            <p className="text-[11px] text-slate-500">
              Pengawasan institusional unsur pelaksana tugas pokok, pembantu pimpinan, dan pendukung Mabes.
            </p>
          </div>
        </div>

        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
          {filteredSatkers.length} Satker Pusat
        </span>
      </div>

      {/* Grid of Mabes Satkers */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
        {filteredSatkers.map((satker) => {
          const isKritis = satker.status === 'kritis';
          const isPerhatian = satker.status === 'perhatian';

          return (
            <div
              key={satker.id}
              onClick={() => onSelectMabesSatker && onSelectMabesSatker(satker)}
              className="p-3.5 rounded-xl border border-slate-200 hover:border-[#0B2B5C] hover:shadow-md transition-all cursor-pointer bg-white group flex flex-col justify-between"
            >
              <div>
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
                      <img 
                        src={satker.logoUrl} 
                        alt={satker.singkatan}
                        referrerPolicy="no-referrer"
                        className="w-full h-full object-contain"
                        onError={(e) => {
                          const target = e.currentTarget;
                          target.style.display = 'none';
                        }}
                      />
                    </div>
                    <div className="min-w-0">
                      <h4 className="font-extrabold text-xs text-slate-900 group-hover:text-[#0B2B5C] transition truncate">
                        {satker.nama}
                      </h4>
                      <div className="text-[10px] text-slate-500 truncate">
                        {satker.pimpinanJabatan}: {satker.pimpinan}
                      </div>
                    </div>
                  </div>

                  <span className={`px-2 py-0.5 rounded text-[9px] font-black uppercase shrink-0 ${
                    isKritis ? 'bg-rose-100 text-rose-800 border border-rose-300' :
                    isPerhatian ? 'bg-amber-100 text-amber-800 border border-amber-300' :
                    'bg-emerald-100 text-emerald-800 border border-emerald-300'
                  }`}>
                    {satker.status}
                  </span>
                </div>

                <p className="text-[11px] text-slate-600 mt-2 leading-relaxed line-clamp-2">
                  {satker.deskripsi}
                </p>
              </div>

              {/* Metrics Footer */}
              <div className="mt-3 pt-2.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-600">
                <div className="flex items-center gap-3">
                  <span>
                    Temuan: <strong className={satker.temuanTerbuka > 15 ? 'text-rose-600' : 'text-slate-800'}>{satker.temuanTerbuka}</strong>
                  </span>
                  <span>
                    IKU: <strong className="text-blue-700">{satker.capaianIKU}%</strong>
                  </span>
                  <span>
                    Serapan: <strong className="text-slate-800">{satker.serapanAnggaran}%</strong>
                  </span>
                </div>

                <span className="px-1.5 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">
                  {satker.bidangPrioritas}
                </span>
              </div>
            </div>
          );
        })}
      </div>

    </div>
  );
};

import React, { useState } from 'react';
import { 
  X, 
  AlertTriangle, 
  HelpCircle, 
  ShieldAlert, 
  FileText, 
  CheckCircle2, 
  Layers, 
  Compass, 
  ExternalLink,
  ChevronRight,
  Info,
  Sparkles,
  ArrowRight
} from 'lucide-react';
import { DOKUMEN_UNDEFINED_ITEMS, DokumenUndefinedItem } from '../data/hakAksesWorkflowData';

interface DokumenGapsModalProps {
  isOpen: boolean;
  onClose: () => void;
  onNavigateAction?: (actionId: string) => void;
  onOpenKPICustomizer?: () => void;
  onOpenUsulanModal?: () => void;
}

export const DokumenGapsModal: React.FC<DokumenGapsModalProps> = ({
  isOpen,
  onClose,
  onNavigateAction,
  onOpenKPICustomizer,
  onOpenUsulanModal
}) => {
  const [selectedItem, setSelectedItem] = useState<DokumenUndefinedItem>(DOKUMEN_UNDEFINED_ITEMS[0]);
  const [activeFilter, setActiveFilter] = useState<string>('all');

  if (!isOpen) return null;

  const filteredItems = DOKUMEN_UNDEFINED_ITEMS.filter(item => {
    if (activeFilter === 'all') return true;
    if (activeFilter === 'l3') return item.id === 'undef-1';
    if (activeFilter === 'kpi') return item.id === 'undef-2';
    if (activeFilter === 'mabes') return item.id === 'undef-3';
    if (activeFilter === 'bidang') return item.id === 'undef-4';
    if (activeFilter === 'usulan') return item.id === 'undef-5';
    if (activeFilter === 'security') return item.id === 'undef-6';
    return true;
  });

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 sm:p-6 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-5xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        
        {/* Modal Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Analisis Dokumen Resmi E-Audit
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  6 Hal Belum Ter-Define &amp; Solusi UI
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Katalog Hal yang Belum Terdefinisi &amp; Implementasi Solutif
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Filter Bar */}
        <div className="px-6 py-2.5 bg-slate-950 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-xs">
          <span className="text-slate-400 text-[11px] font-semibold mr-1">Filter Aspek:</span>
          {[
            { id: 'all', label: 'Semua 6 Item' },
            { id: 'l3', label: '1. Data L3 (Polres)' },
            { id: 'kpi', label: '2. 6 Metrik KPI' },
            { id: 'mabes', label: '3. Satker Mabes' },
            { id: 'bidang', label: '4. Tag 4 Bidang' },
            { id: 'usulan', label: '5. Usulan Hak Akses' },
            { id: 'security', label: '6. Akses Ditolak' }
          ].map(f => (
            <button
              key={f.id}
              onClick={() => setActiveFilter(f.id)}
              className={`px-3 py-1 rounded-lg text-xs font-bold transition whitespace-nowrap ${
                activeFilter === f.id
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800/80 hover:bg-slate-800 text-slate-300'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Modal Body: Two Columns */}
        <div className="flex-1 overflow-hidden grid grid-cols-1 md:grid-cols-12">
          
          {/* Left List (Col 5) */}
          <div className="md:col-span-5 border-r border-slate-800 overflow-y-auto p-4 space-y-2.5 bg-slate-900/40">
            {filteredItems.map(item => {
              const isSelected = selectedItem.id === item.id;
              return (
                <div
                  key={item.id}
                  onClick={() => setSelectedItem(item)}
                  className={`p-3.5 rounded-2xl border transition-all cursor-pointer space-y-1.5 ${
                    isSelected
                      ? 'bg-slate-800 border-amber-500 shadow-md ring-1 ring-amber-500/20'
                      : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/50'
                  }`}
                >
                  <div className="flex items-center justify-between gap-2">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                      Item #{item.nomor}
                    </span>
                    <span className="text-[10px] text-slate-400 font-mono">
                      {item.tandaDokumen}
                    </span>
                  </div>
                  <h3 className="text-xs font-bold text-white leading-snug">
                    {item.judul}
                  </h3>
                  <p className="text-[11px] text-slate-400 line-clamp-2">
                    {item.referensiDokumen}
                  </p>
                </div>
              );
            })}
          </div>

          {/* Right Detail (Col 7) */}
          <div className="md:col-span-7 overflow-y-auto p-6 space-y-6 bg-slate-900">
            
            {/* Header Detail */}
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-xs font-bold px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-400 border border-amber-500/30">
                  Item #{selectedItem.nomor} &bull; {selectedItem.tandaDokumen}
                </span>
                <span className="text-xs text-slate-400">
                  {selectedItem.referensiDokumen}
                </span>
              </div>
              <h3 className="text-xl font-black text-white">
                {selectedItem.judul}
              </h3>
            </div>

            {/* Kondisi di Dokumen */}
            <div className="p-4 rounded-2xl bg-slate-950 border border-slate-800 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-amber-400 tracking-wider">
                <HelpCircle className="w-4 h-4" />
                Catatan Eksplisit Dokumen Resmi:
              </div>
              <p className="text-xs text-slate-300 italic leading-relaxed border-l-2 border-amber-500/50 pl-3">
                &ldquo;{selectedItem.kondisiDokumen}&rdquo;
              </p>
            </div>

            {/* Analisis Kebutuhan */}
            <div className="space-y-1.5">
              <h4 className="text-xs font-black uppercase tracking-wider text-slate-400">
                Analisis Kebutuhan Sistem &amp; Dampak Arsitektur:
              </h4>
              <p className="text-xs text-slate-300 leading-relaxed">
                {selectedItem.analisisKebutuhan}
              </p>
            </div>

            {/* Penerapan Solutif pada UI */}
            <div className="p-4 rounded-2xl bg-emerald-950/30 border border-emerald-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-emerald-400 tracking-wider">
                <CheckCircle2 className="w-4 h-4" />
                Penerapan Solutif pada Aplikasi Ini:
              </div>
              <p className="text-xs text-emerald-100/90 leading-relaxed">
                {selectedItem.penerapanPadaUI}
              </p>
            </div>

            {/* Pertanyaan untuk Pimpinan */}
            <div className="p-4 rounded-2xl bg-blue-950/30 border border-blue-500/30 space-y-2">
              <div className="flex items-center gap-2 text-xs font-black uppercase text-blue-400 tracking-wider">
                <Info className="w-4 h-4" />
                Bahan Pertanyaan Konfirmasi ke Pimpinan Itwasum:
              </div>
              <p className="text-xs text-blue-100/90 font-medium leading-relaxed">
                &ldquo;{selectedItem.pertanyaanUntukPimpinan}&rdquo;
              </p>
            </div>

            {/* Quick Action Buttons for Gap Items */}
            <div className="pt-2 flex flex-col gap-2">
              {selectedItem.id === 'undef-2' && onOpenKPICustomizer && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenKPICustomizer();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Buka Modal Kustomisasi 6 KPI Pimpinan
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {selectedItem.id === 'undef-5' && onOpenUsulanModal && (
                <button
                  onClick={() => {
                    onClose();
                    onOpenUsulanModal();
                  }}
                  className="w-full py-2.5 px-4 rounded-xl bg-blue-500 hover:bg-blue-400 text-white font-black text-xs flex items-center justify-center gap-2 shadow-lg transition cursor-pointer"
                >
                  <Sparkles className="w-4 h-4" />
                  Buka Formulir Usulan Hak Akses Pengawas
                  <ArrowRight className="w-4 h-4" />
                </button>
              )}

              {onNavigateAction && (
                <button
                  onClick={() => {
                    onClose();
                    onNavigateAction(selectedItem.id);
                  }}
                  className="w-full py-2 px-4 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold text-xs flex items-center justify-center gap-2 transition cursor-pointer"
                >
                  Navigasi ke Fitur Terkait
                  <ChevronRight className="w-4 h-4" />
                </button>
              )}
            </div>

          </div>

        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3.5 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <div>
            Disusun berdasarkan analisis mendalam Buku Manual &amp; Dokumen Hak Akses Modul Overview E-Audit Presisi.
          </div>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            Tutup Dialog
          </button>
        </div>

      </div>
    </div>
  );
};

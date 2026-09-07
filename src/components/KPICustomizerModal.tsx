import React, { useState } from 'react';
import { 
  X, 
  Settings2, 
  Check, 
  Sparkles, 
  HelpCircle, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  RotateCcw,
  CheckCircle2
} from 'lucide-react';
import { KPIMetricDefinition, BidangName } from '../types';
import { DEFAULT_PROVIDER_KPI_METRICS } from '../data/hakAksesWorkflowData';

export const ALL_AVAILABLE_KPI_METRICS: KPIMetricDefinition[] = [
  ...DEFAULT_PROVIDER_KPI_METRICS,
  {
    id: 'kpi-dipa',
    kode: 'DIPA',
    label: 'Serapan Anggaran / Realisasi DIPA',
    modulAsal: 'Modul 4: Evaluasi Anggaran & IKPA',
    modulNomor: 4,
    bidang: 'Garkeu',
    deskripsi: 'Persentase realisasi anggaran belanja satker terhadap DIPA T.A. 2026.',
    tersediaDiL3: true,
    statusSumberL3: 'Tersedia',
    satuan: '%',
    formatNilai: (val) => `${val}%`
  },
  {
    id: 'kpi-dumas',
    kode: 'DUMAS',
    label: 'Pengaduan Masyarakat (Dumas Presisi)',
    modulAsal: 'Modul 8: Integrasi Dumas Presisi',
    modulNomor: 8,
    bidang: 'Opsnal',
    deskripsi: 'Jumlah laporan pengaduan masyarakat yang sedang ditangani atau dalam klarifikasi.',
    tersediaDiL3: true,
    statusSumberL3: 'Tersedia',
    satuan: 'Laporan',
    formatNilai: (val) => `${val}`
  },
  {
    id: 'kpi-bmn',
    kode: 'BMN',
    label: 'Aset BMN Belum Bersertifikat / Valid',
    modulAsal: 'Modul 9: Penatausahaan BMN & Logistik SAKTI',
    modulNomor: 9,
    bidang: 'Logistik',
    deskripsi: 'Persil tanah dan aset sarpras yang memerlukan sertifikasi hak pakai Polri.',
    tersediaDiL3: true,
    statusSumberL3: 'Tersedia',
    satuan: 'Aset',
    formatNilai: (val) => `${val}`
  },
  {
    id: 'kpi-selra',
    kode: 'SELRA',
    label: 'Penyelesaian Perkara Pidana (Selra)',
    modulAsal: 'Modul 10: Integrasi EMP & Reskrim',
    modulNomor: 10,
    bidang: 'Opsnal',
    deskripsi: 'Rasio penyelesaian tindak pidana tuntas terhadap total laporan polisi masuk.',
    tersediaDiL3: true,
    statusSumberL3: 'Tersedia',
    satuan: '%',
    formatNilai: (val) => `${val}%`
  },
  {
    id: 'kpi-pelanggaran',
    kode: 'ETIK',
    label: 'Pelanggaran Disiplin & Kode Etik',
    modulAsal: 'Modul 11: Wasintern & Propam Presisi',
    modulNomor: 11,
    bidang: 'SDM',
    deskripsi: 'Jumlah personel dalam proses sidang KEPP atau hukuman disiplin.',
    tersediaDiL3: true,
    statusSumberL3: 'Tersedia',
    satuan: 'Personel',
    formatNilai: (val) => `${val}`
  }
];

interface KPICustomizerModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedMetricIds?: string[];
  onSaveSelection?: (newMetricIds: string[]) => void;
}

export const KPICustomizerModal: React.FC<KPICustomizerModalProps> = ({
  isOpen,
  onClose,
  selectedMetricIds = DEFAULT_PROVIDER_KPI_METRICS.map(m => m.id),
  onSaveSelection
}) => {
  const [currentSelected, setCurrentSelected] = useState<string[]>(selectedMetricIds);

  if (!isOpen) return null;

  const handleToggle = (id: string) => {
    if (currentSelected.includes(id)) {
      if (currentSelected.length <= 1) return; // Keep at least 1
      setCurrentSelected(currentSelected.filter(item => item !== id));
    } else {
      if (currentSelected.length >= 6) {
        // Replace oldest or cap at 6
        alert('Maksimal 6 metrik utama untuk Baris KPI Pimpinan. Nonaktifkan salah satu metrik terlebih dahulu.');
        return;
      }
      setCurrentSelected([...currentSelected, id]);
    }
  };

  const handleReset = () => {
    setCurrentSelected(DEFAULT_PROVIDER_KPI_METRICS.map(m => m.id));
  };

  const handleSave = () => {
    onSaveSelection(currentSelected);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-3xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-amber-500/20 text-amber-400 border border-amber-500/30 flex items-center justify-center font-bold">
              <Settings2 className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-amber-400/10 text-amber-400 border border-amber-400/20">
                  Dokumen Hal 6 &bull; Catatan Rekomendasi
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  {currentSelected.length} dari 6 Metrik Aktif
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Kustomisasi 6 Angka Utama Baris KPI
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

        {/* Notice Banner from Document */}
        <div className="px-6 py-3 bg-amber-500/10 border-b border-amber-500/20 flex items-start gap-3 text-xs text-amber-200/90">
          <HelpCircle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong>Catatan Buku Manual E-Audit (Hal 6):</strong> &ldquo;Keenam angka ini adalah rekomendasi penyedia. Pimpinan memiliki keleluasaan penuh menentukan komposisi indikator utama dari 17 modul pengawasan.&rdquo;
          </div>
        </div>

        {/* Metric Selector List */}
        <div className="flex-1 overflow-y-auto p-6 space-y-3">
          {ALL_AVAILABLE_KPI_METRICS.map((metric) => {
            const isSelected = currentSelected.includes(metric.id);
            const isProviderDefault = DEFAULT_PROVIDER_KPI_METRICS.some(d => d.id === metric.id);

            return (
              <div
                key={metric.id}
                onClick={() => handleToggle(metric.id)}
                className={`p-4 rounded-2xl border transition-all cursor-pointer flex items-center justify-between gap-4 ${
                  isSelected
                    ? 'bg-slate-800/90 border-amber-500 shadow-md ring-1 ring-amber-500/20'
                    : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-800/40 opacity-70'
                }`}
              >
                <div className="space-y-1.5 flex-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                      {metric.kode}
                    </span>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      {metric.modulAsal}
                    </span>
                    <span className={`text-[10px] font-black uppercase px-2 py-0.5 rounded ${
                      metric.bidang === 'Garkeu' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' :
                      metric.bidang === 'Opsnal' ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20' :
                      metric.bidang === 'SDM' ? 'bg-purple-500/10 text-purple-400 border border-purple-500/20' :
                      metric.bidang === 'Logistik' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' :
                      'bg-slate-700 text-slate-300'
                    }`}>
                      [{metric.bidang.toUpperCase()}]
                    </span>
                    {isProviderDefault && (
                      <span className="text-[10px] font-medium text-amber-400/80">
                        &bull; Rekomendasi Awal
                      </span>
                    )}
                  </div>

                  <h3 className="font-extrabold text-sm text-white">
                    {metric.label}
                  </h3>
                  <p className="text-xs text-slate-400">
                    {metric.deskripsi}
                  </p>
                </div>

                <div className="shrink-0">
                  <div className={`w-6 h-6 rounded-lg flex items-center justify-center border transition ${
                    isSelected 
                      ? 'bg-amber-400 border-amber-400 text-slate-950 font-black' 
                      : 'border-slate-700 bg-slate-800 text-transparent'
                  }`}>
                    <Check className="w-4 h-4" />
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-4">
          <button
            onClick={handleReset}
            className="text-xs text-slate-400 hover:text-white flex items-center gap-1.5 transition font-medium"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Kembalikan ke Rekomendasi Penyedia
          </button>

          <div className="flex items-center gap-3">
            <button
              onClick={onClose}
              className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 text-xs font-bold transition"
            >
              Batal
            </button>
            <button
              onClick={handleSave}
              className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-md"
            >
              <CheckCircle2 className="w-4 h-4" />
              Simpan Konfigurasi Baris KPI ({currentSelected.length}/6)
            </button>
          </div>
        </div>

      </div>
    </div>
  );
};

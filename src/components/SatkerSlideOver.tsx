import React, { useState, useMemo, useEffect } from 'react';
import { 
  X, 
  ChevronRight,
  MapPin,
  Search,
  CheckCircle2,
  Clock
} from 'lucide-react';
import { 
  ResponsiveContainer, 
  LineChart, 
  Line, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  Legend, 
  ReferenceLine,
  Area,
  AreaChart 
} from 'recharts';
import { PoldaSatker, MainNavId, SatkerMapItem } from '../types';
import { PoldaLogo } from './PoldaLogo';
import { getSatkerLogo } from '../data/satkerLogosData';
import { ALL_COMBINED_SATKERS_DATA, ITWIL_JURISDICTIONS } from '../data/allSatkersData';
import { getSatkerAtensiTLHP, getQuarterlyHeatmapColor, MATRIKS_RENTANG_RISIKO } from '../utils/riskRatingUtils';

interface SatkerSlideOverProps {
  polda: PoldaSatker | null;
  satkerItem?: SatkerMapItem | null;
  isOpen?: boolean;
  onClose: () => void;
  onNavigateToModule: (module: MainNavId, targetPoldaId?: string) => void;
  onOpenLogoExplorer?: (poldaId?: string) => void;
}

type SlideOverTab = 'ringkasan' | 'tren_heatmap' | 'analisis' | 'satwil';
type ChartMetric = 'temuan' | 'iku' | 'anggaran';

export const SatkerSlideOver: React.FC<SatkerSlideOverProps> = ({
  polda,
  satkerItem,
  onClose,
  onNavigateToModule,
  onOpenLogoExplorer
}) => {
  const [activeTab, setActiveTab] = useState<SlideOverTab>('ringkasan');
  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temuan');
  const [hoveredHeatmapCell, setHoveredHeatmapCell] = useState<{
    domain: string;
    period: string;
    score: number;
    status: 'kritis' | 'tinggi' | 'perhatian' | 'aman';
    label?: string;
  } | null>(null);

  // Close on Escape key press
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [onClose]);

  // Determine active item to display (prioritizing specific satkerItem over generic parent Polda)
  const currentItem = satkerItem || polda;

  if (!currentItem) return null;

  const satkerTingkat = satkerItem ? satkerItem.tingkat : 'Polda';
  const satkerNama = currentItem.nama;
  const satkerSingkatan = currentItem.singkatan;
  const satkerId = currentItem.id;
  const parentPoldaId = satkerItem ? satkerItem.parentPoldaId : currentItem.id;
  const parentPoldaNama = satkerItem ? satkerItem.parentPoldaNama : currentItem.nama;
  const wilayahHukum = satkerItem?.wilayahHukum || (polda ? `Provinsi ${polda.singkatan}` : `Wilayah Hukum ${satkerNama}`);
  const pimpinanNama = satkerItem ? satkerItem.pimpinanNama : (polda?.kapolda || '');
  const pimpinanJabatan = satkerItem ? satkerItem.pimpinanJabatan : 'Kapolda';
  const wikiLogoUrl = satkerItem?.wikiLogoUrl || (getSatkerLogo(satkerId)?.imageUrl || '');
  const motto = satkerItem?.motto || (getSatkerLogo(satkerId)?.motto || 'Tri Brata & Catur Prasetya');

  // Status Atensi & Progres TLHP terstandarisasi Itwasum Polri
  const atensiInfo = useMemo(() => getSatkerAtensiTLHP(currentItem), [currentItem]);

  const isCritical = atensiInfo.def.key === 'sangat_tinggi';
  const isTinggi = atensiInfo.def.key === 'tinggi';
  const isWarning = atensiInfo.def.key === 'sedang';
  const isSafe = atensiInfo.def.key === 'rendah' || atensiInfo.def.key === 'sangat_rendah';

  const isPolsek = satkerTingkat === 'Polsek';
  const isPolres = satkerTingkat === 'Polres' || satkerTingkat === 'Polrestabes' || satkerTingkat === 'Polresta';
  const isPolda = satkerTingkat === 'Polda';

  // 12-Month Trend Data for Line Chart
  const trendData = useMemo(() => {
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const totalT = currentItem.totalTemuan || 15;
    const openT = currentItem.temuanTerbuka || 4;
    const resolvedT = currentItem.temuanSelesai || (totalT - openT);
    const ikuVal = currentItem.capaianIKU || 88.0;
    const baseSerapan = isSafe ? 88 : isWarning ? 81 : 73;

    return months.map((month, idx) => {
      const progressRatio = (idx + 1) / 12;
      const isPastOrCurrent = idx <= 7;

      const sisaTerbuka = isPastOrCurrent
        ? Math.max(1, Math.round(openT * (1.2 - progressRatio * 0.35) + Math.sin(idx * 1.5) * 1.5))
        : Math.max(0, Math.round(openT * (0.8 - (idx - 7) * 0.15)));

      const baseSelesai = Math.round((resolvedT / 8) * (idx <= 7 ? idx + 0.8 : 8));
      const sisaSelesai = Math.min(totalT, Math.max(1, baseSelesai + Math.round(idx * 0.5)));

      const ikuMonthly = Number(
        (ikuVal - 3.5 + Math.sin(idx * 0.6) * 2.5 + progressRatio * 3.2).toFixed(1)
      );

      const budgetProgression = Number(
        Math.min(100, Math.max(8, (baseSerapan * (progressRatio * 1.1) + Math.sin(idx * 0.4) * 2))).toFixed(1)
      );

      return {
        bulan: month,
        temuanTerbuka: sisaTerbuka,
        temuanSelesai: sisaSelesai,
        capaianIKU: Math.min(100, Math.max(55, ikuMonthly)),
        serapanAnggaran: budgetProgression,
      };
    });
  }, [currentItem, isSafe, isWarning]);

  // Heatmap Matrix Data (5 Domains x 4 Quarters) sesuai Atensi & TLHP
  const heatmapData = useMemo(() => {
    const domains = isPolsek ? [
      { name: 'Pelayanan SPKT & Respon Aduan 110', short: 'SPKT' },
      { name: 'Kamtibmas & Dana Bhabinkamtibmas', short: 'Bhabin' },
      { name: 'Disiplin & Etika Personel Polsek', short: 'Disiplin' },
      { name: 'Kesiapan Ranmor & Senpi Dinas', short: 'Sarpras' },
      { name: 'Kepatuhan Pelaporan & Respon', short: 'Kepatuhan' },
    ] : isPolres ? [
      { name: 'Pengelolaan DIPA & Akuntabilitas Anggaran', short: 'DIPA' },
      { name: 'Operasional Reskrim, Lantas & Sabhara', short: 'Opsnal' },
      { name: 'Pembinaan SDM, Propam & Disiplin', short: 'SDM' },
      { name: 'Sarpras, Gudang Senpi & Logistik Aset', short: 'Sarpras' },
      { name: 'Penyelesaian Temuan Pengawasan (TL)', short: 'Tindak Lanjut' },
    ] : [
      { name: 'Pengelolaan Keuangan & DIPA Satker', short: 'Garkeu' },
      { name: 'Operasional & Rencana Pengamanan Pam', short: 'Opsnal' },
      { name: 'SDM, Mutasi & Etika Profesi Personel', short: 'SDM' },
      { name: 'Logistik, Pengadaan & Sarpras Aset', short: 'Sarpras' },
      { name: 'Penyelesaian Temuan (TL) Itwasum/Itwasda', short: 'Tindak Lanjut' },
    ];

    const quarters = ['TW I', 'TW II', 'TW III', 'TW IV'];
    const baseOffset = atensiInfo.def.key === 'sangat_tinggi' ? -18 : atensiInfo.def.key === 'tinggi' ? -11 : atensiInfo.def.key === 'sedang' ? -5 : 6;

    return domains.map((domain, dIdx) => {
      const scores = quarters.map((q, qIdx) => {
        let score = 88 + baseOffset + Math.sin(dIdx * 2.1 + qIdx * 1.3) * 7.5 + qIdx * 2.2;
        score = Math.min(99, Math.max(52, Math.round(score)));
        const colorInfo = getQuarterlyHeatmapColor(score);

        let status: 'kritis' | 'tinggi' | 'perhatian' | 'aman' = 'aman';
        if (score < 70) status = 'kritis';
        else if (score < 80) status = 'tinggi';
        else if (score < 90) status = 'perhatian';

        return {
          quarter: q,
          score,
          status,
          colorInfo
        };
      });

      return {
        domainName: domain.name,
        short: domain.short,
        scores
      };
    });
  }, [isPolsek, isPolres, atensiInfo]);

  // Generated Specific Findings for Satker
  const findingsList = useMemo(() => {
    if (isPolda && polda?.rincianTemuan && polda.rincianTemuan.length > 0) {
      return polda.rincianTemuan;
    }

    if (isPolsek) {
      return [
        {
          id: `f-${satkerId}-1`,
          kode: `TM-SEK-${satkerSingkatan.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)}-01`,
          judul: 'Penatausahaan Buku Register SPKT & Berita Acara Penerimaan Laporan',
          kategori: 'Pelayanan Publik',
          tingkat: isCritical ? 'Kritis' : 'Sedang',
          status: 'Proses TL',
          nilaiRupiah: 'N/A'
        },
        {
          id: `f-${satkerId}-2`,
          kode: `TM-SEK-${satkerSingkatan.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)}-02`,
          judul: 'Laporan Pertanggungjawaban Dukungan Operasional Bhabinkamtibmas',
          kategori: 'Keuangan',
          tingkat: isWarning ? 'Sedang' : 'Ringan',
          status: 'Menunggu Verifikasi',
          nilaiRupiah: 'Rp 42.500.000'
        },
        {
          id: `f-${satkerId}-3`,
          kode: `TM-SEK-${satkerSingkatan.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)}-03`,
          judul: 'Pemeriksaan Rutin Kesiapan Ranmor Roda 2/4 Patroli & Kebersihan Senpi',
          kategori: 'Logistik/Sarpras',
          tingkat: 'Sedang',
          status: 'Dalam Pengerjaan',
          nilaiRupiah: 'N/A'
        }
      ];
    }

    // Default Polres / Polrestabes findings
    return [
      {
        id: `f-${satkerId}-1`,
        kode: `TM-RES-${satkerSingkatan.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)}-01`,
        judul: 'Akuntabilitas Pertanggungjawaban BBM Dinas dan Pelumas Ranmor Patroli',
        kategori: 'Keuangan/DIPA',
        tingkat: isCritical ? 'Kritis' : 'Sedang',
        status: 'Proses Tindak Lanjut',
        nilaiRupiah: 'Rp 148.000.000'
      },
      {
        id: `f-${satkerId}-2`,
        kode: `TM-RES-${satkerSingkatan.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)}-02`,
        judul: 'Standar Waktu Tanggap (Quick Response) Pelayanan Pengaduan 110 & SPKT',
        kategori: 'Operasional',
        tingkat: isWarning ? 'Sedang' : 'Ringan',
        status: 'Menunggu Validasi Kasiwas',
        nilaiRupiah: 'N/A'
      },
      {
        id: `f-${satkerId}-3`,
        kode: `TM-RES-${satkerSingkatan.replace(/[^a-zA-Z0-9]/g, '').slice(0, 4)}-03`,
        judul: 'Pengamanan Fisik Gudang Senjata Api dan Pemutakhiran Kartu Inventaris Barang (KIB)',
        kategori: 'Sarpras Logistik',
        tingkat: isCritical ? 'Kritis' : 'Sedang',
        status: 'Proses TL',
        nilaiRupiah: 'Rp 85.000.000'
      }
    ];
  }, [polda, isPolsek, satkerId, satkerSingkatan, isCritical, isWarning]);

  // Status Badge terstandarisasi Status Atensi & Progres TLHP (Itwasum Polri)
  const statusBadge = (
    <div className="flex items-center gap-1.5 flex-wrap">
      <span className={`app-badge ${atensiInfo.badgeBg} ${atensiInfo.badgeText} shadow-xs`}>
        <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
        <span>{atensiInfo.statusAtensiShort}</span>
      </span>
      <span className="app-metric px-2 py-0.5 rounded text-[10px] font-bold bg-white/15 text-amber-200 border border-white/20">
        Skor Risiko: <strong>{atensiInfo.score}/25</strong> ({atensiInfo.def.label})
      </span>
      <span className="app-metric px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-400/30">
        TLHP: <strong>{atensiInfo.persenTLHP}% Selesai</strong>
      </span>
    </div>
  );

  return (
    <div 
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 md:p-6 bg-slate-950/70 backdrop-blur-xs overflow-y-auto"
      onClick={onClose}
    >
      {/* Centered Modal Card Container */}
      <div 
        id="satker-detail-modal"
        onClick={(e) => e.stopPropagation()}
        className="relative w-full max-w-2xl lg:max-w-3xl max-h-[90vh] bg-white rounded-2xl sm:rounded-3xl shadow-2xl border border-slate-200/90 flex flex-col overflow-hidden animate-in fade-in zoom-in-95 duration-200"
      >
        {/* Panel Header */}
        <div className="p-4 sm:p-5 bg-gradient-to-r from-slate-900 via-[#0B2B5C] to-slate-900 text-white flex flex-col gap-3 shrink-0">
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-3 min-w-0">
              <div className={`w-12 h-12 sm:w-14 sm:h-14 rounded-2xl bg-white/10 p-1.5 flex items-center justify-center border-2 ${atensiInfo.borderClass} ring-2 ${atensiInfo.ringClass} shadow-inner overflow-hidden shrink-0`}>
                {wikiLogoUrl ? (
                  <img 
                    src={wikiLogoUrl} 
                    alt={satkerSingkatan} 
                    className="w-full h-full object-contain filter drop-shadow-xs" 
                    referrerPolicy="no-referrer"
                    onError={(e) => {
                      (e.target as HTMLElement).style.display = 'none';
                    }}
                  />
                ) : (
                  <PoldaLogo 
                    poldaId={parentPoldaId || satkerId} 
                    poldaSingkatan={satkerSingkatan} 
                    poldaNama={satkerNama} 
                    size="lg"
                  />
                )}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-2 mb-1 flex-wrap">
                  <span className="px-2 py-0.5 rounded text-[10px] font-black uppercase tracking-wider bg-amber-400 text-slate-950 shadow-2xs">
                    Tingkat {satkerTingkat}
                  </span>
                  {parentPoldaNama && satkerTingkat !== 'Polda' && (
                    <span className="text-[10px] text-blue-200 font-semibold truncate">
                      Induk: {parentPoldaNama}
                    </span>
                  )}
                </div>
                <h2 className="text-base sm:text-xl font-extrabold text-white tracking-tight leading-snug truncate">
                  {satkerNama}
                </h2>
                <p className="text-xs text-blue-200 italic mt-0.5 truncate">
                  "{motto}"
                </p>
              </div>
            </div>

            <button
              id="detail-modal-close-btn"
              onClick={onClose}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition flex-shrink-0 cursor-pointer"
              aria-label="Tutup Dialog"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Status & Leaders Info */}
          <div className="flex items-center justify-between gap-2 pt-2 border-t border-blue-800/60 flex-wrap">
            {statusBadge}
            <div className="text-[11px] text-blue-200 text-right">
              {pimpinanJabatan}: <strong className="text-white">{pimpinanNama.split(',')[0]}</strong>
            </div>
          </div>
        </div>

        {/* 3 Main Big KPI Blocks */}
        <div className="p-3 sm:p-4 bg-slate-50 border-b border-slate-200 grid grid-cols-3 gap-2.5 sm:gap-3 text-center shrink-0">
          
          <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Temuan Terbuka
            </span>
            <span className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight mt-0.5 block ${
              currentItem.temuanTerbuka > 0 ? (isCritical ? 'text-red-900' : isTinggi ? 'text-rose-600' : 'text-amber-600') : 'text-emerald-600'
            }`}>
              {currentItem.temuanTerbuka}
            </span>
            <span className="text-[10px] text-slate-500 font-bold block truncate">
              dari {currentItem.totalTemuan} temuan
            </span>
          </div>

          <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Capaian IKU
            </span>
            <span className={`text-xl sm:text-2xl lg:text-3xl font-black tracking-tight mt-0.5 block ${
              currentItem.capaianIKU >= 90 ? 'text-emerald-600' : 'text-amber-600'
            }`}>
              {currentItem.capaianIKU}%
            </span>
            <span className="text-[10px] text-slate-500 font-bold block truncate">
              Target 90.0%
            </span>
          </div>

          <div className="p-2.5 sm:p-3 bg-white rounded-xl border border-slate-200/90 shadow-2xs">
            <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block truncate">
              Dokumen Masuk
            </span>
            <span className="text-xl sm:text-2xl lg:text-3xl font-black text-[#0B2B5C] tracking-tight mt-0.5 block">
              {currentItem.dokumenTerkumpul}/{currentItem.totalDokumen}
            </span>
            <span className="text-[10px] text-slate-500 font-bold block truncate">
              Berkas Wajib
            </span>
          </div>

        </div>

        {/* Tab Navigation (Icon "Grafik & Heatmap" Dihapus sesuai permintaan user) */}
        <div className="px-4 sm:px-5 border-b border-slate-200 bg-white flex items-center gap-1 sm:gap-2 overflow-x-auto shrink-0 scrollbar-none">
          <button
            id="tab-ringkasan-satker"
            onClick={() => setActiveTab('ringkasan')}
            className={`min-h-[42px] px-3 font-bold text-xs sm:text-sm border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'ringkasan'
                ? 'border-[#0B2B5C] text-[#0B2B5C]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Ringkasan</span>
          </button>

          {/* TAB GRAFIK & HEATMAP - TANPA IKON */}
          <button
            id="tab-tren-heatmap-satker"
            onClick={() => setActiveTab('tren_heatmap')}
            className={`min-h-[42px] px-3 font-bold text-xs sm:text-sm border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'tren_heatmap'
                ? 'border-[#0B2B5C] text-[#0B2B5C]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Grafik & Heatmap</span>
          </button>

          <button
            id="tab-analisis-satker"
            onClick={() => setActiveTab('analisis')}
            className={`min-h-[42px] px-3 font-bold text-xs sm:text-sm border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'analisis'
                ? 'border-[#0B2B5C] text-[#0B2B5C]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>Analisis Risiko</span>
          </button>

          <button
            id="tab-satwil-satker"
            onClick={() => setActiveTab('satwil')}
            className={`min-h-[42px] px-3 font-bold text-xs sm:text-sm border-b-2 transition cursor-pointer whitespace-nowrap ${
              activeTab === 'satwil'
                ? 'border-[#0B2B5C] text-[#0B2B5C]'
                : 'border-transparent text-slate-500 hover:text-slate-900'
            }`}
          >
            <span>
              {satkerTingkat === 'Itwil' 
                ? 'Polda Pengawasan' 
                : satkerTingkat === 'Mabes' || satkerTingkat === 'Itwasum'
                  ? 'Satker Mabes & Itwil'
                  : isPolda && polda 
                    ? `Satwil (${polda.eProfil.totalPolres} Polres)` 
                    : isPolres 
                      ? 'Wilayah & Polsek' 
                      : 'Wilayah & Logo'}
            </span>
          </button>
        </div>

        {/* Scrollable Tab Content Area */}
        <div className="flex-1 p-4 sm:p-5 overflow-y-auto space-y-4">
          
          {activeTab === 'ringkasan' ? (
            <div className="space-y-4 animate-in fade-in">
              
              {/* Wilayah Hukum, Profil Pimpinan & Keterangan Status Atensi & TLHP */}
              <div className="p-3.5 sm:p-4 rounded-xl bg-slate-50 border border-slate-200 space-y-2.5 text-xs">
                <div className="flex items-center justify-between font-bold text-slate-800 flex-wrap gap-1">
                  <span className="flex items-center gap-1.5">
                    <MapPin className="w-4 h-4 text-[#0B2B5C]" />
                    <span>Wilayah Hukum Satuan:</span>
                  </span>
                  <span className="text-blue-700">{wilayahHukum}</span>
                </div>
                <div className="pt-2 border-t border-slate-200/80 flex items-center justify-between flex-wrap gap-1">
                  <span className="text-slate-500">Pimpinan Satuan:</span>
                  <strong className="text-slate-900">{pimpinanNama}</strong>
                </div>
                {satkerItem?.irwasdaOrKasiwas && (
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-slate-500">{isPolsek ? 'Kanit Propam/Siwas:' : isPolres ? 'Kasiwas Polres:' : 'Irwasda:'}</span>
                    <strong className="text-slate-900">{satkerItem.irwasdaOrKasiwas}</strong>
                  </div>
                )}
                {polda?.irwasda && !satkerItem?.irwasdaOrKasiwas && (
                  <div className="flex items-center justify-between flex-wrap gap-1">
                    <span className="text-slate-500">Irwasda / Pengawas:</span>
                    <strong className="text-slate-900">{polda.irwasda}</strong>
                  </div>
                )}

                {/* Keterangan Status Atensi & TLHP Terintegrasi */}
                <div className="pt-2.5 border-t border-slate-200/80 grid grid-cols-1 sm:grid-cols-2 gap-2 text-[11px]">
                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Status Atensi Pengawasan</span>
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2.5 h-2.5 rounded-full ${atensiInfo.badgeBg}`} />
                      <span className="font-extrabold text-xs" style={{ color: atensiInfo.hexCode }}>
                        {atensiInfo.statusAtensi}
                      </span>
                    </div>
                    <p className="text-[10.5px] text-slate-600 leading-snug">
                      Kategori {atensiInfo.def.label} (Rentang Skor: {atensiInfo.def.rentang})
                    </p>
                  </div>

                  <div className="p-2.5 rounded-xl bg-white border border-slate-200/90 shadow-2xs space-y-1">
                    <span className="text-slate-400 block font-bold text-[10px] uppercase tracking-wider">Progres TLHP &amp; Temuan</span>
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-xs text-emerald-700">
                        {atensiInfo.persenTLHP}% Selesai
                      </span>
                      <span className="text-[10px] font-bold text-slate-500">
                        {atensiInfo.statusTLHP}
                      </span>
                    </div>
                    <div className="w-full bg-slate-100 rounded-full h-1.5 overflow-hidden">
                      <div 
                        className="bg-emerald-600 h-full rounded-full transition-all"
                        style={{ width: `${atensiInfo.persenTLHP}%` }}
                      />
                    </div>
                    <p className="text-[10px] text-slate-500 leading-tight">
                      {currentItem.temuanSelesai || 0} rekomendasi diselesaikan dari {currentItem.totalTemuan || 0} ({currentItem.temuanTerbuka || 0} terbuka)
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Jump Card to Line Chart & Heatmap */}
              <div 
                onClick={() => setActiveTab('tren_heatmap')}
                className="p-3.5 rounded-xl bg-slate-50 hover:bg-blue-50/60 border border-slate-200 hover:border-blue-200 flex items-center justify-between cursor-pointer transition group shadow-2xs"
              >
                <div>
                  <h5 className="font-extrabold text-xs text-[#0B2B5C] group-hover:text-blue-900">
                    Buka Grafik Tren 12 Bulan & Heatmap Kepatuhan
                  </h5>
                  <p className="text-[11px] text-slate-600 mt-0.5">
                    Evaluasi komparatif temuan audit, capaian IKU, dan skor kepatuhan 4 triwulan.
                  </p>
                </div>
                <span className="text-xs font-bold text-[#0B2B5C] px-2.5 py-1 bg-white rounded-md border border-slate-200 shrink-0 ml-3">
                  Buka
                </span>
              </div>

              {/* Audit Berjalan Alert Box if active */}
              {currentItem.auditBerjalan && (
                <div className="p-3.5 sm:p-4 rounded-xl bg-blue-50 border border-blue-200">
                  <div className="flex items-center gap-2 font-extrabold text-xs sm:text-sm text-[#0B2B5C] mb-1">
                    <Clock className="w-4 h-4 text-amber-600" />
                    <span>Audit Kinerja Sedang Berlangsung</span>
                  </div>
                  <div className="text-xs text-slate-700 space-y-1 mt-2">
                    <div><strong>Nama Audit:</strong> {currentItem.namaAudit || (isPolsek ? 'Audit Kepatuhan Pelayanan Polsek T.A. 2026' : 'Audit Kinerja Tahap II T.A. 2026')}</div>
                    <div><strong>Tim Pengawas:</strong> {isPolsek ? 'Seksi Pengawasan (Siwas) Polres' : isPolres ? 'Itwasda Polda Jajaran' : 'Itwasum Mabes Polri'}</div>
                    <div><strong>Tenggat Waktu:</strong> 15 September 2026</div>
                  </div>
                </div>
              )}

              {/* Rincian Temuan Mini Table for Polda / Polres / Polsek */}
              <div>
                <div className="flex items-center justify-between mb-2">
                  <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                    Daftar Temuan Prioritas Satuan ({findingsList.length})
                  </h4>
                  <span className="text-xs text-slate-500 font-semibold">Tingkat {satkerTingkat}</span>
                </div>

                {findingsList.length > 0 ? (
                  <div className="border border-slate-200 rounded-xl overflow-hidden divide-y divide-slate-100 bg-white">
                    {findingsList.map((t) => (
                      <div key={t.id} className="min-h-[52px] p-3 hover:bg-slate-50 transition flex items-start justify-between gap-3">
                        <div className="min-w-0">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="font-bold text-xs text-slate-800">{t.kode}</span>
                            <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              t.tingkat === 'Kritis' ? 'bg-red-100 text-red-900' : 'bg-amber-100 text-amber-900'
                            }`}>
                              {t.tingkat}
                            </span>
                            <span className="text-[11px] text-slate-500 font-medium">({t.kategori})</span>
                          </div>
                          <p className="text-xs text-slate-700 mt-1 font-medium leading-snug">
                            {t.judul}
                          </p>
                          {t.nilaiRupiah && t.nilaiRupiah !== 'N/A' && (
                            <span className="text-xs font-bold text-red-700 block mt-0.5">
                              Nilai Temuan: {t.nilaiRupiah}
                            </span>
                          )}
                        </div>

                        <span className="text-[11px] font-bold px-2 py-1 rounded bg-slate-100 text-slate-700 whitespace-nowrap shrink-0">
                          {t.status}
                        </span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center rounded-xl bg-slate-50 border border-slate-200 text-xs text-slate-500">
                    <CheckCircle2 className="w-5 h-5 text-emerald-600 mx-auto mb-1" />
                    <span>Nihil temuan kritis terbuka pada satker ini.</span>
                  </div>
                )}
              </div>

            </div>
          ) : activeTab === 'tren_heatmap' ? (
            /* TAB 2: GRAFIK TREN (LINE CHART) & HEATMAP MATRIX - CLEAN UI WITHOUT DECORATIVE ICONS */
            <div className="space-y-4 animate-in fade-in">
              
              {/* Line Chart Section */}
              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                    Grafik Tren 12 Bulan ({satkerSingkatan})
                  </h4>

                  {/* Toggle Selector */}
                  <div className="flex items-center gap-1 bg-white p-0.5 rounded-lg border border-slate-200 text-[11px]">
                    <button
                      onClick={() => setActiveMetric('temuan')}
                      className={`px-2.5 py-1 font-bold rounded-md transition cursor-pointer ${
                        activeMetric === 'temuan'
                          ? 'bg-[#0B2B5C] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Temuan
                    </button>
                    <button
                      onClick={() => setActiveMetric('iku')}
                      className={`px-2.5 py-1 font-bold rounded-md transition cursor-pointer ${
                        activeMetric === 'iku'
                          ? 'bg-[#0B2B5C] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      IKU (%)
                    </button>
                    <button
                      onClick={() => setActiveMetric('anggaran')}
                      className={`px-2.5 py-1 font-bold rounded-md transition cursor-pointer ${
                        activeMetric === 'anggaran'
                          ? 'bg-[#0B2B5C] text-white shadow-2xs'
                          : 'text-slate-600 hover:text-slate-900'
                      }`}
                    >
                      Serapan
                    </button>
                  </div>
                </div>

                <div className="h-[210px] w-full bg-white rounded-xl p-2 border border-slate-200">
                  <ResponsiveContainer width="100%" height="100%">
                    {activeMetric === 'temuan' ? (
                      <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="bulan" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                        <YAxis tick={{ fill: '#64748b', fontSize: 10 }} />
                        <Tooltip />
                        <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px', paddingBottom: '4px' }} />
                        <Line
                          type="monotone"
                          dataKey="temuanTerbuka"
                          name="Terbuka"
                          stroke="#881337"
                          strokeWidth={2.2}
                          dot={{ r: 3, fill: '#881337' }}
                        />
                        <Line
                          type="monotone"
                          dataKey="temuanSelesai"
                          name="Selesai (TL)"
                          stroke="#059669"
                          strokeWidth={2.2}
                          dot={{ r: 3, fill: '#059669' }}
                        />
                      </LineChart>
                    ) : activeMetric === 'iku' ? (
                      <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="bulan" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                        <YAxis domain={[55, 100]} tick={{ fill: '#64748b', fontSize: 10 }} unit="%" />
                        <Tooltip />
                        <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px', paddingBottom: '4px' }} />
                        <ReferenceLine y={90} stroke="#881337" strokeDasharray="3 3" />
                        <Line
                          type="monotone"
                          dataKey="capaianIKU"
                          name="Capaian IKU"
                          stroke="#0B2B5C"
                          strokeWidth={2.5}
                          dot={{ r: 3, fill: '#0B2B5C' }}
                        />
                      </LineChart>
                    ) : (
                      <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                        <XAxis dataKey="bulan" tick={{ fill: '#475569', fontSize: 10, fontWeight: 600 }} />
                        <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 10 }} unit="%" />
                        <Tooltip />
                        <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '10px', paddingBottom: '4px' }} />
                        <Area
                          type="monotone"
                          dataKey="serapanAnggaran"
                          name="Realisasi DIPA"
                          stroke="#059669"
                          strokeWidth={2}
                          fill="#d1fae5"
                        />
                      </AreaChart>
                    )}
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Heatmap Section Terintegrasi Atensi & TLHP */}
              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 space-y-3">
                <div className="flex items-center justify-between gap-2 flex-wrap">
                  <div>
                    <h4 className="font-extrabold text-xs text-slate-900 uppercase tracking-wide">
                      Heatmap Kepatuhan Triwulan
                    </h4>
                    <p className="text-[10.5px] text-slate-500 mt-0.5">
                      Gradasi warna selaras dengan ambang batas kepatuhan pengawasan
                    </p>
                  </div>

                  {/* Legend Scale Terstandarisasi */}
                  <div className="flex items-center gap-1.5 text-[10px] font-bold flex-wrap">
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-emerald-600"></span>
                      <span className="text-slate-600">&ge;90% (Sangat Baik)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-amber-500"></span>
                      <span className="text-slate-600">80-89% (Baik)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-rose-500"></span>
                      <span className="text-slate-600">70-79% (Perhatian)</span>
                    </span>
                    <span className="flex items-center gap-1">
                      <span className="w-2.5 h-2.5 rounded bg-red-900"></span>
                      <span className="text-slate-600">&lt;70% (Kritis)</span>
                    </span>
                  </div>
                </div>

                <div className="bg-white rounded-xl p-3 border border-slate-200 space-y-2">
                  <div className="grid grid-cols-12 gap-1 text-[10px] font-bold uppercase text-slate-400 pb-1 border-b border-slate-200">
                    <div className="col-span-6">Bidang Pengawasan</div>
                    <div className="col-span-6 grid grid-cols-4 text-center">
                      <span>TW I</span>
                      <span>TW II</span>
                      <span>TW III</span>
                      <span>TW IV</span>
                    </div>
                  </div>

                  <div className="space-y-1.5">
                    {heatmapData.map((row, rIdx) => (
                      <div key={rIdx} className="grid grid-cols-12 gap-1 items-center">
                        <div className="col-span-6 text-xs font-semibold text-slate-700 truncate" title={row.domainName}>
                          {row.domainName}
                        </div>

                        <div className="col-span-6 grid grid-cols-4 gap-1">
                          {row.scores.map((cell, cIdx) => (
                            <div
                              key={cIdx}
                              onMouseEnter={() => setHoveredHeatmapCell({
                                domain: row.domainName,
                                period: cell.quarter,
                                score: cell.score,
                                status: cell.status,
                                label: cell.colorInfo.statusLabel
                              })}
                              onMouseLeave={() => setHoveredHeatmapCell(null)}
                              className={`h-7 rounded-lg flex items-center justify-center font-black text-[10px] transition-all cursor-pointer shadow-2xs ${cell.colorInfo.bgClass} ${cell.colorInfo.textClass}`}
                            >
                              {cell.score}%
                            </div>
                          ))}
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="h-6 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-100">
                    {hoveredHeatmapCell ? (
                      <span className="font-semibold text-slate-800 truncate">
                        {hoveredHeatmapCell.domain} ({hoveredHeatmapCell.period}): <strong className="text-[#0B2B5C]">{hoveredHeatmapCell.score}%</strong> &mdash; <span className="font-bold text-slate-700">{hoveredHeatmapCell.label}</span>
                      </span>
                    ) : (
                      <span className="text-slate-400 italic text-[10px]">
                        Arahkan kursor ke kotak heatmap untuk rincian skor bidang &amp; status evaluasi
                      </span>
                    )}
                  </div>
                </div>
              </div>

            </div>
          ) : activeTab === 'analisis' ? (
            /* TAB 3: ANALISIS LANJUTAN & REKOMENDASI */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200">
                <div className="font-extrabold text-xs sm:text-sm text-slate-900 mb-2">
                  Deteksi Anomali & Rekomendasi Pengawasan
                </div>
                <p className="text-xs text-slate-800 leading-relaxed font-medium">
                  {polda?.analisisLanjutan?.aiInsight || 
                    `Satker ${satkerNama} memiliki tren penyelesaian temuan positif dengan skor IKU ${currentItem.capaianIKU}%. Diperlukan akselerasi pada tindak lanjut dokumen pelaporan keuangan DIPA dan kepatuhan waktu pelayanan publik untuk mencapai predikat WBK/WBBM.`
                  }
                </p>
                <div className="mt-2 pt-2 border-t border-slate-200 flex items-center justify-between text-[11px] text-slate-600 font-semibold">
                  <span>Prediksi Kepatuhan:</span>
                  <span className="text-slate-900">{polda?.analisisLanjutan?.prediksiKepatuhan || (isSafe ? '95.2% (Tinggi)' : isTinggi ? '82.0% (Sedang)' : isWarning ? '87.4% (Moderat)' : '72.1% (Kritis)')}</span>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-white border border-slate-200 space-y-2">
                <h4 className="font-extrabold text-xs sm:text-sm text-slate-900">
                  Gap Analysis & Titik Rawan Pengawasan
                </h4>
                <ul className="space-y-1.5">
                  {(polda?.analisisLanjutan?.gapAnalysis || [
                    'Deviasi realisasi anggaran triwulan berjalan terhadap target RKA-KL',
                    'Kecepatan pengunggahan dokumen tindak lanjut LHP Siwas/Itwasum',
                    'Kepatuhan pencatatan barang inventaris dan sarana operasional dinas'
                  ]).map((gap, idx) => (
                    <li key={idx} className="text-xs text-slate-700 flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-slate-800 mt-1.5 flex-shrink-0" />
                      <span>{gap}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          ) : (
            /* TAB 4: JAJARAN SATWIL & LOGO */
            <div className="space-y-4 animate-in fade-in">
              <div className="p-3.5 sm:p-4 bg-slate-50 rounded-2xl border border-slate-200 flex items-center justify-between gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  {wikiLogoUrl ? (
                    <img 
                      src={wikiLogoUrl} 
                      alt={satkerSingkatan} 
                      className="w-10 h-10 object-contain drop-shadow-xs shrink-0" 
                      referrerPolicy="no-referrer"
                    />
                  ) : (
                    <PoldaLogo poldaId={parentPoldaId || satkerId} size="md" />
                  )}
                  <div className="min-w-0">
                    <h4 className="font-extrabold text-xs sm:text-sm text-slate-900 truncate">{satkerNama}</h4>
                    <p className="text-xs text-slate-500 truncate">Wilayah Hukum: {wilayahHukum}</p>
                  </div>
                </div>

                {onOpenLogoExplorer && (
                  <button
                    onClick={() => onOpenLogoExplorer(parentPoldaId || satkerId)}
                    className="px-3 py-2 bg-[#0B2B5C] hover:bg-blue-900 text-white rounded-xl text-xs font-bold shadow-xs flex items-center gap-1.5 transition cursor-pointer shrink-0"
                  >
                    <Search className="w-3.5 h-3.5 text-amber-400" />
                    <span>Katalog Logo</span>
                  </button>
                )}
              </div>

              {/* Jajaran Satker List */}
              <div className="space-y-3">
                <h5 className="font-extrabold text-xs uppercase tracking-wider text-slate-400">
                  {satkerTingkat === 'Itwil' 
                    ? `Daftar Polda di Bawah Pengawasan ${satkerSingkatan}:` 
                    : satkerTingkat === 'Mabes' || satkerTingkat === 'Itwasum'
                      ? 'Daftar Inspektorat Wilayah & Satker Mabes:'
                      : `Satker Terkait di Wilayah ${satkerSingkatan}:`}
                </h5>

                <div className="space-y-2.5">
                  {satkerTingkat === 'Itwil' ? (
                    (() => {
                      const itwilConfig = ITWIL_JURISDICTIONS.find(it => it.id === satkerId);
                      const poldaIds = itwilConfig?.poldaIds || [];
                      const poldas = ALL_COMBINED_SATKERS_DATA.filter(s => s.tingkat === 'Polda' && poldaIds.includes(s.id));
                      
                      return poldas.length > 0 ? (
                        poldas.map((sub) => (
                          <div key={sub.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                            <div className="flex items-center gap-3 min-w-0">
                              <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                                {sub.wikiLogoUrl ? (
                                  <img src={sub.wikiLogoUrl} alt={sub.singkatan} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                                ) : (
                                  <PoldaLogo poldaId={sub.id} size="xs" />
                                )}
                              </div>
                              <div className="min-w-0">
                                <div className="flex items-center gap-1.5">
                                  <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-800">
                                    Polda
                                  </span>
                                  <span className="text-[10px] text-slate-500 font-semibold truncate">{sub.ibukota}</span>
                                </div>
                                <h6 className="font-bold text-xs text-slate-900 truncate">{sub.nama}</h6>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              <span className="text-[10px] font-bold text-slate-600">IKU: {sub.capaianIKU}%</span>
                              <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                sub.status === 'kritis' ? 'bg-red-900 text-white' :
                                sub.status === 'tinggi' ? 'bg-rose-500 text-white' :
                                sub.status === 'perhatian' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                              }`}>
                                {sub.status}
                              </span>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="p-3 bg-slate-50 rounded-xl text-xs text-slate-500 text-center font-medium">
                          {itwilConfig?.deskripsi || 'Melakukan audit investigasi dan penjaminan mutu lintas wilayah.'}
                        </div>
                      );
                    })()
                  ) : (
                    ALL_COMBINED_SATKERS_DATA.filter(s => s.parentPoldaId === (parentPoldaId || satkerId) && s.id !== satkerId).slice(0, 8).map((sub) => (
                      <div key={sub.id} className="p-3 bg-white rounded-xl border border-slate-200 shadow-2xs flex items-center justify-between gap-3">
                        <div className="flex items-center gap-3 min-w-0">
                          <div className="w-8 h-8 rounded-lg bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                            {sub.wikiLogoUrl ? (
                              <img src={sub.wikiLogoUrl} alt={sub.singkatan} className="w-full h-full object-contain" referrerPolicy="no-referrer" />
                            ) : (
                              <PoldaLogo poldaId={sub.id} size="xs" />
                            )}
                          </div>
                          <div className="min-w-0">
                            <div className="flex items-center gap-1.5">
                              <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-slate-100 text-slate-800">
                                {sub.tingkat}
                              </span>
                              <span className="text-[10px] text-slate-500 font-semibold truncate">{sub.ibukota}</span>
                            </div>
                            <h6 className="font-bold text-xs text-slate-900 truncate">{sub.nama}</h6>
                          </div>
                        </div>

                        <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          sub.status === 'kritis' ? 'bg-red-900 text-white' :
                          sub.status === 'tinggi' ? 'bg-rose-500 text-white' :
                          sub.status === 'perhatian' ? 'bg-amber-500 text-white' : 'bg-emerald-600 text-white'
                        }`}>
                          {sub.status}
                        </span>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </div>
          )}

        </div>

        {/* Action Button at Bottom */}
        <div className="p-3.5 sm:p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5 shrink-0">
          <button
            onClick={onClose}
            className="min-h-[42px] px-4 py-2 rounded-xl bg-white hover:bg-slate-100 text-slate-700 font-bold text-xs sm:text-sm border border-slate-200 transition cursor-pointer"
          >
            Tutup
          </button>
          <button
            id="btn-lihat-detail-modul"
            onClick={() => {
              onClose();
              onNavigateToModule('pengawasan', parentPoldaId || satkerId);
            }}
            className="min-h-[42px] px-4 sm:px-5 py-2 rounded-xl bg-[#0B2B5C] hover:bg-blue-900 text-white font-bold text-xs sm:text-sm shadow-sm flex items-center justify-center gap-2 transition cursor-pointer"
          >
            <span>Buka di Modul Pengawasan</span>
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

      </div>

    </div>
  );
};

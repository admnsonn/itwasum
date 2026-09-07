import React, { useState, useMemo } from 'react';
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
import { 
  TrendingUp, 
  Grid3X3, 
  ChevronRight,
  ShieldAlert,
  ShieldCheck,
  AlertTriangle,
  Building,
  Landmark,
  Shield,
  MapPin,
  Award,
  Sparkles
} from 'lucide-react';
import { PoldaSatker, MainNavId, SatkerMapItem } from '../types';
import { PoldaLogo } from './PoldaLogo';
import { getSatkerAtensiTLHP, getQuarterlyHeatmapColor, MATRIKS_RENTANG_RISIKO } from '../utils/riskRatingUtils';

interface SatkerTrendHeatmapProps {
  poldaList: PoldaSatker[];
  selectedPoldaId: string | null;
  selectedSatkerItem?: SatkerMapItem | null;
  onSelectPolda: (id: string | null) => void;
  onSelectSatkerItem?: (item: SatkerMapItem) => void;
  onNavigateToModule?: (module: MainNavId, targetPoldaId?: string) => void;
  onOpenDetailDrawer?: () => void;
}

type ChartMetric = 'temuan' | 'iku' | 'anggaran';

export const SatkerTrendHeatmap: React.FC<SatkerTrendHeatmapProps> = ({
  poldaList,
  selectedPoldaId,
  selectedSatkerItem,
  onSelectPolda,
  onOpenDetailDrawer
}) => {
  // If a specific generic Satker (Polres, Polsek, Polda) is selected from the map, prioritize it
  const activeSatker = useMemo(() => {
    if (selectedSatkerItem) {
      return {
        id: selectedSatkerItem.id,
        nama: selectedSatkerItem.nama,
        singkatan: selectedSatkerItem.singkatan,
        tingkat: selectedSatkerItem.tingkat,
        parentPoldaNama: selectedSatkerItem.parentPoldaNama,
        parentPoldaId: selectedSatkerItem.parentPoldaId,
        pulau: selectedSatkerItem.pulau,
        ibukota: selectedSatkerItem.ibukota,
        status: selectedSatkerItem.status,
        temuanTerbuka: selectedSatkerItem.temuanTerbuka,
        temuanSelesai: selectedSatkerItem.temuanSelesai,
        totalTemuan: selectedSatkerItem.totalTemuan,
        capaianIKU: selectedSatkerItem.capaianIKU,
        targetIKU: selectedSatkerItem.targetIKU || 90.0,
        dokumenTerkumpul: selectedSatkerItem.dokumenTerkumpul,
        totalDokumen: selectedSatkerItem.totalDokumen,
        auditBerjalan: selectedSatkerItem.auditBerjalan,
        pimpinanNama: selectedSatkerItem.pimpinanNama,
        pimpinanJabatan: selectedSatkerItem.pimpinanJabatan,
        wikiLogoUrl: selectedSatkerItem.wikiLogoUrl,
        wilayahHukum: selectedSatkerItem.wilayahHukum,
        motto: selectedSatkerItem.motto || 'Tri Brata & Catur Prasetya'
      };
    }

    if (selectedPoldaId) {
      const found = poldaList.find(p => p.id === selectedPoldaId);
      if (found) {
        return {
          id: found.id,
          nama: found.nama,
          singkatan: found.singkatan,
          tingkat: 'Polda' as const,
          parentPoldaNama: found.nama,
          parentPoldaId: found.id,
          pulau: found.pulau,
          ibukota: found.ibukota,
          status: found.status,
          temuanTerbuka: found.temuanTerbuka,
          temuanSelesai: found.temuanSelesai,
          totalTemuan: found.totalTemuan,
          capaianIKU: found.capaianIKU,
          targetIKU: found.targetIKU || 90.0,
          dokumenTerkumpul: found.dokumenTerkumpul,
          totalDokumen: found.totalDokumen,
          auditBerjalan: found.auditBerjalan,
          pimpinanNama: found.kapolda,
          pimpinanJabatan: 'Kapolda',
          wikiLogoUrl: '',
          wilayahHukum: `Provinsi ${found.singkatan}`,
          motto: 'Tri Brata'
        };
      }
    }

    const fallback = poldaList.find(p => p.id === 'polda-metro') || poldaList[0];
    return fallback ? {
      id: fallback.id,
      nama: fallback.nama,
      singkatan: fallback.singkatan,
      tingkat: 'Polda' as const,
      parentPoldaNama: fallback.nama,
      parentPoldaId: fallback.id,
      pulau: fallback.pulau,
      ibukota: fallback.ibukota,
      status: fallback.status,
      temuanTerbuka: fallback.temuanTerbuka,
      temuanSelesai: fallback.temuanSelesai,
      totalTemuan: fallback.totalTemuan,
      capaianIKU: fallback.capaianIKU,
      targetIKU: fallback.targetIKU || 90.0,
      dokumenTerkumpul: fallback.dokumenTerkumpul,
      totalDokumen: fallback.totalDokumen,
      auditBerjalan: fallback.auditBerjalan,
      pimpinanNama: fallback.kapolda,
      pimpinanJabatan: 'Kapolda',
      wikiLogoUrl: '',
      wilayahHukum: `Provinsi ${fallback.singkatan}`,
      motto: 'Tri Brata'
    } : null;
  }, [selectedSatkerItem, selectedPoldaId, poldaList]);

  const [activeMetric, setActiveMetric] = useState<ChartMetric>('temuan');
  const [hoveredCell, setHoveredCell] = useState<{
    domain: string;
    period: string;
    score: number;
    status: 'aman' | 'perhatian' | 'tinggi' | 'kritis';
    label?: string;
  } | null>(null);

  // Status Atensi & Progres TLHP terstandarisasi Itwasum Polri
  const atensiInfo = useMemo(() => activeSatker ? getSatkerAtensiTLHP(activeSatker) : null, [activeSatker]);

  // Generate 12-month data points for Line Chart tailored to this Satker
  const trendData = useMemo(() => {
    if (!activeSatker) return [];
    
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Agu', 'Sep', 'Okt', 'Nov', 'Des'];
    const totalT = activeSatker.totalTemuan || 20;
    const openT = activeSatker.temuanTerbuka || 5;
    const resolvedT = activeSatker.temuanSelesai || (totalT - openT);
    const ikuVal = activeSatker.capaianIKU || 89.0;
    const baseSerapan = activeSatker.status === 'aman' ? 88 : activeSatker.status === 'perhatian' ? 82 : activeSatker.status === 'tinggi' ? 76 : 70;

    return months.map((month, idx) => {
      const progressRatio = (idx + 1) / 12;
      const isPastOrCurrent = idx <= 7; // Up to August (current year period)

      // Temuan terbuka menurun seiring tindak lanjut
      const sisaTerbuka = isPastOrCurrent
        ? Math.max(1, Math.round(openT * (1.2 - progressRatio * 0.35) + Math.sin(idx * 1.5) * 1.5))
        : Math.max(0, Math.round(openT * (0.8 - (idx - 7) * 0.15)));

      // Temuan selesai meningkat
      const baseSelesai = Math.round((resolvedT / 8) * (idx <= 7 ? idx + 0.8 : 8));
      const sisaSelesai = Math.min(totalT, Math.max(1, baseSelesai + Math.round(idx * 0.5)));

      // Capaian IKU bulanan
      const ikuMonthly = Number(
        (ikuVal - 3.5 + Math.sin(idx * 0.6) * 2.5 + progressRatio * 3.2).toFixed(1)
      );

      // Realisasi Anggaran DIPA bulanan
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
  }, [activeSatker]);

  // Standardized 4-Quarter Domain Heatmap Data: Operasional, SDM, Sarpras, and Garkeu
  const heatmapData = useMemo(() => {
    if (!activeSatker) return [];

    // The 4 core standardized Polri supervision domains requested in canonical order
    const domains = [
      { name: 'Operasional', label: 'Operasional (Opsnal)', desc: 'Giat Operasi, Kamtibmas & Pelayanan Publik' },
      { name: 'SDM', label: 'SDM (Personel)', desc: 'Pembinaan Karir, Mutasi & Disiplin Personel' },
      { name: 'Sarpras', label: 'Sarpras (Logistik)', desc: 'Sarana Prasarana, Ranmor Dinas & Senpi' },
      { name: 'Garkeu', label: 'Garkeu (Anggaran)', desc: 'Akuntabilitas DIPA & Realisasi Keuangan' },
    ];

    const quarters = ['TW I', 'TW II', 'TW III', 'TW IV'];
    const baseOffset = atensiInfo?.def.key === 'sangat_tinggi' 
      ? -18 
      : atensiInfo?.def.key === 'tinggi' 
        ? -11 
        : atensiInfo?.def.key === 'sedang' 
          ? -5 
          : 6;

    return domains.map((domain, dIdx) => {
      const scores = quarters.map((q, qIdx) => {
        let score = 88 + baseOffset + Math.sin(dIdx * 2.1 + qIdx * 1.3) * 7.5 + qIdx * 2.2;
        score = Math.min(99, Math.max(52, Math.round(score)));
        const colorInfo = getQuarterlyHeatmapColor(score);

        let status: 'aman' | 'perhatian' | 'tinggi' | 'kritis' = 'aman';
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
        label: domain.label,
        desc: domain.desc,
        scores
      };
    });
  }, [activeSatker, atensiInfo]);

  if (!activeSatker) return null;

  const isPolsek = activeSatker.tingkat === 'Polsek';
  const isPolres = activeSatker.tingkat === 'Polres' || activeSatker.tingkat === 'Polrestabes' || activeSatker.tingkat === 'Polresta';
  const isPolda = activeSatker.tingkat === 'Polda';

  const tierBadge = isPolda ? (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
      Tingkat POLDA
    </span>
  ) : isPolres ? (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
      Tingkat {activeSatker.tingkat.toUpperCase()}
    </span>
  ) : (
    <span className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase bg-slate-100 text-slate-800 border border-slate-200">
      Tingkat POLSEK
    </span>
  );

  return (
    <div id="satker-analytics-dashboard" className="bg-white rounded-2xl p-4 sm:p-5 border border-slate-200/90 shadow-sm space-y-4 animate-in fade-in duration-300">
      
      {/* SIMPLIFIED HEADER: Dynamic Satker Identification & Status for Polda/Polres/Polsek */}
      <div className="flex items-start sm:items-center justify-between gap-3 pb-3 border-b border-slate-100 flex-col sm:flex-row">
        <div className="flex items-center gap-3 min-w-0">
          <div className={`w-12 h-12 rounded-2xl bg-slate-50 p-1 flex items-center justify-center shrink-0 shadow-xs border-2 ${atensiInfo?.borderClass || 'border-slate-200'} ring-2 ${atensiInfo?.ringClass || 'ring-transparent'}`}>
            {activeSatker.wikiLogoUrl ? (
              <img 
                src={activeSatker.wikiLogoUrl} 
                alt={activeSatker.singkatan} 
                className="w-full h-full object-contain filter drop-shadow-2xs" 
                referrerPolicy="no-referrer"
              />
            ) : (
              <PoldaLogo
                poldaId={activeSatker.parentPoldaId || activeSatker.id}
                poldaNama={activeSatker.nama}
                size="sm"
                preferScrapedImage={true}
              />
            )}
          </div>

          <div className="min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              {tierBadge}
              <h3 className="text-base font-black text-slate-900 truncate">
                {activeSatker.nama}
              </h3>
              <span className={`px-2.5 py-1 rounded-md text-[11px] font-black uppercase tracking-wider ${atensiInfo?.badgeBg || 'bg-slate-900'} ${atensiInfo?.badgeText || 'text-white'} flex items-center gap-1.5 shadow-2xs`}>
                <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
                <span>{atensiInfo?.statusAtensiShort || activeSatker.status}</span>
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                Skor: <strong>{atensiInfo?.score}/25</strong> ({atensiInfo?.def.label})
              </span>
              <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-50 text-emerald-700 border border-emerald-200">
                TLHP: <strong>{atensiInfo?.persenTLHP}% Selesai</strong>
              </span>
            </div>

            <p className="text-xs text-slate-500 truncate mt-1 flex items-center gap-1.5 flex-wrap">
              <span>{activeSatker.pimpinanJabatan}: <strong className="text-slate-700">{activeSatker.pimpinanNama.split(',')[0]}</strong></span>
              <span>•</span>
              <span>Wilayah: <strong className="text-blue-900">{activeSatker.ibukota}</strong> ({activeSatker.pulau})</span>
              {!isPolda && activeSatker.parentPoldaNama && (
                <>
                  <span>•</span>
                  <span>Induk: <strong className="text-slate-700">{activeSatker.parentPoldaNama}</strong></span>
                </>
              )}
              <span>•</span>
              <span className="font-semibold text-slate-700">
                Atensi: <strong style={{ color: atensiInfo?.hexCode }}>{atensiInfo?.statusAtensi}</strong> ({atensiInfo?.statusTLHP})
              </span>
            </p>
          </div>
        </div>

        {/* Action Button & Key Numbers */}
        <div className="flex items-center gap-3 w-full sm:w-auto justify-between sm:justify-end pt-2 sm:pt-0 border-t sm:border-t-0 border-slate-100">
          <div className="text-left sm:text-right text-xs">
            <span className="text-slate-400 block text-[10px] uppercase font-bold">Temuan Terbuka</span>
            <span className="font-extrabold text-slate-900 text-sm">
              <span className={activeSatker.temuanTerbuka > 0 ? 'text-rose-600' : 'text-emerald-600'}>
                {activeSatker.temuanTerbuka}
              </span> / {activeSatker.totalTemuan} temuan
            </span>
          </div>

          {onOpenDetailDrawer && (
            <button
              onClick={onOpenDetailDrawer}
              className="px-3.5 py-2 bg-[#0B2B5C] hover:bg-blue-900 text-white text-xs font-bold rounded-xl flex items-center gap-1.5 transition shrink-0 cursor-pointer shadow-xs"
            >
              <span>Detail Lengkap</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* CORE CONTENT: 2 FOCUSED COLUMNS (LINE CHART & HEATMAP) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-5 items-start">
        
        {/* 1. LINE CHART (60% width on Desktop) */}
        <div className="lg:col-span-7 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                Grafik Tren 12 Bulan ({activeSatker.singkatan})
              </h4>
            </div>

            {/* Metric Toggle Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-lg text-[11px]">
              <button
                onClick={() => setActiveMetric('temuan')}
                className={`px-2.5 py-1 font-bold rounded-md transition cursor-pointer ${
                  activeMetric === 'temuan'
                    ? 'bg-[#0B2B5C] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Temuan (Open vs TL)
              </button>
              <button
                onClick={() => setActiveMetric('iku')}
                className={`px-2.5 py-1 font-bold rounded-md transition cursor-pointer ${
                  activeMetric === 'iku'
                    ? 'bg-[#0B2B5C] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Capaian IKU (%)
              </button>
              <button
                onClick={() => setActiveMetric('anggaran')}
                className={`px-2.5 py-1 font-bold rounded-md transition cursor-pointer ${
                  activeMetric === 'anggaran'
                    ? 'bg-[#0B2B5C] text-white shadow-2xs'
                    : 'text-slate-600 hover:text-slate-900'
                }`}
              >
                Serapan DIPA
              </button>
            </div>
          </div>

          {/* Clean Line Chart Canvas */}
          <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3 border border-slate-200/80">
            <div className="h-[230px] w-full">
              <ResponsiveContainer width="100%" height="100%">
                {activeMetric === 'temuan' ? (
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis 
                      dataKey="bulan" 
                      tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <YAxis 
                      tick={{ fill: '#64748b', fontSize: 11 }}
                      axisLine={{ stroke: '#cbd5e1' }}
                    />
                    <Tooltip content={<CleanTooltip metric="temuan" satkerNama={activeSatker.singkatan} />} />
                    <Legend 
                      verticalAlign="top" 
                      align="right" 
                      wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temuanTerbuka"
                      name="Temuan Terbuka"
                      stroke="#e11d48"
                      strokeWidth={2.2}
                      dot={{ r: 3.5, fill: '#e11d48', strokeWidth: 1.5, stroke: '#ffffff' }}
                      activeDot={{ r: 5 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="temuanSelesai"
                      name="Selesai (Tindak Lanjut)"
                      stroke="#059669"
                      strokeWidth={2.2}
                      dot={{ r: 3.5, fill: '#059669', strokeWidth: 1.5, stroke: '#ffffff' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                ) : activeMetric === 'iku' ? (
                  <LineChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="bulan" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                    <YAxis domain={[55, 100]} tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                    <Tooltip content={<CleanTooltip metric="iku" satkerNama={activeSatker.singkatan} />} />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }} />
                    <ReferenceLine 
                      y={activeSatker.targetIKU || 90} 
                      stroke="#e11d48" 
                      strokeDasharray="3 3" 
                      label={{ value: 'Target 90%', position: 'insideTopRight', fill: '#e11d48', fontSize: 10, fontWeight: 700 }}
                    />
                    <Line
                      type="monotone"
                      dataKey="capaianIKU"
                      name="Capaian IKU"
                      stroke="#0B2B5C"
                      strokeWidth={2.5}
                      dot={{ r: 3.5, fill: '#0B2B5C', strokeWidth: 1.5, stroke: '#ffffff' }}
                      activeDot={{ r: 5 }}
                    />
                  </LineChart>
                ) : (
                  <AreaChart data={trendData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <defs>
                      <linearGradient id="colorSerapanSimpel" x1="0" y1="0" x2="0" y2="1">
                        <stop offset="5%" stopColor="#059669" stopOpacity={0.3}/>
                        <stop offset="95%" stopColor="#059669" stopOpacity={0.0}/>
                      </linearGradient>
                    </defs>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
                    <XAxis dataKey="bulan" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} />
                    <YAxis domain={[0, 100]} tick={{ fill: '#64748b', fontSize: 11 }} unit="%" />
                    <Tooltip content={<CleanTooltip metric="anggaran" satkerNama={activeSatker.singkatan} />} />
                    <Legend verticalAlign="top" align="right" wrapperStyle={{ fontSize: '11px', paddingBottom: '6px' }} />
                    <Area
                      type="monotone"
                      dataKey="serapanAnggaran"
                      name="Realisasi DIPA/Anggaran"
                      stroke="#059669"
                      strokeWidth={2.2}
                      fillOpacity={1}
                      fill="url(#colorSerapanSimpel)"
                    />
                  </AreaChart>
                )}
              </ResponsiveContainer>
            </div>
          </div>
        </div>

        {/* 2. HEATMAP (40% width on Desktop) */}
        <div className="lg:col-span-5 space-y-2.5">
          <div className="flex items-center justify-between gap-2 flex-wrap">
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-xs text-slate-800 uppercase tracking-wide">
                Heatmap Kepatuhan Triwulan
              </h4>
            </div>

            {/* Scale indicator based on Itwasum TLHP / Tingkat Risiko categories */}
            <div className="flex items-center gap-2 text-[10px] font-bold flex-wrap">
              {[
                95, // >=90
                85, // 80-89
                72, // 65-79
                57, // 50-64
                30  // <50
              ].map((sample) => {
                const info = getQuarterlyHeatmapColor(sample);
                return (
                  <div key={sample} className="flex items-center gap-1">
                    <span className="w-2.5 h-2.5 rounded" style={{ backgroundColor: info.hexCode }} />
                    <span className="text-slate-600 mr-1">{info.atensiBadge}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Clean Heatmap Matrix */}
          <div className="bg-slate-50/80 rounded-xl p-2.5 sm:p-3 border border-slate-200/80 space-y-2">
            
            {/* Heatmap Column Headers */}
            <div className="grid grid-cols-12 gap-1 text-[10px] font-bold uppercase text-slate-400 pb-1 border-b border-slate-200">
              <div className="col-span-6">Bidang Pengawasan</div>
              <div className="col-span-6 grid grid-cols-4 text-center">
                <span>TW I</span>
                <span>TW II</span>
                <span>TW III</span>
                <span>TW IV</span>
              </div>
            </div>

            {/* Heatmap Rows */}
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
                        onMouseEnter={() => setHoveredCell({
                          domain: row.domainName,
                          period: cell.quarter,
                          score: cell.score,
                          status: cell.status,
                          label: cell.colorInfo.atensiBadge
                        })}
                        onMouseLeave={() => setHoveredCell(null)}
                        className={`h-8 rounded-lg flex items-center justify-center font-black text-[11px] transition-all cursor-pointer shadow-2xs ${cell.colorInfo.bgClass} ${cell.colorInfo.textClass}`}
                        title={`${row.domainName} • ${cell.quarter} • ${cell.colorInfo.statusLabel}`}
                      >
                        {cell.score}%
                      </div>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Hover Tooltip display */}
            <div className="h-6 flex items-center justify-between text-[11px] text-slate-500 pt-1 border-t border-slate-200/60">
              {hoveredCell ? (
                <span className="font-semibold text-slate-800 truncate">
                  {hoveredCell.domain} ({hoveredCell.period}): <strong className="text-[#0B2B5C]">{hoveredCell.score}%</strong> &mdash; <span className="font-bold text-slate-700">{hoveredCell.label}</span>
                </span>
              ) : (
                <span className="text-slate-400 italic">
                  Arahkan kursor ke kotak heatmap untuk rincian skor bidang &amp; status evaluasi
                </span>
              )}
            </div>

          </div>
        </div>

      </div>

    </div>
  );
};

// Simplified Clean Tooltip for Chart
const CleanTooltip: React.FC<{ active?: boolean; payload?: any[]; label?: string; metric: ChartMetric; satkerNama?: string }> = ({
  active,
  payload,
  label,
  metric,
  satkerNama
}) => {
  if (!active || !payload || !payload.length) return null;

  return (
    <div className="bg-slate-900 text-white px-2.5 py-2 rounded-lg shadow-lg border border-slate-700 text-xs space-y-1 z-50">
      <div className="font-bold text-amber-400 text-[11px] border-b border-slate-700 pb-0.5 flex items-center justify-between gap-3">
        <span>Bulan {label}</span>
        {satkerNama && <span className="text-slate-400 font-normal text-[10px]">{satkerNama}</span>}
      </div>
      {payload.map((entry, idx) => (
        <div key={idx} className="flex items-center justify-between gap-3 text-[11px]">
          <span style={{ color: entry.color }}>{entry.name}:</span>
          <strong className="text-white font-mono">
            {entry.value} {metric === 'temuan' ? 'kasus' : '%'}
          </strong>
        </div>
      ))}
    </div>
  );
};

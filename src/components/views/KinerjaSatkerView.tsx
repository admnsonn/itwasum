/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.7 IKU Satker — Dashboard IKU Nasional (filter Tahun/Periode, AI summary, KPI Overall/SSI/
 * SS1/SS2/#Warning/#Critical, heatmap Leaflet, Early Warning) + Dashboard Detail Polda
 * (Ringkasan, AI insight, target vs realisasi per IKU, tren & gap, monitoring Polres).
 * Restyled mengikuti Figma "Dashboard Pencapaian IKU Satker Itwasum" (3178:19289) &
 * "Dashboard Pencapaian IKU Polda Jawa Barat" (3330:13762) — lihat `figma/README.md` (Plan
 * "Align itwasum with Figma", todo `iku`). Tab Irsus/E-Profil/RBS lama tetap dihapus (Plane
 * "strip_contradict", todo p5-b7 sebelumnya).
 */
import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Legend,
  LineChart,
  Line,
} from 'recharts';
import { ArrowLeft, Building2, CheckCircle2, MapPin, Sparkles, TrendingUp } from 'lucide-react';
import { CurrentUserProfile, PoldaSatker } from '../../types';
import { PoldaLogo } from '../PoldaLogo';
import { getRoleScopedPoldas } from '../../utils/roleScope';
import { createSeededRng } from '../../utils/seededRandom';
import { IndonesiaMap } from '../IndonesiaMap';
import { ALL_COMBINED_SATKERS_DATA } from '../../data/allSatkersData';
import { Badge, Button, Card, CircularProgress, Select, Typography } from '../ui/atoms';
import { BreadcrumbPill, EmptyState, PageHeaderCard, StatCard, Table, type TableColumn } from '../ui/molecules';

interface KinerjaSatkerViewProps {
  poldaList: PoldaSatker[];
  currentUser?: CurrentUserProfile;
}

type EarlyWarningStatus = 'Target Tercapai' | 'Warning' | 'Critical';

/** Cutoff sesuai "Assumption" plan p5-b7: >=100% target = Tercapai; 85-99% = Warning; <85% =
 * Critical — dihitung dari rasio capaian/target, bukan nilai capaian mentah. */
function earlyWarningStatus(p: PoldaSatker): EarlyWarningStatus {
  const ratio = p.targetIKU > 0 ? (p.capaianIKU / p.targetIKU) * 100 : 0;
  if (ratio >= 100) return 'Target Tercapai';
  if (ratio >= 85) return 'Warning';
  return 'Critical';
}

const EW_COLOR: Record<EarlyWarningStatus, 'success' | 'warning' | 'danger'> = {
  'Target Tercapai': 'success',
  Warning: 'warning',
  Critical: 'danger',
};

/** Pembagian regional sebagai proksi SS1/SS2 (Sasaran Strategis) — definisi resmi tidak ada
 * pada FSD yang tersedia; interpretasi proporsional untuk demo. */
const SS1_PULAU = ['Sumatera', 'Jawa', 'Kalimantan'];
const SS2_PULAU = ['Sulawesi', 'Bali-Nusa', 'Maluku-Papua'];

const IKU_INDIKATOR_LIST = ['Penyelesaian Perkara', 'Indeks Kepuasan Masyarakat', 'Harkamtibmas', 'Kamtibmas', 'Respons Panggilan Darurat'];

export const KinerjaSatkerView: React.FC<KinerjaSatkerViewProps> = ({ poldaList, currentUser }) => {
  const scopedPoldaList = useMemo(() => getRoleScopedPoldas(poldaList, currentUser), [poldaList, currentUser]);
  const [selectedPoldaId, setSelectedPoldaId] = useState<string | null>(null);
  const [mapStatusFilter, setMapStatusFilter] = useState<'all' | 'perhatian' | 'audit'>('all');

  const selectedPolda = scopedPoldaList.find((p) => p.id === selectedPoldaId);

  if (selectedPolda) {
    return <DashboardDetailPolda polda={selectedPolda} poldaList={scopedPoldaList} onBack={() => setSelectedPoldaId(null)} onSelectPolda={setSelectedPoldaId} />;
  }

  return (
    <DashboardIkuNasional
      poldaList={scopedPoldaList}
      currentUser={currentUser}
      onSelectPolda={setSelectedPoldaId}
      mapStatusFilter={mapStatusFilter}
      setMapStatusFilter={setMapStatusFilter}
    />
  );
};

/* ============================================================================================ *
 * Dashboard IKU Nasional
 * ============================================================================================ */
const TAHUN_OPTIONS = ['2024', '2025', '2026'].map((y) => ({ value: y, label: `Tahun ${y}` }));
const PERIODE_OPTIONS = ['Triwulan I', 'Triwulan II', 'Triwulan III', 'Triwulan IV', 'Tahunan'].map((p) => ({ value: p, label: p }));

const DashboardIkuNasional: React.FC<{
  poldaList: PoldaSatker[];
  currentUser?: CurrentUserProfile;
  onSelectPolda: (id: string | null) => void;
  mapStatusFilter: 'all' | 'perhatian' | 'audit';
  setMapStatusFilter: (f: 'all' | 'perhatian' | 'audit') => void;
}> = ({ poldaList, currentUser, onSelectPolda, mapStatusFilter, setMapStatusFilter }) => {
  const [tahun, setTahun] = useState('2026');
  const [periode, setPeriode] = useState('Triwulan III');
  const [appliedTahun, setAppliedTahun] = useState('2026');
  const [appliedPeriode, setAppliedPeriode] = useState('Triwulan III');

  const overall = poldaList.length ? Math.round((poldaList.reduce((s, p) => s + p.capaianIKU, 0) / poldaList.length) * 10) / 10 : 0;
  const ss1List = poldaList.filter((p) => SS1_PULAU.includes(p.pulau));
  const ss2List = poldaList.filter((p) => SS2_PULAU.includes(p.pulau));
  const ssi = ss1List.length ? Math.round((ss1List.reduce((s, p) => s + p.capaianIKU, 0) / ss1List.length) * 10) / 10 : 0;
  const ss2 = ss2List.length ? Math.round((ss2List.reduce((s, p) => s + p.capaianIKU, 0) / ss2List.length) * 10) / 10 : 0;
  const warningCount = poldaList.filter((p) => earlyWarningStatus(p) === 'Warning').length;
  const criticalCount = poldaList.filter((p) => earlyWarningStatus(p) === 'Critical').length;

  const earlyWarningRows = useMemo(() => {
    return [...poldaList]
      .map((p) => {
        const rng = createSeededRng(`ew-${p.id}`);
        const indikator = rng.pick(IKU_INDIKATOR_LIST);
        const gap = Math.round((p.capaianIKU - p.targetIKU) * 10) / 10;
        return { polda: p, indikator, gap };
      })
      .sort((a, b) => a.gap - b.gap);
  }, [poldaList]);

  const earlyWarningColumns: TableColumn<(typeof earlyWarningRows)[number]>[] = [
    { key: 'nama', header: 'Nama Polda', render: (r) => <div className="flex items-center gap-2"><PoldaLogo poldaId={r.polda.id} poldaNama={r.polda.nama} size="xs" /><span className="font-bold text-slate-800">{r.polda.nama}</span></div> },
    { key: 'iku', header: 'IKU', render: (r) => r.indikator },
    { key: 'target', header: 'Target', render: (r) => `${r.polda.targetIKU.toFixed(1)}%` },
    { key: 'realisasi', header: 'Realisasi', render: (r) => `${r.polda.capaianIKU.toFixed(1)}%` },
    { key: 'gap', header: 'Gap', render: (r) => <span className={r.gap < 0 ? 'text-rose-600 font-bold' : 'text-emerald-600 font-bold'}>{r.gap > 0 ? '+' : ''}{r.gap}%</span> },
    { key: 'status', header: 'Status', render: (r) => <Badge color={EW_COLOR[earlyWarningStatus(r.polda)]}>{earlyWarningStatus(r.polda)}</Badge> },
    { key: 'aksi', header: 'Aksi', render: (r) => <button onClick={() => onSelectPolda(r.polda.id)} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat Detail</button> },
  ];

  return (
    <div className="space-y-4">
      <BreadcrumbPill items={[{ label: 'IKU Satker' }]} />
      <PageHeaderCard
        title="Dashboard Pencapaian IKU Satker Itwasum"
        subtitle="Monitoring real-time capaian kinerja seluruh Polda"
        actions={
          <div className="flex items-end gap-2">
            <div className="w-36"><Select options={TAHUN_OPTIONS} value={tahun} onChange={setTahun} /></div>
            <div className="w-40"><Select options={PERIODE_OPTIONS} value={periode} onChange={setPeriode} /></div>
            <Button onClick={() => { setAppliedTahun(tahun); setAppliedPeriode(periode); }}>Tampilkan Hasil</Button>
          </div>
        }
      />
      <p className="text-[11px] text-slate-400 -mt-3">Menampilkan data {appliedPeriode} {appliedTahun}</p>

      {/* Ringkasan Analisis AI Temuan IKU */}
      <Card className="space-y-3" style={{ background: 'linear-gradient(135deg, var(--sd-primary) 0%, var(--sd-primary-container) 100%)' }}>
        <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-white" /><span className="text-xs font-bold uppercase tracking-wide text-white">Ringkasan Analisis AI Temuan IKU</span></div>
        <p className="text-sm text-white/90 leading-relaxed">
          Pencapaian IKU Nasional menunjukkan tren {overall >= 88 ? 'positif' : 'stagnan'} dengan skor keseluruhan {overall}%. Sebagian besar indikator strategis berada dalam jalur yang tepat menuju target periode.
        </p>
        <div className="flex flex-wrap gap-2">
          <span className="px-2.5 py-1 rounded-[8px] bg-white/15 text-[11px] font-bold text-white">Sasaran Strategis: SSI &amp; SS1 mendekati target nasional</span>
          <span className="px-2.5 py-1 rounded-[8px] bg-white/15 text-[11px] font-bold text-white">Status Satker: {criticalCount} Satker berstatus Critical</span>
          <span className="px-2.5 py-1 rounded-[8px] bg-white/15 text-[11px] font-bold text-white">Target nasional diproyeksikan tercapai apabila tren tetap stabil</span>
          <span className="px-2.5 py-1 rounded-[8px] bg-white/15 text-[11px] font-bold text-white">Rekomendasi Pimpinan: Tinjau kembali alokasi sumber daya untuk SS2 - Gakkum Polri</span>
        </div>
      </Card>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard label="Overall IKU" value={`${overall}%`} change={{ direction: 'up', label: '+2.4%' }} />
        <StatCard label="SSI - Kamtibmas" value={`${ssi}%`} change={{ direction: 'up', label: '+1.2%' }} />
        <StatCard label="SSI - Harkamtibmas" value={`${Math.round(((overall + ssi) / 2) * 10) / 10}%`} change={{ direction: 'up', label: '+0.8%' }} />
        <StatCard label="SS2 - Gakkum Polri" value={`${ss2}%`} change={{ direction: 'down', label: '-1.5%' }} />
        <StatCard label="Jumlah Warning" value={warningCount} footer={<span className="text-[11px] text-slate-400">Satker</span>} />
        <StatCard label="Jumlah Critical" value={criticalCount} change={{ direction: 'up', label: '+2%' }} footer={<span className="text-[11px] text-slate-400">Satker</span>} />
      </div>

      {/* Peta Sebaran Kinerja Nasional */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <MapPin className="w-4 h-4 text-[var(--sd-primary)]" />
            <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Peta Sebaran Kinerja Nasional</Typography>
          </div>
          <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-emerald-500" />Target Tercapai</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-amber-500" />Warning</span>
            <span className="flex items-center gap-1.5"><span className="w-2.5 h-2.5 rounded-full bg-rose-600" />Critical</span>
          </div>
        </div>
        <p className="text-xs text-slate-500">Menampilkan kondisi pencapaian Indikator Kinerja Utama (IKU) pada seluruh Polda di Indonesia. Klik marker untuk membuka Dashboard Detail Polda.</p>
        <div className="h-[420px] rounded-[12px] overflow-hidden border border-slate-200">
          <IndonesiaMap
            poldaList={poldaList}
            selectedPoldaId={null}
            onSelectPolda={(id) => onSelectPolda(id)}
            statusFilter={mapStatusFilter}
            setStatusFilter={setMapStatusFilter}
            currentUser={currentUser}
          />
        </div>
      </Card>

      {/* Early Warning */}
      <Card className="space-y-3">
        <div className="flex items-center justify-between">
          <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Early Warning</Typography>
          <button className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat Semua</button>
        </div>
        {earlyWarningRows.length === 0 ? (
          <EmptyState title="Tidak ada data Polda" />
        ) : (
          <Table columns={earlyWarningColumns} data={earlyWarningRows.slice(0, 10)} rowKey={(r) => r.polda.id} />
        )}
      </Card>
    </div>
  );
};

/* ============================================================================================ *
 * Dashboard Detail Polda
 * ============================================================================================ */
const DashboardDetailPolda: React.FC<{ polda: PoldaSatker; poldaList: PoldaSatker[]; onBack: () => void; onSelectPolda: (id: string) => void }> = ({ polda, poldaList, onBack, onSelectPolda }) => {
  const polresList = ALL_COMBINED_SATKERS_DATA.filter((s) => ['Polrestabes', 'Polresta', 'Polres'].includes(s.tingkat) && s.parentPoldaId === polda.id);
  const ewStatus = earlyWarningStatus(polda);
  const rng = useMemo(() => createSeededRng(`b7-detail-${polda.id}`), [polda.id]);

  const jumlahIkuTercapai = rng.int(4, 9);
  const jumlahIkuTerlambat = rng.int(0, 3);

  const targetRealisasiPerSs = ['SSI - Kamtibmas', 'SSI - Harkamtibmas', 'SS2 - Gakkum Polri'].map((label) => ({
    label,
    target: 100,
    realisasi: Math.round((polda.capaianIKU + rng.round(-6, 6, 1)) * 10) / 10,
  }));

  const trendData = ['Tw I', 'Tw II', 'Tw III', 'Tw IV'].map((periode, i) => ({
    periode,
    IKU: Math.max(50, Math.min(100, Math.round(polda.capaianIKU - (3 - i) * 1.8))),
    SSI: Math.max(50, Math.min(100, Math.round(polda.capaianIKU - (3 - i) * 1.2 + rng.round(-2, 2, 1)))),
    SS1: Math.max(50, Math.min(100, Math.round(polda.capaianIKU - (3 - i) * 0.9 + rng.round(-2, 2, 1)))),
    SS2: Math.max(50, Math.min(100, Math.round(polda.capaianIKU - (3 - i) * 2.4 + rng.round(-2, 2, 1)))),
  }));

  const monitoringPolres = polresList.slice(0, 10).map((s, i) => {
    const overallIku = Math.max(50, Math.min(100, Math.round(polda.capaianIKU + rng.round(-15, 10, 1))));
    const status: EarlyWarningStatus = overallIku >= 90 ? 'Target Tercapai' : overallIku >= 75 ? 'Warning' : 'Critical';
    return { rank: i + 1, nama: s.nama, overallIku, status };
  }).sort((a, b) => b.overallIku - a.overallIku).map((r, i) => ({ ...r, rank: i + 1 }));

  return (
    <div className="space-y-4">
      <BreadcrumbPill items={[{ label: 'IKU Satker' }, { label: polda.nama }]} onNavigate={(_item, index) => index === 0 && onBack()} />
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[var(--sd-primary)] hover:underline"><ArrowLeft className="w-3.5 h-3.5" />Kembali ke Dashboard Nasional</button>

      <PageHeaderCard
        title={`Dashboard Pencapaian IKU ${polda.nama}`}
        subtitle="Pemantauan Kinerja dan Realisasi Indikator Kinerja Terkini"
        actions={
          <div className="flex items-center gap-2">
            <PoldaLogo poldaId={polda.id} poldaSingkatan={polda.singkatan} poldaNama={polda.nama} size="md" />
            <Badge color={EW_COLOR[ewStatus]}>{ewStatus}</Badge>
          </div>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Capaian Kinerja" value={`${polda.capaianIKU.toFixed(1)}%`} />
        <StatCard label="Target Periode" value={`${polda.targetIKU.toFixed(1)}%`} />
        <StatCard label="Realisasi Program" value={`${Math.round((polda.capaianIKU * 0.92) * 10) / 10}%`} />
        <StatCard label="Status Kinerja" value={ewStatus} />
      </div>

      <div className="grid grid-cols-3 gap-3">
        <StatCard label="Jumlah IKU" value={jumlahIkuTercapai + jumlahIkuTerlambat} />
        <StatCard label="IKU Tercapai" value={jumlahIkuTercapai} footer={<Badge color="success">Sesuai target</Badge>} />
        <StatCard label="IKU Terlambat" value={jumlahIkuTerlambat} footer={<Badge color="warning">Perlu perhatian</Badge>} />
      </div>

      {/* AI Insight */}
      <Card className="space-y-2.5">
        <div className="flex items-center gap-2"><Sparkles className="w-4 h-4 text-[var(--sd-primary)]" /><Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">AI Insight</Typography></div>
        <div className="grid sm:grid-cols-2 gap-2.5 text-xs">
          <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100"><div className="text-[10px] font-bold uppercase text-slate-400">Analisis Umum</div><p className="text-slate-700 mt-1">{polda.analisisLanjutan.aiInsight}</p></div>
          <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100"><div className="text-[10px] font-bold uppercase text-slate-400">Forecast Pencapaian</div><p className="text-slate-700 mt-1">Diproyeksikan {ewStatus === 'Target Tercapai' ? 'tetap' : 'membaik'} pada akhir T.A. berjalan berdasarkan tren 4 triwulan terakhir.</p></div>
          <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100"><div className="text-[10px] font-bold uppercase text-slate-400">Deteksi Anomali</div><p className="text-slate-700 mt-1">{jumlahIkuTerlambat > 0 ? `${jumlahIkuTerlambat} indikator menunjukkan deviasi signifikan dari baseline nasional.` : 'Tidak ada anomali signifikan terdeteksi pada periode ini.'}</p></div>
          <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100"><div className="text-[10px] font-bold uppercase text-slate-400">Early Warning</div><p className="text-slate-700 mt-1"><Badge color={EW_COLOR[ewStatus]}>{ewStatus}</Badge></p></div>
        </div>
        <div className="flex items-center justify-end"><CircularProgress value={rng.int(85, 98)} size={56} strokeWidth={5} displayValue={`${rng.int(85, 98)}%`} caption="AI Confidence" /></div>
      </Card>

      {/* Pencapaian IKU — grouped bar Target vs Realisasi */}
      <Card>
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 mb-3">Pencapaian IKU — Target vs Realisasi</Typography>
        <div className="h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={targetRealisasiPerSs} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="label" tick={{ fontSize: 10 }} />
              <YAxis domain={[0, 110]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Bar dataKey="target" name="Target (100%)" fill="#93C5FD" radius={[4, 4, 0, 0]} />
              <Bar dataKey="realisasi" name="Realisasi" fill="#002265" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Tren per triwulan */}
      <Card>
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 mb-3">Tren IKU / SSI / SS1 / SS2 per Triwulan</Typography>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="periode" tick={{ fontSize: 11 }} />
              <YAxis domain={[50, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Legend wrapperStyle={{ fontSize: 11 }} />
              <Line type="monotone" dataKey="IKU" stroke="#002265" strokeWidth={2} dot />
              <Line type="monotone" dataKey="SSI" stroke="#2D7A4A" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="SS1" stroke="#D97706" strokeWidth={2} dot={false} />
              <Line type="monotone" dataKey="SS2" stroke="#BA1A1A" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      {/* Gap Analisis + Rekomendasi Strategis AI */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 mb-2">Gap Analisis</Typography>
          <ul className="space-y-2 text-xs">
            {targetRealisasiPerSs.map((s) => (
              <li key={s.label} className="flex items-center justify-between gap-3">
                <span className="text-slate-600">{s.label}</span>
                <span className={`font-bold ${s.realisasi < s.target ? 'text-rose-600' : 'text-emerald-600'}`}>{Math.round((s.realisasi - s.target) * 10) / 10}%</span>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 mb-2 flex items-center gap-1.5"><TrendingUp className="w-3.5 h-3.5" />Rekomendasi Strategis AI</Typography>
          <ul className="space-y-1.5">
            {polda.analisisLanjutan.rekomendasiStrategis.slice(0, 3).map((r, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-2"><span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />{r}</li>
            ))}
          </ul>
        </Card>
      </div>

      {/* Sumber Data Analisis */}
      <Card>
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 mb-2">Sumber Data Analisis</Typography>
        <div className="grid sm:grid-cols-3 gap-2 text-xs">
          {['E-HP Robinopsis', 'SIPP GAKKUM', 'Dors Logistik'].map((sumber) => (
            <div key={sumber} className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-100 flex items-center justify-between"><span className="font-bold text-slate-700">{sumber}</span><Badge color="success">Sinkron</Badge></div>
          ))}
        </div>
      </Card>

      {/* Monitoring IKU Polres */}
      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Monitoring IKU Polres</Typography>
        </div>
        {monitoringPolres.length === 0 ? (
          <EmptyState title="Tidak ada data Polres jajaran" />
        ) : (
          <Table
            columns={[
              { key: 'rank', header: 'Ranking', render: (r) => <span className="font-mono text-slate-400">{r.rank}</span> },
              { key: 'nama', header: 'Nama Polres', render: (r) => <span className="font-bold text-slate-800">{r.nama}</span> },
              { key: 'overall', header: 'Overall IKU', render: (r) => `${r.overallIku}%` },
              { key: 'persentase', header: 'Persentase', render: (r) => `${r.overallIku}%` },
              { key: 'status', header: 'Status', render: (r) => <Badge color={EW_COLOR[r.status]}>{r.status}</Badge> },
            ]}
            data={monitoringPolres}
            rowKey={(r) => r.nama}
          />
        )}
      </Card>

      <Card>
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 mb-2">Polda Lain dengan Status Serupa</Typography>
        <div className="flex flex-wrap gap-2">
          {poldaList.filter((p) => p.id !== polda.id && earlyWarningStatus(p) === ewStatus).slice(0, 6).map((p) => (
            <button key={p.id} onClick={() => onSelectPolda(p.id)} className="px-2.5 py-1.5 rounded-[8px] bg-slate-50 border border-slate-200 text-xs font-bold text-slate-700 hover:bg-slate-100 flex items-center gap-1.5">
              <CheckCircle2 className="w-3 h-3 text-slate-400" />{p.singkatan}
            </button>
          ))}
        </div>
      </Card>
    </div>
  );
};

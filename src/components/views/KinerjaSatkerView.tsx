/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.7 IKU Satker — Dashboard IKU Nasional (filter Tahun/Periode, AI summary, KPI Overall/SSI/
 * SS1/SS2/#Warning/#Critical, heatmap Leaflet, Early Warning) + Dashboard Detail Polda
 * (Ringkasan, AI insight, target vs realisasi per IKU, tren & gap, monitoring Polres). Tab
 * Irsus/E-Profil/RBS lama dihapus karena kini dimiliki B.2/B.3, B.1, dan RBS Matrix B.1 (Plan
 * "Align itwasum with Plane BA/SA", todo p5-b7 — keputusan "strip_contradict").
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
  ReferenceLine,
  Cell,
  LineChart,
  Line,
} from 'recharts';
import { ArrowLeft, Building2, CheckCircle2, ChevronDown, ChevronUp, Map as MapIcon, ShieldAlert, Sparkles } from 'lucide-react';
import { CurrentUserProfile, PoldaSatker } from '../../types';
import { PoldaLogo } from '../PoldaLogo';
import { getRoleScopedPoldas } from '../../utils/roleScope';
import { IndonesiaMap } from '../IndonesiaMap';
import { ALL_COMBINED_SATKERS_DATA } from '../../data/allSatkersData';
import { Badge, Button, Card, CircularProgress, Select, Typography } from '../ui/atoms';
import { EmptyState, StatCard, Table, type TableColumn } from '../ui/molecules';

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

/** Pembagian regional Barat/Timur sebagai proksi SS1/SS2 (Sasaran Strategis 1/2) — definisi
 * resmi tidak ada pada FSD yang tersedia; interpretasi proporsional untuk demo. */
const SS1_PULAU = ['Sumatera', 'Jawa', 'Kalimantan'];
const SS2_PULAU = ['Sulawesi', 'Bali-Nusa', 'Maluku-Papua'];

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
      selectedPoldaId={selectedPoldaId}
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
  selectedPoldaId: string | null;
  onSelectPolda: (id: string | null) => void;
  mapStatusFilter: 'all' | 'perhatian' | 'audit';
  setMapStatusFilter: (f: 'all' | 'perhatian' | 'audit') => void;
}> = ({ poldaList, currentUser, onSelectPolda, mapStatusFilter, setMapStatusFilter }) => {
  const [tahun, setTahun] = useState('2026');
  const [periode, setPeriode] = useState('Triwulan III');
  const [appliedTahun, setAppliedTahun] = useState('2026');
  const [appliedPeriode, setAppliedPeriode] = useState('Triwulan III');
  const [selectedPulau, setSelectedPulau] = useState<string>('Semua');
  const [showAdvancedAnalysis, setShowAdvancedAnalysis] = useState(false);

  const filteredPolda = selectedPulau === 'Semua' ? poldaList : poldaList.filter((p) => p.pulau === selectedPulau);
  const chartData = filteredPolda.map((p) => ({ name: p.singkatan, fullName: p.nama, capaian: p.capaianIKU, target: p.targetIKU, status: p.status }));

  const overall = poldaList.length ? Math.round((poldaList.reduce((s, p) => s + p.capaianIKU, 0) / poldaList.length) * 10) / 10 : 0;
  const ss1List = poldaList.filter((p) => SS1_PULAU.includes(p.pulau));
  const ss2List = poldaList.filter((p) => SS2_PULAU.includes(p.pulau));
  const ss1 = ss1List.length ? Math.round((ss1List.reduce((s, p) => s + p.capaianIKU, 0) / ss1List.length) * 10) / 10 : 0;
  const ss2 = ss2List.length ? Math.round((ss2List.reduce((s, p) => s + p.capaianIKU, 0) / ss2List.length) * 10) / 10 : 0;
  const warningCount = poldaList.filter((p) => earlyWarningStatus(p) === 'Warning').length;
  const criticalCount = poldaList.filter((p) => earlyWarningStatus(p) === 'Critical').length;

  const earlyWarningColumns: TableColumn<PoldaSatker>[] = [
    { key: 'nama', header: 'Polda', render: (p) => <div className="flex items-center gap-2"><PoldaLogo poldaId={p.id} poldaNama={p.nama} size="xs" /><span className="font-bold text-slate-800">{p.nama}</span></div> },
    { key: 'capaian', header: 'Capaian IKU', render: (p) => `${p.capaianIKU}%` },
    { key: 'target', header: 'Target', render: (p) => `${p.targetIKU}%` },
    { key: 'rasio', header: 'Rasio Capaian/Target', render: (p) => `${Math.round((p.capaianIKU / p.targetIKU) * 1000) / 10}%` },
    { key: 'status', header: 'Status', render: (p) => <Badge color={EW_COLOR[earlyWarningStatus(p)]}>{earlyWarningStatus(p)}</Badge> },
    { key: 'aksi', header: 'Aksi', render: (p) => <button onClick={() => onSelectPolda(p.id)} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat Detail</button> },
  ];

  return (
    <div className="space-y-4">
      <Card className="flex flex-wrap items-end gap-3">
        <div className="w-40">
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Tahun</label>
          <Select options={TAHUN_OPTIONS} value={tahun} onChange={setTahun} />
        </div>
        <div className="w-44">
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Periode</label>
          <Select options={PERIODE_OPTIONS} value={periode} onChange={setPeriode} />
        </div>
        <Button onClick={() => { setAppliedTahun(tahun); setAppliedPeriode(periode); }}>Tampilkan</Button>
        <span className="text-[11px] text-slate-400 ml-auto">Menampilkan data {appliedPeriode} {appliedTahun}</span>
      </Card>

      <div className="rounded-[14px] p-5 text-white shadow-[0_4px_20px_rgba(0,34,101,0.25)] flex items-start gap-4" style={{ background: 'linear-gradient(135deg, var(--sd-primary) 0%, var(--sd-primary-container) 100%)' }}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1"><Sparkles className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wide">Ringkasan Analisis AI</span></div>
          <p className="text-sm text-white/90 leading-relaxed">
            Capaian IKU nasional periode {appliedPeriode} {appliedTahun} berada di {overall}%, {overall >= 90 ? 'memenuhi' : 'di bawah'} target 90%. Terdapat {warningCount} Polda berstatus Warning dan {criticalCount} Polda berstatus Critical yang memerlukan intervensi asistensi Itwasum segera.
          </p>
        </div>
        <CircularProgress value={overall} size={80} strokeWidth={6} caption="Overall" displayValue={`${overall}%`} />
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
        <StatCard label="Overall" value={`${overall}%`} />
        <StatCard label="SSI" value={`${overall}%`} />
        <StatCard label="SS1 (Barat)" value={`${ss1}%`} />
        <StatCard label="SS2 (Timur)" value={`${ss2}%`} />
        <StatCard label="# Warning" value={warningCount} />
        <StatCard label="# Critical" value={criticalCount} />
      </div>

      <Card className="space-y-4">
        <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
          <div>
            <h3 className="font-extrabold text-base text-slate-900 tracking-tight">Dashboard IKU Nasional — Perbandingan Capaian Indikator Kinerja Utama (IKU)</h3>
            <p className="text-xs text-slate-500 mt-0.5">Target Standar Mabes Polri: <strong>90.0%</strong> (Garis Putus-Putus Merah)</p>
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl">
            {['Semua', 'Sumatera', 'Jawa', 'Kalimantan', 'Sulawesi', 'Bali-Nusa', 'Maluku-Papua'].map((pulau) => (
              <button
                key={pulau}
                onClick={() => setSelectedPulau(pulau)}
                className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${selectedPulau === pulau ? 'bg-[#0B2B5C] text-white font-bold shadow-xs' : 'text-slate-600 hover:text-slate-900'}`}
              >
                {pulau}
              </button>
            ))}
          </div>
        </div>

        <div className="h-[360px] sm:h-[400px] w-full pt-2">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 20, right: 30, left: 0, bottom: 25 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="name" tick={{ fill: '#475569', fontSize: 11, fontWeight: 600 }} angle={-45} textAnchor="end" interval={0} />
              <YAxis domain={[60, 100]} tick={{ fill: '#475569', fontSize: 11 }} unit="%" />
              <Tooltip
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    const data = payload[0].payload;
                    return (
                      <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs">
                        <div className="font-bold text-sm text-amber-400">{data.fullName}</div>
                        <div className="mt-1 flex items-center justify-between gap-4"><span>Capaian IKU:</span><strong className="text-emerald-400 font-extrabold text-sm">{data.capaian}%</strong></div>
                        <div className="text-slate-400">Target Nasional: 90.0%</div>
                      </div>
                    );
                  }
                  return null;
                }}
              />
              <ReferenceLine y={90} stroke="#C93B3B" strokeDasharray="4 4" strokeWidth={2} label={{ value: 'Target 90%', fill: '#C93B3B', fontSize: 11, fontWeight: 'bold' }} />
              <Bar dataKey="capaian" radius={[6, 6, 0, 0]} onClick={(d: any) => { const p = poldaList.find((x) => x.singkatan === d.name); if (p) onSelectPolda(p.id); }} cursor="pointer">
                {chartData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.capaian >= 90 ? '#1E8E5A' : entry.capaian >= 85 ? '#D89A1F' : '#C93B3B'} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        </div>

        <div className="border border-slate-200 rounded-xl overflow-hidden">
          <button onClick={() => setShowAdvancedAnalysis(!showAdvancedAnalysis)} className="w-full min-h-[44px] px-4 py-3 bg-slate-50 hover:bg-slate-100 font-bold text-xs text-[#0B2B5C] flex items-center justify-between transition cursor-pointer">
            <span>Analisis Lanjutan & Rekomendasi Pengawasan</span>
            {showAdvancedAnalysis ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </button>
          {showAdvancedAnalysis && (
            <div className="p-4 bg-white space-y-3 border-t border-slate-200 text-xs">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div className="p-3.5 rounded-xl bg-amber-50/70 border border-amber-200 space-y-1.5">
                  <h4 className="font-bold text-[#0B2B5C] text-xs">Temuan Pola Anomali Nasional</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">Terdapat korelasi kuat antara keterlambatan pengunggahan dokumen pra-audit dengan rendahnya capaian IKU bidang Logistik dan Sarpras pada 5 satker wilayah timur.</p>
                </div>
                <div className="p-3.5 rounded-xl bg-blue-50/70 border border-blue-200 space-y-1.5">
                  <h4 className="font-bold text-[#0B2B5C] text-xs">Rekomendasi Kebijakan Itwasum</h4>
                  <p className="text-xs text-slate-700 leading-relaxed">Disarankan penerbitan Surat Edaran Irwasum terkait simplifikasi format pelaporan BMP dan asistensi terpadu pada Polda Tipe Papua dan Maluku.</p>
                </div>
              </div>
            </div>
          )}
        </div>
      </Card>

      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <MapIcon className="w-4 h-4 text-[var(--sd-primary)]" />
          <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Heatmap Capaian IKU per Polda</Typography>
        </div>
        <p className="text-xs text-slate-500">Klik marker Polda pada peta untuk membuka Dashboard Detail Polda.</p>
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

      <Card className="space-y-3">
        <div className="flex items-center gap-2">
          <ShieldAlert className="w-4 h-4 text-amber-500" />
          <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Early Warning</Typography>
        </div>
        {poldaList.length === 0 ? (
          <EmptyState title="Tidak ada data Polda" />
        ) : (
          <Table columns={earlyWarningColumns} data={[...poldaList].sort((a, b) => a.capaianIKU / a.targetIKU - b.capaianIKU / b.targetIKU)} rowKey={(p) => p.id} />
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
  const ratio = Math.round((polda.capaianIKU / polda.targetIKU) * 1000) / 10;
  const ewStatus = earlyWarningStatus(polda);

  const trendData = ['Tw I', 'Tw II', 'Tw III', 'Tw IV'].map((periode, i) => ({
    periode,
    capaian: Math.max(60, Math.min(100, Math.round(polda.capaianIKU - (3 - i) * 1.8))),
    target: polda.targetIKU,
  }));

  return (
    <div className="space-y-4">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[var(--sd-primary)] hover:underline"><ArrowLeft className="w-3.5 h-3.5" />Kembali ke Dashboard Nasional</button>

      <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <PoldaLogo poldaId={polda.id} poldaSingkatan={polda.singkatan} poldaNama={polda.nama} size="lg" />
        <div className="flex-1 min-w-0">
          <h1 className="text-lg font-black text-slate-900">{polda.nama}</h1>
          <p className="text-xs text-slate-500">Ibukota {polda.ibukota} • Wilayah {polda.pulau}</p>
        </div>
        <Badge color={EW_COLOR[ewStatus]} className="shrink-0">{ewStatus}</Badge>
      </Card>

      <div className="rounded-[14px] p-4 text-white flex items-start gap-3" style={{ background: 'linear-gradient(135deg, var(--sd-primary) 0%, var(--sd-primary-container) 100%)' }}>
        <Sparkles className="w-4 h-4 shrink-0 mt-0.5" />
        <p className="text-xs leading-relaxed text-white/90">{polda.analisisLanjutan.aiInsight}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Capaian IKU" value={`${polda.capaianIKU}%`} />
        <StatCard label="Target IKU" value={`${polda.targetIKU}%`} />
        <StatCard label="Rasio Capaian/Target" value={`${ratio}%`} />
        <StatCard label="Jumlah Polres Dipantau" value={polresList.length} />
      </div>

      <Card>
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 mb-3">Tren Capaian vs Target per Triwulan</Typography>
        <div className="h-56">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={trendData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
              <XAxis dataKey="periode" tick={{ fontSize: 11 }} />
              <YAxis domain={[60, 100]} tick={{ fontSize: 11 }} unit="%" />
              <Tooltip />
              <Line type="monotone" dataKey="capaian" stroke="#002265" strokeWidth={2} dot />
              <Line type="monotone" dataKey="target" stroke="#BA1A1A" strokeWidth={2} strokeDasharray="4 4" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Building2 className="w-4 h-4 text-slate-400" />
          <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Monitoring Polres Jajaran</Typography>
        </div>
        {polresList.length === 0 ? (
          <EmptyState title="Tidak ada data Polres jajaran" />
        ) : (
          <ul className="space-y-1.5">
            {polresList.slice(0, 12).map((s) => (
              <li key={s.id} className="flex items-center justify-between gap-3 p-2.5 rounded-[10px] bg-slate-50 border border-slate-100">
                <span className="text-xs font-bold text-slate-800">{s.nama}</span>
                <Badge color={(s.skorRisiko ?? 50) >= 70 ? 'danger' : (s.skorRisiko ?? 50) >= 50 ? 'warning' : 'success'}>Skor Risiko {s.skorRisiko ?? '—'}</Badge>
              </li>
            ))}
          </ul>
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

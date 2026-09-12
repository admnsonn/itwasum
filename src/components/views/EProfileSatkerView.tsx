/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Modul B.1 - E-Profile Satker (ditulis ulang, Plan bagian 5c). Landing (`#/b1`) mereplikasi
 * `origin/development:src/app/e-profile/page.tsx` (hero + filter + direktori kartu); Detail
 * (`#/b1/{idSatker}`) mereplikasi `.../e-profile/[idSatker]/page.tsx` (5 tab lengkap dengan AI
 * Summary, Kualitas Data, Skor Risiko radar, Temuan AI, Rekomendasi Audit, Sumber Data).
 * Direplikasi dengan tangan (bukan salinan file) dari repo referensi yang dibaca read-only via
 * `git show origin/development:<path>`; RBAC Polda lama (`getRoleScopedPoldas`) tetap dipakai.
 */
import React, { useMemo, useState } from 'react';
import {
  Search as SearchIcon,
  Sparkles,
  Building2,
  Users,
  Truck,
  Coins,
  ClipboardList,
  ChevronRight,
  Target,
  AlertTriangle,
  Lightbulb,
  LayoutGrid,
  List as ListIcon,
  ShieldCheck,
  Download,
} from 'lucide-react';
import { CurrentUserProfile, PoldaSatker, SatkerMabesItem, SatkerMapItem } from '../../types';
import { PoldaLogo } from '../PoldaLogo';
import { getRoleScopedPoldas } from '../../utils/roleScope';
import { MABES_SATKERS_DATA } from '../../data/mabesSatkerData';
import { ALL_COMBINED_SATKERS_DATA } from '../../data/allSatkersData';
import { createSeededRng } from '../../utils/seededRandom';
import {
  Badge,
  Breadcrumbs,
  Button,
  Card,
  CircularProgress,
  ProgressBar,
  RiskPriorityBadge,
  Select,
  Typography,
} from '../ui/atoms';
import { EmptyState, Search, SegmentedControl, TabNavigation, TabDef } from '../ui/molecules';
import { AiFindingsTable, AnalysisDataSources, AuditRecommendationSection, RingkasanAnalisisAi } from '../ui/eprofilMolecules';
import { HorizontalMetricChart, HorizontalMetricItem, SatkerRiskRadar } from '../ui/charts';
import { anchorFromPolda, anchorFromSatkerMabes, EProfilAnchor, EProfilDetail, getEProfilDetail } from '../../data/eprofil';

interface EProfileSatkerViewProps {
  poldaList: PoldaSatker[];
  currentUser?: CurrentUserProfile;
  subPath?: string;
  onSubPathChange?: (subPath?: string) => void;
}

export const EProfileSatkerView: React.FC<EProfileSatkerViewProps> = ({ poldaList, currentUser, subPath, onSubPathChange }) => {
  const navigate = onSubPathChange ?? (() => {});

  if (subPath) {
    return (
      <EProfileDetailScreen
        satkerId={subPath}
        poldaList={poldaList}
        currentUser={currentUser}
        onBack={() => navigate(undefined)}
      />
    );
  }
  return <EProfileLandingScreen poldaList={poldaList} currentUser={currentUser} onSelect={(id) => navigate(id)} />;
};

/* ============================================================================================ *
 * Landing (#/b1) — hero + filter + direktori kartu
 * ============================================================================================ */

type TingkatFilter = 'all' | 'mabes' | 'polda' | 'polres' | 'polsek';

const TINGKAT_FILTER_OPTIONS: { value: TingkatFilter; label: string }[] = [
  { value: 'all', label: 'Semua' },
  { value: 'mabes', label: 'Mabes POLRI' },
  { value: 'polda', label: 'Polda' },
  { value: 'polres', label: 'Polres' },
  { value: 'polsek', label: 'Polsek' },
];

interface DirectoryCardData {
  id: string;
  nama: string;
  singkatan: string;
  tingkatLabel: 'Mabes POLRI' | 'Polda' | 'Polres' | 'Polsek';
  lokasi: string;
  personil: number;
  riskScore: number;
  riskLevel: 'TINGGI' | 'SEDANG' | 'RENDAH';
}

function quickMetric(seedKey: string, min: number, max: number): number {
  return createSeededRng(`b1-directory-${seedKey}`).int(min, max);
}

const HERO_STATS = [
  { label: '54 POLDA', icon: Building2 },
  { label: '513 POLRES', icon: ShieldCheck },
  { label: '7.000+ POLSEK', icon: Target },
  { label: 'ALL TERINTEGRASI', icon: Sparkles },
];

const EProfileLandingScreen: React.FC<{
  poldaList: PoldaSatker[];
  currentUser?: CurrentUserProfile;
  onSelect: (id: string) => void;
}> = ({ poldaList, currentUser, onSelect }) => {
  const [search, setSearch] = useState('');
  const [tingkat, setTingkat] = useState<TingkatFilter>('all');
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid');
  const [visibleCount, setVisibleCount] = useState(6);

  const scopedPoldas = useMemo(() => getRoleScopedPoldas(poldaList, currentUser), [poldaList, currentUser]);
  const scopedPoldaIds = useMemo(() => new Set(scopedPoldas.map((p) => p.id)), [scopedPoldas]);

  const cards: DirectoryCardData[] = useMemo(() => {
    const poldaCards: DirectoryCardData[] = scopedPoldas.map((p) => ({
      id: p.id,
      nama: p.nama,
      singkatan: p.singkatan,
      tingkatLabel: 'Polda',
      lokasi: p.ibukota,
      personil: p.eProfil.sdmTotal,
      riskScore: p.analisisLanjutan.rbsScore,
      riskLevel: p.analisisLanjutan.rbsLevel.toUpperCase() as DirectoryCardData['riskLevel'],
    }));

    const mabesCards: DirectoryCardData[] = MABES_SATKERS_DATA.map((m) => ({
      id: m.id,
      nama: m.nama,
      singkatan: m.singkatan,
      tingkatLabel: 'Mabes POLRI',
      lokasi: 'Mabes Polri, Jakarta',
      personil: quickMetric(m.id, 500, 5200),
      riskScore: Math.round(m.skorRisiko),
      riskLevel: m.skorRisiko >= 70 ? 'TINGGI' : m.skorRisiko >= 50 ? 'SEDANG' : 'RENDAH',
    }));

    const polresCards: DirectoryCardData[] = ALL_COMBINED_SATKERS_DATA
      .filter((s) => ['Polrestabes', 'Polresta', 'Polres'].includes(s.tingkat) && scopedPoldaIds.has(s.parentPoldaId))
      .map((s) => ({
        id: s.id,
        nama: s.nama,
        singkatan: s.singkatan,
        tingkatLabel: 'Polres',
        lokasi: s.ibukota,
        personil: quickMetric(s.id, 250, 1600),
        riskScore: s.skorRisiko ?? quickMetric(`${s.id}-risk`, 35, 90),
        riskLevel: (s.skorRisiko ?? quickMetric(`${s.id}-risk`, 35, 90)) >= 70 ? 'TINGGI' : (s.skorRisiko ?? 50) >= 50 ? 'SEDANG' : 'RENDAH',
      }));

    const polsekCards: DirectoryCardData[] = ALL_COMBINED_SATKERS_DATA
      .filter((s) => s.tingkat === 'Polsek' && scopedPoldaIds.has(s.parentPoldaId))
      .map((s) => ({
        id: s.id,
        nama: s.nama,
        singkatan: s.singkatan,
        tingkatLabel: 'Polsek',
        lokasi: s.ibukota,
        personil: quickMetric(s.id, 20, 130),
        riskScore: s.skorRisiko ?? quickMetric(`${s.id}-risk`, 30, 85),
        riskLevel: (s.skorRisiko ?? quickMetric(`${s.id}-risk`, 30, 85)) >= 70 ? 'TINGGI' : (s.skorRisiko ?? 50) >= 50 ? 'SEDANG' : 'RENDAH',
      }));

    return [...mabesCards, ...poldaCards, ...polresCards, ...polsekCards];
  }, [scopedPoldas, scopedPoldaIds]);

  const filtered = useMemo(() => {
    const tingkatKeyMap: Record<TingkatFilter, DirectoryCardData['tingkatLabel'] | null> = {
      all: null,
      mabes: 'Mabes POLRI',
      polda: 'Polda',
      polres: 'Polres',
      polsek: 'Polsek',
    };
    const key = tingkatKeyMap[tingkat];
    return cards.filter((c) => {
      const matchTingkat = !key || c.tingkatLabel === key;
      const matchSearch = !search || c.nama.toLowerCase().includes(search.toLowerCase()) || c.singkatan.toLowerCase().includes(search.toLowerCase());
      return matchTingkat && matchSearch;
    });
  }, [cards, tingkat, search]);

  const visible = filtered.slice(0, visibleCount);

  return (
    <div className="space-y-5">
      {/* Hero */}
      <div
        className="rounded-[16px] p-6 sm:p-8 text-white shadow-[0_8px_30px_rgba(0,34,101,0.3)]"
        style={{ background: 'linear-gradient(135deg, var(--sd-primary) 0%, var(--sd-primary-container) 60%, #0c3fa0 100%)' }}
      >
        <div className="text-[11px] font-bold tracking-[0.2em] text-white/70 uppercase">Sistem Pengawasan Internal</div>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">E-Profil POLRI</h1>
        <p className="text-sm text-white/80 mt-1 max-w-xl">Platform Analisis Pra-Audit Berbasis Artificial Intelligence</p>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mt-5">
          {HERO_STATS.map((s) => (
            <div key={s.label} className="rounded-[12px] bg-white/10 px-3 py-2.5 flex items-center gap-2">
              <s.icon className="w-4 h-4 text-white/70 shrink-0" />
              <span className="text-xs font-bold">{s.label}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Filter card */}
      <Card className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
        <div className="flex-1">
          <Search value={search} onChange={setSearch} placeholder="Cari nama Satker atau Satwil..." />
        </div>
        <Button variant="primary" className="shrink-0"><SearchIcon className="w-4 h-4" />Cari</Button>
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xs font-bold text-slate-500 shrink-0">Filter Tingkat:</span>
          <SegmentedControl options={TINGKAT_FILTER_OPTIONS} value={tingkat} onChange={(v) => { setTingkat(v as TingkatFilter); setVisibleCount(6); }} />
        </div>
      </Card>

      {/* Direktori */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <Typography variant="headline-md">Direktori Satuan Kerja</Typography>
          <div className="inline-flex items-center gap-1 rounded-[10px] border border-[var(--sd-outline-variant)] p-1">
            <button onClick={() => setViewMode('grid')} className={`p-1.5 rounded-[8px] ${viewMode === 'grid' ? 'bg-[var(--sd-primary)] text-white' : 'text-slate-400'}`}><LayoutGrid className="w-3.5 h-3.5" /></button>
            <button onClick={() => setViewMode('list')} className={`p-1.5 rounded-[8px] ${viewMode === 'list' ? 'bg-[var(--sd-primary)] text-white' : 'text-slate-400'}`}><ListIcon className="w-3.5 h-3.5" /></button>
          </div>
        </div>

        {visible.length === 0 ? (
          <EmptyState title="Satker tidak ditemukan" description="Ubah kata kunci pencarian atau filter tingkat." icon={<Building2 className="w-8 h-8 text-slate-300" />} />
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3' : 'space-y-2'}>
            {visible.map((c) => (
              <Card key={c.id} className={viewMode === 'list' ? 'flex items-center gap-4' : ''}>
                <div className={viewMode === 'list' ? 'flex items-center gap-3 flex-1 min-w-0' : 'flex items-center gap-3'}>
                  <PoldaLogo poldaId={c.id} poldaSingkatan={c.singkatan} poldaNama={c.nama} size="md" />
                  <div className="min-w-0 flex-1">
                    <Badge variant="square" color="neutral" className="mb-1">{c.tingkatLabel}</Badge>
                    <div className="text-sm font-black text-slate-900 truncate">{c.nama}</div>
                    <div className="text-[11px] text-slate-400 truncate">{c.lokasi}</div>
                  </div>
                </div>
                <div className={viewMode === 'list' ? 'flex items-center gap-4 shrink-0' : 'grid grid-cols-2 gap-2 mt-3'}>
                  <div className="bg-slate-50 rounded-[10px] px-2.5 py-1.5">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Personel (SDM)</div>
                    <div className="text-xs font-black text-slate-800">{c.personil.toLocaleString('id-ID')}</div>
                  </div>
                  <div className="bg-slate-50 rounded-[10px] px-2.5 py-1.5">
                    <div className="text-[9px] font-bold text-slate-400 uppercase flex items-center justify-between">Risiko AI <RiskPriorityBadge level={c.riskLevel} className="ml-1" /></div>
                    <div className="text-xs font-black text-slate-800">{c.riskScore}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className={viewMode === 'list' ? 'shrink-0' : 'w-full mt-3'} onClick={() => onSelect(c.id)}>
                  Lihat Profil <ChevronRight className="w-3.5 h-3.5" />
                </Button>
              </Card>
            ))}
          </div>
        )}

        {visibleCount < filtered.length && (
          <div className="flex justify-center mt-4">
            <Button variant="secondary" onClick={() => setVisibleCount((v) => v + 6)}>Muat Lebih Banyak</Button>
          </div>
        )}
      </div>
    </div>
  );
};

/* ============================================================================================ *
 * Detail (#/b1/{idSatker}) — header + 5 tab
 * ============================================================================================ */

type EProfileTab = 'ringkasan' | 'operasional' | 'sdm' | 'sarpras' | 'garkeu';

const DETAIL_TABS: TabDef[] = [
  { id: 'ringkasan', label: 'Ringkasan Eksekutif' },
  { id: 'operasional', label: 'Operasional & Kinerja' },
  { id: 'sdm', label: 'SDM' },
  { id: 'sarpras', label: 'Sarana & Prasarana' },
  { id: 'garkeu', label: 'Garkeu' },
];

const RBS_LEVEL_STYLE: Record<PoldaSatker['analisisLanjutan']['rbsLevel'], string> = {
  Rendah: 'bg-emerald-50 text-emerald-700 border-emerald-200',
  Sedang: 'bg-amber-50 text-amber-700 border-amber-200',
  Tinggi: 'bg-rose-50 text-rose-700 border-rose-200',
};

const EProfileDetailScreen: React.FC<{
  satkerId: string;
  poldaList: PoldaSatker[];
  currentUser?: CurrentUserProfile;
  onBack: () => void;
}> = ({ satkerId, poldaList, currentUser, onBack }) => {
  const [tab, setTab] = useState<EProfileTab>('ringkasan');
  const [jenisAudit, setJenisAudit] = useState('reguler');

  const polda = useMemo(() => poldaList.find((p) => p.id === satkerId), [poldaList, satkerId]);
  const mabesSatker = useMemo<SatkerMabesItem | undefined>(() => (polda ? undefined : MABES_SATKERS_DATA.find((m) => m.id === satkerId)), [polda, satkerId]);
  const mapSatker = useMemo<SatkerMapItem | undefined>(
    () => (polda || mabesSatker ? undefined : ALL_COMBINED_SATKERS_DATA.find((s) => s.id === satkerId)),
    [polda, mabesSatker, satkerId]
  );

  const anchor: EProfilAnchor = useMemo(() => {
    if (polda) return anchorFromPolda(polda);
    if (mabesSatker) return anchorFromSatkerMabes(mabesSatker);
    if (mapSatker) return { id: mapSatker.id, nama: mapSatker.nama, rbsScoreAnchor: mapSatker.skorRisiko !== undefined ? 100 - mapSatker.skorRisiko : undefined };
    return { id: satkerId, nama: satkerId };
  }, [polda, mabesSatker, mapSatker, satkerId]);

  const detail: EProfilDetail = useMemo(() => getEProfilDetail(anchor), [anchor]);

  const displayNama = polda?.nama || mabesSatker?.nama || mapSatker?.nama;
  const displaySingkatan = polda?.singkatan || mabesSatker?.singkatan || mapSatker?.singkatan || satkerId;
  const pimpinanNama = polda?.kapolda || mabesSatker?.pimpinan || mapSatker?.pimpinanNama;
  const pimpinanJabatan = polda ? 'Kapolda' : mabesSatker?.pimpinanJabatan || mapSatker?.pimpinanJabatan;

  const canView = currentUser?.canViewAiSummary ?? true;
  const canExport = currentUser?.canExport ?? false;

  if (!displayNama) {
    return (
      <EmptyState
        title="Satker tidak ditemukan"
        description={`Tidak ditemukan profil untuk id "${satkerId}", atau berada di luar cakupan peran Anda.`}
        icon={<Building2 className="w-8 h-8 text-slate-300" />}
        action={<Button variant="outline" onClick={onBack}>Kembali ke Direktori</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <Breadcrumbs
        items={[{ label: 'E-Profil POLRI' }, { label: displayNama }]}
        onNavigate={(_item, index) => index === 0 && onBack()}
      />

      <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <PoldaLogo poldaId={satkerId} poldaSingkatan={displaySingkatan} poldaNama={displayNama} size="xl" />
        <div className="min-w-0 flex-1">
          <div className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Itwasum Polri</div>
          <h1 className="text-lg font-black text-slate-900 truncate">{displayNama}</h1>
          <p className="text-xs text-slate-500 mt-0.5">
            {pimpinanNama} {pimpinanJabatan ? `• ${pimpinanJabatan}` : ''}
          </p>
          {polda && (
            <span className={`inline-block mt-1.5 px-2.5 py-1 rounded-[8px] text-[10px] font-bold border ${RBS_LEVEL_STYLE[polda.analisisLanjutan.rbsLevel]}`}>
              RBS {polda.analisisLanjutan.rbsLevel} ({polda.analisisLanjutan.rbsScore})
            </span>
          )}
        </div>
        <div className="flex items-center gap-2 shrink-0 w-full sm:w-auto">
          <div className="w-40">
            <Select
              value={jenisAudit}
              onChange={setJenisAudit}
              options={[
                { value: 'reguler', label: 'Jenis Audit: Reguler' },
                { value: 'khusus', label: 'Jenis Audit: Khusus' },
                { value: 'tematik', label: 'Jenis Audit: Tematik' },
              ]}
            />
          </div>
          {canExport && <Button variant="primary"><Download className="w-4 h-4" />Ekspor Laporan</Button>}
        </div>
      </Card>

      <TabNavigation tabs={DETAIL_TABS} activeTab={tab} onTabChange={(id) => setTab(id as EProfileTab)} />

      {tab === 'ringkasan' && <RingkasanEksekutifTab polda={polda} detail={detail} canView={canView} />}
      {tab === 'operasional' && <OperasionalKinerjaTab polda={polda} detail={detail} canView={canView} />}
      {tab === 'sdm' && <SdmTab detail={detail} canView={canView} />}
      {tab === 'sarpras' && <SarprasTab detail={detail} canView={canView} />}
      {tab === 'garkeu' && <GarkeuTab detail={detail} canView={canView} />}
    </div>
  );
};

/* ============================== Kartu generik & Metric (dipertahankan dari versi lama) ============================== */

const SectionCard: React.FC<{ title: string; icon: React.ComponentType<{ className?: string }>; children: React.ReactNode }> = ({ title, icon: Icon, children }) => (
  <Card>
    <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 mb-3 flex items-center gap-1.5">
      <Icon className="w-3.5 h-3.5" />
      {title}
    </Typography>
    {children}
  </Card>
);

const Metric: React.FC<{ label: string; value: string | number; sub?: string }> = ({ label, value, sub }) => (
  <div className="bg-slate-50 rounded-[10px] p-3">
    <div className="text-[10px] font-bold text-slate-400 uppercase truncate">{label}</div>
    <div className="text-lg font-black text-slate-900 mt-0.5">{value}</div>
    {sub && <div className="text-[10px] text-slate-500 mt-0.5">{sub}</div>}
  </div>
);

/* ============================== Tab: Ringkasan Eksekutif ============================== */

const RingkasanEksekutifTab: React.FC<{ polda?: PoldaSatker; detail: EProfilDetail; canView: boolean }> = ({ polda, detail, canView }) => (
  <div className="space-y-4">
    <RingkasanAnalisisAi {...detail.aiSummary} canView={canView} />

    <SectionCard title="Kualitas & Kesiapan Data" icon={ClipboardList}>
      <div className="grid grid-cols-1 md:grid-cols-[auto_1fr] gap-5">
        <CircularProgress value={detail.kualitasData.persenSiap} color="var(--sd-primary)" trackColor="#E2E8F0" caption={detail.kualitasData.status} displayValue={`${detail.kualitasData.persenSiap}%`} />
        <div className="space-y-2.5">
          {detail.kualitasData.domains.map((d) => (
            <ProgressBar key={d.domain} label={`${d.domain} — ${d.status}`} value={d.persen} color={d.status === 'Data Lengkap' ? '#2d7a4a' : '#ba1a1a'} />
          ))}
        </div>
      </div>
    </SectionCard>

    <SectionCard title="Skor Risiko Satker / Satwil" icon={Target}>
      <SatkerRiskRadar axes={detail.skorRisiko.dimensions} focusItems={detail.skorRisiko.fokusPraAudit} subtitle="Fokus Pra-Audit" />
    </SectionCard>

    <SectionCard title="5 Temuan Teratas AI" icon={Sparkles}>
      <AiFindingsTable variant="executive" data={detail.temuanAiEksekutif} />
    </SectionCard>

    {polda && (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <SectionCard title="RBS Matrix - Risk-Based Supervision" icon={Target}>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Metric label="Skor RBS" value={polda.analisisLanjutan.rbsScore} />
            <Metric label="Level Risiko" value={polda.analisisLanjutan.rbsLevel} />
            <Metric label="Total Temuan" value={polda.totalTemuan} sub={`${polda.temuanTerbuka} terbuka`} />
          </div>
          <p className="text-xs text-slate-600 leading-relaxed">{polda.analisisLanjutan.prediksiKepatuhan}</p>
        </SectionCard>
        <SectionCard title="Gap Analysis" icon={AlertTriangle}>
          <ul className="space-y-1.5">
            {polda.analisisLanjutan.gapAnalysis.map((g, i) => (
              <li key={i} className="text-xs text-slate-600 flex items-start gap-2">
                <span className="w-1.5 h-1.5 rounded-full bg-rose-500 mt-1.5 shrink-0" />
                {g}
              </li>
            ))}
          </ul>
        </SectionCard>
      </div>
    )}

    {polda && polda.analisisLanjutan.rekomendasiStrategis.length > 0 && (
      <SectionCard title="Rekomendasi Strategis" icon={Lightbulb}>
        <ul className="space-y-2">
          {polda.analisisLanjutan.rekomendasiStrategis.map((r, i) => (
            <li key={i} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2 pb-2 border-b border-slate-50 last:border-0">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              {r}
            </li>
          ))}
        </ul>
      </SectionCard>
    )}
  </div>
);

/* ============================== Tab: Operasional & Kinerja ============================== */

const STATUS_COLOR: Record<'Tercapai' | 'Mendekati Target' | 'Belum Tercapai', 'success' | 'warning' | 'danger'> = {
  Tercapai: 'success',
  'Mendekati Target': 'warning',
  'Belum Tercapai': 'danger',
};

const OperasionalKinerjaTab: React.FC<{ polda?: PoldaSatker; detail: EProfilDetail; canView: boolean }> = ({ polda, detail, canView }) => {
  const top5Items: HorizontalMetricItem[] = detail.operasional.top5TindakPidana.map((t) => ({ id: t.label, label: t.label, percent: t.value, displayValue: t.displayValue || `${t.value}`, color: 'var(--sd-primary)' }));
  const risikoItems: HorizontalMetricItem[] = detail.operasional.risikoPerFungsi.map((t) => ({ id: t.label, label: t.label, percent: t.value, displayValue: t.displayValue || `${t.value}%`, color: '#ba1a1a' }));

  return (
    <div className="space-y-4">
      <RingkasanAnalisisAi {...detail.aiSummary} canView={canView} />

      <SectionCard title="Target vs Realisasi" icon={Target}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase text-slate-400">
                <th className="pb-2 pr-3">Indikator Kinerja</th>
                <th className="pb-2 pr-3">Target</th>
                <th className="pb-2 pr-3">Realisasi</th>
                <th className="pb-2 pr-3">Gap</th>
                <th className="pb-2 pr-3">Status</th>
                <th className="pb-2">Trend</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detail.operasional.targetVsRealisasi.map((row) => (
                <tr key={row.indikator}>
                  <td className="py-2 pr-3 font-bold text-slate-700">{row.indikator}</td>
                  <td className="py-2 pr-3 text-slate-500">{row.target}</td>
                  <td className="py-2 pr-3 text-slate-500">{row.realisasi}</td>
                  <td className="py-2 pr-3 text-slate-500">{row.gap}</td>
                  <td className="py-2 pr-3"><Badge color={STATUS_COLOR[row.status]}>{row.status}</Badge></td>
                  <td className="py-2">{row.trend === 'up' ? '▲' : row.trend === 'down' ? '▼' : '–'}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="5 Temuan Teratas AI Operasional / Kinerja" icon={Sparkles}>
        <AiFindingsTable variant="domain" data={detail.temuanAiByDomain.operasional} />
      </SectionCard>

      <SectionCard title="Statistik Operasional" icon={ClipboardList}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {detail.operasional.statistik.map((s) => (
            <Metric key={s.label} label={s.label} value={s.value.toLocaleString('id-ID')} />
          ))}
        </div>
        {polda?.auditBerjalan && (
          <div className="mt-3 bg-amber-50 border border-amber-200 rounded-[10px] p-3 text-xs text-amber-800">
            <span className="font-bold">Audit berjalan:</span> {polda.namaAudit || 'Audit aktif'}
            {polda.tenggatAudit && ` (tenggat ${polda.tenggatAudit})`}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Top 5 Tindak Pidana Dominan" icon={AlertTriangle}>
        <HorizontalMetricChart items={top5Items} />
      </SectionCard>

      <SectionCard title="Risiko Operasional per Fungsi" icon={Target}>
        <HorizontalMetricChart items={risikoItems} />
      </SectionCard>

      <AuditRecommendationSection data={detail.rekomendasiByDomain.operasional} />
      <AnalysisDataSources data={detail.sumberDataByDomain.operasional} />
    </div>
  );
};

/* ============================== Tab: SDM ============================== */

const SdmTab: React.FC<{ detail: EProfilDetail; canView: boolean }> = ({ detail, canView }) => (
  <div className="space-y-4">
    <RingkasanAnalisisAi {...detail.aiSummary} canView={canView} />

    <SectionCard title="Profil & Komposisi Personel" icon={Users}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        {detail.sdm.komposisi.map((k) => (
          <Metric key={k.label} label={k.label} value={k.value.toLocaleString('id-ID')} />
        ))}
        {detail.sdm.golongan.map((g) => (
          <Metric key={g.label} label={g.label} value={g.value.toLocaleString('id-ID')} />
        ))}
      </div>
    </SectionCard>

    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
      <SectionCard title="Ringkasan Mutasi" icon={Users}>
        <div className="grid grid-cols-3 gap-2">
          <Metric label="Masuk" value={detail.sdm.mutasi.masuk} />
          <Metric label="Keluar" value={detail.sdm.mutasi.keluar} />
          <Metric label="Promosi" value={detail.sdm.mutasi.promosi} />
        </div>
      </SectionCard>
      <SectionCard title="Ringkasan Disiplin" icon={AlertTriangle}>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Kasus" value={detail.sdm.disiplin.kasus} />
          <Metric label="Selesai" value={detail.sdm.disiplin.selesai} />
        </div>
      </SectionCard>
      <SectionCard title="Ringkasan Kehadiran" icon={ClipboardList}>
        <CircularProgress value={detail.sdm.kehadiranPersen} color="var(--sd-primary)" trackColor="#E2E8F0" displayValue={`${detail.sdm.kehadiranPersen}%`} caption="Tingkat Kehadiran" size={80} />
      </SectionCard>
    </div>

    <AuditRecommendationSection data={detail.rekomendasiByDomain.sdm} />

    <SectionCard title="5 Temuan Teratas AI SDM" icon={Sparkles}>
      <AiFindingsTable variant="domain" data={detail.temuanAiByDomain.sdm} />
    </SectionCard>

    <AnalysisDataSources data={detail.sumberDataByDomain.sdm} />
  </div>
);

/* ============================== Tab: Sarpras ============================== */

const KONDISI_COLOR: Record<'Baik' | 'Rusak Ringan' | 'Rusak Berat', 'success' | 'warning' | 'danger'> = {
  Baik: 'success',
  'Rusak Ringan': 'warning',
  'Rusak Berat': 'danger',
};

const SarprasTab: React.FC<{ detail: EProfilDetail; canView: boolean }> = ({ detail, canView }) => {
  const kendaraanItems: HorizontalMetricItem[] = detail.sarpras.statusKendaraan.map((k) => ({ id: k.label, label: k.label, percent: k.value, displayValue: k.displayValue || `${k.value}%`, color: 'var(--sd-primary)' }));

  return (
    <div className="space-y-4">
      <RingkasanAnalisisAi {...detail.aiSummary} canView={canView} />

      <SectionCard title="Status Kendaraan Dinas" icon={Truck}>
        <HorizontalMetricChart items={kendaraanItems} />
      </SectionCard>

      <SectionCard title="Status Kontrak" icon={ClipboardList}>
        <div className="grid grid-cols-3 gap-2">
          {detail.sarpras.statusKontrak.map((k) => (
            <Metric key={k.label} label={k.label} value={k.value} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Ringkasan & Kesehatan Aset" icon={ShieldCheck}>
        <CircularProgress value={detail.sarpras.kesehatanAsetPersen} color="var(--sd-primary)" trackColor="#E2E8F0" displayValue={`${detail.sarpras.kesehatanAsetPersen}%`} caption="Kesehatan Aset" size={90} />
      </SectionCard>

      <SectionCard title="Ringkasan Persediaan" icon={ClipboardList}>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {detail.sarpras.persediaan.map((p) => (
            <Metric key={p.label} label={p.label} value={p.value.toLocaleString('id-ID')} />
          ))}
        </div>
      </SectionCard>

      <SectionCard title="Daftar Anomali Aset BMN" icon={AlertTriangle}>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr className="text-left text-[10px] font-bold uppercase text-slate-400">
                <th className="pb-2 pr-3">Kode Aset</th>
                <th className="pb-2 pr-3">Nama Aset</th>
                <th className="pb-2 pr-3">Kategori</th>
                <th className="pb-2 pr-3">Lokasi</th>
                <th className="pb-2 pr-3">Kondisi Aset</th>
                <th className="pb-2">Informasi Anomali AI</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {detail.sarpras.anomaliAset.map((a) => (
                <tr key={a.kodeAset}>
                  <td className="py-2 pr-3 font-mono text-slate-500">{a.kodeAset}</td>
                  <td className="py-2 pr-3 font-bold text-slate-700">{a.namaAset}</td>
                  <td className="py-2 pr-3 text-slate-500">{a.kategori}</td>
                  <td className="py-2 pr-3 text-slate-500">{a.lokasi}</td>
                  <td className="py-2 pr-3"><Badge color={KONDISI_COLOR[a.kondisiAset]}>{a.kondisiAset}</Badge></td>
                  <td className="py-2 text-slate-500">{a.infoAnomaliAi}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </SectionCard>

      <SectionCard title="5 Temuan Teratas AI Sarpras" icon={Sparkles}>
        <AiFindingsTable variant="domain" data={detail.temuanAiByDomain.sarpras} />
      </SectionCard>

      <AuditRecommendationSection data={detail.rekomendasiByDomain.sarpras} />
      <AnalysisDataSources data={detail.sumberDataByDomain.sarpras} />
    </div>
  );
};

/* ============================== Tab: Garkeu ============================== */

const GarkeuTab: React.FC<{ detail: EProfilDetail; canView: boolean }> = ({ detail, canView }) => (
  <div className="space-y-4">
    <RingkasanAnalisisAi {...detail.aiSummary} canView={canView} />

    <SectionCard title="Garkeu Overview" icon={Coins}>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <Metric label="Pagu" value={detail.garkeu.paguRp} />
        <Metric label="Realisasi" value={detail.garkeu.realisasiRp} />
        <Metric label="Sisa" value={detail.garkeu.sisaRp} />
        <Metric label="Persentase Realisasi" value={`${detail.garkeu.persenRealisasi}%`} />
      </div>
      <ProgressBar className="mt-3" value={detail.garkeu.persenRealisasi} color={detail.garkeu.persenRealisasi >= 85 ? '#2d7a4a' : detail.garkeu.persenRealisasi >= 70 ? '#F59E0B' : '#ba1a1a'} showValue={false} />
    </SectionCard>

    <SectionCard title="Tren Realisasi Anggaran vs Target" icon={Target}>
      <div className="grid grid-cols-4 gap-2">
        {detail.garkeu.trenVsTarget.map((t) => (
          <div key={t.periode} className="bg-slate-50 rounded-[10px] p-2.5 text-center">
            <div className="text-[10px] font-bold text-slate-400 uppercase">{t.periode}</div>
            <div className="text-sm font-black text-slate-800 mt-1">{t.realisasi}%</div>
            <div className="text-[10px] text-slate-400">Target {t.target}%</div>
          </div>
        ))}
      </div>
    </SectionCard>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SectionCard title="Penyerapan DIPA & Setoran PNBP" icon={Coins}>
        <div className="grid grid-cols-2 gap-2">
          <Metric label="Penyerapan DIPA" value={`${detail.garkeu.penyerapanDipaPersen}%`} />
          <Metric label="Setoran PNBP" value={detail.garkeu.setoranPnbpRp} />
        </div>
      </SectionCard>
      <SectionCard title="Ringkasan Siklus Pembayaran" icon={ClipboardList}>
        <Metric label="Rata-rata Hari Bayar" value={`${detail.garkeu.siklusPembayaranHariRataRata} hari`} />
      </SectionCard>
    </div>

    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <SectionCard title="Ringkasan Pajak" icon={Coins}>
        <Metric label="Pajak Dipungut" value={detail.garkeu.pajakDipungutRp} />
      </SectionCard>
      <SectionCard title="Monitoring Arus Kas" icon={Coins}>
        <Metric label="Arus Kas Bersih" value={detail.garkeu.arusKasBersihRp} />
      </SectionCard>
    </div>

    <SectionCard title="5 Temuan Teratas AI Garkeu" icon={Sparkles}>
      <AiFindingsTable variant="domain" data={detail.temuanAiByDomain.garkeu} />
    </SectionCard>

    <AuditRecommendationSection data={detail.rekomendasiByDomain.garkeu} />
    <AnalysisDataSources data={detail.sumberDataByDomain.garkeu} />
  </div>
);

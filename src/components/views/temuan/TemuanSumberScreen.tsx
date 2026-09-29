/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.2/B.3 Temuan Audit Polri — landing bersama (SF-TI-014: pencarian >=3 karakter, filter
 * wilayah, kartu, muat lebih banyak) + satu halaman scroll per Satker dengan toggle BPK/IRSUS
 * (mengikuti Figma "Temuan Audit Polri" & "Temuan BPK", frame 3082:11634 & 2858:7225 — lihat
 * `figma/README.md`), Plan "Align itwasum with Figma" todo `temuan`. Tidak ada status editing
 * (BR: "Removed: status editing") — status tindak lanjut bersifat baca-saja, ditampilkan pada
 * tabel Monitoring Satker/Satwil dan riwayat pada Detail Temuan.
 */
import React, { useMemo, useState } from 'react';
import { AlertTriangle, Building2, ChevronRight, Clock, Coins, FileText, RotateCcw, Search as SearchIcon, Sparkles } from 'lucide-react';
import type { PoldaSatker } from '../../../types';
import { PoldaLogo } from '../../PoldaLogo';
import { useSearchMin } from '../../ui/useSearchMin';
import { buildExportFilename, simulateExport } from '../../../utils/simulateExport';
import {
  findingsForSatker,
  similarFindings,
  monitoringBySubSatker,
  type FindingLedgerEntry,
  type TemuanSumberLedger,
  type TindakLanjutStatus,
  type MonitoringSatwilRow,
} from '../../../data/domain/findingsLedger';
import {
  Badge,
  BreadcrumbPill,
  Button,
  Card,
  CircularProgress,
  EmptyState,
  FilterPanel,
  Modal,
  Pagination,
  Search,
  SegmentedControl,
  StatCard,
  Table,
  Timeline,
  usePagination,
  type BadgeColor,
  type TableColumn,
} from '../../ui';
import { DonutChart, HorizontalMetricChart, type HorizontalMetricItem } from '../../ui/charts';

const STATUS_COLOR: Record<TindakLanjutStatus, BadgeColor> = {
  Selesai: 'success',
  'Dalam Proses': 'warning',
  'Belum Ditindaklanjuti': 'neutral',
  'Lewat Target': 'danger',
};

const MONITORING_STATUS_COLOR: Record<MonitoringSatwilRow['status'], BadgeColor> = {
  'Sangat Baik': 'success',
  Baik: 'info',
  Menunggu: 'warning',
  Kritis: 'danger',
};

const TINGKAT_COLOR: Record<FindingLedgerEntry['tingkat'], BadgeColor> = {
  Kritis: 'danger',
  Sedang: 'warning',
  Ringan: 'neutral',
};

type LihatSemuaView = 'daftar-temuan' | 'monitoring' | 'rekomendasi' | null;

interface TemuanSumberScreenProps {
  sumber: TemuanSumberLedger;
  poldaList: PoldaSatker[];
  selectedPoldaId: string | null;
  onSelectPolda: (id: string | null) => void;
}

export const TemuanSumberScreen: React.FC<TemuanSumberScreenProps> = ({ sumber, poldaList, selectedPoldaId, onSelectPolda }) => {
  // Figma: "Temuan Audit Polri" adalah SATU item sidebar dengan toggle BPK/IRSUS di dalam
  // halaman Satker, bukan dua rute terpisah — lihat sidebarNav.ts (hanya B.2 yang terdaftar).
  const [activeSumber, setActiveSumber] = useState<TemuanSumberLedger>(sumber);
  const [lihatSemua, setLihatSemua] = useState<LihatSemuaView>(null);
  const selectedPolda = poldaList.find((p) => p.id === selectedPoldaId) ?? null;

  if (!selectedPolda) {
    return (
      <TemuanLandingScreen
        sumber={activeSumber}
        poldaList={poldaList}
        onSelect={(id) => {
          onSelectPolda(id);
          setLihatSemua(null);
        }}
      />
    );
  }

  const entries = findingsForSatker(selectedPolda.id, activeSumber);
  const monitoring = monitoringBySubSatker(selectedPolda.id, activeSumber);

  const breadcrumbItems = [
    { label: 'Temuan Audit Polri' },
    { label: selectedPolda.nama },
    ...(lihatSemua ? [{ label: lihatSemua === 'daftar-temuan' ? 'Daftar Temuan' : lihatSemua === 'monitoring' ? 'Monitoring Satker / Satwil' : 'Rekomendasi Audit' }] : []),
  ];

  return (
    <div className="space-y-3">
      <BreadcrumbPill
        items={breadcrumbItems}
        onNavigate={(_item, index) => {
          if (index === 0) onSelectPolda(null);
          else if (index === 1) setLihatSemua(null);
        }}
      />

      {lihatSemua === 'daftar-temuan' && (
        <DaftarTemuanFull sumber={activeSumber} satkerNama={selectedPolda.nama} entries={entries} onBack={() => setLihatSemua(null)} />
      )}
      {lihatSemua === 'monitoring' && <MonitoringFull rows={monitoring} onBack={() => setLihatSemua(null)} />}
      {lihatSemua === 'rekomendasi' && <RekomendasiFull entries={entries} onBack={() => setLihatSemua(null)} />}

      {!lihatSemua && (
        <>
          <Card className="flex flex-col sm:flex-row sm:items-center gap-3">
            <PoldaLogo poldaId={selectedPolda.id} poldaSingkatan={selectedPolda.singkatan} poldaNama={selectedPolda.nama} size="lg" />
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold uppercase text-slate-400">Temuan Audit Polri</div>
              <h2 className="text-sm font-black text-slate-900">{selectedPolda.nama}</h2>
            </div>
            <SegmentedControl
              options={[{ value: 'BPK RI', label: 'Temuan BPK' }, { value: 'Irsus', label: 'Temuan Irsus' }]}
              value={activeSumber}
              onChange={(v) => setActiveSumber(v as TemuanSumberLedger)}
            />
          </Card>

          <SatkerTemuanBody
            sumber={activeSumber}
            satkerNama={selectedPolda.nama}
            entries={entries}
            monitoring={monitoring}
            onLihatSemuaTemuan={() => setLihatSemua('daftar-temuan')}
            onLihatSemuaMonitoring={() => setLihatSemua('monitoring')}
            onLihatSemuaRekomendasi={() => setLihatSemua('rekomendasi')}
          />
        </>
      )}
    </div>
  );
};

/* ============================================================================================ *
 * Landing — direktori Satker (SF-TI-014)
 * ============================================================================================ */
const TemuanLandingScreen: React.FC<{ sumber: TemuanSumberLedger; poldaList: PoldaSatker[]; onSelect: (id: string) => void }> = ({ poldaList, onSelect }) => {
  const searchCtl = useSearchMin(3, 100);
  const [pulauFilter, setPulauFilter] = useState('');
  const [visibleCount, setVisibleCount] = useState(9);

  const pulauOptions = useMemo(() => Array.from(new Set(poldaList.map((p) => p.pulau))).sort(), [poldaList]);

  const filtered = poldaList.filter((p) => {
    if (pulauFilter && p.pulau !== pulauFilter) return false;
    if (searchCtl.applied && !p.nama.toLowerCase().includes(searchCtl.applied.toLowerCase())) return false;
    return true;
  });
  const visible = filtered.slice(0, visibleCount);

  const totalBpk = poldaList.reduce((s, p) => s + findingsForSatker(p.id, 'BPK RI').length, 0);
  const totalIrsus = poldaList.reduce((s, p) => s + findingsForSatker(p.id, 'Irsus').length, 0);

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] p-5 sm:p-6 text-white shadow-[0_8px_30px_rgba(0,34,101,0.3)]" style={{ background: 'linear-gradient(135deg, var(--sd-primary) 0%, var(--sd-primary-container) 60%, #0c3fa0 100%)' }}>
        <div className="text-[11px] font-bold tracking-[0.2em] text-white/70 uppercase">Sistem Pengawasan Internal</div>
        <h1 className="text-2xl sm:text-3xl font-black mt-1">Temuan Audit Polri</h1>
        <p className="text-sm text-white/80 mt-1 max-w-xl">Mengintegrasikan hasil audit eksternal (BPK) dan audit internal (IRSUS) untuk membantu pimpinan menentukan prioritas pengawasan.</p>
        <div className="grid grid-cols-3 gap-3 mt-5 max-w-lg">
          <div className="rounded-[12px] bg-white/10 px-3 py-2.5"><div className="text-lg font-black">{poldaList.length}</div><div className="text-[11px] text-white/70">Total Satker</div></div>
          <div className="rounded-[12px] bg-white/10 px-3 py-2.5"><div className="text-lg font-black">{totalBpk}</div><div className="text-[11px] text-white/70">Total Temuan BPK</div></div>
          <div className="rounded-[12px] bg-white/10 px-3 py-2.5"><div className="text-lg font-black">{totalIrsus}</div><div className="text-[11px] text-white/70">Total Temuan Irsus</div></div>
        </div>
      </div>

      <Card className="flex flex-col gap-2">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="flex-1"><Search value={searchCtl.draft} onChange={searchCtl.setDraft} placeholder="Cari nama Polda (min. 3 karakter)..." /></div>
          <Button disabled={!searchCtl.isValid} onClick={searchCtl.submit}><SearchIcon className="w-4 h-4" /> Cari</Button>
          <FilterPanel fields={[{ type: 'select', key: 'pulau', label: 'Wilayah', value: pulauFilter, onChange: setPulauFilter, placeholder: 'Semua Wilayah', options: pulauOptions.map((p) => ({ value: p, label: p })) }]} />
        </div>
        {!searchCtl.isValid && <p className="text-[11px] text-amber-600 font-semibold">Kata kunci pencarian minimal 3 karakter (maks. 100).</p>}
      </Card>

      {visible.length === 0 ? (
        <EmptyState title="Satker tidak ditemukan" icon={<Building2 className="w-8 h-8 text-slate-300" />} />
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {visible.map((p) => {
            const bpk = findingsForSatker(p.id, 'BPK RI').length;
            const irsus = findingsForSatker(p.id, 'Irsus').length;
            return (
              <Card key={p.id} className="space-y-3">
                <div className="flex items-center gap-3">
                  <PoldaLogo poldaId={p.id} poldaSingkatan={p.singkatan} poldaNama={p.nama} size="md" />
                  <div className="min-w-0 flex-1">
                    <div className="text-sm font-black text-slate-900 truncate">{p.nama}</div>
                    <div className="text-[11px] text-slate-400">{p.pulau}</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div className="bg-slate-50 rounded-[10px] px-2.5 py-1.5">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Temuan BPK</div>
                    <div className="text-xs font-black text-slate-800">{bpk} Temuan</div>
                  </div>
                  <div className="bg-slate-50 rounded-[10px] px-2.5 py-1.5">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Temuan Irsus</div>
                    <div className="text-xs font-black text-slate-800">{irsus} Temuan</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => onSelect(p.id)}>Lihat Profil <ChevronRight className="w-3.5 h-3.5" /></Button>
              </Card>
            );
          })}
        </div>
      )}
      {visibleCount < filtered.length && (
        <div className="flex justify-center"><Button variant="secondary" onClick={() => setVisibleCount((v) => v + 9)}>Muat Lebih Banyak</Button></div>
      )}
    </div>
  );
};

/* ============================================================================================ *
 * Halaman Satker — satu scroll (Ringkasan AI -> KPI -> Analisis -> Rekomendasi -> Daftar
 * Temuan -> Monitoring Satker/Satwil -> Dokumen Terkait), mengikuti Figma "Temuan BPK".
 * ============================================================================================ */
const SatkerTemuanBody: React.FC<{
  sumber: TemuanSumberLedger;
  satkerNama: string;
  entries: FindingLedgerEntry[];
  monitoring: MonitoringSatwilRow[];
  onLihatSemuaTemuan: () => void;
  onLihatSemuaMonitoring: () => void;
  onLihatSemuaRekomendasi: () => void;
}> = ({ sumber, satkerNama, entries, monitoring, onLihatSemuaTemuan, onLihatSemuaMonitoring, onLihatSemuaRekomendasi }) => {
  const [detailTarget, setDetailTarget] = useState<FindingLedgerEntry | null>(null);
  const totalNilai = entries.reduce((s, e) => s + (e.nilaiRupiah ? parseFloat(e.nilaiRupiah.replace(/[^\d.]/g, '')) || 0 : 0), 0);
  const berulang = entries.filter((e) => e.label === 'Berulang').length;
  const trendPct = entries.length ? Math.round((berulang / entries.length) * 100) : 0;
  const confidenceAvg = entries.length ? Math.round(entries.reduce((s, e) => s + e.aiConfidence, 0) / entries.length) : 0;

  const byKategori = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => map.set(e.kategori, (map.get(e.kategori) ?? 0) + 1));
    return Array.from(map.entries()).map(([label, value]) => ({ id: label, label, value, color: '#002265' }));
  }, [entries]);

  const akarMasalah = useMemo(() => {
    const map = new Map<string, number>();
    entries.forEach((e) => map.set(e.akarMasalah, (map.get(e.akarMasalah) ?? 0) + 1));
    return Array.from(map.entries()).map(([label, value]): HorizontalMetricItem => ({ id: label, label, percent: Math.min(100, value * 20), displayValue: `${value}`, color: '#BA1A1A' }));
  }, [entries]);

  return (
    <div className="space-y-4">
      {/* Ringkasan Analisis AI */}
      <div className="rounded-[14px] p-5 text-white shadow-[0_4px_20px_rgba(0,34,101,0.25)] flex items-start gap-4" style={{ background: 'linear-gradient(135deg, var(--sd-primary) 0%, var(--sd-primary-container) 100%)' }}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1"><Sparkles className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wide">Ringkasan Analisis AI</span></div>
          <p className="text-sm text-white/90 leading-relaxed">
            Dari {entries.length} temuan {sumber === 'BPK RI' ? 'BPK' : 'Irsus'}, {berulang} ({trendPct}%) merupakan temuan berulang dari periode sebelumnya. Prioritaskan tindak lanjut pada temuan berstatus "Lewat Target" untuk mencegah eskalasi.
          </p>
        </div>
        <CircularProgress value={confidenceAvg} size={80} strokeWidth={6} caption="Confidence" displayValue={`${confidenceAvg}%`} />
      </div>

      {/* KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Temuan" value={entries.length} />
        {sumber === 'BPK RI' ? (
          <StatCard label="Total Nilai Temuan" value={`Rp ${totalNilai.toFixed(0)} Jt`} />
        ) : (
          <StatCard label="Tren Berulang" value={`${trendPct}%`} />
        )}
        <StatCard label="Temuan Berulang" value={berulang} />
        <StatCard label="Lewat Target" value={entries.filter((e) => e.status === 'Lewat Target').length} />
      </div>

      {/* Analisis */}
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="text-xs font-bold text-slate-700 mb-3">Distribusi Temuan per Kategori</div>
          {byKategori.length === 0 ? <EmptyState title="Belum ada data" /> : <DonutChart segments={byKategori} />}
        </Card>
        <Card>
          <div className="text-xs font-bold text-slate-700 mb-3">Analisis Akar Masalah</div>
          {akarMasalah.length === 0 ? <EmptyState title="Belum ada data" /> : <HorizontalMetricChart items={akarMasalah} />}
        </Card>
      </div>

      {/* Rekomendasi Audit */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-700">Rekomendasi Audit</div>
          <button onClick={onLihatSemuaRekomendasi} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat Semua</button>
        </div>
        <ul className="space-y-1.5">
          {entries.slice(0, 3).map((e) => (
            <li key={e.id} className="text-xs text-slate-600 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span><strong>{e.kode}</strong> — {e.rekomendasi}</span>
            </li>
          ))}
          {entries.length === 0 && <EmptyState title="Belum ada rekomendasi" />}
        </ul>
      </Card>

      {/* Daftar Temuan (preview) */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-700">Daftar Temuan</div>
          <button onClick={onLihatSemuaTemuan} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat Semua</button>
        </div>
        {entries.length === 0 ? (
          <EmptyState title="Belum ada temuan pada Satker ini" />
        ) : (
          <ul className="divide-y divide-slate-100">
            {entries.slice(0, 5).map((e) => (
              <li key={e.id} className="py-2.5 flex items-center justify-between gap-3">
                <button onClick={() => setDetailTarget(e)} className="text-left min-w-0 flex-1">
                  <div className="text-xs font-bold text-slate-800 truncate hover:text-[var(--sd-primary)] hover:underline">{e.judul}</div>
                  <div className="text-[11px] text-slate-400 font-mono">{e.kode}</div>
                </button>
                <Badge color={STATUS_COLOR[e.status]} className="shrink-0">{e.status}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {/* Monitoring Satker/Satwil (preview) */}
      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-700">Monitoring Satker / Satwil</div>
          <button onClick={onLihatSemuaMonitoring} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat Semua</button>
        </div>
        {monitoring.length === 0 ? (
          <EmptyState title="Belum ada data monitoring" />
        ) : (
          <MonitoringTable rows={monitoring.slice(0, 4)} />
        )}
      </Card>

      {/* Dokumen Terkait */}
      <Card>
        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Dokumen Terkait</div>
        <ul className="text-xs text-slate-500 space-y-1">
          {Array.from(new Set(entries.flatMap((e) => e.dokumenTerkait))).slice(0, 5).map((d) => <li key={d}>{d}</li>)}
          {entries.length === 0 && <li className="text-slate-400">Belum ada dokumen terkait.</li>}
        </ul>
      </Card>

      {detailTarget && <DetailTemuanModal entry={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  );
};

const MonitoringTable: React.FC<{ rows: MonitoringSatwilRow[] }> = ({ rows }) => {
  const columns: TableColumn<MonitoringSatwilRow>[] = [
    { key: 'nama', header: 'Nama Satker / Satwil', render: (r) => <span className="font-bold text-slate-800">{r.subSatker}</span> },
    { key: 'jumlah', header: 'Jumlah Temuan', render: (r) => r.jumlahTemuan },
    { key: 'selesai', header: 'Selesai', render: (r) => r.selesai },
    { key: 'proses', header: 'Dalam Proses', render: (r) => r.dalamProses },
    { key: 'persen', header: 'Persentase Penyelesaian', render: (r) => `${r.persenPenyelesaian}%` },
    { key: 'status', header: 'Status', render: (r) => <Badge color={MONITORING_STATUS_COLOR[r.status]}>{r.status}</Badge> },
  ];
  return <Table columns={columns} data={rows} rowKey={(r) => r.subSatker} />;
};

/* ============================================================================================ *
 * Lihat Semua — Daftar Temuan
 * ============================================================================================ */
const DaftarTemuanFull: React.FC<{ sumber: TemuanSumberLedger; satkerNama: string; entries: FindingLedgerEntry[]; onBack: () => void }> = ({ sumber, satkerNama, entries, onBack }) => {
  const [search, setSearch] = useState('');
  const [tingkatFilter, setTingkatFilter] = useState('');
  const [jenisAuditFilter, setJenisAuditFilter] = useState('');
  const [pageSizeChoice, setPageSizeChoice] = useState<5 | 10>(10);
  const [detailTarget, setDetailTarget] = useState<FindingLedgerEntry | null>(null);

  const filtered = entries.filter((e) => {
    if (tingkatFilter && e.tingkat !== tingkatFilter) return false;
    if (sumber === 'Irsus' && jenisAuditFilter && e.jenisAudit !== jenisAuditFilter) return false;
    if (search && !e.judul.toLowerCase().includes(search.toLowerCase()) && !e.kode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const { pageItems, page, setPage } = usePagination(filtered, pageSizeChoice);

  const columns: TableColumn<FindingLedgerEntry>[] = [
    { key: 'kode', header: 'Kode', render: (e) => <div><span className="font-mono text-[11px] text-slate-400">{e.kode}</span>{e.label === 'Berulang' && <Badge color="warning" className="ml-1.5">Berulang</Badge>}</div> },
    { key: 'judul', header: 'Uraian Temuan', render: (e) => <button onClick={() => setDetailTarget(e)} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left">{e.judul}</button> },
    { key: 'kategori', header: 'Kategori', render: (e) => e.kategori },
    { key: 'tingkat', header: 'Tingkat', render: (e) => <Badge color={TINGKAT_COLOR[e.tingkat]}>{e.tingkat}</Badge> },
    ...(sumber === 'Irsus' ? [{ key: 'jenisAudit', header: 'Jenis Audit', render: (e: FindingLedgerEntry) => <Badge color="info">{e.jenisAudit}</Badge> } as TableColumn<FindingLedgerEntry>] : []),
    { key: 'tenggat', header: 'Tenggat', render: (e) => <span className="flex items-center gap-1 text-slate-500"><Clock className="w-3 h-3" />{e.tenggat}</span> },
    { key: 'status', header: 'Status', render: (e) => <Badge color={STATUS_COLOR[e.status]}>{e.status}</Badge> },
    { key: 'aksi', header: 'Aksi', render: (e) => <button onClick={() => setDetailTarget(e)} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat Detail</button> },
  ];

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">&larr; Kembali</button>
      <FilterPanel
        search={{ value: search, onChange: setSearch, placeholder: 'Cari kode/judul temuan...' }}
        fields={[
          { type: 'select', key: 'tingkat', label: 'Tingkat', value: tingkatFilter, onChange: setTingkatFilter, placeholder: 'Semua Tingkat', options: ['Kritis', 'Sedang', 'Ringan'].map((t) => ({ value: t, label: t })) },
          ...(sumber === 'Irsus' ? [{ type: 'select' as const, key: 'jenisAudit', label: 'Jenis Audit', value: jenisAuditFilter, onChange: setJenisAuditFilter, placeholder: 'Semua Jenis Audit', options: ['Reguler', 'Khusus', 'Tematik'].map((j) => ({ value: j, label: j })) }] : []),
        ]}
        headerActions={
          <div className="flex items-center gap-2">
            <SegmentedControl options={[{ value: '5', label: '5/hal' }, { value: '10', label: '10/hal' }]} value={String(pageSizeChoice)} onChange={(v) => setPageSizeChoice(Number(v) as 5 | 10)} />
            <Button
              size="sm"
              onClick={() =>
                simulateExport({
                  filename: buildExportFilename([`Daftar_Temuan_${sumber === 'BPK RI' ? 'BPK' : 'IRSUS'}`, satkerNama, new Date().toISOString().slice(0, 10)]),
                  format: 'xlsx',
                })
              }
            >
              Unduh
            </Button>
          </div>
        }
      />
      {filtered.length === 0 ? (
        <EmptyState title="Tidak ada temuan yang cocok" icon={<AlertTriangle className="w-6 h-6 text-slate-300" />} />
      ) : (
        <Card>
          <Table columns={columns} data={pageItems} rowKey={(e) => e.id} />
          <Pagination currentPage={page} totalItems={filtered.length} pageSize={pageSizeChoice} onPageChange={setPage} className="mt-2" itemLabel="temuan" />
        </Card>
      )}
      {detailTarget && <DetailTemuanModal entry={detailTarget} onClose={() => setDetailTarget(null)} />}
    </div>
  );
};

const MonitoringFull: React.FC<{ rows: MonitoringSatwilRow[]; onBack: () => void }> = ({ rows, onBack }) => (
  <div className="space-y-3">
    <button onClick={onBack} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">&larr; Kembali</button>
    <Card>
      <div className="text-xs font-bold text-slate-700 mb-2">Monitoring Satker / Satwil</div>
      {rows.length === 0 ? <EmptyState title="Belum ada data monitoring" /> : <MonitoringTable rows={rows} />}
    </Card>
  </div>
);

const RekomendasiFull: React.FC<{ entries: FindingLedgerEntry[]; onBack: () => void }> = ({ entries, onBack }) => (
  <div className="space-y-3">
    <button onClick={onBack} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">&larr; Kembali</button>
    <Card>
      <div className="text-xs font-bold text-slate-700 mb-3">Rekomendasi Audit</div>
      {entries.length === 0 ? (
        <EmptyState title="Belum ada rekomendasi" />
      ) : (
        <ul className="space-y-2.5">
          {entries.map((e) => (
            <li key={e.id} className="p-3 rounded-[10px] border border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between gap-2 mb-1">
                <span className="text-xs font-bold text-slate-800">{e.kode}</span>
                <Badge color={TINGKAT_COLOR[e.tingkat]}>{e.tingkat}</Badge>
              </div>
              <p className="text-xs text-slate-600">{e.rekomendasi}</p>
            </li>
          ))}
        </ul>
      )}
    </Card>
  </div>
);

/* ============================================================================================ *
 * Detail Temuan — read-only (BR: "Removed: status editing")
 * ============================================================================================ */
const DetailTemuanModal: React.FC<{ entry: FindingLedgerEntry; onClose: () => void }> = ({ entry, onClose }) => (
  <Modal isOpen onClose={onClose} title={`Detail Temuan — ${entry.kode}`} widthClassName="max-w-2xl" footer={<Button variant="outline" onClick={onClose}>Tutup</Button>}>
    <div className="space-y-3">
      <div className="p-2.5 rounded-[8px] bg-slate-50 border border-slate-200 text-[11px] text-slate-500">Tampilan detail bersifat baca-saja.</div>
      <div>
        <div className="text-[10px] font-bold uppercase text-slate-400">Uraian Temuan</div>
        <p className="text-sm font-bold text-slate-800 mt-0.5">{entry.judul}</p>
      </div>
      <div className="grid grid-cols-2 gap-3 text-xs">
        <div><div className="text-[10px] font-bold uppercase text-slate-400">Kategori</div><div className="font-bold text-slate-700 mt-0.5">{entry.kategori}</div></div>
        <div><div className="text-[10px] font-bold uppercase text-slate-400">Tingkat</div><Badge color={TINGKAT_COLOR[entry.tingkat]} className="mt-0.5">{entry.tingkat}</Badge></div>
        {entry.nilaiRupiah && <div className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-slate-400" /><span className="font-bold text-slate-700">{entry.nilaiRupiah}</span></div>}
        <div><div className="text-[10px] font-bold uppercase text-slate-400">AI Insight (Confidence)</div><div className="font-bold text-slate-700 mt-0.5">{entry.aiConfidence}%</div></div>
      </div>
      <div className="p-3 rounded-[10px] bg-blue-50 text-xs text-slate-800"><strong>Rekomendasi:</strong> {entry.rekomendasi}</div>
      <div>
        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Status Tindak Lanjut</div>
        <Timeline
          items={[
            { id: 'temuan', title: 'Temuan Ditetapkan', description: entry.judul, timestamp: entry.tglTemuan, tone: 'default' },
            ...entry.riwayatTindakLanjut.map((r, i) => ({ id: `tl-${i}`, title: r.status, description: r.catatan, timestamp: r.tgl, tone: (r.status === 'Selesai' ? 'success' : 'warning') as 'success' | 'warning' })),
          ]}
        />
      </div>
      {entry.label === 'Berulang' && (
        <div className="p-2.5 rounded-[8px] bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
          <RotateCcw className="w-3.5 h-3.5 shrink-0" /> Temuan ini merupakan pengulangan dari periode sebelumnya pada Satker yang sama.
        </div>
      )}
      <div>
        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1.5">Temuan Serupa (24 bulan terakhir)</div>
        <ul className="space-y-1.5">
          {similarFindings(entry).map((s) => (
            <li key={s.id} className="text-xs rounded-[10px] border border-slate-100 p-2.5 flex items-center justify-between gap-3">
              <div><div className="font-bold text-slate-800">{s.kode}</div><div className="text-slate-500">{s.judul}</div></div>
              <Badge color={STATUS_COLOR[s.status]}>{s.status}</Badge>
            </li>
          ))}
          {similarFindings(entry).length === 0 && <li className="text-xs text-slate-400">Tidak ditemukan temuan serupa.</li>}
        </ul>
      </div>
    </div>
  </Modal>
);

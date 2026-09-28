/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.2 Temuan BPK / B.3 Temuan IRSUS — landing bersama (SF-TI-014: pencarian >=3 karakter,
 * filter wilayah, kartu, muat lebih banyak) + 4 tab per Satker: Ringkasan / Analisis / Detail
 * Temuan / Tindak Lanjut (Plan "Align itwasum with Plane BA/SA", todo p3-b2b3). Detail Temuan
 * bersifat read-only (status/editing hanya dilakukan dari tab Tindak Lanjut) sesuai keputusan
 * "strip_contradict".
 */
import React, { useMemo, useState } from 'react';
import { AlertTriangle, Building2, CheckCircle2, ChevronRight, Clock, Coins, FileText, RotateCcw, Search as SearchIcon, Sparkles } from 'lucide-react';
import type { PoldaSatker } from '../../../types';
import { PoldaLogo } from '../../PoldaLogo';
import { useSearchMin } from '../../ui/useSearchMin';
import { buildExportFilename, simulateExport } from '../../../utils/simulateExport';
import {
  findingsForSatker,
  similarFindings,
  type FindingLedgerEntry,
  type TemuanSumberLedger,
  type TindakLanjutStatus,
} from '../../../data/domain/findingsLedger';
import {
  Badge,
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
  TabNavigation,
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

const TINGKAT_COLOR: Record<FindingLedgerEntry['tingkat'], BadgeColor> = {
  Kritis: 'danger',
  Sedang: 'warning',
  Ringan: 'neutral',
};

type SatkerSubTab = 'ringkasan' | 'analisis' | 'detail' | 'tindak-lanjut';

interface TemuanSumberScreenProps {
  sumber: TemuanSumberLedger;
  poldaList: PoldaSatker[];
  selectedPoldaId: string | null;
  onSelectPolda: (id: string | null) => void;
}

export const TemuanSumberScreen: React.FC<TemuanSumberScreenProps> = ({ sumber, poldaList, selectedPoldaId, onSelectPolda }) => {
  const [subTab, setSubTab] = useState<SatkerSubTab>('ringkasan');
  const selectedPolda = poldaList.find((p) => p.id === selectedPoldaId) ?? null;

  if (!selectedPolda) {
    return <TemuanLandingScreen sumber={sumber} poldaList={poldaList} onSelect={(id) => { onSelectPolda(id); setSubTab('ringkasan'); }} />;
  }

  const entries = findingsForSatker(selectedPolda.id, sumber);

  return (
    <div className="space-y-3">
      <button onClick={() => onSelectPolda(null)} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">&larr; Kembali ke Direktori Satker</button>
      <Card className="flex items-center gap-3">
        <PoldaLogo poldaId={selectedPolda.id} poldaSingkatan={selectedPolda.singkatan} poldaNama={selectedPolda.nama} size="lg" />
        <div>
          <div className="text-[10px] font-bold uppercase text-slate-400">{sumber === 'BPK RI' ? 'Temuan BPK RI' : 'Temuan Inspektorat Khusus (IRSUS)'}</div>
          <h2 className="text-sm font-black text-slate-900">{selectedPolda.nama}</h2>
        </div>
        <Badge color="primary" className="ml-auto">{entries.length} Temuan</Badge>
      </Card>

      <TabNavigation
        tabs={[
          { id: 'ringkasan', label: 'Ringkasan' },
          { id: 'analisis', label: 'Analisis' },
          { id: 'detail', label: 'Detail Temuan' },
          { id: 'tindak-lanjut', label: 'Tindak Lanjut' },
        ]}
        activeTab={subTab}
        onTabChange={(id) => setSubTab(id as SatkerSubTab)}
      />

      {subTab === 'ringkasan' && <RingkasanTab sumber={sumber} entries={entries} />}
      {subTab === 'analisis' && <AnalisisTab entries={entries} />}
      {subTab === 'detail' && <DetailTemuanTab sumber={sumber} satkerNama={selectedPolda.nama} entries={entries} />}
      {subTab === 'tindak-lanjut' && <TindakLanjutTab entries={entries} />}
    </div>
  );
};

/* ============================================================================================ *
 * Landing — direktori Satker (SF-TI-014)
 * ============================================================================================ */
const TemuanLandingScreen: React.FC<{ sumber: TemuanSumberLedger; poldaList: PoldaSatker[]; onSelect: (id: string) => void }> = ({ sumber, poldaList, onSelect }) => {
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

  return (
    <div className="space-y-4">
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
            const entries = findingsForSatker(p.id, sumber);
            const belumSelesai = entries.filter((e) => e.status !== 'Selesai').length;
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
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Total Temuan</div>
                    <div className="text-xs font-black text-slate-800">{entries.length}</div>
                  </div>
                  <div className="bg-slate-50 rounded-[10px] px-2.5 py-1.5">
                    <div className="text-[9px] font-bold text-slate-400 uppercase">Belum Tuntas</div>
                    <div className="text-xs font-black text-slate-800">{belumSelesai}</div>
                  </div>
                </div>
                <Button variant="outline" size="sm" className="w-full" onClick={() => onSelect(p.id)}>Lihat Temuan <ChevronRight className="w-3.5 h-3.5" /></Button>
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
 * Ringkasan (SF-TB/TI-001..005)
 * ============================================================================================ */
const RingkasanTab: React.FC<{ sumber: TemuanSumberLedger; entries: FindingLedgerEntry[] }> = ({ sumber, entries }) => {
  const totalNilai = entries.reduce((s, e) => s + (e.nilaiRupiah ? parseFloat(e.nilaiRupiah.replace(/[^\d.]/g, '')) || 0 : 0), 0);
  const berulang = entries.filter((e) => e.label === 'Berulang').length;
  const trendPct = entries.length ? Math.round((berulang / entries.length) * 100) : 0;
  const confidenceAvg = entries.length ? Math.round(entries.reduce((s, e) => s + e.aiConfidence, 0) / entries.length) : 0;

  return (
    <div className="space-y-4">
      <div className="rounded-[14px] p-5 text-white shadow-[0_4px_20px_rgba(0,34,101,0.25)] flex items-start gap-4" style={{ background: 'linear-gradient(135deg, var(--sd-primary) 0%, var(--sd-primary-container) 100%)' }}>
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1"><Sparkles className="w-4 h-4" /><span className="text-xs font-bold uppercase tracking-wide">Ringkasan Analisis AI</span></div>
          <p className="text-sm text-white/90 leading-relaxed">
            Dari {entries.length} temuan {sumber}, {berulang} ({trendPct}%) merupakan temuan berulang dari periode sebelumnya. Prioritaskan tindak lanjut pada temuan berstatus "Lewat Target" untuk mencegah eskalasi.
          </p>
        </div>
        <CircularProgress value={confidenceAvg} size={80} strokeWidth={6} caption="Confidence" displayValue={`${confidenceAvg}%`} />
      </div>

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

      <Card>
        <div className="text-xs font-bold text-slate-700 mb-2">Rekomendasi Prioritas</div>
        <ul className="space-y-1.5">
          {entries.slice(0, 3).map((e) => (
            <li key={e.id} className="text-xs text-slate-600 flex items-start gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
              <span><strong>{e.kode}</strong> — {e.rekomendasi}</span>
            </li>
          ))}
        </ul>
      </Card>

      <Card>
        <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5" /> Dokumen Terkait</div>
        <ul className="text-xs text-slate-500 space-y-1">
          {Array.from(new Set(entries.flatMap((e) => e.dokumenTerkait))).slice(0, 5).map((d) => <li key={d}>{d}</li>)}
        </ul>
      </Card>
    </div>
  );
};

/* ============================================================================================ *
 * Analisis (SF-006..008)
 * ============================================================================================ */
const AnalisisTab: React.FC<{ entries: FindingLedgerEntry[] }> = ({ entries }) => {
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

  const [selected, setSelected] = useState<FindingLedgerEntry | null>(entries[0] ?? null);

  return (
    <div className="grid lg:grid-cols-2 gap-4">
      <Card>
        <div className="text-xs font-bold text-slate-700 mb-3">Distribusi Kategori Temuan</div>
        {byKategori.length === 0 ? <EmptyState title="Belum ada data" /> : <DonutChart segments={byKategori} />}
      </Card>
      <Card>
        <div className="text-xs font-bold text-slate-700 mb-3">Analisis Akar Masalah</div>
        {akarMasalah.length === 0 ? <EmptyState title="Belum ada data" /> : <HorizontalMetricChart items={akarMasalah} />}
      </Card>
      <Card className="lg:col-span-2">
        <div className="text-xs font-bold text-slate-700 mb-2">Temuan Serupa</div>
        <select
          className="w-full h-10 rounded-[10px] border border-[var(--sd-outline-variant)] bg-white px-3 text-sm mb-3"
          value={selected?.id ?? ''}
          onChange={(e) => setSelected(entries.find((x) => x.id === e.target.value) ?? null)}
        >
          {entries.map((e) => <option key={e.id} value={e.id}>{e.kode} — {e.judul}</option>)}
        </select>
        {selected ? (
          <ul className="space-y-2">
            {similarFindings(selected).map((s) => (
              <li key={s.id} className="text-xs rounded-[10px] border border-slate-100 p-2.5 flex items-center justify-between gap-3">
                <div>
                  <div className="font-bold text-slate-800">{s.kode}</div>
                  <div className="text-slate-500">{s.judul}</div>
                </div>
                <Badge color={STATUS_COLOR[s.status]}>{s.status}</Badge>
              </li>
            ))}
            {similarFindings(selected).length === 0 && <EmptyState title="Tidak ditemukan temuan serupa dalam 24 bulan terakhir" />}
          </ul>
        ) : (
          <EmptyState title="Belum ada temuan pada Satker ini" />
        )}
      </Card>
    </div>
  );
};

/* ============================================================================================ *
 * Detail Temuan (SF-011..013) — read-only, tanpa edit status/upload
 * ============================================================================================ */
const DetailTemuanTab: React.FC<{ sumber: TemuanSumberLedger; satkerNama: string; entries: FindingLedgerEntry[] }> = ({ sumber, satkerNama, entries }) => {
  const [search, setSearch] = useState('');
  const [tingkatFilter, setTingkatFilter] = useState('');
  const [jenisAuditFilter, setJenisAuditFilter] = useState('');
  const [pageSizeChoice, setPageSizeChoice] = useState<5 | 10>(10);
  const [detailTarget, setDetailTarget] = useState<FindingLedgerEntry | null>(null);
  const [fullList, setFullList] = useState(false);

  const filtered = entries.filter((e) => {
    if (tingkatFilter && e.tingkat !== tingkatFilter) return false;
    if (sumber === 'Irsus' && jenisAuditFilter && e.jenisAudit !== jenisAuditFilter) return false;
    if (search && !e.judul.toLowerCase().includes(search.toLowerCase()) && !e.kode.toLowerCase().includes(search.toLowerCase())) return false;
    return true;
  });

  const { pageItems, page, setPage } = usePagination(filtered, fullList ? 100 : pageSizeChoice);

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
      <FilterPanel
        search={{ value: search, onChange: setSearch, placeholder: 'Cari kode/judul temuan...' }}
        fields={[
          { type: 'select', key: 'tingkat', label: 'Tingkat', value: tingkatFilter, onChange: setTingkatFilter, placeholder: 'Semua Tingkat', options: ['Kritis', 'Sedang', 'Ringan'].map((t) => ({ value: t, label: t })) },
          ...(sumber === 'Irsus' ? [{ type: 'select' as const, key: 'jenisAudit', label: 'Jenis Audit', value: jenisAuditFilter, onChange: setJenisAuditFilter, placeholder: 'Semua Jenis Audit', options: ['Reguler', 'Khusus', 'Tematik'].map((j) => ({ value: j, label: j })) }] : []),
        ]}
        headerActions={
          <div className="flex items-center gap-2">
            <SegmentedControl options={[{ value: '5', label: '5/hal' }, { value: '10', label: '10/hal' }]} value={String(pageSizeChoice)} onChange={(v) => setPageSizeChoice(Number(v) as 5 | 10)} />
            <Button variant="outline" size="sm" onClick={() => setFullList((v) => !v)}>{fullList ? 'Tampilkan Berpaginasi' : 'Lihat Semua'}</Button>
            <Button
              size="sm"
              onClick={() =>
                simulateExport({
                  filename: buildExportFilename([`Daftar_Temuan_${sumber === 'BPK RI' ? 'BPK' : 'IRSUS'}`, satkerNama, new Date().toISOString().slice(0, 10)]),
                  format: 'xlsx',
                })
              }
            >
              Ekspor XLSX
            </Button>
          </div>
        }
      />
      {filtered.length === 0 ? (
        <EmptyState title="Tidak ada temuan yang cocok" icon={<AlertTriangle className="w-6 h-6 text-slate-300" />} />
      ) : (
        <Card>
          <Table columns={columns} data={pageItems} rowKey={(e) => e.id} />
          {!fullList && <Pagination currentPage={page} totalItems={filtered.length} pageSize={pageSizeChoice} onPageChange={setPage} className="mt-2" itemLabel="temuan" />}
        </Card>
      )}

      {detailTarget && (
        <Modal isOpen onClose={() => setDetailTarget(null)} title={`Detail Temuan — ${detailTarget.kode}`} widthClassName="max-w-2xl" footer={<Button variant="outline" onClick={() => setDetailTarget(null)}>Tutup</Button>}>
          <div className="space-y-3">
            <div className="p-2.5 rounded-[8px] bg-slate-50 border border-slate-200 text-[11px] text-slate-500">Tampilan detail bersifat baca-saja. Perubahan status dilakukan pada tab "Tindak Lanjut".</div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Uraian Temuan</div>
              <p className="text-sm font-bold text-slate-800 mt-0.5">{detailTarget.judul}</p>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div><div className="text-[10px] font-bold uppercase text-slate-400">Kategori</div><div className="font-bold text-slate-700 mt-0.5">{detailTarget.kategori}</div></div>
              <div><div className="text-[10px] font-bold uppercase text-slate-400">Tingkat</div><Badge color={TINGKAT_COLOR[detailTarget.tingkat]} className="mt-0.5">{detailTarget.tingkat}</Badge></div>
              {detailTarget.nilaiRupiah && <div className="flex items-center gap-1"><Coins className="w-3.5 h-3.5 text-slate-400" /><span className="font-bold text-slate-700">{detailTarget.nilaiRupiah}</span></div>}
              <div><div className="text-[10px] font-bold uppercase text-slate-400">AI Insight (Confidence)</div><div className="font-bold text-slate-700 mt-0.5">{detailTarget.aiConfidence}%</div></div>
            </div>
            <div className="p-3 rounded-[10px] bg-blue-50 text-xs text-slate-800"><strong>Rekomendasi:</strong> {detailTarget.rekomendasi}</div>
            <Timeline
              items={[
                { id: 'temuan', title: 'Temuan Ditetapkan', description: detailTarget.judul, timestamp: detailTarget.tglTemuan, tone: 'default' },
                ...detailTarget.riwayatTindakLanjut.map((r, i) => ({ id: `tl-${i}`, title: r.status, description: r.catatan, timestamp: r.tgl, tone: (r.status === 'Selesai' ? 'success' : 'warning') as 'success' | 'warning' })),
              ]}
            />
            {detailTarget.label === 'Berulang' && (
              <div className="p-2.5 rounded-[8px] bg-amber-50 border border-amber-200 text-xs text-amber-800 flex items-center gap-2">
                <RotateCcw className="w-3.5 h-3.5 shrink-0" /> Temuan ini merupakan pengulangan dari periode sebelumnya pada Satker yang sama.
              </div>
            )}
          </div>
        </Modal>
      )}
    </div>
  );
};

/* ============================================================================================ *
 * Tindak Lanjut (SF-009/010) — monitoring per satker, satu-satunya tempat mengubah status
 * ============================================================================================ */
const TindakLanjutTab: React.FC<{ entries: FindingLedgerEntry[] }> = ({ entries }) => {
  const [, forceTick] = useState(0);
  const [toast, setToast] = useState<string | null>(null);

  const columns: TableColumn<FindingLedgerEntry>[] = [
    { key: 'kode', header: 'Kode', render: (e) => <span className="font-mono text-[11px] text-slate-400">{e.kode}</span> },
    { key: 'judul', header: 'Uraian Temuan', render: (e) => <span className="font-bold text-slate-800">{e.judul}</span> },
    { key: 'tenggat', header: 'Tenggat', render: (e) => e.tenggat },
    {
      key: 'status',
      header: 'Status Tindak Lanjut',
      render: (e) => (
        <select
          value={e.status}
          onChange={(ev) => {
            e.status = ev.target.value as TindakLanjutStatus;
            e.riwayatTindakLanjut = [...e.riwayatTindakLanjut, { tgl: new Date().toLocaleDateString('id-ID'), status: e.status, catatan: `Status diperbarui menjadi "${e.status}".` }];
            setToast(`Status temuan ${e.kode} diperbarui menjadi "${e.status}".`);
            setTimeout(() => setToast(null), 3500);
            forceTick((v) => v + 1);
          }}
          className="h-8 rounded-[8px] border border-[var(--sd-outline-variant)] bg-white px-2 text-xs font-bold"
        >
          {(['Belum Ditindaklanjuti', 'Dalam Proses', 'Selesai', 'Lewat Target'] as TindakLanjutStatus[]).map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
      ),
    },
  ];

  const counts = (['Selesai', 'Dalam Proses', 'Belum Ditindaklanjuti', 'Lewat Target'] as TindakLanjutStatus[]).map((s) => ({ status: s, count: entries.filter((e) => e.status === s).length }));

  return (
    <div className="space-y-3">
      {toast && <div className="p-2.5 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">{toast}</div>}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {counts.map((c) => (
          <StatCard key={c.status} label={c.status} value={c.count} />
        ))}
      </div>
      {entries.length === 0 ? (
        <EmptyState title="Belum ada temuan pada Satker ini" icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />} />
      ) : (
        <Card><Table columns={columns} data={entries} rowKey={(e) => e.id} /></Card>
      )}
    </div>
  );
};

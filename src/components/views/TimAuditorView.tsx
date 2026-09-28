/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Modul B.6 - Daftar Auditor (ditulis ulang, Plan bagian 5d). List (`#/b6`) + Detail
 * (`#/b6/{auditorId}`) + modal "Tambah Data Auditor" 2 tab, mereplikasi
 * `origin/development:src/app/auditors/` dengan tangan (bukan salinan file, dibaca read-only
 * via `git show origin/development:<path>`). Tab "Monitoring Kapasitas Beban Kerja" versi lama
 * dipertahankan sebagai tab tambahan pada daftar karena datanya dipakai modul B.14.
 */
import React, { useMemo, useState } from 'react';
import {
  Users,
  Plus,
  CheckCircle2,
  X,
  ChevronRight,
  ArrowLeft,
  RefreshCw,
  Printer,
  Mail,
  Phone,
  GraduationCap,
  MapPin,
  CalendarClock,
  Download,
  ShieldAlert,
  Camera,
} from 'lucide-react';
import { AuditorData, CurrentUserProfile } from '../../types';
import { AUDITOR_LIST } from '../../data/mockData';
import auditorProfileImg from '../../assets/images/auditor_profile_1787852939070.jpg';
import { createSeededRng } from '../../utils/seededRandom';
import { buildExportFilename, simulateExport } from '../../utils/simulateExport';
import { Badge, AuditorAvatar, Button, Card, Input, Select, Typography } from '../ui/atoms';
import { EmptyState, FilterField, FilterPanel, Modal, Pagination, SegmentedControl, StatCard, TabNavigation, usePagination } from '../ui/molecules';
import { HorizontalMetricChart, HorizontalMetricItem } from '../ui/charts';

interface TimAuditorViewProps {
  currentUser?: CurrentUserProfile;
  subPath?: string;
  onSubPathChange?: (subPath?: string) => void;
}

/** Auditor eksternal (didaftarkan via modal "Tambah Data Auditor") tidak memiliki data induk
 * SSDM — NRP-nya karenanya dapat diubah; personel organik (seluruh data seed) mengunci NRP. */
export function isAuditorOrganik(a: AuditorData): boolean {
  return a.isOrganik ?? a.klasifikasi !== 'Auditor Eksternal';
}

const ACTIVE_STATUSES: AuditorData['status'][] = ['Tersedia', 'Sedang Tugas'];

export const TimAuditorView: React.FC<TimAuditorViewProps> = ({ currentUser, subPath, onSubPathChange }) => {
  const [auditorList, setAuditorList] = useState<AuditorData[]>(AUDITOR_LIST);
  const navigate = onSubPathChange ?? (() => {});

  // Akses self-only (Plan p4-b6): peran "auditor" hanya dapat melihat profil dirinya sendiri,
  // dicocokkan lewat NRP akun (tidak ada field id auditor pada akun demo).
  const ownAuditor = currentUser?.peran === 'auditor' ? auditorList.find((a) => a.nrp === currentUser.nrp) : undefined;
  if (currentUser?.peran === 'auditor') {
    return <AuditorDetailScreen auditor={ownAuditor} onBack={() => {}} selfOnly />;
  }

  if (subPath) {
    const auditor = auditorList.find((a) => a.id === subPath);
    return <AuditorDetailScreen auditor={auditor} onBack={() => navigate(undefined)} />;
  }

  return (
    <AuditorListScreen
      currentUser={currentUser}
      auditorList={auditorList}
      setAuditorList={setAuditorList}
      onOpenDetail={(id) => navigate(id)}
    />
  );
};

/* ============================================================================================ *
 * List (#/b6)
 * ============================================================================================ */

const STATUS_BADGE_COLOR: Record<AuditorData['status'], 'success' | 'warning' | 'neutral' | 'danger' | 'info'> = {
  Tersedia: 'success',
  'Sedang Tugas': 'warning',
  Cuti: 'info',
  Sakit: 'info',
  Mutasi: 'neutral',
  'Tidak Aktif': 'danger',
};

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

const AUDITOR_STATUS_LIST: AuditorData['status'][] = ['Tersedia', 'Sedang Tugas', 'Cuti', 'Sakit', 'Mutasi', 'Tidak Aktif'];

const AuditorListScreen: React.FC<{
  currentUser?: CurrentUserProfile;
  auditorList: AuditorData[];
  setAuditorList: React.Dispatch<React.SetStateAction<AuditorData[]>>;
  onOpenDetail: (id: string) => void;
}> = ({ currentUser, auditorList, setAuditorList, onOpenDetail }) => {
  const [mainTab, setMainTab] = useState<'daftar' | 'beban' | 'keahlian'>('daftar');
  const [search, setSearch] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [filterSatker, setFilterSatker] = useState('');
  const [filterPendidikan, setFilterPendidikan] = useState('');
  const [filterBidang, setFilterBidang] = useState('');
  // BR B.6 Directory: toggle AND/OR antar filter aktif (Plan p4-b6).
  const [filterMode, setFilterMode] = useState<'AND' | 'OR'>('AND');
  const [showModal, setShowModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const jabatanOptions = useMemo(() => Array.from(new Set(auditorList.map((a) => a.jabatan))).map((v) => ({ value: v, label: v })), [auditorList]);
  const satkerOptions = useMemo(() => Array.from(new Set(auditorList.map((a) => a.satker || a.subdit))).map((v) => ({ value: v, label: v })), [auditorList]);
  const pendidikanOptions = useMemo(() => Array.from(new Set(auditorList.map((a) => a.pendidikanKepolisian).filter(Boolean))).map((v) => ({ value: v as string, label: v as string })), [auditorList]);
  const bidangOptions = useMemo(
    () => Array.from(new Set(auditorList.flatMap((a) => a.keahlianKhusus || a.sertifikasi))).map((v) => ({ value: v, label: v })),
    [auditorList]
  );

  const filtered = auditorList.filter((a) => {
    const matchSearch = !search || a.nama.toLowerCase().includes(search.toLowerCase()) || a.nrp.includes(search) || (a.satker || a.subdit).toLowerCase().includes(search.toLowerCase());
    const matchJabatan = !filterJabatan || a.jabatan === filterJabatan;
    const matchSatker = !filterSatker || (a.satker || a.subdit) === filterSatker;
    const matchPendidikan = !filterPendidikan || a.pendidikanKepolisian === filterPendidikan;
    const matchBidang = !filterBidang || (a.keahlianKhusus || a.sertifikasi).includes(filterBidang);
    const activeChecks = [
      [filterJabatan, matchJabatan],
      [filterSatker, matchSatker],
      [filterPendidikan, matchPendidikan],
      [filterBidang, matchBidang],
    ].filter(([f]) => !!f) as [string, boolean][];
    const filtersOk = activeChecks.length === 0 ? true : filterMode === 'AND' ? activeChecks.every(([, ok]) => ok) : activeChecks.some(([, ok]) => ok);
    return matchSearch && filtersOk;
  });

  const { pageItems, page, totalPages, setPage } = usePagination(filtered, 5);

  const totalAuditor = auditorList.length;
  const totalSedangBertugas = auditorList.filter((a) => a.status === 'Sedang Tugas').length;

  const sertifikatMonitoring = auditorList
    .flatMap((a) => (a.sertifikat || []).map((s) => ({ auditorNama: a.nama, ...s, sisaHari: daysUntil(s.tanggalKadaluarsa) })))
    .filter((s) => s.sisaHari <= 90)
    .sort((a, b) => a.sisaHari - b.sisaHari);

  const keahlianCounts = useMemo(() => {
    const counts = new Map<string, number>();
    auditorList.forEach((a) => (a.keahlianKhusus || []).forEach((k) => counts.set(k, (counts.get(k) || 0) + 1)));
    return Array.from(counts.entries()).sort((a, b) => b[1] - a[1]);
  }, [auditorList]);

  // BR B.6: persentase kompetensi hanya menghitung auditor berstatus aktif (Tersedia/Sedang
  // Tugas), tidak termasuk Cuti/Sakit/Mutasi/Tidak Aktif (Plan p4-b6).
  const activeAuditors = auditorList.filter((a) => ACTIVE_STATUSES.includes(a.status));

  const kompetensiItems: HorizontalMetricItem[] = keahlianCounts.map(([label, value]) => ({
    id: label,
    label,
    percent: activeAuditors.length ? (value / activeAuditors.length) * 100 : 0,
    displayValue: `${value} Auditor`,
    color: 'var(--sd-primary)',
  }));

  const filterFields: FilterField[] = [
    { key: 'jabatan', label: 'Jabatan', type: 'select', value: filterJabatan, onChange: setFilterJabatan, options: jabatanOptions, placeholder: 'Semua Jabatan' },
    { key: 'satker', label: 'Satker', type: 'select', value: filterSatker, onChange: setFilterSatker, options: satkerOptions, placeholder: 'Semua Satker' },
    { key: 'pendidikan', label: 'Pendidikan', type: 'select', value: filterPendidikan, onChange: setFilterPendidikan, options: pendidikanOptions, placeholder: 'Semua Pendidikan' },
    { key: 'bidang', label: 'Bidang Kompetensi', type: 'select', value: filterBidang, onChange: setFilterBidang, options: bidangOptions, placeholder: 'Semua Bidang' },
  ];

  const handleCreate = (created: AuditorData) => {
    setAuditorList((prev) => [created, ...prev]);
    setShowModal(false);
    setSuccessToast(`Data Auditor ${created.nama} berhasil ditambahkan ke sistem.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-4">
      {successToast && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {currentUser?.peran === 'pengawas_tim' && (
        <div className="p-3.5 rounded-[12px] bg-blue-50 border border-blue-200 text-xs text-[#0B2B5C] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <Users className="w-4 h-4 text-blue-700 shrink-0" />
            <span><strong>Susunan Tim Audit ST/412/VIII/WAS.1.1/2026:</strong> Memantau komposisi pemeriksa, status beban kerja, dan sertifikasi personel tim audit Polda Riau.</span>
          </div>
          <Badge color="primary">Tim Audit Aktif</Badge>
        </div>
      )}

      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <Typography variant="headline-md">Daftar Auditor</Typography>
          <p className="text-xs text-slate-500 mt-0.5">Melakukan pencarian data personel dalam basis data SSOT Itwasum.</p>
        </div>
        <div className="flex items-center gap-2 shrink-0">
          <Button
            variant="outline"
            onClick={() =>
              simulateExport({ filename: buildExportFilename(['Direktori_Auditor', new Date().toISOString().slice(0, 10)]), format: 'xlsx' })
            }
          >
            <Download className="w-4 h-4" />Export XLSX
          </Button>
          <Button
            variant="outline"
            onClick={() =>
              simulateExport({ filename: buildExportFilename(['Direktori_Auditor', new Date().toISOString().slice(0, 10)]), format: 'pdf' })
            }
          >
            <Download className="w-4 h-4" />Export PDF
          </Button>
          <Button variant="primary" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" />Tambah Data Auditor</Button>
        </div>
      </Card>

      <TabNavigation
        tabs={[{ id: 'daftar', label: 'Daftar Auditor' }, { id: 'beban', label: 'Monitoring Kapasitas Beban Kerja' }, { id: 'keahlian', label: 'Master Keahlian' }]}
        activeTab={mainTab}
        onTabChange={(id) => setMainTab(id as typeof mainTab)}
      />

      {mainTab === 'daftar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatCard label="Total Auditor" value={totalAuditor} footer={<div className="flex items-center justify-between mt-1"><span className="text-[11px] text-slate-400">Siap Diterbitkan Sprin</span><Badge color="success">Tersedia</Badge></div>} />
            <StatCard label="Total Sedang Bertugas" value={totalSedangBertugas} footer={<div className="flex items-center justify-between mt-1"><span className="text-[11px] text-slate-400">Aktif Audit Lapangan</span><Badge color="warning">On Duty</Badge></div>} />
          </div>

          <datalist id="auditor-search-suggestions">
            {auditorList.map((a) => <option key={a.id} value={a.nama} />)}
          </datalist>
          <FilterPanel
            fields={filterFields}
            search={{ value: search, onChange: setSearch, placeholder: 'Cari nama auditor, NRP, atau satker...', listId: 'auditor-search-suggestions' }}
            onApply={() => setPage(1)}
            headerActions={
              <div className="flex items-center gap-2 text-xs font-bold text-slate-600">
                <span>Mode Filter:</span>
                <SegmentedControl options={[{ value: 'AND', label: 'AND' }, { value: 'OR', label: 'OR' }]} value={filterMode} onChange={(v) => setFilterMode(v as 'AND' | 'OR')} />
              </div>
            }
          />

          <Card className="p-0 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse text-sm">
                <thead className="bg-[var(--sd-surface)] text-[11px] font-bold uppercase tracking-wide text-slate-500">
                  <tr>
                    <th className="px-4 py-3">No</th>
                    <th className="px-4 py-3">Nama / Nrp</th>
                    <th className="px-4 py-3">Pangkat / Jabatan</th>
                    <th className="px-4 py-3">Satker</th>
                    <th className="px-4 py-3">Bidang Kompetensi</th>
                    <th className="px-4 py-3">Status</th>
                    <th className="px-4 py-3 text-right">Aksi</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {pageItems.map((a, i) => (
                    <tr key={a.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-4 py-3 text-slate-400">{(page - 1) * 5 + i + 1}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-2.5">
                          <AuditorAvatar name={a.nama} photoUrl={a.id === 'aud-1' ? auditorProfileImg : a.fotoUrl} status={a.status === 'Sedang Tugas' ? 'tugas' : 'aktif'} />
                          <div>
                            <div className="font-bold text-slate-900">{a.nama}</div>
                            <div className="text-[11px] text-slate-400 font-mono">NRP: {a.nrp}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-semibold text-slate-700">{a.pangkat}</div>
                        <div className="text-[11px] text-slate-400">{a.jabatan}</div>
                      </td>
                      <td className="px-4 py-3 text-slate-600">{a.satker || a.subdit}</td>
                      <td className="px-4 py-3">
                        <div className="flex flex-wrap gap-1 max-w-[220px]">
                          {(a.keahlianKhusus || a.sertifikasi).slice(0, 2).map((s) => (
                            <Badge key={s} color="neutral">{s}</Badge>
                          ))}
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <select
                          value={a.status}
                          onChange={(e) => {
                            const nextStatus = e.target.value as AuditorData['status'];
                            setAuditorList((prev) => prev.map((x) => (x.id === a.id ? { ...x, status: nextStatus } : x)));
                          }}
                          className={`h-7 rounded-[6px] border border-[var(--sd-outline-variant)] bg-white px-1.5 text-[11px] font-bold`}
                        >
                          {AUDITOR_STATUS_LIST.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        {!isAuditorOrganik(a) && <Badge color="indigo" className="ml-1">Eksternal</Badge>}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <Button variant="ghost" size="sm" onClick={() => onOpenDetail(a.id)}>Lihat Profil <ChevronRight className="w-3.5 h-3.5" /></Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            <div className="p-3 border-t border-[var(--sd-outline-variant)]/40">
              <Pagination currentPage={page} totalItems={filtered.length} pageSize={5} onPageChange={setPage} itemLabel="dokumen" />
            </div>
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3 flex-wrap gap-2">
              <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Pemantauan Masa Berlaku Sertifikasi</Typography>
              <div className="flex items-center gap-3 text-[11px] font-bold text-slate-500">
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-rose-500" />&lt; 30 Days</span>
                <span className="flex items-center gap-1.5"><span className="w-2 h-2 rounded-full bg-amber-500" />&lt; 90 Days</span>
              </div>
            </div>
            {sertifikatMonitoring.length === 0 ? (
              <EmptyState title="Tidak ada data sertifikasi." icon={<CalendarClock className="w-6 h-6 text-slate-300" />} />
            ) : (
              <div className="space-y-2">
                {sertifikatMonitoring.map((s, i) => (
                  <div key={`${s.auditorNama}-${s.nama}-${i}`} className="flex items-center justify-between gap-3 p-2.5 rounded-[10px] bg-slate-50 border border-slate-100">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{s.nama}</div>
                      <div className="text-[11px] text-slate-400 truncate">{s.auditorNama}</div>
                    </div>
                    <Badge color={s.sisaHari <= 30 ? 'danger' : 'warning'} className="shrink-0">{s.sisaHari <= 0 ? 'Kadaluarsa' : `${s.sisaHari} hari`}</Badge>
                  </div>
                ))}
              </div>
            )}
          </Card>

          <Card>
            <div className="flex items-center justify-between mb-3">
              <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Sebaran Kompetensi Keahlian Khusus</Typography>
              <Badge color="primary">Total: {totalAuditor} Auditor</Badge>
            </div>
            {kompetensiItems.length === 0 ? <EmptyState title="Belum ada data keahlian khusus." /> : <HorizontalMetricChart items={kompetensiItems} />}
          </Card>
        </div>
      )}

      {mainTab === 'beban' && <MonitoringKapasitasSection auditorList={auditorList} />}
      {mainTab === 'keahlian' && <MasterKeahlianSection />}

      <TambahAuditorModal isOpen={showModal} onClose={() => setShowModal(false)} onSave={handleCreate} />
    </div>
  );
};

const MonitoringKapasitasSection: React.FC<{ auditorList: AuditorData[] }> = ({ auditorList }) => (
  <Card className="space-y-3">
    <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Monitoring Kapasitas Beban Kerja Tim Auditor</Typography>
    <p className="text-xs text-slate-500">Pemerataan beban penugasan audit untuk menjaga kualitas dan objektivitas pengawasan:</p>
    <div className="space-y-3">
      {auditorList.map((aud) => {
        const percent = (aud.bebanAktif / aud.kapasitasMaksimal) * 100;
        return (
          <div key={aud.id} className="p-3.5 rounded-[10px] border border-[var(--sd-outline-variant)]/50 bg-slate-50 flex items-center justify-between gap-4 flex-wrap">
            <div className="min-w-[220px]">
              <div className="font-bold text-sm text-slate-900">{aud.nama}</div>
              <div className="text-[11px] text-slate-500">{aud.pangkat} • {aud.satker || aud.subdit}</div>
            </div>
            <div className="flex-1 min-w-[200px] max-w-md">
              <div className="flex items-center justify-between text-xs font-bold text-slate-700 mb-1">
                <span>Beban Kerja ({aud.bebanAktif}/{aud.kapasitasMaksimal} Satker)</span>
                <span>{percent.toFixed(0)}%</span>
              </div>
              <div className="w-full h-2 rounded-full bg-slate-200 overflow-hidden">
                <div className={`h-full rounded-full ${percent >= 75 ? 'bg-rose-600' : percent >= 50 ? 'bg-amber-500' : 'bg-emerald-600'}`} style={{ width: `${percent}%` }} />
              </div>
            </div>
            <Badge color={percent >= 75 ? 'danger' : 'success'}>{percent >= 75 ? 'Kapasitas Penuh' : 'Dapat Ditugaskan'}</Badge>
          </div>
        );
      })}
    </div>
  </Card>
);

/** B.6 Master Keahlian — CRUD nama keahlian, unik tanpa memandang huruf besar/kecil (Plan
 * p4-b6). Disimpan localStorage terpisah dari `AUDITOR_LIST` (demo, frontend-only). */
const MASTER_KEAHLIAN_KEY = 'itwasum_master_keahlian_v1';
const DEFAULT_KEAHLIAN = ['Audit Forensik', 'Audit Keuangan Negara', 'Audit TI/Cyber', 'Audit Sarpras & Logistik', 'Audit SDM & Kepegawaian'];

function loadMasterKeahlian(): string[] {
  try {
    const raw = localStorage.getItem(MASTER_KEAHLIAN_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return DEFAULT_KEAHLIAN;
}

const MasterKeahlianSection: React.FC = () => {
  const [list, setList] = useState<string[]>(loadMasterKeahlian);
  const [input, setInput] = useState('');
  const [editing, setEditing] = useState<{ index: number; value: string } | null>(null);
  const [error, setError] = useState('');

  const persist = (next: string[]) => {
    setList(next);
    try {
      localStorage.setItem(MASTER_KEAHLIAN_KEY, JSON.stringify(next));
    } catch {
      // storage unavailable — keep in-memory only
    }
  };

  const isDuplicate = (name: string, excludeIndex?: number) => list.some((k, i) => i !== excludeIndex && k.toLowerCase() === name.trim().toLowerCase());

  const handleAdd = () => {
    if (!input.trim()) return;
    if (isDuplicate(input)) return setError('Nama keahlian sudah ada (tidak membedakan huruf besar/kecil).');
    persist([...list, input.trim()]);
    setInput('');
    setError('');
  };

  const handleSaveEdit = () => {
    if (!editing || !editing.value.trim()) return;
    if (isDuplicate(editing.value, editing.index)) return setError('Nama keahlian sudah ada (tidak membedakan huruf besar/kecil).');
    persist(list.map((k, i) => (i === editing.index ? editing.value.trim() : k)));
    setEditing(null);
    setError('');
  };

  return (
    <Card className="space-y-3">
      <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Master Keahlian Khusus</Typography>
      {error && <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">{error}</div>}
      <div className="flex items-center gap-2.5">
        <Input placeholder="Tambahkan nama keahlian baru..." value={input} onChange={(e) => setInput(e.target.value)} />
        <Button variant="outline" onClick={handleAdd}><Plus className="w-4 h-4" />Tambah</Button>
      </div>
      <div className="space-y-1.5">
        {list.map((k, i) => (
          <div key={`${k}-${i}`} className="flex items-center justify-between gap-2 p-2.5 rounded-[10px] bg-slate-50 border border-slate-100">
            {editing?.index === i ? (
              <Input value={editing.value} onChange={(e) => setEditing({ index: i, value: e.target.value })} className="flex-1" />
            ) : (
              <span className="text-xs font-bold text-slate-800">{k}</span>
            )}
            <div className="flex items-center gap-2 shrink-0">
              {editing?.index === i ? (
                <>
                  <button onClick={handleSaveEdit} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">Simpan</button>
                  <button onClick={() => { setEditing(null); setError(''); }} className="text-[11px] font-bold text-slate-500 hover:underline">Batal</button>
                </>
              ) : (
                <>
                  <button onClick={() => setEditing({ index: i, value: k })} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">Ubah</button>
                  <button onClick={() => persist(list.filter((_, idx) => idx !== i))} className="text-[11px] font-bold text-rose-500 hover:underline">Hapus</button>
                </>
              )}
            </div>
          </div>
        ))}
        {list.length === 0 && <EmptyState title="Belum ada keahlian terdaftar" />}
      </div>
    </Card>
  );
};

/* ============================================================================================ *
 * Modal "Tambah Data Auditor" — 2 tab (Data Auditor / Keahlian Khusus)
 * ============================================================================================ */

const TambahAuditorModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (a: AuditorData) => void }> = ({ isOpen, onClose, onSave }) => {
  const [modalTab, setModalTab] = useState<'data' | 'keahlian'>('data');
  const [form, setForm] = useState({
    nama: '',
    nrp: '',
    pangkat: 'Kombes Pol',
    tmtPangkat: '',
    spesialisasi: '',
    sertifikasiSpesialisasi: '',
    tanggalKadaluarsa: '',
    jabatan: 'Auditor Kepolisian Madya',
    satker: 'Itbidjemen SDM',
    tempatTanggalLahir: '',
    pendidikanKepolisian: '',
    emailDinas: '',
    noHp: '',
  });
  const [sertifikatList, setSertifikatList] = useState<{ nama: string; tanggalKadaluarsa: string }[]>([]);
  const [keahlianInput, setKeahlianInput] = useState('');
  const [keahlianList, setKeahlianList] = useState<string[]>([]);

  const reset = () => {
    setForm({ nama: '', nrp: '', pangkat: 'Kombes Pol', tmtPangkat: '', spesialisasi: '', sertifikasiSpesialisasi: '', tanggalKadaluarsa: '', jabatan: 'Auditor Kepolisian Madya', satker: 'Itbidjemen SDM', tempatTanggalLahir: '', pendidikanKepolisian: '', emailDinas: '', noHp: '' });
    setSertifikatList([]);
    setKeahlianInput('');
    setKeahlianList([]);
    setModalTab('data');
  };

  const handleAddSertifikat = () => {
    if (!form.sertifikasiSpesialisasi || !form.tanggalKadaluarsa) return;
    setSertifikatList((prev) => [...prev, { nama: form.sertifikasiSpesialisasi, tanggalKadaluarsa: form.tanggalKadaluarsa }]);
    setForm((f) => ({ ...f, sertifikasiSpesialisasi: '', tanggalKadaluarsa: '' }));
  };

  const handleAddKeahlian = () => {
    if (!keahlianInput.trim()) return;
    setKeahlianList((prev) => [...prev, keahlianInput.trim()]);
    setKeahlianInput('');
  };

  const handleSubmit = () => {
    const created: AuditorData = {
      id: `aud-ext-${Date.now()}`,
      nama: form.nama || 'AKBP Pratama, S.I.K.',
      pangkat: form.pangkat,
      nrp: form.nrp || '82040999',
      jabatan: form.jabatan,
      subdit: form.satker,
      satker: form.satker,
      sertifikasi: sertifikatList.map((s) => s.nama),
      sertifikat: sertifikatList,
      bebanAktif: 0,
      kapasitasMaksimal: 4,
      status: 'Tersedia',
      satkerTugasAktif: 'Standby / Siap Tugas',
      totalAuditSelesai: 0,
      ratingKinerja: 95.0,
      tmtPangkat: form.tmtPangkat,
      tempatTanggalLahir: form.tempatTanggalLahir,
      pendidikanKepolisian: form.pendidikanKepolisian,
      emailDinas: form.emailDinas,
      noHp: form.noHp,
      keahlianKhusus: keahlianList,
      klasifikasi: 'Auditor Eksternal',
      penugasanYtd: 0,
    };
    onSave(created);
    reset();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={() => { onClose(); reset(); }}
      title="Tambah Data Auditor"
      widthClassName="max-w-2xl"
      footer={
        <div className="flex items-center justify-end gap-2">
          <Button variant="outline" onClick={() => { onClose(); reset(); }}>Batal</Button>
          <Button variant="primary" onClick={handleSubmit}>Daftarkan Auditor Eksternal</Button>
        </div>
      }
    >
      <div className="space-y-4">
        <SegmentedControl
          options={[{ value: 'data', label: 'Data Auditor' }, { value: 'keahlian', label: 'Keahlian Khusus' }]}
          value={modalTab}
          onChange={(v) => setModalTab(v as typeof modalTab)}
        />

        {modalTab === 'data' && (
          <div className="space-y-4">
            <fieldset className="space-y-2.5">
              <legend className="text-xs font-bold text-slate-600 uppercase mb-1">Foto Profil & Identitas Utama</legend>
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-[10px] bg-slate-100 border border-dashed border-slate-300 flex items-center justify-center text-slate-400 shrink-0">
                  <Camera className="w-5 h-5" />
                </div>
                <Button variant="outline" size="sm">Unggah Foto</Button>
              </div>
              <Input placeholder="Nama Lengkap & Gelar*" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
              <div className="grid grid-cols-2 gap-2.5">
                <Input placeholder="NRP / Nomor Kepegawaian*" value={form.nrp} onChange={(e) => setForm({ ...form, nrp: e.target.value })} />
                <Select value={form.pangkat} onChange={(v) => setForm({ ...form, pangkat: v })} options={['Kombes Pol', 'AKBP', 'Kompol', 'AKP'].map((p) => ({ value: p, label: p }))} />
              </div>
              <Input placeholder="TMT Pangkat* (contoh: 01 Juli 2024)" value={form.tmtPangkat} onChange={(e) => setForm({ ...form, tmtPangkat: e.target.value })} />
            </fieldset>

            <fieldset className="space-y-2.5">
              <legend className="text-xs font-bold text-slate-600 uppercase mb-1">Sertifikasi & Masa Berlaku</legend>
              <Input placeholder="Spesialisasi" value={form.spesialisasi} onChange={(e) => setForm({ ...form, spesialisasi: e.target.value })} />
              <div className="grid grid-cols-[1fr_140px_auto] gap-2.5">
                <Input placeholder="Sertifikasi Spesialisasi" value={form.sertifikasiSpesialisasi} onChange={(e) => setForm({ ...form, sertifikasiSpesialisasi: e.target.value })} />
                <Input type="date" value={form.tanggalKadaluarsa} onChange={(e) => setForm({ ...form, tanggalKadaluarsa: e.target.value })} />
                <Button variant="outline" size="sm" onClick={handleAddSertifikat}>Tambah Sertifikat</Button>
              </div>
              {sertifikatList.length > 0 && (
                <div className="flex flex-wrap gap-1.5">
                  {sertifikatList.map((s, i) => <Badge key={i} color="info">{s.nama} — {s.tanggalKadaluarsa}</Badge>)}
                </div>
              )}
            </fieldset>

            <fieldset className="space-y-2.5">
              <legend className="text-xs font-bold text-slate-600 uppercase mb-1">Jabatan & Penempatan Unit Kerja</legend>
              <Input placeholder="Jabatan Saat Ini*" value={form.jabatan} onChange={(e) => setForm({ ...form, jabatan: e.target.value })} />
              <Input placeholder="Unit Kerja / Satker*" value={form.satker} onChange={(e) => setForm({ ...form, satker: e.target.value })} />
            </fieldset>

            <fieldset className="space-y-2.5">
              <legend className="text-xs font-bold text-slate-600 uppercase mb-1">Kontak, Pendidikan & Tempat Lahir</legend>
              <Input placeholder="Tempat, Tgl Lahir*" value={form.tempatTanggalLahir} onChange={(e) => setForm({ ...form, tempatTanggalLahir: e.target.value })} />
              <Input placeholder="Pendidikan Kepolisian*" value={form.pendidikanKepolisian} onChange={(e) => setForm({ ...form, pendidikanKepolisian: e.target.value })} />
              <Input placeholder="Email Dinas*" value={form.emailDinas} onChange={(e) => setForm({ ...form, emailDinas: e.target.value })} />
              <Input placeholder="No. HP / Whatsapp*" value={form.noHp} onChange={(e) => setForm({ ...form, noHp: e.target.value })} />
            </fieldset>
          </div>
        )}

        {modalTab === 'keahlian' && (
          <div className="space-y-3">
            <div className="flex items-center gap-2.5">
              <Input placeholder="Tambahkan keahlian khusus..." value={keahlianInput} onChange={(e) => setKeahlianInput(e.target.value)} />
              <Button variant="outline" onClick={handleAddKeahlian}>Tambah Keahlian</Button>
            </div>
            <div className="text-xs font-bold text-slate-500">Daftar Keahlian Khusus ({keahlianList.length}):</div>
            <div className="flex flex-wrap gap-1.5">
              {keahlianList.map((k, i) => (
                <Badge key={i} color="primary" icon={<button onClick={() => setKeahlianList((prev) => prev.filter((_, idx) => idx !== i))}><X className="w-3 h-3" /></button>}>{k}</Badge>
              ))}
              {keahlianList.length === 0 && <span className="text-xs text-slate-400">Belum ada keahlian ditambahkan.</span>}
            </div>
          </div>
        )}
      </div>
    </Modal>
  );
};

/* ============================================================================================ *
 * Detail (#/b6/{auditorId})
 * ============================================================================================ */

/** Riwayat Penugasan sintetik-deterministik per auditor (mengikuti FSD "(Copy)" — Sprin popup
 * + link LHA), dibangkitkan dari seed id auditor bila data belum tersedia pada `mockData.ts`. */
function buildRiwayatPenugasan(auditor: AuditorData) {
  if (auditor.riwayatPenugasan && auditor.riwayatPenugasan.length > 0) return auditor.riwayatPenugasan;
  const rng = createSeededRng(`riwayat-penugasan-${auditor.id}`);
  const count = rng.int(2, 5);
  return Array.from({ length: count }, (_, i) => ({
    id: `${auditor.id}-tugas-${i}`,
    judul: rng.pick(['Wasrik Rutin Tahap I', 'Wasrik Rutin Tahap II', 'Audit Khusus Dugaan Penyimpangan', 'Audit Tematik Nasional']),
    peran: rng.pick(['Ketua Tim', 'Anggota Tim', 'Pengawas Tim']),
    noSprin: `Sprin/${rng.int(100, 999)}/${rng.pick(['VI', 'VII', 'VIII', 'IX'])}/2026`,
    tanggal: `${rng.int(1, 28)} ${rng.pick(['Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags'])} 2026`,
    lhaUrl: `LHA_${auditor.id}_${i}.pdf`,
  }));
}

const AuditorDetailScreen: React.FC<{ auditor?: AuditorData; onBack: () => void; selfOnly?: boolean }> = ({ auditor, onBack, selfOnly }) => {
  const [tab, setTab] = useState<'profil' | 'penugasan' | 'sertifikasi'>('profil');
  const [sprinPopup, setSprinPopup] = useState<{ noSprin: string; judul: string } | null>(null);
  const [pdfViewer, setPdfViewer] = useState<{ nama: string; ok: boolean } | null>(null);

  if (!auditor) {
    return (
      <EmptyState
        title={selfOnly ? 'Profil Anda belum terhubung ke data induk SSDM' : 'Auditor tidak ditemukan'}
        description={selfOnly ? 'Hubungi Admin Itwasum untuk menautkan akun Anda ke data Auditor.' : 'Data auditor mungkin telah dihapus atau id tidak valid.'}
        icon={<Users className="w-8 h-8 text-slate-300" />}
        action={!selfOnly ? <Button variant="outline" onClick={onBack}>Kembali ke Direktori</Button> : undefined}
      />
    );
  }

  const organik = isAuditorOrganik(auditor);
  const riwayat = buildRiwayatPenugasan(auditor);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        {selfOnly ? (
          <span className="text-xs font-bold text-slate-500">Profil Auditor Saya</span>
        ) : (
          <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[var(--sd-primary)] hover:underline">
            <ArrowLeft className="w-3.5 h-3.5" />Kembali ke Direktori
          </button>
        )}
        <span className="text-xs text-slate-400">Daftar Auditor / <span className="text-slate-700 font-bold">{auditor.nama}</span></span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm" disabled={!organik} title={!organik ? 'Auditor eksternal tidak memiliki data induk SSDM' : undefined}>
            <RefreshCw className="w-3.5 h-3.5" />Sinkronkan SSDM
          </Button>
          <Button variant="outline" size="sm"><Printer className="w-3.5 h-3.5" />Cetak Profil PDF</Button>
        </div>
      </div>

      <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative shrink-0">
          <AuditorAvatar name={auditor.nama} photoUrl={auditor.id === 'aud-1' ? auditorProfileImg : auditor.fotoUrl} size={64} />
          <Badge color="success" className="absolute -bottom-1 -right-1">AKTIF</Badge>
        </div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-1.5 mb-1.5">
            <Badge color="neutral">{auditor.pangkat} / NRP {auditor.nrp} {organik ? '(terkunci — data SSDM)' : ''}</Badge>
            {!organik && <Badge color="indigo">Auditor Eksternal</Badge>}
          </div>
          <h1 className="text-lg font-black text-slate-900 truncate">{auditor.nama}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{auditor.jabatan} • {auditor.satker || auditor.subdit}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge color="primary">Jabatan Saat Ini: {auditor.jabatan}</Badge>
            <Badge color="indigo">Unit Kerja: {auditor.satker || auditor.subdit}</Badge>
            <Badge color="teal">Klasifikasi: {auditor.klasifikasi || 'Auditor Internal'}</Badge>
            <Badge color={STATUS_BADGE_COLOR[auditor.status]}>Status: {auditor.status}</Badge>
          </div>
        </div>
      </Card>

      <TabNavigation
        tabs={[{ id: 'profil', label: 'Profil & Kompetensi' }, { id: 'penugasan', label: 'Riwayat Penugasan' }, { id: 'sertifikasi', label: 'Detail Kelompok Sertifikasi' }]}
        activeTab={tab}
        onTabChange={(id) => setTab(id as typeof tab)}
      />

      {tab === 'profil' && (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
          <Card className="lg:col-span-4 space-y-3">
            <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Integrasi Data Induk (SSDM)</Typography>
            <div className="space-y-2.5 text-xs">
              <div className="flex items-start gap-2"><CalendarClock className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><div><div className="text-slate-400">TMT Pangkat</div><div className="font-bold text-slate-800">{auditor.tmtPangkat || '—'}</div></div></div>
              <div className="flex items-start gap-2"><MapPin className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><div><div className="text-slate-400">Tempat, Tanggal Lahir</div><div className="font-bold text-slate-800">{auditor.tempatTanggalLahir || '—'}</div></div></div>
              <div className="flex items-start gap-2"><GraduationCap className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><div><div className="text-slate-400">Pendidikan Kepolisian</div><div className="font-bold text-slate-800">{auditor.pendidikanKepolisian || '—'}</div></div></div>
              <div className="flex items-start gap-2"><Mail className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><div><div className="text-slate-400">Email Dinas</div><div className="font-bold text-slate-800">{auditor.emailDinas || '—'}</div></div></div>
              <div className="flex items-start gap-2"><Phone className="w-3.5 h-3.5 text-slate-400 mt-0.5 shrink-0" /><div><div className="text-slate-400">No. HP / Whatsapp</div><div className="font-bold text-slate-800">{auditor.noHp || '—'}</div></div></div>
            </div>
          </Card>

          <Card className="lg:col-span-8 space-y-4">
            <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Kompetensi & Sertifikasi</Typography>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">Keahlian Khusus</div>
              <div className="flex flex-wrap gap-1.5">
                {(auditor.keahlianKhusus && auditor.keahlianKhusus.length > 0 ? auditor.keahlianKhusus : auditor.sertifikasi).map((k) => (
                  <Badge key={k} color="primary">{k}</Badge>
                ))}
              </div>
            </div>
            <div>
              <div className="text-[11px] font-bold text-slate-400 uppercase mb-1.5">Sertifikasi Aktif</div>
              {auditor.sertifikat && auditor.sertifikat.length > 0 ? (
                <div className="space-y-1.5">
                  {auditor.sertifikat.map((s, i) => {
                    const sisaHari = daysUntil(s.tanggalKadaluarsa);
                    return (
                      <div key={i} className="flex items-center justify-between p-2.5 rounded-[10px] bg-slate-50 border border-slate-100">
                        <span className="text-xs font-bold text-slate-800">{s.nama}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[11px] text-slate-400">Kadaluarsa {s.tanggalKadaluarsa}</span>
                          {sisaHari <= 90 && <Badge color={sisaHari <= 30 ? 'danger' : 'warning'}>{sisaHari <= 0 ? 'Kadaluarsa' : `${sisaHari} hari`}</Badge>}
                        </div>
                      </div>
                    );
                  })}
                </div>
              ) : (
                <EmptyState title="Tidak ada data sertifikasi." icon={<ShieldAlert className="w-5 h-5 text-slate-300" />} />
              )}
            </div>
          </Card>
        </div>
      )}

      {tab === 'penugasan' && (
        <Card className="space-y-3">
          <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Riwayat Penugasan Audit</Typography>
          {riwayat.length === 0 ? (
            <EmptyState title="Belum ada riwayat penugasan" />
          ) : (
            <ul className="space-y-2.5">
              {riwayat.map((r) => (
                <li key={r.id} className="flex items-start gap-3 p-3 rounded-[10px] border border-slate-100 bg-slate-50">
                  <CalendarClock className="w-4 h-4 text-slate-400 mt-0.5 shrink-0" />
                  <div className="flex-1 min-w-0">
                    <div className="text-xs font-bold text-slate-800">{r.judul} <span className="text-slate-400 font-normal">— {r.peran}</span></div>
                    <div className="text-[11px] text-slate-400 mt-0.5">{r.tanggal}</div>
                    <div className="flex items-center gap-3 mt-1.5">
                      <button onClick={() => setSprinPopup({ noSprin: r.noSprin, judul: r.judul })} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">Lihat Sprin</button>
                      {r.lhaUrl && <button onClick={() => setPdfViewer({ nama: r.lhaUrl!, ok: true })} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">Lihat LHA</button>}
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </Card>
      )}

      {tab === 'sertifikasi' && (
        <DetailKelompokSertifikasi auditor={auditor} onViewPdf={(nama, sizeMb) => setPdfViewer({ nama, ok: sizeMb <= 5 })} />
      )}

      {sprinPopup && (
        <Modal isOpen onClose={() => setSprinPopup(null)} title="Surat Perintah (Sprin)" footer={<Button onClick={() => setSprinPopup(null)}>Tutup</Button>}>
          <div className="text-xs text-slate-600 space-y-2">
            <p><strong>Nomor:</strong> {sprinPopup.noSprin}</p>
            <p><strong>Perihal:</strong> {sprinPopup.judul}</p>
            <p className="text-slate-400">Dokumen Sprin disimulasikan untuk keperluan demo — tidak ada berkas fisik yang terlampir.</p>
          </div>
        </Modal>
      )}

      {pdfViewer && (
        <Modal isOpen onClose={() => setPdfViewer(null)} title={`Pratinjau — ${pdfViewer.nama}`} footer={<Button onClick={() => setPdfViewer(null)}>Tutup</Button>}>
          {pdfViewer.ok ? (
            <div className="h-64 rounded-[10px] border-2 border-dashed border-slate-300 flex items-center justify-center text-xs text-slate-400">Pratinjau PDF disimulasikan (demo, tanpa berkas nyata).</div>
          ) : (
            <div className="p-3 rounded-[10px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">Berkas melebihi batas maksimum 5MB dan tidak dapat ditampilkan.</div>
          )}
        </Modal>
      )}
    </div>
  );
};

/** Certification — "Detail Kelompok Sertifikasi" dengan riwayat perubahan + ekspor log, dan
 * penampil PDF sertifikat dibatasi maksimum 5MB (Plan p4-b6). */
const DetailKelompokSertifikasi: React.FC<{ auditor: AuditorData; onViewPdf: (nama: string, sizeMb: number) => void }> = ({ auditor, onViewPdf }) => {
  const rng = useMemo(() => createSeededRng(`sertifikasi-history-${auditor.id}`), [auditor.id]);
  const history = useMemo(
    () =>
      (auditor.sertifikat ?? []).map((s) => ({
        nama: s.nama,
        perubahan: [
          { tgl: `${rng.int(1, 28)} Jan 2025`, aksi: 'Ditambahkan pertama kali', oleh: 'Admin SSDM' },
          { tgl: `${rng.int(1, 28)} Jan 2026`, aksi: `Diperbarui, kadaluarsa ditetapkan ${s.tanggalKadaluarsa}`, oleh: 'Admin SSDM' },
        ],
        sizeMb: rng.round(0.5, 7, 1),
      })),
    [auditor.sertifikat, rng]
  );

  return (
    <Card className="space-y-3">
      <div className="flex items-center justify-between">
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Detail Kelompok Sertifikasi</Typography>
        <Button
          variant="outline"
          size="sm"
          onClick={() => simulateExport({ filename: buildExportFilename(['Log_Sertifikasi', auditor.nama, new Date().toISOString().slice(0, 10)]), format: 'csv' })}
        >
          <Download className="w-3.5 h-3.5" />Ekspor Log
        </Button>
      </div>
      {history.length === 0 ? (
        <EmptyState title="Tidak ada data sertifikasi." icon={<ShieldAlert className="w-5 h-5 text-slate-300" />} />
      ) : (
        <div className="space-y-3">
          {history.map((h, i) => (
            <div key={i} className="p-3 rounded-[10px] border border-slate-100 bg-slate-50">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800">{h.nama}</span>
                <button onClick={() => onViewPdf(`${h.nama}.pdf`, h.sizeMb)} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">
                  Lihat Sertifikat PDF ({h.sizeMb} MB)
                </button>
              </div>
              <ul className="mt-2 space-y-1">
                {h.perubahan.map((p, pi) => (
                  <li key={pi} className="text-[11px] text-slate-500 flex items-center justify-between">
                    <span>{p.aksi} — <span className="text-slate-400">{p.oleh}</span></span>
                    <span className="font-mono text-slate-400">{p.tgl}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

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
import { Badge, AuditorAvatar, Button, Card, Input, Select, Typography } from '../ui/atoms';
import { EmptyState, FilterField, FilterPanel, Modal, Pagination, SegmentedControl, StatCard, TabNavigation, usePagination } from '../ui/molecules';
import { HorizontalMetricChart, HorizontalMetricItem } from '../ui/charts';

interface TimAuditorViewProps {
  currentUser?: CurrentUserProfile;
  subPath?: string;
  onSubPathChange?: (subPath?: string) => void;
}

export const TimAuditorView: React.FC<TimAuditorViewProps> = ({ currentUser, subPath, onSubPathChange }) => {
  const [auditorList, setAuditorList] = useState<AuditorData[]>(AUDITOR_LIST);
  const navigate = onSubPathChange ?? (() => {});

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

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr).getTime();
  const now = Date.now();
  return Math.ceil((target - now) / (1000 * 60 * 60 * 24));
}

const AuditorListScreen: React.FC<{
  currentUser?: CurrentUserProfile;
  auditorList: AuditorData[];
  setAuditorList: React.Dispatch<React.SetStateAction<AuditorData[]>>;
  onOpenDetail: (id: string) => void;
}> = ({ currentUser, auditorList, setAuditorList, onOpenDetail }) => {
  const [mainTab, setMainTab] = useState<'daftar' | 'beban'>('daftar');
  const [search, setSearch] = useState('');
  const [filterJabatan, setFilterJabatan] = useState('');
  const [filterSatker, setFilterSatker] = useState('');
  const [filterBidang, setFilterBidang] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const jabatanOptions = useMemo(() => Array.from(new Set(auditorList.map((a) => a.jabatan))).map((v) => ({ value: v, label: v })), [auditorList]);
  const satkerOptions = useMemo(() => Array.from(new Set(auditorList.map((a) => a.satker || a.subdit))).map((v) => ({ value: v, label: v })), [auditorList]);
  const bidangOptions = useMemo(
    () => Array.from(new Set(auditorList.flatMap((a) => a.keahlianKhusus || a.sertifikasi))).map((v) => ({ value: v, label: v })),
    [auditorList]
  );

  const filtered = auditorList.filter((a) => {
    const matchSearch = !search || a.nama.toLowerCase().includes(search.toLowerCase()) || a.nrp.includes(search) || (a.satker || a.subdit).toLowerCase().includes(search.toLowerCase());
    const matchJabatan = !filterJabatan || a.jabatan === filterJabatan;
    const matchSatker = !filterSatker || (a.satker || a.subdit) === filterSatker;
    const matchBidang = !filterBidang || (a.keahlianKhusus || a.sertifikasi).includes(filterBidang);
    return matchSearch && matchJabatan && matchSatker && matchBidang;
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

  const kompetensiItems: HorizontalMetricItem[] = keahlianCounts.map(([label, value]) => ({
    id: label,
    label,
    percent: totalAuditor ? (value / totalAuditor) * 100 : 0,
    displayValue: `${value} Auditor`,
    color: 'var(--sd-primary)',
  }));

  const filterFields: FilterField[] = [
    { key: 'jabatan', label: 'Jabatan', type: 'select', value: filterJabatan, onChange: setFilterJabatan, options: jabatanOptions, placeholder: 'Semua Jabatan' },
    { key: 'satker', label: 'Satker', type: 'select', value: filterSatker, onChange: setFilterSatker, options: satkerOptions, placeholder: 'Semua Satker' },
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
          <Button variant="outline"><Download className="w-4 h-4" />Export Data</Button>
          <Button variant="primary" onClick={() => setShowModal(true)}><Plus className="w-4 h-4" />Tambah Data Auditor</Button>
        </div>
      </Card>

      <TabNavigation
        tabs={[{ id: 'daftar', label: 'Daftar Auditor' }, { id: 'beban', label: 'Monitoring Kapasitas Beban Kerja' }]}
        activeTab={mainTab}
        onTabChange={(id) => setMainTab(id as typeof mainTab)}
      />

      {mainTab === 'daftar' && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <StatCard label="Total Auditor" value={totalAuditor} footer={<div className="flex items-center justify-between mt-1"><span className="text-[11px] text-slate-400">Siap Diterbitkan Sprin</span><Badge color="success">Tersedia</Badge></div>} />
            <StatCard label="Total Sedang Bertugas" value={totalSedangBertugas} footer={<div className="flex items-center justify-between mt-1"><span className="text-[11px] text-slate-400">Aktif Audit Lapangan</span><Badge color="warning">On Duty</Badge></div>} />
          </div>

          <FilterPanel
            fields={filterFields}
            search={{ value: search, onChange: setSearch, placeholder: 'Cari nama auditor, NRP, atau satker...' }}
            onApply={() => setPage(1)}
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
                      <td className="px-4 py-3"><Badge color={a.status === 'Tersedia' ? 'success' : a.status === 'Sedang Tugas' ? 'warning' : 'neutral'}>{a.status}</Badge></td>
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

const AuditorDetailScreen: React.FC<{ auditor?: AuditorData; onBack: () => void }> = ({ auditor, onBack }) => {
  if (!auditor) {
    return (
      <EmptyState
        title="Auditor tidak ditemukan"
        description="Data auditor mungkin telah dihapus atau id tidak valid."
        icon={<Users className="w-8 h-8 text-slate-300" />}
        action={<Button variant="outline" onClick={onBack}>Kembali ke Direktori</Button>}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-[var(--sd-primary)] hover:underline">
          <ArrowLeft className="w-3.5 h-3.5" />Kembali ke Direktori
        </button>
        <span className="text-xs text-slate-400">Daftar Auditor / <span className="text-slate-700 font-bold">{auditor.nama}</span></span>
        <div className="flex items-center gap-2">
          <Button variant="outline" size="sm"><RefreshCw className="w-3.5 h-3.5" />Sinkronkan SSDM</Button>
          <Button variant="outline" size="sm"><Printer className="w-3.5 h-3.5" />Cetak Profil PDF</Button>
        </div>
      </div>

      <Card className="flex flex-col sm:flex-row items-start sm:items-center gap-4">
        <div className="relative shrink-0">
          <AuditorAvatar name={auditor.nama} photoUrl={auditor.id === 'aud-1' ? auditorProfileImg : auditor.fotoUrl} size={64} />
          <Badge color="success" className="absolute -bottom-1 -right-1">AKTIF</Badge>
        </div>
        <div className="min-w-0 flex-1">
          <Badge color="neutral" className="mb-1.5">{auditor.pangkat} / NRP {auditor.nrp}</Badge>
          <h1 className="text-lg font-black text-slate-900 truncate">{auditor.nama}</h1>
          <p className="text-xs text-slate-500 mt-0.5">{auditor.jabatan} • {auditor.satker || auditor.subdit}</p>
          <div className="flex flex-wrap gap-1.5 mt-2">
            <Badge color="primary">Jabatan Saat Ini: {auditor.jabatan}</Badge>
            <Badge color="indigo">Unit Kerja: {auditor.satker || auditor.subdit}</Badge>
            <Badge color="teal">Klasifikasi: {auditor.klasifikasi || 'Auditor Internal'}</Badge>
            <Badge color="brown">Penugasan (YTD): {auditor.penugasanYtd ?? auditor.bebanAktif}</Badge>
          </div>
        </div>
      </Card>

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
    </div>
  );
};

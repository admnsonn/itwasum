/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.9 tab "Data Master Terpadu" — ditulis ulang mereplikasi `27092026/prototipe-master-data.html`
 * (4.1 Struktur Organisasi & Unit Kerja, 4.2 Tipologi & Status Satker, 4.3 Jenis Pengawasan &
 * Bidjemen, 4.4 Katalog Data & Dokumen), lihat Plan "Migrate 27092026 prototypes" todo
 * `b9-master-data`. Mengganti `DataMasterTab` lama (statis, `MASTER_DATA_ITEMS`) dengan CRUD
 * nyata di atas `src/data/auditUniverse` (dipakai bersama B.12 Audit Universe).
 *
 * Super Admin (L0): akses penuh CRUD. Admin Polda (L2): lihat saja (readOnly).
 */
import React, { useMemo, useState } from 'react';
import { Building2, FolderKanban, Layers, ListChecks, Plus, Search as SearchIcon, ShieldAlert } from 'lucide-react';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Input,
  Modal,
  Pagination,
  Search,
  SegmentedControl,
  Select,
  TabNavigation,
  Table,
  Textarea,
  Typography,
  usePagination,
  type BadgeColor,
  type SelectOption,
  type TableColumn,
} from '../../ui';
import {
  useAuditUniverseStore,
  getItwilOf,
  getOrgKids,
  getOrgById,
  tipCount,
  isOrgKodeUnique,
  isOrgInUse,
  createOrgUnit,
  updateOrgUnit,
  setOrgActive,
  deleteOrgUnit,
  createTipologi,
  updateTipologi,
  setTipologiActive,
  deleteTipologi,
  assignTipologiToOrg,
  getJpSubs,
  createJenisPengawasan,
  updateJenisPengawasan,
  setJenisPengawasanActive,
  deleteJenisPengawasan,
  createBidjemen,
  updateBidjemen,
  setBidjemenActive,
  createKatalogDokumen,
  updateKatalogDokumen,
  setKatalogDokumenActive,
  deleteKatalogDokumen,
  createObjekPemeriksaan,
  updateObjekPemeriksaan,
  setObjekPemeriksaanActive,
  getTemplateByDok,
  createTemplateDokumen,
  updateTemplateDokumen,
  resetAuditUniverseSeed,
  JENJANG_ORG_LIST,
  JENJANG_TIPOLOGI,
  ITWIL_LIST,
  KATEGORI_DOKUMEN,
} from '../../../data/auditUniverse';
import type { OrgUnit, Tipologi, JenisPengawasan, Bidjemen, KatalogDokumen, JenjangOrg, ObjekPemeriksaan, TemplateDokumen } from '../../../data/auditUniverse';

const JENJANG_INDUK_RULE: Record<JenjangOrg, JenjangOrg[]> = {
  'Mabes Polri': [],
  'Satker Mabes': ['Mabes Polri'],
  Polda: ['Mabes Polri'],
  'Satker Polda': ['Polda'],
  Polres: ['Polda'],
  Polsek: ['Polres'],
  'Unit Kerja': ['Satker Mabes', 'Satker Polda', 'Polres'],
};
const ITWIL_MANUAL_JENJANG: JenjangOrg[] = ['Polda', 'Satker Mabes'];

type MasterDataSub = 'organisasi' | 'tipologi' | 'jenis-pengawasan' | 'katalog';
const SUB_TABS: { id: MasterDataSub; label: string }[] = [
  { id: 'organisasi', label: '4.1 Organisasi & Unit Kerja' },
  { id: 'tipologi', label: '4.2 Tipologi & Status Satker' },
  { id: 'jenis-pengawasan', label: '4.3 Jenis Pengawasan & Bidjemen' },
  { id: 'katalog', label: '4.4 Katalog Data & Dokumen' },
];

interface MasterDataTabProps {
  readOnly: boolean;
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
  notify: (msg: string) => void;
}

export const MasterDataTab: React.FC<MasterDataTabProps> = ({ readOnly, subPath, onSubPathChange, notify }) => {
  const parts = (subPath || '').split('/');
  const activeSub: MasterDataSub = (SUB_TABS.some((t) => t.id === parts[0]) ? parts[0] : 'organisasi') as MasterDataSub;

  return (
    <div className="space-y-4">
      {readOnly && (
        <div className="p-3 rounded-[12px] bg-amber-50 border border-amber-200 text-amber-900 text-xs flex items-center gap-2.5">
          <ShieldAlert className="w-4 h-4 text-amber-600 shrink-0" />
          <span>Anda melihat Data Master dalam mode <strong>lihat saja</strong>. Perubahan hanya dapat dilakukan oleh Super Admin Mabes.</span>
        </div>
      )}
      <div className="flex items-center justify-between gap-3">
        <TabNavigation tabs={SUB_TABS} activeTab={activeSub} onTabChange={(id) => onSubPathChange(id === 'organisasi' ? undefined : id)} className="flex-1" />
        {!readOnly && (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => {
              if (window.confirm('Reset seluruh Data Master & Pengumpulan Data ke data awal contoh? Perubahan yang sudah dibuat akan hilang.')) {
                resetAuditUniverseSeed();
                notify('Data master direset ke data awal contoh.');
              }
            }}
          >
            Reset Data Contoh
          </Button>
        )}
      </div>

      {activeSub === 'organisasi' && <OrganisasiScreen readOnly={readOnly} notify={notify} />}
      {activeSub === 'tipologi' && <TipologiScreen readOnly={readOnly} notify={notify} />}
      {activeSub === 'jenis-pengawasan' && <JenisPengawasanScreen readOnly={readOnly} notify={notify} />}
      {activeSub === 'katalog' && <KatalogScreen readOnly={readOnly} notify={notify} />}
    </div>
  );
};

const STATUS_BADGE = (aktif: boolean): { color: BadgeColor; label: string } =>
  aktif ? { color: 'success', label: 'Aktif' } : { color: 'neutral', label: 'Nonaktif' };

/* ============================================================================================ *
 * 4.1 Struktur Organisasi & Unit Kerja
 * ============================================================================================ */
const OrganisasiScreen: React.FC<{ readOnly: boolean; notify: (m: string) => void }> = ({ readOnly, notify }) => {
  const state = useAuditUniverseStore();
  const [search, setSearch] = useState('');
  const [jenjangFilter, setJenjangFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [modal, setModal] = useState<{ mode: 'create' | 'edit' | 'view'; org?: OrgUnit } | null>(null);
  const [nonaktifTarget, setNonaktifTarget] = useState<OrgUnit | null>(null);
  const [alasanNonaktif, setAlasanNonaktif] = useState('');
  const [deleteTarget, setDeleteTarget] = useState<OrgUnit | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return state.orgUnits.filter((o) => {
      if (jenjangFilter && o.jenjang !== jenjangFilter) return false;
      if (statusFilter === 'aktif' && !o.aktif) return false;
      if (statusFilter === 'nonaktif' && o.aktif) return false;
      if (search) {
        const q = search.toLowerCase();
        if (!o.nama.toLowerCase().includes(q) && !o.sing.toLowerCase().includes(q) && !o.id.toLowerCase().includes(q)) return false;
      }
      return true;
    });
  }, [state.orgUnits, jenjangFilter, statusFilter, search]);

  const { page, pageSize, setPage, setPageSize, pageItems } = usePagination(filtered, 10);

  const columns: TableColumn<OrgUnit>[] = [
    { key: 'id', header: 'ID', render: (o) => <span className="font-mono text-[11px] text-slate-400">{o.id}</span> },
    {
      key: 'nama',
      header: 'Nama Resmi & Singkatan',
      render: (o) => (
        <div>
          <button onClick={() => setModal({ mode: 'view', org: o })} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left block">
            {o.sing}
          </button>
          <span className="text-[11px] text-slate-400">{o.nama}</span>
        </div>
      ),
    },
    { key: 'jenjang', header: 'Jenjang', render: (o) => <Badge color="primary">{o.jenjang}</Badge> },
    { key: 'induk', header: 'Induk', render: (o) => (o.induk ? getOrgById(o.induk)?.sing ?? o.induk : '–') },
    { key: 'itwil', header: 'Itwil Pengawas', render: (o) => getItwilOf(o) || '–' },
    { key: 'kode', header: 'Kode Satker', render: (o) => o.kode || '–' },
    { key: 'status', header: 'Status', render: (o) => { const s = STATUS_BADGE(o.aktif); return <Badge color={s.color}>{s.label}</Badge>; } },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (o) => (
        <div className="flex items-center gap-2">
          <button onClick={() => setModal({ mode: readOnly ? 'view' : 'edit', org: o })} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">
            {readOnly ? 'Lihat' : 'Ubah'}
          </button>
          {!readOnly && (
            <button
              onClick={() => (o.aktif ? setNonaktifTarget(o) : setOrgActive(o.id, true))}
              className="text-xs font-bold text-slate-500 hover:underline"
            >
              {o.aktif ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          )}
          {!readOnly && (
            <button onClick={() => setDeleteTarget(o)} className="text-xs font-bold text-rose-500 hover:underline">
              Hapus
            </button>
          )}
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <Search value={search} onChange={setSearch} placeholder="Cari nama, singkatan, atau ID..." className="flex-1 min-w-48" />
          <Select
            options={JENJANG_ORG_LIST.map((j) => ({ value: j, label: j }))}
            value={jenjangFilter}
            onChange={setJenjangFilter}
            placeholder="Semua Jenjang"
            className="w-44"
          />
          <Select
            options={[{ value: 'aktif', label: 'Aktif' }, { value: 'nonaktif', label: 'Nonaktif' }]}
            value={statusFilter}
            onChange={setStatusFilter}
            placeholder="Semua Status"
            className="w-40"
          />
          {!readOnly && (
            <Button onClick={() => setModal({ mode: 'create' })}>
              <Plus className="w-4 h-4" /> Tambah Unit/Satker
            </Button>
          )}
        </div>
      </Card>
      {filtered.length === 0 ? (
        <EmptyState title="Tidak ada data organisasi yang cocok" icon={<Building2 className="w-6 h-6 text-slate-300" />} />
      ) : (
        <>
          <Table columns={columns} data={pageItems} rowKey={(o) => o.id} />
          <Pagination currentPage={page} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="unit/satker" />
        </>
      )}

      {modal && (
        <OrgFormModal
          mode={modal.mode}
          org={modal.org}
          onClose={() => setModal(null)}
          onSaved={(msg) => {
            notify(msg);
            setModal(null);
          }}
        />
      )}

      {nonaktifTarget && (
        <Modal
          isOpen
          onClose={() => setNonaktifTarget(null)}
          title={`Nonaktifkan ${nonaktifTarget.sing}?`}
          description="Seluruh unit turunan (jika ada) ikut dinonaktifkan. Data tidak dihapus dan dapat diaktifkan kembali."
          footer={
            <>
              <Button variant="outline" onClick={() => setNonaktifTarget(null)}>Batal</Button>
              <Button
                variant="danger"
                onClick={() => {
                  setOrgActive(nonaktifTarget.id, false, alasanNonaktif);
                  notify(`${nonaktifTarget.sing} dinonaktifkan.`);
                  setNonaktifTarget(null);
                  setAlasanNonaktif('');
                }}
              >
                Nonaktifkan
              </Button>
            </>
          }
        >
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Alasan (opsional)</label>
          <Textarea rows={3} value={alasanNonaktif} onChange={(e) => setAlasanNonaktif(e.target.value)} placeholder="Mis. Digabung ke satker lain per SK..." />
        </Modal>
      )}

      {deleteTarget && (
        <Modal
          isOpen
          onClose={() => setDeleteTarget(null)}
          title={`Hapus organisasi ${deleteTarget.sing}?`}
          description="Tindakan ini tidak dapat dibatalkan. Data yang masih dipakai (tipologi terpasang atau memiliki unit turunan) tidak dapat dihapus — nonaktifkan saja."
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
              <Button
                variant="danger"
                onClick={() => {
                  const res = deleteOrgUnit(deleteTarget.id);
                  setDeleteTarget(null);
                  if (res.ok) notify(`${deleteTarget.sing} berhasil dihapus.`);
                  else setBlockedReason(res.reason ?? 'Data ini tidak dapat dihapus.');
                }}
              >
                Hapus
              </Button>
            </>
          }
        />
      )}

      {blockedReason && (
        <Modal
          isOpen
          onClose={() => setBlockedReason(null)}
          title="Tidak bisa dihapus"
          footer={<Button variant="outline" onClick={() => setBlockedReason(null)}>Tutup</Button>}
        >
          <p className="text-xs text-slate-600">{blockedReason}</p>
        </Modal>
      )}
    </div>
  );
};

const OrgFormModal: React.FC<{ mode: 'create' | 'edit' | 'view'; org?: OrgUnit; onClose: () => void; onSaved: (msg: string) => void }> = ({ mode, org, onClose, onSaved }) => {
  const state = useAuditUniverseStore();
  const [jenjang, setJenjang] = useState<JenjangOrg>(org?.jenjang ?? 'Polres');
  const [induk, setInduk] = useState(org?.induk ?? '');
  const [nama, setNama] = useState(org?.nama ?? '');
  const [sing, setSing] = useState(org?.sing ?? '');
  const [itwil, setItwil] = useState(org?.itwil ?? '');
  const [tip, setTip] = useState(org?.tip ?? '');
  const [kode, setKode] = useState(org?.kode ?? '');
  const [ang, setAng] = useState<OrgUnit['ang']>(org?.ang ?? '');
  const [berlakuMulai, setBerlakuMulai] = useState(org?.berlakuMulai ?? '');
  const [berlakuSampai, setBerlakuSampai] = useState(org?.berlakuSampai ?? '');
  const [error, setError] = useState('');
  const [confirmItwil, setConfirmItwil] = useState(false);
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const [showRiwayat, setShowRiwayat] = useState(false);

  const indukOptions: SelectOption[] = state.orgUnits
    .filter((o) => JENJANG_INDUK_RULE[jenjang]?.includes(o.jenjang) && o.aktif)
    .map((o) => ({ value: o.id, label: `${o.sing} (${o.jenjang})` }));

  const tipOptions: SelectOption[] = state.tipologi.filter((t) => t.jenjang === jenjang && t.aktif).map((t) => ({ value: t.id, label: t.nama }));

  const readOnly = mode === 'view';
  const showItwil = ITWIL_MANUAL_JENJANG.includes(jenjang);
  const showTipKode = JENJANG_TIPOLOGI.includes(jenjang);
  const isDirty = !readOnly && (jenjang !== (org?.jenjang ?? 'Polres') || induk !== (org?.induk ?? '') || nama !== (org?.nama ?? '') || sing !== (org?.sing ?? '') || itwil !== (org?.itwil ?? '') || tip !== (org?.tip ?? '') || kode !== (org?.kode ?? '') || ang !== (org?.ang ?? ''));
  const attemptClose = () => (isDirty ? setConfirmDiscard(true) : onClose());

  const doSave = () => {
    const payload = { jenjang, induk, nama: nama.trim(), sing: sing.trim(), itwil: showItwil ? itwil : '', tip: showTipKode ? (tip || null) : null, kode, ang, peng: org?.peng ?? '', ketTip: org?.ketTip ?? '', perm: org?.perm ?? false, alasan: org?.alasan ?? '', berlakuMulai: berlakuMulai || undefined, berlakuSampai: berlakuSampai || undefined };
    if (mode === 'create') {
      createOrgUnit(payload);
      onSaved(`${sing} berhasil ditambahkan.`);
    } else if (org) {
      updateOrgUnit(org.id, payload);
      onSaved(`${sing} berhasil diperbarui.`);
    }
  };

  const handleSave = () => {
    if (!nama.trim() || !sing.trim()) return setError('Nama resmi dan singkatan wajib diisi.');
    if (JENJANG_INDUK_RULE[jenjang].length > 0 && !induk) return setError('Induk organisasi wajib dipilih.');
    if (kode && kode.length !== 6) return setError('Kode Satker harus 6 digit.');
    if (kode && !isOrgKodeUnique(kode, org?.id)) return setError('Kode Satker sudah dipakai unit lain.');

    if (mode === 'edit' && org && showItwil && itwil !== (org.itwil ?? '') && getOrgKids(org.id).length > 0) {
      setConfirmItwil(true);
      return;
    }
    doSave();
  };

  if (confirmItwil) {
    return (
      <Modal
        isOpen
        onClose={() => setConfirmItwil(false)}
        title="Ubah Itwil pengawas?"
        description={`Seluruh unit turunan ${org?.sing} (Polres/Polsek jajaran) ikut berpindah pengawasan ke ${itwil}.`}
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmItwil(false)}>Batal</Button>
            <Button onClick={() => { setConfirmItwil(false); doSave(); }}>Ya, Ubah</Button>
          </>
        }
      />
    );
  }

  if (confirmDiscard) {
    return (
      <Modal
        isOpen
        onClose={() => setConfirmDiscard(false)}
        title="Buang perubahan?"
        description="Perubahan yang belum disimpan akan hilang."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDiscard(false)}>Batal</Button>
            <Button variant="danger" onClick={onClose}>Buang Perubahan</Button>
          </>
        }
      />
    );
  }

  return (
    <Modal
      isOpen
      onClose={attemptClose}
      title={mode === 'create' ? 'Tambah Unit/Satker' : mode === 'edit' ? `Ubah ${org?.sing}` : org?.sing}
      widthClassName="max-w-xl"
      footer={
        readOnly ? (
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        ) : (
          <>
            <Button variant="outline" onClick={attemptClose}>Batal</Button>
            <Button onClick={handleSave}>Simpan</Button>
          </>
        )
      }
    >
      <div className="space-y-3">
        {error && <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Jenjang</label>
            <Select options={JENJANG_ORG_LIST.map((j) => ({ value: j, label: j }))} value={jenjang} onChange={(v) => setJenjang(v as JenjangOrg)} disabled={readOnly || mode === 'edit'} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Induk Organisasi</label>
            <Select options={indukOptions} value={induk} onChange={setInduk} placeholder="Pilih induk" disabled={readOnly || JENJANG_INDUK_RULE[jenjang].length === 0} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Resmi</label>
          <Input value={nama} onChange={(e) => setNama(e.target.value)} disabled={readOnly} placeholder="Mis. Kepolisian Resor Kampar" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Singkatan</label>
          <Input value={sing} onChange={(e) => setSing(e.target.value)} disabled={readOnly} placeholder="Mis. Polres Kampar" />
        </div>
        {showItwil && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Itwil Pengawas</label>
            <Select options={ITWIL_LIST.map((i) => ({ value: i, label: i }))} value={itwil} onChange={setItwil} placeholder="Pilih Itwil" disabled={readOnly} />
          </div>
        )}
        {showTipKode && (
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Tipologi</label>
              <Select options={tipOptions} value={tip ?? ''} onChange={setTip} placeholder="Belum ditetapkan" disabled={readOnly} />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Kode Satker (6 digit)</label>
              <Input value={kode} onChange={(e) => setKode(e.target.value.replace(/\D/g, '').slice(0, 6))} disabled={readOnly} placeholder="061411" />
            </div>
          </div>
        )}
        {showTipKode && (
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Status Anggaran (DIPA Mandiri)</label>
            <Select options={[{ value: 'ya', label: 'Ya, mandiri' }, { value: 'tidak', label: 'Tidak, dikelola induk' }]} value={ang} onChange={(v) => setAng(v as OrgUnit['ang'])} disabled={readOnly} />
          </div>
        )}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Berlaku Mulai</label>
            <Input type="date" value={berlakuMulai} onChange={(e) => setBerlakuMulai(e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Berlaku Sampai</label>
            <Input type="date" value={berlakuSampai} onChange={(e) => setBerlakuSampai(e.target.value)} disabled={readOnly} />
          </div>
        </div>
        {org && (
          <div className="pt-2 border-t border-slate-100">
            <button onClick={() => setShowRiwayat((v) => !v)} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">
              {showRiwayat ? 'Sembunyikan Riwayat Perubahan' : `Lihat Riwayat Perubahan (${org.history?.length ?? 0})`}
            </button>
            {showRiwayat && (
              <ul className="mt-2 space-y-1.5 max-h-40 overflow-y-auto">
                {(org.history ?? []).length === 0 ? (
                  <li className="text-[11px] text-slate-400">Belum ada riwayat tercatat.</li>
                ) : (
                  [...(org.history ?? [])].reverse().map((h, i) => (
                    <li key={i} className="text-[11px] text-slate-500 flex items-center justify-between gap-2 py-1 px-2 rounded-[6px] bg-slate-50">
                      <span>{h.aksi} — <span className="text-slate-400">{h.oleh}</span></span>
                      <span className="font-mono text-slate-400 shrink-0">{h.waktu}</span>
                    </li>
                  ))
                )}
              </ul>
            )}
          </div>
        )}
        {mode === 'view' && org && (
          <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">
            Dibuat oleh Sistem (data awal), 01/09/2026{!org.aktif && org.alasan ? ` · Nonaktif: ${org.alasan}` : ''}
          </p>
        )}
      </div>
    </Modal>
  );
};

/* ============================================================================================ *
 * 4.2 Tipologi & Status Satker
 * ============================================================================================ */
const TipologiScreen: React.FC<{ readOnly: boolean; notify: (m: string) => void }> = ({ readOnly, notify }) => {
  const [tab, setTab] = useState<'daftar' | 'satker'>('daftar');
  return (
    <div className="space-y-3">
      <SegmentedControl
        options={[{ value: 'daftar', label: 'Daftar Tipologi' }, { value: 'satker', label: 'Tipologi Satker' }]}
        value={tab}
        onChange={(v) => setTab(v as 'daftar' | 'satker')}
      />
      {tab === 'daftar' ? <DaftarTipologiTable readOnly={readOnly} notify={notify} /> : <TipologiSatkerTable readOnly={readOnly} notify={notify} />}
    </div>
  );
};

const DaftarTipologiTable: React.FC<{ readOnly: boolean; notify: (m: string) => void }> = ({ readOnly, notify }) => {
  const state = useAuditUniverseStore();
  const [modal, setModal] = useState<{ mode: 'create' | 'edit' | 'view'; tip?: Tipologi } | null>(null);
  const [nonaktifTarget, setNonaktifTarget] = useState<Tipologi | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Tipologi | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const columns: TableColumn<Tipologi>[] = [
    { key: 'id', header: 'Kode', render: (t) => <span className="font-mono text-[11px] text-slate-400">{t.id}</span> },
    {
      key: 'nama',
      header: 'Nama',
      render: (t) => (
        <button onClick={() => setModal({ mode: readOnly ? 'view' : 'edit', tip: t })} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left">
          {t.nama}
        </button>
      ),
    },
    { key: 'jenjang', header: 'Jenjang', render: (t) => <Badge color="primary">{t.jenjang}</Badge> },
    { key: 'jumlah', header: 'Jumlah Satker', render: (t) => tipCount(t.id) },
    { key: 'ket', header: 'Keterangan', render: (t) => <span className="text-[11px] text-slate-400">{t.ket}</span> },
    { key: 'status', header: 'Status', render: (t) => { const s = STATUS_BADGE(t.aktif); return <Badge color={s.color}>{s.label}</Badge>; } },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (t) =>
        readOnly ? (
          <button onClick={() => setModal({ mode: 'view', tip: t })} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat</button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setModal({ mode: 'edit', tip: t })} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Ubah</button>
            <button
              onClick={() => (t.aktif ? setNonaktifTarget(t) : setTipologiActive(t.id, true))}
              className="text-xs font-bold text-slate-500 hover:underline"
            >
              {t.aktif ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <button onClick={() => setDeleteTarget(t)} className="text-xs font-bold text-rose-500 hover:underline">Hapus</button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={() => setModal({ mode: 'create' })}>
            <Plus className="w-4 h-4" /> Tambah Tipologi
          </Button>
        </div>
      )}
      <Table columns={columns} data={state.tipologi} rowKey={(t) => t.id} />
      {modal && (
        <TipologiFormModal
          mode={modal.mode}
          tip={modal.tip}
          onClose={() => setModal(null)}
          onSaved={(msg) => { notify(msg); setModal(null); }}
        />
      )}

      {nonaktifTarget && (
        <Modal
          isOpen
          onClose={() => setNonaktifTarget(null)}
          title={`Nonaktifkan tipologi ${nonaktifTarget.nama}?`}
          description="Satker yang sudah memakai tipologi ini tidak terpengaruh. Tipologi ini tidak akan muncul lagi sebagai pilihan baru."
          footer={
            <>
              <Button variant="outline" onClick={() => setNonaktifTarget(null)}>Batal</Button>
              <Button variant="danger" onClick={() => { setTipologiActive(nonaktifTarget.id, false); notify(`Tipologi ${nonaktifTarget.nama} dinonaktifkan.`); setNonaktifTarget(null); }}>Nonaktifkan</Button>
            </>
          }
        />
      )}

      {deleteTarget && (
        <Modal
          isOpen
          onClose={() => setDeleteTarget(null)}
          title={`Hapus tipologi ${deleteTarget.nama}?`}
          description="Tindakan ini tidak dapat dibatalkan. Tipologi yang masih dipakai Satker tidak dapat dihapus — nonaktifkan saja."
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
              <Button
                variant="danger"
                onClick={() => {
                  const res = deleteTipologi(deleteTarget.id);
                  setDeleteTarget(null);
                  if (res.ok) notify(`Tipologi ${deleteTarget.nama} berhasil dihapus.`);
                  else setBlockedReason(res.reason ?? 'Data ini tidak dapat dihapus.');
                }}
              >
                Hapus
              </Button>
            </>
          }
        />
      )}

      {blockedReason && (
        <Modal isOpen onClose={() => setBlockedReason(null)} title="Tidak bisa dihapus" footer={<Button variant="outline" onClick={() => setBlockedReason(null)}>Tutup</Button>}>
          <p className="text-xs text-slate-600">{blockedReason}</p>
        </Modal>
      )}
    </div>
  );
};

const TipologiFormModal: React.FC<{ mode: 'create' | 'edit' | 'view'; tip?: Tipologi; onClose: () => void; onSaved: (m: string) => void }> = ({ mode, tip, onClose, onSaved }) => {
  const [jenjang, setJenjang] = useState<JenjangOrg>(tip?.jenjang ?? 'Polres');
  const [nama, setNama] = useState(tip?.nama ?? '');
  const [ket, setKet] = useState(tip?.ket ?? '');
  const [error, setError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const readOnly = mode === 'view';
  const isDirty = !readOnly && (jenjang !== (tip?.jenjang ?? 'Polres') || nama !== (tip?.nama ?? '') || ket !== (tip?.ket ?? ''));
  const attemptClose = () => (isDirty ? setConfirmDiscard(true) : onClose());

  if (confirmDiscard) {
    return (
      <Modal
        isOpen
        onClose={() => setConfirmDiscard(false)}
        title="Buang perubahan?"
        description="Perubahan yang belum disimpan akan hilang."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDiscard(false)}>Batal</Button>
            <Button variant="danger" onClick={onClose}>Buang Perubahan</Button>
          </>
        }
      />
    );
  }

  return (
    <Modal
      isOpen
      onClose={attemptClose}
      title={mode === 'create' ? 'Tambah Tipologi' : mode === 'view' ? `Detail Tipologi — ${tip?.nama}` : `Ubah ${tip?.nama}`}
      footer={
        readOnly ? (
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        ) : (
          <>
            <Button variant="outline" onClick={attemptClose}>Batal</Button>
            <Button
              onClick={() => {
                if (!nama.trim()) return setError('Nama tipologi wajib diisi.');
                if (mode === 'create') {
                  createTipologi({ jenjang, nama: nama.trim(), ket });
                  onSaved('Tipologi berhasil ditambahkan.');
                } else if (tip) {
                  updateTipologi(tip.id, { jenjang, nama: nama.trim(), ket });
                  onSaved('Tipologi berhasil diperbarui.');
                }
              }}
            >
              Simpan
            </Button>
          </>
        )
      }
    >
      <div className="space-y-3">
        {error && <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">{error}</div>}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Jenjang</label>
          <Select options={JENJANG_TIPOLOGI.map((j) => ({ value: j, label: j }))} value={jenjang} onChange={(v) => setJenjang(v as JenjangOrg)} disabled={readOnly} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Tipologi</label>
          <Input value={nama} onChange={(e) => setNama(e.target.value)} disabled={readOnly} placeholder="Mis. Polres Tipe A" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Keterangan</label>
          <Textarea rows={2} value={ket} onChange={(e) => setKet(e.target.value)} disabled={readOnly} />
        </div>
      </div>
    </Modal>
  );
};

const TipologiSatkerTable: React.FC<{ readOnly: boolean; notify: (m: string) => void }> = ({ readOnly, notify }) => {
  const state = useAuditUniverseStore();
  const [target, setTarget] = useState<OrgUnit | null>(null);
  const [pick, setPick] = useState('');
  const [skNomor, setSkNomor] = useState('');
  const [skTanggal, setSkTanggal] = useState(new Date().toISOString().slice(0, 10));
  const [skError, setSkError] = useState('');
  const [kosongkanTarget, setKosongkanTarget] = useState<OrgUnit | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const eligible = state.orgUnits.filter((o) => JENJANG_TIPOLOGI.includes(o.jenjang));
  const isOrgSasaranAktif = (orgId: string) => state.permintaan.some((r) => r.status === 'Terkirim' && r.sasaran.includes(orgId));

  const columns: TableColumn<OrgUnit>[] = [
    { key: 'nama', header: 'Nama Satker/Unit', render: (o) => <span className="font-bold text-slate-800">{o.sing}</span> },
    { key: 'jenjang', header: 'Jenjang', render: (o) => <Badge color="primary">{o.jenjang}</Badge> },
    { key: 'induk', header: 'Induk', render: (o) => (o.induk ? getOrgById(o.induk)?.sing ?? '–' : '–') },
    { key: 'itwil', header: 'Itwil', render: (o) => getItwilOf(o) || '–' },
    { key: 'tip', header: 'Tipologi', render: (o) => (o.tip ? state.tipologi.find((t) => t.id === o.tip)?.nama ?? '–' : <span className="text-slate-400">Belum ditetapkan</span>) },
    { key: 'kode', header: 'Kode Satker', render: (o) => o.kode || '–' },
    { key: 'ang', header: 'Status Anggaran', render: (o) => (o.ang === 'ya' ? 'Mandiri' : o.ang === 'tidak' ? 'Dikelola Induk' : '–') },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (o) =>
        readOnly ? (
          <span className="text-[11px] text-slate-400">—</span>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => { setTarget(o); setPick(o.tip ?? ''); setSkNomor(''); setSkError(''); }} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">
              {o.tip ? 'Ubah' : 'Tetapkan'}
            </button>
            {o.tip && (
              <button
                onClick={() => {
                  if (isOrgSasaranAktif(o.id)) setBlockedReason(`Tipologi ${o.sing} tidak dapat dikosongkan karena Satker ini masih menjadi sasaran permintaan pengumpulan data yang sedang berjalan.`);
                  else setKosongkanTarget(o);
                }}
                className="text-xs font-bold text-slate-500 hover:underline"
              >
                Kosongkan
              </button>
            )}
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      <Table columns={columns} data={eligible} rowKey={(o) => o.id} />
      {target && (
        <Modal
          isOpen
          onClose={() => setTarget(null)}
          title={`Tetapkan Tipologi — ${target.sing}`}
          footer={
            <>
              <Button variant="outline" onClick={() => setTarget(null)}>Batal</Button>
              <Button
                onClick={() => {
                  const result = assignTipologiToOrg(target.id, pick || null, { nomor: skNomor, tanggal: skTanggal });
                  if (!result.ok) return setSkError(result.reason ?? 'Gagal menyimpan.');
                  notify(`Tipologi ${target.sing} berhasil ditetapkan.`);
                  setTarget(null);
                }}
              >
                Simpan
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            {skError && <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">{skError}</div>}
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Tipologi</label>
              <Select
                options={state.tipologi.filter((t) => t.jenjang === target.jenjang && t.aktif).map((t) => ({ value: t.id, label: t.nama }))}
                value={pick}
                onChange={setPick}
                placeholder="Belum ditetapkan"
              />
            </div>
            <div className="p-3 rounded-[10px] bg-amber-50 border border-amber-200 text-[11px] text-amber-800">
              Perubahan tipologi mensyaratkan persetujuan (Nomor SK) sesuai BR 4.2.
            </div>
            <div className="grid sm:grid-cols-2 gap-3">
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Nomor SK Persetujuan</label>
                <Input value={skNomor} onChange={(e) => setSkNomor(e.target.value)} placeholder="Mis. SK/123/IX/2026/ITWASUM" />
              </div>
              <div>
                <label className="block text-xs font-bold text-slate-600 mb-1.5">Tanggal SK</label>
                <Input type="date" value={skTanggal} onChange={(e) => setSkTanggal(e.target.value)} />
              </div>
            </div>
            {target.tipSkNomor && (
              <p className="text-[11px] text-slate-400">SK penetapan sebelumnya: {target.tipSkNomor} ({target.tipSkTanggal}) — disetujui oleh {target.tipDisetujuiOleh}.</p>
            )}
          </div>
        </Modal>
      )}

      {kosongkanTarget && (
        <Modal
          isOpen
          onClose={() => setKosongkanTarget(null)}
          title="Kosongkan penetapan?"
          description={`Tipologi Satker ${kosongkanTarget.sing} akan dikosongkan dan perlu ditetapkan ulang.`}
          footer={
            <>
              <Button variant="outline" onClick={() => setKosongkanTarget(null)}>Batal</Button>
              <Button variant="danger" onClick={() => { assignTipologiToOrg(kosongkanTarget.id, null, { nomor: '', tanggal: '' }); notify(`Tipologi ${kosongkanTarget.sing} dikosongkan.`); setKosongkanTarget(null); }}>Kosongkan</Button>
            </>
          }
        />
      )}

      {blockedReason && (
        <Modal isOpen onClose={() => setBlockedReason(null)} title="Tidak bisa dikosongkan" footer={<Button variant="outline" onClick={() => setBlockedReason(null)}>Tutup</Button>}>
          <p className="text-xs text-slate-600">{blockedReason}</p>
        </Modal>
      )}
    </div>
  );
};

/* ============================================================================================ *
 * 4.3 Jenis Pengawasan & Bidjemen
 * ============================================================================================ */
const JenisPengawasanScreen: React.FC<{ readOnly: boolean; notify: (m: string) => void }> = ({ readOnly, notify }) => {
  const [tab, setTab] = useState<'jenis' | 'objek' | 'bidjemen'>('jenis');
  return (
    <div className="space-y-3">
      <SegmentedControl
        options={[{ value: 'jenis', label: 'Jenis Pengawasan' }, { value: 'objek', label: 'Objek Pemeriksaan' }, { value: 'bidjemen', label: 'Bidjemen' }]}
        value={tab}
        onChange={(v) => setTab(v as 'jenis' | 'objek' | 'bidjemen')}
      />
      {tab === 'jenis' && <JenisPengawasanTable readOnly={readOnly} notify={notify} />}
      {tab === 'objek' && <ObjekPemeriksaanTable readOnly={readOnly} notify={notify} />}
      {tab === 'bidjemen' && <BidjemenTable readOnly={readOnly} notify={notify} />}
    </div>
  );
};

/** 4.3 Objek Pemeriksaan — entitas anak Jenis Pengawasan (Plane B.1 Pra-Audit "Objek
 * Pengawasan"), dengan bidang, siklus, dan dasar hukum. */
const ObjekPemeriksaanTable: React.FC<{ readOnly: boolean; notify: (m: string) => void }> = ({ readOnly, notify }) => {
  const state = useAuditUniverseStore();
  const [modal, setModal] = useState<{ mode: 'create' | 'edit'; op?: ObjekPemeriksaan } | null>(null);

  const columns: TableColumn<ObjekPemeriksaan>[] = [
    { key: 'nama', header: 'Objek Pemeriksaan', render: (o) => <span className="font-bold text-slate-800">{o.nama}</span> },
    { key: 'jp', header: 'Jenis Pengawasan', render: (o) => state.jenisPengawasan.find((j) => j.id === o.jpId)?.nama ?? o.jpId },
    { key: 'bidang', header: 'Bidang', render: (o) => o.bidang },
    { key: 'siklus', header: 'Siklus', render: (o) => <Badge color="info">{o.siklus}</Badge> },
    { key: 'dasar', header: 'Dasar Hukum', render: (o) => <span className="text-[11px] text-slate-500">{o.dasarHukum}</span> },
    { key: 'status', header: 'Status', render: (o) => { const s = STATUS_BADGE(o.aktif); return <Badge color={s.color}>{s.label}</Badge>; } },
    ...(readOnly
      ? []
      : [
          {
            key: 'aksi',
            header: 'Aksi',
            render: (o: ObjekPemeriksaan) => (
              <div className="flex items-center gap-2">
                <button onClick={() => setModal({ mode: 'edit', op: o })} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Ubah</button>
                <button onClick={() => setObjekPemeriksaanActive(o.id, !o.aktif)} className="text-xs font-bold text-slate-500 hover:underline">{o.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>
              </div>
            ),
          } as TableColumn<ObjekPemeriksaan>,
        ]),
  ];

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={() => setModal({ mode: 'create' })}><Plus className="w-4 h-4" /> Tambah Objek Pemeriksaan</Button>
        </div>
      )}
      <Table columns={columns} data={state.objekPemeriksaan} rowKey={(o) => o.id} />
      {modal && (
        <ObjekPemeriksaanFormModal
          mode={modal.mode}
          op={modal.op}
          onClose={() => setModal(null)}
          onSaved={(m) => { notify(m); setModal(null); }}
        />
      )}
    </div>
  );
};

const ObjekPemeriksaanFormModal: React.FC<{ mode: 'create' | 'edit'; op?: ObjekPemeriksaan; onClose: () => void; onSaved: (m: string) => void }> = ({ mode, op, onClose, onSaved }) => {
  const state = useAuditUniverseStore();
  const [jpId, setJpId] = useState(op?.jpId ?? state.jenisPengawasan.find((j) => !j.induk && j.aktif)?.id ?? '');
  const [nama, setNama] = useState(op?.nama ?? '');
  const [bidang, setBidang] = useState(op?.bidang ?? '');
  const [siklus, setSiklus] = useState<ObjekPemeriksaan['siklus']>(op?.siklus ?? 'Tahunan');
  const [dasarHukum, setDasarHukum] = useState(op?.dasarHukum ?? '');
  const [error, setError] = useState('');

  const handleSave = () => {
    if (!nama.trim()) return setError('Nama objek pemeriksaan wajib diisi.');
    if (mode === 'create') {
      createObjekPemeriksaan({ jpId, nama: nama.trim(), bidang, siklus, dasarHukum });
      onSaved('Objek Pemeriksaan berhasil ditambahkan.');
    } else if (op) {
      updateObjekPemeriksaan(op.id, { jpId, nama: nama.trim(), bidang, siklus, dasarHukum });
      onSaved('Objek Pemeriksaan berhasil diperbarui.');
    }
  };

  return (
    <Modal isOpen onClose={onClose} title={mode === 'create' ? 'Tambah Objek Pemeriksaan' : `Ubah ${op?.nama}`}
      footer={<><Button variant="outline" onClick={onClose}>Batal</Button><Button onClick={handleSave}>Simpan</Button></>}
    >
      <div className="space-y-3">
        {error && <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">{error}</div>}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Jenis Pengawasan</label>
          <Select options={state.jenisPengawasan.filter((j) => !j.induk && j.aktif).map((j) => ({ value: j.id, label: j.nama }))} value={jpId} onChange={setJpId} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Objek Pemeriksaan</label>
          <Input value={nama} onChange={(e) => setNama(e.target.value)} />
        </div>
        <div className="grid sm:grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Bidang</label>
            <Input value={bidang} onChange={(e) => setBidang(e.target.value)} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Siklus</label>
            <Select options={(['Tahunan', 'Semesteran', 'Triwulanan', 'Ad-hoc'] as const).map((s) => ({ value: s, label: s }))} value={siklus} onChange={(v) => setSiklus(v as ObjekPemeriksaan['siklus'])} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Dasar Hukum</label>
          <Textarea value={dasarHukum} onChange={(e) => setDasarHukum(e.target.value)} rows={2} />
        </div>
      </div>
    </Modal>
  );
};

const JenisPengawasanTable: React.FC<{ readOnly: boolean; notify: (m: string) => void }> = ({ readOnly, notify }) => {
  const state = useAuditUniverseStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set());
  const [modal, setModal] = useState<{ mode: 'create' | 'edit' | 'view'; jp?: JenisPengawasan } | null>(null);
  const [nonaktifTarget, setNonaktifTarget] = useState<JenisPengawasan | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<JenisPengawasan | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);
  const topLevel = state.jenisPengawasan.filter((j) => !j.induk);

  const columns: TableColumn<JenisPengawasan>[] = [
    {
      key: 'nama',
      header: 'Jenis Pengawasan',
      render: (j) => {
        const isSub = !!j.induk;
        const subs = getJpSubs(j.id);
        const isOpen = expanded.has(j.id);
        return (
          <div className={isSub ? 'pl-6' : ''} style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
            {!isSub && subs.length > 0 && (
              <button
                onClick={() => {
                  const next = new Set(expanded);
                  next.has(j.id) ? next.delete(j.id) : next.add(j.id);
                  setExpanded(next);
                }}
                className="text-slate-400 hover:text-slate-600 text-[10px] w-4"
              >
                {isOpen ? '▾' : '▸'}
              </button>
            )}
            <div>
              <span className={isSub ? 'text-xs text-slate-700' : 'font-bold text-slate-800'}>{j.nama}</span>
              <div className="font-mono text-[10px] text-slate-400">{j.id}</div>
            </div>
          </div>
        );
      },
    },
    { key: 'sifat', header: 'Sifat', render: (j) => <Badge color={j.sifat === 'Terprogram' ? 'info' : 'brown'}>{j.sifat}</Badge> },
    { key: 'sub', header: '# Sub', render: (j) => (j.induk ? '–' : getJpSubs(j.id).length) },
    { key: 'status', header: 'Status', render: (j) => { const s = STATUS_BADGE(j.aktif); return <Badge color={s.color}>{s.label}</Badge>; } },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (j) =>
        readOnly ? (
          <button onClick={() => setModal({ mode: 'view', jp: j })} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat</button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setModal({ mode: 'edit', jp: j })} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Ubah</button>
            <button
              onClick={() => (j.aktif ? setNonaktifTarget(j) : setJenisPengawasanActive(j.id, true))}
              className="text-xs font-bold text-slate-500 hover:underline"
            >
              {j.aktif ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <button onClick={() => setDeleteTarget(j)} className="text-xs font-bold text-rose-500 hover:underline">Hapus</button>
          </div>
        ),
    },
  ];

  const rows: JenisPengawasan[] = [];
  topLevel.forEach((j) => {
    rows.push(j);
    if (expanded.has(j.id)) rows.push(...getJpSubs(j.id));
  });

  return (
    <div className="space-y-3">
      {!readOnly && (
        <div className="flex justify-end">
          <Button onClick={() => setModal({ mode: 'create' })}>
            <Plus className="w-4 h-4" /> Tambah Jenis Pengawasan
          </Button>
        </div>
      )}
      <Table columns={columns} data={rows} rowKey={(j) => j.id} />
      {modal && (
        <JenisPengawasanFormModal
          mode={modal.mode}
          jp={modal.jp}
          topLevel={topLevel}
          onClose={() => setModal(null)}
          onSaved={(m) => { notify(m); setModal(null); }}
        />
      )}

      {nonaktifTarget && (
        <Modal
          isOpen
          onClose={() => setNonaktifTarget(null)}
          title={`Nonaktifkan jenis pengawasan ${nonaktifTarget.nama}?`}
          description="Sub-jenis di bawahnya (jika ada) ikut dinonaktifkan. Data tidak dihapus dan dapat diaktifkan kembali."
          footer={
            <>
              <Button variant="outline" onClick={() => setNonaktifTarget(null)}>Batal</Button>
              <Button variant="danger" onClick={() => { setJenisPengawasanActive(nonaktifTarget.id, false); notify(`${nonaktifTarget.nama} dinonaktifkan.`); setNonaktifTarget(null); }}>Nonaktifkan</Button>
            </>
          }
        />
      )}

      {deleteTarget && (
        <Modal
          isOpen
          onClose={() => setDeleteTarget(null)}
          title={`Hapus jenis pengawasan ${deleteTarget.nama}?`}
          description="Tindakan ini tidak dapat dibatalkan. Jenis yang sudah dipakai pada permintaan atau memiliki sub-jenis tidak dapat dihapus — nonaktifkan saja."
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
              <Button
                variant="danger"
                onClick={() => {
                  const res = deleteJenisPengawasan(deleteTarget.id);
                  setDeleteTarget(null);
                  if (res.ok) notify(`${deleteTarget.nama} berhasil dihapus.`);
                  else setBlockedReason(res.reason ?? 'Data ini tidak dapat dihapus.');
                }}
              >
                Hapus
              </Button>
            </>
          }
        />
      )}

      {blockedReason && (
        <Modal isOpen onClose={() => setBlockedReason(null)} title="Tidak bisa dihapus" footer={<Button variant="outline" onClick={() => setBlockedReason(null)}>Tutup</Button>}>
          <p className="text-xs text-slate-600">{blockedReason}</p>
        </Modal>
      )}
    </div>
  );
};

const JenisPengawasanFormModal: React.FC<{ mode: 'create' | 'edit' | 'view'; jp?: JenisPengawasan; topLevel: JenisPengawasan[]; onClose: () => void; onSaved: (m: string) => void }> = ({ mode, jp, topLevel, onClose, onSaved }) => {
  const [induk, setInduk] = useState(jp?.induk ?? '');
  const [nama, setNama] = useState(jp?.nama ?? '');
  const [sifat, setSifat] = useState<JenisPengawasan['sifat']>(jp?.sifat ?? 'Terprogram');
  const [ket, setKet] = useState(jp?.ket ?? '');
  const [error, setError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const readOnly = mode === 'view';
  const isDirty = !readOnly && (induk !== (jp?.induk ?? '') || nama !== (jp?.nama ?? '') || sifat !== (jp?.sifat ?? 'Terprogram') || ket !== (jp?.ket ?? ''));
  const attemptClose = () => (isDirty ? setConfirmDiscard(true) : onClose());

  if (confirmDiscard) {
    return (
      <Modal
        isOpen
        onClose={() => setConfirmDiscard(false)}
        title="Buang perubahan?"
        description="Perubahan yang belum disimpan akan hilang."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDiscard(false)}>Batal</Button>
            <Button variant="danger" onClick={onClose}>Buang Perubahan</Button>
          </>
        }
      />
    );
  }

  return (
    <Modal
      isOpen
      onClose={attemptClose}
      title={mode === 'create' ? 'Tambah Jenis Pengawasan' : mode === 'view' ? `Detail Jenis Pengawasan — ${jp?.nama}` : `Ubah ${jp?.nama}`}
      footer={
        readOnly ? (
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        ) : (
          <>
            <Button variant="outline" onClick={attemptClose}>Batal</Button>
            <Button
              onClick={() => {
                if (!nama.trim()) return setError('Nama jenis pengawasan wajib diisi.');
                if (mode === 'create') {
                  createJenisPengawasan({ induk, nama: nama.trim(), sifat, ket });
                  onSaved('Jenis pengawasan berhasil ditambahkan.');
                } else if (jp) {
                  updateJenisPengawasan(jp.id, { nama: nama.trim(), sifat, ket });
                  onSaved('Jenis pengawasan berhasil diperbarui.');
                }
              }}
            >
              Simpan
            </Button>
          </>
        )
      }
    >
      <div className="space-y-3">
        {error && <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">{error}</div>}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Induk (opsional, untuk sub-jenis)</label>
          <Select options={topLevel.map((j) => ({ value: j.id, label: j.nama }))} value={induk} onChange={setInduk} placeholder="Tidak ada (jenis utama)" disabled={readOnly || mode === 'edit'} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama</label>
          <Input value={nama} onChange={(e) => setNama(e.target.value)} disabled={readOnly} placeholder="Mis. Wasrik Rutin Tahap III" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Sifat</label>
          <Select options={[{ value: 'Terprogram', label: 'Terprogram' }, { value: 'Tidak Terprogram', label: 'Tidak Terprogram' }]} value={sifat} onChange={(v) => setSifat(v as JenisPengawasan['sifat'])} disabled={readOnly} />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Keterangan</label>
          <Textarea rows={2} value={ket} onChange={(e) => setKet(e.target.value)} disabled={readOnly} />
        </div>
      </div>
    </Modal>
  );
};

const BidjemenTable: React.FC<{ readOnly: boolean; notify: (m: string) => void }> = ({ readOnly, notify }) => {
  const state = useAuditUniverseStore();
  const [modal, setModal] = useState<{ mode: 'create' | 'edit' | 'view'; bj?: Bidjemen } | null>(null);
  const [nonaktifTarget, setNonaktifTarget] = useState<Bidjemen | null>(null);

  const columns: TableColumn<Bidjemen>[] = [
    { key: 'id', header: 'Kode', render: (b) => <span className="font-mono text-[11px] text-slate-400">{b.id}</span> },
    {
      key: 'nama',
      header: 'Nama',
      render: (b) => (
        <button onClick={() => setModal({ mode: readOnly ? 'view' : 'edit', bj: b })} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left">
          {b.nama}
        </button>
      ),
    },
    { key: 'sing', header: 'Singkatan', render: (b) => b.sing },
    { key: 'cak', header: 'Cakupan', render: (b) => <span className="text-[11px] text-slate-400">{b.cak}</span> },
    { key: 'status', header: 'Status', render: (b) => { const s = STATUS_BADGE(b.aktif); return <Badge color={s.color}>{s.label}</Badge>; } },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (b) =>
        readOnly ? (
          <button onClick={() => setModal({ mode: 'view', bj: b })} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat</button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setModal({ mode: 'edit', bj: b })} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Ubah</button>
            <button onClick={() => (b.aktif ? setNonaktifTarget(b) : setBidjemenActive(b.id, true))} className="text-xs font-bold text-slate-500 hover:underline">
              {b.aktif ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      <div className="p-2.5 rounded-[10px] bg-slate-50 border border-slate-200 text-[11px] text-slate-500">
        Bidjemen dibatasi hanya 4 entri baku (BR 4.3) — tidak dapat ditambah/dihapus, hanya nama/singkatan/cakupan dan status aktifnya yang dapat diubah.
      </div>
      <Table columns={columns} data={state.bidjemen} rowKey={(b) => b.id} />
      {modal && (
        <BidjemenFormModal mode={modal.mode} bj={modal.bj} onClose={() => setModal(null)} onSaved={(m) => { notify(m); setModal(null); }} />
      )}

      {nonaktifTarget && (
        <Modal
          isOpen
          onClose={() => setNonaktifTarget(null)}
          title={`Nonaktifkan Bidjemen ${nonaktifTarget.nama}?`}
          footer={
            <>
              <Button variant="outline" onClick={() => setNonaktifTarget(null)}>Batal</Button>
              <Button variant="danger" onClick={() => { setBidjemenActive(nonaktifTarget.id, false); notify(`${nonaktifTarget.nama} dinonaktifkan.`); setNonaktifTarget(null); }}>Nonaktifkan</Button>
            </>
          }
        />
      )}

    </div>
  );
};

const BidjemenFormModal: React.FC<{ mode: 'create' | 'edit' | 'view'; bj?: Bidjemen; onClose: () => void; onSaved: (m: string) => void }> = ({ mode, bj, onClose, onSaved }) => {
  const [nama, setNama] = useState(bj?.nama ?? '');
  const [sing, setSing] = useState(bj?.sing ?? '');
  const [cak, setCak] = useState(bj?.cak ?? '');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const readOnly = mode === 'view';
  const isDirty = !readOnly && (nama !== (bj?.nama ?? '') || sing !== (bj?.sing ?? '') || cak !== (bj?.cak ?? ''));
  const attemptClose = () => (isDirty ? setConfirmDiscard(true) : onClose());

  if (confirmDiscard) {
    return (
      <Modal
        isOpen
        onClose={() => setConfirmDiscard(false)}
        title="Buang perubahan?"
        description="Perubahan yang belum disimpan akan hilang."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDiscard(false)}>Batal</Button>
            <Button variant="danger" onClick={onClose}>Buang Perubahan</Button>
          </>
        }
      />
    );
  }

  return (
    <Modal
      isOpen
      onClose={attemptClose}
      title={mode === 'create' ? 'Tambah Bidjemen' : mode === 'view' ? `Detail Bidjemen — ${bj?.nama}` : `Ubah ${bj?.nama}`}
      footer={
        readOnly ? (
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        ) : (
          <>
            <Button variant="outline" onClick={attemptClose}>Batal</Button>
            <Button
              onClick={() => {
                if (!nama.trim()) return;
                if (mode === 'create') {
                  createBidjemen({ nama: nama.trim(), sing: sing.trim(), cak });
                  onSaved('Bidjemen berhasil ditambahkan.');
                } else if (bj) {
                  updateBidjemen(bj.id, { nama: nama.trim(), sing: sing.trim(), cak });
                  onSaved('Bidjemen berhasil diperbarui.');
                }
              }}
            >
              Simpan
            </Button>
          </>
        )
      }
    >
      <div className="space-y-3">
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Bidang</label>
          <Input value={nama} onChange={(e) => setNama(e.target.value)} disabled={readOnly} placeholder="Mis. Bidang Operasional" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Singkatan</label>
          <Input value={sing} onChange={(e) => setSing(e.target.value)} disabled={readOnly} placeholder="Mis. Ops" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Cakupan</label>
          <Textarea rows={2} value={cak} onChange={(e) => setCak(e.target.value)} disabled={readOnly} />
        </div>
      </div>
    </Modal>
  );
};

/* ============================================================================================ *
 * 4.4 Katalog Data & Dokumen
 * ============================================================================================ */
const KatalogScreen: React.FC<{ readOnly: boolean; notify: (m: string) => void }> = ({ readOnly, notify }) => {
  const [tab, setTab] = useState<'daftar' | 'template'>('daftar');
  return (
    <div className="space-y-3">
      <SegmentedControl options={[{ value: 'daftar', label: 'Daftar Dokumen' }, { value: 'template', label: 'Template' }]} value={tab} onChange={(v) => setTab(v as 'daftar' | 'template')} />
      {tab === 'daftar' ? <KatalogDaftarTable readOnly={readOnly} notify={notify} /> : <TemplateTable readOnly={readOnly} notify={notify} />}
    </div>
  );
};

/** 4.4 tab Template — skema field & contoh baku per dokumen berjenis "Data" (Plane B.1
 * Pra-Audit "Template", digabung sebagai tab di dalam 4.4 Katalog per keputusan plan). */
const TemplateTable: React.FC<{ readOnly: boolean; notify: (m: string) => void }> = ({ readOnly, notify }) => {
  const state = useAuditUniverseStore();
  const [editing, setEditing] = useState<TemplateDokumen | null>(null);
  const dataDocs = state.katalog.filter((d) => d.jenis === 'Data');

  const columns: TableColumn<KatalogDokumen>[] = [
    { key: 'dok', header: 'Dokumen/Data', render: (d) => <span className="font-bold text-slate-800">{d.nama}</span> },
    { key: 'template', header: 'Template', render: (d) => { const t = getTemplateByDok(d.id); return t ? <span>{t.nama} <Badge color="info">v{t.versi}</Badge></span> : <span className="text-slate-400">Belum ada template</span>; } },
    { key: 'fields', header: 'Jumlah Field', render: (d) => getTemplateByDok(d.id)?.fields.length ?? '–' },
    { key: 'contoh', header: 'Contoh Baku', render: (d) => { const t = getTemplateByDok(d.id); return t ? <span className="font-mono text-[11px] text-slate-500">{t.contohBakuUrl}</span> : '–'; } },
    ...(readOnly
      ? []
      : [
          {
            key: 'aksi',
            header: 'Aksi',
            render: (d: KatalogDokumen) => {
              const t = getTemplateByDok(d.id);
              return (
                <button
                  onClick={() => {
                    if (t) setEditing(t);
                    else setEditing(createTemplateDokumen({ dokId: d.id, nama: `Template ${d.nama}`, fields: [{ nama: 'Nama Satker', tipe: 'Teks' }], contohBakuUrl: `contoh-baku_${d.id}.xlsx` }));
                  }}
                  className="text-xs font-bold text-[var(--sd-primary)] hover:underline"
                >
                  {t ? 'Ubah' : 'Buat Template'}
                </button>
              );
            },
          } as TableColumn<KatalogDokumen>,
        ]),
  ];

  return (
    <div className="space-y-3">
      {dataDocs.length === 0 ? (
        <EmptyState title="Belum ada dokumen berjenis Data pada katalog" />
      ) : (
        <Card><Table columns={columns} data={dataDocs} rowKey={(d) => d.id} /></Card>
      )}
      {editing && (
        <Modal isOpen onClose={() => setEditing(null)} title={`Ubah Template — ${editing.nama}`} widthClassName="max-w-lg"
          footer={<Button onClick={() => { notify('Template berhasil disimpan.'); setEditing(null); }}>Simpan</Button>}
        >
          <TemplateEditor template={editing} />
        </Modal>
      )}
    </div>
  );
};

const TemplateEditor: React.FC<{ template: TemplateDokumen }> = ({ template }) => {
  const [nama, setNama] = useState(template.nama);
  const [contohBakuUrl, setContohBakuUrl] = useState(template.contohBakuUrl);
  const [fields, setFields] = useState(template.fields);

  React.useEffect(() => {
    updateTemplateDokumen(template.id, { nama, contohBakuUrl, fields });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [nama, contohBakuUrl, fields]);

  return (
    <div className="space-y-3">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Template</label>
        <Input value={nama} onChange={(e) => setNama(e.target.value)} />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Skema Field</label>
        <div className="space-y-1.5">
          {fields.map((f, i) => (
            <div key={i} className="flex items-center gap-2">
              <Input value={f.nama} onChange={(e) => setFields((prev) => prev.map((p, pi) => (pi === i ? { ...p, nama: e.target.value } : p)))} className="flex-1" />
              <Select
                options={(['Teks', 'Angka', 'Tanggal', 'Pilihan'] as const).map((t) => ({ value: t, label: t }))}
                value={f.tipe}
                onChange={(v) => setFields((prev) => prev.map((p, pi) => (pi === i ? { ...p, tipe: v as TemplateDokumen['fields'][number]['tipe'] } : p)))}
                className="w-28"
              />
              <button onClick={() => setFields((prev) => prev.filter((_, pi) => pi !== i))} className="text-rose-500 text-xs font-bold">Hapus</button>
            </div>
          ))}
        </div>
        <button onClick={() => setFields((prev) => [...prev, { nama: 'Field Baru', tipe: 'Teks' }])} className="mt-2 text-xs font-bold text-[var(--sd-primary)] hover:underline">+ Tambah Field</button>
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Berkas Contoh Baku</label>
        <Input value={contohBakuUrl} onChange={(e) => setContohBakuUrl(e.target.value)} />
      </div>
    </div>
  );
};

const KatalogDaftarTable: React.FC<{ readOnly: boolean; notify: (m: string) => void }> = ({ readOnly, notify }) => {
  const state = useAuditUniverseStore();
  const [search, setSearch] = useState('');
  const [kategoriFilter, setKategoriFilter] = useState('');
  const [caraFilter, setCaraFilter] = useState('');
  const [onlyPerluDicek, setOnlyPerluDicek] = useState(false);
  const [modal, setModal] = useState<{ mode: 'create' | 'edit' | 'view'; dok?: KatalogDokumen } | null>(null);
  const [nonaktifTarget, setNonaktifTarget] = useState<KatalogDokumen | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<KatalogDokumen | null>(null);
  const [blockedReason, setBlockedReason] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return state.katalog.filter((d) => {
      if (kategoriFilter && d.kat !== kategoriFilter) return false;
      if (caraFilter && d.cara !== caraFilter) return false;
      if (onlyPerluDicek && d.cek.length === 0) return false;
      if (search && !d.nama.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [state.katalog, kategoriFilter, caraFilter, onlyPerluDicek, search]);

  const { page, pageSize, setPage, setPageSize, pageItems } = usePagination(filtered, 10);

  const columns: TableColumn<KatalogDokumen>[] = [
    { key: 'id', header: 'Kode', render: (d) => <span className="font-mono text-[11px] text-slate-400">{d.id}</span> },
    {
      key: 'nama',
      header: 'Nama Dokumen/Data',
      render: (d) => (
        <div>
          <button onClick={() => setModal({ mode: readOnly ? 'view' : 'edit', dok: d })} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left">
            {d.nama}
          </button>
          {d.cek.length > 0 && <Badge color="warning" className="ml-2">Perlu Dicek</Badge>}
        </div>
      ),
    },
    { key: 'kat', header: 'Kategori', render: (d) => <Badge color="indigo">{KATEGORI_DOKUMEN.find(([k]) => k === d.kat)?.[1] ?? d.kat}</Badge> },
    { key: 'jenis', header: 'Jenis', render: (d) => d.jenis },
    { key: 'cara', header: 'Cara Pengambilan', render: (d) => d.cara },
    { key: 'sumber', header: 'Sumber', render: (d) => <span className="text-[11px] text-slate-400">{d.sumber}</span> },
    { key: 'sifat', header: 'Sifat', render: (d) => <Badge color={d.sifat === 'Wajib' ? 'danger' : d.sifat === 'Kondisional' ? 'warning' : 'neutral'}>{d.sifat}</Badge> },
    { key: 'status', header: 'Status', render: (d) => { const s = STATUS_BADGE(d.aktif); return <Badge color={s.color}>{s.label}</Badge>; } },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (d) =>
        readOnly ? (
          <button onClick={() => setModal({ mode: 'view', dok: d })} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat</button>
        ) : (
          <div className="flex items-center gap-2">
            <button onClick={() => setModal({ mode: 'edit', dok: d })} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Ubah</button>
            <button onClick={() => (d.aktif ? setNonaktifTarget(d) : setKatalogDokumenActive(d.id, true))} className="text-xs font-bold text-slate-500 hover:underline">
              {d.aktif ? 'Nonaktifkan' : 'Aktifkan'}
            </button>
            <button onClick={() => setDeleteTarget(d)} className="text-xs font-bold text-rose-500 hover:underline">Hapus</button>
          </div>
        ),
    },
  ];

  return (
    <div className="space-y-3">
      <Card className="space-y-3">
        <div className="flex flex-wrap items-end gap-3">
          <Search value={search} onChange={setSearch} placeholder="Cari nama dokumen..." className="flex-1 min-w-48" />
          <Select options={KATEGORI_DOKUMEN.map(([k, v]) => ({ value: k, label: v }))} value={kategoriFilter} onChange={setKategoriFilter} placeholder="Semua Kategori" className="w-52" />
          <Select options={[{ value: 'Upload', label: 'Upload' }, { value: 'Integrasi', label: 'Integrasi' }, { value: 'Terjadwal', label: 'Terjadwal' }]} value={caraFilter} onChange={setCaraFilter} placeholder="Semua Cara" className="w-40" />
          <Checkbox checked={onlyPerluDicek} onChange={setOnlyPerluDicek} label={<span className="text-xs font-bold text-slate-600">Hanya Perlu Dicek</span>} />
          {!readOnly && (
            <Button onClick={() => setModal({ mode: 'create' })}>
              <Plus className="w-4 h-4" /> Tambah Dokumen
            </Button>
          )}
        </div>
      </Card>
      {filtered.length === 0 ? (
        <EmptyState title="Tidak ada dokumen yang cocok" icon={<FolderKanban className="w-6 h-6 text-slate-300" />} />
      ) : (
        <>
          <Table columns={columns} data={pageItems} rowKey={(d) => d.id} />
          <Pagination currentPage={page} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="dokumen" />
        </>
      )}
      {modal && (
        <KatalogFormModal mode={modal.mode} dok={modal.dok} onClose={() => setModal(null)} onSaved={(m) => { notify(m); setModal(null); }} />
      )}

      {nonaktifTarget && (
        <Modal
          isOpen
          onClose={() => setNonaktifTarget(null)}
          title={`Nonaktifkan dokumen ${nonaktifTarget.nama}?`}
          description="Dokumen ini tidak akan muncul lagi sebagai pilihan baru pada Permintaan Pengumpulan Data."
          footer={
            <>
              <Button variant="outline" onClick={() => setNonaktifTarget(null)}>Batal</Button>
              <Button variant="danger" onClick={() => { setKatalogDokumenActive(nonaktifTarget.id, false); notify(`${nonaktifTarget.nama} dinonaktifkan.`); setNonaktifTarget(null); }}>Nonaktifkan</Button>
            </>
          }
        />
      )}

      {deleteTarget && (
        <Modal
          isOpen
          onClose={() => setDeleteTarget(null)}
          title={`Hapus dokumen ${deleteTarget.nama}?`}
          description="Tindakan ini tidak dapat dibatalkan. Dokumen yang sudah dipakai pada permintaan tidak dapat dihapus — nonaktifkan saja."
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
              <Button
                variant="danger"
                onClick={() => {
                  const res = deleteKatalogDokumen(deleteTarget.id);
                  setDeleteTarget(null);
                  if (res.ok) notify(`${deleteTarget.nama} berhasil dihapus.`);
                  else setBlockedReason(res.reason ?? 'Data ini tidak dapat dihapus.');
                }}
              >
                Hapus
              </Button>
            </>
          }
        />
      )}

      {blockedReason && (
        <Modal isOpen onClose={() => setBlockedReason(null)} title="Tidak bisa dihapus" footer={<Button variant="outline" onClick={() => setBlockedReason(null)}>Tutup</Button>}>
          <p className="text-xs text-slate-600">{blockedReason}</p>
        </Modal>
      )}
    </div>
  );
};

const CARA_SUMBER_DEFAULT: Record<KatalogDokumen['cara'], string> = { Upload: 'Satu Data Itwasum', Integrasi: 'E-Audit', Terjadwal: 'Google Drive' };

const KatalogFormModal: React.FC<{ mode: 'create' | 'edit' | 'view'; dok?: KatalogDokumen; onClose: () => void; onSaved: (m: string) => void }> = ({ mode, dok, onClose, onSaved }) => {
  const [kat, setKat] = useState(dok?.kat ?? KATEGORI_DOKUMEN[0][0]);
  const [nama, setNama] = useState(dok?.nama ?? '');
  const [desk, setDesk] = useState(dok?.desk ?? '');
  const [jenis, setJenis] = useState<KatalogDokumen['jenis']>(dok?.jenis ?? 'Dokumen');
  const [cara, setCara] = useState<KatalogDokumen['cara']>(dok?.cara ?? 'Upload');
  const [sumber, setSumber] = useState(dok?.sumber ?? CARA_SUMBER_DEFAULT.Upload);
  const [sifat, setSifat] = useState<KatalogDokumen['sifat']>(dok?.sifat ?? 'Opsional');
  const [bidjemenId, setBidjemenId] = useState(dok?.bidjemenId ?? '');
  const [objekPemeriksaanId, setObjekPemeriksaanId] = useState(dok?.objekPemeriksaanId ?? '');
  const [periodisitas, setPeriodisitas] = useState<NonNullable<KatalogDokumen['periodisitas']>>(dok?.periodisitas ?? 'Tahunan');
  const [berlakuMulai, setBerlakuMulai] = useState(dok?.berlakuMulai ?? '');
  const [berlakuSampai, setBerlakuSampai] = useState(dok?.berlakuSampai ?? '');
  const state = useAuditUniverseStore();
  const [error, setError] = useState('');
  const [confirmDiscard, setConfirmDiscard] = useState(false);
  const readOnly = mode === 'view';
  const isDirty = !readOnly && (kat !== (dok?.kat ?? KATEGORI_DOKUMEN[0][0]) || nama !== (dok?.nama ?? '') || desk !== (dok?.desk ?? '') || jenis !== (dok?.jenis ?? 'Dokumen') || cara !== (dok?.cara ?? 'Upload') || sumber !== (dok?.sumber ?? CARA_SUMBER_DEFAULT.Upload) || sifat !== (dok?.sifat ?? 'Opsional'));
  const attemptClose = () => (isDirty ? setConfirmDiscard(true) : onClose());

  if (confirmDiscard) {
    return (
      <Modal
        isOpen
        onClose={() => setConfirmDiscard(false)}
        title="Buang perubahan?"
        description="Perubahan yang belum disimpan akan hilang."
        footer={
          <>
            <Button variant="outline" onClick={() => setConfirmDiscard(false)}>Batal</Button>
            <Button variant="danger" onClick={onClose}>Buang Perubahan</Button>
          </>
        }
      />
    );
  }

  return (
    <Modal
      isOpen
      onClose={attemptClose}
      title={mode === 'create' ? 'Tambah Dokumen/Data' : mode === 'view' ? `Detail Dokumen — ${dok?.nama}` : `Ubah ${dok?.nama}`}
      widthClassName="max-w-xl"
      footer={
        readOnly ? (
          <Button variant="outline" onClick={onClose}>Tutup</Button>
        ) : (
          <>
            <Button variant="outline" onClick={attemptClose}>Batal</Button>
            <Button
              onClick={() => {
                if (!nama.trim()) return setError('Nama dokumen wajib diisi.');
                const extra = { bidjemenId: bidjemenId || undefined, objekPemeriksaanId: objekPemeriksaanId || undefined, periodisitas, berlakuMulai: berlakuMulai || undefined, berlakuSampai: berlakuSampai || undefined };
                if (mode === 'create') {
                  createKatalogDokumen({ kat, nama: nama.trim(), desk, jenis, cara, sumber, sifat, versi: 1, ...extra });
                  onSaved('Dokumen berhasil ditambahkan ke katalog.');
                } else if (dok) {
                  updateKatalogDokumen(dok.id, { kat, nama: nama.trim(), desk, jenis, cara, sumber, sifat, versi: (dok.versi ?? 1) + 1, ...extra });
                  onSaved(`Dokumen katalog berhasil diperbarui (versi ${(dok.versi ?? 1) + 1}).`);
                }
            }}
          >
            Simpan
            </Button>
          </>
        )
      }
    >
      <div className="space-y-3">
        {error && <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">{error}</div>}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Kategori</label>
            <Select options={KATEGORI_DOKUMEN.map(([k, v]) => ({ value: k, label: v }))} value={kat} onChange={setKat} disabled={readOnly || mode === 'edit'} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Jenis</label>
            <Select options={[{ value: 'Dokumen', label: 'Dokumen' }, { value: 'Data', label: 'Data' }]} value={jenis} onChange={(v) => setJenis(v as KatalogDokumen['jenis'])} disabled={readOnly} />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama Dokumen/Data</label>
          <Input value={nama} onChange={(e) => setNama(e.target.value)} disabled={readOnly} placeholder="Mis. Laporan Realisasi Anggaran" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Deskripsi</label>
          <Textarea rows={2} value={desk} onChange={(e) => setDesk(e.target.value)} disabled={readOnly} />
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Cara Pengambilan</label>
            <Select
              options={[{ value: 'Upload', label: 'Upload' }, { value: 'Integrasi', label: 'Integrasi' }, { value: 'Terjadwal', label: 'Terjadwal' }]}
              value={cara}
              onChange={(v) => { setCara(v as KatalogDokumen['cara']); setSumber(CARA_SUMBER_DEFAULT[v as KatalogDokumen['cara']]); }}
              disabled={readOnly}
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Sumber</label>
            <Input value={sumber} onChange={(e) => setSumber(e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Sifat</label>
            <Select options={[{ value: 'Wajib', label: 'Wajib' }, { value: 'Kondisional', label: 'Kondisional' }, { value: 'Opsional', label: 'Opsional' }]} value={sifat} onChange={(v) => setSifat(v as KatalogDokumen['sifat'])} disabled={readOnly} />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Bidjemen</label>
            <Select options={state.bidjemen.filter((b) => b.aktif).map((b) => ({ value: b.id, label: b.nama }))} value={bidjemenId} onChange={setBidjemenId} placeholder="Tidak terkait" disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Objek Pemeriksaan</label>
            <Select options={state.objekPemeriksaan.filter((o) => o.aktif).map((o) => ({ value: o.id, label: o.nama }))} value={objekPemeriksaanId} onChange={setObjekPemeriksaanId} placeholder="Tidak terkait" disabled={readOnly} />
          </div>
        </div>
        <div className="grid grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Periodisitas</label>
            <Select options={(['Tahunan', 'Semesteran', 'Triwulanan', 'Bulanan', 'Insidentil'] as const).map((p) => ({ value: p, label: p }))} value={periodisitas} onChange={(v) => setPeriodisitas(v as NonNullable<KatalogDokumen['periodisitas']>)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Berlaku Mulai</label>
            <Input type="date" value={berlakuMulai} onChange={(e) => setBerlakuMulai(e.target.value)} disabled={readOnly} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Berlaku Sampai</label>
            <Input type="date" value={berlakuSampai} onChange={(e) => setBerlakuSampai(e.target.value)} disabled={readOnly} />
          </div>
        </div>
        {dok?.versi && <p className="text-[11px] text-slate-400">Versi saat ini: v{dok.versi}.</p>}
      </div>
    </Modal>
  );
};

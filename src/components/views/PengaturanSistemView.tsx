/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Modul B.9 - Tata Kelola Pengguna + Otorisasi Akses (ditulis ulang, Plan bagian 5e).
 * Mereplikasi `origin/development:src/app/user-management/` dan `.../access-control/` dengan
 * tangan (bukan salinan file, dibaca read-only via `git show origin/development:<path>`). Tab
 * "Pengaturan Data Master Terpadu" versi lama dipertahankan sebagai tab ketiga.
 */
import React, { useMemo, useState } from 'react';
import {
  Shield,
  Plus,
  CheckCircle2,
  X,
  Search as SearchIcon,
  ShieldAlert,
  UploadCloud,
  Download,
  Lock,
  Check,
  KeyRound,
  Save,
  RotateCcw,
} from 'lucide-react';
import { CurrentUserProfile, MasterDataItem, UserAccount } from '../../types';
import { USER_ACCOUNTS, MASTER_DATA_ITEMS } from '../../data/mockData';
import { logUbahHakAkses } from '../../utils/auditLogger';
import {
  MODULE_GROUP_ORDER,
  MODULE_GROUPS,
  MODULE_REGISTRY,
  ModuleId,
} from '../../config/moduleRegistry';
import {
  AccessMatrixState,
  CRUD_RESOURCE_LABEL,
  CrudPermissions,
  CrudResourceKey,
  CustomRoleDef,
  PREDEFINED_ROLE_CARDS,
  buildAccessMatrixSnapshot,
  getAccessMatrix,
  getAccessMatrixMeta,
  getCustomRoles,
  saveAccessMatrix,
  saveAccessMatrixMeta,
  saveCustomRoles,
} from '../../data/accessMatrixData';
import { AccountStatus, AccountStatusBadge, Badge, Button, Card, Checkbox, Input, Select, Typography } from '../ui/atoms';
import { EmptyState, FilterField, FilterPanel, Modal, Pagination, TabNavigation, usePagination } from '../ui/molecules';

interface PengaturanSistemViewProps {
  currentUser?: CurrentUserProfile;
  subPath?: string;
  onSubPathChange?: (subPath?: string) => void;
}

type B9Tab = 'pengguna' | 'kontrol-akses' | 'data-master';

export const PengaturanSistemView: React.FC<PengaturanSistemViewProps> = ({ currentUser, subPath, onSubPathChange }) => {
  const navigate = onSubPathChange ?? (() => {});
  const activeTab: B9Tab = subPath === 'kontrol-akses' || subPath === 'data-master' ? (subPath as B9Tab) : 'pengguna';

  const [userList, setUserList] = useState<UserAccount[]>(USER_ACCOUNTS);
  const [masterList] = useState<MasterDataItem[]>(MASTER_DATA_ITEMS);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  const notify = (msg: string) => {
    setSuccessToast(msg);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  return (
    <div className="space-y-4">
      {successToast && (
        <div className="p-3.5 rounded-[12px] bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold flex items-center justify-between shadow-sm">
          <div className="flex items-center gap-2"><CheckCircle2 className="w-4 h-4 text-emerald-600" /><span>{successToast}</span></div>
          <button onClick={() => setSuccessToast(null)}><X className="w-4 h-4" /></button>
        </div>
      )}

      {currentUser?.peran === 'admin_polda' && (
        <div className="p-3.5 rounded-[12px] bg-blue-50 border border-blue-200 text-xs text-[#0B2B5C] flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5"><Shield className="w-4 h-4 text-blue-700 shrink-0" /><span><strong>Kewenangan Admin Polda (L2):</strong> Anda memiliki hak mengelola akun personel wilayah &amp; mengusulkan mutasi hak akses ke Mabes Itwasum.</span></div>
          <Badge color="primary">Admin Wilayah</Badge>
        </div>
      )}
      {currentUser?.peran === 'super_admin' && (
        <div className="p-3.5 rounded-[12px] bg-violet-50 border border-violet-200 text-xs text-violet-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2">
          <div className="flex items-center gap-2.5"><Shield className="w-4 h-4 text-violet-700 shrink-0" /><span><strong>Kewenangan Super Admin Nasional (L0):</strong> Akses penuh konfigurasi pengguna, matriks hak akses, dan master data.</span></div>
          <Badge color="violet">Super Admin Mabes</Badge>
        </div>
      )}

      <TabNavigation
        tabs={[
          { id: 'pengguna', label: 'Tata Kelola Pengguna' },
          { id: 'kontrol-akses', label: 'Otorisasi Akses' },
          { id: 'data-master', label: 'Pengaturan Data Master Terpadu' },
        ]}
        activeTab={activeTab}
        onTabChange={(id) => navigate(id === 'pengguna' ? undefined : id)}
      />

      {activeTab === 'pengguna' && (
        <TataKelolaPenggunaTab currentUser={currentUser} userList={userList} setUserList={setUserList} notify={notify} />
      )}
      {activeTab === 'kontrol-akses' && <OtorisasiAksesTab currentUser={currentUser} notify={notify} />}
      {activeTab === 'data-master' && <DataMasterTab masterList={masterList} />}
    </div>
  );
};

/* ============================================================================================ *
 * Tab 1: Tata Kelola Pengguna
 * ============================================================================================ */

const TataKelolaPenggunaTab: React.FC<{
  currentUser?: CurrentUserProfile;
  userList: UserAccount[];
  setUserList: React.Dispatch<React.SetStateAction<UserAccount[]>>;
  notify: (msg: string) => void;
}> = ({ currentUser, userList, setUserList, notify }) => {
  const [search, setSearch] = useState('');
  const [filterWilayah, setFilterWilayah] = useState('');
  const [filterPeran, setFilterPeran] = useState('');
  const [filterStatus, setFilterStatus] = useState('');
  const [showTambahModal, setShowTambahModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);
  const [showFreezeModal, setShowFreezeModal] = useState(false);

  const canManage = currentUser?.canManageUsers === 'all' || currentUser?.canManageUsers === 'wilayah';

  const wilayahOptions = useMemo(() => Array.from(new Set(userList.map((u) => u.wilayahLock || u.satker))).map((v) => ({ value: v, label: v })), [userList]);
  const peranOptions = useMemo(() => Array.from(new Set(userList.map((u) => u.role))).map((v) => ({ value: String(v), label: String(v) })), [userList]);
  const statusOptions = [
    { value: 'Aktif', label: 'Aktif' },
    { value: 'Menunggu Aktivasi', label: 'Menunggu Aktivasi' },
    { value: 'Dibekukan', label: 'Dibekukan' },
    { value: 'Non-Aktif', label: 'Non-Aktif' },
  ];

  const filtered = userList.filter((u) => {
    const matchSearch = !search || u.nama.toLowerCase().includes(search.toLowerCase()) || (u.nrp || '').includes(search);
    const matchWilayah = !filterWilayah || (u.wilayahLock || u.satker) === filterWilayah;
    const matchPeran = !filterPeran || String(u.role) === filterPeran;
    const matchStatus = !filterStatus || u.status === filterStatus;
    return matchSearch && matchWilayah && matchPeran && matchStatus;
  });

  const { pageItems, page, totalPages, setPage } = usePagination(filtered, 8);

  const filterFields: FilterField[] = [
    { key: 'wilayah', label: 'Satker / Wilayah', type: 'select', value: filterWilayah, onChange: setFilterWilayah, options: wilayahOptions, placeholder: 'Seluruh Indonesia' },
    { key: 'peran', label: 'Peran Aktif', type: 'select', value: filterPeran, onChange: setFilterPeran, options: peranOptions, placeholder: 'Semua Peran' },
    { key: 'status', label: 'Status', type: 'select', value: filterStatus, onChange: setFilterStatus, options: statusOptions, placeholder: 'Semua Status' },
  ];

  const mapStatus = (status: UserAccount['status']): AccountStatus => (status === 'Non-Aktif' ? 'Dibekukan' : status);

  const handleRestore = (u: UserAccount) => {
    setUserList((prev) => prev.map((x) => (x.id === u.id ? { ...x, status: 'Aktif' } : x)));
    notify(`Akses akun ${u.nama} berhasil dipulihkan.`);
  };

  const handleCreate = (created: UserAccount) => {
    setUserList((prev) => [created, ...prev]);
    setShowTambahModal(false);
    notify(`Akun pengguna untuk ${created.nama} berhasil dibuat.`);
  };

  return (
    <div className="space-y-4">
      <Card>
        <div className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Tata Kelola Pengguna &amp; Hak Akses</div>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mt-1">
          <Typography variant="headline-md">Tata Kelola Pengguna</Typography>
          <div className="w-full sm:w-72">
            <Input leftIcon={<SearchIcon className="w-4 h-4" />} value={search} onChange={(e) => setSearch(e.target.value)} placeholder="Cari NRP atau Nama..." />
          </div>
        </div>
      </Card>

      <FilterPanel fields={filterFields} onApply={() => setPage(1)} />

      <div className="flex flex-wrap items-center gap-2">
        <Button variant="danger" disabled={!canManage} onClick={() => setShowFreezeModal(true)}><ShieldAlert className="w-4 h-4" />Pembekuan Akun Darurat</Button>
        <Button variant="outline" disabled={!canManage} onClick={() => setShowImportModal(true)}><UploadCloud className="w-4 h-4" />Import Massal (Bulk Manual)</Button>
        <Button variant="primary" disabled={!canManage} onClick={() => setShowTambahModal(true)} className="sm:ml-auto"><Plus className="w-4 h-4" />Tambah Akun Manual Tunggal</Button>
      </div>

      <Card className="p-0 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-sm">
            <thead className="bg-[var(--sd-surface)] text-[11px] font-bold uppercase tracking-wide text-slate-500">
              <tr>
                <th className="px-4 py-3">NRP/NIP</th>
                <th className="px-4 py-3">Nama Lengkap &amp; Pangkat</th>
                <th className="px-4 py-3">Satker Asal (SIPP)</th>
                <th className="px-4 py-3">Penguncian Wilayah</th>
                <th className="px-4 py-3">Peran Aktif</th>
                <th className="px-4 py-3">Dokumen Legal</th>
                <th className="px-4 py-3">Status Akun</th>
                <th className="px-4 py-3 text-right">Aksi</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {pageItems.map((u) => (
                <tr key={u.id} className="hover:bg-slate-50 transition-colors">
                  <td className="px-4 py-3 font-mono text-slate-500">{u.nrp || '—'}</td>
                  <td className="px-4 py-3">
                    <div className="font-bold text-slate-900">{u.nama}</div>
                    <div className="text-[11px] text-slate-400">{u.username ? `@${u.username}` : u.pangkatNrp}</div>
                  </td>
                  <td className="px-4 py-3 text-slate-600">{u.satkerAsal || u.satker}</td>
                  <td className="px-4 py-3"><Badge color="neutral" icon={<Lock className="w-3 h-3" />}>{u.wilayahLock || 'Seluruh Indonesia'}</Badge></td>
                  <td className="px-4 py-3"><Badge color="indigo">{u.role}</Badge></td>
                  <td className="px-4 py-3">
                    {u.dokumenLegal ? (
                      <button className="text-xs font-bold text-[var(--sd-primary)] hover:underline font-mono">{u.dokumenLegal.nomor}</button>
                    ) : (
                      <Badge color="warning">Belum Dilampirkan</Badge>
                    )}
                  </td>
                  <td className="px-4 py-3"><AccountStatusBadge status={mapStatus(u.status)} /></td>
                  <td className="px-4 py-3 text-right">
                    <div className="flex items-center justify-end gap-1.5">
                      <Button variant="ghost" size="sm" disabled={!canManage}>Edit Akun</Button>
                      {(u.status === 'Dibekukan' || u.status === 'Non-Aktif') && (
                        <Button variant="outline" size="sm" disabled={!canManage} onClick={() => handleRestore(u)}>Pulihkan Akses</Button>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-3 border-t border-[var(--sd-outline-variant)]/40">
          <Pagination currentPage={page} totalItems={filtered.length} pageSize={8} onPageChange={setPage} itemLabel="pengguna" />
        </div>
      </Card>

      <TambahAkunModal isOpen={showTambahModal} onClose={() => setShowTambahModal(false)} onSave={handleCreate} />
      <ImportMassalModal isOpen={showImportModal} onClose={() => setShowImportModal(false)} onImport={(rows) => { setUserList((prev) => [...rows, ...prev]); setShowImportModal(false); notify(`${rows.length} akun berhasil diimpor secara massal.`); }} />
      <FreezeAkunModal
        isOpen={showFreezeModal}
        onClose={() => setShowFreezeModal(false)}
        userList={userList}
        onFreeze={(ids) => {
          setUserList((prev) => prev.map((u) => (ids.includes(u.id) ? { ...u, status: 'Dibekukan' } : u)));
          setShowFreezeModal(false);
          notify(`${ids.length} akun berhasil dibekukan secara darurat.`);
        }}
      />
    </div>
  );
};

const TambahAkunModal: React.FC<{ isOpen: boolean; onClose: () => void; onSave: (u: UserAccount) => void }> = ({ isOpen, onClose, onSave }) => {
  const [form, setForm] = useState({ nama: '', nrp: '', pangkatNrp: 'AKP / 88040112', role: 'Admin Satker', satker: '', email: '', wilayahLock: '' });

  const handleSubmit = () => {
    onSave({
      id: `u-${Date.now()}`,
      nama: form.nama || 'AKP Pengguna Baru, S.H.',
      pangkatNrp: form.pangkatNrp,
      role: form.role as UserAccount['role'],
      satker: form.satker || 'Belum ditentukan',
      satkerAsal: form.satker || 'Belum ditentukan',
      nrp: form.nrp,
      username: form.nama ? form.nama.toLowerCase().replace(/[^a-z]+/g, '.').replace(/^\.|\.$/g, '') : `user${Date.now()}`,
      wilayahLock: form.wilayahLock || 'Belum dikunci',
      email: form.email || 'user.baru@polri.go.id',
      status: 'Menunggu Aktivasi',
      loginTerakhir: 'Belum pernah login',
    });
    setForm({ nama: '', nrp: '', pangkatNrp: 'AKP / 88040112', role: 'Admin Satker', satker: '', email: '', wilayahLock: '' });
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Tambah Akun Pengguna Manual"
      footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Batal</Button><Button variant="primary" onClick={handleSubmit}>Buat Akun &amp; Aktifkan</Button></div>}
    >
      <div className="space-y-3">
        <Input placeholder="Nama Lengkap & Gelar*" value={form.nama} onChange={(e) => setForm({ ...form, nama: e.target.value })} />
        <div className="grid grid-cols-2 gap-3">
          <Input placeholder="NRP/NIP*" value={form.nrp} onChange={(e) => setForm({ ...form, nrp: e.target.value })} />
          <Input placeholder="Pangkat & NRP tampilan*" value={form.pangkatNrp} onChange={(e) => setForm({ ...form, pangkatNrp: e.target.value })} />
        </div>
        <Select value={form.role} onChange={(v) => setForm({ ...form, role: v })} options={['Admin Satker', 'Auditor Madya', 'Auditor Utama', 'Super Admin'].map((r) => ({ value: r, label: r }))} />
        <Input placeholder="Satker Asal (SIPP)*" value={form.satker} onChange={(e) => setForm({ ...form, satker: e.target.value })} />
        <Input placeholder="Penguncian Wilayah (contoh: Polda Jawa Barat)" value={form.wilayahLock} onChange={(e) => setForm({ ...form, wilayahLock: e.target.value })} />
        <Input placeholder="Email Kedinasan Polri*" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} />
      </div>
    </Modal>
  );
};

const ImportMassalModal: React.FC<{ isOpen: boolean; onClose: () => void; onImport: (rows: UserAccount[]) => void }> = ({ isOpen, onClose, onImport }) => {
  const [preview, setPreview] = useState<UserAccount[]>([]);

  const simulateUpload = () => {
    setPreview([
      { id: `u-imp-${Date.now()}-1`, nama: 'Bripka Contoh Pratama', pangkatNrp: 'Bripka / 93010011', role: 'Admin Satker', satker: 'Itwasda Polda Kalimantan Timur', satkerAsal: 'Itwasda Polda Kalimantan Timur', nrp: '93010011', username: 'contoh.pratama', wilayahLock: 'Polda Kalimantan Timur', email: 'contoh.pratama@polri.go.id', status: 'Menunggu Aktivasi', loginTerakhir: 'Belum pernah login' },
      { id: `u-imp-${Date.now()}-2`, nama: 'Bripka Contoh Kedua', pangkatNrp: 'Bripka / 93010022', role: 'Admin Satker', satker: 'Itwasda Polda Bali', satkerAsal: 'Itwasda Polda Bali', nrp: '93010022', username: 'contoh.kedua', wilayahLock: 'Polda Bali', email: 'contoh.kedua@polri.go.id', status: 'Menunggu Aktivasi', loginTerakhir: 'Belum pernah login' },
    ]);
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Import Massal (Bulk Manual)"
      widthClassName="max-w-2xl"
      footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Batal</Button><Button variant="primary" disabled={preview.length === 0} onClick={() => onImport(preview)}>Impor {preview.length || ''} Akun</Button></div>}
    >
      <div className="space-y-3">
        <div className="flex items-center justify-between p-3 rounded-[10px] bg-slate-50 border border-dashed border-slate-300">
          <div className="flex items-center gap-2 text-xs text-slate-600"><UploadCloud className="w-4 h-4 text-slate-400" />Unggah file .csv/.xlsx berisi data akun (maks 500 baris)</div>
          <Button variant="outline" size="sm" onClick={simulateUpload}>Pilih Berkas</Button>
        </div>
        <Button variant="ghost" size="sm"><Download className="w-3.5 h-3.5" />Unduh Templat Import</Button>
        {preview.length > 0 && (
          <div className="overflow-x-auto rounded-[10px] border border-slate-200">
            <table className="w-full text-xs">
              <thead className="bg-slate-50 text-[10px] font-bold uppercase text-slate-500">
                <tr><th className="px-3 py-2 text-left">Nama</th><th className="px-3 py-2 text-left">NRP</th><th className="px-3 py-2 text-left">Satker</th><th className="px-3 py-2 text-left">Wilayah Lock</th></tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {preview.map((r) => (
                  <tr key={r.id}><td className="px-3 py-2 font-bold">{r.nama}</td><td className="px-3 py-2 font-mono">{r.nrp}</td><td className="px-3 py-2">{r.satker}</td><td className="px-3 py-2">{r.wilayahLock}</td></tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};

const FreezeAkunModal: React.FC<{ isOpen: boolean; onClose: () => void; userList: UserAccount[]; onFreeze: (ids: string[]) => void }> = ({ isOpen, onClose, userList, onFreeze }) => {
  const [selected, setSelected] = useState<string[]>([]);
  const aktifUsers = userList.filter((u) => u.status === 'Aktif');

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Pembekuan Akun Darurat"
      footer={<div className="flex justify-end gap-2"><Button variant="outline" onClick={onClose}>Batal</Button><Button variant="danger" disabled={selected.length === 0} onClick={() => onFreeze(selected)}>Bekukan {selected.length || ''} Akun</Button></div>}
    >
      <p className="text-xs text-slate-500 mb-3">Pilih akun yang akan dibekukan segera karena indikasi kompromi keamanan atau permintaan disipliner mendesak.</p>
      <div className="space-y-1.5 max-h-64 overflow-y-auto">
        {aktifUsers.map((u) => (
          <Checkbox
            key={u.id}
            checked={selected.includes(u.id)}
            onChange={(checked) => setSelected((prev) => (checked ? [...prev, u.id] : prev.filter((id) => id !== u.id)))}
            label={<span><span className="font-bold">{u.nama}</span> <span className="text-slate-400">— {u.satkerAsal || u.satker}</span></span>}
          />
        ))}
      </div>
    </Modal>
  );
};

/* ============================================================================================ *
 * Tab 2: Otorisasi Akses (#/b9/kontrol-akses)
 * ============================================================================================ */

const OtorisasiAksesTab: React.FC<{ currentUser?: CurrentUserProfile; notify: (msg: string) => void }> = ({ currentUser, notify }) => {
  const [customRoles, setCustomRoles] = useState<CustomRoleDef[]>(() => getCustomRoles());
  const [matrix, setMatrix] = useState<AccessMatrixState>(() => getAccessMatrix());
  const [selectedRole, setSelectedRole] = useState<string>('super_admin');
  const [dirty, setDirty] = useState(false);
  const [meta, setMeta] = useState(() => getAccessMatrixMeta());
  const [showCustomRoleModal, setShowCustomRoleModal] = useState(false);

  const roleCards = [...PREDEFINED_ROLE_CARDS, ...customRoles.map((r) => ({ id: r.id, nama: r.nama, subLabel: r.subLabel, locked: false }))];
  const isLockedRole = selectedRole === 'super_admin';
  const config = matrix[selectedRole];

  const updateCrud = (resource: CrudResourceKey, field: keyof CrudPermissions, value: boolean) => {
    if (isLockedRole) return;
    setMatrix((prev) => ({ ...prev, [selectedRole]: { ...prev[selectedRole], crud: { ...prev[selectedRole].crud, [resource]: { ...prev[selectedRole].crud[resource], [field]: value } } } }));
    setDirty(true);
  };

  const updateModule = (moduleId: ModuleId, field: 'view' | 'export', value: boolean) => {
    if (isLockedRole) return;
    setMatrix((prev) => ({
      ...prev,
      [selectedRole]: {
        ...prev[selectedRole],
        modules: { ...prev[selectedRole].modules, [moduleId]: { ...(prev[selectedRole].modules[moduleId] || { view: false, export: false }), [field]: value } },
      },
    }));
    setDirty(true);
  };

  const handleSave = () => {
    saveAccessMatrix(matrix);
    const now = new Date().toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' });
    const actorNama = currentUser?.nama || 'Sistem';
    saveAccessMatrixMeta({ waktu: now, aktor: actorNama });
    setMeta({ waktu: now, aktor: actorNama });
    if (currentUser) {
      logUbahHakAkses(currentUser, `Matriks Peran: ${roleCards.find((r) => r.id === selectedRole)?.nama || selectedRole}`, '(konfigurasi sebelumnya)', buildAccessMatrixSnapshot(matrix[selectedRole]), actorNama);
    }
    setDirty(false);
    notify('Konfigurasi matriks hak akses berhasil disimpan.');
  };

  const handleCancel = () => {
    setMatrix(getAccessMatrix());
    setDirty(false);
  };

  const handleCreateCustomRole = (nama: string) => {
    const id = `custom-${Date.now()}`;
    const newRole: CustomRoleDef = { id, nama, subLabel: 'Peran kustom' };
    const updated = [...customRoles, newRole];
    setCustomRoles(updated);
    saveCustomRoles(updated);
    setMatrix((prev) => ({ ...prev, [id]: getAccessMatrix()[id] }));
    setSelectedRole(id);
    setShowCustomRoleModal(false);
  };

  return (
    <div className="space-y-4">
      <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold tracking-[0.15em] text-slate-400 uppercase">Matriks Peran &amp; Izin | Kontrol Akses</div>
          <Typography variant="headline-md">Otorisasi Akses</Typography>
        </div>
        <div className="flex items-center gap-2">
          <Button variant="outline" disabled={!dirty} onClick={handleCancel}><RotateCcw className="w-4 h-4" />Batal Perubahan</Button>
          <Button variant="primary" disabled={!dirty} onClick={handleSave}><Save className="w-4 h-4" />Simpan Konfigurasi Matriks</Button>
        </div>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-[320px_1fr] gap-4">
        <Card className="space-y-2">
          <div className="flex items-center justify-between mb-1">
            <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Pilih Peran (Role)</Typography>
          </div>
          <Button variant="outline" size="sm" className="w-full" onClick={() => setShowCustomRoleModal(true)}>+ Buat Peran Kustom Baru</Button>
          <div className="space-y-1.5 mt-2">
            {roleCards.map((r) => (
              <button
                key={r.id}
                onClick={() => setSelectedRole(r.id)}
                className={`w-full text-left p-2.5 rounded-[10px] border flex items-center justify-between gap-2 transition-colors ${
                  selectedRole === r.id ? 'bg-[var(--sd-inverse-primary)]/30 border-[var(--sd-primary)]' : 'border-[var(--sd-outline-variant)]/50 hover:bg-slate-50'
                }`}
              >
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">{r.nama}</div>
                  <div className="text-[10px] text-slate-400 truncate">{r.subLabel}</div>
                </div>
                {(r as any).locked ? <Lock className="w-3.5 h-3.5 text-slate-400 shrink-0" /> : selectedRole === r.id ? <Check className="w-3.5 h-3.5 text-[var(--sd-primary)] shrink-0" /> : null}
              </button>
            ))}
          </div>
          <p className="text-[10px] text-slate-400 mt-2">Hak akses berlaku instan setelah disimpan.</p>
        </Card>

        <div className="space-y-4">
          <Card>
            <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Hak Akses: {roleCards.find((r) => r.id === selectedRole)?.nama}</Typography>
            <p className="text-xs text-slate-500 mt-0.5">Atur modul yang dapat dilihat dan data yang boleh diunduh oleh peran ini.</p>
            {isLockedRole && <div className="mt-2 text-[11px] font-bold text-amber-700 bg-amber-50 border border-amber-200 rounded-[8px] px-2.5 py-1.5 inline-flex items-center gap-1.5"><Lock className="w-3 h-3" />Super Admin dikunci — hak akses selalu penuh dan tidak dapat diubah.</div>}
          </Card>

          {config && (
            <>
              <Card className="space-y-3">
                <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Grup CRUD</Typography>
                {(Object.keys(CRUD_RESOURCE_LABEL) as CrudResourceKey[]).map((resource) => {
                  const perm = config.crud[resource];
                  const anyActive = perm.read || perm.create || perm.update || perm.delete;
                  return (
                    <div key={resource} className="p-3 rounded-[10px] border border-[var(--sd-outline-variant)]/50">
                      <div className="flex items-center gap-1.5 mb-2">
                        {anyActive && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        <span className="text-xs font-bold text-slate-800">{CRUD_RESOURCE_LABEL[resource]}</span>
                      </div>
                      <div className="flex flex-wrap gap-3">
                        <Checkbox checked={perm.read} disabled={isLockedRole} onChange={(v) => updateCrud(resource, 'read', v)} label={`Read ${CRUD_RESOURCE_LABEL[resource]} data`} />
                        <Checkbox checked={perm.create} disabled={isLockedRole} onChange={(v) => updateCrud(resource, 'create', v)} label={`Create ${CRUD_RESOURCE_LABEL[resource]} data`} />
                        <Checkbox checked={perm.update} disabled={isLockedRole} onChange={(v) => updateCrud(resource, 'update', v)} label={`Update ${CRUD_RESOURCE_LABEL[resource]} data`} />
                        <Checkbox checked={perm.delete} disabled={isLockedRole} onChange={(v) => updateCrud(resource, 'delete', v)} label={`Delete ${CRUD_RESOURCE_LABEL[resource]} data`} />
                        {resource === 'role' && (
                          <>
                            <Checkbox checked={Boolean(perm.readRoleMatrix)} disabled={isLockedRole} onChange={(v) => updateCrud(resource, 'readRoleMatrix', v)} label="Read role permission matrix" />
                            <Checkbox checked={Boolean(perm.assignPermission)} disabled={isLockedRole} onChange={(v) => updateCrud(resource, 'assignPermission', v)} label="Assign permission to role" />
                          </>
                        )}
                      </div>
                    </div>
                  );
                })}
              </Card>

              <Card className="space-y-3">
                <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Grup Modul (dibangkitkan dari MODULE_REGISTRY)</Typography>
                {MODULE_GROUP_ORDER.map((groupId) => {
                  const modules = MODULE_REGISTRY.filter((m) => m.group === groupId);
                  if (modules.length === 0) return null;
                  const isLockedGroup = groupId === 'tata-kelola';
                  const groupHasActive = modules.some((m) => config.modules[m.id as ModuleId]?.view);
                  return (
                    <div key={groupId} className={`p-3 rounded-[10px] border ${isLockedGroup ? 'border-slate-100 bg-slate-50/60 opacity-70' : 'border-[var(--sd-outline-variant)]/50'}`}>
                      <div className="flex items-center gap-1.5 mb-2">
                        {groupHasActive && <Check className="w-3.5 h-3.5 text-emerald-600" />}
                        <span className="text-xs font-bold text-slate-800">{MODULE_GROUPS[groupId].label}</span>
                        {isLockedGroup && <Lock className="w-3 h-3 text-slate-400" />}
                      </div>
                      <div className="space-y-1.5">
                        {modules.map((m) => {
                          const perm = config.modules[m.id as ModuleId] || { view: false, export: false };
                          return (
                            <div key={m.id} className="flex items-center justify-between gap-3 py-1">
                              <span className="text-xs text-slate-600 truncate">{m.kode ? `${m.kode} — ` : ''}{m.label}</span>
                              <div className="flex items-center gap-3 shrink-0">
                                <Checkbox checked={perm.view} disabled={isLockedRole || isLockedGroup} onChange={(v) => updateModule(m.id as ModuleId, 'view', v)} label="Lihat Menu (View)" />
                                <Checkbox checked={perm.export} disabled={isLockedRole || isLockedGroup} onChange={(v) => updateModule(m.id as ModuleId, 'export', v)} label="Izin Unduh & Ekspor Data" />
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </div>
                  );
                })}
              </Card>
            </>
          )}

          <div className="p-3.5 rounded-[10px] bg-amber-50 border border-amber-200 text-xs text-amber-800 flex flex-col sm:flex-row sm:items-center justify-between gap-1.5">
            <span className="font-bold">Modul User &amp; Role Management dikunci dan hanya dapat diakses oleh Admin Itwasum.</span>
            {meta && <span className="text-[11px] text-amber-700 shrink-0">Terakhir diubah: {meta.waktu} oleh {meta.aktor}</span>}
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCustomRoleModal}
        onClose={() => setShowCustomRoleModal(false)}
        title="Buat Peran Kustom Baru"
        footer={<CustomRoleFooter onCancel={() => setShowCustomRoleModal(false)} onCreate={handleCreateCustomRole} />}
      >
        <p className="text-xs text-slate-500">Peran kustom baru akan dibuat dengan matriks izin default (kosong) dan dapat langsung dikonfigurasi.</p>
      </Modal>
    </div>
  );
};

const CustomRoleFooter: React.FC<{ onCancel: () => void; onCreate: (nama: string) => void }> = ({ onCancel, onCreate }) => {
  const [nama, setNama] = useState('');
  return (
    <div className="flex items-center gap-2 w-full">
      <Input placeholder="Nama peran kustom..." value={nama} onChange={(e) => setNama(e.target.value)} className="flex-1" />
      <Button variant="outline" onClick={onCancel}>Batal</Button>
      <Button variant="primary" disabled={!nama.trim()} onClick={() => onCreate(nama.trim())}>Buat Peran</Button>
    </div>
  );
};

/* ============================================================================================ *
 * Tab 3: Pengaturan Data Master Terpadu (dipertahankan)
 * ============================================================================================ */

const DataMasterTab: React.FC<{ masterList: MasterDataItem[] }> = ({ masterList }) => {
  const [category, setCategory] = useState('Semua');
  const categories = ['Semua', 'Jenis Pengawasan', 'Tipologi Satker', 'Katalog Pra-Audit', 'Template Dokumen', 'Mapping Kebutuhan Dokumen'];
  const filtered = category === 'Semua' ? masterList : masterList.filter((m) => m.kategori === category);

  return (
    <Card className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
        <div>
          <Typography variant="headline-md">Pengaturan Data Master Terpadu</Typography>
          <p className="text-xs text-slate-500 mt-0.5">Konsolidasi 5 sub-katalog pengawasan, tipologi, template, dan berkas pra-audit:</p>
        </div>
        <div className="flex items-center gap-1 bg-[var(--sd-surface)] p-1 rounded-[10px] flex-wrap">
          {categories.map((cat) => (
            <button key={cat} onClick={() => setCategory(cat)} className={`px-2.5 py-1 rounded-[8px] text-xs font-semibold transition-colors ${category === cat ? 'bg-[var(--sd-primary)] text-white' : 'text-slate-600 hover:text-slate-900'}`}>
              {cat}
            </button>
          ))}
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState title="Tidak ada data master pada kategori ini." icon={<KeyRound className="w-6 h-6 text-slate-300" />} />
      ) : (
        <div className="space-y-2.5">
          {filtered.map((item) => (
            <div key={item.id} className="p-3.5 rounded-[10px] border border-[var(--sd-outline-variant)]/50 bg-slate-50 flex items-start justify-between gap-4 flex-wrap">
              <div>
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="px-2 py-0.5 rounded-[6px] text-xs font-mono font-bold bg-slate-200 text-slate-800">{item.kode}</span>
                  <span className="font-bold text-xs text-slate-900">{item.nama}</span>
                  <Badge color="info">{item.kategori}</Badge>
                </div>
                <p className="text-xs text-slate-600 mt-1">{item.keterangan}</p>
                <div className="text-[11px] text-slate-400 mt-1">Update: {item.updateTerakhir}</div>
              </div>
              <Badge color="success">{item.status}</Badge>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.12 Konfigurasi — 5.1 Mapping Ketentuan Pengumpulan & 5.2 Aturan Validasi
 * (plane/b-12-functional-specification-document-fsd-audit-universe.md §5.1-5.2).
 * Admin Itwasum mengelola dokumen katalog wajib per Jenis Pengawasan + aturan format/ukuran/
 * tanda tangan per dokumen; peran lain melihat saja.
 */
import React, { useState } from 'react';
import { CheckCircle2, Plus, Workflow, XCircle } from 'lucide-react';
import type { CurrentUserProfile } from '../../../../types';
import {
  useAuditUniverseStore,
  createMappingRule,
  updateMappingRule,
  setMappingRuleActive,
  deleteMappingRule,
  updateAturanValidasi,
  getDokById,
  getJpById,
} from '../../../../data/auditUniverse';
import type { MappingRule, AturanValidasi } from '../../../../data/auditUniverse';
import { canManageMasterData } from '../../../../data/auditUniverse/roleMapping';
import {
  Badge,
  Button,
  Card,
  Checkbox,
  EmptyState,
  Input,
  Modal,
  Table,
  Textarea,
  Toggle,
  type TableColumn,
} from '../../../ui';

export const MappingScreen: React.FC<{ currentUser: CurrentUserProfile }> = ({ currentUser }) => {
  const state = useAuditUniverseStore();
  const canManage = canManageMasterData(currentUser);
  const [formModal, setFormModal] = useState<{ mode: 'create' | 'edit'; rule?: MappingRule } | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<MappingRule | null>(null);

  const columns: TableColumn<MappingRule>[] = [
    { key: 'jp', header: 'Jenis Pengawasan', render: (r) => <span className="font-bold text-slate-800">{getJpById(r.jpId)?.nama ?? r.jpId}</span> },
    { key: 'tipologi', header: 'Berlaku Untuk', render: (r) => (r.tipologiIds.length ? `${r.tipologiIds.length} tipologi` : 'Seluruh tipologi') },
    { key: 'dok', header: 'Dokumen Wajib', render: (r) => <span className="text-xs">{r.dokumenIds.length} dokumen</span> },
    { key: 'versi', header: 'Versi', render: (r) => `v${r.versi}` },
    { key: 'status', header: 'Status', render: (r) => <Badge color={r.aktif ? 'success' : 'neutral'}>{r.aktif ? 'Aktif' : 'Nonaktif'}</Badge> },
    ...(canManage
      ? [
          {
            key: 'aksi',
            header: 'Aksi',
            render: (r: MappingRule) => (
              <div className="flex items-center gap-2">
                <button onClick={() => setFormModal({ mode: 'edit', rule: r })} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Ubah</button>
                <button onClick={() => setMappingRuleActive(r.id, !r.aktif)} className="text-xs font-bold text-slate-500 hover:underline">{r.aktif ? 'Nonaktifkan' : 'Aktifkan'}</button>
                <button onClick={() => setDeleteTarget(r)} className="text-xs font-bold text-rose-500 hover:underline">Hapus</button>
              </div>
            ),
          } as TableColumn<MappingRule>,
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500 max-w-2xl">Menentukan dokumen katalog yang wajib dikumpulkan Satker untuk setiap Jenis Pengawasan (opsional dipersempit per tipologi). Dipakai sebagai referensi kelengkapan pada Permintaan Pengumpulan Data &amp; Portal Satker.</p>
        {canManage && (
          <Button onClick={() => setFormModal({ mode: 'create' })}>
            <Plus className="w-4 h-4" /> Buat Mapping
          </Button>
        )}
      </div>
      {state.mappingRules.length === 0 ? (
        <EmptyState title="Belum ada mapping" icon={<Workflow className="w-6 h-6 text-slate-300" />} />
      ) : (
        <Card>
          <Table columns={columns} data={state.mappingRules} rowKey={(r) => r.id} />
        </Card>
      )}

      {formModal && <MappingFormModal mode={formModal.mode} rule={formModal.rule} onClose={() => setFormModal(null)} />}

      {deleteTarget && (
        <Modal
          isOpen
          onClose={() => setDeleteTarget(null)}
          title="Hapus mapping ini?"
          description={`Dokumen wajib untuk ${getJpById(deleteTarget.jpId)?.nama ?? deleteTarget.jpId} tidak akan lagi ditandai wajib berdasarkan mapping ini.`}
          footer={
            <>
              <Button variant="outline" onClick={() => setDeleteTarget(null)}>Batal</Button>
              <Button variant="danger" onClick={() => { deleteMappingRule(deleteTarget.id); setDeleteTarget(null); }}>Hapus</Button>
            </>
          }
        />
      )}
    </div>
  );
};

const MappingFormModal: React.FC<{ mode: 'create' | 'edit'; rule?: MappingRule; onClose: () => void }> = ({ mode, rule, onClose }) => {
  const state = useAuditUniverseStore();
  const [jpId, setJpId] = useState(rule?.jpId ?? state.jenisPengawasan.find((j) => !j.induk && j.aktif)?.id ?? '');
  const [tipologiIds, setTipologiIds] = useState<string[]>(rule?.tipologiIds ?? []);
  const [dokumenIds, setDokumenIds] = useState<string[]>(rule?.dokumenIds ?? []);
  const [catatan, setCatatan] = useState(rule?.catatan ?? '');
  const [error, setError] = useState('');

  const toggleDok = (id: string) => setDokumenIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));
  const toggleTip = (id: string) => setTipologiIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  const handleSave = () => {
    if (!jpId) return setError('Pilih Jenis Pengawasan.');
    if (dokumenIds.length === 0) return setError('Pilih minimal satu dokumen wajib.');
    if (mode === 'create') {
      createMappingRule({ jpId, tipologiIds, dokumenIds, aktif: true, berlakuMulai: new Date().toISOString().slice(0, 10), catatan });
    } else if (rule) {
      updateMappingRule(rule.id, { jpId, tipologiIds, dokumenIds, catatan });
    }
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title={mode === 'create' ? 'Buat Mapping Ketentuan Pengumpulan' : 'Ubah Mapping'} widthClassName="max-w-2xl"
      footer={<><Button variant="outline" onClick={onClose}>Batal</Button><Button onClick={handleSave}>Simpan</Button></>}
    >
      <div className="space-y-4">
        {error && <div className="p-2.5 rounded-[8px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">{error}</div>}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Jenis Pengawasan</label>
          <select value={jpId} onChange={(e) => setJpId(e.target.value)} className="w-full h-10 rounded-[10px] border border-[var(--sd-outline-variant)] bg-white px-3 text-sm">
            {state.jenisPengawasan.filter((j) => !j.induk && j.aktif).map((j) => <option key={j.id} value={j.id}>{j.nama}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Berlaku Untuk Tipologi (kosongkan = seluruh tipologi)</label>
          <div className="flex flex-wrap gap-2 max-h-28 overflow-y-auto p-2 rounded-[10px] border border-slate-100">
            {state.tipologi.filter((t) => t.aktif).map((t) => (
              <label key={t.id} className="flex items-center gap-1.5 text-xs px-2 py-1 rounded-[6px] bg-slate-50">
                <Checkbox checked={tipologiIds.includes(t.id)} onChange={() => toggleTip(t.id)} /> {t.nama}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Dokumen Wajib ({dokumenIds.length} dipilih)</label>
          <div className="max-h-52 overflow-y-auto p-2 rounded-[10px] border border-slate-100 space-y-1">
            {state.katalog.filter((d) => d.aktif).map((d) => (
              <label key={d.id} className="flex items-center gap-2 text-xs px-2 py-1 rounded-[6px] hover:bg-slate-50">
                <Checkbox checked={dokumenIds.includes(d.id)} onChange={() => toggleDok(d.id)} />
                <span className="font-mono text-slate-400">{d.id}</span> {d.nama}
                {d.sifat === 'Wajib' && <Badge color="warning">Wajib Katalog</Badge>}
              </label>
            ))}
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan</label>
          <Textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={2} />
        </div>
      </div>
    </Modal>
  );
};

export const AturanValidasiScreen: React.FC<{ currentUser: CurrentUserProfile }> = ({ currentUser }) => {
  const state = useAuditUniverseStore();
  const canManage = canManageMasterData(currentUser);
  const [editing, setEditing] = useState<AturanValidasi | null>(null);

  const columns: TableColumn<AturanValidasi>[] = [
    { key: 'dok', header: 'Dokumen', render: (r) => <div><span className="font-bold text-slate-800">{getDokById(r.dokId)?.nama ?? r.dokId}</span><div className="text-[11px] text-slate-400 font-mono">{r.dokId}</div></div> },
    { key: 'format', header: 'Format Diizinkan', render: (r) => r.formatDiizinkan.join(', ').toUpperCase() },
    { key: 'ukuran', header: 'Ukuran Maks.', render: (r) => `${r.ukuranMaksMb} MB` },
    { key: 'ttd', header: 'Wajib TTD', render: (r) => (r.wajibTtd ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <XCircle className="w-4 h-4 text-slate-300" />) },
    { key: 'ambang', header: 'Ambang Kelengkapan', render: (r) => `${r.ambangKelengkapanPct}%` },
    { key: 'status', header: 'Status', render: (r) => <Badge color={r.aktif ? 'success' : 'neutral'}>{r.aktif ? 'Aktif' : 'Nonaktif'}</Badge> },
    ...(canManage
      ? [{ key: 'aksi', header: 'Aksi', render: (r: AturanValidasi) => <button onClick={() => setEditing(r)} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Ubah</button> } as TableColumn<AturanValidasi>]
      : []),
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 max-w-2xl">Format berkas, ukuran maksimum, kewajiban tanda tangan, dan ambang persentase kelengkapan yang dipakai validator otomatis saat Satker mengunggah berkas.</p>
      <Card>
        <Table columns={columns} data={state.aturanValidasi} rowKey={(r) => r.id} />
      </Card>
      {editing && (
        <Modal isOpen onClose={() => setEditing(null)} title={`Ubah Aturan Validasi — ${getDokById(editing.dokId)?.nama ?? editing.dokId}`}
          footer={<><Button variant="outline" onClick={() => setEditing(null)}>Batal</Button><Button onClick={() => setEditing(null)}>Simpan</Button></>}
        >
          <AturanValidasiForm rule={editing} />
        </Modal>
      )}
    </div>
  );
};

const AturanValidasiForm: React.FC<{ rule: AturanValidasi }> = ({ rule }) => {
  const [formats, setFormats] = useState(rule.formatDiizinkan.join(', '));
  const [ukuran, setUkuran] = useState(rule.ukuranMaksMb);
  const [wajibTtd, setWajibTtd] = useState(rule.wajibTtd);
  const [ambang, setAmbang] = useState(rule.ambangKelengkapanPct);

  React.useEffect(() => {
    updateAturanValidasi(rule.id, {
      formatDiizinkan: formats.split(',').map((f) => f.trim().toLowerCase()).filter(Boolean),
      ukuranMaksMb: ukuran,
      wajibTtd,
      ambangKelengkapanPct: ambang,
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [formats, ukuran, wajibTtd, ambang]);

  return (
    <div className="space-y-4">
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Format Diizinkan (pisahkan koma)</label>
        <Input value={formats} onChange={(e) => setFormats(e.target.value)} placeholder="pdf, jpg, png" />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Ukuran Maksimum (MB)</label>
        <Input type="number" value={ukuran} onChange={(e) => setUkuran(Number(e.target.value))} />
      </div>
      <div>
        <label className="block text-xs font-bold text-slate-600 mb-1.5">Ambang Kelengkapan (%)</label>
        <Input type="number" value={ambang} onChange={(e) => setAmbang(Number(e.target.value))} />
      </div>
      <div className="flex items-center gap-2">
        <Toggle checked={wajibTtd} onChange={setWajibTtd} />
        <span className="text-xs font-bold text-slate-600">Wajib tanda tangan/cap basah pada dokumen</span>
      </div>
    </div>
  );
};
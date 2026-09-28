/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.12 Risiko & Perencanaan — 8.1 Register Risiko, 8.2 Review & Persetujuan, F9 Prioritas &
 * Usulan PKPT (plane/f-9-fsd-manajemen-risiko-audit-universe.md dan sejenis). Tim Risiko
 * menilai 6 faktor per Objek Audit; Koordinator Pengendali me-review; hasil yang "Disetujui"
 * dikunci menjadi baseline yang dikonsumsi B.13 PKPT secara referensi (Plan "Align itwasum
 * with Plane BA/SA", todo p1-b12-risk — decision "move": B.13 tidak lagi memiliki skoring
 * sendiri).
 */
import React, { useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Lock, RotateCcw, Send, ShieldAlert, Trophy } from 'lucide-react';
import type { CurrentUserProfile } from '../../../../types';
import {
  useAuditUniverseStore,
  getOrgById,
  getObjekAuditById,
  getPenilaianByObjek,
  upsertPenilaianRisiko,
  ajukanPenilaianRisiko,
  reviewPenilaianRisiko,
  lockBaselinePrioritas,
  getLatestBaseline,
  RISIKO_FAKTOR_LIST,
  formatIsoDate,
} from '../../../../data/auditUniverse';
import type { ObjekAudit, PenilaianRisiko, RisikoFaktorKey } from '../../../../data/auditUniverse';
import { canManageRisiko, displayNameForLog } from '../../../../data/auditUniverse/roleMapping';
import { Badge, Button, Card, EmptyState, Modal, Table, Textarea, type BadgeColor, type TableColumn } from '../../../ui';

const LEVEL_COLOR: Record<string, BadgeColor> = {
  sangat_tinggi: 'danger',
  tinggi: 'warning',
  sedang: 'info',
  rendah: 'success',
  sangat_rendah: 'neutral',
};
const LEVEL_LABEL: Record<string, string> = {
  sangat_tinggi: 'Sangat Tinggi',
  tinggi: 'Tinggi',
  sedang: 'Sedang',
  rendah: 'Rendah',
  sangat_rendah: 'Sangat Rendah',
};

export const RisikoRegisterScreen: React.FC<{ currentUser: CurrentUserProfile }> = ({ currentUser }) => {
  const state = useAuditUniverseStore();
  const canManage = canManageRisiko(currentUser);
  const [target, setTarget] = useState<ObjekAudit | null>(null);
  const relevant = useMemo(() => state.objekAudit.filter((o) => o.status === 'Siap Dinilai' || o.status === 'Dinilai'), [state.objekAudit]);

  const columns: TableColumn<ObjekAudit>[] = [
    { key: 'org', header: 'Objek Audit', render: (o) => <div><span className="font-bold text-slate-800">{getOrgById(o.orgId)?.nama ?? o.orgId}</span><div className="text-[11px] text-slate-400 font-mono">{o.id}</div></div> },
    { key: 'ta', header: 'Tahun Anggaran', render: (o) => o.tahunAnggaran },
    { key: 'kelengkapan', header: 'Kelengkapan Data', render: (o) => `${o.kelengkapanPct}%` },
    {
      key: 'skor',
      header: 'Skor Risiko',
      render: (o) => {
        const p = getPenilaianByObjek(o.id);
        return p ? <div className="flex items-center gap-2"><span className="font-bold">{p.skor}</span><Badge color={LEVEL_COLOR[p.level]}>{LEVEL_LABEL[p.level]}</Badge></div> : <span className="text-slate-400">Belum dinilai</span>;
      },
    },
    {
      key: 'status',
      header: 'Status',
      render: (o) => {
        const p = getPenilaianByObjek(o.id);
        return p ? <Badge color={p.status === 'Disetujui' ? 'success' : p.status === 'Dikembalikan' ? 'danger' : p.status === 'Diajukan' ? 'warning' : 'neutral'}>{p.status}</Badge> : <Badge color="neutral">Belum Dinilai</Badge>;
      },
    },
    ...(canManage
      ? [
          {
            key: 'aksi',
            header: 'Aksi',
            render: (o: ObjekAudit) => (
              <button onClick={() => setTarget(o)} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">
                {getPenilaianByObjek(o.id) ? 'Nilai Ulang' : 'Nilai Risiko'}
              </button>
            ),
          } as TableColumn<ObjekAudit>,
        ]
      : []),
  ];

  return (
    <div className="space-y-3">
      <p className="text-xs text-slate-500 max-w-2xl">Penilaian 6 faktor risiko skala 1-5 per Objek Audit yang datanya sudah cukup lengkap, dengan skor tertimbang otomatis (skala 5-25, identik matriks risiko standar Itwasum Polri).</p>
      {relevant.length === 0 ? (
        <EmptyState title="Belum ada Objek Audit siap dinilai" icon={<ShieldAlert className="w-6 h-6 text-slate-300" />} />
      ) : (
        <Card><Table columns={columns} data={relevant} rowKey={(o) => o.id} /></Card>
      )}
      {target && <PenilaianModal objekAudit={target} currentUser={currentUser} onClose={() => setTarget(null)} />}
    </div>
  );
};

const PenilaianModal: React.FC<{ objekAudit: ObjekAudit; currentUser: CurrentUserProfile; onClose: () => void }> = ({ objekAudit, currentUser, onClose }) => {
  const existing = getPenilaianByObjek(objekAudit.id);
  const [faktor, setFaktor] = useState<Record<RisikoFaktorKey, number>>(
    existing?.faktor ?? (RISIKO_FAKTOR_LIST.reduce((acc, f) => ({ ...acc, [f.key]: 3 }), {} as Record<RisikoFaktorKey, number>))
  );
  const [catatan, setCatatan] = useState(existing?.catatan ?? '');

  const totalMax = RISIKO_FAKTOR_LIST.length * 5;
  const previewSkor = Math.round((Object.values(faktor).reduce((a, b) => a + b, 0) / totalMax) * 25);

  const handleSaveDraft = () => {
    upsertPenilaianRisiko(objekAudit.id, faktor, catatan, displayNameForLog(currentUser));
    onClose();
  };
  const handleAjukan = () => {
    const p = upsertPenilaianRisiko(objekAudit.id, faktor, catatan, displayNameForLog(currentUser));
    ajukanPenilaianRisiko(p.objekAuditId);
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title={`Penilaian Risiko — ${getOrgById(objekAudit.orgId)?.nama ?? objekAudit.orgId}`} widthClassName="max-w-2xl"
      footer={<><Button variant="outline" onClick={onClose}>Batal</Button><Button variant="secondary" onClick={handleSaveDraft}>Simpan Draf</Button><Button onClick={handleAjukan}><Send className="w-3.5 h-3.5" /> Ajukan Review</Button></>}
    >
      <div className="space-y-4">
        <div className="space-y-3">
          {RISIKO_FAKTOR_LIST.map((f) => (
            <div key={f.key}>
              <div className="flex items-center justify-between mb-1">
                <label className="text-xs font-bold text-slate-600">{f.label}</label>
                <span className="text-xs font-mono text-slate-400">{faktor[f.key]}/5</span>
              </div>
              <input
                type="range" min={1} max={5} step={1} value={faktor[f.key]}
                onChange={(e) => setFaktor((prev) => ({ ...prev, [f.key]: Number(e.target.value) }))}
                className="w-full"
              />
            </div>
          ))}
        </div>
        <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">Skor Tertimbang (skala 5-25)</span>
          <span className="text-lg font-black text-slate-900">{previewSkor}</span>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan Manajemen</label>
          <Textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={2} placeholder="Konteks tambahan penilaian risiko (opsional)" />
        </div>
      </div>
    </Modal>
  );
};

export const RisikoReviewScreen: React.FC<{ currentUser: CurrentUserProfile }> = ({ currentUser }) => {
  const state = useAuditUniverseStore();
  const canManage = canManageRisiko(currentUser);
  const [target, setTarget] = useState<PenilaianRisiko | null>(null);
  const antrean = useMemo(() => state.penilaianRisiko.filter((p) => p.status === 'Diajukan'), [state.penilaianRisiko]);
  const riwayat = useMemo(() => state.penilaianRisiko.filter((p) => p.status === 'Disetujui' || p.status === 'Dikembalikan'), [state.penilaianRisiko]);

  const columns: TableColumn<PenilaianRisiko>[] = [
    { key: 'org', header: 'Objek Audit', render: (p) => getOrgById(p.orgId)?.nama ?? p.orgId },
    { key: 'skor', header: 'Skor', render: (p) => <div className="flex items-center gap-2"><span className="font-bold">{p.skor}</span><Badge color={LEVEL_COLOR[p.level]}>{LEVEL_LABEL[p.level]}</Badge></div> },
    { key: 'dinilai', header: 'Dinilai Oleh', render: (p) => <div>{p.dinilaiOleh}<div className="text-[11px] text-slate-400">{formatIsoDate(p.tglDinilai)}</div></div> },
    ...(canManage
      ? [{ key: 'aksi', header: 'Aksi', render: (p: PenilaianRisiko) => <button onClick={() => setTarget(p)} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Review</button> } as TableColumn<PenilaianRisiko>]
      : []),
  ];

  const riwayatColumns: TableColumn<PenilaianRisiko>[] = [
    { key: 'org', header: 'Objek Audit', render: (p) => getOrgById(p.orgId)?.nama ?? p.orgId },
    { key: 'skor', header: 'Skor', render: (p) => <span className="font-bold">{p.skor}</span> },
    { key: 'status', header: 'Status', render: (p) => <Badge color={p.status === 'Disetujui' ? 'success' : 'danger'}>{p.status}</Badge> },
    { key: 'review', header: 'Direview Oleh', render: (p) => <div>{p.direviewOleh}<div className="text-[11px] text-slate-400">{formatIsoDate(p.tglReview)}</div></div> },
  ];

  return (
    <div className="space-y-4">
      <div>
        <div className="text-xs font-bold text-slate-700 mb-2">Antrean Review ({antrean.length})</div>
        {antrean.length === 0 ? <EmptyState title="Tidak ada penilaian menunggu review" icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />} /> : <Card><Table columns={columns} data={antrean} rowKey={(p) => p.id} /></Card>}
      </div>
      <div>
        <div className="text-xs font-bold text-slate-700 mb-2">Riwayat Review</div>
        {riwayat.length === 0 ? <EmptyState title="Belum ada riwayat review" /> : <Card><Table columns={riwayatColumns} data={riwayat} rowKey={(p) => p.id} /></Card>}
      </div>
      {target && <ReviewModal penilaian={target} currentUser={currentUser} onClose={() => setTarget(null)} />}
    </div>
  );
};

const ReviewModal: React.FC<{ penilaian: PenilaianRisiko; currentUser: CurrentUserProfile; onClose: () => void }> = ({ penilaian, currentUser, onClose }) => {
  const [catatan, setCatatan] = useState('');
  const objek = getObjekAuditById(penilaian.objekAuditId);
  return (
    <Modal isOpen onClose={onClose} title={`Review Penilaian Risiko — ${getOrgById(penilaian.orgId)?.nama ?? penilaian.orgId}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button variant="danger" onClick={() => { reviewPenilaianRisiko(penilaian.objekAuditId, 'Dikembalikan', catatan || 'Perlu dilengkapi sebelum disetujui.', displayNameForLog(currentUser)); onClose(); }}>
            <RotateCcw className="w-3.5 h-3.5" /> Kembalikan
          </Button>
          <Button onClick={() => { reviewPenilaianRisiko(penilaian.objekAuditId, 'Disetujui', '', displayNameForLog(currentUser)); onClose(); }}>
            <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <div className="grid grid-cols-2 gap-2">
          {RISIKO_FAKTOR_LIST.map((f) => (
            <div key={f.key} className="p-2 rounded-[8px] bg-slate-50 border border-slate-100">
              <div className="text-[11px] text-slate-400">{f.label}</div>
              <div className="text-sm font-bold text-slate-800">{penilaian.faktor[f.key]}/5</div>
            </div>
          ))}
        </div>
        <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-600">Skor Tertimbang</span>
          <span className="text-lg font-black text-slate-900">{penilaian.skor} — {LEVEL_LABEL[penilaian.level]}</span>
        </div>
        {objek?.catatan && <p className="text-xs text-slate-500">{objek.catatan}</p>}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan (jika dikembalikan)</label>
          <Textarea value={catatan} onChange={(e) => setCatatan(e.target.value)} rows={2} placeholder="Jelaskan apa yang perlu dilengkapi/diperbaiki" />
        </div>
      </div>
    </Modal>
  );
};

export const PrioritasPkptScreen: React.FC<{ currentUser: CurrentUserProfile }> = ({ currentUser }) => {
  const state = useAuditUniverseStore();
  const canManage = canManageRisiko(currentUser);
  const [confirmLock, setConfirmLock] = useState(false);
  const tahunPkpt = String(new Date().getFullYear() + 1);
  const approved = useMemo(() => [...state.penilaianRisiko].filter((p) => p.status === 'Disetujui').sort((a, b) => b.skor - a.skor), [state.penilaianRisiko]);
  const baseline = getLatestBaseline(tahunPkpt) ?? getLatestBaseline();

  const columns: TableColumn<(typeof approved)[number]>[] = [
    { key: 'rank', header: '#', render: (_p, i) => <span className="font-mono text-slate-400">{(i ?? 0) + 1}</span> },
    { key: 'org', header: 'Objek Audit', render: (p) => getOrgById(p.orgId)?.nama ?? p.orgId },
    { key: 'skor', header: 'Skor Risiko', render: (p) => <div className="flex items-center gap-2"><span className="font-bold">{p.skor}</span><Badge color={LEVEL_COLOR[p.level]}>{LEVEL_LABEL[p.level]}</Badge></div> },
    {
      key: 'baseline',
      header: 'Status pada Baseline Terkunci',
      render: (p) => {
        const item = baseline?.items.find((it) => it.objekAuditId === p.objekAuditId);
        if (!item) return <span className="text-slate-400">—</span>;
        return <Badge color={item.masuk ? 'success' : 'neutral'}>{item.masuk ? `Termasuk (peringkat ${item.rank})` : 'Ditunda'}</Badge>;
      },
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-slate-500 max-w-2xl">Peringkat prioritas seluruh Objek Audit dengan penilaian risiko "Disetujui", diurutkan skor tertinggi. Mengunci baseline akan membuat referensi tetap yang dikonsumsi B.13 PKPT Berbasis Risiko untuk tahun anggaran {tahunPkpt}.</p>
        {canManage && (
          <Button onClick={() => setConfirmLock(true)} disabled={approved.length === 0}>
            <Lock className="w-4 h-4" /> Kunci Baseline {tahunPkpt}
          </Button>
        )}
      </div>

      {baseline && (
        <div className="p-3 rounded-[10px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-900 flex items-center gap-2">
          <Trophy className="w-4 h-4 shrink-0" />
          <span>Baseline <strong>{baseline.id}</strong> (v{baseline.versi}) terkunci pada {formatIsoDate(baseline.lockedAt)} oleh {baseline.lockedOleh} — {baseline.items.filter((i) => i.masuk).length} dari {baseline.items.length} Objek Audit termasuk usulan PKPT {baseline.tahunAnggaran}.</span>
        </div>
      )}

      {approved.length === 0 ? (
        <EmptyState title="Belum ada penilaian risiko yang disetujui" icon={<AlertTriangle className="w-6 h-6 text-slate-300" />} />
      ) : (
        <Card><Table columns={columns} data={approved} rowKey={(p) => p.id} /></Card>
      )}

      {confirmLock && (
        <Modal isOpen onClose={() => setConfirmLock(false)} title={`Kunci Baseline Prioritas ${tahunPkpt}?`}
          description="Baseline yang terkunci menjadi referensi tetap bagi B.13 PKPT Berbasis Risiko dan tidak bisa diubah, hanya bisa dibuat versi baru."
          footer={<><Button variant="outline" onClick={() => setConfirmLock(false)}>Batal</Button><Button onClick={() => { lockBaselinePrioritas(tahunPkpt, 60, displayNameForLog(currentUser)); setConfirmLock(false); }}>Kunci Sekarang</Button></>}
        />
      )}
    </div>
  );
};

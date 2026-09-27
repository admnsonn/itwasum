/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.15 Screen "Form MR per Objek" — Alur Form Manajemen Risiko per Objek Audit (F1-F7),
 * mereplikasi `27092026/[self research] Alur Form MR per Objek Audit-html/Main.dc.html` (Plan
 * "Migrate 27092026 prototypes", todo `b15-form-mr`). Design reference mockup dibangun ulang
 * di atas design-system `../../ui` (bukan salinan style inline aslinya).
 *
 * Alur status: Belum dibuka -> Draf -> Diajukan -> Disetujui (atau Dikembalikan -> Draf).
 * Setelah F6 disetujui, F1-F6 terkunci & LHP terbit. F7 ditutup hanya jika tindak lanjut
 * "Sesuai rekomendasi" (skor RBIA diperbarui untuk PKPT berikutnya).
 */
import React, { useEffect, useState } from 'react';
import { CheckCircle2, ChevronRight, Lock, Send, Undo2 } from 'lucide-react';
import type { CurrentUserProfile, OfficialRole } from '../../../../types';
import {
  OBJEK_AUDIT_MR,
  RISK_REGISTER_SEED,
  KONTROL_KUNCI_SEED,
  RISIKO_TAMBAHAN_SEED,
  LOG_SEED,
  STEP_IDS,
  STEP_TITLES,
  STEP_PHASE,
  STEP_ACTOR_LABEL,
  STEP_REVIEWER_LABEL,
  riskLevel,
  type StepId,
  type FormMrStatus,
  type RiskRegisterEntry,
  type RiskLevel,
  type RisikoTambahan,
  type PrioritasUji,
  type RiskKategori,
} from '../../../../data/modules/lanjutan/formMr';
import { Badge, Button, Card, HeatmapGrid, Select, Textarea, Typography, UploadDropzone, type BadgeColor } from '../../../ui';
import { formatBytes } from '../../../../data/auditUniverse';

const STORAGE_KEY = 'itwasum_form_mr_v1';

const STEP_ACTOR_ROLE: Record<StepId, OfficialRole> = { F1: 'auditee', F2: 'auditee', F3: 'auditor', F4: 'auditor', F5: 'auditor', F6: 'ketua_tim', F7: 'auditee' };
const STEP_REVIEWER_ROLES: Record<StepId, OfficialRole[]> = {
  F1: ['ketua_tim'], F2: ['ketua_tim'], F3: ['ketua_tim'],
  F4: ['pengawas_tim'], F5: ['pengawas_tim'],
  F6: ['koordinator_pengendali', 'pimpinan_tertinggi'],
  F7: ['auditor'],
};
const SIMULATABLE_ROLES: { value: OfficialRole; label: string }[] = [
  { value: 'auditee', label: 'Auditee (UPR)' },
  { value: 'auditor', label: 'Auditor' },
  { value: 'ketua_tim', label: 'Ketua Tim' },
  { value: 'pengawas_tim', label: 'Dalnis (Pengawas Tim)' },
  { value: 'koordinator_pengendali', label: 'Daltu (Koordinator & Pengendali)' },
];

const STATUS_COLOR: Record<FormMrStatus, BadgeColor> = {
  'Belum dibuka': 'neutral', Draf: 'primary', Diajukan: 'warning', Dikembalikan: 'danger', Disetujui: 'success', Terkunci: 'neutral',
};
const LEVEL_COLOR: Record<RiskLevel, BadgeColor> = { Rendah: 'success', Sedang: 'warning', Tinggi: 'brown', 'Sangat Tinggi': 'danger' };

type TindakLanjutStatus = 'Belum ditindaklanjuti' | 'Belum sesuai' | 'Sesuai rekomendasi' | 'Tidak dapat ditindaklanjuti';

interface LampiranFile {
  nama: string;
  sizeBytes: number;
  oleh: string;
  waktu: string;
}

interface PersistedState {
  stepStatuses: Record<StepId, FormMrStatus>;
  risks: RiskRegisterEntry[];
  risikoTambahan: RisikoTambahan[];
  /** Berkas terlampir per tahap (F1 "Dokumen pendukung", F4 "Unggah bukti"). */
  lampiran: Partial<Record<StepId, LampiranFile[]>>;
  log: { waktu: string; aksi: string }[];
  kkp: { populasi: number; sampel: number; exc: number; samplingMethod: string; desainKontrol: 'Memadai' | 'Tidak Memadai' };
  maturitasMr: number;
  keandalanUpr: string;
  simpulan: string;
  tindakLanjutStatus: TindakLanjutStatus;
  buktiTindakLanjut: LampiranFile[];
  tglVerifikasi: string;
  catatanVerifikasi: string;
  closed: boolean;
}

function buildInitialState(): PersistedState {
  const stepStatuses = STEP_IDS.reduce((acc, id, i) => ({ ...acc, [id]: i === 0 ? 'Draf' : 'Belum dibuka' }), {} as Record<StepId, FormMrStatus>);
  return {
    stepStatuses,
    risks: RISK_REGISTER_SEED.map((r) => ({ ...r })),
    risikoTambahan: RISIKO_TAMBAHAN_SEED.map((r) => ({ ...r })),
    lampiran: {},
    log: LOG_SEED.map((l) => ({ waktu: l.waktuLabel, aksi: l.aksi })),
    kkp: { populasi: 40, sampel: 15, exc: 5, samplingMethod: 'Berbasis risiko', desainKontrol: 'Memadai' },
    maturitasMr: 3,
    keandalanUpr: 'Cukup Andal',
    simpulan: '',
    tindakLanjutStatus: 'Belum ditindaklanjuti',
    buktiTindakLanjut: [],
    tglVerifikasi: '',
    catatanVerifikasi: '',
    closed: false,
  };
}

function loadState(): PersistedState {
  const initial = buildInitialState();
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const saved = JSON.parse(raw) as Partial<PersistedState>;
      // Merge over `initial` (bukan replace total) supaya sesi lama yang belum punya
      // field baru (lampiran/risikoTambahan/buktiTindakLanjut/dst.) tetap kompatibel.
      return {
        ...initial,
        ...saved,
        risks: saved.risks?.map((r) => ({ prioritasUji: 'Tidak' as PrioritasUji, ...r })) ?? initial.risks,
        risikoTambahan: saved.risikoTambahan ?? initial.risikoTambahan,
        lampiran: saved.lampiran ?? initial.lampiran,
        buktiTindakLanjut: saved.buktiTindakLanjut ?? initial.buktiTindakLanjut,
        tglVerifikasi: saved.tglVerifikasi ?? initial.tglVerifikasi,
        catatanVerifikasi: saved.catatanVerifikasi ?? initial.catatanVerifikasi,
      };
    }
  } catch {
    // ignore corrupt storage
  }
  return initial;
}

interface FormMrPerObjekProps {
  currentUser: CurrentUserProfile;
}

export const FormMrPerObjek: React.FC<FormMrPerObjekProps> = ({ currentUser }) => {
  const [state, setState] = useState<PersistedState>(loadState);
  const [activeStep, setActiveStep] = useState<StepId>('F1');
  const [simulatedRole, setSimulatedRole] = useState<OfficialRole | ''>('');
  const [returnNote, setReturnNote] = useState('');
  const [showReturnForm, setShowReturnForm] = useState(false);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
    } catch {
      // storage unavailable — state still lives in-memory for this session
    }
  }, [state]);

  const canSimulate = currentUser.peran === 'super_admin' || currentUser.peran === 'pimpinan_tertinggi';
  const effectiveRole: OfficialRole = canSimulate && simulatedRole ? simulatedRole : currentUser.peran;
  const effectiveRoleLabel = SIMULATABLE_ROLES.find((r) => r.value === effectiveRole)?.label ?? currentUser.peranLabel;

  const status = state.stepStatuses[activeStep];
  const canEdit = STEP_ACTOR_ROLE[activeStep] === effectiveRole && ['Belum dibuka', 'Draf', 'Dikembalikan'].includes(status);
  const canReview = STEP_REVIEWER_ROLES[activeStep].includes(effectiveRole) && status === 'Diajukan';

  const addLog = (aksi: string) => setState((s) => ({ ...s, log: [...s.log, { waktu: 'Baru saja', aksi }] }));

  const touchDraft = () => {
    if (status === 'Belum dibuka') {
      setState((s) => ({ ...s, stepStatuses: { ...s.stepStatuses, [activeStep]: 'Draf' } }));
      addLog(`${STEP_TITLES[activeStep]} dibuka oleh ${STEP_ACTOR_LABEL[activeStep]}.`);
    }
  };

  const saveDraft = () => addLog(`Menyimpan draf ${STEP_TITLES[activeStep]}.`);

  const submitStep = () => {
    setState((s) => ({ ...s, stepStatuses: { ...s.stepStatuses, [activeStep]: 'Diajukan' } }));
    addLog(`${STEP_TITLES[activeStep]} diajukan ke ${STEP_REVIEWER_LABEL[activeStep]}.`);
  };

  const sendBack = () => {
    if (!returnNote.trim()) return;
    setState((s) => ({ ...s, stepStatuses: { ...s.stepStatuses, [activeStep]: 'Dikembalikan' } }));
    addLog(`${STEP_TITLES[activeStep]} dikembalikan oleh ${STEP_REVIEWER_LABEL[activeStep]}: ${returnNote}`);
    setReturnNote('');
    setShowReturnForm(false);
  };

  const approveStep = () => {
    setState((s) => {
      const nextStatuses: Record<StepId, FormMrStatus> = { ...s.stepStatuses, [activeStep]: 'Disetujui' };
      if (activeStep === 'F6') {
        STEP_IDS.slice(0, 6).forEach((id) => { nextStatuses[id] = 'Terkunci'; });
      }
      const closed = activeStep === 'F7' && s.tindakLanjutStatus === 'Sesuai rekomendasi' ? true : s.closed;
      return { ...s, stepStatuses: nextStatuses, closed };
    });
    addLog(
      activeStep === 'F6'
        ? 'F6 disetujui Daltu — F1-F6 terkunci, LHP terbit.'
        : activeStep === 'F7' && state.tindakLanjutStatus === 'Sesuai rekomendasi'
          ? 'Rencana aksi ditutup — skor RBIA diperbarui untuk PKPT berikutnya.'
          : `${STEP_TITLES[activeStep]} disetujui oleh ${STEP_REVIEWER_LABEL[activeStep]}.`
    );
    const idx = STEP_IDS.indexOf(activeStep);
    if (idx < STEP_IDS.length - 1) setActiveStep(STEP_IDS[idx + 1]);
  };

  const updateRisk = (kode: string, patch: Partial<RiskRegisterEntry>) => {
    touchDraft();
    setState((s) => ({ ...s, risks: s.risks.map((r) => (r.kode === kode ? { ...r, ...patch } : r)) }));
  };

  const addRisikoTambahan = (item: Omit<RisikoTambahan, 'id'>) => {
    touchDraft();
    const entry: RisikoTambahan = { ...item, id: `RT-${state.risikoTambahan.length + 1}` };
    setState((s) => ({ ...s, risikoTambahan: [...s.risikoTambahan, entry] }));
    addLog(`Menambahkan risiko tambahan temuan auditor: ${item.pernyataan}`);
  };

  const addLampiran = (step: StepId, files: File[]) => {
    if (!files.length) return;
    touchDraft();
    const entries: LampiranFile[] = files.map((f) => ({ nama: f.name, sizeBytes: f.size, oleh: currentUser.nama, waktu: 'Baru saja' }));
    setState((s) => ({ ...s, lampiran: { ...s.lampiran, [step]: [...(s.lampiran[step] ?? []), ...entries] } }));
    addLog(`Melampirkan ${files.length} berkas pada ${STEP_TITLES[step]}.`);
  };

  const addBuktiTindakLanjut = (files: File[]) => {
    if (!files.length) return;
    touchDraft();
    const entries: LampiranFile[] = files.map((f) => ({ nama: f.name, sizeBytes: f.size, oleh: currentUser.nama, waktu: 'Baru saja' }));
    setState((s) => ({ ...s, buktiTindakLanjut: [...s.buktiTindakLanjut, ...entries] }));
    addLog(`Mengunggah ${files.length} bukti tindak lanjut.`);
  };

  const matrixCells = state.risks.flatMap((r) => [
    { rowId: String(r.inherenI), colId: String(r.inherenL), value: r.inherenL * r.inherenI, label: `${r.kode} inheren` },
    { rowId: String(r.residualI), colId: String(r.residualL), value: r.residualL * r.residualI, label: `${r.kode} residual` },
  ]);

  return (
    <div className="grid lg:grid-cols-[220px_1fr_260px] gap-4">
      {/* ALUR FORM sidebar */}
      <Card className="space-y-1 lg:sticky lg:top-4 self-start">
        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Alur Form</div>
        {STEP_IDS.map((id) => {
          const s = state.stepStatuses[id];
          const isActive = id === activeStep;
          return (
            <button
              key={id}
              onClick={() => setActiveStep(id)}
              className={`w-full text-left rounded-[10px] px-2.5 py-2 transition-colors ${isActive ? 'bg-[var(--sd-inverse-primary)]/40 border border-[var(--sd-primary)]/40' : 'hover:bg-slate-50'}`}
            >
              <div className="flex items-center justify-between gap-1.5">
                <span className="text-xs font-bold text-slate-800">{id} · {STEP_TITLES[id]}</span>
                {s === 'Terkunci' && <Lock className="w-3 h-3 text-slate-400 shrink-0" />}
              </div>
              <div className="flex items-center justify-between mt-1">
                <span className="text-[10px] text-slate-400">{STEP_PHASE[id]}</span>
                <Badge color={STATUS_COLOR[s]} size="sm">{s}</Badge>
              </div>
            </button>
          );
        })}
      </Card>

      {/* Center: step form */}
      <div className="space-y-4">
        {canSimulate && (
          <Card className="flex items-center gap-3 bg-amber-50/60 border-amber-200">
            <span className="text-xs font-bold text-amber-800 shrink-0">Simulasi Peran (demo multi-aktor):</span>
            <Select
              options={SIMULATABLE_ROLES}
              value={simulatedRole}
              onChange={(v) => setSimulatedRole(v as OfficialRole)}
              placeholder={`${currentUser.peranLabel} (peran asli)`}
              className="max-w-xs"
            />
          </Card>
        )}

        <Card>
          <div className="flex flex-wrap items-start justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Objek Audit</div>
              <div className="text-sm font-extrabold text-slate-900">{OBJEK_AUDIT_MR.namaObjek}</div>
              <div className="text-[11px] text-slate-500">{OBJEK_AUDIT_MR.sprin} · TA {OBJEK_AUDIT_MR.tahunAnggaran}</div>
            </div>
            <div className="text-right">
              <div className="text-[10px] font-bold uppercase text-slate-400">Skor RBIA Awal</div>
              <div className="text-sm font-extrabold text-[var(--sd-primary)]">{OBJEK_AUDIT_MR.rbiaAwal.toFixed(2)} · {OBJEK_AUDIT_MR.rbiaLabel}</div>
              <div className="text-[11px] text-slate-400">Tim: {OBJEK_AUDIT_MR.ketuaTim} · {OBJEK_AUDIT_MR.jumlahAuditor} Auditor</div>
            </div>
          </div>

          <div className="flex items-center justify-between gap-3 py-3">
            <div>
              <Typography variant="headline-md" className="text-slate-900">{activeStep} · {STEP_TITLES[activeStep]}</Typography>
              <p className="text-[11px] text-slate-400 mt-0.5">Aktor: {STEP_ACTOR_LABEL[activeStep]} → Reviewer: {STEP_REVIEWER_LABEL[activeStep]}</p>
            </div>
            <Badge color={STATUS_COLOR[status]}>{status}</Badge>
          </div>

          <div className="text-[11px] text-slate-400 mb-3">Peran aktif saat ini: <strong className="text-slate-600">{effectiveRoleLabel}</strong>{canEdit ? ' — dapat mengisi tahap ini.' : canReview ? ' — dapat mereviu tahap ini.' : ' — hanya lihat (bukan aktor/reviewer tahap ini).'}</div>

          {activeStep === 'F1' && <F1Content risks={state.risks} readOnly={!canEdit} lampiran={state.lampiran.F1 ?? []} onTouch={touchDraft} onUpload={(files) => addLampiran('F1', files)} />}
          {activeStep === 'F2' && <F2Content risks={state.risks} readOnly={!canEdit} onUpdate={updateRisk} />}
          {activeStep === 'F3' && (
            <F3Content
              risks={state.risks}
              risikoTambahan={state.risikoTambahan}
              readOnly={!canEdit}
              onUpdate={updateRisk}
              onAddRisikoTambahan={addRisikoTambahan}
            />
          )}
          {activeStep === 'F4' && (
            <F4Content
              kkp={state.kkp}
              readOnly={!canEdit}
              lampiran={state.lampiran.F4 ?? []}
              onUpload={(files) => addLampiran('F4', files)}
              onChange={(patch) => { touchDraft(); setState((s) => ({ ...s, kkp: { ...s.kkp, ...patch } })); }}
            />
          )}
          {activeStep === 'F5' && <F5Content risks={state.risks} />}
          {activeStep === 'F6' && (
            <F6Content
              readOnly={!canEdit}
              maturitasMr={state.maturitasMr}
              keandalanUpr={state.keandalanUpr}
              simpulan={state.simpulan}
              onChange={(patch) => { touchDraft(); setState((s) => ({ ...s, ...patch })); }}
            />
          )}
          {activeStep === 'F7' && (
            <F7Content
              risks={state.risks}
              readOnly={!canEdit}
              tindakLanjutStatus={state.tindakLanjutStatus}
              closed={state.closed}
              buktiTindakLanjut={state.buktiTindakLanjut}
              tglVerifikasi={state.tglVerifikasi}
              catatanVerifikasi={state.catatanVerifikasi}
              onChange={(v) => { touchDraft(); setState((s) => ({ ...s, tindakLanjutStatus: v })); }}
              onUploadBukti={addBuktiTindakLanjut}
              onTglVerifikasiChange={(v) => setState((s) => ({ ...s, tglVerifikasi: v }))}
              onCatatanVerifikasiChange={(v) => setState((s) => ({ ...s, catatanVerifikasi: v }))}
            />
          )}

          {/* Sticky action bar */}
          <div className="flex items-center justify-end gap-2 mt-4 pt-3 border-t border-slate-100">
            {showReturnForm && canReview && (
              <div className="flex-1 flex items-center gap-2">
                <Textarea rows={1} value={returnNote} onChange={(e) => setReturnNote(e.target.value)} placeholder="Alasan pengembalian..." className="flex-1" />
              </div>
            )}
            {canEdit && (
              <>
                <Button variant="outline" onClick={saveDraft}>Simpan Draf</Button>
                <Button onClick={submitStep}>
                  <Send className="w-3.5 h-3.5" /> Ajukan ke {STEP_REVIEWER_LABEL[activeStep]}
                </Button>
              </>
            )}
            {canReview && !showReturnForm && (
              <>
                <Button variant="outline" onClick={() => setShowReturnForm(true)}>
                  <Undo2 className="w-3.5 h-3.5" /> Kembalikan
                </Button>
                <Button onClick={approveStep}>
                  <CheckCircle2 className="w-3.5 h-3.5" /> Setujui
                </Button>
              </>
            )}
            {canReview && showReturnForm && (
              <>
                <Button variant="outline" onClick={() => setShowReturnForm(false)}>Batal</Button>
                <Button variant="danger" disabled={!returnNote.trim()} onClick={sendBack}>Kirim Pengembalian</Button>
              </>
            )}
            {status === 'Disetujui' && STEP_IDS.indexOf(activeStep) < STEP_IDS.length - 1 && (
              <Button variant="secondary" onClick={() => setActiveStep(STEP_IDS[STEP_IDS.indexOf(activeStep) + 1])}>
                Lanjut ke {STEP_IDS[STEP_IDS.indexOf(activeStep) + 1]} <ChevronRight className="w-3.5 h-3.5" />
              </Button>
            )}
          </div>
        </Card>
      </div>

      {/* Right sidebar: Riwayat, legend, matrix */}
      <div className="space-y-3 lg:sticky lg:top-4 self-start">
        <Card>
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">Riwayat Alur</div>
          <ul className="space-y-2 max-h-56 overflow-y-auto">
            {[...state.log].reverse().map((l, i) => (
              <li key={i} className="text-[11px]">
                <div className="text-slate-700">{l.aksi}</div>
                <div className="text-slate-400">{l.waktu}</div>
              </li>
            ))}
          </ul>
        </Card>
        <Card>
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">Reviu Berjenjang</div>
          <ul className="space-y-1.5">
            <ReviuBerjenjangRow label="Ketua Tim" aksi="Disusun" status={state.stepStatuses.F3} />
            <ReviuBerjenjangRow label="Dalnis (Pengawas Tim)" aksi="Direviu" status={state.stepStatuses.F5} />
            <ReviuBerjenjangRow label="Daltu (Koordinator/Pimpinan)" aksi="Disetujui" status={state.stepStatuses.F6} />
          </ul>
        </Card>
        <Card>
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">Status Form</div>
          <div className="flex flex-wrap gap-1.5">
            {(['Belum dibuka', 'Draf', 'Diajukan', 'Dikembalikan', 'Disetujui', 'Terkunci'] as FormMrStatus[]).map((s) => (
              <Badge key={s} color={STATUS_COLOR[s]} size="sm">{s}</Badge>
            ))}
          </div>
        </Card>
        <Card>
          <div className="text-[10px] font-bold uppercase text-slate-400 mb-2">Matriks Risiko 5×5 (Kemungkinan × Dampak)</div>
          <HeatmapGrid
            rows={[5, 4, 3, 2, 1].map((i) => ({ id: String(i), label: `Dampak ${i}` }))}
            cols={[1, 2, 3, 4, 5].map((l) => ({ id: String(l), label: `Kmk ${l}` }))}
            cells={matrixCells}
            colorScale={(v) => (v <= 5 ? '#2D7A4A' : v <= 11 ? '#EAB308' : v <= 15 ? '#D97706' : '#BA1A1A')}
          />
          <p className="text-[10px] text-slate-400 mt-2">1-5 Rendah · 6-11 Sedang · 12-15 Tinggi · 16-25 Sangat Tinggi</p>
        </Card>
      </div>
    </div>
  );
};

/* ============================================================================================ *
 * F1 — Profil & Konteks Risiko
 * ============================================================================================ */
interface LampiranEntry { nama: string; sizeBytes: number; oleh: string; waktu: string }

const F1Content: React.FC<{ risks: RiskRegisterEntry[]; readOnly: boolean; lampiran: LampiranEntry[]; onTouch: () => void; onUpload: (files: File[]) => void }> = ({ risks, readOnly, lampiran, onTouch, onUpload }) => (
  <div className="space-y-3">
    <div className="grid sm:grid-cols-2 gap-3 text-xs">
      <FieldReadonly label="Nama Satker" value={OBJEK_AUDIT_MR.namaObjek} />
      <FieldReadonly label="Tingkat" value={OBJEK_AUDIT_MR.tingkat} />
      <FieldReadonly label="Pagu DIPA" value={OBJEK_AUDIT_MR.paguDipa} />
      <FieldReadonly label="Periode" value={OBJEK_AUDIT_MR.periode} />
      <FieldReadonly label="Pemilik Risiko (UPR)" value={OBJEK_AUDIT_MR.pemilikRisikoUpr} />
      <FieldReadonly label="Koordinator MR" value={OBJEK_AUDIT_MR.koordinatorMr} />
    </div>
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1">Sasaran / IKU Terkait</label>
      <Textarea rows={2} defaultValue={OBJEK_AUDIT_MR.sasaranIku} onFocus={onTouch} />
    </div>
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Proses Bisnis Utama</label>
      <div className="flex flex-wrap gap-1.5">
        {OBJEK_AUDIT_MR.prosesBisnis.map((p) => (
          <Badge key={p} color="primary" size="lg">{p}</Badge>
        ))}
      </div>
    </div>
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Dokumen Pendukung</label>
      <p className="text-[10px] text-slate-400 mb-1.5">Renja, SK Tim MR, Profil Risiko periode sebelumnya.</p>
      <LampiranList items={lampiran} />
      {!readOnly && <UploadDropzone onFiles={onUpload} multiple maxSizeMB={25} hint="PDF/Word/Excel · maks 25 MB · boleh lebih dari satu" className="mt-2" />}
    </div>
    <p className="text-[11px] text-slate-400 pt-1 border-t border-slate-100">{risks.length} risiko awal teridentifikasi pada Register (lihat F2).</p>
  </div>
);

const LampiranList: React.FC<{ items: LampiranEntry[] }> = ({ items }) =>
  items.length === 0 ? null : (
    <ul className="space-y-1">
      {items.map((f, i) => (
        <li key={i} className="flex items-center justify-between gap-2 rounded-[8px] bg-slate-50 border border-slate-100 px-2.5 py-1.5 text-[11px]">
          <span className="font-bold text-slate-700 truncate">{f.nama}</span>
          <span className="text-slate-400 shrink-0">{formatBytes(f.sizeBytes)} · {f.oleh} · {f.waktu}</span>
        </li>
      ))}
    </ul>
  );

const ReviuBerjenjangRow: React.FC<{ label: string; aksi: string; status: FormMrStatus }> = ({ label, aksi, status }) => {
  const done = status === 'Disetujui' || status === 'Terkunci';
  return (
    <li className="flex items-center justify-between gap-2 text-[11px]">
      <span className="text-slate-600 font-semibold">{label}</span>
      <Badge color={done ? 'success' : 'neutral'} size="sm">{done ? aksi : 'Menunggu'}</Badge>
    </li>
  );
};

const FieldReadonly: React.FC<{ label: string; value: string }> = ({ label, value }) => (
  <div>
    <div className="text-[10px] font-bold uppercase text-slate-400">{label}</div>
    <div className="rounded-[8px] bg-slate-50 border border-slate-100 px-2.5 py-1.5 mt-0.5 text-slate-700 font-semibold">{value}</div>
  </div>
);

/* ============================================================================================ *
 * F2 — Register Risiko (Self-Assessment oleh Auditee/UPR)
 * ============================================================================================ */
const F2Content: React.FC<{ risks: RiskRegisterEntry[]; readOnly: boolean; onUpdate: (kode: string, patch: Partial<RiskRegisterEntry>) => void }> = ({ risks, readOnly, onUpdate }) => (
  <div className="space-y-4">
    {risks.map((r) => {
      const inherenScore = r.inherenL * r.inherenI;
      const residualScore = r.residualL * r.residualI;
      return (
        <div key={r.kode} className="rounded-[10px] border border-slate-100 p-3 space-y-2.5">
          <div className="flex items-center justify-between gap-2">
            <span className="text-xs font-extrabold text-slate-800">{r.kode} · {r.proses}</span>
            <div className="flex items-center gap-1.5">
              <Badge color="indigo" size="sm">{r.kategori}</Badge>
              <select
                disabled={readOnly}
                value={r.prioritasUji}
                onChange={(e) => onUpdate(r.kode, { prioritasUji: e.target.value as PrioritasUji })}
                className="h-6 rounded-[6px] border border-slate-200 px-1.5 text-[10px] font-bold disabled:bg-slate-50"
                title="Prioritas Uji (F4)"
              >
                {(['Ya · Utama', 'Ya', 'Tidak'] as const).map((v) => <option key={v} value={v}>Prioritas Uji: {v}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 text-[11px] text-slate-500">
            <div><span className="font-bold text-slate-600">Pernyataan:</span> {r.pernyataan}</div>
            <div><span className="font-bold text-slate-600">Penyebab:</span> {r.penyebab}</div>
            <div><span className="font-bold text-slate-600">Dampak:</span> {r.dampak}</div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <RiskScoreEditor label="Inheren" L={r.inherenL} I={r.inherenI} score={inherenScore} readOnly={readOnly} onChange={(L, I) => onUpdate(r.kode, { inherenL: L, inherenI: I })} />
            <RiskScoreEditor label="Residual (setelah kontrol)" L={r.residualL} I={r.residualI} score={residualScore} readOnly={readOnly} onChange={(L, I) => onUpdate(r.kode, { residualL: L, residualI: I })} />
          </div>
          <div className="grid sm:grid-cols-3 gap-2 text-[11px]">
            <div>
              <label className="block font-bold text-slate-500 mb-0.5">Uraian Kontrol</label>
              <input disabled={readOnly} defaultValue={r.kontrolUraian} onBlur={(e) => onUpdate(r.kode, { kontrolUraian: e.target.value })} className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px] disabled:bg-slate-50" />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-0.5">Jenis Kontrol</label>
              <select disabled={readOnly} value={r.kontrolJenis} onChange={(e) => onUpdate(r.kode, { kontrolJenis: e.target.value as RiskRegisterEntry['kontrolJenis'] })} className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px] disabled:bg-slate-50">
                {(['Preventif', 'Detektif', 'Korektif'] as const).map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-0.5">Efektivitas (UPR)</label>
              <select disabled={readOnly} value={r.efektivitasUpr} onChange={(e) => onUpdate(r.kode, { efektivitasUpr: e.target.value as RiskRegisterEntry['efektivitasUpr'] })} className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px] disabled:bg-slate-50">
                {(['Efektif', 'Efektif dengan Catatan', 'Tidak Efektif'] as const).map((j) => <option key={j} value={j}>{j}</option>)}
              </select>
            </div>
          </div>
          <div className="grid sm:grid-cols-3 gap-2 text-[11px]">
            <div>
              <label className="block font-bold text-slate-500 mb-0.5">Tindakan Mitigasi</label>
              <input disabled={readOnly} defaultValue={r.mitigasiTindakan} onBlur={(e) => onUpdate(r.kode, { mitigasiTindakan: e.target.value })} className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px] disabled:bg-slate-50" />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-0.5">PIC</label>
              <input disabled={readOnly} defaultValue={r.mitigasiPic} onBlur={(e) => onUpdate(r.kode, { mitigasiPic: e.target.value })} className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px] disabled:bg-slate-50" />
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-0.5">Tenggat</label>
              <input type="date" disabled={readOnly} defaultValue={r.mitigasiTenggat} onBlur={(e) => onUpdate(r.kode, { mitigasiTenggat: e.target.value })} className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px] disabled:bg-slate-50" />
            </div>
          </div>
        </div>
      );
    })}
  </div>
);

const RiskScoreEditor: React.FC<{ label: string; L: number; I: number; score: number; readOnly: boolean; onChange: (L: number, I: number) => void }> = ({ label, L, I, score, readOnly, onChange }) => {
  const level = riskLevel(score);
  return (
    <div className="rounded-[8px] bg-slate-50 border border-slate-100 p-2.5">
      <div className="flex items-center justify-between mb-1.5">
        <span className="text-[11px] font-bold text-slate-600">{label}</span>
        <Badge color={LEVEL_COLOR[level]} size="sm">{score} · {level}</Badge>
      </div>
      <div className="grid grid-cols-2 gap-2">
        <div>
          <label className="block text-[10px] text-slate-400">Kemungkinan (1-5)</label>
          <select disabled={readOnly} value={L} onChange={(e) => onChange(Number(e.target.value), I)} className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px] disabled:bg-white">
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
        <div>
          <label className="block text-[10px] text-slate-400">Dampak (1-5)</label>
          <select disabled={readOnly} value={I} onChange={(e) => onChange(L, Number(e.target.value))} className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px] disabled:bg-white">
            {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
          </select>
        </div>
      </div>
    </div>
  );
};

/* ============================================================================================ *
 * F3 — Reviu Register & RCM (oleh Auditor)
 * ============================================================================================ */
const F3Content: React.FC<{
  risks: RiskRegisterEntry[];
  risikoTambahan: RisikoTambahan[];
  readOnly: boolean;
  onUpdate: (kode: string, patch: Partial<RiskRegisterEntry>) => void;
  onAddRisikoTambahan: (item: Omit<RisikoTambahan, 'id'>) => void;
}> = ({ risks, risikoTambahan, readOnly, onUpdate, onAddRisikoTambahan }) => (
  <div className="space-y-3">
    <div className="text-[11px] text-slate-500">Auditor mereviu residual risiko dari Register (F2) dan menyusun Risk & Control Matrix (RCM) sebagai dasar Prosedur Ketaatan Pengujian (PKP).</div>
    {risks.map((r) => {
      const uprScore = r.residualL * r.residualI;
      const auditorL = r.auditorResidualL ?? r.residualL;
      const auditorI = r.auditorResidualI ?? r.residualI;
      const auditorScore = auditorL * auditorI;
      const sepakat = r.auditorSepakat ?? auditorScore === uprScore;
      return (
        <div key={r.kode} className="rounded-[10px] border border-slate-100 p-3 space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-extrabold text-slate-800">{r.kode} · {r.proses}</span>
            <label className="flex items-center gap-1.5 text-[11px] font-bold text-slate-600">
              <input type="checkbox" disabled={readOnly} checked={sepakat} onChange={(e) => onUpdate(r.kode, { auditorSepakat: e.target.checked })} />
              Sepakat dengan residual UPR
            </label>
          </div>
          <div className="grid sm:grid-cols-3 gap-3 text-[11px]">
            <div className="rounded-[8px] bg-slate-50 p-2">
              <div className="text-slate-400 font-bold">Residual UPR</div>
              <Badge color={LEVEL_COLOR[riskLevel(uprScore)]} size="sm" className="mt-1">{uprScore} · {riskLevel(uprScore)}</Badge>
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-0.5">Residual Auditor — L</label>
              <select disabled={readOnly || sepakat} value={auditorL} onChange={(e) => onUpdate(r.kode, { auditorResidualL: Number(e.target.value) })} className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px] disabled:bg-slate-50">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
            <div>
              <label className="block font-bold text-slate-500 mb-0.5">Residual Auditor — I</label>
              <select disabled={readOnly || sepakat} value={auditorI} onChange={(e) => onUpdate(r.kode, { auditorResidualI: Number(e.target.value) })} className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px] disabled:bg-slate-50">
                {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
              </select>
            </div>
          </div>
          <div>
            <label className="block font-bold text-slate-500 mb-0.5">Alasan Perbedaan</label>
            <input
              disabled={readOnly}
              placeholder="Alasan bila tidak sepakat..."
              defaultValue={r.auditorAlasan}
              onBlur={(e) => onUpdate(r.kode, { auditorAlasan: e.target.value })}
              className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px] disabled:bg-slate-50"
            />
          </div>
        </div>
      );
    })}

    <RisikoTambahanSection items={risikoTambahan} readOnly={readOnly} onAdd={onAddRisikoTambahan} />

    <div className="rounded-[10px] border border-slate-100 p-3">
      <div className="text-xs font-bold text-slate-700 mb-2">Risk & Control Matrix (RCM) → dasar PKP</div>
      <table className="w-full text-[11px]">
        <thead><tr className="text-slate-400"><th className="text-left pb-1">Kode</th><th className="text-left pb-1">Kontrol Kunci</th><th className="text-left pb-1">Prosedur Pustaka</th></tr></thead>
        <tbody>
          {KONTROL_KUNCI_SEED.map((k) => (
            <tr key={k.kode} className="border-t border-slate-100">
              <td className="py-1.5 font-bold text-slate-700">{k.kode}</td>
              <td className="py-1.5 text-slate-600">{k.uraian}</td>
              <td className="py-1.5 text-slate-400">{k.prosedurPustaka}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </div>
);

const RISIKO_KATEGORI_OPTIONS: RiskKategori[] = ['Keuangan/Fraud', 'Operasional', 'Kepatuhan', 'Reputasi', 'Strategis'];

const RisikoTambahanSection: React.FC<{ items: RisikoTambahan[]; readOnly: boolean; onAdd: (item: Omit<RisikoTambahan, 'id'>) => void }> = ({ items, readOnly, onAdd }) => {
  const [showForm, setShowForm] = useState(false);
  const [pernyataan, setPernyataan] = useState('');
  const [kategori, setKategori] = useState<RiskKategori>('Operasional');
  const [kontrolTerkait, setKontrolTerkait] = useState('');

  return (
    <div className="rounded-[10px] border border-slate-100 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <div className="text-xs font-bold text-slate-700">Risiko Tambahan Temuan Auditor</div>
        {!readOnly && !showForm && (
          <button onClick={() => setShowForm(true)} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">+ Tambah Risiko</button>
        )}
      </div>
      {items.length === 0 && !showForm ? (
        <p className="text-[11px] text-slate-400 italic">Belum ada risiko tambahan yang ditemukan auditor di luar Register Risiko (F2).</p>
      ) : (
        <ul className="space-y-1.5">
          {items.map((r) => (
            <li key={r.id} className="rounded-[8px] bg-slate-50 border border-slate-100 p-2 text-[11px]">
              <div className="flex items-center gap-1.5"><span className="font-mono font-bold text-slate-700">{r.id}</span><Badge color="indigo" size="sm">{r.kategori}</Badge></div>
              <div className="text-slate-600 mt-0.5">{r.pernyataan}</div>
              <div className="text-slate-400 mt-0.5">Kontrol terkait: {r.kontrolTerkait}</div>
            </li>
          ))}
        </ul>
      )}
      {showForm && (
        <div className="space-y-2 pt-1 border-t border-slate-100">
          <input value={pernyataan} onChange={(e) => setPernyataan(e.target.value)} placeholder="Pernyataan risiko yang ditemukan..." className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px]" />
          <div className="grid grid-cols-2 gap-2">
            <select value={kategori} onChange={(e) => setKategori(e.target.value as RiskKategori)} className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px]">
              {RISIKO_KATEGORI_OPTIONS.map((k) => <option key={k} value={k}>{k}</option>)}
            </select>
            <input value={kontrolTerkait} onChange={(e) => setKontrolTerkait(e.target.value)} placeholder="Kontrol/prosedur terkait..." className="w-full h-8 rounded-[6px] border border-slate-200 px-2 text-[11px]" />
          </div>
          <div className="flex items-center justify-end gap-2">
            <Button size="sm" variant="outline" onClick={() => { setShowForm(false); setPernyataan(''); setKontrolTerkait(''); }}>Batal</Button>
            <Button
              size="sm"
              disabled={!pernyataan.trim()}
              onClick={() => {
                onAdd({ pernyataan: pernyataan.trim(), kategori, kontrolTerkait: kontrolTerkait.trim() || '–' });
                setShowForm(false);
                setPernyataan('');
                setKontrolTerkait('');
              }}
            >
              Simpan
            </Button>
          </div>
        </div>
      )}
    </div>
  );
};

/* ============================================================================================ *
 * F4 — KKP Uji Kontrol
 * ============================================================================================ */
interface KkpState { populasi: number; sampel: number; exc: number; samplingMethod: string; desainKontrol: 'Memadai' | 'Tidak Memadai' }
const F4Content: React.FC<{ kkp: KkpState; readOnly: boolean; lampiran: LampiranEntry[]; onUpload: (files: File[]) => void; onChange: (patch: Partial<KkpState>) => void }> = ({ kkp, readOnly, lampiran, onUpload, onChange }) => {
  const excRate = kkp.sampel > 0 ? Math.round((kkp.exc / kkp.sampel) * 1000) / 10 : 0;
  const operasiEfektif = excRate <= 10;
  const kesimpulan = operasiEfektif && kkp.desainKontrol === 'Memadai' ? 'Efektif' : operasiEfektif ? 'Efektif dengan Catatan' : 'Tidak Efektif';
  return (
    <div className="space-y-3">
      <div className="grid sm:grid-cols-3 gap-3 text-[11px]">
        <div>
          <label className="block font-bold text-slate-500 mb-1">Populasi</label>
          <input type="number" disabled={readOnly} value={kkp.populasi} onChange={(e) => onChange({ populasi: Number(e.target.value) })} className="w-full h-9 rounded-[8px] border border-slate-200 px-2.5 disabled:bg-slate-50" />
        </div>
        <div>
          <label className="block font-bold text-slate-500 mb-1">Ukuran Sampel</label>
          <input type="number" disabled={readOnly} value={kkp.sampel} onChange={(e) => onChange({ sampel: Number(e.target.value) })} className="w-full h-9 rounded-[8px] border border-slate-200 px-2.5 disabled:bg-slate-50" />
        </div>
        <div>
          <label className="block font-bold text-slate-500 mb-1">Jumlah Pengecualian</label>
          <input type="number" disabled={readOnly} value={kkp.exc} onChange={(e) => onChange({ exc: Number(e.target.value) })} className="w-full h-9 rounded-[8px] border border-slate-200 px-2.5 disabled:bg-slate-50" />
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3 text-[11px]">
        <div>
          <label className="block font-bold text-slate-500 mb-1">Metode Sampling</label>
          <select disabled={readOnly} value={kkp.samplingMethod} onChange={(e) => onChange({ samplingMethod: e.target.value })} className="w-full h-9 rounded-[8px] border border-slate-200 px-2.5 disabled:bg-slate-50">
            {['Berbasis risiko', 'Acak', 'Sensus'].map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
        <div>
          <label className="block font-bold text-slate-500 mb-1">Kesimpulan Desain Kontrol</label>
          <select disabled={readOnly} value={kkp.desainKontrol} onChange={(e) => onChange({ desainKontrol: e.target.value as KkpState['desainKontrol'] })} className="w-full h-9 rounded-[8px] border border-slate-200 px-2.5 disabled:bg-slate-50">
            {(['Memadai', 'Tidak Memadai'] as const).map((m) => <option key={m} value={m}>{m}</option>)}
          </select>
        </div>
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        <div className="rounded-[10px] bg-slate-50 border border-slate-100 p-3">
          <div className="text-[10px] font-bold uppercase text-slate-400">Exception Rate</div>
          <div className={`text-lg font-extrabold ${excRate > 10 ? 'text-rose-600' : 'text-emerald-600'}`}>{excRate}%</div>
          <div className="text-[10px] text-slate-400">Operasi kontrol {operasiEfektif ? 'efektif' : 'tidak efektif'} bila &gt;10%.</div>
        </div>
        <div className="rounded-[10px] bg-slate-50 border border-slate-100 p-3">
          <div className="text-[10px] font-bold uppercase text-slate-400">Kesimpulan Uji Kontrol</div>
          <Badge color={kesimpulan === 'Efektif' ? 'success' : kesimpulan === 'Efektif dengan Catatan' ? 'warning' : 'danger'} className="mt-1">{kesimpulan}</Badge>
        </div>
      </div>
      <div>
        <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Unggah Bukti</label>
        <LampiranList items={lampiran} />
        {!readOnly && <UploadDropzone onFiles={onUpload} multiple maxSizeMB={25} hint="PDF/Word/Excel/JPG · maks 25 MB · boleh lebih dari satu" className="mt-2" />}
      </div>
    </div>
  );
};

/* ============================================================================================ *
 * F5 — Konsep Temuan & Tanggapan (5C)
 * ============================================================================================ */
const F5Content: React.FC<{ risks: RiskRegisterEntry[] }> = ({ risks }) => {
  const tinggi = risks.filter((r) => riskLevel(r.residualL * r.residualI) === 'Tinggi' || riskLevel(r.residualL * r.residualI) === 'Sangat Tinggi');
  return (
    <div className="space-y-3">
      {tinggi.length === 0 ? (
        <div className="text-[11px] text-slate-400 italic">Tidak ada risiko residual bertingkat Tinggi/Sangat Tinggi yang perlu dikonsepkan sebagai temuan formal pada siklus ini.</div>
      ) : (
        tinggi.map((r) => (
          <div key={r.kode} className="rounded-[10px] border border-slate-100 p-3 space-y-2">
            <div className="text-xs font-extrabold text-slate-800">Konsep Temuan — {r.kode} {r.proses}</div>
            <div className="grid sm:grid-cols-2 gap-2 text-[11px]">
              <div><span className="font-bold text-slate-500">Kondisi:</span> {r.pernyataan}</div>
              <div><span className="font-bold text-slate-500">Kriteria:</span> SOP/Perkap terkait {r.proses.toLowerCase()}.</div>
              <div><span className="font-bold text-slate-500">Sebab:</span> {r.penyebab}</div>
              <div><span className="font-bold text-slate-500">Akibat:</span> {r.dampak}</div>
            </div>
            <div className="text-[11px]"><span className="font-bold text-slate-500">Rekomendasi:</span> {r.mitigasiTindakan} (PIC: {r.mitigasiPic}, tenggat {r.mitigasiTenggat}).</div>
          </div>
        ))
      )}
    </div>
  );
};

/* ============================================================================================ *
 * F6 — Kesimpulan Audit MR Objek
 * ============================================================================================ */
interface F6Patch { maturitasMr?: number; keandalanUpr?: string; simpulan?: string }
const F6Content: React.FC<{ readOnly: boolean; maturitasMr: number; keandalanUpr: string; simpulan: string; onChange: (patch: F6Patch) => void }> = ({ readOnly, maturitasMr, keandalanUpr, simpulan, onChange }) => (
  <div className="space-y-3">
    <div className="grid sm:grid-cols-2 gap-3">
      <div className="rounded-[10px] bg-slate-50 border border-slate-100 p-3">
        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Tingkat Maturitas MR (1-5)</div>
        <select disabled={readOnly} value={maturitasMr} onChange={(e) => onChange({ maturitasMr: Number(e.target.value) })} className="w-full h-9 rounded-[8px] border border-slate-200 px-2.5 text-sm font-bold disabled:bg-white">
          {[1, 2, 3, 4, 5].map((n) => <option key={n} value={n}>{n}</option>)}
        </select>
      </div>
      <div className="rounded-[10px] bg-slate-50 border border-slate-100 p-3">
        <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Keandalan Penilaian UPR</div>
        <select disabled={readOnly} value={keandalanUpr} onChange={(e) => onChange({ keandalanUpr: e.target.value })} className="w-full h-9 rounded-[8px] border border-slate-200 px-2.5 text-sm font-bold disabled:bg-white">
          {['Sangat Andal', 'Andal', 'Cukup Andal', 'Kurang Andal'].map((v) => <option key={v} value={v}>{v}</option>)}
        </select>
      </div>
    </div>
    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1">Simpulan Audit MR Objek</label>
      <Textarea rows={3} disabled={readOnly} defaultValue={simpulan} onBlur={(e) => onChange({ simpulan: e.target.value })} placeholder="Ringkasan simpulan hasil audit berbasis risiko atas objek ini..." />
    </div>
    <p className="text-[11px] text-slate-400">Setelah disetujui Daltu, F1-F6 terkunci dan LHP diterbitkan; faktor RBIA objek ini diperbarui untuk PKPT berikutnya.</p>
  </div>
);

/* ============================================================================================ *
 * F7 — Rencana Aksi & Tindak Lanjut
 * ============================================================================================ */
const F7Content: React.FC<{
  risks: RiskRegisterEntry[];
  readOnly: boolean;
  tindakLanjutStatus: TindakLanjutStatus;
  closed: boolean;
  buktiTindakLanjut: LampiranEntry[];
  tglVerifikasi: string;
  catatanVerifikasi: string;
  onChange: (v: TindakLanjutStatus) => void;
  onUploadBukti: (files: File[]) => void;
  onTglVerifikasiChange: (v: string) => void;
  onCatatanVerifikasiChange: (v: string) => void;
}> = ({ risks, readOnly, tindakLanjutStatus, closed, buktiTindakLanjut, tglVerifikasi, catatanVerifikasi, onChange, onUploadBukti, onTglVerifikasiChange, onCatatanVerifikasiChange }) => (
  <div className="space-y-3">
    <table className="w-full text-[11px]">
      <thead><tr className="text-slate-400"><th className="text-left pb-1.5">Kode</th><th className="text-left pb-1.5">Tindakan</th><th className="text-left pb-1.5">PIC</th><th className="text-left pb-1.5">Tenggat</th></tr></thead>
      <tbody>
        {risks.map((r) => (
          <tr key={r.kode} className="border-t border-slate-100">
            <td className="py-1.5 font-bold text-slate-700">{r.kode}</td>
            <td className="py-1.5 text-slate-600">{r.mitigasiTindakan}</td>
            <td className="py-1.5 text-slate-500">{r.mitigasiPic}</td>
            <td className="py-1.5 text-slate-400">{r.mitigasiTenggat}</td>
          </tr>
        ))}
      </tbody>
    </table>

    <div>
      <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Bukti Tindak Lanjut</label>
      <LampiranList items={buktiTindakLanjut} />
      {!readOnly && <UploadDropzone onFiles={onUploadBukti} multiple maxSizeMB={25} hint="PDF/Word/Excel/JPG · maks 25 MB · boleh lebih dari satu" className="mt-2" />}
    </div>

    <div className="rounded-[10px] bg-slate-50 border border-slate-100 p-3 space-y-2.5">
      <div className="text-[10px] font-bold uppercase text-slate-400">Verifikasi Tindak Lanjut</div>
      <select disabled={readOnly} value={tindakLanjutStatus} onChange={(e) => onChange(e.target.value as TindakLanjutStatus)} className="w-full h-9 rounded-[8px] border border-slate-200 px-2.5 text-sm font-bold disabled:bg-white">
        {(['Belum ditindaklanjuti', 'Belum sesuai', 'Sesuai rekomendasi', 'Tidak dapat ditindaklanjuti'] as TindakLanjutStatus[]).map((v) => <option key={v} value={v}>{v}</option>)}
      </select>
      <div className="grid sm:grid-cols-2 gap-2.5">
        <div>
          <label className="block font-bold text-slate-500 mb-1 text-[11px]">Tanggal Verifikasi</label>
          <input type="date" disabled={readOnly} value={tglVerifikasi} onChange={(e) => onTglVerifikasiChange(e.target.value)} className="w-full h-9 rounded-[8px] border border-slate-200 px-2.5 text-[11px] disabled:bg-white" />
        </div>
        <div>
          <label className="block font-bold text-slate-500 mb-1 text-[11px]">Catatan Verifikasi</label>
          <input disabled={readOnly} value={catatanVerifikasi} onChange={(e) => onCatatanVerifikasiChange(e.target.value)} placeholder="Catatan auditor atas tindak lanjut..." className="w-full h-9 rounded-[8px] border border-slate-200 px-2.5 text-[11px] disabled:bg-white" />
        </div>
      </div>
      <p className="text-[11px] text-slate-400">Alur ditutup hanya jika status "Sesuai rekomendasi".</p>
    </div>
    {closed && (
      <div className="rounded-[10px] bg-emerald-50 border border-emerald-200 p-3 flex items-center gap-2 text-emerald-800 text-xs font-bold">
        <CheckCircle2 className="w-4 h-4" /> Penugasan ditutup — skor RBIA telah diperbarui untuk PKPT berikutnya.
      </div>
    )}
  </div>
);

export { STORAGE_KEY as FORM_MR_STORAGE_KEY };

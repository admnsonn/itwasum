/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 6.0-6.3 Portal Satker (Dashboard, Permintaan Masuk + unggah berkas, Laporan SPIP, Laporan
 * IKU) — mereplikasi menu PIC Satker pada `27092026/.extracted/portal-data-satker.html` (Plan
 * "Migrate 27092026 prototypes", todo `b12-portal`). Auditee (PIC Satker) melihat portal
 * satkernya sendiri; Super Admin/Admin Polda dapat memilih Satker untuk pratinjau.
 */
import React, { useMemo, useState } from 'react';
import { AlertTriangle, Building2, CheckCircle2, Clock, FileWarning, History, Recycle, Send, ShieldCheck, Trash2, Undo2, Upload, Wrench } from 'lucide-react';
import type { CurrentUserProfile } from '../../../../types';
import {
  useAuditUniverseStore,
  getOrgById,
  getItwilOf,
  getDokById,
  reqStatusTurunan,
  satkerStatus,
  getBerkas,
  isSelesai,
  uploadBerkas,
  getSlotsFor,
  slotStatus,
  assignSlotPic,
  excludeSlot,
  unexcludeSlot,
  validateBerkasAgainstAturan,
  removeDraftBerkas,
  replaceBerkas,
  resubmitBerkas,
  reuseCandidates,
  reuseBerkas,
  sendBerkas,
  markSelesai,
  undoSelesai,
  deadlinesForOrg,
  feedForOrg,
  findLaporan,
  uploadLaporan,
  sendLaporan,
  deleteDraftLaporan,
  resubmitLaporan,
  slotWindow,
  formatIsoDate,
  formatDateTime,
  formatBytes,
  daysDiffFromToday,
  IKU_SLOTS,
  SPIP_SLOTS,
  LAINNYA_DOC_ID,
  BERKAS_STATUS_LABEL,
  JENJANG_SASARAN,
} from '../../../../data/auditUniverse';
import type { Permintaan, LaporanSlotDef, BerkasSatker, LaporanEntry, BerkasVersion, ReuseCandidate } from '../../../../data/auditUniverse';
import { currentUserOrgId, displayNameForLog } from '../../../../data/auditUniverse/roleMapping';
import { IND_IKU_DEFS } from '../../../../data/auditUniverse/seeds/laporan';
import { Badge, Button, Card, Checkbox, EmptyState, Modal, Search, Select, SegmentedControl, StatCard, Table, Textarea, Timeline, UploadDropzone, type BadgeColor, type TableColumn } from '../../../ui';
import { SimulasiItwasumModal } from './SimulasiItwasumModal';

interface PortalSatkerScreenProps {
  currentUser: CurrentUserProfile;
  detailPath?: string;
  onNavigateDetail: (detail?: string) => void;
}

type PortalTab = 'dashboard' | 'masuk' | 'spip' | 'iku';

export const PortalSatkerScreen: React.FC<PortalSatkerScreenProps> = ({ currentUser }) => {
  const state = useAuditUniverseStore();
  const canPickOrg = currentUser.peran === 'super_admin';
  const fixedOrgId = currentUserOrgId(currentUser);
  // Super Admin's own titik wilayah (Mabes Polri) is not a valid sasaran Satker for the portal
  // preview, so default the picker to a populated Satker (Polda Riau) instead.
  const [pickedOrgId, setPickedOrgId] = useState('ORG-00300');
  const orgId = canPickOrg ? pickedOrgId : fixedOrgId;
  const [tab, setTab] = useState<PortalTab>('dashboard');
  const [selectedReq, setSelectedReq] = useState<Permintaan | null>(null);
  const [showSimulasi, setShowSimulasi] = useState(false);

  const org = orgId ? getOrgById(orgId) : undefined;

  const previewOptions = useMemo(
    () => state.orgUnits.filter((o) => o.aktif && JENJANG_SASARAN.includes(o.jenjang)).map((o) => ({ value: o.id, label: `${o.sing} (${o.jenjang})` })),
    [state.orgUnits]
  );

  if (!orgId || !org) {
    return <EmptyState title="Akun ini belum terhubung ke Satker manapun" description="Portal Satker hanya tersedia untuk peran yang memiliki titik wilayah Satker." icon={<Building2 className="w-6 h-6 text-slate-300" />} />;
  }

  return (
    <div className="space-y-4">
      {canPickOrg && (
        <Card className="flex items-center gap-3">
          <span className="text-xs font-bold text-slate-600 shrink-0">Pratinjau Portal Satker:</span>
          <Select options={previewOptions} value={pickedOrgId} onChange={setPickedOrgId} className="max-w-sm" />
        </Card>
      )}

      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-3">
          <div>
            <h3 className="text-base font-extrabold text-slate-900">{org.sing}</h3>
            <p className="text-xs text-slate-500">{org.nama} · {org.jenjang}{getItwilOf(org) ? ` · Diawasi ${getItwilOf(org)}` : ''}</p>
          </div>
          {currentUser.peran === 'super_admin' && (
            <Button variant="outline" size="sm" onClick={() => setShowSimulasi(true)}>
              <ShieldCheck className="w-3.5 h-3.5" /> Buka Simulasi
            </Button>
          )}
        </div>
        <SegmentedControl
          options={[
            { value: 'dashboard', label: 'Dashboard' },
            { value: 'masuk', label: 'Permintaan Masuk' },
            { value: 'spip', label: 'Laporan SPIP' },
            { value: 'iku', label: 'Laporan IKU' },
          ]}
          value={tab}
          onChange={(v) => { setTab(v as PortalTab); setSelectedReq(null); }}
        />
      </div>

      {tab === 'dashboard' && <DashboardTab orgId={orgId} onOpenPermintaan={() => setTab('masuk')} />}
      {tab === 'masuk' && (
        selectedReq ? (
          <PermintaanMasukDetail req={selectedReq} orgId={orgId} currentUser={currentUser} onBack={() => setSelectedReq(null)} />
        ) : (
          <PermintaanMasukList orgId={orgId} onSelect={setSelectedReq} />
        )
      )}
      {tab === 'spip' && <LaporanTab jenis="SPIP" slots={SPIP_SLOTS} orgId={orgId} currentUser={currentUser} />}
      {tab === 'iku' && <LaporanTab jenis="IKU" slots={IKU_SLOTS} orgId={orgId} currentUser={currentUser} />}

      {showSimulasi && <SimulasiItwasumModal orgId={orgId} currentUser={currentUser} onClose={() => setShowSimulasi(false)} />}
    </div>
  );
};

/* ============================================================================================ *
 * 6.0 Dashboard
 * ============================================================================================ */
const DashboardTab: React.FC<{ orgId: string; onOpenPermintaan: () => void }> = ({ orgId, onOpenPermintaan }) => {
  const state = useAuditUniverseStore();
  const reqs = state.permintaan.filter((r) => r.sasaran.includes(orgId) && r.status !== 'Draft');
  const aktif = reqs.filter((r) => reqStatusTurunan(r) === 'Berjalan' && !isSelesai(r.id, orgId));
  const perluAksi = aktif.filter((r) => {
    const st = satkerStatus(r, orgId);
    return st.perluPerbaikan || st.terlambat || st.stage === 'Belum Mulai';
  });
  const allFiles = reqs.flatMap((r) => getBerkas(r.id, orgId));
  const nOk = allFiles.filter((f) => f.status === 'ok').length;
  const nFix = allFiles.filter((f) => f.status === 'fix').length;
  const nWait = allFiles.filter((f) => f.status === 'wait').length;
  const deadlines = deadlinesForOrg(orgId);
  const feed = feedForOrg(orgId);

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Perlu Aksi" value={perluAksi.length} />
        <StatCard label="Menunggu Verifikasi" value={nWait} />
        <StatCard label="Diterima" value={nOk} />
        <StatCard label="Perlu Perbaikan" value={nFix} />
      </div>
      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <div className="flex items-center justify-between mb-2">
            <div className="text-xs font-bold text-slate-700">Tenggat Terdekat</div>
            <button onClick={onOpenPermintaan} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">Lihat semua permintaan</button>
          </div>
          {deadlines.length === 0 ? (
            <EmptyState title="Tidak ada tenggat mendesak" icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />} />
          ) : (
            <ul className="space-y-1.5">
              {deadlines.slice(0, 6).map((d, i) => {
                const sisa = daysDiffFromToday(d.tgl);
                return (
                  <li key={i} className="flex items-center justify-between gap-3 rounded-[10px] border border-slate-100 p-2.5">
                    <div className="min-w-0">
                      <div className="text-xs font-bold text-slate-800 truncate">{d.judul}</div>
                      <div className="text-[11px] text-slate-400">{d.tipe}</div>
                    </div>
                    <Badge color={sisa < 0 ? 'danger' : sisa <= 3 ? 'warning' : 'neutral'}>{sisa < 0 ? `Lewat ${-sisa} hari` : `Sisa ${sisa} hari`}</Badge>
                  </li>
                );
              })}
            </ul>
          )}
        </Card>
        <Card>
          <div className="text-xs font-bold text-slate-700 mb-2">Aktivitas Terbaru</div>
          {feed.length === 0 ? (
            <EmptyState title="Belum ada aktivitas" />
          ) : (
            <Timeline
              items={feed.map((f, i) => ({
                id: String(i),
                title: f.aksi,
                description: `${f.oleh} — ${f.konteks}`,
                timestamp: formatDateTime(f.waktu),
                tone: f.aksi.toLowerCase().includes('mengembalikan') ? 'warning' : f.aksi.toLowerCase().includes('menerima') ? 'success' : 'default',
              }))}
            />
          )}
        </Card>
      </div>
    </div>
  );
};

/* ============================================================================================ *
 * 6.1 Permintaan Masuk
 * ============================================================================================ */
const STATUS_COLOR: Record<string, BadgeColor> = { Selesai: 'success', Terlambat: 'danger', 'Perlu Perbaikan': 'warning', 'Belum Mulai': 'neutral', 'Sedang Mengunggah': 'info', 'Sudah Mengirim': 'violet' };

const PermintaanMasukList: React.FC<{ orgId: string; onSelect: (r: Permintaan) => void }> = ({ orgId, onSelect }) => {
  const state = useAuditUniverseStore();
  const reqs = state.permintaan.filter((r) => r.sasaran.includes(orgId) && r.status !== 'Draft');

  const columns: TableColumn<Permintaan>[] = [
    {
      key: 'judul',
      header: 'Permintaan',
      render: (r) => (
        <div>
          <button onClick={() => onSelect(r)} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left block">{r.judul}</button>
          <span className="text-[11px] text-slate-400">{r.periodeLabel} TA {r.tahunAnggaran}{r.tipe === 'Tambahan Audit' ? ' · Tambahan Audit' : ''}</span>
        </div>
      ),
    },
    { key: 'tenggat', header: 'Tenggat', render: (r) => formatIsoDate(r.selesai) },
    { key: 'status', header: 'Status Saya', render: (r) => { const st = satkerStatus(r, orgId); return <Badge color={STATUS_COLOR[st.label] ?? 'neutral'}>{st.label}</Badge>; } },
    { key: 'aksi', header: 'Aksi', render: (r) => <button onClick={() => onSelect(r)} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Buka</button> },
  ];

  return reqs.length === 0 ? (
    <EmptyState title="Belum ada permintaan data yang masuk" icon={<FileWarning className="w-6 h-6 text-slate-300" />} />
  ) : (
    <Card><Table columns={columns} data={reqs} rowKey={(r) => r.id} /></Card>
  );
};

const BERKAS_BADGE_COLOR: Record<BerkasSatker['status'], BadgeColor> = { draft: 'neutral', wait: 'info', ok: 'success', fix: 'warning' };

const DOKUMEN_SLOT_STATUS_COLOR: Record<string, BadgeColor> = {
  'Belum Diunggah': 'neutral',
  Diunggah: 'info',
  Diajukan: 'warning',
  'Perlu Perbaikan': 'danger',
  Diterima: 'success',
  Dikecualikan: 'neutral',
};

/** 6.1 Slot Dokumen — snapshot Mapping (5.1) yang dipublikasikan saat permintaan dikirim (5.3),
 * satu slot = satu dokumen wajib. Admin Satker (PIC) menetapkan penugasan & tenggat internal,
 * atau mengecualikan slot dengan alasan (Plan p1-b12-collection). */
const SlotDokumenCard: React.FC<{ slots: ReturnType<typeof getSlotsFor> }> = ({ slots }) => {
  useAuditUniverseStore();
  const [editing, setEditing] = useState<(typeof slots)[number] | null>(null);
  const [pic, setPic] = useState('');
  const [tenggat, setTenggat] = useState('');
  const [excludeTarget, setExcludeTarget] = useState<(typeof slots)[number] | null>(null);
  const [alasan, setAlasan] = useState('');

  return (
    <Card className="space-y-2">
      <div className="text-xs font-bold text-slate-700">Slot Dokumen Wajib ({slots.length}) — dari Mapping 5.1</div>
      <ul className="space-y-1.5">
        {slots.map((s) => (
          <li key={s.id} className="flex items-center justify-between gap-3 rounded-[10px] border border-slate-100 p-2.5">
            <div className="min-w-0">
              <div className="text-xs font-bold text-slate-800 truncate">{getDokById(s.dokId)?.nama ?? s.dokId}</div>
              <div className="text-[11px] text-slate-400">
                PIC: {s.pic || <span className="italic">belum ditugaskan</span>}
                {s.tenggatInternal ? ` · Tenggat internal ${formatIsoDate(s.tenggatInternal)}` : ''}
                {s.dikecualikan && s.alasanKecualikan ? ` · ${s.alasanKecualikan}` : ''}
              </div>
            </div>
            <div className="flex items-center gap-2 shrink-0">
              <Badge color={DOKUMEN_SLOT_STATUS_COLOR[slotStatus(s)]}>{slotStatus(s)}</Badge>
              <button onClick={() => { setEditing(s); setPic(s.pic); setTenggat(s.tenggatInternal ?? ''); }} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">
                Tugaskan
              </button>
              {s.dikecualikan ? (
                <button onClick={() => unexcludeSlot(s.id)} className="text-[11px] font-bold text-slate-500 hover:underline">Batalkan</button>
              ) : (
                <button onClick={() => { setExcludeTarget(s); setAlasan(''); }} className="text-[11px] font-bold text-rose-500 hover:underline">Kecualikan</button>
              )}
            </div>
          </li>
        ))}
      </ul>

      {editing && (
        <Modal isOpen onClose={() => setEditing(null)} title={`Tugaskan PIC — ${getDokById(editing.dokId)?.nama ?? editing.dokId}`}
          footer={<><Button variant="outline" onClick={() => setEditing(null)}>Batal</Button><Button onClick={() => { assignSlotPic(editing.id, pic, tenggat || null); setEditing(null); }}>Simpan</Button></>}
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Nama PIC</label>
              <input value={pic} onChange={(e) => setPic(e.target.value)} className="w-full h-10 rounded-[10px] border border-[var(--sd-outline-variant)] px-3 text-sm" placeholder="Mis. Bripka Andi Wijaya" />
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Tenggat Internal</label>
              <input type="date" value={tenggat} onChange={(e) => setTenggat(e.target.value)} className="w-full h-10 rounded-[10px] border border-[var(--sd-outline-variant)] px-3 text-sm" />
            </div>
          </div>
        </Modal>
      )}

      {excludeTarget && (
        <Modal isOpen onClose={() => setExcludeTarget(null)} title={`Kecualikan Slot — ${getDokById(excludeTarget.dokId)?.nama ?? excludeTarget.dokId}`}
          description="Slot yang dikecualikan tidak perlu diunggah, tetapi wajib disertai alasan."
          footer={<><Button variant="outline" onClick={() => setExcludeTarget(null)}>Batal</Button><Button variant="danger" disabled={!alasan.trim()} onClick={() => { excludeSlot(excludeTarget.id, alasan); setExcludeTarget(null); }}>Kecualikan</Button></>}
        >
          <Textarea rows={2} value={alasan} onChange={(e) => setAlasan(e.target.value)} placeholder="Jelaskan alasan pengecualian..." />
        </Modal>
      )}
    </Card>
  );
};

const PermintaanMasukDetail: React.FC<{ req: Permintaan; orgId: string; currentUser: CurrentUserProfile; onBack: () => void }> = ({ req, orgId, currentUser, onBack }) => {
  useAuditUniverseStore();
  const files = getBerkas(req.id, orgId);
  const [dokId, setDokId] = useState('');
  const [uploadError, setUploadError] = useState('');
  const [confirmSend, setConfirmSend] = useState(false);
  const [confirmSelesai, setConfirmSelesai] = useState(false);
  const [reuseOpen, setReuseOpen] = useState(false);
  const [perbaikiTarget, setPerbaikiTarget] = useState<BerkasSatker | null>(null);
  const [riwayatTarget, setRiwayatTarget] = useState<BerkasSatker | null>(null);
  const state = useAuditUniverseStore();
  const oleh = displayNameForLog(currentUser);
  const selesai = isSelesai(req.id, orgId);
  const nDraft = files.filter((f) => f.status === 'draft').length;
  const dokOptions = state.katalog.filter((d) => d.aktif && d.cara === 'Upload');
  const candidates = reuseCandidates(orgId, req.id);

  const slots = getSlotsFor(req.id, orgId);

  const handleFiles = (fileList: File[]) => {
    const okExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];
    const bad: string[] = [];
    const good: { nama: string; sizeBytes: number; dokId: string }[] = [];
    const targetDokId = dokId || LAINNYA_DOC_ID;
    fileList.forEach((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (!okExt.includes(ext)) return bad.push(`${f.name} (format tidak didukung)`);
      if (f.size > 25 * 1048576) return bad.push(`${f.name} (lebih dari 25 MB)`);
      // 5.2 Aturan Validasi — validasi otomatis sebelum berkas diterima ke draft (BR "Auto-
      // validation runs before submit"), berlaku jika slot dokumen ini punya aturan khusus.
      if (targetDokId !== LAINNYA_DOC_ID) {
        const check = validateBerkasAgainstAturan(targetDokId, { nama: f.name, sizeBytes: f.size });
        if (!check.ok) return bad.push(`${f.name} (${check.reason})`);
      }
      good.push({ nama: f.name, sizeBytes: f.size, dokId: targetDokId });
    });
    setUploadError(bad.length ? bad.join('; ') : '');
    if (good.length) uploadBerkas(req.id, orgId, good, oleh);
  };

  const handleReplace = (fileId: string, file: File) => {
    replaceBerkas(req.id, orgId, fileId, { nama: file.name, sizeBytes: file.size });
  };

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">← Kembali ke daftar permintaan</button>
      <Card className="space-y-2">
        <div className="flex items-center gap-2">
          <Badge color={STATUS_COLOR[satkerStatus(req, orgId).label] ?? 'neutral'}>{satkerStatus(req, orgId).label}</Badge>
        </div>
        <h3 className="text-sm font-extrabold text-slate-900">{req.judul}</h3>
        <p className="text-xs text-slate-500">Periode pengumpulan {formatIsoDate(req.mulai)} – {formatIsoDate(req.selesai)}</p>
        {req.pesan && <p className="text-xs text-slate-600 whitespace-pre-line border-t border-slate-100 pt-2">{req.pesan}</p>}
      </Card>

      {slots.length > 0 && <SlotDokumenCard slots={slots} />}

      {req.status === 'Terkirim' && !selesai && (
        <Card className="space-y-3">
          <div className="flex items-center justify-between gap-2">
            <div className="text-xs font-bold text-slate-700">Unggah Berkas</div>
            {candidates.length > 0 && (
              <button onClick={() => setReuseOpen(true)} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline flex items-center gap-1">
                <Recycle className="w-3.5 h-3.5" /> Pakai Berkas Lama
              </button>
            )}
          </div>
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Jenis Dokumen</label>
            <select value={dokId} onChange={(e) => setDokId(e.target.value)} className="w-full h-10 rounded-[10px] border border-[var(--sd-outline-variant)] bg-white px-3 text-sm">
              <option value="">Lainnya</option>
              {dokOptions.map((d) => <option key={d.id} value={d.id}>{d.nama}</option>)}
            </select>
          </div>
          <UploadDropzone onFiles={handleFiles} multiple maxSizeMB={25} error={uploadError} hint="PDF, Word, Excel, JPG/PNG, atau ZIP · maks 25 MB · boleh lebih dari satu" />
        </Card>
      )}

      <Card>
        <div className="text-xs font-bold text-slate-700 mb-2">Berkas ({files.length})</div>
        {files.length === 0 ? (
          <EmptyState title="Belum ada berkas diunggah" />
        ) : (
          <ul className="space-y-1.5">
            {files.map((f) => (
              <li key={f.id} className="flex items-center justify-between gap-3 rounded-[10px] border border-slate-100 p-2.5">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800 truncate">{f.nama}{f.asalBerkasId ? ' · dipakai kembali' : ''}</div>
                  <div className="text-[11px] text-slate-400">{f.dokId === LAINNYA_DOC_ID ? 'Lainnya' : getDokById(f.dokId)?.nama ?? f.dokId} · {formatBytes(f.sizeBytes)}</div>
                  {f.status === 'fix' && f.catatan && (
                    <div className="text-[11px] text-amber-700 mt-1 flex items-start gap-1"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {f.catatan}</div>
                  )}
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <Badge color={BERKAS_BADGE_COLOR[f.status]}>{BERKAS_STATUS_LABEL[f.status]}</Badge>
                  {f.status === 'draft' && (
                    <>
                      <label className="text-slate-400 hover:text-slate-600 cursor-pointer" title="Ganti Berkas">
                        <Upload className="w-4 h-4" />
                        <input type="file" className="hidden" onChange={(e) => { const file = e.target.files?.[0]; if (file) handleReplace(f.id, file); e.target.value = ''; }} />
                      </label>
                      <button onClick={() => removeDraftBerkas(req.id, orgId, f.id)} className="text-slate-400 hover:text-rose-600" title="Hapus">
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  {f.status === 'fix' && (
                    <button onClick={() => setPerbaikiTarget(f)} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline flex items-center gap-1">
                      <Wrench className="w-3.5 h-3.5" /> Perbaiki
                    </button>
                  )}
                  {f.status !== 'draft' && !!f.versi?.length && (
                    <button onClick={() => setRiwayatTarget(f)} className="text-slate-400 hover:text-slate-600" title="Riwayat Berkas">
                      <History className="w-4 h-4" />
                    </button>
                  )}
                </div>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {req.status === 'Terkirim' && (
        <div className="flex items-center gap-2">
          {nDraft > 0 && (
            <Button onClick={() => setConfirmSend(true)}>
              <Send className="w-3.5 h-3.5" /> Kirim {nDraft} Berkas
            </Button>
          )}
          {!selesai ? (
            <Button variant="secondary" onClick={() => setConfirmSelesai(true)}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Selesai
            </Button>
          ) : (
            <Button variant="outline" onClick={() => undoSelesai(req.id, orgId)}>
              <Undo2 className="w-3.5 h-3.5" /> Batalkan Tanda Selesai
            </Button>
          )}
        </div>
      )}

      {confirmSend && (
        <Modal
          isOpen
          onClose={() => setConfirmSend(false)}
          title="Kirim berkas ke Itwasum?"
          description={`${nDraft} berkas akan dikirim dan menunggu verifikasi. Berkas yang sudah dikirim tidak dapat diubah kecuali diminta perbaikan.`}
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirmSend(false)}>Batal</Button>
              <Button onClick={() => { sendBerkas(req.id, orgId, oleh); setConfirmSend(false); }}>Kirim</Button>
            </>
          }
        />
      )}

      {confirmSelesai && (
        <Modal
          isOpen
          onClose={() => setConfirmSelesai(false)}
          title="Tandai pengiriman selesai?"
          description="Menandakan seluruh berkas yang diperlukan untuk permintaan ini sudah lengkap dikirim."
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirmSelesai(false)}>Batal</Button>
              <Button onClick={() => { markSelesai(req.id, orgId, oleh); setConfirmSelesai(false); }}>Tandai Selesai</Button>
            </>
          }
        />
      )}

      {reuseOpen && (
        <ReuseBerkasModal candidates={candidates} onClose={() => setReuseOpen(false)} onConfirm={(sel) => { reuseBerkas(req.id, orgId, sel, oleh); setReuseOpen(false); }} />
      )}

      {perbaikiTarget && (
        <PerbaikiBerkasModal
          target={perbaikiTarget}
          onClose={() => setPerbaikiTarget(null)}
          onSubmit={(file, keterangan) => { resubmitBerkas(req.id, orgId, perbaikiTarget.id, { nama: file.name, sizeBytes: file.size }, keterangan, oleh); setPerbaikiTarget(null); }}
        />
      )}

      {riwayatTarget && <RiwayatVersiModal nama={riwayatTarget.nama} versi={riwayatTarget.versi ?? []} onClose={() => setRiwayatTarget(null)} />}
    </div>
  );
};

const ReuseBerkasModal: React.FC<{ candidates: ReuseCandidate[]; onClose: () => void; onConfirm: (sel: { reqId: string; fileId: string }[]) => void }> = ({ candidates, onClose, onConfirm }) => {
  const [q, setQ] = useState('');
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const filtered = candidates.filter((c) => !q || c.nama.toLowerCase().includes(q.toLowerCase()) || (getDokById(c.dokId)?.nama ?? '').toLowerCase().includes(q.toLowerCase()));
  const toggle = (key: string) => setSelected((prev) => { const next = new Set(prev); next.has(key) ? next.delete(key) : next.add(key); return next; });

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Pakai Berkas Lama"
      widthClassName="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button
            disabled={selected.size === 0}
            onClick={() => onConfirm(filtered.filter((c) => selected.has(`${c.reqId}:${c.fileId}`)).map((c) => ({ reqId: c.reqId, fileId: c.fileId })))}
          >
            Tambahkan ({selected.size})
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        <Search value={q} onChange={setQ} placeholder="Cari berkas yang pernah diterima..." />
        {filtered.length === 0 ? (
          <EmptyState title="Belum ada berkas yang pernah diterima Itwasum" />
        ) : (
          <ul className="space-y-1.5 max-h-72 overflow-y-auto">
            {filtered.map((c) => {
              const key = `${c.reqId}:${c.fileId}`;
              return (
                <li key={key} onClick={() => toggle(key)} className="flex items-center gap-2.5 rounded-[10px] border border-slate-100 p-2.5 cursor-pointer hover:bg-slate-50">
                  <Checkbox checked={selected.has(key)} onChange={() => toggle(key)} />
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{c.nama}</div>
                    <div className="text-[11px] text-slate-400">{c.dokId === LAINNYA_DOC_ID ? 'Lainnya' : getDokById(c.dokId)?.nama ?? c.dokId} · {formatBytes(c.sizeBytes)} · dari {c.reqJudul}</div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </Modal>
  );
};

const PerbaikiBerkasModal: React.FC<{ target: BerkasSatker; onClose: () => void; onSubmit: (file: File, keterangan: string) => void }> = ({ target, onClose, onSubmit }) => {
  const [file, setFile] = useState<File | null>(null);
  const [keterangan, setKeterangan] = useState('');

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Perbaiki Berkas — ${target.nama}`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          <Button disabled={!file} onClick={() => file && onSubmit(file, keterangan)}>
            <Send className="w-3.5 h-3.5" /> Kirim Perbaikan
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {target.catatan && (
          <div className="p-2.5 rounded-[8px] bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <span className="font-bold">Catatan verifikator:</span> {target.catatan}
          </div>
        )}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Ganti Berkas</label>
          {file ? (
            <div className="flex items-center justify-between rounded-[10px] border border-slate-100 p-2.5">
              <span className="text-xs font-bold text-slate-700 truncate">{file.name} · {formatBytes(file.size)}</span>
              <button onClick={() => setFile(null)} className="text-[11px] font-bold text-slate-400 hover:text-rose-600">Batalkan ganti</button>
            </div>
          ) : (
            <UploadDropzone onFiles={(fl) => setFile(fl[0] ?? null)} maxSizeMB={25} hint="PDF, Word, Excel, JPG/PNG, atau ZIP · maks 25 MB" />
          )}
        </div>
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Keterangan (opsional)</label>
          <Textarea rows={2} value={keterangan} onChange={(e) => setKeterangan(e.target.value)} placeholder="Jelaskan perbaikan yang dilakukan..." />
        </div>
      </div>
    </Modal>
  );
};

export const RiwayatVersiModal: React.FC<{ nama: string; versi: BerkasVersion[]; onClose: () => void }> = ({ nama, versi, onClose }) => (
  <Modal isOpen onClose={onClose} title={`Riwayat Berkas — ${nama}`} footer={<Button onClick={onClose}>Tutup</Button>}>
    {versi.length === 0 ? (
      <EmptyState title="Belum ada versi sebelumnya" />
    ) : (
      <Timeline
        items={[...versi].reverse().map((v, i) => ({
          id: String(i),
          title: `${v.nama} · ${formatBytes(v.sizeBytes)}`,
          description: v.catatan ? `${BERKAS_STATUS_LABEL[v.status]} — ${v.catatan}` : BERKAS_STATUS_LABEL[v.status],
          timestamp: formatIsoDate(v.tgl),
          tone: v.status === 'fix' ? 'warning' : v.status === 'ok' ? 'success' : 'default',
        }))}
      />
    )}
  </Modal>
);

/* ============================================================================================ *
 * 6.2 / 6.3 Laporan SPIP & IKU
 * ============================================================================================ */
const LaporanTab: React.FC<{ jenis: 'IKU' | 'SPIP'; slots: LaporanSlotDef[]; orgId: string; currentUser: CurrentUserProfile }> = ({ jenis, slots, orgId, currentUser }) => {
  useAuditUniverseStore();
  const now = new Date().getFullYear();
  const [tahunAnggaran, setTahunAnggaran] = useState(String(now));
  const laporanList = slots.map((slot) => findLaporan(orgId, jenis, slot.key, tahunAnggaran));
  const nOk = laporanList.filter((l) => l?.status === 'ok').length;
  const nWait = laporanList.filter((l) => l?.status === 'wait').length;
  const nFix = laporanList.filter((l) => l?.status === 'fix').length;

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between gap-3 flex-wrap">
        <div className="grid grid-cols-3 gap-2.5 flex-1 min-w-0">
          <StatCard label="Diterima" value={nOk} />
          <StatCard label="Menunggu Verifikasi" value={nWait} />
          <StatCard label="Perlu Perbaikan" value={nFix} />
        </div>
        <Select options={[String(now), String(now - 1)].map((y) => ({ value: y, label: `TA ${y}` }))} value={tahunAnggaran} onChange={setTahunAnggaran} className="w-32" />
      </div>
      <div className="grid sm:grid-cols-2 gap-3">
        {slots.map((slot) => (
          <LaporanSlotCard key={slot.key} jenis={jenis} slot={slot} orgId={orgId} tahunAnggaran={tahunAnggaran} currentUser={currentUser} />
        ))}
      </div>
    </div>
  );
};

const SLOT_STATUS_COLOR: Record<string, BadgeColor> = {
  Diterima: 'success', 'Menunggu Verifikasi': 'info', 'Perlu Perbaikan': 'warning', Terlambat: 'danger', 'Perlu Diunggah': 'warning', 'Belum Dibuka': 'neutral', 'Belum Dikirim': 'neutral',
};

const LaporanSlotCard: React.FC<{ jenis: 'IKU' | 'SPIP'; slot: LaporanSlotDef; orgId: string; tahunAnggaran: string; currentUser: CurrentUserProfile }> = ({ jenis, slot, orgId, tahunAnggaran, currentUser }) => {
  const lap = findLaporan(orgId, jenis, slot.key, tahunAnggaran);
  const win = slotWindow(slot, tahunAnggaran, lap);
  const oleh = displayNameForLog(currentUser);
  const [uploadOpen, setUploadOpen] = useState<'new' | 'fix' | null>(null);
  const [confirmHapus, setConfirmHapus] = useState(false);
  const [riwayatOpen, setRiwayatOpen] = useState(false);

  const status: string = !lap
    ? (!win.sudahDibuka ? 'Belum Dibuka' : win.terlambat ? 'Terlambat' : 'Perlu Diunggah')
    : lap.status === 'draft'
      ? (win.terlambat ? 'Terlambat' : 'Belum Dikirim')
      : BERKAS_STATUS_LABEL[lap.status];

  const canUpload = !lap && win.sudahDibuka;
  const canSendDraft = lap?.status === 'draft';
  const canFix = lap?.status === 'fix';

  return (
    <Card className="space-y-2">
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="text-xs font-bold text-slate-800">{slot.nama}</div>
          <div className="text-[11px] text-slate-400">{slot.periodeLabel} {tahunAnggaran}</div>
        </div>
        <Badge color={SLOT_STATUS_COLOR[status] ?? 'neutral'}>{status}</Badge>
      </div>
      {lap && (
        <div className="text-[11px] text-slate-500 flex items-center gap-1.5">
          <Clock className="w-3 h-3 shrink-0" /> {lap.fileNama} · {formatBytes(lap.fileSizeBytes)} · {formatIsoDate(lap.tgl)}
        </div>
      )}
      {lap?.status === 'fix' && lap.catatan && (
        <div className="text-[11px] text-amber-700 flex items-start gap-1"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {lap.catatan}</div>
      )}
      {lap?.skor != null && <div className="text-[11px] font-bold text-slate-700">Skor: {lap.skor.toFixed(2)} · {spipLevel(lap.skor)}</div>}
      {!lap && !win.sudahDibuka && (
        <Button size="sm" variant="outline" disabled className="w-full justify-center">Dibuka {formatIsoDate(win.bukaIso)}</Button>
      )}
      <div className="flex items-center gap-2 pt-1">
        {canUpload && (
          <Button size="sm" onClick={() => setUploadOpen('new')}>
            <Upload className="w-3.5 h-3.5" /> Unggah
          </Button>
        )}
        {canSendDraft && (
          <>
            <Button size="sm" onClick={() => sendLaporan(orgId, lap!.id)}>
              <Send className="w-3.5 h-3.5" /> Kirim
            </Button>
            <button onClick={() => setConfirmHapus(true)} className="text-[11px] font-bold text-rose-500 hover:underline">Hapus</button>
          </>
        )}
        {canFix && (
          <Button size="sm" onClick={() => setUploadOpen('fix')}>
            <Wrench className="w-3.5 h-3.5" /> Perbaiki
          </Button>
        )}
        {!!lap?.versi?.length && (
          <button onClick={() => setRiwayatOpen(true)} className="text-slate-400 hover:text-slate-600 ml-auto" title="Riwayat Berkas">
            <History className="w-4 h-4" />
          </button>
        )}
      </div>

      {uploadOpen && (
        <LaporanUploadModal
          jenis={jenis}
          slot={slot}
          orgId={orgId}
          tahunAnggaran={tahunAnggaran}
          mode={uploadOpen}
          existing={lap}
          onClose={() => setUploadOpen(null)}
        />
      )}

      {confirmHapus && lap && (
        <Modal
          isOpen
          onClose={() => setConfirmHapus(false)}
          title="Hapus draft laporan?"
          description={`Draft ${slot.nama} ${tahunAnggaran} akan dihapus.`}
          footer={
            <>
              <Button variant="outline" onClick={() => setConfirmHapus(false)}>Batal</Button>
              <Button variant="danger" onClick={() => { deleteDraftLaporan(orgId, lap.id); setConfirmHapus(false); }}>Hapus</Button>
            </>
          }
        />
      )}

      {riwayatOpen && <RiwayatVersiModal nama={lap?.fileNama ?? slot.nama} versi={lap?.versi ?? []} onClose={() => setRiwayatOpen(false)} />}
    </Card>
  );
};

function spipLevel(skor: number): string {
  if (skor < 1.5) return 'Level 1 · Rintisan';
  if (skor < 2.5) return 'Level 2 · Berkembang';
  if (skor < 3.5) return 'Level 3 · Terdefinisi';
  if (skor < 4.5) return 'Level 4 · Terkelola';
  return 'Level 5 · Optimal';
}

const LaporanUploadModal: React.FC<{
  jenis: 'IKU' | 'SPIP';
  slot: LaporanSlotDef;
  orgId: string;
  tahunAnggaran: string;
  mode: 'new' | 'fix';
  existing?: LaporanEntry;
  onClose: () => void;
}> = ({ jenis, slot, orgId, tahunAnggaran, mode, existing, onClose }) => {
  const [file, setFile] = useState<File | null>(null);
  const [skorInput, setSkorInput] = useState(String(existing?.skor ?? ''));
  const [realisasi, setRealisasi] = useState<Record<string, string>>(() =>
    Object.fromEntries(IND_IKU_DEFS.map((d) => [d.id, String(existing?.realisasi?.[d.id] ?? '')]))
  );

  const buildExtra = () => ({
    skor: slot.butuhSkor ? parseFloat(skorInput) || 0 : undefined,
    realisasi: slot.butuhRealisasi
      ? Object.fromEntries(IND_IKU_DEFS.map((d) => [d.id, parseFloat(realisasi[d.id]) || 0]))
      : undefined,
  });

  const handleSave = (kirim: boolean) => {
    if (!file) return;
    if (mode === 'fix' && existing) {
      resubmitLaporan(orgId, existing.id, { nama: file.name, sizeBytes: file.size }, buildExtra());
    } else {
      uploadLaporan(orgId, jenis, slot.key, tahunAnggaran, { nama: file.name, sizeBytes: file.size }, { ...buildExtra(), kirim });
    }
    onClose();
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={`Unggah ${slot.nama}`}
      widthClassName="max-w-lg"
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Batal</Button>
          {mode === 'new' && (
            <Button variant="secondary" disabled={!file} onClick={() => handleSave(false)}>Simpan Draft</Button>
          )}
          <Button disabled={!file} onClick={() => handleSave(true)}>
            <Send className="w-3.5 h-3.5" /> {mode === 'fix' ? 'Kirim Perbaikan' : 'Simpan & Kirim'}
          </Button>
        </>
      }
    >
      <div className="space-y-3">
        {mode === 'fix' && existing?.catatan && (
          <div className="p-2.5 rounded-[8px] bg-amber-50 border border-amber-200 text-xs text-amber-800">
            <span className="font-bold">Catatan verifikator:</span> {existing.catatan}
          </div>
        )}
        <div>
          <label className="block text-[11px] font-bold text-slate-500 mb-1">Berkas</label>
          {file ? (
            <div className="flex items-center justify-between rounded-[10px] border border-slate-100 p-2.5">
              <span className="text-xs font-bold text-slate-700 truncate">{file.name} · {formatBytes(file.size)}</span>
              <button onClick={() => setFile(null)} className="text-[11px] font-bold text-slate-400 hover:text-rose-600">Batalkan</button>
            </div>
          ) : (
            <UploadDropzone onFiles={(fl) => setFile(fl[0] ?? null)} maxSizeMB={25} hint="PDF/Word/Excel · maks 25 MB" />
          )}
        </div>
        {slot.butuhSkor && (
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1">Skor Penilaian Mandiri (0-5)</label>
            <input
              type="number"
              min={0}
              max={5}
              step={0.01}
              value={skorInput}
              onChange={(e) => setSkorInput(e.target.value)}
              placeholder="Skor 0-5"
              className="w-full h-9 rounded-[8px] border border-[var(--sd-outline-variant)] px-2.5 text-xs"
            />
          </div>
        )}
        {slot.butuhRealisasi && (
          <div>
            <label className="block text-[11px] font-bold text-slate-500 mb-1.5">Realisasi Indikator Kinerja Utama</label>
            <table className="w-full text-[11px]">
              <thead>
                <tr className="text-slate-400"><th className="text-left pb-1">Indikator</th><th className="text-right pb-1">Target</th><th className="text-right pb-1">Realisasi</th><th className="text-right pb-1">Capaian</th></tr>
              </thead>
              <tbody>
                {IND_IKU_DEFS.map((d) => {
                  const real = parseFloat(realisasi[d.id]) || 0;
                  const capaian = d.target > 0 ? Math.round((real / d.target) * 1000) / 10 : 0;
                  return (
                    <tr key={d.id} className="border-t border-slate-100">
                      <td className="py-1.5 text-slate-600">{d.nama}</td>
                      <td className="py-1.5 text-right text-slate-400">{d.target} {d.satuan}</td>
                      <td className="py-1.5 text-right">
                        <input
                          type="number"
                          step={0.1}
                          value={realisasi[d.id]}
                          onChange={(e) => setRealisasi((prev) => ({ ...prev, [d.id]: e.target.value }))}
                          className="w-20 h-7 rounded-[6px] border border-slate-200 px-1.5 text-right text-[11px]"
                        />
                      </td>
                      <td className="py-1.5 text-right font-bold text-slate-700">{capaian}%</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </Modal>
  );
};
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
import { AlertTriangle, Building2, CheckCircle2, Clock, FileWarning, Send, Undo2 } from 'lucide-react';
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
  sendBerkas,
  markSelesai,
  undoSelesai,
  deadlinesForOrg,
  feedForOrg,
  findLaporan,
  uploadLaporan,
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
import type { Permintaan, LaporanSlotDef } from '../../../../data/auditUniverse';
import { currentUserOrgId, displayNameForLog } from '../../../../data/auditUniverse/roleMapping';
import { IND_IKU_DEFS } from '../../../../data/auditUniverse/seeds/laporan';
import { Badge, Button, Card, EmptyState, Select, SegmentedControl, StatCard, Table, Timeline, UploadDropzone, type BadgeColor, type TableColumn } from '../../../ui';

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
        <div>
          <h3 className="text-base font-extrabold text-slate-900">{org.sing}</h3>
          <p className="text-xs text-slate-500">{org.nama} · {org.jenjang}{getItwilOf(org) ? ` · Diawasi ${getItwilOf(org)}` : ''}</p>
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

const PermintaanMasukDetail: React.FC<{ req: Permintaan; orgId: string; currentUser: CurrentUserProfile; onBack: () => void }> = ({ req, orgId, currentUser, onBack }) => {
  useAuditUniverseStore();
  const files = getBerkas(req.id, orgId);
  const [dokId, setDokId] = useState('');
  const [uploadError, setUploadError] = useState('');
  const state = useAuditUniverseStore();
  const oleh = displayNameForLog(currentUser);
  const selesai = isSelesai(req.id, orgId);
  const nDraft = files.filter((f) => f.status === 'draft').length;
  const dokOptions = state.katalog.filter((d) => d.aktif && d.cara === 'Upload');

  const handleFiles = (fileList: File[]) => {
    const okExt = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];
    const bad: string[] = [];
    const good: { nama: string; sizeBytes: number; dokId: string }[] = [];
    fileList.forEach((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      if (!okExt.includes(ext)) return bad.push(`${f.name} (format tidak didukung)`);
      if (f.size > 25 * 1048576) return bad.push(`${f.name} (lebih dari 25 MB)`);
      good.push({ nama: f.name, sizeBytes: f.size, dokId: dokId || LAINNYA_DOC_ID });
    });
    setUploadError(bad.length ? bad.join('; ') : '');
    if (good.length) uploadBerkas(req.id, orgId, good, oleh);
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

      {req.status === 'Terkirim' && !selesai && (
        <Card className="space-y-3">
          <div className="text-xs font-bold text-slate-700">Unggah Berkas</div>
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
                  <div className="text-xs font-bold text-slate-800 truncate">{f.nama}</div>
                  <div className="text-[11px] text-slate-400">{f.dokId === LAINNYA_DOC_ID ? 'Lainnya' : getDokById(f.dokId)?.nama ?? f.dokId} · {formatBytes(f.sizeBytes)}</div>
                  {f.status === 'fix' && f.catatan && (
                    <div className="text-[11px] text-amber-700 mt-1 flex items-start gap-1"><AlertTriangle className="w-3 h-3 mt-0.5 shrink-0" /> {f.catatan}</div>
                  )}
                </div>
                <Badge color={f.status === 'ok' ? 'success' : f.status === 'fix' ? 'warning' : f.status === 'wait' ? 'info' : 'neutral'}>{BERKAS_STATUS_LABEL[f.status]}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>

      {req.status === 'Terkirim' && (
        <div className="flex items-center gap-2">
          {nDraft > 0 && (
            <Button onClick={() => sendBerkas(req.id, orgId, oleh)}>
              <Send className="w-3.5 h-3.5" /> Kirim {nDraft} Berkas
            </Button>
          )}
          {!selesai ? (
            <Button variant="secondary" onClick={() => markSelesai(req.id, orgId, oleh)}>
              <CheckCircle2 className="w-3.5 h-3.5" /> Tandai Selesai
            </Button>
          ) : (
            <Button variant="outline" onClick={() => undoSelesai(req.id, orgId)}>
              <Undo2 className="w-3.5 h-3.5" /> Batalkan Tanda Selesai
            </Button>
          )}
        </div>
      )}
    </div>
  );
};

/* ============================================================================================ *
 * 6.2 / 6.3 Laporan SPIP & IKU
 * ============================================================================================ */
const LaporanTab: React.FC<{ jenis: 'IKU' | 'SPIP'; slots: LaporanSlotDef[]; orgId: string; currentUser: CurrentUserProfile }> = ({ jenis, slots, orgId, currentUser }) => {
  useAuditUniverseStore();
  const tahunBerjalan = String(new Date().getFullYear());
  return (
    <div className="grid sm:grid-cols-2 gap-3">
      {slots.map((slot) => (
        <LaporanSlotCard key={slot.key} jenis={jenis} slot={slot} orgId={orgId} tahunAnggaran={tahunBerjalan} currentUser={currentUser} />
      ))}
    </div>
  );
};

const SLOT_STATUS_COLOR: Record<string, BadgeColor> = {
  Diterima: 'success', 'Menunggu Verifikasi': 'info', 'Perlu Perbaikan': 'warning', Terlambat: 'danger', 'Perlu Diunggah': 'warning', 'Belum Dibuka': 'neutral', 'Belum Dikirim': 'neutral',
};

const LaporanSlotCard: React.FC<{ jenis: 'IKU' | 'SPIP'; slot: LaporanSlotDef; orgId: string; tahunAnggaran: string; currentUser: CurrentUserProfile }> = ({ jenis, slot, orgId, tahunAnggaran, currentUser }) => {
  const lap = findLaporan(orgId, jenis, slot.key, tahunAnggaran);
  const [skorInput, setSkorInput] = useState(String(lap?.skor ?? ''));
  const oleh = displayNameForLog(currentUser);

  const status: string = lap ? (lap.status === 'draft' ? 'Belum Dikirim' : BERKAS_STATUS_LABEL[lap.status]) : 'Perlu Diunggah';
  const canUpload = status === 'Perlu Diunggah' || status === 'Belum Dikirim' || status === 'Perlu Perbaikan';

  const handleFiles = (fileList: File[]) => {
    const f = fileList[0];
    if (!f) return;
    uploadLaporan(orgId, jenis, slot.key, tahunAnggaran, { nama: f.name, sizeBytes: f.size }, slot.butuhSkor ? { skor: parseFloat(skorInput) || 0 } : undefined);
  };

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
      {lap?.skor != null && <div className="text-[11px] font-bold text-slate-700">Skor: {lap.skor.toFixed(2)}</div>}
      {canUpload && (
        <div className="pt-1 space-y-2">
          {slot.butuhSkor && (
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
          )}
          <UploadDropzone onFiles={handleFiles} maxSizeMB={25} hint="PDF/Word/Excel · maks 25 MB" />
        </div>
      )}
    </Card>
  );
};
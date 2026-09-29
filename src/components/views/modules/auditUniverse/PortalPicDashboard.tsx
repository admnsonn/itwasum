/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Portal Data Satker untuk PIC — Dashboard Pengumpulan Data + Library, mengikuti
 * `29092026/portal-data-satker.html`. Data permintaan, katalog, dan berkas memakai
 * store Audit Universe yang sama dengan layar B.12 lain.
 */
import React, { useEffect, useMemo, useState } from 'react';
import { BookOpen, Check, Clock, Eye, FileText, History, Inbox, Send, Trash2, Upload, Wrench } from 'lucide-react';
import type { CurrentUserProfile } from '../../../../types';
import {
  BERKAS_STATUS_LABEL,
  KATEGORI_DOKUMEN,
  MANDIRI_REQ_ID,
  daysDiffFromToday,
  formatBytes,
  formatIsoDate,
  getBerkas,
  getDokById,
  getItwilOf,
  getOrgById,
  getJpById,
  getPermintaanById,
  isSelesai,
  markSelesai,
  removeDraftBerkas,
  reqStatusTurunan,
  resubmitBerkas,
  sendPortalBerkas,
  undoSelesai,
  uploadPortalBerkas,
  useAuditUniverseStore,
  validateBerkasAgainstAturan,
  type BerkasSatker,
  type BerkasStatus,
  type KatalogDokumen,
  type Permintaan,
} from '../../../../data/auditUniverse';
import { displayNameForLog } from '../../../../data/auditUniverse/roleMapping';
import { Badge, Button, Card, Checkbox, EmptyState, Modal, Search, Select, Table, UploadDropzone, type BadgeColor, type TableColumn } from '../../../ui';

const FORMAT_OK = ['pdf', 'doc', 'docx', 'xls', 'xlsx', 'jpg', 'jpeg', 'png', 'zip'];
const MAX_MB = 25;
const KAT_COL: Record<string, string> = {
  PK: '#2a78d6', AK: '#1baf7a', PBJ: '#eb6834', BMN: '#4a3aa7', SDM: '#e87ba4',
  OPS: '#008300', RSK: '#e34948', AUD: '#1F3864', LGL: '#eda100', SE: '#54728F',
};
const STATUS_COLOR: Record<BerkasStatus | 'none', BadgeColor> = {
  none: 'neutral', draft: 'neutral', wait: 'info', ok: 'success', fix: 'warning',
};
const STATUS_LABEL: Record<BerkasStatus | 'none', string> = {
  none: 'Belum Ada', ...BERKAS_STATUS_LABEL,
};

type OrgFile = { reqId: string; file: BerkasSatker };
type Urgency = { k: 'late' | 'hot' | 'warn' | 'ok' | 'soon' | 'done'; lab: string; rank: number; color: string };

function greet(): string {
  const h = new Date().getHours();
  if (h < 11) return 'Selamat pagi';
  if (h < 15) return 'Selamat siang';
  if (h < 18) return 'Selamat sore';
  return 'Selamat malam';
}

function fileYear(file: BerkasSatker, req?: Permintaan): string {
  if (file.tahunData) return file.tahunData;
  if (req?.tahunAnggaran) return req.tahunAnggaran;
  if (file.tgl) return file.tgl.slice(0, 4);
  return String(new Date().getFullYear());
}

function urgency(r: Permintaan, orgId: string): Urgency {
  const rs = reqStatusTurunan(r);
  const left = daysDiffFromToday(r.selesai);
  if (isSelesai(r.id, orgId)) return { k: 'done', lab: 'Selesai', rank: 5, color: '#0ca30c' };
  if (rs === 'Ditutup') return { k: 'done', lab: 'Ditutup', rank: 6, color: '#9AA6B2' };
  if (rs === 'Dijadwalkan') return { k: 'soon', lab: 'Dijadwalkan', rank: 4, color: '#9AA6B2' };
  if (left < 0) return { k: 'late', lab: 'Terlambat', rank: 0, color: '#d03b3b' };
  if (left <= 3) return { k: 'hot', lab: 'Mendesak', rank: 1, color: '#d03b3b' };
  if (left <= 7) return { k: 'warn', lab: 'Segera', rank: 2, color: '#eda100' };
  return { k: 'ok', lab: 'Normal', rank: 3, color: '#2a78d6' };
}

function stageOf(r: Permintaan, files: BerkasSatker[]): { label: string; pct: number; color: BadgeColor } {
  const sent = files.some((f) => f.status !== 'draft');
  const late = reqStatusTurunan(r) !== 'Ditutup' && daysDiffFromToday(r.selesai) < 0;
  if (files.some((f) => f.status === 'fix')) return { label: 'Perlu Perbaikan', pct: 67, color: 'warning' };
  if (late) return { label: 'Terlambat', pct: sent ? 67 : files.length ? 33 : 0, color: 'danger' };
  if (sent) return { label: 'Sudah Mengirim', pct: 67, color: 'violet' };
  if (files.length) return { label: 'Sedang Mengunggah', pct: 33, color: 'info' };
  return { label: 'Belum Mulai', pct: 0, color: 'neutral' };
}

function stageFor(r: Permintaan, orgId: string, files: BerkasSatker[]) {
  if (isSelesai(r.id, orgId)) return { label: 'Selesai', pct: 100, color: 'success' as BadgeColor };
  return stageOf(r, files);
}

function countdown(iso: string, now: number): string {
  const end = new Date(`${iso}T23:59:59`).getTime();
  const lateDays = daysDiffFromToday(iso);
  if (end < now) return `Lewat ${-lateDays} hari`;
  const s = Math.max(0, Math.floor((end - now) / 1000));
  const d = Math.floor(s / 86400);
  const h = Math.floor((s % 86400) / 3600);
  const m = Math.floor((s % 3600) / 60);
  return `${d}h ${String(h).padStart(2, '0')}j ${String(m).padStart(2, '0')}m`;
}

function useNow(): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const id = window.setInterval(() => setNow(Date.now()), 1000);
    return () => window.clearInterval(id);
  }, []);
  return now;
}

function Bar({ parts }: { parts: [number, string][] }) {
  const total = parts.reduce((s, [n]) => s + n, 0) || 1;
  return (
    <div className="flex h-2 overflow-hidden rounded-full bg-slate-100">
      {parts.filter(([n]) => n > 0).map(([n, color], i) => (
        <i key={i} className="block h-full" style={{ width: `${(n / total) * 100}%`, background: color }} />
      ))}
    </div>
  );
}

export const PortalPicDashboard: React.FC<{
  orgId: string;
  currentUser: CurrentUserProfile;
  page: 'dash' | 'library';
  onOpenLibrary: (reqId?: string) => void;
  libraryReqId?: string;
}> = ({ orgId, currentUser, page, onOpenLibrary, libraryReqId }) => {
  const state = useAuditUniverseStore();
  const oleh = displayNameForLog(currentUser);
  const org = getOrgById(orgId);
  const now = useNow();
  const yearNow = new Date().getFullYear();
  const [ta, setTa] = useState(String(yearNow));
  const [toast, setToast] = useState<string | null>(null);
  const [upload, setUpload] = useState<UploadTarget | null>(null);
  const [hist, setHist] = useState<OrgFile | null>(null);
  const [fix, setFix] = useState<OrgFile | null>(null);
  const notify = (msg: string) => { setToast(msg); window.setTimeout(() => setToast(null), 3200); };

  const orgFiles = useMemo(() => {
    const out: OrgFile[] = [];
    Object.entries(state.berkas).forEach(([reqId, byOrg]) => {
      (byOrg[orgId] ?? []).forEach((file) => out.push({ reqId, file }));
    });
    return out;
  }, [state.berkas, orgId]);

  const yearOf = (row: OrgFile) => fileYear(row.file, getPermintaanById(row.reqId));
  const filesInYear = orgFiles.filter((row) => yearOf(row) === ta);
  const myReqs = state.permintaan.filter((r) => r.sasaran.includes(orgId) && r.status !== 'Draft');

  if (!org) return null;

  return (
    <div className="space-y-4">
      {toast && <div className="p-2.5 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">{toast}</div>}
      {page === 'dash' ? (
        <DashBody
          orgId={orgId}
          orgSing={org.sing}
          jenjang={org.jenjang}
          itwil={getItwilOf(org)}
          ta={ta}
          setTa={setTa}
          yearNow={yearNow}
          now={now}
          myReqs={myReqs}
          orgFiles={orgFiles}
          filesInYear={filesInYear}
          yearOf={yearOf}
          katalog={state.katalog.filter((d) => d.aktif)}
          oleh={oleh}
          notify={notify}
          onOpenLibrary={onOpenLibrary}
          onUpload={setUpload}
          onHist={setHist}
          onFix={setFix}
        />
      ) : (
        <LibraryBody
          orgSing={org.sing}
          orgFiles={orgFiles}
          myReqs={myReqs}
          katalog={state.katalog}
          initialReqId={libraryReqId}
          onHist={setHist}
          notify={notify}
        />
      )}
      {upload && (
        <UploadModal
          target={upload}
          orgId={orgId}
          oleh={oleh}
          katalog={state.katalog.filter((d) => d.aktif)}
          myReqs={myReqs.filter((r) => reqStatusTurunan(r) === 'Berjalan' && !isSelesai(r.id, orgId))}
          orgFiles={orgFiles}
          defaultTa={ta}
          onClose={() => setUpload(null)}
          notify={notify}
        />
      )}
      {hist && <HistModal row={hist} onClose={() => setHist(null)} notify={notify} />}
      {fix && <FixModal row={fix} orgId={orgId} oleh={oleh} onClose={() => setFix(null)} notify={notify} />}
    </div>
  );
};

type UploadTarget = { reqId?: string | null; dokId?: string; file?: OrgFile };

function DashBody(props: {
  orgId: string;
  orgSing: string;
  jenjang: string;
  itwil: string;
  ta: string;
  setTa: (y: string) => void;
  yearNow: number;
  now: number;
  myReqs: Permintaan[];
  orgFiles: OrgFile[];
  filesInYear: OrgFile[];
  yearOf: (row: OrgFile) => string;
  katalog: KatalogDokumen[];
  oleh: string;
  notify: (m: string) => void;
  onOpenLibrary: (reqId?: string) => void;
  onUpload: (t: UploadTarget) => void;
  onHist: (row: OrgFile) => void;
  onFix: (row: OrgFile) => void;
}) {
  const { orgId, orgSing, jenjang, itwil, ta, setTa, yearNow, now, myReqs, orgFiles, filesInYear, katalog, oleh, notify, onOpenLibrary, onUpload, onHist, onFix } = props;
  const [sifat, setSifat] = useState('');
  const [stFilter, setStFilter] = useState('');
  const [catQ, setCatQ] = useState<Record<string, string>>({});

  const aktif = myReqs.filter((r) => r.status !== 'Ditutup');
  const ranked = aktif
    .map((r) => ({ r, u: urgency(r, orgId), fix: getBerkas(r.id, orgId).filter((f) => f.status === 'fix').length }))
    .sort((a, b) => a.u.rank - b.u.rank || b.fix - a.fix || a.r.selesai.localeCompare(b.r.selesai));
  const top = ranked.find((x) => x.u.k !== 'done' && x.u.k !== 'soon');
  const doneN = ranked.filter((x) => x.u.k === 'done').length;
  const wajib = katalog.filter((d) => d.sifat === 'Wajib');
  const docFiles = (dokId: string) => filesInYear.filter((row) => row.file.dokId === dokId);
  const docSt = (dokId: string): BerkasStatus | 'none' => {
    const fs = docFiles(dokId).map((r) => r.file);
    if (!fs.length) return 'none';
    if (fs.some((f) => f.status === 'fix')) return 'fix';
    if (fs.some((f) => f.status === 'draft')) return 'draft';
    if (fs.some((f) => f.status === 'wait')) return 'wait';
    return 'ok';
  };
  const wOk = wajib.filter((d) => docFiles(d.id).some((r) => r.file.status === 'ok')).length;
  const wSent = wajib.filter((d) => {
    const fs = docFiles(d.id).map((r) => r.file);
    return !fs.some((f) => f.status === 'ok') && fs.some((f) => f.status === 'wait');
  }).length;
  const jenisAda = katalog.filter((d) => docFiles(d.id).some((r) => r.file.status !== 'draft')).length;
  const nOk = filesInYear.filter((r) => r.file.status === 'ok').length;
  const nWait = filesInYear.filter((r) => r.file.status === 'wait').length;
  const nFix = filesInYear.filter((r) => r.file.status === 'fix').length;
  const nDraft = filesInYear.filter((r) => r.file.status === 'draft').length;
  const pct = (a: number, b: number) => (b ? Math.round((a / b) * 100) : 0);
  const years = [yearNow + 1, yearNow, yearNow - 1, yearNow - 2].map(String);

  const sendIds = (reqId: string | null, ids: string[]) => {
    const n = sendPortalBerkas(orgId, reqId, ids, oleh);
    if (n) notify(`${n} berkas terkirim ke Itwasum`);
  };

  return (
    <>
      <div className="rounded-[14px] p-5 text-white flex flex-wrap gap-4" style={{ background: 'linear-gradient(120deg, #16294A, #1F3864 55%, #27477A)' }}>
        <div className="flex-1 min-w-[240px]">
          <div className="text-xs font-semibold text-blue-200">{greet()}, PIC {orgSing}</div>
          <h2 className="text-xl font-extrabold mt-1">Dashboard Pengumpulan Data</h2>
          <p className="text-xs text-blue-100/80 mt-1">{jenjang}{itwil ? ` · diawasi ${itwil}` : ''}</p>
          <div className="mt-3 flex items-center gap-2 text-xs text-blue-100">
            <span>Tahun Data</span>
            <select value={ta} onChange={(e) => setTa(e.target.value)} className="h-8 rounded-lg bg-white/10 border border-white/25 px-2 text-white text-xs">
              {years.map((y) => <option key={y} value={y} className="text-slate-900">{y}</option>)}
            </select>
          </div>
        </div>
        {top ? (
          <button type="button" onClick={() => document.getElementById(`rq-${top.r.id}`)?.scrollIntoView({ behavior: 'smooth', block: 'center' })} className="text-left rounded-xl border border-white/20 bg-white/10 p-3.5 w-full sm:w-80">
            <div className="text-[10px] font-extrabold tracking-wide uppercase text-blue-100">Prioritas #1 · {top.u.lab}</div>
            <div className="font-bold text-sm mt-1 leading-snug">{top.r.judul}</div>
            <div className="text-lg font-extrabold mt-2 tabular-nums">{countdown(top.r.selesai, now)}</div>
            <div className="text-[11px] text-blue-100 mt-1">Tenggat {formatIsoDate(top.r.selesai)} · progres {stageFor(top.r, orgId, getBerkas(top.r.id, orgId)).pct}%</div>
          </button>
        ) : (
          <div className="rounded-xl border border-white/20 bg-white/10 p-3.5 w-full sm:w-80">
            <div className="text-[10px] font-extrabold tracking-wide uppercase text-blue-100">Prioritas</div>
            <div className="font-bold text-sm mt-1">Tidak ada permintaan berjalan</div>
          </div>
        )}
      </div>

      <div className="grid grid-cols-2 xl:grid-cols-4 gap-3">
        <Card className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><Inbox className="w-3.5 h-3.5" />Permintaan Itwasum</div>
          <div className="text-2xl font-extrabold text-slate-900">{ranked.filter((x) => x.u.k !== 'done').length}<span className="text-sm font-semibold text-slate-400"> aktif</span></div>
          <Bar parts={[[pct(doneN, ranked.length), '#0ca30c']]} />
          <div className="text-[11px] text-slate-500">{doneN} dari {ranked.length} sudah ditandai selesai</div>
        </Card>
        <Card className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><Check className="w-3.5 h-3.5" />Dokumen Wajib Terpenuhi</div>
          <div className="text-2xl font-extrabold text-slate-900">{wOk}<span className="text-sm font-semibold text-slate-400"> / {wajib.length}</span></div>
          <Bar parts={[[pct(wOk, wajib.length), '#0ca30c'], [pct(wSent, wajib.length), '#6da7ec']]} />
          <div className="text-[11px] text-slate-500">Diterima {pct(wOk, wajib.length)}% · menunggu {wSent}</div>
        </Card>
        <Card className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><BookOpen className="w-3.5 h-3.5" />Jenis Dokumen Terkirim</div>
          <div className="text-2xl font-extrabold text-slate-900">{jenisAda}<span className="text-sm font-semibold text-slate-400"> / {katalog.length}</span></div>
          <Bar parts={[[pct(jenisAda, katalog.length), '#2a78d6']]} />
          <div className="text-[11px] text-slate-500">dari daftar Master Data 4.4</div>
        </Card>
        <Card className="space-y-1.5">
          <div className="text-[11px] font-bold text-slate-500 flex items-center gap-1.5"><Clock className="w-3.5 h-3.5" />Status Verifikasi {ta}</div>
          <div className="text-2xl font-extrabold text-slate-900">{filesInYear.length}<span className="text-sm font-semibold text-slate-400"> berkas</span></div>
          <Bar parts={[[nOk, '#0ca30c'], [nWait, '#6da7ec'], [nFix, '#ec835a'], [nDraft, '#c3c2b7']]} />
          <div className="text-[11px] text-slate-500">{nOk} diterima · {nWait} menunggu · {nFix} perbaikan · {nDraft} draft</div>
        </Card>
      </div>

      <div className="grid lg:grid-cols-[minmax(0,1fr)_340px] gap-4 items-start">
        <div className="space-y-3">
          <div>
            <h3 className="text-sm font-extrabold text-[var(--sd-primary)]">Permintaan dari Itwasum</h3>
            <p className="text-[11px] text-slate-400">Diurutkan dari yang paling mendesak</p>
          </div>
          {ranked.length === 0 ? (
            <EmptyState title="Tidak ada permintaan aktif" description="Permintaan baru dari Itwasum akan muncul di sini." />
          ) : ranked.map((x, i) => {
            const files = getBerkas(x.r.id, orgId);
            const st = stageFor(x.r, orgId, files);
            const rs = reqStatusTurunan(x.r);
            const sent = files.filter((f) => f.status !== 'draft');
            const todo = files.filter((f) => f.status === 'fix' || f.status === 'draft').sort((a, b) => (a.status === 'fix' ? 0 : 1) - (b.status === 'fix' ? 0 : 1));
            const nFix = files.filter((f) => f.status === 'fix').length;
            const nDr = files.filter((f) => f.status === 'draft').length;
            const canUp = rs === 'Berjalan' && !isSelesai(x.r.id, orgId);
            const canDone = canUp && sent.length > 0 && !nFix && !nDr;
            return (
              <Card key={x.r.id} id={`rq-${x.r.id}`} className="space-y-2.5" style={{ borderLeftWidth: 4, borderLeftColor: x.u.color }}>
                <div className="flex flex-wrap items-center gap-2 text-[11px]">
                  <span className="font-extrabold text-white rounded px-1.5 py-0.5" style={{ background: x.u.color }}>#{i + 1}</span>
                  <span className="font-extrabold uppercase tracking-wide" style={{ color: x.u.color }}>{x.u.lab}</span>
                  <span className="font-mono text-slate-400">{x.r.id}</span>
                  <Badge color={st.color}>{st.label}</Badge>
                  <span className="ml-auto font-bold text-slate-600 inline-flex items-center gap-1"><Clock className="w-3 h-3" />{rs === 'Dijadwalkan' ? `Dibuka ${formatIsoDate(x.r.mulai)}` : isSelesai(x.r.id, orgId) ? 'Selesai' : countdown(x.r.selesai, now)}</span>
                </div>
                <h4 className="text-sm font-extrabold text-slate-900">{x.r.judul}</h4>
                <p className="text-[11px] text-slate-500">{getJpById(x.r.jpId)?.nama ?? x.r.jpId} · Data tahun {x.r.tahunAnggaran} · unggah {formatIsoDate(x.r.mulai)} – {formatIsoDate(x.r.selesai)}</p>
                {x.r.pesan && <p className="text-xs text-slate-600 bg-blue-50 rounded-lg p-2.5">{x.r.pesan}</p>}
                <div>
                  <div className="flex justify-between text-[11px] text-slate-500 mb-1"><span>Progres pengiriman</span><b>{st.pct}%</b></div>
                  <Bar parts={[[st.pct, st.pct === 100 ? '#0ca30c' : '#2a78d6']]} />
                  <div className="text-[11px] text-slate-400 mt-1">{sent.length} terkirim · {sent.filter((f) => f.status === 'ok').length} diterima</div>
                </div>
                {todo.length > 0 && (
                  <div className="rounded-lg border border-slate-100 overflow-hidden">
                    <div className="flex items-center justify-between px-3 py-2 bg-slate-50 text-[11px] font-extrabold uppercase tracking-wide text-slate-500">
                      Perlu Anda kerjakan ({todo.length})
                      {nDr > 1 && <Button size="sm" onClick={() => sendIds(x.r.id, todo.filter((f) => f.status === 'draft').map((f) => f.id))}><Send className="w-3 h-3" />Kirim {nDr} draft</Button>}
                    </div>
                    {todo.map((f) => (
                      <FileTodo key={f.id} row={{ reqId: x.r.id, file: f }} onHist={onHist} onFix={onFix} onUpload={onUpload} onSend={() => sendIds(x.r.id, [f.id])} onDelete={() => { removeDraftBerkas(x.r.id, orgId, f.id); notify('Berkas dihapus'); }} />
                    ))}
                  </div>
                )}
                <div className="flex flex-wrap gap-2 pt-1">
                  {canUp && <Button size="sm" onClick={() => onUpload({ reqId: x.r.id })}><Upload className="w-3.5 h-3.5" />Unggah untuk permintaan ini</Button>}
                  {canUp && <Button size="sm" variant={canDone ? 'primary' : 'outline'} disabled={!canDone} onClick={() => { markSelesai(x.r.id, orgId, oleh); notify('Pengiriman ditandai selesai'); }}>Tandai Selesai</Button>}
                  {isSelesai(x.r.id, orgId) && rs !== 'Ditutup' && <Button size="sm" variant="outline" onClick={() => { undoSelesai(x.r.id, orgId); notify('Tanda selesai dibatalkan'); }}>Batalkan tanda selesai</Button>}
                  {files.length > 0 && <button type="button" className="text-xs font-bold text-[var(--sd-primary)] hover:underline" onClick={() => onOpenLibrary(x.r.id)}>Lihat {files.length} berkas di Library</button>}
                </div>
              </Card>
            );
          })}
        </div>
        <MandiriCard orgId={orgId} ta={ta} filesInYear={filesInYear} wajib={wajib} docSt={docSt} oleh={oleh} notify={notify} onUpload={onUpload} onHist={onHist} onFix={onFix} sendIds={sendIds} />
      </div>

      <div className="flex flex-wrap items-end justify-between gap-2">
        <div>
          <h3 className="text-sm font-extrabold text-[var(--sd-primary)]">Dokumen Master Data 4.4</h3>
          <p className="text-[11px] text-slate-400">{katalog.length} jenis dokumen · {wajib.length} wajib · Tahun Data {ta}</p>
        </div>
        <div className="flex gap-2">
          <Select options={[{ value: 'w', label: 'Wajib' }, { value: 'o', label: 'Opsional' }]} value={sifat} onChange={setSifat} placeholder="Semua Sifat" className="w-36" />
          <Select options={(['none', 'draft', 'wait', 'ok', 'fix'] as const).map((k) => ({ value: k, label: STATUS_LABEL[k] }))} value={stFilter} onChange={setStFilter} placeholder="Semua Status" className="w-44" />
        </div>
      </div>
      <div className="grid xl:grid-cols-2 gap-3">
        {KATEGORI_DOKUMEN.map(([kode, nama]) => {
          const all = katalog.filter((d) => d.kat === kode);
          if (!all.length) return null;
          const q = (catQ[kode] ?? '').toLowerCase();
          const vis = all.filter((d) => {
            if (sifat === 'w' && d.sifat !== 'Wajib') return false;
            if (sifat === 'o' && d.sifat === 'Wajib') return false;
            if (stFilter && docSt(d.id) !== stFilter) return false;
            if (q && !`${d.id} ${d.nama}`.toLowerCase().includes(q)) return false;
            return true;
          });
          const ada = all.filter((d) => docSt(d.id) !== 'none').length;
          return (
            <Card key={kode} className="p-0 overflow-hidden">
              <div className="flex items-center gap-2 px-3 py-2.5 border-b border-slate-100">
                <span className="w-8 h-8 rounded-full text-white text-[10px] font-extrabold grid place-items-center" style={{ background: KAT_COL[kode] ?? '#54728F' }}>{kode}</span>
                <div className="min-w-0 flex-1">
                  <div className="text-sm font-bold text-slate-900 truncate">{nama}</div>
                  <div className="text-[11px] text-slate-400">{all.length} dokumen · {ada} ada berkas</div>
                </div>
                <span className="text-[11px] font-extrabold" style={{ color: KAT_COL[kode] }}>{pct(ada, all.length)}%</span>
              </div>
              <div className="px-3 py-2 border-b border-slate-50">
                <Search value={catQ[kode] ?? ''} onChange={(v) => setCatQ((prev) => ({ ...prev, [kode]: v }))} placeholder={`Cari ${nama}...`} />
              </div>
              <ul className="max-h-80 overflow-auto divide-y divide-slate-50">
                {vis.length === 0 ? <li className="p-4 text-xs text-slate-400 text-center">Dokumen tidak ditemukan</li> : vis.map((d) => {
                  const st = docSt(d.id);
                  const fs = docFiles(d.id);
                  return (
                    <li key={d.id} className="px-3 py-2">
                      <div className="flex items-start gap-2">
                        <button type="button" className="text-left text-xs font-bold text-slate-800 hover:underline flex-1" onClick={() => onUpload({ dokId: d.id })}>{d.nama}</button>
                        <Badge color={STATUS_COLOR[st]}>{STATUS_LABEL[st]}</Badge>
                        <button type="button" className="text-[11px] font-bold text-[var(--sd-primary)]" onClick={() => onUpload({ dokId: d.id })}>Unggah</button>
                      </div>
                      <div className="text-[10px] font-mono text-slate-400 mt-0.5">{d.id}{d.sifat === 'Wajib' ? ' · Wajib' : ''}</div>
                      {fs.length > 0 && (
                        <ul className="mt-1 space-y-0.5">
                          {fs.map((row) => (
                            <li key={row.file.id} className="flex items-center gap-2 text-[11px]">
                              <button type="button" className="truncate text-left hover:underline flex-1" onClick={() => onHist(row)}>{row.file.nama}</button>
                              <Badge color={STATUS_COLOR[row.file.status]}>{STATUS_LABEL[row.file.status]}</Badge>
                            </li>
                          ))}
                        </ul>
                      )}
                    </li>
                  );
                })}
              </ul>
            </Card>
          );
        })}
      </div>
    </>
  );
}

function MandiriCard(props: {
  orgId: string;
  ta: string;
  filesInYear: OrgFile[];
  wajib: KatalogDokumen[];
  docSt: (id: string) => BerkasStatus | 'none';
  oleh: string;
  notify: (m: string) => void;
  onUpload: (t: UploadTarget) => void;
  onHist: (row: OrgFile) => void;
  onFix: (row: OrgFile) => void;
  sendIds: (reqId: string | null, ids: string[]) => void;
}) {
  const mandiri = props.filesInYear.filter((r) => r.reqId === MANDIRI_REQ_ID);
  const todo = mandiri.filter((r) => r.file.status === 'draft' || r.file.status === 'fix');
  const miss = props.wajib.filter((d) => props.docSt(d.id) === 'none');
  const nDr = todo.filter((r) => r.file.status === 'draft').length;
  return (
    <Card className="p-0 overflow-hidden">
      <div className="p-3 border-b border-slate-100 space-y-2">
        <h3 className="text-[11px] font-extrabold uppercase tracking-wide text-slate-500">Unggahan Mandiri</h3>
        <p className="text-[11px] text-slate-400">Dokumen di luar permintaan Itwasum, misalnya untuk melengkapi Master Data.</p>
        <Button className="w-full" onClick={() => props.onUpload({})}><Upload className="w-3.5 h-3.5" />Unggah Dokumen</Button>
      </div>
      {todo.length > 0 && (
        <div>
          <div className="flex items-center justify-between px-3 py-2 bg-slate-50 text-[11px] font-extrabold uppercase text-slate-500">
            Perlu dikerjakan ({todo.length})
            {nDr > 1 && <button type="button" className="text-[var(--sd-primary)] normal-case" onClick={() => props.sendIds(null, todo.filter((r) => r.file.status === 'draft').map((r) => r.file.id))}>Kirim {nDr} draft</button>}
          </div>
          {todo.map((row) => (
            <FileTodo key={row.file.id} row={row} onHist={props.onHist} onFix={props.onFix} onUpload={props.onUpload} onSend={() => props.sendIds(null, [row.file.id])} onDelete={() => { removeDraftBerkas(MANDIRI_REQ_ID, props.orgId, row.file.id); props.notify('Berkas dihapus'); }} />
          ))}
        </div>
      )}
      <div className="px-3 py-2 text-[11px] font-extrabold uppercase text-slate-500 bg-slate-50 border-t border-slate-100">Wajib belum ada · Tahun {props.ta} ({miss.length})</div>
      <ul className="max-h-72 overflow-auto">
        {miss.length === 0 ? <li className="p-3 text-xs text-emerald-700">Semua dokumen wajib tahun {props.ta} sudah ada berkasnya.</li> : miss.map((d) => (
          <li key={d.id}>
            <button type="button" className="w-full text-left px-3 py-2 hover:bg-slate-50" onClick={() => props.onUpload({ dokId: d.id })}>
              <div className="text-xs font-bold text-slate-800">{d.nama}</div>
              <div className="text-[10px] font-mono text-slate-400">{d.id}</div>
            </button>
          </li>
        ))}
      </ul>
    </Card>
  );
}

function FileTodo({ row, onHist, onFix, onUpload, onSend, onDelete }: {
  row: OrgFile;
  onHist: (row: OrgFile) => void;
  onFix: (row: OrgFile) => void;
  onUpload: (t: UploadTarget) => void;
  onSend: () => void;
  onDelete: () => void;
}) {
  const d = getDokById(row.file.dokId);
  const f = row.file;
  return (
    <div className={`flex items-center gap-2 px-3 py-2 border-t border-slate-100 ${f.status === 'fix' ? 'bg-orange-50/60' : ''}`}>
      <div className="min-w-0 flex-1">
        <div className="text-xs font-bold text-slate-800 truncate">{d?.nama ?? f.dokId}</div>
        <div className="text-[11px] text-slate-400 truncate">{f.nama}</div>
        {f.status === 'fix' && f.catatan && <div className="text-[11px] text-orange-700">{f.catatan}</div>}
      </div>
      {f.status === 'draft' && (
        <>
          <Button size="sm" onClick={onSend}><Send className="w-3 h-3" />Kirim</Button>
          <button type="button" title="Ubah" onClick={() => onUpload({ file: row, reqId: row.reqId === MANDIRI_REQ_ID ? null : row.reqId, dokId: f.dokId })} className="text-slate-400 hover:text-slate-700"><FileText className="w-4 h-4" /></button>
          <button type="button" title="Hapus" onClick={onDelete} className="text-slate-400 hover:text-rose-600"><Trash2 className="w-4 h-4" /></button>
        </>
      )}
      {f.status === 'fix' && <Button size="sm" onClick={() => onFix(row)}><Wrench className="w-3 h-3" />Perbaiki</Button>}
      <button type="button" title="Detail" onClick={() => onHist(row)} className="text-slate-400 hover:text-slate-700"><History className="w-4 h-4" /></button>
    </div>
  );
}

function LibraryBody({ orgSing, orgFiles, myReqs, katalog, initialReqId, onHist, notify }: {
  orgSing: string;
  orgFiles: OrgFile[];
  myReqs: Permintaan[];
  katalog: KatalogDokumen[];
  initialReqId?: string;
  onHist: (row: OrgFile) => void;
  notify: (m: string) => void;
}) {
  const [q, setQ] = useState('');
  const [kat, setKat] = useState('');
  const [dokId, setDokId] = useState('');
  const [ta, setTa] = useState('');
  const [st, setSt] = useState('');
  const [req, setReq] = useState(initialReqId ?? '');
  const [sort, setSort] = useState<'baru' | 'lama' | 'nama'>('baru');
  const [page, setPage] = useState(1);
  useEffect(() => { if (initialReqId) setReq(initialReqId); }, [initialReqId]);

  const years = [...new Set(orgFiles.map((r) => fileYear(r.file, getPermintaanById(r.reqId))))].sort().reverse();
  const filtered = orgFiles.filter((row) => {
    const d = getDokById(row.file.dokId);
    const blob = `${row.file.nama} ${d?.id ?? ''} ${d?.nama ?? ''} ${row.file.keterangan}`.toLowerCase();
    if (q && !blob.includes(q.toLowerCase())) return false;
    if (kat && d?.kat !== kat) return false;
    if (dokId && row.file.dokId !== dokId) return false;
    if (ta && fileYear(row.file, getPermintaanById(row.reqId)) !== ta) return false;
    if (st && row.file.status !== st) return false;
    if (req === '-') return row.reqId === MANDIRI_REQ_ID;
    if (req && row.reqId !== req) return false;
    return true;
  });
  const keyOf = (row: OrgFile) => row.file.tgl ?? '';
  const sorted = [...filtered].sort((a, b) => sort === 'nama' ? a.file.nama.localeCompare(b.file.nama) : sort === 'lama' ? keyOf(a).localeCompare(keyOf(b)) : keyOf(b).localeCompare(keyOf(a)));
  const per = 12;
  const pages = Math.max(1, Math.ceil(sorted.length / per));
  const safe = Math.min(page, pages);
  const vis = sorted.slice((safe - 1) * per, safe * per);
  const count = (s: BerkasStatus) => orgFiles.filter((r) => r.file.status === s).length;

  const columns: TableColumn<OrgFile>[] = [
    { key: 'nama', header: 'Berkas', render: (row) => <button type="button" className="text-left font-bold text-slate-800 hover:underline" onClick={() => onHist(row)}>{row.file.nama}<span className="block text-[11px] font-normal text-slate-400">{formatBytes(row.file.sizeBytes)}{row.file.asalBerkasId ? ' · dipakai ulang' : ''}</span></button> },
    { key: 'dok', header: 'Jenis Dokumen', render: (row) => { const d = getDokById(row.file.dokId); return <span>{d?.nama ?? row.file.dokId}<span className="block text-[11px] text-slate-400 font-mono">{d?.id} · {KATEGORI_DOKUMEN.find(([k]) => k === d?.kat)?.[1] ?? ''}</span></span>; } },
    { key: 'data', header: 'Data', render: (row) => <span>Tahun {fileYear(row.file, getPermintaanById(row.reqId))}</span> },
    { key: 'req', header: 'Permintaan', render: (row) => row.reqId === MANDIRI_REQ_ID ? <span className="text-slate-400">Mandiri</span> : <span className="font-mono text-[11px]">{row.reqId}</span> },
    { key: 'st', header: 'Status', render: (row) => <Badge color={STATUS_COLOR[row.file.status]}>{STATUS_LABEL[row.file.status]}</Badge> },
    { key: 'tgl', header: 'Tanggal', render: (row) => formatIsoDate(row.file.tgl) },
    { key: 'aksi', header: 'Aksi', render: (row) => <button type="button" title="Detail" onClick={() => onHist(row)} className="text-slate-400 hover:text-slate-700"><Eye className="w-4 h-4" /></button> },
  ];

  return (
    <div className="space-y-3">
      <div>
        <h2 className="text-lg font-extrabold text-[var(--sd-primary)]">Library</h2>
        <p className="text-xs text-slate-500">Cari dan buka semua berkas yang pernah diunggah {orgSing}.</p>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-2">
        <Card><div className="text-[11px] text-slate-500">Total Berkas</div><div className="text-xl font-extrabold">{orgFiles.length}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Diterima</div><div className="text-xl font-extrabold">{count('ok')}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Menunggu Verifikasi</div><div className="text-xl font-extrabold">{count('wait')}</div></Card>
        <Card><div className="text-[11px] text-slate-500">Perlu Perbaikan</div><div className="text-xl font-extrabold">{count('fix')}</div></Card>
      </div>
      <Card className="space-y-3">
        <div className="flex flex-wrap gap-2">
          <Search value={q} onChange={(v) => { setQ(v); setPage(1); }} placeholder="Cari nama berkas, kode, atau jenis dokumen" className="flex-1 min-w-48" />
          <Select options={KATEGORI_DOKUMEN.map(([k, n]) => ({ value: k, label: n }))} value={kat} onChange={(v) => { setKat(v); setPage(1); }} placeholder="Semua Kategori" className="w-44" />
          <Select options={katalog.map((d) => ({ value: d.id, label: d.nama }))} value={dokId} onChange={(v) => { setDokId(v); setPage(1); }} placeholder="Semua Jenis" className="w-48" />
          <Select options={years.map((y) => ({ value: y, label: y }))} value={ta} onChange={(v) => { setTa(v); setPage(1); }} placeholder="Semua Tahun" className="w-32" />
          <Select options={(['draft', 'wait', 'ok', 'fix'] as const).map((k) => ({ value: k, label: STATUS_LABEL[k] }))} value={st} onChange={(v) => { setSt(v); setPage(1); }} placeholder="Semua Status" className="w-40" />
          <Select options={[{ value: '-', label: 'Unggah mandiri' }, ...myReqs.map((r) => ({ value: r.id, label: r.id }))]} value={req} onChange={(v) => { setReq(v); setPage(1); }} placeholder="Semua Permintaan" className="w-44" />
          <Select options={[{ value: 'baru', label: 'Terbaru' }, { value: 'lama', label: 'Terlama' }, { value: 'nama', label: 'Nama A–Z' }]} value={sort} onChange={(v) => setSort(v as 'baru' | 'lama' | 'nama')} className="w-32" />
        </div>
        {sorted.length === 0 ? <EmptyState title={orgFiles.length ? 'Berkas tidak ditemukan' : 'Belum ada berkas'} /> : (
          <>
            <Table columns={columns} data={vis} rowKey={(r) => r.file.id} />
            <div className="flex items-center justify-between text-[11px] text-slate-500">
              <span>Menampilkan {(safe - 1) * per + 1}–{Math.min(safe * per, sorted.length)} dari {sorted.length} berkas</span>
              <span className="flex gap-1">
                <Button size="sm" variant="outline" disabled={safe <= 1} onClick={() => setPage(safe - 1)}>‹</Button>
                <Button size="sm" variant="outline" disabled={safe >= pages} onClick={() => setPage(safe + 1)}>›</Button>
              </span>
            </div>
          </>
        )}
      </Card>
    </div>
  );
}

function UploadModal({ target, orgId, oleh, katalog, myReqs, orgFiles, defaultTa, onClose, notify }: {
  target: UploadTarget;
  orgId: string;
  oleh: string;
  katalog: KatalogDokumen[];
  myReqs: Permintaan[];
  orgFiles: OrgFile[];
  defaultTa: string;
  onClose: () => void;
  notify: (m: string) => void;
}) {
  const editing = target.file;
  const yearNow = new Date().getFullYear();
  const years = [yearNow + 1, yearNow, yearNow - 1, yearNow - 2].map(String);
  const presetReq = editing ? (editing.reqId === MANDIRI_REQ_ID ? '' : editing.reqId) : (target.reqId ?? '');
  const [dokId, setDokId] = useState(editing?.file.dokId ?? target.dokId ?? '');
  const [dq, setDq] = useState('');
  const [ta, setTa] = useState(editing?.file.tahunData ?? defaultTa);
  const [dari, setDari] = useState(editing?.file.periodeDari ?? `${defaultTa}-01-01`);
  const [sampai, setSampai] = useState(editing?.file.periodeSampai ?? `${defaultTa}-12-31`);
  const [rid, setRid] = useState(presetReq ?? '');
  const [ket, setKet] = useState(editing?.file.keterangan ?? '');
  const [tab, setTab] = useState<'baru' | 'lib'>('baru');
  const [files, setFiles] = useState<File[]>([]);
  const [pick, setPick] = useState<string[]>([]);
  const [okReuse, setOkReuse] = useState(false);
  const [err, setErr] = useState('');
  const dok = getDokById(dokId);
  const cands = orgFiles.filter((r) => r.file.status === 'ok' && (!dokId || r.file.dokId === dokId));

  const save = (send: boolean) => {
    if (!dokId) return setErr('Pilih jenis dokumen.');
    if (!dari.startsWith(ta) || !sampai.startsWith(ta) || sampai < dari) return setErr('Periode harus di dalam tahun data dan tanggal akhir tidak boleh sebelum tanggal awal.');
    if (!editing && tab === 'baru' && !files.length) return setErr('Pilih minimal 1 berkas.');
    if (!editing && tab === 'lib' && (!pick.length || !okReuse)) return setErr('Pilih berkas dari Library dan centang pernyataan masih berlaku.');
    const bad = files.find((f) => {
      const ext = f.name.split('.').pop()?.toLowerCase() ?? '';
      return !FORMAT_OK.includes(ext) || f.size > MAX_MB * 1048576;
    });
    if (bad) return setErr(`${bad.name} ditolak (format atau ukuran).`);
    const aturanFail = files.find((f) => !validateBerkasAgainstAturan(dokId, { nama: f.name, sizeBytes: f.size }).ok);
    if (aturanFail) {
      const reason = validateBerkasAgainstAturan(dokId, { nama: aturanFail.name, sizeBytes: aturanFail.size }).reason;
      return setErr(reason ?? 'Berkas tidak lolos aturan validasi.');
    }
    const bucket = rid || null;
    if (editing) {
      removeDraftBerkas(editing.reqId, orgId, editing.file.id);
    }
    const inputs = tab === 'lib' && !editing
      ? pick.map((id) => {
          const src = orgFiles.find((r) => r.file.id === id)!.file;
          return { nama: src.nama, sizeBytes: src.sizeBytes, dokId, keterangan: ket, tahunData: ta, periodeDari: dari, periodeSampai: sampai, asalBerkasId: src.id };
        })
      : (files.length ? files : [{ name: editing!.file.nama, size: editing!.file.sizeBytes }]).map((f) => ({
          nama: f.name, sizeBytes: f.size, dokId, keterangan: ket, tahunData: ta, periodeDari: dari, periodeSampai: sampai,
        }));
    const ids = uploadPortalBerkas(orgId, bucket, inputs, oleh);
    if (send) sendPortalBerkas(orgId, bucket, ids, oleh);
    notify(send ? `${ids.length} berkas terkirim ke Itwasum` : 'Berkas disimpan sebagai draft');
    onClose();
  };

  return (
    <Modal isOpen onClose={onClose} title={editing ? 'Ubah Berkas' : 'Unggah Dokumen'} widthClassName="max-w-3xl" footer={
      <>
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button variant="secondary" onClick={() => save(false)}>Simpan Draft</Button>
        <Button onClick={() => save(true)}><Send className="w-3.5 h-3.5" />{editing ? 'Simpan & Kirim' : 'Unggah & Kirim'}</Button>
      </>
    }>
      <div className="space-y-3">
        {err && <div className="p-2.5 rounded-lg bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold">{err}</div>}
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Jenis Dokumen</label>
          {dok ? (
            <div className="flex items-start justify-between gap-2 rounded-lg border border-blue-100 bg-blue-50/50 p-2.5">
              <div>
                <span className="font-mono text-[11px] text-slate-400">{dok.id}</span> <b className="text-sm">{dok.nama}</b>
                <Badge color={dok.sifat === 'Wajib' ? 'primary' : 'neutral'} className="ml-2">{dok.sifat}</Badge>
                <p className="text-[11px] text-slate-500 mt-1">{dok.desk}</p>
              </div>
              <Button size="sm" variant="outline" onClick={() => setDokId('')}>Ganti</Button>
            </div>
          ) : (
            <>
              <Search value={dq} onChange={setDq} placeholder="Ketik kode atau nama dokumen, contoh: LRA, DSP, Renstra" />
              <ul className="mt-1 max-h-40 overflow-auto border border-slate-100 rounded-lg">
                {katalog.filter((d) => !dq || `${d.id} ${d.nama}`.toLowerCase().includes(dq.toLowerCase())).slice(0, 30).map((d) => (
                  <li key={d.id}><button type="button" className="w-full text-left px-2.5 py-1.5 text-xs hover:bg-slate-50" onClick={() => setDokId(d.id)}><span className="font-mono text-slate-400">{d.id}</span> {d.nama}</button></li>
                ))}
              </ul>
            </>
          )}
        </div>
        <div className="grid sm:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Tahun Data</label>
            <Select options={years.map((y) => ({ value: y, label: y }))} value={ta} onChange={(v) => { setTa(v); setDari(`${v}-01-01`); setSampai(`${v}-12-31`); }} />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Periode – Dari</label>
            <input type="date" value={dari} min={`${ta}-01-01`} max={`${ta}-12-31`} onChange={(e) => setDari(e.target.value)} className="w-full h-10 rounded-[10px] border border-slate-200 px-2 text-sm" />
          </div>
          <div>
            <label className="block text-xs font-bold text-slate-600 mb-1.5">Periode – Sampai</label>
            <input type="date" value={sampai} min={dari || `${ta}-01-01`} max={`${ta}-12-31`} onChange={(e) => setSampai(e.target.value)} className="w-full h-10 rounded-[10px] border border-slate-200 px-2 text-sm" />
          </div>
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Untuk Permintaan Itwasum</label>
          <Select options={myReqs.map((r) => ({ value: r.id, label: `${r.id} · ${r.judul}` }))} value={rid} onChange={setRid} placeholder="Tidak terkait permintaan (unggah mandiri)" />
        </div>
        <div>
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Keterangan</label>
          <input value={ket} maxLength={200} onChange={(e) => setKet(e.target.value)} placeholder="Opsional" className="w-full h-10 rounded-[10px] border border-slate-200 px-3 text-sm" />
        </div>
        {!editing && (
          <div className="flex gap-2">
            <Button size="sm" variant={tab === 'baru' ? 'primary' : 'outline'} onClick={() => setTab('baru')}>Unggah berkas baru</Button>
            <Button size="sm" variant={tab === 'lib' ? 'primary' : 'outline'} onClick={() => setTab('lib')}>Pakai dari Library</Button>
          </div>
        )}
        {(editing || tab === 'baru') && (
          <UploadDropzone multiple={!editing} maxSizeMB={MAX_MB} accept=".pdf,.doc,.docx,.xls,.xlsx,.jpg,.jpeg,.png,.zip" hint={`PDF, Word, Excel, JPG/PNG, atau ZIP · maks ${MAX_MB} MB`} onFiles={(fl) => setFiles(editing ? fl.slice(0, 1) : fl)} />
        )}
        {files.length > 0 && <ul className="text-xs space-y-1">{files.map((f) => <li key={f.name} className="flex justify-between"><span>{f.name}</span><span className="text-slate-400">{formatBytes(f.size)}</span></li>)}</ul>}
        {!editing && tab === 'lib' && (
          <div className="space-y-2 max-h-48 overflow-auto">
            {cands.length === 0 ? <p className="text-xs text-slate-400">Belum ada berkas diterima untuk jenis ini.</p> : cands.map((row) => (
              <label key={row.file.id} className="flex items-center gap-2 text-xs border border-slate-100 rounded-lg p-2">
                <Checkbox checked={pick.includes(row.file.id)} onChange={() => setPick((prev) => prev.includes(row.file.id) ? prev.filter((id) => id !== row.file.id) : [...prev, row.file.id])} />
                <span className="font-bold">{row.file.nama}</span>
                <span className="text-slate-400">Tahun {fileYear(row.file, getPermintaanById(row.reqId))}</span>
              </label>
            ))}
            <label className="flex items-start gap-2 text-xs"><Checkbox checked={okReuse} onChange={setOkReuse} /><span>Saya menyatakan berkas yang dipilih masih berlaku dan sesuai untuk data yang diunggah ini.</span></label>
          </div>
        )}
      </div>
    </Modal>
  );
}

function HistModal({ row, onClose, notify }: { row: OrgFile; onClose: () => void; notify: (m: string) => void }) {
  const d = getDokById(row.file.dokId);
  const r = row.reqId === MANDIRI_REQ_ID ? undefined : getPermintaanById(row.reqId);
  const versions = [{ ...row.file, cur: true }, ...(row.file.versi ?? []).slice().reverse().map((v) => ({ ...row.file, ...v, cur: false }))];
  return (
    <Modal isOpen onClose={onClose} title="Detail Berkas" widthClassName="max-w-2xl" footer={<Button onClick={onClose}>Tutup</Button>}>
      <div className="grid sm:grid-cols-3 gap-3 text-xs mb-3">
        <div><div className="text-slate-400">Jenis Dokumen</div><div className="font-bold">{d?.nama ?? row.file.dokId}</div></div>
        <div><div className="text-slate-400">Data</div><div className="font-bold">Tahun {fileYear(row.file, r)}</div></div>
        <div><div className="text-slate-400">Permintaan</div><div className="font-bold">{r ? r.id : 'Unggah mandiri'}</div></div>
      </div>
      <button type="button" className="text-xs font-bold text-[var(--sd-primary)] mb-3" onClick={() => notify(`Pratinjau ${row.file.nama} (simulasi)`)}>Pratinjau berkas</button>
      <ol className="space-y-2 border-l-2 border-slate-200 ml-1 pl-3">
        {versions.map((v, i) => (
          <li key={i} className="text-xs">
            <div className="font-bold">Versi {versions.length - i} · {v.nama}</div>
            <div className="text-slate-400">{formatBytes(v.sizeBytes)} · {formatIsoDate(v.tgl)} · {STATUS_LABEL[v.status]}</div>
            {v.catatan && <div className="text-orange-700 mt-0.5">{v.catatan}</div>}
          </li>
        ))}
      </ol>
    </Modal>
  );
}

function FixModal({ row, orgId, oleh, onClose, notify }: { row: OrgFile; orgId: string; oleh: string; onClose: () => void; notify: (m: string) => void }) {
  const [file, setFile] = useState<File | null>(null);
  const [ket, setKet] = useState('');
  const bucket = row.reqId === MANDIRI_REQ_ID ? MANDIRI_REQ_ID : row.reqId;
  return (
    <Modal isOpen onClose={onClose} title="Perbaiki Berkas" footer={
      <>
        <Button variant="outline" onClick={onClose}>Batal</Button>
        <Button disabled={!file} onClick={() => { if (!file) return; resubmitBerkas(bucket, orgId, row.file.id, { nama: file.name, sizeBytes: file.size }, ket, oleh); notify('Perbaikan terkirim'); onClose(); }}><Send className="w-3.5 h-3.5" />Kirim Perbaikan</Button>
      </>
    }>
      <div className="space-y-3 text-xs">
        <div className="font-bold">{row.file.nama}</div>
        {row.file.catatan && <div className="p-2.5 rounded-lg bg-amber-50 border border-amber-200 text-amber-900"><b>Catatan Verifikator.</b> {row.file.catatan}</div>}
        <UploadDropzone maxSizeMB={MAX_MB} onFiles={(fl) => setFile(fl[0] ?? null)} hint="Satu berkas pengganti" />
        {file && <div className="font-bold">{file.name} · {formatBytes(file.size)}</div>}
        <input value={ket} onChange={(e) => setKet(e.target.value)} placeholder="Keterangan perbaikan" className="w-full h-10 rounded-[10px] border border-slate-200 px-3 text-sm" />
      </div>
    </Modal>
  );
}

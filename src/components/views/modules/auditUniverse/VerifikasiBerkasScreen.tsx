/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 7.1 Antrean Verifikasi Berkas — mereplikasi peran Verifikator Itwil pada
 * `27092026/.extracted/portal-data-satker.html` (Plan "Migrate 27092026 prototypes", todo
 * `b12-verifikasi`). Menampilkan seluruh berkas permintaan & laporan berkala berstatus
 * "Menunggu Verifikasi" lintas Satker, dengan aksi Terima / Minta Perbaikan.
 */
import React, { useState } from 'react';
import { CheckCircle2, ClipboardCheck, History, Lock, RotateCcw, Unlock, Wrench } from 'lucide-react';
import type { CurrentUserProfile } from '../../../../types';
import {
  useAuditUniverseStore,
  verifikasiQueue,
  getOrgById,
  getBerkas,
  verifyBerkas,
  verifyLaporan,
  formatIsoDate,
  getClaim,
  claimQueueItem,
  releaseClaim,
  annulBerkasKeputusan,
  annulLaporanKeputusan,
  type VerifikasiQueueItem,
  type LaporanEntry,
} from '../../../../data/auditUniverse';
import { IND_IKU_DEFS } from '../../../../data/auditUniverse/seeds/laporan';
import { canVerifyBerkas, displayNameForLog } from '../../../../data/auditUniverse/roleMapping';
import { Badge, Button, Card, Checkbox, EmptyState, ForbiddenState, Modal, SegmentedControl, Table, Textarea, type TableColumn } from '../../../ui';
import { RiwayatVersiModal } from './PortalSatkerScreen';

interface VerifikasiBerkasScreenProps {
  currentUser: CurrentUserProfile;
}

/** F7 — checklist 3 lapis yang wajib dicek sebelum keputusan "Terima" diambil (BR "a 3-layer
 * checklist"). Bukan disimpan permanen — hanya gate UI sebelum aksi dikirim. */
const CHECKLIST_ITEMS = [
  'Kesesuaian dokumen dengan jenis yang diminta',
  'Kelengkapan & keterbacaan isi dokumen',
  'Kesesuaian dengan Aturan Validasi (format/ukuran/tanda tangan)',
];

const REASON_PRESETS = [
  'Dokumen tidak sesuai dengan jenis yang diminta',
  'Dokumen tidak lengkap/terpotong',
  'Kualitas pindaian tidak terbaca',
  'Belum ditandatangani/dicap sesuai ketentuan',
  'Data pada dokumen tidak konsisten',
  'Lainnya (jelaskan di catatan)',
];

export const VerifikasiBerkasScreen: React.FC<VerifikasiBerkasScreenProps> = ({ currentUser }) => {
  const state = useAuditUniverseStore();
  const [tab, setTab] = useState<'antrean' | 'riwayat'>('antrean');
  const [fixTarget, setFixTarget] = useState<VerifikasiQueueItem | null>(null);
  const [acceptTarget, setAcceptTarget] = useState<VerifikasiQueueItem | null>(null);
  const [checklist, setChecklist] = useState<boolean[]>([false, false, false]);
  const [reason, setReason] = useState(REASON_PRESETS[0]);
  const [catatan, setCatatan] = useState('');
  const [riwayatTarget, setRiwayatTarget] = useState<VerifikasiQueueItem | null>(null);
  const [realisasiTarget, setRealisasiTarget] = useState<LaporanEntry | null>(null);

  if (!canVerifyBerkas(currentUser)) {
    return <ForbiddenState description="Antrean Verifikasi Berkas hanya dapat diakses oleh Verifikator Itwil (Koordinator & Pengendali), Pengawas Tim, Ketua Tim, atau Super Admin." />;
  }

  const oleh = displayNameForLog(currentUser);
  const queue = verifikasiQueue();

  // F7 — riwayat keputusan (berkas & laporan yang sudah diputuskan ok/fix), dengan opsi
  // "Batalkan Keputusan" (annul) yang mengembalikannya ke antrean (BR "a history tab where a
  // decision can be annulled").
  type RiwayatItem = { kind: 'berkas' | 'laporan'; reqId?: string; orgId: string; fileId: string; nama: string; status: 'ok' | 'fix'; oleh: string; tgl: string | null; konteks: string };
  const riwayat: RiwayatItem[] = [];
  state.permintaan.forEach((r) => {
    r.sasaran.forEach((orgId) => {
      getBerkas(r.id, orgId).forEach((f) => {
        if (f.status === 'ok' || f.status === 'fix') {
          riwayat.push({ kind: 'berkas', reqId: r.id, orgId, fileId: f.id, nama: f.nama, status: f.status, oleh: f.verifikatorOleh, tgl: f.tglVerifikasi, konteks: r.judul });
        }
      });
    });
  });
  Object.entries(state.laporan).forEach(([orgId, entries]) => {
    entries.forEach((l) => {
      if (l.status === 'ok' || l.status === 'fix') {
        riwayat.push({ kind: 'laporan', orgId, fileId: l.id, nama: l.fileNama, status: l.status, oleh: l.verifikatorOleh, tgl: l.tglVerifikasi, konteks: `Laporan ${l.jenis} ${l.tahunAnggaran}` });
      }
    });
  });
  riwayat.sort((a, b) => (b.tgl ?? '').localeCompare(a.tgl ?? ''));

  const laporanEntryOf = (it: VerifikasiQueueItem): LaporanEntry | undefined => (it.kind === 'laporan' ? state.laporan[it.orgId]?.find((l) => l.id === it.fileId) : undefined);
  const versiOf = (it: VerifikasiQueueItem) => {
    if (it.kind === 'laporan') return laporanEntryOf(it)?.versi ?? [];
    if (it.reqId) return getBerkas(it.reqId, it.orgId).find((f) => f.id === it.fileId)?.versi ?? [];
    return [];
  };

  const columns: TableColumn<VerifikasiQueueItem>[] = [
    {
      key: 'nama',
      header: 'Berkas / Laporan',
      render: (it) => (
        <div>
          <div className="font-bold text-slate-800 text-xs flex items-center gap-1.5">
            {it.nama}
            {versiOf(it).length > 0 && <Badge color="brown" size="sm">Revisi</Badge>}
          </div>
          <div className="text-[11px] text-slate-400">{it.dokNama}</div>
        </div>
      ),
    },
    { key: 'satker', header: 'Satker', render: (it) => getOrgById(it.orgId)?.sing ?? it.orgId },
    { key: 'konteks', header: 'Konteks', render: (it) => <span className="text-[11px] text-slate-500">{it.judulKonteks}</span> },
    { key: 'tgl', header: 'Dikirim', render: (it) => formatIsoDate(it.tgl) },
    { key: 'jenis', header: 'Jenis', render: (it) => <Badge color={it.kind === 'laporan' ? 'indigo' : 'primary'}>{it.kind === 'laporan' ? `Laporan ${it.laporanJenis}` : 'Berkas Permintaan'}</Badge> },
    {
      key: 'klaim',
      header: 'Klaim (F7)',
      render: (it) => {
        const claim = getClaim(it.fileId);
        if (!claim) {
          return (
            <button onClick={() => claimQueueItem(it.fileId, oleh)} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline flex items-center gap-1">
              <Unlock className="w-3 h-3" /> Klaim
            </button>
          );
        }
        const isMine = claim.oleh === oleh;
        return (
          <div className="flex items-center gap-1.5">
            <Badge color={isMine ? 'success' : 'neutral'}>
              <Lock className="w-3 h-3 mr-1 inline" />{isMine ? 'Anda' : claim.oleh}
            </Badge>
            {isMine && <button onClick={() => releaseClaim(it.fileId)} className="text-[11px] text-slate-400 hover:underline">Lepas</button>}
          </div>
        );
      },
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (it) => {
        const lap = laporanEntryOf(it);
        const claim = getClaim(it.fileId);
        // BR "separation of duties" (SoD): verifikator tidak boleh sama dengan pengunggah/pengirim,
        // dan item yang sudah diklaim orang lain tidak bisa diputuskan pihak lain (claim lock).
        const submitterName = it.kind === 'berkas' && it.reqId ? getBerkas(it.reqId, it.orgId).find((f) => f.id === it.fileId)?.keterangan : undefined;
        const sodBlocked = !!submitterName && submitterName === oleh;
        const claimBlocked = !!claim && claim.oleh !== oleh;
        const disabled = sodBlocked || claimBlocked;
        return (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="secondary"
              disabled={disabled}
              title={claimBlocked ? `Sedang diklaim oleh ${claim?.oleh}` : sodBlocked ? 'Pemisahan tugas: verifikator tidak boleh sama dengan pengunggah' : undefined}
              onClick={() => { setAcceptTarget(it); setChecklist([false, false, false]); }}
            >
              <CheckCircle2 className="w-3.5 h-3.5" /> Terima
            </Button>
            <Button size="sm" variant="outline" disabled={disabled} onClick={() => { setFixTarget(it); setReason(REASON_PRESETS[0]); setCatatan(''); }}>
              <Wrench className="w-3.5 h-3.5" /> Minta Perbaikan
            </Button>
            {it.laporanJenis === 'IKU' && lap?.realisasi && (
              <button onClick={() => setRealisasiTarget(lap)} className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline">
                Lihat Realisasi
              </button>
            )}
            {versiOf(it).length > 0 && (
              <button onClick={() => setRiwayatTarget(it)} className="text-slate-400 hover:text-slate-600" title="Riwayat">
                <History className="w-4 h-4" />
              </button>
            )}
          </div>
        );
      },
    },
  ];

  const riwayatColumns: TableColumn<RiwayatItem>[] = [
    { key: 'nama', header: 'Berkas / Laporan', render: (r) => <div><span className="font-bold text-slate-800 text-xs">{r.nama}</span><div className="text-[11px] text-slate-400">{r.konteks}</div></div> },
    { key: 'satker', header: 'Satker', render: (r) => getOrgById(r.orgId)?.sing ?? r.orgId },
    { key: 'status', header: 'Keputusan', render: (r) => <Badge color={r.status === 'ok' ? 'success' : 'danger'}>{r.status === 'ok' ? 'Diterima' : 'Perlu Perbaikan'}</Badge> },
    { key: 'oleh', header: 'Diputuskan Oleh', render: (r) => <div>{r.oleh}<div className="text-[11px] text-slate-400">{formatIsoDate(r.tgl)}</div></div> },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (r) => (
        <button
          onClick={() => {
            if (r.kind === 'berkas' && r.reqId) annulBerkasKeputusan(r.reqId, r.orgId, r.fileId, oleh);
            else annulLaporanKeputusan(r.orgId, r.fileId);
          }}
          className="text-[11px] font-bold text-rose-500 hover:underline flex items-center gap-1"
        >
          <RotateCcw className="w-3.5 h-3.5" /> Batalkan Keputusan
        </button>
      ),
    },
  ];

  return (
    <div className="space-y-3">
      <Card className="flex items-center gap-3">
        <span className="w-9 h-9 rounded-[10px] bg-[var(--sd-inverse-primary)]/40 flex items-center justify-center shrink-0">
          <ClipboardCheck className="w-4.5 h-4.5 text-[var(--sd-primary)]" />
        </span>
        <div>
          <div className="text-xs font-bold text-slate-800">{queue.length} item menunggu verifikasi</div>
          <div className="text-[11px] text-slate-400">Meliputi berkas Permintaan Pengumpulan Data & Laporan Berkala SPIP/IKU dari seluruh Satker. Klaim item sebelum memutuskan (F7).</div>
        </div>
      </Card>

      <SegmentedControl options={[{ value: 'antrean', label: `Antrean (${queue.length})` }, { value: 'riwayat', label: `Riwayat Keputusan (${riwayat.length})` }]} value={tab} onChange={(v) => setTab(v as 'antrean' | 'riwayat')} />

      {tab === 'antrean' ? (
        queue.length === 0 ? (
          <EmptyState title="Antrean verifikasi kosong" description="Semua berkas dan laporan yang dikirim Satker sudah diverifikasi." icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />} />
        ) : (
          <Card><Table columns={columns} data={queue} rowKey={(it) => `${it.kind}-${it.fileId}`} /></Card>
        )
      ) : riwayat.length === 0 ? (
        <EmptyState title="Belum ada keputusan verifikasi" />
      ) : (
        <Card><Table columns={riwayatColumns} data={riwayat} rowKey={(r) => `${r.kind}-${r.fileId}`} /></Card>
      )}

      {acceptTarget && (
        <Modal
          isOpen
          onClose={() => setAcceptTarget(null)}
          title={`Terima Berkas — ${acceptTarget.nama}`}
          description="Pastikan seluruh butir checklist berikut telah diperiksa (BR F7 checklist 3 lapis) sebelum menerima."
          footer={
            <>
              <Button variant="outline" onClick={() => setAcceptTarget(null)}>Batal</Button>
              <Button
                disabled={checklist.some((c) => !c)}
                onClick={() => {
                  if (acceptTarget.kind === 'berkas' && acceptTarget.reqId) verifyBerkas(acceptTarget.reqId, acceptTarget.orgId, acceptTarget.fileId, 'ok', '', oleh);
                  else verifyLaporan(acceptTarget.orgId, acceptTarget.fileId, 'ok', '', oleh);
                  setAcceptTarget(null);
                }}
              >
                <CheckCircle2 className="w-3.5 h-3.5" /> Terima Berkas
              </Button>
            </>
          }
        >
          <div className="space-y-2">
            {CHECKLIST_ITEMS.map((label, i) => (
              <Checkbox key={i} checked={checklist[i]} onChange={(v) => setChecklist((prev) => prev.map((c, ci) => (ci === i ? v : c)))} label={<span className="text-xs text-slate-700">{label}</span>} />
            ))}
          </div>
        </Modal>
      )}

      {fixTarget && (
        <Modal
          isOpen
          onClose={() => setFixTarget(null)}
          title={`Minta Perbaikan — ${fixTarget.nama}`}
          description="Satker akan melihat catatan ini pada berkas terkait dan dapat mengunggah ulang."
          footer={
            <>
              <Button variant="outline" onClick={() => setFixTarget(null)}>Batal</Button>
              <Button
                variant="danger"
                disabled={reason === REASON_PRESETS[REASON_PRESETS.length - 1] && !catatan.trim()}
                onClick={() => {
                  const finalCatatan = catatan.trim() ? `${reason} — ${catatan.trim()}` : reason;
                  if (fixTarget.kind === 'berkas' && fixTarget.reqId) verifyBerkas(fixTarget.reqId, fixTarget.orgId, fixTarget.fileId, 'fix', finalCatatan, oleh);
                  else verifyLaporan(fixTarget.orgId, fixTarget.fileId, 'fix', finalCatatan, oleh);
                  setFixTarget(null);
                }}
              >
                Kirim Permintaan Perbaikan
              </Button>
            </>
          }
        >
          <div className="space-y-3">
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Alasan (keputusan terstruktur)</label>
              <select value={reason} onChange={(e) => setReason(e.target.value)} className="w-full h-10 rounded-[10px] border border-[var(--sd-outline-variant)] bg-white px-3 text-sm">
                {REASON_PRESETS.map((r) => <option key={r} value={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan Tambahan</label>
              <Textarea rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Jelaskan detail apa yang perlu diperbaiki Satker..." />
            </div>
          </div>
        </Modal>
      )}

      {riwayatTarget && <RiwayatVersiModal nama={riwayatTarget.nama} versi={versiOf(riwayatTarget)} onClose={() => setRiwayatTarget(null)} />}

      {realisasiTarget && (
        <Modal isOpen onClose={() => setRealisasiTarget(null)} title={`Realisasi IKU — ${realisasiTarget.fileNama}`} footer={<Button onClick={() => setRealisasiTarget(null)}>Tutup</Button>}>
          <table className="w-full text-[11px]">
            <thead>
              <tr className="text-slate-400"><th className="text-left pb-1.5">Indikator</th><th className="text-right pb-1.5">Target</th><th className="text-right pb-1.5">Realisasi</th><th className="text-right pb-1.5">Capaian</th></tr>
            </thead>
            <tbody>
              {IND_IKU_DEFS.map((d) => {
                const real = realisasiTarget.realisasi?.[d.id];
                const capaian = real != null && d.target > 0 ? Math.round((real / d.target) * 1000) / 10 : null;
                return (
                  <tr key={d.id} className="border-t border-slate-100">
                    <td className="py-1.5 text-slate-600">{d.nama}</td>
                    <td className="py-1.5 text-right text-slate-400">{d.target} {d.satuan}</td>
                    <td className="py-1.5 text-right font-bold text-slate-700">{real ?? '–'} {real != null ? d.satuan : ''}</td>
                    <td className="py-1.5 text-right font-bold text-slate-700">{capaian != null ? `${capaian}%` : '–'}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </Modal>
      )}
    </div>
  );
};

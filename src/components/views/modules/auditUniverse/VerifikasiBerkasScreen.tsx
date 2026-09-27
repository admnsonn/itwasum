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
import { CheckCircle2, ClipboardCheck, Wrench } from 'lucide-react';
import type { CurrentUserProfile } from '../../../../types';
import {
  useAuditUniverseStore,
  verifikasiQueue,
  getOrgById,
  verifyBerkas,
  verifyLaporan,
  formatIsoDate,
  type VerifikasiQueueItem,
} from '../../../../data/auditUniverse';
import { canVerifyBerkas, displayNameForLog } from '../../../../data/auditUniverse/roleMapping';
import { Badge, Button, Card, EmptyState, ForbiddenState, Modal, Table, Textarea, type TableColumn } from '../../../ui';

interface VerifikasiBerkasScreenProps {
  currentUser: CurrentUserProfile;
}

export const VerifikasiBerkasScreen: React.FC<VerifikasiBerkasScreenProps> = ({ currentUser }) => {
  useAuditUniverseStore();
  const [fixTarget, setFixTarget] = useState<VerifikasiQueueItem | null>(null);
  const [catatan, setCatatan] = useState('');

  if (!canVerifyBerkas(currentUser)) {
    return <ForbiddenState description="Antrean Verifikasi Berkas hanya dapat diakses oleh Verifikator Itwil (Koordinator & Pengendali), Pengawas Tim, Ketua Tim, atau Super Admin." />;
  }

  const oleh = displayNameForLog(currentUser);
  const queue = verifikasiQueue();

  const columns: TableColumn<VerifikasiQueueItem>[] = [
    {
      key: 'nama',
      header: 'Berkas / Laporan',
      render: (it) => (
        <div>
          <div className="font-bold text-slate-800 text-xs">{it.nama}</div>
          <div className="text-[11px] text-slate-400">{it.dokNama}</div>
        </div>
      ),
    },
    { key: 'satker', header: 'Satker', render: (it) => getOrgById(it.orgId)?.sing ?? it.orgId },
    { key: 'konteks', header: 'Konteks', render: (it) => <span className="text-[11px] text-slate-500">{it.judulKonteks}</span> },
    { key: 'tgl', header: 'Dikirim', render: (it) => formatIsoDate(it.tgl) },
    { key: 'jenis', header: 'Jenis', render: (it) => <Badge color={it.kind === 'laporan' ? 'indigo' : 'primary'}>{it.kind === 'laporan' ? `Laporan ${it.laporanJenis}` : 'Berkas Permintaan'}</Badge> },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (it) => (
        <div className="flex items-center gap-2">
          <Button
            size="sm"
            variant="secondary"
            onClick={() => {
              if (it.kind === 'berkas' && it.reqId) verifyBerkas(it.reqId, it.orgId, it.fileId, 'ok', '', oleh);
              else verifyLaporan(it.orgId, it.fileId, 'ok', '', oleh);
            }}
          >
            <CheckCircle2 className="w-3.5 h-3.5" /> Terima
          </Button>
          <Button size="sm" variant="outline" onClick={() => { setFixTarget(it); setCatatan(''); }}>
            <Wrench className="w-3.5 h-3.5" /> Minta Perbaikan
          </Button>
        </div>
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
          <div className="text-[11px] text-slate-400">Meliputi berkas Permintaan Pengumpulan Data & Laporan Berkala SPIP/IKU dari seluruh Satker.</div>
        </div>
      </Card>

      {queue.length === 0 ? (
        <EmptyState title="Antrean verifikasi kosong" description="Semua berkas dan laporan yang dikirim Satker sudah diverifikasi." icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />} />
      ) : (
        <Card><Table columns={columns} data={queue} rowKey={(it) => `${it.kind}-${it.fileId}`} /></Card>
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
                disabled={!catatan.trim()}
                onClick={() => {
                  if (fixTarget.kind === 'berkas' && fixTarget.reqId) verifyBerkas(fixTarget.reqId, fixTarget.orgId, fixTarget.fileId, 'fix', catatan, oleh);
                  else verifyLaporan(fixTarget.orgId, fixTarget.fileId, 'fix', catatan, oleh);
                  setFixTarget(null);
                }}
              >
                Kirim Permintaan Perbaikan
              </Button>
            </>
          }
        >
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan Perbaikan</label>
          <Textarea rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Jelaskan apa yang perlu diperbaiki Satker..." />
        </Modal>
      )}
    </div>
  );
};

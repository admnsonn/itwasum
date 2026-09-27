/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * "Simulasi Sisi Itwasum" — replikasi tombol demo pada Portal Satker prototipe
 * (`27092026/.extracted/portal-data-satker.html`, fungsi `openSim`) yang memungkinkan
 * pratinjau langsung memverifikasi berkas/laporan dan mengelola permintaan tanpa harus
 * berganti peran. Hanya untuk Super Admin (Plan "Close 27092026 prototype gaps"): peran lain
 * tetap memakai layar nyata Verifikasi Berkas (7.1) & Permintaan Data (5.1).
 */
import React, { useState } from 'react';
import { Bell, CheckCircle2, Clock, Lock, Send, Wrench } from 'lucide-react';
import type { CurrentUserProfile } from '../../../../types';
import {
  useAuditUniverseStore,
  getOrgById,
  verifikasiQueue,
  verifyBerkas,
  verifyLaporan,
  sendReminder,
  extendDeadline,
  closePermintaan,
  reqStatusTurunan,
  formatIsoDate,
  addDaysFromIso,
} from '../../../../data/auditUniverse';
import { displayNameForLog } from '../../../../data/auditUniverse/roleMapping';
import { Badge, Button, EmptyState, Modal, Textarea } from '../../../ui';

interface SimulasiItwasumModalProps {
  orgId: string;
  currentUser: CurrentUserProfile;
  onClose: () => void;
}

export const SimulasiItwasumModal: React.FC<SimulasiItwasumModalProps> = ({ orgId, currentUser, onClose }) => {
  const state = useAuditUniverseStore();
  const org = getOrgById(orgId);
  const oleh = displayNameForLog(currentUser);
  const [fixTarget, setFixTarget] = useState<{ kind: 'berkas' | 'laporan'; reqId?: string; fileId: string; nama: string } | null>(null);
  const [catatan, setCatatan] = useState('');

  const queue = verifikasiQueue().filter((it) => it.orgId === orgId);
  const reqAktif = state.permintaan.filter((r) => r.sasaran.includes(orgId) && r.status === 'Terkirim');

  return (
    <Modal
      isOpen
      onClose={onClose}
      title="Simulasi Sisi Itwasum"
      description={`Pratinjau aksi Itwasum atas Satker ${org?.sing ?? orgId} — untuk demo, bukan pengganti Verifikasi Berkas & Permintaan Data yang sesungguhnya.`}
      widthClassName="max-w-2xl"
      footer={<Button onClick={onClose}>Selesai</Button>}
    >
      <div className="space-y-4">
        <div>
          <div className="text-xs font-bold text-slate-700 mb-2">Menunggu Verifikasi ({queue.length})</div>
          {queue.length === 0 ? (
            <EmptyState title="Tidak ada berkas/laporan yang menunggu" icon={<CheckCircle2 className="w-6 h-6 text-emerald-400" />} />
          ) : (
            <ul className="space-y-1.5">
              {queue.map((it) => (
                <li key={`${it.kind}-${it.fileId}`} className="flex items-center justify-between gap-3 rounded-[10px] border border-slate-100 p-2.5">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{it.nama}</div>
                    <div className="text-[11px] text-slate-400">{it.dokNama} · {it.judulKonteks} · {formatIsoDate(it.tgl)}</div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
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
                    <Button size="sm" variant="outline" onClick={() => { setFixTarget({ kind: it.kind, reqId: it.reqId, fileId: it.fileId, nama: it.nama }); setCatatan(''); }}>
                      <Wrench className="w-3.5 h-3.5" /> Minta Perbaikan
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>

        <div>
          <div className="text-xs font-bold text-slate-700 mb-2">Permintaan Aktif untuk Satker Ini ({reqAktif.length})</div>
          {reqAktif.length === 0 ? (
            <EmptyState title="Tidak ada permintaan aktif" />
          ) : (
            <ul className="space-y-1.5">
              {reqAktif.map((r) => (
                <li key={r.id} className="flex items-center justify-between gap-3 rounded-[10px] border border-slate-100 p-2.5">
                  <div className="min-w-0">
                    <div className="text-xs font-bold text-slate-800 truncate">{r.judul}</div>
                    <div className="text-[11px] text-slate-400 flex items-center gap-1.5"><Clock className="w-3 h-3" /> Tenggat {formatIsoDate(r.selesai)} · <Badge color="success" size="sm">{reqStatusTurunan(r)}</Badge></div>
                  </div>
                  <div className="flex items-center gap-2 shrink-0">
                    <Button size="sm" variant="outline" onClick={() => sendReminder(r.id, oleh, orgId)}>
                      <Bell className="w-3.5 h-3.5" /> Pengingat
                    </Button>
                    <Button size="sm" variant="outline" onClick={() => extendDeadline(r.id, addDaysFromIso(r.selesai, 7), oleh)}>
                      <Clock className="w-3.5 h-3.5" /> Perpanjang +7 hari
                    </Button>
                    <Button
                      size="sm"
                      variant="danger"
                      onClick={() => {
                        if (window.confirm(`Tutup permintaan "${r.judul}"?`)) closePermintaan(r.id, oleh);
                      }}
                    >
                      <Lock className="w-3.5 h-3.5" /> Tutup
                    </Button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>

      {fixTarget && (
        <Modal
          isOpen
          onClose={() => setFixTarget(null)}
          title={`Minta Perbaikan — ${fixTarget.nama}`}
          description="Satker akan melihat catatan ini pada berkas/laporan terkait."
          footer={
            <>
              <Button variant="outline" onClick={() => setFixTarget(null)}>Batal</Button>
              <Button
                variant="danger"
                disabled={!catatan.trim()}
                onClick={() => {
                  if (fixTarget.kind === 'berkas' && fixTarget.reqId) verifyBerkas(fixTarget.reqId, orgId, fixTarget.fileId, 'fix', catatan, oleh);
                  else verifyLaporan(orgId, fixTarget.fileId, 'fix', catatan, oleh);
                  setFixTarget(null);
                }}
              >
                <Send className="w-3.5 h-3.5" /> Kirim Permintaan Perbaikan
              </Button>
            </>
          }
        >
          <label className="block text-xs font-bold text-slate-600 mb-1.5">Catatan Perbaikan</label>
          <Textarea rows={3} value={catatan} onChange={(e) => setCatatan(e.target.value)} placeholder="Jelaskan apa yang perlu diperbaiki Satker..." />
        </Modal>
      )}
    </Modal>
  );
};

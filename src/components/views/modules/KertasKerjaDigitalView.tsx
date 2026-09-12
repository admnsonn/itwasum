/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.15 Kertas Kerja Audit Digital. Screen: Daftar KK Aktif / Form Pengisian / Antrean
 * Validasi (Plan bagian 4). SF-001..005: skor otomatis read-only, upload eviden multi-format,
 * validasi berjenjang Ketua Tim -> Pengawas Tim, DiffView riwayat versi, badge sisa waktu.
 */
import React, { useState } from 'react';
import type { CurrentUserProfile } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import { KERTAS_KERJA_DIGITAL, type KkEntry } from '../../../data/modules/lanjutan/pelaksanaan';
import {
  ApprovalStep,
  Badge,
  Button,
  Card,
  DiffView,
  ProgressBar,
  Table,
  Typography,
  UploadDropzone,
  type BadgeColor,
  type TableColumn,
} from '../../ui';

const STATUS_COLOR: Record<KkEntry['status'], BadgeColor> = {
  Draf: 'neutral',
  'Menunggu Validasi Ketua Tim': 'warning',
  'Perlu Revisi': 'danger',
  'Disetujui Ketua Tim': 'info',
  Disahkan: 'success',
};

interface KertasKerjaDigitalViewProps {
  currentUser: CurrentUserProfile;
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

export const KertasKerjaDigitalView: React.FC<KertasKerjaDigitalViewProps> = ({ subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b15')!;
  const spec = getModuleSpec('b15')!;
  const activeScreen = subPath || getDefaultScreenSlug('b15') || spec.screens[0].slug;
  const [selected, setSelected] = useState<KkEntry>(KERTAS_KERJA_DIGITAL[0]);

  const columns: TableColumn<KkEntry>[] = [
    { key: 'judul', header: 'Prosedur / Auditi', render: (r) => (
      <div>
        <button onClick={() => setSelected(r)} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left block">{r.judulProsedur}</button>
        <span className="text-[11px] text-slate-400">{r.namaAuditi} — {r.bidang}</span>
      </div>
    ) },
    { key: 'skor', header: 'Skor Otomatis', render: (r) => <span className="font-extrabold">{r.skorOtomatis}</span> },
    { key: 'batas', header: 'Batas Waktu', render: (r) => (
      <div>
        <div>{r.batasWaktu}</div>
        {r.terlambat ? <Badge color="danger">Terlambat</Badge> : <span className="text-[11px] text-slate-400">Sisa {r.sisaHari} hari</span>}
      </div>
    ) },
    { key: 'status', header: 'Status', render: (r) => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge> },
  ];

  const antrean = KERTAS_KERJA_DIGITAL.filter((k) => k.status === 'Menunggu Validasi Ketua Tim' || k.status === 'Disetujui Ketua Tim');

  return (
    <ModuleScreenShell moduleDef={moduleDef} groupLabel={MODULE_GROUPS[moduleDef.group].label} spec={spec} activeScreen={activeScreen} onScreenChange={onSubPathChange}>
      {activeScreen === 'kk-aktif' && (
        <Card><Table columns={columns} data={KERTAS_KERJA_DIGITAL} rowKey={(r) => r.id} /></Card>
      )}

      {activeScreen === 'form-pengisian' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 space-y-4">
            <div className="flex items-center justify-between">
              <Typography variant="label-bold" className="text-slate-700">{selected.judulProsedur}</Typography>
              <select className="h-8 rounded-[8px] border border-[var(--sd-outline-variant)] px-2 text-xs" value={selected.id} onChange={(e) => setSelected(KERTAS_KERJA_DIGITAL.find((k) => k.id === e.target.value) || KERTAS_KERJA_DIGITAL[0])}>
                {KERTAS_KERJA_DIGITAL.map((k) => <option key={k.id} value={k.id}>{k.namaAuditi} — {k.bidang}</option>)}
              </select>
            </div>
            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="rounded-[10px] bg-slate-50 p-3"><div className="text-[10px] font-bold uppercase text-slate-400">Skor Otomatis (read-only)</div><div className="text-xl font-extrabold text-[var(--sd-primary)] mt-1">{selected.skorOtomatis}</div></div>
              <div className="rounded-[10px] bg-slate-50 p-3"><div className="text-[10px] font-bold uppercase text-slate-400">Status</div><Badge color={STATUS_COLOR[selected.status]} className="mt-1">{selected.status}</Badge></div>
            </div>
            <div>
              <Typography variant="label-bold" className="text-slate-600 mb-2">Eviden Terunggah ({selected.eviden.length})</Typography>
              <ul className="space-y-1.5 mb-3">
                {selected.eviden.map((e) => (
                  <li key={e.id} className="flex items-center justify-between rounded-[8px] border border-slate-100 px-3 py-2 text-xs">
                    <span className="font-semibold text-slate-700 truncate">{e.namaBerkas}</span>
                    <span className="text-slate-400 shrink-0 ml-2">{e.format} • {e.ukuranMb} MB</span>
                  </li>
                ))}
              </ul>
              <UploadDropzone onFiles={() => {}} accept=".pdf,.jpg,.jpeg,.png,.xlsx,.docx" maxSizeMB={20} hint="PDF, JPG, PNG, XLSX, DOCX — maks 20 MB per berkas" />
            </div>
          </Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Riwayat Versi</Typography>
            {selected.versions.length >= 2 ? (
              <DiffView
                before={[{ label: 'Versi', value: `V${selected.versions[selected.versions.length - 2].versi}` }, { label: 'Skor', value: `${selected.versions[selected.versions.length - 2].skorSesudah ?? '-'}` }]}
                after={[{ label: 'Versi', value: `V${selected.versions[selected.versions.length - 1].versi}` }, { label: 'Skor', value: `${selected.versions[selected.versions.length - 1].skorSesudah ?? '-'}` }]}
              />
            ) : (
              <p className="text-xs text-slate-400">Baru 1 versi, belum ada perbandingan.</p>
            )}
            <ul className="mt-3 space-y-2 text-xs">
              {selected.versions.map((v) => (
                <li key={v.versi} className="rounded-[8px] border border-slate-100 p-2">
                  <div className="font-bold text-slate-700">V{v.versi} — {v.diubahOleh}</div>
                  <div className="text-slate-500">{v.ringkasanPerubahan}</div>
                  <div className="text-[10px] text-slate-400">{v.tanggal}</div>
                </li>
              ))}
            </ul>
          </Card>
        </div>
      )}

      {activeScreen === 'antrean-validasi' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <Typography variant="label-bold" className="text-slate-700 mb-3">Antrean Validasi Berjenjang</Typography>
            <Table
              columns={[
                { key: 'judul', header: 'Prosedur', render: (r: KkEntry) => <span className="font-bold">{r.judulProsedur} — {r.namaAuditi}</span> },
                { key: 'status', header: 'Status', render: (r: KkEntry) => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge> },
                { key: 'aksi', header: 'Aksi', render: () => (
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline">Perlu Revisi</Button>
                    <Button size="sm">Setujui</Button>
                  </div>
                ) },
              ]}
              data={antrean}
              rowKey={(r) => r.id}
            />
          </Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Alur Validasi</Typography>
            <ApprovalStep
              steps={[
                { id: '1', actor: 'Auditor Pengisi', role: 'Pengisian KK', status: 'disetujui' },
                { id: '2', actor: 'Ketua Tim', role: 'Validasi Tahap I', status: 'menunggu' },
                { id: '3', actor: 'Pengawas Tim', role: 'Validasi Tahap II & Pengesahan', status: 'menunggu' },
              ]}
            />
            <div className="mt-3"><ProgressBar label="Progres Validasi" value={antrean.length ? 33 : 100} /></div>
          </Card>
        </div>
      )}
    </ModuleScreenShell>
  );
};

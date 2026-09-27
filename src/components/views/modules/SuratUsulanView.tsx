/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.4 Surat Usulan. Screen: Formulir Pengajuan / Antrean Review / Arsip (Plan bagian 4).
 * SF-001..004: badge SLA 3 hari kerja per tahap, Ditarik Pemohon, kunci review simultan
 * 15 menit, Dibatalkan Setelah Pengesahan.
 */
import React, { useState } from 'react';
import { Lock } from 'lucide-react';
import type { CurrentUserProfile } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import { SURAT_USULAN_DATA, type SuratUsulanEntry } from '../../../data/modules/lanjutan/administrasi';
import { SURAT_USULAN_KUNCI_REVIEW_MENIT, SURAT_USULAN_SLA_HARI_KERJA } from '../../../data/modules/lanjutan/constants';
import { Badge, Button, Card, Input, Select, Table, Textarea, Typography, type BadgeColor, type TableColumn } from '../../ui';

const STATUS_COLOR: Record<SuratUsulanEntry['status'], BadgeColor> = {
  Draf: 'neutral',
  'Menunggu Review': 'warning',
  Direvisi: 'info',
  Disahkan: 'success',
  'Ditarik Pemohon': 'neutral',
  'Dibatalkan Setelah Pengesahan': 'danger',
};

interface SuratUsulanViewProps {
  currentUser: CurrentUserProfile;
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

export const SuratUsulanView: React.FC<SuratUsulanViewProps> = ({ subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b4')!;
  const spec = getModuleSpec('b4')!;
  const activeScreen = subPath || getDefaultScreenSlug('b4') || spec.screens[0].slug;
  const [jenis, setJenis] = useState('Mutasi Personel');
  const [perihal, setPerihal] = useState('');

  const review = SURAT_USULAN_DATA.filter((u) => u.status === 'Menunggu Review' || u.status === 'Direvisi');
  const arsip = SURAT_USULAN_DATA.filter((u) => ['Disahkan', 'Ditarik Pemohon', 'Dibatalkan Setelah Pengesahan'].includes(u.status));

  const reviewColumns: TableColumn<SuratUsulanEntry>[] = [
    { key: 'nomor', header: 'Nomor Usulan', render: (r) => <span className="font-mono text-xs font-bold">{r.nomorUsulan}</span> },
    { key: 'perihal', header: 'Perihal', render: (r) => r.perihal },
    { key: 'pemohon', header: 'Pemohon', render: (r) => r.pemohon },
    { key: 'tahap', header: 'Tahap Review', render: (r) => (
      <div className="flex items-center gap-2">
        <span className="text-xs font-bold">{r.tahapReview}/{r.totalTahapReview}</span>
        {r.sedangDikunci && <Badge color="warning" icon={<Lock className="w-3 h-3" />}>Dikunci {r.sedangDikunci.oleh} ({r.sedangDikunci.sisaMenit}m)</Badge>}
      </div>
    ) },
    { key: 'sla', header: `SLA (${SURAT_USULAN_SLA_HARI_KERJA} hari kerja/tahap)`, render: (r) => (
      <Badge color={r.slaHariTersisa < 0 ? 'danger' : r.slaHariTersisa <= 1 ? 'warning' : 'success'}>{r.slaHariTersisa < 0 ? 'Lewat SLA' : `Sisa ${r.slaHariTersisa} hari`}</Badge>
    ) },
    { key: 'status', header: 'Status', render: (r) => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge> },
  ];

  const arsipColumns: TableColumn<SuratUsulanEntry>[] = [
    { key: 'nomor', header: 'Nomor Usulan', render: (r) => <span className="font-mono text-xs font-bold">{r.nomorUsulan}</span> },
    { key: 'jenis', header: 'Jenis', render: (r) => r.jenis },
    { key: 'perihal', header: 'Perihal', render: (r) => r.perihal },
    { key: 'tanggal', header: 'Tanggal Pengajuan', render: (r) => r.tanggalPengajuan },
    { key: 'status', header: 'Status Akhir', render: (r) => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge> },
  ];

  return (
    <ModuleScreenShell moduleDef={moduleDef} groupLabel={MODULE_GROUPS[moduleDef.group].label} spec={spec} activeScreen={activeScreen} onScreenChange={onSubPathChange}>
      {activeScreen === 'formulir-pengajuan' && (
        <Card className="max-w-2xl space-y-3">
          <Typography variant="label-bold" className="text-slate-700">Formulir Pengajuan Surat Usulan</Typography>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Jenis Usulan</label>
            <Select value={jenis} onChange={setJenis} options={['Mutasi Personel', 'Perubahan Hak Akses', 'Penugasan Khusus'].map((j) => ({ value: j, label: j }))} />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Perihal</label>
            <Input value={perihal} onChange={(e) => setPerihal(e.target.value)} placeholder="Ringkasan perihal usulan..." />
          </div>
          <div>
            <label className="block text-[11px] font-bold uppercase text-slate-500 mb-1">Alasan Dinas</label>
            <Textarea rows={3} placeholder="Jelaskan alasan dinas dan lampiran pendukung..." />
          </div>
          <div className="flex justify-end gap-2 pt-2">
            <Button variant="outline">Simpan Draf</Button>
            <Button>Ajukan Usulan</Button>
          </div>
        </Card>
      )}

      {activeScreen === 'antrean-review' && (
        <Card><Table columns={reviewColumns} data={review} rowKey={(r) => r.id} emptyLabel="Tidak ada usulan menunggu review." /></Card>
      )}

      {activeScreen === 'arsip' && (
        <Card><Table columns={arsipColumns} data={arsip} rowKey={(r) => r.id} emptyLabel="Arsip usulan masih kosong." /></Card>
      )}
    </ModuleScreenShell>
  );
};

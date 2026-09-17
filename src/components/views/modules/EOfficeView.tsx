/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.5 E-Office. Screen: Registrasi Naskah Masuk / Penyusunan Naskah Keluar / Antrean
 * Disposisi / Arsip (Plan bagian 4). SF-001..004: klasifikasi kecepatan+kerahasiaan yang
 * menentukan SLA disposisi, timeline disposisi, tembusan read-only, ForbiddenState untuk
 * naskah Rahasia.
 */
import React, { useMemo, useState } from 'react';
import type { CurrentUserProfile } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import { EOFFICE_DATA, type EOfficeEntry } from '../../../data/modules/lanjutan/administrasi';
import { EOFFICE_KECEPATAN } from '../../../data/modules/lanjutan/constants';
import { Badge, Button, Card, DonutChart, ForbiddenState, Input, Select, Table, Textarea, Timeline, Typography, type BadgeColor, type TableColumn } from '../../ui';
import { FadeInUp } from '../../ui/motion';

const STATUS_COLOR: Record<EOfficeEntry['status'], BadgeColor> = {
  Draf: 'neutral',
  'Menunggu Disposisi': 'warning',
  Didisposisikan: 'info',
  Selesai: 'success',
  Diarsipkan: 'neutral',
};
const KERAHASIAAN_COLOR: Record<EOfficeEntry['kerahasiaan'], BadgeColor> = { Rahasia: 'danger', Terbatas: 'warning', Biasa: 'neutral' };

interface EOfficeViewProps {
  currentUser: CurrentUserProfile;
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

export const EOfficeView: React.FC<EOfficeViewProps> = ({ currentUser, subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b5')!;
  const spec = getModuleSpec('b5')!;
  const activeScreen = subPath || getDefaultScreenSlug('b5') || spec.screens[0].slug;
  const [selected, setSelected] = useState<EOfficeEntry>(EOFFICE_DATA.find((e) => e.arah === 'Masuk')!);
  const [tujuanKeluar, setTujuanKeluar] = useState('');
  const [perihalKeluar, setPerihalKeluar] = useState('');

  const naskahMasuk = EOFFICE_DATA.filter((e) => e.arah === 'Masuk');
  const naskahKeluar = EOFFICE_DATA.filter((e) => e.arah === 'Keluar');
  const antreanDisposisi = EOFFICE_DATA.filter((e) => e.status === 'Menunggu Disposisi' || e.status === 'Didisposisikan');
  const arsip = EOFFICE_DATA.filter((e) => e.status === 'Diarsipkan' || e.status === 'Selesai');

  const canViewRahasia = currentUser.canManageMasterSatker || currentUser.peran === 'pimpinan_tertinggi';

  const columns = (data: EOfficeEntry[]): TableColumn<EOfficeEntry>[] => [
    { key: 'nomor', header: 'Nomor Naskah', render: (r) => <button onClick={() => setSelected(r)} className="font-mono text-xs font-bold text-[var(--sd-primary)] hover:underline">{r.nomorNaskah}</button> },
    { key: 'perihal', header: 'Perihal', render: (r) => r.perihal },
    { key: 'kecepatan', header: 'Klasifikasi', render: (r) => (
      <div className="flex gap-1">
        <Badge color="primary">{r.kecepatan}</Badge>
        <Badge color={KERAHASIAAN_COLOR[r.kerahasiaan]}>{r.kerahasiaan}</Badge>
      </div>
    ) },
    { key: 'sla', header: 'SLA Disposisi', render: (r) => `${r.slaHari} hari kerja` },
    { key: 'status', header: 'Status', render: (r) => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge> },
  ];

  const isRahasiaBlocked = selected.kerahasiaan === 'Rahasia' && !canViewRahasia;

  const kecepatanMasukSegments = useMemo(() => {
    const palette = ['#BA1A1A', '#EAB308', '#002265'];
    return EOFFICE_KECEPATAN.map((k, i) => ({
      id: k.id,
      label: k.label,
      value: naskahMasuk.filter((e) => e.kecepatan === k.label).length,
      color: palette[i],
    })).filter((s) => s.value > 0);
  }, [naskahMasuk]);

  const kecepatanAntreanSegments = useMemo(() => {
    const palette = ['#BA1A1A', '#EAB308', '#002265'];
    return EOFFICE_KECEPATAN.map((k, i) => ({
      id: k.id,
      label: k.label,
      value: antreanDisposisi.filter((e) => e.kecepatan === k.label).length,
      color: palette[i],
    })).filter((s) => s.value > 0);
  }, [antreanDisposisi]);

  return (
    <ModuleScreenShell moduleDef={moduleDef} groupLabel={MODULE_GROUPS[moduleDef.group].label} spec={spec} activeScreen={activeScreen} onScreenChange={onSubPathChange}>
      {activeScreen === 'naskah-masuk' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2"><Table columns={columns(naskahMasuk)} data={naskahMasuk} rowKey={(r) => r.id} /></Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Detail Naskah</Typography>
            {isRahasiaBlocked ? (
              <ForbiddenState title="Naskah Rahasia" description="Anda tidak berwenang membuka naskah dengan klasifikasi kerahasiaan Rahasia." />
            ) : (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800">{selected.perihal}</div>
                <div className="text-slate-500">Dari: {selected.pengirim}</div>
                <div className="text-slate-500">Tanggal: {selected.tanggal}</div>
                <div className="flex gap-1"><Badge color="primary">{selected.kecepatan}</Badge><Badge color={KERAHASIAAN_COLOR[selected.kerahasiaan]}>{selected.kerahasiaan}</Badge></div>
                {selected.tembusan.length > 0 && <div className="text-slate-400">Tembusan (read-only): {selected.tembusan.join(', ')}</div>}
                {selected.disposisi.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-slate-100">
                    <Typography variant="label-bold" className="text-slate-600 mb-2">Timeline Disposisi</Typography>
                    <Timeline items={selected.disposisi.map((d, i) => ({ id: `${selected.id}-dm-${i}`, title: `Ke ${d.tujuan}`, description: d.instruksi, timestamp: d.tanggal }))} />
                  </div>
                )}
              </div>
            )}
            <FadeInUp className="mt-4">
              <Typography variant="label-bold" className="text-slate-700 mb-2">Distribusi Klasifikasi Kecepatan (Naskah Masuk)</Typography>
              {kecepatanMasukSegments.length > 0 ? (
                <DonutChart segments={kecepatanMasukSegments} centerLabel="Naskah" centerValue={String(naskahMasuk.length)} />
              ) : (
                <p className="text-xs text-slate-400">Belum ada naskah masuk.</p>
              )}
            </FadeInUp>
          </Card>
        </div>
      )}

      {activeScreen === 'naskah-keluar' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2"><Table columns={columns(naskahKeluar)} data={naskahKeluar} rowKey={(r) => r.id} /></Card>
          <Card className="space-y-3">
            <Typography variant="label-bold" className="text-slate-700">Susun Naskah Keluar Baru</Typography>
            <Input placeholder="Tujuan naskah..." value={tujuanKeluar} onChange={(e) => setTujuanKeluar(e.target.value)} />
            <Textarea rows={3} placeholder="Perihal naskah..." value={perihalKeluar} onChange={(e) => setPerihalKeluar(e.target.value)} />
            <Select value="Biasa" onChange={() => {}} options={['Sangat Segera', 'Segera', 'Biasa'].map((k) => ({ value: k, label: k }))} />
            <Button className="w-full">Simpan Naskah Keluar</Button>
          </Card>
        </div>
      )}

      {activeScreen === 'antrean-disposisi' && (
        <div className="space-y-4">
          <FadeInUp>
            <Card>
              <Typography variant="label-bold" className="text-slate-700 mb-2">Distribusi Kecepatan pada Antrean Disposisi</Typography>
              {kecepatanAntreanSegments.length > 0 ? (
                <DonutChart segments={kecepatanAntreanSegments} centerLabel="Antrean" centerValue={String(antreanDisposisi.length)} />
              ) : (
                <p className="text-xs text-slate-400">Antrean disposisi kosong.</p>
              )}
            </Card>
          </FadeInUp>
          <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2"><Table columns={columns(antreanDisposisi)} data={antreanDisposisi} rowKey={(r) => r.id} /></Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Timeline Disposisi — {selected.nomorNaskah}</Typography>
            {selected.disposisi.length === 0 ? (
              <p className="text-xs text-slate-400">Belum ada disposisi.</p>
            ) : (
              <Timeline items={selected.disposisi.map((d, i) => ({ id: `${selected.id}-${i}`, title: `Disposisi ke ${d.tujuan}`, description: d.instruksi, timestamp: d.tanggal }))} />
            )}
          </Card>
          </div>
        </div>
      )}

      {activeScreen === 'arsip' && (
        <Card><Table columns={columns(arsip)} data={arsip} rowKey={(r) => r.id} emptyLabel="Arsip naskah masih kosong." /></Card>
      )}
    </ModuleScreenShell>
  );
};

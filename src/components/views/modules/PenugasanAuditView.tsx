/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.14 Manajemen Penugasan Audit. Screen: Daftar Kegiatan Perlu Penugasan / Pembentukan Tim /
 * Penerbitan Surat Tugas / Kalender Kapasitas (Plan bagian 4). SF-001..004: validasi komposisi
 * tim minimum, pratinjau + nomor ST otomatis, kalender beban kerja, alert konflik kepentingan
 * 2 tahun + form pengecualian.
 */
import React, { useState } from 'react';
import { AlertTriangle, FileSignature, Users2 } from 'lucide-react';
import type { CurrentUserProfile } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import { PENUGASAN_2026, AUDITOR_CAPACITY_CALENDAR, type PenugasanEntry } from '../../../data/modules/lanjutan/pelaksanaan';
import {
  Badge,
  Button,
  Card,
  EmptyState,
  ProgressBar,
  Table,
  Typography,
  type BadgeColor,
  type TableColumn,
} from '../../ui';

const STATUS_COLOR: Record<PenugasanEntry['status'], BadgeColor> = {
  'Perlu Penugasan': 'neutral',
  'Tim Terbentuk': 'info',
  'ST Terbit': 'primary',
  Berjalan: 'warning',
  Selesai: 'success',
};

const CAPACITY_COLOR: Record<string, BadgeColor> = { Tersedia: 'success', 'Mendekati Penuh': 'warning', Penuh: 'danger' };

interface PenugasanAuditViewProps {
  currentUser: CurrentUserProfile;
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

export const PenugasanAuditView: React.FC<PenugasanAuditViewProps> = ({ subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b14')!;
  const spec = getModuleSpec('b14')!;
  const activeScreen = subPath || getDefaultScreenSlug('b14') || spec.screens[0].slug;
  const [selected, setSelected] = useState<PenugasanEntry>(PENUGASAN_2026[0]);
  const [pengecualianAlasan, setPengecualianAlasan] = useState('');

  const perluPenugasan = PENUGASAN_2026.filter((p) => p.status === 'Perlu Penugasan');
  const timBelumLengkap = PENUGASAN_2026.filter((p) => p.tim.length > 0 && p.tim.length < 3);

  const columnsPerlu: TableColumn<PenugasanEntry>[] = [
    { key: 'nama', header: 'Kegiatan / Auditi', render: (r) => <button onClick={() => setSelected(r)} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left">{r.namaAuditi}</button> },
    { key: 'waktu', header: 'Waktu Pelaksanaan', render: (r) => r.waktuPelaksanaan },
    { key: 'status', header: 'Status', render: (r) => <Badge color={STATUS_COLOR[r.status]}>{r.status}</Badge> },
  ];

  return (
    <ModuleScreenShell moduleDef={moduleDef} groupLabel={MODULE_GROUPS[moduleDef.group].label} spec={spec} activeScreen={activeScreen} onScreenChange={onSubPathChange}>
      {activeScreen === 'perlu-penugasan' && (
        <Card>
          {perluPenugasan.length === 0 ? (
            <EmptyState title="Tidak ada kegiatan menunggu penugasan" description="Seluruh kegiatan PKPT disahkan telah memiliki tim audit." />
          ) : (
            <Table columns={columnsPerlu} data={perluPenugasan} rowKey={(r) => r.id} />
          )}
        </Card>
      )}

      {activeScreen === 'pembentukan-tim' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 space-y-3">
            <Typography variant="label-bold" className="text-slate-700 flex items-center gap-1.5"><Users2 className="w-4 h-4" /> Komposisi Tim — {selected.namaAuditi}</Typography>
            {selected.tim.length === 0 ? (
              <EmptyState title="Tim belum dibentuk" description="Tetapkan minimal Pengawas Tim, Ketua Tim, dan 1 Anggota Tim." />
            ) : (
              <ul className="space-y-2">
                {selected.tim.map((t, i) => (
                  <li key={i} className="flex items-center justify-between rounded-[10px] border border-slate-100 bg-white p-2.5">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{t.nama}</div>
                      <div className="text-[11px] text-slate-400">{t.peranTim}</div>
                    </div>
                  </li>
                ))}
              </ul>
            )}
            <div className={`rounded-[10px] p-3 text-xs font-semibold ${selected.tim.length >= 3 ? 'bg-[var(--sd-success-container)] text-[var(--sd-success)]' : 'bg-[var(--sd-warning-container)] text-amber-800'}`}>
              {selected.tim.length >= 3 ? 'Komposisi tim minimum terpenuhi (Pengawas Tim, Ketua Tim, min. 1 Anggota Tim).' : 'Komposisi tim belum memenuhi minimum 3 peran wajib.'}
            </div>
            {selected.konflikKepentingan && (
              <div className="rounded-[10px] bg-[var(--sd-error-container)] p-3 text-xs text-[var(--sd-error)] space-y-2">
                <div className="flex items-start gap-2 font-semibold"><AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" /> Konflik Kepentingan Terdeteksi: {selected.catatanKonflik}</div>
                <div className="flex items-center gap-2">
                  <input value={pengecualianAlasan} onChange={(e) => setPengecualianAlasan(e.target.value)} placeholder="Alasan pengecualian..." className="flex-1 h-8 rounded-[8px] border border-[var(--sd-error)]/30 px-2 text-xs" />
                  <Button size="sm" variant="outline">Ajukan Pengecualian</Button>
                </div>
                {selected.pengecualianKonflikDisetujui && <Badge color="success">Pengecualian Disetujui</Badge>}
              </div>
            )}
          </Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Pilih Kegiatan</Typography>
            <select className="w-full h-10 rounded-[10px] border border-[var(--sd-outline-variant)] px-3 text-sm" value={selected.id} onChange={(e) => setSelected(PENUGASAN_2026.find((p) => p.id === e.target.value) || PENUGASAN_2026[0])}>
              {PENUGASAN_2026.map((p) => <option key={p.id} value={p.id}>{p.namaAuditi}</option>)}
            </select>
          </Card>
        </div>
      )}

      {activeScreen === 'penerbitan-surat-tugas' && (
        <Card className="max-w-2xl space-y-3">
          <Typography variant="label-bold" className="text-slate-700 flex items-center gap-1.5"><FileSignature className="w-4 h-4" /> Pratinjau Surat Tugas — {selected.namaAuditi}</Typography>
          {selected.suratTugasNomor ? (
            <div className="rounded-[10px] border border-slate-200 bg-slate-50 p-4 font-mono text-xs space-y-1.5">
              <div>Nomor: <span className="font-bold">{selected.suratTugasNomor}</span></div>
              <div>Tanggal Terbit: {selected.tanggalTerbitST}</div>
              <div>Objek Audit: {selected.namaAuditi}</div>
              <div>Waktu Pelaksanaan: {selected.waktuPelaksanaan}</div>
              <div>Susunan Tim: {selected.tim.map((t) => `${t.nama} (${t.peranTim})`).join('; ') || '-'}</div>
            </div>
          ) : (
            <EmptyState title="Surat Tugas belum diterbitkan" description="Lengkapi komposisi tim pada Screen Pembentukan Tim terlebih dahulu." action={<Button size="sm" disabled>Terbitkan Surat Tugas</Button>} />
          )}
        </Card>
      )}

      {activeScreen === 'kalender-kapasitas' && (
        <Card>
          <Typography variant="label-bold" className="text-slate-700 mb-3">Kalender Beban Kerja Auditor</Typography>
          <div className="space-y-3">
            {AUDITOR_CAPACITY_CALENDAR.map((a) => (
              <div key={a.auditorId} className="flex items-center gap-3">
                <div className="w-48 shrink-0 text-xs font-bold text-slate-700 truncate">{a.nama}</div>
                <div className="flex-1"><ProgressBar showValue={false} value={a.persenBeban} color={a.statusKapasitas === 'Penuh' ? '#BA1A1A' : a.statusKapasitas === 'Mendekati Penuh' ? '#EAB308' : '#2D7A4A'} /></div>
                <span className="w-12 text-right text-xs font-bold">{a.persenBeban}%</span>
                <Badge color={CAPACITY_COLOR[a.statusKapasitas]} className="shrink-0">{a.statusKapasitas}</Badge>
              </div>
            ))}
          </div>
          {timBelumLengkap.length > 0 && (
            <p className="mt-3 text-[11px] text-slate-400">{timBelumLengkap.length} penugasan memiliki komposisi tim belum lengkap dan berpotensi menambah beban auditor lain.</p>
          )}
        </Card>
      )}
    </ModuleScreenShell>
  );
};

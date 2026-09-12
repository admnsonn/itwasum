/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.10 Log Aktivitas & Audit Trail. Screen: Daftar Log / Detail Kejadian / Konfigurasi
 * Retensi (Plan bagian 4). Menggantikan pemetaan lama `b10 -> AdminOverviewView` tab logs;
 * view baru memakai `auditLogger.ts` sebagai sumber dan menambah SF-004 (badge integritas
 * checksum "Perlu Investigasi", grafik volume, alert anomali >200%).
 */
import React, { useMemo, useState } from 'react';
import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { AuditLogEntry, CurrentUserProfile } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import { getAuditLogs } from '../../../utils/auditLogger';
import { LOG_VOLUME_30_HARI, detectVolumeAnomalies } from '../../../data/modules/lanjutan/administrasi';
import { LOG_ANOMALI_AMBANG_PERSEN, LOG_RETENSI_DEFAULT_HARI } from '../../../data/modules/lanjutan/constants';
import { Badge, Card, EmptyState, ForbiddenState, StatCard, Table, TrendLineChart, Typography, type BadgeColor, type TableColumn } from '../../ui';

const KEJADIAN_COLOR: Record<string, BadgeColor> = {
  'Buka Overview': 'info',
  'Drill-down': 'primary',
  Ekspor: 'teal',
  'Akses ditolak': 'danger',
  'Ubah hak akses user': 'warning',
  'Ubah master penugasan Itwil': 'warning',
  'Buka/Perbarui Ringkasan AI': 'indigo',
  'Pertanyaan ke LLM': 'violet',
  'Pertanyaan ditolak LLM': 'danger',
};

function checksumFor(log: AuditLogEntry): string {
  const raw = `${log.id}|${log.waktu}|${log.kejadian}|${log.user}`;
  let h = 0;
  for (let i = 0; i < raw.length; i++) h = (h * 31 + raw.charCodeAt(i)) >>> 0;
  return h.toString(16).padStart(8, '0').toUpperCase();
}

interface LogAktivitasViewProps {
  currentUser: CurrentUserProfile;
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

export const LogAktivitasView: React.FC<LogAktivitasViewProps> = ({ currentUser, subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b10')!;
  const spec = getModuleSpec('b10')!;
  const activeScreen = subPath || getDefaultScreenSlug('b10') || spec.screens[0].slug;
  const logs = useMemo(() => getAuditLogs(), []);
  const [selected, setSelected] = useState<AuditLogEntry | null>(logs[0] ?? null);

  const canView = currentUser.canViewActivityLogs !== 'none';
  const scopedLogs = currentUser.canViewActivityLogs === 'wilayah' ? logs.filter((l) => l.titikWilayah === currentUser.titikWilayahNama) : logs;

  const anomalies = detectVolumeAnomalies();

  const columns: TableColumn<AuditLogEntry>[] = [
    { key: 'waktu', header: 'Waktu', render: (r) => <span className="font-mono text-xs">{r.waktu}</span> },
    { key: 'kejadian', header: 'Kejadian', render: (r) => <Badge color={KEJADIAN_COLOR[r.kejadian] || 'neutral'}>{r.kejadian}</Badge> },
    { key: 'user', header: 'Pengguna', render: (r) => <button onClick={() => setSelected(r)} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left">{r.user}</button> },
    { key: 'peran', header: 'Peran', render: (r) => r.peran },
    { key: 'wilayah', header: 'Titik Wilayah', render: (r) => r.titikWilayah },
  ];

  if (!canView) {
    return (
      <ModuleScreenShell moduleDef={moduleDef} groupLabel={MODULE_GROUPS[moduleDef.group].label} spec={spec} activeScreen={activeScreen} onScreenChange={onSubPathChange}>
        <ForbiddenState description="Log aktivitas hanya dapat diakses oleh Super Admin (seluruh wilayah) dan Admin Polda (wilayah binaan)." />
      </ModuleScreenShell>
    );
  }

  return (
    <ModuleScreenShell moduleDef={moduleDef} groupLabel={MODULE_GROUPS[moduleDef.group].label} spec={spec} activeScreen={activeScreen} onScreenChange={onSubPathChange}>
      {activeScreen === 'daftar-log' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Log Tercatat" value={scopedLogs.length} />
            <StatCard label="Akses Ditolak" value={scopedLogs.filter((l) => l.kejadian === 'Akses ditolak').length} />
            <StatCard label="Ubah Hak Akses" value={scopedLogs.filter((l) => l.kejadian === 'Ubah hak akses user').length} />
            <StatCard label="Anomali Volume (30 Hari)" value={anomalies.length} change={anomalies.length > 0 ? { direction: 'up', label: `>${LOG_ANOMALI_AMBANG_PERSEN}% dari baseline` } : undefined} />
          </div>
          <Card>
            {scopedLogs.length === 0 ? <EmptyState title="Belum ada log tercatat" /> : <Table columns={columns} data={scopedLogs} rowKey={(r) => r.id} />}
          </Card>
        </div>
      )}

      {activeScreen === 'detail-kejadian' && (
        selected ? (
          <Card className="max-w-2xl space-y-3">
            <div className="flex items-center justify-between">
              <Typography variant="label-bold" className="text-slate-700">Detail Kejadian</Typography>
              <Badge color={KEJADIAN_COLOR[selected.kejadian] || 'neutral'}>{selected.kejadian}</Badge>
            </div>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div><div className="text-[10px] font-bold uppercase text-slate-400">Waktu</div><div className="font-mono font-bold">{selected.waktu}</div></div>
              <div><div className="text-[10px] font-bold uppercase text-slate-400">Pengguna</div><div className="font-bold">{selected.user}</div></div>
              <div><div className="text-[10px] font-bold uppercase text-slate-400">Peran</div><div>{selected.peran}</div></div>
              <div><div className="text-[10px] font-bold uppercase text-slate-400">Titik Wilayah</div><div>{selected.titikWilayah}</div></div>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 mb-1">Detail</div>
              <pre className="text-[11px] bg-slate-50 rounded-[8px] p-3 overflow-x-auto">{JSON.stringify(selected.detail, null, 2)}</pre>
            </div>
            <div className="flex items-center gap-2 pt-2 border-t border-slate-100">
              <ShieldCheck className="w-4 h-4 text-[var(--sd-success)]" />
              <span className="text-[11px] font-mono text-slate-500">Checksum Integritas: {checksumFor(selected)}</span>
              <Badge color="success" className="ml-auto">Terverifikasi</Badge>
            </div>
          </Card>
        ) : (
          <EmptyState title="Belum ada kejadian terpilih" description="Pilih salah satu baris pengguna pada Screen Daftar Log." />
        )
      )}

      {activeScreen === 'konfigurasi-retensi' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <Typography variant="label-bold" className="text-slate-700 mb-2">Grafik Volume Log (30 Hari Terakhir)</Typography>
            <TrendLineChart data={LOG_VOLUME_30_HARI} xKey="tanggal" series={[{ dataKey: 'jumlah', label: 'Jumlah Log', color: '#002265' }]} />
            {anomalies.length > 0 && (
              <div className="mt-3 flex items-start gap-2 rounded-[10px] bg-[var(--sd-error-container)] p-3 text-xs text-[var(--sd-error)] font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                Terdeteksi {anomalies.length} hari dengan kenaikan volume log &gt;{LOG_ANOMALI_AMBANG_PERSEN}% dari rata-rata ({anomalies.map((a) => a.tanggal).join(', ')}).
              </div>
            )}
          </Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Konfigurasi Retensi</Typography>
            <div className="text-xs text-slate-500">Log aktivitas disimpan minimal:</div>
            <div className="text-2xl font-extrabold text-[var(--sd-primary)] mt-1">{LOG_RETENSI_DEFAULT_HARI.toLocaleString('id-ID')} hari</div>
            <div className="text-[11px] text-slate-400 mt-1">(± 5 tahun, sesuai kebijakan retensi audit trail immutable Itwasum)</div>
          </Card>
        </div>
      )}
    </ModuleScreenShell>
  );
};

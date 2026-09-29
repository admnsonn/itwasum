/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.12 "Dashboard Portal Itwasum" (`b12/dashboard-portal`) — ringkasan admin lintas Satker:
 * populasi Satker aktif, ukuran Master Katalog, penugasan yang sedang berjalan, tabel status
 * penugasan audit, dan feed aktivitas sistem terbaru. Restyled mengikuti Figma "UI Req by BA"
 * Portal Satker (frames 3361:*) — lihat `figma/README.md` (Plan "Align itwasum with Figma",
 * todo `portal-dashboards`). Berbeda dari "Dashboard Audit Universe (F2)" Plane-only
 * (`DashboardScreen.tsx`, kini di grup Sidebar "Audit Universe & Risiko"), yang berfokus pada
 * kelengkapan populasi Objek Audit, bukan ringkasan operasional penugasan.
 */
import React, { useMemo } from 'react';
import { Activity, Building2, FolderKanban, ListChecks } from 'lucide-react';
import { useAuditUniverseStore, getJpById, reqStatusTurunan, progress, formatDateTime, JENJANG_SASARAN } from '../../../../data/auditUniverse';
import { Badge, Card, EmptyState, StatCard, Table, Timeline, Typography, type BadgeColor, type TableColumn } from '../../../ui';
import type { Permintaan } from '../../../../data/auditUniverse';

const STATUS_COLOR: Record<ReturnType<typeof reqStatusTurunan>, BadgeColor> = {
  Draft: 'warning',
  Dijadwalkan: 'info',
  Berjalan: 'success',
  Ditutup: 'neutral',
};

export const DashboardPortalItwasumScreen: React.FC = () => {
  const state = useAuditUniverseStore();

  const totalSatker = useMemo(
    () => state.orgUnits.filter((o) => o.aktif && JENJANG_SASARAN.includes(o.jenjang)).length,
    [state.orgUnits]
  );
  const penugasanBerjalan = useMemo(() => state.permintaan.filter((r) => reqStatusTurunan(r) === 'Berjalan'), [state.permintaan]);

  const feed = useMemo(
    () =>
      state.permintaan
        .flatMap((r) => r.log.map((l) => ({ ...l, judul: r.judul })))
        .sort((a, b) => (a.waktu < b.waktu ? 1 : -1))
        .slice(0, 12),
    [state.permintaan]
  );

  const columns: TableColumn<Permintaan>[] = [
    {
      key: 'judul',
      header: 'Penugasan',
      render: (r) => (
        <div>
          <div className="font-bold text-slate-800">{r.judul}</div>
          <div className="text-[11px] text-slate-400 font-mono">{r.id} · {getJpById(r.jpId)?.nama ?? r.jpId}</div>
        </div>
      ),
    },
    { key: 'sasaran', header: 'Target Satker', render: (r) => `${r.sasaran.length} Satker/unit` },
    {
      key: 'progres',
      header: 'Progres',
      render: (r) => {
        const p = progress(r);
        return <span className="text-xs font-bold text-slate-600">{p.done}/{p.total} selesai</span>;
      },
    },
    { key: 'status', header: 'Status', render: (r) => <Badge color={STATUS_COLOR[reqStatusTurunan(r)]}>{reqStatusTurunan(r)}</Badge> },
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <StatCard label="Total Satker" value={totalSatker} footer={<span className="flex items-center gap-1.5 text-[11px]"><Building2 className="w-3 h-3" />Satker &amp; unit aktif</span>} />
        <StatCard label="Master Katalog" value={state.katalog.length} footer={<span className="flex items-center gap-1.5 text-[11px]"><FolderKanban className="w-3 h-3" />Dokumen &amp; data terdaftar</span>} />
        <StatCard label="Penugasan Berjalan" value={penugasanBerjalan.length} footer={<span className="flex items-center gap-1.5 text-[11px]"><ListChecks className="w-3 h-3" />Sedang dikumpulkan</span>} />
      </div>

      <Card>
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 mb-2">Status Penugasan Audit</Typography>
        {state.permintaan.length === 0 ? (
          <EmptyState title="Belum ada penugasan audit" />
        ) : (
          <Table columns={columns} data={[...state.permintaan].filter((r) => r.status !== 'Draft').slice(0, 10)} rowKey={(r) => r.id} />
        )}
      </Card>

      <Card>
        <div className="flex items-center gap-2 mb-2">
          <Activity className="w-4 h-4 text-slate-400" />
          <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Aktivitas Sistem</Typography>
        </div>
        {feed.length === 0 ? (
          <EmptyState title="Belum ada aktivitas tercatat" />
        ) : (
          <Timeline
            items={feed.map((f, i) => ({
              id: String(i),
              title: f.aksi,
              description: `${f.oleh} — ${f.judul}`,
              timestamp: formatDateTime(f.waktu),
              tone: f.aksi.toLowerCase().includes('mengembalikan') ? 'warning' : f.aksi.toLowerCase().includes('menutup') ? 'default' : 'success',
            }))}
          />
        )}
      </Card>
    </div>
  );
};

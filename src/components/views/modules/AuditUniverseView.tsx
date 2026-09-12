/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.12 Audit Universe. Screen: Daftar Auditi / Detail Auditi / Validasi Data (Plan bagian 4).
 * SF-001..005: tabel + filter status kelengkapan, form tusi-struktur-anggaran, dashboard
 * kelengkapan + daftar "Belum Siap Skoring", pencarian + range slider anggaran + filter lama
 * belum diaudit, timeline data per tahun.
 */
import React, { useMemo, useState } from 'react';
import { Building2, ClipboardCheck, Landmark, Layers } from 'lucide-react';
import type { CurrentUserProfile, PoldaSatker } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import { ALL_AUDITI, type AuditiEntry, type AuditiKelengkapanStatus } from '../../../data/modules/lanjutan/perencanaan';
import {
  Badge,
  Card,
  DonutChart,
  EmptyState,
  FilterPanel,
  ProgressBar,
  StatCard,
  Table,
  Timeline,
  usePagination,
  Pagination,
  type BadgeColor,
  type TableColumn,
} from '../../ui';

const STATUS_COLOR: Record<AuditiKelengkapanStatus, BadgeColor> = {
  Lengkap: 'success',
  Sebagian: 'info',
  Placeholder: 'neutral',
  'Perlu Pembaruan': 'warning',
  Nonaktif: 'danger',
};

interface AuditUniverseViewProps {
  currentUser: CurrentUserProfile;
  poldaList: PoldaSatker[];
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

export const AuditUniverseView: React.FC<AuditUniverseViewProps> = ({ subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b12')!;
  const spec = getModuleSpec('b12')!;
  const activeScreen = subPath || getDefaultScreenSlug('b12') || spec.screens[0].slug;

  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [selectedAuditi, setSelectedAuditi] = useState<AuditiEntry | null>(ALL_AUDITI[0] ?? null);

  const filtered = useMemo(() => {
    return ALL_AUDITI.filter((a) => {
      if (statusFilter && a.statusKelengkapan !== statusFilter) return false;
      if (search && !a.nama.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [search, statusFilter]);

  const { page, pageSize, setPage, setPageSize, pageItems } = usePagination(filtered, 10);

  const columns: TableColumn<AuditiEntry>[] = [
    { key: 'nama', header: 'Nama Auditi', render: (r) => <div className="font-bold text-slate-800">{r.nama}</div> },
    { key: 'tingkat', header: 'Tingkat', render: (r) => <Badge color="primary">{r.tingkat}</Badge> },
    { key: 'anggaran', header: 'Anggaran T.A.', render: (r) => r.anggaranTahunBerjalan },
    { key: 'lama', header: 'Lama Belum Diaudit', render: (r) => `${r.lamaBelumDiauditTahun} tahun` },
    { key: 'skor', header: 'Skor Risiko Inheren', render: (r) => <span className="font-bold">{r.skorRisikoInheren.toFixed(2)}</span> },
    {
      key: 'status',
      header: 'Status Kelengkapan',
      render: (r) => <Badge color={STATUS_COLOR[r.statusKelengkapan]}>{r.statusKelengkapan}</Badge>,
    },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (r) => (
        <button
          onClick={() => { setSelectedAuditi(r); onSubPathChange('detail-auditi'); }}
          className="text-xs font-bold text-[var(--sd-primary)] hover:underline"
        >
          Lihat Detail
        </button>
      ),
    },
  ];

  const belumSiapSkoring = ALL_AUDITI.filter((a) => a.statusKelengkapan !== 'Lengkap');
  const rataKelengkapan = Math.round(ALL_AUDITI.reduce((s, a) => s + a.persenKelengkapan, 0) / ALL_AUDITI.length);

  return (
    <ModuleScreenShell
      moduleDef={moduleDef}
      groupLabel={MODULE_GROUPS[moduleDef.group].label}
      spec={spec}
      activeScreen={activeScreen}
      onScreenChange={onSubPathChange}
    >
      {activeScreen === 'daftar-auditi' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Auditi" value={ALL_AUDITI.length} />
            <StatCard label="Status Lengkap" value={ALL_AUDITI.filter((a) => a.statusKelengkapan === 'Lengkap').length} />
            <StatCard label="Perlu Pembaruan" value={ALL_AUDITI.filter((a) => a.statusKelengkapan === 'Perlu Pembaruan').length} />
            <StatCard label="Rata-Rata Kelengkapan" value={`${rataKelengkapan}%`} />
          </div>
          <FilterPanel
            search={{ value: search, onChange: setSearch, placeholder: 'Cari nama satker/satwil auditi...' }}
            fields={[
              {
                type: 'select', key: 'status', label: 'Status Kelengkapan', value: statusFilter, onChange: setStatusFilter, placeholder: 'Semua Status',
                options: (['Lengkap', 'Sebagian', 'Placeholder', 'Perlu Pembaruan', 'Nonaktif'] as AuditiKelengkapanStatus[]).map((s) => ({ value: s, label: s })),
              },
            ]}
          />
          <Card>
            <Table columns={columns} data={pageItems} rowKey={(r) => r.id} />
            <Pagination currentPage={page} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="auditi" />
          </Card>
        </div>
      )}

      {activeScreen === 'detail-auditi' && (
        selectedAuditi ? (
          <div className="grid lg:grid-cols-3 gap-4">
            <Card className="lg:col-span-2 space-y-4">
              <div className="flex items-center gap-3">
                <span className="w-11 h-11 rounded-[10px] bg-[var(--sd-inverse-primary)]/40 flex items-center justify-center shrink-0">
                  <Building2 className="w-5 h-5 text-[var(--sd-primary)]" />
                </span>
                <div>
                  <div className="font-extrabold text-slate-900">{selectedAuditi.nama}</div>
                  <Badge color="primary">{selectedAuditi.tingkat}</Badge>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Tugas & Fungsi (Tusi)</div>
                  <p className="text-xs text-slate-700 mt-1">{selectedAuditi.tusi}</p>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Struktur Organisasi</div>
                  <p className="text-xs text-slate-700 mt-1">{selectedAuditi.strukturOrganisasi}</p>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1"><Landmark className="w-3 h-3" /> Anggaran Tahun Berjalan</div>
                  <p className="text-xs font-bold text-slate-800 mt-1">{selectedAuditi.anggaranTahunBerjalan}</p>
                </div>
                <div>
                  <div className="text-[10px] font-bold uppercase text-slate-400">Tahun Terakhir Diaudit</div>
                  <p className="text-xs font-bold text-slate-800 mt-1">{selectedAuditi.tahunTerakhirDiaudit} ({selectedAuditi.lamaBelumDiauditTahun} tahun lalu)</p>
                </div>
              </div>
              <ProgressBar label="Kelengkapan Data" value={selectedAuditi.persenKelengkapan} />
            </Card>
            <Card>
              <div className="text-xs font-bold text-slate-700 mb-2">Timeline Data per Tahun</div>
              <Timeline
                items={[2023, 2024, 2025, 2026].map((y) => ({
                  id: `${selectedAuditi.id}-${y}`,
                  title: `Tahun Anggaran ${y}`,
                  description: y === selectedAuditi.tahunTerakhirDiaudit ? 'Audit terakhir dilaksanakan pada tahun ini.' : 'Data tusi & anggaran diperbarui satker.',
                  timestamp: y === 2026 ? 'Berjalan' : 'Selesai',
                  tone: y === selectedAuditi.tahunTerakhirDiaudit ? 'success' : 'default',
                }))}
              />
            </Card>
          </div>
        ) : (
          <EmptyState title="Belum ada auditi terpilih" description="Pilih salah satu auditi pada Screen Daftar Auditi untuk melihat detail." />
        )
      )}

      {activeScreen === 'validasi-data' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-1">
            <div className="text-xs font-bold text-slate-700 mb-3">Dashboard Kelengkapan Data</div>
            <DonutChart
              centerValue={`${rataKelengkapan}%`}
              centerLabel="Rata-rata siap skoring"
              segments={(['Lengkap', 'Sebagian', 'Placeholder', 'Perlu Pembaruan', 'Nonaktif'] as AuditiKelengkapanStatus[]).map((s, i) => ({
                id: s,
                label: s,
                value: ALL_AUDITI.filter((a) => a.statusKelengkapan === s).length,
                color: ['#2D7A4A', '#3B82F6', '#94A3B8', '#EAB308', '#BA1A1A'][i],
              }))}
            />
          </Card>
          <Card className="lg:col-span-2">
            <div className="flex items-center gap-2 mb-3">
              <ClipboardCheck className="w-4 h-4 text-[var(--sd-primary)]" />
              <div className="text-xs font-bold text-slate-700">Daftar "Belum Siap Skoring" ({belumSiapSkoring.length})</div>
            </div>
            {belumSiapSkoring.length === 0 ? (
              <EmptyState title="Seluruh auditi siap diskoring" icon={<Layers className="w-8 h-8 text-emerald-500" />} />
            ) : (
              <ul className="space-y-2 max-h-[360px] overflow-y-auto">
                {belumSiapSkoring.map((a) => (
                  <li key={a.id} className="flex items-center justify-between gap-3 rounded-[10px] border border-slate-100 bg-white p-2.5">
                    <div>
                      <div className="text-xs font-bold text-slate-800">{a.nama}</div>
                      <div className="text-[11px] text-slate-400">Kelengkapan: {a.persenKelengkapan}%</div>
                    </div>
                    <Badge color={STATUS_COLOR[a.statusKelengkapan]}>{a.statusKelengkapan}</Badge>
                  </li>
                ))}
              </ul>
            )}
          </Card>
        </div>
      )}
    </ModuleScreenShell>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.12 Ringkasan — F3 Objek Audit (plane/f-3-fsd-manajemen-objek-audit-audit-universe.md).
 * Menggantikan Screen "Daftar Auditi"/"Detail Auditi"/"Validasi Data" lama yang memakai mock
 * data `ALL_AUDITI` terpisah dari model Audit Universe — kini memakai `state.objekAudit` +
 * `OrgUnit` sungguhan (Plan "Align itwasum with Plane BA/SA", todo p1-b12-risk).
 */
import React, { useMemo, useState } from 'react';
import { Building2, ClipboardCheck, Landmark, Layers } from 'lucide-react';
import {
  useAuditUniverseStore,
  getOrgById,
  getItwilOf,
  getJpById,
  getPenilaianByObjek,
  formatIsoDate,
} from '../../../../data/auditUniverse';
import type { ObjekAudit, ObjekAuditStatus } from '../../../../data/auditUniverse';
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
} from '../../../ui';

const STATUS_COLOR: Record<ObjekAuditStatus, BadgeColor> = {
  Draft: 'neutral',
  'Siap Dinilai': 'warning',
  Dinilai: 'success',
  Diarsipkan: 'neutral',
};

interface ObjekAuditScreenProps {
  detailPath?: string;
  onNavigateDetail: (id?: string) => void;
}

export const ObjekAuditScreen: React.FC<ObjekAuditScreenProps> = ({ detailPath, onNavigateDetail }) => {
  const state = useAuditUniverseStore();
  const [search, setSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('');

  const selected = detailPath ? state.objekAudit.find((o) => o.id === detailPath) : undefined;

  const filtered = useMemo(() => {
    return state.objekAudit.filter((o) => {
      const org = getOrgById(o.orgId);
      if (statusFilter && o.status !== statusFilter) return false;
      if (search && !org?.nama.toLowerCase().includes(search.toLowerCase())) return false;
      return true;
    });
  }, [state.objekAudit, search, statusFilter]);

  const { page, pageSize, setPage, setPageSize, pageItems } = usePagination(filtered, 10);

  const columns: TableColumn<ObjekAudit>[] = [
    {
      key: 'nama',
      header: 'Objek Audit',
      render: (o) => (
        <button onClick={() => onNavigateDetail(o.id)} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left">
          {getOrgById(o.orgId)?.nama ?? o.orgId}
        </button>
      ),
    },
    { key: 'jenjang', header: 'Tingkat', render: (o) => <Badge color="primary">{getOrgById(o.orgId)?.jenjang ?? '-'}</Badge> },
    { key: 'itwil', header: 'Itwil', render: (o) => getItwilOf(getOrgById(o.orgId)) || '-' },
    { key: 'jp', header: 'Jenis Pengawasan', render: (o) => getJpById(o.jpId)?.nama ?? o.jpId },
    { key: 'kelengkapan', header: 'Kelengkapan Data', render: (o) => <ProgressBar value={o.kelengkapanPct} showValue /> },
    { key: 'status', header: 'Status', render: (o) => <Badge color={STATUS_COLOR[o.status]}>{o.status}</Badge> },
    {
      key: 'aksi',
      header: 'Aksi',
      render: (o) => (
        <button onClick={() => onNavigateDetail(o.id)} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Lihat Detail</button>
      ),
    },
  ];

  if (detailPath) {
    if (!selected) {
      return <EmptyState title="Objek Audit tidak ditemukan" action={<button onClick={() => onNavigateDetail(undefined)} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">Kembali ke daftar</button>} />;
    }
    return <ObjekAuditDetail objekAudit={selected} onBack={() => onNavigateDetail(undefined)} />;
  }

  const belumSiap = state.objekAudit.filter((o) => o.status !== 'Dinilai');
  const rataKelengkapan = state.objekAudit.length ? Math.round(state.objekAudit.reduce((s, o) => s + o.kelengkapanPct, 0) / state.objekAudit.length) : 0;

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Objek Audit" value={state.objekAudit.length} />
        <StatCard label="Sudah Dinilai" value={state.objekAudit.filter((o) => o.status === 'Dinilai').length} />
        <StatCard label="Belum Siap Skoring" value={belumSiap.length} />
        <StatCard label="Rata-Rata Kelengkapan" value={`${rataKelengkapan}%`} />
      </div>
      <FilterPanel
        search={{ value: search, onChange: setSearch, placeholder: 'Cari nama satker/satwil...' }}
        fields={[
          {
            type: 'select', key: 'status', label: 'Status', value: statusFilter, onChange: setStatusFilter, placeholder: 'Semua Status',
            options: (['Draft', 'Siap Dinilai', 'Dinilai', 'Diarsipkan'] as ObjekAuditStatus[]).map((s) => ({ value: s, label: s })),
          },
        ]}
      />
      {filtered.length === 0 ? (
        <EmptyState title="Belum ada Objek Audit yang cocok" icon={<Layers className="w-6 h-6 text-slate-300" />} />
      ) : (
        <Card>
          <Table columns={columns} data={pageItems} rowKey={(o) => o.id} />
          <Pagination currentPage={page} totalItems={filtered.length} pageSize={pageSize} onPageChange={setPage} onPageSizeChange={setPageSize} itemLabel="objek audit" />
        </Card>
      )}
    </div>
  );
};

const ObjekAuditDetail: React.FC<{ objekAudit: ObjekAudit; onBack: () => void }> = ({ objekAudit, onBack }) => {
  const org = getOrgById(objekAudit.orgId);
  const penilaian = getPenilaianByObjek(objekAudit.id);

  return (
    <div className="space-y-3">
      <button onClick={onBack} className="text-xs font-bold text-[var(--sd-primary)] hover:underline">&larr; Kembali ke Daftar Objek Audit</button>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 space-y-4">
          <div className="flex items-center gap-3">
            <span className="w-11 h-11 rounded-[10px] bg-[var(--sd-inverse-primary)]/40 flex items-center justify-center shrink-0">
              <Building2 className="w-5 h-5 text-[var(--sd-primary)]" />
            </span>
            <div>
              <div className="font-extrabold text-slate-900">{org?.nama ?? objekAudit.orgId}</div>
              <div className="flex items-center gap-1.5 mt-0.5">
                <Badge color="primary">{org?.jenjang}</Badge>
                {org?.itwil && <Badge color="info">{org.itwil}</Badge>}
                <Badge color={objekAudit.status === 'Dinilai' ? 'success' : 'warning'}>{objekAudit.status}</Badge>
              </div>
            </div>
          </div>
          <div className="grid sm:grid-cols-2 gap-3">
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Kode Satker</div>
              <p className="text-xs font-mono text-slate-700 mt-1">{org?.kode || '-'}</p>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Induk Organisasi</div>
              <p className="text-xs text-slate-700 mt-1">{getOrgById(org?.induk ?? '')?.nama ?? '-'}</p>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400 flex items-center gap-1"><Landmark className="w-3 h-3" /> Status Anggaran</div>
              <p className="text-xs font-bold text-slate-800 mt-1">{org?.ang === 'ya' ? 'Satker Beranggaran Mandiri' : org?.ang === 'tidak' ? `Anggaran dikelola oleh ${getOrgById(org?.peng ?? '')?.nama ?? '-'}` : '-'}</p>
            </div>
            <div>
              <div className="text-[10px] font-bold uppercase text-slate-400">Jenis Pengawasan TA {objekAudit.tahunAnggaran}</div>
              <p className="text-xs font-bold text-slate-800 mt-1">{getJpById(objekAudit.jpId)?.nama ?? objekAudit.jpId}</p>
            </div>
          </div>
          <ProgressBar label="Kelengkapan Data" value={objekAudit.kelengkapanPct} showValue />
          {penilaian && (
            <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-200">
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-bold text-slate-600">Skor Risiko (8.1/8.2)</span>
                <Badge color={penilaian.status === 'Disetujui' ? 'success' : penilaian.status === 'Dikembalikan' ? 'danger' : 'warning'}>{penilaian.status}</Badge>
              </div>
              <div className="text-lg font-black text-slate-900">{penilaian.skor}</div>
              <div className="text-[11px] text-slate-400">Dinilai {formatIsoDate(penilaian.tglDinilai)} oleh {penilaian.dinilaiOleh}</div>
            </div>
          )}
        </Card>
        <Card>
          <div className="text-xs font-bold text-slate-700 mb-2 flex items-center gap-1.5"><ClipboardCheck className="w-3.5 h-3.5" /> Timeline Objek Audit</div>
          <Timeline
            items={[
              { id: 'draft', title: 'Terdaftar sebagai Objek Audit', description: `Tahun anggaran ${objekAudit.tahunAnggaran}`, timestamp: 'Selesai', tone: 'default' },
              { id: 'kelengkapan', title: 'Kelengkapan data diverifikasi', description: `${objekAudit.kelengkapanPct}% kelengkapan tercapai`, timestamp: objekAudit.kelengkapanPct >= 80 ? 'Selesai' : 'Berjalan', tone: objekAudit.kelengkapanPct >= 80 ? 'success' : 'warning' },
              { id: 'nilai', title: 'Penilaian risiko (8.1)', description: penilaian ? `Skor ${penilaian.skor}` : 'Menunggu data lengkap', timestamp: penilaian ? 'Selesai' : 'Belum Mulai', tone: penilaian ? 'success' : 'default' },
              { id: 'review', title: 'Review & persetujuan (8.2)', description: penilaian?.status ?? 'Menunggu penilaian', timestamp: penilaian?.status === 'Disetujui' ? 'Selesai' : 'Berjalan', tone: penilaian?.status === 'Disetujui' ? 'success' : 'default' },
            ]}
          />
        </Card>
      </div>
      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-3">
          <div className="text-xs font-bold text-slate-700 mb-3">Kesiapan Skoring</div>
          <DonutChart
            centerValue={`${objekAudit.kelengkapanPct}%`}
            centerLabel="Kelengkapan"
            segments={[
              { id: 'lengkap', label: 'Terpenuhi', value: objekAudit.kelengkapanPct, color: '#2D7A4A' },
              { id: 'kurang', label: 'Belum Terpenuhi', value: 100 - objekAudit.kelengkapanPct, color: '#E2E8F0' },
            ]}
          />
        </Card>
      </div>
    </div>
  );
};

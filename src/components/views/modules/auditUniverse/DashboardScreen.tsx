/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.12 Ringkasan — F2 Dashboard Monitoring Audit Universe
 * (plane/f-2-fsd-dashboard-monitoring-audit-universe.md). KPI populasi Objek Audit,
 * kelengkapan data, antrean verifikasi, dan status pengumpulan per Itwil.
 */
import React, { useMemo, useState } from 'react';
import { MapPin } from 'lucide-react';
import type { CurrentUserProfile } from '../../../../types';
import {
  useAuditUniverseStore,
  getOrgById,
  getItwilOf,
  verifikasiQueue,
} from '../../../../data/auditUniverse';
import { ITWIL_LIST } from '../../../../data/auditUniverse/types';
import { auditUniverseRoleGroups, ROLE_GROUP_LABEL, currentUserOrgId } from '../../../../data/auditUniverse/roleMapping';
import { Badge, Card, DonutChart, EmptyState, Select, StatCard } from '../../../ui';

/** SF-111/112 — lingkup akses menu Dashboard: Tim Risiko/Pengendali/Pimpinan (nasional)
 * melihat seluruh Itwil; Admin Itwasum lingkup Polda/Itwil hanya melihat Itwil-nya sendiri
 * secara read-only turun ke jajaran (Plan p1-b12-risk, "SF-111/112 scope"). */
function scopeItwilFor(currentUser: CurrentUserProfile): string | null {
  const groups = auditUniverseRoleGroups(currentUser);
  if (groups.includes('tim_risiko') || currentUser.peran === 'super_admin') return null; // nasional, tidak dibatasi
  const orgId = currentUserOrgId(currentUser);
  return getItwilOf(getOrgById(orgId ?? undefined));
}

export const DashboardAuditUniverseScreen: React.FC<{ currentUser: CurrentUserProfile }> = ({ currentUser }) => {
  const state = useAuditUniverseStore();
  const homeItwil = scopeItwilFor(currentUser);
  const [itwilFilter, setItwilFilter] = useState(homeItwil ?? '');
  const objekAuditAll = state.objekAudit;
  const objekAudit = itwilFilter ? objekAuditAll.filter((o) => getItwilOf(getOrgById(o.orgId)) === itwilFilter) : objekAuditAll;

  const kelengkapanRata = objekAudit.length ? Math.round(objekAudit.reduce((s, o) => s + o.kelengkapanPct, 0) / objekAudit.length) : 0;
  const antreanVerifikasi = useMemo(() => verifikasiQueue().length, [state]);
  const siapDinilai = objekAudit.filter((o) => o.status === 'Siap Dinilai').length;
  const dinilai = objekAudit.filter((o) => o.status === 'Dinilai').length;
  const menungguPersetujuan = state.penilaianRisiko.filter((p) => p.status === 'Diajukan').length;

  const perItwil = useMemo(() => {
    return ITWIL_LIST.filter((itwil) => !homeItwil || itwil === homeItwil).map((itwil) => {
      const items = objekAuditAll.filter((o) => getItwilOf(getOrgById(o.orgId)) === itwil);
      const rata = items.length ? Math.round(items.reduce((s, o) => s + o.kelengkapanPct, 0) / items.length) : 0;
      return { itwil, total: items.length, rata };
    });
  }, [objekAuditAll, homeItwil]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-2 p-2.5 rounded-[10px] bg-slate-50 border border-slate-200">
        <div className="flex items-center gap-2 text-xs text-slate-600">
          <MapPin className="w-3.5 h-3.5 text-slate-400" />
          <span className="font-bold">Lingkup Akses:</span>
          <Badge color={homeItwil ? 'info' : 'primary'}>{homeItwil ?? 'Nasional'}</Badge>
          <span className="text-slate-400">({auditUniverseRoleGroups(currentUser).map((g) => ROLE_GROUP_LABEL[g]).join(', ') || 'Tanpa peran B.12'})</span>
        </div>
        {!homeItwil && (
          <Select
            options={ITWIL_LIST.map((i) => ({ value: i, label: i }))}
            value={itwilFilter}
            onChange={setItwilFilter}
            placeholder="Filter Itwil (semua)"
            className="w-48"
          />
        )}
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Total Objek Audit" value={objekAudit.length} />
        <StatCard label="Rata-Rata Kelengkapan Data" value={`${kelengkapanRata}%`} />
        <StatCard label="Antrean Verifikasi Berkas" value={antreanVerifikasi} />
        <StatCard label="Menunggu Persetujuan Risiko" value={menungguPersetujuan} />
      </div>

      <div className="grid lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-1">
          <div className="text-xs font-bold text-slate-700 mb-3">Status Kesiapan Skoring</div>
          <DonutChart
            centerValue={`${objekAudit.length}`}
            centerLabel="Objek Audit"
            segments={[
              { id: 'draft', label: 'Draft', value: objekAudit.filter((o) => o.status === 'Draft').length, color: '#94A3B8' },
              { id: 'siap', label: 'Siap Dinilai', value: siapDinilai, color: '#EAB308' },
              { id: 'dinilai', label: 'Dinilai', value: dinilai, color: '#2D7A4A' },
            ]}
          />
        </Card>
        <Card className="lg:col-span-2">
          <div className="text-xs font-bold text-slate-700 mb-3">Kelengkapan Data per Itwil</div>
          {perItwil.every((p) => p.total === 0) ? (
            <EmptyState title="Belum ada Objek Audit terdaftar" />
          ) : (
            <div className="space-y-2.5">
              {perItwil.map((p) => (
                <div key={p.itwil} className="flex items-center gap-3">
                  <span className="w-16 text-xs font-bold text-slate-600 shrink-0">{p.itwil}</span>
                  <div className="flex-1 h-2.5 rounded-full bg-slate-100 overflow-hidden">
                    <div className="h-full bg-[var(--sd-primary)] rounded-full" style={{ width: `${p.rata}%` }} />
                  </div>
                  <span className="w-20 text-right text-[11px] text-slate-400 font-mono">{p.total} objek · {p.rata}%</span>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>

      <Card>
        <div className="flex items-center justify-between mb-2">
          <div className="text-xs font-bold text-slate-700">Ringkasan Siklus</div>
          <Badge color="info">{state.permintaan.filter((r) => r.status === 'Terkirim').length} Permintaan Berjalan</Badge>
        </div>
        <div className="grid sm:grid-cols-3 gap-3 text-xs">
          <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-100">
            <div className="text-slate-400">Permintaan Pengumpulan Data</div>
            <div className="text-lg font-black text-slate-900">{state.permintaan.filter((r) => r.tipe === 'Berkala').length}</div>
          </div>
          <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-100">
            <div className="text-slate-400">Permintaan Tambahan Audit</div>
            <div className="text-lg font-black text-slate-900">{state.permintaan.filter((r) => r.tipe === 'Tambahan Audit').length}</div>
          </div>
          <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-100">
            <div className="text-slate-400">Baseline Prioritas Terkunci</div>
            <div className="text-lg font-black text-slate-900">{state.baselinePrioritas.length}</div>
          </div>
        </div>
      </Card>
    </div>
  );
};

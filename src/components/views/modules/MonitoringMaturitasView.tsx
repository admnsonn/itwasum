/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.17 Monitoring Maturitas SPIP & Risiko. Screen: Dashboard Rollup / Peta Risiko Strategis /
 * Tren Antar Periode (Plan bagian 4). SF-001..004: rollup L0 Nasional -> L1 Itwil -> L2
 * (agregasi read-only), RiskMatrix/heatmap + slide-over satker, tren minimal 2 periode + tabel
 * satker menurun, form bobot total 1,00 + badge periode terbekukan.
 */
import React, { useState } from 'react';
import type { CurrentUserProfile, PoldaSatker } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import {
  MATURITAS_NASIONAL,
  MATURITAS_ROLLUP_ITWIL,
  MATURITAS_ROLLUP_BOBOT,
  MATURITAS_TREN_PERIODE,
  SPIP_SATKER_DATA,
  satkerMenurun,
} from '../../../data/modules/lanjutan/spipTlhp';
import { Badge, Card, ForbiddenState, ProgressBar, RiskMatrix, StatCard, TrendLineChart, Typography } from '../../ui';
import type { SpipSatkerEntry } from '../../../data/modules/lanjutan/spipTlhp';

interface MonitoringMaturitasViewProps {
  currentUser: CurrentUserProfile;
  poldaList: PoldaSatker[];
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

/** Konfigurasi bobot rollup & pembekuan periode adalah kewenangan Pimpinan/Koordinator/Super
 * Admin — tim audit tetap dapat melihat modul (Plan bagian 6) tapi bagian ini ForbiddenState. */
function canConfigureRollup(currentUser?: CurrentUserProfile): boolean {
  if (!currentUser) return true;
  return !['pengawas_tim', 'ketua_tim', 'auditor'].includes(currentUser.peran);
}

export const MonitoringMaturitasView: React.FC<MonitoringMaturitasViewProps> = ({ currentUser, subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b17')!;
  const spec = getModuleSpec('b17')!;
  const activeScreen = subPath || getDefaultScreenSlug('b17') || spec.screens[0].slug;
  const [selectedSatker, setSelectedSatker] = useState<SpipSatkerEntry | null>(null);
  const menurun = satkerMenurun();
  const canConfigure = canConfigureRollup(currentUser);

  return (
    <ModuleScreenShell moduleDef={moduleDef} groupLabel={MODULE_GROUPS[moduleDef.group].label} spec={spec} activeScreen={activeScreen} onScreenChange={onSubPathChange}>
      {activeScreen === 'dashboard-rollup' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Rollup L0 — Nasional" value={MATURITAS_NASIONAL.toFixed(2)} />
            {MATURITAS_ROLLUP_ITWIL.slice(0, 3).map((it) => (
              <StatCard key={it.itwilId} label={`Rollup L1 — ${it.nama}`} value={it.rataRataMaturitas.toFixed(2)} footer={`${it.satkerCount} satker`} />
            ))}
          </div>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-3">Rollup L1 Itwil -&gt; L2 Satker (agregasi read-only)</Typography>
            <div className="space-y-3">
              {MATURITAS_ROLLUP_ITWIL.map((it) => (
                <div key={it.itwilId} className="flex items-center gap-3">
                  <div className="w-40 shrink-0 text-xs font-bold text-slate-700">{it.nama}</div>
                  <div className="flex-1"><ProgressBar showValue={false} value={it.rataRataMaturitas} max={5} /></div>
                  <span className="w-16 text-right text-xs font-extrabold text-slate-800">{it.rataRataMaturitas.toFixed(2)} / 5</span>
                  <span className="w-16 text-right text-[11px] text-slate-400">{it.satkerCount} satker</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      )}

      {activeScreen === 'peta-risiko-strategis' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2">
            <Typography variant="label-bold" className="text-slate-700 mb-2">Peta Risiko Strategis (Kemungkinan x Dampak)</Typography>
            <RiskMatrix
              items={SPIP_SATKER_DATA.map((s) => ({
                id: s.poldaId,
                x: Math.round((5 - s.nilaiFinal) * 10) / 10,
                y: Math.round((5 - s.nilaiKKLEAD_III) * 10) / 10,
                label: s.namaSatker,
                riskLevel: s.nilaiFinal < 2 ? 'kritis' : s.nilaiFinal < 3 ? 'tinggi' : s.nilaiFinal < 4 ? 'sedang' : 'rendah',
              }))}
            />
          </Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Detail Satker</Typography>
            <select className="w-full h-9 rounded-[8px] border border-[var(--sd-outline-variant)] px-2 text-xs mb-3" value={selectedSatker?.poldaId || ''} onChange={(e) => setSelectedSatker(SPIP_SATKER_DATA.find((s) => s.poldaId === e.target.value) || null)}>
              <option value="">Pilih satker...</option>
              {SPIP_SATKER_DATA.map((s) => <option key={s.poldaId} value={s.poldaId}>{s.namaSatker}</option>)}
            </select>
            {selectedSatker && (
              <div className="space-y-2 text-xs">
                <div className="font-bold text-slate-800">{selectedSatker.namaSatker}</div>
                <Badge color="primary">Level {selectedSatker.levelMaturitas} — {selectedSatker.levelLabel}</Badge>
                <ProgressBar label="Nilai Final" value={selectedSatker.nilaiFinal} max={5} />
              </div>
            )}
          </Card>
        </div>
      )}

      {activeScreen === 'tren-antar-periode' && (
        <div className="space-y-4">
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Tren Maturitas Nasional (Minimal 2 Periode)</Typography>
            <TrendLineChart
              data={MATURITAS_TREN_PERIODE}
              xKey="periode"
              series={[
                { dataKey: 'nasional', label: 'Realisasi Nasional', color: '#002265' },
                { dataKey: 'target', label: 'Target', color: '#94A3B8', dashed: true },
              ]}
            />
          </Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Satker Menurun Periode Ini ({menurun.length})</Typography>
            <ul className="space-y-1.5">
              {menurun.map((s) => (
                <li key={s.poldaId} className="flex items-center justify-between rounded-[8px] border border-slate-100 px-3 py-2 text-xs">
                  <span className="font-semibold text-slate-700">{s.namaSatker}</span>
                  <Badge color="danger">Turun ke {s.nilaiFinal.toFixed(2)}</Badge>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Form Bobot Rollup (Total Wajib 1,00)</Typography>
            {canConfigure ? (
              <>
                <div className="space-y-2">
                  {MATURITAS_ROLLUP_BOBOT.map((b) => (
                    <div key={b.id} className="flex items-center justify-between text-xs">
                      <span className="text-slate-600">{b.label}</span>
                      <span className="font-bold text-slate-800">{(b.bobot * 100).toFixed(0)}%</span>
                    </div>
                  ))}
                </div>
                <div className="mt-2 pt-2 border-t border-slate-100 flex items-center justify-between text-xs font-bold">
                  <span>Total Bobot</span>
                  <Badge color={MATURITAS_ROLLUP_BOBOT.reduce((s, b) => s + b.bobot, 0) === 1 ? 'success' : 'danger'}>{(MATURITAS_ROLLUP_BOBOT.reduce((s, b) => s + b.bobot, 0) * 100).toFixed(0)}%</Badge>
                </div>
                <div className="mt-3"><Badge color="neutral">Periode Sem I 2026 — Belum Terbekukan</Badge></div>
              </>
            ) : (
              <ForbiddenState title="Konfigurasi & Pembekuan Periode Terkunci" description="Hanya Pimpinan/Koordinator/Super Admin yang dapat mengubah bobot rollup dan membekukan periode." />
            )}
          </Card>
        </div>
      )}
    </ModuleScreenShell>
  );
};

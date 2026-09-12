/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.18 Early Warning Pengawasan. Screen: Konfigurasi Aturan / Dashboard Peringatan Aktif /
 * Riwayat Eskalasi (Plan bagian 4). SF-001..004: toggle 4 aturan pemicu + form ambang, daftar
 * terurut urgensi Kritis/Tinggi/Perhatian dengan dedup per satker, progress bar SLA + tombol
 * Ditindaklanjuti, snooze maks 7 hari.
 */
import React, { useMemo, useState } from 'react';
import type { CurrentUserProfile, PoldaSatker } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import { EARLY_WARNING_ALERTS, EARLY_WARNING_RULE_CONFIG, type EarlyWarningAlert, type EwUrgensi } from '../../../data/modules/lanjutan/spipTlhp';
import { EARLY_WARNING_SNOOZE_MAKS_HARI } from '../../../data/modules/lanjutan/constants';
import { Badge, Button, Card, EmptyState, ForbiddenState, ProgressBar, Timeline, Toggle, Typography, type BadgeColor } from '../../ui';

const URGENSI_COLOR: Record<EwUrgensi, BadgeColor> = { Kritis: 'danger', Tinggi: 'warning', Perhatian: 'info' };
const URGENSI_ORDER: EwUrgensi[] = ['Kritis', 'Tinggi', 'Perhatian'];

/** Konfigurasi aturan pemicu Early Warning adalah kewenangan Pimpinan/Koordinator/Super Admin
 * (Plan bagian 6) — tim audit tetap melihat modul & dashboard, tapi screen ini ForbiddenState. */
function canConfigureRules(currentUser?: CurrentUserProfile): boolean {
  if (!currentUser) return true;
  return !['pengawas_tim', 'ketua_tim', 'auditor'].includes(currentUser.peran);
}

interface EarlyWarningViewProps {
  currentUser: CurrentUserProfile;
  poldaList: PoldaSatker[];
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

export const EarlyWarningView: React.FC<EarlyWarningViewProps> = ({ currentUser, subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b18')!;
  const spec = getModuleSpec('b18')!;
  const activeScreen = subPath || getDefaultScreenSlug('b18') || spec.screens[0].slug;
  const [ruleConfig, setRuleConfig] = useState(EARLY_WARNING_RULE_CONFIG);
  const canConfigure = canConfigureRules(currentUser);

  // Dedup per satker: satu satker hanya menampilkan alert urgensi tertinggi.
  const dedupedAlerts = useMemo(() => {
    const bySatker = new Map<string, EarlyWarningAlert>();
    for (const a of EARLY_WARNING_ALERTS) {
      const existing = bySatker.get(a.poldaId);
      if (!existing || URGENSI_ORDER.indexOf(a.urgensi) < URGENSI_ORDER.indexOf(existing.urgensi)) {
        bySatker.set(a.poldaId, a);
      }
    }
    return Array.from(bySatker.values()).sort((a, b) => URGENSI_ORDER.indexOf(a.urgensi) - URGENSI_ORDER.indexOf(b.urgensi));
  }, []);

  const eskalasi = EARLY_WARNING_ALERTS.filter((a) => a.riwayat.length > 0);

  return (
    <ModuleScreenShell moduleDef={moduleDef} groupLabel={MODULE_GROUPS[moduleDef.group].label} spec={spec} activeScreen={activeScreen} onScreenChange={onSubPathChange}>
      {activeScreen === 'konfigurasi-aturan' && (
        canConfigure ? (
          <div className="space-y-3">
            {ruleConfig.map((rule) => (
              <Card key={rule.id} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="text-xs font-bold text-slate-800">{rule.label} <span className="text-slate-400 font-normal">(sumber {rule.sumberModul})</span></div>
                  <div className="text-[11px] text-slate-500 mt-0.5">{rule.deskripsi}</div>
                  <div className="text-[11px] text-slate-400 mt-0.5">Ambang: <span className="font-bold text-slate-600">{rule.ambang}</span></div>
                </div>
                <Toggle
                  checked={rule.aktif}
                  onChange={(v) => setRuleConfig((prev) => prev.map((r) => (r.id === rule.id ? { ...r, aktif: v } : r)))}
                />
              </Card>
            ))}
          </div>
        ) : (
          <Card>
            <ForbiddenState title="Konfigurasi Aturan Terkunci" description="Hanya Pimpinan/Koordinator/Super Admin yang dapat mengubah aturan pemicu Early Warning." />
          </Card>
        )
      )}

      {activeScreen === 'dashboard-aktif' && (
        <div className="space-y-3">
          {dedupedAlerts.length === 0 ? (
            <EmptyState title="Tidak ada peringatan aktif" description="Seluruh satker berada dalam ambang normal." />
          ) : (
            dedupedAlerts.map((a) => (
              <Card key={a.id} className="flex items-center gap-4">
                <Badge color={URGENSI_COLOR[a.urgensi]} size="lg" className="shrink-0">{a.urgensi}</Badge>
                <div className="flex-1 min-w-0">
                  <div className="text-xs font-bold text-slate-800">{a.namaSatker} — {a.ruleLabel}</div>
                  <div className="text-[11px] text-slate-500">{a.pesan}</div>
                  <div className="mt-2"><ProgressBar label="Progres SLA" value={a.slaProgressPersen} color={a.slaProgressPersen >= 80 ? '#BA1A1A' : undefined} /></div>
                </div>
                <div className="flex flex-col gap-1.5 shrink-0">
                  <Button size="sm">Ditindaklanjuti</Button>
                  <Button size="sm" variant="outline">Snooze (maks {EARLY_WARNING_SNOOZE_MAKS_HARI}h)</Button>
                </div>
              </Card>
            ))
          )}
        </div>
      )}

      {activeScreen === 'riwayat-eskalasi' && (
        <Card>
          <Typography variant="label-bold" className="text-slate-700 mb-3">Riwayat Tindak Lanjut & Eskalasi</Typography>
          <Timeline
            items={eskalasi.flatMap((a) => a.riwayat.map((r, i) => ({
              id: `${a.id}-${i}`,
              title: `${a.namaSatker} — ${r.aksi}`,
              description: `${a.ruleLabel} (${a.urgensi})${a.snoozeSampai ? ` — snooze sampai ${a.snoozeSampai}` : ''}`,
              timestamp: `${r.waktu} oleh ${r.aktor}`,
              tone: a.urgensi === 'Kritis' ? 'danger' as const : a.urgensi === 'Tinggi' ? 'warning' as const : 'default' as const,
            })))}
          />
        </Card>
      )}
    </ModuleScreenShell>
  );
};

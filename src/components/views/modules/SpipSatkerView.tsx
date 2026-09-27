/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.8 SPIP Satker. Screen: Ruang PM / KK Penetapan Tujuan / KK Struktur & Proses / KK
 * Pencapaian Tujuan / Penyimpulan Maturitas (Plan bagian 4). SF-001..007: penetapan tusi
 * asesor, form KK dinamis per kode KK dengan skor terproteksi, kartu KKLEAD I/II/III
 * (penalti KK4), KKLEAD_SPIP + badge level 0-5, indikator sesi edit 15 menit.
 */
import React, { useState } from 'react';
import { Clock, ShieldCheck } from 'lucide-react';
import type { CurrentUserProfile, PoldaSatker } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import { SPIP_SATKER_DATA, type SpipSatkerEntry, type SpipKkScore } from '../../../data/modules/lanjutan/spipTlhp';
import { SPIP_ASSESSOR_ROLES, SPIP_ASSESSMENT_MECHANISMS, SPIP_KK_DESKRIPSI, SPIP_SESI_EDIT_MENIT } from '../../../data/modules/lanjutan/constants';
import { Badge, Card, ProgressBar, Select, Table, Typography, type BadgeColor, type TableColumn } from '../../ui';

const LEVEL_COLOR: Record<number, BadgeColor> = { 0: 'danger', 1: 'danger', 2: 'warning', 3: 'info', 4: 'primary', 5: 'success' };

interface SpipSatkerViewProps {
  currentUser: CurrentUserProfile;
  poldaList: PoldaSatker[];
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

function kkForCodes(entry: SpipSatkerEntry, prefixes: string[]): SpipKkScore[] {
  return entry.kkScores.filter((k) => prefixes.some((p) => k.kode.startsWith(p)));
}

export const SpipSatkerView: React.FC<SpipSatkerViewProps> = ({ subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b8')!;
  const spec = getModuleSpec('b8')!;
  const activeScreen = subPath || getDefaultScreenSlug('b8') || spec.screens[0].slug;
  const [selected, setSelected] = useState<SpipSatkerEntry>(SPIP_SATKER_DATA[0]);

  const kkColumns = (codes: SpipKkScore[]): TableColumn<SpipKkScore>[] => [
    { key: 'kode', header: 'Kode KK', render: (r) => <span className="font-mono font-bold text-slate-700">{r.kode}</span> },
    { key: 'deskripsi', header: 'Deskripsi', render: (r) => <span className="text-xs text-slate-600">{SPIP_KK_DESKRIPSI[r.kode]}</span> },
    { key: 'mekanisme', header: 'Mekanisme', render: (r) => r.mekanisme },
    { key: 'asesor', header: 'Asesor', render: (r) => r.asesor },
    { key: 'skor', header: 'Skor (terproteksi)', render: (r) => <span className="font-extrabold text-[var(--sd-primary)]">{r.skor.toFixed(2)}</span> },
  ];

  return (
    <ModuleScreenShell moduleDef={moduleDef} groupLabel={MODULE_GROUPS[moduleDef.group].label} spec={spec} activeScreen={activeScreen} onScreenChange={onSubPathChange}
      headerActions={
        <Select
          value={selected.poldaId}
          onChange={(v) => setSelected(SPIP_SATKER_DATA.find((s) => s.poldaId === v) || SPIP_SATKER_DATA[0])}
          options={SPIP_SATKER_DATA.map((s) => ({ value: s.poldaId, label: s.namaSatker }))}
          className="w-56"
        />
      }
    >
      {activeScreen === 'ruang-pm' && (
        <div className="grid lg:grid-cols-2 gap-4">
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-3 flex items-center gap-1.5"><ShieldCheck className="w-4 h-4" /> Penetapan Tusi Asesor</Typography>
            <ul className="space-y-2">
              {SPIP_ASSESSOR_ROLES.map((r, i) => (
                <li key={r.id} className="flex items-center justify-between rounded-[10px] border border-slate-100 bg-white p-2.5">
                  <div>
                    <div className="text-xs font-bold text-slate-800">{r.kode} — {r.label}</div>
                    <div className="text-[11px] text-slate-400">{selected.tusiAsesor[i]?.nama}</div>
                  </div>
                  <Badge color="primary">{r.kode}</Badge>
                </li>
              ))}
            </ul>
          </Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-3">Mekanisme Asesmen</Typography>
            <ul className="space-y-2">
              {SPIP_ASSESSMENT_MECHANISMS.map((m) => (
                <li key={m.id} className="flex items-center gap-2 text-xs">
                  <span className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: m.color }} />
                  <span className="font-semibold text-slate-700">{m.label}</span>
                </li>
              ))}
            </ul>
            {selected.sesiEditAktif && (
              <div className="mt-3 flex items-center gap-2 rounded-[10px] bg-[var(--sd-warning-container)] px-3 py-2 text-xs text-amber-800 font-semibold">
                <Clock className="w-3.5 h-3.5" /> Sesi edit aktif oleh {selected.sesiEditAktif.user} — sisa {selected.sesiEditAktif.sisaMenit} dari {SPIP_SESI_EDIT_MENIT} menit
              </div>
            )}
          </Card>
        </div>
      )}

      {activeScreen === 'kk-penetapan-tujuan' && (
        <Card><Table columns={kkColumns(kkForCodes(selected, ['KK1', 'KK2']))} data={kkForCodes(selected, ['KK1', 'KK2'])} rowKey={(r) => r.kode} /></Card>
      )}
      {activeScreen === 'kk-struktur-proses' && (
        <Card><Table columns={kkColumns(kkForCodes(selected, ['KK3', 'KK4']))} data={kkForCodes(selected, ['KK3', 'KK4'])} rowKey={(r) => r.kode} /></Card>
      )}
      {activeScreen === 'kk-pencapaian-tujuan' && (
        <Card><Table columns={kkColumns(kkForCodes(selected, ['KK5', 'KK6', 'KK7', 'KK9']))} data={kkForCodes(selected, ['KK5', 'KK6', 'KK7', 'KK9'])} rowKey={(r) => r.kode} /></Card>
      )}

      {activeScreen === 'penyimpulan-maturitas' && (
        <div className="grid lg:grid-cols-3 gap-4">
          {[
            { title: 'KKLEAD I', sub: 'Penetapan Tujuan', value: selected.nilaiKKLEAD_I, warn: false },
            { title: 'KKLEAD II', sub: 'Struktur & Proses', value: selected.nilaiKKLEAD_II, warn: false },
            { title: 'KKLEAD III', sub: 'Pencapaian Tujuan', value: selected.nilaiKKLEAD_III, warn: selected.penaltiKK4 },
          ].map((c) => (
            <Card key={c.title}>
              <div className="text-[10px] font-bold uppercase text-slate-400">{c.title}</div>
              <div className="text-xs text-slate-500 mb-2">{c.sub}</div>
              <div className="text-2xl font-extrabold text-slate-900">{c.value.toFixed(2)}</div>
              {c.warn && <Badge color="danger" className="mt-2">Penalti KK4</Badge>}
            </Card>
          ))}
          <Card className="lg:col-span-3">
            <div className="flex items-center justify-between">
              <div>
                <Typography variant="label-bold" className="text-slate-700">KKLEAD_SPIP — Penyimpulan Level Maturitas</Typography>
                <div className="text-3xl font-extrabold text-[var(--sd-primary)] mt-1">{selected.nilaiFinal.toFixed(2)}</div>
              </div>
              <Badge color={LEVEL_COLOR[Math.min(5, Math.round(selected.nilaiFinal))]} size="lg">Level {selected.levelMaturitas} — {selected.levelLabel}</Badge>
            </div>
            <ProgressBar className="mt-3" label="Progres Level Maturitas (skala 0-5)" value={selected.nilaiFinal} max={5} />
            <div className="mt-3">
              <Badge color={selected.statusPenyimpulan === 'Final' ? 'success' : 'warning'}>{selected.statusPenyimpulan}</Badge>
            </div>
          </Card>
        </div>
      )}
    </ModuleScreenShell>
  );
};

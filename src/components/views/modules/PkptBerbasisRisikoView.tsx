/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.13 PKPT Berbasis Risiko. Screen: Skoring Risiko / Peringkat Prioritas / Draf PKPT
 * (Plan bagian 4). SF-001..005: form 6 faktor risiko dengan skor tertimbang read-only,
 * tabel peringkat + ambang, form kegiatan PKPT, progress bar kapasitas OH + alert.
 */
import React, { useMemo, useState } from 'react';
import { AlertTriangle, ListOrdered } from 'lucide-react';
import type { CurrentUserProfile, PoldaSatker } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import { PKPT_2026, TOTAL_KAPASITAS_OH_TAHUNAN, type PkptEntry } from '../../../data/modules/lanjutan/perencanaan';
import { PKPT_RISK_FACTORS } from '../../../data/modules/lanjutan/constants';
import {
  Badge,
  Card,
  ForbiddenState,
  ProgressBar,
  Select,
  StatCard,
  Table,
  Typography,
  type BadgeColor,
  type TableColumn,
} from '../../ui';

/** Tim audit (pengawas/ketua tim/auditor) hanya dapat MELIHAT peringkat prioritas — konfigurasi
 * ambang skor tinggi adalah kewenangan Pimpinan/Koordinator/Super Admin (Plan bagian 6: tab admin-
 * only menampilkan ForbiddenState, bukan menyembunyikan modulnya). */
function canConfigureB13(currentUser?: CurrentUserProfile): boolean {
  if (!currentUser) return true;
  return !['pengawas_tim', 'ketua_tim', 'auditor'].includes(currentUser.peran);
}

const JENIS_COLOR: Record<string, BadgeColor> = {
  'Berbasis Risiko': 'primary',
  Mandatori: 'warning',
  'Usulan Pimpinan': 'indigo',
};

interface PkptBerbasisRisikoViewProps {
  currentUser: CurrentUserProfile;
  poldaList: PoldaSatker[];
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

export const PkptBerbasisRisikoView: React.FC<PkptBerbasisRisikoViewProps> = ({ currentUser, subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b13')!;
  const spec = getModuleSpec('b13')!;
  const activeScreen = subPath || getDefaultScreenSlug('b13') || spec.screens[0].slug;
  const canConfigureAmbang = canConfigureB13(currentUser);

  const [selectedEntry, setSelectedEntry] = useState<PkptEntry>(PKPT_2026[0]);
  const [ambangTinggi, setAmbangTinggi] = useState(3.5);

  const totalUsulanOh = useMemo(() => PKPT_2026.filter((p) => p.disahkan).reduce((s, p) => s + p.usulanTimOh, 0), []);
  const persenKapasitas = Math.round((totalUsulanOh / TOTAL_KAPASITAS_OH_TAHUNAN) * 100);

  const columns: TableColumn<PkptEntry>[] = [
    { key: 'peringkat', header: '#', render: (r) => <span className="font-extrabold text-slate-400">{r.peringkat}</span> },
    { key: 'nama', header: 'Nama Auditi', render: (r) => <button onClick={() => setSelectedEntry(r)} className="font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline text-left">{r.namaAuditi}</button> },
    { key: 'skor', header: 'Skor Tertimbang', render: (r) => (
      <span className={`font-extrabold ${r.skorTertimbang >= ambangTinggi ? 'text-[var(--sd-error)]' : 'text-slate-700'}`}>{r.skorTertimbang.toFixed(2)}</span>
    ) },
    { key: 'jenis', header: 'Jenis Kegiatan', render: (r) => <Badge color={JENIS_COLOR[r.jenisKegiatan]}>{r.jenisKegiatan}</Badge> },
    { key: 'waktu', header: 'Waktu Pelaksanaan', render: (r) => r.waktuPelaksanaan },
    { key: 'disahkan', header: 'Status', render: (r) => <Badge color={r.disahkan ? 'success' : 'neutral'}>{r.disahkan ? 'Disahkan' : 'Draf'}</Badge> },
  ];

  return (
    <ModuleScreenShell moduleDef={moduleDef} groupLabel={MODULE_GROUPS[moduleDef.group].label} spec={spec} activeScreen={activeScreen} onScreenChange={onSubPathChange}>
      {activeScreen === 'skoring-risiko' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 space-y-3">
            <Typography variant="label-bold" className="text-slate-700">Form 6 Faktor Risiko — {selectedEntry.namaAuditi}</Typography>
            <div className="space-y-2.5">
              {PKPT_RISK_FACTORS.map((f) => {
                const score = selectedEntry.factorScores.find((s) => s.factorId === f.id)?.skor ?? 1;
                return (
                  <div key={f.id} className="flex items-center gap-3">
                    <div className="w-40 shrink-0 text-xs font-semibold text-slate-600">{f.label} <span className="text-slate-400">({(f.bobot * 100).toFixed(0)}%)</span></div>
                    <div className="flex-1"><ProgressBar value={score} max={5} showValue={false} /></div>
                    <span className="w-10 text-right text-xs font-extrabold text-slate-800">{score}/5</span>
                    <span className="w-14 text-right text-[11px] text-slate-400">{(score * f.bobot).toFixed(2)}</span>
                  </div>
                );
              })}
            </div>
            <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
              <span className="text-xs font-bold text-slate-500">Skor Tertimbang Total (read-only)</span>
              <span className="text-2xl font-extrabold text-[var(--sd-primary)]">{selectedEntry.skorTertimbang.toFixed(2)}</span>
            </div>
          </Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Pilih Auditi</Typography>
            <select
              className="w-full h-10 rounded-[10px] border border-[var(--sd-outline-variant)] px-3 text-sm mb-3"
              value={selectedEntry.id}
              onChange={(e) => setSelectedEntry(PKPT_2026.find((p) => p.id === e.target.value) || PKPT_2026[0])}
            >
              {PKPT_2026.map((p) => <option key={p.id} value={p.id}>{p.namaAuditi}</option>)}
            </select>
            <div className="text-[11px] text-slate-500 leading-relaxed">
              Skor tertimbang dihitung otomatis dari 6 faktor x bobot masing-masing (total bobot 1,00) dan tidak dapat diubah manual — hanya nilai per faktor yang dapat disunting oleh Tim Perencanaan.
            </div>
          </Card>
        </div>
      )}

      {activeScreen === 'peringkat-prioritas' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Kandidat PKPT" value={PKPT_2026.length} />
            <StatCard label="Disahkan" value={PKPT_2026.filter((p) => p.disahkan).length} />
            <StatCard label="Di Atas Ambang Tinggi" value={PKPT_2026.filter((p) => p.skorTertimbang >= ambangTinggi).length} />
            {canConfigureAmbang ? (
              <Card className="flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-slate-400 shrink-0" />
                <div className="flex-1">
                  <label className="text-[10px] font-bold uppercase text-slate-400">Ambang Skor Tinggi</label>
                  <input type="number" step="0.1" min={1} max={5} value={ambangTinggi} onChange={(e) => setAmbangTinggi(Number(e.target.value))} className="w-full text-sm font-bold outline-none" />
                </div>
              </Card>
            ) : (
              <Card className="flex items-center justify-center p-2">
                <ForbiddenState title="Konfigurasi Terkunci" description="Hanya Pimpinan/Koordinator/Super Admin." className="py-1" />
              </Card>
            )}
          </div>
          <Card>
            <Table columns={columns} data={PKPT_2026} rowKey={(r) => r.id} />
          </Card>
        </div>
      )}

      {activeScreen === 'draf-pkpt' && (
        <div className="grid lg:grid-cols-3 gap-4">
          <Card className="lg:col-span-2 space-y-3">
            <Typography variant="label-bold" className="text-slate-700">Form Kegiatan PKPT — {selectedEntry.namaAuditi}</Typography>
            <div className="grid sm:grid-cols-2 gap-3 text-xs">
              <div><div className="text-slate-400 font-bold uppercase text-[10px]">Jenis Kegiatan</div><Badge color={JENIS_COLOR[selectedEntry.jenisKegiatan]} className="mt-1">{selectedEntry.jenisKegiatan}</Badge></div>
              <div><div className="text-slate-400 font-bold uppercase text-[10px]">Sifat Audit</div><div className="font-bold text-slate-800 mt-1">{selectedEntry.sifatAudit}</div></div>
              <div><div className="text-slate-400 font-bold uppercase text-[10px]">Tujuan Audit</div><div className="text-slate-700 mt-1">{selectedEntry.tujuanAudit}</div></div>
              <div><div className="text-slate-400 font-bold uppercase text-[10px]">Sasaran Audit</div><div className="text-slate-700 mt-1">{selectedEntry.sasaranAudit}</div></div>
              <div><div className="text-slate-400 font-bold uppercase text-[10px]">Waktu Pelaksanaan</div><div className="font-bold text-slate-800 mt-1">{selectedEntry.waktuPelaksanaan}</div></div>
              <div><div className="text-slate-400 font-bold uppercase text-[10px]">Hari Pengawasan (HP)</div><div className="font-bold text-slate-800 mt-1">{selectedEntry.hpMinggu} minggu</div></div>
              <div><div className="text-slate-400 font-bold uppercase text-[10px]">Anggaran Usulan</div><div className="font-bold text-slate-800 mt-1">{selectedEntry.anggaranUsulan}</div></div>
              <div><div className="text-slate-400 font-bold uppercase text-[10px]">Usulan Tim (OH)</div><div className="font-bold text-slate-800 mt-1">{selectedEntry.usulanTimOh} OH</div></div>
            </div>
            {selectedEntry.jenisKegiatan !== 'Berbasis Risiko' && (
              <div className="rounded-[10px] bg-[var(--sd-warning-container)] p-3 text-xs text-amber-800">
                <span className="font-bold">Justifikasi wajib ({selectedEntry.jenisKegiatan}):</span> {selectedEntry.justifikasi}
              </div>
            )}
          </Card>
          <Card>
            <Typography variant="label-bold" className="text-slate-700 mb-2">Kapasitas OH Tim Audit T.A. 2026</Typography>
            <ProgressBar label="Terpakai" value={totalUsulanOh} max={TOTAL_KAPASITAS_OH_TAHUNAN} color={persenKapasitas > 100 ? '#BA1A1A' : undefined} />
            <div className="text-[11px] text-slate-500 mt-2">{totalUsulanOh.toLocaleString('id-ID')} dari {TOTAL_KAPASITAS_OH_TAHUNAN.toLocaleString('id-ID')} OH ({persenKapasitas}%)</div>
            {persenKapasitas > 100 && (
              <div className="mt-3 flex items-start gap-2 rounded-[10px] bg-[var(--sd-error-container)] p-3 text-xs text-[var(--sd-error)] font-semibold">
                <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5" />
                Kapasitas OH tim audit terlampaui. Prioritaskan kegiatan berskor risiko tinggi atau ajukan penambahan tim.
              </div>
            )}
          </Card>
        </div>
      )}
    </ModuleScreenShell>
  );
};

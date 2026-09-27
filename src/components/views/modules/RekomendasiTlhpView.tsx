/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.16 Manajemen Rekomendasi & TLHP. Screen: Rekap Lintas Sumber / Detail & Aging /
 * Verifikasi Bukti (Plan bagian 4). SF-001..004: tabel rekap tersinkron B.2/B.3 (read-only),
 * badge aging harian + Kritis (>730 hari), antrean verifikasi, badge Temuan Berulang.
 */
import React, { useState } from 'react';
import type { CurrentUserProfile, PoldaSatker } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import { TLHP_DATA, type TlhpEntry } from '../../../data/modules/lanjutan/spipTlhp';
import { TLHP_AMBANG_KRITIS_HARI } from '../../../data/modules/lanjutan/constants';
import { Badge, Button, Card, FilterPanel, StatCard, Table, Typography, type BadgeColor, type TableColumn } from '../../ui';

const AGING_COLOR: Record<TlhpEntry['statusAging'], BadgeColor> = { Normal: 'success', Perhatian: 'warning', Kritis: 'danger' };
const TLHP_STATUS_COLOR: Record<TlhpEntry['statusTlhp'], BadgeColor> = { 'Belum Ditindaklanjuti': 'danger', 'Dalam Proses': 'warning', Selesai: 'success' };

interface RekomendasiTlhpViewProps {
  currentUser: CurrentUserProfile;
  poldaList: PoldaSatker[];
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

export const RekomendasiTlhpView: React.FC<RekomendasiTlhpViewProps> = ({ subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b16')!;
  const spec = getModuleSpec('b16')!;
  const activeScreen = subPath || getDefaultScreenSlug('b16') || spec.screens[0].slug;
  const [sumberFilter, setSumberFilter] = useState('');
  const [selected, setSelected] = useState<TlhpEntry>(TLHP_DATA[0]);

  const filtered = sumberFilter ? TLHP_DATA.filter((t) => t.sumber === sumberFilter) : TLHP_DATA;
  const kritisCount = TLHP_DATA.filter((t) => t.statusAging === 'Kritis').length;
  const berulangCount = TLHP_DATA.filter((t) => t.temuanBerulang).length;
  const antrean = TLHP_DATA.filter((t) => t.buktiDiunggah && t.verifikasi);

  const columns: TableColumn<TlhpEntry>[] = [
    { key: 'judul', header: 'Rekomendasi', render: (r) => (
      <button onClick={() => setSelected(r)} className="text-left font-bold text-slate-800 hover:text-[var(--sd-primary)] hover:underline">
        {r.judulRekomendasi}
        {r.temuanBerulang && <Badge color="warning" className="ml-2">Temuan Berulang</Badge>}
      </button>
    ) },
    { key: 'satker', header: 'Satker', render: (r) => r.namaSatker },
    { key: 'sumber', header: 'Sumber', render: (r) => <Badge color="primary">{r.sumber}</Badge> },
    { key: 'usia', header: 'Usia (Hari)', render: (r) => <span className="font-mono">{r.usiaHari}</span> },
    { key: 'aging', header: 'Status Aging', render: (r) => <Badge color={AGING_COLOR[r.statusAging]}>{r.statusAging}</Badge> },
    { key: 'status', header: 'Status TLHP', render: (r) => <Badge color={TLHP_STATUS_COLOR[r.statusTlhp]}>{r.statusTlhp}</Badge> },
  ];

  return (
    <ModuleScreenShell moduleDef={moduleDef} groupLabel={MODULE_GROUPS[moduleDef.group].label} spec={spec} activeScreen={activeScreen} onScreenChange={onSubPathChange}>
      {activeScreen === 'rekap-lintas-sumber' && (
        <div className="space-y-4">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
            <StatCard label="Total Rekomendasi" value={TLHP_DATA.length} />
            <StatCard label="Status Kritis (>730 Hari)" value={kritisCount} />
            <StatCard label="Temuan Berulang" value={berulangCount} />
            <StatCard label="Menunggu Verifikasi" value={antrean.length} />
          </div>
          <FilterPanel
            fields={[{ type: 'select', key: 'sumber', label: 'Sumber', value: sumberFilter, onChange: setSumberFilter, placeholder: 'Semua Sumber', options: ['Audit Polri', 'BPK RI', 'Irsus'].map((s) => ({ value: s, label: s })) }]}
          />
          <Card><Table columns={columns} data={filtered} rowKey={(r) => r.id} /></Card>
        </div>
      )}

      {activeScreen === 'detail-aging' && (
        <Card className="max-w-2xl space-y-3">
          <Typography variant="label-bold" className="text-slate-700">{selected.judulRekomendasi}</Typography>
          <div className="grid sm:grid-cols-2 gap-3 text-xs">
            <div><div className="text-[10px] font-bold uppercase text-slate-400">Satker</div><div className="font-bold text-slate-800">{selected.namaSatker}</div></div>
            <div><div className="text-[10px] font-bold uppercase text-slate-400">Sumber</div><Badge color="primary">{selected.sumber}</Badge></div>
            <div><div className="text-[10px] font-bold uppercase text-slate-400">Tanggal Rekomendasi</div><div className="font-bold text-slate-800">{selected.tanggalRekomendasi}</div></div>
            <div><div className="text-[10px] font-bold uppercase text-slate-400">Usia</div><div className="font-bold text-slate-800">{selected.usiaHari} hari (ambang Kritis {TLHP_AMBANG_KRITIS_HARI} hari)</div></div>
          </div>
          <div className="flex items-center gap-2">
            <Badge color={AGING_COLOR[selected.statusAging]} size="lg">{selected.statusAging}</Badge>
            {selected.temuanBerulang && <Badge color="warning" size="lg">Temuan Berulang</Badge>}
          </div>
          <select className="w-full h-9 rounded-[8px] border border-[var(--sd-outline-variant)] px-2 text-xs" value={selected.id} onChange={(e) => setSelected(TLHP_DATA.find((t) => t.id === e.target.value) || TLHP_DATA[0])}>
            {TLHP_DATA.map((t) => <option key={t.id} value={t.id}>{t.judulRekomendasi} — {t.namaSatker}</option>)}
          </select>
        </Card>
      )}

      {activeScreen === 'verifikasi-bukti' && (
        <Card>
          <Typography variant="label-bold" className="text-slate-700 mb-3">Antrean Verifikasi Bukti Tindak Lanjut</Typography>
          <Table
            columns={[
              { key: 'judul', header: 'Rekomendasi', render: (r: TlhpEntry) => <span className="font-bold">{r.judulRekomendasi}</span> },
              { key: 'satker', header: 'Satker', render: (r: TlhpEntry) => r.namaSatker },
              { key: 'catatan', header: 'Catatan Verifikator', render: (r: TlhpEntry) => <span className="text-xs text-slate-500">{r.verifikasi?.catatan}</span> },
              { key: 'hasil', header: 'Hasil Sementara', render: (r: TlhpEntry) => <Badge color={r.verifikasi?.hasil === 'Selesai' ? 'success' : 'warning'}>{r.verifikasi?.hasil}</Badge> },
              { key: 'aksi', header: 'Aksi', render: () => (
                <div className="flex gap-2"><Button size="sm" variant="outline">Kembalikan (Dalam Proses)</Button><Button size="sm">Tandai Selesai</Button></div>
              ) },
            ]}
            data={antrean}
            rowKey={(r) => r.id}
          />
        </Card>
      )}
    </ModuleScreenShell>
  );
};

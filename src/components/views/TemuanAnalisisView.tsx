/**
 * B.2 / B.3 — analisis temuan di atas ledger deterministik.
 * Mempertahankan tabel operasional PengawasanTemuanView dan menambahkan 6 KPI,
 * distribusi, Pareto akar masalah, temuan baru vs berulang, dan rekomendasi berbasis aturan.
 */
import React, { useMemo, useState } from 'react';
import { PengawasanTemuanView } from './PengawasanTemuanView';
import type { CurrentUserProfile, PoldaSatker } from '../../types';
import {
  AKAR_MASALAH,
  FINDINGS_LEDGER,
  baruVsBerulang,
  byItwil,
  byPolda,
  paretoAkarMasalah,
  type FindingRecord,
} from '../../data/domain/findingsLedger';
import { DataIntegrationNotice } from '../ui/DataIntegrationNotice';
import {
  Card,
  DonutChart,
  HorizontalMetricChart,
  StatCard,
  Table,
  Typography,
  Badge,
  usePagination,
  Pagination,
} from '../ui';
import { FadeInUp } from '../ui/motion';

interface TemuanAnalisisViewProps {
  poldaList: PoldaSatker[];
  initialPoldaFilter?: string;
  currentUser?: CurrentUserProfile;
  initialTab?: 'polri' | 'bpk' | 'irsus' | 'penugasan';
}

function sumberFromTab(tab?: TemuanAnalisisViewProps['initialTab']): FindingRecord['sumber'] | 'all' {
  if (tab === 'bpk') return 'BPK RI';
  if (tab === 'irsus') return 'Irsus';
  if (tab === 'polri') return 'Audit Polri';
  return 'all';
}

function rekomendasiAturan(rows: FindingRecord[]): string[] {
  const { berulang } = baruVsBerulang(rows);
  const overdue = rows.filter((r) => r.statusTL !== 'Selesai').length;
  const kritis = rows.filter((r) => r.tingkat === 'Kritis' && r.statusTL !== 'Selesai');
  const topAkar = paretoAkarMasalah(rows)[0];
  const out: string[] = [];
  if (kritis.length > 0) {
    out.push(`Prioritaskan ${kritis.length} temuan kritis yang belum selesai; tetapkan penanggung jawab satker dan bukti koreksi dalam 14 hari kerja.`);
  }
  if (berulang.length > 0) {
    out.push(`${berulang.length} temuan berulang — uji efektivitas pengendalian intern, bukan hanya kelengkapan administrasi.`);
  }
  if (topAkar) {
    out.push(`Akar masalah teratas: ${topAkar.akar} (${topAkar.jumlah} kasus). Masukkan ke PKPT sebagai objek berbasis risiko.`);
  }
  if (overdue > rows.length * 0.4) {
    out.push('Proporsi temuan terbuka di atas 40%. Percepat verifikasi bukti TLHP (B.16) dan aktifkan Early Warning (B.18).');
  }
  if (out.length === 0) {
    out.push('Tidak ada eskalasi otomatis. Pertahankan siklus pemantauan triwulanan dan rekonsiliasi ledger dengan SIPTL BPK.');
  }
  return out;
}

export const TemuanAnalisisView: React.FC<TemuanAnalisisViewProps> = ({
  poldaList,
  initialPoldaFilter,
  currentUser,
  initialTab,
}) => {
  const sumber = sumberFromTab(initialTab);
  const [poldaFilter, setPoldaFilter] = useState(initialPoldaFilter && initialPoldaFilter !== 'all' ? initialPoldaFilter : 'all');

  const scoped = useMemo(() => {
    let rows = FINDINGS_LEDGER;
    if (currentUser?.level === 'L1' && currentUser.titikWilayahId?.startsWith('itwil-')) {
      rows = byItwil(currentUser.titikWilayahId);
    } else if (currentUser?.level === 'L2' && currentUser.titikWilayahId?.startsWith('polda-')) {
      rows = byPolda(currentUser.titikWilayahId);
    }
    if (poldaFilter !== 'all') rows = rows.filter((r) => r.satkerId === poldaFilter);
    if (sumber !== 'all') rows = rows.filter((r) => r.sumber === sumber);
    return rows;
  }, [currentUser, poldaFilter, sumber]);

  const split = baruVsBerulang(scoped);
  const selesai = scoped.filter((r) => r.statusTL === 'Selesai').length;
  const proses = scoped.filter((r) => r.statusTL === 'Dalam Proses').length;
  const belum = scoped.filter((r) => r.statusTL === 'Belum Ditindaklanjuti').length;
  const nilaiTerbuka = scoped.filter((r) => r.statusTL !== 'Selesai').reduce((s, r) => s + r.nilai, 0);
  const pareto = paretoAkarMasalah(scoped).slice(0, 8);
  const maxPareto = pareto[0]?.jumlah || 1;
  const distSumber = [
    { id: 'polri', label: 'Audit Polri', value: scoped.filter((r) => r.sumber === 'Audit Polri').length, color: '#0B2B5C' },
    { id: 'bpk', label: 'BPK RI', value: scoped.filter((r) => r.sumber === 'BPK RI').length, color: '#0B4A8A' },
    { id: 'irsus', label: 'Irsus', value: scoped.filter((r) => r.sumber === 'Irsus').length, color: '#F59E0B' },
  ].filter((d) => d.value > 0);
  const recs = rekomendasiAturan(scoped);
  const { page, pageSize, setPage, pageItems } = usePagination(split.berulang, 6);

  return (
    <div className="space-y-4">
      <FadeInUp>
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3">
          <StatCard label="Total Temuan" value={scoped.length.toLocaleString('id-ID')} />
          <StatCard label="Belum Ditindaklanjuti" value={belum.toLocaleString('id-ID')} change={{ direction: belum > 0 ? 'down' : 'flat', label: 'antrean terbuka' }} />
          <StatCard label="Dalam Proses" value={proses.toLocaleString('id-ID')} />
          <StatCard label="Selesai" value={selesai.toLocaleString('id-ID')} />
          <StatCard label="Temuan Berulang" value={split.berulang.length.toLocaleString('id-ID')} />
          <StatCard
            label="Nilai Terbuka"
            value={`Rp ${(nilaiTerbuka / 1_000_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} M`}
          />
        </div>
      </FadeInUp>

      <div className="flex flex-wrap items-center gap-2">
        <label className="text-[10px] font-bold uppercase text-slate-400">Polda</label>
        <select
          className="h-9 rounded-lg border border-slate-200 px-2 text-xs font-semibold"
          value={poldaFilter}
          onChange={(e) => setPoldaFilter(e.target.value)}
        >
          <option value="all">Seluruh Polda</option>
          {poldaList.map((p) => (
            <option key={p.id} value={p.id}>{p.nama}</option>
          ))}
        </select>
        <DataIntegrationNotice variant="badge" sumber="SIPTL BPK / IRSUS / Audit Polri" />
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <Card>
          <Typography variant="label-bold" className="text-slate-700 mb-3">Distribusi Temuan</Typography>
          {distSumber.length > 0 ? (
            <DonutChart segments={distSumber} centerLabel="Temuan" centerValue={String(scoped.length)} />
          ) : (
            <p className="text-xs text-slate-500">Tidak ada temuan pada filter ini.</p>
          )}
        </Card>
        <Card>
          <Typography variant="label-bold" className="text-slate-700 mb-3">Analisis Akar Masalah (Pareto)</Typography>
          <HorizontalMetricChart
            items={pareto.map((p, i) => ({
              id: `akar-${i}`,
              label: p.akar,
              percent: Math.round((p.jumlah / maxPareto) * 100),
              displayValue: `${p.jumlah} kasus`,
              color: i === 0 ? '#0B2B5C' : '#64748b',
            }))}
          />
        </Card>
      </div>

      <Card>
        <Typography variant="label-bold" className="text-slate-700 mb-2">Temuan Serupa — Baru vs Berulang</Typography>
        <p className="text-xs text-slate-500 mb-3">
          Baru {split.baru.length.toLocaleString('id-ID')} · Berulang {split.berulang.length.toLocaleString('id-ID')}
        </p>
        <Table
          columns={[
            { key: 'kode', header: 'Kode', render: (r: FindingRecord) => r.kode },
            { key: 'satker', header: 'Satker', render: (r: FindingRecord) => r.satkerNama },
            { key: 'judul', header: 'Judul', render: (r: FindingRecord) => r.judul },
            { key: 'akar', header: 'Akar Masalah', render: (r: FindingRecord) => r.akarMasalah },
            { key: 'status', header: 'Status TL', render: (r: FindingRecord) => <Badge color={r.statusTL === 'Selesai' ? 'success' : r.statusTL === 'Dalam Proses' ? 'warning' : 'danger'}>{r.statusTL}</Badge> },
          ]}
          data={pageItems}
          rowKey={(r) => r.id}
          emptyLabel="Tidak ada temuan berulang pada filter ini"
        />
        {split.berulang.length > pageSize && (
          <Pagination currentPage={page} totalItems={split.berulang.length} pageSize={pageSize} onPageChange={setPage} align="end" />
        )}
      </Card>

      <Card>
        <Typography variant="label-bold" className="text-slate-700 mb-2">Rekomendasi berbasis aturan</Typography>
        <ul className="list-disc pl-4 space-y-1.5 text-xs text-slate-600">
          {recs.map((r) => (
            <li key={r}>{r}</li>
          ))}
        </ul>
        <p className="mt-3 text-[10px] text-slate-400 font-mono">Akar masalah kanonik: {AKAR_MASALAH.length} sebab</p>
      </Card>

      <PengawasanTemuanView
        poldaList={poldaList}
        initialPoldaFilter={initialPoldaFilter}
        currentUser={currentUser}
        initialTab={initialTab}
      />
    </div>
  );
};

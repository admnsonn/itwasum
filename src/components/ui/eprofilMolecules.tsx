/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 4 molecule berulang E-Profile (Plan bagian 5a/todo `shared-eprofil-molecules`), dipakai pada
 * setiap tab detail B.1 dan bisa dipakai ulang pada modul lain yang menampilkan analisis AI per
 * satker (mengikuti pola `evidence/satu-data-itwasum-frontend` origin/development, ditulis ulang
 * dengan tangan — bukan salinan file).
 */
import React, { useState } from 'react';
import { Sparkles, FileText, Download } from 'lucide-react';
import { cn } from './cn';
import { Badge, CircularProgress, RiskPriorityBadge, Typography } from './atoms';
import { Table, TableColumn, Pagination, usePagination, Search } from './molecules';
import type { EProfilRekomendasi, EProfilSumberDataItem, EProfilTemuanAi } from '../../data/eprofil/types';

/* ============================== RingkasanAnalisisAi ============================== */

export interface RingkasanAnalisisAiProps {
  deskripsi: string;
  penekanan: string[];
  highlightChips: string[];
  confidence: number;
  canView: boolean;
  className?: string;
}

export const RingkasanAnalisisAi: React.FC<RingkasanAnalisisAiProps> = ({ deskripsi, penekanan, highlightChips, confidence, canView, className }) => {
  if (!canView) {
    return (
      <div className={cn('rounded-[14px] border border-[var(--sd-outline-variant)]/60 bg-slate-50 p-4 text-xs text-slate-500', className)}>
        Ringkasan Analisis AI tidak tersedia untuk peran Anda.
      </div>
    );
  }
  return (
    <div
      className={cn(
        'rounded-[14px] p-5 text-white shadow-[0_4px_20px_rgba(0,34,101,0.25)] flex flex-col sm:flex-row items-start gap-4',
        className
      )}
      style={{ background: 'linear-gradient(135deg, var(--sd-primary) 0%, var(--sd-primary-container) 100%)' }}
    >
      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-2">
          <Sparkles className="w-4 h-4" />
          <Typography variant="label-bold" className="!text-white uppercase tracking-wide">Ringkasan Analisis AI</Typography>
        </div>
        <p className="text-sm leading-relaxed text-white/90">{deskripsi}</p>
        {penekanan.length > 0 && (
          <ul className="mt-3 space-y-1">
            {penekanan.map((p, i) => (
              <li key={i} className="text-xs text-white/80 flex items-start gap-2">
                <span className="w-1 h-1 rounded-full bg-white/70 mt-1.5 shrink-0" />
                {p}
              </li>
            ))}
          </ul>
        )}
        {highlightChips.length > 0 && (
          <div className="mt-3 flex flex-wrap gap-1.5">
            {highlightChips.map((chip) => (
              <span key={chip} className="px-2.5 py-1 rounded-full bg-white/15 text-[11px] font-bold text-white">
                {chip}
              </span>
            ))}
          </div>
        )}
      </div>
      <div className="shrink-0 self-center">
        <CircularProgress value={confidence} size={92} strokeWidth={7} caption="Confidence" displayValue={`${confidence}%`} />
      </div>
    </div>
  );
};

/* ============================== AiFindingsTable ============================== */

export interface AiFindingsTableProps {
  variant: 'executive' | 'domain';
  data: EProfilTemuanAi[];
  className?: string;
}

export const AiFindingsTable: React.FC<AiFindingsTableProps> = ({ variant, data, className }) => {
  const columns: TableColumn<EProfilTemuanAi>[] =
    variant === 'executive'
      ? [
          { key: 'rank', header: 'RANK', render: (r) => <span className="font-black text-slate-400">#{r.rank}</span> },
          { key: 'namaTemuan', header: 'NAMA TEMUAN', render: (r) => <span className="font-bold text-slate-800">{r.namaTemuan}</span> },
          { key: 'domain', header: 'DOMAIN', render: (r) => <Badge color="neutral">{r.domain}</Badge> },
          { key: 'dampak', header: 'DAMPAK', render: (r) => <span className="text-slate-600">{r.dampak}</span> },
          { key: 'risiko', header: 'RISIKO', render: (r) => <RiskPriorityBadge level={r.risiko} /> },
          { key: 'aiConfidence', header: 'AI CONFIDENCE', render: (r) => <span className="font-bold text-slate-700">{r.aiConfidence}%</span> },
          { key: 'referensi', header: 'REFERENSI', render: (r) => <span className="text-slate-500">{r.referensi}</span> },
        ]
      : [
          { key: 'namaTemuan', header: 'TEMUAN AI', render: (r) => <span className="font-bold text-slate-800">{r.namaTemuan}</span> },
          { key: 'domain', header: 'KATEGORI', render: (r) => <Badge color="neutral">{r.domain}</Badge> },
          { key: 'dampak', header: 'DAMPAK', render: (r) => <span className="text-slate-600">{r.dampak}</span> },
          { key: 'risiko', header: 'RISIKO', render: (r) => <RiskPriorityBadge level={r.risiko} /> },
          { key: 'aiConfidence', header: 'AI CONFIDENCE', render: (r) => <span className="font-bold text-slate-700">{r.aiConfidence}%</span> },
          { key: 'referensi', header: 'REFERENSI', render: (r) => <span className="text-slate-500">{r.referensi}</span> },
        ];

  return <Table columns={columns} data={data} rowKey={(r) => r.id} className={className} emptyLabel="Belum ada temuan AI." />;
};

/* ============================== AuditRecommendationSection ============================== */

const PRIORITAS_COLOR: Record<EProfilRekomendasi['prioritas'], 'danger' | 'warning' | 'info'> = {
  KRITIS: 'danger',
  TINGGI: 'warning',
  SEDANG: 'info',
};

export interface AuditRecommendationSectionProps {
  data: EProfilRekomendasi[];
  className?: string;
}

export const AuditRecommendationSection: React.FC<AuditRecommendationSectionProps> = ({ data, className }) => (
  <div className={className}>
    <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 mb-3 block">Rekomendasi Audit</Typography>
    <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
      {data.map((rec) => (
        <div key={rec.id} className="rounded-[14px] border border-[var(--sd-outline-variant)]/60 bg-white p-4 shadow-[0_1px_10px_rgba(0,0,0,0.06)]">
          <div className="flex items-start justify-between gap-2 mb-2">
            <span className="text-xs font-bold text-slate-800">{rec.areaPemeriksaan}</span>
            <Badge variant="square" color={PRIORITAS_COLOR[rec.prioritas]}>{rec.prioritas}</Badge>
          </div>
          <div className="text-[10px] font-bold text-slate-400 uppercase mt-2">Alasan AI</div>
          <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{rec.alasanAi}</p>
          <div className="text-[10px] font-bold text-slate-400 uppercase mt-2">Rekomendasi Pemeriksaan</div>
          <p className="text-xs text-slate-600 leading-relaxed mt-0.5">{rec.rekomendasiPemeriksaan}</p>
        </div>
      ))}
    </div>
  </div>
);

/* ============================== AnalysisDataSources ============================== */

export interface AnalysisDataSourcesProps {
  data: EProfilSumberDataItem[];
  className?: string;
}

export const AnalysisDataSources: React.FC<AnalysisDataSourcesProps> = ({ data, className }) => {
  const [search, setSearch] = useState('');
  const filtered = data.filter((d) => d.namaDokumen.toLowerCase().includes(search.toLowerCase()));
  const { pageItems, page, totalPages, setPage } = usePagination(filtered, 4);

  const columns: TableColumn<EProfilSumberDataItem>[] = [
    { key: 'namaDokumen', header: 'NAMA DOKUMEN', render: (r) => (
      <span className="font-bold text-slate-800 flex items-center gap-1.5"><FileText className="w-3.5 h-3.5 text-slate-400" />{r.namaDokumen}</span>
    ) },
    { key: 'updateTerakhir', header: 'UPDATE TERAKHIR', render: (r) => <span className="text-slate-500">{r.updateTerakhir}</span> },
    { key: 'aksi', header: 'AKSI', render: () => (
      <div className="flex items-center gap-2">
        <button className="text-[11px] font-bold text-[var(--sd-primary)] hover:underline flex items-center gap-1"><FileText className="w-3 h-3" />Lihat Dokumen</button>
        <button className="text-[11px] font-bold text-slate-500 hover:underline flex items-center gap-1"><Download className="w-3 h-3" />Unduh</button>
      </div>
    ) },
  ];

  return (
    <div className={className}>
      <div className="flex items-center justify-between gap-3 mb-3 flex-wrap">
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Sumber Data Analisis</Typography>
        <div className="w-full sm:w-64">
          <Search value={search} onChange={setSearch} placeholder="Cari nama dokumen..." />
        </div>
      </div>
      <Table columns={columns} data={pageItems} rowKey={(r) => r.id} emptyLabel="Dokumen tidak ditemukan." />
      <Pagination currentPage={page} totalItems={filtered.length} pageSize={4} onPageChange={setPage} className="mt-2" />
    </div>
  );
};
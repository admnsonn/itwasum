/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tampilan generik untuk modul-modul baru sesuai SPEKTEK yang belum memiliki halaman bespoke
 * (Plan 2, bagian 2.4 & 2.5). Pola tampilan konsisten di semua modul yang memakainya:
 * header + breadcrumb -> baris KPI -> filter tiga poros -> tabel + grafik tren -> panel narasi
 * & insight -> slide-over detail per baris.
 */

import React, { useMemo, useState } from 'react';
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  ReferenceLine,
  LineChart,
  Line,
} from 'recharts';
import { ChevronRight, Info, Lightbulb, Sparkles, X } from 'lucide-react';
import type { ModuleDefinition } from '../../config/moduleRegistry';
import { MODULE_STATUS_LABEL } from '../../config/moduleRegistry';
import { getGenericModuleContent, type GenericTableRow, type GenericTone } from '../../data/modules/genericModuleData';

const TONE_STYLE: Record<GenericTone, { bg: string; text: string; dot: string }> = {
  aman: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
  perhatian: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
  kritis: { bg: 'bg-rose-50', text: 'text-rose-700', dot: 'bg-rose-500' },
  netral: { bg: 'bg-slate-50', text: 'text-slate-600', dot: 'bg-slate-400' },
};

const STATUS_BADGE: Record<string, string> = {
  inti: 'bg-blue-50 text-blue-700 border-blue-200',
  replikasi: 'bg-purple-50 text-purple-700 border-purple-200',
  baru: 'bg-amber-50 text-amber-700 border-amber-200',
  nyata: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

interface GenericModuleViewProps {
  moduleDef: ModuleDefinition;
  breadcrumbGroupLabel: string;
}

export const GenericModuleView: React.FC<GenericModuleViewProps> = ({ moduleDef, breadcrumbGroupLabel }) => {
  const content = useMemo(() => getGenericModuleContent(moduleDef), [moduleDef]);
  const [bidang, setBidang] = useState(content.filterBidang[0]);
  const [tingkat, setTingkat] = useState(content.filterTingkat[0]);
  const [periode, setPeriode] = useState(content.filterPeriode[0]);
  const [selectedRow, setSelectedRow] = useState<GenericTableRow | null>(null);

  return (
    <div className="space-y-4">
      {/* Header + breadcrumb */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
        <div className="flex items-center gap-1.5 text-[11px] text-slate-500 font-semibold mb-1.5">
          <span>{breadcrumbGroupLabel}</span>
          <ChevronRight className="w-3 h-3" />
          <span className="text-[#0B2B5C]">{moduleDef.kode || 'Overview'}</span>
        </div>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <moduleDef.icon className="w-5 h-5 text-[#0B2B5C]" />
              {moduleDef.label}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">{moduleDef.deskripsi}</p>
          </div>
          <span
            className={`shrink-0 px-2.5 py-1 rounded-lg text-[10px] font-bold border ${STATUS_BADGE[moduleDef.status]}`}
          >
            {MODULE_STATUS_LABEL[moduleDef.status]}
          </span>
        </div>
        <div className="mt-2 flex items-start gap-1.5 text-[10px] text-slate-400 font-mono">
          <Info className="w-3 h-3 shrink-0 mt-0.5" />
          <span>Sumber: {moduleDef.sumberSpek}</span>
        </div>
      </div>

      {/* Baris KPI */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {content.kpis.map((kpi) => {
          const tone = TONE_STYLE[kpi.tone];
          return (
            <div key={kpi.id} className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3.5">
              <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate">{kpi.label}</div>
              <div className="text-xl font-black text-slate-900 mt-1">{kpi.value}</div>
              <div className={`mt-1.5 inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-bold ${tone.bg} ${tone.text}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                {kpi.delta}
              </div>
            </div>
          );
        })}
      </div>

      {/* Filter tiga poros: bidang / tingkat / periode */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-3 flex flex-wrap items-center gap-2">
        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wide mr-1">Filter:</span>
        <FilterSelect label="Bidang" value={bidang} options={content.filterBidang} onChange={setBidang} />
        <FilterSelect label="Tingkat" value={tingkat} options={content.filterTingkat} onChange={setTingkat} />
        <FilterSelect label="Periode" value={periode} options={content.filterPeriode} onChange={setPeriode} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Tabel + grafik tren */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
            <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider mb-3">{content.chartLabel}</h3>
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={content.chart}>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="periode" tick={{ fontSize: 10 }} />
                <YAxis tick={{ fontSize: 10 }} domain={[0, 100]} />
                <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
                <ReferenceLine y={85} stroke="#f59e0b" strokeDasharray="4 4" />
                <Bar dataKey="nilai" fill="#0B2B5C" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between">
              <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider">Data Rinci</h3>
              <span className="text-[10px] text-slate-400 font-semibold">{content.tableRows.length} baris</span>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-xs">
                <thead>
                  <tr className="bg-slate-50 text-[10px] text-slate-400 font-bold uppercase tracking-wide">
                    {content.tableColumns.map((col) => (
                      <th key={col} className="px-3 py-2 text-left whitespace-nowrap">
                        {col}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {content.tableRows.map((row) => {
                    const tone = TONE_STYLE[row.status];
                    return (
                      <tr
                        key={row.id}
                        onClick={() => setSelectedRow(row)}
                        className="border-t border-slate-100 hover:bg-slate-50 cursor-pointer transition-colors"
                      >
                        {row.cols.map((cell, idx) => (
                          <td key={idx} className="px-3 py-2 text-slate-700 whitespace-nowrap">
                            {cell}
                          </td>
                        ))}
                        <td className="px-3 py-2">
                          <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded text-[10px] font-bold ${tone.bg} ${tone.text}`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${tone.dot}`} />
                            {row.statusLabel}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        {/* Panel narasi & insight */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
            <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Sparkles className="w-3.5 h-3.5" />
              Narasi Modul
            </h3>
            <p className="text-xs text-slate-600 leading-relaxed">{content.narrative}</p>
          </div>
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm p-4">
            <h3 className="text-xs font-black text-[#0B2B5C] uppercase tracking-wider mb-2 flex items-center gap-1.5">
              <Lightbulb className="w-3.5 h-3.5" />
              Insight
            </h3>
            <ul className="space-y-2">
              {content.insight.map((item, idx) => (
                <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 shrink-0" />
                  {item}
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>

      {/* Slide-over detail baris (pola SatkerSlideOver, digeneralisasi) */}
      {selectedRow && (
        <>
          <div
            className="fixed inset-0 bg-slate-900/50 z-[60] backdrop-blur-xs"
            onClick={() => setSelectedRow(null)}
          />
          <div className="fixed top-0 right-0 h-full w-full sm:w-[420px] bg-white z-[61] shadow-2xl overflow-y-auto">
            <div className="sticky top-0 bg-[#0B2B5C] text-white px-4 py-3.5 flex items-center justify-between">
              <div>
                <div className="text-[10px] text-blue-200 font-bold uppercase tracking-wide">{moduleDef.kode}</div>
                <div className="font-extrabold text-sm">{selectedRow.cols[0]}</div>
              </div>
              <button
                onClick={() => setSelectedRow(null)}
                className="p-1.5 rounded-lg hover:bg-white/10"
                aria-label="Tutup"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="p-4 space-y-4">
              <span
                className={`inline-flex items-center gap-1 px-2 py-1 rounded text-[10px] font-bold ${TONE_STYLE[selectedRow.status].bg} ${TONE_STYLE[selectedRow.status].text}`}
              >
                <span className={`w-1.5 h-1.5 rounded-full ${TONE_STYLE[selectedRow.status].dot}`} />
                {selectedRow.statusLabel}
              </span>
              <p className="text-xs text-slate-700 leading-relaxed">{selectedRow.detailRingkasan}</p>
              <div className="grid grid-cols-2 gap-2">
                {content.tableColumns.slice(1, -1).map((col, idx) => (
                  <div key={col} className="bg-slate-50 rounded-xl p-2.5">
                    <div className="text-[9px] text-slate-400 font-bold uppercase">{col}</div>
                    <div className="text-xs font-bold text-slate-800 mt-0.5">{selectedRow.cols[idx + 1]}</div>
                  </div>
                ))}
              </div>
              <div>
                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-wide mb-1.5">Catatan</h4>
                <ul className="space-y-1.5">
                  {selectedRow.detailCatatan.map((catatan, idx) => (
                    <li key={idx} className="text-xs text-slate-600 leading-relaxed flex items-start gap-2">
                      <span className="w-1 h-1 rounded-full bg-slate-400 mt-1.5 shrink-0" />
                      {catatan}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

const FilterSelect: React.FC<{
  label: string;
  value: string;
  options: string[];
  onChange: (value: string) => void;
}> = ({ label, value, options, onChange }) => (
  <label className="flex items-center gap-1.5 bg-slate-50 border border-slate-200 rounded-xl px-2.5 py-1.5">
    <span className="text-[9px] font-bold text-slate-400 uppercase">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="text-xs font-bold text-slate-700 bg-transparent outline-none cursor-pointer"
    >
      {options.map((opt) => (
        <option key={opt} value={opt}>
          {opt}
        </option>
      ))}
    </select>
  </label>
);

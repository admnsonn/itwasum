/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Reimplementasi ringan `molecules/Heatmap` + `HeatmapCore` (branch ITWAS-231): grid CSS murni
 * tanpa dependensi baru, dipakai untuk kapasitas/beban per periode. Lihat Plan 2 bagian 2.3.
 */
import React from 'react';

export interface HeatmapCell {
  label: string;
  value: number; // 0-100
}

interface HeatmapProps {
  rows: { label: string; cells: HeatmapCell[] }[];
  columnLabels: string[];
}

function colorForValue(value: number): string {
  if (value >= 85) return 'bg-rose-500';
  if (value >= 65) return 'bg-amber-400';
  if (value >= 40) return 'bg-blue-400';
  return 'bg-emerald-400';
}

export const Heatmap: React.FC<HeatmapProps> = ({ rows, columnLabels }) => (
  <div className="overflow-x-auto">
    <div className="inline-grid gap-1" style={{ gridTemplateColumns: `120px repeat(${columnLabels.length}, minmax(28px, 1fr))` }}>
      <div />
      {columnLabels.map((c) => (
        <div key={c} className="text-[8px] font-bold text-slate-400 text-center truncate">{c}</div>
      ))}
      {rows.map((row) => (
        <React.Fragment key={row.label}>
          <div className="text-[10px] font-bold text-slate-600 truncate pr-2 flex items-center">{row.label}</div>
          {row.cells.map((cell, idx) => (
            <div
              key={idx}
              title={`${cell.label}: ${cell.value}%`}
              className={`h-6 rounded ${colorForValue(cell.value)} opacity-80 hover:opacity-100 transition-opacity`}
            />
          ))}
        </React.Fragment>
      ))}
    </div>
  </div>
);

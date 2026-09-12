/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Wrapper chart recharts untuk design-system baru (Plan bagian 1). Gaya konsisten:
 * grid `#E2E8F0` dashed 4 4, tick 11px bold `#647484`, tooltip kustom, animasi garis
 * dimatikan (`isAnimationActive={false}`) mengikuti pola satu-data-itwasum-frontend.
 */
import React from 'react';
import {
  PieChart,
  Pie,
  Cell,
  Legend,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  RadarChart as ReRadarChart,
  PolarGrid,
  PolarAngleAxis,
  PolarRadiusAxis,
  Radar,
  ScatterChart,
  Scatter,
  ZAxis,
} from 'recharts';
import { cn } from './cn';
import { RiskPriorityBadge } from './atoms';

const AXIS_TICK = { fontSize: 11, fontWeight: 700, fill: '#647484' } as const;
const GRID_STROKE = '#E2E8F0';

function ChartTooltip({ active, payload, label }: any) {
  if (!active || !payload?.length) return null;
  return (
    <div className="rounded-[8px] border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
      {label && <div className="font-bold text-slate-700 mb-1">{label}</div>}
      {payload.map((p: any, i: number) => (
        <div key={i} className="flex items-center gap-1.5">
          <span className="w-2 h-2 rounded-full" style={{ backgroundColor: p.color || p.fill }} />
          <span className="text-slate-500">{p.name}:</span>
          <span className="font-bold text-slate-800">{typeof p.value === 'number' ? p.value.toLocaleString('id-ID') : p.value}</span>
        </div>
      ))}
    </div>
  );
}

/* ============================== DonutChart ============================== */

export interface DonutSegment { id: string; label: string; value: number; color: string }

export const DonutChart: React.FC<{
  segments: DonutSegment[];
  centerLabel?: string;
  centerValue?: string;
  size?: number;
  showLegend?: boolean;
  className?: string;
}> = ({ segments, centerLabel, centerValue, size = 180, showLegend = true, className }) => (
  <div className={cn('flex items-center gap-4', className)}>
    <div className="relative" style={{ width: size, height: size }}>
      <ResponsiveContainer width="100%" height="100%">
        <PieChart>
          <Pie data={segments} dataKey="value" nameKey="label" innerRadius={size * 0.32} outerRadius={size * 0.48} paddingAngle={2} isAnimationActive={false}>
            {segments.map((s) => <Cell key={s.id} fill={s.color} />)}
          </Pie>
          <Tooltip content={<ChartTooltip />} />
        </PieChart>
      </ResponsiveContainer>
      {(centerLabel || centerValue) && (
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
          {centerValue && <span className="text-lg font-extrabold text-slate-800">{centerValue}</span>}
          {centerLabel && <span className="text-[10px] text-slate-400 font-semibold text-center max-w-[90px]">{centerLabel}</span>}
        </div>
      )}
    </div>
    {showLegend && (
      <ul className="space-y-1.5 text-xs">
        {segments.map((s) => (
          <li key={s.id} className="flex items-center gap-2">
            <span className="w-2.5 h-2.5 rounded-[3px] shrink-0" style={{ backgroundColor: s.color }} />
            <span className="text-slate-600">{s.label}</span>
            <span className="font-bold text-slate-800 ml-auto">{s.value.toLocaleString('id-ID')}</span>
          </li>
        ))}
      </ul>
    )}
  </div>
);

/* ============================== TrendLineChart ============================== */

export interface TrendSeries { dataKey: string; label: string; color: string; dashed?: boolean }

export const TrendLineChart: React.FC<{
  data: Record<string, any>[];
  xKey: string;
  series: TrendSeries[];
  height?: number;
  className?: string;
}> = ({ data, xKey, series, height = 220, className }) => (
  <div className={className} style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      <LineChart data={data} margin={{ top: 8, right: 8, left: -12, bottom: 0 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" vertical={false} />
        <XAxis dataKey={xKey} tick={AXIS_TICK} axisLine={{ stroke: GRID_STROKE }} tickLine={false} />
        <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
        <Tooltip content={<ChartTooltip />} />
        {series.map((s) => (
          <Line
            key={s.dataKey}
            type="monotone"
            dataKey={s.dataKey}
            name={s.label}
            stroke={s.color}
            strokeWidth={2}
            strokeDasharray={s.dashed ? '5 4' : undefined}
            dot={false}
            isAnimationActive={false}
          />
        ))}
      </LineChart>
    </ResponsiveContainer>
  </div>
);

/* ============================== HorizontalMetricChart ============================== */

export interface HorizontalMetricItem { id: string; label: string; percent: number; displayValue: string; color: string }

export const HorizontalMetricChart: React.FC<{
  items: HorizontalMetricItem[];
  showTooltip?: boolean;
  className?: string;
}> = ({ items, className }) => (
  <div className={cn('space-y-2.5', className)}>
    {items.map((item) => (
      <div key={item.id}>
        <div className="flex items-center justify-between text-xs mb-1">
          <span className="font-semibold text-slate-600 truncate">{item.label}</span>
          <span className="font-bold text-slate-800 shrink-0 ml-2">{item.displayValue}</span>
        </div>
        <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
          <div className="h-full rounded-full" style={{ width: `${Math.max(0, Math.min(100, item.percent))}%`, backgroundColor: item.color }} />
        </div>
      </div>
    ))}
  </div>
);

/* ============================== SatkerRiskRadar ============================== */

export interface RiskRadarAxis { axis: string; value: number }
export interface RiskFocusItem { id: string; title: string; description: string; score: number; level: 'TINGGI' | 'SEDANG' | 'RENDAH' }

export const SatkerRiskRadar: React.FC<{
  axes: RiskRadarAxis[];
  focusItems: RiskFocusItem[];
  subtitle?: string;
  className?: string;
}> = ({ axes, focusItems, subtitle, className }) => (
  <div className={cn('grid md:grid-cols-2 gap-4', className)}>
    <div>
      {subtitle && <p className="text-xs text-slate-500 mb-2">{subtitle}</p>}
      <div style={{ height: 220 }}>
        <ResponsiveContainer width="100%" height="100%">
          <ReRadarChart data={axes}>
            <PolarGrid stroke={GRID_STROKE} />
            <PolarAngleAxis dataKey="axis" tick={{ fontSize: 10, fill: '#647484' }} />
            <PolarRadiusAxis tick={{ fontSize: 9, fill: '#98A0AC' }} domain={[0, 100]} />
            <Radar dataKey="value" stroke="#002265" fill="#002265" fillOpacity={0.25} isAnimationActive={false} />
          </ReRadarChart>
        </ResponsiveContainer>
      </div>
    </div>
    <div>
      <div className="text-xs font-bold text-slate-700 mb-2">Fokus Pra-Audit</div>
      <ul className="space-y-2">
        {focusItems.map((f) => (
          <li key={f.id} className="flex items-start gap-2.5 rounded-[10px] border border-slate-100 bg-white p-2.5">
            <span className="text-sm font-extrabold text-[var(--sd-primary)] w-8 shrink-0">{f.score}</span>
            <div className="flex-1 min-w-0">
              <div className="text-xs font-bold text-slate-800">{f.title}</div>
              <div className="text-[11px] text-slate-500">{f.description}</div>
            </div>
            <RiskPriorityBadge level={f.level} className="shrink-0" />
          </li>
        ))}
      </ul>
    </div>
  </div>
);

/* ============================== RiskMatrix ============================== */

export interface RiskMatrixItem { id: string; x: number; y: number; label: string; riskLevel?: 'kritis' | 'tinggi' | 'sedang' | 'rendah'; color?: string }

const RISK_LEVEL_COLOR: Record<string, string> = { kritis: '#BA1A1A', tinggi: '#D97706', sedang: '#EAB308', rendah: '#2D7A4A' };

export const RiskMatrix: React.FC<{
  items: RiskMatrixItem[];
  xLabel?: string;
  yLabel?: string;
  height?: number;
  className?: string;
}> = ({ items, xLabel = 'Kemungkinan', yLabel = 'Dampak', height = 260, className }) => (
  <div className={className} style={{ height }}>
    <ResponsiveContainer width="100%" height="100%">
      <ScatterChart margin={{ top: 8, right: 16, left: -8, bottom: 8 }}>
        <CartesianGrid stroke={GRID_STROKE} strokeDasharray="4 4" />
        <XAxis type="number" dataKey="x" name={xLabel} domain={[0, 5]} tick={AXIS_TICK} label={{ value: xLabel, position: 'insideBottom', offset: -4, fontSize: 10 }} />
        <YAxis type="number" dataKey="y" name={yLabel} domain={[0, 5]} tick={AXIS_TICK} label={{ value: yLabel, angle: -90, position: 'insideLeft', fontSize: 10 }} />
        <ZAxis range={[80, 80]} />
        <Tooltip
          content={({ active, payload }: any) => {
            if (!active || !payload?.length) return null;
            const p = payload[0].payload as RiskMatrixItem;
            return (
              <div className="rounded-[8px] border border-slate-200 bg-white px-3 py-2 shadow-lg text-xs">
                <div className="font-bold text-slate-800">{p.label}</div>
              </div>
            );
          }}
        />
        <Scatter data={items} isAnimationActive={false}>
          {items.map((it) => (
            <Cell key={it.id} fill={it.color || RISK_LEVEL_COLOR[it.riskLevel || 'sedang']} />
          ))}
        </Scatter>
      </ScatterChart>
    </ResponsiveContainer>
  </div>
);

/* ============================== HeatmapGrid ============================== */

export interface HeatmapCell { rowId: string; colId: string; value: number; label?: string }

export const HeatmapGrid: React.FC<{
  rows: { id: string; label: string }[];
  cols: { id: string; label: string }[];
  cells: HeatmapCell[];
  colorScale?: (value: number) => string;
  className?: string;
}> = ({ rows, cols, cells, colorScale, className }) => {
  const scale = colorScale || ((v: number) => (v >= 80 ? '#2D7A4A' : v >= 60 ? '#EAB308' : v >= 40 ? '#D97706' : '#BA1A1A'));
  const map = new Map(cells.map((c) => [`${c.rowId}::${c.colId}`, c]));
  return (
    <div className={cn('overflow-x-auto', className)}>
      <table className="text-xs border-separate" style={{ borderSpacing: 4 }}>
        <thead>
          <tr>
            <th className="w-32" />
            {cols.map((c) => (
              <th key={c.id} className="px-1 py-1 font-bold text-slate-500 text-[10px] whitespace-nowrap">{c.label}</th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr key={r.id}>
              <td className="pr-2 text-right font-semibold text-slate-600 whitespace-nowrap">{r.label}</td>
              {cols.map((c) => {
                const cell = map.get(`${r.id}::${c.id}`);
                const val = cell?.value ?? 0;
                return (
                  <td key={c.id} className="p-0">
                    <div
                      className="w-10 h-8 rounded-[6px] flex items-center justify-center text-white font-bold text-[10px]"
                      style={{ backgroundColor: scale(val) }}
                      title={cell?.label}
                    >
                      {val}
                    </div>
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Reimplementasi ringan `molecules/GraphChart` (branch ITWAS-231) - grafik gabungan Area+Line
 * generik untuk tren nilai vs target. Lihat Plan 2 bagian 2.3.
 */
import React from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';

interface GraphChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  areaKey: string;
  lineKey?: string;
  height?: number;
  areaColor?: string;
  lineColor?: string;
}

export const GraphChart: React.FC<GraphChartProps> = ({
  data,
  xKey,
  areaKey,
  lineKey,
  height = 220,
  areaColor = '#0B2B5C',
  lineColor = '#F59E0B',
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <ComposedChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
      <YAxis tick={{ fontSize: 10 }} />
      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
      <Legend wrapperStyle={{ fontSize: 10 }} />
      <Area type="monotone" dataKey={areaKey} fill={areaColor} stroke={areaColor} fillOpacity={0.15} />
      {lineKey && <Line type="monotone" dataKey={lineKey} stroke={lineColor} strokeWidth={2} dot={{ r: 3 }} />}
    </ComposedChart>
  </ResponsiveContainer>
);

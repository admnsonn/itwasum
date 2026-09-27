/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Reimplementasi ringan `molecules/HorizontalLineChart` (branch ITWAS-231): tren nilai per
 * periode berjalan horizontal (kategori pada sumbu-X). Lihat Plan 2 bagian 2.3.
 */
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface HorizontalLineChartProps {
  data: Record<string, string | number>[];
  xKey: string;
  lineKey: string;
  height?: number;
  color?: string;
  referenceValue?: number;
}

export const HorizontalLineChart: React.FC<HorizontalLineChartProps> = ({
  data,
  xKey,
  lineKey,
  height = 200,
  color = '#0B2B5C',
  referenceValue,
}) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis dataKey={xKey} tick={{ fontSize: 10 }} />
      <YAxis tick={{ fontSize: 10 }} />
      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
      {referenceValue !== undefined && <ReferenceLine y={referenceValue} stroke="#f59e0b" strokeDasharray="4 4" />}
      <Line type="monotone" dataKey={lineKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
    </LineChart>
  </ResponsiveContainer>
);

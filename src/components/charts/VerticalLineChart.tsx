/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Reimplementasi ringan `molecules/VerticalLineChart` (branch ITWAS-231): peringkat kategori
 * pada sumbu-Y, cocok untuk daftar ranking satker/domain. Lihat Plan 2 bagian 2.3.
 */
import React from 'react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';

interface VerticalLineChartProps {
  data: Record<string, string | number>[];
  yKey: string;
  lineKey: string;
  height?: number;
  color?: string;
}

export const VerticalLineChart: React.FC<VerticalLineChartProps> = ({ data, yKey, lineKey, height = 240, color = '#2563EB' }) => (
  <ResponsiveContainer width="100%" height={height}>
    <LineChart data={data} layout="vertical" margin={{ left: 24 }}>
      <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
      <XAxis type="number" tick={{ fontSize: 10 }} />
      <YAxis type="category" dataKey={yKey} tick={{ fontSize: 10 }} width={90} />
      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
      <Line type="monotone" dataKey={lineKey} stroke={color} strokeWidth={2} dot={{ r: 3 }} />
    </LineChart>
  </ResponsiveContainer>
);

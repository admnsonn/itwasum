/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 * Reimplementasi ringan `molecules/PieChart` (branch ITWAS-231, dibaca read-only via `git show`,
 * ditulis ulang di atas `recharts` yang sudah menjadi dependensi). Lihat Plan 2 bagian 2.3.
 */
import React from 'react';
import { PieChart as RePieChart, Pie, Cell, Tooltip, Legend, ResponsiveContainer } from 'recharts';

export interface PieDatum {
  name: string;
  value: number;
  color: string;
}

interface AppPieChartProps {
  data: PieDatum[];
  height?: number;
  showLegend?: boolean;
}

export const AppPieChart: React.FC<AppPieChartProps> = ({ data, height = 200, showLegend = true }) => (
  <ResponsiveContainer width="100%" height={height}>
    <RePieChart>
      <Pie data={data} dataKey="value" nameKey="name" innerRadius="55%" outerRadius="80%" paddingAngle={2}>
        {data.map((d, i) => (
          <Cell key={i} fill={d.color} />
        ))}
      </Pie>
      <Tooltip contentStyle={{ fontSize: 11, borderRadius: 8 }} />
      {showLegend && <Legend wrapperStyle={{ fontSize: 10 }} />}
    </RePieChart>
  </ResponsiveContainer>
);

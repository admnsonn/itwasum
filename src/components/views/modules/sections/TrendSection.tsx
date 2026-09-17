import React from 'react';
import { Card, TrendLineChart } from '../../../ui';
import { FadeInUp } from '../../../ui/motion';
import type { SectionDescriptor } from '../sectionTypes';

type Props = { descriptor: Extract<SectionDescriptor, { kind: 'trend' }> };

export const TrendSection: React.FC<Props> = ({ descriptor }) => {
  const data = descriptor.data.map((d) => ({
    periode: d.periode,
    nilai: d.nilai,
    target: d.target,
  }));
  const series =
    descriptor.series ??
    [
      { dataKey: 'nilai', label: 'Nilai', color: '#002265' },
      ...(descriptor.data.some((d) => d.target != null)
        ? [{ dataKey: 'target', label: 'Target', color: '#94A3B8', dashed: true as const }]
        : []),
    ];

  return (
    <FadeInUp>
      <Card>
        {descriptor.title && <div className="text-sm font-bold text-slate-800 mb-3">{descriptor.title}</div>}
        <TrendLineChart data={data} xKey="periode" series={series} />
      </Card>
    </FadeInUp>
  );
};

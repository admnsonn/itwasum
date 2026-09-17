import React from 'react';
import { Card, DonutChart, HorizontalMetricChart } from '../../../ui';
import { FadeInUp } from '../../../ui/motion';
import type { SectionDescriptor } from '../sectionTypes';

const PALETTE = ['#002265', '#2D7A4A', '#D97706', '#6366F1', '#0D9488', '#BA1A1A'];

type Props = { descriptor: Extract<SectionDescriptor, { kind: 'distribution' }> };

export const DistributionSection: React.FC<Props> = ({ descriptor }) => {
  const total = descriptor.items.reduce((s, i) => s + i.value, 0) || 1;

  return (
    <FadeInUp>
      <Card>
        {descriptor.title && <div className="text-sm font-bold text-slate-800 mb-3">{descriptor.title}</div>}
        {descriptor.variant === 'donut' ? (
          <DonutChart
            segments={descriptor.items.map((item, idx) => ({
              id: item.id,
              label: item.label,
              value: item.value,
              color: item.color ?? PALETTE[idx % PALETTE.length],
            }))}
            centerValue={total.toLocaleString('id-ID')}
            centerLabel="Total"
          />
        ) : (
          <HorizontalMetricChart
            items={descriptor.items.map((item, idx) => ({
              id: item.id,
              label: item.label,
              percent: (item.value / total) * 100,
              displayValue: item.displayValue ?? item.value.toLocaleString('id-ID'),
              color: item.color ?? PALETTE[idx % PALETTE.length],
            }))}
          />
        )}
      </Card>
    </FadeInUp>
  );
};

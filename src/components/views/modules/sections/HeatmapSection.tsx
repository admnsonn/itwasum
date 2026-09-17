import React from 'react';
import { Card, HeatmapGrid } from '../../../ui';
import { FadeInUp } from '../../../ui/motion';
import type { SectionDescriptor } from '../sectionTypes';

type Props = { descriptor: Extract<SectionDescriptor, { kind: 'heatmap' }> };

export const HeatmapSection: React.FC<Props> = ({ descriptor }) => {
  const rows = descriptor.rows.map((r) => ({ id: r, label: r }));
  const cols = descriptor.cols.map((c) => ({ id: c, label: c }));
  return (
    <FadeInUp>
      <Card>
        {descriptor.title && <div className="text-sm font-bold text-slate-800 mb-3">{descriptor.title}</div>}
        <HeatmapGrid rows={rows} cols={cols} cells={descriptor.cells} />
      </Card>
    </FadeInUp>
  );
};

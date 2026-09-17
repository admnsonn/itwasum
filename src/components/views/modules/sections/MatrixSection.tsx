import React from 'react';
import { Card, RiskMatrix } from '../../../ui';
import { FadeInUp } from '../../../ui/motion';
import type { SectionDescriptor } from '../sectionTypes';

type Props = { descriptor: Extract<SectionDescriptor, { kind: 'matrix' }> };

export const MatrixSection: React.FC<Props> = ({ descriptor }) => (
  <FadeInUp>
    <Card>
      {descriptor.title && <div className="text-sm font-bold text-slate-800 mb-3">{descriptor.title}</div>}
      <RiskMatrix items={descriptor.items} />
    </Card>
  </FadeInUp>
);

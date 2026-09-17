import React from 'react';
import { Card, Timeline } from '../../../ui';
import { FadeInUp } from '../../../ui/motion';
import type { SectionDescriptor } from '../sectionTypes';

type Props = { descriptor: Extract<SectionDescriptor, { kind: 'timeline' }> };

export const TimelineSection: React.FC<Props> = ({ descriptor }) => (
  <FadeInUp>
    <Card>
      {descriptor.title && <div className="text-sm font-bold text-slate-800 mb-3">{descriptor.title}</div>}
      <Timeline items={descriptor.items} />
    </Card>
  </FadeInUp>
);

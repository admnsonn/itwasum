import React from 'react';
import { Card, Typography } from '../../../ui';
import { FadeInUp } from '../../../ui/motion';
import type { SectionDescriptor } from '../sectionTypes';

type Props = { descriptor: Extract<SectionDescriptor, { kind: 'narrative' }> };

export const NarrativeSection: React.FC<Props> = ({ descriptor }) => (
  <FadeInUp>
    <Card variant="bg">
      {descriptor.title && (
        <Typography variant="label-bold" className="text-slate-700 mb-2">
          {descriptor.title}
        </Typography>
      )}
      <Typography variant="body-sm" className="text-slate-600">
        {descriptor.body}
      </Typography>
      {descriptor.bullets && descriptor.bullets.length > 0 && (
        <ul className="mt-3 list-disc pl-5 space-y-1 text-xs text-slate-600">
          {descriptor.bullets.map((b) => (
            <li key={b}>{b}</li>
          ))}
        </ul>
      )}
    </Card>
  </FadeInUp>
);

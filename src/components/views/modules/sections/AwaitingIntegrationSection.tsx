import React from 'react';
import { FadeInUp } from '../../../ui/motion';
import { DataIntegrationNotice } from '../../../ui/DataIntegrationNotice';
import type { SectionDescriptor } from '../sectionTypes';

type Props = { descriptor: Extract<SectionDescriptor, { kind: 'awaiting-integration' }> };

export const AwaitingIntegrationSection: React.FC<Props> = ({ descriptor }) => (
  <FadeInUp>
    <DataIntegrationNotice
      variant="panel"
      sumber={descriptor.sumber}
      tahap={descriptor.tahap}
      kontrak={descriptor.kontrak}
    />
  </FadeInUp>
);

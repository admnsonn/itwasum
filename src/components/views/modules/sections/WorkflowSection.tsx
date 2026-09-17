import React from 'react';
import { ApprovalStep, Card, StepIndicator } from '../../../ui';
import { FadeInUp } from '../../../ui/motion';
import type { SectionDescriptor } from '../sectionTypes';

type Props = { descriptor: Extract<SectionDescriptor, { kind: 'workflow' }> };

export const WorkflowSection: React.FC<Props> = ({ descriptor }) => (
  <FadeInUp>
    <Card>
      {descriptor.title && <div className="text-sm font-bold text-slate-800 mb-3">{descriptor.title}</div>}
      {descriptor.variant === 'steps' && Array.isArray(descriptor.steps) && typeof descriptor.steps[0] === 'string' ? (
        <StepIndicator steps={descriptor.steps as string[]} currentStep={descriptor.currentStep ?? 0} />
      ) : (
        <ApprovalStep
          steps={(descriptor.steps as { id: string; label: string; actor?: string; status?: string; timestamp?: string }[]).map(
            (s, i) => ({
              id: s.id,
              actor: s.actor ?? s.label,
              role: s.label,
              status: (s.status as 'menunggu' | 'disetujui' | 'ditolak' | 'terlewati') ?? 'menunggu',
              timestamp: s.timestamp,
            })
          )}
        />
      )}
    </Card>
  </FadeInUp>
);

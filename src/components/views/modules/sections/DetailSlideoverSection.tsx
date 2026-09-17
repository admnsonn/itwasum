import React from 'react';
import { Button, Modal } from '../../../ui';
import { FadeInUp } from '../../../ui/motion';
import type { SectionDescriptor } from '../sectionTypes';

type Props = {
  descriptor: Extract<SectionDescriptor, { kind: 'detail-slideover' }>;
  open: boolean;
  onOpen: () => void;
  onClose: () => void;
  facts?: { label: string; value: string }[];
};

export const DetailSlideoverSection: React.FC<Props> = ({ descriptor, open, onOpen, onClose, facts }) => {
  const displayFacts = facts ?? descriptor.facts;
  return (
    <FadeInUp>
      <Button variant="outline" size="sm" onClick={onOpen}>
        {descriptor.triggerLabel}
      </Button>
      <Modal
        isOpen={open}
        onClose={onClose}
        placement="right"
        title={descriptor.title}
        description={descriptor.body}
        widthClassName="max-w-lg"
      >
        {displayFacts && displayFacts.length > 0 && (
          <dl className="space-y-2 text-xs">
            {displayFacts.map((f) => (
              <div key={f.label} className="flex justify-between gap-3 border-b border-slate-100 pb-2">
                <dt className="text-slate-500 font-semibold">{f.label}</dt>
                <dd className="text-slate-800 font-bold text-right">{f.value}</dd>
              </div>
            ))}
          </dl>
        )}
      </Modal>
    </FadeInUp>
  );
};

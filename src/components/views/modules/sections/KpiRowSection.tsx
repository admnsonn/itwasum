import React from 'react';
import { StatCard } from '../../../ui';
import { FadeInUp, Stagger, staggerChildVariants } from '../../../ui/motion';
import { motion } from 'motion/react';
import type { SectionDescriptor } from '../sectionTypes';

type Props = { descriptor: Extract<SectionDescriptor, { kind: 'kpi-row' }> };

export const KpiRowSection: React.FC<Props> = ({ descriptor }) => (
  <FadeInUp>
    <Stagger className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {descriptor.items.map((item) => (
        <motion.div key={item.id} variants={staggerChildVariants}>
          <StatCard
            label={item.label}
            value={item.value}
            change={item.change}
            footer={item.footer}
          />
        </motion.div>
      ))}
    </Stagger>
  </FadeInUp>
);

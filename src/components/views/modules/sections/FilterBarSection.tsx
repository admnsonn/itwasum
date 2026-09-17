import React from 'react';
import { FilterPanel } from '../../../ui';
import { FadeInUp } from '../../../ui/motion';
import type { SectionDescriptor } from '../sectionTypes';

type Props = {
  descriptor: Extract<SectionDescriptor, { kind: 'filter-bar' }>;
  values: Record<string, string>;
  onChange: (key: string, value: string) => void;
  searchQuery?: string;
  onSearchChange?: (q: string) => void;
};

export const FilterBarSection: React.FC<Props> = ({
  descriptor,
  values,
  onChange,
  searchQuery,
  onSearchChange,
}) => (
  <FadeInUp>
    <FilterPanel
      fields={descriptor.fields.map((f) => ({
        type: 'select',
        key: f.key,
        label: f.label,
        options: f.options,
        value: values[f.key] ?? f.options[0]?.value ?? '',
        onChange: (v) => onChange(f.key, v),
      }))}
      search={
        onSearchChange
          ? { value: searchQuery ?? '', onChange: onSearchChange, placeholder: 'Cari dalam tabel...' }
          : undefined
      }
    />
  </FadeInUp>
);

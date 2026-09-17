import React, { useCallback, useMemo, useState } from 'react';
import type { ModuleDefinition } from '../../../config/moduleRegistry';
import type { ModuleSpec } from '../../../config/moduleSpecs';
import { DataIntegrationNotice } from '../../ui/DataIntegrationNotice';
import { ModuleScreenShell } from './ModuleScreenShell';
import type { SectionDescriptor } from './sectionTypes';
import { renderSection, type SectionRenderContext } from './sections';

export interface ModuleComposerProps {
  moduleDef: ModuleDefinition;
  groupLabel: string;
  spec: ModuleSpec;
  activeScreen: string;
  onScreenChange: (slug: string) => void;
  sections: SectionDescriptor[];
  headerActions?: React.ReactNode;
}

function initFilterValues(sections: SectionDescriptor[]): Record<string, string> {
  const values: Record<string, string> = {};
  for (const s of sections) {
    if (s.kind === 'filter-bar') {
      for (const f of s.fields) {
        values[f.key] = f.options[0]?.value ?? '';
      }
    }
  }
  return values;
}

function applyTableFilters(
  sections: SectionDescriptor[],
  filterValues: Record<string, string>,
  searchQuery: string
): SectionDescriptor[] {
  const q = searchQuery.trim().toLowerCase();
  return sections.map((s) => {
    if (s.kind !== 'table') return s;
    let rows = s.rows;
    for (const [key, val] of Object.entries(filterValues)) {
      if (!val || val === 'semua') continue;
      rows = rows.filter((r) => {
        if (!(key in r)) return true;
        return String(r[key]) === val;
      });
    }
    if (q) {
      rows = rows.filter((r) =>
        Object.values(r).some((v) => String(v).toLowerCase().includes(q))
      );
    }
    return { ...s, rows };
  });
}

export const ModuleComposer: React.FC<ModuleComposerProps> = ({
  moduleDef,
  groupLabel,
  spec,
  activeScreen,
  onScreenChange,
  sections,
  headerActions,
}) => {
  const [filterValues, setFilterValues] = useState(() => initFilterValues(sections));
  const [searchQuery, setSearchQuery] = useState('');
  const [slideoverOpen, setSlideoverOpen] = useState(false);
  const [slideoverFacts, setSlideoverFacts] = useState<{ label: string; value: string }[]>();

  const hasSlideover = sections.some((s) => s.kind === 'detail-slideover');
  const hasFilterBar = sections.some((s) => s.kind === 'filter-bar');

  const onFilterChange = useCallback((key: string, value: string) => {
    setFilterValues((prev) => ({ ...prev, [key]: value }));
  }, []);

  const onRowSelect = useCallback(
    (row: Record<string, string | number>) => {
      if (!hasSlideover) return;
      const facts = Object.entries(row).map(([label, value]) => ({
        label,
        value: String(value),
      }));
      setSlideoverFacts(facts);
      setSlideoverOpen(true);
    },
    [hasSlideover]
  );

  const filteredSections = useMemo(
    () => applyTableFilters(sections, filterValues, searchQuery),
    [sections, filterValues, searchQuery]
  );

  const ctx: SectionRenderContext = useMemo(
    () => ({
      filterValues,
      onFilterChange,
      searchQuery,
      onSearchChange: setSearchQuery,
      onRowSelect: hasSlideover ? onRowSelect : undefined,
      slideoverOpen,
      onSlideoverOpen: () => setSlideoverOpen(true),
      onSlideoverClose: () => setSlideoverOpen(false),
      slideoverFacts,
    }),
    [
      filterValues,
      onFilterChange,
      searchQuery,
      hasSlideover,
      onRowSelect,
      slideoverOpen,
      slideoverFacts,
    ]
  );

  return (
    <ModuleScreenShell
      moduleDef={moduleDef}
      groupLabel={groupLabel}
      spec={spec}
      activeScreen={activeScreen}
      onScreenChange={onScreenChange}
      headerActions={headerActions}
    >
      <div className="space-y-4">
        {filteredSections.map((s, i) => renderSection(s, ctx, `${s.kind}-${i}`))}
        <DataIntegrationNotice variant="inline" sumber={moduleDef.sumberSpek} className="pt-2 border-t border-slate-100" />
      </div>
    </ModuleScreenShell>
  );
};

import React from 'react';
import type { SectionDescriptor } from '../sectionTypes';
import { KpiRowSection } from './KpiRowSection';
import { FilterBarSection } from './FilterBarSection';
import { TableSection } from './TableSection';
import { TrendSection } from './TrendSection';
import { DistributionSection } from './DistributionSection';
import { MatrixSection } from './MatrixSection';
import { HeatmapSection } from './HeatmapSection';
import { TimelineSection } from './TimelineSection';
import { WorkflowSection } from './WorkflowSection';
import { NarrativeSection } from './NarrativeSection';
import { DetailSlideoverSection } from './DetailSlideoverSection';
import { AwaitingIntegrationSection } from './AwaitingIntegrationSection';

export interface SectionRenderContext {
  filterValues: Record<string, string>;
  onFilterChange: (key: string, value: string) => void;
  searchQuery: string;
  onSearchChange: (q: string) => void;
  onRowSelect?: (row: Record<string, string | number>) => void;
  slideoverOpen: boolean;
  onSlideoverOpen: () => void;
  onSlideoverClose: () => void;
  slideoverFacts?: { label: string; value: string }[];
}

export function renderSection(
  descriptor: SectionDescriptor,
  ctx: SectionRenderContext,
  key: string
): React.ReactNode {
  switch (descriptor.kind) {
    case 'kpi-row':
      return <KpiRowSection key={key} descriptor={descriptor} />;
    case 'filter-bar':
      return (
        <FilterBarSection
          key={key}
          descriptor={descriptor}
          values={ctx.filterValues}
          onChange={ctx.onFilterChange}
          searchQuery={ctx.searchQuery}
          onSearchChange={ctx.onSearchChange}
        />
      );
    case 'table':
      return <TableSection key={key} descriptor={descriptor} ctx={ctx} />;
    case 'trend':
      return <TrendSection key={key} descriptor={descriptor} />;
    case 'distribution':
      return <DistributionSection key={key} descriptor={descriptor} />;
    case 'matrix':
      return <MatrixSection key={key} descriptor={descriptor} />;
    case 'heatmap':
      return <HeatmapSection key={key} descriptor={descriptor} />;
    case 'timeline':
      return <TimelineSection key={key} descriptor={descriptor} />;
    case 'workflow':
      return <WorkflowSection key={key} descriptor={descriptor} />;
    case 'narrative':
      return <NarrativeSection key={key} descriptor={descriptor} />;
    case 'detail-slideover':
      return (
        <DetailSlideoverSection
          key={key}
          descriptor={descriptor}
          open={ctx.slideoverOpen}
          onOpen={ctx.onSlideoverOpen}
          onClose={ctx.onSlideoverClose}
          facts={ctx.slideoverFacts}
        />
      );
    case 'awaiting-integration':
      return <AwaitingIntegrationSection key={key} descriptor={descriptor} />;
    default:
      return null;
  }
}

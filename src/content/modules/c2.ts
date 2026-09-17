import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'c2',
  workflowId: 'WF-C2',
  screens: [
    { slug: 'dashboard-kualitas', nama: 'Dashboard Kualitas', deskripsi: 'Skor agregat completeness, accuracy, dan timeliness.' },
    { slug: 'rekonsiliasi', nama: 'Rekonsiliasi', deskripsi: 'Hasil rekonsiliasi skema antar sumber DIV TIK.' },
    { slug: 'anomali-skema', nama: 'Anomali Skema', deskripsi: 'Daftar ketidakselarasan skema yang memerlukan tindakan.' },
  ],
};

export function buildSections(moduleDef: ModuleDefinition, _screenSlug: string): SectionDescriptor[] {
  const g = getGenericModuleContent(moduleDef);
  return [
    {
      kind: 'kpi-row',
      items: g.kpis.map((k) => ({
        id: k.id,
        label: k.label,
        value: k.value,
        change: { direction: 'up' as const, label: k.delta },
      })),
    },
    {
      kind: 'trend',
      title: g.chartLabel,
      data: g.chart.map((p) => ({ periode: p.periode, nilai: p.nilai, target: p.target })),
    },
    {
      kind: 'table',
      title: 'Metrik kualitas per domain',
      rowKey: 'id',
      columns: [
        { key: 'domain', header: 'Domain Integrasi' },
        { key: 'completeness', header: 'Completeness (%)' },
        { key: 'accuracy', header: 'Accuracy (%)' },
        { key: 'timeliness', header: 'Timeliness (%)' },
        { key: 'status', header: 'Status' },
      ],
      rows: [
        { id: '1', domain: 'SSDM', completeness: 98, accuracy: 96, timeliness: 94, status: 'Selaras' },
        { id: '2', domain: 'E-DUMAS', completeness: 97, accuracy: 95, timeliness: 96, status: 'Selaras' },
        { id: '3', domain: 'E-AUDIT', completeness: 96, accuracy: 97, timeliness: 93, status: 'Selaras' },
        { id: '4', domain: 'LOGISTIK', completeness: 92, accuracy: 91, timeliness: 88, status: 'Perbaikan' },
      ],
    },
  ];
}

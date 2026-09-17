import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'e7',
  workflowId: 'WF-E7',
  screens: [
    { slug: 'risk-register', nama: 'Risk Register AI', deskripsi: 'Daftar risiko per model/layanan AI dan mitigasi.' },
    { slug: 'audit-llm', nama: 'Audit Permintaan LLM', deskripsi: 'Trail permintaan ke layanan LLM sesuai DOC-05.' },
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
      kind: 'matrix',
      title: 'Peta risiko model (likelihood × dampak)',
      items: [
        { id: 'r1', x: 3.5, y: 4.0, label: 'Anomaly Detector', riskLevel: 'sedang' },
        { id: 'r2', x: 2.0, y: 4.5, label: 'ChatItwasum Copilot', riskLevel: 'tinggi' },
        { id: 'r3', x: 1.8, y: 2.5, label: 'Prompt Guard', riskLevel: 'rendah' },
        { id: 'r4', x: 3.2, y: 3.8, label: 'Auto Summarizer', riskLevel: 'sedang' },
      ],
    },
    {
      kind: 'narrative',
      title: 'Kebijakan AI Governance (DOC-05)',
      body: g.narrative,
      bullets: [
        'Seluruh permintaan LLM tercatat pada audit trail B.10 dengan checksum integritas.',
        'Model risiko tinggi wajib human-in-the-loop sebelum output dipublikasikan ke pimpinan.',
        ...g.insight,
      ],
    },
  ];
}

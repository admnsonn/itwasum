import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import { createSeededRng } from '../../utils/seededRandom';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'e1',
  workflowId: 'WF-E1',
  screens: [
    { slug: 'registry-model', nama: 'Registry Model', deskripsi: 'Daftar model AI terdaftar beserta versi dan tahap deployment.' },
    { slug: 'kesehatan-inferensi', nama: 'Kesehatan Inferensi', deskripsi: 'Uptime dan latensi layanan inferensi produksi.' },
  ],
};

export function buildSections(moduleDef: ModuleDefinition, _screenSlug: string): SectionDescriptor[] {
  const g = getGenericModuleContent(moduleDef);
  const rng = createSeededRng(moduleDef.kode);

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
      kind: 'workflow',
      title: 'Pipeline MLOps standar',
      variant: 'steps',
      steps: ['Pelatihan', 'Validasi', 'Staging', 'Canary', 'Produksi'],
      currentStep: 4,
    },
    {
      kind: 'table',
      title: 'Model registry',
      rowKey: 'id',
      columns: [
        { key: 'nama', header: 'Nama Model / Pipeline' },
        { key: 'versi', header: 'Versi' },
        { key: 'tahap', header: 'Tahap' },
        { key: 'retrain', header: 'Terakhir Dilatih Ulang' },
        { key: 'status', header: 'Status' },
      ],
      rows: [
        { id: 'm1', nama: 'Anomaly Detector', versi: '2.4.1', tahap: 'Produksi', retrain: 'Mar 2026', status: 'Sehat' },
        { id: 'm2', nama: 'RAG Retriever Pengawasan', versi: '1.8.0', tahap: 'Produksi', retrain: 'Feb 2026', status: 'Sehat' },
        { id: 'm3', nama: 'Document NER Extractor', versi: '1.2.3', tahap: 'Canary', retrain: 'Mar 2026', status: 'Pemantauan' },
        { id: 'm4', nama: 'Prompt Guard Filter', versi: '1.0.5', tahap: 'Staging', retrain: 'Jan 2026', status: rng.pick(['Sehat', 'Pemantauan']) },
      ],
    },
  ];
}

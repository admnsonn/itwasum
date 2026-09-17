import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import { createSeededRng } from '../../utils/seededRandom';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'a4',
  workflowId: 'WF-A4',
  screens: [
    { slug: 'klasifikasi', nama: 'Klasifikasi Data', deskripsi: 'Sebaran data Rahasia/Terbatas/Biasa lintas modul aplikasi.' },
    { slug: 'masking-dlp', nama: 'Masking & DLP', deskripsi: 'Kebijakan masking dinamis dan insiden DLP periode berjalan.' },
  ],
};

export function buildSections(moduleDef: ModuleDefinition, screenSlug: string): SectionDescriptor[] {
  const g = getGenericModuleContent(moduleDef);
  const rng = createSeededRng(moduleDef.kode + screenSlug);

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
      kind: 'distribution',
      title: 'Proporsi klasifikasi data aktif',
      variant: 'donut',
      items: [
        { id: 'r', label: 'Rahasia', value: rng.int(18, 28) },
        { id: 't', label: 'Terbatas', value: rng.int(32, 42) },
        { id: 'b', label: 'Biasa', value: rng.int(35, 48) },
      ],
    },
    {
      kind: 'table',
      title: screenSlug === 'masking-dlp' ? 'Kebijakan masking per domain' : 'Domain & enkripsi',
      rowKey: 'id',
      columns: [
        { key: 'domain', header: 'Domain / Modul' },
        { key: 'klasifikasi', header: 'Klasifikasi' },
        { key: 'masking', header: 'Kebijakan Masking' },
        { key: 'enkripsi', header: 'Enkripsi at-Rest' },
        { key: 'status', header: 'Status' },
      ],
      rows: [
        { id: '1', domain: 'B.9 User & Role', klasifikasi: 'Rahasia', masking: 'NRP, email', enkripsi: 'AES-256', status: 'Patuh' },
        { id: '2', domain: 'E.5 Copilot', klasifikasi: 'Terbatas', masking: 'Prompt redaksi', enkripsi: 'AES-256', status: 'Patuh' },
        { id: '3', domain: 'B.15 KKA Digital', klasifikasi: 'Terbatas', masking: 'PII lampiran', enkripsi: 'AES-256', status: 'Patuh' },
        { id: '4', domain: 'Beranda Overview', klasifikasi: 'Biasa', masking: 'Agregat saja', enkripsi: 'TLS in-transit', status: 'Patuh' },
      ],
    },
  ];
}

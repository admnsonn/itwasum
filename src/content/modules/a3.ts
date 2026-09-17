import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'a3',
  workflowId: 'WF-A3',
  screens: [
    { slug: 'katalog-data', nama: 'Katalog Data', deskripsi: 'Entitas data pengawasan terdaftar beserta pemilik dan klasifikasi SDI.' },
    { slug: 'kamus-data', nama: 'Kamus Data', deskripsi: 'Definisi atribut, format, dan kepatuhan kamus per domain.' },
    { slug: 'permintaan-akses', nama: 'Permintaan Akses', deskripsi: 'Antrean permintaan akses data sesuai kebijakan data steward.' },
  ],
};

export function buildSections(moduleDef: ModuleDefinition, screenSlug: string): SectionDescriptor[] {
  const g = getGenericModuleContent(moduleDef);
  const kpi: SectionDescriptor = {
    kind: 'kpi-row',
    items: g.kpis.map((k) => ({
      id: k.id,
      label: k.label,
      value: k.value,
      change: { direction: 'flat' as const, label: k.delta },
    })),
  };

  const table: SectionDescriptor = {
    kind: 'table',
    title: screenSlug === 'kamus-data' ? 'Kepatuhan kamus data' : 'Domain data terdaftar',
    rowKey: 'id',
    columns: [
      { key: 'domain', header: 'Domain Data' },
      { key: 'owner', header: 'Data Owner' },
      { key: 'klasifikasi', header: 'Klasifikasi' },
      { key: 'kepatuhan', header: 'Kepatuhan Kamus (%)' },
      { key: 'status', header: 'Status' },
    ],
    rows: [
      { id: '1', domain: 'Pengawasan Operasional', owner: 'Irwasum Bidang Ops', klasifikasi: 'Terbatas', kepatuhan: 96, status: 'Selaras' },
      { id: '2', domain: 'Personel & Organisasi', owner: 'Data Steward SSDM', klasifikasi: 'Rahasia', kepatuhan: 94, status: 'Selaras' },
      { id: '3', domain: 'Keuangan & Aset', owner: 'Irwasum Garkeu', klasifikasi: 'Rahasia', kepatuhan: 91, status: 'Perbaikan' },
      { id: '4', domain: 'SPIP & Maturitas', owner: 'Subbag SPIP', klasifikasi: 'Biasa', kepatuhan: 98, status: 'Selaras' },
    ],
  };

  const narrative: SectionDescriptor = {
    kind: 'narrative',
    title: 'Ringkasan tata kelola SDI',
    body: g.narrative,
    bullets: g.insight,
  };

  if (screenSlug === 'permintaan-akses') {
    return [kpi, table, narrative];
  }
  return [kpi, table, narrative];
}

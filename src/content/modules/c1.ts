import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

const DOMAINS = [
  'E-DUMAS',
  'E-AUDIT',
  'E-WAS MBG',
  'E-MR',
  'OPS',
  'SSDM',
  'KORLANTAS',
  'SABHARA',
];

export const spec: ModuleSpec = {
  moduleId: 'c1',
  workflowId: 'WF-C1',
  screens: [
    { slug: 'daftar-kontrak', nama: 'Daftar Service Contract', deskripsi: 'Delapan domain integrasi DIV TIK beserta versi dan SLA.' },
    { slug: 'validasi-skema', nama: 'Validasi Skema', deskripsi: 'Status validasi payload terhadap kontrak API terbaru.' },
  ],
};

export function buildSections(_moduleDef: ModuleDefinition, screenSlug: string): SectionDescriptor[] {
  const awaiting: SectionDescriptor = {
    kind: 'awaiting-integration',
    sumber: 'DIV TIK Polri — Service Contract (DOC-04)',
    tahap: 'Penandatanganan & aktivasi endpoint produksi',
    kontrak: 'SC-ITWASUM-2026-v1',
  };

  const table: SectionDescriptor = {
    kind: 'table',
    title: 'Ringkasan 8 domain integrasi',
    rowKey: 'id',
    columns: [
      { key: 'domain', header: 'Domain Integrasi' },
      { key: 'versi', header: 'Versi Kontrak' },
      { key: 'auth', header: 'Otentikasi' },
      { key: 'sla', header: 'Pemenuhan SLA (%)' },
      { key: 'status', header: 'Status' },
    ],
    rows: DOMAINS.map((d, i) => ({
      id: `dom-${i}`,
      domain: d,
      versi: i < 6 ? 'v1.2' : 'v1.1',
      auth: 'mTLS + OAuth2',
      sla: 97 + (i % 3),
      status: i === 7 ? 'Menunggu DIV TIK' : 'Aktif',
    })),
  };

  const workflow: SectionDescriptor = {
    kind: 'workflow',
    title: 'Alur pengesahan service contract',
    variant: 'approval',
    steps: [
      { id: 'w1', label: 'Penyusunan DOC-04', actor: 'Tim Integrasi Itwasum', status: 'disetujui', timestamp: 'Feb 2026' },
      { id: 'w2', label: 'Review DIV TIK', actor: 'Direktorat TIK', status: 'disetujui', timestamp: 'Mar 2026' },
      { id: 'w3', label: 'Aktivasi endpoint produksi', actor: 'DIV TIK + Itwasum', status: 'menunggu' },
    ],
  };

  if (screenSlug === 'validasi-skema') {
    return [awaiting, table, workflow];
  }
  return [awaiting, table, workflow];
}

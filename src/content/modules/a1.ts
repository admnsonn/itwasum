import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'a1',
  workflowId: 'WF-A1',
  screens: [
    { slug: 'status-koneksi', nama: 'Status Koneksi API', deskripsi: 'Kesehatan endpoint konsumsi DIV TIK / SuperApp Big Data per domain sumber.' },
    { slug: 'riwayat-panggilan', nama: 'Riwayat Panggilan', deskripsi: 'Log agregat panggilan API dan insiden latensi pada periode terpilih.' },
    { slug: 'konfigurasi-consumer', nama: 'Konfigurasi Consumer', deskripsi: 'Credential, scope OAuth, dan rotasi sertifikat mTLS lapisan A.1.' },
  ],
};

export function buildSections(moduleDef: ModuleDefinition, screenSlug: string): SectionDescriptor[] {
  const generic = getGenericModuleContent(moduleDef);
  if (screenSlug === 'konfigurasi-consumer') {
    return [
      {
        kind: 'workflow',
        title: 'Siklus rotasi kredensial consumer',
        variant: 'steps',
        steps: ['Inventarisasi endpoint', 'Uji sandbox DIV TIK', 'Aktivasi produksi', 'Pemantauan SLA'],
        currentStep: 2,
      },
      {
        kind: 'table',
        title: 'Parameter consumer aktif',
        rowKey: 'id',
        columns: [
          { key: 'domain', header: 'Domain' },
          { key: 'scope', header: 'Scope OAuth' },
          { key: 'rotasi', header: 'Rotasi Sertifikat' },
          { key: 'status', header: 'Status' },
        ],
        rows: [
          { id: '1', domain: 'E-DUMAS', scope: 'wasrik.read', rotasi: 'Triwulan II 2026', status: 'Aktif' },
          { id: '2', domain: 'SSDM', scope: 'personel.read', rotasi: 'Triwulan III 2026', status: 'Aktif' },
        ],
      },
    ];
  }
  if (screenSlug === 'riwayat-panggilan') {
    return [
      {
        kind: 'timeline',
        title: 'Insiden & pemulihan koneksi',
        items: [
          { id: 't1', title: 'Lonjakan latensi E-WAS MBG', description: 'Koordinasi DIV TIK — throttling sementara', timestamp: '12 Mar 2026 08:14', tone: 'warning' },
          { id: 't2', title: 'Pemulihan penuh domain OPS', timestamp: '10 Mar 2026 22:40', tone: 'success' },
          { id: 't3', title: 'Rotasi sertifikat mTLS batch-2', timestamp: '08 Mar 2026 01:00', tone: 'default' },
        ],
      },
      {
        kind: 'table',
        title: 'Agregat panggilan per domain',
        rowKey: 'id',
        columns: generic.tableColumns.map((h, i) => ({ key: `c${i}`, header: h })),
        rows: generic.tableRows.slice(0, 6).map((r) => {
          const row: Record<string, string | number> = { id: r.id };
          r.cols.forEach((c, i) => { row[`c${i}`] = c; });
          row.status = r.statusLabel;
          return row;
        }),
      },
    ];
  }
  return [
    {
      kind: 'workflow',
      variant: 'steps',
      steps: ['Registrasi consumer', 'Validasi kontrak C.1', 'Uji beban', 'Go-live terkontrol'],
      currentStep: 3,
    },
    {
      kind: 'timeline',
      title: 'Milestone integrasi',
      items: [
        { id: 'm1', title: 'Service Contract C.1 ditandatangani', timestamp: 'Jan 2026', tone: 'success' },
        { id: 'm2', title: 'Endpoint staging DIV TIK tersedia', timestamp: 'Feb 2026' },
        { id: 'm3', title: 'Sinkronisasi produksi domain prioritas', timestamp: 'Mar 2026', tone: 'warning' },
      ],
    },
    {
      kind: 'table',
      title: 'Domain sumber terkoneksi',
      rowKey: 'id',
      columns: [
        { key: 'domain', header: 'Domain Sumber' },
        { key: 'endpoint', header: 'Endpoint' },
        { key: 'keberhasilan', header: 'Keberhasilan (%)' },
        { key: 'status', header: 'Status' },
      ],
      rows: [
        { id: 'd1', domain: 'E-DUMAS', endpoint: '/v2/pengaduan', keberhasilan: 99.2, status: 'Stabil' },
        { id: 'd2', domain: 'E-AUDIT', endpoint: '/v1/temuan', keberhasilan: 98.7, status: 'Stabil' },
        { id: 'd3', domain: 'SSDM', endpoint: '/v3/personel', keberhasilan: 99.5, status: 'Stabil' },
        { id: 'd4', domain: 'E-WAS MBG', endpoint: '/v1/kinerja', keberhasilan: 96.1, status: 'Pemantauan' },
      ],
    },
  ];
}

import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import { createSeededRng } from '../../utils/seededRandom';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'e4',
  workflowId: 'WF-E4',
  screens: [
    { slug: 'dashboard-anomali', nama: 'Dashboard Anomali', deskripsi: 'Ringkasan deteksi rule + light ML per domain data.' },
    { slug: 'daftar-alert', nama: 'Daftar Alert', deskripsi: 'Alert yang memicu Early Warning B.18 setelah validasi.' },
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
        change: { direction: 'down' as const, label: k.delta },
      })),
    },
    {
      kind: 'distribution',
      title: 'Anomali per kategori',
      variant: 'horizontal',
      items: [
        { id: 'k', label: 'Keuangan & Garkeu', value: rng.int(12, 22), displayValue: `${rng.int(12, 22)} alert` },
        { id: 'p', label: 'Kinerja Operasional', value: rng.int(8, 16), displayValue: `${rng.int(8, 16)} alert` },
        { id: 'd', label: 'Dokumen & Eviden', value: rng.int(5, 11), displayValue: `${rng.int(5, 11)} alert` },
      ],
    },
    {
      kind: 'table',
      title: 'Anomali terbaru',
      rowKey: 'id',
      columns: [
        { key: 'idAnomali', header: 'ID Anomali' },
        { key: 'domain', header: 'Domain Data' },
        { key: 'jenis', header: 'Jenis Anomali' },
        { key: 'keyakinan', header: 'Keyakinan Model (%)' },
        { key: 'status', header: 'Status' },
      ],
      rows: [1, 2, 3, 4].map((i) => ({
        id: `a-${i}`,
        idAnomali: `ANO-26-${400 + i}`,
        domain: rng.pick(['Garkeu', 'Logistik', 'SSDM', 'E-DUMAS']),
        jenis: rng.pick(['Lonjakan transaksi', 'Deviasi KPI', 'Duplikasi NRP']),
        keyakinan: rng.int(72, 96),
        status: rng.pick(['Tervalidasi', 'Menunggu Review', 'Ditolak FP']),
      })),
    },
  ];
}

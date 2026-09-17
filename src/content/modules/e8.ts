import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import { createSeededRng } from '../../utils/seededRandom';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

function formatRp(n: number): string {
  return `Rp ${n.toLocaleString('id-ID')}`;
}

export const spec: ModuleSpec = {
  moduleId: 'e8',
  workflowId: 'WF-E8',
  screens: [
    { slug: 'biaya-berjalan', nama: 'Biaya Berjalan', deskripsi: 'Pemakaian dan estimasi biaya layanan AI cloud managed.' },
    { slug: 'kuota-subscription', nama: 'Kuota Subscription', deskripsi: 'Sisa kuota dan durasi paket 12 bulan pasca go-live.' },
  ],
};

export function buildSections(moduleDef: ModuleDefinition, _screenSlug: string): SectionDescriptor[] {
  const g = getGenericModuleContent(moduleDef);
  const rng = createSeededRng(moduleDef.kode);

  const trend = g.chart.map((p, i) => ({
    periode: p.periode,
    nilai: 180_000_000 + i * 12_000_000 + rng.int(0, 8_000_000),
    target: 220_000_000,
  }));

  return [
    {
      kind: 'kpi-row',
      items: [
        { id: 'k1', label: g.kpis[0].label, value: `${g.kpis[0].value}`, change: { direction: 'flat', label: g.kpis[0].delta } },
        { id: 'k2', label: g.kpis[1].label, value: formatRp(198_450_000), change: { direction: 'up', label: '+4,2% vs bulan lalu' } },
        { id: 'k3', label: g.kpis[2].label, value: '9 bulan', footer: 'Paket 12 bulan SPEKTEK' },
        { id: 'k4', label: g.kpis[3].label, value: '99,6%', change: { direction: 'up', label: g.kpis[3].delta } },
      ],
    },
    {
      kind: 'trend',
      title: 'Tren biaya layanan AI cloud (IDR)',
      data: trend,
      series: [
        { dataKey: 'nilai', label: 'Biaya aktual', color: '#002265' },
        { dataKey: 'target', label: 'Alokasi bulanan', color: '#94A3B8' },
      ],
    },
    {
      kind: 'table',
      title: 'Rincian layanan cloud',
      rowKey: 'id',
      columns: [
        { key: 'layanan', header: 'Layanan Cloud AI' },
        { key: 'paket', header: 'Paket' },
        { key: 'pemakaian', header: 'Pemakaian Bulan Ini' },
        { key: 'biaya', header: 'Biaya Estimasi' },
        { key: 'status', header: 'Status' },
      ],
      rows: [
        { id: '1', layanan: 'Inferensi LLM', paket: 'Managed Premium', pemakaian: '68% kuota', biaya: formatRp(112_300_000), status: 'Normal' },
        { id: '2', layanan: 'Penyimpanan Vektor', paket: 'Managed Premium', pemakaian: '54% kuota', biaya: formatRp(42_800_000), status: 'Normal' },
        { id: '3', layanan: 'Komputasi Pelatihan', paket: 'Burst', pemakaian: '12 jam GPU', biaya: formatRp(43_350_000), status: 'Pemantauan' },
      ],
    },
  ];
}

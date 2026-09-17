import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import { createSeededRng } from '../../utils/seededRandom';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'e3',
  workflowId: 'WF-E3',
  screens: [
    { slug: 'antrean-laporan', nama: 'Antrean Laporan', deskripsi: 'Permintaan generate laporan otomatis dan ringkasan eksekutif.' },
    { slug: 'riwayat-generate', nama: 'Riwayat Generate', deskripsi: 'Log waktu proses dan tingkat persetujuan tanpa revisi.' },
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
        change: { direction: 'flat' as const, label: k.delta },
      })),
    },
    {
      kind: 'timeline',
      title: 'Aktivitas generate terbaru',
      items: [
        { id: 'e1', title: 'Ringkasan eksekutif Beranda SF-002', description: 'Disetujui tanpa revisi', timestamp: '14 Mar 2026 09:12', tone: 'success' },
        { id: 'e2', title: 'Laporan triwulanan Itwil I', timestamp: '13 Mar 2026 16:40' },
        { id: 'e3', title: 'Laporan ad-hoc PKPT', description: 'Revisi minor format tabel', timestamp: '12 Mar 2026 11:05', tone: 'warning' },
      ],
    },
    {
      kind: 'table',
      title: 'Antrean laporan',
      rowKey: 'id',
      columns: [
        { key: 'idAntrean', header: 'ID Antrean' },
        { key: 'jenis', header: 'Jenis Laporan' },
        { key: 'pemohon', header: 'Diminta Oleh' },
        { key: 'durasi', header: 'Waktu Generate (menit)' },
        { key: 'status', header: 'Status' },
      ],
      rows: [1, 2, 3, 4, 5].map((n) => ({
        id: `q-${n}`,
        idAntrean: `RPT-2026-${100 + n}`,
        jenis: rng.pick(['Ringkasan Eksekutif', 'Laporan Triwulanan', 'Laporan Ad-hoc']),
        pemohon: rng.pick(['Sekretariat Itwasum', 'Irwasum Bidang Ops', 'Pengawas Tim']),
        durasi: rng.int(3, 18),
        status: rng.pick(['Selesai', 'Berjalan', 'Menunggu Review']),
      })),
    },
  ];
}

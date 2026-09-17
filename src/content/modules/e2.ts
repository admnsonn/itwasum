import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'e2',
  workflowId: 'WF-E2',
  screens: [
    { slug: 'sumber-pengetahuan', nama: 'Sumber Pengetahuan', deskripsi: 'Korpus dokumen pengawasan terindeks untuk RAG.' },
    { slug: 'status-indeks', nama: 'Status Pengindeksan', deskripsi: 'Antrean job embedding dan pembaruan indeks vektor.' },
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
      kind: 'table',
      title: 'Sumber pengetahuan aktif',
      rowKey: 'id',
      columns: [
        { key: 'sumber', header: 'Sumber Pengetahuan' },
        { key: 'jenis', header: 'Jenis Dokumen' },
        { key: 'jumlah', header: 'Jumlah Terindeks' },
        { key: 'update', header: 'Terakhir Diperbarui' },
        { key: 'status', header: 'Status' },
      ],
      rows: [
        { id: '1', sumber: 'SPEKTEK & BA-SA', jenis: 'Regulasi proyek', jumlah: 428, update: 'Mar 2026', status: 'Aktif' },
        { id: '2', sumber: 'Business Rule APIP', jenis: 'Kebijakan internal', jumlah: 186, update: 'Mar 2026', status: 'Aktif' },
        { id: '3', sumber: 'Arsip LHP & Rekomendasi', jenis: 'Temuan historis', jumlah: 1240, update: 'Feb 2026', status: 'Aktif' },
        { id: '4', sumber: 'Panduan SPIP', jenis: 'Referensi SPIP', jumlah: 92, update: 'Jan 2026', status: 'Aktif' },
      ],
    },
    {
      kind: 'narrative',
      title: 'Kebijakan kurasi RAG',
      body: g.narrative,
      bullets: [
        'Hanya dokumen berklasifikasi Biasa/Terbatas yang masuk indeks produksi; data Rahasia tetap on-premise.',
        'Embedding diperbarui otomatis setelah perubahan versi FSD/BR terkait.',
        ...g.insight,
      ],
    },
  ];
}

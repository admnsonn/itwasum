import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import { createSeededRng } from '../../utils/seededRandom';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'e6',
  workflowId: 'WF-E6',
  screens: [
    { slug: 'akurasi-ekstraksi', nama: 'Akurasi Ekstraksi', deskripsi: 'Profil akurasi OCR/NER per jenis dokumen audit.' },
    { slug: 'risiko-dokumen', nama: 'Risiko Dokumen', deskripsi: 'Peta risiko kesalahan ekstraksi vs dampak temuan.' },
  ],
};

export function buildSections(moduleDef: ModuleDefinition, _screenSlug: string): SectionDescriptor[] {
  const g = getGenericModuleContent(moduleDef);
  const rng = createSeededRng(moduleDef.kode);

  const docTypes = ['LHP', 'BAST', 'Bukti Dukung', 'Nota Dinas'];
  const cols = ['NER Entitas', 'OCR Tabel', 'Klasifikasi Jenis'];

  return [
    {
      kind: 'matrix',
      title: 'Peta risiko akurasi vs dampak temuan',
      items: [
        { id: 'p1', x: 4.2, y: 4.5, label: 'LHP scan rendah', riskLevel: 'tinggi' },
        { id: 'p2', x: 2.1, y: 3.2, label: 'BAST digital', riskLevel: 'sedang' },
        { id: 'p3', x: 1.5, y: 2.0, label: 'Nota dinas teks', riskLevel: 'rendah' },
        { id: 'p4', x: 3.8, y: 3.9, label: 'Bukti foto', riskLevel: 'tinggi' },
      ],
    },
    {
      kind: 'heatmap',
      title: 'Skor akurasi per jenis dokumen (%)',
      rows: docTypes,
      cols,
      cells: docTypes.flatMap((row) =>
        cols.map((col) => ({
          rowId: row,
          colId: col,
          value: rng.int(78, 98),
          label: `${row} — ${col}`,
        }))
      ),
    },
    {
      kind: 'narrative',
      title: 'Kontrol kualitas Document AI',
      body: g.narrative,
      bullets: [
        'Dokumen di bawah ambang akurasi 90% wajib review manual auditor sebelum masuk KKA (B.15).',
        'Heatmap memantau regresi akurasi setelah pembaruan model NER.',
        ...g.insight,
      ],
    },
  ];
}

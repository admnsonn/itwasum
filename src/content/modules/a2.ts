import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import { getGenericModuleContent } from '../../data/modules/genericModuleData';
import { createSeededRng } from '../../utils/seededRandom';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';

export const spec: ModuleSpec = {
  moduleId: 'a2',
  workflowId: 'WF-A2',
  screens: [
    { slug: 'dashboard-etl', nama: 'Dashboard ETL', deskripsi: 'Ringkasan job data mart pengawasan dan kesegaran data.' },
    { slug: 'detail-job', nama: 'Detail Job', deskripsi: 'Log eksekusi, dependensi, dan SLA per job ETL/ELT.' },
    { slug: 'lineage', nama: 'Lineage Data', deskripsi: 'Jejak transformasi sumber DIV TIK ke tabel mart Itwasum.' },
  ],
};

function kpis(moduleDef: ModuleDefinition): SectionDescriptor {
  const g = getGenericModuleContent(moduleDef);
  return {
    kind: 'kpi-row',
    items: g.kpis.map((k) => ({
      id: k.id,
      label: k.label,
      value: k.value,
      change: { direction: k.tone === 'kritis' ? 'down' : k.tone === 'aman' ? 'up' : 'flat', label: k.delta },
    })),
  };
}

const ETL_JOBS = [
  { sumber: 'E-DUMAS', target: 'mart_pengaduan', jadwal: 'Batch 02:00 WIB' },
  { sumber: 'E-AUDIT', target: 'mart_temuan', jadwal: 'CDC 15 menit' },
  { sumber: 'SSDM', target: 'mart_personel', jadwal: 'Batch 03:30 WIB' },
  { sumber: 'OPS', target: 'mart_operasi', jadwal: 'Incremental per jam' },
  { sumber: 'LOGISTIK', target: 'mart_aset', jadwal: 'Batch Minggu 01:00' },
  { sumber: 'E-WAS MBG', target: 'mart_kinerja_mbg', jadwal: 'Batch 04:00 WIB' },
];

export function buildSections(moduleDef: ModuleDefinition, screenSlug: string): SectionDescriptor[] {
  const rng = createSeededRng(moduleDef.kode);
  const g = getGenericModuleContent(moduleDef);

  if (screenSlug === 'lineage') {
    return [
      kpis(moduleDef),
      {
        kind: 'narrative',
        title: 'Lineage terkontrol',
        body: g.narrative,
        bullets: g.insight,
      },
    ];
  }

  const trendData = g.chart.map((p) => ({ periode: p.periode, nilai: p.nilai, target: p.target }));

  return [
    kpis(moduleDef),
    {
      kind: 'filter-bar',
      fields: [
        {
          key: 'mode',
          label: 'Mode Muat',
          options: [
            { value: 'semua', label: 'Semua mode' },
            { value: 'Full Load', label: 'Full Load' },
            { value: 'Incremental', label: 'Incremental' },
            { value: 'CDC', label: 'CDC' },
          ],
        },
        {
          key: 'status',
          label: 'Status Job',
          options: [
            { value: 'semua', label: 'Semua status' },
            { value: 'Sukses', label: 'Sukses' },
            { value: 'Berjalan', label: 'Berjalan' },
            { value: 'Gagal', label: 'Gagal' },
          ],
        },
      ],
    },
    {
      kind: 'table',
      title: 'Jadwal job ETL data mart',
      rowKey: 'id',
      columns: [
        { key: 'namaJob', header: 'Nama Job ETL' },
        { key: 'lintasan', header: 'Sumber → Target' },
        { key: 'jadwal', header: 'Jadwal' },
        { key: 'terakhir', header: 'Terakhir Berhasil' },
        { key: 'mode', header: 'Mode' },
        { key: 'status', header: 'Status' },
      ],
      rows: ETL_JOBS.map((j, i) => ({
        id: `job-${i}`,
        namaJob: `etl_${j.target}`,
        lintasan: `${j.sumber} → ${j.target}`,
        jadwal: j.jadwal,
        terakhir: `Triwulan I 2026 · ${rng.int(1, 28)} Mar ${rng.int(0, 23)}:${String(rng.int(0, 59)).padStart(2, '0')}`,
        mode: rng.pick(['Full Load', 'Incremental', 'CDC']),
        status: rng.pick(['Sukses', 'Sukses', 'Berjalan', 'Gagal']),
      })),
    },
    {
      kind: 'trend',
      title: g.chartLabel,
      data: trendData,
    },
  ];
}

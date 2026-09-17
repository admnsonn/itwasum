import type { SeededRng } from '../../utils/seededRandom';

export interface MetricScale {
  unit: string;
  min: number;
  max: number;
  decimals: number;
  bands?: { label: string; min: number; max: number }[];
  dist?: number[];
}

export const METRIC_SCALES: Record<string, MetricScale> = {
  spipTerintegrasi: {
    unit: 'level',
    min: 1,
    max: 5,
    decimals: 2,
    dist: [0.08, 0.34, 0.44, 0.12, 0.02],
    bands: [
      { label: 'Rintisan', min: 1, max: 1.5 },
      { label: 'Berkembang', min: 1.5, max: 2.5 },
      { label: 'Terdefinisi', min: 2.5, max: 3.5 },
      { label: 'Terkelola', min: 3.5, max: 4.5 },
      { label: 'Optimum', min: 4.5, max: 5 },
    ],
  },
  ikuCapaian: { unit: '%', min: 55, max: 99.5, decimals: 1 },
  ikpa: { unit: '%', min: 70, max: 99, decimals: 1 },
  rbsScore: { unit: 'skor', min: 1, max: 5, decimals: 2 },
  agingHari: { unit: 'hari', min: 1, max: 1100, decimals: 0 },
  persen: { unit: '%', min: 0, max: 100, decimals: 1 },
  uptime: { unit: '%', min: 96, max: 99.99, decimals: 2 },
};

const IKPA_ASPECTS = [
  { id: 'penyerapan', bobot: 0.4, indikator: 3 },
  { id: 'konsistensi', bobot: 0.35, indikator: 3 },
  { id: 'pengembalian', bobot: 0.25, indikator: 2 },
];

export function drawFromDist(rng: SeededRng, dist: number[]): number {
  const r = rng.next();
  let acc = 0;
  for (let i = 0; i < dist.length; i++) {
    acc += dist[i];
    if (r <= acc) return i + 1;
  }
  return dist.length;
}

export function drawMetric(rng: SeededRng, id: string): number {
  const scale = METRIC_SCALES[id];
  if (!scale) return rng.round(0, 100, 1);
  if (scale.dist) {
    const level = drawFromDist(rng, scale.dist);
    const jitter = rng.round(-0.35, 0.35, scale.decimals);
    return clamp(level + jitter, scale.min, scale.max, scale.decimals);
  }
  return rng.round(scale.min, scale.max, scale.decimals);
}

export function drawIkpa(rng: SeededRng): { nilai: number; aspek: { id: string; nilai: number }[] } {
  const aspek = IKPA_ASPECTS.map((a) => ({
    id: a.id,
    nilai: rng.round(72, 99, 1),
    bobot: a.bobot,
  }));
  const nilai = Math.round(aspek.reduce((s, a) => s + a.nilai * a.bobot, 0) * 10) / 10;
  return { nilai, aspek };
}

function clamp(value: number, min: number, max: number, decimals: number): number {
  const factor = 10 ** decimals;
  const clipped = Math.min(max, Math.max(min, value));
  return Math.round(clipped * factor) / factor;
}

export function countByBand<T>(items: T[], getValue: (item: T) => number, min: number, max: number): number {
  return items.filter((item) => {
    const v = getValue(item);
    return v >= min && v <= max;
  }).length;
}

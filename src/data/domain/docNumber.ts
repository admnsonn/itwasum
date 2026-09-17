import type { SeededRng } from '../../utils/seededRandom';

const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'] as const;

export type DocJenis = 'B' | 'ST' | 'ND' | 'SR' | 'USUL' | 'LHP' | 'SPRIN' | 'TM';

export function romanMonth(date: Date): string {
  return ROMAN_MONTHS[date.getMonth()];
}

export function makeDocNumber(opts: {
  jenis: DocJenis | string;
  seq: number;
  date: Date;
  unitKode?: string;
}): string {
  const unit = opts.unitKode ?? 'Itwasum';
  return `${opts.jenis}/${opts.seq}/${romanMonth(opts.date)}/${opts.date.getFullYear()}/${unit}`;
}

export function parseIdDate(year: number, monthIndex: number, day: number): Date {
  return new Date(year, monthIndex, day);
}

/** Kode BMN 5-segment (contoh: 3.05.01.04.002). */
export function makeBmnCode(rng: SeededRng): string {
  const pad = (n: number, len: number) => String(n).padStart(len, '0');
  return `3.${pad(rng.int(1, 9), 2)}.${pad(rng.int(1, 12), 2)}.${pad(rng.int(1, 8), 2)}.${pad(rng.int(1, 999), 3)}`;
}

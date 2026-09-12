/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * PRNG deterministik (mulberry32) dipakai oleh generator mock data modul baru
 * (`src/data/modules/genericModuleData.ts`, `scripts/gen-mock.ts`) agar data yang ditampilkan
 * konsisten antar render/reload dan bisa diregenerasi ulang secara identik dari sebuah seed string.
 * Tanpa dependensi npm tambahan.
 */

function hashStringToSeed(input: string): number {
  let h = 1779033703 ^ input.length;
  for (let i = 0; i < input.length; i++) {
    h = Math.imul(h ^ input.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  return h >>> 0;
}

export interface SeededRng {
  next(): number; // [0, 1)
  int(min: number, max: number): number; // inklusif min, eksklusif max
  pick<T>(arr: readonly T[]): T;
  sample<T>(arr: readonly T[], count: number): T[];
  bool(probabilityTrue?: number): boolean;
  round(min: number, max: number, decimals?: number): number;
}

/** Membuat generator angka acak deterministik dari sebuah seed string (mis. kode modul 'B.12'). */
export function createSeededRng(seed: string): SeededRng {
  let a = hashStringToSeed(seed);

  const next = (): number => {
    a |= 0;
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };

  const int = (min: number, max: number): number => Math.floor(next() * (max - min)) + min;

  const round = (min: number, max: number, decimals = 1): number => {
    const factor = Math.pow(10, decimals);
    return Math.round((next() * (max - min) + min) * factor) / factor;
  };

  const pick = <T,>(arr: readonly T[]): T => arr[int(0, arr.length)];

  const sample = <T,>(arr: readonly T[], count: number): T[] => {
    const pool = [...arr];
    const result: T[] = [];
    const n = Math.min(count, pool.length);
    for (let i = 0; i < n; i++) {
      const idx = int(0, pool.length);
      result.push(pool.splice(idx, 1)[0]);
    }
    return result;
  };

  const bool = (probabilityTrue = 0.5): boolean => next() < probabilityTrue;

  return { next, int, pick, sample, bool, round };
}

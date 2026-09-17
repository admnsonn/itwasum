/**
 * Resolver tunggal satker. Generator wajib menarik unit dari sini.
 */
import { ALL_COMBINED_SATKERS_DATA, ITWIL_JURISDICTIONS } from '../allSatkersData';
import { POLDA_DATA } from '../mockData';
import { MABES_SATKERS_DATA } from '../mabesSatkerData';
import { getPoldaIdsByItwil } from './itwilMap';
import type { SeededRng } from '../../utils/seededRandom';
import type { SatkerMapItem } from '../../types';

export type SatkerScope = 'all' | 'polda' | 'polres' | 'polsek' | 'mabes' | { poldaId: string } | { itwilId: string };

export function getAllSatkers(): SatkerMapItem[] {
  return ALL_COMBINED_SATKERS_DATA;
}

export function getSatkerById(id: string): SatkerMapItem | undefined {
  return ALL_COMBINED_SATKERS_DATA.find((s) => s.id === id);
}

export function getSatkersByPolda(poldaId: string): SatkerMapItem[] {
  return ALL_COMBINED_SATKERS_DATA.filter(
    (s) => s.id === poldaId || s.parentPoldaId === poldaId
  );
}

export function getSatkersByItwil(itwilId: string): SatkerMapItem[] {
  const poldaIds = new Set(getPoldaIdsByItwil(itwilId));
  return ALL_COMBINED_SATKERS_DATA.filter(
    (s) => poldaIds.has(s.id) || (s.parentPoldaId && poldaIds.has(s.parentPoldaId))
  );
}

export function pickSatker(rng: SeededRng, scope: SatkerScope = 'all'): SatkerMapItem {
  const pool = resolveScope(scope);
  if (pool.length === 0) {
    return ALL_COMBINED_SATKERS_DATA[0];
  }
  return rng.pick(pool);
}

export function pickSatkers(rng: SeededRng, count: number, scope: SatkerScope = 'all'): SatkerMapItem[] {
  const pool = resolveScope(scope);
  return rng.sample(pool, Math.min(count, pool.length));
}

function resolveScope(scope: SatkerScope): SatkerMapItem[] {
  if (scope === 'all') return ALL_COMBINED_SATKERS_DATA;
  if (scope === 'polda') return ALL_COMBINED_SATKERS_DATA.filter((s) => s.tingkat === 'Polda');
  if (scope === 'polres') return ALL_COMBINED_SATKERS_DATA.filter((s) => s.tingkat === 'Polres' || s.tingkat === 'Polresta' || s.tingkat === 'Polrestabes');
  if (scope === 'polsek') return ALL_COMBINED_SATKERS_DATA.filter((s) => s.tingkat === 'Polsek');
  if (scope === 'mabes') return ALL_COMBINED_SATKERS_DATA.filter((s) => s.tingkat === 'Satker-Mabes' || s.tingkat === 'Biro-Mabes' || s.tingkat === 'Itwasum' || s.tingkat === 'Mabes');
  if (typeof scope === 'object' && 'poldaId' in scope) return getSatkersByPolda(scope.poldaId);
  if (typeof scope === 'object' && 'itwilId' in scope) return getSatkersByItwil(scope.itwilId);
  return ALL_COMBINED_SATKERS_DATA;
}

export function getPoldaAuthorities() {
  return POLDA_DATA;
}

export function getMabesSatkers() {
  return MABES_SATKERS_DATA;
}

export function getItwilJurisdictions() {
  return ITWIL_JURISDICTIONS;
}

export function satkerExists(id: string): boolean {
  return Boolean(getSatkerById(id) || POLDA_DATA.some((p) => p.id === id));
}

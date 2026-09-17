/**
 * SSOT pemetaan Itwil ↔ Polda. Re-ekspor PUBLIC_ITWIL_POLDA_MAPPING.
 */
import { PUBLIC_ITWIL_POLDA_MAPPING } from '../publicStructureData';
import { ITWIL_METADATA } from '../mabesSatkerData';

export const ITWIL_POLDA_MAP: Record<string, string[]> = PUBLIC_ITWIL_POLDA_MAPPING;

export const ITWIL_IDS = ['itwil-1', 'itwil-2', 'itwil-3', 'itwil-4', 'itwil-5'] as const;
export type ItwilId = (typeof ITWIL_IDS)[number];

export function getPoldaIdsByItwil(itwilId: string): string[] {
  return ITWIL_POLDA_MAP[itwilId] ?? [];
}

export function getItwilIdForPolda(poldaId: string): string | undefined {
  for (const [itwilId, poldaIds] of Object.entries(ITWIL_POLDA_MAP)) {
    if (poldaIds.includes(poldaId)) return itwilId;
  }
  return undefined;
}

export function getItwilNama(itwilId: string): string {
  return ITWIL_METADATA[itwilId]?.nama ?? itwilId;
}

export function assertItwilCovers34Polda(): { ok: boolean; count: number; missing: string[] } {
  const all = Object.values(ITWIL_POLDA_MAP).flat();
  const unique = Array.from(new Set(all));
  return { ok: unique.length === 34 && all.length === 34, count: unique.length, missing: [] };
}

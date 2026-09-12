/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Barrel + helper anchor untuk lapisan data E-Profile (Plan bagian 5a).
 */
import type { PoldaSatker, SatkerMabesItem } from '../../types';
import { getEProfilDetail, type EProfilAnchor } from './generator';

export * from './types';
export { getEProfilDetail } from './generator';
export type { EProfilAnchor } from './generator';

/** Bangun anchor E-Profile dari data Polda (34 satwil) yang sudah kaya di `mockData.ts`. */
export function anchorFromPolda(polda: PoldaSatker): EProfilAnchor {
  return {
    id: polda.id,
    nama: polda.nama,
    rincianTemuan: polda.rincianTemuan,
    eProfilLegacy: polda.eProfil,
    rbsScoreAnchor: polda.analisisLanjutan?.rbsScore,
  };
}

/** Bangun anchor E-Profile dari satker Mabes (Bareskrim, Baharkam, dst, lihat `mabesSatkerData.ts`). */
export function anchorFromSatkerMabes(satker: SatkerMabesItem): EProfilAnchor {
  return {
    id: satker.id,
    nama: satker.nama,
    rbsScoreAnchor: 100 - satker.skorRisiko, // skorRisiko tinggi = risiko tinggi -> RBS anchor terbalik agar konsisten
  };
}

export function getEProfilDetailForPolda(polda: PoldaSatker) {
  return getEProfilDetail(anchorFromPolda(polda));
}

export function getEProfilDetailForSatkerMabes(satker: SatkerMabesItem) {
  return getEProfilDetail(anchorFromSatkerMabes(satker));
}

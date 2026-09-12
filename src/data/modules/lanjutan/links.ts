/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Rantai lintas modul BA-SA-Lanjutan (Plan bagian 3) agar keterkaitan dokumen antar modul
 * terlihat di UI (badge asal-data / badge tujuan-data), bukan hanya diagram statis.
 *
 *   B.12 (Lengkap) -> B.13 skoring -> B.14 Surat Tugas -> B.15 KK
 *   B.16 (Kritis >730 hari) -> faktor TLHP B.13 + pemicu B.18
 *   B.8 nilai final -> B.17 rollup -> B.18
 */
import type { ModuleId } from '../../../config/moduleRegistry';

export interface ModuleLinkEdge {
  from: ModuleId;
  to: ModuleId;
  label: string;
}

export const MODULE_LANJUTAN_CHAIN: ModuleLinkEdge[] = [
  { from: 'b12', to: 'b13', label: 'Auditi status "Lengkap" menjadi kandidat skoring risiko' },
  { from: 'b13', to: 'b14', label: 'Kegiatan PKPT disahkan -> perlu penugasan & Surat Tugas' },
  { from: 'b14', to: 'b15', label: 'Surat Tugas terbit -> membuka Kertas Kerja Audit digital' },
  { from: 'b15', to: 'b16', label: 'Temuan KKA disahkan -> masuk rekap Rekomendasi & TLHP' },
  { from: 'b16', to: 'b13', label: 'TLHP berstatus Kritis (>730 hari) menambah faktor Hasil Audit Sebelumnya' },
  { from: 'b16', to: 'b18', label: 'TLHP Kritis memicu Early Warning aturan "Keterlambatan TLHP"' },
  { from: 'b8', to: 'b17', label: 'Nilai final maturitas SPIP satker -> rollup nasional/Itwil' },
  { from: 'b17', to: 'b18', label: 'Penurunan level maturitas memicu Early Warning' },
  { from: 'b7', to: 'b18', label: 'Penurunan capaian IKU memicu Early Warning' },
  { from: 'b12', to: 'b18', label: 'Anomali kelengkapan data Audit Universe memicu Early Warning' },
];

export function getOutgoingLinks(moduleId: ModuleId): ModuleLinkEdge[] {
  return MODULE_LANJUTAN_CHAIN.filter((edge) => edge.from === moduleId);
}

export function getIncomingLinks(moduleId: ModuleId): ModuleLinkEdge[] {
  return MODULE_LANJUTAN_CHAIN.filter((edge) => edge.to === moduleId);
}

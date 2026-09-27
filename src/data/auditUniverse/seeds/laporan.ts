/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 6.2 Laporan SPIP + 6.3 Laporan IKU (Portal Satker). Slot definitions and per-org seed
 * entries, hand-transcribed and simplified from `27092026/.extracted/portal-data-satker.html`
 * (`slotsFor`, `seedLap`) — the prototype procedurally generates entries for every PIC
 * satker via a seeded RNG; here we seed a representative set for the org units that are
 * actually reachable from the app's demo accounts (Polda Riau and its jajaran), which is
 * enough to exercise every status (Belum Dibuka/Perlu Diunggah/Menunggu Verifikasi/Diterima/
 * Perlu Perbaikan/Terlambat) without carrying the RNG machinery into the migrated app.
 *
 * Offsets follow the same "day offset relative to today" convention as `permintaan.ts`.
 */
import type { LaporanSlotDef } from '../types';

export const IKU_SLOTS: LaporanSlotDef[] = [
  { key: 'PEN', nama: 'Penetapan Target IKU', periodeLabel: 'Tahunan', dokId: 'DOK-PK-005' },
  { key: 'TW1', nama: 'Capaian IKU Triwulan I', periodeLabel: 'Triwulan I', dokId: 'DOK-PK-005' },
  { key: 'TW2', nama: 'Capaian IKU Triwulan II', periodeLabel: 'Triwulan II', dokId: 'DOK-PK-005' },
  { key: 'TW3', nama: 'Capaian IKU Triwulan III', periodeLabel: 'Triwulan III', dokId: 'DOK-PK-005' },
  { key: 'TW4', nama: 'Capaian IKU Triwulan IV', periodeLabel: 'Triwulan IV', dokId: 'DOK-PK-005' },
];

export const SPIP_SLOTS: LaporanSlotDef[] = [
  { key: 'RTP', nama: 'Rencana Tindak Pengendalian (RTP)', periodeLabel: 'Tahunan', dokId: 'DOK-RSK-009' },
  { key: 'PM1', nama: 'Laporan Pemantauan SPIP Semester I', periodeLabel: 'Semester I', dokId: 'DOK-RSK-006' },
  { key: 'PMS', nama: 'Penilaian Mandiri SPIP', periodeLabel: 'Tahunan', dokId: 'DOK-RSK-007', butuhSkor: true },
  { key: 'PM2', nama: 'Laporan Pemantauan SPIP Semester II', periodeLabel: 'Semester II', dokId: 'DOK-RSK-006' },
];

export interface LaporanSeedEntry {
  jenis: 'IKU' | 'SPIP';
  key: string;
  status: 'draft' | 'wait' | 'ok' | 'fix';
  offsetDays: number;
  catatan?: string;
  verifikatorOleh?: string;
  verifikasiOffsetDays?: number | null;
  skor?: number | null;
  realisasi?: Record<string, number> | null;
}

const VERIF_ITWIL_III = 'AKP Sari Wulandari (Verifikator Itwil III)';

/** laporan seed per OrgUnit id, tahun anggaran "berjalan" (tahun ini). */
export const LAPORAN_SEED_BERJALAN: Record<string, LaporanSeedEntry[]> = {
  'ORG-00300': [
    { jenis: 'IKU', key: 'PEN', status: 'ok', offsetDays: -95, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -93 },
    { jenis: 'IKU', key: 'TW1', status: 'ok', offsetDays: -35, realisasi: { I1: 58.4, I2: 82.1, I3: 3.2, I4: 93.4, I5: 84 }, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -33 },
    {
      jenis: 'IKU',
      key: 'TW2',
      status: 'fix',
      offsetDays: -5,
      realisasi: { I1: 61.2, I2: 83.5, I3: 4.1, I4: 96.2, I5: 86 },
      catatan: 'Realisasi indikator penurunan fatalitas laka lantas tidak sama dengan data Ditlantas. Mohon cek ulang dan unggah laporan yang sudah diperbaiki.',
      verifikatorOleh: VERIF_ITWIL_III,
      verifikasiOffsetDays: -2,
    },
    { jenis: 'SPIP', key: 'RTP', status: 'ok', offsetDays: -60, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -58 },
    { jenis: 'SPIP', key: 'PM1', status: 'wait', offsetDays: -1 },
  ],
  'ORG-00351': [
    { jenis: 'IKU', key: 'PEN', status: 'ok', offsetDays: -96, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -94 },
    { jenis: 'IKU', key: 'TW1', status: 'ok', offsetDays: -34, realisasi: { I1: 62.1, I2: 85.0, I3: 2.8, I4: 91.0, I5: 88 }, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -32 },
    { jenis: 'SPIP', key: 'RTP', status: 'ok', offsetDays: -58, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -56 },
    { jenis: 'SPIP', key: 'PM1', status: 'ok', offsetDays: -4, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -2 },
  ],
  'ORG-00352': [
    { jenis: 'IKU', key: 'PEN', status: 'ok', offsetDays: -90, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -88 },
    { jenis: 'IKU', key: 'TW1', status: 'ok', offsetDays: -30, realisasi: { I1: 55.0, I2: 79.6, I3: 3.9, I4: 89.2, I5: 81 }, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -28 },
    { jenis: 'SPIP', key: 'RTP', status: 'ok', offsetDays: -55, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -52 },
    { jenis: 'SPIP', key: 'PMS', status: 'ok', offsetDays: -20, skor: 3.1, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -18 },
  ],
};

/** Riwayat pengiriman 14 hari terakhir (dipakai grafik ringkas dashboard 6.0), per OrgUnit id. */
export const HISTORI_KIRIM_14_HARI: Record<string, number[]> = {
  'ORG-00300': [1, 0, 2, 3, 0, 1, 4, 2, 0, 5, 3, 1, 4, 0],
  'ORG-00351': [0, 1, 0, 0, 2, 1, 0, 1, 0, 0, 3, 0, 1, 1],
  'ORG-00352': [0, 0, 1, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1],
};

export const IND_IKU_DEFS: { id: string; nama: string; target: number; satuan: string }[] = [
  { id: 'I1', nama: 'Penurunan Fatalitas Laka Lantas', target: 60, satuan: '%' },
  { id: 'I2', nama: 'Penyelesaian Perkara Tepat Waktu', target: 85, satuan: '%' },
  { id: 'I3', nama: 'Waktu Respons Panggilan Darurat', target: 5, satuan: 'menit' },
  { id: 'I4', nama: 'Indeks Kepuasan Masyarakat', target: 90, satuan: '%' },
  { id: 'I5', nama: 'Serapan Anggaran', target: 92, satuan: '%' },
];

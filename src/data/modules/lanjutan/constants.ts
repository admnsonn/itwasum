/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Konstanta domain nyata untuk 11 modul BA-SA-Lanjutan (B.4, B.5, B.8, B.10, B.12-B.18),
 * diambil verbatim dari `dokumen-referensi/BA-SA-Lanjutan/` (Plan bagian 3).
 */

/** Bobot 6 faktor risiko PKPT (B.13) — total harus 1,00. */
export const PKPT_RISK_FACTORS = [
  { id: 'signifikansi-anggaran', label: 'Signifikansi Anggaran', bobot: 0.15 },
  { id: 'tingkat-kepatuhan', label: 'Tingkat Kepatuhan', bobot: 0.20 },
  { id: 'kompleksitas-tusi', label: 'Kompleksitas Tusi', bobot: 0.20 },
  { id: 'hasil-audit-sebelumnya', label: 'Hasil Audit Sebelumnya', bobot: 0.20 },
  { id: 'sensitivitas-isu', label: 'Sensitivitas Isu', bobot: 0.15 },
  { id: 'lama-belum-diaudit', label: 'Lama Belum Diaudit', bobot: 0.10 },
] as const;

export const PKPT_RISK_FACTOR_TOTAL_BOBOT = PKPT_RISK_FACTORS.reduce((sum, f) => sum + f.bobot, 0);

export type PkptJenisKegiatan = 'Berbasis Risiko' | 'Mandatori' | 'Usulan Pimpinan';
export const PKPT_JENIS_KEGIATAN: PkptJenisKegiatan[] = ['Berbasis Risiko', 'Mandatori', 'Usulan Pimpinan'];

/** Kode Kertas Kerja (KK) SPIP satker (B.8), berurutan sesuai struktur asesmen. */
export const SPIP_KK_CODES = [
  'KKLEAD_SPIP',
  'KKLEAD I', 'KKLEAD II', 'KKLEAD III',
  'KK1', 'KK2',
  'KK3.1', 'KK3.2', 'KK3.3', 'KK3.4',
  'KK4',
  'KK5.1(A)', 'KK5.1(B)', 'KK5.2',
  'KK6', 'KK7', 'KK9',
] as const;

export const SPIP_KK_DESKRIPSI: Record<string, string> = {
  KKLEAD_SPIP: 'Kertas Kerja Utama Penyimpulan Level Maturitas SPIP',
  'KKLEAD I': 'Kertas Kerja Lead Penetapan Tujuan',
  'KKLEAD II': 'Kertas Kerja Lead Struktur & Proses',
  'KKLEAD III': 'Kertas Kerja Lead Pencapaian Tujuan (terkena penalti KK4)',
  KK1: 'Lingkungan Pengendalian',
  KK2: 'Penilaian Risiko',
  'KK3.1': 'Kegiatan Pengendalian - Reviu Kinerja',
  'KK3.2': 'Kegiatan Pengendalian - Pembinaan SDM',
  'KK3.3': 'Kegiatan Pengendalian - Pengendalian Fisik Aset',
  'KK3.4': 'Kegiatan Pengendalian - Pemisahan Fungsi',
  KK4: 'Kegiatan Pengendalian - Otorisasi Transaksi (faktor penalti KKLEAD III)',
  'KK5.1(A)': 'Informasi & Komunikasi - Sistem Informasi Internal',
  'KK5.1(B)': 'Informasi & Komunikasi - Sistem Informasi Eksternal',
  'KK5.2': 'Informasi & Komunikasi - Efektivitas Komunikasi',
  KK6: 'Pemantauan Berkelanjutan',
  KK7: 'Evaluasi Terpisah',
  KK9: 'Penyimpulan Tindak Lanjut Rekomendasi SPIP Periode Sebelumnya',
};

/** Level maturitas SPIP 0-5 (Peraturan BPKP tentang penyelenggaraan SPIP). */
export const SPIP_MATURITY_LEVELS = [
  { level: 0, label: 'Belum Ada', deskripsi: 'Praktik pengendalian intern belum ada/diformalkan.' },
  { level: 1, label: 'Rintisan', deskripsi: 'Praktik pengendalian intern ada namun bersifat ad hoc dan belum terdokumentasi.' },
  { level: 2, label: 'Berkembang', deskripsi: 'Praktik pengendalian mulai terdokumentasi namun penerapan belum konsisten.' },
  { level: 3, label: 'Terdefinisi', deskripsi: 'Praktik pengendalian terdokumentasi dan diterapkan secara konsisten.' },
  { level: 4, label: 'Terkelola dan Terukur', deskripsi: 'Efektivitas pengendalian dipantau dan dievaluasi secara berkala dengan indikator terukur.' },
  { level: 5, label: 'Optimum', deskripsi: 'Pengendalian intern terintegrasi penuh dan menjadi budaya organisasi (continuous improvement).' },
] as const;

export function getMaturityLabel(level: number): string {
  return SPIP_MATURITY_LEVELS.find((l) => l.level === Math.round(level))?.label ?? 'Belum Ada';
}

/** 3 mekanisme asesmen SPIP (B.8) dengan warna badge sesuai referensi. */
export const SPIP_ASSESSMENT_MECHANISMS = [
  { id: 'pm', label: 'Penilaian Mandiri (PM)', color: '#EAB308' },   // kuning
  { id: 'pk', label: 'Penilaian oleh Korwas (PK)', color: '#EC4899' }, // merah muda
  { id: 'evaluasi', label: 'Evaluasi Itwasum', color: '#22C55E' },     // hijau
] as const;

/** 4 tusi asesor SPIP satker (B.8). */
export const SPIP_ASSESSOR_ROLES = [
  { id: 't1', kode: 'T1', label: 'Srena (Perencanaan)' },
  { id: 't2', kode: 'T2', label: 'Puskeu (Keuangan)' },
  { id: 't3', kode: 'T3', label: 'Slog (Logistik)' },
  { id: 't4', kode: 'T4', label: 'Itwasum (Pengawasan)' },
] as const;

/** Sesi edit KK SPIP terkunci per pengguna selama 15 menit (BR-B8-SESI). */
export const SPIP_SESI_EDIT_MENIT = 15;

/** Ambang aging TLHP dianggap Kritis (B.16), dalam hari kalender. */
export const TLHP_AMBANG_KRITIS_HARI = 730;

/** Ambang kapasitas beban auditor (B.14), dalam persen dari kapasitas maksimal. */
export const AUDITOR_CAPACITY_THRESHOLDS = {
  mendekatiPenuhMin: 80,
  mendekatiPenuhMax: 99,
  penuhMin: 100,
};

export function getCapacityStatusLabel(percent: number): 'Tersedia' | 'Mendekati Penuh' | 'Penuh' {
  if (percent >= AUDITOR_CAPACITY_THRESHOLDS.penuhMin) return 'Penuh';
  if (percent >= AUDITOR_CAPACITY_THRESHOLDS.mendekatiPenuhMin) return 'Mendekati Penuh';
  return 'Tersedia';
}

/** SLA Early Warning (B.18), dalam jam (24 = respons awal kritis, 72 = tingkat tinggi). */
export const EARLY_WARNING_SLA = {
  kritisJam: 24,
  tinggiJam: 72,
  perhatianHari: 7,
};

/** Snooze maksimal peringatan Early Warning (B.18), dalam hari. */
export const EARLY_WARNING_SNOOZE_MAKS_HARI = 7;

/** 4 aturan pemicu Early Warning (B.18), lintas modul. */
export const EARLY_WARNING_TRIGGER_RULES = [
  { id: 'ew-tlhp', label: 'Keterlambatan TLHP', sumberModul: 'B.16', deskripsi: 'TLHP melewati ambang aging Kritis (>730 hari) tanpa verifikasi bukti.' },
  { id: 'ew-maturitas', label: 'Penurunan Maturitas SPIP', sumberModul: 'B.17', deskripsi: 'Skor maturitas SPIP satker turun >=1 level dibanding periode sebelumnya.' },
  { id: 'ew-iku', label: 'Penurunan Capaian IKU', sumberModul: 'B.7', deskripsi: 'Capaian IKU satker turun signifikan terhadap target tahun berjalan.' },
  { id: 'ew-data', label: 'Anomali Kelengkapan Data', sumberModul: 'B.12', deskripsi: 'Status kelengkapan data Audit Universe satker berubah menjadi Perlu Pembaruan/Nonaktif.' },
] as const;

/** Format nomor Surat Tugas (B.14): ST/{nomor}/{bulan-romawi}/{kode-bidang}/{tahun}. */
export const ROMAN_MONTHS = ['I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X', 'XI', 'XII'];

export function formatSuratTugasNomor(nomor: number, tanggal: Date, kodeBidang = 'WAS.1.1'): string {
  const bulanRomawi = ROMAN_MONTHS[tanggal.getMonth()];
  return `ST/${nomor}/${bulanRomawi}/${kodeBidang}/${tanggal.getFullYear()}`;
}

/** Klasifikasi kecepatan naskah E-Office (B.5) -> menentukan SLA disposisi (hari kerja). */
export const EOFFICE_KECEPATAN = [
  { id: 'sangat-segera', label: 'Sangat Segera', slaHari: 1 },
  { id: 'segera', label: 'Segera', slaHari: 3 },
  { id: 'biasa', label: 'Biasa', slaHari: 7 },
] as const;

/** Klasifikasi kerahasiaan naskah E-Office (B.5). */
export const EOFFICE_KERAHASIAAN = ['Rahasia', 'Terbatas', 'Biasa'] as const;
export type EOfficeKerahasiaan = (typeof EOFFICE_KERAHASIAAN)[number];

/** Kunci review simultan Surat Usulan (B.4), dalam menit (BR-B4-KUNCI). */
export const SURAT_USULAN_KUNCI_REVIEW_MENIT = 15;

/** SLA per tahap review Surat Usulan (B.4), dalam hari kerja. */
export const SURAT_USULAN_SLA_HARI_KERJA = 3;

/** Ambang kenaikan volume log dianggap anomali (B.10), dalam persen. */
export const LOG_ANOMALI_AMBANG_PERSEN = 200;

/** Retensi default log aktivitas (B.10), dalam hari. */
export const LOG_RETENSI_DEFAULT_HARI = 1825; // 5 tahun

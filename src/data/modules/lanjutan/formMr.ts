/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Data & tipe untuk B.15 "Form MR per Objek" (Alur Form Manajemen Risiko per Objek Audit,
 * F1-F7) — hand-transcribed dari mock data pada
 * `27092026/[self research] Alur Form MR per Objek Audit-html/Main.dc.html` (Plan "Migrate
 * 27092026 prototypes", todo `b15-form-mr`). Mockup tersebut adalah design reference (bukan
 * kode produksi); nilai di bawah mereplikasi field & angka contohnya secara verbatim, disusun
 * ulang dengan tipe TypeScript untuk dipakai `FormMrPerObjek.tsx`.
 */

export type StepId = 'F1' | 'F2' | 'F3' | 'F4' | 'F5' | 'F6' | 'F7';

export const STEP_IDS: StepId[] = ['F1', 'F2', 'F3', 'F4', 'F5', 'F6', 'F7'];

export const STEP_TITLES: Record<StepId, string> = {
  F1: 'Profil & Konteks Risiko',
  F2: 'Register Risiko (Self-Assessment)',
  F3: 'Reviu Register & RCM',
  F4: 'KKP Uji Kontrol',
  F5: 'Konsep Temuan & Tanggapan',
  F6: 'Kesimpulan Audit MR Objek',
  F7: 'Rencana Aksi & Tindak Lanjut',
};

export const STEP_PHASE: Record<StepId, 'Pra audit' | 'Pelaksanaan' | 'Pasca audit'> = {
  F1: 'Pra audit',
  F2: 'Pra audit',
  F3: 'Pra audit',
  F4: 'Pelaksanaan',
  F5: 'Pelaksanaan',
  F6: 'Pasca audit',
  F7: 'Pasca audit',
};

/** Aktor pengisi & peran reviewer per tahap (dipetakan ke `OfficialRole` app ini). */
export const STEP_ACTOR_LABEL: Record<StepId, string> = {
  F1: 'Auditee (UPR)',
  F2: 'Auditee (UPR)',
  F3: 'Auditor',
  F4: 'Auditor',
  F5: 'Auditor',
  F6: 'Ketua Tim',
  F7: 'Auditee (UPR)',
};
export const STEP_REVIEWER_LABEL: Record<StepId, string> = {
  F1: 'Ketua Tim',
  F2: 'Ketua Tim',
  F3: 'Ketua Tim',
  F4: 'Dalnis (Pengawas Tim)',
  F5: 'Dalnis (Pengawas Tim)',
  F6: 'Daltu (Koordinator/Pimpinan)',
  F7: 'Auditor',
};

export type FormMrStatus = 'Belum dibuka' | 'Draf' | 'Diajukan' | 'Dikembalikan' | 'Disetujui' | 'Terkunci';

export type RiskKategori = 'Keuangan/Fraud' | 'Operasional' | 'Kepatuhan' | 'Reputasi' | 'Strategis';
export type KontrolJenis = 'Preventif' | 'Detektif' | 'Korektif';

/** F2 "Prioritas Uji" — menandai risiko mana yang wajib diuji auditor pada F4 (KKP Uji Kontrol). */
export type PrioritasUji = 'Ya · Utama' | 'Ya' | 'Tidak';

export interface RiskRegisterEntry {
  kode: string;
  proses: string;
  kategori: RiskKategori;
  pernyataan: string;
  penyebab: string;
  dampak: string;
  /** Kemungkinan & Dampak inheren, skala 1-5. */
  inherenL: number;
  inherenI: number;
  kontrolUraian: string;
  kontrolJenis: KontrolJenis;
  efektivitasUpr: 'Efektif' | 'Efektif dengan Catatan' | 'Tidak Efektif';
  /** Kemungkinan & Dampak residual (setelah kontrol), skala 1-5. */
  residualL: number;
  residualI: number;
  mitigasiTindakan: string;
  mitigasiPic: string;
  mitigasiTenggat: string;
  /** Diisi Auditee (UPR) pada F2 (Register Risiko) — menandai prioritas uji kontrol F4. */
  prioritasUji: PrioritasUji;
  /** Diisi Auditor pada F3 (Reviu Register & RCM). */
  auditorSepakat?: boolean;
  auditorResidualL?: number;
  auditorResidualI?: number;
  auditorAlasan?: string;
}

export interface KontrolKunci {
  kode: string;
  uraian: string;
  prosedurPustaka: string;
}

/** F3 "Risiko Tambahan Temuan Auditor" — risiko baru yang ditemukan auditor saat reviu, di
 * luar Register Risiko self-assessment UPR (F2). */
export interface RisikoTambahan {
  id: string;
  pernyataan: string;
  kategori: RiskKategori;
  kontrolTerkait: string;
}

export interface ObjekAuditMr {
  namaObjek: string;
  tingkat: 'Polres' | 'Polda' | 'Satker Mabes';
  sprin: string;
  tahunAnggaran: string;
  paguDipa: string;
  rbiaAwal: number;
  rbiaLabel: string;
  ketuaTim: string;
  jumlahAuditor: number;
  dalnis: string;
  daltu: string;
  sasaranIku: string;
  prosesBisnis: string[];
  pemilikRisikoUpr: string;
  koordinatorMr: string;
  periode: string;
}

export const OBJEK_AUDIT_MR: ObjekAuditMr = {
  namaObjek: 'Polres Contoh (data fiktif)',
  tingkat: 'Polres',
  sprin: 'Sprin/128/IX/2026/Itwasum',
  tahunAnggaran: '2026',
  paguDipa: 'Rp 24.850.000.000',
  rbiaAwal: 3.0,
  rbiaLabel: 'Sedang',
  ketuaTim: 'AKBP Bimo Saraswanto, S.I.K.',
  jumlahAuditor: 2,
  dalnis: 'Kombes Pol. Teguh Prasetyo, S.I.K., M.H.',
  daltu: 'Brigjen Pol. Dr. Sulistyo Pudjo Hartono, S.I.K., M.Si.',
  sasaranIku: 'Penurunan fatalitas laka lantas, penyelesaian perkara tepat waktu, indeks kepuasan masyarakat.',
  prosesBisnis: ['Pengadaan Barang/Jasa', 'Pengelolaan Keuangan', 'Pelayanan Publik (SIM/SKCK)', 'Pengelolaan BMN', 'SDM', 'Operasional'],
  pemilikRisikoUpr: 'Kapolres (selaku UPR)',
  koordinatorMr: 'Kompol Rangga Aditya, S.I.K. (Kasi Was)',
  periode: 'Semester I 2026',
};

export const RISK_REGISTER_SEED: RiskRegisterEntry[] = [
  {
    kode: 'R-01',
    proses: 'Pengadaan Barang/Jasa',
    kategori: 'Keuangan/Fraud',
    pernyataan: 'HPS pengadaan kendaraan dinas disusun tidak berdasarkan survei pasar yang memadai.',
    penyebab: 'PPK menyusun HPS hanya berdasarkan katalog elektronik tanpa verifikasi harga pasar terkini.',
    dampak: 'Potensi kemahalan harga dan kerugian negara.',
    inherenL: 4,
    inherenI: 4,
    kontrolUraian: 'Reviu HPS oleh PPK sebelum penetapan.',
    kontrolJenis: 'Preventif',
    efektivitasUpr: 'Efektif dengan Catatan',
    residualL: 3,
    residualI: 3,
    mitigasiTindakan: 'Menetapkan SOP survei pasar minimal 3 penyedia sebelum penyusunan HPS.',
    mitigasiPic: 'PPK Pengadaan',
    mitigasiTenggat: '2026-09-30',
    prioritasUji: 'Ya · Utama',
  },
  {
    kode: 'R-02',
    proses: 'Pelayanan Publik (SIM/SKCK)',
    kategori: 'Kepatuhan',
    pernyataan: 'Pungutan di luar tarif resmi pada layanan penerbitan SKCK.',
    penyebab: 'Lemahnya pengawasan langsung terhadap petugas loket dan minimnya sosialisasi tarif resmi kepada pemohon.',
    dampak: 'Kerugian masyarakat dan penurunan kepercayaan publik terhadap Polri.',
    inherenL: 4,
    inherenI: 3,
    kontrolUraian: 'Pemeriksaan serah terima berkas & pembayaran melalui kanal resmi (non-tunai).',
    kontrolJenis: 'Detektif',
    efektivitasUpr: 'Efektif',
    residualL: 2,
    residualI: 2,
    mitigasiTindakan: 'Memasang papan informasi tarif resmi & kanal pengaduan di loket layanan.',
    mitigasiPic: 'Kasium Polres',
    mitigasiTenggat: '2026-08-15',
    prioritasUji: 'Ya',
  },
  {
    kode: 'R-03',
    proses: 'Pengelolaan Keuangan',
    kategori: 'Operasional',
    pernyataan: 'Penggunaan Uang Persediaan (UP) tidak dipertanggungjawabkan tepat waktu.',
    penyebab: 'Bendahara pengeluaran terlambat menyusun SPTJ akibat rangkap tugas operasional lapangan.',
    dampak: 'Keterlambatan penyerapan anggaran dan risiko sanksi administratif KPPN.',
    inherenL: 3,
    inherenI: 3,
    kontrolUraian: 'Rekonsiliasi UP bulanan oleh Kasium.',
    kontrolJenis: 'Preventif',
    efektivitasUpr: 'Efektif',
    residualL: 2,
    residualI: 2,
    mitigasiTindakan: 'Menetapkan tenggat SPTJ H+5 setiap akhir bulan dengan pengingat sistem.',
    mitigasiPic: 'Bendahara Pengeluaran',
    mitigasiTenggat: '2026-08-01',
    prioritasUji: 'Tidak',
  },
];

export const KONTROL_KUNCI_SEED: KontrolKunci[] = [
  { kode: 'K-01', uraian: 'Reviu HPS oleh PPK sebelum penetapan.', prosedurPustaka: 'PU-PBJ-03 · Reviu Harga Perkiraan Sendiri' },
  { kode: 'K-02', uraian: 'Pemeriksaan serah terima barang/pekerjaan.', prosedurPustaka: 'PU-PBJ-07 · Verifikasi Serah Terima' },
];

export const RISIKO_TAMBAHAN_SEED: RisikoTambahan[] = [];

export interface LogSeedEntry {
  waktuLabel: string;
  aksi: string;
}

export const LOG_SEED: LogSeedEntry[] = [
  { waktuLabel: 'H-14', aksi: 'Skor RBIA 3,00 (Sedang) masuk PKPT 2026.' },
  { waktuLabel: 'H-7', aksi: 'Surat Perintah Irwasum diterbitkan untuk penugasan Wasrik Berbasis Risiko.' },
  { waktuLabel: 'Hari ini', aksi: 'F1 Profil & Konteks Risiko dibuka oleh Auditee (UPR).' },
];

/** Ambang skor L x I (identik prototipe): 1-5 Rendah, 6-11 Sedang, 12-15 Tinggi, 16-25 Sangat Tinggi. */
export type RiskLevel = 'Rendah' | 'Sedang' | 'Tinggi' | 'Sangat Tinggi';
export function riskLevel(score: number): RiskLevel {
  if (score <= 5) return 'Rendah';
  if (score <= 11) return 'Sedang';
  if (score <= 15) return 'Tinggi';
  return 'Sangat Tinggi';
}

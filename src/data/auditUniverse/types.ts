/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Tipe data domain "Audit Universe — Pengumpulan Data" (Plan "Migrate 27092026 prototypes").
 * Direplikasi dari 3 prototipe HTML di `27092026/`:
 *   - `prototipe-master-data.html` (4.1-4.4 Master Data) -> OrgUnit/Tipologi/JenisPengawasan/
 *     Bidjemen/KatalogDokumen.
 *   - `permintaan-pengumpulan-data.html` shell -> `pd` (5.1 Permintaan, Admin) + `pt` (6.0-6.3
 *     Portal Satker, PIC + Verifikator) -> Permintaan/BerkasSatker/LaporanEntry.
 *
 * Tanggal seeded disimpan sebagai *offset hari relatif ke "hari ini"* pada modul `seeds/*`
 * (identik dengan pola `addD(n)` prototipe), lalu diresolusi ke tanggal ISO absolut satu kali
 * saat store diinisialisasi/di-reset (lihat `store.ts`). Sesudah itu seluruh data berjalan
 * (termasuk yang dibuat pengguna) memakai tanggal ISO biasa.
 */

export type JenjangOrg =
  | 'Mabes Polri'
  | 'Satker Mabes'
  | 'Polda'
  | 'Satker Polda'
  | 'Polres'
  | 'Polsek'
  | 'Unit Kerja';

export const JENJANG_ORG_LIST: JenjangOrg[] = [
  'Mabes Polri',
  'Satker Mabes',
  'Polda',
  'Satker Polda',
  'Polres',
  'Polsek',
  'Unit Kerja',
];

/** Jenjang yang punya tipologi (ELIG pada prototipe). */
export const JENJANG_TIPOLOGI: JenjangOrg[] = ['Satker Mabes', 'Polda', 'Satker Polda', 'Polres', 'Polsek'];

/** Jenjang yang jadi sasaran permintaan pengumpulan data (JENJANG_TUJUAN pada prototipe). */
export const JENJANG_SASARAN: JenjangOrg[] = ['Satker Mabes', 'Polda', 'Satker Polda', 'Polres', 'Polsek'];

export const ITWIL_LIST = ['Itwil I', 'Itwil II', 'Itwil III', 'Itwil IV', 'Itwil V'] as const;
export type ItwilId = (typeof ITWIL_LIST)[number];

export interface OrgUnit {
  id: string;
  jenjang: JenjangOrg;
  induk: string;
  nama: string;
  sing: string;
  /** Hanya diisi manual pada jenjang Polda & Satker Mabes; unit lain mewarisi via induk. */
  itwil: string;
  tip: string | null;
  kode: string;
  ang: 'ya' | 'tidak' | '';
  /** Untuk unit non-anggaran (ang="tidak"): id ORG yang mengelola anggarannya. */
  peng: string;
  ketTip: string;
  /** Ditandai/dipakai oleh entitas lain (mis. penugasan) -> memblokir hapus. */
  perm: boolean;
  aktif: boolean;
  alasan: string;
}

export interface Tipologi {
  id: string;
  jenjang: JenjangOrg;
  nama: string;
  ket: string;
  aktif: boolean;
}

export interface JenisPengawasan {
  id: string;
  induk: string;
  nama: string;
  sifat: 'Terprogram' | 'Tidak Terprogram';
  ket: string;
  dipakai: boolean;
  aktif: boolean;
}

export interface Bidjemen {
  id: string;
  nama: string;
  sing: string;
  cak: string;
  aktif: boolean;
}

export const KATEGORI_DOKUMEN: [string, string][] = [
  ['PK', 'Perencanaan & Kinerja'],
  ['AK', 'Anggaran & Keuangan'],
  ['PBJ', 'Pengadaan Barang & Jasa'],
  ['BMN', 'BMN / Sarpras / Logistik'],
  ['SDM', 'SDM / Personel'],
  ['OPS', 'Operasional'],
  ['RSK', 'Risiko & SPIP'],
  ['AUD', 'Audit & Pengawasan'],
  ['LGL', 'Legal / Governance'],
  ['SE', 'Supporting Evidence'],
];

export type JenisDokumen = 'Dokumen' | 'Data';
export type CaraPengambilan = 'Upload' | 'Integrasi' | 'Terjadwal';
export type SifatDokumen = 'Wajib' | 'Opsional';

export interface KatalogDokumen {
  /** `DOK-{kategori}-{urutan 3 digit}`. */
  id: string;
  kat: string;
  nama: string;
  desk: string;
  jenis: JenisDokumen;
  cara: CaraPengambilan;
  sumber: string;
  sifat: SifatDokumen;
  aktif: boolean;
  /** Catatan seeder tempat kolom aslinya kosong (jejak data "Perlu Dicek"). */
  cek: string[];
  dipakai: boolean;
}

/** Id dokumen sentinel untuk pilihan "Lainnya" pada dropzone unggah. */
export const LAINNYA_DOC_ID = 'LAINNYA';

export type PermintaanStatus = 'Draft' | 'Terkirim' | 'Ditutup';
/** Status turunan (dihitung, bukan disimpan) — Draft/Ditutup apa adanya, sisanya dari tanggal mulai. */
export type PermintaanStatusTurunan = 'Draft' | 'Dijadwalkan' | 'Berjalan' | 'Ditutup';
export type PermintaanTipe = 'Berkala' | 'Tambahan Audit';

export interface PermintaanLogEntry {
  id: string;
  /** ISO timestamp `YYYY-MM-DDTHH:mm`. */
  waktu: string;
  oleh: string;
  aksi: string;
  /** Jika diisi, entri log ini spesifik untuk satu Satker sasaran (bukan seluruh permintaan). */
  orgId?: string | null;
}

export interface Permintaan {
  id: string;
  tipe: PermintaanTipe;
  judul: string;
  jpId: string;
  tahunAnggaran: string;
  periodeLabel: string;
  /** ISO date `YYYY-MM-DD`. */
  mulai: string;
  selesai: string;
  dibuat: string;
  dikirim?: string;
  ditutup?: string;
  pesan: string;
  lampiran: { nama: string; sizeBytes: number }[];
  /** Id OrgUnit sasaran. */
  sasaran: string[];
  status: PermintaanStatus;
  /** Hanya untuk tipe "Tambahan Audit" (dari Kertas Kerja Audit Digital). */
  penugasan?: { nomor: string; peminta: string };
  log: PermintaanLogEntry[];
}

export type BerkasStatus = 'draft' | 'wait' | 'ok' | 'fix';

export const BERKAS_STATUS_LABEL: Record<BerkasStatus, string> = {
  draft: 'Belum Dikirim',
  wait: 'Menunggu Verifikasi',
  ok: 'Diterima',
  fix: 'Perlu Perbaikan',
};

export interface BerkasSatker {
  id: string;
  nama: string;
  sizeBytes: number;
  dokId: string;
  keterangan: string;
  status: BerkasStatus;
  /** ISO date saat file diunggah/dikirim. */
  tgl: string | null;
  terlambat: boolean;
  catatan: string;
  verifikatorOleh: string;
  /** ISO date saat diverifikasi (ok/fix). */
  tglVerifikasi: string | null;
}

export type StageSatker = 'Belum Mulai' | 'Sedang Mengunggah' | 'Sudah Mengirim' | 'Selesai';

export type LaporanJenis = 'IKU' | 'SPIP';

export interface LaporanSlotDef {
  key: string;
  nama: string;
  periodeLabel: string;
  dokId: string;
  /** Slot mengharuskan skor manual (mis. Penilaian Mandiri SPIP). */  
  butuhSkor?: boolean;
}

export interface LaporanEntry {
  id: string;
  jenis: LaporanJenis;
  key: string;
  tahunAnggaran: string;
  status: BerkasStatus;
  fileNama: string;
  fileSizeBytes: number;
  tgl: string;
  catatan: string;
  verifikatorOleh: string;
  tglVerifikasi: string | null;
  skor: number | null;
  realisasi?: Record<string, number> | null;
}

export interface AuditUniverseState {
  seedVersion: number;
  orgUnits: OrgUnit[];
  tipologi: Tipologi[];
  jenisPengawasan: JenisPengawasan[];
  bidjemen: Bidjemen[];
  katalog: KatalogDokumen[];
  permintaan: Permintaan[];
  /** berkas[requestId][orgId] -> daftar berkas yang sudah/berjalan diunggah Satker itu. */
  berkas: Record<string, Record<string, BerkasSatker[]>>;
  /** selesai[requestId][orgId] -> tanggal ISO ditandai selesai oleh PIC (independen dari status berkas). */
  selesai: Record<string, Record<string, string>>;
  /** laporan[orgId] -> daftar entri Laporan SPIP/IKU periodik. */
  laporan: Record<string, LaporanEntry[]>;
}

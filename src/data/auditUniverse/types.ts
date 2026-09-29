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

/** Satu entri riwayat perubahan Master Data (4.1-4.4) — snapshot ringkas, bukan diff penuh. */
export interface MasterDataHistoryEntry {
  waktu: string;
  oleh: string;
  aksi: string;
}

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
  /** Masa berlaku entri (4.1 Organisasi) — ISO date, opsional. */
  berlakuMulai?: string;
  berlakuSampai?: string;
  /** Nomor & tanggal SK persetujuan penetapan tipologi terakhir (4.2). */
  tipSkNomor?: string;
  tipSkTanggal?: string;
  tipDisetujuiOleh?: string;
  /** Riwayat perubahan, terbaru di akhir array. */
  history?: MasterDataHistoryEntry[];
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

/** 4.3 Objek Pemeriksaan — entitas anak Jenis Pengawasan (Plane B.1 Pra-Audit "Objek
 * Pengawasan", digabung ke B.12 per keputusan "follow_plane"). */
export interface ObjekPemeriksaan {
  id: string;
  jpId: string;
  nama: string;
  bidang: string;
  siklus: 'Tahunan' | 'Semesteran' | 'Triwulanan' | 'Ad-hoc';
  dasarHukum: string;
  aktif: boolean;
}

/** Bidjemen dibatasi hanya 4 entri seed (Plan p1-b12-nav-master) — tidak ada create baru,
 * hanya ubah nama/singkatan/cakupan & aktif/nonaktif entri yang sudah ada. */
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
/** "Kondisional" ditambahkan (Plan p1-b12-nav-master, tabel 4.4) — wajib hanya jika kondisi
 * tertentu terpenuhi (mis. tipologi/jenjang tertentu), berbeda dari "Opsional" yang selalu bebas. */
export type SifatDokumen = 'Wajib' | 'Kondisional' | 'Opsional';
export type Periodisitas = 'Tahunan' | 'Semesteran' | 'Triwulanan' | 'Bulanan' | 'Insidentil';

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
  /** 4.4: tautan Bidjemen & Objek Pemeriksaan pemilik dokumen ini (opsional). */
  bidjemenId?: string;
  objekPemeriksaanId?: string;
  periodisitas?: Periodisitas;
  berlakuMulai?: string;
  berlakuSampai?: string;
  versi?: number;
}

/** 4.4 Tab Template — skema field & contoh baku per dokumen katalog berjenis "Data"/terstruktur
 * (Plane B.1 Pra-Audit "Template", digabung sebagai tab di dalam 4.4 Katalog). */
export interface TemplateField {
  nama: string;
  tipe: 'Teks' | 'Angka' | 'Tanggal' | 'Pilihan';
}
export interface TemplateDokumen {
  id: string;
  dokId: string;
  nama: string;
  fields: TemplateField[];
  contohBakuUrl: string;
  versi: number;
  aktif: boolean;
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

/** Cuplikan satu versi berkas/laporan sebelum diganti (Ganti Berkas) atau dikirim ulang
 * (Kirim Perbaikan) — dipakai untuk modal "Riwayat Berkas". */
export interface BerkasVersion {
  nama: string;
  sizeBytes: number;
  tgl: string | null;
  status: BerkasStatus;
  catatan: string;
  verifikatorOleh: string;
  tglVerifikasi: string | null;
}

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
  /** Versi sebelumnya (Ganti Berkas / Kirim Perbaikan), terbaru di akhir array. */
  versi?: BerkasVersion[];
  /** Jika berkas ini dipakai kembali ("Pakai Berkas Lama") dari permintaan lain, id berkas asal. */
  asalBerkasId?: string;
  /** Tahun data & periode isi berkas (Portal Data Satker, prototipe 29092026). */
  tahunData?: string;
  periodeDari?: string;
  periodeSampai?: string;
}

/** Ember berkas unggahan mandiri (tidak terikat Permintaan). Bukan id permintaan sungguhan. */
export const MANDIRI_REQ_ID = '__mandiri__';

export type StageSatker = 'Belum Mulai' | 'Sedang Mengunggah' | 'Sudah Mengirim' | 'Selesai';

export type LaporanJenis = 'IKU' | 'SPIP';

export interface LaporanSlotDef {
  key: string;
  nama: string;
  periodeLabel: string;
  dokId: string;
  /** Slot mengharuskan skor manual (mis. Penilaian Mandiri SPIP). */  
  butuhSkor?: boolean;
  /** Slot meminta realisasi per indikator IKU (I1-I5), mis. TW1-TW4. */
  butuhRealisasi?: boolean;
  /** Bulan-tanggal "dibuka" & "tenggat", format `MM-DD` (relatif ke tahun anggaran slot). */
  bukaMd: string;
  tenggatMd: string;
  /** Jika benar, tanggal "dibuka" jatuh di TA-1 (mis. Penetapan IKU dibuka Desember tahun lalu). */
  bukaTahunSebelumnya?: boolean;
  /** Jika benar, tenggat jatuh di TA+1 (mis. Laporan Semester II/Triwulan IV). */
  tenggatTahunBerikut?: boolean;
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
  /** Catatan tambahan pengunggah (dipisah dari `catatan` milik verifikator). */
  keterangan?: string;
  /** Versi sebelumnya (Kirim Perbaikan), terbaru di akhir array. */
  versi?: BerkasVersion[];
}

/* =====================================================================================
 * 5.1 Mapping Ketentuan Pengumpulan, 5.2 Aturan Validasi
 * (plane/b-12-functional-specification-document-fsd-audit-universe.md §5.1-5.2)
 * ===================================================================================== */

export interface MappingRule {
  id: string;
  jpId: string;
  /** Tipologi Satker sasaran mapping ini berlaku (kosong = seluruh tipologi pada jenjang sasaran). */
  tipologiIds: string[];
  dokumenIds: string[];
  aktif: boolean;
  versi: number;
  berlakuMulai: string;
  catatan: string;
}

export interface AturanValidasi {
  id: string;
  dokId: string;
  formatDiizinkan: string[];
  ukuranMaksMb: number;
  wajibTtd: boolean;
  ambangKelengkapanPct: number;
  aktif: boolean;
}

/* =====================================================================================
 * F3 Objek Audit, 8.1 Register Risiko, 8.2 Review & Persetujuan, F9 Prioritas
 * (plane/f-2-fsd-dashboard-monitoring-audit-universe.md, plane/f-3-*, plane/f-9-*)
 * ===================================================================================== */

export type ObjekAuditStatus = 'Draft' | 'Siap Dinilai' | 'Dinilai' | 'Diarsipkan';

export interface ObjekAudit {
  id: string;
  orgId: string;
  tahunAnggaran: string;
  jpId: string;
  status: ObjekAuditStatus;
  kelengkapanPct: number;
  catatan: string;
}

export const RISIKO_FAKTOR_LIST = [
  { key: 'anggaran', label: 'Signifikansi Anggaran' },
  { key: 'temuan', label: 'Riwayat Temuan' },
  { key: 'kompleksitas', label: 'Kompleksitas Operasi' },
  { key: 'spip', label: 'Maturitas SPIP' },
  { key: 'sdm', label: 'Kapasitas SDM' },
  { key: 'waktuAudit', label: 'Lama Sejak Audit Terakhir' },
] as const;
export type RisikoFaktorKey = (typeof RISIKO_FAKTOR_LIST)[number]['key'];

export type PenilaianRisikoStatus = 'Draft' | 'Diajukan' | 'Disetujui' | 'Dikembalikan';

/** Salinan ringan `StatusRentangRisiko` (types.ts global) agar modul ini tidak bergantung ke sana. */
export type StatusRentangRisikoLite = 'sangat_tinggi' | 'tinggi' | 'sedang' | 'rendah' | 'sangat_rendah';

export interface PenilaianRisiko {
  id: string;
  objekAuditId: string;
  orgId: string;
  tahunAnggaran: string;
  faktor: Record<RisikoFaktorKey, number>;
  skor: number;
  level: StatusRentangRisikoLite;
  catatan: string;
  status: PenilaianRisikoStatus;
  dinilaiOleh: string;
  tglDinilai: string | null;
  direviewOleh: string;
  tglReview: string | null;
  catatanReview: string;
}

export interface BaselinePrioritasItem {
  objekAuditId: string;
  rank: number;
  skor: number;
  masuk: boolean;
  alasan: string;
}

export interface BaselinePrioritas {
  id: string;
  versi: number;
  tahunAnggaran: string;
  lockedAt: string;
  lockedOleh: string;
  items: BaselinePrioritasItem[];
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
  mappingRules: MappingRule[];
  aturanValidasi: AturanValidasi[];
  objekAudit: ObjekAudit[];
  penilaianRisiko: PenilaianRisiko[];
  baselinePrioritas: BaselinePrioritas[];
  objekPemeriksaan: ObjekPemeriksaan[];
  templateDokumen: TemplateDokumen[];
  slots: DokumenSlot[];
  /** F7 claim lock: fileId (berkas/laporan) -> siapa yang mengklaim & kapan (BR-F7 priority
   * ordering & claim lock, Plan p1-b12-collection). */
  claims: Record<string, ClaimEntry>;
}

export interface ClaimEntry {
  oleh: string;
  waktu: string;
}

/** 5.3 Publish -> 6.1 Slot Dokumen — satu slot merepresentasikan satu dokumen wajib yang harus
 * dipenuhi satu Satker untuk satu Permintaan (snapshot dari Mapping saat Publish), dengan
 * penugasan PIC & tenggat internal (Plan p1-b12-collection). Status turunan dihitung dari
 * `BerkasSatker` terkait (lihat `slotStatus` di store.ts), bukan disimpan ganda — kecuali
 * "Dikecualikan" yang murni keputusan manual Admin Satker.
 */
export type DokumenSlotStatus = 'Belum Diunggah' | 'Diunggah' | 'Diajukan' | 'Perlu Perbaikan' | 'Diterima' | 'Dikecualikan';

export interface DokumenSlot {
  id: string;
  reqId: string;
  orgId: string;
  dokId: string;
  pic: string;
  tenggatInternal: string | null;
  dikecualikan: boolean;
  alasanKecualikan: string;
  dibuat: string;
}

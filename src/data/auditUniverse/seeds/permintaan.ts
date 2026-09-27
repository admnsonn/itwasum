/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * 5.1 Permintaan Pengumpulan Data + 6.1 Permintaan Masuk (Portal Satker) + 7.1 Antrean
 * Verifikasi. Hand-transcribed from `27092026/.extracted/portal-data-satker.html`
 * (function `seed()`, the superset dataset that also carries verification statuses
 * draft/wait/ok/fix — the simpler `pd` shell only has Draft/Terkirim).
 *
 * All dates are *day offsets relative to "today"* (identical to the prototype's `addD(n)`),
 * resolved to absolute ISO dates once by `store.ts` at initialization/reset — see
 * `resolvePermintaanSeed()` there. This keeps seeded requests meaningfully
 * "Berjalan"/"Terlambat"/"Dijadwalkan" no matter when the app is opened, exactly like the
 * original prototype recomputing `new Date()` on every load.
 */

export interface PermintaanSeedLog {
  offsetDays: number;
  jam?: string; // "HH:mm", defaults to "09:00"
  oleh: string;
  aksi: string;
  orgId?: string | null;
}

export interface PermintaanSeedBerkas {
  nama: string;
  sizeBytes: number;
  dokId: string;
  keterangan?: string;
  status: 'draft' | 'wait' | 'ok' | 'fix';
  offsetDays: number | null;
  terlambat?: boolean;
  catatan?: string;
  verifikatorOleh?: string;
  verifikasiOffsetDays?: number | null;
}

export interface PermintaanSeedDef {
  judul: string;
  tipe: 'Berkala' | 'Tambahan Audit';
  jpId: string;
  tahunAnggaran: string;
  periodeLabel: string;
  mulaiOffsetDays: number;
  selesaiOffsetDays: number;
  dibuatOffsetDays: number;
  dikirimOffsetDays?: number;
  ditutupOffsetDays?: number;
  pesan: string;
  lampiran?: { nama: string; sizeBytes: number }[];
  sasaran: string[];
  status: 'Draft' | 'Terkirim' | 'Ditutup';
  penugasan?: { nomor: string; peminta: string };
  berkas?: Record<string, PermintaanSeedBerkas[]>;
  selesaiOffsetDaysByOrgId?: Record<string, number>;
  log: PermintaanSeedLog[];
}

const ADMIN = 'Kompol Andi Pratama (Admin Itwasum)';
const VERIF_ITWIL_III = 'AKP Sari Wulandari (Verifikator Itwil III)';
const picName = (sing: string) => `PIC ${sing}`;

export const PERMINTAAN_SEED: PermintaanSeedDef[] = [
  // 0. Lama & sudah ditutup (riwayat 1 tahun anggaran sebelumnya)
  {
    judul: `Reviu Laporan Keuangan Semester II TA Lalu – Polda Riau`,
    tipe: 'Berkala',
    jpId: 'JP-06.01',
    tahunAnggaran: 'lalu',
    periodeLabel: 'Semester II',
    mulaiOffsetDays: -260,
    selesaiOffsetDays: -240,
    dibuatOffsetDays: -262,
    dikirimOffsetDays: -261,
    ditutupOffsetDays: -230,
    pesan: 'Unggah LRA Semester II, SIMAK-BMN, dan DSP.',
    sasaran: ['ORG-00300'],
    status: 'Ditutup',
    berkas: {
      'ORG-00300': [
        { nama: 'LRA_Sem2_TA_Lalu_Polda_Riau.pdf', sizeBytes: 2100000, dokId: 'DOK-AK-006', status: 'ok', offsetDays: -245, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -243 },
        { nama: 'SIMAK_BMN_TA_Lalu.pdf', sizeBytes: 4700000, dokId: 'DOK-BMN-002', status: 'ok', offsetDays: -245, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -243 },
        { nama: 'DSP_Polda_Riau_TA_Lalu.xlsx', sizeBytes: 780000, dokId: 'DOK-SDM-002', status: 'ok', offsetDays: -244, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -242 },
      ],
    },
    selesaiOffsetDaysByOrgId: { 'ORG-00300': -242 },
    log: [
      { offsetDays: -261, jam: '08:10', oleh: ADMIN, aksi: 'Mengirim permintaan ke 1 Satker' },
      { offsetDays: -242, jam: '10:00', oleh: picName('Polda Riau'), aksi: 'Polda Riau menandai pengiriman selesai' },
      { offsetDays: -230, jam: '16:00', oleh: ADMIN, aksi: 'Menutup permintaan' },
    ],
  },
  // 1. Berjalan — kasus utama (punya file wait, fix, draft, dan terkirim)
  {
    judul: `Wasrik Rutin Tahap II TA Berjalan – Polda Riau & jajaran`,
    tipe: 'Berkala',
    jpId: 'JP-01.02',
    tahunAnggaran: 'berjalan',
    periodeLabel: 'Semester I',
    mulaiOffsetDays: -10,
    selesaiOffsetDays: 5,
    dibuatOffsetDays: -12,
    dikirimOffsetDays: -11,
    pesan:
      'Mohon unggah dokumen pendukung Wasrik Tahap II, antara lain: LRA Semester I, DSP & data personel riil, laporan BMN, dan laporan pelaksanaan kegiatan.\nBila ada kendala, hubungi Itwil III.',
    lampiran: [
      { nama: 'Sprin_Wasrik_Tahap_II_Itwil_III.pdf', sizeBytes: 420000 },
      { nama: 'Template_Rekap_Personel.xlsx', sizeBytes: 95000 },
    ],
    sasaran: ['ORG-00300', 'ORG-00301', 'ORG-00302', 'ORG-00351', 'ORG-00352', 'ORG-00354', 'ORG-00361'],
    status: 'Terkirim',
    berkas: {
      'ORG-00300': [
        { nama: 'LRA_Semester_I_Polda_Riau.pdf', sizeBytes: 2300000, dokId: 'DOK-AK-006', status: 'ok', offsetDays: -4, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -3 },
        { nama: 'DSP_Polda_Riau_2026.xlsx', sizeBytes: 840000, dokId: 'DOK-SDM-002', status: 'fix', offsetDays: -4, catatan: 'DSP belum ditandatangani Karo SDM. Mohon unggah versi yang sudah ditandatangani.', verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -2 },
        { nama: 'SIMAK_BMN_Sem1.pdf', sizeBytes: 5100000, dokId: 'DOK-BMN-002', status: 'wait', offsetDays: -4 },
        { nama: 'Foto_Apel_Kesiapan.zip', sizeBytes: 14800000, dokId: 'LAINNYA', keterangan: 'Dokumentasi apel kesiapan Ops', status: 'wait', offsetDays: -2 },
      ],
      'ORG-00351': [
        { nama: 'LRA_Polresta_Pekanbaru.pdf', sizeBytes: 1900000, dokId: 'DOK-AK-006', status: 'wait', offsetDays: -1 },
        { nama: 'Laporan_Kegiatan_Agustus.pdf', sizeBytes: 3200000, dokId: 'DOK-OPS-001', status: 'wait', offsetDays: -1 },
      ],
      'ORG-00302': [{ nama: 'Data_Personel_Riil.xlsx', sizeBytes: 610000, dokId: 'DOK-SDM-003', status: 'draft', offsetDays: null }],
    },
    log: [
      { offsetDays: -12, jam: '10:02', oleh: ADMIN, aksi: 'Membuat permintaan (Draft)' },
      { offsetDays: -11, jam: '08:40', oleh: ADMIN, aksi: 'Mengirim permintaan ke 7 Satker' },
      { offsetDays: -4, jam: '14:10', oleh: picName('Polda Riau'), aksi: 'Polda Riau mengirim 3 berkas', orgId: 'ORG-00300' },
      { offsetDays: -2, jam: '09:30', oleh: picName('Polda Riau'), aksi: 'Polda Riau mengirim 1 berkas', orgId: 'ORG-00300' },
      { offsetDays: -2, jam: '13:15', oleh: VERIF_ITWIL_III, aksi: 'Mengembalikan 1 berkas Polda Riau untuk diperbaiki', orgId: 'ORG-00300' },
      { offsetDays: -1, jam: '16:05', oleh: picName('Polresta Pekanbaru'), aksi: 'Polresta Pekanbaru mengirim 2 berkas', orgId: 'ORG-00351' },
    ],
  },
  // 2. Lewat tenggat (satu Satker sudah selesai, satu terlambat mengirim)
  {
    judul: `Reviu Laporan Keuangan Semester I TA Berjalan – Satker Mabes`,
    tipe: 'Berkala',
    jpId: 'JP-06.01',
    tahunAnggaran: 'berjalan',
    periodeLabel: 'Semester I',
    mulaiOffsetDays: -30,
    selesaiOffsetDays: -3,
    dibuatOffsetDays: -32,
    dikirimOffsetDays: -31,
    pesan: 'Unggah Laporan Keuangan Semester I beserta CaLK dan dokumen rekonsiliasi.',
    sasaran: ['ORG-00102', 'ORG-00103', 'ORG-00106'],
    status: 'Terkirim',
    berkas: {
      'ORG-00102': [
        { nama: 'LK_Bareskrim_Sem1.pdf', sizeBytes: 6200000, dokId: 'DOK-AK-008', status: 'ok', offsetDays: -8, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -6 },
        { nama: 'Rekon_SAI_Juni.pdf', sizeBytes: 900000, dokId: 'DOK-AK-011', status: 'ok', offsetDays: -8, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -6 },
      ],
      'ORG-00106': [{ nama: 'LK_Korlantas_Sem1.pdf', sizeBytes: 5800000, dokId: 'DOK-AK-008', status: 'wait', offsetDays: -1, terlambat: true }],
    },
    selesaiOffsetDaysByOrgId: { 'ORG-00102': -6 },
    log: [
      { offsetDays: -31, jam: '09:00', oleh: ADMIN, aksi: 'Mengirim permintaan ke 3 Satker' },
      { offsetDays: -8, jam: '11:20', oleh: picName('Bareskrim Polri'), aksi: 'Bareskrim Polri mengirim 2 berkas', orgId: 'ORG-00102' },
      { offsetDays: -6, jam: '09:00', oleh: picName('Bareskrim Polri'), aksi: 'Bareskrim Polri menandai pengiriman selesai', orgId: 'ORG-00102' },
      { offsetDays: -1, jam: '10:15', oleh: picName('Korlantas Polri'), aksi: 'Korlantas Polri mengirim 1 berkas (terlambat)', orgId: 'ORG-00106' },
    ],
  },
  // 3. Dijadwalkan (belum dibuka)
  {
    judul: `Evaluasi SAKIP TA Berjalan – Polda Riau`,
    tipe: 'Berkala',
    jpId: 'JP-07.01',
    tahunAnggaran: 'berjalan',
    periodeLabel: 'Tahunan',
    mulaiOffsetDays: 4,
    selesaiOffsetDays: 25,
    dibuatOffsetDays: -2,
    dikirimOffsetDays: -1,
    pesan: 'Siapkan Perjanjian Kinerja, IKU, Renaksi, dan Laporan Capaian Kinerja.',
    sasaran: ['ORG-00300', 'ORG-00351', 'ORG-00352'],
    status: 'Terkirim',
    log: [{ offsetDays: -1, jam: '15:45', oleh: ADMIN, aksi: 'Mengirim permintaan ke 3 Satker (dibuka mulai H+4)' }],
  },
  // 4. Draft (belum dikirim)
  {
    judul: `Evaluasi SPIP TA Berjalan – Polda Jabar`,
    tipe: 'Berkala',
    jpId: 'JP-07.02',
    tahunAnggaran: 'berjalan',
    periodeLabel: 'Tahunan',
    mulaiOffsetDays: 7,
    selesaiOffsetDays: 30,
    dibuatOffsetDays: -2,
    pesan: '',
    sasaran: ['ORG-00500', 'ORG-00551', 'ORG-00552'],
    status: 'Draft',
    log: [{ offsetDays: -2, jam: '13:00', oleh: ADMIN, aksi: 'Membuat permintaan (Draft)' }],
  },
  // 5. Ditutup (semua Satker sudah mengirim & ditutup admin)
  {
    judul: `Wasrik Rutin Tahap I TA Berjalan – Polda Riau`,
    tipe: 'Berkala',
    jpId: 'JP-01.01',
    tahunAnggaran: 'berjalan',
    periodeLabel: 'Triwulan I',
    mulaiOffsetDays: -150,
    selesaiOffsetDays: -125,
    dibuatOffsetDays: -152,
    dikirimOffsetDays: -151,
    ditutupOffsetDays: -120,
    pesan: 'Dokumen perencanaan & pengorganisasian Triwulan I.',
    sasaran: ['ORG-00300', 'ORG-00351', 'ORG-00352'],
    status: 'Ditutup',
    berkas: {
      'ORG-00300': [{ nama: 'PK_Polda_Riau_2026.pdf', sizeBytes: 1200000, dokId: 'DOK-PK-004', status: 'ok', offsetDays: -130, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -128 }],
      'ORG-00351': [{ nama: 'PK_Polresta.pdf', sizeBytes: 900000, dokId: 'DOK-PK-004', status: 'ok', offsetDays: -128, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -127 }],
      'ORG-00352': [{ nama: 'PK_Polres_Kampar.pdf', sizeBytes: 850000, dokId: 'DOK-PK-004', status: 'ok', offsetDays: -126, verifikatorOleh: VERIF_ITWIL_III, verifikasiOffsetDays: -125 }],
    },
    selesaiOffsetDaysByOrgId: { 'ORG-00300': -128, 'ORG-00351': -127, 'ORG-00352': -125 },
    log: [
      { offsetDays: -151, jam: '08:00', oleh: ADMIN, aksi: 'Mengirim permintaan ke 3 Satker' },
      { offsetDays: -120, jam: '16:00', oleh: ADMIN, aksi: 'Menutup permintaan (semua Satker selesai)' },
    ],
  },
  // 6. Tambahan Audit (dari Kertas Kerja Audit Digital, B.15) — hanya 1 Satker sasaran
  {
    judul: 'Dokumen Tambahan – Kontrak Pengadaan Ranmor Polda Riau',
    tipe: 'Tambahan Audit',
    jpId: 'JP-01.02',
    tahunAnggaran: 'berjalan',
    periodeLabel: 'Semester I',
    mulaiOffsetDays: -2,
    selesaiOffsetDays: 3,
    dibuatOffsetDays: -2,
    dikirimOffsetDays: -2,
    pesan: 'Mohon kirim Kontrak/SPK, BAST, dan bukti pembayaran pengadaan kendaraan dinas Semester I untuk pengujian KKA-07.',
    penugasan: { nomor: 'PGS-2026-014 · KKA-07', peminta: 'AKBP Rudi Hartono (Ketua Tim Wasrik Itwil III)' },
    sasaran: ['ORG-00300'],
    status: 'Terkirim',
    log: [{ offsetDays: -2, jam: '10:30', oleh: 'Kertas Kerja Audit Digital', aksi: 'Permintaan dokumen tambahan dibuat dari penugasan PGS-2026-014' }],
  },
];

export const NOTIFIKASI_SEED_DESKRIPSI =
  'Notifikasi Portal Satker dibangun dari log permintaan yang menyasar org tersebut (lihat store.ts::buildNotifications) — sesuai pola prototipe yang menurunkan NOTIF dari REQ.log, bukan array statis terpisah.';

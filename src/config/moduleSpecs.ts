/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Peta Screen Information per modul (Plan "Align itwasum with BA-SA specs", bagian 2),
 * diambil verbatim dari tabel Screen Information tiap FSD `dokumen-referensi/BA-SA-Lanjutan/`.
 * Satu sumber data untuk `ModuleScreenShell` (tab navigasi per Screen) dan untuk deep-link
 * `#/<moduleId>/<screenSlug>` via `useHashRoute`.
 */
import type { ModuleId } from './moduleRegistry';

export interface ScreenSpec {
  /** Slug dipakai pada hash route: #/<moduleId>/<slug> */
  slug: string;
  nama: string;
  deskripsi: string;
  subFeatures?: string[];
}

export interface ModuleSpec {
  moduleId: ModuleId;
  workflowId: string;
  screens: ScreenSpec[];
}

export const MODULE_SPECS: Partial<Record<ModuleId, ModuleSpec>> = {
  b12: {
    moduleId: 'b12',
    workflowId: 'WF-B12',
    screens: [
      { slug: 'daftar-auditi', nama: 'Daftar Auditi', deskripsi: 'Populasi lengkap objek audit (Mabes/Polda/Polres/Polsek) beserta status kelengkapan data.', subFeatures: ['SF-001 Tabel populasi auditi', 'SF-002 Filter status kelengkapan'] },
      { slug: 'detail-auditi', nama: 'Detail Auditi', deskripsi: 'Formulir tusi, struktur organisasi, dan data anggaran per satker auditi.', subFeatures: ['SF-003 Form tusi-struktur-anggaran'] },
      { slug: 'validasi-data', nama: 'Validasi Data', deskripsi: 'Dashboard kelengkapan data dan daftar satker yang belum siap diskoring.', subFeatures: ['SF-004 Dashboard kelengkapan', 'SF-005 Daftar Belum Siap Skoring'] },
    ],
  },
  b13: {
    moduleId: 'b13',
    workflowId: 'WF-B13',
    screens: [
      { slug: 'skoring-risiko', nama: 'Skoring Risiko', deskripsi: 'Form 6 faktor risiko skala 1-5 dengan skor tertimbang read-only.', subFeatures: ['SF-001 Form 6 faktor', 'SF-002 Rincian kontribusi skor'] },
      { slug: 'peringkat-prioritas', nama: 'Peringkat Prioritas', deskripsi: 'Tabel peringkat risiko seluruh auditi dan konfigurasi ambang prioritas.', subFeatures: ['SF-003 Tabel peringkat + ambang'] },
      { slug: 'draf-pkpt', nama: 'Draf PKPT', deskripsi: 'Form kegiatan pengawasan tahunan dan progres kapasitas OH tim audit.', subFeatures: ['SF-004 Form kegiatan PKPT', 'SF-005 Progress kapasitas OH'] },
    ],
  },
  b14: {
    moduleId: 'b14',
    workflowId: 'WF-B14',
    screens: [
      { slug: 'perlu-penugasan', nama: 'Daftar Kegiatan Perlu Penugasan', deskripsi: 'Kegiatan PKPT yang sudah disahkan namun belum memiliki tim audit.', subFeatures: ['SF-001 Daftar kegiatan'] },
      { slug: 'pembentukan-tim', nama: 'Pembentukan Tim', deskripsi: 'Validasi komposisi tim minimum dan pengecekan konflik kepentingan.', subFeatures: ['SF-002 Validasi komposisi tim'] },
      { slug: 'penerbitan-surat-tugas', nama: 'Penerbitan Surat Tugas', deskripsi: 'Pratinjau dan penomoran otomatis Surat Tugas.', subFeatures: ['SF-003 Pratinjau + nomor ST otomatis'] },
      { slug: 'kalender-kapasitas', nama: 'Kalender Kapasitas', deskripsi: 'Kalender beban kerja auditor lintas penugasan aktif.', subFeatures: ['SF-004 Kalender beban kerja'] },
    ],
  },
  b15: {
    moduleId: 'b15',
    workflowId: 'WF-B15',
    screens: [
      { slug: 'kk-aktif', nama: 'Daftar KK Aktif', deskripsi: 'Kertas Kerja Audit aktif per penugasan dengan badge sisa waktu.', subFeatures: ['SF-001 Daftar KK + badge sisa waktu'] },
      { slug: 'form-pengisian', nama: 'Form Pengisian', deskripsi: 'Pengisian KK dengan skor otomatis dan unggah eviden multi-format.', subFeatures: ['SF-002 Skor otomatis read-only', 'SF-003 Upload eviden'] },
      { slug: 'antrean-validasi', nama: 'Antrean Validasi', deskripsi: 'Validasi berjenjang Ketua Tim - Pengawas Tim dan riwayat versi (diff).', subFeatures: ['SF-004 Validasi berjenjang', 'SF-005 Riwayat versi'] },
    ],
  },
  b8: {
    moduleId: 'b8',
    workflowId: 'WF-B8',
    screens: [
      { slug: 'ruang-pm', nama: 'Ruang PM', deskripsi: 'Penetapan tim asesor (T1-T4) dan mekanisme asesmen (PM/PK/Evaluasi).', subFeatures: ['SF-001 Penetapan tusi asesor'] },
      { slug: 'kk-penetapan-tujuan', nama: 'KK Penetapan Tujuan', deskripsi: 'Kertas kerja penetapan tujuan (KKLEAD_SPIP, KK1-KK2).', subFeatures: ['SF-002 Form KK dinamis'] },
      { slug: 'kk-struktur-proses', nama: 'KK Struktur & Proses', deskripsi: 'Kertas kerja struktur & proses pengendalian (KK3.1-KK4).', subFeatures: ['SF-003 Form KK dinamis'] },
      { slug: 'kk-pencapaian-tujuan', nama: 'KK Pencapaian Tujuan', deskripsi: 'Kertas kerja pencapaian tujuan pengendalian (KK5.1-KK7, KK9).', subFeatures: ['SF-004 Form KK dinamis'] },
      { slug: 'penyimpulan-maturitas', nama: 'Penyimpulan Maturitas', deskripsi: 'Kartu KKLEAD I/II/III (penalti KK4) dan penyimpulan level maturitas 0-5.', subFeatures: ['SF-005 Kartu KKLEAD', 'SF-006 Badge level maturitas', 'SF-007 Sesi edit 15 menit'] },
    ],
  },
  b16: {
    moduleId: 'b16',
    workflowId: 'WF-B16',
    screens: [
      { slug: 'rekap-lintas-sumber', nama: 'Rekap Lintas Sumber', deskripsi: 'Rekap rekomendasi tersinkron Audit Polri/BPK/IRSUS (read-only).', subFeatures: ['SF-001 Tabel rekap lintas sumber'] },
      { slug: 'detail-aging', nama: 'Detail & Aging', deskripsi: 'Detail rekomendasi dengan badge aging harian dan status Kritis (>730 hari).', subFeatures: ['SF-002 Badge aging', 'SF-003 Badge Temuan Berulang'] },
      { slug: 'verifikasi-bukti', nama: 'Verifikasi Bukti', deskripsi: 'Antrean verifikasi bukti tindak lanjut dari Auditee.', subFeatures: ['SF-004 Antrean verifikasi'] },
    ],
  },
  b17: {
    moduleId: 'b17',
    workflowId: 'WF-B17',
    screens: [
      { slug: 'dashboard-rollup', nama: 'Dashboard Rollup', deskripsi: 'Rollup maturitas SPIP L0 Nasional - L1 Itwil - L2 Satker.', subFeatures: ['SF-001 Rollup agregasi'] },
      { slug: 'peta-risiko-strategis', nama: 'Peta Risiko Strategis', deskripsi: 'Peta risiko strategis (matrix/heatmap) dengan slide-over detail satker.', subFeatures: ['SF-002 Risk matrix/heatmap'] },
      { slug: 'tren-antar-periode', nama: 'Tren Antar Periode', deskripsi: 'Tren maturitas minimal 2 periode dan daftar satker menurun.', subFeatures: ['SF-003 Tren periode', 'SF-004 Form bobot & badge periode terbekukan'] },
    ],
  },
  b18: {
    moduleId: 'b18',
    workflowId: 'WF-B18',
    screens: [
      { slug: 'konfigurasi-aturan', nama: 'Konfigurasi Aturan', deskripsi: 'Toggle 4 aturan pemicu (B.16, B.17, B.7, B.12) dan ambang masing-masing.', subFeatures: ['SF-001 Toggle aturan + ambang'] },
      { slug: 'dashboard-aktif', nama: 'Dashboard Peringatan Aktif', deskripsi: 'Daftar peringatan aktif terurut urgensi dengan dedup per satker.', subFeatures: ['SF-002 Daftar peringatan', 'SF-003 Progress bar SLA'] },
      { slug: 'riwayat-eskalasi', nama: 'Riwayat Eskalasi', deskripsi: 'Riwayat tindak lanjut, eskalasi, dan snooze peringatan.', subFeatures: ['SF-004 Riwayat eskalasi + snooze'] },
    ],
  },
  b4: {
    moduleId: 'b4',
    workflowId: 'WF-B4',
    screens: [
      { slug: 'formulir-pengajuan', nama: 'Formulir Pengajuan', deskripsi: 'Formulir pengajuan surat usulan pengawasan.', subFeatures: ['SF-001 Formulir pengajuan'] },
      { slug: 'antrean-review', nama: 'Antrean Review', deskripsi: 'Antrean review berjenjang dengan kunci review simultan 15 menit.', subFeatures: ['SF-002 Antrean review berjenjang', 'SF-003 Kunci review simultan'] },
      { slug: 'arsip', nama: 'Arsip', deskripsi: 'Arsip surat usulan yang telah disahkan/ditarik/dibatalkan.', subFeatures: ['SF-004 Arsip'] },
    ],
  },
  b5: {
    moduleId: 'b5',
    workflowId: 'WF-B5',
    screens: [
      { slug: 'naskah-masuk', nama: 'Registrasi Naskah Masuk', deskripsi: 'Registrasi naskah dinas masuk dengan klasifikasi kecepatan & kerahasiaan.', subFeatures: ['SF-001 Registrasi + klasifikasi'] },
      { slug: 'naskah-keluar', nama: 'Penyusunan Naskah Keluar', deskripsi: 'Penyusunan naskah dinas keluar dan tembusan.', subFeatures: ['SF-002 Penyusunan naskah keluar'] },
      { slug: 'antrean-disposisi', nama: 'Antrean Disposisi', deskripsi: 'Timeline disposisi berjenjang sesuai SLA klasifikasi.', subFeatures: ['SF-003 Timeline disposisi'] },
      { slug: 'arsip', nama: 'Arsip', deskripsi: 'Arsip digital naskah masuk & keluar.', subFeatures: ['SF-004 Arsip digital'] },
    ],
  },
  b10: {
    moduleId: 'b10',
    workflowId: 'WF-B10',
    screens: [
      { slug: 'daftar-log', nama: 'Daftar Log', deskripsi: 'Daftar log aktivitas immutable lintas modul.', subFeatures: ['SF-001 Daftar log'] },
      { slug: 'detail-kejadian', nama: 'Detail Kejadian', deskripsi: 'Detail satu kejadian log beserta checksum integritas.', subFeatures: ['SF-002 Detail kejadian', 'SF-003 Checksum integritas'] },
      { slug: 'konfigurasi-retensi', nama: 'Konfigurasi Retensi', deskripsi: 'Grafik volume log dan alert anomali (>200%), konfigurasi retensi.', subFeatures: ['SF-004 Grafik volume + alert anomali'] },
    ],
  },
};

export function getModuleSpec(moduleId: string): ModuleSpec | undefined {
  return MODULE_SPECS[moduleId as ModuleId];
}

export function getDefaultScreenSlug(moduleId: string): string | undefined {
  return MODULE_SPECS[moduleId as ModuleId]?.screens[0]?.slug;
}

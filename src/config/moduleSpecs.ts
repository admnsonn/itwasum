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
  /** Kelompok nav 2-level (mis. B.12 "Ringkasan"/"Konfigurasi"/dst.) — lihat `ModuleScreenShell`.
   * Modul tanpa `section` tetap tampil sebagai satu baris tab flat seperti sebelumnya. */
  section?: string;
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
    // Struktur nav 4-bagian sesuai mockup Plane (plane/assets/df3d4866-...png) dan FSD
    // b-12-functional-specification-document-fsd-audit-universe.md, F2 dan F3, F9 (Plan
    // "Align itwasum with Plane BA/SA", todo p1-b12-nav-master/p1-b12-collection/p1-b12-risk).
    // Sejak Plan "Align itwasum with Figma" todo `b12-rest`: nav 4-bagian (section) dihapus —
    // navigasi kini seluruhnya lewat Sidebar (`src/config/sidebarNav.ts`, grup Figma "Portal
    // Satker" + grup tambahan "Audit Universe & Risiko"). `ModuleScreenShell` dipanggil dengan
    // `hideTabs`, jadi field `section` di bawah ini tidak lagi dipakai untuk render tapi
    // dipertahankan sebagai anotasi asal-FSD.
    screens: [
      // -- Figma "Portal Satker" (frames 3361:*, 3377:*-3388:*) --
      { slug: 'dashboard-portal', nama: 'Dashboard Portal Itwasum', deskripsi: 'KPI populasi Satker, Master Katalog, dan penugasan berjalan; status penugasan audit dan aktivitas sistem terbaru.' },
      { slug: 'portal-satker', nama: 'Dashboard Portal Satker', deskripsi: 'Status Per Bidang dan Daftar Dokumen Terbaru per Satker; permintaan data masuk dan laporan berkala SPIP/IKU (6.1).', subFeatures: ['SF-611 Dashboard PIC', 'SF-612 Permintaan masuk', 'SF-613 Unggah berkas', 'SF-614 Laporan SPIP', 'SF-615 Laporan IKU'] },
      { slug: 'master-jenis-pengawasan', nama: 'Master Jenis Pengawasan', deskripsi: 'Jenis Pengawasan, Objek Pemeriksaan, dan Bidjemen (4.3).', subFeatures: ['SF-431 Jenis pengawasan & bidjemen'] },
      { slug: 'master-tipologi', nama: 'Master Tipologi Satker', deskripsi: 'Daftar Tipologi dan penetapan Tipologi per Satker (4.2).', subFeatures: ['SF-421 Tipologi satker'] },
      { slug: 'master-katalog', nama: 'Master Katalog Pra-Audit', deskripsi: 'Katalog dokumen/data pengumpulan pra-audit (4.4).', subFeatures: ['SF-441 Katalog dokumen'] },
      { slug: 'master-template', nama: 'Master Template Dokumen', deskripsi: 'Skema field & contoh baku per dokumen katalog berjenis Data (4.4).' },
      { slug: 'mapping', nama: 'Mapping Kebutuhan Dokumen', deskripsi: 'Menentukan dokumen katalog yang wajib dikumpulkan per Jenis Pengawasan & Tipologi Satker (5.1).', subFeatures: ['SF-511 Daftar mapping', 'SF-512 Buat/ubah mapping'] },
      { slug: 'penugasan-audit', nama: 'Penugasan Audit', deskripsi: 'Admin membuat & mengirim penugasan/permintaan dokumen ke Satker sasaran, memantau progres, dan menutup penugasan (5.3).', subFeatures: ['SF-531 Daftar permintaan', 'SF-532 Buat/ubah permintaan', 'SF-533 Detail progres & log'] },
      // -- Plane-only, dipindah ke grup tambahan "Audit Universe & Risiko" --
      { slug: 'organisasi', nama: 'Struktur Organisasi & Unit Kerja', deskripsi: 'Hierarki organisasi Polri dan pengelolaan Itwil pengawas per unit (4.1).', subFeatures: ['SF-411 Struktur organisasi'] },
      { slug: 'dashboard', section: 'Ringkasan', nama: 'Dashboard Audit Universe (F2)', deskripsi: 'Ringkasan populasi Objek Audit, kelengkapan data, dan status pengumpulan/verifikasi (F2).', subFeatures: ['SF-201 KPI populasi & kelengkapan', 'SF-202 Status pengumpulan per Itwil'] },
      { slug: 'objek-audit', section: 'Ringkasan', nama: 'Objek Audit (F3)', deskripsi: 'Populasi Objek Audit per Satker/tahun anggaran, status kesiapan skoring, dan detail tusi-struktur-anggaran (F3).', subFeatures: ['SF-301 Tabel populasi Objek Audit', 'SF-302 Filter status kesiapan', 'SF-303 Detail tusi-struktur-anggaran'] },
      { slug: 'aturan-validasi', section: 'Konfigurasi', nama: 'Aturan Validasi', deskripsi: 'Format berkas, ukuran maksimum, kewajiban tanda tangan, dan ambang kelengkapan per dokumen (5.2).', subFeatures: ['SF-521 Daftar aturan validasi', 'SF-522 Ubah aturan per dokumen'] },
      { slug: 'tambahan-audit', section: 'Pengumpulan & Verifikasi', nama: 'Dokumen Tambahan Audit', deskripsi: 'Permintaan dokumen ad-hoc dari Kertas Kerja Audit Digital (Penugasan/Tim Audit), terpisah dari siklus berkala (6.2).', subFeatures: ['SF-621 Daftar permintaan tambahan', 'SF-622 Progres per Satker'] },
      { slug: 'verifikasi-berkas', section: 'Pengumpulan & Verifikasi', nama: 'Antrean Verifikasi Berkas (F7)', deskripsi: 'Verifikator Itwil menerima atau meminta perbaikan atas berkas dan laporan yang dikirim Satker (F7).', subFeatures: ['SF-711 Antrean verifikasi', 'SF-712 Terima/minta perbaikan', 'SF-713 Klaim & pemisahan tugas (SoD)'] },
      { slug: 'risiko-register', section: 'Risiko & Perencanaan', nama: 'Register Risiko (8.1)', deskripsi: 'Penilaian 6 faktor risiko per Objek Audit siap dinilai, skor tertimbang otomatis (8.1).', subFeatures: ['SF-811 Tabel register risiko', 'SF-812 Form 6 faktor'] },
      { slug: 'risiko-review', section: 'Risiko & Perencanaan', nama: 'Review & Persetujuan Risiko (8.2)', deskripsi: 'Koordinator Pengendali menyetujui atau mengembalikan hasil penilaian risiko yang diajukan (8.2).', subFeatures: ['SF-821 Antrean review', 'SF-822 Setujui/kembalikan'] },
      { slug: 'prioritas-pkpt', section: 'Risiko & Perencanaan', nama: 'Prioritas & Usulan PKPT (F9)', deskripsi: 'Peringkat prioritas seluruh Objek Audit dinilai dan penguncian baseline PKPT tahun berikutnya (F9), dikonsumsi B.13 sebagai referensi.', subFeatures: ['SF-901 Tabel peringkat prioritas', 'SF-902 Kunci baseline PKPT'] },
      // -- Rute lama (dipertahankan untuk redirect, lihat App.tsx) --
      { slug: 'data-master', nama: 'Data Master Terpadu (lama)', deskripsi: 'Dialihkan ke master-jenis-pengawasan/master-tipologi/master-katalog/master-template.' },
      { slug: 'permintaan-data', nama: 'Permintaan Pengumpulan Data (lama)', deskripsi: 'Dialihkan ke penugasan-audit.' },
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
      { slug: 'form-mr', nama: 'Form MR per Objek', deskripsi: 'Alur 7 tahap Form Manajemen Risiko per objek audit: profil & register risiko, RCM, KKP uji kontrol, konsep temuan, kesimpulan MR, dan rencana tindak lanjut.', subFeatures: ['SF-F1 Profil & Konteks Risiko', 'SF-F2 Register Risiko', 'SF-F3 Reviu & RCM', 'SF-F4 KKP Uji Kontrol', 'SF-F5 Konsep Temuan', 'SF-F6 Kesimpulan MR', 'SF-F7 Rencana Tindak Lanjut'] },
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
      { slug: 'google-drive', nama: 'Management Google Drive', deskripsi: 'Menghubungkan folder root Google Drive Satker sebagai sumber bukti dukung KKLEAD SPIP (FR-GAUTH).', subFeatures: ['SF-081 Status koneksi Google', 'SF-082 Root folder & explorer', 'SF-083 Rescan & deteksi folder hilang'] },
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

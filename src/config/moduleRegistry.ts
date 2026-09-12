/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Registry Modul Aplikasi Satu Data Itwasum Polri.
 *
 * Satu sumber kebenaran untuk seluruh modul aplikasi sesuai lingkup SPEKTEK
 * "Aplikasi Satu Data Itwasum Polri T.A. 2026" (Bagian III & IV):
 *   - A.1-A.4  Sentralisasi Database & Tata Kelola Data
 *   - B.1-B.18 Pengembangan Sistem Satu Data Itwasum (18 Modul Aplikasi)
 *   - C.1-C.2  Integrasi Data via DIV TIK
 *   - D.1-D.2  Implementasi Sistem di Environment DC DIVTIK
 *   - E.1-E.8  Modul AI Pengawasan APIP
 *
 * Setiap entri di MODULE_REGISTRY men-drive:
 *   1. Menu navigasi bertingkat di Sidebar (dikelompokkan per `group`)
 *   2. Rute hash (`#/<id>`) via `useHashRoute`
 *   3. Dispatcher tampilan di `ModuleRouteView`
 *   4. Filter kelayakan akses per peran (lihat `getVisibleModulesForRole`)
 *
 * Sumber acuan (BA-SA & SPEKTEK) dicatat verbatim di field `sumberSpek` agar setiap halaman
 * bisa mengutip dasar dokumennya masing-masing.
 */

import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Search,
  BarChart3,
  Users,
  Shield,
  ShieldCheck,
  ShieldAlert,
  Database,
  Network,
  FileText,
  Mail,
  UserCog,
  ClipboardList,
  FolderKanban,
  ListChecks,
  AlertTriangle,
  Server,
  GitBranch,
  Sparkles,
  MessageSquareText,
  Bot,
  Gauge,
  KeyRound,
  History,
  ScrollText,
  Cpu,
  CloudCog,
  Building2,
  UserCheck,
  Workflow,
  Radar,
  Wand2,
  Boxes,
  FileSignature,
  ScanSearch,
  Cable,
  Layers,
  Route as RouteIcon,
  FileCheck,
  Activity,
  HardDrive,
} from 'lucide-react';
import type { OfficialRole } from '../types';

export type ModuleGroupId =
  | 'overview'
  | 'profil-kinerja'
  | 'pengawasan-audit'
  | 'administrasi'
  | 'ai-pengawasan'
  | 'platform-data'
  | 'tata-kelola';

export const MODULE_GROUP_ORDER: ModuleGroupId[] = [
  'overview',
  'profil-kinerja',
  'pengawasan-audit',
  'administrasi',
  'ai-pengawasan',
  'platform-data',
  'tata-kelola',
];

export const MODULE_GROUPS: Record<ModuleGroupId, { label: string; deskripsi: string }> = {
  overview: {
    label: 'Beranda & Overview',
    deskripsi: 'Peta komando nasional berjenjang L0 (Nasional) - L1 (Itwil) - L2 (Polda/Satker Mabes) - L3 (Polres)',
  },
  'profil-kinerja': {
    label: 'Profil & Kinerja',
    deskripsi: 'E-Profile satker & RBS, data auditor, IKU satker, dan SPIP satker',
  },
  'pengawasan-audit': {
    label: 'Pengawasan & Audit',
    deskripsi: 'Temuan BPK/IRSUS, audit universe, PKPT berbasis risiko, KKA digital, rekomendasi & TLHP',
  },
  administrasi: {
    label: 'Administrasi & Persuratan',
    deskripsi: 'Surat usulan dan tata kelola persuratan elektronik (E-Office)',
  },
  'ai-pengawasan': {
    label: 'AI Pengawasan',
    deskripsi: 'Modul kecerdasan buatan pendukung fungsi APIP (E.1-E.8 SPEKTEK)',
  },
  'platform-data': {
    label: 'Platform Data & Integrasi',
    deskripsi: 'Sentralisasi data (A.1-A.4), integrasi DIV TIK (C.1-C.2), dan status deployment (D.1-D.2)',
  },
  'tata-kelola': {
    label: 'Tata Kelola Sistem',
    deskripsi: 'Manajemen pengguna & peran, log aktivitas, dan keamanan otentikasi',
  },
};

export type ModuleStatus = 'inti' | 'replikasi' | 'baru' | 'nyata';

export const MODULE_STATUS_LABEL: Record<ModuleStatus, string> = {
  inti: 'Inti Aplikasi',
  replikasi: 'Replikasi dari Frontend Rujukan',
  baru: 'Modul Baru sesuai SPEKTEK',
  nyata: 'Data Deployment Nyata',
};

/** Nilai legacy `MainNavId` yang masih dirender oleh blok kondisional di App.tsx. */
export type LegacyViewId = 'beranda' | 'pengawasan' | 'kinerja' | 'auditor' | 'pengaturan';

export interface ModuleDefinition {
  /** Slug rute hash, unik. Contoh: 'b1', 'a2', 'e5', 'd'. */
  id: string;
  /** Kode SPEKTEK verbatim, contoh 'B.1'. Kosong untuk beranda. */
  kode: string;
  label: string;
  group: ModuleGroupId;
  icon: LucideIcon;
  /**
   * Jika terisi, ModuleRouteView mendelegasikan render ke tampilan legacy yang sudah ada
   * (BerandaView/PengawasanTemuanView/KinerjaSatkerView/TimAuditorView/PengaturanSistemView)
   * alih-alih GenericModuleView. Dipakai untuk modul yang sudah punya implementasi mendalam.
   */
  legacyViewId?: LegacyViewId;
  /** Sub-tab yang diteruskan ke tampilan legacy pengawasan (bpk/irsus/penugasan). */
  legacyTab?: 'polri' | 'bpk' | 'irsus' | 'penugasan';
  /** Jika diisi, hanya peran ini yang dapat mengakses (mengabaikan aturan grup default). */
  rolesOverride?: OfficialRole[];
  /** Terlihat untuk peran auditee (default false untuk mayoritas modul internal APIP). */
  auditeeVisible?: boolean;
  sumberSpek: string;
  status: ModuleStatus;
  deskripsi: string;
}

// Tanpa anotasi tipe lebar `ModuleDefinition[]` di sini (memakai `satisfies` sebagai gantinya) agar
// literal `id` setiap entri tetap terjaga presisinya, sehingga `ModuleId` di bawah dapat diturunkan
// sebagai union literal (bukan `string` polos) dan dipakai sebagai basis `MainNavId` di `types.ts`.
export const MODULE_REGISTRY = [
  // ============================== OVERVIEW ==============================
  {
    id: 'beranda',
    kode: '',
    label: 'Peta Komando Nasional (Overview L0-L3)',
    group: 'overview',
    icon: Home,
    legacyViewId: 'beranda',
    auditeeVisible: true,
    sumberSpek: 'Modul Overview Requirement BA_SA - Itwasum.docx (SF-001..SF-012)',
    status: 'inti',
    deskripsi:
      'Beranda utama: peta interaktif, KPI mengambang, drill-down L0 Nasional - L1 Itwil - L2 Polda/Satker Mabes - L3 Polres, ringkasan AI, panel peringatan dini, kesiapan data, dan tanya jawab data.',
  },

  // ========================= PROFIL & KINERJA =========================
  {
    id: 'b1',
    kode: 'B.1',
    label: 'E-Profile Satker + RBS Dashboard',
    group: 'profil-kinerja',
    icon: Building2,
    sumberSpek: 'SPEKTEK III.A.2 (B.1, 200 OH); BA-SA FSD/BR B.1 (14 dokumen); Modul Overview SF-001..SF-012',
    status: 'replikasi',
    deskripsi:
      'Direktori satker + profil 360 derajat per satker (ringkasan eksekutif, operasional/kinerja, SDM, sarana-prasarana, garkeu) dan Risk-Based Supervision matrix. Direplikasi dari satu-data-itwasum-frontend (/e-profile, /e-profile-rbs).',
  },
  {
    id: 'b6',
    kode: 'B.6',
    label: 'Data Auditor',
    group: 'profil-kinerja',
    icon: UserCheck,
    legacyViewId: 'auditor',
    sumberSpek: 'SPEKTEK III.A.2 (B.6, 90 OH); BA-SA Feature Discovery/BR/FSD B.6',
    status: 'replikasi',
    deskripsi:
      'Registri auditor SSOT: profil, sertifikasi, beban penugasan aktif, riwayat audit, dan rating kinerja. Direplikasi dari satu-data-itwasum-frontend (/auditors).',
  },
  {
    id: 'b7',
    kode: 'B.7',
    label: 'IKU Satker',
    group: 'profil-kinerja',
    icon: Gauge,
    legacyViewId: 'kinerja',
    sumberSpek: 'SPEKTEK III.A.2 (B.7, 160 OH); BA-SA FSD/BR B.7 (BR-IKU-001..007)',
    status: 'inti',
    deskripsi:
      'Monitoring & analisis capaian Indikator Kinerja Utama tiap satker, heatmap kinerja nasional, dan early warning IKU.',
  },
  {
    id: 'b8',
    kode: 'B.8',
    label: 'SPIP Satker',
    group: 'profil-kinerja',
    icon: ShieldCheck,
    sumberSpek: 'SPEKTEK III.A.2 (B.8, 110 OH); BA-SA-Lanjutan FSD/BR B.8 (KKLEAD I/II/III, KKLEAD_SPIP)',
    status: 'baru',
    deskripsi:
      'Penilaian mandiri SPIP per satker melalui Kertas Kerja (KK1-KK9) 3 mekanisme (Penilaian Mandiri/Pengujian Kepatuhan/Evaluasi), skor KKLEAD I/II/III (dengan penalti KK4), nilai final KKLEAD_SPIP, dan level maturitas 0-5.',
  },

  // ======================= PENGAWASAN & AUDIT =======================
  {
    id: 'b2',
    kode: 'B.2',
    label: 'Temuan BPK + Tindak Lanjut',
    group: 'pengawasan-audit',
    icon: FileCheck,
    legacyViewId: 'pengawasan',
    legacyTab: 'bpk',
    auditeeVisible: true,
    sumberSpek: 'SPEKTEK III.A.2 (B.2, 130 OH); BA-SA FSD/BR B.2 (SF-TB-001..013)',
    status: 'inti',
    deskripsi: 'Ringkasan, detail, analisis, dan tindak lanjut temuan BPK RI per satker.',
  },
  {
    id: 'b3',
    kode: 'B.3',
    label: 'Temuan IRSUS + Tindak Lanjut',
    group: 'pengawasan-audit',
    icon: ScanSearch,
    legacyViewId: 'pengawasan',
    legacyTab: 'irsus',
    auditeeVisible: true,
    sumberSpek: 'SPEKTEK III.A.2 (B.3, 120 OH); BA-SA FSD/BR B.3',
    status: 'inti',
    deskripsi: 'Ringkasan, detail, analisis, dan tindak lanjut temuan Inspektorat Khusus (IRSUS).',
  },
  {
    id: 'b12',
    kode: 'B.12',
    label: 'Audit Universe',
    group: 'pengawasan-audit',
    icon: Layers,
    sumberSpek: 'SPEKTEK III.A.2 (B.12, 80 OH); BA-SA-Lanjutan FSD/BR B.12 (Daftar Auditi/Detail Auditi/Validasi Data)',
    status: 'baru',
    deskripsi:
      'Populasi lengkap objek audit (seluruh satker Mabes/Polda/Polres/Polsek) dengan skor risiko inheren 6 faktor dan status kelengkapan data sebagai basis penyusunan PKPT.',
  },
  {
    id: 'b13',
    kode: 'B.13',
    label: 'PKPT Berbasis Risiko',
    group: 'pengawasan-audit',
    icon: RouteIcon,
    sumberSpek: 'SPEKTEK III.A.2 (B.13, 120 OH); BA-SA-Lanjutan FSD/BR B.13 (Skoring Risiko/Peringkat Prioritas/Draf PKPT)',
    status: 'baru',
    deskripsi:
      'Program Kerja Pengawasan Tahunan disusun dari skor tertimbang 6 faktor risiko Audit Universe (bobot total 1,00), peringkat prioritas berambang, dan draf kegiatan berkapasitas OH tahunan.',
  },
  {
    id: 'b14',
    kode: 'B.14',
    label: 'Manajemen Penugasan Audit',
    group: 'pengawasan-audit',
    icon: ClipboardList,
    legacyViewId: 'pengawasan',
    legacyTab: 'penugasan',
    sumberSpek: 'SPEKTEK III.A.2 (B.14, 110 OH); BA-SA-Lanjutan FSD/BR B.14 (Pembentukan Tim/Surat Tugas/Kalender Kapasitas)',
    status: 'baru',
    deskripsi:
      'Surat tugas bernomor otomatis, susunan tim audit dengan validasi konflik kepentingan 2 tahun, dan kalender kapasitas/beban penugasan auditor (capacity monitoring).',
  },
  {
    id: 'b15',
    kode: 'B.15',
    label: 'Kertas Kerja Audit Digital',
    group: 'pengawasan-audit',
    icon: FileText,
    sumberSpek: 'SPEKTEK III.A.2 (B.15, 140 OH); BA-SA-Lanjutan FSD/BR B.15 (KK Aktif/Form Pengisian/Antrean Validasi)',
    status: 'baru',
    deskripsi: 'Kertas Kerja Pemeriksaan (KKP/KKA) digital: eviden multifile, skor otomatis, dan validasi berjenjang Ketua Tim -> Pengawas Tim.',
  },
  {
    id: 'b16',
    kode: 'B.16',
    label: 'Manajemen Rekomendasi & TLHP',
    group: 'pengawasan-audit',
    icon: ListChecks,
    auditeeVisible: true,
    sumberSpek: 'SPEKTEK III.A.2 (B.16, 120 OH); BA-SA-Lanjutan FSD/BR B.16 (Rekap Lintas Sumber/Detail Aging/Verifikasi Bukti)',
    status: 'baru',
    deskripsi: 'Rekap rekomendasi lintas sumber (Audit Polri/BPK/IRSUS) tersinkron dengan B.2/B.3, status dan aging Tindak Lanjut Hasil Pemeriksaan (kritis di atas 730 hari), serta verifikasi bukti oleh Auditee.',
  },
  {
    id: 'b17',
    kode: 'B.17',
    label: 'Monitoring Maturitas SPIP & Risiko',
    group: 'pengawasan-audit',
    icon: ShieldAlert,
    sumberSpek: 'SPEKTEK III.A.2 (B.17, 80 OH); BA-SA-Lanjutan FSD/BR B.17 (Dashboard Rollup/Peta Risiko/Tren Antar Periode)',
    status: 'baru',
    deskripsi: 'Dashboard agregat maturitas SPIP lintas satker (rollup L0 Nasional - L1 Itwil - L2 Satker dari B.8), peta risiko strategis, dan tren antar periode dengan bobot rollup terkonfigurasi.',
  },
  {
    id: 'b18',
    kode: 'B.18',
    label: 'Early Warning Pengawasan',
    group: 'pengawasan-audit',
    icon: AlertTriangle,
    sumberSpek: 'SPEKTEK III.A.2 (B.18, 80 OH); BA-SA-Lanjutan FSD/BR B.18 (Konfigurasi Aturan/Dashboard Aktif/Riwayat Eskalasi)',
    status: 'baru',
    deskripsi: 'Aturan dan pemicu (trigger) peringatan dini lintas modul: keterlambatan TLHP (B.16), penurunan maturitas SPIP (B.17), penurunan IKU (B.7), dan anomali data Audit Universe (B.12), dengan SLA eskalasi dan snooze maks 7 hari.',
  },

  // ==================== ADMINISTRASI & PERSURATAN ====================
  {
    id: 'b4',
    kode: 'B.4',
    label: 'Surat Usulan',
    group: 'administrasi',
    icon: FileSignature,
    sumberSpek: 'SPEKTEK III.A.2 (B.4, 110 OH); BA-SA-Lanjutan FSD/BR B.4 (Formulir Pengajuan/Antrean Review/Arsip)',
    status: 'baru',
    deskripsi: 'Pengajuan, review berjenjang (kunci simultan 15 menit) dengan SLA 3 hari kerja per tahap, dan pengesahan surat usulan pengawasan (mutasi, hak akses, penugasan khusus).',
  },
  {
    id: 'b5',
    kode: 'B.5',
    label: 'E-Office',
    group: 'administrasi',
    icon: Mail,
    sumberSpek: 'SPEKTEK III.A.2 (B.5, 140 OH); BA-SA-Lanjutan FSD/BR B.5 (Naskah Masuk/Naskah Keluar/Antrean Disposisi/Arsip)',
    status: 'baru',
    deskripsi: 'Persuratan elektronik internal Itwasum: naskah dinas masuk/keluar dengan klasifikasi kecepatan (Sangat Segera/Segera/Biasa) & kerahasiaan (Rahasia/Terbatas/Biasa) yang menentukan SLA disposisi, serta arsip digital.',
  },

  // ========================= AI PENGAWASAN =========================
  {
    id: 'e1',
    kode: 'E.1',
    label: 'AI Foundation Platform & MLOps Pipeline',
    group: 'ai-pengawasan',
    icon: Cpu,
    sumberSpek: 'SPEKTEK III.A.5 (E.1, 100 OH)',
    status: 'baru',
    deskripsi: 'Status pipeline MLOps: registry model, versi, tahap deployment, dan kesehatan layanan inferensi.',
  },
  {
    id: 'e2',
    kode: 'E.2',
    label: 'RAG Knowledge Hub Pengawasan',
    group: 'ai-pengawasan',
    icon: Database,
    sumberSpek: 'SPEKTEK III.A.5 (E.2, 160 OH)',
    status: 'baru',
    deskripsi: 'Basis pengetahuan pengawasan berbasis Retrieval-Augmented Generation: sumber dokumen terindeks dan status pengindeksan.',
  },
  {
    id: 'e3',
    kode: 'E.3',
    label: 'Auto Report Generator + Executive Summary',
    group: 'ai-pengawasan',
    icon: FileText,
    sumberSpek: 'SPEKTEK III.A.5 (E.3, 120 OH)',
    status: 'baru',
    deskripsi: 'Antrean pembuatan laporan otomatis dan ringkasan eksekutif berbasis AI dari data pengawasan aktif.',
  },
  {
    id: 'e4',
    kode: 'E.4',
    label: 'Anomaly Alert Pengawasan',
    group: 'ai-pengawasan',
    icon: Radar,
    sumberSpek: 'SPEKTEK III.A.5 (E.4, 100 OH)',
    status: 'baru',
    deskripsi: 'Deteksi anomali data pengawasan (rule + light ML) dan daftar alert yang memicu Early Warning (B.18).',
  },
  {
    id: 'e5',
    kode: 'E.5',
    label: 'ChatItwasum Copilot APIP-focused',
    group: 'ai-pengawasan',
    icon: MessageSquareText,
    sumberSpek: 'SPEKTEK III.A.5 (E.5, 180 OH); Modul Overview SF-008 Tanya Jawab Data',
    status: 'baru',
    deskripsi: 'Asisten percakapan AI untuk menjawab pertanyaan data pengawasan (terhubung ke @google/genai, fallback mock bila API key kosong).',
  },
  {
    id: 'e6',
    kode: 'E.6',
    label: 'Document AI Pengawasan',
    group: 'ai-pengawasan',
    icon: Bot,
    sumberSpek: 'SPEKTEK III.A.5 (E.6, 180 OH)',
    status: 'baru',
    deskripsi: 'OCR, Named Entity Recognition, dan ekstraksi entitas dari dokumen audit/temuan yang diunggah.',
  },
  {
    id: 'e7',
    kode: 'E.7',
    label: 'AI Governance & AI Security',
    group: 'ai-pengawasan',
    icon: Shield,
    sumberSpek: 'SPEKTEK III.A.5 (E.7, 120 OH); SPEKTEK III.B.5 (dokumen wajib DOC-05)',
    status: 'baru',
    deskripsi: 'Kebijakan tata kelola AI, risk register per model, dan audit trail permintaan LLM (memakai auditLogger yang sudah ada).',
  },
  {
    id: 'e8',
    kode: 'E.8',
    label: 'Subscription Layanan AI Cloud Managed',
    group: 'ai-pengawasan',
    icon: CloudCog,
    sumberSpek: 'SPEKTEK III.A.5 (E.8, 1 Paket, 12 bulan)',
    status: 'baru',
    deskripsi: 'Status dan biaya berjalan langganan layanan AI cloud terkelola selama 12 bulan pasca go-live.',
  },

  // =================== PLATFORM DATA & INTEGRASI ===================
  {
    id: 'a1',
    kode: 'A.1',
    label: 'API Consumer Layer ke DIV TIK / SuperApp Big Data Polri',
    group: 'platform-data',
    icon: Cable,
    sumberSpek: 'SPEKTEK III.A.1 (A.1, 100 OH)',
    status: 'baru',
    deskripsi: 'Status koneksi konsumsi API dari DIV TIK/SuperApp Big Data Polri sebagai sumber data resmi.',
  },
  {
    id: 'a2',
    kode: 'A.2',
    label: 'Data Mart Pengawasan Itwasum',
    group: 'platform-data',
    icon: Database,
    sumberSpek: 'SPEKTEK III.A.1 (A.2, 125 OH)',
    status: 'baru',
    deskripsi: 'Status pipeline ETL/ELT data mart pengawasan: sumber, tahapan transformasi, dan kesegaran data.',
  },
  {
    id: 'a3',
    kode: 'A.3',
    label: 'Tata Kelola Data SDI',
    group: 'platform-data',
    icon: FolderKanban,
    sumberSpek: 'SPEKTEK III.A.1 (A.3, 80 OH)',
    status: 'baru',
    deskripsi: 'Katalog data, kamus data, dan kebijakan tata kelola Satu Data Indonesia (SDI) untuk domain pengawasan.',
  },
  {
    id: 'a4',
    kode: 'A.4',
    label: 'Data Protection & DLP',
    group: 'platform-data',
    icon: KeyRound,
    sumberSpek: 'SPEKTEK III.A.1 (A.4, 75 OH)',
    status: 'baru',
    deskripsi: 'Kebijakan klasifikasi data, masking dinamis, dan status Data Loss Prevention lintas modul.',
  },
  {
    id: 'c1',
    kode: 'C.1',
    label: 'Integrasi Data Service Contract via DIV TIK',
    group: 'platform-data',
    icon: Workflow,
    sumberSpek: 'SPEKTEK III.A.3 (C.1, 200 OH); SPEKTEK III.B.4 (dokumen wajib DOC-04)',
    status: 'baru',
    deskripsi: 'Daftar service contract 8 domain integrasi DIV TIK: status, SLA, dan versi kontrak API.',
  },
  {
    id: 'c2',
    kode: 'C.2',
    label: 'Integrasi Data Quality, Schema Alignment & Reconciliation',
    group: 'platform-data',
    icon: GitBranch,
    sumberSpek: 'SPEKTEK III.A.3 (C.2, 150 OH)',
    status: 'baru',
    deskripsi: 'Metrik kualitas data hasil rekonsiliasi antar sumber (completeness, accuracy, timeliness) per domain integrasi.',
  },
  {
    id: 'd',
    kode: 'D.1-D.2',
    label: 'Status Deployment & Environment',
    group: 'platform-data',
    icon: Server,
    sumberSpek:
      'SPEKTEK III.A.4 (D.1 Implementasi Sistem di Environment DC DIVTIK, 40 OH; D.2 Staging dan Konfigurasi DC DIVTIK, 40 OH); ' +
      'bukti nyata: evidence/infra-repoconfig-itwasum, evidence/helm-repoconfig-itwasum',
    status: 'nyata',
    deskripsi:
      'Satu-satunya halaman berisi DATA NYATA (bukan mock): environment Development & SIT yang benar-benar berjalan ' +
      '(namespace, Ingress, Vault Secrets Operator, 3 Helm chart, 167 rilis CI terverifikasi), plus status migrasi ke DC DIVTIK.',
  },

  // ========================= TATA KELOLA SISTEM =========================
  {
    id: 'b9',
    kode: 'B.9',
    label: 'User & Role Management',
    group: 'tata-kelola',
    icon: UserCog,
    legacyViewId: 'pengaturan',
    sumberSpek: 'SPEKTEK III.A.2 (B.9, 120 OH); BA-SA Feature Catalog B.9 (Pengelolaan Pengguna, Hak Akses, Riwayat)',
    status: 'replikasi',
    deskripsi: 'Pengelolaan pengguna, kontrol akses (peran & izin), dan riwayat perubahan hak akses.',
  },
  {
    id: 'b10',
    kode: 'B.10',
    label: 'Log Aktivitas & Audit Trail',
    group: 'tata-kelola',
    icon: History,
    sumberSpek: 'SPEKTEK III.A.2 (B.10, 110 OH); BA-SA-Lanjutan FSD/BR B.10 (Daftar Log/Detail Kejadian/Konfigurasi Retensi)',
    status: 'baru',
    deskripsi: 'Audit trail immutable lintas modul (login, drill-down, ekspor, perubahan hak akses, interaksi AI) dengan badge integritas checksum, grafik volume, dan alert anomali >200% (retensi default 1825 hari).',
  },
  {
    id: 'b11',
    kode: 'B.11',
    label: 'Login & Otentikasi 2FA',
    group: 'tata-kelola',
    icon: ShieldCheck,
    sumberSpek: 'SPEKTEK III.A.2 (B.11, 80 OH); BA-SA Feature Catalog B.11 (Login, Lupa Kata Sandi, Verifikasi 2FA, Sesi Pengguna)',
    status: 'baru',
    deskripsi: 'Status konfigurasi keamanan otentikasi: 2FA/OTP, kebijakan sesi tunggal, dan timeout sesi pengguna.',
  },
] satisfies ModuleDefinition[];

/** Union literal seluruh id modul terdaftar, contoh: 'beranda' | 'b1' | 'b2' | ... | 'e8' | 'd'. */
export type ModuleId = (typeof MODULE_REGISTRY)[number]['id'];

export function getModuleById(id: string | undefined | null): ModuleDefinition | undefined {
  if (!id) return undefined;
  return MODULE_REGISTRY.find((m) => m.id === id);
}

export function getModulesByGroup(group: ModuleGroupId): ModuleDefinition[] {
  return MODULE_REGISTRY.filter((m) => m.group === group);
}

/**
 * Aturan kelayakan akses per peran (RBAC ringan, konsisten dengan `rolesData.buildUserProfileFromConfig`):
 *   - super_admin / admin_polda (dapatOverview = 'tanpa_data'): hanya 'overview' + 'tata-kelola'
 *   - pengawas_tim / ketua_tim / auditor (dapatOverview = 'tidak'): 'overview' + 'pengawasan-audit' + 'profil-kinerja'
 *   - auditee (dapatOverview = 'tidak'): 'overview' + modul bertanda `auditeeVisible`
 *   - pimpinan_tertinggi / koordinator_pengendali (dapatOverview = 'penuh'): semua grup kecuali 'tata-kelola'
 */
export function getVisibleModulesForRole(role: OfficialRole): ModuleDefinition[] {
  if (role === 'super_admin' || role === 'admin_polda') {
    return MODULE_REGISTRY.filter((m) => m.group === 'overview' || m.group === 'tata-kelola');
  }
  if (role === 'pengawas_tim' || role === 'ketua_tim' || role === 'auditor') {
    return MODULE_REGISTRY.filter(
      (m) => m.group === 'overview' || m.group === 'pengawasan-audit' || m.group === 'profil-kinerja'
    );
  }
  if (role === 'auditee') {
    return MODULE_REGISTRY.filter((m) => m.group === 'overview' || m.auditeeVisible);
  }
  // pimpinan_tertinggi & koordinator_pengendali: semua grup kecuali tata-kelola sistem
  return MODULE_REGISTRY.filter((m) => m.group !== 'tata-kelola');
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Struktur navigasi Sidebar mengikuti Figma "UI Req by BA" (lihat `figma/README.md`), Plan
 * "Align itwasum with Figma" bagian 2. Ini adalah lapisan TAMPILAN saja — visibilitas tiap
 * item tetap ditentukan oleh `getVisibleModulesForRole` (RBAC di `moduleRegistry.ts`) memakai
 * `moduleId`; grup & urutan di sini murni presentasi dan tidak mengubah aturan akses.
 *
 * Grup Figma (Ringkasan/Manajemen Auditor/Pengguna & Akses/Audit/Kinerja/Portal Satker) muncul
 * lebih dulu. Modul yang tidak punya frame Figma eksplisit dikelompokkan pada grup tambahan
 * ("Audit Universe & Risiko", "Perencanaan & Pelaksanaan", dst.) dengan gaya visual yang sama.
 */
import type { LucideIcon } from 'lucide-react';
import {
  Home,
  Building2,
  UserCheck,
  Award,
  Gauge as GaugeIcon,
  UserCog,
  KeyRound,
  FileCheck,
  BarChart3,
  LayoutDashboard,
  FolderKanban,
  ClipboardList,
  BookOpen,
  FileStack,
  Workflow,
  FileSignature,
  Layers,
  ShieldAlert,
  ScrollText,
  Route as RouteIcon,
  FileText,
  ListChecks,
  Mail,
  Sparkles,
  Cable,
  History,
  ShieldCheck,
} from 'lucide-react';
import type { ModuleId } from './moduleRegistry';

export interface SidebarNavItem {
  /** Kunci unik untuk item ini (bukan hanya moduleId, karena satu modul bisa muncul >1 kali
   * dengan subPath berbeda, mis. B.12 di grup Portal Satker vs Audit Universe & Risiko). */
  id: string;
  label: string;
  moduleId: ModuleId;
  subPath?: string;
  icon: LucideIcon;
}

export interface SidebarNavGroup {
  id: string;
  label: string;
  items: SidebarNavItem[];
}

/** Grup persis seperti pada Figma (urutan dipertahankan). */
export const FIGMA_SIDEBAR_GROUPS: SidebarNavGroup[] = [
  {
    id: 'ringkasan',
    label: 'Ringkasan',
    items: [
      { id: 'beranda', label: 'Peta Komando Nasional', moduleId: 'beranda', icon: Home },
      { id: 'b1', label: 'E-Profile Polri', moduleId: 'b1', icon: Building2 },
    ],
  },
  {
    id: 'manajemen-auditor',
    label: 'Manajemen Auditor',
    items: [
      { id: 'b6', label: 'Daftar Auditor', moduleId: 'b6', icon: UserCheck },
      { id: 'b6-matriks', label: 'Matriks Kompetensi', moduleId: 'b6', subPath: 'matriks-kompetensi', icon: Award },
      { id: 'b6-monitoring', label: 'Monitoring Kapasitas', moduleId: 'b6', subPath: 'monitoring-kapasitas', icon: GaugeIcon },
    ],
  },
  {
    id: 'pengguna-akses',
    label: 'Pengguna & Akses',
    items: [
      { id: 'b9', label: 'Tata Kelola Pengguna', moduleId: 'b9', icon: UserCog },
      { id: 'b9-kontrol-akses', label: 'Kontrol Akses (Peran & Izin)', moduleId: 'b9', subPath: 'kontrol-akses', icon: KeyRound },
    ],
  },
  {
    id: 'audit',
    label: 'Audit',
    items: [{ id: 'b2', label: 'Temuan Audit Polri', moduleId: 'b2', icon: FileCheck }],
  },
  {
    id: 'kinerja',
    label: 'Kinerja',
    items: [{ id: 'b7', label: 'Iku Satker', moduleId: 'b7', icon: BarChart3 }],
  },
  {
    id: 'portal-satker',
    label: 'Portal Satker',
    items: [
      { id: 'b12-dashboard-portal', label: 'Dashboard Portal Itwasum', moduleId: 'b12', subPath: 'dashboard-portal', icon: LayoutDashboard },
      { id: 'b12-portal-satker', label: 'Dashboard Portal Satker', moduleId: 'b12', subPath: 'portal-satker', icon: FolderKanban },
      { id: 'b12-master-jenis', label: 'Master Jenis Pengawasan', moduleId: 'b12', subPath: 'master-jenis-pengawasan', icon: ClipboardList },
      { id: 'b12-master-tipologi', label: 'Master Tipologi Satker', moduleId: 'b12', subPath: 'master-tipologi', icon: Building2 },
      { id: 'b12-master-katalog', label: 'Master Katalog Pra-Audit', moduleId: 'b12', subPath: 'master-katalog', icon: BookOpen },
      { id: 'b12-master-template', label: 'Master Template Dokumen', moduleId: 'b12', subPath: 'master-template', icon: FileStack },
      { id: 'b12-mapping', label: 'Mapping Kebutuhan Dokumen', moduleId: 'b12', subPath: 'mapping', icon: Workflow },
      { id: 'b12-penugasan-audit', label: 'Penugasan Audit', moduleId: 'b12', subPath: 'penugasan-audit', icon: FileSignature },
    ],
  },
];

/** Grup tambahan (tidak ada frame Figma eksplisit) — gaya visual sama, muncul setelah grup Figma. */
export const EXTRA_SIDEBAR_GROUPS: SidebarNavGroup[] = [
  {
    id: 'audit-universe-risiko',
    label: 'Audit Universe & Risiko',
    items: [
      { id: 'b12-organisasi', label: 'Struktur Organisasi & Unit Kerja', moduleId: 'b12', subPath: 'organisasi', icon: Building2 },
      { id: 'b12-dashboard', label: 'Dashboard Audit Universe (F2)', moduleId: 'b12', subPath: 'dashboard', icon: LayoutDashboard },
      { id: 'b12-objek-audit', label: 'Objek Audit (F3)', moduleId: 'b12', subPath: 'objek-audit', icon: Layers },
      { id: 'b12-aturan-validasi', label: 'Aturan Validasi', moduleId: 'b12', subPath: 'aturan-validasi', icon: ShieldCheck },
      { id: 'b12-tambahan-audit', label: 'Dokumen Tambahan Audit', moduleId: 'b12', subPath: 'tambahan-audit', icon: FileText },
      { id: 'b12-verifikasi-berkas', label: 'Antrean Verifikasi (F7)', moduleId: 'b12', subPath: 'verifikasi-berkas', icon: ListChecks },
      { id: 'b12-risiko-register', label: 'Register Risiko (8.1)', moduleId: 'b12', subPath: 'risiko-register', icon: ShieldAlert },
      { id: 'b12-risiko-review', label: 'Review & Persetujuan (8.2)', moduleId: 'b12', subPath: 'risiko-review', icon: ScrollText },
      { id: 'b12-prioritas-pkpt', label: 'Prioritas & Usulan PKPT (F9)', moduleId: 'b12', subPath: 'prioritas-pkpt', icon: RouteIcon },
    ],
  },
  {
    id: 'perencanaan-pelaksanaan',
    label: 'Perencanaan & Pelaksanaan',
    items: [
      { id: 'b13', label: 'PKPT Berbasis Risiko', moduleId: 'b13', icon: RouteIcon },
      { id: 'b14', label: 'Manajemen Penugasan Audit', moduleId: 'b14', icon: ClipboardList },
      { id: 'b15', label: 'Kertas Kerja Audit Digital', moduleId: 'b15', icon: FileText },
      { id: 'b16', label: 'Rekomendasi & TLHP', moduleId: 'b16', icon: ListChecks },
      { id: 'b17', label: 'Monitoring Maturitas SPIP', moduleId: 'b17', icon: ShieldAlert },
      { id: 'b18', label: 'Early Warning Pengawasan', moduleId: 'b18', icon: ShieldAlert },
      { id: 'b8', label: 'SPIP Satker', moduleId: 'b8', icon: ShieldCheck },
    ],
  },
  {
    id: 'administrasi',
    label: 'Administrasi & Persuratan',
    items: [
      { id: 'b4', label: 'Surat Usulan', moduleId: 'b4', icon: FileSignature },
      { id: 'b5', label: 'E-Office', moduleId: 'b5', icon: Mail },
    ],
  },
  {
    id: 'ai-pengawasan',
    label: 'AI Pengawasan',
    items: [
      { id: 'e1', label: 'AI Foundation Platform', moduleId: 'e1', icon: Sparkles },
      { id: 'e2', label: 'RAG Knowledge Hub', moduleId: 'e2', icon: Sparkles },
      { id: 'e3', label: 'Auto Report Generator', moduleId: 'e3', icon: Sparkles },
      { id: 'e4', label: 'Anomaly Alert', moduleId: 'e4', icon: Sparkles },
      { id: 'e5', label: 'ChatItwasum Copilot', moduleId: 'e5', icon: Sparkles },
      { id: 'e6', label: 'Document AI', moduleId: 'e6', icon: Sparkles },
      { id: 'e7', label: 'AI Governance & Security', moduleId: 'e7', icon: Sparkles },
      { id: 'e8', label: 'Subscription AI Cloud', moduleId: 'e8', icon: Sparkles },
    ],
  },
  {
    id: 'platform-data',
    label: 'Platform Data & Integrasi',
    items: [
      { id: 'a1', label: 'API Consumer Layer', moduleId: 'a1', icon: Cable },
      { id: 'a2', label: 'Data Mart Pengawasan', moduleId: 'a2', icon: Cable },
      { id: 'a3', label: 'Tata Kelola Data SDI', moduleId: 'a3', icon: Cable },
      { id: 'a4', label: 'Data Protection & DLP', moduleId: 'a4', icon: Cable },
      { id: 'c1', label: 'Integrasi Service Contract', moduleId: 'c1', icon: Workflow },
      { id: 'c2', label: 'Data Quality & Reconciliation', moduleId: 'c2', icon: Workflow },
      { id: 'd', label: 'Status Deployment', moduleId: 'd', icon: Cable },
    ],
  },
  {
    id: 'tata-kelola-lain',
    label: 'Tata Kelola Sistem',
    items: [
      { id: 'b10', label: 'Log Aktivitas & Audit Trail', moduleId: 'b10', icon: History },
      { id: 'b11', label: 'Login & Otentikasi 2FA', moduleId: 'b11', icon: ShieldCheck },
    ],
  },
];

/** Item terpisah, dipinkan ke bagian bawah sidebar (Figma: "Pengaturan" & "Keluar"). */
export const PINNED_BOTTOM_ITEM: SidebarNavItem = {
  id: 'b9-parameter',
  label: 'Pengaturan',
  moduleId: 'b9',
  subPath: 'parameter',
  icon: KeyRound,
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Maps the app's existing demo accounts (`CurrentUserProfile.titikWilayahId`, defined in
 * `rolesData.ts`) to `OrgUnit` ids in the migrated Audit Universe dataset, and centralizes
 * the role-gating rules for the new B.12/B.15 screens (Plan "Migrate 27092026 prototypes").
 */
import type { CurrentUserProfile, OfficialRole } from '../../types';

const TITIK_WILAYAH_TO_ORG_ID: Record<string, string> = {
  nasional: 'ORG-00001',
  'polda-riau': 'ORG-00300',
  'polres-kampar': 'ORG-00352',
};

/** OrgUnit id that best represents this user's Satker for Portal Satker / Laporan berkala. */
export function currentUserOrgId(currentUser: CurrentUserProfile): string | null {
  return TITIK_WILAYAH_TO_ORG_ID[currentUser.titikWilayahId] ?? null;
}

/** Boleh membuat, mengubah, dan mengirim Permintaan Pengumpulan Data (5.1). */
const PERMINTAAN_MANAGER_ROLES: OfficialRole[] = ['super_admin', 'admin_polda', 'pimpinan_tertinggi', 'koordinator_pengendali', 'ketua_tim'];
export function canManagePermintaan(currentUser: CurrentUserProfile): boolean {
  return PERMINTAAN_MANAGER_ROLES.includes(currentUser.peran);
}

/** Boleh memverifikasi berkas/laporan yang dikirim Satker (7.1), berperan sebagai Verifikator Itwil. */
const VERIFIKATOR_ROLES: OfficialRole[] = ['super_admin', 'koordinator_pengendali', 'pengawas_tim', 'ketua_tim'];
export function canVerifyBerkas(currentUser: CurrentUserProfile): boolean {
  return VERIFIKATOR_ROLES.includes(currentUser.peran);
}

export function displayNameForLog(currentUser: CurrentUserProfile): string {
  return `${currentUser.pangkat} ${currentUser.nama} (${currentUser.peranLabel})`;
}

/* =====================================================================================
 * Plane B.12 role groups (plane/b-12-functional-specification-document-fsd-audit-universe.md
 * SF-111/BR-111-113, SF-112/BR-121-123) — mapped onto this app's `OfficialRole`, since the
 * app's demo accounts don't have a 1:1 "Admin Itwasum / PIC Satker / Verifikator Itwil /
 * Tim Risiko" role set. Every B.12 screen's visibility/edit rights should be expressed in
 * terms of these 4 groups, not raw `OfficialRole` checks, so the mapping stays in one place.
 * ===================================================================================== */
export type AuditUniverseRoleGroup = 'admin_itwasum' | 'pic_satker' | 'verifikator_itwil' | 'tim_risiko';

const ROLE_GROUP_MAP: Record<OfficialRole, AuditUniverseRoleGroup[]> = {
  super_admin: ['admin_itwasum', 'verifikator_itwil', 'tim_risiko'],
  admin_polda: ['admin_itwasum'],
  pimpinan_tertinggi: ['tim_risiko'],
  koordinator_pengendali: ['verifikator_itwil', 'tim_risiko'],
  pengawas_tim: ['verifikator_itwil'],
  ketua_tim: ['verifikator_itwil', 'tim_risiko'],
  auditor: [],
  auditee: ['pic_satker'],
};

/** All B.12 role groups this user belongs to (a user can belong to more than one, per BR-111). */
export function auditUniverseRoleGroups(currentUser: CurrentUserProfile): AuditUniverseRoleGroup[] {
  return ROLE_GROUP_MAP[currentUser.peran] ?? [];
}

export function isInAuditUniverseGroup(currentUser: CurrentUserProfile, group: AuditUniverseRoleGroup): boolean {
  return auditUniverseRoleGroups(currentUser).includes(group);
}

/** Boleh mengelola Master Data (4.1-4.4), Mapping (5.1), dan Aturan Validasi (5.2). */
export function canManageMasterData(currentUser: CurrentUserProfile): boolean {
  return isInAuditUniverseGroup(currentUser, 'admin_itwasum');
}

/** Boleh melakukan Penilaian Risiko (8.1), Review & Persetujuan (8.2), dan Prioritas/Usulan PKPT (F9). */
export function canManageRisiko(currentUser: CurrentUserProfile): boolean {
  return isInAuditUniverseGroup(currentUser, 'tim_risiko');
}

/** Label ringkas kelompok peran B.12 untuk badge scope (SF-112). */
export const ROLE_GROUP_LABEL: Record<AuditUniverseRoleGroup, string> = {
  admin_itwasum: 'Admin Itwasum',
  pic_satker: 'PIC Satker',
  verifikator_itwil: 'Verifikator Itwil',
  tim_risiko: 'Tim Risiko & Perencanaan',
};

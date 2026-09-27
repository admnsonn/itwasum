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

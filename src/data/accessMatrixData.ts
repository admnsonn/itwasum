/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Model + persistensi matriks izin B.9 Otorisasi Akses (Plan bagian 5e). Daftar modul pada
 * matriks DIBANGKITKAN dari `MODULE_REGISTRY`/`MODULE_GROUPS` (bukan daftar statis) sehingga
 * seluruh 34 modul termasuk 11 modul BA-SA-Lanjutan otomatis tampil. Disimpan ke `localStorage`
 * mengikuti pola `hakAksesWorkflowData.ts`.
 */
import { MODULE_REGISTRY, ModuleId } from '../config/moduleRegistry';
import type { OfficialRole } from '../types';

export type CrudResourceKey = 'user' | 'role' | 'auditor' | 'personel' | 'satker';

export const CRUD_RESOURCE_LABEL: Record<CrudResourceKey, string> = {
  user: 'User',
  role: 'Role',
  auditor: 'Auditor',
  personel: 'Personel',
  satker: 'Satker',
};

export interface CrudPermissions {
  read: boolean;
  create: boolean;
  update: boolean;
  delete: boolean;
  readRoleMatrix?: boolean; // khusus grup Role
  assignPermission?: boolean; // khusus grup Role
}

export interface ModulePermission {
  view: boolean;
  export: boolean;
}

export interface RoleAccessConfig {
  crud: Record<CrudResourceKey, CrudPermissions>;
  modules: Partial<Record<ModuleId, ModulePermission>>;
}

export type AccessMatrixState = Record<string, RoleAccessConfig>;

export interface CustomRoleDef {
  id: string;
  nama: string;
  subLabel: string;
}

const STORAGE_KEY_MATRIX = 'satudata_itwasum_access_matrix';
const STORAGE_KEY_CUSTOM_ROLES = 'satudata_itwasum_custom_roles';
const STORAGE_KEY_META = 'satudata_itwasum_access_matrix_meta';

export const PREDEFINED_ROLE_CARDS: { id: OfficialRole; nama: string; subLabel: string; locked?: boolean }[] = [
  { id: 'super_admin', nama: 'Super Admin', subLabel: 'Akses penuh sistem & konfigurasi', locked: true },
  { id: 'admin_polda', nama: 'Admin Polda', subLabel: 'Pengelola akun & data wilayah Polda' },
  { id: 'pimpinan_tertinggi', nama: 'Pimpinan Tertinggi', subLabel: 'Irwasum / Kapolri — visibilitas penuh' },
  { id: 'koordinator_pengendali', nama: 'Koordinator & Pengendali', subLabel: 'Pengendali mutu wilayah Itwil' },
  { id: 'pengawas_tim', nama: 'Pengawas Tim', subLabel: 'Supervisi tim audit lapangan' },
  { id: 'ketua_tim', nama: 'Ketua Tim', subLabel: 'Pemimpin tim audit lapangan' },
  { id: 'auditor', nama: 'Auditor', subLabel: 'Pelaksana pemeriksaan lapangan' },
  { id: 'auditee', nama: 'Auditee', subLabel: 'Objek periksa — akses terbatas' },
];

function emptyCrud(): CrudPermissions {
  return { read: false, create: false, update: false, delete: false, readRoleMatrix: false, assignPermission: false };
}

function buildDefaultRoleConfig(roleId: string): RoleAccessConfig {
  const isSuperAdmin = roleId === 'super_admin';
  const isAdminLike = roleId === 'admin_polda' || isSuperAdmin;
  const isTimAudit = ['pengawas_tim', 'ketua_tim', 'auditor'].includes(roleId);
  const isPimpinan = roleId === 'pimpinan_tertinggi' || roleId === 'koordinator_pengendali';

  const crud: Record<CrudResourceKey, CrudPermissions> = {
    user: isSuperAdmin ? { read: true, create: true, update: true, delete: true } : isAdminLike ? { read: true, create: true, update: true, delete: false } : emptyCrud(),
    role: isSuperAdmin ? { read: true, create: true, update: true, delete: true, readRoleMatrix: true, assignPermission: true } : emptyCrud(),
    auditor: isSuperAdmin || isAdminLike || isPimpinan ? { read: true, create: isAdminLike, update: isAdminLike, delete: false } : { ...emptyCrud(), read: isTimAudit },
    personel: isSuperAdmin || isAdminLike || isPimpinan ? { read: true, create: isAdminLike, update: isAdminLike, delete: false } : { ...emptyCrud(), read: true },
    satker: { read: true, create: isSuperAdmin, update: isAdminLike, delete: false },
  };

  const modules: Partial<Record<ModuleId, ModulePermission>> = {};
  MODULE_REGISTRY.forEach((m) => {
    let view = false;
    if (m.group === 'overview') view = true;
    else if (isSuperAdmin) view = true;
    else if (isPimpinan) view = m.group !== 'tata-kelola';
    else if (isTimAudit) view = m.group === 'pengawasan-audit' || m.group === 'profil-kinerja';
    else if (roleId === 'auditee') view = Boolean(m.auditeeVisible);
    else if (isAdminLike) view = m.group === 'tata-kelola';
    modules[m.id as ModuleId] = { view, export: isSuperAdmin || (view && isPimpinan) };
  });

  return { crud, modules };
}

export function getDefaultAccessMatrix(customRoles: CustomRoleDef[] = []): AccessMatrixState {
  const state: AccessMatrixState = {};
  PREDEFINED_ROLE_CARDS.forEach((r) => { state[r.id] = buildDefaultRoleConfig(r.id); });
  customRoles.forEach((r) => { state[r.id] = buildDefaultRoleConfig(r.id); });
  return state;
}

export function getCustomRoles(): CustomRoleDef[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_CUSTOM_ROLES);
    return raw ? JSON.parse(raw) : [];
  } catch {
    return [];
  }
}

export function saveCustomRoles(roles: CustomRoleDef[]) {
  try {
    localStorage.setItem(STORAGE_KEY_CUSTOM_ROLES, JSON.stringify(roles));
  } catch (e) {
    console.warn('Gagal menyimpan daftar peran kustom', e);
  }
}

export function getAccessMatrix(): AccessMatrixState {
  const customRoles = getCustomRoles();
  try {
    const raw = localStorage.getItem(STORAGE_KEY_MATRIX);
    if (!raw) {
      const initial = getDefaultAccessMatrix(customRoles);
      localStorage.setItem(STORAGE_KEY_MATRIX, JSON.stringify(initial));
      return initial;
    }
    const parsed = JSON.parse(raw) as AccessMatrixState;
    // Pastikan peran baru (mis. peran kustom baru ditambahkan) selalu punya default config.
    [...PREDEFINED_ROLE_CARDS.map((r) => r.id), ...customRoles.map((r) => r.id)].forEach((id) => {
      if (!parsed[id]) parsed[id] = buildDefaultRoleConfig(id);
    });
    return parsed;
  } catch {
    return getDefaultAccessMatrix(customRoles);
  }
}

export function saveAccessMatrix(state: AccessMatrixState) {
  try {
    localStorage.setItem(STORAGE_KEY_MATRIX, JSON.stringify(state));
  } catch (e) {
    console.warn('Gagal menyimpan matriks hak akses', e);
  }
}

export interface AccessMatrixMeta {
  waktu: string;
  aktor: string;
}

export function getAccessMatrixMeta(): AccessMatrixMeta | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY_META);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

export function saveAccessMatrixMeta(meta: AccessMatrixMeta) {
  try {
    localStorage.setItem(STORAGE_KEY_META, JSON.stringify(meta));
  } catch (e) {
    console.warn('Gagal menyimpan metadata matriks hak akses', e);
  }
}

/** Ringkasan singkat konfigurasi peran untuk `nilaiBaru` pada `logUbahHakAkses` (BR-LOG-001). */
export function buildAccessMatrixSnapshot(config: RoleAccessConfig): string {
  const crudSummary = (Object.keys(config.crud) as CrudResourceKey[])
    .filter((k) => config.crud[k].read || config.crud[k].create || config.crud[k].update || config.crud[k].delete)
    .map((k) => CRUD_RESOURCE_LABEL[k]);
  const moduleCount = Object.values(config.modules).filter((m) => m?.view).length;
  return `CRUD aktif: [${crudSummary.join(', ') || 'tidak ada'}]; Modul terlihat: ${moduleCount} dari ${Object.keys(config.modules).length}`;
}

import { CurrentUserProfile, OfficialRole, WilayahLevel, BidangName } from '../types';

export interface PredefinedAccountConfig {
  id: string;
  nama: string;
  pangkat: string;
  nrp: string;
  peran: OfficialRole;
  peranLabel: string;
  jenisPeran: 'Sistem' | 'Jabatan tetap' | 'Tim audit' | 'Objek periksa';
  level: WilayahLevel;
  titikWilayahId: string;
  titikWilayahNama: string;
  parentItwilId?: string;
  parentPoldaId?: string;
  sebutanPimpinan: string;
  bidang: BidangName[];
  dapatOverview: 'penuh' | 'tanpa_data' | 'tidak';
  email: string;
  password?: string;
  keteranganAkses: string;
  suratTugasNomor?: string;
  suratTugasObjek?: string;
}

/**
 * 8 Official Roles strictly from Manual Book E-Audit as documented in "Hak Akses Modul Overview"
 */
export const PREDEFINED_ROLES_ACCOUNTS: PredefinedAccountConfig[] = [
  // 1. Pimpinan Tertinggi (L0 - Nasional)
  {
    id: 'user-pimpinan-l0',
    nama: 'Komjen Pol. Ahmad Dofiri, M.Si.',
    pangkat: 'Komjen Pol',
    nrp: '67060341',
    peran: 'pimpinan_tertinggi',
    peranLabel: 'Pimpinan Tertinggi (L0 - Nasional)',
    jenisPeran: 'Jabatan tetap',
    level: 'L0',
    titikWilayahId: 'nasional',
    titikWilayahNama: 'Mabes Polri (Nasional)',
    sebutanPimpinan: 'Kapolri / Irwasum',
    bidang: ['Opsnal', 'SDM', 'Logistik', 'Garkeu'],
    dapatOverview: 'penuh',
    email: 'ahmad.dofiri@polri.go.id',
    keteranganAkses: 'Akses penuh L0 Nasional. Dapat drill-down ke L1 Itwil, L2 Polda, L3 Polres. Memantau seluruh 4 bidang pengawasan.'
  },

  // 2. Pimpinan Tertinggi (L1 - Itwil III)
  {
    id: 'user-pimpinan-l1',
    nama: 'Brigjen Pol. Dr. Sulistyo Pudjo Hartono, S.I.K., M.Si.',
    pangkat: 'Brigjen Pol',
    nrp: '70040512',
    peran: 'pimpinan_tertinggi',
    peranLabel: 'Pimpinan Tertinggi (L1 - Itwil III)',
    jenisPeran: 'Jabatan tetap',
    level: 'L1',
    titikWilayahId: 'itwil-3',
    titikWilayahNama: 'Inspektorat Wilayah III (Itwil III)',
    sebutanPimpinan: 'Irwil III',
    bidang: ['Opsnal', 'SDM', 'Logistik', 'Garkeu'],
    dapatOverview: 'penuh',
    email: 'irwil3.itwasum@polri.go.id',
    keteranganAkses: 'Akses penuh agregat Itwil III. Dapat turun ke L2 (7 Polda binaan) & L3 (Polres binaan). Tidak dapat melihat Nasional (L0) atau Itwil lain.'
  },

  // 3. Pimpinan Tertinggi (L2 - Polda Riau)
  {
    id: 'user-pimpinan-l2',
    nama: 'Kombes Pol. Hermansyah, S.I.K., M.H.',
    pangkat: 'Kombes Pol',
    nrp: '72080315',
    peran: 'pimpinan_tertinggi',
    peranLabel: 'Pimpinan Tertinggi (L2 - Polda Riau)',
    jenisPeran: 'Jabatan tetap',
    level: 'L2',
    titikWilayahId: 'polda-riau',
    titikWilayahNama: 'Polda Riau',
    parentItwilId: 'itwil-1',
    parentPoldaId: 'polda-riau',
    sebutanPimpinan: 'Irwasda Riau',
    bidang: ['Opsnal', 'SDM', 'Logistik', 'Garkeu'],
    dapatOverview: 'penuh',
    email: 'irwasda.riau@polri.go.id',
    keteranganAkses: 'Akses penuh Profil Polda Riau. Dapat turun ke L3 (12 Polres jajaran Riau). Tidak dapat melihat Nasional, Itwil, atau Polda lain (Sumbar, dll).'
  },

  // 4. Koordinator dan Pengendali (L1 - Itwil I)
  {
    id: 'user-koordinator-l1',
    nama: 'Kombes Pol. Bambang Suryo, S.I.K.',
    pangkat: 'Kombes Pol',
    nrp: '73050412',
    peran: 'koordinator_pengendali',
    peranLabel: 'Koordinator & Pengendali (L1 - Itwil I)',
    jenisPeran: 'Jabatan tetap',
    level: 'L1',
    titikWilayahId: 'itwil-1',
    titikWilayahNama: 'Inspektorat Wilayah I (Itwil I)',
    sebutanPimpinan: 'Auditor Utama / Koordinator Mutu',
    bidang: ['Opsnal', 'SDM', 'Logistik', 'Garkeu'],
    dapatOverview: 'penuh',
    email: 'bambang.suryo@polri.go.id',
    keteranganAkses: 'Akses penuh wilayah pembinaan Itwil I (Aceh, Sumut, Sumbar, Riau, Kepri, Jambi). Drill-down L1 -> L2 -> L3. Memantau 4 bidang.'
  },

  // 4b. Koordinator dan Pengendali (L2 - Polda Riau)
  {
    id: 'user-koordinator-l2',
    nama: 'Kombes Pol. Azis Safi\'i, S.I.K.',
    pangkat: 'Kombes Pol',
    nrp: '74020311',
    peran: 'koordinator_pengendali',
    peranLabel: 'Koordinator & Pengendali (L2 - Polda Riau)',
    jenisPeran: 'Jabatan tetap',
    level: 'L2',
    titikWilayahId: 'polda-riau',
    titikWilayahNama: 'Polda Riau',
    parentItwilId: 'itwil-1',
    parentPoldaId: 'polda-riau',
    sebutanPimpinan: 'Irbidwil Itwasda Riau',
    bidang: ['Opsnal', 'SDM', 'Logistik', 'Garkeu'],
    dapatOverview: 'penuh',
    email: 'azis.safii@polri.go.id',
    keteranganAkses: 'Akses penuh agregat Polda Riau & 12 Polres. Drill-down L2 -> L3. Memantau 4 bidang pengawasan kewilayahan Riau.'
  },

  // 5. Super Admin (L0 - Sistem)
  {
    id: 'user-superadmin-l0',
    nama: 'Kompol Agus Triyono, S.Kom., M.T.I.',
    pangkat: 'Kompol',
    nrp: '85070891',
    peran: 'super_admin',
    peranLabel: 'Super Admin (Sistem - L0)',
    jenisPeran: 'Sistem',
    level: 'L0',
    titikWilayahId: 'nasional',
    titikWilayahNama: 'Mabes Polri (Pusat)',
    sebutanPimpinan: 'Admin Sistem Itwasum',
    bidang: [], // Document: "bidang admin sengaja kosong. Tugas admin mengelola akun, bukan baca data pengawasan"
    dapatOverview: 'tanpa_data',
    email: 'agus.triyono@polri.go.id',
    keteranganAkses: 'Dapat Overview tanpa data pengawasan. Mengelola semua user nasional, menyetujui perubahan hak akses, kelola master satker, & log aktivitas semua wilayah.'
  },

  // 6. Admin Polda (L2 - Sistem - Polda Riau)
  {
    id: 'user-adminpolda-l2',
    nama: 'AKP Denny Prasetyo, S.H.',
    pangkat: 'AKP',
    nrp: '88040112',
    peran: 'admin_polda',
    peranLabel: 'Admin Polda (Sistem - L2 Polda Riau)',
    jenisPeran: 'Sistem',
    level: 'L2',
    titikWilayahId: 'polda-riau',
    titikWilayahNama: 'Polda Riau',
    parentItwilId: 'itwil-1',
    parentPoldaId: 'polda-riau',
    sebutanPimpinan: 'Admin Itwasda Riau',
    bidang: [], // Document: bidang kosong
    dapatOverview: 'tanpa_data',
    email: 'admin.itwasda.riau@polri.go.id',
    keteranganAkses: 'Dapat Overview tanpa data pengawasan. Mengelola user wilayah Polda Riau dan Polres jajarannya, usul perubahan hak akses, & lihat log wilayahnya.'
  },

  // 7. Pengawas Tim (Tim Audit E-Audit)
  {
    id: 'user-pengawas-tim',
    nama: 'Kombes Pol. Dedi Supriyadi, S.I.K.',
    pangkat: 'Kombes Pol',
    nrp: '74080129',
    peran: 'pengawas_tim',
    peranLabel: 'Pengawas Tim (Tim Audit)',
    jenisPeran: 'Tim audit',
    level: 'L2',
    titikWilayahId: 'polda-riau',
    titikWilayahNama: 'Polda Riau',
    sebutanPimpinan: 'Pengawas Tim Audit',
    bidang: ['Opsnal', 'Garkeu'],
    dapatOverview: 'tidak',
    email: 'dedi.supriyadi@polri.go.id',
    suratTugasNomor: 'ST/412/VIII/WAS.1.1/2026',
    suratTugasObjek: 'Audit Kinerja Tahap II Polda Riau & Jajaran',
    keteranganAkses: 'Kewenangan berbasis Surat Tugas (ST/412). Hak Overview tidak aktif, dialihkan ke E-Audit untuk supervisi Kertas Kerja (KKA) & pengesahan temuan.'
  },

  // 7b. Ketua Tim (Tim Audit E-Audit)
  {
    id: 'user-ketua-tim',
    nama: 'AKBP Wahyu Kuncoro, S.I.K.',
    pangkat: 'AKBP',
    nrp: '77090432',
    peran: 'ketua_tim',
    peranLabel: 'Ketua Tim (Tim Audit)',
    jenisPeran: 'Tim audit',
    level: 'L2',
    titikWilayahId: 'polda-riau',
    titikWilayahNama: 'Polda Riau',
    sebutanPimpinan: 'Ketua Tim Pemeriksa Wasrik',
    bidang: ['Opsnal', 'SDM', 'Logistik', 'Garkeu'],
    dapatOverview: 'tidak',
    email: 'wahyu.kuncoro@polri.go.id',
    suratTugasNomor: 'ST/412/VIII/WAS.1.1/2026',
    suratTugasObjek: 'Lokus Mapolda Riau, Pekanbaru, Kampar, Dumai, Bengkalis',
    keteranganAkses: 'Kewenangan operasional tim periksa berbasis Surat Tugas (ST/412). Hak Overview dialihkan ke E-Audit untuk koordinasi KKP, uji petik fisik, & Naskah Hasil Audit Sementara (NHAS).'
  },

  // 7c. Auditor (Tim Audit E-Audit)
  {
    id: 'user-auditor',
    nama: 'Kompol Fitri Handayani, S.E., M.M.',
    pangkat: 'Kompol',
    nrp: '82030219',
    peran: 'auditor',
    peranLabel: 'Auditor (Tim Audit)',
    jenisPeran: 'Tim audit',
    level: 'L2',
    titikWilayahId: 'polda-riau',
    titikWilayahNama: 'Polda Riau',
    sebutanPimpinan: 'Auditor Madya Bidang Garkeu',
    bidang: ['Garkeu'],
    dapatOverview: 'tidak',
    email: 'fitri.handayani@polri.go.id',
    suratTugasNomor: 'ST/412/VIII/WAS.1.1/2026',
    suratTugasObjek: 'Pengujian Sub-Bidang Garkeu & PNBP Polda Riau',
    keteranganAkses: 'Kewenangan teknis pengujian bukti dukung & KKP Garkeu ST/412. Hak Overview dialihkan ke E-Audit untuk pengisian lembar temuan pemeriksaan.'
  },

  // 8. Auditee (Objek Periksa - Polres Kampar)
  {
    id: 'user-auditee-l3',
    nama: 'AKBP Ronald Sumaja, S.I.K.',
    pangkat: 'AKBP',
    nrp: '78010419',
    peran: 'auditee',
    peranLabel: 'Auditee (Objek Periksa - L3 Polres Kampar)',
    jenisPeran: 'Objek periksa',
    level: 'L3',
    titikWilayahId: 'polres-kampar',
    titikWilayahNama: 'Polres Kampar (Polda Riau)',
    parentPoldaId: 'polda-riau',
    sebutanPimpinan: 'Kapolres Kampar / Objek Periksa',
    bidang: ['Opsnal', 'SDM', 'Logistik', 'Garkeu'],
    dapatOverview: 'tidak',
    email: 'kapolres.kampar@polri.go.id',
    suratTugasNomor: 'ST/412/VIII/WAS.1.1/2026',
    suratTugasObjek: 'Objek Audit Kinerja Tahap II T.A. 2026',
    keteranganAkses: 'Kewenangan Objek Periksa Satker L3 (Polres Kampar). Hak Overview dialihkan ke Portal E-Audit untuk tindak lanjut rekomendasi, unggah eviden sanggahan, & koordinasi pemeriksa.'
  }
];

/**
 * Creates a complete CurrentUserProfile according to the Table Matrix
 */
export function buildUserProfileFromConfig(cfg: PredefinedAccountConfig): CurrentUserProfile {
  const isPimpinan = cfg.peran === 'pimpinan_tertinggi' || cfg.peran === 'koordinator_pengendali';
  const isSuperAdmin = cfg.peran === 'super_admin';
  const isAdminPolda = cfg.peran === 'admin_polda';

  return {
    ...cfg,
    // Matrix Hak Akses from "5. Tabel Utama":
    canViewKPI: isPimpinan,
    canDrillDown: isPimpinan,
    canViewSatkerDetail: isPimpinan,
    canComparePeriod: isPimpinan,
    canExport: isPimpinan,
    canManageUsers: isSuperAdmin ? 'all' : isAdminPolda ? 'wilayah' : 'none',
    canApproveAccessChange: isSuperAdmin ? 'approve' : isAdminPolda ? 'propose' : 'none',
    canViewActivityLogs: isSuperAdmin ? 'all' : isAdminPolda ? 'wilayah' : 'none',
    canManageMasterSatker: isSuperAdmin
  };
}

/**
 * Default initial active profile (Irwasum Polri / Pimpinan L0)
 */
export const DEFAULT_USER_PROFILE: CurrentUserProfile = buildUserProfileFromConfig(PREDEFINED_ROLES_ACCOUNTS[0]);

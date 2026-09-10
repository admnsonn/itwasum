export type StatusKepatuhan = 'kritis' | 'tinggi' | 'perhatian' | 'aman';

/**
 * Matriks Rentang Nilai Risiko Standar Itwasum Polri:
 * 20 - 25: Sangat Tinggi (Merah)
 * 16 - 19: Tinggi (Jingga)
 * 12 - 15: Sedang (Kuning)
 * 6 - 11:  Rendah (Hijau)
 * 1 - 5:   Sangat Rendah (Biru)
 */
export type StatusRentangRisiko = 
  | 'sangat_tinggi' 
  | 'tinggi' 
  | 'sedang' 
  | 'rendah' 
  | 'sangat_rendah';

export type MainNavId = 'beranda' | 'pengawasan' | 'kinerja' | 'auditor' | 'pengaturan';

export type JenjangPengguna = 
  | 'kapolri' 
  | 'irwasum' 
  | 'itwil-1' 
  | 'itwil-2' 
  | 'itwil-3' 
  | 'itwil-4' 
  | 'itwil-5' 
  | 'auditor';

export type BidangAudit = 'semua' | 'garkeu' | 'opsnal' | 'sarpras' | 'sdm';

export type TingkatObjek = 'semua' | 'wilayah' | 'pusat';

export type MetricLensId = 
  | 'skor-risiko' 
  | 'risiko-atas-selera' 
  | 'penyelesaian-tlhp' 
  | 'beban-kasus' 
  | 'status-pengawasan' 
  | 'kelengkapan-data';

export type TingkatSatker = 
  | 'Mabes' 
  | 'Itwasum' 
  | 'Itwil' 
  | 'Biro-Mabes' 
  | 'Satker-Mabes' 
  | 'Polda' 
  | 'Polrestabes' 
  | 'Polresta' 
  | 'Polres'
  | 'Polsek';

export type SatkerTingkatFilter = 'all' | 'mabes' | 'itwil' | 'polda' | 'polres';

export interface SatkerMapItem {
  id: string;
  nama: string;
  singkatan: string;
  tingkat: TingkatSatker;
  parentPoldaId: string;
  parentPoldaNama: string;
  parentPolresId?: string;
  parentPolresNama?: string;
  pulau: 'Sumatera' | 'Jawa' | 'Kalimantan' | 'Sulawesi' | 'Bali-Nusa' | 'Maluku-Papua';
  ibukota: string; // Kota/Kabupaten/Kecamatan
  lat: number;
  lng: number;
  status: StatusKepatuhan;
  temuanTerbuka: number;
  temuanSelesai: number;
  totalTemuan: number;
  capaianIKU: number;
  targetIKU: number;
  dokumenTerkumpul: number;
  totalDokumen: number;
  auditBerjalan: boolean;
  namaAudit?: string;
  pimpinanNama: string; // Kapolda / Kapolres / Kapolsek
  pimpinanJabatan: string;
  irwasdaOrKasiwas?: string;
  wikiLogoUrl: string;
  wilayahHukum: string;
  motto?: string;
  keteranganKhusus?: string;
  itwilGroup?: string;
  // Metric values for 6 lenses
  skorRisiko?: number;
  persenTLHP?: number;
  bebanKasusCount?: number;
  statusPengawasanLabel?: string;
  kelengkapanDataPct?: number;
}

export interface SatkerMabesItem {
  id: string;
  nama: string;
  singkatan: string;
  kategori: 'Unsur Pimpinan' | 'Unsur Pengawas/Pembantu' | 'Unsur Pelaksana Tugas Pokok' | 'Unsur Pendukung';
  pimpinan: string;
  pimpinanJabatan: string;
  logoUrl: string;
  status: StatusKepatuhan;
  skorRisiko: number;
  temuanTerbuka: number;
  temuanSelesai: number;
  capaianIKU: number;
  serapanAnggaran: number;
  isAuditAktif: boolean;
  bidangPrioritas: 'GARKEU' | 'OPSNAL' | 'SARPRAS' | 'SDM';
  deskripsi: string;
}

export interface SimulationOverride {
  poldaId: string;
  temuanTerbuka?: number;
  capaianIKU?: number;
  persenSerapan?: number;
  rbsScore?: number;
  status?: StatusKepatuhan;
  auditBerjalan?: boolean;
}

export interface PoldaSatker {
  id: string;
  nama: string;
  singkatan: string;
  pulau: 'Sumatera' | 'Jawa' | 'Kalimantan' | 'Sulawesi' | 'Bali-Nusa' | 'Maluku-Papua';
  ibukota: string;
  lat: number; // Geo Latitude (WGS84)
  lng: number; // Geo Longitude (WGS84)
  x: number; // Map percentage coordinate (fallback)
  y: number; // Map percentage coordinate (fallback)
  status: StatusKepatuhan;
  temuanTerbuka: number;
  temuanSelesai: number;
  totalTemuan: number;
  capaianIKU: number;
  targetIKU: number;
  statusIKU: string;
  dokumenTerkumpul: number;
  totalDokumen: number;
  auditBerjalan: boolean;
  namaAudit?: string;
  tenggatAudit?: string;
  auditorKetua?: string;
  timAuditorCount?: number;
  perhatianKhusus?: string;
  kapolda: string;
  irwasda: string;
  rincianTemuan: {
    id: string;
    kode: string;
    judul: string;
    kategori: 'Keuangan' | 'Operasional' | 'SDM' | 'Logistik & Sarpras';
    sumber: 'Audit Polri' | 'BPK RI' | 'Irsus';
    tingkat: 'Kritis' | 'Sedang' | 'Ringan';
    status: 'Belum Ditindaklanjuti' | 'Dalam Proses' | 'Selesai';
    nilaiRupiah?: string;
    tenggat: string;
    rekomendasi: string;
  }[];
  analisisLanjutan: {
    aiInsight: string;
    gapAnalysis: string[];
    rekomendasiStrategis: string[];
    rbsScore: number;
    rbsLevel: 'Rendah' | 'Sedang' | 'Tinggi';
    prediksiKepatuhan: string;
  };
  eProfil: {
    totalPolres: number;
    sdmTotal: number;
    sdmPerwira: number;
    sdmBintara: number;
    sdmPns: number;
    sarprasKendaraanR2: number;
    sarprasKendaraanR4: number;
    sarprasSenpi: number;
    garkeuDipa: string;
    garkeuRealisasi: string;
    persenSerapan: number;
  };
}

export interface PerluPerhatianItem {
  id: string;
  poldaId: string;
  namaPolda: string;
  pesanManusiawi: string;
  tingkat: 'kritis' | 'perhatian' | 'tinggi';
  kategori: 'Dokumen' | 'Temuan' | 'Tenggat' | 'IKU' | 'Prestasi';
  tenggatWaktu: string;
  aksiLabel: string;
}

export interface AuditorData {
  id: string;
  nama: string;
  pangkat: string;
  nrp: string;
  jabatan: string;
  subdit: string;
  sertifikasi: string[];
  bebanAktif: number; // e.g. 2 penugasan
  kapasitasMaksimal: number; // e.g. 4
  status: 'Tersedia' | 'Sedang Tugas' | 'Cuti';
  satkerTugasAktif?: string;
  totalAuditSelesai: number;
  ratingKinerja: number;
}

export type OfficialRole = 
  | 'super_admin'              // Super Admin (Sistem) - L0
  | 'admin_polda'              // Admin Polda (Sistem) - L2
  | 'pimpinan_tertinggi'       // Pimpinan Tertinggi (Jabatan tetap) - L0, L1, L2
  | 'koordinator_pengendali'   // Koordinator dan Pengendali (Jabatan tetap) - L1, L2
  | 'pengawas_tim'             // Pengawas Tim (Tim audit) - Tidak dapat overview
  | 'ketua_tim'                // Ketua Tim (Tim audit) - Tidak dapat overview
  | 'auditor'                  // Auditor (Tim audit) - Tidak dapat overview
  | 'auditee';                 // Auditee (Objek periksa) - Tidak dapat overview

export type WilayahLevel = 'L0' | 'L1' | 'L2' | 'L3';

export type BidangName = 'Opsnal' | 'SDM' | 'Logistik' | 'Garkeu';

export type JenisSatker = 'kewilayahan' | 'mabes';

export interface CurrentUserProfile {
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
  sebutanPimpinan: string; // e.g. "Kapolri / Irwasum", "Irwil III", "Irwasda Riau", "Kapolres"
  bidang: BidangName[]; // Bidang yang dihaki user: empty for admins!
  dapatOverview: 'penuh' | 'tanpa_data' | 'tidak';
  email: string;
  avatarUrl?: string;
  suratTugasNomor?: string; // For Tim Audit
  suratTugasObjek?: string;
  // Matrix Hak Akses:
  canViewKPI: boolean;
  canDrillDown: boolean;
  canViewSatkerDetail: boolean;
  canComparePeriod: boolean;
  canExport: boolean;
  canManageUsers: 'none' | 'all' | 'wilayah';
  canApproveAccessChange: 'none' | 'approve' | 'propose';
  canViewActivityLogs: 'none' | 'all' | 'wilayah';
  canManageMasterSatker: boolean;
  canViewAiSummary: boolean;
  canUseDataLLM: boolean;
  canExportAiSummary: boolean;
  canViewLLMLogs: boolean;
  canManageItwilMaster: boolean;
}

export type AuditLogKejadian = 
  | 'Buka Overview'
  | 'Drill-down'
  | 'Ekspor'
  | 'Akses ditolak'
  | 'Ubah hak akses user'
  | 'Ubah master penugasan Itwil'
  | 'Buka/Perbarui Ringkasan AI'
  | 'Pertanyaan ke LLM'
  | 'Pertanyaan ditolak LLM';

export interface AuditLogEntry {
  id: string;
  waktu: string; // Timestamp
  kejadian: AuditLogKejadian;
  user: string;
  peran: string;
  titikWilayah: string;
  detail: {
    dariSimpul?: string;
    keSimpul?: string;
    wilayah?: string;
    bidang?: string;
    periode?: string;
    format?: string;
    yangDiminta?: string;
    alasanDitolak?: string;
    nilaiLama?: string;
    nilaiBaru?: string;
    siapaMenyetujui?: string;
  };
}

export interface UserAccount {
  id: string;
  nama: string;
  pangkatNrp: string;
  role: OfficialRole | 'Irwasum / Pimpinan' | 'Auditor Utama' | 'Auditor Madya' | 'Admin Satker' | 'Super Admin';
  peranKategori?: string;
  levelWilayah?: WilayahLevel;
  satker: string;
  poldaId?: string;
  bidang?: BidangName[];
  email: string;
  status: 'Aktif' | 'Non-Aktif';
  loginTerakhir: string;
}

export interface MasterDataItem {
  id: string;
  kode: string;
  nama: string;
  kategori: string;
  keterangan: string;
  jumlahDokumen?: number;
  status: 'Aktif' | 'Draft';
  updateTerakhir: string;
}

export interface UsulanHakAkses {
  id: string;
  pengusulNama: string;
  pengusulPeran: string;
  pengusulSatker: string;
  targetUserNama: string;
  targetUserNrp: string;
  jenisUsulan: 'Ubah Wilayah' | 'Ubah Bidang' | 'Mutasi Jabatan' | 'Aktivasi Akun';
  nilaiLama: string;
  nilaiBaru: string;
  alasanDinas: string;
  tanggalUsulan: string;
  status: 'Menunggu Persetujuan' | 'Disetujui' | 'Ditolak';
  disetujuiOleh?: string;
  tanggalPersetujuan?: string;
  catatanPersetujuan?: string;
}

export interface KPIMetricDefinition {
  id: string;
  kode: string;
  label: string;
  modulAsal: string; // e.g. "Modul 17: Maturitas SPIP & Risiko"
  modulNomor: number;
  bidang: BidangName | 'Lintas';
  deskripsi: string;
  tersediaDiL3: boolean; // false if marked with '?' in doc
  statusSumberL3: 'Tersedia' | 'Menunggu Integrasi Data Mart Sumber' | 'Perlu Konfirmasi Sistem Sumber';
  satuan: string;
  formatNilai: (raw: any) => string;
}


import { UsulanHakAkses, KPIMetricDefinition, CurrentUserProfile } from '../types';
import { logUbahHakAkses } from '../utils/auditLogger';

const USULAN_STORAGE_KEY = 'satudata_itwasum_usulan_hak_akses';

export const INITIAL_USULAN_LIST: UsulanHakAkses[] = [
  {
    id: 'usulan-1',
    pengusulNama: 'AKP Denny Prasetyo, S.H.',
    pengusulPeran: 'Admin Polda (L2)',
    pengusulSatker: 'Itwasda Polda Riau',
    targetUserNama: 'AKBP Ronald Sumaja, S.I.K.',
    targetUserNrp: '78010419',
    jenisUsulan: 'Ubah Bidang',
    nilaiLama: 'Bidang: Opsnal, SDM, Logistik, Garkeu',
    nilaiBaru: 'Bidang: Garkeu & Logistik (Fokus Wasrik BMN/DIPA)',
    alasanDinas: 'Penugasan fokus tindak lanjut wasrik khusus serapan anggaran dan penertiban aset hibah tanah jajaran Polres Kampar.',
    tanggalUsulan: '06 Sep 2026, 11:20 WIB',
    status: 'Menunggu Persetujuan'
  },
  {
    id: 'usulan-2',
    pengusulNama: 'AKP Denny Prasetyo, S.H.',
    pengusulPeran: 'Admin Polda (L2)',
    pengusulSatker: 'Itwasda Polda Riau',
    targetUserNama: 'Kompol Fitri Handayani, S.E., M.M.',
    targetUserNrp: '82030219',
    jenisUsulan: 'Ubah Wilayah',
    nilaiLama: 'Wilayah: L3 Polres Dumai',
    nilaiBaru: 'Wilayah: L2 Polda Riau (Tim Audit Wasrik ST/412)',
    alasanDinas: 'Mutasi penugasan auditor pengawasan intern ke tingkat Satker Mapolda Riau sesuai Sprint Kapolda.',
    tanggalUsulan: '05 Sep 2026, 15:40 WIB',
    status: 'Disetujui',
    disetujuiOleh: 'Kompol Agus Triyono, S.Kom. (Super Admin Mabes)',
    tanggalPersetujuan: '05 Sep 2026, 16:15 WIB',
    catatanPersetujuan: 'Disetujui sesuai lampiran Sprint Kapolda Riau No. Sprin/812/IX/2026.'
  }
];

export function getUsulanList(): UsulanHakAkses[] {
  try {
    const raw = localStorage.getItem(USULAN_STORAGE_KEY);
    if (!raw) {
      localStorage.setItem(USULAN_STORAGE_KEY, JSON.stringify(INITIAL_USULAN_LIST));
      return INITIAL_USULAN_LIST;
    }
    return JSON.parse(raw);
  } catch (e) {
    return INITIAL_USULAN_LIST;
  }
}

export function saveUsulanList(list: UsulanHakAkses[]) {
  try {
    localStorage.setItem(USULAN_STORAGE_KEY, JSON.stringify(list));
  } catch (e) {
    console.warn('Gagal menyimpan usulan hak akses', e);
  }
}

export function ajukanUsulanBaru(usulan: Omit<UsulanHakAkses, 'id' | 'tanggalUsulan' | 'status'>): UsulanHakAkses {
  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  };
  const baru: UsulanHakAkses = {
    id: `usulan-${Date.now()}`,
    tanggalUsulan: `${now.toLocaleDateString('id-ID', options)} WIB`,
    status: 'Menunggu Persetujuan',
    ...usulan
  };

  const existing = getUsulanList();
  const updated = [baru, ...existing];
  saveUsulanList(updated);
  return baru;
}

export function setujuiUsulan(usulanId: string, superAdminUser: CurrentUserProfile, catatan?: string): UsulanHakAkses | null {
  const list = getUsulanList();
  const index = list.findIndex(u => u.id === usulanId);
  if (index === -1) return null;

  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  };

  const target = list[index];
  target.status = 'Disetujui';
  target.disetujuiOleh = `${superAdminUser.nama} (Super Admin Mabes)`;
  target.tanggalPersetujuan = `${now.toLocaleDateString('id-ID', options)} WIB`;
  target.catatanPersetujuan = catatan || 'Disetujui oleh Super Admin sesuai ketentuan RBAC E-Audit.';

  saveUsulanList(list);

  // Log to audit log
  logUbahHakAkses(
    superAdminUser,
    `${target.targetUserNama} (${target.targetUserNrp})`,
    target.nilaiLama,
    target.nilaiBaru,
    superAdminUser.nama
  );

  return target;
}

export function tolakUsulan(usulanId: string, superAdminUser: CurrentUserProfile, alasanPenolakan: string): UsulanHakAkses | null {
  const list = getUsulanList();
  const index = list.findIndex(u => u.id === usulanId);
  if (index === -1) return null;

  const now = new Date();
  const options: Intl.DateTimeFormatOptions = {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
    timeZone: 'Asia/Jakarta'
  };

  const target = list[index];
  target.status = 'Ditolak';
  target.disetujuiOleh = `${superAdminUser.nama} (Super Admin Mabes)`;
  target.tanggalPersetujuan = `${now.toLocaleDateString('id-ID', options)} WIB`;
  target.catatanPersetujuan = `Ditolak: ${alasanPenolakan}`;

  saveUsulanList(list);
  return target;
}

/**
 * 6 Metrik Utama Pilihan Penyedia (sesuai Dokumen Hal 6)
 * Dokumen Hal 6: "Ini murni pilihan penyedia. Tidak ada satu pun sumber yang menyebut keenam angka ini.
 * Jangan dikoding sebagai final, pakai sebagai bahan pertanyaan ke pimpinan."
 */
export const DEFAULT_PROVIDER_KPI_METRICS: KPIMetricDefinition[] = [
  {
    id: 'kpi-srk',
    kode: 'SRK',
    label: 'Skor Risiko Komposit',
    modulAsal: 'Modul 17: Maturitas SPIP & Risiko',
    modulNomor: 17,
    bidang: 'Lintas',
    deskripsi: 'Indeks komposit profil maturitas pengendalian intern & eksposur risiko satker (skala 0–100).',
    tersediaDiL3: false, // marked with '?' in doc
    statusSumberL3: 'Menunggu Integrasi Data Mart Sumber',
    satuan: 'Poin',
    formatNilai: (val) => typeof val === 'number' ? val.toFixed(1) : `${val}`
  },
  {
    id: 'kpi-tlhp',
    kode: 'TLHP',
    label: 'Temuan Belum Ditindaklanjuti',
    modulAsal: 'Modul 16: Rekomendasi & TLHP',
    modulNomor: 16,
    bidang: 'Lintas', // 4 bidang
    deskripsi: 'Jumlah rekomendasi temuan audit operasional, SDM, logistik, dan garkeu yang masih terbuka.',
    tersediaDiL3: true,
    statusSumberL3: 'Tersedia',
    satuan: 'Temuan',
    formatNilai: (val) => `${val}`
  },
  {
    id: 'kpi-bpk',
    kode: 'BPK',
    label: 'Temuan BPK Belum Selesai',
    modulAsal: 'Modul 2: Temuan BPK RI & Kerugian',
    modulNomor: 2,
    bidang: 'Garkeu',
    deskripsi: 'Sisa temuan pemeriksaan eksternal BPK RI beserta estimasi nilai kerugian keuangan negara.',
    tersediaDiL3: true,
    statusSumberL3: 'Tersedia',
    satuan: 'Kasus',
    formatNilai: (val) => `${val}`
  },
  {
    id: 'kpi-irsus',
    kode: 'IRSUS',
    label: 'Temuan IRSUS Lewat SLA',
    modulAsal: 'Modul 3: Pemeriksaan Khusus (IRSUS)',
    modulNomor: 3,
    bidang: 'Lintas',
    deskripsi: 'Kasus pemeriksaan khusus yang melampaui Service Level Agreement (60 hari kalender).',
    tersediaDiL3: true,
    statusSumberL3: 'Tersedia',
    satuan: 'Berkas',
    formatNilai: (val) => `${val}`
  },
  {
    id: 'kpi-iku',
    kode: 'IKU',
    label: 'Capaian Rata-Rata IKU',
    modulAsal: 'Modul 7: IKU Satker Presisi',
    modulNomor: 7,
    bidang: 'Lintas',
    deskripsi: 'Persentase pencapaian indikator kinerja utama satker terhadap target tahun anggaran 2026.',
    tersediaDiL3: false, // marked with '?' in doc
    statusSumberL3: 'Menunggu Integrasi Data Mart Sumber',
    satuan: '%',
    formatNilai: (val) => typeof val === 'number' ? `${val.toFixed(1)}%` : `${val}%`
  },
  {
    id: 'kpi-ssot',
    kode: 'SSOT',
    label: 'Kelengkapan Data SSOT',
    modulAsal: 'Internal: Single Source of Truth',
    modulNomor: 5,
    bidang: 'Lintas',
    deskripsi: 'Persentase kepatuhan pemenuhan 5 domain data wajib pengawasan (DIPA, Renja, KKP, Dumas, BMN).',
    tersediaDiL3: true,
    statusSumberL3: 'Tersedia',
    satuan: '%',
    formatNilai: (val) => typeof val === 'number' ? `${val.toFixed(1)}%` : `${val}%`
  }
];

/**
 * 6 Hal yang Belum Terdefinisi pada Dokumen & Penerapan Solutif pada UI
 */
export interface DokumenUndefinedItem {
  id: string;
  nomor: number;
  judul: string;
  referensiDokumen: string;
  kondisiDokumen: string;
  tandaDokumen: string; // e.g. "❤️", "?", "Bukan aturan resmi"
  analisisKebutuhan: string;
  penerapanPadaUI: string;
  pertanyaanUntukPimpinan: string;
}

export const DOKUMEN_UNDEFINED_ITEMS: DokumenUndefinedItem[] = [
  {
    id: 'undef-1',
    nomor: 1,
    judul: 'Status Ketersediaan Data di Level L3 (Polres)',
    referensiDokumen: 'Halaman 8 & 9, Bagian 6 (Ketersediaan Data per Level)',
    kondisiDokumen: 'Indikator Skor Risiko Komposit (SRK), Risiko di Atas Selera, IKU Satker, dan Anggaran/IKPA pada level Polres ditandai dengan tanda tanya (?). Dokumen mencatat: "Kolom yang ditandai ? bisa jadi bukan karena datanya tidak ada, tapi karena belum terkumpul. Wajib dicek ke sistem sumber sebelum dipakai."',
    tandaDokumen: 'Tanda Tanya (?) & Hati Merah (❤️)',
    analisisKebutuhan: 'Perlu kejelasan apakah Polres memiliki modul SPIP & IKU mandiri atau hanya agregat dari Polda, dan bagaimana tampilan UI saat data belum terhubung.',
    penerapanPadaUI: 'Menyediakan indikator status konektivitas sumber data di L3 (Terhubung vs Menunggu Integrasi Modul Sumber), serta Switcher Simulasi: [Mode Dokumen Minimal: Kasus, Selra, Temuan] vs [Mode Integrasi Penuh L3].',
    pertanyaanUntukPimpinan: 'Apakah seluruh Polres (514 jajaran) akan diwajibkan menginput SPIP mandiri pada Modul 17, ataukah SRK Polres dihitung otomatis dari agregasi data kasus dan temuan wasrik Polda?'
  },
  {
    id: 'undef-2',
    nomor: 2,
    judul: 'Baris KPI 6 Angka adalah Murni Rekomendasi Penyedia',
    referensiDokumen: 'Halaman 6, Bagian 3 (Baris KPI 6 Angka)',
    kondisiDokumen: 'Dokumen secara eksplisit menyatakan: "Ini murni pilihan penyedia. Tidak ada satu pun sumber yang menyebut keenam angka ini. Jangan dikoding sebagai final, pakai sebagai bahan pertanyaan ke pimpinan."',
    tandaDokumen: 'Hati Merah (❤️) & Catatan Eksplisit',
    analisisKebutuhan: 'Enam angka utama (SRK, TLHP, BPK, IRSUS, IKU, SSOT) belum disahkan sebagai keputusan tetap Irwasum. Perlu fleksibilitas bagi pimpinan untuk mengonfigurasi metrik prioritas.',
    penerapanPadaUI: 'Menyematkan badge "Rekomendasi Penyedia (Konfirmasi Pimpinan)" dan menyediakan modal interaktif "Konfigurasi Metrik KPI Pimpinan" yang memungkinkan pimpinan memilih metrik dari 17 modul sumber.',
    pertanyaanUntukPimpinan: 'Apakah 6 metrik utama ini sudah merefleksikan prioritas Komando Itwasum Polri T.A. 2026, atau pimpinan menghendaki metrik lain seperti Realisasi DIPA atau Dumas Presisi?'
  },
  {
    id: 'undef-3',
    nomor: 3,
    judul: 'Rumus Skor Risiko Komposit (SRK) untuk Satker Mabes',
    referensiDokumen: 'Halaman 9, Bagian 7 (Dua Jenis Satker di L2)',
    kondisiDokumen: 'Dokumen menyatakan: "Satker Mabes: tindak pidana, selra, laka lantas tidak berlaku. Skor Risiko Komposit: rumusnya beda... Korlantas tidak punya penyelesaian perkara per wilayah... jangan diadu dalam satu daftar."',
    tandaDokumen: 'Tanda Peringatan (⚠️) & Hati Kuning (💛)',
    analisisKebutuhan: 'Dokumen belum merumuskan secara matematis formula SRK Satker Mabes dan bobot masing-masing parameternya.',
    penerapanPadaUI: 'Memisahkan Tab "Polda Kewilayahan" dan "Satker Mabes Polri" di tabel peringkat dan peta. Menerapkan formula SRK khusus Mabes berbasis: Maturitas SPIP (35%), Temuan BPK/IRSUS (35%), Serapan Anggaran (20%), dan Logistik/BMN (10%), mengecualikan tindak pidana kewilayahan.',
    pertanyaanUntukPimpinan: 'Berapa bobot persentase resmi yang ditetapkan Itwasum untuk menghitung profil risiko Satker Mabes (Bareskrim, Korlantas, Lemdiklat) yang tidak memiliki yurisdiksi perkara kewilayahan?'
  },
  {
    id: 'undef-4',
    nomor: 4,
    judul: 'Pengelompokan Indikator ke 4 Bidang Bukan Aturan Resmi',
    referensiDokumen: 'Halaman 7 & 8, Bagian 5 (Pemetaan Indikator ke Bidang)',
    kondisiDokumen: 'Dokumen mencatat: "Pengelompokan di bawah ini bukan aturan resmi. Tag bidang cuma menempel di data temuan audit. Risiko, kasus, selra, IKU, dan anggaran tidak punya tag bidang sama sekali."',
    tandaDokumen: 'Hati Merah (❤️) & Hati Hijau (💚)',
    analisisKebutuhan: 'Pengelompokan Opsnal (pidana, laka, dumas), SDM (personel), Logistik (SAKTI, BMN), Garkeu (anggaran, IKPA), dan Lintas (SRK, IKU) masih berupa konsensus sementara.',
    penerapanPadaUI: 'Memberikan visual tag eksplisit [OPSNAL], [SDM], [LOGISTIK], [GARKEU], dan [LINTAS] pada setiap kartu metrik, serta menerapkan aturan hilang dari layar jika bidang tidak dihaki user secara mulus.',
    pertanyaanUntukPimpinan: 'Apakah pemetaan indikator non-audit (seperti Laka Lantas ke Opsnal dan SAKTI ke Logistik) sudah disetujui para penanggung jawab bidang teknis (Irwil & Irbid)?'
  },
  {
    id: 'undef-5',
    nomor: 5,
    judul: 'Alur & Format Usulan Perubahan Hak Akses (Admin Polda -> Super Admin)',
    referensiDokumen: 'Halaman 3, Bagian 5 (Tabel Utama)',
    kondisiDokumen: 'Tabel menyebut: "Setujui ubah hak akses: Super Admin: setujui; Admin Polda: usul saja." Namun dokumen belum mendefinisikan form usulan, syarat berkas dinas, status approval, dan notifikasi persetujuan.',
    tandaDokumen: 'Tabel Utama Baris 8',
    analisisKebutuhan: 'Perlu mekanisme digital formal agar Admin Polda dapat mengajukan mutasi personel jajaran secara terstruktur dan Super Admin dapat memverifikasi dengan log audit otomatis.',
    penerapanPadaUI: 'Membangun panel "Alur Usulan Hak Akses" di mana Admin Polda dapat menginput usulan (target user, perubahan bidang/wilayah, nomor surat dinas), dan Super Admin memiliki antarmuka approval 1-klik yang mencatat log audit resmi.',
    pertanyaanUntukPimpinan: 'Apakah usulan hak akses dari Admin Polda memerlukan verifikasi Irwasda terlebih dahulu sebelum diajukan ke Super Admin Mabes Polri?'
  },
  {
    id: 'undef-6',
    nomor: 6,
    judul: 'Mekanisme Penanganan & Notifikasi Kejadian "Akses Ditolak"',
    referensiDokumen: 'Halaman 5, Bagian 8 (Yang Dicatat di Log)',
    kondisiDokumen: 'Dokumen menekankan: "Baris keempat paling sering lupa dipasang. Padahal percobaan yang gagal lebih penting buat keamanan daripada akses yang berhasil: Akses ditolak (user, yang diminta, alasan ditolak)." Namun belum ada batasan UI jika user mencoba melihat ke samping atau ke atas.',
    tandaDokumen: 'Hati Hijau (💚) & Baris Paling Kritis',
    analisisKebutuhan: 'Harus ada guard aktif yang mencegat jika pengguna (misalnya User L2 Polda Riau) mencoba memanipulasi link untuk membuka L0 Nasional atau Polda Sumbar (melihat ke samping/ke atas).',
    penerapanPadaUI: 'Menerapkan Security Guard 3 Poros: Setiap kali terdeteksi aksi di luar hierarki, sistem memblokir, memunculkan Security Alert Modal, dan otomatis mencatat ke Audit Log dengan status "Akses ditolak". Serta menyediakan widget "Security Audit Alert" bagi Admin.',
    pertanyaanUntukPimpinan: 'Apakah insiden percobaan akses tidak sah (akses ditolak) perlu memicu notifikasi instan (SMS/Telegram presisi) ke ponsel dinas Super Admin atau Tim Cyber Itwasum?'
  }
];

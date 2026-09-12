/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mock data deterministik B.4 Surat Usulan, B.5 E-Office, dan B.10 Log Aktivitas
 * (Plan bagian 3 & 4).
 */
import { createSeededRng } from '../../../utils/seededRandom';
import { AUDITOR_LIST } from '../../mockData';
import { EOFFICE_KECEPATAN, EOFFICE_KERAHASIAAN, type EOfficeKerahasiaan, LOG_ANOMALI_AMBANG_PERSEN } from './constants';

/* ============================== B.4 Surat Usulan ============================== */

export type SuratUsulanJenis = 'Mutasi Personel' | 'Perubahan Hak Akses' | 'Penugasan Khusus';
export type SuratUsulanStatus = 'Draf' | 'Menunggu Review' | 'Direvisi' | 'Disahkan' | 'Ditarik Pemohon' | 'Dibatalkan Setelah Pengesahan';

export interface SuratUsulanEntry {
  id: string;
  nomorUsulan: string;
  jenis: SuratUsulanJenis;
  pemohon: string;
  satkerPemohon: string;
  perihal: string;
  tanggalPengajuan: string;
  status: SuratUsulanStatus;
  tahapReview: number; // 1..3
  totalTahapReview: number;
  slaHariTersisa: number;
  reviewerAktif?: string;
  sedangDikunci?: { oleh: string; sisaMenit: number };
  riwayat: { tahap: string; aktor: string; tanggal: string; catatan: string }[];
}

const JENIS_USULAN: SuratUsulanJenis[] = ['Mutasi Personel', 'Perubahan Hak Akses', 'Penugasan Khusus'];
const STATUS_USULAN: SuratUsulanStatus[] = ['Draf', 'Menunggu Review', 'Direvisi', 'Disahkan', 'Ditarik Pemohon', 'Dibatalkan Setelah Pengesahan'];

export const SURAT_USULAN_DATA: SuratUsulanEntry[] = Array.from({ length: 16 }, (_, i) => {
  const rng = createSeededRng(`b4-usulan-${i}`);
  const status = STATUS_USULAN[rng.int(0, STATUS_USULAN.length)];
  const tahapReview = status === 'Disahkan' || status === 'Dibatalkan Setelah Pengesahan' ? 3 : rng.int(1, 3);
  return {
    id: `usulan-b4-${i}`,
    nomorUsulan: `USUL/${100 + i}/VIII/WAS.1.1/2026`,
    jenis: JENIS_USULAN[rng.int(0, JENIS_USULAN.length)],
    pemohon: rng.pick(AUDITOR_LIST).nama,
    satkerPemohon: rng.pick(['Itwasda Polda Riau', 'Itwasda Polda Jabar', 'Itbidjemen SDM Itwasum Polri', 'Itbidjemen Garkeu Itwasum Polri']),
    perihal: rng.pick([
      'Usulan mutasi personel auditor bidang Garkeu',
      'Usulan perubahan hak akses modul E-Profile satker',
      'Usulan penugasan khusus tim asistensi darurat',
      'Usulan penambahan bidang audit untuk auditor madya',
    ]),
    tanggalPengajuan: `${rng.int(1, 28)} Agu 2026`,
    status,
    tahapReview,
    totalTahapReview: 3,
    slaHariTersisa: status === 'Disahkan' || status === 'Ditarik Pemohon' || status === 'Dibatalkan Setelah Pengesahan' ? 0 : rng.int(-2, 3),
    reviewerAktif: status === 'Menunggu Review' ? rng.pick(['Kombes Pol. Dedi Supriyadi', 'AKBP Wahyu Kuncoro']) : undefined,
    sedangDikunci: status === 'Menunggu Review' && rng.bool(0.2) ? { oleh: rng.pick(['Kombes Pol. Dedi Supriyadi', 'AKBP Wahyu Kuncoro']), sisaMenit: rng.int(2, 15) } : undefined,
    riwayat: [
      { tahap: 'Pengajuan', aktor: rng.pick(AUDITOR_LIST).nama, tanggal: `${rng.int(1, 28)} Agu 2026`, catatan: 'Usulan diajukan lengkap dengan lampiran dinas.' },
    ],
  };
});

/* ============================== B.5 E-Office ============================== */

export type EOfficeArah = 'Masuk' | 'Keluar';
export type EOfficeStatus = 'Draf' | 'Menunggu Disposisi' | 'Didisposisikan' | 'Selesai' | 'Diarsipkan';

export interface EOfficeEntry {
  id: string;
  nomorNaskah: string;
  arah: EOfficeArah;
  perihal: string;
  pengirim: string;
  tujuan: string;
  tanggal: string;
  kecepatan: (typeof EOFFICE_KECEPATAN)[number]['label'];
  slaHari: number;
  kerahasiaan: EOfficeKerahasiaan;
  status: EOfficeStatus;
  disposisi: { tujuan: string; instruksi: string; tanggal: string }[];
  tembusan: string[];
}

export const EOFFICE_DATA: EOfficeEntry[] = Array.from({ length: 20 }, (_, i) => {
  const rng = createSeededRng(`b5-naskah-${i}`);
  const kecepatan = rng.pick(EOFFICE_KECEPATAN);
  const kerahasiaan = rng.pick(EOFFICE_KERAHASIAAN);
  const arah: EOfficeArah = rng.bool(0.55) ? 'Masuk' : 'Keluar';
  const status = rng.pick<EOfficeStatus>(['Draf', 'Menunggu Disposisi', 'Didisposisikan', 'Selesai', 'Diarsipkan']);
  return {
    id: `naskah-${i}`,
    nomorNaskah: `${arah === 'Masuk' ? 'ND' : 'SR'}/${200 + i}/VIII/2026/Itwasum`,
    arah,
    perihal: rng.pick([
      'Permintaan Data Dukung Audit Kinerja Tahap II',
      'Laporan Hasil Pemeriksaan Khusus Satker',
      'Undangan Rapat Koordinasi Evaluasi SPIP',
      'Penyampaian Hasil Tindak Lanjut Temuan BPK',
      'Permohonan Perpanjangan Waktu Penyampaian Dokumen',
    ]),
    pengirim: arah === 'Masuk' ? rng.pick(['Polda Riau', 'Polda Jawa Barat', 'Polda Sumatera Utara', 'Sekretariat BPK RI']) : 'Itwasum Polri',
    tujuan: arah === 'Masuk' ? 'Itwasum Polri' : rng.pick(['Polda Riau', 'Polda Jawa Barat', 'Polda Metro Jaya', 'Kapolri']),
    tanggal: `${rng.int(1, 28)} Agu 2026`,
    kecepatan: kecepatan.label,
    slaHari: kecepatan.slaHari,
    kerahasiaan,
    status,
    disposisi: status === 'Didisposisikan' || status === 'Selesai' ? [
      { tujuan: rng.pick(['Irwil I', 'Irwil III', 'Kabag Renmin']), instruksi: 'Mohon ditindaklanjuti dan dilaporkan hasilnya.', tanggal: `${rng.int(1, 28)} Agu 2026` },
    ] : [],
    tembusan: rng.sample(['Kapolri', 'Wakapolri', 'Irwasum', 'Kasetum Polri'], rng.int(0, 3)),
  };
});

/* ============================== B.10 Log Aktivitas — volume & anomali ============================== */

export interface LogVolumeDay { tanggal: string; jumlah: number }

export const LOG_VOLUME_30_HARI: LogVolumeDay[] = Array.from({ length: 30 }, (_, i) => {
  const rng = createSeededRng(`b10-volume-${i}`);
  const baseline = 40 + rng.int(-8, 12);
  const isAnomali = i === 24; // 1 hari lonjakan anomali untuk demo alert
  return {
    tanggal: `${i + 1} Agu 2026`,
    jumlah: isAnomali ? Math.round(baseline * 3.4) : baseline,
  };
});

export function detectVolumeAnomalies(days: LogVolumeDay[] = LOG_VOLUME_30_HARI) {
  const avg = days.reduce((a, b) => a + b.jumlah, 0) / days.length;
  return days
    .map((d) => ({ ...d, kenaikanPersen: Math.round(((d.jumlah - avg) / avg) * 100) }))
    .filter((d) => d.kenaikanPersen >= LOG_ANOMALI_AMBANG_PERSEN);
}

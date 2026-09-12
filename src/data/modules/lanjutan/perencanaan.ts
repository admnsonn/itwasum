/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mock data deterministik B.12 Audit Universe & B.13 PKPT Berbasis Risiko (Plan bagian 3 & 4).
 */
import { createSeededRng } from '../../../utils/seededRandom';
import { POLDA_DATA } from '../../mockData';
import { PKPT_RISK_FACTORS, PKPT_JENIS_KEGIATAN, type PkptJenisKegiatan } from './constants';

export type AuditiKelengkapanStatus = 'Lengkap' | 'Sebagian' | 'Placeholder' | 'Perlu Pembaruan' | 'Nonaktif';

export interface AuditiEntry {
  id: string;
  poldaId: string;
  nama: string;
  tingkat: 'Satker Mabes' | 'Polda' | 'Polres' | 'Polsek';
  tusi: string;
  strukturOrganisasi: string;
  anggaranTahunBerjalan: string;
  statusKelengkapan: AuditiKelengkapanStatus;
  persenKelengkapan: number;
  tahunTerakhirDiaudit: number;
  lamaBelumDiauditTahun: number;
  skorRisikoInheren: number;
}

const TUSI_SAMPLES = [
  'Penegakan hukum, pembinaan Kamtibmas, dan pelayanan masyarakat di wilayah hukum.',
  'Dukungan operasional, administrasi, dan logistik satuan kerja.',
  'Pembinaan fungsi teknis dan pengawasan internal jajaran.',
  'Pelaksanaan tugas pokok kepolisian bidang lalu lintas dan pengamanan objek vital.',
];

function buildAuditiForPolda(poldaId: string, poldaNama: string, index: number): AuditiEntry[] {
  const rng = createSeededRng(`b12-auditi-${poldaId}`);
  const entries: AuditiEntry[] = [
    {
      id: `auditi-${poldaId}`,
      poldaId,
      nama: poldaNama,
      tingkat: 'Polda',
      tusi: rng.pick(TUSI_SAMPLES),
      strukturOrganisasi: `${rng.int(18, 26)} Direktorat/Biro, ${rng.int(6, 14)} Polres jajaran`,
      anggaranTahunBerjalan: `Rp ${rng.round(0.6, 4.5, 2)} Triliun`,
      statusKelengkapan: rng.pick(['Lengkap', 'Lengkap', 'Sebagian', 'Perlu Pembaruan'] as AuditiKelengkapanStatus[]),
      persenKelengkapan: rng.int(55, 100),
      tahunTerakhirDiaudit: rng.pick([2023, 2024, 2025]),
      lamaBelumDiauditTahun: rng.int(0, 4),
      skorRisikoInheren: rng.round(1.5, 4.8, 2),
    },
  ];
  const jumlahPolres = rng.int(2, 5);
  for (let i = 0; i < jumlahPolres; i++) {
    const r2 = createSeededRng(`b12-auditi-${poldaId}-polres-${i}`);
    entries.push({
      id: `auditi-${poldaId}-polres-${i}`,
      poldaId,
      nama: `Polres ${['Utara', 'Selatan', 'Timur', 'Barat', 'Tengah'][i % 5]} ${poldaNama.replace('Polda ', '')}`,
      tingkat: 'Polres',
      tusi: r2.pick(TUSI_SAMPLES),
      strukturOrganisasi: `${r2.int(8, 14)} Satuan Fungsi, ${r2.int(4, 10)} Polsek jajaran`,
      anggaranTahunBerjalan: `Rp ${r2.round(28, 180, 1)} Miliar`,
      statusKelengkapan: r2.pick(['Lengkap', 'Sebagian', 'Placeholder', 'Perlu Pembaruan', 'Nonaktif']),
      persenKelengkapan: r2.int(20, 100),
      tahunTerakhirDiaudit: r2.pick([2022, 2023, 2024, 2025]),
      lamaBelumDiauditTahun: r2.int(0, 6),
      skorRisikoInheren: r2.round(1.0, 4.9, 2),
    });
  }
  return entries;
}

export const AUDIT_UNIVERSE_DATA: AuditiEntry[] = POLDA_DATA.flatMap((p, idx) => buildAuditiForPolda(p.id, p.nama, idx));

/** Satker Mabes tambahan sebagai populasi Audit Universe non-kewilayahan. */
const MABES_SATKER_NAMES = [
  'Bareskrim Polri', 'Korlantas Polri', 'Baintelkam Polri', 'Divpropam Polri',
  'Divhumas Polri', 'Sops Polri', 'Srena Polri', 'Slog Polri', 'SSDM Polri',
  'Lemdiklat Polri', 'Korbrimob Polri', 'Divkum Polri',
];
export const AUDIT_UNIVERSE_MABES: AuditiEntry[] = MABES_SATKER_NAMES.map((nama, i) => {
  const rng = createSeededRng(`b12-mabes-${nama}`);
  return {
    id: `auditi-mabes-${i}`,
    poldaId: 'mabes',
    nama,
    tingkat: 'Satker Mabes',
    tusi: rng.pick(TUSI_SAMPLES),
    strukturOrganisasi: `${rng.int(4, 10)} Biro/Direktorat pusat`,
    anggaranTahunBerjalan: `Rp ${rng.round(0.4, 6.2, 2)} Triliun`,
    statusKelengkapan: rng.pick(['Lengkap', 'Lengkap', 'Sebagian']),
    persenKelengkapan: rng.int(70, 100),
    tahunTerakhirDiaudit: rng.pick([2023, 2024, 2025]),
    lamaBelumDiauditTahun: rng.int(0, 3),
    skorRisikoInheren: rng.round(1.8, 4.9, 2),
  };
});

export const ALL_AUDITI: AuditiEntry[] = [...AUDIT_UNIVERSE_MABES, ...AUDIT_UNIVERSE_DATA];

/* ============================== B.13 PKPT Berbasis Risiko ============================== */

export interface PkptFactorScore {
  factorId: string;
  skor: number; // 1-5
}

export interface PkptEntry {
  id: string;
  auditiId: string;
  namaAuditi: string;
  tahunPKPT: number;
  factorScores: PkptFactorScore[];
  skorTertimbang: number;
  peringkat: number;
  jenisKegiatan: PkptJenisKegiatan;
  justifikasi?: string;
  tujuanAudit: string;
  sasaranAudit: string;
  sifatAudit: 'Reguler' | 'Khusus';
  waktuPelaksanaan: string;
  hpMinggu: number; // Hari Pengawasan dalam minggu
  anggaranUsulan: string;
  usulanTimOh: number; // usulan Orang-Hari
  disahkan: boolean;
}

function computeWeightedScore(scores: PkptFactorScore[]): number {
  return Math.round(
    PKPT_RISK_FACTORS.reduce((sum, f) => {
      const s = scores.find((x) => x.factorId === f.id)?.skor ?? 1;
      return sum + s * f.bobot;
    }, 0) * 100
  ) / 100;
}

export const PKPT_2026: PkptEntry[] = ALL_AUDITI.filter((a) => a.tingkat !== 'Polsek').map((auditi, idx) => {
  const rng = createSeededRng(`b13-pkpt-${auditi.id}`);
  const factorScores: PkptFactorScore[] = PKPT_RISK_FACTORS.map((f) => ({ factorId: f.id, skor: rng.int(1, 6) }));
  const skorTertimbang = computeWeightedScore(factorScores);
  const jenis = rng.pick(PKPT_JENIS_KEGIATAN);
  return {
    id: `pkpt-2026-${auditi.id}`,
    auditiId: auditi.id,
    namaAuditi: auditi.nama,
    tahunPKPT: 2026,
    factorScores,
    skorTertimbang,
    peringkat: idx + 1, // dihitung ulang oleh view setelah sort
    jenisKegiatan: jenis,
    justifikasi: jenis !== 'Berbasis Risiko' ? rng.pick([
      'Mandat Sprin Kapolri/Irwasum untuk audit kepatuhan tahun berjalan.',
      'Usulan langsung pimpinan Itwasum berdasarkan isu strategis nasional.',
      'Audit wajib tahunan sesuai siklus PKPT 3-tahunan Itwasum.',
    ]) : undefined,
    tujuanAudit: rng.pick([
      'Menilai kepatuhan pengelolaan anggaran dan kinerja operasional satker.',
      'Menguji efektivitas pengendalian intern dan tata kelola aset.',
      'Mengevaluasi capaian IKU dan tindak lanjut rekomendasi periode sebelumnya.',
    ]),
    sasaranAudit: 'Aspek Garkeu, Operasional, SDM, dan Sarpras sesuai lingkup Audit Kinerja.',
    sifatAudit: (rng.bool(0.75) ? 'Reguler' : 'Khusus') as 'Reguler' | 'Khusus',
    waktuPelaksanaan: rng.pick(['Triwulan I 2026', 'Triwulan II 2026', 'Triwulan III 2026', 'Triwulan IV 2026']),
    hpMinggu: rng.int(2, 6),
    anggaranUsulan: `Rp ${rng.round(80, 950, 0)} Juta`,
    usulanTimOh: rng.int(40, 220),
    disahkan: rng.bool(0.6),
  };
}).sort((a, b) => b.skorTertimbang - a.skorTertimbang)
  .map((entry, idx) => ({ ...entry, peringkat: idx + 1 }));

/** Total kapasitas Orang-Hari (OH) tim audit Itwasum per tahun (dipakai progress bar B.13 SF-005). */
export const TOTAL_KAPASITAS_OH_TAHUNAN = 18000;

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mock data deterministik B.8 SPIP Satker, B.16 Rekomendasi & TLHP, B.17 Monitoring
 * Maturitas, dan B.18 Early Warning (Plan bagian 3 & 4).
 */
import { createSeededRng } from '../../../utils/seededRandom';
import { POLDA_DATA } from '../../mockData';
import {
  SPIP_KK_CODES,
  SPIP_ASSESSMENT_MECHANISMS,
  SPIP_ASSESSOR_ROLES,
  TLHP_AMBANG_KRITIS_HARI,
  EARLY_WARNING_TRIGGER_RULES,
  getMaturityLabel,
} from './constants';

/* ============================== B.8 SPIP Satker ============================== */

export interface SpipKkScore {
  kode: string;
  skor: number; // 0-5
  mekanisme: string;
  asesor: string;
  catatan?: string;
}

export interface SpipSatkerEntry {
  poldaId: string;
  namaSatker: string;
  tahunPenilaian: number;
  tusiAsesor: { roleId: string; nama: string }[];
  kkScores: SpipKkScore[];
  nilaiKKLEAD_I: number;
  nilaiKKLEAD_II: number;
  nilaiKKLEAD_III: number;
  penaltiKK4: boolean;
  nilaiFinal: number;
  levelMaturitas: number;
  levelLabel: string;
  statusPenyimpulan: 'Draf' | 'Menunggu Reviu' | 'Final';
  sesiEditAktif?: { user: string; sisaMenit: number };
}

export const SPIP_SATKER_DATA: SpipSatkerEntry[] = POLDA_DATA.map((p) => {
  const rng = createSeededRng(`b8-spip-${p.id}`);
  const kkScores: SpipKkScore[] = SPIP_KK_CODES.filter((k) => !k.startsWith('KKLEAD')).map((kode) => ({
    kode,
    skor: rng.round(1.5, 5, 2),
    mekanisme: rng.pick(SPIP_ASSESSMENT_MECHANISMS).label,
    asesor: rng.pick(SPIP_ASSESSOR_ROLES).label,
  }));
  const kkleadI = rng.round(2, 5, 2);
  const kkleadII = rng.round(2, 5, 2);
  const kk4 = kkScores.find((k) => k.kode === 'KK4')?.skor ?? 3;
  const penalti = kk4 < 2.5;
  const kkleadIII = penalti ? Math.max(0, rng.round(1, 3.5, 2) - 0.5) : rng.round(2, 5, 2);
  const nilaiFinal = Math.round(((kkleadI + kkleadII + kkleadIII) / 3) * 100) / 100;
  return {
    poldaId: p.id,
    namaSatker: p.nama,
    tahunPenilaian: 2026,
    tusiAsesor: SPIP_ASSESSOR_ROLES.map((r) => ({ roleId: r.id, nama: rng.pick(['Kombes Pol.', 'AKBP', 'Kompol']) + ' ' + r.label.split(' ')[0] })),
    kkScores,
    nilaiKKLEAD_I: kkleadI,
    nilaiKKLEAD_II: kkleadII,
    nilaiKKLEAD_III: kkleadIII,
    penaltiKK4: penalti,
    nilaiFinal,
    levelMaturitas: Math.min(5, Math.round(nilaiFinal)),
    levelLabel: getMaturityLabel(nilaiFinal),
    statusPenyimpulan: rng.pick(['Draf', 'Menunggu Reviu', 'Final']),
    sesiEditAktif: rng.bool(0.15) ? { user: rng.pick(['AKBP Dr. Hendri Rusmono', 'Kompol Fitri Handayani']), sisaMenit: rng.int(2, 15) } : undefined,
  };
});

/* ============================== B.16 Rekomendasi & TLHP ============================== */

export type TlhpSumber = 'Audit Polri' | 'BPK RI' | 'Irsus';
export type TlhpStatus = 'Belum Ditindaklanjuti' | 'Dalam Proses' | 'Selesai';

export interface TlhpEntry {
  id: string;
  poldaId: string;
  namaSatker: string;
  sumber: TlhpSumber;
  judulRekomendasi: string;
  tanggalRekomendasi: string;
  usiaHari: number;
  statusAging: 'Normal' | 'Perhatian' | 'Kritis';
  statusTlhp: TlhpStatus;
  temuanBerulang: boolean;
  buktiDiunggah: boolean;
  verifikasi?: { hasil: 'Selesai' | 'Dalam Proses'; catatan: string; verifikator: string; tanggal: string };
}

export const TLHP_DATA: TlhpEntry[] = POLDA_DATA.flatMap((p) => {
  const count = createSeededRng(`b16-count-${p.id}`).int(1, 4);
  return Array.from({ length: count }, (_, i) => {
    const rng = createSeededRng(`b16-tlhp-${p.id}-${i}`);
    const usiaHari = rng.int(15, 1100);
    const statusAging: TlhpEntry['statusAging'] = usiaHari > TLHP_AMBANG_KRITIS_HARI ? 'Kritis' : usiaHari > 365 ? 'Perhatian' : 'Normal';
    const statusTlhp = rng.pick<TlhpStatus>(['Belum Ditindaklanjuti', 'Dalam Proses', 'Selesai']);
    const buktiDiunggah = statusTlhp !== 'Belum Ditindaklanjuti' && rng.bool(0.7);
    return {
      id: `tlhp-${p.id}-${i}`,
      poldaId: p.id,
      namaSatker: p.nama,
      sumber: rng.pick<TlhpSumber>(['Audit Polri', 'BPK RI', 'Irsus']),
      judulRekomendasi: rng.pick([
        'Penyetoran kembali kelebihan pembayaran uang lembur ke kas negara',
        'Perbaikan pencatatan aset BMN pada gudang logistik satker',
        'Penyelesaian rekonsiliasi SPJ dana hibah pemerintah daerah',
        'Penertiban dokumen kepemilikan tanah/bangunan Mako jajaran',
        'Optimalisasi pengendalian internal pengelolaan PNBP',
      ]),
      tanggalRekomendasi: `${rng.int(1, 28)} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][rng.int(0,11)]} ${2026 - Math.floor(usiaHari / 365)}`,
      usiaHari,
      statusAging,
      statusTlhp,
      temuanBerulang: rng.bool(0.18),
      buktiDiunggah,
      verifikasi: buktiDiunggah ? {
        hasil: rng.pick(['Selesai', 'Dalam Proses']),
        catatan: rng.pick(['Bukti dokumen lengkap dan sesuai rekomendasi.', 'Perlu bukti tambahan berupa BAST fisik.', 'Menunggu verifikasi lapangan tim asistensi.']),
        verifikator: rng.pick(['Kombes Pol. Bambang Suryo', 'AKBP Siti Nurhayati']),
        tanggal: `${rng.int(1, 28)} Agu 2026`,
      } : undefined,
    };
  });
});

/* ============================== B.17 Monitoring Maturitas & Risiko Strategis ============================== */

export interface MaturitasRollupItwil {
  itwilId: string;
  nama: string;
  rataRataMaturitas: number;
  satkerCount: number;
}

const ITWIL_MAP: Record<string, string[]> = {
  'itwil-1': ['polda-aceh', 'polda-sumut', 'polda-sumbar', 'polda-riau', 'polda-kepri', 'polda-jambi'],
  'itwil-2': ['polda-sumsel', 'polda-bengkulu', 'polda-lampung', 'polda-babel', 'polda-metro', 'polda-banten'],
  'itwil-3': ['polda-jabar', 'polda-jateng', 'polda-diy', 'polda-jatim', 'polda-bali'],
  'itwil-4': ['polda-kalbar', 'polda-kalteng', 'polda-kalsel', 'polda-kaltim', 'polda-kaltara'],
  'itwil-5': ['polda-sulut', 'polda-gorontalo', 'polda-sulteng', 'polda-sulsel', 'polda-sultra', 'polda-sulbar', 'polda-ntb', 'polda-ntt', 'polda-maluku', 'polda-malut', 'polda-papua-barat', 'polda-papua'],
};

export const MATURITAS_ROLLUP_ITWIL: MaturitasRollupItwil[] = Object.entries(ITWIL_MAP).map(([itwilId, poldaIds], idx) => {
  const scores = poldaIds.map((id) => SPIP_SATKER_DATA.find((s) => s.poldaId === id)?.nilaiFinal ?? 0);
  const avg = scores.reduce((a, b) => a + b, 0) / (scores.length || 1);
  return {
    itwilId,
    nama: `Inspektorat Wilayah ${['I', 'II', 'III', 'IV', 'V'][idx]}`,
    rataRataMaturitas: Math.round(avg * 100) / 100,
    satkerCount: poldaIds.length,
  };
});

export const MATURITAS_NASIONAL = Math.round((MATURITAS_ROLLUP_ITWIL.reduce((a, b) => a + b.rataRataMaturitas, 0) / MATURITAS_ROLLUP_ITWIL.length) * 100) / 100;

/** Tren maturitas 3 periode terakhir (dipakai TrendLineChart B.17 SF-003). */
export const MATURITAS_TREN_PERIODE = [
  { periode: 'Sem I 2025', nasional: 2.8, target: 3.0 },
  { periode: 'Sem II 2025', nasional: 3.05, target: 3.2 },
  { periode: 'Sem I 2026', nasional: MATURITAS_NASIONAL, target: 3.4 },
];

/** Bobot komponen rollup nasional (harus total 1,00) — form B.17 SF-004. */
export const MATURITAS_ROLLUP_BOBOT = [
  { id: 'kkleadI', label: 'KKLEAD I (Penetapan Tujuan)', bobot: 0.3 },
  { id: 'kkleadII', label: 'KKLEAD II (Struktur & Proses)', bobot: 0.4 },
  { id: 'kkleadIII', label: 'KKLEAD III (Pencapaian Tujuan)', bobot: 0.3 },
];

export const satkerMenurun = () => SPIP_SATKER_DATA.filter((s) => createSeededRng(`b17-trend-${s.poldaId}`).bool(0.22));

/* ============================== B.18 Early Warning ============================== */

export type EwUrgensi = 'Kritis' | 'Tinggi' | 'Perhatian';

export interface EarlyWarningAlert {
  id: string;
  ruleId: string;
  ruleLabel: string;
  poldaId: string;
  namaSatker: string;
  urgensi: EwUrgensi;
  pesan: string;
  munculSejak: string;
  slaProgressPersen: number;
  statusTindakLanjut: 'Belum Ditindaklanjuti' | 'Ditindaklanjuti' | 'Snooze';
  snoozeSampai?: string;
  riwayat: { waktu: string; aksi: string; aktor: string }[];
}

export const EARLY_WARNING_ALERTS: EarlyWarningAlert[] = POLDA_DATA.flatMap((p) => {
  const rng = createSeededRng(`b18-alert-${p.id}`);
  if (!rng.bool(0.55)) return [];
  const rule = rng.pick(EARLY_WARNING_TRIGGER_RULES);
  const urgensi: EwUrgensi = rng.pick(['Kritis', 'Tinggi', 'Perhatian']);
  return [{
    id: `ew-${p.id}`,
    ruleId: rule.id,
    ruleLabel: rule.label,
    poldaId: p.id,
    namaSatker: p.nama,
    urgensi,
    pesan: `${rule.deskripsi} terdeteksi pada ${p.nama}.`,
    munculSejak: `${rng.int(1, 28)} Agu 2026`,
    slaProgressPersen: rng.int(10, 100),
    statusTindakLanjut: rng.pick(['Belum Ditindaklanjuti', 'Ditindaklanjuti', 'Snooze']),
    snoozeSampai: rng.bool(0.2) ? `${rng.int(1, 7)} Sep 2026` : undefined,
    riwayat: [
      { waktu: `${rng.int(1, 28)} Agu 2026, 09:${rng.int(10,59)} WIB`, aksi: 'Peringatan dibuat sistem', aktor: 'Sistem Early Warning' },
    ],
  }];
});

/** Konfigurasi aktif per aturan (toggle + ambang) — B.18 SF-001. */
export const EARLY_WARNING_RULE_CONFIG = EARLY_WARNING_TRIGGER_RULES.map((r) => ({
  ...r,
  aktif: true,
  ambang: r.id === 'ew-tlhp' ? `${TLHP_AMBANG_KRITIS_HARI} hari` : r.id === 'ew-maturitas' ? 'Turun >= 1 level' : r.id === 'ew-iku' ? 'Turun >= 5 poin' : 'Status Perlu Pembaruan/Nonaktif',
}));

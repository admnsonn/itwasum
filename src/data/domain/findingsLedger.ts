/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.2/B.3 Findings Ledger — mereplikasi struktur temuan BPK RI & Inspektorat Khusus (IRSUS)
 * per FSD `plane/b-2-*` dan `plane/b-3-*` (Plan "Align itwasum with Plane BA/SA", todo
 * p3-b2b3). Sebelumnya B.2/B.3 hanya memakai `PoldaSatker.rincianTemuan` (1 baris BPK, 0 baris
 * IRSUS) — ledger ini adalah sumber data yang lebih kaya & representatif untuk kedua sumber,
 * termasuk label Baru/Berulang dan status tindak lanjut "Lewat Target" yang belum ada
 * sebelumnya. Dibangkitkan deterministik per Polda via `createSeededRng` agar konsisten antar
 * render/reload (pola yang sama dengan `data/eprofil/generator.ts`).
 */
import { createSeededRng } from '../../utils/seededRandom';
import { POLDA_DATA } from '../mockData';

export type TemuanSumberLedger = 'BPK RI' | 'Irsus';
export type TemuanLabel = 'Baru' | 'Berulang';
export type TindakLanjutStatus = 'Selesai' | 'Dalam Proses' | 'Belum Ditindaklanjuti' | 'Lewat Target';
export type TemuanKategori = 'Keuangan' | 'Operasional' | 'SDM' | 'Logistik & Sarpras';
export type JenisAuditLedger = 'Reguler' | 'Khusus' | 'Tematik';

export interface FindingLedgerEntry {
  id: string;
  kode: string;
  sumber: TemuanSumberLedger;
  poldaId: string;
  poldaNama: string;
  judul: string;
  kategori: TemuanKategori;
  tingkat: 'Kritis' | 'Sedang' | 'Ringan';
  label: TemuanLabel;
  status: TindakLanjutStatus;
  nilaiRupiah?: string;
  tenggat: string;
  tglTemuan: string;
  rekomendasi: string;
  akarMasalah: string;
  aiConfidence: number;
  jenisAudit: JenisAuditLedger;
  dokumenTerkait: string[];
  riwayatTindakLanjut: { tgl: string; status: TindakLanjutStatus; catatan: string }[];
  /** Satwil/sub-unit pelapor di bawah Polda ini (Figma "Monitoring Satker / Satwil"). */
  subSatker: string;
}

const SUB_SATKER_TEMPLATES = ['Polres Metro Wilayah I', 'Polres Metro Wilayah II', 'Polrestabes', 'Dit Lantas', 'Dit Samapta', 'Dit Reskrimum'];

const KATEGORI_LIST: TemuanKategori[] = ['Keuangan', 'Operasional', 'SDM', 'Logistik & Sarpras'];
const TINGKAT_LIST: FindingLedgerEntry['tingkat'][] = ['Kritis', 'Sedang', 'Ringan'];
const STATUS_LIST: TindakLanjutStatus[] = ['Selesai', 'Dalam Proses', 'Belum Ditindaklanjuti', 'Lewat Target'];
const JENIS_AUDIT_LIST: JenisAuditLedger[] = ['Reguler', 'Khusus', 'Tematik'];

const JUDUL_TEMPLATES: Record<TemuanKategori, string[]> = {
  Keuangan: ['Selisih pertanggungjawaban belanja operasional', 'Keterlambatan penyetoran PNBP ke kas negara', 'Realisasi anggaran tidak sesuai RKA-KL'],
  Operasional: ['Ketidaksesuaian SOP penindakan lapangan', 'Duplikasi pelaporan kejadian pada sistem SSOT', 'Keterlambatan penyelesaian perkara prioritas'],
  SDM: ['Kekosongan jabatan strategis melebihi 6 bulan', 'Pelanggaran disiplin personel tidak ditindaklanjuti', 'Ketidaksesuaian distribusi pangkat/golongan'],
  'Logistik & Sarpras': ['Aset BMN tidak ditemukan pada opname fisik', 'Kendaraan dinas dioperasikan melebihi ambang layak', 'Kontrak pemeliharaan sarpras telah jatuh tempo'],
};

const AKAR_MASALAH_TEMPLATES = [
  'Lemahnya pengendalian internal pada proses terkait.',
  'Belum optimalnya pengawasan berjenjang oleh atasan langsung.',
  'Ketidakpatuhan terhadap SOP yang telah ditetapkan.',
  'Minimnya kompetensi personel pengelola pada bidang terkait.',
];

const REKOMENDASI_TEMPLATES = [
  'Lakukan verifikasi ulang dan susun rencana tindak korektif.',
  'Tetapkan penanggung jawab dan tenggat penyelesaian yang jelas.',
  'Perkuat pengendalian internal melalui reviu berjenjang.',
  'Berikan pembinaan/pelatihan kepada personel terkait.',
];

function buildEntriesForSumber(poldaId: string, poldaNama: string, sumber: TemuanSumberLedger, count: number): FindingLedgerEntry[] {
  const rng = createSeededRng(`ledger-${sumber}-${poldaId}`);
  return Array.from({ length: count }, (_, i) => {
    const kategori = rng.pick(KATEGORI_LIST);
    const label: TemuanLabel = rng.bool(0.35) ? 'Berulang' : 'Baru';
    const tingkat = rng.pick(TINGKAT_LIST);
    const status = rng.pick(STATUS_LIST);
    const tahun = 2026;
    const kodePrefix = sumber === 'BPK RI' ? 'LHP-BPK' : 'LHP-IRSUS';
    return {
      id: `${sumber === 'BPK RI' ? 'bpk' : 'irsus'}-${poldaId}-${i}`,
      kode: `${kodePrefix}/${String(rng.int(1, 999)).padStart(3, '0')}/${tahun}`,
      sumber,
      poldaId,
      poldaNama,
      judul: rng.pick(JUDUL_TEMPLATES[kategori]),
      kategori,
      tingkat,
      label,
      status,
      nilaiRupiah: kategori === 'Keuangan' ? `Rp ${rng.round(5, 950, 1)} Juta` : undefined,
      tenggat: `${rng.int(1, 28)} ${rng.pick(['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun', 'Jul', 'Ags', 'Sep', 'Okt', 'Nov', 'Des'])} ${tahun}`,
      tglTemuan: `${rng.int(1, 28)} ${rng.pick(['Jan', 'Feb', 'Mar', 'Apr', 'Mei', 'Jun'])} ${tahun}`,
      rekomendasi: rng.pick(REKOMENDASI_TEMPLATES),
      akarMasalah: rng.pick(AKAR_MASALAH_TEMPLATES),
      aiConfidence: rng.int(74, 98),
      jenisAudit: rng.pick(JENIS_AUDIT_LIST),
      dokumenTerkait: [`BAP_${poldaId}_${i}.pdf`, `LHP_${sumber === 'BPK RI' ? 'BPK' : 'Irsus'}_${poldaId}.pdf`],
      subSatker: rng.pick(SUB_SATKER_TEMPLATES),
      riwayatTindakLanjut:
        status === 'Belum Ditindaklanjuti'
          ? []
          : [
              { tgl: `${rng.int(1, 28)} Jul ${tahun}`, status: 'Dalam Proses', catatan: 'Satker mulai menyusun rencana tindak lanjut.' },
              ...(status === 'Selesai' ? [{ tgl: `${rng.int(1, 28)} Ags ${tahun}`, status: 'Selesai' as TindakLanjutStatus, catatan: 'Bukti tindak lanjut telah diverifikasi dan diterima.' }] : []),
            ],
    };
  });
}

let cachedLedger: FindingLedgerEntry[] | null = null;

/** Seluruh entri ledger (BPK + IRSUS) lintas Polda, dibangkitkan sekali dan di-cache. */
export function getFindingsLedger(): FindingLedgerEntry[] {
  if (cachedLedger) return cachedLedger;
  const out: FindingLedgerEntry[] = [];
  POLDA_DATA.forEach((p) => {
    const rng = createSeededRng(`ledger-count-${p.id}`);
    out.push(...buildEntriesForSumber(p.id, p.nama, 'BPK RI', rng.int(2, 6)));
    out.push(...buildEntriesForSumber(p.id, p.nama, 'Irsus', rng.int(1, 5)));
  });
  cachedLedger = out;
  return out;
}

export function findingsForSatker(poldaId: string, sumber: TemuanSumberLedger): FindingLedgerEntry[] {
  return getFindingsLedger().filter((f) => f.poldaId === poldaId && f.sumber === sumber);
}

/** "Temuan serupa" — Satker yang sama + kategori yang sama, dalam 24 bulan terakhir (Plan
 * assumption). Karena tanggal seed berupa string demo, disederhanakan menjadi tahun berjalan
 * yang sama, dikecualikan entri itu sendiri. */
export function similarFindings(entry: FindingLedgerEntry, limit = 3): FindingLedgerEntry[] {
  return getFindingsLedger()
    .filter((f) => f.id !== entry.id && f.poldaId === entry.poldaId && f.kategori === entry.kategori)
    .slice(0, limit);
}

export interface MonitoringSatwilRow {
  subSatker: string;
  jumlahTemuan: number;
  selesai: number;
  dalamProses: number;
  persenPenyelesaian: number;
  status: 'Sangat Baik' | 'Baik' | 'Menunggu' | 'Kritis';
}

/** Figma "Monitoring Satker / Satwil" — rollup penyelesaian temuan per sub-unit di bawah
 * satu Polda (bukan lintas-Polda), dipetakan dari `subSatker`. */
export function monitoringBySubSatker(poldaId: string, sumber: TemuanSumberLedger): MonitoringSatwilRow[] {
  const entries = findingsForSatker(poldaId, sumber);
  const groups = new Map<string, FindingLedgerEntry[]>();
  entries.forEach((e) => {
    groups.set(e.subSatker, [...(groups.get(e.subSatker) ?? []), e]);
  });
  return Array.from(groups.entries()).map(([subSatker, items]) => {
    const selesai = items.filter((i) => i.status === 'Selesai').length;
    const dalamProses = items.filter((i) => i.status === 'Dalam Proses').length;
    const persen = items.length ? Math.round((selesai / items.length) * 100) : 0;
    const status: MonitoringSatwilRow['status'] = persen >= 80 ? 'Sangat Baik' : persen >= 60 ? 'Baik' : persen >= 30 ? 'Menunggu' : 'Kritis';
    return { subSatker, jumlahTemuan: items.length, selesai, dalamProses, persenPenyelesaian: persen, status };
  });
}

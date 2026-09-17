/**
 * Ledger temuan deterministik. Jumlah per Polda mengikuti POLDA_DATA.totalTemuan.
 * 13 rincian tulis tangan menimpa berdasarkan id.
 */
import { createSeededRng } from '../../utils/seededRandom';
import { POLDA_DATA } from '../mockData';
import { getItwilIdForPolda } from './itwilMap';
import { addDays, formatIdDateFixed } from './timeline';

export type TemuanSumber = 'Audit Polri' | 'BPK RI' | 'Irsus';
export type TemuanStatus = 'Belum Ditindaklanjuti' | 'Dalam Proses' | 'Selesai';
export type TemuanTingkat = 'Kritis' | 'Sedang' | 'Ringan';

export const AKAR_MASALAH = [
  'Pengendalian intern tidak berjalan',
  'Administrasi BMN tidak tertib',
  'SPJ dan bukti pembayaran tidak lengkap',
  'Keterlambatan rekonsiliasi kas',
  'Ketidaksesuaian data fisik dan sistem',
  'Kelemahan pemisahan fungsi',
  'Kepatuhan SOP operasional rendah',
  'Pengawasan melekat atasan tidak efektif',
] as const;

export const KATEGORI_BPK = [
  'Keuangan',
  'Logistik & Sarpras',
  'SDM',
  'Operasional',
  'PNBP',
  'Aset Tanah & Bangunan',
] as const;

export interface FindingRecord {
  id: string;
  satkerId: string;
  satkerNama: string;
  itwilId?: string;
  kategoriBPK: string;
  akarMasalah: string;
  nilai: number;
  nilaiLabel: string;
  tanggal: string;
  tanggalDate: Date;
  statusTL: TemuanStatus;
  berulang: boolean;
  sumber: TemuanSumber;
  tingkat: TemuanTingkat;
  judul: string;
  kode: string;
  rekomendasi: string;
  tenggat: string;
}

const JUDUL_TEMPLATES: Record<string, string[]> = {
  Keuangan: [
    'Kelebihan pembayaran belanja pegawai pada kegiatan operasi',
    'Realisasi belanja tidak sesuai peruntukan DIPA',
    'Kekurangan pemotongan pajak atas belanja barang',
  ],
  'Logistik & Sarpras': [
    'Pencatatan aset BMN tidak sesuai kondisi fisik',
    'Kendaraan dinas tidak tertib administrasi',
    'Persediaan logistik selisih hasil opname',
  ],
  SDM: [
    'Kelebihan pembayaran uang makan lembur',
    'Administrasi mutasi personel tidak lengkap',
    'Tunjangan tidak sesuai status kehadiran',
  ],
  Operasional: [
    'Keterlambatan penyelesaian perkara prioritas',
    'Duplikasi pelaporan kejadian',
    'Ketidaksesuaian data operasional antar sistem',
  ],
  PNBP: [
    'Keterlambatan penyetoran PNBP ke kas negara',
    'Pencatatan PNBP tidak sesuai bukti setor',
  ],
  'Aset Tanah & Bangunan': [
    'Tanah hibah belum bersertifikat',
    'Bangunan mako belum tercatat SIMAK-BMN',
  ],
};

function formatRp(nilai: number): string {
  return `Rp ${nilai.toLocaleString('id-ID')}`;
}

function buildForPolda(poldaId: string, nama: string, total: number, handwritten: FindingRecord[]): FindingRecord[] {
  const rng = createSeededRng(`findings-${poldaId}`);
  const itwilId = getItwilIdForPolda(poldaId);
  const handForPolda = handwritten.filter((h) => h.satkerId === poldaId);
  const targetCount = Math.max(total, handForPolda.length);
  const slug = poldaId.replace(/^polda-/, '');
  const out: FindingRecord[] = [...handForPolda];
  const genCount = targetCount - handForPolda.length;
  const sumberWeights: TemuanSumber[] = ['Audit Polri', 'Audit Polri', 'BPK RI', 'Irsus'];

  for (let i = 0; i < genCount; i++) {
    const kategori = rng.pick([...KATEGORI_BPK]);
    const judulPool = JUDUL_TEMPLATES[kategori] ?? JUDUL_TEMPLATES.Keuangan;
    const sumber = rng.pick(sumberWeights);
    const tingkat = rng.pick<TemuanTingkat>(['Kritis', 'Sedang', 'Sedang', 'Ringan']);
    const nilai = rng.int(25, 1800) * 1_000_000;
    const statusTL = rng.pick<TemuanStatus>(['Belum Ditindaklanjuti', 'Dalam Proses', 'Selesai', 'Dalam Proses']);
    const issued = new Date(2025, rng.int(0, 12), rng.int(1, 28));
    const tenggat = addDays(issued, 60);
    const kodePrefix = sumber === 'BPK RI' ? 'BPK' : sumber === 'Irsus' ? 'IRS' : 'WAS';
    const seq = handForPolda.length + i + 1;
    out.push({
      id: `t-${slug}-${seq}`,
      satkerId: poldaId,
      satkerNama: nama,
      itwilId,
      kategoriBPK: kategori,
      akarMasalah: rng.pick([...AKAR_MASALAH]),
      nilai,
      nilaiLabel: formatRp(nilai),
      tanggal: formatIdDateFixed(issued),
      tanggalDate: issued,
      statusTL,
      berulang: rng.bool(0.18),
      sumber,
      tingkat,
      judul: judulPool[i % judulPool.length],
      kode: `${kodePrefix}-${slug.slice(0, 3).toUpperCase()}-26-${String(seq).padStart(3, '0')}`,
      rekomendasi: rng.pick([
        'Perbaiki pengendalian intern dan sampaikan bukti koreksi',
        'Lakukan rekonsiliasi dan setor kelebihan ke kas negara',
        'Tertibkan administrasi aset sesuai SIMAK-BMN/SAKTI',
      ]),
      tenggat: formatIdDateFixed(tenggat),
    });
  }
  return out;
}

function fromHandwritten(): FindingRecord[] {
  const records: FindingRecord[] = [];
  for (const p of POLDA_DATA) {
    for (const t of p.rincianTemuan ?? []) {
      const issued = new Date(2026, 5, 15);
      const nilaiNum = Number(String(t.nilaiRupiah || '0').replace(/[^\d]/g, '')) || 0;
      records.push({
        id: t.id,
        satkerId: p.id,
        satkerNama: p.nama,
        itwilId: getItwilIdForPolda(p.id),
        kategoriBPK: t.kategori,
        akarMasalah: t.kategori.includes('Logistik') ? 'Administrasi BMN tidak tertib' : 'Pengendalian intern tidak berjalan',
        nilai: nilaiNum,
        nilaiLabel: t.nilaiRupiah || '—',
        tanggal: formatIdDateFixed(issued),
        tanggalDate: issued,
        statusTL: t.status as TemuanStatus,
        berulang: false,
        sumber: t.sumber as TemuanSumber,
        tingkat: t.tingkat === 'Kritis' ? 'Kritis' : t.tingkat === 'Sedang' ? 'Sedang' : 'Ringan',
        judul: t.judul,
        kode: t.kode,
        rekomendasi: t.rekomendasi,
        tenggat: t.tenggat,
      });
    }
  }
  return records;
}

const HANDWRITTEN = fromHandwritten();

export const FINDINGS_LEDGER: FindingRecord[] = POLDA_DATA.flatMap((p) =>
  buildForPolda(p.id, p.nama, Math.max(p.totalTemuan, p.rincianTemuan?.length || 0), HANDWRITTEN)
);

export function byPolda(poldaId: string): FindingRecord[] {
  return FINDINGS_LEDGER.filter((f) => f.satkerId === poldaId);
}

export function byItwil(itwilId: string): FindingRecord[] {
  return FINDINGS_LEDGER.filter((f) => f.itwilId === itwilId);
}

export function byKategori(kategori: string): FindingRecord[] {
  return FINDINGS_LEDGER.filter((f) => f.kategoriBPK === kategori);
}

export function byAkarMasalah(akar: string): FindingRecord[] {
  return FINDINGS_LEDGER.filter((f) => f.akarMasalah === akar);
}

export function baruVsBerulang(rows: FindingRecord[] = FINDINGS_LEDGER) {
  return {
    baru: rows.filter((f) => !f.berulang),
    berulang: rows.filter((f) => f.berulang),
  };
}

export function findingsBySumber(sumber: TemuanSumber): FindingRecord[] {
  return FINDINGS_LEDGER.filter((f) => f.sumber === sumber);
}

export function paretoAkarMasalah(rows: FindingRecord[] = FINDINGS_LEDGER) {
  const counts = new Map<string, number>();
  for (const row of rows) {
    counts.set(row.akarMasalah, (counts.get(row.akarMasalah) ?? 0) + 1);
  }
  return [...counts.entries()]
    .map(([akar, jumlah]) => ({ akar, jumlah }))
    .sort((a, b) => b.jumlah - a.jumlah);
}

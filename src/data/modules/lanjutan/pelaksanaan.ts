/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Mock data deterministik B.14 Manajemen Penugasan Audit & B.15 Kertas Kerja Audit Digital
 * (Plan bagian 3 & 4). Berantai dari B.13 (`PKPT_2026`) dan `AUDITOR_LIST`.
 */
import { createSeededRng } from '../../../utils/seededRandom';
import { AUDITOR_LIST } from '../../mockData';
import { PKPT_2026 } from './perencanaan';
import { formatSuratTugasNomor, getCapacityStatusLabel } from './constants';

export type PenugasanStatus = 'Perlu Penugasan' | 'Tim Terbentuk' | 'ST Terbit' | 'Berjalan' | 'Selesai';

export interface AnggotaTim {
  auditorId: string;
  nama: string;
  peranTim: 'Pengawas Tim' | 'Ketua Tim' | 'Anggota Tim';
}

export interface PenugasanEntry {
  id: string;
  pkptId: string;
  namaAuditi: string;
  waktuPelaksanaan: string;
  status: PenugasanStatus;
  tim: AnggotaTim[];
  suratTugasNomor?: string;
  tanggalTerbitST?: string;
  konflikKepentingan: boolean;
  catatanKonflik?: string;
  pengecualianKonflikDisetujui?: boolean;
}

const PERAN_TIM_MIN: AnggotaTim['peranTim'][] = ['Pengawas Tim', 'Ketua Tim', 'Anggota Tim', 'Anggota Tim'];

export const PENUGASAN_2026: PenugasanEntry[] = PKPT_2026.filter((p) => p.disahkan).map((pkpt, idx) => {
  const rng = createSeededRng(`b14-penugasan-${pkpt.id}`);
  const statusPool: PenugasanStatus[] = ['Perlu Penugasan', 'Tim Terbentuk', 'ST Terbit', 'Berjalan', 'Selesai'];
  const status = statusPool[Math.min(statusPool.length - 1, rng.int(0, statusPool.length))];
  const tim: AnggotaTim[] = status === 'Perlu Penugasan' ? [] : PERAN_TIM_MIN.map((peran) => {
    const auditor = rng.pick(AUDITOR_LIST);
    return { auditorId: auditor.id, nama: auditor.nama, peranTim: peran };
  });
  const konflik = tim.length > 0 && rng.bool(0.12);
  const stTerbit = status === 'ST Terbit' || status === 'Berjalan' || status === 'Selesai';
  return {
    id: `penugasan-${pkpt.id}`,
    pkptId: pkpt.id,
    namaAuditi: pkpt.namaAuditi,
    waktuPelaksanaan: pkpt.waktuPelaksanaan,
    status,
    tim,
    suratTugasNomor: stTerbit ? formatSuratTugasNomor(400 + idx, new Date(2026, rng.int(0, 9), 1)) : undefined,
    tanggalTerbitST: stTerbit ? `${rng.int(1, 28)} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep'][rng.int(0,9)]} 2026` : undefined,
    konflikKepentingan: konflik,
    catatanKonflik: konflik ? 'Anggota tim pernah bertugas di satker auditi dalam 2 tahun terakhir.' : undefined,
    pengecualianKonflikDisetujui: konflik ? rng.bool(0.5) : undefined,
  };
});

/** Kalender kapasitas beban kerja auditor (B.14 SF-004), turunan dari beban penugasan aktif. */
export interface AuditorCapacityRow {
  auditorId: string;
  nama: string;
  bebanAktif: number;
  kapasitasMaksimal: number;
  persenBeban: number;
  statusKapasitas: 'Tersedia' | 'Mendekati Penuh' | 'Penuh';
  penugasanAktif: string[];
}

export const AUDITOR_CAPACITY_CALENDAR: AuditorCapacityRow[] = AUDITOR_LIST.map((a) => {
  const penugasanAktif = PENUGASAN_2026.filter((p) => p.tim.some((t) => t.auditorId === a.id) && (p.status === 'Berjalan' || p.status === 'ST Terbit')).map((p) => p.namaAuditi);
  const bebanAktif = Math.max(a.bebanAktif, penugasanAktif.length);
  const persen = Math.round((bebanAktif / a.kapasitasMaksimal) * 100);
  return {
    auditorId: a.id,
    nama: a.nama,
    bebanAktif,
    kapasitasMaksimal: a.kapasitasMaksimal,
    persenBeban: persen,
    statusKapasitas: getCapacityStatusLabel(persen),
    penugasanAktif,
  };
});

/* ============================== B.15 Kertas Kerja Audit Digital ============================== */

export type KkStatus = 'Draf' | 'Menunggu Validasi Ketua Tim' | 'Perlu Revisi' | 'Disetujui Ketua Tim' | 'Disahkan';

export interface KkEvidence {
  id: string;
  namaBerkas: string;
  format: 'PDF' | 'JPG' | 'PNG' | 'XLSX' | 'DOCX';
  ukuranMb: number;
  diunggahOleh: string;
  tanggal: string;
}

export interface KkVersion {
  versi: number;
  diubahOleh: string;
  tanggal: string;
  ringkasanPerubahan: string;
  skorSebelum?: number;
  skorSesudah?: number;
}

export interface KkEntry {
  id: string;
  penugasanId: string;
  namaAuditi: string;
  bidang: 'Garkeu' | 'Operasional' | 'SDM' | 'Sarpras & Logistik';
  judulProsedur: string;
  status: KkStatus;
  skorOtomatis: number; // 0-100 read-only
  batasWaktu: string;
  sisaHari: number;
  terlambat: boolean;
  eviden: KkEvidence[];
  versions: KkVersion[];
}

const BIDANG_KK: KkEntry['bidang'][] = ['Garkeu', 'Operasional', 'SDM', 'Sarpras & Logistik'];
const FORMAT_EVIDEN: KkEvidence['format'][] = ['PDF', 'JPG', 'PNG', 'XLSX', 'DOCX'];
const KK_STATUS_POOL: KkStatus[] = ['Draf', 'Menunggu Validasi Ketua Tim', 'Perlu Revisi', 'Disetujui Ketua Tim', 'Disahkan'];

export const KERTAS_KERJA_DIGITAL: KkEntry[] = PENUGASAN_2026.filter((p) => p.status === 'Berjalan' || p.status === 'Selesai' || p.status === 'ST Terbit')
  .flatMap((p) => BIDANG_KK.map((bidang, bidx) => {
    const rng = createSeededRng(`b15-kk-${p.id}-${bidang}`);
    const status = p.status === 'Selesai' ? 'Disahkan' : KK_STATUS_POOL[rng.int(0, KK_STATUS_POOL.length)];
    const sisaHari = rng.int(-4, 12);
    const jumlahEviden = rng.int(1, 4);
    const jumlahVersi = rng.int(1, 3);
    return {
      id: `kk-${p.id}-${bidang.replace(/\s+/g, '-').toLowerCase()}`,
      penugasanId: p.id,
      namaAuditi: p.namaAuditi,
      bidang,
      judulProsedur: [
        'Pengujian Kepatuhan Realisasi Anggaran & SPJ',
        'Pengujian Efektivitas Pengendalian Operasional',
        'Pengujian Kelengkapan Administrasi SDM & Disiplin',
        'Pengujian Kondisi & Pertanggungjawaban Aset Sarpras',
      ][bidx],
      status,
      skorOtomatis: rng.int(45, 98),
      batasWaktu: `${rng.int(1, 28)} ${['Jan','Feb','Mar','Apr','Mei','Jun','Jul','Agu','Sep','Okt','Nov','Des'][rng.int(0,11)]} 2026`,
      sisaHari,
      terlambat: sisaHari < 0 && status !== 'Disahkan',
      eviden: Array.from({ length: jumlahEviden }, (_, i) => ({
        id: `ev-${p.id}-${bidang}-${i}`,
        namaBerkas: `Eviden_${bidang.replace(/\s+/g, '')}_${p.namaAuditi.replace(/\s+/g, '')}_${i + 1}.${FORMAT_EVIDEN[rng.int(0, FORMAT_EVIDEN.length)].toLowerCase()}`,
        format: FORMAT_EVIDEN[rng.int(0, FORMAT_EVIDEN.length)],
        ukuranMb: rng.round(0.3, 18, 1),
        diunggahOleh: rng.pick(AUDITOR_LIST).nama,
        tanggal: `${rng.int(1, 28)} Agu 2026`,
      })),
      versions: Array.from({ length: jumlahVersi }, (_, i) => ({
        versi: i + 1,
        diubahOleh: rng.pick(AUDITOR_LIST).nama,
        tanggal: `${rng.int(1, 28)} Agu 2026`,
        ringkasanPerubahan: i === 0 ? 'Draf awal pengisian kertas kerja.' : rng.pick([
          'Revisi berdasarkan catatan Pengawas Tim.',
          'Penambahan eviden pendukung temuan.',
          'Perbaikan narasi rekomendasi tindak lanjut.',
        ]),
        skorSebelum: i === 0 ? undefined : rng.int(40, 80),
        skorSesudah: rng.int(60, 98),
      })),
    } as KkEntry;
  }));

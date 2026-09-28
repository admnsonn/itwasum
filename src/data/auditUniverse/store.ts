/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared store for the migrated "Audit Universe — Pengumpulan Data" prototypes (Plan
 * "Migrate 27092026 prototypes", todo `store`). Backs:
 *   - B.9 Master Data tab (4.1-4.4)
 *   - B.12 Audit Universe screens: Permintaan Data (5.1), Portal Satker (6.0-6.3),
 *     Verifikasi Berkas (7.1)
 *
 * Plain module-level state read through `useSyncExternalStore`, persisted to localStorage.
 * Mutations always replace `state` with a new object so `getSnapshot()` reference-changes
 * (React's contract for `useSyncExternalStore`).
 */
import { useSyncExternalStore } from 'react';
import type {
  AuditUniverseState,
  BerkasSatker,
  BerkasStatus,
  KatalogDokumen,
  LaporanEntry,
  Permintaan,
  PermintaanLogEntry,
  PermintaanStatusTurunan,
  StageSatker,
  Bidjemen,
  JenisPengawasan,
  OrgUnit,
  Tipologi,
  MappingRule,
  AturanValidasi,
  ObjekAudit,
  ObjekAuditStatus,
  PenilaianRisiko,
  PenilaianRisikoStatus,
  RisikoFaktorKey,
  StatusRentangRisikoLite,
  BaselinePrioritas,
  ObjekPemeriksaan,
  TemplateDokumen,
  MasterDataHistoryEntry,
  DokumenSlot,
  DokumenSlotStatus,
  ClaimEntry,
} from './types';
import { RISIKO_FAKTOR_LIST } from './types';
import { addDaysIso, daysDiffFromToday, isoDateTime, startOfToday } from './dateUtils';
import { ORG_UNITS_SEED } from './seeds/orgUnits';
import { TIPOLOGI_SEED } from './seeds/tipologi';
import { JENIS_PENGAWASAN_SEED } from './seeds/jenisPengawasan';
import { BIDJEMEN_SEED } from './seeds/bidjemen';
import { KATALOG_DOKUMEN_SEED } from './seeds/katalogDokumen';
import { PERMINTAAN_SEED, type PermintaanSeedDef } from './seeds/permintaan';
import { IKU_SLOTS, SPIP_SLOTS, LAPORAN_SEED_BERJALAN, LAPORAN_SEED_TAHUN_LALU, HISTORI_KIRIM_14_HARI, type LaporanSeedEntry } from './seeds/laporan';
import type { LaporanSlotDef, BerkasVersion } from './types';

const STORAGE_KEY = 'itwasum_audit_universe_v1';
/** Bump when the seed/shape changes so stale localStorage from an older shape is discarded. */
const SEED_VERSION = 5;

/** Deterministic string hash -> [0,1), used to seed Objek Audit/Risiko demo data reproducibly. */
function seededFraction(key: string): number {
  let h = 0;
  for (let i = 0; i < key.length; i++) h = (h * 31 + key.charCodeAt(i)) >>> 0;
  return (h % 10000) / 10000;
}

function skorToLevel(skor: number): StatusRentangRisikoLite {
  if (skor >= 20) return 'sangat_tinggi';
  if (skor >= 16) return 'tinggi';
  if (skor >= 12) return 'sedang';
  if (skor >= 6) return 'rendah';
  return 'sangat_rendah';
}

/** 5.1 Mapping Ketentuan Pengumpulan — satu mapping per Jenis Pengawasan induk yang dipakai,
 * menghubungkannya ke katalog dokumen "Wajib" yang relevan (demo-representatif, bisa diubah admin). */
function buildMappingSeed(jenisPengawasan: JenisPengawasan[], katalog: KatalogDokumen[]): MappingRule[] {
  const wajibIds = katalog.filter((d) => d.sifat === 'Wajib' && d.aktif).map((d) => d.id);
  const induk = jenisPengawasan.filter((j) => !j.induk && j.aktif);
  return induk.map((jp, idx) => ({
    id: `MAP-${String(idx + 1).padStart(3, '0')}`,
    jpId: jp.id,
    tipologiIds: [],
    dokumenIds: wajibIds.slice((idx * 4) % Math.max(1, wajibIds.length - 5), (idx * 4) % Math.max(1, wajibIds.length - 5) + 5),
    aktif: true,
    versi: 1,
    berlakuMulai: `${new Date().getFullYear()}-01-01`,
    catatan: `Dokumen wajib untuk pengumpulan data terkait ${jp.nama}.`,
  }));
}

/** 5.2 Aturan Validasi — satu aturan default per dokumen berjenis "Dokumen" pada katalog. */
function buildAturanValidasiSeed(katalog: KatalogDokumen[]): AturanValidasi[] {
  return katalog
    .filter((d) => d.jenis === 'Dokumen')
    .map((d) => ({
      id: `AV-${d.id}`,
      dokId: d.id,
      formatDiizinkan: ['pdf', 'jpg', 'png'],
      ukuranMaksMb: d.kat === 'AUD' || d.kat === 'LGL' ? 20 : 10,
      wajibTtd: d.kat === 'AUD' || d.kat === 'LGL' || d.kat === 'RSK',
      ambangKelengkapanPct: 80,
      aktif: d.aktif,
    }));
}

/** F3 Objek Audit + 8.1/8.2 Penilaian Risiko — satu Objek Audit per Satker beranggaran
 * (jenjang Polda/Satker Mabes/Satker Polda) untuk TA berjalan, dinilai risikonya bila statusnya
 * cukup matang (demo-deterministik lewat `seededFraction`, bukan acak per render). */
function buildObjekAuditAndRisikoSeed(
  orgUnits: OrgUnit[],
  jenisPengawasan: JenisPengawasan[],
  now: Date
): { objekAudit: ObjekAudit[]; penilaianRisiko: PenilaianRisiko[]; baselinePrioritas: BaselinePrioritas[] } {
  const tahunAnggaran = String(now.getFullYear());
  const jpUtama = jenisPengawasan.find((j) => j.id === 'JP-01' && j.aktif) ?? jenisPengawasan.find((j) => !j.induk && j.aktif);
  const targetOrgs = orgUnits.filter((o) => o.aktif && ['Polda', 'Satker Mabes', 'Satker Polda'].includes(o.jenjang) && !!o.tip);

  const objekAudit: ObjekAudit[] = [];
  const penilaianRisiko: PenilaianRisiko[] = [];

  targetOrgs.forEach((org, idx) => {
    const f = seededFraction(org.id);
    const status: ObjekAuditStatus = f < 0.15 ? 'Draft' : f < 0.35 ? 'Siap Dinilai' : 'Dinilai';
    const objId = `OBJ-${tahunAnggaran}-${String(idx + 1).padStart(3, '0')}`;
    objekAudit.push({
      id: objId,
      orgId: org.id,
      tahunAnggaran,
      jpId: jpUtama?.id ?? 'JP-01',
      status,
      kelengkapanPct: status === 'Draft' ? Math.round(20 + f * 40) : Math.round(70 + f * 30),
      catatan: '',
    });

    if (status === 'Dinilai') {
      const faktor: Record<RisikoFaktorKey, number> = {} as Record<RisikoFaktorKey, number>;
      RISIKO_FAKTOR_LIST.forEach((fk, fi) => {
        faktor[fk.key] = 1 + Math.round(seededFraction(`${org.id}-${fk.key}-${fi}`) * 4);
      });
      const totalMax = RISIKO_FAKTOR_LIST.length * 5;
      const skor = Math.round((Object.values(faktor).reduce((a, b) => a + b, 0) / totalMax) * 25);
      const statusRisiko: PenilaianRisikoStatus = f < 0.6 ? 'Disetujui' : f < 0.8 ? 'Diajukan' : 'Dikembalikan';
      penilaianRisiko.push({
        id: `RSK-${objId}`,
        objekAuditId: objId,
        orgId: org.id,
        tahunAnggaran,
        faktor,
        skor,
        level: skorToLevel(skor),
        catatan: '',
        status: statusRisiko,
        dinilaiOleh: 'Tim Risiko Itwasum',
        tglDinilai: addDaysIso(now, -Math.round(f * 30)),
        direviewOleh: statusRisiko === 'Dikembalikan' || statusRisiko === 'Disetujui' ? 'Koordinator Pengendali' : '',
        tglReview: statusRisiko === 'Disetujui' ? addDaysIso(now, -Math.round(f * 10)) : null,
        catatanReview: statusRisiko === 'Dikembalikan' ? 'Lengkapi bukti pendukung faktor Kompleksitas Operasi & SDM sebelum diajukan kembali.' : '',
      });
    }
  });

  const approved = penilaianRisiko.filter((p) => p.status === 'Disetujui').sort((a, b) => b.skor - a.skor);
  const baselinePrioritas: BaselinePrioritas[] = approved.length
    ? [
        {
          id: `BASE-${tahunAnggaran}-01`,
          versi: 1,
          tahunAnggaran: String(now.getFullYear() + 1),
          lockedAt: addDaysIso(now, -14),
          lockedOleh: 'Koordinator Pengendali',
          items: approved.map((p, rank) => ({
            objekAuditId: p.objekAuditId,
            rank: rank + 1,
            skor: p.skor,
            masuk: rank < Math.max(1, Math.round(approved.length * 0.6)),
            alasan: rank < Math.max(1, Math.round(approved.length * 0.6)) ? 'Termasuk kapasitas OH PKPT tahun berikutnya.' : 'Ditunda — menunggu kapasitas OH tersedia.',
          })),
        },
      ]
    : [];

  return { objekAudit, penilaianRisiko, baselinePrioritas };
}

const uid = (prefix = 'F') => `${prefix}${Math.random().toString(36).slice(2, 9)}`;

function nowStamp(): string {
  const d = new Date();
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

function resolvePermintaanSeed(defs: PermintaanSeedDef[], now: Date) {
  const permintaan: Permintaan[] = [];
  const berkas: Record<string, Record<string, BerkasSatker[]>> = {};
  const selesai: Record<string, Record<string, string>> = {};

  defs.forEach((def, idx) => {
    const id = `PMT-${now.getFullYear()}-${String(idx + 1).padStart(3, '0')}`;
    const log: PermintaanLogEntry[] = def.log.map((l) => ({
      id: uid('LOG'),
      waktu: isoDateTime(addDaysIso(now, l.offsetDays), l.jam),
      oleh: l.oleh,
      aksi: l.aksi,
      orgId: l.orgId ?? null,
    }));
    permintaan.push({
      id,
      tipe: def.tipe,
      judul: def.judul,
      jpId: def.jpId,
      tahunAnggaran: def.tahunAnggaran,
      periodeLabel: def.periodeLabel,
      mulai: addDaysIso(now, def.mulaiOffsetDays),
      selesai: addDaysIso(now, def.selesaiOffsetDays),
      dibuat: addDaysIso(now, def.dibuatOffsetDays),
      dikirim: def.dikirimOffsetDays !== undefined ? addDaysIso(now, def.dikirimOffsetDays) : undefined,
      ditutup: def.ditutupOffsetDays !== undefined ? addDaysIso(now, def.ditutupOffsetDays) : undefined,
      pesan: def.pesan,
      lampiran: def.lampiran ?? [],
      sasaran: def.sasaran,
      status: def.status,
      penugasan: def.penugasan,
      log,
    });

    if (def.berkas) {
      berkas[id] = {};
      for (const [orgId, files] of Object.entries(def.berkas)) {
        berkas[id][orgId] = files.map((f) => ({
          id: uid(),
          nama: f.nama,
          sizeBytes: f.sizeBytes,
          dokId: f.dokId,
          keterangan: f.keterangan ?? '',
          status: f.status,
          tgl: f.offsetDays !== null ? addDaysIso(now, f.offsetDays) : null,
          terlambat: !!f.terlambat,
          catatan: f.catatan ?? '',
          verifikatorOleh: f.verifikatorOleh ?? '',
          tglVerifikasi: f.verifikasiOffsetDays != null ? addDaysIso(now, f.verifikasiOffsetDays) : null,
        }));
      }
    }
    if (def.selesaiOffsetDaysByOrgId) {
      selesai[id] = {};
      for (const [orgId, off] of Object.entries(def.selesaiOffsetDaysByOrgId)) {
        selesai[id][orgId] = addDaysIso(now, off);
      }
    }
  });

  return { permintaan, berkas, selesai };
}

function resolveLaporanEntries(now: Date, tahunAnggaran: string, entries: LaporanSeedEntry[]): LaporanEntry[] {
  return entries.map((e) => ({
    id: uid('LAP'),
    jenis: e.jenis,
    key: e.key,
    tahunAnggaran,
    status: e.status,
    fileNama: `${e.jenis}_${e.key}_${tahunAnggaran}.pdf`,
    fileSizeBytes: 400000 + Math.round(Math.random() * 2500000),
    tgl: addDaysIso(now, e.offsetDays),
    catatan: e.catatan ?? '',
    verifikatorOleh: e.verifikatorOleh ?? '',
    tglVerifikasi: e.verifikasiOffsetDays != null ? addDaysIso(now, e.verifikasiOffsetDays) : null,
    skor: e.skor ?? null,
    realisasi: e.realisasi ?? null,
  }));
}

function resolveLaporanSeed(now: Date): Record<string, LaporanEntry[]> {
  const laporan: Record<string, LaporanEntry[]> = {};
  const tahunBerjalan = String(now.getFullYear());
  const tahunLalu = String(now.getFullYear() - 1);
  for (const [orgId, entries] of Object.entries(LAPORAN_SEED_BERJALAN)) {
    laporan[orgId] = [...(laporan[orgId] ?? []), ...resolveLaporanEntries(now, tahunBerjalan, entries)];
  }
  for (const [orgId, entries] of Object.entries(LAPORAN_SEED_TAHUN_LALU)) {
    laporan[orgId] = [...(laporan[orgId] ?? []), ...resolveLaporanEntries(now, tahunLalu, entries)];
  }
  return laporan;
}

/** 4.3 Objek Pemeriksaan — satu entri demo-representatif per Jenis Pengawasan induk aktif
 * (Plane B.1 Pra-Audit "Objek Pengawasan", digabung ke B.12 4.3). */
function buildObjekPemeriksaanSeed(jenisPengawasan: JenisPengawasan[]): ObjekPemeriksaan[] {
  const siklusList: ObjekPemeriksaan['siklus'][] = ['Tahunan', 'Semesteran', 'Triwulanan', 'Ad-hoc'];
  return jenisPengawasan
    .filter((j) => !j.induk && j.aktif)
    .map((j, idx) => ({
      id: `OP-${String(idx + 1).padStart(3, '0')}`,
      jpId: j.id,
      nama: `Objek Pemeriksaan ${j.nama}`,
      bidang: 'Umum & Operasional',
      siklus: siklusList[idx % siklusList.length],
      dasarHukum: 'Peraturan Kapolri tentang Pengawasan dan Pemeriksaan di Lingkungan Polri',
      aktif: true,
    }));
}

/** 4.4 Tab Template — satu template demo per dokumen berjenis "Data" (Plane B.1 Pra-Audit
 * "Template Dokumen", digabung sebagai tab di dalam 4.4 Katalog). */
function buildTemplateSeed(katalog: KatalogDokumen[]): TemplateDokumen[] {
  return katalog
    .filter((d) => d.jenis === 'Data')
    .slice(0, 12)
    .map((d, idx) => ({
      id: `TPL-${String(idx + 1).padStart(3, '0')}`,
      dokId: d.id,
      nama: `Template ${d.nama}`,
      fields: [
        { nama: 'Nama Satker', tipe: 'Teks' as const },
        { nama: 'Periode', tipe: 'Tanggal' as const },
        { nama: 'Nilai/Realisasi', tipe: 'Angka' as const },
      ],
      contohBakuUrl: `contoh-baku_${d.id}.xlsx`,
      versi: 1,
      aktif: true,
    }));
}

function buildSeedState(): AuditUniverseState {
  const now = startOfToday();
  const { permintaan, berkas, selesai } = resolvePermintaanSeed(PERMINTAAN_SEED, now);
  const orgUnits = ORG_UNITS_SEED.map((o) => ({ ...o }));
  const jenisPengawasan = JENIS_PENGAWASAN_SEED.map((j) => ({ ...j }));
  const katalog = KATALOG_DOKUMEN_SEED.map((d) => ({ ...d }));
  const { objekAudit, penilaianRisiko, baselinePrioritas } = buildObjekAuditAndRisikoSeed(orgUnits, jenisPengawasan, now);
  return {
    seedVersion: SEED_VERSION,
    orgUnits,
    tipologi: TIPOLOGI_SEED.map((t) => ({ ...t })),
    jenisPengawasan,
    bidjemen: BIDJEMEN_SEED.map((b) => ({ ...b })),
    katalog,
    permintaan,
    berkas,
    selesai,
    laporan: resolveLaporanSeed(now),
    mappingRules: buildMappingSeed(jenisPengawasan, katalog),
    aturanValidasi: buildAturanValidasiSeed(katalog),
    objekAudit,
    penilaianRisiko,
    baselinePrioritas,
    objekPemeriksaan: buildObjekPemeriksaanSeed(jenisPengawasan),
    templateDokumen: buildTemplateSeed(katalog),
    slots: [],
    claims: {},
  };
}

function loadInitial(): AuditUniverseState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as AuditUniverseState;
      if (parsed && parsed.seedVersion === SEED_VERSION) return parsed;
    }
  } catch {
    // ignore corrupt storage, fall through to fresh seed
  }
  return buildSeedState();
}

let state: AuditUniverseState = typeof localStorage !== 'undefined' ? loadInitial() : buildSeedState();
const listeners = new Set<() => void>();

function persist() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage full/unavailable — state still lives in-memory for this session
  }
}

function setState(next: AuditUniverseState) {
  state = next;
  persist();
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void): () => void {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot(): AuditUniverseState {
  return state;
}

export function useAuditUniverseStore(): AuditUniverseState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getAuditUniverseState(): AuditUniverseState {
  return state;
}

export function resetAuditUniverseSeed(): void {
  setState(buildSeedState());
}

/* =====================================================================================
 * SELECTORS
 * ===================================================================================== */

export function getOrgById(orgId: string | null | undefined): OrgUnit | undefined {
  if (!orgId) return undefined;
  return state.orgUnits.find((o) => o.id === orgId);
}

export function getOrgKids(orgId: string): OrgUnit[] {
  return state.orgUnits.filter((o) => o.induk === orgId);
}

export function getOrgDescendants(orgId: string): OrgUnit[] {
  const out: OrgUnit[] = [];
  getOrgKids(orgId).forEach((kid) => {
    out.push(kid);
    out.push(...getOrgDescendants(kid.id));
  });
  return out;
}

/** Manual pada Polda & Satker Mabes; unit lain mewarisi via induk (identik prototipe `itwilOf`). */
export function getItwilOf(org: OrgUnit | undefined): string {
  if (!org || org.jenjang === 'Mabes Polri') return '';
  if (org.jenjang === 'Polda' || org.jenjang === 'Satker Mabes') return org.itwil || '';
  return getItwilOf(getOrgById(org.induk));
}

export function getTipById(tipId: string | null | undefined): Tipologi | undefined {
  if (!tipId) return undefined;
  return state.tipologi.find((t) => t.id === tipId);
}

export function tipCount(tipId: string): number {
  return state.orgUnits.filter((o) => o.tip === tipId).length;
}

export function getJpById(jpId: string): JenisPengawasan | undefined {
  return state.jenisPengawasan.find((j) => j.id === jpId);
}

export function getJpSubs(jpId: string): JenisPengawasan[] {
  return state.jenisPengawasan.filter((j) => j.induk === jpId);
}

export function getBjById(bjId: string): Bidjemen | undefined {
  return state.bidjemen.find((b) => b.id === bjId);
}

export function getDokById(dokId: string): KatalogDokumen | undefined {
  return state.katalog.find((d) => d.id === dokId);
}

export function getPermintaanById(reqId: string): Permintaan | undefined {
  return state.permintaan.find((r) => r.id === reqId);
}

export function reqStatusTurunan(r: Permintaan): PermintaanStatusTurunan {
  if (r.status === 'Draft') return 'Draft';
  if (r.status === 'Ditutup') return 'Ditutup';
  return daysDiffFromToday(r.mulai) > 0 ? 'Dijadwalkan' : 'Berjalan';
}

export function getBerkas(reqId: string, orgId: string): BerkasSatker[] {
  return state.berkas[reqId]?.[orgId] ?? [];
}

export function getSentBerkas(reqId: string, orgId: string): BerkasSatker[] {
  return getBerkas(reqId, orgId).filter((f) => f.status !== 'draft');
}

export function isSelesai(reqId: string, orgId: string): boolean {
  return !!state.selesai[reqId]?.[orgId];
}

const STAGE_PCT: Record<StageSatker, number> = {
  'Belum Mulai': 0,
  'Sedang Mengunggah': 33,
  'Sudah Mengirim': 67,
  Selesai: 100,
};

export function stageOf(reqId: string, orgId: string): StageSatker {
  if (isSelesai(reqId, orgId)) return 'Selesai';
  const sent = getSentBerkas(reqId, orgId);
  if (sent.length) return 'Sudah Mengirim';
  if (getBerkas(reqId, orgId).length) return 'Sedang Mengunggah';
  return 'Belum Mulai';
}

export interface SatkerStatusBadge {
  label: string;
  stage: StageSatker;
  pct: number;
  terlambat: boolean;
  perluPerbaikan: boolean;
}

export function satkerStatus(r: Permintaan, orgId: string): SatkerStatusBadge {
  const stage = stageOf(r.id, orgId);
  const pct = STAGE_PCT[stage];
  const perluPerbaikan = getBerkas(r.id, orgId).some((f) => f.status === 'fix');
  if (stage === 'Selesai') return { label: 'Selesai', stage, pct, terlambat: false, perluPerbaikan: false };
  if (perluPerbaikan) return { label: 'Perlu Perbaikan', stage, pct, terlambat: false, perluPerbaikan: true };
  if (r.status !== 'Draft' && daysDiffFromToday(r.selesai) < 0) {
    return { label: 'Terlambat', stage, pct, terlambat: true, perluPerbaikan: false };
  }
  return { label: stage, stage, pct, terlambat: false, perluPerbaikan: false };
}

export function progress(r: Permintaan): { done: number; total: number } {
  return { done: r.sasaran.filter((o) => isSelesai(r.id, o)).length, total: r.sasaran.length };
}

export interface DeadlineItem {
  judul: string;
  tgl: string;
  mulai: string;
  tipe: string;
  reqId?: string;
  laporanJenis?: 'IKU' | 'SPIP';
}

export function deadlinesForOrg(orgId: string): DeadlineItem[] {
  const out: DeadlineItem[] = [];
  state.permintaan
    .filter((r) => r.sasaran.includes(orgId) && reqStatusTurunan(r) === 'Berjalan' && !isSelesai(r.id, orgId) && daysDiffFromToday(r.selesai) >= 0)
    .forEach((r) => out.push({ judul: r.judul, tgl: r.selesai, mulai: r.mulai, tipe: r.tipe === 'Berkala' ? 'Permintaan' : 'Tambahan Audit', reqId: r.id }));

  const tahunBerjalan = String(startOfToday().getFullYear());
  ([['IKU', IKU_SLOTS], ['SPIP', SPIP_SLOTS]] as const).forEach(([jenis, slots]) => {
    slots.forEach((sl) => {
      const lap = (state.laporan[orgId] ?? []).find((l) => l.jenis === jenis && l.key === sl.key && l.tahunAnggaran === tahunBerjalan);
      const st = laporanStatusLabel(sl, lap, tahunBerjalan);
      if (['Perlu Diunggah', 'Belum Dikirim', 'Perlu Perbaikan', 'Terlambat'].includes(st)) {
        const win = slotWindow(sl, tahunBerjalan, lap);
        out.push({ judul: `${sl.nama} ${tahunBerjalan}`, tgl: lap?.tgl ?? win.tenggatIso, mulai: '', tipe: `Laporan ${jenis}`, laporanJenis: jenis });
      }
    });
  });
  return out.sort((a, b) => (a.tgl < b.tgl ? -1 : 1));
}

export interface SlotWindow {
  bukaIso: string;
  tenggatIso: string;
  /** "Hari ini" sudah melewati tanggal buka slot ini. */
  sudahDibuka: boolean;
  /** Tenggat sudah lewat dan belum ada laporan terkirim (wait/ok) untuk slot ini. */
  terlambat: boolean;
}

/** Menghitung jendela dibuka/tenggat suatu slot laporan untuk TA tertentu (identik `slotsFor`
 * prototipe: `y`/`y0`/`y1` = TA/TA-1/TA+1), lihat `LaporanSlotDef.bukaTahunSebelumnya`/`tenggatTahunBerikut`. */
export function slotWindow(slot: LaporanSlotDef, tahunAnggaran: string, lap?: LaporanEntry): SlotWindow {
  const ta = Number(tahunAnggaran);
  const bukaTahun = slot.bukaTahunSebelumnya ? ta - 1 : ta;
  const tenggatTahun = slot.tenggatTahunBerikut ? ta + 1 : ta;
  const bukaIso = `${bukaTahun}-${slot.bukaMd}`;
  const tenggatIso = `${tenggatTahun}-${slot.tenggatMd}`;
  const sudahDibuka = daysDiffFromToday(bukaIso) <= 0;
  const belumTerkirim = !lap || lap.status === 'draft';
  const terlambat = belumTerkirim && daysDiffFromToday(tenggatIso) < 0;
  return { bukaIso, tenggatIso, sudahDibuka, terlambat };
}

export function laporanStatusLabel(slot: LaporanSlotDef, lap: LaporanEntry | undefined, tahunAnggaran?: string): string {
  const win = tahunAnggaran ? slotWindow(slot, tahunAnggaran, lap) : undefined;
  if (lap) {
    if (lap.status === 'draft') return 'Belum Dikirim';
    if (lap.status === 'wait' && win?.terlambat) return 'Terlambat';
    return BERKAS_STATUS_LABEL_LOCAL[lap.status];
  }
  if (win && !win.sudahDibuka) return 'Belum Dibuka';
  if (win?.terlambat) return 'Terlambat';
  return 'Perlu Diunggah';
}
const BERKAS_STATUS_LABEL_LOCAL: Record<BerkasStatus, string> = {
  draft: 'Belum Dikirim',
  wait: 'Menunggu Verifikasi',
  ok: 'Diterima',
  fix: 'Perlu Perbaikan',
};

export function findLaporan(orgId: string, jenis: 'IKU' | 'SPIP', key: string, tahunAnggaran: string): LaporanEntry | undefined {
  return (state.laporan[orgId] ?? []).find((l) => l.jenis === jenis && l.key === key && l.tahunAnggaran === tahunAnggaran);
}

export interface FeedItem {
  waktu: string;
  oleh: string;
  aksi: string;
  konteks: string;
}

/** Gabungan log permintaan (milik org tsb atau umum) + verifikasi laporan, terbaru dulu. */
export function feedForOrg(orgId: string, limit = 14): FeedItem[] {
  const out: FeedItem[] = [];
  state.permintaan.forEach((r) => {
    if (!r.sasaran.includes(orgId) || r.status === 'Draft') return;
    r.log.forEach((l) => {
      if (l.orgId && l.orgId !== orgId) return;
      out.push({ waktu: l.waktu, oleh: l.oleh, aksi: l.aksi, konteks: r.judul });
    });
  });
  (state.laporan[orgId] ?? []).forEach((l) => {
    if (l.tglVerifikasi) {
      out.push({ waktu: isoDateTime(l.tglVerifikasi), oleh: l.verifikatorOleh || 'Verifikator', aksi: l.status === 'ok' ? `Menerima Laporan ${l.jenis} ${l.key}` : `Mengembalikan Laporan ${l.jenis} ${l.key}`, konteks: 'Laporan Berkala' });
    }
  });
  return out.sort((a, b) => (a.waktu < b.waktu ? 1 : -1)).slice(0, limit);
}

/** 7.1 Antrean Verifikasi: seluruh berkas permintaan + laporan berstatus "wait". */
export interface VerifikasiQueueItem {
  kind: 'berkas' | 'laporan';
  reqId?: string;
  laporanJenis?: 'IKU' | 'SPIP';
  laporanKey?: string;
  orgId: string;
  fileId: string;
  nama: string;
  dokNama: string;
  tgl: string | null;
  judulKonteks: string;
}

export function verifikasiQueue(): VerifikasiQueueItem[] {
  const out: VerifikasiQueueItem[] = [];
  state.permintaan.forEach((r) => {
    r.sasaran.forEach((orgId) => {
      getBerkas(r.id, orgId).forEach((f) => {
        if (f.status !== 'wait') return;
        out.push({
          kind: 'berkas',
          reqId: r.id,
          orgId,
          fileId: f.id,
          nama: f.nama,
          dokNama: f.dokId === 'LAINNYA' ? 'Lainnya' : getDokById(f.dokId)?.nama ?? f.dokId,
          tgl: f.tgl,
          judulKonteks: r.judul,
        });
      });
    });
  });
  Object.entries(state.laporan).forEach(([orgId, entries]) => {
    entries.forEach((l) => {
      if (l.status !== 'wait') return;
      out.push({
        kind: 'laporan',
        laporanJenis: l.jenis,
        laporanKey: l.key,
        orgId,
        fileId: l.id,
        nama: l.fileNama,
        dokNama: `Laporan ${l.jenis} · ${l.key}`,
        tgl: l.tgl,
        judulKonteks: `Laporan ${l.jenis} ${l.tahunAnggaran}`,
      });
    });
  });
  return out.sort((a, b) => (a.tgl ?? '').localeCompare(b.tgl ?? ''));
}

export { IKU_SLOTS, SPIP_SLOTS, HISTORI_KIRIM_14_HARI };

/* =====================================================================================
 * MUTATIONS — Master Data (4.1-4.4)
 * ===================================================================================== */

function nextOrgNumericId(): string {
  const nums = state.orgUnits.map((o) => parseInt(o.id.replace('ORG-', ''), 10)).filter((n) => !Number.isNaN(n));
  const next = Math.max(900, ...nums) + 1;
  return `ORG-${String(next).padStart(5, '0')}`;
}

export function isOrgKodeUnique(kode: string, excludeId?: string): boolean {
  if (!kode) return true;
  return !state.orgUnits.some((o) => o.kode === kode && o.id !== excludeId);
}

/** Satker/unit yang sedang dipakai (tipologi ditetapkan / ditandai `perm`) tidak bisa dihapus. */
export function isOrgInUse(org: OrgUnit): boolean {
  return !!(org.tip || org.perm) || getOrgKids(org.id).length > 0;
}

function pushOrgHistory(org: OrgUnit, aksi: string, oleh: string): OrgUnit {
  const entry: MasterDataHistoryEntry = { waktu: nowStamp(), oleh, aksi };
  return { ...org, history: [...(org.history ?? []), entry] };
}

export function createOrgUnit(input: Omit<OrgUnit, 'id' | 'aktif' | 'history'>, oleh = 'Admin Itwasum'): OrgUnit {
  let org: OrgUnit = { ...input, id: nextOrgNumericId(), aktif: true };
  org = pushOrgHistory(org, 'Membuat entri organisasi baru', oleh);
  setState({ ...state, orgUnits: [...state.orgUnits, org] });
  return org;
}

export function updateOrgUnit(id: string, patch: Partial<OrgUnit>, oleh = 'Admin Itwasum'): void {
  setState({
    ...state,
    orgUnits: state.orgUnits.map((o) => (o.id === id ? pushOrgHistory({ ...o, ...patch }, 'Mengubah data organisasi', oleh) : o)),
  });
}

/** Menonaktifkan Polda/Satker Mabes ikut menonaktifkan seluruh unit turunannya (cascade). */
export function setOrgActive(id: string, aktif: boolean, alasan = '', oleh = 'Admin Itwasum'): void {
  const target = getOrgById(id);
  if (!target) return;
  const affectedIds = new Set([id, ...getOrgDescendants(id).map((o) => o.id)]);
  setState({
    ...state,
    orgUnits: state.orgUnits.map((o) =>
      affectedIds.has(o.id) ? pushOrgHistory({ ...o, aktif, alasan: aktif ? '' : alasan }, aktif ? 'Mengaktifkan kembali' : `Menonaktifkan (${alasan || 'tanpa alasan'})`, oleh) : o
    ),
  });
}

export function deleteOrgUnit(id: string): { ok: boolean; reason?: string } {
  const org = getOrgById(id);
  if (!org) return { ok: false, reason: 'Data tidak ditemukan.' };
  if (isOrgInUse(org)) return { ok: false, reason: 'Satker/unit ini memiliki tipologi terpasang atau unit turunan — nonaktifkan saja, tidak bisa dihapus.' };
  setState({ ...state, orgUnits: state.orgUnits.filter((o) => o.id !== id) });
  return { ok: true };
}

export function createTipologi(input: Omit<Tipologi, 'id' | 'aktif'>): Tipologi {
  const seq = state.tipologi.length + 1;
  const t: Tipologi = { ...input, id: `TIP-${String(seq).padStart(3, '0')}`, aktif: true };
  setState({ ...state, tipologi: [...state.tipologi, t] });
  return t;
}

export function updateTipologi(id: string, patch: Partial<Tipologi>): void {
  setState({ ...state, tipologi: state.tipologi.map((t) => (t.id === id ? { ...t, ...patch } : t)) });
}

export function setTipologiActive(id: string, aktif: boolean): void {
  setState({ ...state, tipologi: state.tipologi.map((t) => (t.id === id ? { ...t, aktif } : t)) });
}

export function deleteTipologi(id: string): { ok: boolean; reason?: string } {
  if (tipCount(id) > 0) return { ok: false, reason: 'Tipologi ini masih dipakai satu atau lebih Satker — nonaktifkan saja.' };
  setState({ ...state, tipologi: state.tipologi.filter((t) => t.id !== id) });
  return { ok: true };
}

/** Menetapkan/mengosongkan tipologi Satker (4.2 tab "Tipologi Satker") — mengubah tipologi
 * mensyaratkan persetujuan berupa nomor & tanggal SK (Plan p1-b12-nav-master, tabel 4.2). */
export function assignTipologiToOrg(orgId: string, tipId: string | null, sk: { nomor: string; tanggal: string }, oleh = 'Admin Itwasum'): { ok: boolean; reason?: string } {
  if (tipId !== null && !sk.nomor.trim()) return { ok: false, reason: 'Nomor SK persetujuan wajib diisi untuk menetapkan/mengubah tipologi.' };
  updateOrgUnit(
    orgId,
    { tip: tipId, tipSkNomor: tipId ? sk.nomor.trim() : '', tipSkTanggal: tipId ? sk.tanggal : '', tipDisetujuiOleh: tipId ? oleh : '' },
    oleh
  );
  return { ok: true };
}

export function createJenisPengawasan(input: Omit<JenisPengawasan, 'id' | 'aktif' | 'dipakai'>): JenisPengawasan {
  const seq = state.jenisPengawasan.filter((j) => !j.induk).length + 1;
  const jp: JenisPengawasan = { ...input, id: `JP-${String(seq).padStart(2, '0')}`, aktif: true, dipakai: false };
  setState({ ...state, jenisPengawasan: [...state.jenisPengawasan, jp] });
  return jp;
}

export function updateJenisPengawasan(id: string, patch: Partial<JenisPengawasan>): void {
  setState({ ...state, jenisPengawasan: state.jenisPengawasan.map((j) => (j.id === id ? { ...j, ...patch } : j)) });
}

/** Menonaktifkan induk ikut menonaktifkan seluruh sub-jenisnya (cascade). */
export function setJenisPengawasanActive(id: string, aktif: boolean): void {
  const affected = new Set([id, ...getJpSubs(id).map((j) => j.id)]);
  setState({ ...state, jenisPengawasan: state.jenisPengawasan.map((j) => (affected.has(j.id) ? { ...j, aktif } : j)) });
}

export function deleteJenisPengawasan(id: string): { ok: boolean; reason?: string } {
  const jp = getJpById(id);
  if (jp?.dipakai) return { ok: false, reason: 'Jenis pengawasan ini sudah dipakai pada permintaan pengumpulan data — nonaktifkan saja.' };
  if (getJpSubs(id).length > 0) return { ok: false, reason: 'Jenis pengawasan ini memiliki sub-jenis — hapus/nonaktifkan sub-jenisnya dahulu.' };
  setState({ ...state, jenisPengawasan: state.jenisPengawasan.filter((j) => j.id !== id) });
  return { ok: true };
}

export function createBidjemen(input: Omit<Bidjemen, 'id' | 'aktif'>): Bidjemen {
  const seq = state.bidjemen.length + 1;
  const bj: Bidjemen = { ...input, id: `BJ-${String(seq).padStart(2, '0')}`, aktif: true };
  setState({ ...state, bidjemen: [...state.bidjemen, bj] });
  return bj;
}

export function updateBidjemen(id: string, patch: Partial<Bidjemen>): void {
  setState({ ...state, bidjemen: state.bidjemen.map((b) => (b.id === id ? { ...b, ...patch } : b)) });
}

export function setBidjemenActive(id: string, aktif: boolean): void {
  setState({ ...state, bidjemen: state.bidjemen.map((b) => (b.id === id ? { ...b, aktif } : b)) });
}

export function deleteBidjemen(id: string): { ok: boolean; reason?: string } {
  setState({ ...state, bidjemen: state.bidjemen.filter((b) => b.id !== id) });
  return { ok: true };
}

export function createKatalogDokumen(input: Omit<KatalogDokumen, 'id' | 'aktif' | 'dipakai' | 'cek'>): KatalogDokumen {
  const seq = state.katalog.filter((d) => d.kat === input.kat).length + 1;
  const dok: KatalogDokumen = { ...input, id: `DOK-${input.kat}-${String(seq).padStart(3, '0')}`, aktif: true, dipakai: false, cek: [] };
  setState({ ...state, katalog: [...state.katalog, dok] });
  return dok;
}

export function updateKatalogDokumen(id: string, patch: Partial<KatalogDokumen>): void {
  setState({ ...state, katalog: state.katalog.map((d) => (d.id === id ? { ...d, ...patch, cek: [] } : d)) });
}

export function setKatalogDokumenActive(id: string, aktif: boolean): void {
  setState({ ...state, katalog: state.katalog.map((d) => (d.id === id ? { ...d, aktif } : d)) });
}

export function deleteKatalogDokumen(id: string): { ok: boolean; reason?: string } {
  const dok = state.katalog.find((d) => d.id === id);
  if (dok?.dipakai) return { ok: false, reason: 'Dokumen ini sudah dipakai pada permintaan pengumpulan data — nonaktifkan saja.' };
  setState({ ...state, katalog: state.katalog.filter((d) => d.id !== id) });
  return { ok: true };
}

/* =====================================================================================
 * MUTATIONS — 4.3 Objek Pemeriksaan, 4.4 Tab Template
 * ===================================================================================== */

export function createObjekPemeriksaan(input: Omit<ObjekPemeriksaan, 'id' | 'aktif'>): ObjekPemeriksaan {
  const seq = state.objekPemeriksaan.length + 1;
  const op: ObjekPemeriksaan = { ...input, id: `OP-${String(seq).padStart(3, '0')}`, aktif: true };
  setState({ ...state, objekPemeriksaan: [...state.objekPemeriksaan, op] });
  return op;
}

export function updateObjekPemeriksaan(id: string, patch: Partial<ObjekPemeriksaan>): void {
  setState({ ...state, objekPemeriksaan: state.objekPemeriksaan.map((o) => (o.id === id ? { ...o, ...patch } : o)) });
}

export function setObjekPemeriksaanActive(id: string, aktif: boolean): void {
  setState({ ...state, objekPemeriksaan: state.objekPemeriksaan.map((o) => (o.id === id ? { ...o, aktif } : o)) });
}

export function deleteObjekPemeriksaan(id: string): void {
  setState({ ...state, objekPemeriksaan: state.objekPemeriksaan.filter((o) => o.id !== id) });
}

export function getObjekPemeriksaanByJp(jpId: string): ObjekPemeriksaan[] {
  return state.objekPemeriksaan.filter((o) => o.jpId === jpId);
}

export function createTemplateDokumen(input: Omit<TemplateDokumen, 'id' | 'versi' | 'aktif'>): TemplateDokumen {
  const seq = state.templateDokumen.length + 1;
  const t: TemplateDokumen = { ...input, id: `TPL-${String(seq).padStart(3, '0')}`, versi: 1, aktif: true };
  setState({ ...state, templateDokumen: [...state.templateDokumen, t] });
  return t;
}

export function updateTemplateDokumen(id: string, patch: Partial<TemplateDokumen>): void {
  setState({
    ...state,
    templateDokumen: state.templateDokumen.map((t) => (t.id === id ? { ...t, ...patch, versi: patch.versi === undefined ? t.versi + 1 : patch.versi } : t)),
  });
}

export function setTemplateDokumenActive(id: string, aktif: boolean): void {
  setState({ ...state, templateDokumen: state.templateDokumen.map((t) => (t.id === id ? { ...t, aktif } : t)) });
}

export function getTemplateByDok(dokId: string): TemplateDokumen | undefined {
  return state.templateDokumen.find((t) => t.dokId === dokId);
}

/* =====================================================================================
 * MUTATIONS — Permintaan Pengumpulan Data (5.1)
 * ===================================================================================== */

function nextPermintaanId(): string {
  const year = new Date().getFullYear();
  const seq = state.permintaan.filter((r) => r.id.startsWith(`PMT-${year}-`)).length + 1;
  return `PMT-${year}-${String(seq).padStart(3, '0')}`;
}

function addLog(r: Permintaan, aksi: string, oleh: string, orgId?: string | null): Permintaan {
  return { ...r, log: [...r.log, { id: uid('LOG'), waktu: nowStamp(), oleh, aksi, orgId: orgId ?? null }] };
}

export interface CreatePermintaanInput {
  judul: string;
  tipe: Permintaan['tipe'];
  jpId: string;
  tahunAnggaran: string;
  periodeLabel: string;
  mulai: string;
  selesai: string;
  pesan: string;
  sasaran: string[];
  lampiran?: { nama: string; sizeBytes: number }[];
}

export function createPermintaanDraft(input: CreatePermintaanInput, oleh: string): Permintaan {
  const r: Permintaan = {
    id: nextPermintaanId(),
    tipe: input.tipe,
    judul: input.judul,
    jpId: input.jpId,
    tahunAnggaran: input.tahunAnggaran,
    periodeLabel: input.periodeLabel,
    mulai: input.mulai,
    selesai: input.selesai,
    dibuat: startOfToday().toISOString().slice(0, 10),
    pesan: input.pesan,
    lampiran: input.lampiran ?? [],
    sasaran: input.sasaran,
    status: 'Draft',
    log: [],
  };
  const withLog = addLog(r, 'Membuat permintaan (Draft)', oleh);
  setState({ ...state, permintaan: [...state.permintaan, withLog] });
  return withLog;
}

export function updatePermintaanDraft(id: string, patch: Partial<CreatePermintaanInput>, oleh: string): void {
  setState({
    ...state,
    permintaan: state.permintaan.map((r) => {
      if (r.id !== id || r.status !== 'Draft') return r;
      const updated: Permintaan = { ...r, ...patch };
      return addLog(updated, 'Mengubah data permintaan (Draft)', oleh);
    }),
  });
}

/** 5.3 Publish — mengambil snapshot Mapping (5.1) yang berlaku untuk jenis pengawasan &
 * tipologi tiap Satker sasaran, lalu membuat satu Slot Dokumen (6.1) per dokumen wajib
 * (Plan p1-b12-collection, BR "Publish takes a snapshot..."). Hanya berjalan untuk permintaan
 * yang baru dikirim setelah fitur ini ada — data seed lama tetap memakai unggah bebas. */
function generateSlotsForPermintaan(r: Permintaan): DokumenSlot[] {
  const today = startOfToday().toISOString().slice(0, 10);
  const out: DokumenSlot[] = [];
  let seq = state.slots.length;
  r.sasaran.forEach((orgId) => {
    const org = getOrgById(orgId);
    const wajibDocs = dokumenWajibUntuk(r.jpId, org?.tip);
    wajibDocs.forEach((dok) => {
      seq += 1;
      out.push({
        id: `SLOT-${String(seq).padStart(4, '0')}`,
        reqId: r.id,
        orgId,
        dokId: dok.id,
        pic: '',
        tenggatInternal: null,
        dikecualikan: false,
        alasanKecualikan: '',
        dibuat: today,
      });
    });
  });
  return out;
}

export function sendPermintaan(id: string, oleh: string): void {
  const target = getPermintaanById(id);
  if (!target || target.status !== 'Draft') return;
  const newSlots = generateSlotsForPermintaan(target);
  setState({
    ...state,
    permintaan: state.permintaan.map((r) => {
      if (r.id !== id) return r;
      const updated: Permintaan = { ...r, status: 'Terkirim', dikirim: startOfToday().toISOString().slice(0, 10) };
      return addLog(updated, `Mengirim permintaan ke ${r.sasaran.length} Satker${newSlots.length ? ` (${newSlots.length} slot dokumen dipublikasikan dari Mapping 5.1)` : ''}`, oleh);
    }),
    slots: [...state.slots, ...newSlots],
  });
}

/* =====================================================================================
 * SELECTORS/MUTATIONS — 6.1 Slot Dokumen
 * ===================================================================================== */

export function getSlotsFor(reqId: string, orgId: string): DokumenSlot[] {
  return state.slots.filter((s) => s.reqId === reqId && s.orgId === orgId);
}

/** Status turunan (Belum Diunggah/Diunggah/Diajukan/Perlu Perbaikan/Diterima) dari
 * `BerkasSatker` terkait, kecuali "Dikecualikan" yang murni keputusan manual. */
export function slotStatus(slot: DokumenSlot): DokumenSlotStatus {
  if (slot.dikecualikan) return 'Dikecualikan';
  const berkas = getBerkas(slot.reqId, slot.orgId).find((f) => f.dokId === slot.dokId);
  if (!berkas) return 'Belum Diunggah';
  if (berkas.status === 'draft') return 'Diunggah';
  if (berkas.status === 'wait') return 'Diajukan';
  if (berkas.status === 'fix') return 'Perlu Perbaikan';
  return 'Diterima';
}

export function assignSlotPic(slotId: string, pic: string, tenggatInternal: string | null): void {
  setState({ ...state, slots: state.slots.map((s) => (s.id === slotId ? { ...s, pic, tenggatInternal } : s)) });
}

export function excludeSlot(slotId: string, alasan: string): { ok: boolean; reason?: string } {
  if (!alasan.trim()) return { ok: false, reason: 'Alasan pengecualian wajib diisi.' };
  setState({ ...state, slots: state.slots.map((s) => (s.id === slotId ? { ...s, dikecualikan: true, alasanKecualikan: alasan.trim() } : s)) });
  return { ok: true };
}

export function unexcludeSlot(slotId: string): void {
  setState({ ...state, slots: state.slots.map((s) => (s.id === slotId ? { ...s, dikecualikan: false, alasanKecualikan: '' } : s)) });
}

/** Validasi otomatis (5.2) sebelum unggahan slot dikirim — dipakai Portal Satker 6.1. */
export function validateBerkasAgainstAturan(dokId: string, file: { nama: string; sizeBytes: number }): { ok: boolean; reason?: string } {
  const aturan = getAturanValidasiByDok(dokId);
  if (!aturan) return { ok: true };
  const ext = file.nama.split('.').pop()?.toLowerCase() ?? '';
  if (aturan.formatDiizinkan.length && !aturan.formatDiizinkan.includes(ext)) {
    return { ok: false, reason: `Format .${ext} tidak diizinkan untuk dokumen ini. Format yang diperbolehkan: ${aturan.formatDiizinkan.join(', ').toUpperCase()}.` };
  }
  const maxBytes = aturan.ukuranMaksMb * 1024 * 1024;
  if (file.sizeBytes > maxBytes) {
    return { ok: false, reason: `Ukuran berkas melebihi batas maksimum ${aturan.ukuranMaksMb} MB untuk dokumen ini.` };
  }
  return { ok: true };
}

/* =====================================================================================
 * F7 — Klaim (priority ordering & claim lock), Pemisahan Tugas, Pembatalan Keputusan
 * ===================================================================================== */

export function claimQueueItem(fileId: string, oleh: string): { ok: boolean; reason?: string } {
  const existing = state.claims[fileId];
  if (existing && existing.oleh !== oleh) return { ok: false, reason: `Item ini sudah diklaim oleh ${existing.oleh}.` };
  setState({ ...state, claims: { ...state.claims, [fileId]: { oleh, waktu: nowStamp() } } });
  return { ok: true };
}

export function releaseClaim(fileId: string): void {
  const next = { ...state.claims };
  delete next[fileId];
  setState({ ...state, claims: next });
}

export function getClaim(fileId: string): ClaimEntry | undefined {
  return state.claims[fileId];
}

/** F7 — membatalkan keputusan verifikasi (Terima/Minta Perbaikan) yang sudah diambil,
 * mengembalikan berkas/laporan ke "Menunggu Verifikasi" beserta jejak log (BR "structured
 * decisions, and a history tab where a decision can be annulled"). */
export function annulBerkasKeputusan(reqId: string, orgId: string, fileId: string, oleh: string): void {
  const berkasForReq = { ...(state.berkas[reqId] ?? {}) };
  const files = berkasForReq[orgId] ?? [];
  let fileNama = '';
  berkasForReq[orgId] = files.map((f) => {
    if (f.id !== fileId) return f;
    fileNama = f.nama;
    return { ...f, status: 'wait' as const, catatan: '', verifikatorOleh: '', tglVerifikasi: null };
  });
  const permintaan = state.permintaan.map((r) => (r.id === reqId ? addLog(r, `Membatalkan keputusan verifikasi atas berkas ${fileNama}`, oleh, orgId) : r));
  setState({ ...state, berkas: { ...state.berkas, [reqId]: berkasForReq }, permintaan });
}

export function annulLaporanKeputusan(orgId: string, laporanId: string): void {
  const list = state.laporan[orgId] ?? [];
  const next = list.map((l) => (l.id === laporanId ? { ...l, status: 'wait' as const, catatan: '', verifikatorOleh: '', tglVerifikasi: null } : l));
  setState({ ...state, laporan: { ...state.laporan, [orgId]: next } });
}

export function duplicatePermintaan(id: string, oleh: string): Permintaan | undefined {
  const src = getPermintaanById(id);
  if (!src) return undefined;
  return createPermintaanDraft(
    {
      judul: `${src.judul} (Duplikat)`,
      tipe: src.tipe,
      jpId: src.jpId,
      tahunAnggaran: src.tahunAnggaran,
      periodeLabel: src.periodeLabel,
      mulai: src.mulai,
      selesai: src.selesai,
      pesan: src.pesan,
      sasaran: [...src.sasaran],
      lampiran: [...src.lampiran],
    },
    oleh
  );
}

export function deletePermintaanDraft(id: string): { ok: boolean; reason?: string } {
  const r = getPermintaanById(id);
  if (!r) return { ok: false, reason: 'Data tidak ditemukan.' };
  if (r.status !== 'Draft') return { ok: false, reason: 'Hanya permintaan berstatus Draft yang dapat dihapus.' };
  setState({ ...state, permintaan: state.permintaan.filter((x) => x.id !== id) });
  return { ok: true };
}

export function closePermintaan(id: string, oleh: string): void {
  setState({
    ...state,
    permintaan: state.permintaan.map((r) => {
      if (r.id !== id || r.status !== 'Terkirim') return r;
      const updated: Permintaan = { ...r, status: 'Ditutup', ditutup: startOfToday().toISOString().slice(0, 10) };
      return addLog(updated, 'Menutup permintaan', oleh);
    }),
  });
}

export function extendDeadline(id: string, selesaiBaru: string, oleh: string): void {
  setState({
    ...state,
    permintaan: state.permintaan.map((r) => {
      if (r.id !== id) return r;
      const updated: Permintaan = { ...r, selesai: selesaiBaru };
      return addLog(updated, `Memperpanjang tenggat menjadi ${selesaiBaru}`, oleh);
    }),
  });
}

export function sendReminder(id: string, oleh: string, targetOrgId?: string): void {
  setState({
    ...state,
    permintaan: state.permintaan.map((r) => {
      if (r.id !== id) return r;
      const label = targetOrgId ? getOrgById(targetOrgId)?.sing ?? targetOrgId : `${r.sasaran.length} Satker`;
      return addLog(r, `Mengirim pengingat ke ${label}`, oleh, targetOrgId ?? null);
    }),
  });
}

/* =====================================================================================
 * MUTATIONS — Portal Satker (6.1 unggah berkas, 6.2/6.3 laporan berkala)
 * ===================================================================================== */

export function uploadBerkas(reqId: string, orgId: string, files: { nama: string; sizeBytes: number; dokId: string; keterangan?: string }[], oleh: string): void {
  const today = startOfToday().toISOString().slice(0, 10);
  const created: BerkasSatker[] = files.map((f) => ({
    id: uid(),
    nama: f.nama,
    sizeBytes: f.sizeBytes,
    dokId: f.dokId,
    keterangan: f.keterangan ?? '',
    status: 'draft',
    tgl: today,
    terlambat: false,
    catatan: '',
    verifikatorOleh: '',
    tglVerifikasi: null,
  }));
  const berkasForReq = { ...(state.berkas[reqId] ?? {}) };
  berkasForReq[orgId] = [...(berkasForReq[orgId] ?? []), ...created];
  const permintaan = state.permintaan.map((r) => (r.id === reqId ? addLog(r, `${getOrgById(orgId)?.sing ?? orgId} menambahkan ${files.length} berkas`, oleh, orgId) : r));
  setState({ ...state, berkas: { ...state.berkas, [reqId]: berkasForReq }, permintaan });
}

export function removeDraftBerkas(reqId: string, orgId: string, fileId: string): void {
  const berkasForReq = { ...(state.berkas[reqId] ?? {}) };
  berkasForReq[orgId] = (berkasForReq[orgId] ?? []).filter((f) => !(f.id === fileId && f.status === 'draft'));
  setState({ ...state, berkas: { ...state.berkas, [reqId]: berkasForReq } });
}

function snapshotBerkasVersion(f: BerkasSatker): BerkasVersion {
  return { nama: f.nama, sizeBytes: f.sizeBytes, tgl: f.tgl, status: f.status, catatan: f.catatan, verifikatorOleh: f.verifikatorOleh, tglVerifikasi: f.tglVerifikasi };
}

/** "Ganti Berkas" pada berkas draft (belum dikirim) — mengganti file, tetap berstatus draft. */
export function replaceBerkas(reqId: string, orgId: string, fileId: string, file: { nama: string; sizeBytes: number }): void {
  const berkasForReq = { ...(state.berkas[reqId] ?? {}) };
  const files = berkasForReq[orgId] ?? [];
  const today = startOfToday().toISOString().slice(0, 10);
  berkasForReq[orgId] = files.map((f) => {
    if (f.id !== fileId || f.status !== 'draft') return f;
    return { ...f, nama: file.nama, sizeBytes: file.sizeBytes, tgl: today, versi: [...(f.versi ?? []), snapshotBerkasVersion(f)] };
  });
  setState({ ...state, berkas: { ...state.berkas, [reqId]: berkasForReq } });
}

/** "Kirim Perbaikan" pada berkas berstatus `fix` — kirim ulang, langsung ke "Menunggu Verifikasi". */
export function resubmitBerkas(reqId: string, orgId: string, fileId: string, file: { nama: string; sizeBytes: number }, keterangan: string, oleh: string): void {
  const berkasForReq = { ...(state.berkas[reqId] ?? {}) };
  const files = berkasForReq[orgId] ?? [];
  const today = startOfToday().toISOString().slice(0, 10);
  let fileNama = '';
  berkasForReq[orgId] = files.map((f) => {
    if (f.id !== fileId || f.status !== 'fix') return f;
    fileNama = file.nama;
    return {
      ...f,
      nama: file.nama,
      sizeBytes: file.sizeBytes,
      keterangan: keterangan || f.keterangan,
      status: 'wait' as const,
      tgl: today,
      catatan: '',
      verifikatorOleh: '',
      tglVerifikasi: null,
      versi: [...(f.versi ?? []), snapshotBerkasVersion(f)],
    };
  });
  const permintaan = state.permintaan.map((r) => (r.id === reqId ? addLog(r, `${getOrgById(orgId)?.sing ?? orgId} mengirim perbaikan berkas ${fileNama}`, oleh, orgId) : r));
  setState({ ...state, berkas: { ...state.berkas, [reqId]: berkasForReq }, permintaan });
}

export interface ReuseCandidate {
  reqId: string;
  fileId: string;
  nama: string;
  sizeBytes: number;
  dokId: string;
  tgl: string | null;
  reqJudul: string;
}

/** Berkas berstatus "Diterima" (`ok`) milik `orgId` dari permintaan lain — kandidat "Pakai Berkas Lama". */
export function reuseCandidates(orgId: string, excludeReqId?: string): ReuseCandidate[] {
  const out: ReuseCandidate[] = [];
  Object.entries(state.berkas).forEach(([reqId, byOrg]) => {
    if (reqId === excludeReqId) return;
    (byOrg[orgId] ?? []).forEach((f) => {
      if (f.status !== 'ok') return;
      out.push({ reqId, fileId: f.id, nama: f.nama, sizeBytes: f.sizeBytes, dokId: f.dokId, tgl: f.tgl, reqJudul: getPermintaanById(reqId)?.judul ?? reqId });
    });
  });
  return out.sort((a, b) => (b.tgl ?? '').localeCompare(a.tgl ?? ''));
}

/** "Pakai Berkas Lama" — menyalin berkas yang sudah diterima sebelumnya sebagai draft baru. */
export function reuseBerkas(reqId: string, orgId: string, sources: { reqId: string; fileId: string }[], oleh: string): void {
  const today = startOfToday().toISOString().slice(0, 10);
  const copied: BerkasSatker[] = [];
  sources.forEach(({ reqId: srcReqId, fileId: srcFileId }) => {
    const src = (state.berkas[srcReqId]?.[orgId] ?? []).find((f) => f.id === srcFileId);
    if (!src) return;
    copied.push({ id: uid(), nama: src.nama, sizeBytes: src.sizeBytes, dokId: src.dokId, keterangan: src.keterangan, status: 'draft', tgl: today, terlambat: false, catatan: '', verifikatorOleh: '', tglVerifikasi: null, asalBerkasId: src.id });
  });
  if (!copied.length) return;
  const berkasForReq = { ...(state.berkas[reqId] ?? {}) };
  berkasForReq[orgId] = [...(berkasForReq[orgId] ?? []), ...copied];
  const permintaan = state.permintaan.map((r) => (r.id === reqId ? addLog(r, `${getOrgById(orgId)?.sing ?? orgId} memakai kembali ${copied.length} berkas lama`, oleh, orgId) : r));
  setState({ ...state, berkas: { ...state.berkas, [reqId]: berkasForReq }, permintaan });
}

/** PIC mengirim seluruh berkas draft milik Satkernya untuk permintaan ini -> status "wait". */
export function sendBerkas(reqId: string, orgId: string, oleh: string): void {
  const berkasForReq = { ...(state.berkas[reqId] ?? {}) };
  const files = berkasForReq[orgId] ?? [];
  const nDraft = files.filter((f) => f.status === 'draft').length;
  if (!nDraft) return;
  berkasForReq[orgId] = files.map((f) => (f.status === 'draft' ? { ...f, status: 'wait' as const, tgl: startOfToday().toISOString().slice(0, 10) } : f));
  const permintaan = state.permintaan.map((r) => (r.id === reqId ? addLog(r, `${getOrgById(orgId)?.sing ?? orgId} mengirim ${nDraft} berkas`, oleh, orgId) : r));
  setState({ ...state, berkas: { ...state.berkas, [reqId]: berkasForReq }, permintaan });
}

export function markSelesai(reqId: string, orgId: string, oleh: string): void {
  const selesaiForReq = { ...(state.selesai[reqId] ?? {}) };
  selesaiForReq[orgId] = startOfToday().toISOString().slice(0, 10);
  const permintaan = state.permintaan.map((r) => (r.id === reqId ? addLog(r, `${getOrgById(orgId)?.sing ?? orgId} menandai pengiriman selesai`, oleh, orgId) : r));
  setState({ ...state, selesai: { ...state.selesai, [reqId]: selesaiForReq }, permintaan });
}

export function undoSelesai(reqId: string, orgId: string): void {
  const selesaiForReq = { ...(state.selesai[reqId] ?? {}) };
  delete selesaiForReq[orgId];
  setState({ ...state, selesai: { ...state.selesai, [reqId]: selesaiForReq } });
}

/* =====================================================================================
 * MUTATIONS — Verifikasi Berkas (7.1)
 * ===================================================================================== */

export function verifyBerkas(reqId: string, orgId: string, fileId: string, decision: 'ok' | 'fix', catatan: string, verifikatorOleh: string): void {
  const berkasForReq = { ...(state.berkas[reqId] ?? {}) };
  const files = berkasForReq[orgId] ?? [];
  let fileNama = '';
  berkasForReq[orgId] = files.map((f) => {
    if (f.id !== fileId) return f;
    fileNama = f.nama;
    return { ...f, status: decision, catatan: decision === 'fix' ? catatan : '', verifikatorOleh, tglVerifikasi: startOfToday().toISOString().slice(0, 10) };
  });
  const aksi = decision === 'ok' ? `Menerima berkas ${fileNama}` : `Mengembalikan berkas ${fileNama} untuk diperbaiki`;
  const permintaan = state.permintaan.map((r) => (r.id === reqId ? addLog(r, aksi, verifikatorOleh, orgId) : r));
  setState({ ...state, berkas: { ...state.berkas, [reqId]: berkasForReq }, permintaan });
}

export function uploadLaporan(
  orgId: string,
  jenis: 'IKU' | 'SPIP',
  key: string,
  tahunAnggaran: string,
  file: { nama: string; sizeBytes: number },
  extra?: { realisasi?: Record<string, number>; skor?: number; keterangan?: string; kirim?: boolean }
): void {
  const existing = state.laporan[orgId] ?? [];
  const idx = existing.findIndex((l) => l.jenis === jenis && l.key === key && l.tahunAnggaran === tahunAnggaran);
  const today = startOfToday().toISOString().slice(0, 10);
  const entry: LaporanEntry = {
    id: idx >= 0 ? existing[idx].id : uid('LAP'),
    jenis,
    key,
    tahunAnggaran,
    status: extra?.kirim === false ? 'draft' : 'wait',
    fileNama: file.nama,
    fileSizeBytes: file.sizeBytes,
    tgl: today,
    catatan: '',
    verifikatorOleh: '',
    tglVerifikasi: null,
    skor: extra?.skor ?? null,
    realisasi: extra?.realisasi ?? null,
    keterangan: extra?.keterangan ?? '',
  };
  const nextList = idx >= 0 ? existing.map((l, i) => (i === idx ? entry : l)) : [...existing, entry];
  setState({ ...state, laporan: { ...state.laporan, [orgId]: nextList } });
}

/** Mengirim draft laporan yang tersimpan ("Simpan Draft" sebelumnya) ke Itwasum. */
export function sendLaporan(orgId: string, laporanId: string): void {
  const list = state.laporan[orgId] ?? [];
  const today = startOfToday().toISOString().slice(0, 10);
  const next = list.map((l) => (l.id === laporanId && l.status === 'draft' ? { ...l, status: 'wait' as const, tgl: today } : l));
  setState({ ...state, laporan: { ...state.laporan, [orgId]: next } });
}

/** "Hapus draft laporan?" — hanya laporan berstatus draft yang dapat dihapus. */
export function deleteDraftLaporan(orgId: string, laporanId: string): { ok: boolean; reason?: string } {
  const list = state.laporan[orgId] ?? [];
  const lap = list.find((l) => l.id === laporanId);
  if (!lap) return { ok: false, reason: 'Data tidak ditemukan.' };
  if (lap.status !== 'draft') return { ok: false, reason: 'Hanya draft yang belum dikirim dapat dihapus.' };
  setState({ ...state, laporan: { ...state.laporan, [orgId]: list.filter((l) => l.id !== laporanId) } });
  return { ok: true };
}

/** "Kirim Perbaikan" pada laporan berstatus `fix` — menyimpan versi lama, lalu kirim ulang. */
export function resubmitLaporan(
  orgId: string,
  laporanId: string,
  file: { nama: string; sizeBytes: number },
  extra?: { realisasi?: Record<string, number>; skor?: number; keterangan?: string }
): void {
  const list = state.laporan[orgId] ?? [];
  const today = startOfToday().toISOString().slice(0, 10);
  const next = list.map((l) => {
    if (l.id !== laporanId || l.status !== 'fix') return l;
    const version: BerkasVersion = { nama: l.fileNama, sizeBytes: l.fileSizeBytes, tgl: l.tgl, status: l.status, catatan: l.catatan, verifikatorOleh: l.verifikatorOleh, tglVerifikasi: l.tglVerifikasi };
    return {
      ...l,
      fileNama: file.nama,
      fileSizeBytes: file.sizeBytes,
      status: 'wait' as const,
      tgl: today,
      catatan: '',
      verifikatorOleh: '',
      tglVerifikasi: null,
      skor: extra?.skor ?? l.skor,
      realisasi: extra?.realisasi ?? l.realisasi,
      keterangan: extra?.keterangan ?? l.keterangan,
      versi: [...(l.versi ?? []), version],
    };
  });
  setState({ ...state, laporan: { ...state.laporan, [orgId]: next } });
}

export function verifyLaporan(orgId: string, laporanId: string, decision: 'ok' | 'fix', catatan: string, verifikatorOleh: string): void {
  const list = state.laporan[orgId] ?? [];
  const next = list.map((l) => (l.id === laporanId ? { ...l, status: decision, catatan: decision === 'fix' ? catatan : '', verifikatorOleh, tglVerifikasi: startOfToday().toISOString().slice(0, 10) } : l));
  setState({ ...state, laporan: { ...state.laporan, [orgId]: next } });
}

/* =====================================================================================
 * MUTATIONS/SELECTORS — 5.1 Mapping, 5.2 Aturan Validasi
 * ===================================================================================== */

export function createMappingRule(input: Omit<MappingRule, 'id' | 'versi'>): MappingRule {
  const seq = state.mappingRules.length + 1;
  const rule: MappingRule = { ...input, id: `MAP-${String(seq).padStart(3, '0')}`, versi: 1 };
  setState({ ...state, mappingRules: [...state.mappingRules, rule] });
  return rule;
}

export function updateMappingRule(id: string, patch: Partial<MappingRule>): void {
  setState({
    ...state,
    mappingRules: state.mappingRules.map((m) => (m.id === id ? { ...m, ...patch, versi: m.versi + 1 } : m)),
  });
}

export function setMappingRuleActive(id: string, aktif: boolean): void {
  setState({ ...state, mappingRules: state.mappingRules.map((m) => (m.id === id ? { ...m, aktif } : m)) });
}

export function deleteMappingRule(id: string): void {
  setState({ ...state, mappingRules: state.mappingRules.filter((m) => m.id !== id) });
}

/** Dokumen katalog yang wajib dikumpulkan untuk Jenis Pengawasan + Tipologi tertentu (5.1). */
export function dokumenWajibUntuk(jpId: string, tipId: string | null | undefined): KatalogDokumen[] {
  const ids = new Set<string>();
  state.mappingRules
    .filter((m) => m.aktif && m.jpId === jpId && (m.tipologiIds.length === 0 || (tipId && m.tipologiIds.includes(tipId))))
    .forEach((m) => m.dokumenIds.forEach((d) => ids.add(d)));
  return state.katalog.filter((d) => ids.has(d.id));
}

export function updateAturanValidasi(id: string, patch: Partial<AturanValidasi>): void {
  setState({ ...state, aturanValidasi: state.aturanValidasi.map((a) => (a.id === id ? { ...a, ...patch } : a)) });
}

export function getAturanValidasiByDok(dokId: string): AturanValidasi | undefined {
  return state.aturanValidasi.find((a) => a.dokId === dokId);
}

/* =====================================================================================
 * MUTATIONS/SELECTORS — F3 Objek Audit, 8.1/8.2 Risiko, F9 Prioritas
 * ===================================================================================== */

export function getObjekAuditById(id: string): ObjekAudit | undefined {
  return state.objekAudit.find((o) => o.id === id);
}

export function getObjekAuditByOrg(orgId: string, tahunAnggaran?: string): ObjekAudit[] {
  return state.objekAudit.filter((o) => o.orgId === orgId && (!tahunAnggaran || o.tahunAnggaran === tahunAnggaran));
}

export function getPenilaianByObjek(objekAuditId: string): PenilaianRisiko | undefined {
  return state.penilaianRisiko.find((p) => p.objekAuditId === objekAuditId);
}

export function setObjekAuditStatus(id: string, status: ObjekAuditStatus): void {
  setState({ ...state, objekAudit: state.objekAudit.map((o) => (o.id === id ? { ...o, status } : o)) });
}

export function upsertPenilaianRisiko(
  objekAuditId: string,
  faktor: Record<RisikoFaktorKey, number>,
  catatan: string,
  oleh: string
): PenilaianRisiko {
  const totalMax = RISIKO_FAKTOR_LIST.length * 5;
  const skor = Math.round((Object.values(faktor).reduce((a, b) => a + b, 0) / totalMax) * 25);
  const level = skorToLevel(skor);
  const existing = getPenilaianByObjek(objekAuditId);
  const today = startOfToday().toISOString().slice(0, 10);
  const obj = getObjekAuditById(objekAuditId);
  const next: PenilaianRisiko = existing
    ? { ...existing, faktor, skor, level, catatan, status: 'Draft', dinilaiOleh: oleh, tglDinilai: today, direviewOleh: '', tglReview: null, catatanReview: '' }
    : {
        id: `RSK-${objekAuditId}`,
        objekAuditId,
        orgId: obj?.orgId ?? '',
        tahunAnggaran: obj?.tahunAnggaran ?? String(new Date().getFullYear()),
        faktor,
        skor,
        level,
        catatan,
        status: 'Draft',
        dinilaiOleh: oleh,
        tglDinilai: today,
        direviewOleh: '',
        tglReview: null,
        catatanReview: '',
      };
  const penilaianRisiko = existing ? state.penilaianRisiko.map((p) => (p.objekAuditId === objekAuditId ? next : p)) : [...state.penilaianRisiko, next];
  setState({ ...state, penilaianRisiko, objekAudit: state.objekAudit.map((o) => (o.id === objekAuditId ? { ...o, status: 'Dinilai' } : o)) });
  return next;
}

/** 8.1 -> mengajukan hasil penilaian risiko untuk direview (Draft -> Diajukan). */
export function ajukanPenilaianRisiko(objekAuditId: string): void {
  setState({
    ...state,
    penilaianRisiko: state.penilaianRisiko.map((p) => (p.objekAuditId === objekAuditId && p.status === 'Draft' ? { ...p, status: 'Diajukan' } : p)),
  });
}

/** 8.2 Review & Persetujuan — Koordinator Pengendali menyetujui atau mengembalikan penilaian. */
export function reviewPenilaianRisiko(objekAuditId: string, decision: 'Disetujui' | 'Dikembalikan', catatanReview: string, oleh: string): void {
  const today = startOfToday().toISOString().slice(0, 10);
  setState({
    ...state,
    penilaianRisiko: state.penilaianRisiko.map((p) =>
      p.objekAuditId === objekAuditId && p.status === 'Diajukan'
        ? { ...p, status: decision, direviewOleh: oleh, tglReview: today, catatanReview: decision === 'Dikembalikan' ? catatanReview : '' }
        : p
    ),
  });
}

/** F9 — mengunci baseline prioritas PKPT tahun berikutnya dari seluruh penilaian "Disetujui" saat ini. */
export function lockBaselinePrioritas(tahunAnggaranPkpt: string, ambangMasukPct: number, oleh: string): BaselinePrioritas {
  const approved = state.penilaianRisiko.filter((p) => p.status === 'Disetujui').sort((a, b) => b.skor - a.skor);
  const cutoff = Math.max(1, Math.round(approved.length * (ambangMasukPct / 100)));
  const versi = (state.baselinePrioritas.filter((b) => b.tahunAnggaran === tahunAnggaranPkpt).sort((a, b) => b.versi - a.versi)[0]?.versi ?? 0) + 1;
  const baseline: BaselinePrioritas = {
    id: `BASE-${tahunAnggaranPkpt}-${String(versi).padStart(2, '0')}`,
    versi,
    tahunAnggaran: tahunAnggaranPkpt,
    lockedAt: startOfToday().toISOString().slice(0, 10),
    lockedOleh: oleh,
    items: approved.map((p, idx) => ({
      objekAuditId: p.objekAuditId,
      rank: idx + 1,
      skor: p.skor,
      masuk: idx < cutoff,
      alasan: idx < cutoff ? 'Termasuk kapasitas OH PKPT tahun berikutnya.' : 'Ditunda — menunggu kapasitas OH tersedia.',
    })),
  };
  setState({ ...state, baselinePrioritas: [...state.baselinePrioritas, baseline] });
  return baseline;
}

/** Baseline terkunci terbaru untuk suatu TA PKPT — dikonsumsi B.13 secara read-only (F9 ->
 * B.13, "Move" decision: B.13 tidak lagi memiliki skoring risiko sendiri). */
export function getLatestBaseline(tahunAnggaranPkpt?: string): BaselinePrioritas | undefined {
  const list = tahunAnggaranPkpt ? state.baselinePrioritas.filter((b) => b.tahunAnggaran === tahunAnggaranPkpt) : state.baselinePrioritas;
  return [...list].sort((a, b) => (a.lockedAt < b.lockedAt ? 1 : -1) || b.versi - a.versi)[0];
}

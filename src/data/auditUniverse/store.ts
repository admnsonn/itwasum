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
} from './types';
import { addDaysIso, daysDiffFromToday, isoDateTime, startOfToday } from './dateUtils';
import { ORG_UNITS_SEED } from './seeds/orgUnits';
import { TIPOLOGI_SEED } from './seeds/tipologi';
import { JENIS_PENGAWASAN_SEED } from './seeds/jenisPengawasan';
import { BIDJEMEN_SEED } from './seeds/bidjemen';
import { KATALOG_DOKUMEN_SEED } from './seeds/katalogDokumen';
import { PERMINTAAN_SEED, type PermintaanSeedDef } from './seeds/permintaan';
import { IKU_SLOTS, SPIP_SLOTS, LAPORAN_SEED_BERJALAN, HISTORI_KIRIM_14_HARI } from './seeds/laporan';

const STORAGE_KEY = 'itwasum_audit_universe_v1';
/** Bump when the seed/shape changes so stale localStorage from an older shape is discarded. */
const SEED_VERSION = 1;

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

function resolveLaporanSeed(now: Date): Record<string, LaporanEntry[]> {
  const laporan: Record<string, LaporanEntry[]> = {};
  const tahunBerjalan = String(now.getFullYear());
  for (const [orgId, entries] of Object.entries(LAPORAN_SEED_BERJALAN)) {
    laporan[orgId] = entries.map((e) => ({
      id: uid('LAP'),
      jenis: e.jenis,
      key: e.key,
      tahunAnggaran: tahunBerjalan,
      status: e.status,
      fileNama: `${e.jenis}_${e.key}_${tahunBerjalan}.pdf`,
      fileSizeBytes: 400000 + Math.round(Math.random() * 2500000),
      tgl: addDaysIso(now, e.offsetDays),
      catatan: e.catatan ?? '',
      verifikatorOleh: e.verifikatorOleh ?? '',
      tglVerifikasi: e.verifikasiOffsetDays != null ? addDaysIso(now, e.verifikasiOffsetDays) : null,
      skor: e.skor ?? null,
      realisasi: e.realisasi ?? null,
    }));
  }
  return laporan;
}

function buildSeedState(): AuditUniverseState {
  const now = startOfToday();
  const { permintaan, berkas, selesai } = resolvePermintaanSeed(PERMINTAAN_SEED, now);
  return {
    seedVersion: SEED_VERSION,
    orgUnits: ORG_UNITS_SEED.map((o) => ({ ...o })),
    tipologi: TIPOLOGI_SEED.map((t) => ({ ...t })),
    jenisPengawasan: JENIS_PENGAWASAN_SEED.map((j) => ({ ...j })),
    bidjemen: BIDJEMEN_SEED.map((b) => ({ ...b })),
    katalog: KATALOG_DOKUMEN_SEED.map((d) => ({ ...d })),
    permintaan,
    berkas,
    selesai,
    laporan: resolveLaporanSeed(now),
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
      const st = laporanStatusLabel(sl, lap);
      if (['Perlu Diunggah', 'Belum Dikirim', 'Perlu Perbaikan'].includes(st)) {
        out.push({ judul: `${sl.nama} ${tahunBerjalan}`, tgl: lap?.tgl ?? addDaysIso(startOfToday(), 14), mulai: '', tipe: `Laporan ${jenis}`, laporanJenis: jenis });
      }
    });
  });
  return out.sort((a, b) => (a.tgl < b.tgl ? -1 : 1));
}

export function laporanStatusLabel(_slot: { key: string }, lap: LaporanEntry | undefined): string {
  if (lap) {
    if (lap.status === 'draft') return 'Belum Dikirim';
    return BERKAS_STATUS_LABEL_LOCAL[lap.status];
  }
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

export function createOrgUnit(input: Omit<OrgUnit, 'id' | 'aktif'>): OrgUnit {
  const org: OrgUnit = { ...input, id: nextOrgNumericId(), aktif: true };
  setState({ ...state, orgUnits: [...state.orgUnits, org] });
  return org;
}

export function updateOrgUnit(id: string, patch: Partial<OrgUnit>): void {
  setState({ ...state, orgUnits: state.orgUnits.map((o) => (o.id === id ? { ...o, ...patch } : o)) });
}

/** Menonaktifkan Polda/Satker Mabes ikut menonaktifkan seluruh unit turunannya (cascade). */
export function setOrgActive(id: string, aktif: boolean, alasan = ''): void {
  const target = getOrgById(id);
  if (!target) return;
  const affectedIds = new Set([id, ...getOrgDescendants(id).map((o) => o.id)]);
  setState({
    ...state,
    orgUnits: state.orgUnits.map((o) => (affectedIds.has(o.id) ? { ...o, aktif, alasan: aktif ? '' : alasan } : o)),
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

/** Menetapkan/mengosongkan tipologi Satker (4.2 tab "Tipologi Satker"). */
export function assignTipologiToOrg(orgId: string, tipId: string | null): void {
  updateOrgUnit(orgId, { tip: tipId });
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

export function sendPermintaan(id: string, oleh: string): void {
  setState({
    ...state,
    permintaan: state.permintaan.map((r) => {
      if (r.id !== id || r.status !== 'Draft') return r;
      const updated: Permintaan = { ...r, status: 'Terkirim', dikirim: startOfToday().toISOString().slice(0, 10) };
      return addLog(updated, `Mengirim permintaan ke ${r.sasaran.length} Satker`, oleh);
    }),
  });
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
  extra?: { realisasi?: Record<string, number>; skor?: number }
): void {
  const existing = state.laporan[orgId] ?? [];
  const idx = existing.findIndex((l) => l.jenis === jenis && l.key === key && l.tahunAnggaran === tahunAnggaran);
  const today = startOfToday().toISOString().slice(0, 10);
  const entry: LaporanEntry = {
    id: idx >= 0 ? existing[idx].id : uid('LAP'),
    jenis,
    key,
    tahunAnggaran,
    status: 'wait',
    fileNama: file.nama,
    fileSizeBytes: file.sizeBytes,
    tgl: today,
    catatan: '',
    verifikatorOleh: '',
    tglVerifikasi: null,
    skor: extra?.skor ?? null,
    realisasi: extra?.realisasi ?? null,
  };
  const nextList = idx >= 0 ? existing.map((l, i) => (i === idx ? entry : l)) : [...existing, entry];
  setState({ ...state, laporan: { ...state.laporan, [orgId]: nextList } });
}

export function verifyLaporan(orgId: string, laporanId: string, decision: 'ok' | 'fix', catatan: string, verifikatorOleh: string): void {
  const list = state.laporan[orgId] ?? [];
  const next = list.map((l) => (l.id === laporanId ? { ...l, status: decision, catatan: decision === 'fix' ? catatan : '', verifikatorOleh, tglVerifikasi: startOfToday().toISOString().slice(0, 10) } : l));
  setState({ ...state, laporan: { ...state.laporan, [orgId]: next } });
}

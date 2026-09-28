/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.8 Management Google Drive — model root folder per Satker disimulasikan di `localStorage`
 * (Plan "Align itwasum with Plane BA/SA", todo p6-b8b9). Menambah root memvalidasi tautan,
 * men-scan folder, dan menampilkan pratinjau sebelum disimpan; root duplikat diblokir. Folder
 * yang hilang saat rescan ditandai nonaktif, bukan dihapus.
 */
import { useSyncExternalStore } from 'react';
import { createSeededRng } from '../../utils/seededRandom';

export interface DriveFolderEntry {
  id: string;
  nama: string;
  path: string;
  fileCount: number;
  aktif: boolean;
}

export interface DriveRoot {
  id: string;
  satkerId: string;
  folderUrl: string;
  folderName: string;
  addedAt: string;
  lastScanAt: string;
  aktif: boolean;
  folders: DriveFolderEntry[];
}

export interface GoogleDriveState {
  roots: DriveRoot[];
}

const STORAGE_KEY = 'itwasum_google_drive_v1';

function load(): GoogleDriveState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return { roots: [] };
}

let state: GoogleDriveState = typeof localStorage !== 'undefined' ? load() : { roots: [] };
const listeners = new Set<() => void>();

function setState(next: GoogleDriveState) {
  state = next;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  } catch {
    // storage unavailable — in-memory only for this session
  }
  listeners.forEach((l) => l());
}

function subscribe(listener: () => void) {
  listeners.add(listener);
  return () => listeners.delete(listener);
}

function getSnapshot() {
  return state;
}

export function useGoogleDriveState(): GoogleDriveState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getRootsForSatker(satkerId: string): DriveRoot[] {
  return state.roots.filter((r) => r.satkerId === satkerId);
}

const DRIVE_URL_RE = /^https:\/\/drive\.google\.com\/drive\/folders\/[a-zA-Z0-9_-]+/;

export function validateDriveUrl(url: string): { ok: boolean; reason?: string } {
  if (!url.trim()) return { ok: false, reason: 'Tautan folder wajib diisi.' };
  if (!DRIVE_URL_RE.test(url.trim())) return { ok: false, reason: 'Format tautan tidak valid. Gunakan tautan folder Google Drive (https://drive.google.com/drive/folders/...).' };
  return { ok: true };
}

/** Simulasi scan folder — deterministik dari URL agar hasil pratinjau konsisten antar percobaan. */
export function scanDriveFolder(url: string): { folderName: string; folders: DriveFolderEntry[] } {
  const rng = createSeededRng(`drive-scan-${url}`);
  const folderName = rng.pick(['Bukti Dukung KKLEAD SPIP', 'Dokumen Pengendalian Internal', 'Arsip Pra-Audit Satker', 'Evidence Google Drive Satker']);
  const subNames = ['KK1 - Lingkungan Pengendalian', 'KK2 - Penilaian Risiko', 'KK3 - Kegiatan Pengendalian', 'KK5 - Informasi & Komunikasi', 'KK7 - Pemantauan'];
  const count = rng.int(3, subNames.length);
  const folders: DriveFolderEntry[] = subNames.slice(0, count).map((nama, i) => ({
    id: `folder-${i}`,
    nama,
    path: `/${folderName}/${nama}`,
    fileCount: rng.int(2, 40),
    aktif: true,
  }));
  return { folderName, folders };
}

export function isDuplicateRoot(satkerId: string, url: string): boolean {
  return state.roots.some((r) => r.satkerId === satkerId && r.aktif && r.folderUrl.trim() === url.trim());
}

export function addDriveRoot(satkerId: string, url: string): { ok: boolean; reason?: string; root?: DriveRoot } {
  const valid = validateDriveUrl(url);
  if (!valid.ok) return valid;
  if (isDuplicateRoot(satkerId, url)) return { ok: false, reason: 'Root folder ini sudah terhubung sebelumnya untuk Satker ini.' };
  const { folderName, folders } = scanDriveFolder(url);
  const root: DriveRoot = {
    id: `DRIVE-${Date.now()}`,
    satkerId,
    folderUrl: url.trim(),
    folderName,
    addedAt: new Date().toISOString(),
    lastScanAt: new Date().toISOString(),
    aktif: true,
    folders,
  };
  setState({ roots: [...state.roots, root] });
  return { ok: true, root };
}

/** Rescan — folder yang sebelumnya ada tapi tidak muncul lagi pada scan ditandai nonaktif
 * (BR: "Folders that disappear become inactive instead of being deleted"), bukan dihapus. */
export function rescanDriveRoot(rootId: string): void {
  setState({
    roots: state.roots.map((r) => {
      if (r.id !== rootId) return r;
      const rng = createSeededRng(`drive-rescan-${rootId}-${Date.now()}`);
      const nextFolders = r.folders.map((f) => (rng.bool(0.85) ? { ...f, fileCount: f.fileCount + rng.int(0, 3) } : { ...f, aktif: false }));
      return { ...r, lastScanAt: new Date().toISOString(), folders: nextFolders };
    }),
  });
}

export function deactivateDriveRoot(rootId: string): void {
  setState({ roots: state.roots.map((r) => (r.id === rootId ? { ...r, aktif: false } : r)) });
}

export function reactivateDriveRoot(rootId: string): void {
  setState({ roots: state.roots.map((r) => (r.id === rootId ? { ...r, aktif: true } : r)) });
}

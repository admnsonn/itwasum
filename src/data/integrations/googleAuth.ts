/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * FR-GAUTH — simulasi koneksi Google Authentication dipakai bersama oleh B.8 "Management
 * Google Drive" dan B.9 "Pengaturan Parameter > Google Authentication" (Plan "Align itwasum
 * with Plane BA/SA", todo p6-b8b9). Frontend-only: seluruh status disimulasikan di
 * `localStorage`, tidak ada panggilan OAuth nyata.
 */
import { useSyncExternalStore } from 'react';

export type GoogleAuthStatus = 'not_connected' | 'connecting' | 'connected' | 'invalid_credential';

export interface GoogleAuthState {
  status: GoogleAuthStatus;
  account: string | null;
  connectedAt: string | null;
}

const STORAGE_KEY = 'itwasum_google_auth_v1';

function load(): GoogleAuthState {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return { status: 'not_connected', account: null, connectedAt: null };
}

let state: GoogleAuthState = typeof localStorage !== 'undefined' ? load() : { status: 'not_connected', account: null, connectedAt: null };
const listeners = new Set<() => void>();

function setState(next: GoogleAuthState) {
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

export function useGoogleAuthState(): GoogleAuthState {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

export function getGoogleAuthState(): GoogleAuthState {
  return state;
}

/** Memulai koneksi (simulasi): akun dengan domain @polri.go.id dianggap valid, selain itu
 * ditolak sebagai "invalid_credential" agar alur error dapat didemokan. */
export function connectGoogleAccount(email: string): void {
  setState({ ...state, status: 'connecting', account: email, connectedAt: null });
  setTimeout(() => {
    if (!/@.+\.(go\.id|polri\.go\.id)$/i.test(email.trim())) {
      setState({ ...state, status: 'invalid_credential', account: email, connectedAt: null });
      return;
    }
    setState({ status: 'connected', account: email.trim(), connectedAt: new Date().toISOString() });
  }, 900);
}

export function disconnectGoogleAccount(): void {
  setState({ status: 'not_connected', account: null, connectedAt: null });
}

export function testGoogleConnection(): Promise<{ ok: boolean; message: string }> {
  return new Promise((resolve) => {
    setTimeout(() => {
      if (state.status === 'connected') resolve({ ok: true, message: `Koneksi ke akun ${state.account} berhasil diverifikasi.` });
      else resolve({ ok: false, message: 'Belum ada akun Google yang terhubung.' });
    }, 600);
  });
}

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.11 Login & Otentikasi 2FA — simulasi lockout, OTP, dan sesi tunggal 24 jam sliding (Plan
 * "Align itwasum with Plane BA/SA", todo p7-b11). Frontend-only: seluruh status disimpan di
 * `localStorage`; kode OTP ditampilkan sebagai hint on-screen (bukan dikirim sungguhan).
 */
import type { CurrentUserProfile } from '../../types';

const ATTEMPTS_KEY = 'itwasum_login_attempts_v1';
const OTP_KEY = 'itwasum_login_otp_v1';
const NOTIF_KEY = 'itwasum_login_notifications_v1';
export const SESSION_KEY = 'itwasum_auth_session';
export const SESSION_TOKEN_KEY = 'itwasum_session_token_v1';
export const AUTH_LOGGED_OUT_KEY = 'itwasum_logged_out';

export const MAX_LOGIN_ATTEMPTS = 5;
export const LOCKOUT_MS = 15 * 60 * 1000; // 15 minutes
export const OTP_TTL_MS = 5 * 60 * 1000; // 5 minutes
export const OTP_RESEND_COOLDOWN_MS = 60 * 1000; // 60 seconds
export const OTP_MAX_WRONG_ATTEMPTS = 5;
export const OTP_MAX_RESEND_PER_DAY = 5;
export const SESSION_MAX_AGE_MS = 24 * 60 * 60 * 1000; // 24 hours sliding

/* =====================================================================================
 * Lockout setelah 5 kali gagal login (BR B.11)
 * ===================================================================================== */
interface AttemptRecord {
  count: number;
  lockedUntil: string | null;
}

function loadAttempts(): Record<string, AttemptRecord> {
  try {
    const raw = localStorage.getItem(ATTEMPTS_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return {};
}

function saveAttempts(data: Record<string, AttemptRecord>) {
  try {
    localStorage.setItem(ATTEMPTS_KEY, JSON.stringify(data));
  } catch {
    // storage unavailable
  }
}

export function getLockStatus(identifier: string): { locked: boolean; remainingMs: number; attemptsLeft: number } {
  const key = identifier.trim().toLowerCase();
  const data = loadAttempts();
  const rec = data[key];
  if (!rec) return { locked: false, remainingMs: 0, attemptsLeft: MAX_LOGIN_ATTEMPTS };
  if (rec.lockedUntil) {
    const remaining = new Date(rec.lockedUntil).getTime() - Date.now();
    if (remaining > 0) return { locked: true, remainingMs: remaining, attemptsLeft: 0 };
  }
  return { locked: false, remainingMs: 0, attemptsLeft: Math.max(0, MAX_LOGIN_ATTEMPTS - rec.count) };
}

export function recordFailedAttempt(identifier: string): { locked: boolean; attemptsLeft: number } {
  const key = identifier.trim().toLowerCase();
  const data = loadAttempts();
  const rec = data[key] ?? { count: 0, lockedUntil: null };
  rec.count += 1;
  if (rec.count >= MAX_LOGIN_ATTEMPTS) {
    rec.lockedUntil = new Date(Date.now() + LOCKOUT_MS).toISOString();
    pushNotification('Akun Terkunci', `Akun ${identifier} dikunci sementara setelah 5 kali gagal login.`);
  }
  data[key] = rec;
  saveAttempts(data);
  return { locked: rec.count >= MAX_LOGIN_ATTEMPTS, attemptsLeft: Math.max(0, MAX_LOGIN_ATTEMPTS - rec.count) };
}

export function resetAttempts(identifier: string) {
  const key = identifier.trim().toLowerCase();
  const data = loadAttempts();
  delete data[key];
  saveAttempts(data);
}

/* =====================================================================================
 * OTP 2FA — kode 6 digit, kadaluarsa 5 menit, kirim ulang setelah 60 detik (maks 5x/hari)
 * ===================================================================================== */
interface OtpRecord {
  identifier: string;
  code: string;
  expiresAt: string;
  wrongAttempts: number;
  resendCount: number;
  resendAvailableAt: string;
  dayKey: string;
}

function loadOtp(): OtpRecord | null {
  try {
    const raw = localStorage.getItem(OTP_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return null;
}

function saveOtp(rec: OtpRecord | null) {
  try {
    if (rec) localStorage.setItem(OTP_KEY, JSON.stringify(rec));
    else localStorage.removeItem(OTP_KEY);
  } catch {
    // storage unavailable
  }
}

function generateCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000));
}

function todayKey(): string {
  return new Date().toISOString().slice(0, 10);
}

/** Membuat OTP baru untuk identifier (login awal). */
export function startOtp(identifier: string): OtpRecord {
  const rec: OtpRecord = {
    identifier: identifier.trim().toLowerCase(),
    code: generateCode(),
    expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    wrongAttempts: 0,
    resendCount: 0,
    resendAvailableAt: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS).toISOString(),
    dayKey: todayKey(),
  };
  saveOtp(rec);
  return rec;
}

export function getOtp(): OtpRecord | null {
  return loadOtp();
}

export function canResendOtp(): { ok: boolean; reason?: string; waitMs?: number } {
  const rec = loadOtp();
  if (!rec) return { ok: false, reason: 'Tidak ada proses OTP aktif.' };
  const sameDayCount = rec.dayKey === todayKey() ? rec.resendCount : 0;
  if (sameDayCount >= OTP_MAX_RESEND_PER_DAY) return { ok: false, reason: `Batas kirim ulang OTP (${OTP_MAX_RESEND_PER_DAY}x/hari) telah tercapai.` };
  const waitMs = new Date(rec.resendAvailableAt).getTime() - Date.now();
  if (waitMs > 0) return { ok: false, reason: 'Tunggu sebelum meminta kode baru.', waitMs };
  return { ok: true };
}

export function resendOtp(): OtpRecord | null {
  const rec = loadOtp();
  if (!rec) return null;
  const sameDay = rec.dayKey === todayKey();
  const next: OtpRecord = {
    ...rec,
    code: generateCode(),
    expiresAt: new Date(Date.now() + OTP_TTL_MS).toISOString(),
    wrongAttempts: 0,
    resendCount: (sameDay ? rec.resendCount : 0) + 1,
    resendAvailableAt: new Date(Date.now() + OTP_RESEND_COOLDOWN_MS).toISOString(),
    dayKey: todayKey(),
  };
  saveOtp(next);
  return next;
}

export type OtpVerifyResult = 'ok' | 'expired' | 'wrong' | 'locked_out' | 'not_found';

export function verifyOtp(code: string): OtpVerifyResult {
  const rec = loadOtp();
  if (!rec) return 'not_found';
  if (new Date(rec.expiresAt).getTime() < Date.now()) return 'expired';
  if (rec.code !== code.trim()) {
    const wrongAttempts = rec.wrongAttempts + 1;
    if (wrongAttempts >= OTP_MAX_WRONG_ATTEMPTS) {
      saveOtp(null);
      return 'locked_out';
    }
    saveOtp({ ...rec, wrongAttempts });
    return 'wrong';
  }
  saveOtp(null);
  return 'ok';
}

export function clearOtp() {
  saveOtp(null);
}

/** Menutupi email/kontak tujuan OTP, mis. "a***i@polri.go.id" (BR: destination shown masked). */
export function maskDestination(identifier: string): string {
  const [local, domain] = identifier.split('@');
  if (!domain) return identifier.replace(/.(?=.{2})/g, '*');
  const maskedLocal = local.length <= 2 ? local[0] + '*' : `${local[0]}${'*'.repeat(local.length - 2)}${local[local.length - 1]}`;
  return `${maskedLocal}@${domain}`;
}

/* =====================================================================================
 * Sesi — token tunggal + kadaluarsa 24 jam sliding
 * ===================================================================================== */
export interface StoredSession {
  user: CurrentUserProfile;
  sessionToken: string;
  loginAt: string;
  lastActivityAt: string;
  rememberIdentifier?: string;
}

function genToken(): string {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

export function createSession(user: CurrentUserProfile, rememberIdentifier?: string): StoredSession {
  const now = new Date().toISOString();
  const session: StoredSession = { user, sessionToken: genToken(), loginAt: now, lastActivityAt: now, rememberIdentifier };
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
    localStorage.setItem(SESSION_TOKEN_KEY, session.sessionToken);
    localStorage.removeItem(AUTH_LOGGED_OUT_KEY);
  } catch {
    // storage unavailable — session still usable in-memory for this tab
  }
  pushNotification('Login Berhasil', `${user.nama} berhasil masuk (${user.peranLabel}).`);
  return session;
}

export function loadSession(): StoredSession | null {
  try {
    const raw = localStorage.getItem(SESSION_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return null;
}

/** true bila sesi ada, tokennya masih token aktif (single-session), dan belum lewat 24 jam
 * sejak aktivitas terakhir (sliding expiry). */
export function isSessionValid(session: StoredSession | null): boolean {
  if (!session) return false;
  const activeToken = (() => {
    try {
      return localStorage.getItem(SESSION_TOKEN_KEY);
    } catch {
      return session.sessionToken;
    }
  })();
  if (activeToken && activeToken !== session.sessionToken) return false; // dipaksa keluar oleh sesi lain
  const age = Date.now() - new Date(session.lastActivityAt).getTime();
  return age < SESSION_MAX_AGE_MS;
}

/** Memperbarui `lastActivityAt` (sliding expiry) tanpa mengganti token. */
export function touchSession(): void {
  const session = loadSession();
  if (!session) return;
  session.lastActivityAt = new Date().toISOString();
  try {
    localStorage.setItem(SESSION_KEY, JSON.stringify(session));
  } catch {
    // storage unavailable
  }
}

export function clearSession(reason?: string): void {
  try {
    localStorage.removeItem(SESSION_KEY);
    localStorage.setItem(AUTH_LOGGED_OUT_KEY, 'true');
  } catch {
    // storage unavailable
  }
  if (reason) pushNotification('Sesi Berakhir', reason);
}

/* =====================================================================================
 * Notifikasi Login (SF-PS-005)
 * ===================================================================================== */
export interface LoginNotification {
  id: string;
  waktu: string;
  judul: string;
  detail: string;
}

export function pushNotification(judul: string, detail: string): void {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    const list: LoginNotification[] = raw ? JSON.parse(raw) : [];
    const next = [{ id: `notif-${Date.now()}`, waktu: new Date().toISOString(), judul, detail }, ...list].slice(0, 30);
    localStorage.setItem(NOTIF_KEY, JSON.stringify(next));
  } catch {
    // storage unavailable
  }
}

export function getLoginNotifications(): LoginNotification[] {
  try {
    const raw = localStorage.getItem(NOTIF_KEY);
    if (raw) return JSON.parse(raw);
  } catch {
    // ignore corrupt storage
  }
  return [];
}

/* =====================================================================================
 * Lupa Kata Sandi — email -> OTP -> kata sandi baru
 * ===================================================================================== */
export function passwordMeetsPolicy(password: string): { ok: boolean; reason?: string } {
  if (password.length < 8) return { ok: false, reason: 'Kata sandi minimal 8 karakter.' };
  if (!/[A-Z]/.test(password)) return { ok: false, reason: 'Kata sandi harus mengandung minimal 1 huruf besar.' };
  if (!/[0-9]/.test(password)) return { ok: false, reason: 'Kata sandi harus mengandung minimal 1 angka.' };
  return { ok: true };
}

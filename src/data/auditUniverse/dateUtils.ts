/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Date helpers mirroring the prototypes' `addD`/`dd`/`fmt` (Plan "Migrate 27092026
 * prototypes"). Kept separate from `store.ts` so seed-resolution and UI formatting share one
 * implementation.
 */

/** "YYYY-MM-DD" for a Date, in local time (matches prototype `iso()`). */
export function toIsoDate(d: Date): string {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}

export function startOfToday(): Date {
  const d = new Date();
  d.setHours(0, 0, 0, 0);
  return d;
}

/** ISO date `offsetDays` away from `base` (matches prototype `addD(n)`). */
export function addDaysIso(base: Date, offsetDays: number): string {
  const d = new Date(base);
  d.setDate(d.getDate() + offsetDays);
  return toIsoDate(d);
}

/** ISO date `offsetDays` away from an existing ISO date string (matches prototype `addFrom`). */
export function addDaysFromIso(iso: string, offsetDays: number): string {
  const d = new Date(`${iso}T00:00:00`);
  d.setDate(d.getDate() + offsetDays);
  return toIsoDate(d);
}

/** "DD/MM/YYYY" for display (matches prototype `fmt`). */
export function formatIsoDate(iso?: string | null): string {
  if (!iso) return '–';
  const [y, m, d] = iso.split('-');
  return `${d}/${m}/${y}`;
}

/** Signed day difference between an ISO date and "today" (matches prototype `dd`). */
export function daysDiffFromToday(iso: string): number {
  const today = startOfToday();
  const target = new Date(`${iso}T00:00:00`);
  return Math.round((target.getTime() - today.getTime()) / 86400000);
}

/** "HH:mm" local timestamp appended to an ISO date, for log entries. */
export function isoDateTime(iso: string, jam = '09:00'): string {
  return `${iso}T${jam}`;
}

export function formatDateTime(waktu: string): string {
  const [datePart, timePart] = waktu.split('T');
  return `${formatIsoDate(datePart)}${timePart ? ' ' + timePart : ''}`;
}

export function formatBytes(bytes: number): string {
  if (bytes >= 1048576) return `${(bytes / 1048576).toFixed(1)} MB`;
  return `${Math.max(1, Math.round(bytes / 1024))} KB`;
}

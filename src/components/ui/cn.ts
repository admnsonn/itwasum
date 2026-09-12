/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Util penggabung className standar (clsx + tailwind-merge), dipakai oleh seluruh
 * atoms/molecules baru di `src/components/ui/` agar prop `className` opsional bisa
 * menimpa kelas default tanpa konflik urutan Tailwind.
 */
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

export function cn(...inputs: ClassValue[]): string {
  return twMerge(clsx(inputs));
}

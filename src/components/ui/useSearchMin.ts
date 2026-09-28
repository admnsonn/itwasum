/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Shared "search box + submit button" behaviour required by several Plane BA/SA specs
 * (SF-LP-002 E-Profile landing, SF-TI-014 Temuan landing, B.6 direktori pencarian, dst.):
 * the query is not applied on every keystroke, it needs at least `minLength` characters, and
 * a dedicated submit button (label "Cari") applies it. Below `minLength` the caller should
 * show a hint instead of results.
 */
import { useState } from 'react';

export interface UseSearchMinResult {
  /** Raw input box value, updates on every keystroke. */
  draft: string;
  setDraft: (v: string) => void;
  /** The value to actually filter by — only updates when `submit()` is called and valid. */
  applied: string;
  /** True once `draft` satisfies `minLength`/`maxLength` and can be submitted. */
  isValid: boolean;
  /** Call from the "Cari" button (or Enter key) to apply `draft` as the new `applied` value. */
  submit: () => void;
  /** Clears both draft and applied. */
  reset: () => void;
  minLength: number;
  maxLength: number;
}

export function useSearchMin(minLength = 3, maxLength = 100): UseSearchMinResult {
  const [draft, setDraft] = useState('');
  const [applied, setApplied] = useState('');

  const isValid = draft.trim().length === 0 || (draft.trim().length >= minLength && draft.trim().length <= maxLength);

  return {
    draft,
    setDraft,
    applied,
    isValid,
    submit: () => {
      const trimmed = draft.trim();
      if (trimmed.length === 0) return setApplied('');
      if (trimmed.length < minLength || trimmed.length > maxLength) return;
      setApplied(trimmed);
    },
    reset: () => {
      setDraft('');
      setApplied('');
    },
    minLength,
    maxLength,
  };
}

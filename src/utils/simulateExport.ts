/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Simulated file export shared by every module that has an "Ekspor"/"Unduh" action in the
 * Plane BA/SA specs (SF-RE-001 export naming, SF-TB-010/SF-TI export xlsx, B.6 export
 * direktori, dst). The app is frontend-only, so this triggers a real browser download of a
 * small placeholder file using the exact filename convention the spec calls for, instead of a
 * decorative button that does nothing.
 */

export type SimulatedExportFormat = 'pdf' | 'xlsx' | 'csv';

const MIME: Record<SimulatedExportFormat, string> = {
  pdf: 'application/pdf',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  csv: 'text/csv',
};

export interface SimulateExportOptions {
  /** File stem WITHOUT extension, e.g. `Ringkasan_Eksekutif_Polres_Kampar_2026-09-28`. */
  filename: string;
  format: SimulatedExportFormat;
  /** Optional extra lines shown inside the placeholder file body (for csv/pdf-as-text stand-ins). */
  note?: string;
}

/** Builds the spec's `<Nama>_<Objek>_<Tanggal>` stem so callers only pass the variable parts. */
export function buildExportFilename(parts: (string | undefined | null)[]): string {
  return parts
    .filter((p): p is string => !!p && p.trim().length > 0)
    .map((p) => p.trim().replace(/\s+/g, '_'))
    .join('_');
}

/** Triggers a real (simulated-content) browser download so export buttons are not dead ends. */
export function simulateExport({ filename, format, note }: SimulateExportOptions): void {
  const body = [
    `Dokumen simulasi ekspor — Satu Data Itwasum`,
    `Berkas: ${filename}.${format}`,
    `Dibuat: ${new Date().toLocaleString('id-ID')}`,
    note ? `\n${note}` : '',
    '\n(Berkas ini adalah placeholder demo; integrasi ekspor nyata belum terhubung.)',
  ].join('\n');
  const blob = new Blob([body], { type: MIME[format] });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = `${filename}.${format}`;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

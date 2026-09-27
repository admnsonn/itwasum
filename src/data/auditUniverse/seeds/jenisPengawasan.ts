/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GENERATED FILE — do not hand-edit.
 * Source: 27092026/prototipe-master-data.html, extracted verbatim via
 * evidence/itwasum/scripts/extract-27092026-seeds.mjs +
 * evidence/itwasum/scripts/generate-audit-universe-seeds.mjs (Plan "Migrate 27092026
 * prototypes", todo `extract-seeds`). Field defaults mirror the prototype's `.map()`
 * normalization exactly.
 */

import type { JenisPengawasan } from '../types';

/** 4.3 Jenis Pengawasan (+ sub-jenis) — 24 baris awal dari prototipe. */
export const JENIS_PENGAWASAN_SEED: JenisPengawasan[] = [
  {
    "id": "JP-01",
    "induk": "",
    "nama": "Wasrik Rutin",
    "sifat": "Terprogram",
    "ket": "Pemeriksaan rutin terprogram, dua tahap per tahun anggaran",
    "dipakai": true,
    "aktif": true
  },
  {
    "id": "JP-01.01",
    "induk": "JP-01",
    "nama": "Wasrik Rutin Tahap I",
    "sifat": "Terprogram",
    "ket": "Aspek perencanaan & pengorganisasian, umumnya Semester I",
    "dipakai": true,
    "aktif": true
  },
  {
    "id": "JP-01.02",
    "induk": "JP-01",
    "nama": "Wasrik Rutin Tahap II",
    "sifat": "Terprogram",
    "ket": "Aspek pelaksanaan & pengendalian, umumnya Semester II",
    "dipakai": true,
    "aktif": true
  },
  {
    "id": "JP-02",
    "induk": "",
    "nama": "Wasrik Khusus / ADTT",
    "sifat": "Tidak Terprogram",
    "ket": "Mendalami satu isu spesifik (Dumas, temuan berulang, atensi pimpinan)",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-03",
    "induk": "",
    "nama": "Wasops",
    "sifat": "Terprogram",
    "ket": "Pengawasan pelaksanaan operasi kepolisian (sifat perlu konfirmasi)",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-04",
    "induk": "",
    "nama": "Verifikasi",
    "sifat": "Tidak Terprogram",
    "ket": "Menguji kebenaran data dan dokumen yang dilaporkan (sifat perlu konfirmasi)",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-05",
    "induk": "",
    "nama": "Audit Kinerja",
    "sifat": "Terprogram",
    "ket": "Menilai outcome dan aspek 3E (sifat perlu konfirmasi)",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-06",
    "induk": "",
    "nama": "Reviu",
    "sifat": "Terprogram",
    "ket": "Keyakinan terbatas atas LK, RKA-K/L, serapan, BMN (sifat perlu konfirmasi)",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-06.01",
    "induk": "JP-06",
    "nama": "Reviu Laporan Keuangan",
    "sifat": "Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-06.02",
    "induk": "JP-06",
    "nama": "Reviu RKA-K/L",
    "sifat": "Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-06.03",
    "induk": "JP-06",
    "nama": "Reviu Penyerapan Anggaran & PBJ",
    "sifat": "Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-06.04",
    "induk": "JP-06",
    "nama": "Reviu Laporan BMN",
    "sifat": "Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-07",
    "induk": "",
    "nama": "Evaluasi",
    "sifat": "Terprogram",
    "ket": "Menilai mutu penyelenggaraan sistem (sifat perlu konfirmasi)",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-07.01",
    "induk": "JP-07",
    "nama": "Evaluasi SAKIP / AKIP",
    "sifat": "Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-07.02",
    "induk": "JP-07",
    "nama": "Evaluasi Penyelenggaraan SPIP",
    "sifat": "Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-07.03",
    "induk": "JP-07",
    "nama": "Evaluasi ZI menuju WBK/WBBM",
    "sifat": "Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-07.04",
    "induk": "JP-07",
    "nama": "Evaluasi Kinerja Kasatker",
    "sifat": "Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-07.05",
    "induk": "JP-07",
    "nama": "Evaluasi Kapabilitas APIP",
    "sifat": "Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-08",
    "induk": "",
    "nama": "Pemantauan Tindak Lanjut",
    "sifat": "Terprogram",
    "ket": "Menuntaskan rekomendasi Wasrik dan temuan BPK (sifat perlu konfirmasi)",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-09",
    "induk": "",
    "nama": "Kegiatan Pengawasan Lain",
    "sifat": "Tidak Terprogram",
    "ket": "Konsultasi, asistensi, Dumas, pendampingan (sifat perlu konfirmasi)",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-09.01",
    "induk": "JP-09",
    "nama": "Konsultasi",
    "sifat": "Tidak Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-09.02",
    "induk": "JP-09",
    "nama": "Sosialisasi & Asistensi",
    "sifat": "Tidak Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-09.03",
    "induk": "JP-09",
    "nama": "Penanganan Dumas",
    "sifat": "Tidak Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  },
  {
    "id": "JP-09.04",
    "induk": "JP-09",
    "nama": "Pendampingan Pengawas Eksternal",
    "sifat": "Tidak Terprogram",
    "ket": "",
    "dipakai": false,
    "aktif": true
  }
];

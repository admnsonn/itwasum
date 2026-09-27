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

import type { KatalogDokumen } from '../types';

/**
 * 4.4 Katalog Data & Dokumen — 129 baris dari seeder prototipe (`DOK_SEED`).
 * `cek` berisi catatan seeder tempat nilai kolom aslinya kosong dan diisi nilai bawaan
 * (dipertahankan verbatim sebagai jejak data untuk menu "Perlu Dicek" di SF-441).
 */
export const KATALOG_DOKUMEN_SEED: KatalogDokumen[] = [
  {
    "id": "DOK-PK-001",
    "kat": "PK",
    "nama": "Renstra",
    "desk": "Dokumen rencana strategis Satker untuk periode beberapa tahun. Digunakan auditor untuk memahami arah strategis, sasaran, target, dan program utama Satker.",
    "jenis": "Dokumen",
    "cara": "Terjadwal",
    "sumber": "Google Drive",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": true
  },
  {
    "id": "DOK-PK-002",
    "kat": "PK",
    "nama": "Renja",
    "desk": "Rencana kerja tahunan Satker yang menjabarkan program/kegiatan yang akan dilaksanakan dalam satu tahun. Digunakan untuk membandingkan rencana dengan realisasi.",
    "jenis": "Dokumen",
    "cara": "Terjadwal",
    "sumber": "Google Drive",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": true
  },
  {
    "id": "DOK-PK-003",
    "kat": "PK",
    "nama": "LKIP (Laporan Kinerja Instansi Pemerintah)",
    "desk": "dokumen pelaporan tahunan yang menyajikan pertanggungjawaban atas pencapaian kinerja suatu Satker berdasarkan target kinerja yang telah ditetapkan.",
    "jenis": "Dokumen",
    "cara": "Terjadwal",
    "sumber": "Google Drive",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": true
  },
  {
    "id": "DOK-PK-004",
    "kat": "PK",
    "nama": "Perjanjian Kinerja (PK)",
    "desk": "Komitmen antara pimpinan Satker dan pihak yang memberikan amanah mengenai target kinerja yang harus dicapai. Menjadi dasar pengujian pencapaian kinerja.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PK-005",
    "kat": "PK",
    "nama": "IKU",
    "desk": "Daftar indikator kinerja utama beserta targetnya. Digunakan untuk mengukur apakah sasaran strategis Satker tercapai.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PK-006",
    "kat": "PK",
    "nama": "IKK",
    "desk": "Indikator yang digunakan untuk mengukur pencapaian kinerja pada program/kegiatan tertentu.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PK-007",
    "kat": "PK",
    "nama": "Renaksi / Rencana Aksi",
    "desk": "Rincian tindakan, kegiatan, waktu, dan target yang dilakukan untuk mencapai sasaran atau target kinerja.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PK-008",
    "kat": "PK",
    "nama": "Laporan Evaluasi Kinerja",
    "desk": "Hasil evaluasi terhadap pencapaian kinerja dan faktor yang memengaruhinya. Membantu auditor menemukan gap antara target dan realisasi.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PK-009",
    "kat": "PK",
    "nama": "Laporan Capaian Kinerja",
    "desk": "Menunjukkan realisasi indikator dibandingkan target yang telah ditetapkan. Digunakan sebagai evidence pencapaian kinerja.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PK-010",
    "kat": "PK",
    "nama": "Laporan Pelaksanaan Program/Kegiatan",
    "desk": "Menjelaskan pelaksanaan program/kegiatan, hasil, kendala, dan output yang telah dicapai.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AK-001",
    "kat": "AK",
    "nama": "RKA-K/L",
    "desk": "Dokumen perencanaan anggaran yang memuat program, kegiatan, output, dan kebutuhan anggaran. Digunakan untuk melihat dasar perencanaan penggunaan anggaran.",
    "jenis": "Dokumen",
    "cara": "Terjadwal",
    "sumber": "Google Drive",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": true
  },
  {
    "id": "DOK-AK-002",
    "kat": "AK",
    "nama": "DIPA",
    "desk": "Dokumen pelaksanaan anggaran yang menjadi dasar Satker menggunakan anggaran. Digunakan untuk membandingkan anggaran yang tersedia dengan realisasi.",
    "jenis": "Dokumen",
    "cara": "Terjadwal",
    "sumber": "Google Drive",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber kosong di seeder, diisi bawaan \"Google Drive\""
    ],
    "dipakai": true
  },
  {
    "id": "DOK-AK-003",
    "kat": "AK",
    "nama": "Petunjuk Operasional Kegiatan (POK)",
    "desk": "Rincian operasional pelaksanaan kegiatan dan penggunaan anggaran berdasarkan DIPA. Membantu auditor memahami detail penggunaan anggaran.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AK-004",
    "kat": "AK",
    "nama": "Revisi DIPA",
    "desk": "Dokumen yang menunjukkan perubahan alokasi anggaran setelah DIPA awal ditetapkan. Digunakan untuk menelusuri perubahan anggaran.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AK-005",
    "kat": "AK",
    "nama": "Revisi Anggaran",
    "desk": "Dokumen pendukung perubahan perencanaan/alokasi anggaran. Digunakan untuk melihat alasan dan dampak perubahan anggaran.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AK-006",
    "kat": "AK",
    "nama": "LRA",
    "desk": "Laporan yang menunjukkan realisasi pendapatan dan belanja dibandingkan dengan anggaran. Merupakan evidence utama untuk analisis penyerapan anggaran.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AK-007",
    "kat": "AK",
    "nama": "Laporan Realisasi Anggaran Periodik",
    "desk": "Laporan realisasi anggaran berdasarkan periode tertentu, misalnya bulanan/triwulanan/semesteran.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AK-008",
    "kat": "AK",
    "nama": "Laporan Keuangan",
    "desk": "Menyajikan kondisi dan pertanggungjawaban keuangan Satker. Digunakan untuk pengujian aspek keuangan secara lebih menyeluruh.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AK-009",
    "kat": "AK",
    "nama": "Laporan Pertanggung jawaban Keuangan",
    "desk": "Dokumen yang menunjukkan pertanggungjawaban atas penggunaan dana/kegiatan tertentu.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AK-010",
    "kat": "AK",
    "nama": "Laporan SAI",
    "desk": "Dokumen yang berkaitan dengan sistem akuntansi instansi dan pelaporan keuangan Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AK-011",
    "kat": "AK",
    "nama": "Dokumen Rekonsiliasi Keuangan",
    "desk": "Bukti proses pencocokan data transaksi/realisasi antara unit atau sistem terkait untuk memastikan konsistensi data.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AK-012",
    "kat": "AK",
    "nama": "IKPA",
    "desk": "Indikator untuk mengukur kualitas pelaksanaan anggaran, bukan hanya tingkat penyerapan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AK-013",
    "kat": "AK",
    "nama": "Dokumen/Laporan PNBP",
    "desk": "Menunjukkan penerimaan negara bukan pajak yang dikelola Satker, termasuk target dan realisasinya.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-001",
    "kat": "PBJ",
    "nama": "RUP",
    "desk": "Rencana Umum Pengadaan yang menunjukkan rencana paket pengadaan Satker. Digunakan untuk mengetahui pengadaan yang direncanakan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-002",
    "kat": "PBJ",
    "nama": "KAK/TOR",
    "desk": "Menjelaskan kebutuhan, tujuan, ruang lingkup, output, dan spesifikasi umum pekerjaan/pengadaan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-003",
    "kat": "PBJ",
    "nama": "RAB",
    "desk": "Rincian kebutuhan biaya suatu kegiatan atau pekerjaan. Digunakan untuk menguji kewajaran dan kesesuaian perencanaan biaya.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-004",
    "kat": "PBJ",
    "nama": "HPS",
    "desk": "Dasar perhitungan nilai perkiraan pengadaan. Digunakan dalam pengujian kewajaran harga dan proses pengadaan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-005",
    "kat": "PBJ",
    "nama": "Spesifikasi Teknis",
    "desk": "Menjelaskan persyaratan teknis barang/jasa yang harus dipenuhi.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-006",
    "kat": "PBJ",
    "nama": "Dokumen Pemilihan/Penawaran",
    "desk": "Dokumen yang digunakan dalam proses pemilihan penyedia dan penawaran.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-007",
    "kat": "PBJ",
    "nama": "Kontrak/SPK",
    "desk": "Perjanjian antara Satker dengan penyedia yang menetapkan pekerjaan, nilai, waktu, hak, dan kewajiban para pihak.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-008",
    "kat": "PBJ",
    "nama": "Surat Pesanan",
    "desk": "Dokumen pemesanan barang/jasa kepada penyedia, terutama pada mekanisme pengadaan tertentu.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-009",
    "kat": "PBJ",
    "nama": "BAST",
    "desk": "Berita acara yang membuktikan bahwa barang/pekerjaan telah diserahkan dan diterima.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-010",
    "kat": "PBJ",
    "nama": "Berita Acara Pemeriksaan Barang/Pekerjaan",
    "desk": "Bukti bahwa barang/pekerjaan telah diperiksa sebelum diterima atau dibayarkan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-011",
    "kat": "PBJ",
    "nama": "Dokumen Pembayaran",
    "desk": "Dokumen pendukung proses pembayaran kepada penyedia/pihak terkait.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-012",
    "kat": "PBJ",
    "nama": "Bukti Pembayaran",
    "desk": "Evidence bahwa pembayaran benar-benar telah dilakukan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\"",
      "Nama kembar dengan dokumen di kategori lain"
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-013",
    "kat": "PBJ",
    "nama": "Adendum Kontrak",
    "desk": "Dokumen perubahan terhadap kontrak yang telah berjalan, misalnya perubahan volume, waktu, atau nilai.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-014",
    "kat": "PBJ",
    "nama": "Dokumen Denda/Sanksi",
    "desk": "Bukti pengenaan denda atau sanksi apabila penyedia tidak memenuhi ketentuan kontrak.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-PBJ-015",
    "kat": "PBJ",
    "nama": "Laporan Pelaksanaan Pekerjaan",
    "desk": "Menjelaskan progres dan hasil pelaksanaan pekerjaan dibandingkan dengan kontrak.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-001",
    "kat": "BMN",
    "nama": "Daftar BMN",
    "desk": "Daftar aset/barang milik negara yang berada dalam penguasaan Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-002",
    "kat": "BMN",
    "nama": "SIMAK-BMN",
    "desk": "Data/sistem administrasi BMN yang digunakan sebagai dasar pencatatan dan pelaporan aset.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-003",
    "kat": "BMN",
    "nama": "KIB",
    "desk": "Kartu/daftar inventaris yang memberikan informasi detail mengenai aset tertentu.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-004",
    "kat": "BMN",
    "nama": "Rekap Kondisi BMN",
    "desk": "Menunjukkan kondisi aset, misalnya baik, rusak ringan, atau rusak berat.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-005",
    "kat": "BMN",
    "nama": "Daftar Aset Tetap",
    "desk": "Daftar aset tetap yang dimiliki/dikuasai Satker beserta informasi terkait.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-006",
    "kat": "BMN",
    "nama": "Daftar Persediaan",
    "desk": "Data barang persediaan yang dimiliki Satker pada periode tertentu.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-007",
    "kat": "BMN",
    "nama": "Daftar Aset Rusak",
    "desk": "Daftar BMN yang mengalami kerusakan dan membutuhkan penanganan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-008",
    "kat": "BMN",
    "nama": "Dokumen Pengadaan Aset",
    "desk": "Bukti proses perolehan aset, mulai dari perencanaan sampai pengadaan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-009",
    "kat": "BMN",
    "nama": "Dokumen Penerimaan BMN",
    "desk": "Bukti bahwa aset telah diterima oleh Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-010",
    "kat": "BMN",
    "nama": "BAST BMN",
    "desk": "Bukti serah terima barang/aset kepada Satker atau pihak terkait.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-011",
    "kat": "BMN",
    "nama": "Dokumen Pemanfaatan BMN",
    "desk": "Menjelaskan penggunaan/pemanfaatan BMN sesuai ketentuan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-012",
    "kat": "BMN",
    "nama": "Dokumen Pemindahtanganan BMN",
    "desk": "Bukti proses pemindahan kepemilikan/penguasaan BMN.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-013",
    "kat": "BMN",
    "nama": "Dokumen Penghapusan BMN",
    "desk": "Bukti proses penghapusan aset dari daftar BMN.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-014",
    "kat": "BMN",
    "nama": "Usulan Kebutuhan BMN",
    "desk": "Menjelaskan kebutuhan barang/aset yang diperlukan Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-BMN-015",
    "kat": "BMN",
    "nama": "Laporan Inventarisasi BMN",
    "desk": "Hasil kegiatan inventarisasi untuk memastikan kesesuaian antara aset fisik dan catatan administrasi.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-001",
    "kat": "SDM",
    "nama": "Daftar Personel",
    "desk": "Data personel yang bertugas pada Satker pada periode tertentu.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-002",
    "kat": "SDM",
    "nama": "DSP",
    "desk": "Data kebutuhan personel berdasarkan struktur dan kebutuhan organisasi.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-003",
    "kat": "SDM",
    "nama": "Data Personel Riil",
    "desk": "Jumlah dan komposisi personel aktual yang tersedia. Digunakan untuk menghitung gap DSP vs riil.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-004",
    "kat": "SDM",
    "nama": "Daftar Jabatan",
    "desk": "Daftar jabatan yang tersedia dan/atau terisi dalam organisasi.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-005",
    "kat": "SDM",
    "nama": "Struktur Organisasi",
    "desk": "Menunjukkan susunan unit, hubungan kerja, dan hierarki Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\"",
      "Nama kembar dengan dokumen di kategori lain"
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-006",
    "kat": "SDM",
    "nama": "Daftar Pejabat",
    "desk": "Informasi pejabat yang menduduki posisi tertentu pada Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-007",
    "kat": "SDM",
    "nama": "Kebutuhan Personel",
    "desk": "Rincian kebutuhan tambahan personel berdasarkan fungsi atau jabatan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-008",
    "kat": "SDM",
    "nama": "Data Pendidikan",
    "desk": "Informasi tingkat dan latar belakang pendidikan personel.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-009",
    "kat": "SDM",
    "nama": "Data Kompetensi",
    "desk": "Informasi kompetensi yang dimiliki personel dan relevansinya dengan jabatan/tugas.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-010",
    "kat": "SDM",
    "nama": "Data Sertifikasi",
    "desk": "Informasi sertifikasi yang dimiliki personel beserta status/masa berlakunya jika tersedia.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-011",
    "kat": "SDM",
    "nama": "Data Mutasi",
    "desk": "Riwayat perpindahan personel yang dapat memengaruhi komposisi dan kapasitas SDM.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-012",
    "kat": "SDM",
    "nama": "Data Absensi/Kehadiran",
    "desk": "Data kehadiran personel untuk kebutuhan pengujian tertentu. Conditional, tidak selalu diperlukan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SDM-013",
    "kat": "SDM",
    "nama": "Data Pengembangan Kompetensi",
    "desk": "Informasi pendidikan/pelatihan yang telah diikuti personel.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-001",
    "kat": "OPS",
    "nama": "Laporan Pelaksanaan Kegiatan",
    "desk": "Menjelaskan kegiatan yang telah dilakukan dan hasil yang diperoleh.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-002",
    "kat": "OPS",
    "nama": "Laporan Operasional Periodik",
    "desk": "Memberikan gambaran aktivitas operasional Satker dalam periode tertentu.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-003",
    "kat": "OPS",
    "nama": "Laporan Pelaksanaan Operasi",
    "desk": "Menjelaskan pelaksanaan operasi, tujuan, personel, kegiatan, dan hasilnya.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-004",
    "kat": "OPS",
    "nama": "Laporan Hasil Operasi",
    "desk": "Menunjukkan output/outcome yang dihasilkan dari operasi.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-005",
    "kat": "OPS",
    "nama": "Laporan Pelayanan Masyarakat",
    "desk": "Menunjukkan aktivitas dan hasil pelayanan kepada masyarakat.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-006",
    "kat": "OPS",
    "nama": "Laporan Pembinaan",
    "desk": "Menjelaskan kegiatan pembinaan terhadap personel/masyarakat/objek binaan sesuai fungsi Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-007",
    "kat": "OPS",
    "nama": "Laporan Penanganan Perkara",
    "desk": "Menunjukkan jumlah, status, proses, dan penyelesaian perkara.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-008",
    "kat": "OPS",
    "nama": "Rekap Tindak Pidana",
    "desk": "Data statistik tindak pidana berdasarkan jenis, wilayah, periode, dan status.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-009",
    "kat": "OPS",
    "nama": "Rekap Laka Lantas",
    "desk": "Data kecelakaan lalu lintas beserta korban, lokasi, waktu, dan karakteristik kecelakaan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-010",
    "kat": "OPS",
    "nama": "Laporan Patroli",
    "desk": "Menunjukkan pelaksanaan patroli, wilayah, waktu, kegiatan, dan hasil.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-011",
    "kat": "OPS",
    "nama": "Laporan Pengamanan",
    "desk": "Menjelaskan kegiatan pengamanan dan hasil pelaksanaannya.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-012",
    "kat": "OPS",
    "nama": "Laporan Intelijen",
    "desk": "Informasi hasil kegiatan intelijen sesuai kewenangan dan klasifikasi akses.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-013",
    "kat": "OPS",
    "nama": "Laporan Penegakan Hukum",
    "desk": "Menunjukkan aktivitas dan hasil penegakan hukum sesuai fungsi Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-014",
    "kat": "OPS",
    "nama": "Laporan Pengawasan",
    "desk": "Menjelaskan aktivitas pengawasan dan hasil yang diperoleh.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-015",
    "kat": "OPS",
    "nama": "Laporan Kesehatan",
    "desk": "Data pelayanan/kegiatan kesehatan, terutama untuk Satker yang memiliki fungsi kesehatan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-OPS-016",
    "kat": "OPS",
    "nama": "Laporan Pendidikan/Pelatihan",
    "desk": "Data pelaksanaan pendidikan atau pelatihan, peserta, output, dan hasil.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-RSK-001",
    "kat": "RSK",
    "nama": "Buku MR",
    "desk": "Daftar risiko yang telah diidentifikasi Satker, termasuk penyebab, dampak, dan level risiko.",
    "jenis": "Dokumen",
    "cara": "Integrasi",
    "sumber": "E-MR",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"E-MR / Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Integrasi\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-RSK-002",
    "kat": "RSK",
    "nama": "Profil Risiko",
    "desk": "Gambaran kondisi risiko Satker secara lebih menyeluruh berdasarkan hasil identifikasi dan analisis risiko.",
    "jenis": "Dokumen",
    "cara": "Integrasi",
    "sumber": "E-MR",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"E-MR / Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Integrasi\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-RSK-003",
    "kat": "RSK",
    "nama": "Rencana Mitigasi Risiko",
    "desk": "Rencana tindakan untuk mengurangi kemungkinan atau dampak risiko.",
    "jenis": "Dokumen",
    "cara": "Integrasi",
    "sumber": "E-MR",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"E-MR / Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Integrasi\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-RSK-004",
    "kat": "RSK",
    "nama": "Monitoring Risiko",
    "desk": "Catatan pemantauan perkembangan risiko dan efektivitas mitigasinya.",
    "jenis": "Dokumen",
    "cara": "Integrasi",
    "sumber": "E-MR",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"E-MR / Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Integrasi\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-RSK-005",
    "kat": "RSK",
    "nama": "Laporan Risiko",
    "desk": "Laporan perkembangan dan kondisi risiko Satker pada periode tertentu.",
    "jenis": "Dokumen",
    "cara": "Integrasi",
    "sumber": "E-MR",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"E-MR / Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Integrasi\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-RSK-006",
    "kat": "RSK",
    "nama": "Dokumen SPIP",
    "desk": "Dokumen yang menunjukkan penerapan Sistem Pengendalian Intern Pemerintah pada Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Upload\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-RSK-007",
    "kat": "RSK",
    "nama": "Penilaian Mandiri SPIP",
    "desk": "Hasil self-assessment Satker terhadap penerapan SPIP.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Upload\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-RSK-008",
    "kat": "RSK",
    "nama": "Hasil Evaluasi SPIP (PK & Evaluator)",
    "desk": "Hasil evaluasi terhadap penerapan dan efektivitas SPIP.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Upload\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-RSK-009",
    "kat": "RSK",
    "nama": "Rencana Tindak Pengendalian (RTP)",
    "desk": "Rencana tindakan untuk memperbaiki atau memperkuat pengendalian internal.",
    "jenis": "Dokumen",
    "cara": "Integrasi",
    "sumber": "E-MR",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"E-MR / Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Integrasi\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-RSK-010",
    "kat": "RSK",
    "nama": "Monitoring Pengendalian",
    "desk": "Bukti pemantauan atas pelaksanaan dan efektivitas pengendalian.",
    "jenis": "Dokumen",
    "cara": "Integrasi",
    "sumber": "E-MR",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"E-MR / Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Integrasi\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-RSK-011",
    "kat": "RSK",
    "nama": "Peta Risiko",
    "desk": "Visualisasi distribusi risiko berdasarkan kemungkinan dan dampaknya.",
    "jenis": "Dokumen",
    "cara": "Integrasi",
    "sumber": "E-MR",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"E-MR / Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Integrasi\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-001",
    "kat": "AUD",
    "nama": "Laporan Hasil Audit/Pemeriksaan",
    "desk": "Hasil pemeriksaan/audit yang telah dilakukan sebelumnya.",
    "jenis": "Data",
    "cara": "Integrasi",
    "sumber": "E-Audit",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-002",
    "kat": "AUD",
    "nama": "Laporan Hasil Pengawasan",
    "desk": "Hasil kegiatan pengawasan terhadap Satker.",
    "jenis": "Data",
    "cara": "Integrasi",
    "sumber": "E-Audit",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-003",
    "kat": "AUD",
    "nama": "Daftar Temuan",
    "desk": "Daftar permasalahan/temuan yang ditemukan dalam pemeriksaan.",
    "jenis": "Data",
    "cara": "Integrasi",
    "sumber": "E-Audit",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-004",
    "kat": "AUD",
    "nama": "Daftar Rekomendasi",
    "desk": "Daftar rekomendasi perbaikan yang diberikan auditor.",
    "jenis": "Data",
    "cara": "Integrasi",
    "sumber": "E-Audit",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-005",
    "kat": "AUD",
    "nama": "Rencana Tindak Lanjut",
    "desk": "Rencana tindakan Satker untuk menyelesaikan rekomendasi/temuan.",
    "jenis": "Data",
    "cara": "Integrasi",
    "sumber": "E-Audit",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-006",
    "kat": "AUD",
    "nama": "Bukti Tindak Lanjut",
    "desk": "Dokumen yang membuktikan bahwa rekomendasi telah ditindaklanjuti.",
    "jenis": "Data",
    "cara": "Integrasi",
    "sumber": "E-Audit",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-007",
    "kat": "AUD",
    "nama": "Status TLHP",
    "desk": "Informasi status penyelesaian tindak lanjut hasil pemeriksaan.",
    "jenis": "Data",
    "cara": "Integrasi",
    "sumber": "E-Audit",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-008",
    "kat": "AUD",
    "nama": "Laporan Monitoring Tindak Lanjut",
    "desk": "Laporan perkembangan penyelesaian rekomendasi/temuan.",
    "jenis": "Data",
    "cara": "Integrasi",
    "sumber": "E-Audit",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-009",
    "kat": "AUD",
    "nama": "Laporan Supervisi",
    "desk": "Hasil kegiatan supervisi terhadap pelaksanaan tugas/kegiatan Satker.",
    "jenis": "Data",
    "cara": "Integrasi",
    "sumber": "E-Audit",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-010",
    "kat": "AUD",
    "nama": "Laporan Monitoring",
    "desk": "Hasil pemantauan terhadap kegiatan, program, risiko, atau tindak lanjut.",
    "jenis": "Data",
    "cara": "Integrasi",
    "sumber": "E-Audit",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-011",
    "kat": "AUD",
    "nama": "Dokumen Audit Sebelumnya",
    "desk": "Dokumen dari audit periode sebelumnya yang diperlukan untuk melihat historical issue dan recurring findings.",
    "jenis": "Data",
    "cara": "Integrasi",
    "sumber": "E-Audit",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-AUD-012",
    "kat": "AUD",
    "nama": "Temuan BPK",
    "desk": "Data temuan yang di isi oleh BPK",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Wajib",
    "aktif": true,
    "cek": [
      "Sumber di seeder \"E-Audit / Google Drive SPIP\" tidak sesuai Cara Pengambilan \"Upload\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-LGL-001",
    "kat": "LGL",
    "nama": "Peraturan Organisasi/Tugas Fungsi",
    "desk": "Menjadi dasar untuk memahami kewenangan, tugas, fungsi, dan tanggung jawab Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-LGL-002",
    "kat": "LGL",
    "nama": "Struktur Organisasi",
    "desk": "Menunjukkan struktur dan hubungan kewenangan dalam Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\"",
      "Nama kembar dengan dokumen di kategori lain"
    ],
    "dipakai": false
  },
  {
    "id": "DOK-LGL-003",
    "kat": "LGL",
    "nama": "SOP",
    "desk": "Menjelaskan prosedur standar pelaksanaan proses/kegiatan yang menjadi objek audit.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-LGL-004",
    "kat": "LGL",
    "nama": "SK Pimpinan",
    "desk": "Bukti formal penetapan pejabat, kebijakan, tim, atau keputusan tertentu.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-LGL-005",
    "kat": "LGL",
    "nama": "Surat Perintah",
    "desk": "Dasar formal pelaksanaan tugas tertentu oleh personel/unit.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-LGL-006",
    "kat": "LGL",
    "nama": "Surat Tugas",
    "desk": "Menjadi dasar penugasan personel untuk menjalankan kegiatan tertentu.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-LGL-007",
    "kat": "LGL",
    "nama": "Nota Dinas",
    "desk": "Dokumen komunikasi kedinasan yang dapat menjadi evidence proses pengambilan/penyampaian keputusan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-LGL-008",
    "kat": "LGL",
    "nama": "Perjanjian Kerja Sama",
    "desk": "Mengatur hubungan, kewajiban, dan tanggung jawab Satker dengan pihak lain.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-LGL-009",
    "kat": "LGL",
    "nama": "MoU",
    "desk": "Dokumen kesepahaman formal dengan pihak lain terkait kerja sama tertentu.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-LGL-010",
    "kat": "LGL",
    "nama": "Peraturan Internal",
    "desk": "Ketentuan internal yang menjadi dasar pelaksanaan proses atau kegiatan Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Jenis kosong di seeder, diisi bawaan \"Dokumen\"",
      "Cara Pengambilan kosong di seeder, diisi bawaan \"Upload\"",
      "Sifat kosong di seeder, diisi bawaan \"Opsional\""
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SE-001",
    "kat": "SE",
    "nama": "Foto Kegiatan",
    "desk": "Bukti visual bahwa kegiatan benar-benar dilaksanakan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-002",
    "kat": "SE",
    "nama": "Dokumentasi Kegiatan",
    "desk": "Bukti pelaksanaan kegiatan dalam bentuk foto/video/dokumen pendukung lainnya.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-003",
    "kat": "SE",
    "nama": "Daftar Hadir",
    "desk": "Membuktikan keterlibatan peserta/personel dalam kegiatan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-004",
    "kat": "SE",
    "nama": "Notulen",
    "desk": "Mencatat pembahasan, keputusan, dan tindak lanjut suatu rapat/kegiatan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-005",
    "kat": "SE",
    "nama": "Berita Acara",
    "desk": "Bukti formal bahwa suatu aktivitas/proses telah dilakukan atau disepakati.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-006",
    "kat": "SE",
    "nama": "Surat Undangan",
    "desk": "Membuktikan adanya agenda/kegiatan/rapat resmi.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-007",
    "kat": "SE",
    "nama": "Surat Tugas/Perintah",
    "desk": "Membuktikan dasar penugasan pelaksanaan kegiatan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-008",
    "kat": "SE",
    "nama": "Bukti Pembayaran",
    "desk": "Membuktikan transaksi atau pembayaran telah dilakukan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [
      "Nama kembar dengan dokumen di kategori lain"
    ],
    "dipakai": false
  },
  {
    "id": "DOK-SE-009",
    "kat": "SE",
    "nama": "Bukti Transfer",
    "desk": "Evidence transaksi pembayaran melalui rekening/perbankan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-010",
    "kat": "SE",
    "nama": "Bukti Penerimaan Barang",
    "desk": "Membuktikan barang telah diterima oleh Satker.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-011",
    "kat": "SE",
    "nama": "Bukti Pelaksanaan",
    "desk": "Evidence bahwa aktivitas atau pekerjaan telah benar-benar dilaksanakan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-012",
    "kat": "SE",
    "nama": "Output Kegiatan",
    "desk": "Produk/hasil langsung dari suatu kegiatan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-013",
    "kat": "SE",
    "nama": "Laporan Kegiatan",
    "desk": "Menjelaskan pelaksanaan, hasil, dan kendala suatu kegiatan.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  },
  {
    "id": "DOK-SE-014",
    "kat": "SE",
    "nama": "Dokumen Pendukung Indikator",
    "desk": "Evidence yang digunakan untuk membuktikan pencapaian suatu indikator kinerja.",
    "jenis": "Dokumen",
    "cara": "Upload",
    "sumber": "Satu Data Itwasum",
    "sifat": "Opsional",
    "aktif": true,
    "cek": [],
    "dipakai": false
  }
];

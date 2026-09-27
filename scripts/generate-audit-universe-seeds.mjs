/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Second half of the one-off seed extraction (Plan "Migrate 27092026 prototypes", todo
 * `extract-seeds`). Reads the JSON dumps produced by `extract-27092026-seeds.mjs`
 * (`27092026/.extracted/{ORG,TIP,JP,BJ}_BASE.json`, `DOK_SEED.json`) and emits typed TS seed
 * files under `src/data/auditUniverse/seeds/`, applying the exact same default-field
 * `.map()` normalization the original prototype (`prototipe-master-data.html`) used, so the
 * generated data is field-for-field identical to what the prototype rendered.
 *
 * Usage: node evidence/itwasum/scripts/generate-audit-universe-seeds.mjs
 * (run after extract-27092026-seeds.mjs)
 */
import { readFileSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const extractedDir = path.join(repoRoot, '27092026/.extracted');
const outDir = path.join(__dirname, '../src/data/auditUniverse/seeds');

const readJson = (name) => JSON.parse(readFileSync(path.join(extractedDir, name), 'utf8'));

const HEADER = `/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * GENERATED FILE — do not hand-edit.
 * Source: 27092026/prototipe-master-data.html, extracted verbatim via
 * evidence/itwasum/scripts/extract-27092026-seeds.mjs +
 * evidence/itwasum/scripts/generate-audit-universe-seeds.mjs (Plan "Migrate 27092026
 * prototypes", todo \`extract-seeds\`). Field defaults mirror the prototype's \`.map()\`
 * normalization exactly.
 */
`;

// ---------------------------------------------------------------------------------------
// ORG (26 rows) — prototype default: {itwil:"",aktif:true,alasan:"",tip:null,kode:"",ang:"",
// peng:"",ketTip:"",perm:false} merged under the literal row.
// ---------------------------------------------------------------------------------------
const orgBase = readJson('ORG_BASE.json');
const orgDefaults = { itwil: '', aktif: true, alasan: '', tip: null, kode: '', ang: '', peng: '', ketTip: '', perm: false };
const orgUnits = orgBase.map((row) => ({ ...orgDefaults, ...row }));

const orgTs = `${HEADER}
import type { OrgUnit } from '../types';

/** 4.1 Struktur Organisasi & Unit Kerja — 26 baris awal dari prototipe. */
export const ORG_UNITS_SEED: OrgUnit[] = ${JSON.stringify(orgUnits, null, 2)};
`;
writeFileSync(path.join(outDir, 'orgUnits.ts'), orgTs, 'utf8');
console.log(`orgUnits.ts (${orgUnits.length} rows)`);

// ---------------------------------------------------------------------------------------
// TIP (10 rows): [id, jenjang, nama] -> +{ket, aktif}
// ---------------------------------------------------------------------------------------
const tipBase = readJson('TIP_BASE.json');
const tipologi = tipBase.map(([id, jenjang, nama]) => ({
  id,
  jenjang,
  nama,
  ket: 'Data awal dari prototipe — perlu konfirmasi Itwasum',
  aktif: true,
}));
const tipTs = `${HEADER}
import type { Tipologi } from '../types';

/** 4.2 Daftar Tipologi Satker — 10 baris awal dari prototipe. */
export const TIPOLOGI_SEED: Tipologi[] = ${JSON.stringify(tipologi, null, 2)};
`;
writeFileSync(path.join(outDir, 'tipologi.ts'), tipTs, 'utf8');
console.log(`tipologi.ts (${tipologi.length} rows)`);

// ---------------------------------------------------------------------------------------
// JP (24 rows): [id, induk, nama, sifat, ket, dipakai] -> +{aktif}
// ---------------------------------------------------------------------------------------
const jpBase = readJson('JP_BASE.json');
const jenisPengawasan = jpBase.map(([id, induk, nama, sifat, ket, dipakai]) => ({
  id,
  induk,
  nama,
  sifat,
  ket,
  dipakai,
  aktif: true,
}));
const jpTs = `${HEADER}
import type { JenisPengawasan } from '../types';

/** 4.3 Jenis Pengawasan (+ sub-jenis) — 24 baris awal dari prototipe. */
export const JENIS_PENGAWASAN_SEED: JenisPengawasan[] = ${JSON.stringify(jenisPengawasan, null, 2)};
`;
writeFileSync(path.join(outDir, 'jenisPengawasan.ts'), jpTs, 'utf8');
console.log(`jenisPengawasan.ts (${jenisPengawasan.length} rows)`);

// ---------------------------------------------------------------------------------------
// BJ (4 rows): [id, nama, sing, cak] -> +{aktif}
// ---------------------------------------------------------------------------------------
const bjBase = readJson('BJ_BASE.json');
const bidjemen = bjBase.map(([id, nama, sing, cak]) => ({ id, nama, sing, cak, aktif: true }));
const bjTs = `${HEADER}
import type { Bidjemen } from '../types';

/** 4.3 Bidjemen (Bidang Manajemen) — 4 baris dari prototipe. */
export const BIDJEMEN_SEED: Bidjemen[] = ${JSON.stringify(bidjemen, null, 2)};
`;
writeFileSync(path.join(outDir, 'bidjemen.ts'), bjTs, 'utf8');
console.log(`bidjemen.ts (${bidjemen.length} rows)`);

// ---------------------------------------------------------------------------------------
// DOK_SEED (129 rows): [kat, nama, desk, jenis, cara, sumber, sifat, cek[]]
// -> id `DOK-{kat}-{seq:03}` (sequenced per kategori, in source order), aktif:true,
//    dipakai: nama in DIPAKAI (names used elsewhere as "wajib tayang" in the prototype).
// ---------------------------------------------------------------------------------------
const dokSeed = readJson('DOK_SEED.json');
const DIPAKAI = ['Renstra', 'Renja', 'LKIP (Laporan Kinerja Instansi Pemerintah)', 'DIPA', 'RKA-K/L'];
const kseq = {};
const katalog = dokSeed.map(([kat, nama, desk, jenis, cara, sumber, sifat, cek]) => {
  kseq[kat] = (kseq[kat] || 0) + 1;
  const seq = String(kseq[kat]).padStart(3, '0');
  return {
    id: `DOK-${kat}-${seq}`,
    kat,
    nama,
    desk,
    jenis,
    cara,
    sumber,
    sifat,
    aktif: true,
    cek,
    dipakai: DIPAKAI.includes(nama),
  };
});
const dokTs = `${HEADER}
import type { KatalogDokumen } from '../types';

/**
 * 4.4 Katalog Data & Dokumen — 129 baris dari seeder prototipe (\`DOK_SEED\`).
 * \`cek\` berisi catatan seeder tempat nilai kolom aslinya kosong dan diisi nilai bawaan
 * (dipertahankan verbatim sebagai jejak data untuk menu "Perlu Dicek" di SF-441).
 */
export const KATALOG_DOKUMEN_SEED: KatalogDokumen[] = ${JSON.stringify(katalog, null, 2)};
`;
writeFileSync(path.join(outDir, 'katalogDokumen.ts'), dokTs, 'utf8');
console.log(`katalogDokumen.ts (${katalog.length} rows)`);

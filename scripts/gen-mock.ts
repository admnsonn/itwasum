/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Regenerator mock data deterministik untuk seluruh modul baru (Plan 2, bagian 2.5).
 *
 * `src/data/modules/genericModuleData.ts` memakai PRNG seeded (`src/utils/seededRandom.ts`,
 * seed = kode modul) sehingga isinya SELALU identik setiap kali dihitung ulang - baik saat
 * dirender di browser maupun saat skrip ini dijalankan di Node lewat `tsx`. Skrip ini menulis
 * snapshot JSON dari seluruh modul terdaftar sebagai bukti auditability ("data bisa diregenerasi
 * ulang secara identik dari sebuah seed", bukan `Math.random()` yang berubah setiap reload).
 *
 * Jalankan dengan: npx tsx scripts/gen-mock.ts
 */

import { writeFileSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { MODULE_REGISTRY } from '../src/config/moduleRegistry';
import { getGenericModuleContent } from '../src/data/modules/genericModuleData';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = resolve(__dirname, '..', 'src', 'data', 'modules', 'generated-mock-snapshot.json');

// Modul dengan tampilan bespoke/data nyata tidak memakai genericModuleData - dilewati di sini.
const SKIP_IDS = new Set(['beranda', 'b1', 'b2', 'b3', 'b6', 'b7', 'b9', 'b10', 'd', 'e5']);

function main() {
  const snapshot: Record<string, unknown> = {};
  let count = 0;

  for (const mod of MODULE_REGISTRY) {
    if (SKIP_IDS.has(mod.id)) continue;
    const content = getGenericModuleContent(mod);
    snapshot[mod.id] = {
      kode: mod.kode,
      label: mod.label,
      kpis: content.kpis,
      tableRowCount: content.tableRows.length,
      chartPoints: content.chart.length,
      narrative: content.narrative,
    };
    count++;
  }

  writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      {
        generatedAt: new Date().toISOString(),
        moduleCount: count,
        note: 'Snapshot deterministik - regenerasi ulang skrip ini pada seed yang sama akan menghasilkan isi identik.',
        modules: snapshot,
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log(`[gen-mock] ${count} modul di-snapshot ke ${OUTPUT_FILE}`);
}

main();

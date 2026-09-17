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
import { MODULE_CONTENT } from '../src/content/modules';

const __dirname = dirname(fileURLToPath(import.meta.url));
const OUTPUT_FILE = resolve(__dirname, '..', 'src', 'data', 'modules', 'generated-mock-snapshot.json');

const SKIP_IDS = new Set(['beranda', 'b1', 'b2', 'b3', 'b6', 'b7', 'b9', 'd', 'e5']);

const COMPOSED_MODULE_IDS = new Set([
  'a1', 'a2', 'a3', 'a4', 'c1', 'c2', 'e1', 'e2', 'e3', 'e4', 'e6', 'e7', 'e8', 'b11',
]);

function main() {
  const generatedAt = new Date().toISOString();
  const snapshot: Record<string, unknown> = {};
  let count = 0;

  for (const mod of MODULE_REGISTRY) {
    if (SKIP_IDS.has(mod.id)) continue;
    const content = getGenericModuleContent(mod);
    const entry: Record<string, unknown> = {
      kode: mod.kode,
      label: mod.label,
      kpis: content.kpis,
      tableRowCount: content.tableRows.length,
      chartPoints: content.chart.length,
      narrative: content.narrative,
    };

    if (COMPOSED_MODULE_IDS.has(mod.id)) {
      const composed = MODULE_CONTENT[mod.id];
      if (composed) {
        const screenSlug = composed.spec.screens[0]?.slug ?? 'default';
        const sections = composed.buildSections(mod, screenSlug);
        entry.composedSections = {
          screenSlug,
          sectionCount: sections.length,
          kpiSections: sections.filter((s) => s.kind === 'kpi-row').length,
          tableSections: sections.filter((s) => s.kind === 'table').length,
        };
      }
    }

    snapshot[mod.id] = entry;
    count++;
  }

  writeFileSync(
    OUTPUT_FILE,
    JSON.stringify(
      {
        moduleCount: count,
        note: 'Snapshot deterministik - regenerasi ulang skrip ini pada seed yang sama akan menghasilkan isi identik.',
        modules: snapshot,
      },
      null,
      2
    ),
    'utf-8'
  );

  console.log(`[gen-mock] generatedAt=${generatedAt}`);
  console.log(`[gen-mock] ${count} modul di-snapshot ke ${OUTPUT_FILE}`);
}

main();

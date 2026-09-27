/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * One-off extraction helper (Plan "Migrate 27092026 prototypes", todo `extract-seeds`).
 *
 * `27092026/permintaan-pengumpulan-data.html` is a *shell* that embeds three full HTML
 * prototypes as escaped JS strings in `const SRC = { md, pd, pt }` and mounts them into
 * `<iframe srcdoc>`. That makes the actual markup/script for `pd` (Permintaan Pengumpulan
 * Data, admin + PIC portal) and `pt` (Portal Data Satker, PIC + Verifikator) impossible to
 * `grep`/`Read` directly (it's all one escaped line).
 *
 * Step 1: safely evaluate the *data-only* `SRC` object literal (plain strings, no side
 * effects) with `new Function`, then write each decoded HTML document to
 * `27092026/.extracted/` so the seed arrays can be read/grepped normally.
 *
 * Step 2: for the large flat literal arrays that are tedious/error-prone to hand-transcribe
 * (`DOK_SEED` — 129 rows in master-data.html; `ORG`/`TIP`/`JP`/`BJ` base arrays before their
 * `.map()` normalization), extract the balanced literal via bracket-matching and evaluate it
 * with `new Function` (pure data, no calls) to emit exact JSON. The JSON is then hand-mapped
 * into typed TS under `src/data/auditUniverse/seeds/`, applying the same default-field
 * `.map()` logic the prototype used (documented inline in each generated seed file).
 *
 * Relative dates (e.g. `mulai: addD(-10)`) are intentionally NOT baked into absolute ISO
 * dates here — the prototype (and our store, see `store.ts`) computes them relative to
 * "today" at load time so seeded requests stay meaningfully "Berjalan"/"Terlambat" no matter
 * when the app is opened. Those day-offsets were read directly from
 * `27092026/.extracted/portal-data-satker.html` (function `seed()`) and hand-transcribed into
 * `seeds/permintaan.ts`.
 *
 * Usage: node evidence/itwasum/scripts/extract-27092026-seeds.mjs
 */
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(__dirname, '../../..');
const shellPath = path.join(repoRoot, '27092026/permintaan-pengumpulan-data.html');
const outDir = path.join(repoRoot, '27092026/.extracted');

/** Returns the index of the closing bracket matching the opener at `openIdx`, via a stack. */
function findMatchingClose(text, openIdx) {
  const PAIRS = { '[': ']', '{': '}', '(': ')' };
  const stack = [PAIRS[text[openIdx]]];
  for (let i = openIdx + 1; i < text.length; i++) {
    const ch = text[i];
    if (ch === '"' || ch === "'" || ch === '`') {
      // skip string literal (handles \" escapes)
      const quote = ch;
      i++;
      while (i < text.length && text[i] !== quote) {
        if (text[i] === '\\') i++;
        i++;
      }
      continue;
    }
    if (ch in PAIRS) {
      stack.push(PAIRS[ch]);
    } else if (ch === ']' || ch === '}' || ch === ')') {
      if (stack[stack.length - 1] !== ch) {
        throw new Error(`Bracket mismatch at index ${i}: expected ${stack[stack.length - 1]}, got ${ch}`);
      }
      stack.pop();
      if (stack.length === 0) return i;
    }
  }
  throw new Error('No matching close bracket found.');
}

/** Extracts and evaluates a top-level `const NAME=<literal>` (or `let`) array/object literal. */
function extractLiteral(source, varName) {
  const marker = new RegExp(`(?:const|let)\\s+${varName}\\s*=\\s*`).exec(source);
  if (!marker) throw new Error(`Could not find declaration for ${varName}`);
  const openIdx = marker.index + marker[0].length;
  const closeIdx = findMatchingClose(source, openIdx);
  const literal = source.slice(openIdx, closeIdx + 1);
  // eslint-disable-next-line no-new-func
  return new Function(`return (${literal});`)();
}

const shellSrc = readFileSync(shellPath, 'utf8');
const SRC = extractLiteral(shellSrc, 'SRC');

mkdirSync(outDir, { recursive: true });
const decoded = {};
for (const [key, filename] of [
  ['md', 'master-data.html'],
  ['pd', 'permintaan-pengumpulan-data.html'],
  ['pt', 'portal-data-satker.html'],
]) {
  if (!SRC[key]) {
    console.warn(`SRC.${key} not found, skipping.`);
    continue;
  }
  const outPath = path.join(outDir, filename);
  writeFileSync(outPath, SRC[key], 'utf8');
  decoded[key] = SRC[key];
  console.log(`Wrote ${outPath} (${SRC[key].length} bytes)`);
}

// Step 2: dump the large flat literals as JSON for exact, error-free transcription.
const mdSrc = decoded.md;
const dumps = {
  'DOK_SEED.json': extractLiteral(mdSrc, 'DOK_SEED'),
  'ORG_BASE.json': extractLiteral(mdSrc, 'ORG'),
  'TIP_BASE.json': extractLiteral(mdSrc, 'TIP'),
  'JP_BASE.json': extractLiteral(mdSrc, 'JP'),
  'BJ_BASE.json': extractLiteral(mdSrc, 'BJ'),
};
for (const [filename, data] of Object.entries(dumps)) {
  const outPath = path.join(outDir, filename);
  writeFileSync(outPath, JSON.stringify(data, null, 2), 'utf8');
  console.log(`Wrote ${outPath} (${Array.isArray(data) ? data.length : Object.keys(data).length} entries)`);
}

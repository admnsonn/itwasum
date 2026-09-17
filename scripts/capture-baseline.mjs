/**
 * Baseline screenshot: login + 34 hash routes.
 * Usage: node scripts/capture-baseline.mjs [outDir]
 */
import { chromium } from 'playwright';
import { mkdirSync } from 'node:fs';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const outDir = resolve(__dirname, '..', process.argv[2] || 'screenshots');
mkdirSync(outDir, { recursive: true });

const ROUTES = [
  'beranda', 'b1', 'b2', 'b3', 'b4', 'b5', 'b6', 'b7', 'b8', 'b9', 'b10', 'b11',
  'b12', 'b13', 'b14', 'b15', 'b16', 'b17', 'b18',
  'a1', 'a2', 'a3', 'a4', 'c1', 'c2', 'd',
  'e1', 'e2', 'e3', 'e4', 'e5', 'e6', 'e7', 'e8',
];

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3000';

async function login(page) {
  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.selectOption('#login-level', 'L0');
  await page.selectOption('#login-wilayah', 'nasional');
  await page.selectOption('#login-role', 'user-pimpinan-l0');
  await page.fill('#login-password', 'Itwasum@2025');
  await page.click('button[type="submit"]');
  await page.waitForSelector('#login-otp', { timeout: 15000 });
  await page.fill('#login-otp', '246810');
  await page.click('button[type="submit"]');
  await page.waitForSelector('#user-profile-menu-btn', { timeout: 15000 });
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(45000);

  await page.goto(BASE, { waitUntil: 'networkidle' });
  await page.screenshot({ path: resolve(outDir, '00-login.png'), fullPage: true });

  await login(page);
  await page.waitForTimeout(500);

  for (const id of ROUTES) {
    await page.evaluate((hash) => { window.location.hash = `#/${hash}`; }, id);
    await page.waitForTimeout(900);
    await page.screenshot({ path: resolve(outDir, `${id}.png`), fullPage: true });
    console.log('captured', id);
  }

  await browser.close();
  console.log(`wrote ${ROUTES.length + 1} png to ${outDir}`);
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

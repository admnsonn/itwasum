/**
 * End-to-end smoke of the Fase 0–6 UI: login OTP, Beranda SF-012, composed
 * modules, B.2 analysis, B.7 regional, B.11 policy (not a second login form).
 */
import { chromium } from 'playwright';

const BASE = process.env.BASE_URL || 'http://127.0.0.1:3002';
const failures = [];

function assert(cond, msg) {
  if (!cond) failures.push(msg);
}

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

async function gotoHash(page, hash) {
  await page.evaluate((h) => {
    window.location.hash = h;
  }, hash);
  await page.waitForTimeout(700);
}

async function bodyText(page) {
  return (await page.locator('body').innerText()).toLowerCase();
}

async function main() {
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  page.setDefaultTimeout(25000);
  const pageErrors = [];
  page.on('pageerror', (err) => pageErrors.push(String(err)));

  await login(page);
  const header = await page.locator('#user-profile-menu-btn').innerText();
  assert(header.includes('Widada'), `Header L0 harus Widada, dapat: ${header.slice(0, 80)}`);

  let text = await bodyText(page);
  assert(text.includes('matriks itwil'), 'Beranda harus menampilkan matriks SF-012');
  assert(text.includes('triwulan'), 'Beranda harus menampilkan PeriodPicker');
  assert(!/dummy|prototipe|\bmock\b/i.test(text), 'Beranda tidak boleh menampilkan kata mock/dummy/prototipe');

  const acehChip = page.getByRole('button', { name: 'Aceh' }).first();
  await acehChip.click();
  await page.waitForTimeout(800);
  text = await bodyText(page);
  assert(text.includes('ringkasan kinerja polda') || text.includes('kepolisian daerah aceh'), 'B.7 RegionalDetail dari matriks Itwil');

  await gotoHash(page, '#/b7/polda-aceh');
  text = await bodyText(page);
  assert(text.includes('ringkasan kinerja polda'), 'B.7 tab ringkasan');
  assert(text.includes('gap analysis'), 'B.7 tab gap');

  await gotoHash(page, '#/b2');
  text = await bodyText(page);
  assert(text.includes('analisis akar masalah'), 'B.2 Pareto akar masalah');
  assert(text.includes('total temuan'), 'B.2 KPI total temuan');
  assert(text.includes('temuan berulang'), 'B.2 temuan berulang');

  await gotoHash(page, '#/a1');
  text = await bodyText(page);
  assert(text.includes('a.1') || text.includes('koneksi') || text.includes('consumer'), 'A.1 composed module');
  assert(!text.includes('deskriptor modul'), 'A.1 deskriptor terdaftar');

  await gotoHash(page, '#/e6');
  text = await bodyText(page);
  assert(text.includes('peta risiko') || text.includes('akurasi') || text.includes('jenis dokumen'), 'E.6 matrix/heatmap');

  await gotoHash(page, '#/b11');
  text = await bodyText(page);
  assert(text.includes('kebijakan') || text.includes('2fa') || text.includes('otp'), 'B.11 kebijakan');
  assert(!text.includes('masuk ke portal'), 'B.11 bukan form login kedua');
  assert(text.includes('bukan halaman login') || text.includes('bukan formulir login') || text.includes('dashboard kepatuhan') || text.includes('status kebijakan'), 'B.11 dashboard kebijakan');

  await gotoHash(page, '#/b17');
  text = await bodyText(page);
  assert(text.includes('distribusi level') || text.includes('maturitas'), 'B.17 distribusi SPIP');

  await page.getByRole('button', { name: /Lupa kata sandi/i }).count();

  assert(pageErrors.length === 0, `pageerror: ${pageErrors.join(' | ')}`);

  await browser.close();

  if (failures.length) {
    console.error('VERIFY FAIL');
    for (const f of failures) console.error(' -', f);
    process.exit(1);
  }
  console.log('VERIFY OK');
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});

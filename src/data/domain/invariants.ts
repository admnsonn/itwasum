/**
 * Invarian dev-only. Peringatan konsol, bukan throw.
 */
import { POLDA_DATA } from '../mockData';
import { ALL_COMBINED_SATKERS_DATA } from '../allSatkersData';
import { FINDINGS_LEDGER } from './findingsLedger';
import { assertItwilCovers34Polda, ITWIL_POLDA_MAP } from './itwilMap';
import { satkerExists } from './satkerRegistry';

export function runDomainInvariants(): void {
  if (typeof window === 'undefined') return;
  const itwil = assertItwilCovers34Polda();
  if (!itwil.ok) {
    console.warn('[domain] Itwil tidak menutup 34 Polda', itwil);
  }

  const poldaFromMap = Object.values(ITWIL_POLDA_MAP).flat();
  const missingInMock = poldaFromMap.filter((id) => !POLDA_DATA.some((p) => p.id === id));
  if (missingInMock.length) {
    console.warn('[domain] Polda di peta Itwil tidak ada di POLDA_DATA', missingInMock);
  }

  for (const p of POLDA_DATA) {
    const ledgerCount = FINDINGS_LEDGER.filter((f) => f.satkerId === p.id).length;
    const expected = Math.max(p.totalTemuan, p.rincianTemuan?.length || 0);
    if (ledgerCount !== expected) {
      console.warn('[domain] Temuan tidak rekonsiliasi', p.id, { ledgerCount, expected, totalTemuan: p.totalTemuan });
    }
  }

  const dangling = FINDINGS_LEDGER.filter((f) => !satkerExists(f.satkerId) && !POLDA_DATA.some((p) => p.id === f.satkerId));
  if (dangling.length) {
    console.warn('[domain] Temuan merujuk satker tidak terdaftar', dangling.slice(0, 5));
  }

  const unknownCombined = ALL_COMBINED_SATKERS_DATA.filter((s) => !s.id);
  if (unknownCombined.length) {
    console.warn('[domain] Satker tanpa id', unknownCombined.length);
  }
}

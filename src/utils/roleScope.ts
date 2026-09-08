import { BidangAudit, CurrentUserProfile, PoldaSatker, SatkerMapItem, TingkatObjek } from '../types';
import { ITWIL_POLDA_MAPPING } from '../data/mabesSatkerData';

const AUDIT_TARGET_IDS = new Set([
  'polda-riau',
  'polres-pekanbaru',
  'polres-kampar',
  'polres-dumai',
  'polres-bengkalis'
]);

export function getRoleScopedSatkers(
  satkers: SatkerMapItem[],
  currentUser?: CurrentUserProfile,
  activeBidang: BidangAudit = 'semua',
  tingkatObjek: TingkatObjek = 'semua'
): SatkerMapItem[] {
  const scopedByRole = !currentUser || currentUser.level === 'L0'
    ? satkers
    : getRoleJurisdiction(satkers, currentUser);
  const centralSatkers = satkers.filter((satker) => (
    ['Mabes', 'Itwasum', 'Itwil', 'Satker-Mabes', 'Biro-Mabes'].includes(satker.tingkat)
  ));
  const jurisdictionScoped = tingkatObjek === 'pusat'
    ? [...scopedByRole, ...centralSatkers]
    : scopedByRole;

  const levelFiltered = jurisdictionScoped.filter((satker) => {
    const isMabes = ['Mabes', 'Itwasum', 'Itwil', 'Satker-Mabes', 'Biro-Mabes'].includes(satker.tingkat);
    const isRegional = ['Polda', 'Polrestabes', 'Polresta', 'Polres'].includes(satker.tingkat);
    if (tingkatObjek === 'pusat') return isMabes;
    if (tingkatObjek === 'wilayah') return isRegional;
    return true;
  });

  if (activeBidang !== 'semua' && currentUser?.bidang.length === 0) return [];
  if (activeBidang !== 'semua' && currentUser && !currentUser.bidang.some((bidang) => bidang.toLowerCase() === activeBidang.toLowerCase())) return [];

  return dedupeSatkers(levelFiltered);
}

function getRoleJurisdiction(satkers: SatkerMapItem[], currentUser: CurrentUserProfile): SatkerMapItem[] {
  const { level, titikWilayahId, peran } = currentUser;

  let scoped: SatkerMapItem[];

  if (peran === 'pengawas_tim' || peran === 'ketua_tim' || peran === 'auditor') {
    scoped = satkers.filter((satker) => AUDIT_TARGET_IDS.has(satker.id));
  } else if (level === 'L3' && titikWilayahId === 'polres-kampar') {
    scoped = satkers.filter((satker) => satker.id === 'polres-kampar');
  } else if ((level === 'L1' || level === 'L2') && ITWIL_POLDA_MAPPING[titikWilayahId]) {
    const poldaIds = new Set(ITWIL_POLDA_MAPPING[titikWilayahId]);
    scoped = satkers.filter((satker) => poldaIds.has(satker.id) || Boolean(satker.parentPoldaId && poldaIds.has(satker.parentPoldaId)));
  } else if (level === 'L2' && titikWilayahId === 'polda-riau') {
    scoped = satkers.filter((satker) => satker.id === 'polda-riau' || satker.parentPoldaId === 'polda-riau');
  } else {
    scoped = satkers;
  }

  return scoped;
}

export function getRoleScopedPoldas(
  poldas: PoldaSatker[],
  currentUser?: CurrentUserProfile
): PoldaSatker[] {
  if (!currentUser || currentUser.level === 'L0') return dedupePoldas(poldas);

  if (currentUser.peran === 'pengawas_tim' || currentUser.peran === 'ketua_tim' || currentUser.peran === 'auditor' || currentUser.peran === 'auditee') {
    return dedupePoldas(poldas.filter((polda) => polda.id === 'polda-riau'));
  }

  if (currentUser.level === 'L2' && currentUser.titikWilayahId === 'polda-riau') {
    return dedupePoldas(poldas.filter((polda) => polda.id === 'polda-riau'));
  }

  const allowedPoldaIds = ITWIL_POLDA_MAPPING[currentUser.titikWilayahId];
  if (allowedPoldaIds) {
    return dedupePoldas(poldas.filter((polda) => allowedPoldaIds.includes(polda.id)));
  }

  return dedupePoldas(poldas);
}

function dedupeSatkers(satkers: SatkerMapItem[]): SatkerMapItem[] {
  return Array.from(new Map(satkers.filter((satker) => satker.tingkat !== 'Polsek').map((satker) => [satker.id, satker])).values());
}

function dedupePoldas(poldas: PoldaSatker[]): PoldaSatker[] {
  return Array.from(new Map(poldas.map((polda) => [polda.id, polda])).values());
}

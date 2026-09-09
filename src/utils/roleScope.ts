import { BidangAudit, CurrentUserProfile, JenjangPengguna, PoldaSatker, SatkerMapItem, TingkatObjek } from '../types';
import { ITWIL_POLDA_MAPPING } from '../data/mabesSatkerData';

const AUDIT_TARGET_IDS = new Set([
  'polda-riau',
  'polres-pekanbaru',
  'polres-kampar',
  'polres-dumai',
  'polres-bengkalis'
]);

function applyJenjangScopeToSatkers(
  satkers: SatkerMapItem[],
  activeJenjang?: JenjangPengguna,
  tingkatObjek: TingkatObjek = 'semua'
): SatkerMapItem[] {
  if (!activeJenjang?.startsWith('itwil-')) return satkers;
  if (tingkatObjek === 'pusat') return satkers;

  const allowedPoldaIds = new Set(ITWIL_POLDA_MAPPING[activeJenjang] || []);
  const isRegionalLevel = (item: SatkerMapItem) => ['Polda', 'Polrestabes', 'Polresta', 'Polres'].includes(item.tingkat);

  return satkers.filter((satker) => {
    if (!isRegionalLevel(satker)) return true;
    return allowedPoldaIds.has(satker.id) || (Boolean(satker.parentPoldaId) && allowedPoldaIds.has(satker.parentPoldaId));
  });
}

export function getRoleScopedSatkers(
  satkers: SatkerMapItem[],
  currentUser?: CurrentUserProfile,
  activeBidang: BidangAudit = 'semua',
  tingkatObjek: TingkatObjek = 'semua',
  activeJenjang?: JenjangPengguna
): SatkerMapItem[] {
  let scopedByRole = !currentUser || currentUser.level === 'L0'
    ? satkers
    : getRoleJurisdiction(satkers, currentUser);

  scopedByRole = applyJenjangScopeToSatkers(scopedByRole, activeJenjang, tingkatObjek);

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
  currentUser?: CurrentUserProfile,
  activeJenjang?: JenjangPengguna
): PoldaSatker[] {
  let scoped = !currentUser || currentUser.level === 'L0'
    ? poldas
    : getRoleJurisdictionPolda(poldas, currentUser);

  if (activeJenjang?.startsWith('itwil-')) {
    const allowedPoldaIds = new Set(ITWIL_POLDA_MAPPING[activeJenjang] || []);
    scoped = scoped.filter((polda) => allowedPoldaIds.has(polda.id));
  }

  return dedupePoldas(scoped);
}

function getRoleJurisdictionPolda(poldas: PoldaSatker[], currentUser: CurrentUserProfile): PoldaSatker[] {
  const { level, titikWilayahId, peran } = currentUser;

  if (peran === 'pengawas_tim' || peran === 'ketua_tim' || peran === 'auditor' || peran === 'auditee') {
    return poldas.filter((polda) => polda.id === 'polda-riau');
  }

  if (level === 'L2' && titikWilayahId === 'polda-riau') {
    return poldas.filter((polda) => polda.id === 'polda-riau');
  }

  const allowedPoldaIds = ITWIL_POLDA_MAPPING[titikWilayahId];
  if (allowedPoldaIds) {
    return poldas.filter((polda) => allowedPoldaIds.includes(polda.id));
  }

  return poldas;
}

function dedupeSatkers(satkers: SatkerMapItem[]): SatkerMapItem[] {
  return Array.from(new Map(satkers.filter((satker) => satker.tingkat !== 'Polsek').map((satker) => [satker.id, satker])).values());
}

function dedupePoldas(poldas: PoldaSatker[]): PoldaSatker[] {
  return Array.from(new Map(poldas.map((polda) => [polda.id, polda])).values());
}

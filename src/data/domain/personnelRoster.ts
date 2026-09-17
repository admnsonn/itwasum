/**
 * Roster deterministik per satker. Orang yang sama dipakai konsisten lintas modul.
 */
import { createSeededRng, type SeededRng } from '../../utils/seededRandom';
import { POLDA_DATA } from '../mockData';
import { getSatkerById } from './satkerRegistry';

export const RANK_LADDER = [
  'Komjen Pol',
  'Irjen Pol',
  'Brigjen Pol',
  'Kombes Pol',
  'AKBP',
  'Kompol',
  'AKP',
  'Iptu',
  'Ipda',
] as const;

export type Rank = (typeof RANK_LADDER)[number];

const POLDA_TIPE_A = new Set([
  'polda-jabar', 'polda-jatim', 'polda-jateng', 'polda-sumut', 'polda-sulsel', 'polda-sumsel',
]);

const GIVEN_NAMES = [
  'Hendra', 'Wahyu', 'Agus', 'Budi', 'Slamet', 'Yudi', 'Rudi', 'Fajar', 'Dian', 'Rina',
  'Siti', 'Nur', 'Fitri', 'Lestari', 'Eko', 'Adi', 'Bayu', 'Andi', 'Taufik', 'Rahmat',
  'Indra', 'Joko', 'Hari', 'Doni', 'Rina', 'Maya', 'Dewi', 'Putri', 'Wawan', 'Iwan',
];

const FAMILY_NAMES = [
  'Prasetyo', 'Wibowo', 'Santoso', 'Nugroho', 'Saputra', 'Hidayat', 'Kurniawan', 'Gunawan',
  'Setiawan', 'Firmansyah', 'Mahendra', 'Suryadi', 'Utami', 'Handayani', 'Rahayu', 'Kusuma',
];

export interface PersonnelRecord {
  id: string;
  nama: string;
  pangkat: Rank;
  jabatan: string;
  satkerId: string;
  satkerNama: string;
}

function kapoldaRank(poldaId: string): Rank {
  if (poldaId === 'polda-metro') return 'Komjen Pol';
  if (POLDA_TIPE_A.has(poldaId)) return 'Irjen Pol';
  return 'Brigjen Pol';
}

function buildDisplayName(pangkat: Rank, given: string, family: string): string {
  return `${pangkat}. ${given} ${family}`;
}

const rosterCache = new Map<string, PersonnelRecord[]>();

export function getRosterForSatker(satkerId: string): PersonnelRecord[] {
  const cached = rosterCache.get(satkerId);
  if (cached) return cached;
  const rng = createSeededRng(`roster-${satkerId}`);
  const satker = getSatkerById(satkerId);
  const polda = POLDA_DATA.find((p) => p.id === satkerId);
  const namaSatker = satker?.nama ?? polda?.nama ?? satkerId;

  const leaderRank: Rank =
    satkerId.startsWith('polda-') ? kapoldaRank(satkerId)
    : satker?.tingkat === 'Itwil' ? 'Brigjen Pol'
    : satker?.tingkat === 'Polrestabes' || satker?.tingkat === 'Polresta' ? 'Kombes Pol'
    : satker?.tingkat === 'Polres' ? 'AKBP'
    : satker?.tingkat === 'Polsek' ? 'Kompol'
    : satkerId.includes('itwasda') || (satker?.tingkat === 'Satker-Mabes') ? 'Kombes Pol'
    : 'Kombes Pol';

  const itwasdaRank: Rank = 'Kombes Pol';
  const ketuaTimRank: Rank = 'AKBP';

  const people: PersonnelRecord[] = [];
  const roles: { jabatan: string; pangkat: Rank }[] = [
    { jabatan: satkerId.startsWith('polda-') ? 'Kapolda' : 'Pimpinan Satker', pangkat: leaderRank },
    { jabatan: satkerId.startsWith('polda-') ? 'Irwasda' : 'Pengawas Internal', pangkat: itwasdaRank },
    { jabatan: 'Ketua Tim Audit', pangkat: ketuaTimRank },
    { jabatan: 'Anggota Tim', pangkat: 'Kompol' },
    { jabatan: 'Anggota Tim', pangkat: 'AKP' },
  ];

  const used = new Set<string>();
  for (let i = 0; i < roles.length; i++) {
    let given = rng.pick(GIVEN_NAMES);
    let family = rng.pick(FAMILY_NAMES);
    let key = `${given}-${family}`;
    let guard = 0;
    while (used.has(key) && guard < 20) {
      given = rng.pick(GIVEN_NAMES);
      family = rng.pick(FAMILY_NAMES);
      key = `${given}-${family}`;
      guard += 1;
    }
    used.add(key);
    people.push({
      id: `${satkerId}-person-${i}`,
      nama: buildDisplayName(roles[i].pangkat, given, family),
      pangkat: roles[i].pangkat,
      jabatan: roles[i].jabatan,
      satkerId,
      satkerNama: namaSatker,
    });
  }

  if (polda?.kapolda) {
    people[0] = {
      ...people[0],
      nama: polda.kapolda,
      pangkat: kapoldaRank(satkerId),
      jabatan: 'Kapolda',
    };
  }
  if (polda?.irwasda) {
    people[1] = {
      ...people[1],
      nama: polda.irwasda,
      pangkat: 'Kombes Pol',
      jabatan: 'Irwasda',
    };
  }

  rosterCache.set(satkerId, people);
  return people;
}

export function pickPerson(rng: SeededRng, satkerId: string, role?: 'pimpinan' | 'irwasda' | 'ketua' | 'anggota'): PersonnelRecord {
  const roster = getRosterForSatker(satkerId);
  if (role === 'pimpinan') return roster[0];
  if (role === 'irwasda') return roster[1];
  if (role === 'ketua') return roster[2];
  if (role === 'anggota') return rng.pick(roster.slice(2));
  return rng.pick(roster);
}

export function asesorName(satkerId: string, roleLabel: string): string {
  const rng = createSeededRng(`asesor-${satkerId}-${roleLabel}`);
  const person = pickPerson(rng, satkerId, roleLabel.includes('Slog') || roleLabel.includes('Srena') || roleLabel.includes('Puskeu') ? 'ketua' : 'irwasda');
  return person.nama;
}

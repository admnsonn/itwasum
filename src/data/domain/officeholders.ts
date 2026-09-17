/**
 * Atribusi pejabat. Stempel: data pejabat per 14 September 2026.
 * Rotasi berikutnya cukup disunting di berkas ini.
 */
export const OFFICEHOLDERS_AS_OF = '2026-09-14';

export const OFFICEHOLDERS = {
  irwasum: {
    nama: 'Komjen Pol. Drs. Wahyu Widada, M.Phil.',
    pangkat: 'Komjen Pol',
    jabatan: 'Irwasum Polri',
    dasar: 'Kep/1186/VIII/2025',
    email: 'irwasum@polri.go.id',
    nrp: '67080000',
  },
  kapolri: {
    nama: 'Jenderal Pol. Listyo Sigit Prabowo',
    pangkat: 'Jenderal Pol',
    jabatan: 'Kapolri',
  },
} as const;

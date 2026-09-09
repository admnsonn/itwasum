export type PublicSourceKind = 'Wikimedia Commons' | 'Wikipedia' | 'Polri official' | 'Public registry';

export interface PublicStructureRecord {
  id: string;
  nama: string;
  singkatan: string;
  wilayah: string;
  pulau: 'Sumatera' | 'Jawa' | 'Kalimantan' | 'Sulawesi' | 'Bali-Nusa' | 'Maluku-Papua';
  logoUrl: string;
  source: PublicSourceKind;
  sourceUrl: string;
}

export const PUBLIC_ITWIL_RECORDS: PublicStructureRecord[] = [
  {
    id: 'itwil-1',
    nama: 'Inspektorat Wilayah I',
    singkatan: 'Itwil I',
    wilayah: 'Sumatera Bagian Utara',
    pulau: 'Sumatera',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Polri official',
    sourceUrl: 'https://www.polri.go.id/'
  },
  {
    id: 'itwil-2',
    nama: 'Inspektorat Wilayah II',
    singkatan: 'Itwil II',
    wilayah: 'Jawa dan Sumatera Selatan',
    pulau: 'Jawa',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Polri official',
    sourceUrl: 'https://www.polri.go.id/'
  },
  {
    id: 'itwil-3',
    nama: 'Inspektorat Wilayah III',
    singkatan: 'Itwil III',
    wilayah: 'Jawa Timur, Bali, Nusa Tenggara, dan Kalimantan',
    pulau: 'Bali-Nusa',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Polri official',
    sourceUrl: 'https://www.polri.go.id/'
  },
  {
    id: 'itwil-4',
    nama: 'Inspektorat Wilayah IV',
    singkatan: 'Itwil IV',
    wilayah: 'Sulawesi dan Kalimantan',
    pulau: 'Sulawesi',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Polri official',
    sourceUrl: 'https://www.polri.go.id/'
  },
  {
    id: 'itwil-5',
    nama: 'Inspektorat Wilayah V',
    singkatan: 'Itwil V',
    wilayah: 'Maluku, Maluku Utara, Papua, dan Papua Barat',
    pulau: 'Maluku-Papua',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Polri official',
    sourceUrl: 'https://www.polri.go.id/'
  }
];

export const PUBLIC_POLDA_RECORDS: PublicStructureRecord[] = [
  { id: 'polda-aceh', nama: 'Kepolisian Daerah Aceh', singkatan: 'Polda Aceh', wilayah: 'Aceh', pulau: 'Sumatera', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Aceh.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Aceh.png' },
  { id: 'polda-sumut', nama: 'Kepolisian Daerah Sumatera Utara', singkatan: 'Polda Sumut', wilayah: 'Sumatera Utara', pulau: 'Sumatera', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b6/Lambang_Polda_Sumut.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Sumatera_Utara' },
  { id: 'polda-sumbar', nama: 'Kepolisian Daerah Sumatera Barat', singkatan: 'Polda Sumbar', wilayah: 'Sumatera Barat', pulau: 'Sumatera', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c4/Logo_Polda_Sumbar.svg', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Sumatera_Barat' },
  { id: 'polda-riau', nama: 'Kepolisian Daerah Riau', singkatan: 'Polda Riau', wilayah: 'Riau', pulau: 'Sumatera', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Riau.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Riau.png' },
  { id: 'polda-kepri', nama: 'Kepolisian Daerah Kepulauan Riau', singkatan: 'Polda Kepri', wilayah: 'Kepulauan Riau', pulau: 'Sumatera', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/9/99/Lambang_Polda_Kep_Riau.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Kepulauan_Riau' },
  { id: 'polda-jambi', nama: 'Kepolisian Daerah Jambi', singkatan: 'Polda Jambi', wilayah: 'Jambi', pulau: 'Sumatera', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Jambi.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Jambi.png' },
  { id: 'polda-bengkulu', nama: 'Kepolisian Daerah Bengkulu', singkatan: 'Polda Bengkulu', wilayah: 'Bengkulu', pulau: 'Sumatera', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Bengkulu.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Bengkulu.png' },
  { id: 'polda-sumsel', nama: 'Kepolisian Daerah Sumatera Selatan', singkatan: 'Polda Sumsel', wilayah: 'Sumatera Selatan', pulau: 'Sumatera', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a8/Lambang_Polda_Sumsel.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Sumatera_Selatan' },
  { id: 'polda-babel', nama: 'Kepolisian Daerah Kepulauan Bangka Belitung', singkatan: 'Polda Babel', wilayah: 'Bangka Belitung', pulau: 'Sumatera', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/5/5b/Lambang_Polda_Kep_Babel.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Kepulauan_Bangka_Belitung' },
  { id: 'polda-lampung', nama: 'Kepolisian Daerah Lampung', singkatan: 'Polda Lampung', wilayah: 'Lampung', pulau: 'Sumatera', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Lampung.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Lampung.png' },
  { id: 'polda-metro', nama: 'Kepolisian Daerah Metropolitan Jakarta Raya', singkatan: 'Polda Metro Jaya', wilayah: 'DKI Jakarta', pulau: 'Jawa', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Metro_Jaya.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Metro_Jaya.png' },
  { id: 'polda-jabar', nama: 'Kepolisian Daerah Jawa Barat', singkatan: 'Polda Jabar', wilayah: 'Jawa Barat', pulau: 'Jawa', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/01/Lambang_Polda_Jabar.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Jawa_Barat' },
  { id: 'polda-jateng', nama: 'Kepolisian Daerah Jawa Tengah', singkatan: 'Polda Jateng', wilayah: 'Jawa Tengah', pulau: 'Jawa', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/46/Lambang_Polda_Jateng.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Jawa_Tengah' },
  { id: 'polda-diy', nama: 'Kepolisian Daerah Istimewa Yogyakarta', singkatan: 'Polda DIY', wilayah: 'DI Yogyakarta', pulau: 'Jawa', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_DIY.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_DIY.png' },
  { id: 'polda-banten', nama: 'Kepolisian Daerah Banten', singkatan: 'Polda Banten', wilayah: 'Banten', pulau: 'Jawa', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Banten.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Banten.png' },
  { id: 'polda-jatim', nama: 'Kepolisian Daerah Jawa Timur', singkatan: 'Polda Jatim', wilayah: 'Jawa Timur', pulau: 'Jawa', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Jawa_Timur.svg', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Jawa_Timur.svg' },
  { id: 'polda-kalbar', nama: 'Kepolisian Daerah Kalimantan Barat', singkatan: 'Polda Kalbar', wilayah: 'Kalimantan Barat', pulau: 'Kalimantan', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/d/de/Lambang_Polda_Kalbar.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Kalimantan_Barat' },
  { id: 'polda-kalteng', nama: 'Kepolisian Daerah Kalimantan Tengah', singkatan: 'Polda Kalteng', wilayah: 'Kalimantan Tengah', pulau: 'Kalimantan', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/c/c8/Lambang_Polda_Kalteng.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Kalimantan_Tengah' },
  { id: 'polda-kalsel', nama: 'Kepolisian Daerah Kalimantan Selatan', singkatan: 'Polda Kalsel', wilayah: 'Kalimantan Selatan', pulau: 'Kalimantan', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/e/e3/Lambang_Polda_Kalsel.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Kalimantan_Selatan' },
  { id: 'polda-kaltim', nama: 'Kepolisian Daerah Kalimantan Timur', singkatan: 'Polda Kaltim', wilayah: 'Kalimantan Timur', pulau: 'Kalimantan', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Kaltim.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Kaltim.png' },
  { id: 'polda-kaltara', nama: 'Kepolisian Daerah Kalimantan Utara', singkatan: 'Polda Kaltara', wilayah: 'Kalimantan Utara', pulau: 'Kalimantan', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/08/Lambang_Polda_Kaltara_logo.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Kalimantan_Utara' },
  { id: 'polda-sulut', nama: 'Kepolisian Daerah Sulawesi Utara', singkatan: 'Polda Sulut', wilayah: 'Sulawesi Utara', pulau: 'Sulawesi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/a/a3/New_Logo_Polda_Sulawesi_Utara.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Sulawesi_Utara' },
  { id: 'polda-gorontalo', nama: 'Kepolisian Daerah Gorontalo', singkatan: 'Polda Gorontalo', wilayah: 'Gorontalo', pulau: 'Sulawesi', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Gorontalo.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Gorontalo.png' },
  { id: 'polda-sulteng', nama: 'Kepolisian Daerah Sulawesi Tengah', singkatan: 'Polda Sulteng', wilayah: 'Sulawesi Tengah', pulau: 'Sulawesi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/6/69/Lambang_Polda_Sulteng.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Sulawesi_Tengah' },
  { id: 'polda-sulsel', nama: 'Kepolisian Daerah Sulawesi Selatan', singkatan: 'Polda Sulsel', wilayah: 'Sulawesi Selatan', pulau: 'Sulawesi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/02/Lambang_Polda_Sulsel.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Sulawesi_Selatan' },
  { id: 'polda-sultra', nama: 'Kepolisian Daerah Sulawesi Tenggara', singkatan: 'Polda Sultra', wilayah: 'Sulawesi Tenggara', pulau: 'Sulawesi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/4/4c/Lambang_Polda_Sultra.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Sulawesi_Tenggara' },
  { id: 'polda-sulbar', nama: 'Kepolisian Daerah Sulawesi Barat', singkatan: 'Polda Sulbar', wilayah: 'Sulawesi Barat', pulau: 'Sulawesi', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/0/0f/Lambang_Polda_Sulbar.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Sulawesi_Barat' },
  { id: 'polda-bali', nama: 'Kepolisian Daerah Bali', singkatan: 'Polda Bali', wilayah: 'Bali', pulau: 'Bali-Nusa', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Bali.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Bali.png' },
  { id: 'polda-ntb', nama: 'Kepolisian Daerah Nusa Tenggara Barat', singkatan: 'Polda NTB', wilayah: 'Nusa Tenggara Barat', pulau: 'Bali-Nusa', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/b/b4/Lambang_Polda_NTB.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Nusa_Tenggara_Barat' },
  { id: 'polda-ntt', nama: 'Kepolisian Daerah Nusa Tenggara Timur', singkatan: 'Polda NTT', wilayah: 'Nusa Tenggara Timur', pulau: 'Bali-Nusa', logoUrl: 'https://upload.wikimedia.org/wikipedia/commons/2/29/Lambang_Polda_NTT.png', source: 'Wikipedia', sourceUrl: 'https://id.wikipedia.org/wiki/Polda_Nusa_Tenggara_Timur' },
  { id: 'polda-maluku', nama: 'Kepolisian Daerah Maluku', singkatan: 'Polda Maluku', wilayah: 'Maluku', pulau: 'Maluku-Papua', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Maluku.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Maluku.png' },
  { id: 'polda-malut', nama: 'Kepolisian Daerah Maluku Utara', singkatan: 'Polda Malut', wilayah: 'Maluku Utara', pulau: 'Maluku-Papua', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Maluku_Utara.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Maluku_Utara.png' },
  { id: 'polda-papuabarat', nama: 'Kepolisian Daerah Papua Barat', singkatan: 'Polda Papua Barat', wilayah: 'Papua Barat', pulau: 'Maluku-Papua', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Papua_Barat.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Papua_Barat.png' },
  { id: 'polda-papua', nama: 'Kepolisian Daerah Papua', singkatan: 'Polda Papua', wilayah: 'Papua', pulau: 'Maluku-Papua', logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polda_Papua.png', source: 'Wikimedia Commons', sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polda_Papua.png' }
];

export const PUBLIC_ITWIL_POLDA_MAPPING: Record<string, string[]> = {
  'itwil-1': ['polda-aceh', 'polda-sumut', 'polda-sumbar', 'polda-riau', 'polda-kepri', 'polda-jambi'],
  'itwil-2': ['polda-bengkulu', 'polda-sumsel', 'polda-babel', 'polda-lampung', 'polda-banten', 'polda-metro', 'polda-jabar', 'polda-jateng'],
  'itwil-3': ['polda-diy', 'polda-jatim', 'polda-bali', 'polda-ntb', 'polda-ntt', 'polda-kalbar', 'polda-kalteng'],
  'itwil-4': ['polda-kalsel', 'polda-kaltim', 'polda-kaltara', 'polda-sulsel', 'polda-sulbar', 'polda-sulteng', 'polda-sultra'],
  'itwil-5': ['polda-gorontalo', 'polda-sulut', 'polda-malut', 'polda-maluku', 'polda-papuabarat', 'polda-papua']
};

export const PUBLIC_MABES_RECORDS: PublicStructureRecord[] = [
  {
    id: 'mabes-polri',
    nama: 'Markas Besar Kepolisian Republik Indonesia',
    singkatan: 'Mabes Polri',
    wilayah: 'Nasional',
    pulau: 'Jawa',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Lambang_Polri.png'
  },
  {
    id: 'itwasum-polri',
    nama: 'Inspektorat Pengawasan Umum Polri',
    singkatan: 'Itwasum Polri',
    wilayah: 'Nasional',
    pulau: 'Jawa',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Lambang_Polri.png',
    source: 'Polri official',
    sourceUrl: 'https://www.polri.go.id/'
  },
  {
    id: 'bareskrim',
    nama: 'Badan Reserse Kriminal Polri',
    singkatan: 'Bareskrim',
    wilayah: 'Nasional',
    pulau: 'Jawa',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Bareskrim_Logo.png',
    source: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Bareskrim_Logo.png'
  },
  {
    id: 'korlantas',
    nama: 'Korps Lalu Lintas Polri',
    singkatan: 'Korlantas',
    wilayah: 'Nasional',
    pulau: 'Jawa',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Korlantas_Polri_logo.png',
    source: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Korlantas_Polri_logo.png'
  },
  {
    id: 'korbrimob',
    nama: 'Korps Brigade Mobil Polri',
    singkatan: 'Korbrimob',
    wilayah: 'Nasional',
    pulau: 'Jawa',
    logoUrl: 'https://commons.wikimedia.org/wiki/Special:FilePath/Logo_Korps_Brimob_Polri.png',
    source: 'Wikimedia Commons',
    sourceUrl: 'https://commons.wikimedia.org/wiki/File:Logo_Korps_Brimob_Polri.png'
  }
];

export const PUBLIC_STRUCTURE_LOOKUP = {
  polda: Object.fromEntries(PUBLIC_POLDA_RECORDS.map((item) => [item.id, item])),
  itwil: Object.fromEntries(PUBLIC_ITWIL_RECORDS.map((item) => [item.id, item])),
  mabes: Object.fromEntries(PUBLIC_MABES_RECORDS.map((item) => [item.id, item]))
};

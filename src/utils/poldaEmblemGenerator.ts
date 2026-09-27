// Generator Vektor & SVG Lambang Resmi Polda / Satker Polri
// 100% Reliable: Tidak bergantung pada koneksi gambar eksternal/CORS/403 hotlinking

export interface PoldaEmblemConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  symbolType: 'monas' | 'kujang' | 'borobudur' | 'tugu' | 'candi' | 'rencong' | 'batak' | 'gadang' | 'lancang' | 'angso' | 'ampera' | 'rafflesia' | 'siger' | 'enggang' | 'batang' | 'intan' | 'ikn' | 'manguni' | 'tongkonan' | 'phinisi' | 'komodo' | 'cenderawasih' | 'siwalima' | 'badak' | 'rinjani' | 'keraton' | 'sandeq' | 'tameng' | 'tribrata' | 'itwasum_cakra' | 'itwil_barat' | 'itwil_tengah' | 'itwil_timur' | 'itwil_investigasi' | 'itwil_mutu' | 'bareskrim' | 'korlantas' | 'baharkam' | 'brimob' | 'propam' | 'intelkam' | 'lemdiklat' | 'divtik';
  motto: string;
  code: string;
  namaPolda: string;
}

export const EMBLEM_CONFIGS: Record<string, PoldaEmblemConfig> = {
  // MABES & ITWASUM POLRI LEVEL
  'mabes-polri': {
    primaryColor: '#0B2B5C',
    secondaryColor: '#F59E0B',
    accentColor: '#DC2626',
    symbolType: 'tribrata',
    motto: 'Rastra Sewakotama - Tri Brata',
    code: 'MABES',
    namaPolda: 'Mabes Polri'
  },
  'itwasum-polri': {
    primaryColor: '#831843', // Deep Maroon Itwasum
    secondaryColor: '#F59E0B',
    accentColor: '#FBBF24',
    symbolType: 'itwasum_cakra',
    motto: 'Vigilantiae & Akuntabilitas Presisi',
    code: 'ITWASUM',
    namaPolda: 'Itwasum Polri'
  },
  'itwil-1': {
    primaryColor: '#064E3B', // Deep Green Barat / Sumatera
    secondaryColor: '#FBBF24',
    accentColor: '#DC2626',
    symbolType: 'itwil_barat',
    motto: 'Pengawasan Wilayah Barat (10 Polda Sumatera)',
    code: 'ITWIL I',
    namaPolda: 'Inspektorat Wilayah I'
  },
  'itwil-2': {
    primaryColor: '#1E3A8A', // Navy Tengah / Jawa-Kalimantan
    secondaryColor: '#F59E0B',
    accentColor: '#FBBF24',
    symbolType: 'itwil_tengah',
    motto: 'Pengawasan Wilayah Tengah (11 Polda Jawa & Kalimantan)',
    code: 'ITWIL II',
    namaPolda: 'Inspektorat Wilayah II'
  },
  'itwil-3': {
    primaryColor: '#701A75', // Purple Timur
    secondaryColor: '#FBBF24',
    accentColor: '#38BDF8',
    symbolType: 'itwil_timur',
    motto: 'Pengawasan Wilayah Timur (16 Polda & Satker Mabes)',
    code: 'ITWIL III',
    namaPolda: 'Inspektorat Wilayah III'
  },
  'itwil-4': {
    primaryColor: '#18181B', // Black Irsus / Investigasi
    secondaryColor: '#F59E0B',
    accentColor: '#EF4444',
    symbolType: 'itwil_investigasi',
    motto: 'Audit Khusus, Investigatif & Dumas Presisi',
    code: 'ITWIL IV',
    namaPolda: 'Inspektorat Wilayah IV'
  },
  'itwil-5': {
    primaryColor: '#0F766E', // Teal Penjaminan Mutu & SPIP
    secondaryColor: '#FBBF24',
    accentColor: '#38BDF8',
    symbolType: 'itwil_mutu',
    motto: 'Penjaminan Mutu, Reformasi Birokrasi & e-Audit',
    code: 'ITWIL V',
    namaPolda: 'Inspektorat Wilayah V'
  },
  'biro-renmin-itwasum': {
    primaryColor: '#1E293B',
    secondaryColor: '#FBBF24',
    accentColor: '#38BDF8',
    symbolType: 'itwasum_cakra',
    motto: 'Perencanaan & Administrasi Pengawasan',
    code: 'RENMIN',
    namaPolda: 'Biro Renmin Itwasum'
  },
  'biro-binopsnal-itwasum': {
    primaryColor: '#1E293B',
    secondaryColor: '#F59E0B',
    accentColor: '#EF4444',
    symbolType: 'itwasum_cakra',
    motto: 'Pembinaan Operasional Pengawasan',
    code: 'BINOPS',
    namaPolda: 'Biro Binopsnal Itwasum'
  },

  // SATKER UTAMA MABES POLRI
  'bareskrim': {
    primaryColor: '#0F172A',
    secondaryColor: '#F59E0B',
    accentColor: '#DC2626',
    symbolType: 'bareskrim',
    motto: 'Sidik Sakti Indera Waspada',
    code: 'RESKRIM',
    namaPolda: 'Bareskrim Polri'
  },
  'baharkam': {
    primaryColor: '#065F46',
    secondaryColor: '#FBBF24',
    accentColor: '#38BDF8',
    symbolType: 'baharkam',
    motto: 'Cighra Japti - Harkamtibmas',
    code: 'HARKAM',
    namaPolda: 'Baharkam Polri'
  },
  'korlantas': {
    primaryColor: '#1D4ED8',
    secondaryColor: '#FBBF24',
    accentColor: '#FFFFFF',
    symbolType: 'korlantas',
    motto: 'Dharmakerta Marga Raksyaka',
    code: 'LANTAS',
    namaPolda: 'Korlantas Polri'
  },
  'korbrimob': {
    primaryColor: '#18181B',
    secondaryColor: '#DC2626',
    accentColor: '#FBBF24',
    symbolType: 'brimob',
    motto: 'Jiwa Ragaku Demi Kemanusiaan',
    code: 'BRIMOB',
    namaPolda: 'Korbrimob Polri'
  },
  'divpropam': {
    primaryColor: '#1E1B4B',
    secondaryColor: '#FBBF24',
    accentColor: '#38BDF8',
    symbolType: 'propam',
    motto: 'Y перевог Gatya - Garda Disiplin',
    code: 'PROPAM',
    namaPolda: 'Divisi Propam Polri'
  },
  'baintelkam': {
    primaryColor: '#172554',
    secondaryColor: '#F59E0B',
    accentColor: '#E2E8F0',
    symbolType: 'intelkam',
    motto: 'Catur Prasetya Intelijen',
    code: 'INTEL',
    namaPolda: 'Baintelkam Polri'
  },
  'lemdiklat': {
    primaryColor: '#14532D',
    secondaryColor: '#FBBF24',
    accentColor: '#DC2626',
    symbolType: 'lemdiklat',
    motto: 'Bhayangkara Tanggon Kosala',
    code: 'LEMDAT',
    namaPolda: 'Lemdiklat Polri'
  },
  'divtik': {
    primaryColor: '#0E7490',
    secondaryColor: '#38BDF8',
    accentColor: '#FBBF24',
    symbolType: 'divtik',
    motto: 'Satu Data Presisi Teknologi',
    code: 'DIVTIK',
    namaPolda: 'Divisi TIK Polri'
  },

  // 34 POLDA JAJARAN KEWILAYAHAN
  'polda-aceh': {
    primaryColor: '#064E3B',
    secondaryColor: '#D97706',
    accentColor: '#EF4444',
    symbolType: 'rencong',
    motto: 'Machdum Sakti',
    code: 'ACEH',
    namaPolda: 'Polda Aceh'
  },
  'polda-sumut': {
    primaryColor: '#7F1D1D',
    secondaryColor: '#F59E0B',
    accentColor: '#1E3A8A',
    symbolType: 'batak',
    motto: 'Sejajar Satya',
    code: 'SUMUT',
    namaPolda: 'Polda Sumatera Utara'
  },
  'polda-sumbar': {
    primaryColor: '#18181B',
    secondaryColor: '#DC2626',
    accentColor: '#FBBF24',
    symbolType: 'gadang',
    motto: 'Gawi Satya',
    code: 'SUMBAR',
    namaPolda: 'Polda Sumatera Barat'
  },
  'polda-riau': {
    primaryColor: '#0F766E',
    secondaryColor: '#F59E0B',
    accentColor: '#DC2626',
    symbolType: 'lancang',
    motto: 'Tuah Sakti',
    code: 'RIAU',
    namaPolda: 'Polda Riau'
  },
  'polda-kepri': {
    primaryColor: '#0369A1',
    secondaryColor: '#FBBF24',
    accentColor: '#38BDF8',
    symbolType: 'tameng',
    motto: 'Seligi Sakti',
    code: 'KEPRI',
    namaPolda: 'Polda Kepulauan Riau'
  },
  'polda-jambi': {
    primaryColor: '#831843',
    secondaryColor: '#F59E0B',
    accentColor: '#065F46',
    symbolType: 'angso',
    motto: 'Siginjai Sakti',
    code: 'JAMBI',
    namaPolda: 'Polda Jambi'
  },
  'polda-sumsel': {
    primaryColor: '#991B1B',
    secondaryColor: '#FBBF24',
    accentColor: '#1E3A8A',
    symbolType: 'ampera',
    motto: 'Dharma Kertiyasa',
    code: 'SUMSEL',
    namaPolda: 'Polda Sumatera Selatan'
  },
  'polda-bengkulu': {
    primaryColor: '#4C1D95',
    secondaryColor: '#F59E0B',
    accentColor: '#E11D48',
    symbolType: 'rafflesia',
    motto: 'Wira Satya',
    code: 'BKL',
    namaPolda: 'Polda Bengkulu'
  },
  'polda-lampung': {
    primaryColor: '#B45309',
    secondaryColor: '#FEF08A',
    accentColor: '#DC2626',
    symbolType: 'siger',
    motto: 'Kharisma Satya',
    code: 'LPG',
    namaPolda: 'Polda Lampung'
  },
  'polda-babel': {
    primaryColor: '#0284C7',
    secondaryColor: '#F59E0B',
    accentColor: '#0F172A',
    symbolType: 'phinisi',
    motto: 'Bumi Serumpun',
    code: 'BABEL',
    namaPolda: 'Polda Kep. Bangka Belitung'
  },
  'polda-metro': {
    primaryColor: '#0B2B5C',
    secondaryColor: '#E11D48',
    accentColor: '#FBBF24',
    symbolType: 'monas',
    motto: 'Jaya Raya',
    code: 'METRO',
    namaPolda: 'Polda Metro Jaya'
  },
  'polda-banten': {
    primaryColor: '#1E293B',
    secondaryColor: '#F59E0B',
    accentColor: '#0284C7',
    symbolType: 'badak',
    motto: 'Gawe Kuta Baluwarti',
    code: 'BANTEN',
    namaPolda: 'Polda Banten'
  },
  'polda-jabar': {
    primaryColor: '#1E3A8A',
    secondaryColor: '#F59E0B',
    accentColor: '#15803D',
    symbolType: 'kujang',
    motto: 'Lokatara Dwipantara',
    code: 'JABAR',
    namaPolda: 'Polda Jawa Barat'
  },
  'polda-jateng': {
    primaryColor: '#701A75',
    secondaryColor: '#FBBF24',
    accentColor: '#0284C7',
    symbolType: 'borobudur',
    motto: 'Kresna Dwi Satya',
    code: 'JATENG',
    namaPolda: 'Polda Jawa Tengah'
  },
  'polda-diy': {
    primaryColor: '#14532D',
    secondaryColor: '#F59E0B',
    accentColor: '#7F1D1D',
    symbolType: 'keraton',
    motto: 'Projotamansari',
    code: 'DIY',
    namaPolda: 'Polda D.I. Yogyakarta'
  },
  'polda-jatim': {
    primaryColor: '#0F172A',
    secondaryColor: '#F59E0B',
    accentColor: '#DC2626',
    symbolType: 'tugu',
    motto: 'Semeru Dwi Satya',
    code: 'JATIM',
    namaPolda: 'Polda Jawa Timur'
  },
  'polda-kalbar': {
    primaryColor: '#047857',
    secondaryColor: '#FBBF24',
    accentColor: '#EA580C',
    symbolType: 'enggang',
    motto: 'Khatulistiwa Satya',
    code: 'KALBAR',
    namaPolda: 'Polda Kalimantan Barat'
  },
  'polda-kalteng': {
    primaryColor: '#1E3A8A',
    secondaryColor: '#F59E0B',
    accentColor: '#059669',
    symbolType: 'batang',
    motto: 'Tambun Bungai',
    code: 'KALTENG',
    namaPolda: 'Polda Kalimantan Tengah'
  },
  'polda-kalsel': {
    primaryColor: '#0284C7',
    secondaryColor: '#FBBF24',
    accentColor: '#7F1D1D',
    symbolType: 'intan',
    motto: 'Kayuh Baimbai',
    code: 'KALSEL',
    namaPolda: 'Polda Kalimantan Selatan'
  },
  'polda-kaltim': {
    primaryColor: '#0B2B5C',
    secondaryColor: '#FBBF24',
    accentColor: '#10B981',
    symbolType: 'ikn',
    motto: 'Mahakam Satya (IKN)',
    code: 'KALTIM',
    namaPolda: 'Polda Kalimantan Timur'
  },
  'polda-kaltara': {
    primaryColor: '#0D9488',
    secondaryColor: '#F59E0B',
    accentColor: '#0369A1',
    symbolType: 'tameng',
    motto: 'Benuanta Bersatu',
    code: 'KALTARA',
    namaPolda: 'Polda Kalimantan Utara'
  },
  'polda-sulut': {
    primaryColor: '#1E3A8A',
    secondaryColor: '#F59E0B',
    accentColor: '#DC2626',
    symbolType: 'manguni',
    motto: 'Manguni Makasiouw',
    code: 'SULUT',
    namaPolda: 'Polda Sulawesi Utara'
  },
  'polda-gorontalo': {
    primaryColor: '#065F46',
    secondaryColor: '#F59E0B',
    accentColor: '#B45309',
    symbolType: 'gadang',
    motto: 'Dulamayo Satya',
    code: 'GTO',
    namaPolda: 'Polda Gorontalo'
  },
  'polda-sulteng': {
    primaryColor: '#0E7490',
    secondaryColor: '#FBBF24',
    accentColor: '#B91C1C',
    symbolType: 'tameng',
    motto: 'Kaili Nusantara',
    code: 'SULTENG',
    namaPolda: 'Polda Sulawesi Tengah'
  },
  'polda-sulsel': {
    primaryColor: '#7F1D1D',
    secondaryColor: '#FBBF24',
    accentColor: '#0369A1',
    symbolType: 'phinisi',
    motto: 'Ewako Nusantara',
    code: 'SULSEL',
    namaPolda: 'Polda Sulawesi Selatan'
  },
  'polda-sultra': {
    primaryColor: '#B45309',
    secondaryColor: '#0F172A',
    accentColor: '#059669',
    symbolType: 'tameng',
    motto: 'Anoa Bhakti',
    code: 'SULTRA',
    namaPolda: 'Polda Sulawesi Tenggara'
  },
  'polda-sulbar': {
    primaryColor: '#0369A1',
    secondaryColor: '#F59E0B',
    accentColor: '#DC2626',
    symbolType: 'sandeq',
    motto: 'Malaqbi Satya',
    code: 'SULBAR',
    namaPolda: 'Polda Sulawesi Barat'
  },
  'polda-bali': {
    primaryColor: '#7F1D1D',
    secondaryColor: '#FBBF24',
    accentColor: '#15803D',
    symbolType: 'candi',
    motto: 'Sura Dwipa Cakti',
    code: 'BALI',
    namaPolda: 'Polda Bali'
  },
  'polda-ntb': {
    primaryColor: '#047857',
    secondaryColor: '#FBBF24',
    accentColor: '#1E3A8A',
    symbolType: 'rinjani',
    motto: 'Bumi Gora Satya',
    code: 'NTB',
    namaPolda: 'Polda Nusa Tenggara Barat'
  },
  'polda-ntt': {
    primaryColor: '#B45309',
    secondaryColor: '#FBBF24',
    accentColor: '#7F1D1D',
    symbolType: 'komodo',
    motto: 'Kusuma Bangsa',
    code: 'NTT',
    namaPolda: 'Polda Nusa Tenggara Timur'
  },
  'polda-maluku': {
    primaryColor: '#1E3A8A',
    secondaryColor: '#F59E0B',
    accentColor: '#DC2626',
    symbolType: 'siwalima',
    motto: 'Siwalima Satya',
    code: 'MALUKU',
    namaPolda: 'Polda Maluku'
  },
  'polda-malut': {
    primaryColor: '#581C87',
    secondaryColor: '#FBBF24',
    accentColor: '#0284C7',
    symbolType: 'siwalima',
    motto: 'Kieraha Nusantara',
    code: 'MALUT',
    namaPolda: 'Polda Maluku Utara'
  },
  'polda-papuabarat': {
    primaryColor: '#0369A1',
    secondaryColor: '#FBBF24',
    accentColor: '#059669',
    symbolType: 'cenderawasih',
    motto: 'Kasuari Bhakti',
    code: 'P.BARAT',
    namaPolda: 'Polda Papua Barat'
  },
  'polda-papua': {
    primaryColor: '#18181B',
    secondaryColor: '#DC2626',
    accentColor: '#FBBF24',
    symbolType: 'cenderawasih',
    motto: 'Cenderawasih Satya',
    code: 'PAPUA',
    namaPolda: 'Polda Papua'
  }
};

export const DEFAULT_POLRI_CONFIG: PoldaEmblemConfig = {
  primaryColor: '#0B2B5C',
  secondaryColor: '#F59E0B',
  accentColor: '#DC2626',
  symbolType: 'tameng',
  motto: 'Tri Brata & Catur Prasetya',
  code: 'POLRI',
  namaPolda: 'Mabes Polri'
};

export function getPoldaConfig(idOrName: string): PoldaEmblemConfig {
  if (!idOrName) return DEFAULT_POLRI_CONFIG;
  if (EMBLEM_CONFIGS[idOrName]) return EMBLEM_CONFIGS[idOrName];

  const query = idOrName.toLowerCase().replace(/polda|polres|polresta|polrestabes|polsek/g, '').trim();
  const matchedKey = Object.keys(EMBLEM_CONFIGS).find(k => k.includes(query) || EMBLEM_CONFIGS[k].code.toLowerCase().includes(query));
  if (matchedKey) return EMBLEM_CONFIGS[matchedKey];

  return DEFAULT_POLRI_CONFIG;
}

function renderSvgSymbol(type: PoldaEmblemConfig['symbolType'], accent: string, secondary: string): string {
  switch (type) {
    case 'monas':
      return `
        <g transform="translate(24, 18)">
          <path d="M12 2 L13.5 5 L10.5 5 Z" fill="#EF4444" />
          <path d="M12 0 L14 4 L10 4 Z" fill="${secondary}" />
          <rect x="11" y="5" width="2" height="12" fill="#FFFFFF" />
          <polygon points="9,17 15,17 17,21 7,21" fill="#E2E8F0" />
          <rect x="5" y="21" width="14" height="2" rx="0.5" fill="${secondary}" />
          <circle cx="12" cy="11" r="1" fill="${accent}" />
        </g>
      `;
    case 'kujang':
      return `
        <g transform="translate(25, 17)">
          <path d="M13 2 C16 4, 17 8, 14 11 C11 14, 14 17, 13 21 L10 21 C11 17, 8 13, 10 9 C11 6, 9 4, 13 2 Z" fill="${secondary}" />
          <circle cx="12" cy="7" r="1" fill="#FFFFFF" />
          <circle cx="13" cy="10" r="1" fill="#FFFFFF" />
          <circle cx="12" cy="13" r="1" fill="#FFFFFF" />
        </g>
      `;
    case 'borobudur':
      return `
        <g transform="translate(24, 18)">
          <path d="M12 2 L12 5 M10 7 C10 5, 14 5, 14 7 L15 11 L9 11 Z" stroke="${secondary}" stroke-width="1.2" fill="${secondary}" />
          <rect x="6" y="11" width="12" height="3" rx="1" fill="#FFFFFF" />
          <rect x="4" y="14" width="16" height="3" rx="1" fill="${secondary}" />
          <rect x="2" y="17" width="20" height="3" rx="1" fill="#E2E8F0" />
          <circle cx="12" cy="4" r="1" fill="#EF4444" />
        </g>
      `;
    case 'candi':
      return `
        <g transform="translate(24, 18)">
          <path d="M4 2 L8 2 L8 19 L4 21 Z" fill="${secondary}" />
          <path d="M20 2 L16 2 L16 19 L20 21 Z" fill="${secondary}" />
          <rect x="8" y="17" width="8" height="3" fill="#FFFFFF" />
          <circle cx="12" cy="9" r="2.5" fill="#EF4444" stroke="${secondary}" stroke-width="0.8" />
          <path d="M12 4 L13 7 L11 7 Z" fill="${secondary}" />
        </g>
      `;
    case 'rencong':
      return `
        <g transform="translate(24, 17)">
          <path d="M8 2 C11 2, 13 4, 13 6 L12 18 L10 18 L10 7 C9 6, 7 5, 6 5 Z" fill="${secondary}" />
          <circle cx="14" cy="4" r="1.5" fill="#EF4444" />
          <path d="M6 19 L18 19 M7 21 L17 21" stroke="${secondary}" stroke-width="1.2" />
        </g>
      `;
    case 'gadang':
      return `
        <g transform="translate(24, 18)">
          <path d="M2 11 Q6 6, 9 10 Q12 4, 15 10 Q18 6, 22 11 L19 19 L5 19 Z" fill="${secondary}" stroke="#FFFFFF" stroke-width="0.8" />
          <rect x="9" y="14" width="6" height="5" fill="#DC2626" />
          <circle cx="12" cy="8" r="1.5" fill="#FBBF24" />
        </g>
      `;
    case 'cenderawasih':
      return `
        <g transform="translate(24, 17)">
          <path d="M10 5 C12 2, 16 3, 17 6 C15 7, 13 8, 12 11 C11 14, 15 18, 18 20 C14 20, 9 17, 8 13 C7 9, 8 6, 10 5 Z" fill="${secondary}" />
          <circle cx="15" cy="5" r="1" fill="#DC2626" />
          <path d="M8 11 Q4 15, 6 19" stroke="#FBBF24" stroke-width="1.2" fill="none" />
          <path d="M10 13 Q6 17, 9 21" stroke="#FFFFFF" stroke-width="1" fill="none" />
        </g>
      `;
    case 'phinisi':
    case 'lancang':
    case 'sandeq':
      return `
        <g transform="translate(24, 18)">
          <path d="M11 2 L11 16 L4 14 Z" fill="#FFFFFF" />
          <path d="M13 5 L13 16 L19 14 Z" fill="${secondary}" />
          <path d="M3 17 L21 17 L18 21 L6 21 Z" fill="${secondary}" stroke="#FFFFFF" stroke-width="0.6" />
          <circle cx="12" cy="1" r="1" fill="#DC2626" />
        </g>
      `;
    case 'tribrata':
      return `
        <g transform="translate(24, 16)">
          <path d="M12 2 C8 6, 4 10, 4 15 C4 20, 12 23, 12 23 C12 23, 20 20, 20 15 C20 10, 16 6, 12 2 Z" fill="none" stroke="${secondary}" stroke-width="1.2" />
          <polygon points="12,5 14,9 18,9 15,12 16,16 12,14 8,16 9,12 6,9 10,9" fill="${secondary}" stroke="#FFFFFF" stroke-width="0.5" />
          <circle cx="12" cy="11" r="2.5" fill="${accent}" />
        </g>
      `;
    case 'itwasum_cakra':
    case 'itwil_barat':
    case 'itwil_tengah':
    case 'itwil_timur':
    case 'itwil_investigasi':
    case 'itwil_mutu':
      return `
        <g transform="translate(24, 16)">
          <circle cx="12" cy="12" r="9" fill="none" stroke="${secondary}" stroke-width="1.8" stroke-dasharray="2 1" />
          <circle cx="12" cy="12" r="6" fill="#DC2626" stroke="#FEF08A" stroke-width="0.8" />
          <polygon points="12,5 13.5,9.5 18,9.5 14.5,12 16,16.5 12,14 8,16.5 9.5,12 6,9.5 10.5,9.5" fill="${secondary}" stroke="#FFFFFF" stroke-width="0.4" />
          <circle cx="12" cy="12" r="2" fill="#FFFFFF" />
        </g>
      `;
    case 'bareskrim':
      return `
        <g transform="translate(24, 17)">
          <circle cx="12" cy="10" r="7" fill="none" stroke="${secondary}" stroke-width="1.5" />
          <path d="M17 15 L22 20" stroke="${secondary}" stroke-width="2.2" stroke-linecap="round" />
          <polygon points="12,6 14,9 18,9 15,11 16,15 12,13 8,15 9,11 6,9 10,9" fill="${accent}" />
          <circle cx="12" cy="10" r="2" fill="#FFFFFF" />
        </g>
      `;
    case 'korlantas':
      return `
        <g transform="translate(24, 17)">
          <circle cx="12" cy="11" r="8" fill="none" stroke="${secondary}" stroke-width="1.5" />
          <circle cx="12" cy="11" r="4" fill="${secondary}" stroke="#FFFFFF" stroke-width="0.8" />
          <path d="M12 3 L12 19 M4 11 L20 11 M6 6 L18 16 M6 16 L18 6" stroke="#FFFFFF" stroke-width="0.8" />
          <circle cx="12" cy="11" r="2" fill="#DC2626" />
        </g>
      `;
    case 'baharkam':
    case 'brimob':
    case 'propam':
    case 'intelkam':
    case 'lemdiklat':
    case 'divtik':
      return `
        <g transform="translate(24, 17)">
          <path d="M12 2 L20 6 L20 14 C20 19, 12 22, 12 22 C12 22, 4 19, 4 14 L4 6 Z" fill="${secondary}" stroke="#FFFFFF" stroke-width="0.8" />
          <polygon points="12,6 14,10 18,10 15,12.5 16,16 12,14 8,16 9,12.5 6,10 10,10" fill="${accent}" />
          <circle cx="12" cy="12" r="2" fill="#FEF08A" />
        </g>
      `;
    case 'komodo':
    case 'enggang':
    case 'manguni':
    case 'badak':
      return `
        <g transform="translate(24, 18)">
          <circle cx="12" cy="11" r="6" fill="none" stroke="${secondary}" stroke-width="1.5" />
          <path d="M12 2 L13.5 6 L18 7 L14.5 10 L15.5 14 L12 11.5 L8.5 14 L9.5 10 L6 7 L10.5 6 Z" fill="${secondary}" />
          <circle cx="12" cy="11" r="2.5" fill="#EF4444" />
        </g>
      `;
    case 'ikn':
    case 'ampera':
    case 'keraton':
    case 'tugu':
    default:
      return `
        <g transform="translate(24, 18)">
          <polygon points="12,2 14.5,7.5 20.5,8 16,12 17.5,18 12,14.8 6.5,18 8,12 3.5,8 9.5,7.5" fill="${secondary}" stroke="#FFFFFF" stroke-width="0.8" />
          <circle cx="12" cy="11" r="3" fill="#DC2626" stroke="#FFFFFF" stroke-width="0.5" />
          <polygon points="12,9 13,11 15,11 13.5,12 14,14 12,13 10,14 10.5,12 9,11 11,11" fill="#FBBF24" />
        </g>
      `;
  }
}

/**
 * Menghasilkan markup SVG Vektor Resmi Polda/Satker secara mandiri tanpa dependensi internet.
 */
export function getPoldaEmblemSvgString(
  poldaId: string, 
  customLabel?: string,
  width = 72,
  height = 84
): string {
  const config = getPoldaConfig(poldaId);
  const label = customLabel || config.code;
  const safeId = poldaId.replace(/[^a-zA-Z0-9_-]/g, '_');

  return `
<svg 
  xmlns="http://www.w3.org/2000/svg" 
  viewBox="0 0 72 84" 
  width="${width}" 
  height="${height}" 
  style="display:block; max-width:100%; height:auto;"
>
  <defs>
    <linearGradient id="grad-body-${safeId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${config.primaryColor}" />
      <stop offset="100%" stop-color="#0B132B" />
    </linearGradient>
    <linearGradient id="grad-gold-${safeId}" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="#FEF08A" />
      <stop offset="50%" stop-color="#F59E0B" />
      <stop offset="100%" stop-color="#B45309" />
    </linearGradient>
    <linearGradient id="grad-banner-${safeId}" x1="0%" y1="0%" x2="100%" y2="0%">
      <stop offset="0%" stop-color="#DC2626" />
      <stop offset="50%" stop-color="#EF4444" />
      <stop offset="100%" stop-color="#DC2626" />
    </linearGradient>
  </defs>

  <!-- Outer Shield Border (Gold Trim) -->
  <path
    d="M36 2 C54 2, 68 8, 68 20 C68 48, 54 68, 36 82 C18 68, 4 48, 4 20 C4 8, 18 2, 36 2 Z"
    fill="url(#grad-gold-${safeId})"
  />

  <!-- Middle Dark Trim -->
  <path
    d="M36 5 C51 5, 64 10, 64 21 C64 46, 51 64, 36 78 C21 64, 8 46, 8 21 C8 10, 21 5, 36 5 Z"
    fill="#1E293B"
  />

  <!-- Inner Shield Core with Regional Satker Color -->
  <path
    d="M36 7 C49 7, 61 12, 61 22 C61 45, 49 62, 36 75 C23 62, 11 45, 11 22 C11 12, 23 7, 36 7 Z"
    fill="url(#grad-body-${safeId})"
  />

  <!-- Top Arc Trim / Header Bar -->
  <path
    d="M16 18 C22 13, 30 11, 36 11 C42 11, 50 13, 56 18 L54 23 C48 19, 42 17, 36 17 C30 17, 24 19, 18 23 Z"
    fill="url(#grad-gold-${safeId})"
  />

  <!-- Bintang Tri Brata / Crown Top -->
  <polygon
    points="36,6 37.5,9.5 41,9.5 38,11.5 39,15 36,13 33,15 34,11.5 31,9.5 34.5,9.5"
    fill="#FBBF24"
    stroke="#FFFFFF"
    stroke-width="0.4"
  />

  <!-- Dynamic Regional Insignia Symbol -->
  ${renderSvgSymbol(config.symbolType, config.accentColor, config.secondaryColor)}

  <!-- Bottom Banner Ribbon for Polda Name -->
  <g transform="translate(0, 48)">
    <path
      d="M12 4 L60 4 L56 15 L36 17 L16 15 Z"
      fill="url(#grad-banner-${safeId})"
      stroke="#FEF08A"
      stroke-width="0.8"
    />
    <text
      x="36"
      y="13"
      fill="#FFFFFF"
      font-size="7"
      font-weight="900"
      font-family="system-ui, -apple-system, sans-serif"
      text-anchor="middle"
      letter-spacing="0.5"
    >
      ${label.length > 8 ? label.substring(0, 8) : label}
    </text>
  </g>

  <!-- Laurel Accents -->
  <circle cx="15" cy="34" r="1.5" fill="#FBBF24" />
  <circle cx="14" cy="40" r="1.5" fill="#FBBF24" />
  <circle cx="16" cy="46" r="1.5" fill="#FBBF24" />

  <circle cx="57" cy="34" r="1.5" fill="#FBBF24" />
  <circle cx="58" cy="40" r="1.5" fill="#FBBF24" />
  <circle cx="56" cy="46" r="1.5" fill="#FBBF24" />
</svg>
  `.trim();
}

/**
 * Menghasilkan Data URI SVG yang dapat disematkan langsung ke atribut `src` pada elemen `<img>`
 * Menggunakan Base64 encoding agar 100% aman disematkan di HTML attributes, Leaflet marker HTML, dan inline handler tanpa syntax error.
 */
export function getPoldaEmblemDataUri(poldaId: string, customLabel?: string): string {
  const svg = getPoldaEmblemSvgString(poldaId, customLabel);
  try {
    if (typeof window !== 'undefined' && typeof window.btoa === 'function') {
      const base64 = window.btoa(unescape(encodeURIComponent(svg)));
      return `data:image/svg+xml;base64,${base64}`;
    }
  } catch (e) {
    // fallback if btoa fails
  }
  return `data:image/svg+xml;utf8,${encodeURIComponent(svg)}`;
}

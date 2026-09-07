import React, { useState } from 'react';
import { POLDA_LOGOS_DATA, SATKER_JAJARAN_DATA, getSatkerLogo } from '../data/satkerLogosData';

interface PoldaLogoProps {
  poldaId: string;
  poldaSingkatan?: string;
  poldaNama?: string;
  size?: 'xs' | 'sm' | 'md' | 'lg' | 'xl' | '2xl';
  className?: string;
  showTooltip?: boolean;
  preferScrapedImage?: boolean;
}

interface PoldaEmblemConfig {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  symbolType: 'monas' | 'kujang' | 'borobudur' | 'tugu' | 'candi' | 'rencong' | 'batak' | 'gadang' | 'lancang' | 'angso' | 'ampera' | 'rafflesia' | 'siger' | 'enggang' | 'batang' | 'intan' | 'ikn' | 'manguni' | 'tongkonan' | 'phinisi' | 'komodo' | 'cenderawasih' | 'siwalima' | 'badak' | 'rinjani' | 'keraton' | 'sandeq' | 'tameng';
  motto: string;
  code: string;
}

const EMBLEM_CONFIGS: Record<string, PoldaEmblemConfig> = {
  'polda-aceh': {
    primaryColor: '#064E3B', // Deep Green
    secondaryColor: '#D97706', // Gold
    accentColor: '#EF4444',
    symbolType: 'rencong',
    motto: 'Machdum Sakti',
    code: 'ACH'
  },
  'polda-sumut': {
    primaryColor: '#7F1D1D', // Maroon
    secondaryColor: '#F59E0B',
    accentColor: '#1E3A8A',
    symbolType: 'batak',
    motto: 'Sejajar Satya',
    code: 'SMU'
  },
  'polda-sumbar': {
    primaryColor: '#18181B', // Black Minang
    secondaryColor: '#DC2626',
    accentColor: '#FBBF24',
    symbolType: 'gadang',
    motto: 'Gawi Satya',
    code: 'SMB'
  },
  'polda-riau': {
    primaryColor: '#0F766E', // Teal/Green Melayu
    secondaryColor: '#F59E0B',
    accentColor: '#DC2626',
    symbolType: 'lancang',
    motto: 'Tuah Sakti',
    code: 'RIU'
  },
  'polda-kepri': {
    primaryColor: '#0369A1', // Ocean Blue
    secondaryColor: '#FBBF24',
    accentColor: '#38BDF8',
    symbolType: 'tameng',
    motto: 'Seligi Sakti',
    code: 'KPR'
  },
  'polda-jambi': {
    primaryColor: '#831843', // Magenta Red
    secondaryColor: '#F59E0B',
    accentColor: '#065F46',
    symbolType: 'angso',
    motto: 'Siginjai Sakti',
    code: 'JMB'
  },
  'polda-sumsel': {
    primaryColor: '#991B1B', // Sriwijaya Red
    secondaryColor: '#FBBF24',
    accentColor: '#1E3A8A',
    symbolType: 'ampera',
    motto: 'Dharma Kertiyasa',
    code: 'SMS'
  },
  'polda-bengkulu': {
    primaryColor: '#4C1D95', // Purple
    secondaryColor: '#F59E0B',
    accentColor: '#E11D48',
    symbolType: 'rafflesia',
    motto: 'Wira Satya',
    code: 'BKL'
  },
  'polda-lampung': {
    primaryColor: '#B45309', // Amber Terracotta
    secondaryColor: '#FEF08A',
    accentColor: '#DC2626',
    symbolType: 'siger',
    motto: 'Kharisma Satya',
    code: 'LPG'
  },
  'polda-babel': {
    primaryColor: '#0284C7', // Maritime Light Blue
    secondaryColor: '#F59E0B',
    accentColor: '#0F172A',
    symbolType: 'phinisi',
    motto: 'Bumi Serumpun',
    code: 'BBL'
  },
  'polda-metro': {
    primaryColor: '#0B2B5C', // Navy Jakarta
    secondaryColor: '#E11D48', // Red
    accentColor: '#FBBF24', // Gold Monas
    symbolType: 'monas',
    motto: 'Jaya Raya',
    code: 'PMJ'
  },
  'polda-banten': {
    primaryColor: '#1E293B', // Slate Grey
    secondaryColor: '#F59E0B',
    accentColor: '#0284C7',
    symbolType: 'badak',
    motto: 'Gawe Kuta Baluwarti',
    code: 'BTN'
  },
  'polda-jabar': {
    primaryColor: '#1E3A8A', // Classic Deep Blue
    secondaryColor: '#F59E0B', // Gold Kujang
    accentColor: '#15803D',
    symbolType: 'kujang',
    motto: 'Lokatara Dwipantara',
    code: 'JBR'
  },
  'polda-jateng': {
    primaryColor: '#701A75', // Royal Maroon
    secondaryColor: '#FBBF24',
    accentColor: '#0284C7',
    symbolType: 'borobudur',
    motto: 'Kresna Dwi Satya',
    code: 'JTG'
  },
  'polda-diy': {
    primaryColor: '#14532D', // Keraton Green
    secondaryColor: '#F59E0B',
    accentColor: '#7F1D1D',
    symbolType: 'keraton',
    motto: 'Projotamansari',
    code: 'DIY'
  },
  'polda-jatim': {
    primaryColor: '#0F172A', // Majapahit Dark
    secondaryColor: '#F59E0B', // Gold
    accentColor: '#DC2626',
    symbolType: 'tugu',
    motto: 'Semeru Dwi Satya',
    code: 'JTM'
  },
  'polda-kalbar': {
    primaryColor: '#047857', // Borneo Green
    secondaryColor: '#FBBF24',
    accentColor: '#EA580C',
    symbolType: 'enggang',
    motto: 'Khatulistiwa Satya',
    code: 'KLB'
  },
  'polda-kalteng': {
    primaryColor: '#1E3A8A', // Kahayan Blue
    secondaryColor: '#F59E0B',
    accentColor: '#059669',
    symbolType: 'batang',
    motto: 'Tambun Bungai',
    code: 'KTG'
  },
  'polda-kalsel': {
    primaryColor: '#0284C7', // Martapura Diamond Blue
    secondaryColor: '#FBBF24',
    accentColor: '#7F1D1D',
    symbolType: 'intan',
    motto: 'Kayuh Baimbai',
    code: 'KSL'
  },
  'polda-kaltim': {
    primaryColor: '#0B2B5C', // Nusantara Navy
    secondaryColor: '#FBBF24',
    accentColor: '#10B981',
    symbolType: 'ikn',
    motto: 'Mahakam Satya (IKN)',
    code: 'KTM'
  },
  'polda-kaltara': {
    primaryColor: '#0D9488', // Border Teal
    secondaryColor: '#F59E0B',
    accentColor: '#0369A1',
    symbolType: 'tameng',
    motto: 'Benuanta Bersatu',
    code: 'KTR'
  },
  'polda-sulut': {
    primaryColor: '#1E3A8A', // Celebes Blue
    secondaryColor: '#F59E0B',
    accentColor: '#DC2626',
    symbolType: 'manguni',
    motto: 'Manguni Makasiouw',
    code: 'SLU'
  },
  'polda-gorontalo': {
    primaryColor: '#065F46', // Hulonthalo Green
    secondaryColor: '#F59E0B',
    accentColor: '#B45309',
    symbolType: 'gadang',
    motto: 'Dulamayo Satya',
    code: 'GTO'
  },
  'polda-sulteng': {
    primaryColor: '#0E7490', // Palu Bay Cyan
    secondaryColor: '#FBBF24',
    accentColor: '#B91C1C',
    symbolType: 'tameng',
    motto: 'Kaili Nusantara',
    code: 'STG'
  },
  'polda-sulsel': {
    primaryColor: '#7F1D1D', // Bugis Maroon
    secondaryColor: '#FBBF24',
    accentColor: '#0369A1',
    symbolType: 'phinisi',
    motto: 'Ewako Nusantara',
    code: 'SLS'
  },
  'polda-sultra': {
    primaryColor: '#B45309', // Buton Gold Amber
    secondaryColor: '#0F172A',
    accentColor: '#059669',
    symbolType: 'tameng',
    motto: 'Anoa Bhakti',
    code: 'STR'
  },
  'polda-sulbar': {
    primaryColor: '#0369A1', // Mandar Marine
    secondaryColor: '#F59E0B',
    accentColor: '#DC2626',
    symbolType: 'sandeq',
    motto: 'Malaqbi Satya',
    code: 'SLB'
  },
  'polda-bali': {
    primaryColor: '#7F1D1D', // Balinese Crimson
    secondaryColor: '#FBBF24', // Sacred Gold
    accentColor: '#15803D',
    symbolType: 'candi',
    motto: 'Sura Dwipa Cakti',
    code: 'BLI'
  },
  'polda-ntb': {
    primaryColor: '#047857', // Rinjani Green
    secondaryColor: '#FBBF24',
    accentColor: '#1E3A8A',
    symbolType: 'rinjani',
    motto: 'Bumi Gora Satya',
    code: 'NTB'
  },
  'polda-ntt': {
    primaryColor: '#B45309', // Flobamora Terracotta
    secondaryColor: '#FBBF24',
    accentColor: '#7F1D1D',
    symbolType: 'komodo',
    motto: 'Kusuma Bangsa',
    code: 'NTT'
  },
  'polda-maluku': {
    primaryColor: '#1E3A8A', // Spice Island Blue
    secondaryColor: '#F59E0B',
    accentColor: '#DC2626',
    symbolType: 'siwalima',
    motto: 'Siwalima Satya',
    code: 'MLK'
  },
  'polda-malut': {
    primaryColor: '#581C87', // Ternate Royal Purple
    secondaryColor: '#FBBF24',
    accentColor: '#0284C7',
    symbolType: 'siwalima',
    motto: 'Kieraha Nusantara',
    code: 'MLU'
  },
  'polda-papuabarat': {
    primaryColor: '#0369A1', // Mansinam Ocean
    secondaryColor: '#FBBF24',
    accentColor: '#059669',
    symbolType: 'cenderawasih',
    motto: 'Kasuari Bhakti',
    code: 'PBR'
  },
  'polda-papua': {
    primaryColor: '#18181B', // Papua Deep Black
    secondaryColor: '#DC2626', // Red
    accentColor: '#FBBF24', // Gold Cenderawasih
    symbolType: 'cenderawasih',
    motto: 'Cenderawasih Satya',
    code: 'PPA'
  }
};

const DEFAULT_CONFIG: PoldaEmblemConfig = {
  primaryColor: '#0B2B5C',
  secondaryColor: '#F59E0B',
  accentColor: '#DC2626',
  symbolType: 'tameng',
  motto: 'Bhayangkara Negara',
  code: 'POL'
};

const renderSymbol = (type: PoldaEmblemConfig['symbolType'], accent: string, secondary: string) => {
  switch (type) {
    case 'monas':
      return (
        <g transform="translate(24, 18)">
          {/* Monas Flame & Obelisk */}
          <path d="M12 2 L13.5 5 L10.5 5 Z" fill="#EF4444" />
          <path d="M12 0 L14 4 L10 4 Z" fill={secondary} />
          <rect x="11" y="5" width="2" height="12" fill="#FFFFFF" />
          <polygon points="9,17 15,17 17,21 7,21" fill="#E2E8F0" />
          <rect x="5" y="21" width="14" height="2" rx="0.5" fill={secondary} />
          <circle cx="12" cy="11" r="1" fill={accent} />
        </g>
      );
    case 'kujang':
      return (
        <g transform="translate(25, 17)">
          {/* Sundanese Kujang */}
          <path d="M13 2 C16 4, 17 8, 14 11 C11 14, 14 17, 13 21 L10 21 C11 17, 8 13, 10 9 C11 6, 9 4, 13 2 Z" fill={secondary} />
          <circle cx="12" cy="7" r="1" fill="#FFFFFF" />
          <circle cx="13" cy="10" r="1" fill="#FFFFFF" />
          <circle cx="12" cy="13" r="1" fill="#FFFFFF" />
        </g>
      );
    case 'borobudur':
      return (
        <g transform="translate(24, 18)">
          {/* Borobudur Stupa Silhouette */}
          <path d="M12 2 L12 5 M10 7 C10 5, 14 5, 14 7 L15 11 L9 11 Z" stroke={secondary} strokeWidth="1.2" fill={secondary} />
          <rect x="6" y="11" width="12" height="3" rx="1" fill="#FFFFFF" />
          <rect x="4" y="14" width="16" height="3" rx="1" fill={secondary} />
          <rect x="2" y="17" width="20" height="3" rx="1" fill="#E2E8F0" />
          <circle cx="12" cy="4" r="1" fill="#EF4444" />
        </g>
      );
    case 'candi':
      return (
        <g transform="translate(24, 18)">
          {/* Balinese Candi Bentar Gate */}
          <path d="M4 2 L8 2 L8 19 L4 21 Z" fill={secondary} />
          <path d="M20 2 L16 2 L16 19 L20 21 Z" fill={secondary} />
          <rect x="8" y="17" width="8" height="3" fill="#FFFFFF" />
          <circle cx="12" cy="9" r="2.5" fill="#EF4444" stroke={secondary} strokeWidth="0.8" />
          <path d="M12 4 L13 7 L11 7 Z" fill={secondary} />
        </g>
      );
    case 'rencong':
      return (
        <g transform="translate(24, 17)">
          {/* Aceh Rencong Dagger & Pintu Aceh */}
          <path d="M8 2 C11 2, 13 4, 13 6 L12 18 L10 18 L10 7 C9 6, 7 5, 6 5 Z" fill={secondary} />
          <circle cx="14" cy="4" r="1.5" fill="#EF4444" />
          <path d="M6 19 L18 19 M7 21 L17 21" stroke={secondary} strokeWidth="1.2" />
        </g>
      );
    case 'gadang':
      return (
        <g transform="translate(24, 18)">
          {/* Minangkabau Gonjong Roof */}
          <path d="M2 11 Q6 6, 9 10 Q12 4, 15 10 Q18 6, 22 11 L19 19 L5 19 Z" fill={secondary} stroke="#FFFFFF" strokeWidth="0.8" />
          <rect x="9" y="14" width="6" height="5" fill="#DC2626" />
          <circle cx="12" cy="8" r="1.5" fill="#FBBF24" />
        </g>
      );
    case 'cenderawasih':
      return (
        <g transform="translate(24, 17)">
          {/* Papua Cenderawasih Bird */}
          <path d="M10 5 C12 2, 16 3, 17 6 C15 7, 13 8, 12 11 C11 14, 15 18, 18 20 C14 20, 9 17, 8 13 C7 9, 8 6, 10 5 Z" fill={secondary} />
          <circle cx="15" cy="5" r="1" fill="#DC2626" />
          <path d="M8 11 Q4 15, 6 19" stroke="#FBBF24" strokeWidth="1.2" fill="none" />
          <path d="M10 13 Q6 17, 9 21" stroke="#FFFFFF" strokeWidth="1" fill="none" />
        </g>
      );
    case 'phinisi':
    case 'lancang':
    case 'sandeq':
      return (
        <g transform="translate(24, 18)">
          {/* Phinisi Sailing Ship */}
          <path d="M11 2 L11 16 L4 14 Z" fill="#FFFFFF" />
          <path d="M13 5 L13 16 L19 14 Z" fill={secondary} />
          <path d="M3 17 L21 17 L18 21 L6 21 Z" fill={secondary} stroke="#FFFFFF" strokeWidth="0.6" />
          <circle cx="12" cy="1" r="1" fill="#DC2626" />
        </g>
      );
    case 'komodo':
    case 'enggang':
    case 'manguni':
    case 'badak':
      return (
        <g transform="translate(24, 18)">
          {/* Wildlife / Mythic Guardian Insignia */}
          <circle cx="12" cy="11" r="6" fill="none" stroke={secondary} strokeWidth="1.5" />
          <path d="M12 2 L13.5 6 L18 7 L14.5 10 L15.5 14 L12 11.5 L8.5 14 L9.5 10 L6 7 L10.5 6 Z" fill={secondary} />
          <circle cx="12" cy="11" r="2.5" fill="#EF4444" />
        </g>
      );
    case 'ikn':
    case 'ampera':
    case 'keraton':
    case 'tugu':
    default:
      return (
        <g transform="translate(24, 18)">
          {/* Classical Star & Perisai Bhayangkara */}
          <polygon points="12,2 14.5,7.5 20.5,8 16,12 17.5,18 12,14.8 6.5,18 8,12 3.5,8 9.5,7.5" fill={secondary} stroke="#FFFFFF" strokeWidth="0.8" />
          <circle cx="12" cy="11" r="3" fill="#DC2626" stroke="#FFFFFF" strokeWidth="0.5" />
          <polygon points="12,9 13,11 15,11 13.5,12 14,14 12,13 10,14 10.5,12 9,11 11,11" fill="#FBBF24" />
        </g>
      );
  }
};

export const PoldaLogo: React.FC<PoldaLogoProps> = ({
  poldaId,
  poldaSingkatan,
  poldaNama,
  size = 'md',
  className = '',
  showTooltip = false,
  preferScrapedImage = true
}) => {
  const [imageError, setImageError] = useState<boolean>(false);
  const config = EMBLEM_CONFIGS[poldaId] || DEFAULT_CONFIG;
  const label = poldaSingkatan || config.code;

  // Lookup scraped satker data from Google/Wikimedia repository
  const satkerData = getSatkerLogo(poldaId) || POLDA_LOGOS_DATA[poldaId] || SATKER_JAJARAN_DATA.find(s => s.id === poldaId) || (poldaNama ? getSatkerLogo(poldaNama) : undefined);

  // Dimensions mapping
  const sizeMap = {
    xs: { width: 26, height: 30, textSize: 'text-[7px]', scale: 'scale-75', px: 'h-6 w-6' },
    sm: { width: 34, height: 40, textSize: 'text-[9px]', scale: 'scale-90', px: 'h-8 w-8' },
    md: { width: 44, height: 52, textSize: 'text-[10px]', scale: 'scale-100', px: 'h-11 w-11' },
    lg: { width: 56, height: 66, textSize: 'text-xs', scale: 'scale-110', px: 'h-14 w-14' },
    xl: { width: 72, height: 86, textSize: 'text-sm', scale: 'scale-125', px: 'h-18 w-18' },
    '2xl': { width: 92, height: 110, textSize: 'text-base', scale: 'scale-150', px: 'h-24 w-24' }
  };

  const currentSize = sizeMap[size];
  const hasScrapedImage = preferScrapedImage && !imageError && satkerData?.imageUrl;

  return (
    <div 
      className={`relative inline-flex flex-col items-center justify-center select-none flex-shrink-0 group ${className}`}
      title={showTooltip ? (poldaNama || satkerData?.nama || `Polda ${label}`) : undefined}
      style={{ width: currentSize.width, height: currentSize.height }}
    >
      {hasScrapedImage ? (
        <div className="relative w-full h-full flex items-center justify-center">
          <img
            src={satkerData.imageUrl}
            alt={poldaNama || satkerData.nama || `Lambang ${label}`}
            referrerPolicy="no-referrer"
            loading="lazy"
            onError={() => setImageError(true)}
            className="w-full h-full object-contain filter drop-shadow-md transition-transform duration-200 group-hover:scale-105"
          />
        </div>
      ) : (
        <svg
          viewBox="0 0 72 84"
          className="w-full h-full drop-shadow-md transition-transform duration-200 group-hover:scale-105"
          fill="none"
          xmlns="http://www.w3.org/2000/svg"
        >
          <defs>
            {/* Gradient for shield body */}
            <linearGradient id={`grad-body-${poldaId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor={config.primaryColor} />
              <stop offset="100%" stopColor="#0B132B" />
            </linearGradient>

            {/* Golden border gradient */}
            <linearGradient id={`grad-gold-${poldaId}`} x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FEF08A" />
              <stop offset="50%" stopColor="#F59E0B" />
              <stop offset="100%" stopColor="#B45309" />
            </linearGradient>

            {/* Inner banner gradient */}
            <linearGradient id={`grad-banner-${poldaId}`} x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#DC2626" />
              <stop offset="50%" stopColor="#EF4444" />
              <stop offset="100%" stopColor="#DC2626" />
            </linearGradient>
            
            <filter id={`glow-${poldaId}`} x="-20%" y="-20%" width="140%" height="140%">
              <feDropShadow dx="0" dy="2" stdDeviation="2" floodColor="#000000" floodOpacity="0.4"/>
            </filter>
          </defs>

          {/* Outer Shield Border (Gold Trim) */}
          <path
            d="M36 2 C54 2, 68 8, 68 20 C68 48, 54 68, 36 82 C18 68, 4 48, 4 20 C4 8, 18 2, 36 2 Z"
            fill={`url(#grad-gold-${poldaId})`}
            filter={`url(#glow-${poldaId})`}
          />

          {/* Middle Dark Trim */}
          <path
            d="M36 5 C51 5, 64 10, 64 21 C64 46, 51 64, 36 78 C21 64, 8 46, 8 21 C8 10, 21 5, 36 5 Z"
            fill="#1E293B"
          />

          {/* Inner Shield Core with Regional Color */}
          <path
            d="M36 7 C49 7, 61 12, 61 22 C61 45, 49 62, 36 75 C23 62, 11 45, 11 22 C11 12, 23 7, 36 7 Z"
            fill={`url(#grad-body-${poldaId})`}
          />

          {/* Top Arc Trim / Header Bar */}
          <path
            d="M16 18 C22 13, 30 11, 36 11 C42 11, 50 13, 56 18 L54 23 C48 19, 42 17, 36 17 C30 17, 24 19, 18 23 Z"
            fill={`url(#grad-gold-${poldaId})`}
          />

          {/* Bintang Tri Brata / Crown Top */}
          <polygon
            points="36,6 37.5,9.5 41,9.5 38,11.5 39,15 36,13 33,15 34,11.5 31,9.5 34.5,9.5"
            fill="#FBBF24"
            stroke="#FFFFFF"
            strokeWidth="0.4"
          />

          {/* Dynamic Regional Insignia Symbol */}
          {renderSymbol(config.symbolType, config.accentColor, config.secondaryColor)}

          {/* Bottom Banner Ribbon for Polda Name */}
          <g transform="translate(0, 48)">
            <path
              d="M12 4 L60 4 L56 15 L36 17 L16 15 Z"
              fill={`url(#grad-banner-${poldaId})`}
              stroke="#FEF08A"
              strokeWidth="0.8"
            />
            <text
              x="36"
              y="13"
              fill="#FFFFFF"
              fontSize="7"
              fontWeight="900"
              fontFamily="system-ui, -apple-system, sans-serif"
              textAnchor="middle"
              letterSpacing="0.5"
            >
              {label.length > 8 ? label.substring(0, 8) : label}
            </text>
          </g>

          {/* Inner Gold Laurel / Padi Kapas Accents */}
          <circle cx="15" cy="34" r="1.5" fill="#FBBF24" />
          <circle cx="14" cy="40" r="1.5" fill="#FBBF24" />
          <circle cx="16" cy="46" r="1.5" fill="#FBBF24" />

          <circle cx="57" cy="34" r="1.5" fill="#FBBF24" />
          <circle cx="58" cy="40" r="1.5" fill="#FBBF24" />
          <circle cx="56" cy="46" r="1.5" fill="#FBBF24" />
        </svg>
      )}
    </div>
  );
};

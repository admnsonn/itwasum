import React, { useState, useEffect, useRef, useMemo } from 'react';
import L from 'leaflet';
import { 
  ZoomIn, 
  ZoomOut, 
  RotateCcw, 
  Layers, 
  Search, 
  Flame, 
  CheckCircle2, 
  ChevronRight, 
  Maximize2, 
  Minimize2,
  X,
  Eye,
  EyeOff,
  BarChart3,
  Building2,
  Sliders,
  ShieldCheck,
  Activity,
  ArrowRight,
  TrendingUp,
  ShieldAlert,
  AlertTriangle
} from 'lucide-react';
import { PoldaSatker, SatkerMapItem, TingkatSatker, TingkatObjek, CurrentUserProfile, BidangAudit, JenjangPengguna } from '../types';
import { getSatkerLogo } from '../data/satkerLogosData';
import { getPoldaEmblemSvgString, getPoldaEmblemDataUri } from '../utils/poldaEmblemGenerator';
import { ALL_COMBINED_SATKERS_DATA } from '../data/allSatkersData';
import { MABES_SATKERS_DATA } from '../data/mabesSatkerData';
import { PoldaLogo } from './PoldaLogo';
import { getSatkerAtensiTLHP, MATRIKS_RENTANG_RISIKO } from '../utils/riskRatingUtils';

interface IndonesiaMapProps {
  poldaList: PoldaSatker[];
  selectedPoldaId: string | null;
  onSelectPolda: (id: string) => void;
  statusFilter: 'all' | 'perhatian' | 'audit';
  setStatusFilter: (filter: 'all' | 'perhatian' | 'audit') => void;
  selectedSatkerItem?: SatkerMapItem | null;
  onSelectSatkerItem?: (item: SatkerMapItem) => void;
  onOpenDetailDrawer?: (item: SatkerMapItem) => void;
  tingkatObjek?: TingkatObjek;
  currentUser?: CurrentUserProfile;
  activeBidang?: BidangAudit;
  onSelectBidang?: (bidang: BidangAudit) => void;
  onOpenKPICustomizer?: () => void;
  activeJenjang?: JenjangPengguna;
  onSelectJenjang?: (jenjang: JenjangPengguna) => void;
  onSelectTingkatObjek?: (tingkat: TingkatObjek) => void;
  isMaximized?: boolean;
  onToggleMaximize?: () => void;
}

// Bounding box for Indonesia strictly
const INDONESIA_BOUNDS: [[number, number], [number, number]] = [
  [-11.5, 94.5], // Southwest (South of Rote, West of Sabang)
  [6.5, 141.5]   // Northeast (North of Miangas, East of Jayapura)
];

const INDONESIA_MAX_BOUNDS: [[number, number], [number, number]] = [
  [-12.8, 93.0], 
  [7.8, 142.5]
];

// Island bounding boxes within Indonesia
const ISLAND_BOUNDS: Record<string, [[number, number], [number, number]]> = {
  'Semua': INDONESIA_BOUNDS,
  'Sumatera': [[-6.2, 95.0], [5.9, 106.3]],
  'Jawa': [[-8.9, 105.1], [-5.8, 114.6]],
  'Kalimantan': [[-4.3, 108.5], [4.4, 119.3]],
  'Sulawesi': [[-5.9, 118.5], [2.1, 125.8]],
  'Bali-Nusa': [[-11.1, 114.3], [-7.9, 125.5]],
  'Maluku-Papua': [[-9.2, 125.5], [2.5, 141.1]],
};

type BasemapStyle = 'streets' | 'osm' | 'satellite' | 'topo' | 'canvas';

const BASEMAP_TILES: Record<BasemapStyle, { url: string; attribution: string; name: string; desc: string }> = {
  streets: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Street_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, DeLorme, NAVTEQ, USGS, Intermap, iPC, NRCAN, Esri Japan, METI, Esri China (Hong Kong), Esri (Thailand), TomTom',
    name: 'Peta Presisi Wilayah (Esri)',
    desc: 'Tampilan resmi kontras tinggi dengan batas administratif jajaran Polri'
  },
  osm: {
    url: 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png',
    attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors',
    name: 'Peta Jalan & Wilayah (OSM)',
    desc: 'Detail jaringan jalan dan perbatasan wilayah administratif'
  },
  satellite: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, Maxar, Earthstar Geographics',
    name: 'Satelit NKRI (Esri)',
    desc: 'Citra satelit resolusi tinggi daratan & perairan Indonesia'
  },
  canvas: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Light_Gray_Base/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, &copy; OpenStreetMap contributors',
    name: 'Kanvas Minimalis (Light)',
    desc: 'Latar belakang abu-abu terang fokus visualisasi sebaran pin satker'
  },
  topo: {
    url: 'https://server.arcgisonline.com/ArcGIS/rest/services/World_Topo_Map/MapServer/tile/{z}/{y}/{x}',
    attribution: '&copy; Esri, HERE, Garmin, USGS',
    name: 'Topografi Relatif',
    desc: 'Kontur elevasi dan medan geografis Nusantara'
  }
};

export const IndonesiaMap: React.FC<IndonesiaMapProps> = ({
  poldaList,
  selectedPoldaId,
  onSelectPolda,
  statusFilter,
  setStatusFilter,
  selectedSatkerItem,
  onSelectSatkerItem,
  onOpenDetailDrawer,
  tingkatObjek = 'semua',
  currentUser,
  activeBidang = 'semua',
  onSelectBidang,
  onOpenKPICustomizer,
  activeJenjang = 'irwasum',
  onSelectJenjang,
  onSelectTingkatObjek,
  isMaximized: controlledIsMaximized,
  onToggleMaximize,
}) => {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<L.Map | null>(null);
  const tileLayerRef = useRef<L.TileLayer | null>(null);
  const markersLayerRef = useRef<L.LayerGroup | null>(null);
  const heatLayerRef = useRef<L.LayerGroup | null>(null);

  // States
  const [selectedIsland, setSelectedIsland] = useState<string>('Semua');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [basemap, setBasemap] = useState<BasemapStyle>('streets');
  const [showBasemapMenu, setShowBasemapMenu] = useState(false);
  const [showRiskHeatmap, setShowRiskHeatmap] = useState(false);
  const [tingkatFilter, setTingkatFilter] = useState<'all' | 'mabes' | 'polda' | 'polres'>('all');
  const [currentCoordinates, setCurrentCoordinates] = useState({ lat: '-2.50', lng: '118.00' });
  const [currentZoomLevel, setCurrentZoomLevel] = useState<number>(5);
  const [internalIsMaximized, setInternalIsMaximized] = useState<boolean>(false);
  const isMaximized = controlledIsMaximized !== undefined ? controlledIsMaximized : internalIsMaximized;

  // Floating HUD visibility in Fullscreen mode (Card isinya menyesuaikan dengan kondisi UI)
  const [showKpiCard, setShowKpiCard] = useState<boolean>(false);
  const [showCriticalCard, setShowCriticalCard] = useState<boolean>(false);
  const [showLegendCard, setShowLegendCard] = useState<boolean>(false);

  // Critical satkers for fullscreen Atensi & Risiko card
  const criticalSatkersList = useMemo(() => {
    return ALL_COMBINED_SATKERS_DATA.filter(s => s.status === 'kritis' || s.status === 'perhatian');
  }, []);

  const satkerStatusCounts = useMemo(() => {
    const kritis = ALL_COMBINED_SATKERS_DATA.filter(s => s.status === 'kritis').length;
    const perhatian = ALL_COMBINED_SATKERS_DATA.filter(s => s.status === 'perhatian').length;
    const aman = ALL_COMBINED_SATKERS_DATA.filter(s => s.status === 'aman').length;
    return { kritis, perhatian, aman, total: ALL_COMBINED_SATKERS_DATA.length };
  }, []);

  // Toggle Maximized / Full-Screen View
  const toggleMaximize = () => {
    if (onToggleMaximize) {
      onToggleMaximize();
    } else {
      setInternalIsMaximized(prev => !prev);
    }
  };

  // Trigger leaflet recalculation when fullscreen toggles
  useEffect(() => {
    const timer1 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 60);
    const timer2 = setTimeout(() => {
      mapInstanceRef.current?.invalidateSize();
    }, 250);
    return () => {
      clearTimeout(timer1);
      clearTimeout(timer2);
    };
  }, [isMaximized]);

  // Keyboard shortcuts in Fullscreen mode (Escape to exit)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (target && (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.tagName === 'SELECT')) {
        return;
      }

      if (e.key === 'Escape' && isMaximized) {
        if (onToggleMaximize) {
          onToggleMaximize();
        } else {
          setInternalIsMaximized(false);
        }
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isMaximized, onToggleMaximize]);

  // Lock background body scroll when in maximized fullscreen
  useEffect(() => {
    if (isMaximized) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isMaximized]);

  // Authentic 6 KPI indicators matching exactly the conditions of the UI from Document Hal 6
  const uiConditions = useMemo(() => {
    const isPusat = tingkatObjek === 'pusat';
    const isWilayah = tingkatObjek === 'wilayah';

    const totalPolda = poldaList.length;
    const poldaTemuan = poldaList.reduce((acc, curr) => acc + curr.temuanTerbuka, 0);
    const poldaTemuanSelesai = poldaList.reduce((acc, curr) => acc + curr.temuanSelesai, 0);
    const poldaIKU = (poldaList.reduce((acc, curr) => acc + curr.capaianIKU, 0) / (totalPolda || 1));
    const poldaSerapan = (poldaList.reduce((acc, curr) => acc + (curr.eProfil?.persenSerapan || 88), 0) / (totalPolda || 1));

    const totalMabes = MABES_SATKERS_DATA.length;
    const mabesTemuan = MABES_SATKERS_DATA.reduce((acc, curr) => acc + curr.temuanTerbuka, 0);
    const mabesTemuanSelesai = 126;
    const mabesIKU = (MABES_SATKERS_DATA.reduce((acc, curr) => acc + curr.capaianIKU, 0) / (totalMabes || 1));
    const mabesSerapan = (MABES_SATKERS_DATA.reduce((acc, curr) => acc + curr.serapanAnggaran, 0) / (totalMabes || 1));

    const isL2Riau = currentUser?.level === 'L2' && currentUser.titikWilayahId === 'polda-riau';
    const isL1Itwil3 = currentUser?.level === 'L1' && currentUser.titikWilayahId === 'itwil-3';
    const isL1Itwil1 = currentUser?.level === 'L1' && currentUser.titikWilayahId === 'itwil-1';

    const displaySatkerCount = isL2Riau 
      ? 13 
      : isL1Itwil3 
        ? 7 
        : isL1Itwil1 
          ? 6 
          : isPusat 
            ? totalMabes 
            : isWilayah 
              ? totalPolda 
              : totalPolda + totalMabes;

    const displaySatkerLabel = isL2Riau 
      ? 'Polda & Polres' 
      : isL1Itwil3 || isL1Itwil1 
        ? 'Polda Binaan' 
        : isPusat 
          ? 'Satker Mabes' 
          : isWilayah 
            ? 'Polda' 
            : 'Satker Induk';

    const displaySatkerSub = isL2Riau
      ? 'Polda Riau & 12 Polres Jajaran'
      : isL1Itwil3
        ? '7 Polda Regional & Polres (Itwil III)'
        : isL1Itwil1
          ? '6 Polda Regional & Polres (Itwil I)'
          : isPusat 
            ? '10 Satker Utama • Mabes Polri' 
            : isWilayah 
              ? '34 Polda • 514 Polres Jajaran' 
              : '34 Polda • 514 Polres • 10 Mabes';

    const displayTemuanTerbuka = isL2Riau
      ? 96
      : isPusat 
        ? mabesTemuan 
        : isWilayah 
          ? poldaTemuan 
          : 1167; // matches Document Hal 6 in UI (1167 / 3175)

    const displayTemuanSelesai = isL2Riau
      ? 212
      : isPusat 
        ? mabesTemuanSelesai 
        : isWilayah 
          ? poldaTemuanSelesai 
          : 2008;

    const displayTotalTemuan = isL2Riau ? 308 : isPusat ? (mabesTemuan + mabesTemuanSelesai) : isWilayah ? (poldaTemuan + poldaTemuanSelesai) : 3175;
    const displayTlhpRate = isL2Riau ? '68.8' : isPusat ? '72.4' : isWilayah ? '74.2' : '63.2';

    const displayIKU = isL2Riau ? '90.8' : isPusat ? mabesIKU.toFixed(1) : isWilayah ? poldaIKU.toFixed(1) : '90.3';
    const displaySerapan = isL2Riau ? '91.3' : isPusat ? mabesSerapan.toFixed(1) : isWilayah ? poldaSerapan.toFixed(1) : '89.7';
    const displaySarprasAkurasi = isL2Riau ? '92.4' : isPusat ? '97.2' : isWilayah ? '86.5' : '88.9';
    const displaySdmLhkpn = isL2Riau ? '98.5' : isPusat ? '99.1' : isWilayah ? '91.4' : '93.2';

    return {
      satkerCount: displaySatkerCount,
      satkerLabel: displaySatkerLabel,
      satkerSub: displaySatkerSub,
      iku: displayIKU,
      sdm: displaySdmLhkpn,
      sarpras: displaySarprasAkurasi,
      serapan: displaySerapan,
      temuanTerbuka: displayTemuanTerbuka,
      totalTemuan: displayTotalTemuan,
      tlhpRate: displayTlhpRate
    };
  }, [poldaList, tingkatObjek, currentUser]);

  // Synchronize with external Tingkat Objek (Poros 3: Gabungan, Wilayah, Mabes)
  useEffect(() => {
    if (!mapInstanceRef.current) return;
    if (tingkatObjek === 'pusat') {
      setTingkatFilter('mabes');
      setSelectedIsland('Jawa');
      // Fly smoothly to Mabes Polri Complex & Jabodetabek Satkers
      mapInstanceRef.current.flyTo([-6.275, 106.835], 11.5, {
        duration: 1.2
      });
    } else if (tingkatObjek === 'wilayah') {
      setTingkatFilter('polda');
      setSelectedIsland('Semua');
      mapInstanceRef.current.flyToBounds(L.latLngBounds(INDONESIA_BOUNDS[0], INDONESIA_BOUNDS[1]), {
        padding: [24, 24],
        duration: 1.0
      });
    } else {
      setTingkatFilter('all');
      setSelectedIsland('Semua');
      mapInstanceRef.current.flyToBounds(L.latLngBounds(INDONESIA_BOUNDS[0], INDONESIA_BOUNDS[1]), {
        padding: [24, 24],
        duration: 1.0
      });
    }
  }, [tingkatObjek]);

  // Filter combined satkers based on Status, Tingkat, Island, and Search Query
  const filteredSatkers = ALL_COMBINED_SATKERS_DATA.filter((satker) => {
    // Poros 3 Enforcement (Tingkat Objek: Gabungan, Wilayah, Pusat)
    const isMabesPusat = (
      satker.tingkat === 'Mabes' || 
      satker.tingkat === 'Itwasum' || 
      satker.tingkat === 'Satker-Mabes' || 
      satker.tingkat === 'Biro-Mabes' || 
      satker.tingkat === 'Itwil'
    );
    const isRegionalWilayah = (
      satker.tingkat === 'Polda' || 
      satker.tingkat === 'Polrestabes' || 
      satker.tingkat === 'Polresta' || 
      satker.tingkat === 'Polres' || 
      satker.tingkat === 'Polsek'
    );

    if (tingkatObjek === 'pusat' && !isMabesPusat) {
      return false;
    }
    if (tingkatObjek === 'wilayah' && !isRegionalWilayah) {
      return false;
    }

    // Exclude Polsek completely as per official manual book (page 4)
    if (satker.tingkat === 'Polsek') {
      return false;
    }

    // Local Tingkat filter (Semua, Mabes, Polda, Polres)
    if (tingkatFilter !== 'all') {
      if (tingkatFilter === 'mabes' && !['Mabes', 'Itwasum', 'Itwil', 'Satker-Mabes', 'Biro-Mabes'].includes(satker.tingkat)) {
        return false;
      }
      if (tingkatFilter === 'polda' && satker.tingkat !== 'Polda') {
        return false;
      }
      if (tingkatFilter === 'polres' && !['Polres', 'Polrestabes', 'Polresta'].includes(satker.tingkat)) {
        return false;
      }
    }

    // Status filter
    if (statusFilter === 'perhatian' && satker.status === 'aman') {
      return false;
    }
    if (statusFilter === 'audit' && !satker.auditBerjalan) {
      return false;
    }

    // Role-based Jurisdiction Enforcement (8 Peran Resmi Dokumen E-Audit)
    if (currentUser) {
      if (currentUser.level === 'L2' && currentUser.titikWilayahId === 'polda-riau') {
        // L2 Irwasda Riau & Admin Polda Riau: Strictly Polda Riau & 12 Polres Riau
        if (satker.id !== 'polda-riau' && satker.parentPoldaId !== 'polda-riau') {
          return false;
        }
      } else if (currentUser.level === 'L1' && currentUser.titikWilayahId === 'itwil-3') {
        // L1 Irwil III: 7 Polda Regional (DIY, Jatim, Bali, NTB, NTT, Kalbar, Kalteng) & Polres jajaran
        const itwil3Poldas = ['polda-diy', 'polda-jatim', 'polda-bali', 'polda-ntb', 'polda-ntt', 'polda-kalbar', 'polda-kalteng'];
        const isPoldaInItwil = itwil3Poldas.includes(satker.id);
        const isPolresInItwil = satker.parentPoldaId && itwil3Poldas.includes(satker.parentPoldaId);
        if (!isPoldaInItwil && !isPolresInItwil && satker.id !== 'itwil-3') {
          return false;
        }
      } else if (currentUser.level === 'L1' && currentUser.titikWilayahId === 'itwil-1') {
        // L1 Koordinator Itwil I: 6 Polda Regional (Aceh, Sumut, Sumbar, Riau, Kepri, Jambi) & Polres jajaran
        const itwil1Poldas = ['polda-aceh', 'polda-sumut', 'polda-sumbar', 'polda-riau', 'polda-kepri', 'polda-jambi'];
        const isPoldaInItwil = itwil1Poldas.includes(satker.id);
        const isPolresInItwil = satker.parentPoldaId && itwil1Poldas.includes(satker.parentPoldaId);
        if (!isPoldaInItwil && !isPolresInItwil && satker.id !== 'itwil-1') {
          return false;
        }
      } else if (currentUser.level === 'L3' && currentUser.titikWilayahId === 'polres-kampar') {
        // L3 Auditee Polres Kampar: Objek periksa Polres Kampar & Satker induk Polda Riau
        if (satker.id !== 'polres-kampar' && satker.id !== 'polda-riau' && satker.parentPoldaId !== 'polda-riau') {
          return false;
        }
      } else if (currentUser.peran === 'pengawas_tim') {
        // Pengawas Tim (Audit Lapangan ST/412 di Wilayah Riau): Objek periksa Polda Riau & jajaran
        if (satker.id !== 'polda-riau' && satker.parentPoldaId !== 'polda-riau') {
          return false;
        }
      }
    }

    // Island / Region filter
    if (selectedIsland !== 'Semua' && satker.pulau !== selectedIsland) {
      return false;
    }


    // Search query filter
    if (searchQuery.trim() !== '') {
      const q = searchQuery.toLowerCase().trim();
      const matchNama = satker.nama.toLowerCase().includes(q);
      const matchSingkatan = satker.singkatan.toLowerCase().includes(q);
      const matchIbukota = satker.ibukota.toLowerCase().includes(q);
      const matchPimpinan = satker.pimpinanNama.toLowerCase().includes(q);
      const matchWilayah = satker.wilayahHukum.toLowerCase().includes(q);
      const matchTingkat = satker.tingkat.toLowerCase().includes(q);
      return matchNama || matchSingkatan || matchIbukota || matchPimpinan || matchWilayah || matchTingkat;
    }

    return true;
  });

  // 1. Initialize Map Instance
  useEffect(() => {
    if (!mapContainerRef.current) return;
    if (mapInstanceRef.current) {
      try {
        mapInstanceRef.current.remove();
      } catch {
        // ignore cleanup error
      }
      mapInstanceRef.current = null;
    }

    const container = mapContainerRef.current as any;
    if (container && container._leaflet_id) {
      delete container._leaflet_id;
    }

    try {
      const map = L.map(mapContainerRef.current, {
        center: [-2.5489, 118.0149], // Geographical center of Indonesia archipelago
        zoom: 5,
        minZoom: 4,
        maxZoom: 18,
        maxBounds: INDONESIA_MAX_BOUNDS,
        maxBoundsViscosity: 0.9,
        zoomControl: false,
        attributionControl: false
      });

      // Create Base Tile Layer
      const tileLayer = L.tileLayer(BASEMAP_TILES[basemap].url, {
        maxZoom: 18,
        subdomains: 'abcd'
      }).addTo(map);

      tileLayerRef.current = tileLayer;

      // Create Markers and Heat Layers
      const markersLayer = L.layerGroup().addTo(map);
      const heatLayer = L.layerGroup().addTo(map);
      markersLayerRef.current = markersLayer;
      heatLayerRef.current = heatLayer;

      map.on('mousemove', (e: L.LeafletMouseEvent) => {
        setCurrentCoordinates({
          lat: e.latlng.lat.toFixed(2),
          lng: e.latlng.lng.toFixed(2)
        });
      });

      map.on('zoomend', () => {
        setCurrentZoomLevel(map.getZoom());
      });

      mapInstanceRef.current = map;

      // Initial fit to NKRI bounds
      map.fitBounds(L.latLngBounds(INDONESIA_BOUNDS[0], INDONESIA_BOUNDS[1]), {
        padding: [20, 20]
      });
    } catch (err) {
      console.warn('Map initialization failed or container re-bound:', err);
    }

    return () => {
      if (mapInstanceRef.current) {
        try {
          mapInstanceRef.current.remove();
        } catch {
          // ignore
        }
        mapInstanceRef.current = null;
      }
      if (mapContainerRef.current) {
        delete (mapContainerRef.current as any)._leaflet_id;
      }
    };
  }, []);

  // 2. Handle Basemap Change
  useEffect(() => {
    if (!mapInstanceRef.current || !tileLayerRef.current) return;
    tileLayerRef.current.setUrl(BASEMAP_TILES[basemap].url);
  }, [basemap]);

  // 3. Render Leaflet Markers with Wikipedia Logo & Badges for Polda, Polres, and Polsek
  useEffect(() => {
    if (!mapInstanceRef.current || !markersLayerRef.current || !heatLayerRef.current) return;

    markersLayerRef.current.clearLayers();
    heatLayerRef.current.clearLayers();

    filteredSatkers.forEach((satker) => {
      if (!satker || typeof satker.lat !== 'number' || typeof satker.lng !== 'number' || isNaN(satker.lat) || isNaN(satker.lng)) {
        return;
      }

      const isSelected = selectedSatkerItem 
        ? selectedSatkerItem.id === satker.id 
        : (selectedPoldaId === satker.id || selectedPoldaId === satker.parentPoldaId);
      const isMabes = satker.tingkat === 'Mabes' || satker.tingkat === 'Itwasum';
      const isItwil = satker.tingkat === 'Itwil';
      const isSatkerMabes = satker.tingkat === 'Satker-Mabes' || satker.tingkat === 'Biro-Mabes';
      const isPolda = satker.tingkat === 'Polda';
      const isPolres = satker.tingkat === 'Polres' || satker.tingkat === 'Polrestabes' || satker.tingkat === 'Polresta';
      const isPolsek = satker.tingkat === 'Polsek';

      // Dimensions based on hierarchy
      const markerSize = isMabes ? 52 : isItwil ? 46 : isPolda ? 44 : isSatkerMabes ? 40 : isPolres ? 36 : 28;
      const iconSize = isMabes ? 36 : isItwil ? 32 : isPolda ? 30 : isSatkerMabes ? 28 : isPolres ? 24 : 18;

      // Status Atensi & TLHP terstandarisasi Itwasum Polri (Matriks 5 Tingkat)
      const atensiInfo = getSatkerAtensiTLHP(satker);
      const statusColor = atensiInfo.hexCode;
      const statusBg = atensiInfo.badgeBg;

      const tierBadgeBg = isMabes
        ? 'bg-gradient-to-r from-amber-600 to-amber-800 text-amber-100 border-amber-300'
        : isItwil
          ? 'bg-gradient-to-r from-blue-900 to-indigo-950 text-amber-300 border-amber-400/60'
          : isPolda 
            ? 'bg-[#0B2B5C] text-amber-300 border-amber-400/50' 
            : isSatkerMabes
              ? 'bg-slate-900 text-blue-200 border-blue-400/50'
              : isPolres 
                ? 'bg-slate-800 text-blue-200 border-blue-400/40' 
                : 'bg-emerald-950 text-emerald-300 border-emerald-400/40';

      const borderStyle = `${isMabes ? 3 : isItwil ? 2.8 : isPolda ? 2.5 : 2}px solid ${atensiInfo.hexCode}`;

      // 100% Reliable Base64 Vector SVG Emblem Data URI
      const emblemDataUri = getPoldaEmblemDataUri(satker.id, satker.singkatan || satker.nama || 'POLRI');
      const logoUrl = satker.wikiLogoUrl || emblemDataUri;
      const safeSingkatan = (satker.singkatan || satker.nama || 'SATKER').replace(/"/g, '&quot;');
      const safeNama = (satker.nama || '').replace(/"/g, '&quot;');
      const safePimpinanNama = (satker.pimpinanNama || '-').split(',')[0].replace(/"/g, '&quot;');
      const safePimpinanJabatan = (satker.pimpinanJabatan || 'Pimpinan').replace(/"/g, '&quot;');

      // Create Custom HTML Pin Icon
      const customIconHtml = `
        <div class="satker-marker-wrapper relative group cursor-pointer transition-transform duration-200 ${isSelected ? 'scale-125 z-50' : 'hover:scale-115'}">
          
          ${satker.auditBerjalan ? `
            <span class="absolute -top-1.5 -left-1.5 z-20 flex h-3.5 w-3.5">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-blue-400 opacity-75"></span>
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-blue-600 border border-white text-[7px] text-white font-black items-center justify-center">⏱</span>
            </span>
          ` : ''}

          ${atensiInfo.def.key === 'sangat_tinggi' ? `
            <span class="absolute -top-1.5 -right-1.5 z-20 flex h-4 w-4">
              <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-80"></span>
              <span class="relative inline-flex rounded-full h-4 w-4 bg-red-600 border border-white text-[8px] text-white font-black items-center justify-center shadow-sm">!</span>
            </span>
          ` : atensiInfo.def.key === 'tinggi' ? `
            <span class="absolute -top-1 -right-1 z-20 flex h-3.5 w-3.5">
              <span class="relative inline-flex rounded-full h-3.5 w-3.5 bg-orange-500 border border-white text-[7px] text-white font-black items-center justify-center shadow-xs">▲</span>
            </span>
          ` : ''}

          <!-- Pin Body Container with Atensi / TLHP Color Ring Border -->
          <div 
            class="relative rounded-full bg-white shadow-xl flex items-center justify-center transition-all ${isSelected ? 'ring-4 ring-amber-400 shadow-amber-300/80' : `ring-2 ${atensiInfo.ringClass}`}"
            style="width: ${markerSize}px; height: ${markerSize}px; border: ${borderStyle};"
          >
            <!-- Logo Image with safe base64 fallback -->
            <img 
              src="${logoUrl}" 
              alt="${safeSingkatan}" 
              referrerpolicy="no-referrer"
              class="w-[${iconSize}px] h-[${iconSize}px] object-contain filter drop-shadow-2xs"
              style="width: ${iconSize}px; height: ${iconSize}px;"
              onerror="this.onerror=null; this.src='${emblemDataUri}';"
            />

            <!-- Status Atensi & TLHP Indicator Dot -->
            <span 
              class="absolute -bottom-0.5 right-0 w-3.5 h-3.5 rounded-full border-2 border-white ${statusBg} shadow-xs"
              title="Atensi: ${atensiInfo.statusAtensiShort} (Skor: ${atensiInfo.score}/25, TLHP: ${atensiInfo.persenTLHP}%)"
            ></span>
          </div>

          <!-- Bottom Micro Tag (Satker name & Atensi Status) -->
          <div class="absolute top-full left-1/2 -translate-x-1/2 mt-1 px-1.5 py-0.2 rounded-md ${tierBadgeBg} border text-[9px] font-black tracking-tight whitespace-nowrap shadow-md pointer-events-none flex items-center gap-1">
            <span>${safeSingkatan}</span>
            <span class="w-1.5 h-1.5 rounded-full ${statusBg}"></span>
          </div>

          <!-- Pin Pointer Arrow -->
          <div 
            class="absolute -bottom-1 left-1/2 -translate-x-1/2 w-2 h-2 rotate-45 bg-white border-r border-b border-slate-700 -z-10"
          ></div>
        </div>
      `;

      const markerIcon = L.divIcon({
        className: 'custom-satker-leaflet-marker',
        html: customIconHtml,
        iconSize: [markerSize, markerSize + 12],
        iconAnchor: [markerSize / 2, markerSize + 6],
        popupAnchor: [0, -markerSize - 8]
      });

      const marker = L.marker([satker.lat, satker.lng], {
        icon: markerIcon,
        title: `${satker.tingkat || 'Satker'}: ${satker.nama || ''} (${satker.singkatan || ''}) - ${atensiInfo.statusAtensiShort}`
      });

      // Handle Marker Click
      marker.on('click', () => {
        // Trigger satker item callback if provided (handles both Polda and Sub-Satkers)
        if (onSelectSatkerItem) {
          onSelectSatkerItem(satker);
        } else {
          if (isPolda) {
            onSelectPolda(satker.id);
          } else if (satker.parentPoldaId) {
            onSelectPolda(satker.parentPoldaId);
          }
        }

        // Smooth zoom to marker
        if (mapInstanceRef.current) {
          mapInstanceRef.current.flyTo([satker.lat, satker.lng], Math.max(mapInstanceRef.current.getZoom(), isPolda ? 8 : 10), {
            duration: 0.8
          });
        }
      });

      // Risk Heatmap Circles Overlay disesuaikan dengan Status Atensi & TLHP
      if (showRiskHeatmap) {
        const radius = isPolda 
          ? atensiInfo.heatRadiusKm * 1000 
          : isPolres
            ? Math.round(atensiInfo.heatRadiusKm * 0.55 * 1000)
            : 8000;

        const circle = L.circle([satker.lat, satker.lng], {
          radius,
          color: atensiInfo.hexCode,
          fillColor: atensiInfo.hexCode,
          fillOpacity: isSelected ? Math.min(0.45, atensiInfo.heatOpacity + 0.12) : atensiInfo.heatOpacity,
          weight: isSelected ? 2.5 : 1.5,
          dashArray: atensiInfo.def.key === 'sangat_tinggi' ? undefined : atensiInfo.def.key === 'tinggi' ? '6, 4' : '4, 4'
        });

        circle.bindTooltip(`
          <div class="p-1.5 font-sans">
            <div class="font-extrabold text-xs text-slate-900">${safeNama}</div>
            <div class="font-bold text-[11px]" style="color: ${atensiInfo.hexCode}">
              ${atensiInfo.statusAtensiShort} (Skor: ${atensiInfo.score}/25)
            </div>
            <div class="text-[10px] text-slate-500 mt-0.5">
              TLHP: <strong>${atensiInfo.persenTLHP}% Selesai</strong> • Terbuka: ${satker.temuanTerbuka || 0}
            </div>
          </div>
        `, { sticky: true, opacity: 0.95 });

        heatLayerRef.current?.addLayer(circle);
      }

      // Rich Professional Tooltip/Popup Content with explicit Detail Lengkap trigger button
      const popupContent = `
        <div class="p-3.5 max-w-[295px] bg-white font-sans text-slate-800 rounded-xl shadow-2xl border border-slate-200">
          <div class="flex items-center gap-2.5 pb-2.5 border-b border-slate-100">
            <div class="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-2xs">
              <img 
                src="${logoUrl}" 
                alt="${safeSingkatan}" 
                referrerpolicy="no-referrer"
                class="w-full h-full object-contain"
                onerror="this.onerror=null; this.src='${emblemDataUri}';"
              />
            </div>
            <div class="min-w-0">
              <div class="flex items-center gap-1.5">
                <span class="px-1.5 py-0.2 rounded text-[9px] font-black uppercase ${
                  isPolda ? 'bg-amber-100 text-amber-900 border border-amber-300' :
                  isPolres ? 'bg-blue-100 text-blue-900 border border-blue-300' :
                  'bg-emerald-100 text-emerald-900 border border-emerald-300'
                }">
                  ${satker.tingkat || 'Satker'}
                </span>
                <span class="text-[10px] text-slate-400 font-bold truncate">${satker.pulau || ''}</span>
              </div>
              <h4 class="font-extrabold text-xs text-slate-900 leading-tight mt-0.5 truncate">${safeNama}</h4>
              <p class="text-[10px] text-slate-500 truncate">${safePimpinanJabatan}: ${safePimpinanNama}</p>
            </div>
          </div>
          
          <div class="mt-2.5 space-y-1.5 text-[11px]">
            <div class="flex items-center justify-between pb-1 border-b border-slate-100">
              <span class="text-slate-500 font-medium">Status Atensi:</span>
              <span class="px-2 py-0.5 rounded text-[10px] font-black ${atensiInfo.badgeBg} ${atensiInfo.badgeText}">
                ${atensiInfo.statusAtensiShort}
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Skor Risiko Atensi:</span>
              <span class="font-extrabold" style="color: ${atensiInfo.hexCode}">
                ${atensiInfo.score} / 25 (${atensiInfo.def.label})
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Progres TLHP:</span>
              <span class="font-bold text-slate-900">
                ${atensiInfo.persenTLHP}% (${satker.temuanSelesai || 0}/${satker.totalTemuan || 0} Selesai)
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Temuan Terbuka:</span>
              <span class="font-extrabold ${(satker.temuanTerbuka || 0) > 15 ? 'text-red-600' : 'text-slate-800'}">
                ${satker.temuanTerbuka || 0} temuan
              </span>
            </div>
            <div class="flex items-center justify-between">
              <span class="text-slate-500">Capaian IKU:</span>
              <span class="font-bold ${(satker.capaianIKU || 0) >= 90 ? 'text-emerald-600' : 'text-amber-600'}">
                ${satker.capaianIKU || 0}%
              </span>
            </div>
          </div>
          
          <div class="mt-3 pt-2 border-t border-slate-100 flex items-center justify-between">
            <span class="text-slate-400 font-mono text-[10px]">${(satker.lat || 0).toFixed(2)}°, ${(satker.lng || 0).toFixed(2)}°</span>
            <button 
              id="btn-map-popup-detail-${satker.id}"
              data-satker-detail-id="${satker.id}"
              class="px-2.5 py-1.5 bg-[#0B2B5C] hover:bg-blue-900 text-white rounded-lg font-bold text-[11px] flex items-center gap-1 shadow-xs cursor-pointer transition"
            >
              <span>Detail Lengkap</span>
              <span>➔</span>
            </button>
          </div>
        </div>
      `;

      marker.bindPopup(popupContent, {
        offset: [0, -markerSize - 6],
        className: 'satker-leaflet-popup',
        maxWidth: 300
      });

      markersLayerRef.current?.addLayer(marker);
    });
  }, [filteredSatkers, selectedPoldaId, selectedSatkerItem, showRiskHeatmap, onSelectPolda, onSelectSatkerItem]);

  // Global listener for "Detail Lengkap" button click inside Leaflet popup HTML
  useEffect(() => {
    const handleGlobalPopupClick = (e: MouseEvent) => {
      const target = (e.target as HTMLElement).closest('[data-satker-detail-id]');
      if (target) {
        const satkerId = target.getAttribute('data-satker-detail-id');
        if (satkerId) {
          const satker = ALL_COMBINED_SATKERS_DATA.find(s => s.id === satkerId);
          if (satker && onOpenDetailDrawer) {
            onOpenDetailDrawer(satker);
          }
        }
      }
    };

    document.addEventListener('click', handleGlobalPopupClick);
    return () => {
      document.removeEventListener('click', handleGlobalPopupClick);
    };
  }, [onOpenDetailDrawer]);

  // 4. Island Region FlyTo Navigation
  const handleSelectIsland = (island: string) => {
    setSelectedIsland(island);
    if (!mapInstanceRef.current) return;
    
    const bounds = ISLAND_BOUNDS[island] || INDONESIA_BOUNDS;
    mapInstanceRef.current.flyToBounds(L.latLngBounds(bounds[0], bounds[1]), {
      padding: [30, 30],
      duration: 1.2
    });
  };

  // 5. Zoom & Reset Handlers
  const handleZoomIn = () => {
    mapInstanceRef.current?.zoomIn();
  };

  const handleZoomOut = () => {
    mapInstanceRef.current?.zoomOut();
  };

  const handleResetZoom = () => {
    setSelectedIsland('Semua');
    setSearchQuery('');
    setTingkatFilter('all');
    if (mapInstanceRef.current) {
      mapInstanceRef.current.flyToBounds(L.latLngBounds(INDONESIA_BOUNDS[0], INDONESIA_BOUNDS[1]), {
        padding: [24, 24],
        duration: 1.0
      });
    }
  };

  // Quick zoom to selected Polda if selected from external list
  useEffect(() => {
    if (!selectedPoldaId || !mapInstanceRef.current) return;
    const target = ALL_COMBINED_SATKERS_DATA.find(p => p.id === selectedPoldaId);
    if (target) {
      mapInstanceRef.current.flyTo([target.lat, target.lng], 8, {
        duration: 1.0
      });
    }
  }, [selectedPoldaId]);

  // Auto-focus map based on user's active role jurisdiction
  useEffect(() => {
    const map = mapInstanceRef.current;
    if (!map) return;

    if (currentUser?.level === 'L2' && currentUser.titikWilayahId === 'polda-riau') {
      map.flyTo([0.5071, 101.4478], 8, { duration: 1.0 });
    } else if (currentUser?.level === 'L1' && currentUser.titikWilayahId === 'itwil-3') {
      map.flyTo([-7.5, 114.5], 6, { duration: 1.0 });
    } else if (currentUser?.level === 'L1' && currentUser.titikWilayahId === 'itwil-1') {
      map.flyTo([1.2, 100.5], 6, { duration: 1.0 });
    } else if (currentUser?.level === 'L3' && currentUser.titikWilayahId === 'polres-kampar') {
      map.flyTo([0.3341, 101.0264], 10, { duration: 1.0 });
    } else if (currentUser?.peran === 'pengawas_tim') {
      map.flyTo([0.5071, 101.4478], 8, { duration: 1.0 });
    } else if (currentUser?.level === 'L0') {
      map.fitBounds(L.latLngBounds(INDONESIA_BOUNDS[0], INDONESIA_BOUNDS[1]), {
        padding: [20, 20]
      });
    }
  }, [currentUser?.id, currentUser?.level, currentUser?.titikWilayahId]);

  // Currently inspected satker for floating on-map HUD
  const activeInspectedSatker = React.useMemo(() => {
    if (selectedSatkerItem) return selectedSatkerItem;
    if (selectedPoldaId) {
      return ALL_COMBINED_SATKERS_DATA.find(s => s.id === selectedPoldaId) || null;
    }
    return null;
  }, [selectedSatkerItem, selectedPoldaId]);

  return (
    <div 
      id="command-map-container" 
      className={
        isMaximized 
          ? 'fixed inset-0 z-[99999] w-screen h-screen bg-slate-950 overflow-hidden flex flex-col justify-between select-none shadow-2xl' 
          : 'relative isolate w-full h-[640px] sm:h-[700px] lg:h-[760px] bg-slate-900 rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden flex flex-col justify-between select-none'
      }
    >
      {/* Contextual Focus Banner for Poros 3 (Only in Embedded Mode) */}
      {!isMaximized && tingkatObjek === 'pusat' && (
        <div className="relative z-30 px-3.5 py-2 bg-gradient-to-r from-amber-600 via-amber-700 to-[#0B2B5C] text-white flex items-center justify-between gap-2 shadow-xs text-xs flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-amber-300 animate-pulse"></span>
            <span className="font-extrabold uppercase tracking-wider text-[11px]">
              Fokus Pengawasan: Markas Besar Polri (10 Satker Pusat)
            </span>
          </div>
          <div className="flex items-center gap-1.5 overflow-x-auto text-[10px]">
            <span className="text-amber-200 font-semibold hidden md:inline">Pintas Satker:</span>
            {[
              { id: 'bareskrim', label: 'Bareskrim' },
              { id: 'korlantas', label: 'Korlantas' },
              { id: 'divpropam', label: 'Propam' },
              { id: 'korbrimob', label: 'Brimob' },
              { id: 'slog', label: 'Slog' },
              { id: 'divtik', label: 'TIK' }
            ].map((s) => (
              <button
                key={s.id}
                onClick={() => {
                  const item = ALL_COMBINED_SATKERS_DATA.find(x => x.id === s.id);
                  if (item && onSelectSatkerItem) onSelectSatkerItem(item);
                }}
                className="px-2 py-0.5 rounded bg-white/15 hover:bg-white/30 text-white font-bold transition cursor-pointer"
              >
                {s.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {!isMaximized && tingkatObjek === 'wilayah' && (
        <div className="relative z-30 px-3.5 py-1.5 bg-[#0B2B5C] text-white flex items-center justify-between gap-2 shadow-xs text-xs">
          <div className="flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-blue-300 animate-pulse"></span>
            <span className="font-extrabold uppercase tracking-wider text-[11px]">
              Fokus Pengawasan Kewilayahan: 34 Kepolisian Daerah &amp; 514 Polres
            </span>
          </div>
          <span className="text-[10px] text-blue-200 font-semibold">
            Supervisi Itwil I - V
          </span>
        </div>
      )}

      {/* Top Filter Bar: Status Pills & Tingkat Satker (Only in Embedded Mode) */}
      {!isMaximized && (
        <div className="relative z-20 p-2.5 sm:p-3.5 border-b flex flex-wrap items-center justify-between gap-2.5 shadow-xs transition-colors bg-white/95 backdrop-blur-md border-slate-200/90 text-slate-800">
          {/* Left Side: Tingkat Satker Filter */}
          <div className="flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] font-extrabold uppercase tracking-wider mr-1 hidden sm:inline text-slate-500">
              Tingkat:
            </span>

            <button
              id="map-filter-tingkat-all"
              onClick={() => setTingkatFilter('all')}
              className={`min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                tingkatFilter === 'all'
                  ? 'bg-[#0B2B5C] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Semua</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-slate-200/60 text-slate-700">
                {ALL_COMBINED_SATKERS_DATA.filter(s => s.tingkat !== 'Polsek').length}
              </span>
            </button>

            <button
              id="map-filter-tingkat-mabes"
              onClick={() => setTingkatFilter('mabes')}
              className={`min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                tingkatFilter === 'mabes'
                  ? 'bg-[#0B2B5C] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Mabes</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-slate-100 text-slate-600">
                {ALL_COMBINED_SATKERS_DATA.filter(s => ['Mabes', 'Itwasum', 'Itwil', 'Satker-Mabes', 'Biro-Mabes'].includes(s.tingkat)).length}
              </span>
            </button>

            <button
              id="map-filter-tingkat-polda"
              onClick={() => setTingkatFilter('polda')}
              className={`min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                tingkatFilter === 'polda'
                  ? 'bg-[#0B2B5C] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Polda</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-slate-100 text-slate-600">
                {ALL_COMBINED_SATKERS_DATA.filter(s => s.tingkat === 'Polda').length}
              </span>
            </button>

            <button
              id="map-filter-tingkat-polres"
              onClick={() => setTingkatFilter('polres')}
              className={`min-h-[32px] px-2.5 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                tingkatFilter === 'polres'
                  ? 'bg-[#0B2B5C] text-white shadow-xs'
                  : 'bg-white text-slate-700 border border-slate-200 hover:bg-slate-50'
              }`}
            >
              <span>Polres</span>
              <span className="px-1.5 py-0.2 rounded-md text-[10px] bg-slate-100 text-slate-600">
                {ALL_COMBINED_SATKERS_DATA.filter(s => s.tingkat === 'Polres' || s.tingkat === 'Polrestabes' || s.tingkat === 'Polresta').length}
              </span>
            </button>
          </div>

          {/* Right Side: Island Quick Focus Tabs & Fullscreen Switcher */}
          <div className="flex items-center gap-2 max-w-full overflow-x-auto">
            <div className="flex items-center gap-1 p-1 rounded-xl border overflow-x-auto bg-slate-100 border-slate-200">
              {['Semua', 'Sumatera', 'Jawa', 'Kalimantan', 'Sulawesi', 'Bali-Nusa', 'Maluku-Papua'].map((island) => (
                <button
                  key={island}
                  id={`btn-island-${island.toLowerCase()}`}
                  onClick={() => handleSelectIsland(island)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-bold whitespace-nowrap transition cursor-pointer ${
                    selectedIsland === island
                      ? 'bg-white text-[#0B2B5C] shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {island}
                </button>
              ))}
            </div>

            <button
              id="btn-toggle-fullscreen-map-header"
              onClick={toggleMaximize}
              className="min-h-[32px] px-3 py-1 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shrink-0 cursor-pointer bg-slate-800 text-white hover:bg-[#0B2B5C] shadow-xs"
              title="Maksimalkan Peta ke Layar Penuh"
            >
              <Maximize2 className="w-3.5 h-3.5" />
              <span className="hidden md:inline">Layar Penuh</span>
            </button>
          </div>
        </div>
      )}

      {/* Main Leaflet Map Viewport Container */}
      <div className="relative flex-1 w-full h-full">
        <div 
          ref={mapContainerRef} 
          id="leaflet-indonesia-map" 
          className="w-full h-full bg-slate-100"
          style={{ cursor: 'grab' }}
        />

        {/* Fullscreen Master Header Bar & Floating Cards */}
        {isMaximized && (
          <>
            {/* Top Header Bar */}
            <div className="absolute top-3 left-3 right-3 sm:top-4 sm:left-4 sm:right-4 z-[1005] flex items-center justify-between gap-2 pointer-events-none">
              {/* Left Institutional Badge */}
              <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 px-3.5 py-2 flex items-center gap-3 pointer-events-auto shrink-0">
                <div className="w-8 h-8 rounded-xl bg-[#0B2B5C] text-amber-400 flex items-center justify-center shadow-xs">
                  <ShieldCheck className="w-4 h-4" />
                </div>
                <div>
                  <div className="text-[10px] font-black text-slate-400 uppercase tracking-wider flex items-center gap-1.5">
                    <span>SISTEM PENGAWASAN PRESISI</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                    <span className="text-emerald-700 font-bold">ITWASUM POLRI</span>
                  </div>
                  <div className="text-xs font-black text-slate-900 flex items-center gap-1.5">
                    <span>Peta Taktis NKRI</span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-blue-50 text-[#0B2B5C] font-extrabold border border-blue-200">
                      {activeJenjang === 'kapolri' ? 'Kapolri' : activeJenjang?.startsWith('itwil-') ? activeJenjang.toUpperCase() : 'Irwasum'}
                    </span>
                    <span className="text-[10px] px-1.5 py-0.5 rounded bg-slate-100 text-slate-700 font-bold">
                      {tingkatObjek === 'pusat' ? 'Mabes' : tingkatObjek === 'wilayah' ? 'Polda' : 'Pusat & Wilayah'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Center: Search Satker & Basemap Selector */}
              <div className="hidden lg:flex items-center gap-2 pointer-events-auto max-w-md flex-1 mx-2">
                <div className="relative flex-1 bg-white/95 backdrop-blur-md rounded-xl shadow-lg border border-slate-200/90">
                  <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    id="fullscreen-map-search-satker"
                    type="text"
                    placeholder="Cari Polda, Polres, Mabes..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-8 pr-7 py-1.5 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none rounded-xl"
                  />
                  {searchQuery && (
                    <button 
                      onClick={() => setSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold px-1 cursor-pointer"
                      title="Hapus pencarian"
                    >
                      ✕
                    </button>
                  )}

                  {/* Autocomplete Dropdown in Fullscreen */}
                  {searchQuery.trim().length > 0 && (
                    <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-[1100] max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                        <span>Hasil Pencarian ({filteredSatkers.length})</span>
                        <span className="text-blue-700 font-bold">Fokus ke Satker</span>
                      </div>
                      {filteredSatkers.length === 0 ? (
                        <div className="p-3 text-center text-xs text-slate-500 font-medium">
                          Tidak ditemukan Satker "{searchQuery}"
                        </div>
                      ) : (
                        <div className="mt-1 space-y-1">
                          {filteredSatkers.slice(0, 7).map((satker) => (
                            <button
                              key={satker.id}
                              onClick={() => {
                                if (onSelectSatkerItem) {
                                  onSelectSatkerItem(satker);
                                } else {
                                  if (satker.tingkat === 'Polda') {
                                    onSelectPolda(satker.id);
                                  } else if (satker.parentPoldaId) {
                                    onSelectPolda(satker.parentPoldaId);
                                  }
                                }
                                setSearchQuery('');
                                if (mapInstanceRef.current) {
                                  mapInstanceRef.current.flyTo([satker.lat, satker.lng], 9, { duration: 1.0 });
                                }
                              }}
                              className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-100 transition flex items-center gap-2.5 group cursor-pointer"
                            >
                              <div className="flex-1 min-w-0">
                                <div className="font-bold text-slate-900 group-hover:text-blue-900 truncate">
                                  {satker.nama} ({satker.singkatan})
                                </div>
                                <div className="text-[10px] text-slate-500 truncate">
                                  {satker.tingkat} • {satker.pulau}
                                </div>
                              </div>
                              <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                                satker.status === 'kritis' ? 'bg-rose-100 text-rose-800' :
                                satker.status === 'perhatian' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                              }`}>
                                {satker.status === 'kritis' ? 'Kritis' : satker.status === 'perhatian' ? 'Perhatian' : 'Aman'}
                              </span>
                            </button>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Basemap Switcher in Fullscreen */}
                <div className="relative shrink-0">
                  <button
                    onClick={() => setShowBasemapMenu(!showBasemapMenu)}
                    className="min-h-[34px] px-2.5 bg-white/95 backdrop-blur-md text-slate-800 hover:bg-white rounded-xl shadow-lg border border-slate-200/90 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
                    title="Ganti Mode Peta"
                  >
                    <Layers className="w-3.5 h-3.5 text-[#0B2B5C]" />
                    <span className="text-[11px] text-[#0B2B5C] font-extrabold">{BASEMAP_TILES[basemap].name.split(' ')[0]}</span>
                  </button>
                  {showBasemapMenu && (
                    <div className="absolute top-full left-0 mt-1.5 w-60 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-[1100] animate-in fade-in zoom-in-95 duration-150">
                      <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100">
                        Lapisan Peta
                      </div>
                      <div className="mt-1 space-y-1">
                        {(Object.keys(BASEMAP_TILES) as BasemapStyle[]).map((key) => {
                          const layer = BASEMAP_TILES[key];
                          const isActive = basemap === key;
                          return (
                            <button
                              key={key}
                              onClick={() => {
                                setBasemap(key);
                                setShowBasemapMenu(false);
                              }}
                              className={`w-full text-left p-2 rounded-lg text-xs transition flex items-center justify-between cursor-pointer ${
                                isActive ? 'bg-[#0B2B5C] text-white' : 'hover:bg-slate-100 text-slate-800'
                              }`}
                            >
                              <span className="font-bold">{layer.name}</span>
                              {isActive && <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />}
                            </button>
                          );
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {/* Right Controls: HUD Toggles & Kembali ke Mode Biasa */}
              <div className="flex items-center gap-1.5 sm:gap-2 pointer-events-auto shrink-0 flex-wrap justify-end">
                {/* Toggle Card 1: Indikator KPI */}
                <button
                  onClick={() => setShowKpiCard(prev => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border shadow-lg flex items-center gap-1.5 transition cursor-pointer ${
                    showKpiCard
                      ? 'bg-[#0B2B5C] text-white border-blue-900 ring-2 ring-blue-400/40'
                      : 'bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 border-slate-200/90'
                  }`}
                  title="Tampilkan atau sembunyikan 6 Indikator KPI"
                >
                  <BarChart3 className={`w-3.5 h-3.5 ${showKpiCard ? 'text-amber-400' : 'text-blue-700'}`} />
                  <span className="hidden sm:inline">Indikator KPI</span>
                </button>

                {/* Toggle Card 2: Satker Perlu Atensi */}
                <button
                  onClick={() => setShowCriticalCard(prev => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border shadow-lg flex items-center gap-1.5 transition cursor-pointer ${
                    showCriticalCard
                      ? 'bg-rose-700 text-white border-rose-900 ring-2 ring-rose-400/40'
                      : 'bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 border-slate-200/90'
                  }`}
                  title="Tampilkan Satker Perlu Atensi & Risiko"
                >
                  <AlertTriangle className={`w-3.5 h-3.5 ${showCriticalCard ? 'text-amber-300' : 'text-rose-600'}`} />
                  <span className="hidden md:inline">Atensi &amp; Risiko</span>
                  <span className={`px-1.5 py-0.2 rounded-full text-[10px] font-black ${
                    showCriticalCard ? 'bg-white text-rose-800' : 'bg-rose-100 text-rose-800'
                  }`}>
                    {satkerStatusCounts.kritis + satkerStatusCounts.perhatian}
                  </span>
                </button>

                {/* Toggle Card 3: Legenda Peta */}
                <button
                  onClick={() => setShowLegendCard(prev => !prev)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border shadow-lg flex items-center gap-1.5 transition cursor-pointer ${
                    showLegendCard
                      ? 'bg-slate-800 text-white border-slate-900 ring-2 ring-slate-400/40'
                      : 'bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 border-slate-200/90'
                  }`}
                  title="Tampilkan Legenda Simbol & Rentang Risiko"
                >
                  <Activity className={`w-3.5 h-3.5 ${showLegendCard ? 'text-emerald-400' : 'text-slate-600'}`} />
                  <span className="hidden xl:inline">Legenda</span>
                </button>

                {/* Toggle Heatmap Zona Risiko */}
                <button
                  onClick={() => setShowRiskHeatmap(!showRiskHeatmap)}
                  className={`px-3 py-2 rounded-xl text-xs font-bold border shadow-lg flex items-center gap-1.5 transition cursor-pointer ${
                    showRiskHeatmap
                      ? 'bg-amber-600 text-white border-amber-700 ring-2 ring-amber-400/40'
                      : 'bg-white/95 backdrop-blur-md hover:bg-white text-slate-800 border-slate-200/90'
                  }`}
                  title="Tampilkan Zona Radius Risiko Temuan"
                >
                  <Flame className={`w-3.5 h-3.5 ${showRiskHeatmap ? 'text-amber-200' : 'text-amber-600'}`} />
                  <span className="hidden xl:inline">Zona Risiko</span>
                </button>

                {/* THE USER BUTTON: Kembali ke Mode Biasa */}
                <button
                  id="btn-kembali-ke-mode-biasa"
                  onClick={toggleMaximize}
                  className="min-h-[38px] px-3.5 py-2 rounded-xl bg-gradient-to-r from-[#0B2B5C] to-[#123972] hover:from-[#071D3F] hover:to-[#0B2B5C] text-white text-xs font-black transition-all flex items-center gap-1.5 shadow-xl border border-blue-400/40 cursor-pointer hover:scale-[1.02] active:scale-95 group ring-2 ring-blue-500/20"
                  title="Kembali ke tampilan standar dashboard (Esc)"
                >
                  <Minimize2 className="w-3.5 h-3.5 text-amber-400 group-hover:scale-110 transition-transform" />
                  <span className="tracking-wide">Kembali ke Mode Biasa</span>
                </button>
              </div>
            </div>

            {/* Floating Card 1: Indikator Kondisi Terintegrasi (6 KPI Cards) */}
            {showKpiCard && (
              <div className="absolute top-16 sm:top-18 left-3 right-3 sm:left-4 sm:right-4 z-[1004] max-w-7xl mx-auto pointer-events-auto animate-in fade-in slide-in-from-top-3 duration-200">
                <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 p-3 sm:p-4 space-y-2.5">
                  {/* Header row & interactive quick filter */}
                  <div className="flex items-center justify-between gap-3 text-xs flex-wrap border-b border-slate-100 pb-2">
                    <div className="flex items-center gap-2">
                      <span className="w-2 h-2 rounded-full bg-blue-600 animate-pulse"></span>
                      <span className="font-extrabold text-[11px] text-slate-800 tracking-tight">
                        Indikator Kondisi Terintegrasi
                      </span>
                    </div>
                    {/* Interactive Quick Bidang Selector & Close Button */}
                    <div className="flex items-center gap-2 flex-wrap">
                      <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider hidden md:inline">
                        Saring Bidang:
                      </span>
                      {(['semua', 'opsnal', 'sdm', 'sarpras', 'garkeu'] as const).map((b) => (
                        <button
                          key={b}
                          onClick={() => onSelectBidang?.(b)}
                          className={`px-2.5 py-0.5 rounded-lg text-[11px] font-bold transition cursor-pointer ${
                            activeBidang === b
                              ? 'bg-[#0B2B5C] text-white shadow-xs'
                              : 'bg-slate-100 hover:bg-slate-200 text-slate-700'
                          }`}
                        >
                          {b === 'semua' ? 'Semua' : b === 'opsnal' ? 'Opsnal' : b === 'sdm' ? 'SDM' : b === 'sarpras' ? 'Logistik' : 'Garkeu'}
                        </button>
                      ))}
                      <div className="h-4 w-[1px] bg-slate-200 mx-1 hidden sm:block" />
                      <button
                        onClick={() => setShowKpiCard(false)}
                        className="p-1 text-slate-400 hover:text-slate-700 hover:bg-slate-100 rounded-lg transition cursor-pointer"
                        title="Tutup Card KPI"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* 6 Cards Grid matching image 1 */}
                  <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 sm:gap-2.5">
                    {/* Card 1: SATKER DIAWASI */}
                    <div
                      onClick={() => onSelectBidang?.('semua')}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        activeBidang === 'semua'
                          ? 'bg-blue-50/70 border-[#0B2B5C] ring-2 ring-[#0B2B5C]/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9.5px] font-bold text-slate-500 uppercase tracking-wider">
                          Satker Diawasi
                        </span>
                      </div>
                      <div className="my-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                            {uiConditions.satkerCount}
                          </span>
                          <span className="text-[10px] font-bold text-slate-600">
                            {uiConditions.satkerLabel}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          {uiConditions.satkerSub}
                        </p>
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[9px]">
                        <span className="text-slate-400 font-medium">Data SSOT</span>
                        <span className="text-emerald-700 font-bold">100% Terpantau</span>
                      </div>
                    </div>

                    {/* Card 2: OPERASIONAL (IKU) */}
                    <div
                      onClick={() => onSelectBidang?.('opsnal')}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        activeBidang === 'opsnal'
                          ? 'bg-amber-50/70 border-amber-600 ring-2 ring-amber-500/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9.5px] font-bold text-amber-700 uppercase tracking-wider">
                          Operasional (IKU)
                        </span>
                      </div>
                      <div className="my-0.5">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                            {uiConditions.iku}
                          </span>
                          <span className="text-sm font-black text-amber-600">%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Capaian Sasaran Strategis
                        </p>
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[9px]">
                        <span className="text-slate-400 font-medium">Gakkum &amp; Yanmas</span>
                        <span className="text-amber-700 font-bold">Optimal</span>
                      </div>
                    </div>

                    {/* Card 3: SDM & INTEGRITAS */}
                    <div
                      onClick={() => onSelectBidang?.('sdm')}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        activeBidang === 'sdm'
                          ? 'bg-emerald-50/70 border-emerald-600 ring-2 ring-emerald-500/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9.5px] font-bold text-emerald-700 uppercase tracking-wider">
                          SDM &amp; Integritas
                        </span>
                      </div>
                      <div className="my-0.5">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                            {uiConditions.sdm}
                          </span>
                          <span className="text-sm font-black text-emerald-600">%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Kepatuhan LHKPN &amp; Etik
                        </p>
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[9px]">
                        <span className="text-slate-400 font-medium">Pelanggaran</span>
                        <span className="text-emerald-700 font-bold">Turun 14%</span>
                      </div>
                    </div>

                    {/* Card 4: LOGISTIK & BMN */}
                    <div
                      onClick={() => onSelectBidang?.('sarpras')}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        activeBidang === 'sarpras'
                          ? 'bg-indigo-50/70 border-indigo-600 ring-2 ring-indigo-500/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9.5px] font-bold text-indigo-700 uppercase tracking-wider">
                          Logistik &amp; BMN
                        </span>
                      </div>
                      <div className="my-0.5">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                            {uiConditions.sarpras}
                          </span>
                          <span className="text-sm font-black text-indigo-600">%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Validasi Senpi &amp; Ranmor
                        </p>
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[9px]">
                        <span className="text-slate-400 font-medium">Aset Terdata</span>
                        <span className="text-indigo-600 font-bold">Tervalidasi</span>
                      </div>
                    </div>

                    {/* Card 5: ANGGARAN (GARKEU) */}
                    <div
                      onClick={() => onSelectBidang?.('garkeu')}
                      className={`p-2.5 rounded-xl border transition cursor-pointer flex flex-col justify-between ${
                        activeBidang === 'garkeu'
                          ? 'bg-blue-50/70 border-blue-600 ring-2 ring-blue-500/20 shadow-xs'
                          : 'bg-slate-50/70 border-slate-200/80 hover:bg-slate-100/80'
                      }`}
                    >
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9.5px] font-bold text-blue-700 uppercase tracking-wider">
                          Anggaran (Garkeu)
                        </span>
                      </div>
                      <div className="my-0.5">
                        <div className="flex items-baseline gap-0.5">
                          <span className="text-xl sm:text-2xl font-black text-slate-900 font-mono tracking-tight">
                            {uiConditions.serapan}
                          </span>
                          <span className="text-sm font-black text-blue-600">%</span>
                        </div>
                        <p className="text-[10px] text-slate-500 truncate mt-0.5">
                          Serapan Anggaran &amp; DIPA
                        </p>
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-slate-200/60 flex items-center justify-between text-[9px]">
                        <span className="text-slate-400 font-medium">Akuntabel</span>
                        <span className="text-blue-700 font-bold">WTP</span>
                      </div>
                    </div>

                    {/* Card 6: ATENSI & TLHP */}
                    <div className="p-2.5 rounded-xl border border-rose-200/90 bg-rose-50/70 flex flex-col justify-between">
                      <div className="flex items-center justify-between gap-1 mb-1">
                        <span className="text-[9.5px] font-bold text-rose-700 uppercase tracking-wider">
                          Atensi &amp; TLHP
                        </span>
                      </div>
                      <div className="my-0.5">
                        <div className="flex items-baseline gap-1">
                          <span className="text-xl sm:text-2xl font-black text-rose-700 font-mono tracking-tight">
                            {uiConditions.temuanTerbuka}
                          </span>
                          <span className="text-xs font-bold text-slate-400 font-mono">
                            / {uiConditions.totalTemuan}
                          </span>
                        </div>
                        <p className="text-[10px] text-slate-600 truncate mt-0.5">
                          {uiConditions.tlhpRate}% Rekomendasi Selesai
                        </p>
                      </div>
                      <div className="mt-1.5 pt-1.5 border-t border-rose-200/60 flex items-center justify-between text-[9px]">
                        <span className="text-slate-500 font-medium">Tenggat 60 Hari</span>
                        <span className="text-rose-700 font-bold">Prioritas</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </>
        )}

        {/* Fullscreen Selected Satker Floating Inspector Card */}
        {isMaximized && activeInspectedSatker && (() => {
          const inspectedAtensi = getSatkerAtensiTLHP(activeInspectedSatker);
          return (
            <div className="absolute bottom-16 left-4 z-[1006] max-w-sm w-[calc(100%-32px)] sm:w-88 bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3.5 text-xs animate-in fade-in slide-in-from-bottom-2 duration-150 pointer-events-auto">
              <div className="flex items-start justify-between gap-2">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 p-1 flex items-center justify-center shrink-0 shadow-xs">
                    {activeInspectedSatker.wikiLogoUrl ? (
                      <img 
                        src={activeInspectedSatker.wikiLogoUrl} 
                        alt={activeInspectedSatker.singkatan} 
                        className="w-full h-full object-contain" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <PoldaLogo 
                        poldaId={activeInspectedSatker.id} 
                        poldaSingkatan={activeInspectedSatker.singkatan} 
                        poldaNama={activeInspectedSatker.nama} 
                        size="sm" 
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5">
                      <span className="text-[9px] font-black uppercase px-1.5 py-0.2 rounded bg-blue-50 text-[#0B2B5C] border border-blue-200">
                        {activeInspectedSatker.tingkat || 'Polda'}
                      </span>
                      <span className="text-[10px] text-slate-500 truncate">
                        {activeInspectedSatker.pulau}
                      </span>
                    </div>
                    <h4 className="font-extrabold text-sm text-slate-900 truncate">
                      {activeInspectedSatker.nama}
                    </h4>
                  </div>
                </div>
                <button
                  onClick={() => onSelectPolda('')}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  title="Tutup informasi satker"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Pimpinan & Status Atensi Badge */}
              <div className="mt-2.5 pt-2 border-t border-slate-100 flex items-center justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[9px] text-slate-400 font-bold uppercase tracking-wider block">
                    {activeInspectedSatker.pimpinanJabatan || 'Pimpinan'}
                  </span>
                  <span className="text-[11px] font-bold text-slate-800 truncate block">
                    {activeInspectedSatker.pimpinanNama}
                  </span>
                </div>
                <span className={`px-2 py-0.5 rounded-full text-[10px] font-black shrink-0 ${inspectedAtensi.badgeBg} ${inspectedAtensi.badgeText}`}>
                  {inspectedAtensi.statusAtensiShort}
                </span>
              </div>

              {/* 3 Metric Mini Cards */}
              <div className="grid grid-cols-3 gap-1.5 mt-2.5 text-[10px]">
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-slate-400 block font-semibold text-[9px]">Capaian IKU</span>
                  <span className="font-black text-slate-900 text-xs font-mono">{activeInspectedSatker.capaianIKU}%</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-slate-400 block font-semibold text-[9px]">Temuan</span>
                  <span className="font-black text-rose-600 text-xs font-mono">{activeInspectedSatker.temuanTerbuka} Rek.</span>
                </div>
                <div className="p-2 bg-slate-50 rounded-xl border border-slate-100 text-center">
                  <span className="text-slate-400 block font-semibold text-[9px]">TLHP Selesai</span>
                  <span className="font-black text-emerald-700 text-xs font-mono">{inspectedAtensi.persenTLHP}%</span>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="mt-3 flex items-center gap-1.5">
                <button
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([activeInspectedSatker.lat, activeInspectedSatker.lng], 10, { duration: 1.0 });
                    }
                  }}
                  className="py-1.5 px-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition flex items-center justify-center gap-1 cursor-pointer"
                  title="Fokuskan kamera peta ke satker ini"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span>Fokus</span>
                </button>
                {onOpenDetailDrawer && (
                  <button
                    onClick={() => onOpenDetailDrawer(activeInspectedSatker)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-[#0B2B5C] hover:bg-[#071D3F] text-white text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Buka Lembar Telaah</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>
                )}
              </div>
            </div>
          );
        })()}

        {/* Fullscreen Floating Card 2: Ringkasan Satker Kritis & Atensi Wasrik */}
        {isMaximized && showCriticalCard && (
              <div className={`absolute ${showKpiCard ? 'top-[19rem] sm:top-[18rem]' : 'top-16 sm:top-18'} left-3 sm:left-4 z-[1004] max-w-sm w-[calc(100%-24px)] sm:w-96 max-h-[calc(100vh-140px)] flex flex-col bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200/90 animate-in fade-in slide-in-from-left-3 duration-200 pointer-events-auto`}>
            <div className="p-3 border-b border-slate-100 flex items-center justify-between gap-2">
              <div className="flex items-center gap-2">
                <div className="w-7 h-7 rounded-lg bg-rose-100 text-rose-700 flex items-center justify-center shrink-0">
                  <ShieldAlert className="w-4 h-4" />
                </div>
                <div>
                  <h4 className="font-extrabold text-xs text-slate-900 leading-tight">
                    Satker Perlu Atensi Wasrik
                  </h4>
                  <span className="text-[10px] text-slate-500">
                    {satkerStatusCounts.kritis} Kritis • {satkerStatusCounts.perhatian} Perhatian
                  </span>
                </div>
              </div>
              <button
                onClick={() => setShowCriticalCard(false)}
                className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                title="Tutup Ringkasan Atensi"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Scrollable Satker List */}
            <div className="p-2 space-y-1.5 overflow-y-auto max-h-[360px]">
              {criticalSatkersList.map((satker) => {
                const atensi = getSatkerAtensiTLHP(satker);
                return (
                  <div
                    key={satker.id}
                    onClick={() => {
                      if (onSelectSatkerItem) {
                        onSelectSatkerItem(satker);
                      } else {
                        onSelectPolda(satker.id);
                      }
                      if (mapInstanceRef.current) {
                        mapInstanceRef.current.flyTo([satker.lat, satker.lng], 9, { duration: 1.0 });
                      }
                    }}
                    className="p-2 rounded-xl border border-slate-200/80 bg-slate-50/60 hover:bg-white hover:border-blue-300 hover:shadow-xs transition cursor-pointer flex items-center justify-between gap-2 group"
                  >
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center gap-1.5 mb-0.5">
                        <span className={`w-2 h-2 rounded-full ${satker.status === 'kritis' ? 'bg-rose-500' : 'bg-amber-500'}`} />
                        <span className="font-bold text-xs text-slate-900 group-hover:text-blue-900 truncate">
                          {satker.nama}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-[10px] text-slate-500">
                        <span>{satker.tingkat} • {satker.pulau}</span>
                        <span>• IKU: <strong className="text-slate-800">{satker.capaianIKU}%</strong></span>
                        <span>• TLHP: <strong className="text-emerald-700">{atensi.persenTLHP}%</strong></span>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <span className={`px-1.5 py-0.5 rounded text-[9px] font-black ${atensi.badgeBg} ${atensi.badgeText}`}>
                        {atensi.statusAtensiShort}
                      </span>
                      <span className="block text-[9px] font-mono text-slate-400 mt-0.5">
                        {satker.temuanTerbuka} Rek.
                      </span>
                    </div>
                  </div>
                );
              })}
            </div>

            <div className="p-2.5 bg-slate-50 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 rounded-b-2xl">
              <span>Klik satker untuk fokus peta</span>
              <span className="font-bold text-[#0B2B5C]">{satkerStatusCounts.total} Satker Terdata</span>
            </div>
          </div>
        )}

        {/* Fullscreen Floating Card 3: Legenda Peta & Rentang Risiko */}
        {isMaximized && showLegendCard && (
          <div className="absolute bottom-16 right-3 sm:right-4 z-[1004] max-w-xs w-[calc(100%-24px)] sm:w-80 bg-white/95 backdrop-blur-md p-3.5 rounded-2xl shadow-2xl border border-slate-200/90 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200 pointer-events-auto">
            <div className="font-extrabold text-[11px] text-[#0B2B5C] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Keterangan Satker &amp; Status</span>
              <button
                onClick={() => setShowLegendCard(false)}
                className="text-slate-400 hover:text-slate-600 p-0.5 rounded hover:bg-slate-100 transition cursor-pointer"
                title="Tutup Legenda"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>

            <div className="space-y-2">
              <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center font-bold">
                <div className="py-1 px-1.5 rounded-lg bg-blue-50 border border-blue-200 text-[#0B2B5C]">
                  Polda
                </div>
                <div className="py-1 px-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                  Polres
                </div>
                <div className="py-1 px-1.5 rounded-lg bg-slate-100 border border-slate-200 text-slate-800">
                  Polsek
                </div>
              </div>

              <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Status Atensi &amp; Target TLHP</span>
                  <span className="text-[9px] font-normal text-slate-400">Rentang (1-25)</span>
                </div>
                {MATRIKS_RENTANG_RISIKO.map((matriks) => {
                  const tlhpLabel = matriks.key === 'sangat_tinggi' ? 'TLHP <50%' :
                    matriks.key === 'tinggi' ? 'TLHP 50-69%' :
                    matriks.key === 'sedang' ? 'TLHP 70-84%' :
                    matriks.key === 'rendah' ? 'TLHP 85-94%' : 'TLHP ≥95%';
                  return (
                    <div key={matriks.key} className="flex items-center justify-between gap-1.5 text-[10.5px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shadow-xs ring-1 ring-white shrink-0" 
                          style={{ backgroundColor: matriks.hexCode }}
                        />
                        <span className="text-slate-800 font-semibold truncate">
                          {matriks.label} ({matriks.rentang})
                        </span>
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-500 shrink-0">
                        {tlhpLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Standar Pengawasan: <strong>Itwasum Polri</strong></span>
              <span className="text-[#0B2B5C] font-extrabold">Presisi</span>
            </div>
          </div>
        )}

        {/* Fullscreen Quick Jump Island Tabs at Bottom Center */}
        {isMaximized && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 z-[1003] flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-1.5 pointer-events-auto">
            {(['Semua', 'Sumatera', 'Jawa', 'Kalimantan', 'Sulawesi', 'Bali-Nusa', 'Maluku-Papua'] as const).map((island) => (
              <button
                key={island}
                onClick={() => {
                  setSelectedIsland(island);
                  const bounds = ISLAND_BOUNDS[island];
                  if (bounds && mapInstanceRef.current) {
                    mapInstanceRef.current.fitBounds(bounds, { padding: [40, 40], duration: 1.0 });
                  }
                }}
                className={`px-2.5 py-1 rounded-xl text-xs font-bold transition cursor-pointer ${
                  selectedIsland === island
                    ? 'bg-[#0B2B5C] text-white shadow-xs'
                    : 'hover:bg-slate-100 text-slate-700'
                }`}
              >
                {island}
              </button>
            ))}
          </div>
        )}

        {/* Fullscreen Zoom & Reset Controls at Bottom Right */}
        {isMaximized && (
          <div className="absolute bottom-4 right-4 z-[1003] flex items-center gap-1 bg-white/95 backdrop-blur-md rounded-2xl shadow-xl border border-slate-200/90 p-1 pointer-events-auto">
            <button
              onClick={handleZoomIn}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Perbesar Peta"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <button
              onClick={handleZoomOut}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 rounded-xl transition cursor-pointer"
              title="Perkecil Peta"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <button
              onClick={handleResetZoom}
              className="w-8 h-8 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-[#0B2B5C] rounded-xl transition cursor-pointer"
              title="Reset Peta"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        )}

        {/* Floating Top Controls (Search Satker & Basemap Switcher) - Only in Normal Mode */}
        {!isMaximized && (
        <div className="absolute top-3.5 left-3.5 z-[1000] flex items-center gap-2 max-w-sm sm:max-w-md w-[calc(100%-110px)] sm:w-full">
          {/* Quick Search Satker across Mabes, Polda, and Polres */}
          <div className="relative flex-1 bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90">
            <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              id="map-search-satker"
              type="text"
              placeholder="Cari Satker Mabes, Polda, Polres, Kota..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-9 pr-8 py-2 text-xs text-slate-900 placeholder:text-slate-400 font-medium focus:outline-none rounded-xl"
            />
            {searchQuery && (
              <button 
                onClick={() => setSearchQuery('')}
                className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 text-xs font-bold px-1 cursor-pointer"
                title="Hapus pencarian"
              >
                ✕
              </button>
            )}

            {/* Quick Search Autocomplete Suggestions */}
            {searchQuery.trim().length > 0 && (
              <div className="absolute top-full left-0 right-0 mt-1.5 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-[1100] max-h-72 overflow-y-auto animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2 py-1 text-[10px] font-extrabold text-slate-400 uppercase tracking-wider border-b border-slate-100 flex items-center justify-between">
                  <span>Hasil Pencarian ({filteredSatkers.length})</span>
                  <span className="text-blue-700 font-bold">Fokus ke Satker</span>
                </div>
                {filteredSatkers.length === 0 ? (
                  <div className="p-3 text-center text-xs text-slate-500 font-medium">
                    Tidak ditemukan Satker dengan kata kunci "{searchQuery}"
                  </div>
                ) : (
                  <div className="mt-1 space-y-1">
                    {filteredSatkers.slice(0, 8).map((satker) => {
                      return (
                        <button
                          key={satker.id}
                          onClick={() => {
                            if (onSelectSatkerItem) {
                              onSelectSatkerItem(satker);
                            } else {
                              if (satker.tingkat === 'Polda') {
                                onSelectPolda(satker.id);
                              } else if (satker.parentPoldaId) {
                                onSelectPolda(satker.parentPoldaId);
                              }
                            }
                            setSearchQuery('');
                            if (mapInstanceRef.current) {
                              mapInstanceRef.current.flyTo([satker.lat, satker.lng], 9, { duration: 1.0 });
                            }
                          }}
                          className="w-full text-left p-2 rounded-lg text-xs hover:bg-slate-100 transition flex items-center gap-2.5 group cursor-pointer"
                        >
                          <div className="w-8 h-8 rounded-md bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0 shadow-2xs">
                            {satker.wikiLogoUrl ? (
                              <img 
                                src={satker.wikiLogoUrl} 
                                alt={satker.singkatan} 
                                className="w-full h-full object-contain" 
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <PoldaLogo 
                                poldaId={satker.id} 
                                poldaSingkatan={satker.singkatan} 
                                poldaNama={satker.nama} 
                                size="xs" 
                              />
                            )}
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="font-bold text-slate-900 group-hover:text-blue-900 truncate flex items-center gap-1.5">
                              <span>{satker.nama}</span>
                              <span className="text-[10px] text-slate-400 font-normal">({satker.singkatan})</span>
                            </div>
                            <div className="text-[10px] text-slate-500 truncate flex items-center gap-1">
                              <span className="px-1 py-0.2 rounded bg-slate-100 text-slate-700 font-bold">{satker.tingkat}</span>
                              <span>• {satker.ibukota} • {satker.pulau}</span>
                            </div>
                          </div>
                          <span className={`px-1.5 py-0.5 rounded text-[9px] font-bold ${
                            satker.status === 'kritis' ? 'bg-rose-100 text-rose-800' :
                            satker.status === 'perhatian' ? 'bg-amber-100 text-amber-900' : 'bg-emerald-100 text-emerald-800'
                          }`}>
                            {satker.status === 'kritis' ? 'Kritis' : satker.status === 'perhatian' ? 'Perhatian' : 'Aman'}
                          </span>
                        </button>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Basemap Style Selector Button */}
          <div className="relative">
            <button
              id="btn-basemap-toggle"
              onClick={() => setShowBasemapMenu(!showBasemapMenu)}
              className="min-h-[38px] px-3 bg-white/95 backdrop-blur-md text-slate-800 hover:bg-white rounded-xl shadow-md border border-slate-200/90 font-bold text-xs flex items-center gap-1.5 transition cursor-pointer"
              title="Ganti Lapisan Mode Peta Geografis"
            >
              <Layers className="w-4 h-4 text-[#0B2B5C]" />
              <span className="hidden sm:inline">Mode Peta:</span>
              <span className="text-[#0B2B5C] font-extrabold">{BASEMAP_TILES[basemap].name.split(' ')[0]}</span>
            </button>

            {/* Basemap Dropdown Menu */}
            {showBasemapMenu && (
              <div className="absolute top-full left-0 mt-1.5 w-72 bg-white rounded-xl shadow-2xl border border-slate-200 p-2 z-[1100] animate-in fade-in zoom-in-95 duration-150">
                <div className="px-2.5 py-1.5 text-[11px] font-extrabold text-slate-500 uppercase tracking-wider border-b border-slate-100">
                  Pilih Lapisan Mode Peta
                </div>
                <div className="mt-1 space-y-1">
                  {(Object.keys(BASEMAP_TILES) as BasemapStyle[]).map((key) => {
                    const layer = BASEMAP_TILES[key];
                    const isActive = basemap === key;
                    return (
                      <button
                        key={key}
                        onClick={() => {
                          setBasemap(key);
                          setShowBasemapMenu(false);
                        }}
                        className={`w-full text-left p-2.5 rounded-lg text-xs transition flex items-start justify-between gap-2 cursor-pointer ${
                          isActive 
                            ? 'bg-[#0B2B5C] text-white shadow-xs' 
                            : 'hover:bg-slate-100 text-slate-800'
                        }`}
                      >
                        <div>
                          <div className="font-bold">{layer.name}</div>
                          <div className={`text-[10px] mt-0.5 leading-snug ${isActive ? 'text-blue-100' : 'text-slate-500'}`}>
                            {layer.desc}
                          </div>
                        </div>
                        {isActive && <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />}
                      </button>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Active Jurisdiction Scope Badge */}
          {currentUser && (
            <div className="hidden md:flex items-center gap-1.5 px-3 py-2 bg-[#0B2B5C]/95 text-white backdrop-blur-md rounded-xl shadow-md border border-blue-800 text-xs font-bold whitespace-nowrap">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
              <span>
                {currentUser.level === 'L2' && 'Polda Riau & 12 Polres Jajaran'}
                {currentUser.level === 'L1' && currentUser.titikWilayahId === 'itwil-3' && 'Itwil III: 7 Polda Regional'}
                {currentUser.level === 'L1' && currentUser.titikWilayahId === 'itwil-1' && 'Itwil I: 6 Polda Regional'}
                {currentUser.level === 'L3' && 'Objek Periksa: Polres Kampar'}
                {currentUser.peran === 'pengawas_tim' && 'ST/412: Wasrik Wilayah Polda Riau'}
                {currentUser.level === 'L0' && 'Nasional (34 Polda • 10 Mabes)'}
              </span>
            </div>
          )}
        </div>
        )}

        {/* Floating Right Map Tool Controls (Zoom In, Zoom Out, Reset, Risk Layer, Maximize) - Only in Normal Mode */}
        {!isMaximized && (
        <div className="absolute top-3.5 right-3.5 z-[1000] flex flex-col gap-2">
          {/* Zoom Buttons Group */}
          <div className="bg-white/95 backdrop-blur-md rounded-xl shadow-md border border-slate-200/90 p-1 flex flex-col gap-0.5">
            <button
              id="map-toggle-maximize-floating"
              onClick={toggleMaximize}
              className={`w-9 h-9 flex items-center justify-center rounded-lg transition cursor-pointer ${
                isMaximized ? 'bg-amber-400 text-slate-950 font-black' : 'text-slate-700 hover:bg-slate-100 hover:text-slate-900'
              }`}
              title={isMaximized ? "Keluar Tampilan Penuh (Esc)" : "Tampilan Penuh Peta"}
            >
              {isMaximized ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
            </button>
            <div className="h-[1px] bg-slate-200 mx-1" />
            <button
              id="map-zoom-in"
              onClick={handleZoomIn}
              className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition cursor-pointer"
              title="Perbesar Peta (Zoom In)"
              aria-label="Perbesar Peta"
            >
              <ZoomIn className="w-4 h-4" />
            </button>
            <div className="h-[1px] bg-slate-200 mx-1" />
            <button
              id="map-zoom-out"
              onClick={handleZoomOut}
              className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-slate-900 rounded-lg transition cursor-pointer"
              title="Perkecil Peta (Zoom Out)"
              aria-label="Perkecil Peta"
            >
              <ZoomOut className="w-4 h-4" />
            </button>
            <div className="h-[1px] bg-slate-200 mx-1" />
            <button
              id="map-reset-zoom"
              onClick={handleResetZoom}
              className="w-9 h-9 flex items-center justify-center text-slate-700 hover:bg-slate-100 hover:text-[#0B2B5C] rounded-lg transition cursor-pointer"
              title="Reset Tampilan Seluruh Indonesia"
              aria-label="Reset Tampilan Seluruh Indonesia"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>

          {/* Risk Heatmap Circle Overlay Toggle */}
          <button
            id="btn-toggle-risk-heatmap"
            onClick={() => setShowRiskHeatmap(!showRiskHeatmap)}
            className={`min-h-[38px] px-2.5 bg-white/95 backdrop-blur-md rounded-xl shadow-md border text-xs font-bold flex items-center gap-1.5 transition cursor-pointer ${
              showRiskHeatmap 
                ? 'bg-rose-50 border-rose-300 text-rose-700 shadow-rose-100' 
                : 'border-slate-200/90 text-slate-700 hover:bg-white'
            }`}
            title="Tampilkan Zona Radius Resiko Temuan"
          >
            <Flame className={`w-3.5 h-3.5 ${showRiskHeatmap ? 'text-rose-600' : 'text-slate-400'}`} />
            <span className="hidden sm:inline text-[11px]">Zona Risiko</span>
          </button>
        </div>
        )}

        {/* Floating Interactive Inspector Overlay Card (Selected Satker in Normal Mode) */}
        {!isMaximized && activeInspectedSatker && (() => {
          const satkerToDisplay = activeInspectedSatker;
          const inspectedAtensi = getSatkerAtensiTLHP(satkerToDisplay);

          return (
            <div className="absolute bottom-3.5 left-3.5 z-[1001] max-w-md w-[calc(100%-28px)] sm:w-auto bg-white/95 backdrop-blur-md rounded-2xl shadow-2xl border border-slate-200 p-3.5 sm:p-4 text-xs animate-in fade-in slide-in-from-bottom-3 duration-200">

              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-2.5 min-w-0">
                  <div className={`w-11 h-12 rounded-xl bg-white border-2 ${inspectedAtensi.borderClass} p-1 flex items-center justify-center shrink-0 shadow-xs ring-2 ${inspectedAtensi.ringClass}`}>
                    {satkerToDisplay.wikiLogoUrl ? (
                      <img 
                        src={satkerToDisplay.wikiLogoUrl} 
                        alt={satkerToDisplay.singkatan} 
                        className="w-full h-full object-contain filter drop-shadow-2xs" 
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <PoldaLogo 
                        poldaId={satkerToDisplay.id} 
                        poldaSingkatan={satkerToDisplay.singkatan} 
                        poldaNama={satkerToDisplay.nama} 
                        size="sm" 
                      />
                    )}
                  </div>
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <span className="font-extrabold text-sm text-slate-900 truncate">
                        {satkerToDisplay.nama}
                      </span>
                      <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-[#0B2B5C] text-white">
                        {satkerToDisplay.tingkat}
                      </span>
                    </div>
                    <p className="text-[11px] text-slate-500 truncate mt-0.5">
                      {satkerToDisplay.pimpinanJabatan}: {satkerToDisplay.pimpinanNama.split(',')[0]} • {satkerToDisplay.ibukota}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => onSelectPolda('')}
                  className="text-slate-400 hover:text-slate-600 p-1 rounded-lg hover:bg-slate-100 transition cursor-pointer"
                  title="Tutup Panel Satker"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Status Atensi & TLHP Badge Bar */}
              <div className="mt-2.5 px-2.5 py-1.5 rounded-xl bg-slate-50 border border-slate-200/80 flex items-center justify-between gap-2">
                <div className="flex items-center gap-1.5 min-w-0">
                  <span className={`w-2 h-2 rounded-full ${inspectedAtensi.badgeBg} shrink-0`} />
                  <span className="text-[10px] text-slate-500 font-semibold">Atensi Itwasum:</span>
                  <span className={`px-1.5 py-0.2 rounded text-[9.5px] font-black ${inspectedAtensi.badgeBg} ${inspectedAtensi.badgeText} truncate`}>
                    {inspectedAtensi.statusAtensiShort}
                  </span>
                </div>
                <div className="text-[10px] font-black text-slate-800 shrink-0">
                  TLHP: <span className="text-emerald-700">{inspectedAtensi.persenTLHP}%</span>
                </div>
              </div>

              {/* Quick Metrics Strip */}
              <div className="grid grid-cols-3 gap-1.5 mt-2 text-[10px]">
                <div className="p-1.5 bg-slate-50 rounded-lg text-center">
                  <span className="text-slate-400 block font-semibold">Capaian IKU</span>
                  <span className="font-black text-slate-900 text-xs">{satkerToDisplay.capaianIKU}%</span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg text-center">
                  <span className="text-slate-400 block font-semibold">Temuan Aktif</span>
                  <span className={`font-black text-xs ${satkerToDisplay.temuanTerbuka > 15 ? 'text-red-700' : 'text-slate-900'}`}>
                    {satkerToDisplay.temuanTerbuka}
                  </span>
                </div>
                <div className="p-1.5 bg-slate-50 rounded-lg text-center">
                  <span className="text-slate-400 block font-semibold">Skor Risiko</span>
                  <span className="font-black text-xs block mt-0.5" style={{ color: inspectedAtensi.hexCode }}>
                    {inspectedAtensi.score} / 25
                  </span>
                </div>
              </div>

              {/* Action Bar */}
              <div className="flex items-center gap-2 mt-2.5">
                {onOpenDetailDrawer && (
                  <button
                    onClick={() => onOpenDetailDrawer(satkerToDisplay)}
                    className="flex-1 py-1.5 px-3 rounded-xl bg-[#0B2B5C] hover:bg-blue-900 text-white font-bold text-xs transition flex items-center justify-center gap-1.5 cursor-pointer shadow-xs"
                  >
                    <span>Buka Lembar Wasrik &amp; TLHP</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                )}
                <button
                  onClick={() => {
                    if (mapInstanceRef.current) {
                      mapInstanceRef.current.flyTo([satkerToDisplay.lat, satkerToDisplay.lng], 9, { duration: 1.0 });
                    }
                  }}
                  className="py-1.5 px-3 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
                  title="Fokus Zoom Peta"
                >
                  Fokus
                </button>
              </div>
            </div>
          );
        })()}

        {/* Geographic Jurisdiction & Bounded Territory Tag (Floating Center Bottom) - High Z-Index */}
        <div className="absolute bottom-3.5 left-1/2 -translate-x-1/2 z-[1000] pointer-events-none hidden lg:flex items-center gap-2 bg-slate-950/85 backdrop-blur-md text-white px-3.5 py-1.5 rounded-xl shadow-xl border border-slate-700/80 text-[11px]">
          <span className="font-semibold text-slate-300">Wilayah Hukum:</span>
          <span className="font-bold text-amber-400">Negara Kesatuan Republik Indonesia (NKRI)</span>
          <span className="text-slate-500">|</span>
          <span className="font-mono text-slate-300 text-[10px]">{currentCoordinates.lat}, {currentCoordinates.lng} (Zoom: {currentZoomLevel})</span>
        </div>

        {/* Map Legend Overlay (Keterangan Satker & Logo - Sesuai Status Atensi & TLHP) - High Z-Index */}
        {!isMaximized && (
          <div className="absolute bottom-3.5 right-3.5 z-[1000] bg-white/95 backdrop-blur-md p-3.5 rounded-xl shadow-xl border border-slate-200/90 text-xs max-w-xs hidden sm:block animate-in fade-in slide-in-from-bottom-3 duration-200">
            <div className="font-extrabold text-[11px] text-[#0B2B5C] uppercase tracking-wider mb-2 flex items-center justify-between">
              <span>Keterangan Satker &amp; Status</span>
              <div className="flex items-center gap-1.5">
                <span className="text-[10px] font-bold text-blue-700 bg-blue-50 px-1.5 py-0.5 rounded">
                  {filteredSatkers.length} Satker
                </span>
              </div>
            </div>

            <div className="space-y-2">
              {/* Hierarki Tingkat Satker (Polda, Polres, Polsek) */}
              <div className="grid grid-cols-3 gap-1.5 text-[10px] text-center font-bold">
                <div className="py-1 px-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 shadow-2xs">
                  Polda
                </div>
                <div className="py-1 px-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 shadow-2xs">
                  Polres
                </div>
                <div className="py-1 px-1.5 rounded-lg bg-slate-100 border border-slate-300 text-slate-800 shadow-2xs">
                  Polsek
                </div>
              </div>

              {/* Matriks Status Atensi & TLHP Resmi (Itwasum Polri: 5 Rentang Nilai Risiko) */}
              <div className="pt-2 border-t border-slate-100 space-y-1 text-[11px]">
                <div className="text-[10px] font-extrabold text-slate-400 uppercase tracking-wider mb-1 flex items-center justify-between">
                  <span>Status Atensi &amp; Progres TLHP</span>
                  <span className="text-[9px] font-normal text-slate-400">Rentang (1-25)</span>
                </div>
                {MATRIKS_RENTANG_RISIKO.map((matriks) => {
                  const tlhpLabel = matriks.key === 'sangat_tinggi' ? 'TLHP <50%' :
                    matriks.key === 'tinggi' ? 'TLHP 50-69%' :
                    matriks.key === 'sedang' ? 'TLHP 70-84%' :
                    matriks.key === 'rendah' ? 'TLHP 85-94%' : 'TLHP ≥95%';
                  return (
                    <div key={matriks.key} className="flex items-center justify-between gap-1.5 text-[10.5px]">
                      <div className="flex items-center gap-1.5 min-w-0">
                        <span 
                          className="w-2.5 h-2.5 rounded-full shadow-xs ring-1 ring-white shrink-0" 
                          style={{ backgroundColor: matriks.hexCode }}
                        />
                        <span className="text-slate-800 font-semibold truncate">
                          {matriks.label} ({matriks.rentang})
                        </span>
                      </div>
                      <span className="text-[9.5px] font-bold text-slate-500 shrink-0">
                        {tlhpLabel}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <div className="mt-2.5 pt-2 border-t border-slate-200/80 text-[10px] text-slate-500 flex items-center justify-between">
              <span>Standar Simbol: <strong>Itwasum Polri</strong></span>
              <span className="text-[#0B2B5C] font-extrabold">Logo Resmi</span>
            </div>
          </div>
        )}

      </div>
    </div>
  );
};

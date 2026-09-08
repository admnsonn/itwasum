import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, 
  Search, 
  X
} from 'lucide-react';
import { SatkerMapItem, PoldaSatker, PerluPerhatianItem, SatkerMabesItem, BidangAudit, TingkatObjek } from '../types';
import { 
  ALL_MABES_ITWASUM_MAP_DATA, 
  ALL_SATKER_MABES_MAP_DATA, 
  ALL_COMBINED_SATKERS_DATA,
  ALL_POLRES_MAP_DATA,
  ITWIL_JURISDICTIONS, 
  ItwilJurisdiction 
} from '../data/allSatkersData';
import { MABES_SATKERS_DATA } from '../data/mabesSatkerData';
import { PoldaLogo } from './PoldaLogo';
import { CurrentUserProfile } from '../types';
import { getRoleScopedSatkers } from '../utils/roleScope';
import { ITWIL_POLDA_MAPPING } from '../data/mabesSatkerData';
import { 
  getDefinisiRisikoByScore, 
  getDefinisiRisikoFromLegacy, 
  MATRIKS_RENTANG_RISIKO, 
  TingkatRisikoKey,
  RentangRisikoDef 
} from '../utils/riskRatingUtils';

interface CommandDirectoryPanelProps {
  poldaList: PoldaSatker[];
  urgentItems: PerluPerhatianItem[];
  selectedSatkerId?: string | null;
  onSelectSatkerItem: (item: SatkerMapItem) => void;
  onSelectPolda: (poldaId: string) => void;
  onOpenLogoExplorer?: (satkerId?: string) => void;
  activeBidang?: BidangAudit;
  tingkatObjek?: TingkatObjek;
  activeJenjang?: string;
  currentUser?: CurrentUserProfile;
}

export const CommandDirectoryPanel: React.FC<CommandDirectoryPanelProps> = ({
  poldaList,
  urgentItems,
  selectedSatkerId,
  onSelectSatkerItem,
  onSelectPolda,
  onOpenLogoExplorer,
  activeBidang = 'semua',
  tingkatObjek = 'semua',
  activeJenjang = 'irwasum',
  currentUser
}) => {
  const [mainNavTab, setMainNavTab] = useState<'struktur' | 'atensi'>('struktur');
  const [strukturSubTab, setStrukturSubTab] = useState<'itwil' | 'polda' | 'mabes'>('itwil');
  const [atensiSubFilter, setAtensiSubFilter] = useState<'semua' | TingkatRisikoKey>('semua');
  const [showMatriksRisikoModal, setShowMatriksRisikoModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedItwilId, setSelectedItwilId] = useState<string | null>('itwil-1');

  // React to external Tingkat Objek changes from Poros 3
  useEffect(() => {
    if (tingkatObjek === 'pusat') {
      setMainNavTab('struktur');
      setStrukturSubTab('mabes');
    } else if (tingkatObjek === 'wilayah' || (currentUser?.level === 'L1' && tingkatObjek !== 'pusat')) {
      setMainNavTab('struktur');
      setStrukturSubTab('polda');
    }
  }, [currentUser?.level, tingkatObjek]);

  // Active Itwil
  const activeItwil = useMemo(() => {
    return ITWIL_JURISDICTIONS.find(it => it.id === selectedItwilId) || ITWIL_JURISDICTIONS[0];
  }, [selectedItwilId]);

  // Structure Items List
  const structureItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const allowedPoldaIds = activeJenjang.startsWith('itwil-') && tingkatObjek !== 'pusat'
      ? new Set(ITWIL_POLDA_MAPPING[activeJenjang] || [])
      : null;
    const scopedItems = getRoleScopedSatkers(ALL_COMBINED_SATKERS_DATA, currentUser, activeBidang, tingkatObjek);
    let items = scopedItems.filter((item) => {
      if (!allowedPoldaIds) return true;
      return allowedPoldaIds.has(item.id) || allowedPoldaIds.has(item.parentPoldaId);
    });

    if (strukturSubTab === 'itwil') {
      items = items.filter(s => s.tingkat === 'Itwil');
    } else if (strukturSubTab === 'mabes') {
      items = items.filter(s => ['Mabes', 'Itwasum', 'Biro-Mabes', 'Satker-Mabes'].includes(s.tingkat));
    } else {
      items = items.filter(s => s.tingkat === 'Polda');
    }

    if (!query) return items;

    return items.filter(item => 
      item.nama.toLowerCase().includes(query) ||
      item.singkatan.toLowerCase().includes(query) ||
      item.pimpinanNama.toLowerCase().includes(query) ||
      item.pimpinanJabatan.toLowerCase().includes(query) ||
      (item.wilayahHukum && item.wilayahHukum.toLowerCase().includes(query))
    );
  }, [strukturSubTab, searchQuery, currentUser, activeBidang, tingkatObjek, activeJenjang]);

  // Attention Items List with 5-Tier Risk Matrix (20-25 Sangat Tinggi, 16-19 Tinggi, 12-15 Sedang, 6-11 Rendah, 1-5 Sangat Rendah)
  const attentionItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();

    // Helper to format item with accurate risk scoring
    const formatIssueItem = (raw: {
      id: string;
      nama: string;
      singkatan: string;
      status: string;
      skorRisiko?: number;
      temuanTerbuka: number;
      temuanSelesai: number;
      totalTemuan: number;
      capaianIKU: number;
      pesanKhusus: string;
      tenggat: string;
      isUrgent: boolean;
    }) => {
      const defFromLegacy = getDefinisiRisikoFromLegacy(raw.status);
      const computedScore = raw.skorRisiko || (
        raw.status === 'kritis' ? 24 :
        raw.status === 'tinggi' ? 18 :
        raw.status === 'perhatian' ? 14 :
        raw.status === 'aman' ? 8 : defFromLegacy.minScore
      );
      const risikoDef = getDefinisiRisikoByScore(computedScore);

      return {
        ...raw,
        skorRisiko: computedScore,
        risikoDef
      };
    };

    let items: ReturnType<typeof formatIssueItem>[] = [];

    // 1. Role: L2 Polda Riau (12 Polres + Polda Riau)
    if (currentUser?.level === 'L2' && currentUser.titikWilayahId === 'polda-riau') {
      const riauIssues = [
        {
          id: 'polres-pekanbaru',
          nama: 'Polresta Pekanbaru',
          singkatan: 'Polresta Pekanbaru',
          status: 'sangat_tinggi',
          skorRisiko: 23,
          temuanTerbuka: 12,
          temuanSelesai: 18,
          totalTemuan: 30,
          capaianIKU: 68.4,
          pesanKhusus: 'Atensi PNBP Lalu Lintas & Pertanggungjawaban BBM Operasional',
          tenggat: '7 Hari Kerja',
          isUrgent: true
        },
        {
          id: 'polres-bengkalis',
          nama: 'Polres Bengkalis',
          singkatan: 'Polres Bengkalis',
          status: 'tinggi',
          skorRisiko: 18,
          temuanTerbuka: 7,
          temuanSelesai: 14,
          totalTemuan: 21,
          capaianIKU: 74.2,
          pesanKhusus: 'BMN Kapal Patroli & Pengadaan Logistik Satpolair',
          tenggat: '14 Hari Kerja',
          isUrgent: true
        },
        {
          id: 'polres-indragiri-hilir',
          nama: 'Polres Indragiri Hilir',
          singkatan: 'Polres Inhil',
          status: 'tinggi',
          skorRisiko: 17,
          temuanTerbuka: 6,
          temuanSelesai: 11,
          totalTemuan: 17,
          capaianIKU: 76.5,
          pesanKhusus: 'Pertanggungjawaban Dana Hibah Pemda & SPJ Riil',
          tenggat: '14 Hari Kerja',
          isUrgent: true
        },
        {
          id: 'polres-kampar',
          nama: 'Polres Kampar',
          singkatan: 'Polres Kampar',
          status: 'sedang',
          skorRisiko: 14,
          temuanTerbuka: 4,
          temuanSelesai: 16,
          totalTemuan: 20,
          capaianIKU: 84.1,
          pesanKhusus: 'Inventaris BMN Ranmor Dinas Rusak Berat & Simpan Pinjam Primkoppol',
          tenggat: '14 Hari Kerja',
          isUrgent: false
        },
        {
          id: 'polres-rokan-hilir',
          nama: 'Polres Rokan Hilir',
          singkatan: 'Polres Rohil',
          status: 'sedang',
          skorRisiko: 13,
          temuanTerbuka: 5,
          temuanSelesai: 15,
          totalTemuan: 20,
          capaianIKU: 81.3,
          pesanKhusus: 'Ketertiban Administrasi Blanko Tilang & Sidik Jari',
          tenggat: '21 Hari Kerja',
          isUrgent: false
        },
        {
          id: 'polres-kep-meranti',
          nama: 'Polres Kepulauan Meranti',
          singkatan: 'Polres Meranti',
          status: 'rendah',
          skorRisiko: 9,
          temuanTerbuka: 4,
          temuanSelesai: 12,
          totalTemuan: 16,
          capaianIKU: 82.0,
          pesanKhusus: 'Kelengkapan DIPA Pengamanan Perairan Terluar',
          tenggat: '30 Hari Kerja',
          isUrgent: false
        },
        {
          id: 'polda-riau',
          nama: 'Polda Riau (Satker Mapolda)',
          singkatan: 'Polda Riau',
          status: 'sedang',
          skorRisiko: 12,
          temuanTerbuka: 7,
          temuanSelesai: 38,
          totalTemuan: 45,
          capaianIKU: 86.8,
          pesanKhusus: 'Konsolidasi 45 Temuan Terbuka Jajaran Polda Riau',
          tenggat: '30 Hari Kerja',
          isUrgent: false
        }
      ];
      items = riauIssues.map(formatIssueItem);
    } else if (currentUser?.level === 'L3' && currentUser.titikWilayahId === 'polres-kampar') {
      // 2. Role: L3 Auditee (Polres Kampar 4 Temuan)
      const kamparFindings = [
        {
          id: 'kampar-1',
          nama: 'Garkeu: PNBP Lalu Lintas & Koperasi',
          singkatan: 'Garkeu 01',
          status: 'tinggi',
          skorRisiko: 18,
          temuanTerbuka: 1,
          temuanSelesai: 0,
          totalTemuan: 1,
          capaianIKU: 78.5,
          pesanKhusus: 'Setoran PNBP Simpan Pinjam Primkoppol Rp 142.500.000 menunggu validasi BPK',
          tenggat: '14 Hari Kerja',
          isUrgent: true
        },
        {
          id: 'kampar-2',
          nama: 'Opsnal: Administrasi Blanko Tilang',
          singkatan: 'Opsnal 02',
          status: 'sedang',
          skorRisiko: 14,
          temuanTerbuka: 1,
          temuanSelesai: 0,
          totalTemuan: 1,
          capaianIKU: 82.0,
          pesanKhusus: 'Pencatatan register blanko tilang fisik & Laporan Dumas Presisi triwulan I',
          tenggat: '21 Hari Kerja',
          isUrgent: false
        },
        {
          id: 'kampar-3',
          nama: 'Logistik: BMN Ranmor Dinas Rusak Berat',
          singkatan: 'Log 03',
          status: 'sedang',
          skorRisiko: 13,
          temuanTerbuka: 1,
          temuanSelesai: 0,
          totalTemuan: 1,
          capaianIKU: 85.0,
          pesanKhusus: '4 unit ranmor dinas roda dua rusak berat belum diajukan lelang/usul hapus',
          tenggat: '30 Hari Kerja',
          isUrgent: false
        },
        {
          id: 'kampar-4',
          nama: 'SDM: Disiplin Presensi & Kelengkapan DRH',
          singkatan: 'SDM 04',
          status: 'rendah',
          skorRisiko: 8,
          temuanTerbuka: 1,
          temuanSelesai: 0,
          totalTemuan: 1,
          capaianIKU: 91.0,
          pesanKhusus: 'Pemutakhiran Sistem Informasi Personel Polri (SIPP) 12 anggota Polsek',
          tenggat: '30 Hari Kerja',
          isUrgent: false
        }
      ];
      items = kamparFindings.map(formatIssueItem);
    } else if (currentUser?.peran === 'pengawas_tim') {
      // 3. Role: Pengawas Tim Audit
      const timIssues = [
        {
          id: 'polres-pekanbaru',
          nama: 'Polresta Pekanbaru',
          singkatan: 'Polresta Pekanbaru',
          status: 'sangat_tinggi',
          skorRisiko: 23,
          temuanTerbuka: 5,
          temuanSelesai: 0,
          totalTemuan: 5,
          capaianIKU: 71.0,
          pesanKhusus: 'Audit Lapangan ST/412: 5 Temuan KKA Terbuka (Garkeu & Opsnal)',
          tenggat: '7 Hari Kerja',
          isUrgent: true
        },
        {
          id: 'polres-kampar',
          nama: 'Polres Kampar',
          singkatan: 'Polres Kampar',
          status: 'sedang',
          skorRisiko: 14,
          temuanTerbuka: 4,
          temuanSelesai: 0,
          totalTemuan: 4,
          capaianIKU: 84.1,
          pesanKhusus: 'Audit Lapangan ST/412: 4 Temuan KKA Terbuka (BMN & Garkeu)',
          tenggat: '14 Hari Kerja',
          isUrgent: false
        },
        {
          id: 'polres-bengkalis',
          nama: 'Polres Bengkalis',
          singkatan: 'Polres Bengkalis',
          status: 'tinggi',
          skorRisiko: 18,
          temuanTerbuka: 3,
          temuanSelesai: 0,
          totalTemuan: 3,
          capaianIKU: 74.2,
          pesanKhusus: 'Audit Lapangan ST/412: 3 Temuan KKA Terbuka (Logistik Satpolair)',
          tenggat: '14 Hari Kerja',
          isUrgent: true
        },
        {
          id: 'polres-dumai',
          nama: 'Polres Dumai',
          singkatan: 'Polres Dumai',
          status: 'sedang',
          skorRisiko: 13,
          temuanTerbuka: 2,
          temuanSelesai: 0,
          totalTemuan: 2,
          capaianIKU: 83.0,
          pesanKhusus: 'Audit Lapangan ST/412: 2 Temuan KKA Terbuka (Administrasi Opsnal)',
          tenggat: '21 Hari Kerja',
          isUrgent: false
        }
      ];
      items = timIssues.map(formatIssueItem);
    } else if (tingkatObjek === 'pusat') {
      // 4. Pusat Mabes Satkers
      const mabesWithIssues = MABES_SATKERS_DATA.map(m => {
        const rawStatus = m.temuanTerbuka > 5 ? 'sangat_tinggi' : m.temuanTerbuka > 2 ? 'sedang' : 'rendah';
        const skor = m.temuanTerbuka > 5 ? 22 : m.temuanTerbuka > 2 ? 14 : 7;
        return formatIssueItem({
          id: m.id,
          nama: m.nama,
          singkatan: m.singkatan,
          status: rawStatus,
          skorRisiko: skor,
          temuanTerbuka: m.temuanTerbuka,
          temuanSelesai: 12,
          totalTemuan: m.temuanTerbuka + 12,
          capaianIKU: m.capaianIKU,
          pesanKhusus: m.deskripsi,
          tenggat: '14 Hari Kerja',
          isUrgent: m.temuanTerbuka > 3
        });
      });
      items = mabesWithIssues;
    } else {
      // 5. Default L0 Nasional: All Polda Satkers mapped to 5-tier risk matrix
      const mapped = poldaList.map(p => {
        const urgentMatch = urgentItems.find(u => u.poldaId === p.id);
        const rawStatus = p.status;
        const skor = rawStatus === 'kritis' ? 24 :
                     rawStatus === 'tinggi' ? 18 :
                     rawStatus === 'perhatian' ? 14 : 8;
        return formatIssueItem({
          id: p.id,
          nama: p.nama,
          singkatan: p.singkatan,
          status: rawStatus,
          skorRisiko: skor,
          temuanTerbuka: p.temuanTerbuka,
          temuanSelesai: p.temuanSelesai,
          totalTemuan: p.totalTemuan,
          capaianIKU: p.capaianIKU,
          pesanKhusus: urgentMatch?.pesanManusiawi || p.perhatianKhusus || `${p.temuanTerbuka} temuan pengawasan terbuka`,
          tenggat: urgentMatch?.tenggatWaktu || '30 Hari Kerja',
          isUrgent: !!urgentMatch
        });
      });
      items = mapped;
    }

    const scopedIds = new Set(getRoleScopedSatkers(ALL_COMBINED_SATKERS_DATA, currentUser, activeBidang, tingkatObjek).map(item => item.id));
    if (currentUser && (currentUser.level !== 'L0' || tingkatObjek !== 'semua')) {
      items = items.filter(item => scopedIds.has(item.id));
    }

    // Sort descending by calculated risk score
    items.sort((a, b) => b.skorRisiko - a.skorRisiko || b.temuanTerbuka - a.temuanTerbuka);

    if (!query) return items;

    return items.filter(item => 
      item.nama.toLowerCase().includes(query) ||
      item.singkatan.toLowerCase().includes(query) ||
      item.pesanKhusus.toLowerCase().includes(query)
    );
  }, [poldaList, urgentItems, searchQuery, tingkatObjek, activeBidang, currentUser]);

  const filteredAttentionItems = useMemo(
    () => atensiSubFilter === 'semua'
      ? attentionItems
      : attentionItems.filter(item => item.risikoDef.key === atensiSubFilter),
    [attentionItems, atensiSubFilter]
  );

  // Mabes Items List
  const mabesItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const allowedPoldaIds = activeJenjang.startsWith('itwil-') && tingkatObjek !== 'pusat'
      ? new Set(ITWIL_POLDA_MAPPING[activeJenjang] || [])
      : null;
    const scopedIds = new Set(
      getRoleScopedSatkers(ALL_COMBINED_SATKERS_DATA, currentUser, activeBidang, tingkatObjek)
        .filter(item => !allowedPoldaIds || allowedPoldaIds.has(item.id) || allowedPoldaIds.has(item.parentPoldaId))
        .map(item => item.id)
    );
    let list = tingkatObjek === 'wilayah'
      ? []
      : MABES_SATKERS_DATA.filter(item => scopedIds.has(item.id.replace(/^mabes-/, '')));
    if (activeBidang !== 'semua') {
      const bidang = activeBidang === 'sarpras' ? 'logistik' : activeBidang;
      list = list.filter(m => m.bidangPrioritas.toLowerCase() === bidang);
    }
    if (!query) return list;
    return list.filter(item => 
      item.nama.toLowerCase().includes(query) ||
      item.singkatan.toLowerCase().includes(query) ||
      item.pimpinan.toLowerCase().includes(query) ||
      item.deskripsi.toLowerCase().includes(query)
    );
  }, [activeBidang, activeJenjang, currentUser, searchQuery, tingkatObjek]);

  const hasStructureData = structureItems.length > 0;
  const hasAttentionData = filteredAttentionItems.length > 0;
  const hasMabesData = mabesItems.length > 0;

  const getStructureSubTabCount = (subTab: 'itwil' | 'polda' | 'mabes') => {
    if (subTab === 'mabes') return tingkatObjek === 'wilayah' ? 0 : mabesItems.length;
    const scopedItems = getRoleScopedSatkers(ALL_COMBINED_SATKERS_DATA, currentUser, activeBidang, tingkatObjek);
    if (subTab === 'itwil') return scopedItems.filter(item => item.tingkat === 'Itwil').length;
    return scopedItems.filter(item => item.tingkat === 'Polda').length;
  };

  return (
    <div id="command-directory-panel" className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden flex flex-col">
      
      {/* Top Main Navigation Tabs */}
      <div className="p-3 bg-slate-50 border-b border-slate-200/80">
        <div className="flex items-center justify-between gap-2 mb-2">
          <div>
            <div className="flex items-center gap-1.5">
              <h3 className="font-extrabold text-xs text-[#0B2B5C] uppercase tracking-wider">
                Direktori Komando &amp; Satker
              </h3>
              {tingkatObjek !== 'semua' && (
                <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-amber-500 text-white">
                  {tingkatObjek === 'pusat' ? 'Fokus Mabes' : 'Fokus Wilayah'}
                </span>
              )}
            </div>
            <p className="text-[11px] text-slate-500">
              Navigasi struktur kewilayahan, satker mabes, dan atensi tindak lanjut.
            </p>
          </div>
          <span className="px-2 py-0.5 rounded text-[10px] font-black bg-[#0B2B5C] text-white shrink-0">
            {currentUser?.level === 'L2' && 'Polda Riau & 12 Polres'}
            {currentUser?.level === 'L1' && (currentUser.titikWilayahId === 'itwil-3' ? 'Itwil III (7 Polda)' : 'Itwil I (6 Polda)')}
            {currentUser?.level === 'L3' && 'Auditee Polres Kampar'}
            {currentUser?.peran === 'pengawas_tim' && 'ST/412 (5 Objek Riau)'}
            {(!currentUser || currentUser.level === 'L0') && (tingkatObjek === 'pusat' ? '10 Mabes' : tingkatObjek === 'wilayah' ? '34 Polda' : '34 Polda • 10 Mabes')}
          </span>
        </div>

        {/* Main Segmented Controls - Role Aware */}
        {currentUser && currentUser.level !== 'L0' ? (
          <div className="grid grid-cols-2 gap-1 p-1 bg-white rounded-xl border border-slate-200">
            <button
              disabled={!hasStructureData}
              onClick={() => {
                setMainNavTab('struktur');
                setSearchQuery('');
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition flex items-center justify-center gap-1.5 ${
                mainNavTab === 'struktur'
                  ? 'bg-[#0B2B5C] text-white shadow-xs'
                  : hasStructureData ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer' : 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
              }`}
            >
              <span>
                {currentUser.level === 'L2' && 'Polda & 12 Polres'}
                {currentUser.level === 'L1' && 'Struktur'}
                {currentUser.level === 'L3' && 'Polres & Polsek'}
                {currentUser.peran === 'pengawas_tim' && '5 Objek Audit'}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${mainNavTab === 'struktur' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {structureItems.length}
              </span>
            </button>

            <button
              disabled={!hasAttentionData}
              onClick={() => {
                setMainNavTab('atensi');
                setSearchQuery('');
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition flex items-center justify-center gap-1.5 ${
                mainNavTab === 'atensi'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : hasAttentionData ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer' : 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
              }`}
            >
              <span>
                {currentUser.level === 'L2' && 'Atensi & TLHP Riau'}
                {currentUser.level === 'L1' && 'Atensi & TLHP Wilayah'}
                {currentUser.level === 'L3' && 'Temuan & Sanggah'}
                {currentUser.peran === 'pengawas_tim' && 'KKA Temuan ST/412'}
              </span>
              <span className={`px-1.5 py-0.2 rounded text-[10px] ${mainNavTab === 'atensi' ? 'bg-white/20 text-white' : 'bg-slate-100 text-slate-700'}`}>
                {filteredAttentionItems.length}
              </span>
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-1 p-1 bg-white rounded-xl border border-slate-200">
            <button
              disabled={!hasStructureData}
              onClick={() => {
                setMainNavTab('struktur');
                setSearchQuery('');
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition ${
                mainNavTab === 'struktur'
                  ? 'bg-[#0B2B5C] text-white shadow-xs'
                  : hasStructureData ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer' : 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
              }`}
            >
              Struktur
            </button>

            <button
              disabled={!hasAttentionData}
              onClick={() => {
                setMainNavTab('atensi');
                setSearchQuery('');
              }}
              className={`py-1.5 px-2 rounded-lg text-xs font-bold text-center transition ${
                mainNavTab === 'atensi'
                  ? 'bg-rose-700 text-white shadow-xs'
                  : hasAttentionData ? 'text-slate-600 hover:text-slate-900 hover:bg-slate-50 cursor-pointer' : 'text-slate-300 bg-slate-50 cursor-not-allowed opacity-60'
              }`}
            >
              Atensi &amp; TLHP
            </button>

          </div>
        )}

        {/* Live Search Box */}
        <div className="relative mt-2">
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
          <input
            type="text"
            placeholder={
              mainNavTab === 'struktur'
                ? "Cari polda, polres, pejabat..."
                : mainNavTab === 'atensi'
                ? "Cari satker atensi, masalah..."
                : "Cari satker, pejabat..."
            }
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-8.5 pr-8 py-1.5 bg-white border border-slate-200 rounded-lg text-xs text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-[#0B2B5C]/20 focus:border-[#0B2B5C] transition"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
            >
              <X className="w-3 h-3" />
            </button>
          )}
        </div>

        {/* Sub-Filters based on Active Main Tab (Show only for L0 or when relevant) */}
        {mainNavTab === 'struktur' && (!currentUser || currentUser.level === 'L0') && (
          <div className="flex items-center gap-1.5 mt-2">
            {[
              { id: 'itwil', label: 'Itwil I - V' },
              { id: 'polda', label: '34 Polda' },
              { id: 'mabes', label: 'Itwasum & Mabes' }
            ].map((sub) => (
              <button
                key={sub.id}
                disabled={getStructureSubTabCount(sub.id as 'itwil' | 'polda' | 'mabes') === 0}
                onClick={() => setStrukturSubTab(sub.id as any)}
                className={`py-1 px-2.5 rounded-md text-[11px] font-bold transition ${
                  strukturSubTab === sub.id
                    ? 'bg-slate-800 text-white'
                    : getStructureSubTabCount(sub.id as 'itwil' | 'polda' | 'mabes') > 0
                      ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer'
                      : 'bg-slate-100 text-slate-300 border border-slate-100 cursor-not-allowed'
                }`}
              >
                {sub.label} ({getStructureSubTabCount(sub.id as 'itwil' | 'polda' | 'mabes')})
              </button>
            ))}
          </div>
        )}

        {mainNavTab === 'atensi' && (
          <div className="space-y-2 mt-2">
            <div className="flex items-center justify-between">
              <span className="text-[10px] font-bold uppercase tracking-wider text-slate-500">
                Tingkat Risiko Temuan / TLHP:
              </span>
              <button
                onClick={() => setShowMatriksRisikoModal(!showMatriksRisikoModal)}
                className="text-[10px] font-bold text-[#0B2B5C] hover:underline cursor-pointer flex items-center gap-1"
              >
                {showMatriksRisikoModal ? 'Tutup Matriks' : 'Lihat Matriks Risiko'}
              </button>
            </div>

            {/* Matriks Reference Panel from Pedoman E-Audit */}
            {showMatriksRisikoModal && (
              <div className="p-2.5 bg-slate-50 border border-slate-200 rounded-xl space-y-1.5 animate-in fade-in duration-150">
                <div className="flex items-center justify-between">
                  <h5 className="text-[11px] font-extrabold text-slate-900">
                    Matriks Penetapan Rentang Nilai Risiko
                  </h5>
                  <span className="text-[9px] font-semibold text-slate-500">
                    Acuan Resmi Audit
                  </span>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-[10px] border-collapse">
                    <thead>
                      <tr className="border-b border-slate-200 text-slate-600 bg-slate-100/70">
                        <th className="py-1 px-1.5 font-bold">No</th>
                        <th className="py-1 px-1.5 font-bold">Rentang Nilai</th>
                        <th className="py-1 px-1.5 font-bold">Pernyataan Risiko</th>
                        <th className="py-1 px-1.5 font-bold">Simbol Warna</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100 font-medium">
                      {MATRIKS_RENTANG_RISIKO.map((row) => (
                        <tr key={row.no} className="hover:bg-white/80">
                          <td className="py-1 px-1.5 font-bold text-slate-700">{row.no}</td>
                          <td className="py-1 px-1.5 font-mono font-bold text-slate-800">{row.rentang}</td>
                          <td className="py-1 px-1.5 font-bold text-slate-900">{row.label}</td>
                          <td className="py-1 px-1.5">
                            <span className={`inline-flex items-center gap-1 px-1.5 py-0.2 rounded text-[9px] font-bold border ${row.badgeBg} ${row.badgeText} ${row.badgeBorder}`}>
                              <span className={`w-1.5 h-1.5 rounded-full ${row.dotColor}`} />
                              {row.simbolWarna}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}

            {/* Filter Pills for the 5 Risk Levels */}
            <div className="flex items-center gap-1.5 overflow-x-auto scrollbar-none pb-0.5">
              <button
                disabled={attentionItems.length === 0}
                onClick={() => setAtensiSubFilter('semua')}
                className={`py-1 px-2.5 rounded-lg text-[11px] font-bold transition whitespace-nowrap ${
                  atensiSubFilter === 'semua'
                    ? 'bg-[#0B2B5C] text-white shadow-xs'
                    : attentionItems.length > 0 ? 'bg-white text-slate-600 border border-slate-200 hover:bg-slate-100 cursor-pointer' : 'bg-slate-100 text-slate-300 border border-slate-100 cursor-not-allowed'
                }`}
              >
                Semua ({attentionItems.length})
              </button>

              {MATRIKS_RENTANG_RISIKO.map((def) => {
                const isSelected = atensiSubFilter === def.key;
                    const hasRiskData = attentionItems.some(item => item.risikoDef.key === def.key);
                return (
                  <button
                    key={def.key}
                    disabled={!hasRiskData}
                    onClick={() => setAtensiSubFilter(def.key)}
                    className={`py-1 px-2 rounded-lg text-[11px] font-bold transition whitespace-nowrap flex items-center gap-1.5 border ${
                      isSelected
                        ? `${def.badgeBg} ${def.badgeText} ${def.badgeBorder} shadow-xs`
                        : hasRiskData ? 'bg-white text-slate-700 border-slate-200 hover:bg-slate-50 cursor-pointer' : 'bg-slate-100 text-slate-300 border-slate-100 cursor-not-allowed'
                    }`}
                  >
                    <span className={`w-2 h-2 rounded-full ${def.dotColor}`} />
                    <span>{def.label}</span>
                    <span className="text-[10px] opacity-80">({def.rentang})</span>
                  </button>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Selected Itwil Regional Overview (if in Struktur -> Itwil) */}
      {mainNavTab === 'struktur' && strukturSubTab === 'itwil' && activeItwil && (
        <div className="p-3 bg-slate-50/80 border-b border-slate-200 text-xs space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="font-extrabold text-slate-900 text-xs">
              {activeItwil.nama}
            </span>
            <span className="text-[10px] font-bold text-slate-500">
              {activeItwil.poldaIds.length} Polda Diawasi
            </span>
          </div>
          <p className="text-[11px] text-slate-600 leading-snug">
            {activeItwil.cakupan}
          </p>
          <div className="flex flex-wrap gap-1 pt-1">
            {activeItwil.poldaIds.map((poldaId) => {
              const pItem = ALL_COMBINED_SATKERS_DATA.find(s => s.id === poldaId);
              const isSelected = selectedSatkerId === poldaId;
              return (
                <button
                  key={poldaId}
                  onClick={() => onSelectPolda(poldaId)}
                  className={`px-2 py-0.5 rounded text-[10px] font-bold border transition cursor-pointer ${
                    isSelected
                      ? 'bg-[#0B2B5C] text-white border-[#0B2B5C]'
                      : 'bg-white text-slate-700 border-slate-200 hover:border-[#0B2B5C] hover:text-[#0B2B5C]'
                  }`}
                >
                  {pItem?.singkatan || poldaId.replace('polda-', '').toUpperCase()}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Scrollable Content Container */}
      <div className="p-2.5 space-y-2 max-h-[520px] overflow-y-auto overscroll-contain">
        
        {/* TAB 1: STRUKTUR */}
        {mainNavTab === 'struktur' && (
          <>
            {structureItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada satker yang cocok dengan kata kunci pencarian.
              </div>
            ) : (
              structureItems.map((satker) => {
                const isSelected = selectedSatkerId === satker.id;
                return (
                  <div
                    key={satker.id}
                    onClick={() => {
                      onSelectSatkerItem(satker);
                      if (satker.tingkat === 'Itwil') {
                        setSelectedItwilId(satker.id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border transition-all duration-150 cursor-pointer flex items-center justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-slate-50/90 border-[#0B2B5C] ring-2 ring-[#0B2B5C]/15 shadow-xs'
                        : 'bg-white border-slate-200 hover:border-slate-300 hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <div className="w-8 h-9 rounded-lg bg-slate-50 border border-slate-200 p-0.5 flex items-center justify-center shrink-0">
                        <PoldaLogo 
                          poldaId={satker.id} 
                          poldaSingkatan={satker.singkatan} 
                          poldaNama={satker.nama} 
                          size="sm" 
                        />
                      </div>
                      <div className="min-w-0">
                        <div className="flex items-center gap-1.5">
                          <h4 className="font-extrabold text-xs text-slate-900 truncate">
                            {satker.nama}
                          </h4>
                          <span className="px-1.5 py-0.2 rounded text-[9px] font-black uppercase bg-slate-100 text-slate-700">
                            {satker.tingkat}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-500 truncate mt-0.5">
                          {satker.pimpinanJabatan}: {satker.pimpinanNama.split(',')[0]} • IKU: {satker.capaianIKU}%
                        </p>
                      </div>
                    </div>

                    <ChevronRight className={`w-4 h-4 shrink-0 transition ${isSelected ? 'text-[#0B2B5C]' : 'text-slate-400'}`} />
                  </div>
                );
              })
            )}
          </>
        )}

        {/* TAB 2: ATENSI & PRIORITAS TLHP (5-Tier Risk Matrix) */}
        {mainNavTab === 'atensi' && (
          <>
            {filteredAttentionItems.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-400">
                Tidak ada data atensi atau TLHP yang sesuai dengan tingkat risiko ini.
              </div>
            ) : (
              filteredAttentionItems.map((item) => {
                const isSelected = selectedSatkerId === item.id;
                const risiko = item.risikoDef;

                return (
                  <div
                    key={item.id}
                    onClick={() => {
                      if (tingkatObjek === 'pusat') {
                        if (onOpenLogoExplorer) onOpenLogoExplorer(item.id);
                      } else {
                        onSelectPolda(item.id);
                      }
                    }}
                    className={`p-2.5 rounded-xl border border-slate-200 ${risiko.cardBorderLeft} transition cursor-pointer flex flex-col gap-1.5 ${
                      isSelected ? 'bg-slate-50 shadow-xs ring-1 ring-slate-300' : 'bg-white hover:bg-slate-50/50'
                    }`}
                  >
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2 min-w-0">
                        <PoldaLogo poldaId={item.id} poldaNama={item.nama} size="sm" />
                        <h4 className="font-extrabold text-xs text-slate-900 truncate">
                          {item.nama}
                        </h4>
                      </div>
                      
                      {/* Official Risk Badge */}
                      <span className={`px-2 py-0.5 rounded-md text-[9px] font-bold uppercase tracking-wider shrink-0 border flex items-center gap-1.5 ${risiko.badgeBg} ${risiko.badgeText} ${risiko.badgeBorder}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${risiko.dotColor}`} />
                        <span>{risiko.label}</span>
                        <span className="font-mono text-[9px] opacity-90">({item.skorRisiko})</span>
                      </span>
                    </div>

                    <p className="text-[11px] text-slate-600 line-clamp-2 leading-relaxed">
                      {item.pesanKhusus}
                    </p>

                    {/* Risk parameters & TLHP indicators */}
                    <div className="pt-1.5 border-t border-slate-100 flex items-center justify-between text-[10px] text-slate-500 font-medium flex-wrap gap-y-1">
                      <div className="flex items-center gap-2">
                        <span>Rentang: <strong className="text-slate-800">{risiko.rentang}</strong></span>
                        <span>•</span>
                        <span>Warna: <strong className="text-slate-800">{risiko.simbolWarna}</strong></span>
                      </div>
                      <div className="flex items-center gap-2">
                        <span>Temuan: <strong className={item.temuanTerbuka > 0 ? 'text-red-700 font-bold' : 'text-emerald-700'}>{item.temuanTerbuka}</strong> / {item.totalTemuan}</span>
                        <span>•</span>
                        <span>IKU: <strong className="text-[#0B2B5C]">{item.capaianIKU}%</strong></span>
                      </div>
                    </div>
                  </div>
                );
              })
            )}
          </>
        )}

      </div>

    </div>
  );
};

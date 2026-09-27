import React, { useState, useMemo, useEffect } from 'react';
import { 
  ChevronRight, 
  Search, 
  X
} from 'lucide-react';
import { SatkerMapItem, PoldaSatker, PerluPerhatianItem, SatkerMabesItem, BidangAudit, TingkatObjek, JenjangPengguna } from '../types';
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
  RentangRisikoDef,
  getSatkerAtensiTLHP
} from '../utils/riskRatingUtils';

interface CommandDirectoryPanelProps {
  poldaList: PoldaSatker[];
  urgentItems: PerluPerhatianItem[];
  selectedSatkerId?: string | null;
  onSelectSatkerItem: (item: SatkerMapItem) => void;
  onSelectPolda: (poldaId: string) => void;
  onSelectJenjang?: (jenjang: JenjangPengguna) => void;
  onOpenLogoExplorer?: (satkerId?: string) => void;
  activeBidang?: BidangAudit;
  tingkatObjek?: TingkatObjek;
  activeJenjang?: JenjangPengguna;
  currentUser?: CurrentUserProfile;
}

export const CommandDirectoryPanel: React.FC<CommandDirectoryPanelProps> = ({
  poldaList,
  urgentItems,
  selectedSatkerId,
  onSelectSatkerItem,
  onSelectPolda,
  onSelectJenjang,
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
  const [selectedItwilId, setSelectedItwilId] = useState<string | null>(null);

  useEffect(() => {
    if (activeJenjang?.startsWith('itwil-')) {
      setSelectedItwilId(activeJenjang);
    } else {
      setSelectedItwilId(null);
    }
  }, [activeJenjang]);

  // React to external Tingkat Objek changes from Poros 3
  useEffect(() => {
    if (tingkatObjek === 'pusat') {
      setMainNavTab('struktur');
      setStrukturSubTab('mabes');
    } else if (
      tingkatObjek === 'wilayah' ||
      (currentUser?.level === 'L1' || currentUser?.level === 'L2')
    ) {
      setMainNavTab('struktur');
      setStrukturSubTab('polda');
    }
  }, [currentUser?.level, tingkatObjek]);

  // Active Itwil follows the current global jurisdiction filter
  const activeItwil = useMemo(() => {
    const activeId = activeJenjang?.startsWith('itwil-') ? activeJenjang : selectedItwilId;
    return ITWIL_JURISDICTIONS.find(it => it.id === activeId) || null;
  }, [activeJenjang, selectedItwilId]);

  // Structure Items List
  const structureItems = useMemo(() => {
    const query = searchQuery.trim().toLowerCase();
    const shouldApplyItwilScope = tingkatObjek !== 'pusat';
    const effectiveItwilId = shouldApplyItwilScope && (activeJenjang?.startsWith('itwil-') ? activeJenjang : selectedItwilId);
    const allowedPoldaIds = effectiveItwilId
      ? new Set(ITWIL_POLDA_MAPPING[effectiveItwilId] || [])
      : null;
    const scopedItems = getRoleScopedSatkers(
      ALL_COMBINED_SATKERS_DATA,
      currentUser,
      activeBidang,
      tingkatObjek,
      (effectiveItwilId as JenjangPengguna | undefined) || undefined
    );
    let items = scopedItems.filter((item) => {
      if (!allowedPoldaIds) return true;
      return allowedPoldaIds.has(item.id) || allowedPoldaIds.has(item.parentPoldaId);
    });

    if (tingkatObjek === 'semua') {
      items = items.filter(s =>
        ['Itwil', 'Polda', 'Polrestabes', 'Polresta', 'Polres', 'Mabes', 'Itwasum', 'Biro-Mabes', 'Satker-Mabes'].includes(s.tingkat)
      );
    } else if (strukturSubTab === 'itwil') {
      items = items.filter(s => s.tingkat === 'Itwil');
    } else if (strukturSubTab === 'mabes') {
      items = items.filter(s => ['Mabes', 'Itwasum', 'Biro-Mabes', 'Satker-Mabes'].includes(s.tingkat));
    } else {
      const regionalLevels = currentUser?.level === 'L2'
        ? ['Polda', 'Polrestabes', 'Polresta', 'Polres']
        : ['Polda'];
      items = items.filter(s => regionalLevels.includes(s.tingkat));
    }

    items = [...items].sort((a, b) => {
      const order = { 'Itwil': 0, 'Polda': 1, 'Polrestabes': 2, 'Polresta': 3, 'Polres': 4, 'Mabes': 5, 'Itwasum': 6, 'Biro-Mabes': 7, 'Satker-Mabes': 8 };
      return (order[a.tingkat as keyof typeof order] ?? 99) - (order[b.tingkat as keyof typeof order] ?? 99) || a.nama.localeCompare(b.nama);
    });

    if (!query) return items;

    return items.filter(item => 
      item.nama.toLowerCase().includes(query) ||
      item.singkatan.toLowerCase().includes(query) ||
      item.pimpinanNama.toLowerCase().includes(query) ||
      item.pimpinanJabatan.toLowerCase().includes(query) ||
      (item.wilayahHukum && item.wilayahHukum.toLowerCase().includes(query))
    );
  }, [strukturSubTab, searchQuery, currentUser, activeBidang, tingkatObjek, activeJenjang, selectedItwilId]);

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

    const shouldApplyActiveScope = (!!activeJenjang?.startsWith('itwil-') && tingkatObjek !== 'pusat') || (currentUser && (currentUser.level !== 'L0' || tingkatObjek !== 'semua'));
    const scopedIds = new Set(getRoleScopedSatkers(
      ALL_COMBINED_SATKERS_DATA,
      currentUser,
      activeBidang,
      tingkatObjek,
      activeJenjang as JenjangPengguna
    ).map(item => item.id));
    if (shouldApplyActiveScope) {
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
    const shouldApplyItwilScope = tingkatObjek !== 'pusat';
    const effectiveItwilId = shouldApplyItwilScope && (activeJenjang?.startsWith('itwil-') ? activeJenjang : selectedItwilId);
    const allowedPoldaIds = effectiveItwilId
      ? new Set(ITWIL_POLDA_MAPPING[effectiveItwilId] || [])
      : null;
    const scopedIds = new Set(
      getRoleScopedSatkers(
        ALL_COMBINED_SATKERS_DATA,
        currentUser,
        activeBidang,
        tingkatObjek,
        (effectiveItwilId as JenjangPengguna | undefined) || undefined
      )
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
  }, [activeBidang, activeJenjang, currentUser, searchQuery, tingkatObjek, selectedItwilId]);

  const hasStructureData = structureItems.length > 0;
  const hasAttentionData = filteredAttentionItems.length > 0;
  const hasMabesData = mabesItems.length > 0;

  const getStructureSubTabCount = (subTab: 'itwil' | 'polda' | 'mabes') => {
    if (subTab === 'mabes') return tingkatObjek === 'wilayah' ? 0 : mabesItems.length;
    const scopedItems = getRoleScopedSatkers(
      ALL_COMBINED_SATKERS_DATA,
      currentUser,
      activeBidang,
      tingkatObjek,
      activeJenjang?.startsWith('itwil-') ? activeJenjang as JenjangPengguna : undefined
    );
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
                const atensiInfo = getSatkerAtensiTLHP(satker);
                return (
                  <div
                    key={satker.id}
                    onClick={() => {
                      onSelectSatkerItem(satker);
                      if (satker.tingkat === 'Itwil') {
                        setSelectedItwilId(satker.id);
                        onSelectJenjang?.(satker.id as JenjangPengguna);
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
                      <div className="min-w-0 flex-1">
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
                        <div className="mt-1 flex flex-wrap items-center gap-1.5 text-[9px]">
                          <span className={`px-1.5 py-0.5 rounded border font-bold ${atensiInfo.badgeBg} ${atensiInfo.badgeText} ${atensiInfo.badgeBorder}`}>
                            {atensiInfo.statusAtensiShort}
                          </span>
                          <span className="text-slate-600 font-medium">
                            TLHP {atensiInfo.persenTLHP}%
                          </span>
                        </div>
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

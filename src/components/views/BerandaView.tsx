import React, { useState, useMemo } from 'react';
import { ThreeAxesBar } from '../ThreeAxesBar';
import { ExecutiveIndicatorStrip } from '../ExecutiveIndicatorStrip';
import { CommandDirectoryPanel } from '../CommandDirectoryPanel';
import { AICriticalSatkerAlertCard } from '../AICriticalSatkerAlertCard';
import { IndonesiaMap } from '../IndonesiaMap';
import { TacticalAnalyticsDock } from '../TacticalAnalyticsDock';
import { ExecutiveBottomTicker } from '../ExecutiveBottomTicker';
import { SatkerSlideOver } from '../SatkerSlideOver';
import { MetodologiModal } from '../MetodologiModal';
import { InMemoryDataEditorModal } from '../InMemoryDataEditorModal';
import { DokumenGapsModal } from '../DokumenGapsModal';
import { KPICustomizerModal } from '../KPICustomizerModal';
import { UsulanHakAksesModal } from '../UsulanHakAksesModal';
import { SecurityRejectionModal } from '../SecurityRejectionModal';
import { getRoleScopedPoldas, getRoleScopedSatkers } from '../../utils/roleScope';

import { 
  PoldaSatker, 
  PerluPerhatianItem, 
  MainNavId, 
  SatkerMapItem,
  JenjangPengguna,
  BidangAudit,
  TingkatObjek,
  SimulationOverride,
  CurrentUserProfile
} from '../../types';
import { ALL_COMBINED_SATKERS_DATA, ALL_SATKER_MABES_MAP_DATA } from '../../data/allSatkersData';
import { ITWIL_POLDA_MAPPING, ITWIL_METADATA } from '../../data/mabesSatkerData';

interface BerandaViewProps {
  poldaList: PoldaSatker[];
  urgentItems: PerluPerhatianItem[];
  selectedPoldaId: string | null;
  onSelectPolda: (id: string | null) => void;
  onNavigateToModule: (module: MainNavId, targetPoldaId?: string) => void;
  currentUser?: CurrentUserProfile;
  onOpenRoleSwitcher?: () => void;
  isMapFullscreen?: boolean;
  onToggleMapFullscreen?: () => void;
}

export const BerandaView: React.FC<BerandaViewProps> = ({
  poldaList,
  urgentItems,
  selectedPoldaId,
  onSelectPolda,
  onNavigateToModule,
  currentUser,
  onOpenRoleSwitcher,
  isMapFullscreen = false,
  onToggleMapFullscreen
}) => {
  // 3-Axes State (Poros 1: Jenjang, Poros 2: Bidang, Poros 3: Tingkat Objek)
  const [jenjang, setJenjang] = useState<JenjangPengguna>('irwasum');
  const [bidang, setBidang] = useState<BidangAudit>('semua');
  const [tingkatObjek, setTingkatObjek] = useState<TingkatObjek>('semua');
  const [selectedIsland, setSelectedIsland] = useState<SatkerMapItem['pulau'] | 'Semua'>('Semua');

  // Status map filter
  const [statusFilter, setStatusFilter] = useState<'all' | 'perhatian' | 'audit'>('all');

  // Modals state
  const [metodologiOpen, setMetodologiOpen] = useState(false);
  const [dataEditorOpen, setDataEditorOpen] = useState(false);

  // Document Gaps, KPI Customizer, Usulan Hak Akses, and Security Rejection States
  const [dokumenGapsOpen, setDokumenGapsOpen] = useState(false);
  const [kpiCustomizerOpen, setKpiCustomizerOpen] = useState(false);
  const [usulanHakAksesOpen, setUsulanHakAksesOpen] = useState(false);
  const [securityRejectionOpen, setSecurityRejectionOpen] = useState(false);
  const [securityRejectionReason, setSecurityRejectionReason] = useState<string>('');
  const [securityTargetLevel, setSecurityTargetLevel] = useState<string>('L0 (Mabes)');

  const handleTriggerSecurityRejection = (reason: string, targetLevel: string = 'L0 (Mabes)') => {
    setSecurityRejectionReason(reason);
    setSecurityTargetLevel(targetLevel);
    setSecurityRejectionOpen(true);
  };
  
  // Slide over & Selected item
  const [slideOverOpen, setSlideOverOpen] = useState(false);
  const [selectedSatkerMapItem, setSelectedSatkerMapItem] = useState<SatkerMapItem | null>(null);

  // In-Memory Simulation Overrides (Tito Engine)
  const [simulationOverrides, setSimulationOverrides] = useState<Record<string, SimulationOverride>>({});

  // Reactive Polda List with Simulation Overrides applied
  const simulatedPoldaList = useMemo(() => {
    return poldaList.map(polda => {
      const override = simulationOverrides[polda.id];
      if (!override) return polda;

      return {
        ...polda,
        temuanTerbuka: override.temuanTerbuka ?? polda.temuanTerbuka,
        capaianIKU: override.capaianIKU ?? polda.capaianIKU,
        status: override.status ?? polda.status,
        auditBerjalan: override.auditBerjalan ?? polda.auditBerjalan,
        analisisLanjutan: {
          ...polda.analisisLanjutan,
          rbsScore: override.rbsScore ?? polda.analisisLanjutan?.rbsScore ?? 65
        },
        eProfil: {
          ...polda.eProfil,
          persenSerapan: override.persenSerapan ?? polda.eProfil?.persenSerapan ?? 88.0
        }
      };
    });
  }, [poldaList, simulationOverrides]);

  // Filtered Polda list by Jenjang (if Itwil selected, filter to that Itwil's Polda)
  const displayPoldaList = useMemo(() => {
    const roleScopedPoldaList = getRoleScopedPoldas(simulatedPoldaList, currentUser);
    const roleScopedSatkers = getRoleScopedSatkers(ALL_COMBINED_SATKERS_DATA, currentUser, bidang, tingkatObjek);
    const scopedSatkerIds = new Set(
      roleScopedSatkers
        .filter((satker) => selectedIsland === 'Semua' || satker.pulau === selectedIsland)
        .map((satker) => satker.parentPoldaId || satker.id)
    );
    const scopedPoldaList = roleScopedPoldaList.filter((polda) => scopedSatkerIds.has(polda.id));
    if (jenjang.startsWith('itwil-')) {
      const allowedPoldaIds = ITWIL_POLDA_MAPPING[jenjang] || [];
      return scopedPoldaList.filter(p => allowedPoldaIds.includes(p.id));
    }
    return scopedPoldaList;
  }, [bidang, currentUser, jenjang, selectedIsland, simulatedPoldaList, tingkatObjek]);

  // Selected active Polda
  const selectedPolda = displayPoldaList.find((p) => p.id === selectedPoldaId) || null;
  
  const activeSatkerItem = selectedSatkerMapItem || (selectedPolda ? {
    id: selectedPolda.id,
    nama: selectedPolda.nama,
    singkatan: selectedPolda.singkatan,
    tingkat: 'Polda' as const,
    parentPoldaId: selectedPolda.id,
    parentPoldaNama: selectedPolda.nama,
    pulau: selectedPolda.pulau,
    ibukota: selectedPolda.ibukota,
    lat: selectedPolda.lat,
    lng: selectedPolda.lng,
    status: selectedPolda.status,
    temuanTerbuka: selectedPolda.temuanTerbuka,
    temuanSelesai: selectedPolda.temuanSelesai,
    totalTemuan: selectedPolda.totalTemuan,
    capaianIKU: selectedPolda.capaianIKU,
    targetIKU: selectedPolda.targetIKU,
    dokumenTerkumpul: selectedPolda.dokumenTerkumpul,
    totalDokumen: selectedPolda.totalDokumen,
    auditBerjalan: selectedPolda.auditBerjalan,
    pimpinanNama: selectedPolda.kapolda,
    pimpinanJabatan: 'Kapolda',
    irwasdaOrKasiwas: selectedPolda.irwasda,
    wikiLogoUrl: '',
    wilayahHukum: `Provinsi ${selectedPolda.singkatan}`
  } : null);

  const activeSatkerId = activeSatkerItem?.id || null;

  const handleSelectFromMap = (id: string | null) => {
    onSelectPolda(id);
    if (!id) {
      setSelectedSatkerMapItem(null);
    }
  };

  const handleSelectSatkerItem = (item: SatkerMapItem) => {
    setSelectedSatkerMapItem(item);
    if (item.tingkat === 'Polda') {
      onSelectPolda(item.id);
    } else if (item.parentPoldaId) {
      onSelectPolda(item.parentPoldaId);
    }
  };

  const handleOpenDetailModal = (item?: SatkerMapItem) => {
    if (item) {
      setSelectedSatkerMapItem(item);
      if (item.tingkat === 'Polda') {
        onSelectPolda(item.id);
      } else if (item.parentPoldaId) {
        onSelectPolda(item.parentPoldaId);
      }
    }
    setSlideOverOpen(true);
  };

  return (
    <div id="beranda-view" className={isMapFullscreen ? "w-full h-full overflow-hidden" : "space-y-4"}>

      {/* If an Itwil is specifically selected, show Itwil Leadership Banner */}
      {!isMapFullscreen && jenjang.startsWith('itwil-') && ITWIL_METADATA[jenjang] && (
        <div className="p-3 bg-[#0B2B5C] text-white rounded-2xl border border-blue-800 shadow-xs flex items-center justify-between gap-3 animate-in fade-in">
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2 py-0.5 rounded bg-amber-400 text-slate-950 text-[10px] font-black uppercase">
                {ITWIL_METADATA[jenjang].pangkat}
              </span>
              <h3 className="text-sm font-extrabold text-white">
                {ITWIL_METADATA[jenjang].nama} - {ITWIL_METADATA[jenjang].pimpinan}
              </h3>
            </div>
            <p className="text-xs text-blue-200 mt-0.5">
              {ITWIL_METADATA[jenjang].wilayahDeskripsi}
            </p>
          </div>
          <button
            onClick={() => setJenjang('irwasum')}
            className="px-3 py-1.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition border border-white/20 shrink-0 cursor-pointer"
          >
            Kembali ke Nasional (34 Polda)
          </button>
        </div>
      )}

      {/* Tiga Poros Pengawasan Presisi (Yurisdiksi Wilayah, Bidang Pengawasan, Tingkat Objek) */}
      {!isMapFullscreen && (
        <ThreeAxesBar
          jenjang={jenjang}
          onSelectJenjang={(j) => setJenjang(j)}
          bidang={bidang}
          onSelectBidang={(b) => setBidang(b)}
          tingkatObjek={tingkatObjek}
          onSelectTingkatObjek={(t) => setTingkatObjek(t)}
          currentUser={currentUser}
          onOpenMetodologi={() => setMetodologiOpen(true)}
          onOpenDataEditor={() => setDataEditorOpen(true)}
          onOpenGapsModal={() => setDokumenGapsOpen(true)}
          onOpenKPICustomizer={() => setKpiCustomizerOpen(true)}
          onOpenUsulanModal={() => setUsulanHakAksesOpen(true)}
          onTriggerSecurityRejection={handleTriggerSecurityRejection}
        />
      )}

      {/* Executive Indicator Strip */}
      {!isMapFullscreen && (
        <ExecutiveIndicatorStrip
          poldaList={displayPoldaList}
          activeBidang={bidang}
          onSelectBidang={(b) => setBidang(b)}
          activeJenjang={jenjang}
          tingkatObjek={tingkatObjek}
          activeIsland={selectedIsland}
          currentUser={currentUser}
          onOpenKPICustomizer={() => setKpiCustomizerOpen(true)}
        />
      )}

      {/* Standard Command Center Layout (4 cols Directory / 8 cols Map, Inspection, & Analytics) */}
      <div className={isMapFullscreen ? "w-full h-full" : "grid grid-cols-1 lg:grid-cols-12 gap-4 items-start"}>
        
        {/* Left Console: Direktori Komando, Struktur Itwil, Atensi & Satker Mabes (4 of 12) */}
        {!isMapFullscreen && (
          <div className="lg:col-span-4 space-y-4">
            <CommandDirectoryPanel
              poldaList={displayPoldaList}
              urgentItems={urgentItems}
              selectedSatkerId={activeSatkerId}
              onSelectSatkerItem={handleSelectSatkerItem}
              onSelectPolda={(id) => {
                onSelectPolda(id);
                setSelectedSatkerMapItem(null);
              }}
              activeBidang={bidang}
              tingkatObjek={tingkatObjek}
              activeJenjang={jenjang}
              currentUser={currentUser}
            />
          </div>
        )}

        {/* Right Stage: Tactical Map, Executive Inspection Brief, & Dynamic Analytics Dock (8 of 12) */}
        <div className={isMapFullscreen ? "w-full h-full" : "lg:col-span-8 space-y-4"}>
          
          {/* Executive Inspection Card (Clean Institutional Brief) */}
          {!isMapFullscreen && (
            <AICriticalSatkerAlertCard
              poldaList={displayPoldaList}
              selectedPolda={selectedPolda}
              satkerItem={selectedSatkerMapItem}
              onSelectSatker={(satkerId) => {
                const isPolda = displayPoldaList.some(p => p.id === satkerId);
                if (isPolda) {
                  onSelectPolda(satkerId);
                  setSelectedSatkerMapItem(null);
                } else {
                  const item = ALL_COMBINED_SATKERS_DATA.find(s => s.id === satkerId);
                  if (item) setSelectedSatkerMapItem(item);
                }
              }}
              onOpenDetail={() => handleOpenDetailModal()}
              tingkatObjek={tingkatObjek}
            />
          )}

          {/* Interactive Tactical NKRI Map */}
          <IndonesiaMap
            poldaList={displayPoldaList}
            selectedPoldaId={selectedPoldaId}
            onSelectPolda={handleSelectFromMap}
            selectedSatkerItem={selectedSatkerMapItem}
            onSelectSatkerItem={handleSelectSatkerItem}
            onOpenDetailDrawer={handleOpenDetailModal}
            statusFilter={statusFilter}
            setStatusFilter={setStatusFilter}
            tingkatObjek={tingkatObjek}
            onSelectTingkatObjek={setTingkatObjek}
            selectedIsland={selectedIsland}
            onSelectIsland={setSelectedIsland}
            activeJenjang={jenjang}
            onSelectJenjang={setJenjang}
            currentUser={currentUser}
            activeBidang={bidang}
            onSelectBidang={setBidang}
            onOpenKPICustomizer={() => setKpiCustomizerOpen(true)}
            isMaximized={isMapFullscreen}
            onToggleMaximize={onToggleMapFullscreen}
          />

          {/* Dynamic Tactical Analytics Dock (12-Month Trend & 4 Pillars) */}
          {!isMapFullscreen && (
            <TacticalAnalyticsDock
              poldaList={displayPoldaList}
              selectedPoldaId={selectedPoldaId}
              selectedSatkerItem={selectedSatkerMapItem}
              onSelectPolda={onSelectPolda}
              onSelectSatkerItem={handleSelectSatkerItem}
              onNavigateToModule={onNavigateToModule}
              onOpenDetailDrawer={() => handleOpenDetailModal()}
              activeBidang={bidang}
              onSelectBidang={setBidang}
              tingkatObjek={tingkatObjek}
            />
          )}

        </div>

      </div>

      {/* 4. Live Executive Telemetry Ticker */}
      {!isMapFullscreen && (
        <ExecutiveBottomTicker
          poldaList={displayPoldaList}
          activeBidang={bidang}
          activeJenjang={jenjang}
        />
      )}

      {/* Modals and Slide-Over Drawers */}
      {slideOverOpen && (selectedPolda || selectedSatkerMapItem) && (
        <SatkerSlideOver
          polda={selectedPolda}
          satkerItem={selectedSatkerMapItem}
          isOpen={slideOverOpen}
          onClose={() => setSlideOverOpen(false)}
          onNavigateToModule={onNavigateToModule}
        />
      )}

      <MetodologiModal
        isOpen={metodologiOpen}
        onClose={() => setMetodologiOpen(false)}
      />

      <InMemoryDataEditorModal
        isOpen={dataEditorOpen}
        onClose={() => setDataEditorOpen(false)}
        poldaList={simulatedPoldaList}
        overrides={simulationOverrides}
        onApplyOverrides={(newOv) => setSimulationOverrides(newOv)}
        onResetOverrides={() => setSimulationOverrides({})}
      />

      {/* Modul Gap Analysis & Rekomendasi Dokumen */}
      <DokumenGapsModal
        isOpen={dokumenGapsOpen}
        onClose={() => setDokumenGapsOpen(false)}
        onOpenKPICustomizer={() => {
          setDokumenGapsOpen(false);
          setKpiCustomizerOpen(true);
        }}
        onOpenUsulanModal={() => {
          setDokumenGapsOpen(false);
          setUsulanHakAksesOpen(true);
        }}
      />

      {/* Modal Kustomisasi 6 KPI oleh Pimpinan */}
      <KPICustomizerModal
        isOpen={kpiCustomizerOpen}
        onClose={() => setKpiCustomizerOpen(false)}
      />

      {/* Modal Form Usulan Hak Akses Pengawas */}
      <UsulanHakAksesModal
        isOpen={usulanHakAksesOpen}
        onClose={() => setUsulanHakAksesOpen(false)}
        currentUser={currentUser}
      />

      {/* Modal Intersepsi Keamanan RBAC (Akses Ditolak & Log Audit) */}
      <SecurityRejectionModal
        isOpen={securityRejectionOpen}
        onClose={() => setSecurityRejectionOpen(false)}
        currentUser={currentUser}
        attemptedAction={securityRejectionReason}
        targetLevel={securityTargetLevel}
      />

    </div>
  );
};

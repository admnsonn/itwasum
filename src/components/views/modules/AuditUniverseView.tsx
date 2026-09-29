/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.12 Audit Universe — nav 4-bagian (Ringkasan / Konfigurasi / Pengumpulan & Verifikasi /
 * Risiko & Perencanaan) sesuai mockup Plane dan FSD
 * `plane/b-12-functional-specification-document-fsd-audit-universe.md` (Plan "Align itwasum
 * with Plane BA/SA", todo p1-b12-nav-master/p1-b12-collection/p1-b12-risk). Data Master
 * (4.1-4.4) dipindah sepenuhnya ke sini dari B.9 (lihat redirect `#/b9/data-master` di App.tsx).
 */
import React, { useState } from 'react';
import type { CurrentUserProfile, PoldaSatker } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getModuleSpec, getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { ModuleScreenShell } from './ModuleScreenShell';
import { MasterDataTab, OrganisasiScreen, TipologiScreen, JenisPengawasanScreen, KatalogDaftarTable, TemplateTable } from '../masterData/MasterDataTab';
import { canManageMasterData } from '../../../data/auditUniverse/roleMapping';
import { PermintaanDataScreen } from './auditUniverse/PermintaanDataScreen';
import { PortalSatkerScreen } from './auditUniverse/PortalSatkerScreen';
import { DashboardPortalItwasumScreen } from './auditUniverse/DashboardPortalScreen';
import { VerifikasiBerkasScreen } from './auditUniverse/VerifikasiBerkasScreen';
import { DashboardAuditUniverseScreen } from './auditUniverse/DashboardScreen';
import { ObjekAuditScreen } from './auditUniverse/ObjekAuditScreen';
import { MappingScreen, AturanValidasiScreen } from './auditUniverse/ConfigScreens';
import { RisikoRegisterScreen, RisikoReviewScreen, PrioritasPkptScreen } from './auditUniverse/RisikoScreens';

interface AuditUniverseViewProps {
  currentUser: CurrentUserProfile;
  poldaList: PoldaSatker[];
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

export const AuditUniverseView: React.FC<AuditUniverseViewProps> = ({ currentUser, subPath, onSubPathChange }) => {
  const moduleDef = getModuleById('b12')!;
  const spec = getModuleSpec('b12')!;
  const isAuditeeOnly = currentUser.peran === 'auditee';
  const defaultSlug = isAuditeeOnly ? 'portal-satker' : getDefaultScreenSlug('b12') || spec.screens[0].slug;
  const [rawScreenSlug, ...detailParts] = (subPath || defaultSlug).split('/');
  const activeScreen = isAuditeeOnly ? 'portal-satker' : rawScreenSlug;
  const detailPath = detailParts.join('/') || undefined;
  const navigateDetail = (detail?: string) => onSubPathChange(detail ? `${activeScreen}/${detail}` : activeScreen);

  const [toast, setToast] = useState<string | null>(null);
  const notify = (msg: string) => {
    setToast(msg);
    setTimeout(() => setToast(null), 4000);
  };

  // Auditee (PIC Satker) hanya melihat Portal Satker — sembunyikan Screen lain di ModuleScreenShell
  // dengan membatasi spec.screens yang diteruskan.
  const visibleSpec = isAuditeeOnly ? { ...spec, screens: spec.screens.filter((s) => s.slug === 'portal-satker') } : spec;
  const readOnlyMaster = !canManageMasterData(currentUser);

  return (
    <ModuleScreenShell
      moduleDef={moduleDef}
      groupLabel={MODULE_GROUPS[moduleDef.group].label}
      spec={visibleSpec}
      activeScreen={activeScreen}
      onScreenChange={onSubPathChange}
      hideTabs
    >
      {toast && (
        <div className="mb-3 p-2.5 rounded-[10px] bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-bold">{toast}</div>
      )}

      {/* -- Figma "Portal Satker" (Sidebar grup Figma) -- */}
      {activeScreen === 'dashboard-portal' && <DashboardPortalItwasumScreen />}

      {activeScreen === 'portal-satker' && (
        <PortalSatkerScreen currentUser={currentUser} detailPath={detailPath} onNavigateDetail={navigateDetail} />
      )}

      {activeScreen === 'master-jenis-pengawasan' && <JenisPengawasanScreen readOnly={readOnlyMaster} notify={notify} />}

      {activeScreen === 'master-tipologi' && <TipologiScreen readOnly={readOnlyMaster} notify={notify} />}

      {activeScreen === 'master-katalog' && <KatalogDaftarTable readOnly={readOnlyMaster} notify={notify} />}

      {activeScreen === 'master-template' && <TemplateTable readOnly={readOnlyMaster} notify={notify} />}

      {activeScreen === 'mapping' && <MappingScreen currentUser={currentUser} />}

      {activeScreen === 'penugasan-audit' && (
        <PermintaanDataScreen currentUser={currentUser} detailPath={detailPath} onNavigateDetail={navigateDetail} tipeFilter="Berkala" />
      )}

      {/* -- Plane-only, sidebar grup tambahan "Audit Universe & Risiko" -- */}
      {activeScreen === 'organisasi' && (
        <OrganisasiScreen readOnly={readOnlyMaster} notify={notify} />
      )}

      {activeScreen === 'dashboard' && <DashboardAuditUniverseScreen currentUser={currentUser} />}

      {activeScreen === 'objek-audit' && <ObjekAuditScreen detailPath={detailPath} onNavigateDetail={navigateDetail} />}

      {activeScreen === 'aturan-validasi' && <AturanValidasiScreen currentUser={currentUser} />}

      {activeScreen === 'tambahan-audit' && (
        <PermintaanDataScreen currentUser={currentUser} detailPath={detailPath} onNavigateDetail={navigateDetail} tipeFilter="Tambahan Audit" />
      )}

      {activeScreen === 'verifikasi-berkas' && <VerifikasiBerkasScreen currentUser={currentUser} />}

      {activeScreen === 'risiko-register' && <RisikoRegisterScreen currentUser={currentUser} />}

      {activeScreen === 'risiko-review' && <RisikoReviewScreen currentUser={currentUser} />}

      {activeScreen === 'prioritas-pkpt' && <PrioritasPkptScreen currentUser={currentUser} />}

      {/* -- Rute lama, hanya untuk menampung redirect dari App.tsx (lihat "data-master"/
       * "permintaan-data" di sana) — tidak lagi punya entri Sidebar. -- */}
      {activeScreen === 'data-master' && (
        <MasterDataTab readOnly={readOnlyMaster} subPath={detailPath} onSubPathChange={navigateDetail} notify={notify} />
      )}

      {activeScreen === 'permintaan-data' && (
        <PermintaanDataScreen currentUser={currentUser} detailPath={detailPath} onNavigateDetail={navigateDetail} tipeFilter="Berkala" />
      )}
    </ModuleScreenShell>
  );
};

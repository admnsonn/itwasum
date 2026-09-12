/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Dispatcher tampilan untuk seluruh modul yang TIDAK memiliki `legacyViewId` pada
 * `MODULE_REGISTRY` (modul-modul tersebut dirender langsung oleh App.tsx memakai tampilan
 * lama: BerandaView/PengawasanTemuanView/KinerjaSatkerView/TimAuditorView/PengaturanSistemView).
 *
 * Urutan resolusi:
 *   1. Modul dengan tampilan bespoke (B.1, D, E.5, B.10) -> komponen khusus.
 *   2. Sisanya -> `GenericModuleView` yang didorong oleh `genericModuleData.ts`.
 */

import React from 'react';
import type { CurrentUserProfile, MainNavId, PoldaSatker } from '../../types';
import { getModuleById, MODULE_GROUPS } from '../../config/moduleRegistry';
import { GenericModuleView } from './GenericModuleView';
import { EProfileSatkerView } from './EProfileSatkerView';
import { DeploymentEnvironmentView } from './DeploymentEnvironmentView';
import { ChatItwasumCopilotView } from './ChatItwasumCopilotView';
import { AuditUniverseView } from './modules/AuditUniverseView';
import { PkptBerbasisRisikoView } from './modules/PkptBerbasisRisikoView';
import { PenugasanAuditView } from './modules/PenugasanAuditView';
import { KertasKerjaDigitalView } from './modules/KertasKerjaDigitalView';
import { SpipSatkerView } from './modules/SpipSatkerView';
import { RekomendasiTlhpView } from './modules/RekomendasiTlhpView';
import { MonitoringMaturitasView } from './modules/MonitoringMaturitasView';
import { EarlyWarningView } from './modules/EarlyWarningView';
import { SuratUsulanView } from './modules/SuratUsulanView';
import { EOfficeView } from './modules/EOfficeView';
import { LogAktivitasView } from './modules/LogAktivitasView';
// `AdminOverviewView` (Data Master Terpadu, tab logs lama) tidak lagi dirujuk di sini:
// b10 kini memakai `LogAktivitasView` bespoke; AdminOverviewView tetap dipakai PengaturanSistemView (b9).

interface ModuleRouteViewProps {
  activeNav: MainNavId;
  currentUser: CurrentUserProfile;
  poldaList: PoldaSatker[];
  onSwitchAccount: () => void;
  /** Sub-rute hash (`#/<moduleId>/<subPath>`) diteruskan agar Screen-tab & halaman detail
   *  modul bespoke dapat di-deep-link (Plan bagian 2). */
  subPath?: string;
  onSubPathChange?: (subPath?: string) => void;
}

export const ModuleRouteView: React.FC<ModuleRouteViewProps> = ({
  activeNav,
  currentUser,
  poldaList,
  onSwitchAccount,
  subPath,
  onSubPathChange,
}) => {
  const moduleDef = getModuleById(activeNav);

  if (!moduleDef) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-6 text-center text-sm text-rose-600 font-semibold">
        Modul "{activeNav}" tidak ditemukan pada registry. Silakan kembali ke Beranda.
      </div>
    );
  }

  const handleSubPathChange = onSubPathChange ?? (() => {});

  switch (moduleDef.id) {
    case 'b1':
      return (
        <EProfileSatkerView
          poldaList={poldaList}
          currentUser={currentUser}
          subPath={subPath}
          onSubPathChange={handleSubPathChange}
        />
      );
    case 'd':
      return <DeploymentEnvironmentView />;
    case 'e5':
      return <ChatItwasumCopilotView currentUser={currentUser} />;
    case 'b4':
      return <SuratUsulanView currentUser={currentUser} subPath={subPath} onSubPathChange={handleSubPathChange} />;
    case 'b5':
      return <EOfficeView currentUser={currentUser} subPath={subPath} onSubPathChange={handleSubPathChange} />;
    case 'b8':
      return <SpipSatkerView currentUser={currentUser} poldaList={poldaList} subPath={subPath} onSubPathChange={handleSubPathChange} />;
    case 'b10':
      return <LogAktivitasView currentUser={currentUser} subPath={subPath} onSubPathChange={handleSubPathChange} />;
    case 'b12':
      return <AuditUniverseView currentUser={currentUser} poldaList={poldaList} subPath={subPath} onSubPathChange={handleSubPathChange} />;
    case 'b13':
      return <PkptBerbasisRisikoView currentUser={currentUser} poldaList={poldaList} subPath={subPath} onSubPathChange={handleSubPathChange} />;
    case 'b14':
      return <PenugasanAuditView currentUser={currentUser} subPath={subPath} onSubPathChange={handleSubPathChange} />;
    case 'b15':
      return <KertasKerjaDigitalView currentUser={currentUser} subPath={subPath} onSubPathChange={handleSubPathChange} />;
    case 'b16':
      return <RekomendasiTlhpView currentUser={currentUser} poldaList={poldaList} subPath={subPath} onSubPathChange={handleSubPathChange} />;
    case 'b17':
      return <MonitoringMaturitasView currentUser={currentUser} poldaList={poldaList} subPath={subPath} onSubPathChange={handleSubPathChange} />;
    case 'b18':
      return <EarlyWarningView currentUser={currentUser} poldaList={poldaList} subPath={subPath} onSubPathChange={handleSubPathChange} />;
    default:
      return <GenericModuleView moduleDef={moduleDef} breadcrumbGroupLabel={MODULE_GROUPS[moduleDef.group].label} />;
  }
};

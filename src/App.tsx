/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useCallback, useState } from 'react';
import { Header } from './components/Header';
import { Sidebar } from './components/Sidebar';
import { Footer } from './components/Footer';
import { ModalConfirm } from './components/ModalConfirm';
import { ErrorBoundary } from './components/ErrorBoundary';
import { BerandaView } from './components/views/BerandaView';
import { PengawasanTemuanView } from './components/views/PengawasanTemuanView';
import { KinerjaSatkerView } from './components/views/KinerjaSatkerView';
import { TimAuditorView } from './components/views/TimAuditorView';
import { PengaturanSistemView } from './components/views/PengaturanSistemView';
import { LoginView } from './components/views/LoginView';
import { PengawasTimWorkspaceView } from './components/views/PengawasTimWorkspaceView';
import { AuditeeWorkspaceView } from './components/views/AuditeeWorkspaceView';
import { AdminCommandCenterView } from './components/views/AdminCommandCenterView';
import { EAuditRedirectView } from './components/views/EAuditRedirectView';
import { ModuleRouteView } from './components/views/ModuleRouteView';
import { POLDA_DATA, PERLU_PERHATIAN_ITEMS } from './data/mockData';
import { MainNavId, CurrentUserProfile } from './types';
import { DEFAULT_USER_PROFILE, buildUserProfileFromConfig, PredefinedAccountConfig } from './data/rolesData';
import { Menu } from 'lucide-react';
import { useHashRoute } from './router/useHashRoute';
import { getModuleById, getVisibleModulesForRole, type LegacyViewId } from './config/moduleRegistry';

const TIM_AUDIT_ROLES = ['pengawas_tim', 'ketua_tim', 'auditor', 'auditee'];

export default function App() {
  // Routing berbasis hash (lihat Plan 2 bagian 2.1): setiap modul punya URL stabil (#/<id>)
  // yang bisa di-screenshot sebagai bukti teknis. `setActiveNav` dipertahankan sebagai nama
  // agar seluruh kode lama di bawah (dan komponen anak seperti SatkerSlideOver) tetap kompatibel.
  const [hashRoute, navigateModule] = useHashRoute('beranda');
  const activeNav = hashRoute.moduleId as MainNavId;
  const setActiveNav = useCallback((id: MainNavId) => navigateModule(id), [navigateModule]);
  // `subPath` (mis. '#/b13/skoring-risiko' atau '#/b1/polda-riau') dipakai oleh modul bespoke
  // untuk Screen-tab & halaman detail yang bisa di-deep-link (Plan bagian 2).
  const handleSubPathChange = useCallback(
    (subPath?: string) => navigateModule(activeNav, subPath),
    [navigateModule, activeNav]
  );

  const activeModuleDef = getModuleById(activeNav);
  const legacyTarget: LegacyViewId | undefined =
    activeModuleDef?.legacyViewId ??
    (['beranda', 'pengawasan', 'kinerja', 'auditor', 'pengaturan'].includes(activeNav)
      ? (activeNav as LegacyViewId)
      : undefined);

  const [currentUser, setCurrentUser] = useState<CurrentUserProfile>(DEFAULT_USER_PROFILE);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoginViewOpen, setIsLoginViewOpen] = useState<boolean>(false);
  const [selectedPoldaId, setSelectedPoldaId] = useState<string | null>(null);
  const [targetModulePoldaFilter, setTargetModulePoldaFilter] = useState<string | undefined>(undefined);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [preselectedLoginAccount, setPreselectedLoginAccount] = useState<PredefinedAccountConfig | undefined>(undefined);
  const [isMapFullscreen, setIsMapFullscreen] = useState<boolean>(false);

  const handleSelectPolda = (poldaId: string | null) => {
    setSelectedPoldaId(poldaId);
    if (activeNav !== 'beranda') {
      setActiveNav('beranda');
    }
  };

  const handleNavigateToModule = (module: MainNavId, targetPoldaId?: string) => {
    setActiveNav(module);
    if (targetPoldaId) {
      setTargetModulePoldaFilter(targetPoldaId);
    }
  };

  const handleConfirmLogout = () => {
    setShowLogoutModal(false);
    setIsAuthenticated(false);
    setPreselectedLoginAccount(undefined);
    setIsLoginViewOpen(true);
  };

  // Enforce logout before login: terminate active session and open login view with targeted role
  const handleLogoutAndSwitchToRole = (account?: PredefinedAccountConfig) => {
    setIsAuthenticated(false);
    setPreselectedLoginAccount(account);
    setIsLoginViewOpen(true);
  };

  // Fullscreen Login Screen (Mandatory on entry or upon logging out to switch account)
  if (!isAuthenticated || isLoginViewOpen) {
    return (
      <LoginView
        currentUser={isAuthenticated ? currentUser : undefined}
        targetAccountConfig={preselectedLoginAccount}
        onLoginSuccess={(newProfile) => {
          setCurrentUser(newProfile);
          setIsAuthenticated(true);
          setIsLoginViewOpen(false);
          setPreselectedLoginAccount(undefined);
          
          const visibleModules = getVisibleModulesForRole(newProfile.peran);
          const isCurrentNavValid = visibleModules.some((m) => m.id === activeNav) || activeNav === 'beranda';

          if (!isCurrentNavValid) {
            setActiveNav((visibleModules[0]?.id as MainNavId) || 'beranda');
          }
        }}
        onCancel={isAuthenticated ? () => {
          setIsLoginViewOpen(false);
          setPreselectedLoginAccount(undefined);
        } : undefined}
      />
    );
  }

  return (
    <div className="min-h-screen bg-[#f4f6f8] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
      {/* Top Header Command Bar */}
      {!isMapFullscreen && (
        <Header
          urgentItems={PERLU_PERHATIAN_ITEMS}
          onSelectPolda={handleSelectPolda}
          allPolda={POLDA_DATA}
          onOpenLogoutModal={() => setShowLogoutModal(true)}
          currentUser={currentUser}
          onRequestLogoutAndLoginRole={handleLogoutAndSwitchToRole}
        />
      )}

      {/* Mobile Top Bar to trigger Sidebar drawer */}
      {!isMapFullscreen && (
        <div className="lg:hidden bg-[#0B2B5C] text-white px-4 py-2 flex items-center justify-between">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileSidebarOpen(true)}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-[#143E78] text-white font-bold text-xs flex items-center gap-2"
          >
            <Menu className="w-5 h-5 text-blue-200" />
            <span>Menu Navigasi</span>
          </button>

          <span className="text-xs font-bold text-blue-100 truncate max-w-[200px]">
            {activeModuleDef?.label || 'Menu Navigasi'}
          </span>
        </div>
      )}

      {/* Main Workspace Layout */}
      <div className={`flex-1 flex w-full mx-auto ${isMapFullscreen ? 'max-w-none h-screen overflow-hidden' : 'max-w-[1920px]'}`}>
        
        {/* Left Sidebar (Dynamic & Role-Tailored) */}
        {!isMapFullscreen && (
          <Sidebar
            activeNav={activeNav}
            onSelectNav={(nav) => {
              setActiveNav(nav);
              if (nav === 'pengawasan') {
                setTargetModulePoldaFilter(undefined);
              }
            }}
            onOpenLogoutModal={() => setShowLogoutModal(true)}
            mobileOpen={mobileSidebarOpen}
            setMobileOpen={setMobileSidebarOpen}
            urgentCount={PERLU_PERHATIAN_ITEMS.length}
            currentUser={currentUser}
          />
        )}

        {/* Dynamic Content View Container. `key={activeNav}` membuat ErrorBoundary reset otomatis
            saat pindah rute, sehingga tiap modul punya isolasi kegagalan sendiri ("ErrorBoundary per
            rute" - Plan 2 bagian 2.1). */}
        <main className={`flex-1 min-w-0 ${isMapFullscreen ? 'p-0 h-screen overflow-hidden' : 'p-3 sm:p-5 lg:p-6 xl:p-8 overflow-x-hidden'}`}>
          <ErrorBoundary key={activeNav}>
            {legacyTarget === 'beranda' && (
              currentUser.dapatOverview === 'tanpa_data' ? (
                <AdminCommandCenterView
                  currentUser={currentUser}
                  onNavigateToPengaturan={() => setActiveNav('pengaturan')}
                />
              ) : currentUser.peran === 'pengawas_tim' || currentUser.peran === 'ketua_tim' || currentUser.peran === 'auditor' ? (
                <PengawasTimWorkspaceView
                  currentUser={currentUser}
                  onSelectPolda={handleSelectPolda}
                  poldaList={POLDA_DATA}
                />
              ) : currentUser.peran === 'auditee' ? (
                <AuditeeWorkspaceView
                  currentUser={currentUser}
                  onSelectPolda={handleSelectPolda}
                  poldaList={POLDA_DATA}
                />
              ) : (
                <BerandaView
                  poldaList={POLDA_DATA}
                  urgentItems={PERLU_PERHATIAN_ITEMS}
                  selectedPoldaId={selectedPoldaId}
                  onSelectPolda={setSelectedPoldaId}
                  onNavigateToModule={handleNavigateToModule}
                  currentUser={currentUser}
                  isMapFullscreen={isMapFullscreen}
                  onToggleMapFullscreen={() => setIsMapFullscreen(prev => !prev)}
                />
              )
            )}

            {legacyTarget === 'pengawasan' && (
              // Modul B.14 (Manajemen Penugasan Audit) untuk peran tim audit/auditee diarahkan ke
              // EAuditRedirectView (dikoneksikan kembali dari komponen orphan - Plan 2 bagian 2.1)
              // yang menjelaskan pembatasan akses berbasis Surat Tugas, bukan tabel penugasan admin.
              activeModuleDef?.id === 'b14' && TIM_AUDIT_ROLES.includes(currentUser.peran) ? (
                <EAuditRedirectView currentUser={currentUser} onSwitchAccount={() => setShowLogoutModal(true)} />
              ) : (
                <PengawasanTemuanView
                  poldaList={POLDA_DATA}
                  initialPoldaFilter={targetModulePoldaFilter}
                  currentUser={currentUser}
                  initialTab={activeModuleDef?.legacyTab}
                />
              )
            )}

            {legacyTarget === 'kinerja' && (
              <KinerjaSatkerView
                poldaList={POLDA_DATA}
                currentUser={currentUser}
              />
            )}

            {legacyTarget === 'auditor' && (
              <TimAuditorView
                currentUser={currentUser}
                subPath={hashRoute.subPath}
                onSubPathChange={handleSubPathChange}
              />
            )}

            {legacyTarget === 'pengaturan' && (
              <PengaturanSistemView
                currentUser={currentUser}
                subPath={hashRoute.subPath}
                onSubPathChange={handleSubPathChange}
              />
            )}

            {/* Modul baru (B.4-B.5, B.8, B.10, B.12-B.13, B.15-B.18, seluruh A/C/D/E) tanpa
                legacyViewId, didorong oleh MODULE_REGISTRY -> ModuleRouteView. */}
            {!legacyTarget && (
              <ModuleRouteView
                activeNav={activeNav}
                currentUser={currentUser}
                poldaList={POLDA_DATA}
                onSwitchAccount={() => setShowLogoutModal(true)}
                subPath={hashRoute.subPath}
                onSubPathChange={handleSubPathChange}
              />
            )}
          </ErrorBoundary>
        </main>

      </div>

      {/* Standard Footer with AES-256 Security Indicator */}
      {!isMapFullscreen && <Footer />}

      {/* Logout Confirmation Modal */}
      <ModalConfirm
        isOpen={showLogoutModal}
        title="Keluar dari Sistem Satu Data Itwasum?"
        message="Sesi login Anda akan diakhiri secara aman. Pastikan seluruh berkas e-audit yang sedang disunting telah tersimpan."
        confirmLabel="Ya, Keluar"
        cancelLabel="Batal"
        onConfirm={handleConfirmLogout}
        onCancel={() => setShowLogoutModal(false)}
        isDestructive={true}
      />

    </div>
  );
}

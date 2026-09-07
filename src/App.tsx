/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { Header } from './components/Header';
import { Sidebar, getNavItemsForRole } from './components/Sidebar';
import { Footer } from './components/Footer';
import { ModalConfirm } from './components/ModalConfirm';
import { BerandaView } from './components/views/BerandaView';
import { PengawasanTemuanView } from './components/views/PengawasanTemuanView';
import { KinerjaSatkerView } from './components/views/KinerjaSatkerView';
import { TimAuditorView } from './components/views/TimAuditorView';
import { PengaturanSistemView } from './components/views/PengaturanSistemView';
import { LoginView } from './components/views/LoginView';
import { PengawasTimWorkspaceView } from './components/views/PengawasTimWorkspaceView';
import { AuditeeWorkspaceView } from './components/views/AuditeeWorkspaceView';
import { AdminCommandCenterView } from './components/views/AdminCommandCenterView';
import { POLDA_DATA, PERLU_PERHATIAN_ITEMS } from './data/mockData';
import { MainNavId, CurrentUserProfile } from './types';
import { DEFAULT_USER_PROFILE, buildUserProfileFromConfig, PredefinedAccountConfig } from './data/rolesData';
import { Menu, ShieldAlert, KeyRound, ArrowLeftRight, UserCheck } from 'lucide-react';

export default function App() {
  const [activeNav, setActiveNav] = useState<MainNavId>('beranda');
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
          
          const validNavItems = getNavItemsForRole(newProfile, PERLU_PERHATIAN_ITEMS.length);
          const isCurrentNavValid = validNavItems.some(item => item.id === activeNav);
          
          if (!isCurrentNavValid) {
            setActiveNav(validNavItems[0].id);
          } else if (newProfile.peran === 'super_admin' || newProfile.peran === 'admin_polda') {
            if (activeNav === 'pengawasan' || activeNav === 'kinerja' || activeNav === 'auditor') {
              setActiveNav('pengaturan');
            }
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
            {getNavItemsForRole(currentUser, PERLU_PERHATIAN_ITEMS.length).find(n => n.id === activeNav)?.label || 'Menu Navigasi'}
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

        {/* Dynamic Content View Container */}
        <main className={`flex-1 min-w-0 ${isMapFullscreen ? 'p-0 h-screen overflow-hidden' : 'p-3 sm:p-5 lg:p-6 xl:p-8 overflow-x-hidden'}`}>
          
          {activeNav === 'beranda' && (
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

          {activeNav === 'pengawasan' && (
            <PengawasanTemuanView
              poldaList={POLDA_DATA}
              initialPoldaFilter={targetModulePoldaFilter}
              currentUser={currentUser}
            />
          )}

          {activeNav === 'kinerja' && (
            <KinerjaSatkerView
              poldaList={POLDA_DATA}
            />
          )}

          {activeNav === 'auditor' && (
            <TimAuditorView currentUser={currentUser} />
          )}

          {activeNav === 'pengaturan' && (
            <PengaturanSistemView currentUser={currentUser} />
          )}

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

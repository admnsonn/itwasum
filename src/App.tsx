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
import { Menu, Shield, ArrowRight, ShieldAlert, KeyRound, ArrowLeftRight, UserCheck } from 'lucide-react';

export default function App() {
  const [activeNav, setActiveNav] = useState<MainNavId>('beranda');
  const [currentUser, setCurrentUser] = useState<CurrentUserProfile>(DEFAULT_USER_PROFILE);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [isLoginViewOpen, setIsLoginViewOpen] = useState<boolean>(false);
  const [selectedPoldaId, setSelectedPoldaId] = useState<string | null>(null);
  const [targetModulePoldaFilter, setTargetModulePoldaFilter] = useState<string | undefined>(undefined);
  const [mobileSidebarOpen, setMobileSidebarOpen] = useState(false);
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [isLoggedOut, setIsLoggedOut] = useState(false);
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
    setIsLoggedOut(true);
  };

  const handleRelogin = () => {
    setIsLoggedOut(false);
    setIsAuthenticated(false);
    setPreselectedLoginAccount(undefined);
    setIsLoginViewOpen(true);
  };

  // Enforce logout before login: terminate active session and open login view with targeted role
  const handleLogoutAndSwitchToRole = (account?: PredefinedAccountConfig) => {
    setIsAuthenticated(false);
    setIsLoggedOut(false);
    setPreselectedLoginAccount(account);
    setIsLoginViewOpen(true);
  };

  // Logged-out safety screen
  if (isLoggedOut) {
    return (
      <div className="min-h-screen bg-[#F5F6FA] flex items-center justify-center p-4">
        <div className="w-full max-w-md bg-white rounded-3xl p-8 border border-slate-200 shadow-xl text-center space-y-5 animate-in fade-in zoom-in-95">
          <div className="w-20 h-20 rounded-2xl bg-white p-2 border border-slate-200 mx-auto flex items-center justify-center shadow-lg overflow-hidden">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/71/Inspektorat_Pengawasan_Umum_POLRI.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original" 
              alt="Logo Itwasum POLRI" 
              className="w-full h-full object-contain filter drop-shadow-xs"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div className="w-full h-full rounded-xl bg-gradient-to-br from-[#0B2B5C] to-blue-900 items-center justify-center text-amber-400" style={{ display: 'none' }}>
              <Shield className="w-8 h-8 stroke-[2.2]" />
            </div>
          </div>

          <div>
            <h2 className="text-2xl font-black text-[#0B2B5C] tracking-tight">
              Satu Data Itwasum Polri
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Anda telah keluar dengan aman dari sesi pengawasan.
            </p>
          </div>

          <div className="p-4 bg-slate-50 rounded-2xl border border-slate-200 text-xs text-slate-600 text-left space-y-1.5">
            <div><strong>Pengguna:</strong> {currentUser.nama}</div>
            <div><strong>NRP / Jabatan:</strong> {currentUser.nrp} &bull; {currentUser.sebutanPimpinan}</div>
            <div><strong>Peran &amp; Level:</strong> {currentUser.peranLabel}</div>
            <div><strong>Status Sesi:</strong> Selesai &amp; Terverifikasi Mabes Polri</div>
          </div>

          <div className="flex flex-col gap-2 pt-2">
            <button
              onClick={handleRelogin}
              className="w-full min-h-[46px] py-2.5 rounded-2xl bg-[#0B2B5C] hover:bg-blue-900 text-white font-bold text-sm shadow-md flex items-center justify-center gap-2 transition cursor-pointer"
            >
              <span>Masuk Kembali ke Sesi</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    );
  }

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
          setIsLoggedOut(false);
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
    <div className="min-h-screen bg-[#F5F6FA] text-slate-800 flex flex-col font-['Plus_Jakarta_Sans',sans-serif]">
      
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
        <div className="lg:hidden bg-white px-4 py-2.5 border-b border-slate-200 flex items-center justify-between shadow-2xs">
          <button
            id="mobile-menu-toggle-btn"
            onClick={() => setMobileSidebarOpen(true)}
            className="min-h-[44px] px-3 py-2 rounded-xl bg-slate-100 text-slate-800 font-bold text-xs flex items-center gap-2"
          >
            <Menu className="w-5 h-5 text-[#0B2B5C]" />
            <span>Menu Navigasi</span>
          </button>

          <span className="text-xs font-bold text-[#0B2B5C] truncate max-w-[200px]">
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
        <main className={`flex-1 min-w-0 ${isMapFullscreen ? 'p-0 h-screen overflow-hidden' : 'p-3 sm:p-5 lg:p-6 overflow-x-hidden'}`}>
          
          {activeNav === 'beranda' && (
            currentUser.dapatOverview === 'tanpa_data' ? (
              <AdminCommandCenterView
                currentUser={currentUser}
                onNavigateToPengaturan={() => setActiveNav('pengaturan')}
              />
            ) : currentUser.peran === 'pengawas_tim' ? (
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

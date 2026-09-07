import React, { useState, useEffect, useRef } from 'react';
import { Shield, Bell, CheckCircle2, ChevronDown, User, LogOut, Search, X, Check, ExternalLink, RefreshCw, Users, Key, Lock, ShieldAlert, ArrowRight } from 'lucide-react';
import { PerluPerhatianItem, PoldaSatker, CurrentUserProfile } from '../types';
import { PoldaLogo } from './PoldaLogo';
import { PREDEFINED_ROLES_ACCOUNTS, PredefinedAccountConfig } from '../data/rolesData';
import auditorProfileImg from '../assets/images/auditor_profile_1787852939070.jpg';

interface HeaderProps {
  urgentItems: PerluPerhatianItem[];
  onSelectPolda: (poldaId: string) => void;
  allPolda: PoldaSatker[];
  onOpenLogoutModal: () => void;
  currentUser?: CurrentUserProfile;
  onRequestLogoutAndLoginRole?: (account?: PredefinedAccountConfig) => void;
  onOpenRoleSwitcher?: () => void;
  onSwitchAccount?: (account: PredefinedAccountConfig) => void;
}

export const Header: React.FC<HeaderProps> = ({
  urgentItems,
  onSelectPolda,
  allPolda,
  onOpenLogoutModal,
  currentUser,
  onRequestLogoutAndLoginRole,
  onOpenRoleSwitcher,
  onSwitchAccount
}) => {
  const [showNotifications, setShowNotifications] = useState(false);
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [accountToSwitchConfirm, setAccountToSwitchConfirm] = useState<PredefinedAccountConfig | null>(null);
  const [showLogoutLoginGeneralConfirm, setShowLogoutLoginGeneralConfirm] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const searchInputRef = useRef<HTMLInputElement>(null);

  // Keyboard shortcut (Ctrl+K or Cmd+K) to focus search
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInputRef.current?.focus();
      }
      if (e.key === 'Escape') {
        setShowSearchDropdown(false);
        setShowNotifications(false);
        setShowUserMenu(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const filteredPolda = searchQuery.trim()
    ? allPolda.filter(p => 
        p.nama.toLowerCase().includes(searchQuery.toLowerCase()) || 
        p.singkatan.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.ibukota.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  return (
    <header id="main-header" className="sticky top-0 z-40 bg-[#0B2B5C] text-white border-b border-[#143B73] shadow-xs">
      <div className="max-w-[1920px] mx-auto px-4 sm:px-6 lg:px-8 h-14 flex items-center justify-between gap-4">
        
        {/* Brand & Identity Lockup */}
        <div className="flex items-center gap-3 min-w-fit">
          <div className="w-9 h-9 rounded-lg bg-white p-1 flex items-center justify-center shrink-0 border border-slate-200">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/71/Inspektorat_Pengawasan_Umum_POLRI.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original" 
              alt="Logo Itwasum POLRI" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div className="w-full h-full rounded-md bg-[#0B2B5C] items-center justify-center text-amber-400" style={{ display: 'none' }}>
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
                <span className="font-extrabold text-base sm:text-lg tracking-tight text-white leading-tight">
                SATU DATA ITWASUM
              </span>
                <span className="hidden sm:inline-block px-2 py-0.5 rounded text-[10px] font-bold bg-[#143E78] text-blue-200 border border-blue-600/40">
                PRESISI
              </span>
            </div>
            <p className="text-[11px] text-blue-200/80 font-medium">
              Sistem Informasi Pengawasan Terpadu • Mabes Polri
            </p>
          </div>
        </div>

        {/* Global Quick Search */}
        <div className="hidden lg:block relative flex-1 max-w-md mx-4">
          <div className="relative">
            <Search className="w-4 h-4 text-blue-300 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input
              ref={searchInputRef}
              id="global-search-input"
              type="text"
              placeholder="Cari Satker / Polda / Wilayah..."
              value={searchQuery}
              onChange={(e) => {
                setSearchQuery(e.target.value);
                setShowSearchDropdown(true);
              }}
              onFocus={() => setShowSearchDropdown(true)}
              className="w-full pl-10 pr-16 py-2 bg-[#071F42] border border-[#1B437B] rounded-xl text-xs text-white placeholder-blue-300/60 focus:outline-none focus:ring-1.5 focus:ring-amber-400 focus:border-amber-400 transition"
            />
            
            <div className="absolute right-2.5 top-1/2 -translate-y-1/2 flex items-center gap-1.5">
              {searchQuery ? (
                <button 
                  onClick={() => setSearchQuery('')}
                  className="p-1 text-blue-300 hover:text-white rounded"
                  aria-label="Hapus pencarian"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              ) : (
                <kbd className="hidden xl:inline-block px-1.5 py-0.5 text-[10px] font-mono text-blue-300/70 bg-blue-900/50 rounded border border-blue-700/50">
                  ⌘K
                </kbd>
              )}
            </div>
          </div>

          {/* Quick Search Results Dropdown */}
          {showSearchDropdown && filteredPolda.length > 0 && (
            <div className="absolute top-full mt-1.5 w-full bg-white text-slate-800 rounded-xl shadow-xl border border-slate-200 overflow-hidden z-50 animate-in fade-in slide-in-from-top-1">
              <div className="px-3 py-2 bg-slate-50 border-b border-slate-100 text-[11px] font-bold text-slate-500 uppercase tracking-wider flex items-center justify-between">
                <span>Hasil Pencarian</span>
                <span>{filteredPolda.length} Satker</span>
              </div>
              <div className="max-h-64 overflow-y-auto">
                {filteredPolda.map((polda) => (
                  <button
                    key={polda.id}
                    onClick={() => {
                      onSelectPolda(polda.id);
                      setShowSearchDropdown(false);
                      setSearchQuery('');
                    }}
                    className="w-full px-3.5 py-2.5 text-left hover:bg-blue-50/80 flex items-center justify-between border-b border-slate-100 transition gap-3"
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <PoldaLogo 
                        poldaId={polda.id} 
                        poldaSingkatan={polda.singkatan} 
                        poldaNama={polda.nama} 
                        size="xs" 
                      />
                      <div className="min-w-0">
                        <div className="font-bold text-xs text-slate-900 truncate">{polda.nama}</div>
                        <div className="text-[11px] text-slate-500">{polda.pulau} • {polda.ibukota}</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2 shrink-0">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                        polda.status === 'aman' ? 'bg-slate-100 text-slate-700' :
                        polda.status === 'perhatian' ? 'bg-amber-50 text-amber-800' :
                        polda.status === 'tinggi' ? 'bg-rose-50 text-rose-700' :
                        'bg-red-100 text-red-900'
                      }`}>
                        {polda.status === 'aman' ? 'Aman' : polda.status === 'perhatian' ? 'Perhatian' : polda.status === 'tinggi' ? 'Tinggi' : 'Kritis'}
                      </span>
                      <span className="text-[11px] font-semibold text-slate-600">
                        {polda.temuanTerbuka} Temuan
                      </span>
                    </div>
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Right Action Bar */}
        <div className="flex items-center gap-2.5">
          
          {/* Live System Indicator */}
          <div className="hidden xl:flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#071F42] border border-[#173D73] text-[11px] text-blue-200">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>Mabes Polri Presisi</span>
          </div>

          {/* Urgent Notification Bell */}
          <div className="relative">
            <button
              id="header-notification-btn"
              onClick={() => {
                setShowNotifications(!showNotifications);
                setShowUserMenu(false);
              }}
              className="relative p-2 rounded-xl bg-[#071F42] hover:bg-[#0E2E5E] border border-[#1A4278] text-blue-200 hover:text-white transition flex items-center justify-center cursor-pointer"
              aria-label="Pemberitahuan"
            >
              <Bell className="w-4.5 h-4.5" />
              {urgentItems.length > 0 && (
                <span className="absolute -top-1 -right-1 min-w-[18px] h-[18px] px-1 rounded-full bg-rose-600 text-white font-black text-[10px] flex items-center justify-center border-2 border-[#0B2B5C]">
                  {urgentItems.length}
                </span>
              )}
            </button>

            {/* Notification Dropdown */}
            {showNotifications && (
              <div className="absolute right-0 top-full mt-2 w-80 sm:w-96 bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 overflow-hidden z-50 animate-in fade-in">
                <div className="p-3.5 bg-slate-900 text-white flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-rose-500"></span>
                    <h3 className="font-bold text-xs uppercase tracking-wider">Perlu Perhatian Hari Ini</h3>
                  </div>
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-rose-500/30 text-rose-200 border border-rose-400/40">
                    {urgentItems.length} Satker
                  </span>
                </div>

                <div className="max-h-80 overflow-y-auto divide-y divide-slate-100 p-1">
                  {urgentItems.map(item => (
                    <div
                      key={item.id}
                      onClick={() => {
                        onSelectPolda(item.poldaId);
                        setShowNotifications(false);
                      }}
                      className="p-3 hover:bg-slate-50 cursor-pointer transition rounded-xl flex items-start gap-3"
                    >
                      <PoldaLogo 
                        poldaId={item.poldaId} 
                        poldaNama={item.namaPolda} 
                        size="xs" 
                        className="mt-0.5 shrink-0"
                      />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center justify-between gap-2">
                          <span className="font-bold text-xs text-slate-900">{item.namaPolda}</span>
                          <span className="text-[10px] font-bold text-rose-700 bg-rose-50 px-1.5 py-0.5 rounded border border-rose-200">
                            {item.tenggatWaktu}
                          </span>
                        </div>
                        <p className="text-[11px] text-slate-600 mt-1 leading-snug">
                          {item.pesanManusiawi}
                        </p>
                        <span className="inline-flex items-center text-[11px] font-bold text-[#0B2B5C] mt-1.5 hover:underline">
                          Lihat Rincian Satker →
                        </span>
                      </div>
                    </div>
                  ))}
                </div>

                <div className="p-2.5 bg-slate-50 border-t border-slate-100 text-center">
                  <button
                    onClick={() => setShowNotifications(false)}
                    className="text-xs font-bold text-slate-600 hover:text-slate-900 cursor-pointer"
                  >
                    Tutup
                  </button>
                </div>
              </div>
            )}
          </div>

          {/* User Profile Pill & Quick Role Switcher */}
          <div className="relative">
            <button
              id="user-profile-menu-btn"
              onClick={() => {
                setShowUserMenu(!showUserMenu);
                setShowNotifications(false);
              }}
              className="flex items-center gap-2.5 p-1 sm:pl-1.5 sm:pr-3 py-1 rounded-xl bg-[#071F42] hover:bg-[#0E2E5E] border border-[#1A4278] transition text-left cursor-pointer"
            >
              <div className="relative w-8 h-8 rounded-lg overflow-hidden border border-amber-400/90 shadow-xs shrink-0 bg-slate-800 flex items-center justify-center text-white font-black text-xs">
                {currentUser?.avatarUrl ? (
                  <img
                    src={currentUser.avatarUrl}
                    alt={currentUser.nama}
                    className="w-full h-full object-cover"
                    referrerPolicy="no-referrer"
                  />
                ) : (
                  <span>{currentUser ? currentUser.nama.split(' ').map(n => n[0]).slice(0, 2).join('') : 'AU'}</span>
                )}
              </div>
              <div className="hidden sm:block">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white leading-tight">
                    {currentUser ? currentUser.nama.split(',')[0] : 'Kombes Pol. Bambang'}
                  </span>
                  {currentUser && (
                    <span className="px-1.5 py-0.2 rounded text-[9px] font-black bg-amber-400 text-slate-950">
                      {currentUser.level}
                    </span>
                  )}
                </div>
                <div className="text-[10px] text-blue-200/80 font-medium truncate max-w-[150px]">
                  {currentUser ? currentUser.sebutanPimpinan : 'Auditor Utama Itwasum'}
                </div>
              </div>
              <ChevronDown className="w-3.5 h-3.5 text-blue-300 hidden sm:block" />
            </button>

            {/* User Menu Dropdown with Quick Role Switcher */}
            {showUserMenu && (
              <div className="absolute right-0 top-full mt-2 w-[min(22rem,calc(100vw-1rem))] max-h-[calc(100vh-4.5rem)] overflow-y-auto bg-white text-slate-800 rounded-2xl shadow-2xl border border-slate-200 z-50 animate-in fade-in">
                {/* Profile Header */}
                <div className="p-3.5 bg-slate-900 text-white flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg overflow-hidden border-2 border-amber-400 shrink-0 shadow-xs bg-slate-800 flex items-center justify-center font-black text-xs text-amber-400">
                    {currentUser?.avatarUrl ? (
                      <img
                        src={currentUser.avatarUrl}
                        alt={currentUser.nama}
                        className="w-full h-full object-cover"
                        referrerPolicy="no-referrer"
                      />
                    ) : (
                      <span>{currentUser ? currentUser.nama.split(' ').map(n => n[0]).slice(0, 2).join('') : 'AU'}</span>
                    )}
                  </div>
                  <div className="min-w-0 flex-1">
                    <div className="font-extrabold text-xs sm:text-sm text-white leading-tight truncate">
                      {currentUser?.nama || 'Kombes Pol. Bambang Suryo, S.I.K.'}
                    </div>
                    <div className="text-[11px] text-blue-300 font-mono mt-0.5">
                      NRP {currentUser?.nrp || '73050412'} &bull; Level {currentUser?.level || 'L1'}
                    </div>
                    <div className="flex items-center gap-1.5 mt-1 min-w-0">
                      <span className="px-1.5 py-0.5 rounded text-[9px] font-bold bg-[#143E78] text-amber-300 border border-blue-600/40 shrink-0">
                        {currentUser?.peranLabel || 'Auditor Utama'}
                      </span>
                      <span className="text-[10px] text-slate-300 truncate min-w-0">
                        {currentUser?.titikWilayahNama}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Scope & Role Info */}
                <div className="p-3 bg-slate-50 border-b border-slate-100 grid grid-cols-2 gap-x-4 gap-y-2 text-xs">
                  <div className="flex flex-col gap-1 text-slate-600 min-w-0">
                    <span className="font-semibold text-[11px]">Wewenang Overview:</span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                      currentUser?.dapatOverview === 'penuh'
                        ? 'bg-emerald-100 text-emerald-800'
                        : currentUser?.dapatOverview === 'tanpa_data'
                          ? 'bg-blue-100 text-blue-800'
                          : 'bg-amber-100 text-amber-800'
                    }`}>
                      {currentUser?.dapatOverview === 'penuh' ? 'Overview Penuh' : currentUser?.dapatOverview === 'tanpa_data' ? 'Admin Sistem' : 'Akses E-Audit'}
                    </span>
                  </div>
                  <div className="flex flex-col gap-1 text-slate-600 min-w-0">
                    <span className="font-semibold text-[11px]">Bidang Dihaki:</span>
                    <span className="font-bold text-[11px] text-[#0B2B5C]">
                      {currentUser?.bidang && currentUser.bidang.length > 0 ? currentUser.bidang.join(', ') : 'Kosong (Admin)'}
                    </span>
                  </div>
                  <div className="col-span-2 flex items-center justify-between gap-2 text-slate-600">
                    <span className="font-semibold text-[11px]">Status Sesi:</span>
                    <span className="inline-flex items-center gap-1 text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full border border-emerald-200">
                      <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                      Aktif &amp; Terverifikasi
                    </span>
                  </div>
                </div>

                {/* Log Out Current Session */}
                <div className="p-2.5">
                  <button
                    type="button"
                    onClick={() => {
                      setShowUserMenu(false);
                      onOpenLogoutModal();
                    }}
                    className="w-full px-3 py-2.5 rounded-lg text-left text-xs font-bold text-rose-600 hover:bg-rose-50 flex items-center gap-2 transition cursor-pointer border-t border-slate-100"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Keluar dari Sesi (Logout)</span>
                  </button>
                </div>
              </div>
            )}
          </div>

        </div>

      </div>

      {/* Role Switch Logout Confirmation Modal */}
      {accountToSwitchConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-slate-800 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-amber-100 border border-amber-300 text-amber-800 flex items-center justify-center shrink-0">
                <ShieldAlert className="w-6 h-6 text-amber-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Pergantian Akun Memerlukan Logout &amp; Login Ulang
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Kebijakan Keamanan RBAC E-Audit
                </p>
              </div>
            </div>

            <div className="p-3.5 bg-slate-50 rounded-2xl border border-slate-200 text-xs space-y-2 leading-relaxed">
              <p className="text-slate-600">
                Sesi aktif tidak dapat langsung dialihkan demi menjaga integritas dokumen dan jejak audit pengawasan.
              </p>
              <div className="space-y-1.5 pt-1 border-t border-slate-200">
                <div className="flex items-start gap-2 text-slate-700">
                  <span className="font-bold text-[11px] text-slate-500 w-24 shrink-0">Sesi Saat Ini:</span>
                  <span className="font-semibold text-slate-900 truncate">{currentUser?.nama} ({currentUser?.peranLabel})</span>
                </div>
                <div className="flex items-start gap-2 text-slate-700">
                  <span className="font-bold text-[11px] text-amber-700 w-24 shrink-0">Akun Tujuan:</span>
                  <span className="font-bold text-amber-900 truncate">{accountToSwitchConfirm.nama} ({accountToSwitchConfirm.peranLabel})</span>
                </div>
              </div>
            </div>

            <p className="text-xs text-slate-500 italic">
              Anda akan dikeluarkan (logout) dari sesi saat ini dan diarahkan ke formulir autentikasi login untuk masuk sebagai {accountToSwitchConfirm.peranLabel}.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setAccountToSwitchConfirm(null)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  const target = accountToSwitchConfirm;
                  setAccountToSwitchConfirm(null);
                  setShowUserMenu(false);
                  if (onRequestLogoutAndLoginRole) {
                    onRequestLogoutAndLoginRole(target);
                  } else if (onOpenRoleSwitcher) {
                    onOpenRoleSwitcher();
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-amber-600 hover:bg-amber-700 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout &amp; Masuk sebagai {accountToSwitchConfirm.peranLabel.split('/')[0]}</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* General Switch To Login Screen Logout Confirmation Modal */}
      {showLogoutLoginGeneralConfirm && (
        <div className="fixed inset-0 z-50 bg-slate-950/70 backdrop-blur-xs flex items-center justify-center p-4 animate-in fade-in">
          <div className="w-full max-w-md bg-white rounded-3xl p-6 border border-slate-200 shadow-2xl space-y-4 text-slate-800 animate-in zoom-in-95">
            <div className="flex items-center gap-3">
              <div className="w-12 h-12 rounded-2xl bg-blue-100 border border-blue-300 text-blue-800 flex items-center justify-center shrink-0">
                <Lock className="w-6 h-6 text-blue-700" />
              </div>
              <div>
                <h3 className="text-base font-black text-slate-900 tracking-tight">
                  Keluar dari Sesi untuk Ganti Peran?
                </h3>
                <p className="text-xs text-slate-500 font-medium">
                  Sesi saat ini akan diakhiri secara aman
                </p>
              </div>
            </div>

            <p className="text-xs text-slate-600 leading-relaxed">
              Anda sedang aktif sebagai <strong>{currentUser?.nama}</strong> ({currentUser?.peranLabel}). Untuk memilih dan login sebagai peran lain, sesi saat ini harus diakhiri terlebih dahulu.
            </p>

            <div className="flex items-center justify-end gap-2.5 pt-2 border-t border-slate-100">
              <button
                type="button"
                onClick={() => setShowLogoutLoginGeneralConfirm(false)}
                className="px-4 py-2.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-xs transition cursor-pointer"
              >
                Batal
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowLogoutLoginGeneralConfirm(false);
                  setShowUserMenu(false);
                  if (onRequestLogoutAndLoginRole) {
                    onRequestLogoutAndLoginRole();
                  } else if (onOpenRoleSwitcher) {
                    onOpenRoleSwitcher();
                  }
                }}
                className="px-4 py-2.5 rounded-xl bg-[#0B2B5C] hover:bg-blue-900 text-white font-bold text-xs shadow-xs transition flex items-center gap-1.5 cursor-pointer"
              >
                <LogOut className="w-4 h-4" />
                <span>Logout &amp; Buka Layar Login</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </header>
  );
};


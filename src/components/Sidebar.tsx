import React, { useState } from 'react';
import { X, LogOut, ChevronDown, ShieldHalf, Settings } from 'lucide-react';
import { CurrentUserProfile } from '../types';
import { getVisibleModulesForRole } from '../config/moduleRegistry';
import { FIGMA_SIDEBAR_GROUPS, EXTRA_SIDEBAR_GROUPS, PINNED_BOTTOM_ITEM, type SidebarNavGroup } from '../config/sidebarNav';

/**
 * Sidebar penuh-tinggi mengikuti Figma "UI Req by BA" (Plan "Align itwasum with Figma" bagian 2):
 * blok logo di atas, grup-grup Figma (Ringkasan/Manajemen Auditor/Pengguna & Akses/Audit/
 * Kinerja/Portal Satker) lebih dulu, lalu grup tambahan untuk modul tanpa frame Figma
 * eksplisit, dan Pengaturan + Keluar dipinkan di bagian bawah. Visibilitas tiap item tetap
 * disaring lewat `getVisibleModulesForRole` (RBAC di `moduleRegistry.ts`) — struktur di sini
 * murni presentasi (lihat riwayat git untuk versi sidebar berbasis MODULE_REGISTRY langsung).
 */

interface SidebarProps {
  activeNav: string;
  activeSubPath?: string;
  onNavigate: (moduleId: string, subPath?: string) => void;
  onOpenLogoutModal: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  urgentCount: number;
  currentUser: CurrentUserProfile;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  activeSubPath,
  onNavigate,
  onOpenLogoutModal,
  mobileOpen,
  setMobileOpen,
  urgentCount,
  currentUser,
}) => {
  const visibleIds = new Set(getVisibleModulesForRole(currentUser.peran).map((m) => m.id));
  const [collapsedGroups, setCollapsedGroups] = useState<Set<string>>(() => new Set());

  const toggleGroup = (group: string) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const visibleGroups = (groups: SidebarNavGroup[]) =>
    groups.map((g) => ({ ...g, items: g.items.filter((it) => visibleIds.has(it.moduleId)) })).filter((g) => g.items.length > 0);

  const renderGroup = (group: SidebarNavGroup) => {
    const isCollapsed = collapsedGroups.has(group.id);
    return (
      <div key={group.id}>
        <button
          onClick={() => toggleGroup(group.id)}
          className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-blue-300 hover:bg-white/5 transition-colors"
        >
          <span className="truncate">{group.label}</span>
          <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
        </button>
        {!isCollapsed && (
          <div className="space-y-0.5 mb-1">
            {group.items.map((item) => {
              const Icon = item.icon;
              const isActive = activeNav === item.moduleId && (item.subPath ? activeSubPath?.startsWith(item.subPath) : !activeSubPath);
              const badge = item.id === 'beranda' && urgentCount > 0 ? urgentCount : undefined;
              return (
                <button
                  key={item.id}
                  id={`nav-${item.id}`}
                  onClick={() => {
                    onNavigate(item.moduleId, item.subPath);
                    setMobileOpen(false);
                  }}
                  className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                    isActive
                      ? 'bg-[#143E78] text-amber-400 border border-amber-400/30 shadow-xs'
                      : 'text-blue-100/90 hover:bg-white/5 border border-transparent'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                  <span className="text-[11.5px] font-bold truncate flex-1">{item.label}</span>
                  {badge !== undefined && (
                    <span className="shrink-0 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center">
                      {badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        )}
      </div>
    );
  };

  const figmaGroups = visibleGroups(FIGMA_SIDEBAR_GROUPS);
  const extraGroups = visibleGroups(EXTRA_SIDEBAR_GROUPS);
  const showPinned = visibleIds.has(PINNED_BOTTOM_ITEM.moduleId);
  const pinnedActive = activeNav === PINNED_BOTTOM_ITEM.moduleId && activeSubPath?.startsWith(PINNED_BOTTOM_ITEM.subPath ?? '');

  return (
    <>
      {mobileOpen && (
        <div
          className="fixed inset-0 bg-slate-900/60 z-50 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      <aside
        id="main-sidebar"
        className={`fixed lg:sticky top-0 bottom-0 left-0 z-50 lg:z-30 w-72 h-screen shrink-0 bg-[#0B2B5C] text-white flex flex-col border-r border-[#143B73] transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Blok logo (Figma: "Itwasum Polri" / "Sistem Satu Data") */}
        <div className="flex items-center justify-between gap-2.5 px-3.5 py-3.5 border-b border-[#143B73] shrink-0">
          <div className="flex items-center gap-2.5 min-w-0">
            <span className="w-9 h-9 rounded-[10px] bg-[#143E78] flex items-center justify-center shrink-0 text-amber-400">
              <ShieldHalf className="w-5 h-5 stroke-[2.2]" />
            </span>
            <div className="min-w-0">
              <div className="text-sm font-extrabold text-white leading-tight truncate">Itwasum Polri</div>
              <div className="text-[10.5px] text-blue-200/80 leading-tight truncate">Sistem Satu Data</div>
            </div>
          </div>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/60 shrink-0"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grouped, scrollable navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2.5 space-y-1" aria-label="Menu Navigasi Modul">
          {figmaGroups.map(renderGroup)}
          {extraGroups.length > 0 && figmaGroups.length > 0 && <div className="my-1.5 border-t border-[#143B73]" />}
          {extraGroups.map(renderGroup)}
        </nav>

        {/* Footer: Pengaturan (pinned) + Keluar */}
        <div className="px-2.5 py-2.5 border-t border-[#143B73] shrink-0 space-y-1.5">
          {showPinned && (
            <button
              id="nav-pengaturan"
              onClick={() => {
                onNavigate(PINNED_BOTTOM_ITEM.moduleId, PINNED_BOTTOM_ITEM.subPath);
                setMobileOpen(false);
              }}
              className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                pinnedActive ? 'bg-[#143E78] text-amber-400 border border-amber-400/30' : 'text-blue-100/90 hover:bg-white/5 border border-transparent'
              }`}
            >
              <Settings className="w-4 h-4 shrink-0 stroke-[1.8]" />
              <span className="text-[11.5px] font-bold truncate flex-1">{PINNED_BOTTOM_ITEM.label}</span>
            </button>
          )}
          <button
            id="sidebar-logout-btn"
            onClick={onOpenLogoutModal}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-[#071F42] border border-[#173D73] text-blue-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4 stroke-[1.8]" />
            <span className="text-[11.5px] font-bold">Keluar</span>
          </button>
        </div>
      </aside>
    </>
  );
};

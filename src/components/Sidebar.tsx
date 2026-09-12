import React, { useState } from 'react';
import { X, LogOut, ChevronDown, Shield } from 'lucide-react';
import { MainNavId, CurrentUserProfile } from '../types';
import {
  MODULE_GROUP_ORDER,
  MODULE_GROUPS,
  getVisibleModulesForRole,
  type ModuleDefinition,
  type ModuleGroupId,
} from '../config/moduleRegistry';

/**
 * Sidebar bertingkat berbasis MODULE_REGISTRY (Plan 2, bagian 2.2).
 *
 * Sebelumnya (lihat riwayat git) sidebar adalah rel ikon sempit dengan daftar menu per-peran yang
 * ditulis manual (`getNavItemsForRole`), dan mayoritas item selain "Beranda" DI-COMMENT untuk semua
 * peran. Implementasi ini menggantinya dengan sidebar bertingkat 7 grup yang menu-nya diturunkan dari
 * satu sumber kebenaran (`MODULE_REGISTRY`) dan disaring lewat `getVisibleModulesForRole`, sehingga
 * seluruh menu yang sebelumnya di-comment otomatis "aktif kembali" sesuai aturan RBAC per peran.
 */

function getRoleBadge(currentUser: CurrentUserProfile) {
  switch (currentUser.peran) {
    case 'super_admin':
      return { label: 'ADM', color: 'bg-purple-600 text-white' };
    case 'admin_polda':
      return { label: 'L2-ADM', color: 'bg-blue-600 text-white' };
    case 'pengawas_tim':
    case 'ketua_tim':
    case 'auditor':
      return { label: 'AUD', color: 'bg-emerald-600 text-white' };
    case 'auditee':
      return { label: 'L3-ADT', color: 'bg-amber-600 text-white' };
    case 'koordinator_pengendali':
      return { label: 'DAL-L1', color: 'bg-indigo-600 text-white' };
    default:
      return { label: currentUser.level, color: 'bg-amber-500 text-slate-950' };
  }
}

interface SidebarProps {
  activeNav: MainNavId;
  onSelectNav: (nav: MainNavId) => void;
  onOpenLogoutModal: () => void;
  mobileOpen: boolean;
  setMobileOpen: (open: boolean) => void;
  urgentCount: number;
  currentUser: CurrentUserProfile;
  onOpenRoleSwitcher?: () => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  activeNav,
  onSelectNav,
  onOpenLogoutModal,
  mobileOpen,
  setMobileOpen,
  urgentCount,
  currentUser,
}) => {
  const visibleModules = getVisibleModulesForRole(currentUser.peran);
  const groupsWithModules: { group: ModuleGroupId; modules: ModuleDefinition[] }[] = MODULE_GROUP_ORDER.map(
    (group) => ({ group, modules: visibleModules.filter((m) => m.group === group) })
  ).filter((g) => g.modules.length > 0);

  const activeGroup = groupsWithModules.find((g) => g.modules.some((m) => m.id === activeNav))?.group;
  const [collapsedGroups, setCollapsedGroups] = useState<Set<ModuleGroupId>>(() => {
    // Semua grup selain grup yang berisi rute aktif dimulai dalam keadaan terlipat.
    const initial = new Set<ModuleGroupId>();
    groupsWithModules.forEach((g) => {
      if (g.group !== activeGroup) initial.add(g.group);
    });
    return initial;
  });

  const toggleGroup = (group: ModuleGroupId) => {
    setCollapsedGroups((prev) => {
      const next = new Set(prev);
      if (next.has(group)) next.delete(group);
      else next.add(group);
      return next;
    });
  };

  const roleBadge = getRoleBadge(currentUser);

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
        className={`fixed lg:sticky top-0 lg:top-14 bottom-0 left-0 z-50 lg:z-30 w-72 lg:h-[calc(100vh-56px)] shrink-0 bg-[#0B2B5C] text-white flex flex-col border-r border-[#143B73] transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Header: brand + role badge */}
        <div className="px-3.5 pt-3.5 pb-3 border-b border-[#143B73] flex items-center gap-2 shrink-0">
          <div className="w-9 h-9 rounded-xl bg-[#143E78] flex items-center justify-center shrink-0">
            <Shield className="w-4.5 h-4.5 text-amber-400" />
          </div>
          <div className="min-w-0 flex-1">
            <div className="text-xs font-black text-white leading-tight">Satu Data Itwasum</div>
            <div className="text-[10px] text-blue-300 truncate">{currentUser.titikWilayahNama}</div>
          </div>
          <span className={`shrink-0 px-1.5 py-0.5 rounded text-[9px] font-black ${roleBadge.color}`}>{roleBadge.label}</span>
          <button
            onClick={() => setMobileOpen(false)}
            className="lg:hidden p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/60"
            aria-label="Tutup Menu"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Grouped, scrollable navigation */}
        <nav className="flex-1 overflow-y-auto px-2 py-2.5 space-y-1" aria-label="Menu Navigasi Modul">
          {groupsWithModules.map(({ group, modules }) => {
            const isCollapsed = collapsedGroups.has(group);
            const groupMeta = MODULE_GROUPS[group];
            return (
              <div key={group}>
                <button
                  onClick={() => toggleGroup(group)}
                  className="w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-[10px] font-black uppercase tracking-wider text-blue-300 hover:bg-white/5 transition-colors"
                >
                  <span className="truncate">{groupMeta.label}</span>
                  <ChevronDown className={`w-3.5 h-3.5 shrink-0 transition-transform ${isCollapsed ? '-rotate-90' : ''}`} />
                </button>
                {!isCollapsed && (
                  <div className="space-y-0.5 mb-1">
                    {modules.map((mod) => {
                      const Icon = mod.icon;
                      const isActive = activeNav === mod.id;
                      const badge = mod.id === 'beranda' && urgentCount > 0 ? urgentCount : undefined;
                      return (
                        <button
                          key={mod.id}
                          id={`nav-${mod.id}`}
                          onClick={() => {
                            onSelectNav(mod.id as MainNavId);
                            setMobileOpen(false);
                          }}
                          className={`w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl text-left transition-colors ${
                            isActive
                              ? 'bg-[#143E78] text-amber-400 border border-amber-400/30 shadow-xs'
                              : 'text-blue-100/90 hover:bg-white/5 border border-transparent'
                          }`}
                        >
                          <Icon className={`w-4 h-4 shrink-0 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />
                          <span className="text-[11.5px] font-bold truncate flex-1">{mod.label}</span>
                          {mod.kode && (
                            <span className="text-[8px] font-mono text-blue-300/70 shrink-0">{mod.kode}</span>
                          )}
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
          })}
        </nav>

        {/* Footer: logout */}
        <div className="px-2.5 py-2.5 border-t border-[#143B73] shrink-0">
          <button
            id="sidebar-logout-btn"
            onClick={onOpenLogoutModal}
            className="w-full flex items-center gap-2.5 px-2.5 py-2 rounded-xl bg-[#071F42] border border-[#173D73] text-blue-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors"
          >
            <LogOut className="w-4 h-4 stroke-[1.8]" />
            <span className="text-[11.5px] font-bold">Keluar Sistem</span>
          </button>
        </div>
      </aside>
    </>
  );
};

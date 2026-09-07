import React from 'react';
import { 
  Home, 
  Search, 
  BarChart3, 
  Users, 
  Settings, 
  LogOut,
  X,
  Shield,
  KeyRound,
  FileCheck,
  ClipboardList,
  UserCheck
} from 'lucide-react';
import { MainNavId, CurrentUserProfile } from '../types';

export interface NavItemConfig {
  id: MainNavId;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  badge?: number;
  subtitle?: string;
}

export function getNavItemsForRole(currentUser: CurrentUserProfile, urgentCount: number): NavItemConfig[] {
  const role = currentUser.peran;
  const level = currentUser.level;

  // 1. Super Admin (L0 - Sistem)
  // Peran admin hanya mengelola akun, sistem & log. Dihapus: Pengawasan, Kinerja, Auditor.
  if (role === 'super_admin') {
    return [
      {
        id: 'pengaturan',
        label: 'Tata Kelola Pengguna & RBAC',
        icon: Settings,
        subtitle: 'Manajemen Akun & Hak Akses'
      },
      {
        id: 'beranda',
        label: 'Pusat Kendali Admin & Log Sistem',
        icon: Shield,
        subtitle: 'Log Aktivitas & Status Server'
      }
    ];
  }

  // 2. Admin Polda (L2 - Sistem - Polda Riau)
  // Peran admin polda mengelola akun jajaran Polda Riau & usulan wewenang. Dihapus: Pengawasan, Kinerja, Auditor.
  if (role === 'admin_polda') {
    return [
      {
        id: 'pengaturan',
        label: 'Kelola Pengguna Polda Riau',
        icon: Settings,
        subtitle: 'Akun Satker & 12 Polres'
      },
      {
        id: 'beranda',
        label: 'Pusat Kendali Admin Wilayah Riau',
        icon: Shield,
        subtitle: 'Status Log & Usulan Akses'
      }
    ];
  }

  // 3. Pengawas Tim / Tim Audit (ST/412)
  // Fokus pada workspace penugasan, KKA/locus temuan, & susunan personel tim. Dihapus: Kinerja (IKU) & Pengaturan.
  if (role === 'pengawas_tim' || role === 'ketua_tim' || role === 'auditor') {
    return [
      {
        id: 'beranda',
        label: 'Workspace Tim Audit (ST/412)',
        icon: Home,
        subtitle: 'KKA, 5 Satker & NHAS'
      },
      {
        id: 'pengawasan',
        label: 'KKA & Temuan 5 Satker Objek',
        icon: Search,
        subtitle: 'Lembar Pemeriksaan & Sanggahan'
      },
      {
        id: 'auditor',
        label: 'Susunan Tim & Surat Tugas ST/412',
        icon: Users,
        subtitle: 'Pemeriksa & Penugasan'
      }
    ];
  }

  // 4. Auditee (Objek Periksa - L3 Polres Kampar)
  // Fokus pada portal tindak lanjut, lembar rekomendasi satker & unggah eviden. Dihapus: Kinerja, Auditor, & Pengaturan.
  if (role === 'auditee') {
    return [
      {
        id: 'beranda',
        label: 'Portal Tindak Lanjut Wasrik (Polres Kampar)',
        icon: Home,
        subtitle: 'Rekomendasi & Bukti Eviden'
      },
      {
        id: 'pengawasan',
        label: 'Lembar Temuan & Rekomendasi Satker',
        icon: Search,
        subtitle: 'Status Temuan Wasrik'
      }
    ];
  }

  // 5. Pimpinan L2 (Polda Riau - Irwasda)
  // Wilayah hukum Polda Riau & Polres jajaran. Dihapus: Auditor (Mabes) & Pengaturan.
  if (role === 'pimpinan_tertinggi' && level === 'L2') {
    return [
      {
        id: 'beranda',
        label: 'Beranda (Peta Komando Polda Riau)',
        icon: Home,
        badge: urgentCount > 0 ? urgentCount : undefined,
        subtitle: 'Peta Satker Mapolda & 12 Polres'
      },
      {
        id: 'pengawasan',
        label: 'Pengawasan Temuan Jajaran Riau',
        icon: Search,
        subtitle: 'Temuan & Tindak Lanjut'
      },
      {
        id: 'kinerja',
        label: 'Kinerja Satker & Polres Riau',
        icon: BarChart3,
        subtitle: 'Capaian IKU Jajaran Riau'
      }
    ];
  }

  // 6. Koordinator & Pengendali L1 (Itwil I)
  // Pengendalian mutu wasrik 6 Polda binaan Itwil I. Dihapus: Pengaturan.
  if (role === 'koordinator_pengendali') {
    return [
      {
        id: 'beranda',
        label: 'Beranda Pengendalian Itwil I',
        icon: Home,
        badge: urgentCount > 0 ? urgentCount : undefined,
        subtitle: 'Peta 6 Polda Binaan'
      },
      {
        id: 'pengawasan',
        label: 'Matriks Mutu Pengawasan Itwil I',
        icon: Search,
        subtitle: 'Quality Assurance Temuan'
      },
      {
        id: 'kinerja',
        label: 'Evaluasi IKU Jajaran Itwil I',
        icon: BarChart3,
        subtitle: 'Kinerja Satker Wilayah I'
      },
      {
        id: 'auditor',
        label: 'Daftar Auditor & ST Itwil I',
        icon: Users,
        subtitle: 'Beban Kerja Auditor Itwil I'
      }
    ];
  }

  // 7. Pimpinan L1 (Itwil III)
  // Wilayah hukum 7 Polda binaan Itwil III. Dihapus: Pengaturan.
  if (role === 'pimpinan_tertinggi' && level === 'L1') {
    return [
      {
        id: 'beranda',
        label: 'Beranda (Peta Komando Itwil III)',
        icon: Home,
        badge: urgentCount > 0 ? urgentCount : undefined,
        subtitle: 'Peta 7 Polda Binaan'
      },
      {
        id: 'pengawasan',
        label: 'Pengawasan Temuan Wilayah III',
        icon: Search,
        subtitle: 'Temuan Satker Wilayah III'
      },
      {
        id: 'kinerja',
        label: 'Kinerja Satker Jajaran Wilayah III',
        icon: BarChart3,
        subtitle: 'Capaian IKU 7 Polda Binaan'
      },
      {
        id: 'auditor',
        label: 'Tim Auditor Wilayah III',
        icon: Users,
        subtitle: 'Personel Auditor Itwil III'
      }
    ];
  }

  // 8. Pimpinan L0 (Mabes Polri - Kapolri / Irwasum) - Akses Komando Nasional
  // Dihapus: Pengaturan (Pengaturan akun sistem bukan wewenang pimpinan eksekutif).
  return [
    {
      id: 'beranda',
      label: 'Beranda (Peta Komando Nasional)',
      icon: Home,
      badge: urgentCount > 0 ? urgentCount : undefined,
      subtitle: 'Peta Komando 34 Polda & Mabes'
    },
    {
      id: 'pengawasan',
      label: 'Pengawasan & Temuan Nasional',
      icon: Search,
      subtitle: 'Temuan Wasrik, BPK & Irsus'
    },
    {
      id: 'kinerja',
      label: 'Kinerja Satker (IKU Nasional)',
      icon: BarChart3,
      subtitle: 'Capaian IKU 34 Polda'
    },
    {
      id: 'auditor',
      label: 'Tim Auditor Itwasum',
      icon: Users,
      subtitle: 'Struktur Irwil & Penugasan'
    }
  ];
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
  onOpenRoleSwitcher
}) => {
  // Dynamically compute nav items filtered & tailored specifically for the active role
  const navItems = getNavItemsForRole(currentUser, urgentCount);

  // Compute short role badge abbreviation & color
  const getRoleBadge = () => {
    switch (currentUser.peran) {
      case 'super_admin':
        return { label: 'ADM', color: 'bg-purple-600 border-purple-400 text-white' };
      case 'admin_polda':
        return { label: 'L2-ADM', color: 'bg-blue-600 border-blue-400 text-white' };
      case 'pengawas_tim':
      case 'ketua_tim':
      case 'auditor':
        return { label: 'AUD', color: 'bg-emerald-600 border-emerald-400 text-white' };
      case 'auditee':
        return { label: 'L3-ADT', color: 'bg-amber-600 border-amber-400 text-white' };
      case 'koordinator_pengendali':
        return { label: 'DAL-L1', color: 'bg-indigo-600 border-indigo-400 text-white' };
      default:
        return { label: currentUser.level, color: 'bg-amber-500 border-amber-300 text-slate-950' };
    }
  };

  const roleBadge = getRoleBadge();

  return (
    <>
      {/* Mobile Backdrop */}
      {mobileOpen && (
        <div 
          className="fixed inset-0 bg-slate-900/60 z-50 lg:hidden backdrop-blur-xs transition-opacity"
          onClick={() => setMobileOpen(false)}
        />
      )}

      {/* Sidebar Container */}
      <aside 
        id="main-sidebar"
        className={`fixed lg:sticky top-0 lg:top-16 bottom-0 left-0 z-50 lg:z-30 w-16 sm:w-18 lg:h-[calc(100vh-64px)] shrink-0 bg-[#0B2B5C] text-white flex flex-col justify-between items-center py-3.5 border-r border-[#143B73] transition-transform duration-200 ease-in-out ${
          mobileOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'
        }`}
      >
        {/* Top Header inside Sidebar: Role Indicator Badge */}
        <div className="w-full px-2 flex flex-col items-center">
          {/* Mobile Close Button on Top */}
          <div className="lg:hidden w-full flex justify-end mb-2">
            <button 
              onClick={() => setMobileOpen(false)}
              className="p-1.5 rounded-lg text-blue-200 hover:text-white hover:bg-blue-900/60 cursor-pointer"
              aria-label="Tutup Menu"
            >
              <X className="w-5 h-5" />
            </button>
          </div>

          {/* Role Chip Pill with Tooltip showing active authenticated role (Non-interactive status pill) */}
          <div className="relative group w-full flex justify-center mb-3">
            <div
              id="sidebar-role-indicator"
              className={`px-1.5 py-1 rounded-lg border text-[10px] font-black tracking-tight flex items-center justify-center select-none shadow-xs ${roleBadge.color}`}
              aria-label={`Peran Aktif: ${currentUser.peranLabel}`}
            >
              <span>{roleBadge.label}</span>
            </div>

            {/* Hover Tooltip for Role Indicator */}
            <div className="hidden lg:group-hover:flex absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none items-center">
              <div className="px-3 py-1.5 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap border border-slate-700 space-y-0.5">
                <div className="font-extrabold text-amber-400">{currentUser.peranLabel}</div>
                <div className="text-[10px] text-slate-300 font-normal">{currentUser.titikWilayahNama} &bull; Sesi Aktif Terverifikasi</div>
              </div>
            </div>
          </div>
        </div>

        {/* Dynamic Navigation Icon List Tailored to Current Role */}
        <nav className="w-full px-2 space-y-2 flex flex-col items-center flex-1" aria-label="Menu Navigasi Sesuai Peran">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = activeNav === item.id;

            return (
              <div key={item.id} className="relative group w-full flex justify-center">
                {/* Active Indicator Strip on the left edge of sidebar */}
                {isActive && (
                  <span className="absolute left-0 top-1.5 bottom-1.5 w-1 bg-amber-400 rounded-r-md" />
                )}

                <button
                  id={`nav-${item.id}`}
                  onClick={() => {
                    onSelectNav(item.id);
                    setMobileOpen(false);
                  }}
                  className={`relative w-11 h-11 sm:w-12 sm:h-12 rounded-xl flex items-center justify-center transition-all duration-150 focus:outline-none cursor-pointer ${
                    isActive 
                      ? 'bg-[#143E78] text-amber-400 border border-amber-400/40 shadow-xs' 
                      : 'text-blue-200/80 hover:bg-white/10 hover:text-white border border-transparent'
                  }`}
                  aria-label={item.label}
                >
                  <Icon className={`w-5 h-5 flex-shrink-0 ${isActive ? 'stroke-[2.2]' : 'stroke-[1.8]'}`} />

                  {/* Notification Badge inside the button frame */}
                  {item.badge !== undefined && (
                    <span className="absolute top-1.5 right-1.5 min-w-[16px] h-4 px-1 rounded-full bg-rose-600 text-white font-bold text-[9px] flex items-center justify-center border border-[#0B2B5C] leading-none">
                      {item.badge}
                    </span>
                  )}
                </button>

                {/* Clean Extended Tooltip on Hover */}
                <div className="hidden lg:group-hover:flex absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none items-center">
                  <div className="px-3 py-2 bg-slate-900 text-white text-xs font-semibold rounded-xl shadow-xl whitespace-nowrap border border-slate-700 space-y-0.5">
                    <div className="font-bold text-white">{item.label}</div>
                    {item.subtitle && (
                      <div className="text-[10px] text-blue-300 font-normal">{item.subtitle}</div>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </nav>

        {/* Footer Area with Icon-Only Logout Button */}
        <div className="w-full px-2 pt-3 border-t border-[#143B73] flex flex-col items-center">
          <div className="relative group w-full flex justify-center">
            <button
              id="sidebar-logout-btn"
              onClick={onOpenLogoutModal}
              className="w-11 h-11 sm:w-12 sm:h-12 rounded-xl bg-[#071F42] border border-[#173D73] text-blue-200 hover:bg-rose-600 hover:text-white hover:border-rose-600 transition-colors duration-150 flex items-center justify-center cursor-pointer"
              aria-label="Keluar Sistem"
              title="Keluar Sistem"
            >
              <LogOut className="w-4.5 h-4.5 stroke-[1.8]" />
            </button>

            {/* Floating Tooltip for Logout */}
            <div className="hidden lg:group-hover:flex absolute left-full ml-2.5 top-1/2 -translate-y-1/2 z-50 pointer-events-none items-center">
              <div className="px-2.5 py-1 bg-slate-900 text-white text-xs font-semibold rounded-lg shadow-lg whitespace-nowrap border border-slate-700">
                Keluar Sistem
              </div>
            </div>
          </div>
        </div>
      </aside>
    </>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Kerangka halaman standar untuk 11 modul bespoke BA-SA-Lanjutan (Plan bagian 2):
 * Breadcrumbs (grup -> kode modul -> nama Screen) -> header card (judul + deskripsi +
 * badge status + sumberSpek) -> TabNavigation per Screen -> konten (children).
 *
 * `activeScreen`/`onScreenChange` dikendalikan oleh view pemanggil yang menerima `subPath`
 * dari `ModuleRouteView`, sehingga setiap Screen dapat di-deep-link via `#/<moduleId>/<slug>`.
 */
import React from 'react';
import { Info } from 'lucide-react';
import type { ModuleDefinition } from '../../../config/moduleRegistry';
import { MODULE_STATUS_LABEL } from '../../../config/moduleRegistry';
import type { ModuleSpec } from '../../../config/moduleSpecs';
import { Breadcrumbs, PageHeaderCard, TabNavigation, type BreadcrumbItem } from '../../ui';

const STATUS_BADGE_CLASS: Record<string, string> = {
  inti: 'bg-blue-50 text-blue-700 border-blue-200',
  replikasi: 'bg-purple-50 text-purple-700 border-purple-200',
  baru: 'bg-amber-50 text-amber-700 border-amber-200',
  nyata: 'bg-emerald-50 text-emerald-700 border-emerald-200',
};

export interface ModuleScreenShellProps {
  moduleDef: ModuleDefinition;
  groupLabel: string;
  spec: ModuleSpec;
  activeScreen: string;
  onScreenChange: (slug: string) => void;
  headerActions?: React.ReactNode;
  /** Sembunyikan seluruh nav tab/section (Figma: navigasi sepenuhnya lewat Sidebar, bukan tab
   * dalam halaman) — dipakai B.12 sejak restrukturisasi Figma (Plan "Align itwasum with
   * Figma", todo b12-rest: "B.12's 4-section tab bar is removed"). */
  hideTabs?: boolean;
  children: React.ReactNode;
}

export const ModuleScreenShell: React.FC<ModuleScreenShellProps> = ({
  moduleDef,
  groupLabel,
  spec,
  activeScreen,
  onScreenChange,
  headerActions,
  hideTabs,
  children,
}) => {
  const activeScreenDef = spec.screens.find((s) => s.slug === activeScreen) ?? spec.screens[0];

  // Nav 2-level (mis. B.12 Ringkasan/Konfigurasi/Pengumpulan & Verifikasi/Risiko & Perencanaan)
  // — hanya aktif jika Screen Spec modul ini memakai `section`.
  const sections = Array.from(new Set(spec.screens.map((s) => s.section).filter((s): s is string => !!s)));
  const hasSections = sections.length > 0;
  const activeSection = activeScreenDef?.section ?? sections[0] ?? '';

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: groupLabel },
    { label: moduleDef.kode || moduleDef.label },
    { label: activeScreenDef?.nama || moduleDef.label },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={breadcrumbItems} />

      <PageHeaderCard
        title={moduleDef.label}
        subtitle={moduleDef.deskripsi}
        actions={
          <>
            {headerActions}
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${STATUS_BADGE_CLASS[moduleDef.status]}`}>
              {MODULE_STATUS_LABEL[moduleDef.status]}
            </span>
          </>
        }
      />
      <div className="-mt-2 flex items-start gap-1.5 text-[10px] text-slate-400 font-mono px-1">
        <Info className="w-3 h-3 shrink-0 mt-0.5" />
        <span>Sumber: {moduleDef.sumberSpek}</span>
      </div>

      {hideTabs ? null : hasSections ? (
        <div className="space-y-2.5">
          <div className="flex flex-wrap gap-1.5">
            {sections.map((sec) => (
              <button
                key={sec}
                onClick={() => {
                  const firstInSection = spec.screens.find((s) => (s.section ?? '') === sec);
                  if (firstInSection) onScreenChange(firstInSection.slug);
                }}
                className={`px-3 py-1.5 rounded-[8px] text-[11px] font-extrabold uppercase tracking-wide transition-colors ${
                  sec === activeSection
                    ? 'bg-[var(--sd-primary)] text-white shadow-sm'
                    : 'bg-slate-100 text-slate-500 hover:bg-slate-200'
                }`}
              >
                {sec}
              </button>
            ))}
          </div>
          <TabNavigation
            tabs={spec.screens.filter((s) => (s.section ?? '') === activeSection).map((s) => ({ id: s.slug, label: s.nama }))}
            activeTab={activeScreenDef?.slug || ''}
            onTabChange={onScreenChange}
          />
        </div>
      ) : (
        <TabNavigation
          tabs={spec.screens.map((s) => ({ id: s.slug, label: s.nama }))}
          activeTab={activeScreenDef?.slug || ''}
          onTabChange={onScreenChange}
        />
      )}

      {activeScreenDef?.deskripsi && (
        <p className="text-xs text-slate-500 -mt-1">{activeScreenDef.deskripsi}</p>
      )}

      <div>{children}</div>
    </div>
  );
};

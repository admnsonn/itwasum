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
import { Breadcrumbs, TabNavigation, type BreadcrumbItem } from '../../ui';

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
  children: React.ReactNode;
}

export const ModuleScreenShell: React.FC<ModuleScreenShellProps> = ({
  moduleDef,
  groupLabel,
  spec,
  activeScreen,
  onScreenChange,
  headerActions,
  children,
}) => {
  const activeScreenDef = spec.screens.find((s) => s.slug === activeScreen) ?? spec.screens[0];

  const breadcrumbItems: BreadcrumbItem[] = [
    { label: groupLabel },
    { label: moduleDef.kode || moduleDef.label },
    { label: activeScreenDef?.nama || moduleDef.label },
  ];

  return (
    <div className="space-y-4">
      <Breadcrumbs items={breadcrumbItems} />

      <div className="bg-white rounded-[14px] border border-[var(--sd-outline-variant)]/40 shadow-[0_1px_10px_rgb(0,0,0,0.06)] p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            <h1 className="text-lg font-black text-slate-900 flex items-center gap-2">
              <moduleDef.icon className="w-5 h-5 text-[var(--sd-primary)]" />
              {moduleDef.label}
            </h1>
            <p className="text-xs text-slate-500 mt-1 max-w-3xl leading-relaxed">{moduleDef.deskripsi}</p>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {headerActions}
            <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold border ${STATUS_BADGE_CLASS[moduleDef.status]}`}>
              {MODULE_STATUS_LABEL[moduleDef.status]}
            </span>
          </div>
        </div>
        <div className="mt-2 flex items-start gap-1.5 text-[10px] text-slate-400 font-mono">
          <Info className="w-3 h-3 shrink-0 mt-0.5" />
          <span>Sumber: {moduleDef.sumberSpek}</span>
        </div>
      </div>

      <TabNavigation
        tabs={spec.screens.map((s) => ({ id: s.slug, label: s.nama }))}
        activeTab={activeScreenDef?.slug || ''}
        onTabChange={onScreenChange}
      />

      {activeScreenDef?.deskripsi && (
        <p className="text-xs text-slate-500 -mt-1">{activeScreenDef.deskripsi}</p>
      )}

      <div>{children}</div>
    </div>
  );
};

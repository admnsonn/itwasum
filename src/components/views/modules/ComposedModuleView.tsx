import React from 'react';
import type { ModuleDefinition } from '../../../config/moduleRegistry';
import { MODULE_GROUPS } from '../../../config/moduleRegistry';
import { getDefaultScreenSlug } from '../../../config/moduleSpecs';
import { MODULE_CONTENT } from '../../../content/modules';
import { ModuleComposer } from './ModuleComposer';

interface ComposedModuleViewProps {
  moduleDef: ModuleDefinition;
  subPath?: string;
  onSubPathChange: (subPath?: string) => void;
}

export const ComposedModuleView: React.FC<ComposedModuleViewProps> = ({
  moduleDef,
  subPath,
  onSubPathChange,
}) => {
  const content = MODULE_CONTENT[moduleDef.id];
  if (!content) {
    return (
      <div className="bg-white rounded-2xl border border-rose-200 p-6 text-sm text-rose-600 font-semibold">
        Deskriptor modul {moduleDef.kode} belum terdaftar.
      </div>
    );
  }

  const spec = content.spec;
  const activeScreen = subPath || getDefaultScreenSlug(moduleDef.id) || spec.screens[0]?.slug || spec.screens[0]?.slug;
  const screenSlug = spec.screens.some((s) => s.slug === activeScreen) ? activeScreen : spec.screens[0].slug;
  const sections = content.buildSections(moduleDef, screenSlug);

  return (
    <ModuleComposer
      moduleDef={moduleDef}
      groupLabel={MODULE_GROUPS[moduleDef.group].label}
      spec={spec}
      activeScreen={screenSlug}
      onScreenChange={onSubPathChange}
      sections={sections}
    />
  );
};

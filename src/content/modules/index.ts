import type { ModuleDefinition } from '../../config/moduleRegistry';
import type { ModuleSpec } from '../../config/moduleSpecs';
import type { SectionDescriptor } from '../../components/views/modules/sectionTypes';
import * as a1 from './a1';
import * as a2 from './a2';
import * as a3 from './a3';
import * as a4 from './a4';
import * as c1 from './c1';
import * as c2 from './c2';
import * as e1 from './e1';
import * as e2 from './e2';
import * as e3 from './e3';
import * as e4 from './e4';
import * as e6 from './e6';
import * as e7 from './e7';
import * as e8 from './e8';
import * as b11 from './b11';

export type ModuleContentEntry = {
  spec: ModuleSpec;
  buildSections: (moduleDef: ModuleDefinition, screenSlug: string) => SectionDescriptor[];
};

export const MODULE_CONTENT: Record<string, ModuleContentEntry> = {
  a1: { spec: a1.spec, buildSections: a1.buildSections },
  a2: { spec: a2.spec, buildSections: a2.buildSections },
  a3: { spec: a3.spec, buildSections: a3.buildSections },
  a4: { spec: a4.spec, buildSections: a4.buildSections },
  c1: { spec: c1.spec, buildSections: c1.buildSections },
  c2: { spec: c2.spec, buildSections: c2.buildSections },
  e1: { spec: e1.spec, buildSections: e1.buildSections },
  e2: { spec: e2.spec, buildSections: e2.buildSections },
  e3: { spec: e3.spec, buildSections: e3.buildSections },
  e4: { spec: e4.spec, buildSections: e4.buildSections },
  e6: { spec: e6.spec, buildSections: e6.buildSections },
  e7: { spec: e7.spec, buildSections: e7.buildSections },
  e8: { spec: e8.spec, buildSections: e8.buildSections },
  b11: { spec: b11.spec, buildSections: b11.buildSections },
};

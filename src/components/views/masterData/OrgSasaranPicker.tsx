/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Org-tree multi-select untuk sasaran Permintaan Pengumpulan Data (5.1 SF-512) — dikelompokkan
 * per Itwil dengan opsi "pilih semua turunan", mereplikasi pola org-tree sasaran pada
 * `27092026/prototipe-master-data.html` / portal-data-satker (Plan "Migrate 27092026
 * prototypes"). Juga dipakai untuk menampilkan org tree read-only di Master Data 4.1.
 */
import React, { useMemo, useState } from 'react';
import { ChevronDown, ChevronRight } from 'lucide-react';
import { Checkbox } from '../../ui';
import { getOrgById, getOrgKids, getItwilOf, useAuditUniverseStore, JENJANG_SASARAN } from '../../../data/auditUniverse';
import type { OrgUnit } from '../../../data/auditUniverse';

interface OrgSasaranPickerProps {
  selected: string[];
  onChange: (ids: string[]) => void;
  className?: string;
}

export const OrgSasaranPicker: React.FC<OrgSasaranPickerProps> = ({ selected, onChange, className }) => {
  const state = useAuditUniverseStore();
  const [expanded, setExpanded] = useState<Set<string>>(new Set(['ORG-00001']));
  const selectedSet = useMemo(() => new Set(selected), [selected]);

  const eligible = useMemo(
    () => state.orgUnits.filter((o) => o.aktif && JENJANG_SASARAN.includes(o.jenjang)),
    [state.orgUnits]
  );

  const byItwil = useMemo(() => {
    const groups = new Map<string, OrgUnit[]>();
    eligible.forEach((o) => {
      const itwil = getItwilOf(o) || 'Belum Ditetapkan';
      groups.set(itwil, [...(groups.get(itwil) ?? []), o]);
    });
    return Array.from(groups.entries()).sort(([a], [b]) => a.localeCompare(b));
  }, [eligible]);

  const toggle = (id: string) => {
    const next = new Set(selectedSet);
    if (next.has(id)) next.delete(id);
    else next.add(id);
    onChange(Array.from(next));
  };

  const toggleGroup = (ids: string[], checkAll: boolean) => {
    const next = new Set(selectedSet);
    ids.forEach((id) => (checkAll ? next.add(id) : next.delete(id)));
    onChange(Array.from(next));
  };

  const toggleExpand = (itwil: string) => {
    const next = new Set(expanded);
    if (next.has(itwil)) next.delete(itwil);
    else next.add(itwil);
    setExpanded(next);
  };

  return (
    <div className={className}>
      <div className="rounded-[10px] border border-[var(--sd-outline-variant)] divide-y divide-slate-100 max-h-80 overflow-y-auto">
        {byItwil.map(([itwil, orgs]) => {
          const ids = orgs.map((o) => o.id);
          const allChecked = ids.every((id) => selectedSet.has(id));
          const someChecked = ids.some((id) => selectedSet.has(id));
          const isOpen = expanded.has(itwil);
          return (
            <div key={itwil}>
              <div className="flex items-center gap-2 px-3 py-2 bg-slate-50/70">
                <button type="button" onClick={() => toggleExpand(itwil)} className="text-slate-400 hover:text-slate-600">
                  {isOpen ? <ChevronDown className="w-3.5 h-3.5" /> : <ChevronRight className="w-3.5 h-3.5" />}
                </button>
                <Checkbox
                  checked={allChecked}
                  onChange={(checked) => toggleGroup(ids, checked)}
                  label={<span className={`text-xs font-bold ${someChecked && !allChecked ? 'text-amber-700' : 'text-slate-700'}`}>{itwil} ({ids.length})</span>}
                />
              </div>
              {isOpen && (
                <div className="pl-8 pr-3 py-1.5 space-y-1">
                  {orgs.map((o) => (
                    <Checkbox
                      key={o.id}
                      checked={selectedSet.has(o.id)}
                      onChange={() => toggle(o.id)}
                      label={
                        <span className="text-xs text-slate-700">
                          {o.sing} <span className="text-slate-400">— {o.jenjang}</span>
                        </span>
                      }
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="mt-1.5 text-[11px] text-slate-400 font-semibold">{selected.length} Satker/unit dipilih sebagai sasaran.</p>
    </div>
  );
};

export const orgLabel = (id: string): string => {
  const org = getOrgById(id);
  return org ? `${org.sing} (${org.jenjang})` : id;
};

export const orgKidsOf = getOrgKids;

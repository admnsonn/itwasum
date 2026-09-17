import React, { createContext, useContext, useMemo, useState } from 'react';
import { Select } from '../components/ui/atoms';

export const PERIOD_OPTIONS = [
  'Triwulan I 2026',
  'Triwulan II 2026',
  'Triwulan III 2026',
  'Triwulan IV 2026',
] as const;

export type PeriodOption = (typeof PERIOD_OPTIONS)[number];

interface PeriodContextValue {
  periode: PeriodOption;
  setPeriode: (p: PeriodOption) => void;
  options: readonly PeriodOption[];
}

const PeriodContext = createContext<PeriodContextValue | null>(null);

export const PeriodProvider: React.FC<{ children: React.ReactNode; defaultPeriode?: PeriodOption }> = ({
  children,
  defaultPeriode = PERIOD_OPTIONS[0],
}) => {
  const [periode, setPeriode] = useState<PeriodOption>(defaultPeriode);
  const value = useMemo(
    () => ({ periode, setPeriode, options: PERIOD_OPTIONS }),
    [periode]
  );
  return <PeriodContext.Provider value={value}>{children}</PeriodContext.Provider>;
};

export function usePeriod(): PeriodContextValue {
  const ctx = useContext(PeriodContext);
  if (!ctx) {
    throw new Error('usePeriod harus dipakai di dalam PeriodProvider');
  }
  return ctx;
}

export const PeriodPicker: React.FC<{ className?: string }> = ({ className }) => {
  const { periode, setPeriode, options } = usePeriod();
  return (
    <Select
      className={className}
      value={periode}
      onChange={(v) => setPeriode(v as PeriodOption)}
      options={options.map((o) => ({ value: o, label: o }))}
    />
  );
};

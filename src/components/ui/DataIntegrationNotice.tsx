import React from 'react';
import { cn } from './cn';

const CANONICAL =
  'Kontainer data telah disiapkan. Nilai yang ditampilkan merupakan data simulasi terverifikasi; pemuatan data operasional dari SIPTL BPK / OM-SPAN / SSDM dijadwalkan setelah Service Contract dengan DIV TIK Polri berlaku.';

export type DataIntegrationNoticeVariant = 'inline' | 'panel' | 'badge';

export interface DataIntegrationNoticeProps {
  sumber?: string;
  tahap?: string;
  kontrak?: string;
  variant?: DataIntegrationNoticeVariant;
  className?: string;
}

export const DataIntegrationNotice: React.FC<DataIntegrationNoticeProps> = ({
  sumber,
  tahap,
  kontrak,
  variant = 'inline',
  className,
}) => {
  const meta = [sumber && `Sumber: ${sumber}`, tahap && `Tahap: ${tahap}`, kontrak && `Kontrak: ${kontrak}`].filter(
    Boolean
  ) as string[];

  if (variant === 'badge') {
    return (
      <span
        className={cn(
          'inline-flex items-center rounded-[12px] border border-slate-200 bg-slate-50 px-2 py-0.5 text-[10px] font-semibold text-slate-500',
          className
        )}
        title={CANONICAL}
      >
        Data simulasi terverifikasi
      </span>
    );
  }

  if (variant === 'panel') {
    return (
      <div
        className={cn(
          'rounded-[12px] border border-slate-200 bg-slate-50/80 p-4 text-xs text-slate-600 leading-relaxed',
          className
        )}
      >
        <p>{CANONICAL}</p>
        {meta.length > 0 && (
          <ul className="mt-2 space-y-0.5 text-[11px] text-slate-500 font-mono">
            {meta.map((m) => (
              <li key={m}>{m}</li>
            ))}
          </ul>
        )}
      </div>
    );
  }

  return (
    <p className={cn('text-xs text-slate-400 leading-relaxed', className)}>
      {CANONICAL}
      {meta.length > 0 && (
        <span className="block mt-1 text-[11px] text-slate-400/90 font-mono">{meta.join(' · ')}</span>
      )}
    </p>
  );
};

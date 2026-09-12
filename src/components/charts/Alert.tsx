/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Reimplementasi ringan dari `molecules/Alert` pada branch
 * `feature/ITWAS-231/create-reusable-component-part-3` di `evidence/satu-data-itwasum-frontend`
 * (dibaca read-only via `git show`, TIDAK disalin baris demi baris - ditulis ulang untuk
 * Tailwind v4 lokal tanpa dependensi baru). Lihat Plan 2 bagian 2.3.
 */
import React from 'react';
import { Info, CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

export type AlertTone = 'info' | 'success' | 'warning' | 'danger';

const STYLE: Record<AlertTone, { bg: string; border: string; text: string; icon: React.ComponentType<{ className?: string }> }> = {
  info: { bg: 'bg-blue-50', border: 'border-blue-200', text: 'text-blue-800', icon: Info },
  success: { bg: 'bg-emerald-50', border: 'border-emerald-200', text: 'text-emerald-800', icon: CheckCircle2 },
  warning: { bg: 'bg-amber-50', border: 'border-amber-200', text: 'text-amber-800', icon: AlertTriangle },
  danger: { bg: 'bg-rose-50', border: 'border-rose-200', text: 'text-rose-800', icon: XCircle },
};

export interface AlertProps {
  tone?: AlertTone;
  title?: string;
  children: React.ReactNode;
  className?: string;
}

export const Alert: React.FC<AlertProps> = ({ tone = 'info', title, children, className = '' }) => {
  const s = STYLE[tone];
  const Icon = s.icon;
  return (
    <div className={`rounded-2xl border ${s.border} ${s.bg} p-3.5 flex items-start gap-2.5 ${className}`}>
      <Icon className={`w-4 h-4 shrink-0 mt-0.5 ${s.text}`} />
      <div className={`text-xs ${s.text} leading-relaxed`}>
        {title && <div className="font-bold mb-0.5">{title}</div>}
        {children}
      </div>
    </div>
  );
};

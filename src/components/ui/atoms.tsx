/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Lapisan atoms design-system baru (Plan "Align itwasum with BA-SA specs", bagian 1).
 * Ditulis ulang dengan tangan mengikuti pola visual satu-data-itwasum-frontend
 * (origin/development:src/components/atoms/*), BUKAN salinan file. Dipakai hanya oleh
 * halaman modul baru (B.1/B.6/B.9 replikasi + 11 modul BA-SA-Lanjutan); shell & view
 * lama tetap memakai kelas Tailwind inline seperti sebelumnya.
 *
 * PENTING: `src/index.css` memaksa `.rounded-2xl/.rounded-xl/.rounded-lg/.shadow-lg/.shadow-md`
 * ke nilai lain via `!important` untuk keperluan tampilan lama. Seluruh komponen di sini SENGAJA
 * memakai radius/shadow bernilai arbitrer (`rounded-[12px]`, `shadow-[0_1px_10px_rgb(0,0,0,0.06)]`)
 * agar lolos dari override tersebut dan konsisten dengan referensi.
 */
import React from 'react';
import { Check, ChevronRight, Loader2, Lock } from 'lucide-react';
import { cn } from './cn';

/* ============================== Button ============================== */

export type ButtonVariant = 'primary' | 'secondary' | 'outline' | 'danger' | 'ghost';
export type ButtonSize = 'sm' | 'md' | 'lg' | 'icon';

const BUTTON_VARIANT_CLASS: Record<ButtonVariant, string> = {
  primary: 'bg-[var(--sd-primary)] text-white hover:bg-[var(--sd-primary-container)] border border-transparent',
  secondary: 'bg-[var(--sd-inverse-primary)]/30 text-[var(--sd-primary)] hover:bg-[var(--sd-inverse-primary)]/50 border border-transparent',
  outline: 'bg-white text-[var(--sd-primary)] border border-[var(--sd-outline-variant)] hover:bg-slate-50',
  danger: 'bg-white text-[var(--sd-error)] border border-[var(--sd-error)]/50 hover:bg-[var(--sd-error-container)]',
  ghost: 'bg-transparent text-[var(--sd-secondary)] hover:bg-slate-100 border border-transparent',
};

const BUTTON_SIZE_CLASS: Record<ButtonSize, string> = {
  sm: 'h-8 px-3 text-xs gap-1.5',
  md: 'h-10 px-4 text-sm gap-2',
  lg: 'h-11 px-5 text-sm gap-2',
  icon: 'h-9 w-9 p-0 justify-center',
};

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  isLoading?: boolean;
}

export const Button: React.FC<ButtonProps> = ({
  variant = 'primary',
  size = 'md',
  isLoading = false,
  className,
  children,
  disabled,
  ...rest
}) => (
  <button
    className={cn(
      'inline-flex items-center rounded-[10px] font-bold whitespace-nowrap transition-colors disabled:opacity-50 disabled:cursor-not-allowed',
      BUTTON_VARIANT_CLASS[variant],
      BUTTON_SIZE_CLASS[size],
      className
    )}
    disabled={disabled || isLoading}
    {...rest}
  >
    {isLoading && <Loader2 className="w-3.5 h-3.5 animate-spin" />}
    {children}
  </button>
);

/* ============================== Badge ============================== */

export type BadgeColor =
  | 'success' | 'info' | 'warning' | 'danger' | 'neutral'
  | 'primary' | 'indigo' | 'brown' | 'teal' | 'violet';

const BADGE_COLOR_CLASS: Record<BadgeColor, { bg: string; text: string; dot: string; border: string }> = {
  success: { bg: 'bg-[var(--sd-success-container)]', text: 'text-[var(--sd-success)]', dot: 'bg-[var(--sd-success)]', border: 'border-[var(--sd-success)]/30' },
  info: { bg: 'bg-blue-50', text: 'text-blue-700', dot: 'bg-blue-500', border: 'border-blue-200' },
  warning: { bg: 'bg-[var(--sd-warning-container)]', text: 'text-amber-800', dot: 'bg-amber-500', border: 'border-amber-300' },
  danger: { bg: 'bg-[var(--sd-error-container)]', text: 'text-[var(--sd-error)]', dot: 'bg-[var(--sd-error)]', border: 'border-[var(--sd-error)]/30' },
  neutral: { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-400', border: 'border-slate-200' },
  primary: { bg: 'bg-[var(--sd-inverse-primary)]/40', text: 'text-[var(--sd-primary)]', dot: 'bg-[var(--sd-primary)]', border: 'border-[var(--sd-primary)]/20' },
  indigo: { bg: 'bg-indigo-50', text: 'text-indigo-700', dot: 'bg-indigo-500', border: 'border-indigo-200' },
  brown: { bg: 'bg-orange-50', text: 'text-orange-800', dot: 'bg-orange-600', border: 'border-orange-200' },
  teal: { bg: 'bg-teal-50', text: 'text-teal-700', dot: 'bg-teal-500', border: 'border-teal-200' },
  violet: { bg: 'bg-violet-50', text: 'text-violet-700', dot: 'bg-violet-500', border: 'border-violet-200' },
};

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'pill' | 'square';
  size?: 'lg' | 'sm';
  color?: BadgeColor;
  isShowDot?: boolean;
  className?: string;
  icon?: React.ReactNode;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'pill',
  size = 'sm',
  color = 'neutral',
  isShowDot = true,
  className,
  icon,
}) => {
  const c = BADGE_COLOR_CLASS[color];
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 font-bold border',
        variant === 'pill' ? 'rounded-full' : 'rounded-[4px]',
        size === 'lg' ? 'px-3 py-1 text-xs' : 'px-2 py-0.5 text-[10px]',
        c.bg, c.text, c.border,
        className
      )}
    >
      {icon}
      {!icon && isShowDot && <span className={cn('w-1.5 h-1.5 rounded-full shrink-0', c.dot)} />}
      {children}
    </span>
  );
};

/* ============================== Card ============================== */

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'filled' | 'outline' | 'bg';
}

export const Card: React.FC<CardProps> = ({ variant = 'filled', className, children, ...rest }) => (
  <div
    className={cn(
      'rounded-[12px]',
      variant === 'filled' && 'bg-white border border-[var(--sd-outline-variant)]/40 shadow-[0_1px_10px_rgb(0,0,0,0.06)]',
      variant === 'outline' && 'bg-white border border-[var(--sd-outline-variant)]',
      variant === 'bg' && 'bg-[var(--sd-surface)]',
      'p-4',
      className
    )}
    {...rest}
  >
    {children}
  </div>
);

/* ============================== Typography ============================== */

export type TypographyVariant =
  | 'headline-xl' | 'headline-lg' | 'headline-md'
  | 'body-lg' | 'body-md' | 'body-sm'
  | 'label-bold' | 'label-sm';

const TYPOGRAPHY_CLASS: Record<TypographyVariant, string> = {
  'headline-xl': 'text-4xl md:text-5xl font-extrabold leading-tight',
  'headline-lg': 'text-2xl md:text-3xl font-extrabold leading-tight',
  'headline-md': 'text-xl md:text-2xl font-bold leading-snug',
  'body-lg': 'text-lg leading-relaxed',
  'body-md': 'text-base leading-relaxed',
  'body-sm': 'text-sm leading-relaxed',
  'label-bold': 'text-sm font-bold uppercase tracking-wide',
  'label-sm': 'text-xs font-semibold uppercase tracking-wide',
};

export const Typography: React.FC<{ variant: TypographyVariant; as?: keyof React.JSX.IntrinsicElements; className?: string; children: React.ReactNode }> = ({
  variant,
  as,
  className,
  children,
}) => {
  const Tag = (as || 'p') as any;
  return <Tag className={cn(TYPOGRAPHY_CLASS[variant], className)}>{children}</Tag>;
};

/* ============================== Form primitives ============================== */

export interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  hasError?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
}

export const Input: React.FC<InputProps> = ({ hasError, leftIcon, rightIcon, className, ...rest }) => (
  <div className="relative">
    {leftIcon && <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400">{leftIcon}</span>}
    <input
      className={cn(
        'w-full h-10 rounded-[10px] border bg-white px-3 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--sd-primary)]/20 focus:border-[var(--sd-primary)]',
        hasError ? 'border-[var(--sd-error)]' : 'border-[var(--sd-outline-variant)]',
        leftIcon && 'pl-9',
        rightIcon && 'pr-9',
        className
      )}
      {...rest}
    />
    {rightIcon && <span className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400">{rightIcon}</span>}
  </div>
);

export interface SelectOption { value: string; label: string }

export interface SelectProps {
  options: SelectOption[];
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  hasError?: boolean;
  className?: string;
  disabled?: boolean;
}

export const Select: React.FC<SelectProps> = ({ options, value, onChange, placeholder, hasError, className, disabled }) => (
  <select
    value={value}
    disabled={disabled}
    onChange={(e) => onChange(e.target.value)}
    className={cn(
      'w-full h-10 rounded-[10px] border bg-white px-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-[var(--sd-primary)]/20 focus:border-[var(--sd-primary)] disabled:opacity-50',
      hasError ? 'border-[var(--sd-error)]' : 'border-[var(--sd-outline-variant)]',
      className
    )}
  >
    {placeholder && <option value="">{placeholder}</option>}
    {options.map((o) => (
      <option key={o.value} value={o.value}>{o.label}</option>
    ))}
  </select>
);

export const Textarea: React.FC<React.TextareaHTMLAttributes<HTMLTextAreaElement> & { hasError?: boolean }> = ({
  hasError,
  className,
  ...rest
}) => (
  <textarea
    className={cn(
      'w-full rounded-[10px] border bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-[var(--sd-primary)]/20 focus:border-[var(--sd-primary)]',
      hasError ? 'border-[var(--sd-error)]' : 'border-[var(--sd-outline-variant)]',
      className
    )}
    {...rest}
  />
);

export const Checkbox: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; label?: React.ReactNode; disabled?: boolean; className?: string }> = ({
  checked,
  onChange,
  label,
  disabled,
  className,
}) => (
  <label className={cn('inline-flex items-center gap-2 text-sm text-slate-700 cursor-pointer', disabled && 'opacity-50 cursor-not-allowed', className)}>
    <span
      onClick={() => !disabled && onChange(!checked)}
      className={cn(
        'w-4.5 h-4.5 w-[18px] h-[18px] rounded-[4px] border flex items-center justify-center shrink-0 transition-colors',
        checked ? 'bg-[var(--sd-primary)] border-[var(--sd-primary)]' : 'bg-white border-[var(--sd-outline-variant)]'
      )}
    >
      {checked && <Check className="w-3 h-3 text-white" strokeWidth={3} />}
    </span>
    {label}
  </label>
);

export const Toggle: React.FC<{ checked: boolean; onChange: (checked: boolean) => void; disabled?: boolean; className?: string }> = ({
  checked,
  onChange,
  disabled,
  className,
}) => (
  <button
    type="button"
    role="switch"
    aria-checked={checked}
    disabled={disabled}
    onClick={() => onChange(!checked)}
    className={cn(
      'relative w-10 h-6 rounded-full transition-colors disabled:opacity-50',
      checked ? 'bg-[var(--sd-primary)]' : 'bg-slate-300',
      className
    )}
  >
    <span
      className={cn(
        'absolute top-0.5 left-0.5 w-5 h-5 rounded-full bg-white shadow transition-transform',
        checked && 'translate-x-4'
      )}
    />
  </button>
);

export const Spinner: React.FC<{ size?: 'sm' | 'md' | 'lg'; className?: string }> = ({ size = 'md', className }) => {
  const sizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-8 h-8' : 'w-6 h-6';
  return <Loader2 className={cn(sizeClass, 'animate-spin text-[var(--sd-primary)]', className)} />;
};

export const ProgressBar: React.FC<{ label?: string; value: number; max?: number; color?: string; className?: string; showValue?: boolean }> = ({
  label,
  value,
  max = 100,
  color = 'var(--sd-primary)',
  className,
  showValue = true,
}) => {
  const pct = Math.max(0, Math.min(100, (value / max) * 100));
  return (
    <div className={cn('w-full', className)}>
      {(label || showValue) && (
        <div className="flex items-center justify-between mb-1 text-xs font-semibold text-slate-600">
          <span>{label}</span>
          {showValue && <span>{pct.toFixed(0)}%</span>}
        </div>
      )}
      <div className="w-full h-2 rounded-full bg-slate-100 overflow-hidden">
        <div className="h-full rounded-full transition-all" style={{ width: `${pct}%`, backgroundColor: color }} />
      </div>
    </div>
  );
};

export interface BreadcrumbItem { label: string; href?: string }

export const Breadcrumbs: React.FC<{ items: BreadcrumbItem[]; onNavigate?: (item: BreadcrumbItem, index: number) => void; className?: string }> = ({
  items,
  onNavigate,
  className,
}) => (
  <nav className={cn('flex items-center gap-1.5 text-xs font-semibold flex-wrap', className)}>
    {items.map((item, i) => {
      const isLast = i === items.length - 1;
      return (
        <React.Fragment key={`${item.label}-${i}`}>
          {i > 0 && <ChevronRight className="w-3 h-3 text-slate-400" />}
          {isLast ? (
            <span className="px-2 py-0.5 rounded-full bg-[var(--sd-inverse-primary)]/40 text-[var(--sd-primary)]">{item.label}</span>
          ) : (
            <button
              onClick={() => onNavigate?.(item, i)}
              className="text-slate-500 hover:text-[var(--sd-primary)] transition-colors"
            >
              {item.label}
            </button>
          )}
        </React.Fragment>
      );
    })}
  </nav>
);

/* ============================== CircularProgress ============================== */

export const CircularProgress: React.FC<{
  value: number; // 0-100
  size?: number;
  strokeWidth?: number;
  color?: string;
  trackColor?: string;
  label?: string;
  caption?: string;
  displayValue?: string;
  className?: string;
}> = ({ value, size = 96, strokeWidth = 8, color = '#ffffff', trackColor = 'rgba(255,255,255,0.2)', label, caption, displayValue, className }) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (Math.max(0, Math.min(100, value)) / 100) * circumference;
  return (
    <div className={cn('flex flex-col items-center justify-center', className)}>
      <div className="relative" style={{ width: size, height: size }}>
        <svg width={size} height={size} className="rotate-[-90deg]">
          <circle cx={size / 2} cy={size / 2} r={radius} stroke={trackColor} strokeWidth={strokeWidth} fill="none" />
          <circle
            cx={size / 2}
            cy={size / 2}
            r={radius}
            stroke={color}
            strokeWidth={strokeWidth}
            fill="none"
            strokeDasharray={circumference}
            strokeDashoffset={offset}
            strokeLinecap="round"
          />
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center">
          <span className="text-xl font-extrabold" style={{ color }}>{displayValue ?? `${Math.round(value)}%`}</span>
        </div>
      </div>
      {label && <span className="mt-2 text-xs font-bold uppercase tracking-wide" style={{ color }}>{label}</span>}
      {caption && <span className="text-[10px] text-center max-w-[140px] opacity-80" style={{ color }}>{caption}</span>}
    </div>
  );
};

/* ============================== Domain badges ============================== */

export const RiskPriorityBadge: React.FC<{ level: 'TINGGI' | 'SEDANG' | 'RENDAH'; className?: string }> = ({ level, className }) => {
  const color: BadgeColor = level === 'TINGGI' ? 'danger' : level === 'SEDANG' ? 'warning' : 'success';
  return <Badge color={color} variant="square" className={className}>{level}</Badge>;
};

export type AccountStatus = 'Menunggu Aktivasi' | 'Aktif' | 'Dibekukan';

export const AccountStatusBadge: React.FC<{ status: AccountStatus; className?: string }> = ({ status, className }) => {
  const color: BadgeColor = status === 'Aktif' ? 'success' : status === 'Dibekukan' ? 'danger' : 'warning';
  return <Badge color={color} className={className}>{status}</Badge>;
};

export const AuditorAvatar: React.FC<{ name: string; photoUrl?: string; status?: 'aktif' | 'tugas' | 'nonaktif'; size?: number; className?: string }> = ({
  name,
  photoUrl,
  status = 'aktif',
  size = 36,
  className,
}) => {
  const initials = name
    .replace(/\b(Kombes Pol\.|Kompol|AKBP|AKP|Irjen Pol\.|Komjen Pol\.|Brigjen Pol\.|Drs\.|Dr\.|S\.I\.K\.|S\.H\.|M\.H\.|M\.Si\.|M\.M\.|S\.E\.|,|\.)\b/g, '')
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join('')
    .toUpperCase();
  const dotColor = status === 'aktif' ? 'bg-emerald-500' : status === 'tugas' ? 'bg-amber-500' : 'bg-slate-400';
  return (
    <span className={cn('relative inline-flex items-center justify-center rounded-full bg-[var(--sd-inverse-primary)]/50 text-[var(--sd-primary)] font-bold shrink-0 overflow-hidden', className)} style={{ width: size, height: size, fontSize: size * 0.32 }}>
      {photoUrl ? <img src={photoUrl} alt={name} className="w-full h-full object-cover" /> : initials}
      <span className={cn('absolute bottom-0 right-0 w-2 h-2 rounded-full ring-2 ring-white', dotColor)} />
    </span>
  );
};

export const LockIcon = Lock;

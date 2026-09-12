/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Lapisan molecules design-system baru (Plan "Align itwasum with BA-SA specs", bagian 1).
 * Lihat catatan lisensi & konvensi di `atoms.tsx`.
 */
import React, { useEffect, useState } from 'react';
import {
  Check,
  ChevronLeft,
  ChevronRight,
  Lock,
  Search as SearchIcon,
  Upload,
  X,
} from 'lucide-react';
import { cn } from './cn';
import { Badge, Button, Card, Input, Select, Spinner, type SelectOption } from './atoms';

/* ============================== Table ============================== */

export interface TableColumn<T> {
  key: string;
  header: React.ReactNode;
  accessor?: keyof T;
  render?: (row: T, index: number) => React.ReactNode;
  className?: string;
  headerClassName?: string;
  fixed?: 'left' | 'right';
}

export interface TableProps<T> {
  columns: TableColumn<T>[];
  data: T[];
  loading?: boolean;
  title?: React.ReactNode;
  hideHeader?: boolean;
  rowKey?: (row: T, index: number) => string;
  className?: string;
  emptyLabel?: string;
}

export function Table<T>({ columns, data, loading, title, hideHeader, rowKey, className, emptyLabel = 'Data tidak ditemukan' }: TableProps<T>) {
  return (
    <div className={cn('w-full', className)}>
      {title && <div className="mb-3 text-sm font-bold text-slate-800">{title}</div>}
      <div className="overflow-x-auto rounded-[10px] border border-[var(--sd-outline-variant)]/50">
        <table className="w-full text-sm">
          {!hideHeader && (
            <thead className="bg-[var(--sd-surface)]">
              <tr>
                {columns.map((col) => (
                  <th key={col.key} className={cn('text-left px-3 py-2.5 text-[11px] font-bold uppercase tracking-wide text-slate-500 whitespace-nowrap', col.headerClassName)}>
                    {col.header}
                  </th>
                ))}
              </tr>
            </thead>
          )}
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center">
                  <Spinner className="mx-auto" />
                </td>
              </tr>
            ) : data.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="py-10 text-center text-sm text-slate-400 font-semibold">
                  {emptyLabel}
                </td>
              </tr>
            ) : (
              data.map((row, i) => (
                <tr key={rowKey ? rowKey(row, i) : i} className="hover:bg-slate-50/70 transition-colors">
                  {columns.map((col) => (
                    <td key={col.key} className={cn('px-3 py-2.5 align-middle', col.className)}>
                      {col.render ? col.render(row, i) : col.accessor ? String(row[col.accessor] ?? '-') : null}
                    </td>
                  ))}
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

/* ============================== Pagination ============================== */

export interface PaginationProps {
  currentPage: number;
  totalItems: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onPageSizeChange?: (size: number) => void;
  pageSizeOptions?: number[];
  summaryMode?: 'range' | 'count';
  itemLabel?: string;
  align?: 'between' | 'end';
  className?: string;
}

export const Pagination: React.FC<PaginationProps> = ({
  currentPage,
  totalItems,
  pageSize,
  onPageChange,
  onPageSizeChange,
  pageSizeOptions = [10, 25, 50],
  summaryMode = 'range',
  itemLabel = 'entri',
  align = 'between',
  className,
}) => {
  const totalPages = Math.max(1, Math.ceil(totalItems / pageSize));
  const from = totalItems === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  const to = Math.min(totalItems, currentPage * pageSize);

  return (
    <div className={cn('flex flex-wrap items-center gap-3 pt-3', align === 'between' ? 'justify-between' : 'justify-end', className)}>
      <div className="flex items-center gap-2 text-xs text-slate-500 font-medium">
        {summaryMode === 'count' ? (
          <span>Menampilkan {Math.min(pageSize, totalItems)} dari {totalItems} {itemLabel}</span>
        ) : (
          <span>Menampilkan {from}-{to} dari {totalItems} {itemLabel}</span>
        )}
        {onPageSizeChange && (
          <select
            value={pageSize}
            onChange={(e) => onPageSizeChange(Number(e.target.value))}
            className="h-8 rounded-[8px] border border-[var(--sd-outline-variant)] bg-white px-2 text-xs"
          >
            {pageSizeOptions.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        )}
      </div>
      <div className="flex items-center gap-1">
        <button
          disabled={currentPage <= 1}
          onClick={() => onPageChange(currentPage - 1)}
          className="w-9 h-9 rounded-[8px] border border-[var(--sd-outline-variant)] flex items-center justify-center disabled:opacity-40 hover:bg-slate-50"
        >
          <ChevronLeft className="w-4 h-4" />
        </button>
        <span className="w-9 h-9 rounded-[8px] bg-[var(--sd-primary)] text-white flex items-center justify-center text-xs font-bold">
          {currentPage}
        </span>
        <span className="text-xs text-slate-400 px-1">/ {totalPages}</span>
        <button
          disabled={currentPage >= totalPages}
          onClick={() => onPageChange(currentPage + 1)}
          className="w-9 h-9 rounded-[8px] border border-[var(--sd-outline-variant)] flex items-center justify-center disabled:opacity-40 hover:bg-slate-50"
        >
          <ChevronRight className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
};

/** Hook kecil untuk mengelola state paginasi sisi klien secara konsisten. */
export function usePagination<T>(items: T[], initialPageSize = 10) {
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(initialPageSize);
  useEffect(() => setPage(1), [items.length, pageSize]);
  const totalPages = Math.max(1, Math.ceil(items.length / pageSize));
  const safePage = Math.min(page, totalPages);
  const pageItems = items.slice((safePage - 1) * pageSize, safePage * pageSize);
  return { page: safePage, pageSize, setPage, setPageSize, pageItems, totalPages };
}

/* ============================== Modal ============================== */

export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: React.ReactNode;
  description?: React.ReactNode;
  footer?: React.ReactNode;
  placement?: 'center' | 'right';
  children: React.ReactNode;
  widthClassName?: string;
}

export const Modal: React.FC<ModalProps> = ({ isOpen, onClose, title, description, footer, placement = 'center', children, widthClassName }) => {
  useEffect(() => {
    if (!isOpen) return;
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[200] flex items-stretch" role="dialog" aria-modal="true">
      <div className="absolute inset-0 bg-black/50" onClick={onClose} />
      <div
        className={cn(
          'relative bg-white shadow-2xl flex flex-col',
          placement === 'center'
            ? cn('m-auto w-full rounded-[16px] max-h-[90vh]', widthClassName || 'max-w-lg')
            : cn('ml-auto h-full w-full', widthClassName || 'max-w-md')
        )}
      >
        {(title || description) && (
          <div className="flex items-start justify-between gap-3 px-5 py-4 border-b border-slate-100">
            <div>
              {title && <h3 className="text-base font-extrabold text-slate-900">{title}</h3>}
              {description && <p className="text-xs text-slate-500 mt-1">{description}</p>}
            </div>
            <button onClick={onClose} className="w-8 h-8 rounded-full hover:bg-slate-100 flex items-center justify-center shrink-0">
              <X className="w-4 h-4 text-slate-500" />
            </button>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-5 py-4">{children}</div>
        {footer && <div className="px-5 py-3.5 border-t border-slate-100 flex items-center justify-end gap-2">{footer}</div>}
      </div>
    </div>
  );
};

/* ============================== Search ============================== */

export const Search: React.FC<{ value: string; onChange: (v: string) => void; placeholder?: string; className?: string }> = ({
  value,
  onChange,
  placeholder = 'Cari...',
  className,
}) => (
  <Input
    value={value}
    onChange={(e) => onChange(e.target.value)}
    placeholder={placeholder}
    leftIcon={<SearchIcon className="w-4 h-4" />}
    className={cn('rounded-[16px]', className)}
  />
);

/* ============================== FilterPanel ============================== */

export interface FilterFieldSelect {
  type: 'select';
  key: string;
  label: string;
  options: SelectOption[];
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
}
export interface FilterFieldDate {
  type: 'date';
  key: string;
  label: string;
  value: string;
  onChange: (v: string) => void;
}
export type FilterField = FilterFieldSelect | FilterFieldDate;

export const FilterPanel: React.FC<{
  fields: FilterField[];
  search?: { value: string; onChange: (v: string) => void; placeholder?: string };
  headerActions?: React.ReactNode;
  onApply?: () => void;
  applyLabel?: string;
  className?: string;
}> = ({ fields, search, headerActions, onApply, applyLabel = 'Tampilkan Hasil', className }) => (
  <Card className={cn('space-y-3', className)}>
    {headerActions && <div className="flex justify-end">{headerActions}</div>}
    {search && <Search value={search.value} onChange={search.onChange} placeholder={search.placeholder} />}
    <div className={cn('grid gap-3', fields.length > 0 && 'sm:grid-cols-2 lg:grid-cols-4')}>
      {fields.map((f) => (
        <div key={f.key}>
          <label className="block text-[11px] font-bold uppercase tracking-wide text-slate-500 mb-1">{f.label}</label>
          {f.type === 'select' ? (
            <Select options={f.options} value={f.value} onChange={f.onChange} placeholder={f.placeholder} />
          ) : (
            <Input type="date" value={f.value} onChange={(e) => f.onChange(e.target.value)} />
          )}
        </div>
      ))}
      {onApply && (
        <div className="flex items-end">
          <Button onClick={onApply} className="w-full">{applyLabel}</Button>
        </div>
      )}
    </div>
  </Card>
);

/* ============================== TabNavigation ============================== */

export interface TabDef { id: string; label: string; icon?: React.ComponentType<{ className?: string }> }

export const TabNavigation: React.FC<{ tabs: TabDef[]; activeTab: string; onTabChange: (id: string) => void; className?: string }> = ({
  tabs,
  activeTab,
  onTabChange,
  className,
}) => (
  <div className={cn('flex items-center gap-1.5 overflow-x-auto rounded-[12px] bg-[var(--sd-surface)] p-1.5', className)}>
    {tabs.map((tab) => {
      const isActive = tab.id === activeTab;
      const Icon = tab.icon;
      return (
        <button
          key={tab.id}
          onClick={() => onTabChange(tab.id)}
          className={cn(
            'flex items-center gap-1.5 px-3.5 py-2 rounded-[10px] text-xs font-bold whitespace-nowrap transition-colors',
            isActive ? 'bg-[var(--sd-primary)] text-white shadow' : 'text-slate-600 hover:bg-white/70'
          )}
        >
          {Icon && <Icon className="w-3.5 h-3.5" />}
          {tab.label}
        </button>
      );
    })}
  </div>
);

/* ============================== SegmentedControl ============================== */

export const SegmentedControl: React.FC<{
  options: { value: string; label: string }[];
  value: string;
  onChange: (v: string) => void;
  variant?: 'default' | 'pill';
  className?: string;
}> = ({ options, value, onChange, variant = 'pill', className }) => (
  <div className={cn('inline-flex items-center gap-1 rounded-full bg-slate-100 p-1', className)}>
    {options.map((o) => (
      <button
        key={o.value}
        onClick={() => onChange(o.value)}
        className={cn(
          'px-3.5 py-1.5 text-xs font-bold rounded-full transition-colors',
          value === o.value ? 'bg-[var(--sd-primary)] text-white shadow' : 'text-slate-600 hover:text-slate-900'
        )}
      >
        {o.label}
      </button>
    ))}
  </div>
);

/* ============================== StatCard ============================== */

export const StatCard: React.FC<{
  label: string;
  value: React.ReactNode;
  change?: { direction: 'up' | 'down' | 'flat'; label: string };
  footer?: React.ReactNode;
  variant?: 'default' | 'metric';
  className?: string;
}> = ({ label, value, change, footer, className }) => (
  <Card className={cn('p-3.5', className)}>
    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-wide truncate">{label}</div>
    <div className="text-xl font-extrabold text-slate-900 mt-1">{value}</div>
    {change && (
      <div className={cn('text-[11px] font-bold mt-0.5', change.direction === 'up' ? 'text-emerald-600' : change.direction === 'down' ? 'text-rose-600' : 'text-slate-400')}>
        {change.direction === 'up' ? '▲' : change.direction === 'down' ? '▼' : '–'} {change.label}
      </div>
    )}
    {footer && <div className="mt-2 pt-2 border-t border-slate-100 text-[11px] text-slate-500">{footer}</div>}
  </Card>
);

/* ============================== StepIndicator ============================== */

export const StepIndicator: React.FC<{ steps: string[]; currentStep: number; className?: string }> = ({ steps, currentStep, className }) => (
  <div className={cn('flex items-center gap-2', className)}>
    {steps.map((s, i) => {
      const done = i < currentStep;
      const active = i === currentStep;
      return (
        <React.Fragment key={s}>
          <div className="flex items-center gap-2">
            <span
              className={cn(
                'w-6 h-6 rounded-full flex items-center justify-center text-[11px] font-bold shrink-0',
                done ? 'bg-[var(--sd-success)] text-white' : active ? 'bg-[var(--sd-primary)] text-white' : 'bg-slate-200 text-slate-500'
              )}
            >
              {done ? <Check className="w-3.5 h-3.5" /> : i + 1}
            </span>
            <span className={cn('text-xs font-bold whitespace-nowrap', active ? 'text-slate-900' : 'text-slate-400')}>{s}</span>
          </div>
          {i < steps.length - 1 && <div className="w-6 h-px bg-slate-200" />}
        </React.Fragment>
      );
    })}
  </div>
);

/* ============================== Timeline ============================== */

export interface TimelineItem { id: string; title: string; description?: string; timestamp: string; tone?: 'default' | 'success' | 'warning' | 'danger' }

export const Timeline: React.FC<{ items: TimelineItem[]; className?: string }> = ({ items, className }) => (
  <ol className={cn('relative border-l border-slate-200 pl-4 space-y-4', className)}>
    {items.map((item) => {
      const dotColor =
        item.tone === 'success' ? 'bg-[var(--sd-success)]' :
        item.tone === 'warning' ? 'bg-amber-500' :
        item.tone === 'danger' ? 'bg-[var(--sd-error)]' : 'bg-[var(--sd-primary)]';
      return (
        <li key={item.id} className="relative">
          <span className={cn('absolute -left-[21px] top-1 w-2.5 h-2.5 rounded-full ring-2 ring-white', dotColor)} />
          <div className="text-xs font-bold text-slate-800">{item.title}</div>
          {item.description && <div className="text-xs text-slate-500 mt-0.5">{item.description}</div>}
          <div className="text-[10px] text-slate-400 mt-0.5">{item.timestamp}</div>
        </li>
      );
    })}
  </ol>
);

/* ============================== UploadDropzone ============================== */

export const UploadDropzone: React.FC<{
  onFiles: (files: File[]) => void;
  accept?: string;
  maxSizeMB?: number;
  multiple?: boolean;
  error?: string;
  hint?: string;
  className?: string;
}> = ({ onFiles, accept, maxSizeMB = 20, multiple, error, hint, className }) => {
  const [dragOver, setDragOver] = useState(false);

  const handleFiles = (fileList: FileList | null) => {
    if (!fileList) return;
    onFiles(Array.from(fileList));
  };

  return (
    <div className={className}>
      <label
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={(e) => { e.preventDefault(); setDragOver(false); handleFiles(e.dataTransfer.files); }}
        className={cn(
          'flex flex-col items-center justify-center gap-2 rounded-[12px] border-2 border-dashed px-4 py-8 text-center cursor-pointer transition-colors',
          dragOver ? 'border-[var(--sd-primary)] bg-[var(--sd-inverse-primary)]/10' : 'border-[var(--sd-outline-variant)] bg-slate-50/50 hover:bg-slate-50',
          error && 'border-[var(--sd-error)]'
        )}
      >
        <Upload className="w-6 h-6 text-slate-400" />
        <span className="text-xs font-bold text-slate-600">Klik atau seret berkas ke sini</span>
        <span className="text-[10px] text-slate-400">{hint || `Maks ${maxSizeMB} MB per berkas`}</span>
        <input type="file" accept={accept} multiple={multiple} className="hidden" onChange={(e) => handleFiles(e.target.files)} />
      </label>
      {error && <p className="mt-1.5 text-[11px] font-semibold text-[var(--sd-error)]">{error}</p>}
    </div>
  );
};

/* ============================== EmptyState ============================== */

export const EmptyState: React.FC<{ title: string; description?: string; icon?: React.ReactNode; action?: React.ReactNode; className?: string }> = ({
  title,
  description,
  icon,
  action,
  className,
}) => (
  <div className={cn('flex flex-col items-center justify-center gap-2 py-10 text-center', className)}>
    {icon}
    <div className="text-sm font-bold text-slate-700">{title}</div>
    {description && <div className="text-xs text-slate-400 max-w-sm">{description}</div>}
    {action}
  </div>
);

/* ============================== ForbiddenState ============================== */

export const ForbiddenState: React.FC<{ title?: string; description?: string; className?: string }> = ({
  title = 'Akses Ditolak',
  description = 'Anda tidak memiliki hak akses untuk melihat konten pada bagian ini sesuai Business Rule modul terkait.',
  className,
}) => (
  <Card variant="bg" className={cn('flex flex-col items-center justify-center gap-3 py-12 text-center', className)}>
    <span className="w-12 h-12 rounded-full bg-[var(--sd-error-container)] flex items-center justify-center">
      <Lock className="w-6 h-6 text-[var(--sd-error)]" />
    </span>
    <div className="text-sm font-extrabold text-slate-800">{title}</div>
    <div className="text-xs text-slate-500 max-w-sm">{description}</div>
  </Card>
);

/* ============================== ApprovalStep ============================== */

export interface ApprovalStepItem {
  id: string;
  actor: string;
  role: string;
  status: 'menunggu' | 'disetujui' | 'ditolak' | 'terlewati';
  note?: string;
  timestamp?: string;
}

export const ApprovalStep: React.FC<{ steps: ApprovalStepItem[]; className?: string }> = ({ steps, className }) => (
  <div className={cn('space-y-2', className)}>
    {steps.map((step, i) => {
      const color =
        step.status === 'disetujui' ? 'success' :
        step.status === 'ditolak' ? 'danger' :
        step.status === 'menunggu' ? 'warning' : 'neutral';
      return (
        <div key={step.id} className="flex items-center gap-3 rounded-[10px] border border-slate-100 bg-white px-3 py-2.5">
          <span className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[11px] font-bold text-slate-500 shrink-0">{i + 1}</span>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-bold text-slate-800 truncate">{step.actor}</div>
            <div className="text-[11px] text-slate-400">{step.role}{step.note ? ` — ${step.note}` : ''}</div>
          </div>
          {step.timestamp && <span className="text-[10px] text-slate-400 shrink-0">{step.timestamp}</span>}
          <Badge color={color as any} className="shrink-0">{step.status}</Badge>
        </div>
      );
    })}
  </div>
);

/* ============================== DiffView ============================== */

export const DiffView: React.FC<{ before: { label: string; value: string }[]; after: { label: string; value: string }[]; className?: string }> = ({
  before,
  after,
  className,
}) => (
  <div className={cn('grid sm:grid-cols-2 gap-3', className)}>
    <div className="rounded-[10px] border border-[var(--sd-error)]/30 bg-[var(--sd-error-container)]/40 p-3">
      <div className="text-[10px] font-bold uppercase text-[var(--sd-error)] mb-2">Versi Sebelumnya</div>
      <dl className="space-y-1.5">
        {before.map((f) => (
          <div key={f.label} className="text-xs"><dt className="font-semibold text-slate-500">{f.label}</dt><dd className="text-slate-700">{f.value}</dd></div>
        ))}
      </dl>
    </div>
    <div className="rounded-[10px] border border-[var(--sd-success)]/30 bg-[var(--sd-success-container)]/50 p-3">
      <div className="text-[10px] font-bold uppercase text-[var(--sd-success)] mb-2">Versi Terbaru</div>
      <dl className="space-y-1.5">
        {after.map((f) => (
          <div key={f.label} className="text-xs"><dt className="font-semibold text-slate-500">{f.label}</dt><dd className="text-slate-700">{f.value}</dd></div>
        ))}
      </dl>
    </div>
  </div>
);

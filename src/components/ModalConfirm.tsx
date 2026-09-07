import React from 'react';
import { AlertCircle, X } from 'lucide-react';

interface ModalConfirmProps {
  isOpen: boolean;
  title: string;
  message: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  isDestructive?: boolean;
}

export const ModalConfirm: React.FC<ModalConfirmProps> = ({
  isOpen,
  title,
  message,
  confirmLabel = 'Ya, Lanjutkan',
  cancelLabel = 'Batal',
  onConfirm,
  onCancel,
  isDestructive = true
}) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
        
        {/* Header */}
        <div className="p-5 flex items-start gap-3.5">
          <div className={`w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 ${
            isDestructive ? 'bg-red-100 text-red-600' : 'bg-blue-100 text-[#0B2B5C]'
          }`}>
            <AlertCircle className="w-6 h-6" />
          </div>

          <div className="flex-1">
            <h3 className="font-extrabold text-base text-slate-900 leading-tight">
              {title}
            </h3>
            <p className="text-xs text-slate-600 mt-1.5 leading-relaxed font-medium">
              {message}
            </p>
          </div>

          <button
            onClick={onCancel}
            className="p-1 text-slate-400 hover:text-slate-600 rounded-lg"
            aria-label="Tutup dialog"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Action Buttons (Design Doc §9: minimum 44px height, high contrast) */}
        <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-end gap-2.5">
          <button
            id="modal-cancel-btn"
            onClick={onCancel}
            className="min-h-[44px] px-5 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-200 transition"
          >
            {cancelLabel}
          </button>

          <button
            id="modal-confirm-btn"
            onClick={onConfirm}
            className={`min-h-[44px] px-6 py-2 rounded-xl font-bold text-xs text-white shadow-sm transition ${
              isDestructive
                ? 'bg-[#C93B3B] hover:bg-red-700'
                : 'bg-[#0B2B5C] hover:bg-blue-900'
            }`}
          >
            {confirmLabel}
          </button>
        </div>

      </div>
    </div>
  );
};

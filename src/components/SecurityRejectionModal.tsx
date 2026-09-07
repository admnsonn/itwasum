import React from 'react';
import { 
  ShieldAlert, 
  X, 
  Lock, 
  AlertTriangle, 
  ArrowRight,
  ShieldCheck,
  FileText
} from 'lucide-react';
import { CurrentUserProfile } from '../types';

interface SecurityRejectionModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser?: CurrentUserProfile;
  attemptedAction: string;
  rejectionReason?: string;
  targetLevel?: string;
  onViewAuditTrail?: () => void;
}

export const SecurityRejectionModal: React.FC<SecurityRejectionModalProps> = ({
  isOpen,
  onClose,
  currentUser,
  attemptedAction,
  rejectionReason,
  targetLevel = 'L0 (Mabes)',
  onViewAuditTrail
}) => {
  if (!isOpen) return null;

  const activeUser = currentUser || {
    nama: 'Pengguna Sistem',
    peranLabel: 'Auditor',
    level: 'L2',
    titikWilayahNama: 'Satker Wilayah'
  };

  const finalReason = rejectionReason || `Berdasarkan aturan Buku Manual E-Audit (Hal 3 & 5), user dipasang di titik wilayah dan hanya diizinkan melihat ke bawah dalam yurisdiksinya. Mencoba mengakses atau mengubah data jenjang lebih tinggi (${targetLevel}) atau di luar wewenang otomatis dicegat dan dicatat sebagai Akses Ditolak di log audit.`;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/85 backdrop-blur-md animate-in fade-in duration-150">
      <div 
        className="bg-slate-900 border-2 border-rose-500/80 w-full max-w-lg rounded-3xl shadow-2xl overflow-hidden text-slate-100 ring-4 ring-rose-500/20"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header with Red Warning Accent */}
        <div className="px-6 py-5 bg-gradient-to-r from-rose-950/80 to-slate-900 border-b border-rose-500/40 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-rose-500/20 text-rose-400 border border-rose-500/40 flex items-center justify-center font-bold shadow-inner">
              <ShieldAlert className="w-6 h-6 animate-pulse" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-rose-500/20 text-rose-300 border border-rose-500/30">
                  Pelanggaran Akses 3 Poros
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Kejadian Tercatat
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Akses Ditolak (Security Guard)
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-8 h-8 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Content Body */}
        <div className="p-6 space-y-4">
          <div className="p-4 rounded-2xl bg-rose-950/30 border border-rose-500/30 space-y-2">
            <div className="flex items-center gap-2 text-xs font-black uppercase text-rose-400 tracking-wider">
              <Lock className="w-4 h-4" />
              Tindakan Dilarang oleh Matriks RBAC Dokumen:
            </div>
            <p className="text-xs text-rose-200 leading-relaxed font-semibold">
              {attemptedAction}
            </p>
          </div>

          <div className="space-y-2 text-xs text-slate-300">
            <div className="font-bold text-white flex items-center gap-1.5">
              <AlertTriangle className="w-4 h-4 text-amber-400" />
              Alasan Penolakan Sistem:
            </div>
            <p className="leading-relaxed bg-slate-950 p-3 rounded-xl border border-slate-800 text-slate-300">
              {finalReason}
            </p>
          </div>

          {/* User Profile Context */}
          <div className="p-3 bg-slate-950 rounded-xl border border-slate-800/80 text-[11px] text-slate-400 space-y-1">
            <div className="flex justify-between">
              <span>Akun Aktif:</span>
              <span className="font-bold text-white">{activeUser.nama}</span>
            </div>
            <div className="flex justify-between">
              <span>Peran &amp; Jenjang Resmi:</span>
              <span className="text-amber-400 font-semibold">{activeUser.peranLabel} ({activeUser.level})</span>
            </div>
            <div className="flex justify-between">
              <span>Titik Wilayah Terdaftar:</span>
              <span className="text-slate-300">{activeUser.titikWilayahNama}</span>
            </div>
          </div>

          {/* Document Rule Quotation */}
          <div className="text-[11px] text-slate-400 italic border-l-2 border-slate-700 pl-3 leading-relaxed">
            &ldquo;User cuma dipasang di satu titik wilayah. Dia melihat titik itu ke bawah. Tidak ke atas, tidak ke samping! Upaya mengakses di luar yurisdiksi otomatis dicegat dan dicatat sebagai Akses Ditolak.&rdquo; &mdash; <em>Buku Manual E-Audit (Hal 3 &amp; 5)</em>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-4 border-t border-slate-800 bg-slate-950 flex items-center justify-between gap-3">
          {onViewAuditTrail && (
            <button
              onClick={() => {
                onClose();
                onViewAuditTrail();
              }}
              className="text-xs text-slate-400 hover:text-amber-400 flex items-center gap-1.5 font-medium transition"
            >
              <FileText className="w-3.5 h-3.5" />
              Lihat di Audit Trail Log
            </button>
          )}

          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-white text-xs font-black transition ml-auto"
          >
            Mengerti &amp; Tutup Peringatan
          </button>
        </div>
      </div>
    </div>
  );
};

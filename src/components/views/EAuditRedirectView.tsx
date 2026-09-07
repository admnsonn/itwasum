import React from 'react';
import { CurrentUserProfile } from '../../types';
import { ShieldAlert, ArrowLeft, ExternalLink, FileText, CheckCircle2, UserCheck, Lock } from 'lucide-react';

interface EAuditRedirectViewProps {
  currentUser: CurrentUserProfile;
  onSwitchAccount: () => void;
}

export const EAuditRedirectView: React.FC<EAuditRedirectViewProps> = ({
  currentUser,
  onSwitchAccount
}) => {
  const isAuditee = currentUser.peran === 'auditee';

  return (
    <div className="max-w-4xl mx-auto py-10 px-4 sm:px-6 space-y-6 animate-in fade-in duration-300">
      
      {/* Banner Notifikasi Hak Akses Sesuai Dokumen Resmi */}
      <div className="bg-white rounded-3xl border border-amber-200 shadow-xl overflow-hidden">
        <div className="bg-gradient-to-r from-amber-500 via-amber-600 to-amber-700 p-6 text-white">
          <div className="flex items-start gap-4">
            <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center shrink-0 border border-white/30">
              <ShieldAlert className="w-7 h-7 text-white" />
            </div>
            <div>
              <div className="flex items-center gap-2 flex-wrap mb-1">
                <span className="px-2.5 py-0.5 rounded-full text-xs font-black bg-white text-amber-900 uppercase tracking-wide">
                  {currentUser.jenisPeran}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-xs font-bold bg-amber-900/40 text-amber-100 border border-amber-400/30">
                  Peran: {currentUser.peranLabel}
                </span>
              </div>
              <h2 className="text-xl sm:text-2xl font-black tracking-tight">
                {isAuditee 
                  ? 'Akses Khusus Objek Pemeriksaan (Auditee)' 
                  : 'Akses Khusus Tim Audit Berdasarkan Surat Tugas (ST)'}
              </h2>
              <p className="text-amber-100 text-sm mt-1 leading-relaxed">
                Sesuai Petunjuk Teknis Hak Akses E-Audit &amp; Modul Overview Satu Data Itwasum Polri:
              </p>
            </div>
          </div>
        </div>

        <div className="p-6 sm:p-8 space-y-6">
          
          {/* Penjelasan Yuridis & Ketentuan Dokumen */}
          <div className="p-5 rounded-2xl bg-slate-50 border border-slate-200 text-slate-700 space-y-3">
            <div className="flex items-center gap-2 text-slate-900 font-extrabold text-base">
              <FileText className="w-5 h-5 text-blue-900" />
              <span>Ketentuan Akses Pengawasan:</span>
            </div>
            {isAuditee ? (
              <p className="text-sm leading-relaxed text-slate-600">
                Sebagai <strong>Auditee (Objek Periksa)</strong> pada <strong>{currentUser.titikWilayahNama}</strong>, wewenang Anda diatur secara mandiri pada modul E-Audit untuk menyampaikan tanggapan, mengunggah bukti dukung penyelesaian, dan memantau status pemenuhan rekomendasi temuan wasrik. Hak akses visualisasi agregat Overview tidak dialokasikan untuk menjaga independensi audit.
              </p>
            ) : (
              <p className="text-sm leading-relaxed text-slate-600">
                Hak akses Anda pada sistem pengawasan muncul dari <strong>Surat Tugas (ST) aktif</strong> dan dibatasi pada lokus penugasan periksa. Memberikan akses permanen terhadap modul agregat Overview pimpinan akan melampaui batas wewenang Surat Tugas Anda. Seluruh aktivitas audit, pengisian KKP, dan pengujian bukti fisik dilakukan melalui <strong>Aplikasi E-Audit</strong>.
              </p>
            )}

            {/* Info Surat Tugas & Lokus */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-3 border-t border-slate-200 text-xs">
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold">Nomor Surat Tugas:</span>
                <span className="font-mono font-bold text-slate-800 text-sm">
                  {currentUser.suratTugasNomor || 'ST/412/VIII/WAS.1.1/2026'}
                </span>
              </div>
              <div className="p-3 bg-white rounded-xl border border-slate-200">
                <span className="text-slate-400 block font-semibold">Objek / Lokus Tugas:</span>
                <span className="font-bold text-slate-800 text-sm">
                  {currentUser.suratTugasObjek || `${currentUser.titikWilayahNama}`}
                </span>
              </div>
            </div>
          </div>

          {/* Profil Personal */}
          <div className="flex items-center justify-between p-4 bg-blue-50/70 rounded-2xl border border-blue-200">
            <div className="flex items-center gap-3">
              <div className="w-11 h-11 rounded-xl bg-[#0B2B5C] text-white font-black flex items-center justify-center text-sm shadow-sm">
                {currentUser.nama.substring(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="text-sm font-extrabold text-slate-900">{currentUser.nama}</h4>
                <p className="text-xs text-slate-500 font-mono">NRP {currentUser.nrp} • {currentUser.sebutanPimpinan}</p>
              </div>
            </div>
            <div className="text-right hidden sm:block">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-100 text-emerald-800">
                <CheckCircle2 className="w-3.5 h-3.5" />
                ST Aktif &amp; Terverifikasi
              </span>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-3">
            <button
              onClick={() => {
                alert(`Mengarahkan personel ${currentUser.nama} ke portal E-Audit terintegrasi lokus ${currentUser.titikWilayahNama}`);
              }}
              className="w-full sm:w-auto px-6 py-3.5 bg-[#0B2B5C] hover:bg-[#081F42] text-white rounded-2xl font-extrabold text-sm shadow-md hover:shadow-lg transition flex items-center justify-center gap-2 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              <span>
                {isAuditee ? 'Buka Lembar Tindak Lanjut E-Audit' : 'Kembali ke Aplikasi E-Audit (Sesuai ST)'}
              </span>
            </button>

            <button
              onClick={onSwitchAccount}
              className="w-full sm:w-auto px-5 py-3.5 bg-slate-100 hover:bg-slate-200 text-slate-700 rounded-2xl font-bold text-xs transition flex items-center justify-center gap-2 cursor-pointer border border-slate-300"
            >
              <UserCheck className="w-4 h-4" />
              <span>Ganti Akun / Uji Peran Lain</span>
            </button>
          </div>

        </div>
      </div>

      {/* Catatan Kepatuhan Itwasum */}
      <div className="text-center text-xs text-slate-400 font-medium">
        Sistem Satu Data Pengawasan Terintegrasi Itwasum Polri • Hak Akses RBAC Standar ISO 27001
      </div>

    </div>
  );
};

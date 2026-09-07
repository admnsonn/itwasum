import React, { useState } from 'react';
import { 
  X, 
  Send, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  UserCheck, 
  ShieldAlert, 
  FileCheck, 
  HelpCircle,
  Plus,
  AlertCircle
} from 'lucide-react';
import { CurrentUserProfile, UsulanHakAkses } from '../types';
import { 
  getUsulanList, 
  ajukanUsulanBaru, 
  setujuiUsulan, 
  tolakUsulan 
} from '../data/hakAksesWorkflowData';

interface UsulanHakAksesModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentUser: CurrentUserProfile;
}

export const UsulanHakAksesModal: React.FC<UsulanHakAksesModalProps> = ({
  isOpen,
  onClose,
  currentUser
}) => {
  const [usulanList, setUsulanList] = useState<UsulanHakAkses[]>(getUsulanList());
  const [activeTab, setActiveTab] = useState<'daftar' | 'form'>('daftar');
  
  // Form states
  const [targetUserNama, setTargetUserNama] = useState('AKBP Ronald Sumaja, S.I.K.');
  const [targetUserNrp, setTargetUserNrp] = useState('78010419');
  const [jenisUsulan, setJenisUsulan] = useState<'Ubah Wilayah' | 'Ubah Bidang' | 'Mutasi Jabatan' | 'Aktivasi Akun'>('Ubah Bidang');
  const [nilaiLama, setNilaiLama] = useState('Bidang: Opsnal, SDM, Logistik, Garkeu');
  const [nilaiBaru, setNilaiBaru] = useState('Bidang: Garkeu & Logistik');
  const [alasanDinas, setAlasanDinas] = useState('');
  const [feedbackMsg, setFeedbackMsg] = useState<string | null>(null);

  if (!isOpen) return null;

  const isSuperAdmin = currentUser.canApproveAccessChange === 'approve';
  const isAdminPolda = currentUser.canApproveAccessChange === 'propose';

  const handleApprove = (id: string) => {
    const res = setujuiUsulan(id, currentUser, 'Disetujui langsung oleh Super Admin Mabes sesuai RBAC Dokumen.');
    if (res) {
      setUsulanList(getUsulanList());
      setFeedbackMsg(`Usulan untuk ${res.targetUserNama} berhasil DISETUJUI dan dicatat ke Audit Trail.`);
      setTimeout(() => setFeedbackMsg(null), 4000);
    }
  };

  const handleReject = (id: string) => {
    const alasan = prompt('Masukkan alasan penolakan usulan:', 'Persyaratan administratif belum terpenuhi');
    if (alasan) {
      const res = tolakUsulan(id, currentUser, alasan);
      if (res) {
        setUsulanList(getUsulanList());
        setFeedbackMsg(`Usulan untuk ${res.targetUserNama} telah DITOLAK.`);
        setTimeout(() => setFeedbackMsg(null), 4000);
      }
    }
  };

  const handleSubmitForm = (e: React.FormEvent) => {
    e.preventDefault();
    if (!alasanDinas.trim()) {
      alert('Mohon lengkapi alasan dinas / dasar Sprint.');
      return;
    }

    const baru = ajukanUsulanBaru({
      pengusulNama: currentUser.nama,
      pengusulPeran: `${currentUser.peranLabel} (${currentUser.level})`,
      pengusulSatker: currentUser.titikWilayahNama,
      targetUserNama,
      targetUserNrp,
      jenisUsulan,
      nilaiLama,
      nilaiBaru,
      alasanDinas
    });

    setUsulanList(getUsulanList());
    setActiveTab('daftar');
    setAlasanDinas('');
    setFeedbackMsg(`Usulan perubahan hak akses baru (#${baru.id}) berhasil dikirim ke antrean Super Admin Mabes.`);
    setTimeout(() => setFeedbackMsg(null), 4000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-md animate-in fade-in duration-200">
      <div 
        className="bg-slate-900 border border-slate-700 w-full max-w-4xl max-h-[90vh] rounded-3xl shadow-2xl flex flex-col overflow-hidden text-slate-100"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-5 border-b border-slate-800 bg-slate-900/90 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-blue-500/20 text-blue-400 border border-blue-500/30 flex items-center justify-center font-bold">
              <UserCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded bg-blue-400/10 text-blue-400 border border-blue-400/20">
                  Dokumen Hal 3 &bull; Tabel Utama Baris 8
                </span>
                <span className="text-[10px] font-bold text-slate-400">
                  Alur Usulan &amp; Persetujuan Wewenang
                </span>
              </div>
              <h2 className="text-lg font-black text-white tracking-tight">
                Alur Usulan Perubahan Hak Akses Personel
              </h2>
            </div>
          </div>

          <button
            onClick={onClose}
            className="w-9 h-9 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 flex items-center justify-center transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Feedback Alert */}
        {feedbackMsg && (
          <div className="px-6 py-2.5 bg-emerald-500/20 border-b border-emerald-500/30 text-emerald-300 text-xs font-bold flex items-center gap-2">
            <CheckCircle2 className="w-4 h-4" />
            {feedbackMsg}
          </div>
        )}

        {/* Tab Selector & Role Status */}
        <div className="px-6 py-3 bg-slate-950 border-b border-slate-800 flex items-center justify-between gap-4 flex-wrap text-xs">
          <div className="flex items-center gap-2">
            <button
              onClick={() => setActiveTab('daftar')}
              className={`px-3.5 py-1.5 rounded-xl font-bold transition ${
                activeTab === 'daftar'
                  ? 'bg-amber-400 text-slate-950'
                  : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
              }`}
            >
              Daftar Usulan ({usulanList.length})
            </button>
            {(isAdminPolda || isSuperAdmin) && (
              <button
                onClick={() => setActiveTab('form')}
                className={`px-3.5 py-1.5 rounded-xl font-bold transition flex items-center gap-1.5 ${
                  activeTab === 'form'
                    ? 'bg-amber-400 text-slate-950'
                    : 'bg-slate-800 text-slate-300 hover:bg-slate-700'
                }`}
              >
                <Plus className="w-3.5 h-3.5" />
                Ajukan Usulan Baru
              </button>
            )}
          </div>

          <div className="flex items-center gap-2 text-[11px] text-slate-400">
            <span>Kewenangan Anda:</span>
            <span className={`font-black px-2 py-0.5 rounded ${
              isSuperAdmin 
                ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                : isAdminPolda
                  ? 'bg-blue-500/10 text-blue-400 border border-blue-500/20'
                  : 'bg-slate-800 text-slate-400'
            }`}>
              {isSuperAdmin ? 'Super Admin: Berhak Menyetujui / Menolak' : isAdminPolda ? 'Admin Polda: Usul Saja (Wilayah Riau)' : 'Hanya Lihat'}
            </span>
          </div>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6">
          {activeTab === 'daftar' ? (
            <div className="space-y-4">
              {usulanList.length === 0 ? (
                <div className="text-center py-12 text-slate-400 space-y-2">
                  <Clock className="w-8 h-8 mx-auto text-slate-600" />
                  <p className="text-xs">Belum ada usulan perubahan hak akses yang tercatat.</p>
                </div>
              ) : (
                usulanList.map((item) => {
                  const isPending = item.status === 'Menunggu Persetujuan';
                  const isApproved = item.status === 'Disetujui';

                  return (
                    <div 
                      key={item.id}
                      className="p-5 rounded-2xl bg-slate-900 border border-slate-800 hover:border-slate-700 transition space-y-3"
                    >
                      <div className="flex items-start justify-between gap-3">
                        <div>
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] font-black uppercase px-2 py-0.5 rounded bg-slate-950 text-amber-400 border border-slate-800">
                              {item.jenisUsulan}
                            </span>
                            <span className="text-xs font-bold text-white">
                              {item.targetUserNama}
                            </span>
                            <span className="text-[11px] text-slate-400 font-mono">
                              NRP: {item.targetUserNrp}
                            </span>
                          </div>
                          <p className="text-[11px] text-slate-400 mt-1">
                            Diusulkan oleh: <strong>{item.pengusulNama}</strong> ({item.pengusulPeran}) &bull; {item.tanggalUsulan}
                          </p>
                        </div>

                        <span className={`text-[10px] font-black uppercase px-2.5 py-1 rounded-full border ${
                          isPending 
                            ? 'bg-amber-500/10 text-amber-400 border-amber-500/20'
                            : isApproved
                              ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20'
                              : 'bg-rose-500/10 text-rose-400 border-rose-500/20'
                        }`}>
                          {item.status}
                        </span>
                      </div>

                      {/* Detail Perubahan */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs bg-slate-950/70 p-3 rounded-xl border border-slate-800/60">
                        <div>
                          <span className="text-[10px] text-slate-400 uppercase font-black block">Nilai Lama:</span>
                          <span className="text-slate-300">{item.nilaiLama}</span>
                        </div>
                        <div>
                          <span className="text-[10px] text-amber-400 uppercase font-black block">Usulan Nilai Baru:</span>
                          <span className="text-amber-200 font-bold">{item.nilaiBaru}</span>
                        </div>
                      </div>

                      <div className="text-xs text-slate-300">
                        <span className="text-slate-400 font-medium">Alasan Dinas / Sprint: </span>
                        {item.alasanDinas}
                      </div>

                      {/* Catatan Persetujuan jika ada */}
                      {item.disetujuiOleh && (
                        <div className="text-[11px] text-emerald-400/90 bg-emerald-950/30 p-2.5 rounded-xl border border-emerald-500/20 flex items-center justify-between">
                          <span>
                            Diproses oleh: <strong>{item.disetujuiOleh}</strong> ({item.tanggalPersetujuan})
                          </span>
                          <span className="italic">{item.catatanPersetujuan}</span>
                        </div>
                      )}

                      {/* Action buttons for Super Admin */}
                      {isPending && isSuperAdmin && (
                        <div className="pt-2 flex items-center justify-end gap-2 border-t border-slate-800/80">
                          <button
                            onClick={() => handleReject(item.id)}
                            className="px-3 py-1.5 rounded-xl bg-rose-950/40 hover:bg-rose-900/50 text-rose-400 border border-rose-500/30 text-xs font-bold transition flex items-center gap-1.5"
                          >
                            <XCircle className="w-3.5 h-3.5" />
                            Tolak Usulan
                          </button>
                          <button
                            onClick={() => handleApprove(item.id)}
                            className="px-4 py-1.5 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black transition flex items-center gap-1.5 shadow-md"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Setujui &amp; Terapkan Perubahan
                          </button>
                        </div>
                      )}

                      {isPending && !isSuperAdmin && (
                        <div className="text-[11px] text-amber-400/80 italic flex items-center gap-1.5">
                          <Clock className="w-3.5 h-3.5" />
                          Menunggu peninjauan &amp; persetujuan Super Admin Mabes Polri.
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          ) : (
            <form onSubmit={handleSubmitForm} className="space-y-4 max-w-2xl mx-auto">
              <div className="p-4 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-xs text-amber-200 leading-relaxed">
                <strong>Ketentuan RBAC Dokumen (Hal 3):</strong> Admin Polda hanya berhak mengusulkan wewenang untuk personel di wilayah binaannya. Penetapan resmi dilakukan oleh Super Admin Mabes.
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Nama Personel Target:</label>
                  <input
                    type="text"
                    value={targetUserNama}
                    onChange={(e) => setTargetUserNama(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">NRP Personel:</label>
                  <input
                    type="text"
                    value={targetUserNrp}
                    onChange={(e) => setTargetUserNrp(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Jenis Perubahan:</label>
                <select
                  value={jenisUsulan}
                  onChange={(e) => setJenisUsulan(e.target.value as any)}
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                >
                  <option value="Ubah Bidang">Ubah Bidang (Opsnal, SDM, Logistik, Garkeu)</option>
                  <option value="Ubah Wilayah">Ubah Wilayah Penugasan (L0 - L3)</option>
                  <option value="Mutasi Jabatan">Mutasi Jabatan / Tim Audit</option>
                  <option value="Aktivasi Akun">Aktivasi / Non-Aktifkan Akun</option>
                </select>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-xs font-bold text-slate-300">Nilai Saat Ini (Lama):</label>
                  <input
                    type="text"
                    value={nilaiLama}
                    onChange={(e) => setNilaiLama(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-bold text-amber-400">Usulan Nilai Baru:</label>
                  <input
                    type="text"
                    value={nilaiBaru}
                    onChange={(e) => setNilaiBaru(e.target.value)}
                    required
                    className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-amber-500/50 text-xs text-white focus:outline-none focus:border-amber-400"
                  />
                </div>
              </div>

              <div className="space-y-1">
                <label className="text-xs font-bold text-slate-300">Alasan Dinas / Nomor Sprint:</label>
                <textarea
                  value={alasanDinas}
                  onChange={(e) => setAlasanDinas(e.target.value)}
                  placeholder="Contoh: Sesuai Sprint Kapolda Riau No. Sprin/820/IX/2026 perihal penugasan tim verifikasi..."
                  rows={3}
                  required
                  className="w-full px-3.5 py-2 rounded-xl bg-slate-950 border border-slate-700 text-xs text-white focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-3 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setActiveTab('daftar')}
                  className="px-4 py-2 rounded-xl bg-slate-800 text-slate-300 text-xs font-bold"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-400 hover:bg-amber-300 text-slate-950 text-xs font-black transition flex items-center gap-2 shadow-md"
                >
                  <Send className="w-4 h-4" />
                  Kirim Usulan ke Super Admin Mabes
                </button>
              </div>
            </form>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 border-t border-slate-800 bg-slate-950 flex items-center justify-between text-xs text-slate-400">
          <span>
            Setiap perubahan wewenang yang disetujui otomatis masuk ke Log Audit resmi Itwasum Polri.
          </span>
          <button
            onClick={onClose}
            className="px-4 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 font-bold transition"
          >
            Tutup
          </button>
        </div>
      </div>
    </div>
  );
};

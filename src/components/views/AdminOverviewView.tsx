import React, { useState } from 'react';
import { CurrentUserProfile, UserAccount } from '../../types';
import { 
  ShieldCheck, 
  Users, 
  KeyRound, 
  FileSearch, 
  CheckCircle2, 
  XCircle, 
  Clock, 
  Database, 
  Plus, 
  AlertTriangle,
  Send,
  Building2,
  Lock,
  Filter
} from 'lucide-react';
import { USER_ACCOUNTS, MASTER_DATA_ITEMS } from '../../data/mockData';
import { getAuditLogs, logUbahHakAkses, saveAuditLog } from '../../utils/auditLogger';

interface AdminOverviewViewProps {
  currentUser: CurrentUserProfile;
  onSwitchAccount: () => void;
  /** Modul B.10 (Log Aktivitas & Audit Trail) membuka langsung ke tab 'logs'. */
  initialTab?: 'users' | 'requests' | 'logs' | 'master';
}

export const AdminOverviewView: React.FC<AdminOverviewViewProps> = ({
  currentUser,
  onSwitchAccount,
  initialTab
}) => {
  const isSuperAdmin = currentUser.peran === 'super_admin';
  const [activeTab, setActiveTab] = useState<'users' | 'requests' | 'logs' | 'master'>(initialTab || 'users');
  const [userList, setUserList] = useState<UserAccount[]>(USER_ACCOUNTS);
  const [logs, setLogs] = useState(getAuditLogs());
  const [logFilter, setLogFilter] = useState<string>('semua');
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Propose access change state (for Admin Polda)
  const [showProposeModal, setShowProposeModal] = useState(false);
  const [proposeTarget, setProposeTarget] = useState('AKP Denny Prasetyo, S.H.');
  const [proposeRequested, setProposeRequested] = useState('Penambahan Bidang Opsnal');
  const [proposeJustification, setProposeJustification] = useState('Kebutuhan verifikasi pra-audit Polda');

  // Filter users based on scope
  const filteredUsers = userList.filter(u => {
    if (isSuperAdmin) return true;
    // Admin Polda only sees users in their region
    return u.satker.toLowerCase().includes('riau') || u.satker.toLowerCase().includes('kampar') || u.satker.toLowerCase().includes('pekanbaru');
  });

  // Filter logs based on scope
  const filteredLogs = logs.filter(l => {
    if (logFilter !== 'semua' && l.kejadian !== logFilter) return false;
    if (isSuperAdmin) return true;
    return l.titikWilayah.toLowerCase().includes('riau') || l.user.toLowerCase().includes('denny') || l.user.toLowerCase().includes('ronald');
  });

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(null), 3500);
  };

  const handleApproveAccess = (reqId: string, applicant: string, roleName: string) => {
    logUbahHakAkses(currentUser, applicant, 'Hak Akses Standar', `Otorisasi Disetujui: ${roleName}`, currentUser.nama);
    setLogs(getAuditLogs());
    showToast(`Permohonan hak akses ${applicant} telah disetujui resmi oleh Super Admin.`);
  };

  const handleRejectAccess = (reqId: string, applicant: string) => {
    saveAuditLog({
      kejadian: 'Akses ditolak',
      user: applicant,
      peran: 'Admin Polda',
      titikWilayah: currentUser.titikWilayahNama,
      detail: {
        yangDiminta: 'Perubahan Hak Akses Bidang Tambahan',
        alasanDitolak: `Ditolak oleh ${currentUser.nama} (Kewenangan tidak sesuai matriks E-Audit)`
      }
    });
    setLogs(getAuditLogs());
    showToast(`Permohonan hak akses ${applicant} telah ditolak.`);
  };

  const handleSubmitProposal = (e: React.FormEvent) => {
    e.preventDefault();
    saveAuditLog({
      kejadian: 'Ubah hak akses user',
      user: currentUser.nama,
      peran: `${currentUser.peranLabel} (${currentUser.level})`,
      titikWilayah: currentUser.titikWilayahNama,
      detail: {
        yangDiminta: `Usulan: ${proposeRequested} untuk ${proposeTarget}`,
        nilaiLama: 'Menunggu Persetujuan Super Admin L0',
        nilaiBaru: proposeJustification,
        siapaMenyetujui: 'Status: Menunggu Otorisasi Super Admin Mabes'
      }
    });
    setLogs(getAuditLogs());
    setShowProposeModal(false);
    showToast(`Usulan perubahan hak akses telah dikirimkan ke Super Admin Mabes.`);
  };

  return (
    <div id="admin-overview-view" className="space-y-5 animate-in fade-in">
      
      {/* Toast */}
      {toastMessage && (
        <div className="p-4 rounded-2xl bg-emerald-600 text-white font-bold text-sm flex items-center justify-between shadow-lg">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5" />
            <span>{toastMessage}</span>
          </div>
          <button onClick={() => setToastMessage(null)} className="text-white/80 hover:text-white">✕</button>
        </div>
      )}

      {/* Header Banner - Overview Admin */}
      <div className="bg-gradient-to-r from-[#0B2B5C] via-[#113B7A] to-[#1E4E9E] p-6 rounded-3xl text-white shadow-md border border-blue-900 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1.5 flex-wrap">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-amber-400 text-slate-950">
              {currentUser.jenisPeran} • Level {currentUser.level}
            </span>
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-white/10 text-blue-100 border border-white/20">
              {currentUser.titikWilayahNama}
            </span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black tracking-tight">
            Konsol Otorisasi &amp; Tata Kelola Akun Sistem ({currentUser.peranLabel})
          </h2>
          <p className="text-xs sm:text-sm text-blue-200 mt-1 max-w-2xl leading-relaxed">
            Sesuai petunjuk teknis wewenang RBAC, akun administrator difokuskan pada manajemen pengguna, verifikasi permohonan hak akses, dan audit trail log keamanan. Indikator pengawasan tidak dirender untuk menjaga pemisahan tugas <em>(Segregation of Duties)</em>.
          </p>
        </div>

        <div className="flex items-center gap-2 shrink-0">
          <button
            onClick={onSwitchAccount}
            className="px-4 py-2.5 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold border border-white/20 transition cursor-pointer"
          >
            Ganti Profil / Uji Peran Pimpinan
          </button>
        </div>
      </div>

      {/* Admin Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-[#0B2B5C] flex items-center justify-center shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-slate-900">{filteredUsers.length}</div>
            <div className="text-xs text-slate-500 font-semibold">
              {isSuperAdmin ? 'Total Personel (Nasional)' : `Personel ${currentUser.titikWilayahNama}`}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-50 text-amber-600 flex items-center justify-center shrink-0">
            <KeyRound className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-amber-600">
              {isSuperAdmin ? '2 Antrean' : '1 Terkirim'}
            </div>
            <div className="text-xs text-slate-500 font-semibold">
              {isSuperAdmin ? 'Permohonan Menunggu Otorisasi' : 'Usulan Perubahan Hak Akses'}
            </div>
          </div>
        </div>

        <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-rose-50 text-rose-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <div className="text-2xl font-black text-rose-600">
              {logs.filter(l => l.kejadian === 'Akses ditolak').length} Insiden
            </div>
            <div className="text-xs text-slate-500 font-semibold">Percobaan Akses Ditolak</div>
          </div>
        </div>

        {/* Master Satker - Rendered ONLY if Super Admin has permission! */}
        {currentUser.canManageMasterSatker ? (
          <div className="bg-white p-4 rounded-2xl border border-slate-200 shadow-xs flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
              <Database className="w-6 h-6" />
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-600">{MASTER_DATA_ITEMS.length} Dokumen</div>
              <div className="text-xs text-slate-500 font-semibold">Master Data Terpadu Mabes</div>
            </div>
          </div>
        ) : (
          <div className="bg-slate-50 p-4 rounded-2xl border border-slate-200/60 shadow-xs flex items-center gap-4 text-slate-400">
            <div className="w-12 h-12 rounded-xl bg-slate-200/50 text-slate-400 flex items-center justify-center shrink-0">
              <Lock className="w-6 h-6" />
            </div>
            <div>
              <div className="text-xs font-bold text-slate-500">Master Satker Pusat</div>
              <div className="text-[11px] text-slate-400">Otoritas Khusus Super Admin L0</div>
            </div>
          </div>
        )}
      </div>

      {/* Navigation Tabs */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200 shadow-xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'users' ? 'bg-[#0B2B5C] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <Users className="w-4 h-4" />
            <span>Tata Kelola Akun Personel</span>
          </button>

          <button
            onClick={() => setActiveTab('requests')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'requests' ? 'bg-[#0B2B5C] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <KeyRound className="w-4 h-4" />
            <span>
              {isSuperAdmin ? 'Otorisasi Hak Akses (Persetujuan)' : 'Usulan Perubahan Hak Akses'}
            </span>
          </button>

          <button
            onClick={() => setActiveTab('logs')}
            className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
              activeTab === 'logs' ? 'bg-[#0B2B5C] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            <FileSearch className="w-4 h-4" />
            <span>Audit Trail &amp; Log Keamanan</span>
          </button>

          {/* Tab Master Satker - rendered ONLY if Super Admin has permission */}
          {currentUser.canManageMasterSatker && (
            <button
              onClick={() => setActiveTab('master')}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer ${
                activeTab === 'master' ? 'bg-[#0B2B5C] text-white shadow-xs' : 'text-slate-600 hover:bg-slate-100'
              }`}
            >
              <Database className="w-4 h-4" />
              <span>Kelola Master Satker (L0)</span>
            </button>
          )}
        </div>

        {/* Action Button */}
        {activeTab === 'requests' && !isSuperAdmin && (
          <button
            onClick={() => setShowProposeModal(true)}
            className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold transition flex items-center gap-2 cursor-pointer shadow-xs"
          >
            <Send className="w-3.5 h-3.5" />
            <span>+ Ajukan Usulan Hak Akses</span>
          </button>
        )}
      </div>

      {/* TAB 1: USERS MANAGEMENT */}
      {activeTab === 'users' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Daftar Personel Terdaftar ({isSuperAdmin ? 'Seluruh Indonesia' : currentUser.titikWilayahNama})
              </h3>
              <p className="text-xs text-slate-500">
                {isSuperAdmin 
                  ? 'Super Admin L0 memiliki wewenang mengelola seluruh pengguna nasional.' 
                  : `Admin Polda L2 dibatasi mengelola akun di wilayah ${currentUser.titikWilayahNama} dan jajarannya.`}
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs border-collapse">
              <thead className="bg-slate-100 text-slate-600 font-bold uppercase tracking-wider border-b border-slate-200">
                <tr>
                  <th className="p-3">Nama &amp; Pangkat</th>
                  <th className="p-3">Role RBAC</th>
                  <th className="p-3">Satuan Kerja</th>
                  <th className="p-3">Status</th>
                  <th className="p-3">Aksi Admin</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {filteredUsers.map((u) => (
                  <tr key={u.id} className="hover:bg-slate-50/70 transition">
                    <td className="p-3">
                      <div className="font-extrabold text-slate-900">{u.nama}</div>
                      <div className="text-[11px] text-slate-500 font-mono">{u.pangkatNrp}</div>
                    </td>
                    <td className="p-3">
                      <span className="px-2 py-0.5 rounded bg-blue-50 text-blue-900 font-bold text-[11px]">
                        {u.role}
                      </span>
                    </td>
                    <td className="p-3 font-medium text-slate-700">{u.satker}</td>
                    <td className="p-3">
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-50 text-emerald-700">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500"></span>
                        {u.status}
                      </span>
                    </td>
                    <td className="p-3">
                      <button
                        onClick={() => {
                          showToast(`Detail hak akses personel ${u.nama} dibuka untuk pemutakhiran.`);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold text-[11px] cursor-pointer transition"
                      >
                        Kelola
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* TAB 2: REQUESTS (SETUJUI / USUL HAK AKSES) */}
      {activeTab === 'requests' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5">
            <div className="flex items-start justify-between gap-4 mb-4">
              <div>
                <h3 className="text-base font-extrabold text-slate-900">
                  {isSuperAdmin 
                    ? 'Antrean Persetujuan Perubahan Hak Akses Personel' 
                    : 'Daftar Usulan Perubahan Hak Akses Satker'}
                </h3>
                <p className="text-xs text-slate-500 mt-0.5">
                  {isSuperAdmin 
                    ? 'Berdasarkan Matriks Otorisasi, Super Admin L0 berwenang menyetujui atau menolak perubahan wewenang pengguna.' 
                    : 'Admin Polda L2 berwenang mengajukan usulan penyesuaian hak akses untuk personel jajaran kepada Super Admin Mabes.'}
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {/* Request Item 1 */}
              <div className="p-4 rounded-xl bg-slate-50 border border-slate-200 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div className="space-y-1">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-amber-100 text-amber-900">
                      Menunggu Otorisasi
                    </span>
                    <span className="text-xs font-mono text-slate-400">REQ-2026-088</span>
                  </div>
                  <h4 className="font-extrabold text-sm text-slate-900">
                    AKP Denny Prasetyo, S.H. (Itwasda Polda Riau)
                  </h4>
                  <p className="text-xs text-slate-600">
                    <strong>Permohonan:</strong> Penambahan Hak Baca Bidang Garkeu untuk Rekonsiliasi Dokumen Pra-Audit
                  </p>
                  <p className="text-[11px] text-slate-400">Diajukan: 06 Sep 2026, 09:30 WIB oleh Admin Polda Riau</p>
                </div>

                {/* Only Super Admin can approve/reject! Document: Admin Polda = "usul saja" */}
                {currentUser.canApproveAccessChange === 'approve' ? (
                  <div className="flex items-center gap-2 shrink-0">
                    <button
                      onClick={() => handleApproveAccess('REQ-2026-088', 'AKP Denny Prasetyo', 'Bidang Garkeu')}
                      className="px-3 py-1.5 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <CheckCircle2 className="w-4 h-4" />
                      <span>Setujui</span>
                    </button>
                    <button
                      onClick={() => handleRejectAccess('REQ-2026-088', 'AKP Denny Prasetyo')}
                      className="px-3 py-1.5 bg-rose-600 hover:bg-rose-700 text-white rounded-xl text-xs font-bold flex items-center gap-1.5 cursor-pointer shadow-xs transition"
                    >
                      <XCircle className="w-4 h-4" />
                      <span>Tolak</span>
                    </button>
                  </div>
                ) : (
                  <div className="px-3 py-1.5 bg-slate-200 text-slate-700 rounded-xl text-xs font-bold shrink-0">
                    Menunggu Verifikasi Mabes
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* TAB 3: AUDIT TRAIL LOGS */}
      {activeTab === 'logs' && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <h3 className="font-extrabold text-sm sm:text-base text-slate-900">
                Audit Trail Log Aktivitas &amp; Keamanan ({isSuperAdmin ? 'Seluruh Sistem' : currentUser.titikWilayahNama})
              </h3>
              <p className="text-xs text-slate-500">
                Mencatat 5 peristiwa wajib: Buka Overview, Drill-Down, Ekspor, Akses Ditolak, dan Perubahan Hak Akses.
              </p>
            </div>

            {/* Filter Kejadian */}
            <div className="flex items-center gap-2">
              <Filter className="w-4 h-4 text-slate-400" />
              <select
                value={logFilter}
                onChange={(e) => setLogFilter(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-slate-300 text-xs font-bold bg-white text-slate-700"
              >
                <option value="semua">Semua Kejadian</option>
                <option value="Buka Overview">Buka Overview</option>
                <option value="Drill-down">Drill-down</option>
                <option value="Ekspor">Ekspor</option>
                <option value="Akses ditolak">Akses ditolak (Penting!)</option>
                <option value="Ubah hak akses user">Ubah Hak Akses</option>
              </select>
            </div>
          </div>

          <div className="divide-y divide-slate-100 max-h-[500px] overflow-y-auto">
            {filteredLogs.map((log) => {
              const isDenied = log.kejadian === 'Akses ditolak';
              const isChange = log.kejadian === 'Ubah hak akses user';

              return (
                <div key={log.id} className={`p-4 transition hover:bg-slate-50 ${isDenied ? 'bg-rose-50/40' : ''}`}>
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`px-2 py-0.5 rounded text-[10px] font-black uppercase ${
                        isDenied 
                          ? 'bg-rose-100 text-rose-800 border border-rose-300' 
                          : isChange 
                            ? 'bg-amber-100 text-amber-800' 
                            : 'bg-blue-100 text-blue-800'
                      }`}>
                        {log.kejadian}
                      </span>
                      <span className="text-xs font-bold text-slate-900">{log.user}</span>
                      <span className="text-[11px] text-slate-400">• {log.peran}</span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono shrink-0">{log.waktu}</span>
                  </div>

                  <div className="mt-2 text-xs text-slate-600 space-y-0.5">
                    {log.detail.dariSimpul && (
                      <p>Drill: <strong>{log.detail.dariSimpul}</strong> ➔ <strong>{log.detail.keSimpul}</strong></p>
                    )}
                    {log.detail.wilayah && (
                      <p>Wilayah: <strong>{log.detail.wilayah}</strong> • Bidang: {log.detail.bidang || '-'}</p>
                    )}
                    {log.detail.format && (
                      <p>Format Ekspor: <strong>{log.detail.format}</strong></p>
                    )}
                    {log.detail.alasanDitolak && (
                      <p className="text-rose-700 font-semibold">
                        Peringatan Keamanan: {log.detail.yangDiminta} — Alasan: {log.detail.alasanDitolak}
                      </p>
                    )}
                    {log.detail.nilaiBaru && (
                      <p className="text-slate-700">
                        Detail: {log.detail.yangDiminta} ({log.detail.nilaiLama} ➔ {log.detail.nilaiBaru})
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* TAB 4: MASTER SATKER (Super Admin only) */}
      {activeTab === 'master' && currentUser.canManageMasterSatker && (
        <div className="bg-white rounded-2xl border border-slate-200 shadow-xs p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">Pengaturan Master Satker &amp; Tipologi Nasional</h3>
              <p className="text-xs text-slate-500">Kewenangan eksklusif Super Admin L0 untuk standarisasi objek audit.</p>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {MASTER_DATA_ITEMS.map((m) => (
              <div key={m.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-3">
                <div>
                  <span className="px-2 py-0.5 rounded bg-blue-100 text-blue-900 text-[10px] font-bold">
                    {m.kode}
                  </span>
                  <h4 className="font-extrabold text-xs text-slate-900 mt-1">{m.nama}</h4>
                  <p className="text-[11px] text-slate-500 mt-0.5">{m.keterangan}</p>
                </div>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                  {m.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Modal Ajukan Usulan Hak Akses (Admin Polda) */}
      {showProposeModal && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl space-y-4 animate-in zoom-in-95">
            <h3 className="text-base font-extrabold text-slate-900">Ajukan Usulan Perubahan Hak Akses</h3>
            <p className="text-xs text-slate-500">
              Sesuai wewenang Admin Polda, permohonan ini akan diteruskan ke Super Admin Mabes untuk diotorisasi.
            </p>

            <form onSubmit={handleSubmitProposal} className="space-y-3 text-xs">
              <div>
                <label className="font-bold text-slate-700 block mb-1">Nama Personel Target:</label>
                <input
                  type="text"
                  value={proposeTarget}
                  onChange={(e) => setProposeTarget(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Perubahan yang Diminta:</label>
                <input
                  type="text"
                  value={proposeRequested}
                  onChange={(e) => setProposeRequested(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  required
                />
              </div>

              <div>
                <label className="font-bold text-slate-700 block mb-1">Justifikasi Kebutuhan:</label>
                <textarea
                  value={proposeJustification}
                  onChange={(e) => setProposeJustification(e.target.value)}
                  className="w-full p-2.5 rounded-xl border border-slate-300 font-semibold"
                  rows={3}
                  required
                />
              </div>

              <div className="flex items-center justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setShowProposeModal(false)}
                  className="px-4 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 font-bold text-slate-700"
                >
                  Batal
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-blue-600 hover:bg-blue-700 font-bold text-white shadow-xs"
                >
                  Kirim Usulan
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

    </div>
  );
};

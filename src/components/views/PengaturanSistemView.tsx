import React, { useState } from 'react';
import { 
  Shield, 
  Users, 
  KeyRound, 
  Database, 
  Plus, 
  CheckCircle2, 
  X, 
  ChevronRight, 
  ChevronLeft,
  Lock,
  Layers,
  FileCheck,
  Search
} from 'lucide-react';
import { UserAccount, MasterDataItem, CurrentUserProfile } from '../../types';
import { USER_ACCOUNTS, MASTER_DATA_ITEMS } from '../../data/mockData';

interface PengaturanSistemViewProps {
  currentUser?: CurrentUserProfile;
  initialTab?: 'users' | 'rbac' | 'master';
}

export const PengaturanSistemView: React.FC<PengaturanSistemViewProps> = ({
  currentUser,
  initialTab = 'users'
}) => {
  const [activeTab, setActiveTab] = useState<'users' | 'rbac' | 'master'>(initialTab);
  const [userList, setUserList] = useState<UserAccount[]>(USER_ACCOUNTS);
  const [masterList, setMasterList] = useState<MasterDataItem[]>(MASTER_DATA_ITEMS);
  const [masterSubCategory, setMasterSubCategory] = useState<string>('Semua');
  const [showUserWizard, setShowUserWizard] = useState(false);
  const [wizardStep, setWizardStep] = useState(1);
  const [successToast, setSuccessToast] = useState<string | null>(null);

  // New User Form State
  const [newUser, setNewUser] = useState({
    nama: '',
    pangkatNrp: 'Kompol / 84050111',
    role: 'Auditor Madya',
    satker: 'Itwasda Polda Jawa Barat',
    email: ''
  });

  const handleToggleUserStatus = (userId: string) => {
    setUserList(prev => prev.map(u => {
      if (u.id === userId) {
        const nextStatus = u.status === 'Aktif' ? 'Non-Aktif' : 'Aktif';
        setSuccessToast(`Status pengguna ${u.nama} diubah menjadi "${nextStatus}"`);
        setTimeout(() => setSuccessToast(null), 3000);
        return { ...u, status: nextStatus };
      }
      return u;
    }));
  };

  const handleSaveUser = () => {
    const created: UserAccount = {
      id: `u-${Date.now()}`,
      nama: newUser.nama || 'AKP Denny Prasetyo, S.H.',
      pangkatNrp: newUser.pangkatNrp,
      role: newUser.role as any,
      satker: newUser.satker,
      email: newUser.email || 'denny.p@polri.go.id',
      status: 'Aktif',
      loginTerakhir: 'Baru saja didaftarkan'
    };

    setUserList([created, ...userList]);
    setShowUserWizard(false);
    setWizardStep(1);
    setSuccessToast(`Akun pengguna untuk ${created.nama} berhasil dibuat.`);
    setTimeout(() => setSuccessToast(null), 4000);
  };

  const filteredMaster = masterSubCategory === 'Semua' 
    ? masterList 
    : masterList.filter(m => m.kategori === masterSubCategory);

  return (
    <div id="pengaturan-sistem-view" className="space-y-4">
      
      {/* Toast */}
      {successToast && (
        <div className="p-4 rounded-xl bg-emerald-50 border border-emerald-300 text-emerald-900 text-sm font-bold flex items-center justify-between shadow-md">
          <div className="flex items-center gap-2">
            <CheckCircle2 className="w-5 h-5 text-emerald-600" />
            <span>{successToast}</span>
          </div>
          <button onClick={() => setSuccessToast(null)}>
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* Role-Specific Admin Scope Banner */}
      {currentUser?.peran === 'admin_polda' && (
        <div className="p-3.5 rounded-2xl bg-blue-50 border border-blue-200 text-xs text-[#0B2B5C] flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-blue-700 shrink-0" />
            <span>
              <strong>Kewenangan Admin Polda Riau (L2):</strong> Anda memiliki hak mengelola akun personel wilayah Polda Riau &amp; 12 Polres jajaran, serta mengusulkan mutasi hak akses ke Mabes Itwasum.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-[#0B2B5C] text-white shrink-0 self-start sm:self-auto">
            Admin Wilayah Riau
          </span>
        </div>
      )}

      {currentUser?.peran === 'super_admin' && (
        <div className="p-3.5 rounded-2xl bg-purple-50 border border-purple-200 text-xs text-purple-900 flex flex-col sm:flex-row sm:items-center justify-between gap-2 shadow-xs">
          <div className="flex items-center gap-2.5">
            <Shield className="w-4 h-4 text-purple-700 shrink-0" />
            <span>
              <strong>Kewenangan Super Admin Nasional (L0):</strong> Akses penuh konfigurasi master data satker se-Indonesia, persetujuan hak akses RBAC, dan audit trail seluruh jajaran.
            </span>
          </div>
          <span className="px-2.5 py-0.5 rounded-md text-[10px] font-black uppercase bg-purple-700 text-white shrink-0 self-start sm:self-auto">
            Super Admin Mabes
          </span>
        </div>
      )}

      {/* Horizontal Sub-Navigation */}
      <div className="bg-white rounded-2xl p-2 border border-slate-200/90 shadow-sm flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto">
          {[
            { id: 'users', label: 'Tata Kelola Pengguna' },
            { id: 'rbac', label: 'Kontrol Akses (Role RBAC)' },
            { id: 'master', label: 'Pengaturan Data Master Terpadu' }
          ].map((tab) => (
            <button
              key={tab.id}
              id={`tab-pengaturan-${tab.id}`}
              onClick={() => setActiveTab(tab.id as any)}
              className={`min-h-[40px] px-3.5 py-2 rounded-xl text-xs font-bold whitespace-nowrap transition cursor-pointer flex items-center gap-2 ${
                activeTab === tab.id
                  ? 'bg-[#0B2B5C] text-white shadow-xs'
                  : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
              }`}
            >
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === 'users' && (
          <button
            id="btn-tambah-user-modal"
            onClick={() => {
              setWizardStep(1);
              setShowUserWizard(true);
            }}
            className="min-h-[40px] px-3.5 py-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl font-bold text-xs shadow-xs flex items-center gap-2 transition cursor-pointer"
          >
            <Plus className="w-4 h-4" />
            <span>+ Tambah Akun Pengguna</span>
          </button>
        )}
      </div>

      {activeTab === 'users' && (
        <div className="space-y-4">
          <div className="bg-white rounded-2xl border border-slate-200/90 shadow-sm overflow-hidden">
            <div className="p-4 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="font-extrabold text-base text-slate-900">Daftar Akun Pengguna Sistem</h3>
                <p className="text-xs text-slate-500">Manajemen hak akses personel Itwasum dan operator Satker jajaran:</p>
              </div>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-slate-100/90 border-b border-slate-200 text-xs font-bold uppercase tracking-wider text-slate-600">
                  <tr>
                    <th className="px-4 py-3.5">Nama & Pangkat</th>
                    <th className="px-4 py-3.5">Peran / Role</th>
                    <th className="px-4 py-3.5">Satker Penugasan</th>
                    <th className="px-4 py-3.5">Email Akun</th>
                    <th className="px-4 py-3.5">Login Terakhir</th>
                    <th className="px-4 py-3.5 text-right">Status & Tindakan</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 text-sm">
                  {userList.map((u) => (
                    <tr key={u.id} className="min-h-[56px] hover:bg-slate-50 transition">
                      <td className="px-4 py-3.5 align-middle">
                        <div className="font-extrabold text-slate-900">{u.nama}</div>
                        <div className="text-xs text-slate-500">{u.pangkatNrp}</div>
                      </td>

                      <td className="px-4 py-3.5 align-middle">
                        <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-slate-100 text-slate-800 border border-slate-200">
                          {u.role}
                        </span>
                      </td>

                      <td className="px-4 py-3.5 align-middle font-medium text-slate-800">
                        {u.satker}
                      </td>

                      <td className="px-4 py-3.5 align-middle text-slate-600 text-xs font-mono">
                        {u.email}
                      </td>

                      <td className="px-4 py-3.5 align-middle text-slate-500 text-xs">
                        {u.loginTerakhir}
                      </td>

                      <td className="px-4 py-3.5 align-middle text-right">
                        <button
                          onClick={() => handleToggleUserStatus(u.id)}
                          className={`min-h-[36px] px-3 py-1 rounded-lg text-xs font-bold transition cursor-pointer border ${
                            u.status === 'Aktif'
                              ? 'bg-slate-900 text-white border-slate-900 hover:bg-slate-800'
                              : 'bg-slate-100 text-slate-600 border-slate-200 hover:bg-slate-200'
                          }`}
                        >
                          {u.status}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'rbac' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <h3 className="font-extrabold text-base text-slate-900">
            Matriks Hak Akses & Kontrol Peran (RBAC)
          </h3>
          <p className="text-xs text-slate-600">
            Pembagian wewenang verifikasi, persetujuan, dan pengunggahan berkas:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <strong className="text-[#0B2B5C] font-bold text-xs block">1. Irwasum / Pimpinan Mabes Polri</strong>
              <p className="text-xs text-slate-700">Akses penuh dashboard nasional, penetapan kebijakan audit, otorisasi rekomendasi strategis, disposisi temuan BPK.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <strong className="text-[#0B2B5C] font-bold text-xs block">2. Auditor Utama & Madya</strong>
              <p className="text-xs text-slate-700">Input Kertas Kerja Pemeriksaan (KKP), penilaian IKU, validasi berkas tindak lanjut, penyusunan LHA (Laporan Hasil Audit).</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <strong className="text-[#0B2B5C] font-bold text-xs block">3. Admin Satker (Polda / Polres)</strong>
              <p className="text-xs text-slate-700">Upload 10 dokumen pra-audit wajib, unggah kuitansi/bukti setor tindak lanjut temuan satker masing-masing.</p>
            </div>

            <div className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 space-y-1.5">
              <strong className="text-[#0B2B5C] font-bold text-xs block">4. Super Admin (Bagyanduan & TI)</strong>
              <p className="text-xs text-slate-700">Pemeliharaan master data katalog, konfigurasi enkripsi AES-256, manajemen akun dan log audit sistem.</p>
            </div>
          </div>
        </div>
      )}

      {activeTab === 'master' && (
        <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-3 border-b border-slate-100">
            <div>
              <h3 className="font-extrabold text-base text-slate-900">
                Pengaturan Data Master Terpadu
              </h3>
              <p className="text-xs text-slate-500">
                Konsolidasi 5 sub-katalog pengawasan, tipologi, template, dan berkas pra-audit:
              </p>
            </div>

            {/* Sub-katalog Selector */}
            <div className="flex items-center gap-1 bg-slate-100 p-1 rounded-xl flex-wrap">
              {['Semua', 'Jenis Pengawasan', 'Tipologi Satker', 'Katalog Pra-Audit', 'Template Dokumen', 'Mapping Kebutuhan Dokumen'].map((cat) => (
                <button
                  key={cat}
                  onClick={() => setMasterSubCategory(cat)}
                  className={`px-2.5 py-1 rounded-lg text-xs font-semibold transition cursor-pointer ${
                    masterSubCategory === cat
                      ? 'bg-[#0B2B5C] text-white font-bold shadow-xs'
                      : 'text-slate-600 hover:text-slate-900'
                  }`}
                >
                  {cat}
                </button>
              ))}
            </div>
          </div>

          <div className="space-y-2.5">
            {filteredMaster.map((item) => (
              <div key={item.id} className="p-3.5 rounded-xl border border-slate-200 bg-slate-50 flex items-start justify-between gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 rounded-md text-xs font-mono font-bold bg-slate-200 text-slate-800">{item.kode}</span>
                    <span className="font-extrabold text-xs text-slate-900">{item.nama}</span>
                    <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-blue-100 text-[#0B2B5C]">{item.kategori}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{item.keterangan}</p>
                  <div className="text-[11px] text-slate-400 mt-1">Update: {item.updateTerakhir}</div>
                </div>

                <span className="px-2.5 py-1 rounded-md text-xs font-bold bg-emerald-100 text-emerald-800">
                  {item.status}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* USER WIZARD MODAL 3-LANGKAH (PRD §8.5) */}
      {showUserWizard && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs">
          <div className="w-full max-w-lg bg-white rounded-2xl shadow-2xl border border-slate-200 overflow-hidden animate-in zoom-in-95">
            
            <div className="p-5 bg-[#0B2B5C] text-white">
              <div className="flex items-center justify-between mb-3">
                <h3 className="font-extrabold text-base">Registrasi Pengguna Sistem</h3>
                <button 
                  onClick={() => setShowUserWizard(false)}
                  className="p-1 rounded-lg bg-white/10 hover:bg-white/20 text-white"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Steps Progress Indicator */}
              <div className="flex items-center justify-between text-xs font-bold text-blue-200">
                <span className={wizardStep >= 1 ? 'text-amber-400 font-extrabold' : ''}>1. Profil</span>
                <span>→</span>
                <span className={wizardStep >= 2 ? 'text-amber-400 font-extrabold' : ''}>2. Hak Akses</span>
                <span>→</span>
                <span className={wizardStep >= 3 ? 'text-amber-400 font-extrabold' : ''}>3. Aktivasi</span>
              </div>
              <div className="w-full h-1.5 rounded-full bg-blue-950 mt-2 overflow-hidden">
                <div 
                  className="h-full bg-amber-400 transition-all duration-300"
                  style={{ width: `${(wizardStep / 3) * 100}%` }}
                />
              </div>
            </div>

            <div className="p-5 space-y-4">
              {wizardStep === 1 && (
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Nama Lengkap & Gelar:</label>
                    <input
                      type="text"
                      placeholder="contoh: AKP Denny Prasetyo, S.H."
                      value={newUser.nama}
                      onChange={(e) => setNewUser({ ...newUser, nama: e.target.value })}
                      className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Pangkat & NRP:</label>
                    <input
                      type="text"
                      placeholder="contoh: AKP / 88040112"
                      value={newUser.pangkatNrp}
                      onChange={(e) => setNewUser({ ...newUser, pangkatNrp: e.target.value })}
                      className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Email Kedinasan Polri:</label>
                    <input
                      type="email"
                      placeholder="contoh: denny.prasetyo@polri.go.id"
                      value={newUser.email}
                      onChange={(e) => setNewUser({ ...newUser, email: e.target.value })}
                      className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 2 && (
                <div className="space-y-3 animate-in fade-in">
                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Role / Peran:</label>
                    <select
                      value={newUser.role}
                      onChange={(e) => setNewUser({ ...newUser, role: e.target.value })}
                      className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    >
                      <option>Auditor Madya</option>
                      <option>Auditor Utama</option>
                      <option>Admin Satker</option>
                      <option>Super Admin</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-slate-700 mb-1">Satker / Polda Penugasan:</label>
                    <input
                      type="text"
                      placeholder="contoh: Itwasda Polda Jawa Barat"
                      value={newUser.satker}
                      onChange={(e) => setNewUser({ ...newUser, satker: e.target.value })}
                      className="w-full min-h-[44px] px-3 py-2 border border-slate-300 rounded-xl text-sm"
                    />
                  </div>
                </div>
              )}

              {wizardStep === 3 && (
                <div className="space-y-3 animate-in fade-in text-sm">
                  <div className="p-4 bg-slate-50 rounded-xl border border-slate-200 space-y-2">
                    <h4 className="font-bold text-[#0B2B5C]">Ringkasan Akun Baru</h4>
                    <div className="text-xs space-y-1 text-slate-700">
                      <div><strong>Nama:</strong> {newUser.nama || 'AKP Denny Prasetyo, S.H.'}</div>
                      <div><strong>Pangkat/NRP:</strong> {newUser.pangkatNrp}</div>
                      <div><strong>Role:</strong> {newUser.role}</div>
                      <div><strong>Satker:</strong> {newUser.satker}</div>
                      <div><strong>Email:</strong> {newUser.email || 'denny.p@polri.go.id'}</div>
                    </div>
                  </div>
                  <p className="text-xs text-slate-500">
                    Sistem akan mengirimkan tautan aktivasi OTP ke email kedinasan terdaftar.
                  </p>
                </div>
              )}
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex items-center justify-between">
              {wizardStep > 1 ? (
                <button
                  onClick={() => setWizardStep(wizardStep - 1)}
                  className="min-h-[44px] px-4 py-2 rounded-xl border border-slate-300 font-bold text-xs text-slate-700 hover:bg-slate-200 flex items-center gap-1.5"
                >
                  <ChevronLeft className="w-4 h-4" />
                  <span>Kembali</span>
                </button>
              ) : <div />}

              {wizardStep < 3 ? (
                <button
                  onClick={() => setWizardStep(wizardStep + 1)}
                  className="min-h-[44px] px-5 py-2 rounded-xl bg-[#0B2B5C] text-white font-bold text-xs hover:bg-blue-900 flex items-center gap-1.5"
                >
                  <span>Lanjut (Langkah {wizardStep + 1}/3)</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <button
                  onClick={handleSaveUser}
                  className="min-h-[44px] px-6 py-2 rounded-xl bg-emerald-600 text-white font-bold text-xs hover:bg-emerald-700 shadow-md"
                >
                  Buat Akun & Aktifkan
                </button>
              )}
            </div>

          </div>
        </div>
      )}

    </div>
  );
};

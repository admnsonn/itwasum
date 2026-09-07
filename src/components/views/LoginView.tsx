import React, { useState } from 'react';
import { CurrentUserProfile } from '../../types';
import { 
  PREDEFINED_ROLES_ACCOUNTS, 
  buildUserProfileFromConfig, 
  PredefinedAccountConfig 
} from '../../data/rolesData';
import { 
  Shield, 
  Lock, 
  Mail,
  Eye, 
  EyeOff,
  ArrowRight, 
  CheckCircle2, 
  AlertCircle,
  Building2, 
  KeyRound,
  FileCheck2,
  BadgeCheck,
  Fingerprint
} from 'lucide-react';
import { logBukaOverview } from '../../utils/auditLogger';

interface LoginViewProps {
  onLoginSuccess: (user: CurrentUserProfile) => void;
  onCancel?: () => void;
  currentUser?: CurrentUserProfile;
  targetAccountConfig?: PredefinedAccountConfig;
}

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onCancel,
  currentUser,
  targetAccountConfig
}) => {
  // Default to targetAccountConfig or L0 Pimpinan Tertinggi
  const defaultAccount = targetAccountConfig || PREDEFINED_ROLES_ACCOUNTS[0];
  const [email, setEmail] = useState<string>(defaultAccount.email);
  const [password, setPassword] = useState<string>(defaultAccount.password || 'Itwasum@2025');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedRoleConfig, setSelectedRoleConfig] = useState<PredefinedAccountConfig>(defaultAccount);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  // Handle selection of a predefined official role account
  const handleSelectPredefinedAccount = (account: PredefinedAccountConfig) => {
    setSelectedRoleConfig(account);
    setEmail(account.email);
    setPassword(account.password || 'Itwasum@2025');
    setErrorMessage(null);
  };

  // Perform Email & Password Login Authentication
  const handleLoginSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail) {
      setErrorMessage('Alamat email kedinasan wajib diisi.');
      return;
    }

    if (!trimmedPassword) {
      setErrorMessage('Kata sandi wajib diisi.');
      return;
    }

    setIsLoading(true);

    // Find account by email match or match selected role
    setTimeout(() => {
      const matchedAccount = PREDEFINED_ROLES_ACCOUNTS.find(
        (acc) => acc.email.toLowerCase() === trimmedEmail
      ) || selectedRoleConfig;

      if (!matchedAccount) {
        setIsLoading(false);
        setErrorMessage('Email tidak terdaftar dalam matriks RBAC E-Audit Mabes Polri.');
        return;
      }

      // Successful login
      const userProfile = buildUserProfileFromConfig(matchedAccount);
      logBukaOverview(userProfile, matchedAccount.titikWilayahNama);
      setIsLoading(false);
      onLoginSuccess(userProfile);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col justify-between selection:bg-amber-400 selection:text-slate-950">
      
      {/* Official Header */}
      <header className="border-b border-slate-800 bg-slate-900/90 px-6 py-4 flex items-center justify-between sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-white/10 p-1 flex items-center justify-center shrink-0 border border-white/15">
            <img 
              src="https://upload.wikimedia.org/wikipedia/commons/7/71/Inspektorat_Pengawasan_Umum_POLRI.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original" 
              alt="Logo Itwasum POLRI" 
              className="w-full h-full object-contain"
              referrerPolicy="no-referrer"
              onError={(e) => {
                const target = e.currentTarget;
                target.style.display = 'none';
                if (target.nextElementSibling) {
                  (target.nextElementSibling as HTMLElement).style.display = 'flex';
                }
              }}
            />
            <div className="w-full h-full rounded-lg bg-amber-500 items-center justify-center text-slate-950" style={{ display: 'none' }}>
              <Shield className="w-5 h-5 stroke-[2.2]" />
            </div>
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-sm sm:text-base tracking-tight text-white leading-tight">
                SATU DATA ITWASUM POLRI
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-black bg-amber-500 text-slate-950">
                E-AUDIT PRESISI
              </span>
            </div>
            <p className="text-[11px] text-slate-400">
              Portal Otentikasi &amp; Pengawasan Mutu Operasional Berbasis Peran (RBAC)
            </p>
          </div>
        </div>

        {currentUser && onCancel && (
          <button
            onClick={onCancel}
            className="text-xs font-bold px-3 py-1.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-300 transition cursor-pointer border border-slate-700"
          >
            Kembali ke Sesi ({currentUser.sebutanPimpinan})
          </button>
        )}
      </header>

      {/* Main Content: Two Columns */}
      <main className="max-w-7xl mx-auto w-full px-4 sm:px-6 py-8 flex-1 flex flex-col justify-center">
        
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* Left Column (5 cols): Email & Password Authentication Form */}
          <div className="lg:col-span-5 bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 space-y-6 shadow-2xl">
            <div>
              <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-wider bg-amber-400/10 text-amber-400 border border-amber-400/20 mb-3">
                <Lock className="w-3 h-3" />
                Otentikasi Pegawai Resmi
              </div>
              <h2 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Masuk ke Akun Anda
              </h2>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Silakan masukkan alamat email kedinasan Polri dan kata sandi Anda untuk mengakses portal pengawasan.
              </p>
            </div>

            {/* Re-authentication required notification when switching accounts */}
            {targetAccountConfig && (
              <div className="p-3 bg-amber-950/60 border border-amber-700/80 text-amber-200 rounded-2xl text-xs flex items-start gap-2.5 animate-in fade-in">
                <Lock className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
                <div className="leading-snug">
                  <span className="font-bold text-amber-300 block">Autentikasi Sesi Baru Diperlukan:</span>
                  Sesi akun sebelumnya telah di-logout. Silakan konfirmasi kredensial dan klik <strong>Verifikasi & Masuk Sesi</strong> untuk masuk sebagai <strong>{targetAccountConfig.peranLabel}</strong> ({targetAccountConfig.nama}).
                </div>
              </div>
            )}

            {/* Error Banner */}
            {errorMessage && (
              <div className="p-3 bg-red-950/70 border border-red-800 text-red-200 rounded-2xl text-xs flex items-start gap-2.5">
                <AlertCircle className="w-4 h-4 text-red-400 shrink-0 mt-0.5" />
                <div className="leading-snug">{errorMessage}</div>
              </div>
            )}

            <form onSubmit={handleLoginSubmit} className="space-y-4">
              {/* Email Input */}
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-300 block">
                  Email Kedinasan (@polri.go.id)
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => {
                      setEmail(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="nama.nrp@polri.go.id"
                    className="w-full pl-10 pr-4 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-bold text-slate-300">
                    Kata Sandi
                  </label>
                  <span className="text-[10px] text-slate-500 font-mono">Default: Itwasum@2025</span>
                </div>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => {
                      setPassword(e.target.value);
                      setErrorMessage(null);
                    }}
                    placeholder="Masukkan kata sandi akun"
                    className="w-full pl-10 pr-10 py-2.5 bg-slate-950 border border-slate-800 rounded-xl text-xs text-white placeholder-slate-500 focus:outline-none focus:border-amber-400 focus:ring-1 focus:ring-amber-400 transition font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white p-1 cursor-pointer"
                    aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Selected Profile Indicator */}
              <div className="p-3 bg-slate-950 border border-slate-800 rounded-2xl flex items-center justify-between gap-3 text-xs">
                <div className="min-w-0">
                  <div className="text-[10px] text-amber-400 font-bold uppercase tracking-wider">
                    Peran Terotentikasi:
                  </div>
                  <div className="font-extrabold text-white truncate text-xs mt-0.5">
                    {selectedRoleConfig.nama}
                  </div>
                  <div className="text-[10px] text-slate-400 truncate">
                    {selectedRoleConfig.sebutanPimpinan} • {selectedRoleConfig.titikWilayahNama}
                  </div>
                </div>
                <span className="px-2 py-1 rounded-md text-[10px] font-black uppercase bg-slate-800 text-amber-300 border border-slate-700 shrink-0">
                  {selectedRoleConfig.level}
                </span>
              </div>

              {/* Remember Me Checkbox */}
              <div className="flex items-center justify-between text-xs pt-1">
                <label className="flex items-center gap-2 cursor-pointer text-slate-400 select-none">
                  <input 
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="rounded border-slate-700 text-amber-500 focus:ring-amber-400 bg-slate-950" 
                  />
                  <span>Ingat sesi perangkat dinas</span>
                </label>
                <span className="text-slate-500 text-[11px]">Enkripsi SSL 256-Bit</span>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full py-3 rounded-2xl bg-gradient-to-r from-amber-500 to-amber-600 hover:from-amber-400 hover:to-amber-500 text-slate-950 font-black text-xs sm:text-sm shadow-lg shadow-amber-500/10 flex items-center justify-center gap-2 transition cursor-pointer disabled:opacity-50"
              >
                {isLoading ? (
                  <span>Memverifikasi Kredensial...</span>
                ) : (
                  <>
                    <span>Masuk ke Sistem E-Audit</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="pt-2 border-t border-slate-800 text-[11px] text-slate-500 flex items-center gap-2">
              <Fingerprint className="w-4 h-4 text-slate-400 shrink-0" />
              <span>Sesuai Surat Keputusan Kapolri tentang Keamanan Siber &amp; Pengawasan Presisi.</span>
            </div>
          </div>

          {/* Right Column (7 cols): Directory of 8 Official Roles with Quick Fill */}
          <div className="lg:col-span-7 space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-extrabold uppercase tracking-wider text-slate-300 flex items-center gap-2">
                  <KeyRound className="w-4 h-4 text-amber-400" />
                  Katalog Akun Resmi (8 Peran Sesuai Dokumen)
                </h3>
                <p className="text-xs text-slate-400 mt-0.5">
                  Klik peran di bawah untuk mengisi email dan kata sandi secara otomatis:
                </p>
              </div>
              <span className="text-[10px] font-bold text-slate-500 bg-slate-900 px-2.5 py-1 rounded-lg border border-slate-800">
                8 Profil Tersedia
              </span>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-[620px] overflow-y-auto pr-1">
              {PREDEFINED_ROLES_ACCOUNTS.map((acc, idx) => {
                const isSelected = selectedRoleConfig.id === acc.id;

                return (
                  <div
                    key={acc.id}
                    onClick={() => handleSelectPredefinedAccount(acc)}
                    className={`p-3.5 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between gap-2.5 ${
                      isSelected
                        ? 'bg-slate-900 border-amber-500 ring-2 ring-amber-500/20 shadow-lg'
                        : 'bg-slate-900/60 border-slate-800 hover:border-slate-700 hover:bg-slate-900'
                    }`}
                  >
                    <div className="space-y-1.5">
                      <div className="flex items-center justify-between gap-1.5">
                        <span className="text-[9px] font-black uppercase px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                          #{idx + 1} • {acc.level}
                        </span>
                        <span className={`text-[9px] font-bold uppercase px-1.5 py-0.5 rounded ${
                          acc.dapatOverview === 'penuh'
                            ? 'bg-emerald-950/80 text-emerald-300 border border-emerald-800'
                            : acc.dapatOverview === 'tanpa_data'
                              ? 'bg-blue-950/80 text-blue-300 border border-blue-800'
                              : 'bg-amber-950/80 text-amber-300 border border-amber-800'
                        }`}>
                          {acc.dapatOverview === 'penuh' ? 'Overview Penuh' : acc.dapatOverview === 'tanpa_data' ? 'Admin Sistem' : 'Akses E-Audit'}
                        </span>
                      </div>

                      <h4 className="font-extrabold text-xs text-white leading-snug">
                        {acc.peranLabel}
                      </h4>

                      <div className="text-[11px] text-slate-300 font-semibold truncate">
                        {acc.nama}
                      </div>

                      <div className="text-[10px] text-slate-500 flex items-center gap-1 truncate">
                        <Building2 className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>{acc.titikWilayahNama}</span>
                      </div>
                    </div>

                    <div className="pt-2 border-t border-slate-800/80 space-y-1 text-[10px]">
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Email:</span>
                        <span className="font-mono text-slate-300 truncate max-w-[170px]">{acc.email}</span>
                      </div>
                      <div className="flex items-center justify-between text-slate-400">
                        <span>Sandi:</span>
                        <span className="font-mono text-amber-400">{acc.password || 'Itwasum@2025'}</span>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleSelectPredefinedAccount(acc);
                      }}
                      className={`w-full py-1.5 rounded-lg text-[10px] font-bold transition cursor-pointer flex items-center justify-center gap-1 ${
                        isSelected
                          ? 'bg-amber-500 text-slate-950 font-black'
                          : 'bg-slate-800 hover:bg-slate-700 text-slate-300'
                      }`}
                    >
                      <span>{isSelected ? 'Kredensial Aktif di Form' : 'Gunakan Akun Ini'}</span>
                      <ArrowRight className="w-3 h-3" />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-800 bg-slate-900/60 px-6 py-3 text-center text-xs text-slate-500">
        Inspektorat Pengawasan Umum Kepolisian Negara Republik Indonesia &bull; Standar Tata Kelola &amp; Hak Akses E-Audit
      </footer>

    </div>
  );
};

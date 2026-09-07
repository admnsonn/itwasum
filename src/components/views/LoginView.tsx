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
  const defaultAccount = targetAccountConfig || null;
  const [email, setEmail] = useState<string>(defaultAccount?.email || '');
  const [password, setPassword] = useState<string>(defaultAccount?.password || '');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [selectedRoleConfig, setSelectedRoleConfig] = useState<PredefinedAccountConfig | null>(defaultAccount);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);

  const handleSelectPredefinedAccount = (account: PredefinedAccountConfig) => {
    setSelectedRoleConfig(account);
    setEmail(account.email);
    setPassword(account.password || 'Itwasum@2025');
    setErrorMessage(null);
  };

  const handleLoginSubmit = (event: React.FormEvent) => {
    event.preventDefault();
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

    if (!selectedRoleConfig) {
      setErrorMessage('Pilih role akun terlebih dahulu.');
      return;
    }

    const expectedPassword = selectedRoleConfig.password || 'Itwasum@2025';
    if (trimmedEmail !== selectedRoleConfig.email.toLowerCase()) {
      setErrorMessage('Email tidak sesuai dengan role akun yang dipilih.');
      return;
    }

    if (trimmedPassword !== expectedPassword) {
      setErrorMessage('Kata sandi tidak sesuai.');
      return;
    }

    setIsLoading(true);
    setTimeout(() => {
      const userProfile = buildUserProfileFromConfig(selectedRoleConfig);
      logBukaOverview(userProfile, selectedRoleConfig.titikWilayahNama);
      setIsLoading(false);
      onLoginSuccess(userProfile);
    }, 450);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex selection:bg-[#d9a441] selection:text-slate-950">
      <main className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-[minmax(0,46%)_minmax(0,54%)]">
        <aside className="hidden lg:flex min-h-screen bg-[#0B2B5C] text-white relative overflow-hidden px-10 xl:px-16 py-12 flex-col justify-between">
          <div className="absolute -right-24 top-24 w-80 h-80 rounded-full border border-white/10" />
          <div className="absolute -left-32 bottom-20 w-96 h-96 rounded-full border border-white/10" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 rounded-lg bg-white p-1 flex items-center justify-center shrink-0">
              <img
                src="https://upload.wikimedia.org/wikipedia/commons/7/71/Inspektorat_Pengawasan_Umum_POLRI.png?utm_source=commons.wikimedia.org&utm_campaign=index&utm_content=original"
                alt="Logo Itwasum POLRI"
                className="w-full h-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>
            <div>
              <p className="text-lg font-bold tracking-tight">Satu Data Itwasum</p>
              <p className="text-xs text-blue-200 mt-0.5">Portal pengawasan dan audit internal</p>
            </div>
          </div>
          <div className="relative z-10 max-w-md">
            <div className="w-10 h-1 bg-amber-400 mb-5" />
            <h2 className="text-3xl xl:text-4xl font-extrabold tracking-tight leading-tight">Satu Data Itwasum Polri</h2>
            <p className="text-sm text-blue-100/80 mt-4 leading-relaxed">Gunakan akun kedinasan Anda untuk melanjutkan ke ruang kerja pengawasan.</p>
          </div>
          <p className="relative z-10 text-[11px] text-blue-200/70">Inspektorat Pengawasan Umum Kepolisian Negara Republik Indonesia</p>
        </aside>

        <section className="min-h-screen flex items-center justify-center bg-[#f8f9fc] px-4 sm:px-8 lg:px-12 py-8 sm:py-12">
          <div className="w-full max-w-[440px] bg-white border border-slate-200 rounded-xl p-6 sm:p-9 shadow-sm">
            <div className="mb-7">
              <p className="text-[11px] font-bold tracking-[0.12em] uppercase text-[#0B4A8A] mb-2">Akses pegawai</p>
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">Masuk ke portal</h1>
              <p className="text-sm text-slate-500 mt-2 leading-relaxed">Gunakan akun kedinasan Anda untuk melanjutkan ke ruang kerja pengawasan.</p>
            </div>
            {targetAccountConfig && <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 text-amber-950 rounded-lg text-xs flex items-start gap-2.5"><Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" /><p>Silakan konfirmasi kredensial untuk masuk sebagai <strong>{targetAccountConfig.peranLabel}</strong>.</p></div>}
            {errorMessage && <div role="alert" className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2.5"><AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" /><p>{errorMessage}</p></div>}
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-2">
                <label htmlFor="login-role" className="text-xs font-bold text-slate-700 block">Role akun</label>
                <select
                  id="login-role"
                  required
                  value={selectedRoleConfig?.id || ''}
                  onChange={(event) => {
                    const selectedAccount = PREDEFINED_ROLES_ACCOUNTS.find((account) => account.id === event.target.value);
                    if (selectedAccount) {
                      handleSelectPredefinedAccount(selectedAccount);
                    }
                  }}
                  className="w-full min-h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="" disabled>Pilih role akun</option>
                  {PREDEFINED_ROLES_ACCOUNTS.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.peranLabel} - {account.titikWilayahNama}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2"><label htmlFor="login-email" className="text-xs font-bold text-slate-700 block">Email kedinasan</label><div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" /><input id="login-email" type="email" required disabled={!selectedRoleConfig} value={email} onChange={(e) => { setEmail(e.target.value); setErrorMessage(null); }} placeholder="Pilih role terlebih dahulu" className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100" /></div></div>
              <div className="space-y-2"><label htmlFor="login-password" className="text-xs font-bold text-slate-700 block">Kata sandi</label><div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" /><input id="login-password" type={showPassword ? 'text' : 'password'} required disabled={!selectedRoleConfig} value={password} onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }} placeholder="Pilih role terlebih dahulu" className="w-full pl-10 pr-11 py-3 bg-white border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100" /><button type="button" disabled={!selectedRoleConfig} onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
              <div className="p-3.5 bg-slate-50 border border-slate-200 rounded-lg flex items-center justify-between gap-3 text-xs"><div className="min-w-0"><div className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">Akun yang dipilih</div><div className="font-bold text-slate-900 truncate text-sm mt-0.5">{selectedRoleConfig?.nama || 'Belum dipilih'}</div><div className="text-[11px] text-slate-500 truncate">{selectedRoleConfig ? `${selectedRoleConfig.sebutanPimpinan} · ${selectedRoleConfig.titikWilayahNama}` : 'Pilih role untuk melanjutkan'}</div></div><span className="px-2 py-1 rounded-md text-[10px] font-extrabold bg-white text-[#0B4A8A] border border-slate-200 shrink-0">{selectedRoleConfig?.level || '-'}</span></div>
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-slate-300 text-[#0B4A8A]" />Ingat perangkat ini</label>
              <button type="submit" disabled={isLoading} className="w-full min-h-11 rounded-lg bg-[#0B2B5C] hover:bg-[#0B4A8A] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">{isLoading ? 'Memverifikasi...' : <>Masuk <ArrowRight className="w-4 h-4" /></>}</button>
            </form>
            <p className="pt-4 mt-6 border-t border-slate-100 text-[11px] text-slate-500">Akses dilindungi dan dicatat dalam jejak audit sistem.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

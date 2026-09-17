import React, { useMemo, useState } from 'react';
import { CurrentUserProfile } from '../../types';
import { 
  PREDEFINED_ROLES_ACCOUNTS, 
  buildUserProfileFromConfig, 
  PredefinedAccountConfig 
} from '../../data/rolesData';
import {
  Lock,
  Mail,
  Eye,
  EyeOff,
  ArrowRight,
  AlertCircle,
} from 'lucide-react';
import { logBukaOverview } from '../../utils/auditLogger';
import { StepIndicator } from '../ui';
import { DataIntegrationNotice } from '../ui/DataIntegrationNotice';

const DEMO_OTP = '246810';

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
  const [selectedLevel, setSelectedLevel] = useState<string>(defaultAccount?.level || '');
  const [selectedWilayahId, setSelectedWilayahId] = useState<string>(defaultAccount?.titikWilayahId || '');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [stage, setStage] = useState<'login' | 'otp' | 'reset'>('login');
  const [otp, setOtp] = useState('');
  const [otpSeconds, setOtpSeconds] = useState(60);
  const [pendingProfile, setPendingProfile] = useState<CurrentUserProfile | null>(null);
  const [resetStep, setResetStep] = useState(0);
  const [resetEmail, setResetEmail] = useState('');
  const [resetPassword, setResetPassword] = useState('');

  const levelOptions = [
    { id: 'L0', label: 'Nasional / Mabes' },
    { id: 'L1', label: 'Inspektorat Wilayah' },
    { id: 'L2', label: 'Polda' },
    { id: 'L3', label: 'Polres' }
  ];
  const wilayahOptions = useMemo(() => {
    const wilayah = PREDEFINED_ROLES_ACCOUNTS.filter(account => account.level === selectedLevel)
      .map(account => ({ id: account.titikWilayahId, nama: account.titikWilayahNama }));
    return Array.from(new Map(wilayah.map(item => [item.id, item])).values());
  }, [selectedLevel]);
  const roleOptions = useMemo(() => PREDEFINED_ROLES_ACCOUNTS.filter(account => (
    account.level === selectedLevel && account.titikWilayahId === selectedWilayahId
  )), [selectedLevel, selectedWilayahId]);

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
      setPendingProfile(userProfile);
      setStage('otp');
      setOtp('');
      setOtpSeconds(60);
      setIsLoading(false);
    }, 450);
  };

  React.useEffect(() => {
    if (stage !== 'otp' && !(stage === 'reset' && resetStep === 1)) return;
    if (otpSeconds <= 0) return;
    const t = window.setTimeout(() => setOtpSeconds((s) => s - 1), 1000);
    return () => window.clearTimeout(t);
  }, [stage, otpSeconds, resetStep]);

  const finishLogin = (profile: CurrentUserProfile) => {
    logBukaOverview(profile, selectedRoleConfig?.titikWilayahNama || profile.titikWilayahNama);
    onLoginSuccess(profile);
  };

  const handleVerifyOtp = (event: React.FormEvent) => {
    event.preventDefault();
    if (otp.trim() !== DEMO_OTP) {
      setErrorMessage('Kode OTP tidak sesuai. Gunakan kode uji 246810 (kanal pengiriman menunggu integrasi).');
      return;
    }
    if (pendingProfile) finishLogin(pendingProfile);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex selection:bg-[#d9a441] selection:text-slate-950">
      <main className="w-full min-h-screen grid grid-cols-1 lg:grid-cols-[minmax(0,46%)_minmax(0,54%)]">
        <aside className="hidden lg:flex min-h-screen bg-[#0B2B5C] text-white relative overflow-hidden px-10 xl:px-16 py-12 flex-col justify-between">
          <div className="absolute -right-24 top-24 w-80 h-80 rounded-full border border-white/10" />
          <div className="absolute -left-32 bottom-20 w-96 h-96 rounded-full border border-white/10" />
          <div className="relative z-10 flex items-center gap-3">
            <div className="w-11 h-11 flex items-center justify-center shrink-0">
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
            {stage === 'otp' && pendingProfile && (
              <form onSubmit={handleVerifyOtp} className="space-y-5">
                <StepIndicator steps={['Kredensial', 'OTP']} currentStep={1} />
                <p className="text-sm text-slate-600">Masukkan kode OTP untuk {pendingProfile.email}.</p>
                <input
                  id="login-otp"
                  inputMode="numeric"
                  maxLength={6}
                  value={otp}
                  onChange={(e) => { setOtp(e.target.value.replace(/\D/g, '').slice(0, 6)); setErrorMessage(null); }}
                  placeholder="246810"
                  className="w-full tracking-[0.4em] text-center text-lg font-bold px-3 py-3 border border-slate-300 rounded-lg"
                />
                <DataIntegrationNotice variant="inline" sumber="Kanal OTP DIV TIK" tahap="Pengiriman SMS/email menunggu integrasi" />
                <div className="flex items-center justify-between text-xs text-slate-500">
                  <button
                    type="button"
                    disabled={otpSeconds > 0}
                    onClick={() => { setOtpSeconds(60); setErrorMessage(null); }}
                    className="font-bold text-[#0B4A8A] disabled:text-slate-400"
                  >
                    Kirim ulang {otpSeconds > 0 ? `(${otpSeconds}s)` : ''}
                  </button>
                  <button type="button" className="font-bold" onClick={() => { setStage('login'); setPendingProfile(null); }}>Kembali</button>
                </div>
                <button type="submit" className="w-full min-h-11 rounded-lg bg-[#0B2B5C] text-white font-bold text-sm">Verifikasi OTP</button>
              </form>
            )}
            {stage === 'reset' && (
              <div className="space-y-5">
                <StepIndicator steps={['Identitas', 'OTP', 'Sandi baru']} currentStep={resetStep} />
                {resetStep === 0 && (
                  <form
                    onSubmit={(e) => { e.preventDefault(); if (!resetEmail.trim()) { setErrorMessage('Email kedinasan wajib diisi.'); return; } setResetStep(1); setOtp(''); setOtpSeconds(60); setErrorMessage(null); }}
                    className="space-y-3"
                  >
                    <label className="text-xs font-bold text-slate-700 block">Email kedinasan</label>
                    <input value={resetEmail} onChange={(e) => setResetEmail(e.target.value)} className="w-full px-3 py-3 border border-slate-300 rounded-lg text-sm" placeholder="nama.nrp@polri.go.id" />
                    <button type="submit" className="w-full min-h-11 rounded-lg bg-[#0B2B5C] text-white font-bold text-sm">Kirim OTP</button>
                  </form>
                )}
                {resetStep === 1 && (
                  <form
                    onSubmit={(e) => { e.preventDefault(); if (otp !== DEMO_OTP) { setErrorMessage('Kode OTP tidak sesuai.'); return; } setResetStep(2); setErrorMessage(null); }}
                    className="space-y-3"
                  >
                    <input value={otp} onChange={(e) => setOtp(e.target.value.replace(/\D/g, '').slice(0, 6))} maxLength={6} className="w-full tracking-[0.4em] text-center text-lg font-bold px-3 py-3 border border-slate-300 rounded-lg" placeholder="246810" />
                    <DataIntegrationNotice variant="inline" sumber="Kanal OTP DIV TIK" />
                    <button type="button" disabled={otpSeconds > 0} onClick={() => setOtpSeconds(60)} className="text-xs font-bold text-[#0B4A8A] disabled:text-slate-400">Kirim ulang {otpSeconds > 0 ? `(${otpSeconds}s)` : ''}</button>
                    <button type="submit" className="w-full min-h-11 rounded-lg bg-[#0B2B5C] text-white font-bold text-sm">Verifikasi</button>
                  </form>
                )}
                {resetStep === 2 && (
                  <form
                    onSubmit={(e) => { e.preventDefault(); if (resetPassword.trim().length < 8) { setErrorMessage('Kata sandi baru minimal 8 karakter.'); return; } setStage('login'); setResetStep(0); setErrorMessage(null); setPassword(resetPassword); }}
                    className="space-y-3"
                  >
                    <label className="text-xs font-bold text-slate-700 block">Kata sandi baru</label>
                    <input type="password" value={resetPassword} onChange={(e) => setResetPassword(e.target.value)} className="w-full px-3 py-3 border border-slate-300 rounded-lg text-sm" />
                    <button type="submit" className="w-full min-h-11 rounded-lg bg-[#0B2B5C] text-white font-bold text-sm">Simpan sandi</button>
                  </form>
                )}
                <button type="button" className="text-xs font-bold text-slate-500" onClick={() => { setStage('login'); setResetStep(0); }}>Kembali ke masuk</button>
              </div>
            )}
            {stage === 'login' && (
            <form onSubmit={handleLoginSubmit} className="space-y-5">
              <div className="space-y-3">
                <div className="space-y-2">
                  <label htmlFor="login-level" className="text-xs font-bold text-slate-700 block">Tingkat akses</label>
                  <select
                    id="login-level"
                    required
                    value={selectedLevel}
                    onChange={(event) => {
                      setSelectedLevel(event.target.value);
                      setSelectedWilayahId('');
                      setSelectedRoleConfig(null);
                      setEmail('');
                      setPassword('');
                      setErrorMessage(null);
                    }}
                    className="w-full min-h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="" disabled>Pilih tingkat akses</option>
                    {levelOptions.map((level) => <option key={level.id} value={level.id}>{level.label}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-wilayah" className="text-xs font-bold text-slate-700 block">Yurisdiksi wilayah</label>
                  <select
                    id="login-wilayah"
                    required
                    disabled={!selectedLevel}
                    value={selectedWilayahId}
                    onChange={(event) => {
                      setSelectedWilayahId(event.target.value);
                      setSelectedRoleConfig(null);
                      setEmail('');
                      setPassword('');
                      setErrorMessage(null);
                    }}
                    className="w-full min-h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100"
                  >
                    <option value="" disabled>Pilih yurisdiksi wilayah</option>
                    {wilayahOptions.map((wilayah) => <option key={wilayah.id} value={wilayah.id}>{wilayah.nama}</option>)}
                  </select>
                </div>

                <div className="space-y-2">
                  <label htmlFor="login-role" className="text-xs font-bold text-slate-700 block">Peran akun</label>
                <select
                  id="login-role"
                  required
                  disabled={!selectedWilayahId}
                  value={selectedRoleConfig?.id || ''}
                  onChange={(event) => {
                    const selectedAccount = roleOptions.find((account) => account.id === event.target.value);
                    if (selectedAccount) {
                      handleSelectPredefinedAccount(selectedAccount);
                    }
                  }}
                  className="w-full min-h-11 px-3.5 bg-white border border-slate-300 rounded-lg text-sm font-semibold text-slate-800 disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100"
                >
                  <option value="" disabled>Pilih peran akun</option>
                  {roleOptions.map((account) => (
                    <option key={account.id} value={account.id}>
                      {account.peranLabel}
                    </option>
                  ))}
                </select>
                </div>
              </div>
              <div className="space-y-2"><label htmlFor="login-email" className="text-xs font-bold text-slate-700 block">Email kedinasan</label><div className="relative"><Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" /><input id="login-email" type="email" required disabled={!selectedRoleConfig} value={email} onChange={(e) => { setEmail(e.target.value); setErrorMessage(null); }} placeholder="Pilih role terlebih dahulu" className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100" /></div></div>
              <div className="space-y-2"><label htmlFor="login-password" className="text-xs font-bold text-slate-700 block">Kata sandi</label><div className="relative"><Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" /><input id="login-password" type={showPassword ? 'text' : 'password'} required disabled={!selectedRoleConfig} value={password} onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }} placeholder="Pilih role terlebih dahulu" className="w-full pl-10 pr-11 py-3 bg-white border border-slate-300 rounded-lg text-sm disabled:bg-slate-100 disabled:text-slate-400 disabled:cursor-not-allowed focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100" /><button type="button" disabled={!selectedRoleConfig} onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700 disabled:cursor-not-allowed disabled:opacity-50" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>{showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}</button></div></div>
              <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-slate-300 text-[#0B4A8A]" />Ingat perangkat ini</label>
              <button type="submit" disabled={isLoading} className="w-full min-h-11 rounded-lg bg-[#0B2B5C] hover:bg-[#0B4A8A] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">{isLoading ? 'Memverifikasi...' : <>Masuk <ArrowRight className="w-4 h-4" /></>}</button>
              <button type="button" className="w-full text-xs font-bold text-[#0B4A8A]" onClick={() => { setStage('reset'); setResetStep(0); setResetEmail(email); setErrorMessage(null); }}>Lupa kata sandi</button>
            </form>
            )}
            <p className="pt-4 mt-6 border-t border-slate-100 text-[11px] text-slate-500">Akses dilindungi dan dicatat dalam jejak audit sistem.</p>
          </div>
        </section>
      </main>
    </div>
  );
};

import React, { useEffect, useState } from 'react';
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
  ChevronDown,
  UserCircle2,
} from 'lucide-react';
import loginHero from '../../assets/images/login-hero.jpg';
import { logBukaOverview } from '../../utils/auditLogger';
import {
  getLockStatus,
  recordFailedAttempt,
  resetAttempts,
  startOtp,
  pushNotification,
} from '../../data/auth/sessionSecurity';
import { OtpStep } from './auth/OtpStep';
import { ForgotPasswordFlow } from './auth/ForgotPasswordFlow';

interface LoginViewProps {
  onLoginSuccess: (user: CurrentUserProfile, rememberIdentifier?: string) => void;
  onCancel?: () => void;
  currentUser?: CurrentUserProfile;
  targetAccountConfig?: PredefinedAccountConfig;
}

/** B.11: satu pesan generik untuk seluruh kegagalan login (BR "One generic error message is
 * shown for any failed login") — tidak membedakan email salah vs kata sandi salah. */
const GENERIC_LOGIN_ERROR = 'Email/username atau kata sandi tidak sesuai, atau akun tidak ditemukan.';

export const LoginView: React.FC<LoginViewProps> = ({
  onLoginSuccess,
  onCancel,
  currentUser,
  targetAccountConfig
}) => {
  // Default ke targetAccountConfig (mis. saat "Ganti Peran") bila ada.
  const defaultAccount = targetAccountConfig || null;
  const [email, setEmail] = useState<string>(defaultAccount?.email || '');
  const [password, setPassword] = useState<string>(defaultAccount?.password || '');
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [rememberMe, setRememberMe] = useState<boolean>(true);
  const [step, setStep] = useState<'credentials' | 'otp' | 'forgot'>('credentials');
  const [lockedMessage, setLockedMessage] = useState<string | null>(null);
  const [pendingProfile, setPendingProfile] = useState<CurrentUserProfile | null>(null);
  const [pendingRoleConfig, setPendingRoleConfig] = useState<PredefinedAccountConfig | null>(null);
  const [showAkunDemo, setShowAkunDemo] = useState<boolean>(!!defaultAccount);

  // BR B.11: mengunci input & tombol submit selama akun terkunci, dengan hitung mundur.
  useEffect(() => {
    if (!email.trim()) return setLockedMessage(null);
    const status = getLockStatus(email.trim());
    if (status.locked) {
      const mins = Math.ceil(status.remainingMs / 60000);
      setLockedMessage(`Akun terkunci sementara akibat 5 kali gagal login. Coba lagi dalam ~${mins} menit.`);
    } else {
      setLockedMessage(null);
    }
  }, [email]);

  /** Login Figma: email + kata sandi biasa, tanpa pemilih level/wilayah/peran — dicocokkan
   * langsung terhadap `PREDEFINED_ROLES_ACCOUNTS` lewat email. Daftar "Akun Demo" di bawah
   * form hanya membantu mengisi otomatis untuk keperluan demo. */
  const handleSelectAkunDemo = (account: PredefinedAccountConfig) => {
    setEmail(account.email);
    setPassword(account.password || 'Itwasum@2025');
    setErrorMessage(null);
  };

  const handleLoginSubmit = (event: React.FormEvent) => {
    event.preventDefault();
    setErrorMessage(null);

    const trimmedEmail = email.trim().toLowerCase();
    const trimmedPassword = password.trim();

    if (!trimmedEmail || !trimmedPassword) {
      setErrorMessage(GENERIC_LOGIN_ERROR);
      return;
    }

    const lockStatus = getLockStatus(trimmedEmail);
    if (lockStatus.locked) {
      setErrorMessage(GENERIC_LOGIN_ERROR);
      return;
    }

    const matchedAccount = PREDEFINED_ROLES_ACCOUNTS.find((account) => account.email.toLowerCase() === trimmedEmail);
    const expectedPassword = matchedAccount?.password || 'Itwasum@2025';
    const credentialsOk = !!matchedAccount && trimmedPassword === expectedPassword;

    if (!credentialsOk) {
      const result = recordFailedAttempt(trimmedEmail);
      setErrorMessage(result.locked ? GENERIC_LOGIN_ERROR : `${GENERIC_LOGIN_ERROR} (${result.attemptsLeft} percobaan tersisa)`);
      if (result.locked) {
        const status = getLockStatus(trimmedEmail);
        const mins = Math.ceil(status.remainingMs / 60000);
        setLockedMessage(`Akun terkunci sementara akibat 5 kali gagal login. Coba lagi dalam ~${mins} menit.`);
      }
      return;
    }

    resetAttempts(trimmedEmail);
    setIsLoading(true);
    setTimeout(() => {
      const userProfile = buildUserProfileFromConfig(matchedAccount);
      setIsLoading(false);
      setPendingProfile(userProfile);
      setPendingRoleConfig(matchedAccount);
      startOtp(trimmedEmail);
      setStep('otp');
    }, 450);
  };

  const handleOtpVerified = () => {
    if (!pendingProfile || !pendingRoleConfig) return;
    logBukaOverview(pendingProfile, pendingRoleConfig.titikWilayahNama);
    pushNotification('Verifikasi 2FA Berhasil', `${pendingProfile.nama} berhasil menyelesaikan verifikasi OTP.`);
    // BR: "Remember Me keeps only the identifier and never skips 2FA" — hanya identifier yang
    // disimpan untuk mempercepat pengisian form login berikutnya, OTP tetap selalu wajib.
    onLoginSuccess(pendingProfile, rememberMe ? email.trim() : undefined);
  };

  return (
    <div className="min-h-screen bg-white text-slate-900 flex selection:bg-[#d9a441] selection:text-slate-950">
      <main className="w-full min-h-screen lg:flex">
        {/* Panel kiri — foto hero dari Figma (frame 461:1923), sudah memuat overlay copy.
            Lebar mengikuti rasio foto (294:416) supaya panel penuh tanpa object-cover
            yang men-zoom gedung dan memotong logo serta caption. */}
        <aside
          className="hidden lg:block h-screen shrink-0 overflow-hidden"
          style={{ width: 'min(46vw, calc(100vh * 294 / 416))' }}
        >
          <img
            src={loginHero}
            alt="Satu Data Pengawasan Intern"
            className="h-full w-full object-cover object-center"
          />
        </aside>

        <section className="min-h-screen flex flex-1 items-center justify-center bg-white px-5 sm:px-10 lg:px-16 py-10">
          <div className="w-full max-w-[400px]">
            {step === 'credentials' && (
              <div className="mb-7">
                <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-slate-950">Selamat Datang</h1>
                <p className="text-sm text-slate-500 mt-2 leading-relaxed">Silakan masuk menggunakan kredensial anda.</p>
              </div>
            )}
            {targetAccountConfig && step === 'credentials' && <div className="mb-5 p-3.5 bg-amber-50 border border-amber-200 text-amber-950 rounded-lg text-xs flex items-start gap-2.5"><Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" /><p>Silakan konfirmasi kredensial untuk masuk sebagai <strong>{targetAccountConfig.peranLabel}</strong>.</p></div>}

            {step === 'otp' && pendingProfile && (
              <OtpStep
                identifier={email.trim()}
                userName={pendingProfile.nama}
                onVerified={handleOtpVerified}
                onBackToLogin={() => { setStep('credentials'); setPendingProfile(null); }}
              />
            )}

            {step === 'forgot' && (
              <ForgotPasswordFlow onDone={() => setStep('credentials')} onBack={() => setStep('credentials')} />
            )}

            {step === 'credentials' && (
              <>
                {lockedMessage && <div role="alert" className="mb-5 p-3.5 bg-amber-50 border border-amber-200 text-amber-900 rounded-lg text-xs flex items-start gap-2.5"><Lock className="w-4 h-4 text-amber-700 shrink-0 mt-0.5" /><p>{lockedMessage}</p></div>}
                {errorMessage && <div role="alert" className="mb-5 p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2.5"><AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" /><p>{errorMessage}</p></div>}
                <form onSubmit={handleLoginSubmit} className="space-y-5">
                  <div className="space-y-2">
                    <label htmlFor="login-email" className="text-xs font-bold text-slate-700 block">Email</label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="login-email"
                        type="email"
                        required
                        value={email}
                        onChange={(e) => { setEmail(e.target.value); setErrorMessage(null); }}
                        placeholder="admin@gmail.com"
                        className="w-full pl-10 pr-4 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label htmlFor="login-password" className="text-xs font-bold text-slate-700 block">Kata Sandi</label>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                      <input
                        id="login-password"
                        type={showPassword ? 'text' : 'password'}
                        required
                        value={password}
                        onChange={(e) => { setPassword(e.target.value); setErrorMessage(null); }}
                        placeholder="••••••"
                        className="w-full pl-10 pr-11 py-3 bg-white border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100"
                      />
                      <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1.5 text-slate-400 hover:text-slate-700" aria-label={showPassword ? 'Sembunyikan kata sandi' : 'Tampilkan kata sandi'}>
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center justify-between gap-3">
                    <label className="flex items-center gap-2 text-xs text-slate-500 cursor-pointer min-w-0"><input type="checkbox" checked={rememberMe} onChange={(e) => setRememberMe(e.target.checked)} className="rounded border-slate-300 text-[#0B4A8A] shrink-0" /><span>Ingat perangkat ini selama 30 hari</span></label>
                    <button type="button" onClick={() => setStep('forgot')} className="text-xs font-bold text-[#0B4A8A] hover:underline shrink-0">Lupa Kata Sandi?</button>
                  </div>
                  <button type="submit" disabled={isLoading || !!lockedMessage} className="w-full min-h-11 rounded-lg bg-[#0B2B5C] hover:bg-[#0B4A8A] text-white font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-60">{isLoading ? 'Memverifikasi...' : <>Masuk <ArrowRight className="w-4 h-4" /></>}</button>
                </form>

                {/* "Akun Demo" — daftar akun contoh yang dapat mengisi otomatis email & kata
                    sandi (demo/dev only; tidak ada pada Figma tapi dibutuhkan karena aplikasi
                    ini mensimulasikan 8 peran resmi tanpa backend otentikasi nyata). */}
                <div className="mt-5 pt-4 border-t border-slate-100">
                  <button
                    type="button"
                    onClick={() => setShowAkunDemo((v) => !v)}
                    className="w-full flex items-center justify-between text-xs font-bold text-slate-500 hover:text-slate-800"
                  >
                    <span className="flex items-center gap-1.5"><UserCircle2 className="w-3.5 h-3.5" />Akun Demo (khusus lingkungan uji coba)</span>
                    <ChevronDown className={`w-3.5 h-3.5 transition-transform ${showAkunDemo ? 'rotate-180' : ''}`} />
                  </button>
                  {showAkunDemo && (
                    <ul className="mt-2.5 space-y-1 max-h-48 overflow-y-auto">
                      {PREDEFINED_ROLES_ACCOUNTS.map((account) => (
                        <li key={account.id}>
                          <button
                            type="button"
                            onClick={() => handleSelectAkunDemo(account)}
                            className="w-full text-left px-2.5 py-1.5 rounded-[8px] hover:bg-slate-50 flex items-center justify-between gap-2 group"
                          >
                            <span className="text-[11px] font-bold text-slate-700 truncate">{account.peranLabel}</span>
                            <span className="text-[10px] text-slate-400 truncate group-hover:text-[#0B4A8A]">{account.email}</span>
                          </button>
                        </li>
                      ))}
                    </ul>
                  )}
                </div>
                <p className="pt-4 mt-4 border-t border-slate-100 text-[11px] text-slate-500">Akses dilindungi dan dicatat dalam jejak audit sistem.</p>
              </>
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

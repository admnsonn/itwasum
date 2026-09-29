/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.11 OTP 2FA — kode 6 digit, tujuan disamarkan, kadaluarsa 5 menit dengan countdown, kirim
 * ulang setelah 60 detik (maks 5x/hari), 5 kali salah kembali ke login. Kode ditampilkan
 * sebagai hint on-screen karena aplikasi ini frontend-only/demo (Plan "Align itwasum with
 * Plane BA/SA", todo p7-b11).
 */
import React, { useEffect, useRef, useState } from 'react';
import { AlertCircle, KeyRound, RefreshCw, LockKeyhole } from 'lucide-react';
import { getOtp, verifyOtp, resendOtp, canResendOtp, maskDestination } from '../../../data/auth/sessionSecurity';

interface OtpStepProps {
  identifier: string;
  userName: string;
  onVerified: () => void;
  onBackToLogin: () => void;
}

function formatCountdown(ms: number): string {
  const total = Math.max(0, Math.ceil(ms / 1000));
  const mm = String(Math.floor(total / 60)).padStart(2, '0');
  const ss = String(total % 60).padStart(2, '0');
  return `${mm}:${ss}`;
}

export const OtpStep: React.FC<OtpStepProps> = ({ identifier, userName, onVerified, onBackToLogin }) => {
  const [digits, setDigits] = useState<string[]>(['', '', '', '', '', '']);
  const [error, setError] = useState<string | null>(null);
  const [tick, setTick] = useState(0);
  const otp = getOtp();
  const code = digits.join('');
  const boxRefs = useRef<(HTMLInputElement | null)[]>([]);

  const setDigit = (index: number, value: string) => {
    const v = value.replace(/\D/g, '').slice(-1);
    setDigits((prev) => {
      const next = [...prev];
      next[index] = v;
      return next;
    });
    if (v && index < 5) boxRefs.current[index + 1]?.focus();
  };

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace' && !digits[index] && index > 0) boxRefs.current[index - 1]?.focus();
  };

  useEffect(() => {
    const interval = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => window.clearInterval(interval);
  }, []);

  useEffect(() => {
    if (!otp) return;
    if (new Date(otp.expiresAt).getTime() <= Date.now()) {
      setError('Kode OTP telah kadaluarsa. Silakan minta kode baru.');
    }
  }, [tick, otp]);

  if (!otp) {
    return (
      <div className="space-y-3">
        <div className="p-3.5 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">Sesi OTP tidak ditemukan. Silakan ulangi login.</div>
        <button onClick={onBackToLogin} className="text-xs font-bold text-[#0B4A8A] hover:underline">Kembali ke Login</button>
      </div>
    );
  }

  const remainingMs = new Date(otp.expiresAt).getTime() - Date.now();
  const expired = remainingMs <= 0;
  const resendCheck = canResendOtp();

  const handleVerify = () => {
    setError(null);
    const result = verifyOtp(code);
    if (result === 'ok') return onVerified();
    if (result === 'expired') return setError('Kode OTP telah kadaluarsa. Silakan minta kode baru.');
    if (result === 'locked_out') {
      setError('Terlalu banyak kode salah. Silakan login kembali.');
      setTimeout(onBackToLogin, 1500);
      return;
    }
    setDigits(['', '', '', '', '', '']);
    boxRefs.current[0]?.focus();
    setError('Kode OTP salah. Silakan coba lagi.');
  };

  return (
    <div className="space-y-5 text-center">
      <div className="flex flex-col items-center gap-2">
        <span className="w-11 h-11 rounded-full bg-[#0B2B5C]/10 flex items-center justify-center"><LockKeyhole className="w-5 h-5 text-[#0B2B5C]" /></span>
        <h2 className="text-base font-extrabold text-slate-900">Masukkan Kode OTP</h2>
        <p className="text-xs text-slate-500">Masukkan kode yang dikirim ke <strong>{maskDestination(identifier)}</strong> untuk {userName}.</p>
      </div>

      {error && <div role="alert" className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs flex items-start gap-2 text-left"><AlertCircle className="w-4 h-4 shrink-0 mt-0.5" />{error}</div>}

      <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900 flex items-start gap-2 text-left">
        <KeyRound className="w-4 h-4 shrink-0 mt-0.5" />
        <span><strong>Dev Hint (demo):</strong> Kode OTP Anda adalah <strong className="font-mono text-sm">{otp.code}</strong>.</span>
      </div>

      <div className="flex items-center justify-center gap-2">
        {digits.map((d, i) => (
          <input
            key={i}
            ref={(el) => { boxRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => setDigit(i, e.target.value)}
            onKeyDown={(e) => handleKeyDown(i, e)}
            className="w-11 h-12 text-center text-xl font-black border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100"
          />
        ))}
      </div>
      <div className="text-[11px] text-slate-400">{expired ? 'Kode kadaluarsa' : `Kadaluarsa dalam ${formatCountdown(remainingMs)}`}</div>

      <button
        onClick={handleVerify}
        disabled={code.length !== 6 || expired}
        className="w-full min-h-11 rounded-lg bg-[#0B2B5C] hover:bg-[#0B4A8A] text-white font-bold text-sm disabled:opacity-60"
      >
        Masuk
      </button>

      <button
        onClick={() => { resendOtp(); setError(null); setTick((t) => t + 1); }}
        disabled={!resendCheck.ok}
        className="text-xs font-bold text-[#0B4A8A] hover:underline disabled:opacity-50 disabled:no-underline flex items-center gap-1 justify-center w-full"
      >
        <RefreshCw className="w-3 h-3" />
        {resendCheck.ok
          ? 'Kirim ulang kode OTP'
          : resendCheck.waitMs
          ? `Kirim ulang dalam ${Math.ceil(resendCheck.waitMs / 1000)}d`
          : resendCheck.reason}
      </button>

      <button onClick={onBackToLogin} className="text-xs font-bold text-slate-400 hover:underline flex items-center gap-1 justify-center w-full">
        <span>&larr;</span> Kembali ke halaman login
      </button>
    </div>
  );
};

/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.11 Lupa Kata Sandi — email, lalu OTP, lalu kata sandi baru yang harus memenuhi kebijakan
 * dan dikonfirmasi (Plan "Align itwasum with Plane BA/SA", todo p7-b11). Frontend-only: tidak
 * ada perubahan sungguhan pada penyimpanan kredensial demo, hanya simulasi alur & validasi.
 */
import React, { useState } from 'react';
import { ArrowLeft, CheckCircle2, KeyRound, Mail } from 'lucide-react';
import { startOtp, getOtp, verifyOtp, maskDestination, passwordMeetsPolicy, pushNotification } from '../../../data/auth/sessionSecurity';

type ForgotStep = 'email' | 'otp' | 'password' | 'done';

export const ForgotPasswordFlow: React.FC<{ onDone: () => void; onBack: () => void }> = ({ onDone, onBack }) => {
  const [step, setStep] = useState<ForgotStep>('email');
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');

  const handleSendOtp = () => {
    if (!email.trim()) return setError('Email kedinasan wajib diisi.');
    setError(null);
    startOtp(email.trim());
    setStep('otp');
  };

  const handleVerifyOtp = () => {
    const result = verifyOtp(code);
    if (result === 'ok') return setStep('password');
    if (result === 'expired') return setError('Kode OTP telah kadaluarsa. Silakan minta ulang dari awal.');
    if (result === 'locked_out') return setError('Terlalu banyak kode salah. Silakan mulai ulang proses Lupa Kata Sandi.');
    setError('Kode OTP salah. Silakan coba lagi.');
  };

  const handleSubmitPassword = () => {
    const policy = passwordMeetsPolicy(password);
    if (!policy.ok) return setError(policy.reason ?? 'Kata sandi tidak memenuhi kebijakan.');
    if (password !== confirmPassword) return setError('Konfirmasi kata sandi tidak cocok.');
    setError(null);
    pushNotification('Kata Sandi Diperbarui', `Permintaan reset kata sandi untuk ${email} berhasil disimulasikan.`);
    setStep('done');
  };

  const otp = getOtp();

  return (
    <div className="space-y-5">
      <button onClick={onBack} className="flex items-center gap-1.5 text-xs font-bold text-slate-500 hover:underline"><ArrowLeft className="w-3.5 h-3.5" />Kembali ke Login</button>

      <div className="flex items-center gap-2.5">
        <span className="w-9 h-9 rounded-full bg-[#0B2B5C]/10 flex items-center justify-center shrink-0"><KeyRound className="w-4.5 h-4.5 text-[#0B2B5C]" /></span>
        <div>
          <h2 className="text-base font-extrabold text-slate-900">Lupa Kata Sandi</h2>
          <p className="text-xs text-slate-500 mt-0.5">
            {step === 'email' && 'Masukkan email kedinasan Anda untuk menerima kode verifikasi.'}
            {step === 'otp' && 'Masukkan kode OTP yang dikirim ke email Anda.'}
            {step === 'password' && 'Buat kata sandi baru yang memenuhi kebijakan keamanan.'}
            {step === 'done' && 'Kata sandi Anda berhasil diperbarui.'}
          </p>
        </div>
      </div>

      {error && <div className="p-3 bg-rose-50 border border-rose-200 text-rose-800 rounded-lg text-xs">{error}</div>}

      {step === 'email' && (
        <div className="space-y-3">
          <div className="relative">
            <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2" />
            <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama.pengguna@polri.go.id" className="w-full pl-10 pr-4 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100" />
          </div>
          <button onClick={handleSendOtp} className="w-full min-h-11 rounded-lg bg-[#0B2B5C] hover:bg-[#0B4A8A] text-white font-bold text-sm">Kirim Kode Verifikasi</button>
        </div>
      )}

      {step === 'otp' && otp && (
        <div className="space-y-3">
          <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg text-xs text-amber-900">
            <strong>Dev Hint (demo):</strong> Kode OTP Anda adalah <strong className="font-mono">{otp.code}</strong>.
          </div>
          <input
            type="text"
            inputMode="numeric"
            maxLength={6}
            value={code}
            onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
            className="w-full text-center text-2xl font-black tracking-[0.5em] py-3 border border-slate-300 rounded-lg focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100"
            placeholder="------"
          />
          <button onClick={handleVerifyOtp} disabled={code.length !== 6} className="w-full min-h-11 rounded-lg bg-[#0B2B5C] hover:bg-[#0B4A8A] text-white font-bold text-sm disabled:opacity-60">Verifikasi Kode</button>
        </div>
      )}

      {step === 'password' && (
        <div className="space-y-3">
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Kata Sandi Baru</label>
            <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full px-3.5 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100" />
            <p className="text-[11px] text-slate-400 mt-1">Minimal 8 karakter, mengandung huruf besar dan angka.</p>
          </div>
          <div>
            <label className="text-xs font-bold text-slate-700 block mb-1.5">Konfirmasi Kata Sandi Baru</label>
            <input type="password" value={confirmPassword} onChange={(e) => setConfirmPassword(e.target.value)} className="w-full px-3.5 py-3 border border-slate-300 rounded-lg text-sm focus:outline-none focus:border-[#0B4A8A] focus:ring-2 focus:ring-blue-100" />
          </div>
          <button onClick={handleSubmitPassword} className="w-full min-h-11 rounded-lg bg-[#0B2B5C] hover:bg-[#0B4A8A] text-white font-bold text-sm">Simpan Kata Sandi Baru</button>
        </div>
      )}

      {step === 'done' && (
        <div className="space-y-3">
          <div className="p-3.5 bg-emerald-50 border border-emerald-200 rounded-lg text-xs text-emerald-800 flex items-start gap-2"><CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />Kata sandi berhasil diperbarui (simulasi). Silakan masuk kembali menggunakan kata sandi Anda yang berlaku.</div>
          <button onClick={onDone} className="w-full min-h-11 rounded-lg bg-[#0B2B5C] hover:bg-[#0B4A8A] text-white font-bold text-sm">Kembali ke Login</button>
        </div>
      )}
    </div>
  );
};

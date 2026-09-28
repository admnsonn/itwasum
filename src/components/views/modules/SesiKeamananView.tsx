/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.11 Login & Otentikasi 2FA — halaman status sesi & notifikasi login (SF-PS-005), Plan
 * "Align itwasum with Plane BA/SA", todo p7-b11.
 */
import React from 'react';
import { Clock, KeyRound, Laptop, ShieldCheck } from 'lucide-react';
import type { CurrentUserProfile } from '../../../types';
import { getModuleById, MODULE_GROUPS } from '../../../config/moduleRegistry';
import { loadSession, isSessionValid, getLoginNotifications, SESSION_MAX_AGE_MS } from '../../../data/auth/sessionSecurity';
import { Badge, Card, StatCard, Typography } from '../../ui';

export const SesiKeamananView: React.FC<{ currentUser: CurrentUserProfile }> = ({ currentUser }) => {
  const moduleDef = getModuleById('b11')!;
  const session = loadSession();
  const valid = isSessionValid(session);
  const notifications = getLoginNotifications();

  const remainingMs = session ? SESSION_MAX_AGE_MS - (Date.now() - new Date(session.lastActivityAt).getTime()) : 0;
  const remainingHours = Math.max(0, Math.floor(remainingMs / 3600000));
  const remainingMins = Math.max(0, Math.floor((remainingMs % 3600000) / 60000));

  return (
    <div className="space-y-4">
      <div className="bg-white rounded-[14px] border border-[var(--sd-outline-variant)]/40 shadow-[0_1px_10px_rgb(0,0,0,0.06)] p-4">
        <h1 className="text-lg font-black text-slate-900 flex items-center gap-2"><moduleDef.icon className="w-5 h-5 text-[var(--sd-primary)]" />{moduleDef.label}</h1>
        <p className="text-xs text-slate-500 mt-1">{moduleDef.deskripsi}</p>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <StatCard label="Status Sesi" value={valid ? 'Aktif' : 'Tidak Valid'} />
        <StatCard label="Sisa Waktu Sesi (24 jam sliding)" value={valid ? `${remainingHours}j ${remainingMins}m` : '—'} />
        <StatCard label="Login Sejak" value={session ? new Date(session.loginAt).toLocaleString('id-ID') : '—'} />
        <StatCard label="Aktivitas Terakhir" value={session ? new Date(session.lastActivityAt).toLocaleString('id-ID') : '—'} />
      </div>

      <Card className="space-y-3">
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 flex items-center gap-1.5"><Laptop className="w-4 h-4" />Sesi Perangkat Ini</Typography>
        <div className="grid sm:grid-cols-2 gap-3 text-xs">
          <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-100">
            <div className="text-slate-400 flex items-center gap-1.5"><ShieldCheck className="w-3.5 h-3.5" />Pengguna</div>
            <div className="font-bold text-slate-800 mt-1">{currentUser.nama} ({currentUser.peranLabel})</div>
          </div>
          <div className="p-3 rounded-[10px] bg-slate-50 border border-slate-100">
            <div className="text-slate-400 flex items-center gap-1.5"><KeyRound className="w-3.5 h-3.5" />Kebijakan Sesi</div>
            <div className="font-bold text-slate-800 mt-1">Sesi tunggal per akun · kadaluarsa 24 jam sejak aktivitas terakhir (sliding)</div>
          </div>
        </div>
      </Card>

      <Card className="space-y-3">
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500 flex items-center gap-1.5"><Clock className="w-4 h-4" />Notifikasi Login (SF-PS-005)</Typography>
        {notifications.length === 0 ? (
          <p className="text-xs text-slate-400">Belum ada notifikasi login tercatat pada perangkat ini.</p>
        ) : (
          <ul className="space-y-1.5 max-h-96 overflow-y-auto">
            {notifications.map((n) => (
              <li key={n.id} className="flex items-start justify-between gap-3 p-2.5 rounded-[10px] bg-slate-50 border border-slate-100">
                <div>
                  <div className="text-xs font-bold text-slate-800">{n.judul}</div>
                  <div className="text-[11px] text-slate-500">{n.detail}</div>
                </div>
                <Badge color="neutral" className="shrink-0">{new Date(n.waktu).toLocaleString('id-ID')}</Badge>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  );
};

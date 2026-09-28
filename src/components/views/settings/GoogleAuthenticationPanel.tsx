/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * B.9 Pengaturan Parameter > Google Authentication (FR-GAUTH) — status not connected /
 * connecting / connected, plus invalid-credential; test connection; disconnect (Plan "Align
 * itwasum with Plane BA/SA", todo p6-b8b9). Dipakai bersama oleh B.8 Management Google Drive.
 */
import React, { useState } from 'react';
import { CheckCircle2, Loader2, ShieldAlert, Unplug, XCircle } from 'lucide-react';
import { useGoogleAuthState, connectGoogleAccount, disconnectGoogleAccount, testGoogleConnection } from '../../../data/integrations/googleAuth';
import { Badge, Button, Card, Input, Typography } from '../../ui';

export const GoogleAuthenticationPanel: React.FC = () => {
  const auth = useGoogleAuthState();
  const [email, setEmail] = useState('');
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string } | null>(null);
  const [testing, setTesting] = useState(false);

  const handleTest = async () => {
    setTesting(true);
    const result = await testGoogleConnection();
    setTestResult(result);
    setTesting(false);
  };

  return (
    <Card className="space-y-4">
      <div className="flex items-center justify-between">
        <Typography variant="label-bold" className="uppercase tracking-wide text-slate-500">Google Authentication (FR-GAUTH)</Typography>
        <StatusBadge status={auth.status} />
      </div>

      {auth.status === 'not_connected' && (
        <div className="space-y-3">
          <p className="text-xs text-slate-500">Hubungkan akun Google Workspace Itwasum (domain @polri.go.id) untuk mengaktifkan integrasi Google Drive pada B.8.</p>
          <div className="flex items-center gap-2">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama.pengguna@polri.go.id" className="flex-1" />
            <Button onClick={() => connectGoogleAccount(email)} disabled={!email.trim()}>Hubungkan Akun</Button>
          </div>
        </div>
      )}

      {auth.status === 'connecting' && (
        <div className="flex items-center gap-2 text-xs text-slate-500"><Loader2 className="w-4 h-4 animate-spin" />Menghubungkan ke akun {auth.account}...</div>
      )}

      {auth.status === 'invalid_credential' && (
        <div className="space-y-3">
          <div className="p-3 rounded-[10px] bg-rose-50 border border-rose-200 text-xs text-rose-700 font-semibold flex items-start gap-2">
            <XCircle className="w-4 h-4 shrink-0 mt-0.5" />
            Kredensial tidak valid untuk akun "{auth.account}". Gunakan email domain resmi Polri (@polri.go.id atau @*.go.id).
          </div>
          <div className="flex items-center gap-2">
            <Input value={email} onChange={(e) => setEmail(e.target.value)} placeholder="nama.pengguna@polri.go.id" className="flex-1" />
            <Button onClick={() => connectGoogleAccount(email)} disabled={!email.trim()}>Coba Lagi</Button>
          </div>
        </div>
      )}

      {auth.status === 'connected' && (
        <div className="space-y-3">
          <div className="p-3 rounded-[10px] bg-emerald-50 border border-emerald-200 text-xs text-emerald-800 flex items-start gap-2">
            <CheckCircle2 className="w-4 h-4 shrink-0 mt-0.5" />
            Terhubung sebagai <strong>{auth.account}</strong> sejak {auth.connectedAt ? new Date(auth.connectedAt).toLocaleString('id-ID') : '—'}.
          </div>
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleTest} disabled={testing}>{testing ? 'Menguji...' : 'Uji Koneksi'}</Button>
            <Button variant="danger" onClick={disconnectGoogleAccount}><Unplug className="w-3.5 h-3.5" />Putuskan Koneksi</Button>
          </div>
          {testResult && (
            <div className={`p-2.5 rounded-[8px] text-xs font-semibold ${testResult.ok ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' : 'bg-rose-50 text-rose-700 border border-rose-200'}`}>
              {testResult.message}
            </div>
          )}
        </div>
      )}
    </Card>
  );
};

const STATUS_LABEL: Record<string, string> = {
  not_connected: 'Belum Terhubung',
  connecting: 'Menghubungkan...',
  connected: 'Terhubung',
  invalid_credential: 'Kredensial Tidak Valid',
};

const StatusBadge: React.FC<{ status: string }> = ({ status }) => {
  const color = status === 'connected' ? 'success' : status === 'invalid_credential' ? 'danger' : status === 'connecting' ? 'warning' : 'neutral';
  return (
    <Badge color={color}>
      {status === 'invalid_credential' && <ShieldAlert className="w-3 h-3 mr-1 inline" />}
      {STATUS_LABEL[status] ?? status}
    </Badge>
  );
};
